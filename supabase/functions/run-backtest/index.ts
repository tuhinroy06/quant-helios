import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StrategyRule {
  indicator: string;
  condition: string;
  value: number | string;
  period?: number;
}

interface StrategyConfig {
  entryRules: StrategyRule[];
  exitRules: StrategyRule[];
  positionSizing?: { type: string; value: number };
  riskLimits?: { stopLoss?: number; takeProfit?: number };
}

interface Trade {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  side: string;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  exitReason: string;
}

// Simple Moving Average
function calculateSMA(prices: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

// Exponential Moving Average
function calculateEMA(prices: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      result.push(prices[0]);
    } else if (i < period - 1) {
      const sum = prices.slice(0, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / (i + 1));
    } else if (i === period - 1) {
      const sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    } else {
      const ema = (prices[i] - result[i - 1]) * multiplier + result[i - 1];
      result.push(ema);
    }
  }
  return result;
}

// RSI
function calculateRSI(prices: number[], period: number = 14): number[] {
  const result: number[] = [NaN];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    }
  }
  return result;
}

// Generate realistic sample data
function generateSampleData(days: number = 365): OHLCV[] {
  const data: OHLCV[] = [];
  let price = 1000 + Math.random() * 500;
  const volatility = 0.018;
  const trend = 0.0002;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.5) * 2 * volatility + trend;
    const open = price;
    price = price * (1 + change);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.012);
    const low = Math.min(open, close) * (1 - Math.random() * 0.012);
    const volume = Math.floor(100000 + Math.random() * 900000);

    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume
    });
  }

  return data;
}

// Parse strategy config
function parseStrategyConfig(strategy: Record<string, unknown>): StrategyConfig {
  const config: StrategyConfig = {
    entryRules: [],
    exitRules: [],
  };

  if (strategy.entry_rules && typeof strategy.entry_rules === 'object') {
    const rules = strategy.entry_rules as Record<string, unknown>;
    if (Array.isArray(rules)) {
      config.entryRules = rules as StrategyRule[];
    } else if (rules.conditions && Array.isArray(rules.conditions)) {
      config.entryRules = rules.conditions as StrategyRule[];
    }
  }

  if (strategy.exit_rules && typeof strategy.exit_rules === 'object') {
    const rules = strategy.exit_rules as Record<string, unknown>;
    if (Array.isArray(rules)) {
      config.exitRules = rules as StrategyRule[];
    } else if (rules.conditions && Array.isArray(rules.conditions)) {
      config.exitRules = rules.conditions as StrategyRule[];
    }
  }

  if (strategy.position_sizing) {
    config.positionSizing = strategy.position_sizing as StrategyConfig['positionSizing'];
  }

  if (strategy.risk_limits) {
    config.riskLimits = strategy.risk_limits as StrategyConfig['riskLimits'];
  }

  // Default rules if none provided
  if (config.entryRules.length === 0) {
    config.entryRules = [
      { indicator: 'rsi', condition: 'less_than', value: 30, period: 14 },
      { indicator: 'price', condition: 'greater_than', value: 'sma', period: 20 }
    ];
  }

  if (config.exitRules.length === 0) {
    config.exitRules = [
      { indicator: 'rsi', condition: 'greater_than', value: 70, period: 14 }
    ];
  }

  return config;
}

// Get indicator value
function getIndicator(
  indicator: string, 
  index: number, 
  data: OHLCV[], 
  sma20: number[],
  ema20: number[],
  rsi14: number[],
  period: number = 14
): number | null {
  switch (indicator.toLowerCase()) {
    case 'price':
    case 'close':
      return data[index]?.close ?? null;
    case 'sma':
      return isNaN(sma20[index]) ? null : sma20[index];
    case 'ema':
      return isNaN(ema20[index]) ? null : ema20[index];
    case 'rsi':
      return isNaN(rsi14[index]) ? null : rsi14[index];
    default:
      return null;
  }
}

// Evaluate rule
function evaluateRule(
  rule: StrategyRule,
  index: number,
  data: OHLCV[],
  sma20: number[],
  ema20: number[],
  rsi14: number[]
): boolean {
  const currentValue = getIndicator(rule.indicator, index, data, sma20, ema20, rsi14, rule.period);
  const prevValue = getIndicator(rule.indicator, index - 1, data, sma20, ema20, rsi14, rule.period);
  
  if (currentValue === null) return false;

  let compareValue: number;
  if (typeof rule.value === 'string') {
    const otherValue = getIndicator(rule.value, index, data, sma20, ema20, rsi14, rule.period);
    if (otherValue === null) return false;
    compareValue = otherValue;
  } else {
    compareValue = rule.value;
  }

  const prevCompareValue = typeof rule.value === 'string' 
    ? getIndicator(rule.value, index - 1, data, sma20, ema20, rsi14, rule.period)
    : rule.value;

  switch (rule.condition) {
    case 'greater_than':
      return currentValue > compareValue;
    case 'less_than':
      return currentValue < compareValue;
    case 'crosses_above':
      return prevValue !== null && prevCompareValue !== null &&
        prevValue <= prevCompareValue && currentValue > compareValue;
    case 'crosses_below':
      return prevValue !== null && prevCompareValue !== null &&
        prevValue >= prevCompareValue && currentValue < compareValue;
    default:
      return false;
  }
}

// Run the backtest
function runBacktest(
  data: OHLCV[],
  config: StrategyConfig,
  initialCapital: number = 1000000
) {
  const closes = data.map(d => d.close);
  const sma20 = calculateSMA(closes, 20);
  const ema20 = calculateEMA(closes, 20);
  const rsi14 = calculateRSI(closes, 14);

  const trades: Trade[] = [];
  const equityCurve: { date: string; value: number }[] = [];
  
  let capital = initialCapital;
  let position: { entryDate: string; entryPrice: number; quantity: number } | null = null;
  let peakCapital = initialCapital;
  let maxDrawdown = 0;

  const startIndex = 50;

  for (let i = startIndex; i < data.length; i++) {
    const currentDate = data[i].date;
    const currentPrice = data[i].close;

    if (position === null) {
      const entrySignal = config.entryRules.every(rule => 
        evaluateRule(rule, i, data, sma20, ema20, rsi14)
      );
      
      if (entrySignal && config.entryRules.length > 0) {
        const positionSize = capital * 0.1;
        const quantity = Math.floor(positionSize / currentPrice);
        if (quantity > 0) {
          position = { entryDate: currentDate, entryPrice: currentPrice, quantity };
        }
      }
    } else {
      let shouldExit = false;
      let exitReason = '';

      // Check stop loss
      if (config.riskLimits?.stopLoss) {
        const stopPrice = position.entryPrice * (1 - config.riskLimits.stopLoss / 100);
        if (data[i].low <= stopPrice) {
          shouldExit = true;
          exitReason = 'Stop Loss';
        }
      }

      // Check take profit
      if (!shouldExit && config.riskLimits?.takeProfit) {
        const targetPrice = position.entryPrice * (1 + config.riskLimits.takeProfit / 100);
        if (data[i].high >= targetPrice) {
          shouldExit = true;
          exitReason = 'Take Profit';
        }
      }

      // Check exit rules
      if (!shouldExit) {
        for (const rule of config.exitRules) {
          if (evaluateRule(rule, i, data, sma20, ema20, rsi14)) {
            shouldExit = true;
            exitReason = 'Exit Signal';
            break;
          }
        }
      }
      
      if (shouldExit || i === data.length - 1) {
        const exitPrice = currentPrice;
        const pnl = (exitPrice - position.entryPrice) * position.quantity;
        const pnlPercent = ((exitPrice - position.entryPrice) / position.entryPrice) * 100;
        
        trades.push({
          entryDate: position.entryDate,
          exitDate: currentDate,
          entryPrice: position.entryPrice,
          exitPrice,
          side: 'long',
          quantity: position.quantity,
          pnl,
          pnlPercent,
          exitReason: i === data.length - 1 ? 'End of Data' : exitReason
        });

        capital += pnl;
        position = null;
      }
    }

    const currentEquity = capital + (position ? (currentPrice - position.entryPrice) * position.quantity : 0);
    equityCurve.push({ date: currentDate, value: Math.round(currentEquity) });
    
    peakCapital = Math.max(peakCapital, currentEquity);
    const drawdown = ((peakCapital - currentEquity) / peakCapital) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl <= 0);
  
  const totalReturn = ((capital - initialCapital) / initialCapital) * 100;
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  
  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 10 : 0;
  
  const returns = trades.map(t => t.pnlPercent);
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdDev = returns.length > 1 
    ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1))
    : 1;
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(12) : 0;

  return {
    trades,
    metrics: {
      totalReturn: Math.round(totalReturn * 100) / 100,
      maxDrawdown: -Math.round(maxDrawdown * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      totalTrades: trades.length,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      profitFactor: Math.min(Math.round(profitFactor * 100) / 100, 10)
    },
    equityCurve
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { strategyId, startDate, endDate, symbol = 'NIFTY' } = await req.json();

    if (!strategyId) {
      return new Response(
        JSON.stringify({ error: "Strategy ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch strategy
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', strategyId)
      .single();

    if (strategyError || !strategy) {
      return new Response(
        JSON.stringify({ error: "Strategy not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse strategy config
    const config = parseStrategyConfig(strategy);

    // Generate sample data (in production, this would fetch real data)
    const days = 365;
    const priceData = generateSampleData(days);

    // Run backtest
    const result = runBacktest(priceData, config);

    // Save results to database
    const { data: backtestResult, error: saveError } = await supabase
      .from('backtest_results')
      .insert({
        strategy_id: strategyId,
        user_id: strategy.user_id,
        strategy_version: strategy.version || 1,
        status: 'completed',
        parameters: { startDate, endDate, symbol },
        metrics: result.metrics,
        equity_curve: result.equityCurve,
        trade_log: result.trades,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving backtest results:', saveError);
    }

    // Update strategy status
    await supabase
      .from('strategies')
      .update({ status: 'backtested' })
      .eq('id', strategyId);

    return new Response(
      JSON.stringify({
        success: true,
        backtestId: backtestResult?.id,
        metrics: result.metrics,
        equityCurve: result.equityCurve,
        trades: result.trades
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Backtest error:", error);
    const message = error instanceof Error ? error.message : "An error occurred during backtesting";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
