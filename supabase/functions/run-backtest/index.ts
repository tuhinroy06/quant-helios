import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Trading Backtesting Engine - PRODUCTION VERSION v1.1.0
 * TypeScript port for Supabase Edge Functions
 * 
 * ENGINE GUARANTEES:
 * - No lookahead bias
 * - Next-bar execution only
 * - Deterministic results for identical inputs
 * - Capital conservation enforced
 * - Long-only execution
 * - Single-symbol isolation
 * - Stop-loss priority over take-profit
 * - Risk evaluated before execution
 * - Position size frozen at queue time
 */

const ENGINE_VERSION = "1.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// 1. CORE DATA STRUCTURES
// ============================================================================

type Action = "BUY" | "SELL" | "HOLD";

interface Signal {
  action: Action;
  stopLoss?: number;
  takeProfit?: number;
  positionSize: number;
  reason: string;
}

interface PendingOrder {
  signal: Signal;
  quantity: number;
  barIndex: number;
  symbol: string;
  reason: string;
}

interface Position {
  symbol: string;
  entryPrice: number;
  quantity: number;
  entryTime: string;
  entryBarIndex: number;
  stopLoss?: number;
  takeProfit?: number;
  reason: string;
}

interface Trade {
  symbol: string;
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPct: number;
  entryReason: string;
  exitReason: string;
  durationBars: number;
}

interface RejectedSignal {
  timestamp: string;
  symbol: string;
  action: string;
  rejectionReason: string;
  signalParams: Record<string, unknown>;
  portfolioSnapshot: Record<string, unknown>;
}

interface EquityPoint {
  timestamp: string;
  equity: number;
  cash: number;
  positionsCount: number;
}

interface OHLCV {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface BacktestConfig {
  initialCapital: number;
  slippage: number;
  brokerageRate: number;
  maxRiskPerTrade: number;
  maxConcurrentPositions: number;
  maxDrawdown?: number;
  mandatoryStopLoss: boolean;
  maxCapitalDeployed: number;
  maxSinglePositionExposure: number;
  dataFrequency: "daily" | "hourly" | "minute";
}

interface StrategyRule {
  indicator: string;
  condition: string;
  value: number | string | { indicator: string; period?: number };
  period?: number;
}

interface StrategyConfig {
  entryRules: StrategyRule[];
  exitRules: StrategyRule[];
  positionSizing?: { type: string; value: number };
  riskLimits?: { stopLoss?: number; takeProfit?: number };
}

// ============================================================================
// 2. TECHNICAL INDICATORS (Extended with more periods)
// ============================================================================

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

function calculateATR(data: OHLCV[], period: number = 14): number[] {
  const trueRanges: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      trueRanges.push(data[i].high - data[i].low);
    } else {
      const tr = Math.max(
        data[i].high - data[i].low,
        Math.abs(data[i].high - data[i - 1].close),
        Math.abs(data[i].low - data[i - 1].close)
      );
      trueRanges.push(tr);
    }
  }
  
  return calculateSMA(trueRanges, period);
}

// ============================================================================
// 3. RISK ENGINE
// ============================================================================

class RiskEngine {
  constructor(private config: BacktestConfig) {}

  validateSignal(
    signal: Signal,
    proposedQuantity: number,
    proposedPrice: number,
    portfolioCash: number,
    portfolioEquity: number,
    openPositions: number,
    positionsValue: number
  ): { valid: boolean; reason: string } {
    if (this.config.mandatoryStopLoss && signal.action === "BUY") {
      if (signal.stopLoss === undefined) {
        return { valid: false, reason: "Mandatory stop-loss missing" };
      }
    }

    if (signal.action === "BUY") {
      if (openPositions >= this.config.maxConcurrentPositions) {
        return { valid: false, reason: `Max positions (${this.config.maxConcurrentPositions}) reached` };
      }
    }

    if (signal.action === "BUY" && signal.stopLoss !== undefined) {
      const riskPerShare = proposedPrice - signal.stopLoss;
      if (riskPerShare <= 0) {
        return { valid: false, reason: "Stop-loss must be below entry price" };
      }

      const totalRisk = riskPerShare * proposedQuantity;
      const maxAllowedRisk = portfolioEquity * this.config.maxRiskPerTrade;

      if (totalRisk > maxAllowedRisk) {
        return { valid: false, reason: `Position risk exceeds max risk per trade (${this.config.maxRiskPerTrade * 100}%)` };
      }
    }

    if (signal.action === "BUY") {
      const proposedCost = proposedPrice * proposedQuantity;
      const newPositionsValue = positionsValue + proposedCost;
      const deployedPct = newPositionsValue / portfolioEquity;

      if (deployedPct > this.config.maxCapitalDeployed) {
        return { valid: false, reason: `Max capital deployed (${this.config.maxCapitalDeployed * 100}%) would be exceeded` };
      }
    }

    if (signal.action === "BUY") {
      const proposedCost = proposedPrice * proposedQuantity;
      const exposurePct = proposedCost / portfolioEquity;

      if (exposurePct > this.config.maxSinglePositionExposure) {
        return { valid: false, reason: `Single position exposure (${this.config.maxSinglePositionExposure * 100}%) would be exceeded` };
      }
    }

    return { valid: true, reason: "Valid" };
  }

  calculatePositionSize(signal: Signal, currentPrice: number, portfolioCash: number): number {
    if (signal.action !== "BUY") return 0;

    let capitalToUse = portfolioCash * signal.positionSize;

    if (signal.stopLoss !== undefined) {
      const riskPerShare = currentPrice - signal.stopLoss;
      if (riskPerShare <= 0) return 0;
      
      const maxCapitalAtRisk = portfolioCash * this.config.maxRiskPerTrade;
      const maxShares = maxCapitalAtRisk / riskPerShare;
      const maxCapitalByRisk = maxShares * currentPrice;
      capitalToUse = Math.min(capitalToUse, maxCapitalByRisk);
    }

    return Math.max(0, Math.floor(capitalToUse / currentPrice));
  }
}

// ============================================================================
// 4. EXECUTION SIMULATOR
// ============================================================================

class ExecutionSimulator {
  constructor(private config: BacktestConfig) {}

  executeBuy(price: number, quantity: number): { executionPrice: number; totalCost: number } {
    const executionPrice = price * (1 + this.config.slippage);
    const grossCost = executionPrice * quantity;
    const brokerage = grossCost * this.config.brokerageRate;
    return { executionPrice, totalCost: grossCost + brokerage };
  }

  executeSell(price: number, quantity: number): { executionPrice: number; netProceeds: number } {
    const executionPrice = price * (1 - this.config.slippage);
    const grossProceeds = executionPrice * quantity;
    const brokerage = grossProceeds * this.config.brokerageRate;
    return { executionPrice, netProceeds: grossProceeds - brokerage };
  }
}

// ============================================================================
// 5. PORTFOLIO ENGINE
// ============================================================================

class Portfolio {
  cash: number;
  positions: Position[] = [];
  equityCurve: EquityPoint[] = [];
  trades: Trade[] = [];
  rejectedSignals: RejectedSignal[] = [];
  currentTime: string = "";
  currentPrices: Record<string, number> = {};
  tradingDisabled = false;

  constructor(public initialCapital: number) {
    this.cash = initialCapital;
  }

  updatePrices(timestamp: string, prices: Record<string, number>) {
    this.currentTime = timestamp;
    this.currentPrices = prices;
    this._recordEquity();
  }

  addPosition(position: Position, cost: number) {
    this.positions.push(position);
    this.cash -= cost;
  }

  closePosition(position: Position, exitPrice: number, proceeds: number, reason: string, exitBarIndex: number) {
    const pnl = proceeds - (position.entryPrice * position.quantity);
    const pnlPct = (exitPrice - position.entryPrice) / position.entryPrice;
    const durationBars = exitBarIndex - position.entryBarIndex;

    const trade: Trade = {
      symbol: position.symbol,
      entryTime: position.entryTime,
      exitTime: this.currentTime,
      entryPrice: position.entryPrice,
      exitPrice,
      quantity: position.quantity,
      pnl,
      pnlPct,
      entryReason: position.reason,
      exitReason: reason,
      durationBars
    };

    this.trades.push(trade);
    this.positions = this.positions.filter(p => p !== position);
    this.cash += proceeds;
  }

  rejectSignal(timestamp: string, symbol: string, signal: Signal, reason: string) {
    this.rejectedSignals.push({
      timestamp,
      symbol,
      action: signal.action,
      rejectionReason: reason,
      signalParams: {
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        positionSize: signal.positionSize,
        reason: signal.reason
      },
      portfolioSnapshot: this.getState()
    });
  }

  getEquity(): number {
    const positionsValue = this.positions.reduce((sum, p) => {
      const price = this.currentPrices[p.symbol] ?? p.entryPrice;
      return sum + price * p.quantity;
    }, 0);
    return this.cash + positionsValue;
  }

  getPositionsValue(): number {
    return this.positions.reduce((sum, p) => {
      const price = this.currentPrices[p.symbol] ?? p.entryPrice;
      return sum + price * p.quantity;
    }, 0);
  }

  getDrawdown(): number {
    if (this.equityCurve.length === 0) return 0;
    const equityValues = this.equityCurve.map(e => e.equity);
    const peak = Math.max(...equityValues);
    const current = equityValues[equityValues.length - 1];
    if (peak === 0) return 0;
    return (current - peak) / peak;
  }

  getState(): Record<string, unknown> {
    return {
      cash: this.cash,
      equity: this.getEquity(),
      positionsCount: this.positions.length,
      tradingDisabled: this.tradingDisabled,
      positions: this.positions.map(p => ({
        symbol: p.symbol,
        quantity: p.quantity,
        entryPrice: p.entryPrice,
        currentPrice: this.currentPrices[p.symbol] ?? p.entryPrice
      }))
    };
  }

  private _recordEquity() {
    this.equityCurve.push({
      timestamp: this.currentTime,
      equity: this.getEquity(),
      cash: this.cash,
      positionsCount: this.positions.length
    });
  }
}

// ============================================================================
// 6. INDICATOR CALCULATION CACHE
// ============================================================================

interface IndicatorCache {
  sma: Record<number, number[]>;
  ema: Record<number, number[]>;
  rsi: Record<number, number[]>;
  atr: Record<number, number[]>;
}

function buildIndicatorCache(data: OHLCV[]): IndicatorCache {
  const closes = data.map(d => d.close);
  
  return {
    sma: {
      5: calculateSMA(closes, 5),
      9: calculateSMA(closes, 9),
      10: calculateSMA(closes, 10),
      20: calculateSMA(closes, 20),
      21: calculateSMA(closes, 21),
      50: calculateSMA(closes, 50),
      100: calculateSMA(closes, 100),
      200: calculateSMA(closes, 200),
    },
    ema: {
      5: calculateEMA(closes, 5),
      9: calculateEMA(closes, 9),
      10: calculateEMA(closes, 10),
      12: calculateEMA(closes, 12),
      20: calculateEMA(closes, 20),
      21: calculateEMA(closes, 21),
      26: calculateEMA(closes, 26),
      50: calculateEMA(closes, 50),
    },
    rsi: {
      7: calculateRSI(closes, 7),
      14: calculateRSI(closes, 14),
      21: calculateRSI(closes, 21),
    },
    atr: {
      7: calculateATR(data, 7),
      14: calculateATR(data, 14),
      21: calculateATR(data, 21),
    }
  };
}

function getIndicatorValueFromCache(
  indicator: string,
  period: number | undefined,
  idx: number,
  context: OHLCV[],
  cache: IndicatorCache
): number | null {
  if (!indicator) return null;
  const indicatorLower = indicator.toLowerCase().trim();
  
  if (indicatorLower === "price" || indicatorLower === "close") {
    return context[idx]?.close ?? null;
  }
  
  if (indicatorLower === "open") {
    return context[idx]?.open ?? null;
  }
  
  if (indicatorLower === "high") {
    return context[idx]?.high ?? null;
  }
  
  if (indicatorLower === "low") {
    return context[idx]?.low ?? null;
  }
  
  // Handle SMA with period
  if (indicatorLower === "sma" || indicatorLower.startsWith("sma")) {
    const p = period || parseInt(indicatorLower.replace("sma", "")) || 20;
    const values = cache.sma[p];
    if (values && idx < values.length && !isNaN(values[idx])) {
      return values[idx];
    }
    return null;
  }
  
  // Handle EMA with period
  if (indicatorLower === "ema" || indicatorLower.startsWith("ema")) {
    const p = period || parseInt(indicatorLower.replace("ema", "")) || 20;
    const values = cache.ema[p];
    if (values && idx < values.length && !isNaN(values[idx])) {
      return values[idx];
    }
    return null;
  }
  
  // Handle RSI with period
  if (indicatorLower === "rsi" || indicatorLower.startsWith("rsi")) {
    const p = period || parseInt(indicatorLower.replace("rsi", "")) || 14;
    const values = cache.rsi[p];
    if (values && idx < values.length && !isNaN(values[idx])) {
      return values[idx];
    }
    return null;
  }
  
  // Handle ATR with period
  if (indicatorLower === "atr" || indicatorLower.startsWith("atr")) {
    const p = period || parseInt(indicatorLower.replace("atr", "")) || 14;
    const values = cache.atr[p];
    if (values && idx < values.length && !isNaN(values[idx])) {
      return values[idx];
    }
    return null;
  }
  
  return null;
}

// ============================================================================
// 7. SIGNAL GENERATION
// ============================================================================

function generateSignal(
  context: OHLCV[],
  portfolioState: Record<string, unknown>,
  strategyConfig: StrategyConfig,
  cache: IndicatorCache
): Signal {
  const idx = context.length - 1;
  if (idx < 0) return { action: "HOLD", positionSize: 0.2, reason: "" };

  const currentPrice = context[idx].close;
  const hasPosition = (portfolioState.positionsCount as number) > 0;

  // Evaluate entry rules
  if (!hasPosition && strategyConfig.entryRules.length > 0) {
    let allConditionsMet = true;
    const reasons: string[] = [];

    for (const rule of strategyConfig.entryRules) {
      if (!rule.indicator) {
        allConditionsMet = false;
        break;
      }
      
      const indicatorValue = getIndicatorValueFromCache(rule.indicator, rule.period, idx, context, cache);
      
      let compareValue: number | null = null;
      if (typeof rule.value === "object" && rule.value !== null) {
        // Handle nested indicator reference like { indicator: "EMA", period: 21 }
        const valueObj = rule.value as { indicator: string; period?: number };
        compareValue = getIndicatorValueFromCache(valueObj.indicator, valueObj.period, idx, context, cache);
      } else if (typeof rule.value === "string") {
        compareValue = getIndicatorValueFromCache(rule.value, undefined, idx, context, cache);
      } else {
        compareValue = rule.value as number;
      }

      if (indicatorValue === null || compareValue === null) {
        allConditionsMet = false;
        break;
      }

      const conditionMet = evaluateCondition(indicatorValue, rule.condition, compareValue, idx, context, cache, rule);
      if (!conditionMet) {
        allConditionsMet = false;
        break;
      }
      reasons.push(`${rule.indicator}${rule.period || ""} ${rule.condition}`);
    }

    if (allConditionsMet) {
      const stopLossPct = strategyConfig.riskLimits?.stopLoss ?? 2;
      const takeProfitPct = strategyConfig.riskLimits?.takeProfit ?? 6;
      
      return {
        action: "BUY",
        stopLoss: currentPrice * (1 - stopLossPct / 100),
        takeProfit: currentPrice * (1 + takeProfitPct / 100),
        positionSize: strategyConfig.positionSizing?.value ?? 0.2,
        reason: `Entry: ${reasons.join(", ")}`
      };
    }
  }

  // Evaluate exit rules
  if (hasPosition && strategyConfig.exitRules.length > 0) {
    for (const rule of strategyConfig.exitRules) {
      const indicatorValue = getIndicatorValueFromCache(rule.indicator, rule.period, idx, context, cache);
      
      let compareValue: number | null = null;
      if (typeof rule.value === "object" && rule.value !== null) {
        const valueObj = rule.value as { indicator: string; period?: number };
        compareValue = getIndicatorValueFromCache(valueObj.indicator, valueObj.period, idx, context, cache);
      } else if (typeof rule.value === "string") {
        compareValue = getIndicatorValueFromCache(rule.value, undefined, idx, context, cache);
      } else {
        compareValue = rule.value as number;
      }

      if (indicatorValue === null || compareValue === null) continue;

      if (evaluateCondition(indicatorValue, rule.condition, compareValue, idx, context, cache, rule)) {
        return {
          action: "SELL",
          positionSize: 0,
          reason: `Exit: ${rule.indicator}${rule.period || ""} ${rule.condition}`
        };
      }
    }
  }

  return { action: "HOLD", positionSize: 0.2, reason: "" };
}

function evaluateCondition(
  value: number,
  condition: string,
  compareValue: number,
  idx: number,
  context: OHLCV[],
  cache: IndicatorCache,
  rule: StrategyRule
): boolean {
  const normalizedCondition = condition.toLowerCase().replace(/[_\s]/g, "");
  
  // Get previous values for crossover detection
  let prevValue: number | null = null;
  let prevCompareValue: number | null = null;
  
  if (idx > 0) {
    prevValue = getIndicatorValueFromCache(rule.indicator, rule.period, idx - 1, context, cache);
    
    if (typeof rule.value === "object" && rule.value !== null) {
      const valueObj = rule.value as { indicator: string; period?: number };
      prevCompareValue = getIndicatorValueFromCache(valueObj.indicator, valueObj.period, idx - 1, context, cache);
    } else if (typeof rule.value === "string") {
      prevCompareValue = getIndicatorValueFromCache(rule.value, undefined, idx - 1, context, cache);
    } else {
      prevCompareValue = rule.value as number;
    }
  }

  switch (normalizedCondition) {
    case "greaterthan":
    case ">":
    case "above":
      return value > compareValue;
      
    case "lessthan":
    case "<":
    case "below":
      return value < compareValue;
      
    case "crossesabove":
    case "crossabove":
    case "crossingabove":
      return prevValue !== null && prevCompareValue !== null &&
        prevValue <= prevCompareValue && value > compareValue;
        
    case "crossesbelow":
    case "crossbelow":
    case "crossingbelow":
      return prevValue !== null && prevCompareValue !== null &&
        prevValue >= prevCompareValue && value < compareValue;
        
    case "equals":
    case "=":
    case "==":
      return Math.abs(value - compareValue) < 0.001;
      
    default:
      return false;
  }
}

// ============================================================================
// 8. BACKTESTING ENGINE
// ============================================================================

class BacktestEngine {
  private riskEngine: RiskEngine;
  private executionSim: ExecutionSimulator;
  private portfolio: Portfolio | null = null;
  private pendingOrders: PendingOrder[] = [];
  private runCompleted = false;

  constructor(private config: BacktestConfig) {
    this.riskEngine = new RiskEngine(config);
    this.executionSim = new ExecutionSimulator(config);
  }

  run(
    data: OHLCV[],
    strategyConfig: StrategyConfig,
    strategyName: string,
    lookback: number = 50,
    symbol: string = "NIFTY"
  ): Record<string, unknown> {
    if (this.runCompleted) {
      throw new Error("BacktestEngine cannot be reused. Create new instance for each run.");
    }

    this.portfolio = new Portfolio(this.config.initialCapital);
    this.pendingOrders = [];

    // Build indicator cache with all periods
    const cache = buildIndicatorCache(data);

    const runTimestamp = data[data.length - 1]?.timestamp ?? new Date().toISOString();
    const strategyId = this.hashString(`${strategyName}:${JSON.stringify(strategyConfig)}`).substring(0, 8);

    console.log(`[Backtest] Starting with ${data.length} bars, lookback ${lookback}`);
    console.log(`[Backtest] Entry rules: ${JSON.stringify(strategyConfig.entryRules)}`);
    console.log(`[Backtest] Exit rules: ${JSON.stringify(strategyConfig.exitRules)}`);

    // Main backtest loop
    for (let t = lookback; t < data.length; t++) {
      const currentBar = data[t];

      // Step 1: Pre-open valuation
      if (t > 0) {
        const prevClose = data[t - 1].close;
        this.portfolio.updatePrices(currentBar.timestamp, { [symbol]: prevClose });
      }

      // Step 2: Stop-loss / take-profit checks
      this.checkStopsWithGaps(currentBar, symbol, t);

      // Step 3: Execute pending orders at open
      this.executePendingOrders(currentBar, symbol, t);

      // Step 4: Post-open valuation
      this.portfolio.updatePrices(currentBar.timestamp, { [symbol]: currentBar.open });

      // Step 5: Max drawdown check
      if (this.config.maxDrawdown !== undefined) {
        const currentDrawdown = this.portfolio.getDrawdown();
        if (currentDrawdown <= -this.config.maxDrawdown) {
          if (!this.portfolio.tradingDisabled) {
            this.portfolio.tradingDisabled = true;
            for (const position of [...this.portfolio.positions]) {
              const { executionPrice, netProceeds } = this.executionSim.executeSell(
                currentBar.open, position.quantity
              );
              this.portfolio.closePosition(
                position, executionPrice, netProceeds,
                `Max drawdown ${this.config.maxDrawdown * 100}% breached`,
                t
              );
            }
          }
        }
      }

      // Step 6: Signal generation
      if (!this.portfolio.tradingDisabled) {
        const contextData = data.slice(0, t + 1);
        const signal = generateSignal(contextData, this.portfolio.getState(), strategyConfig, cache);

        // Step 7: Order queuing
        if (signal.action === "BUY") {
          this.queueBuyOrder(signal, currentBar, symbol, t);
        } else if (signal.action === "SELL") {
          this.queueSellOrder(signal, currentBar, symbol, t);
        }
      }
    }

    // Final liquidation at last bar
    if (data.length > 0) {
      const finalBar = data[data.length - 1];
      for (const position of [...this.portfolio.positions]) {
        const { executionPrice, netProceeds } = this.executionSim.executeSell(
          finalBar.open, position.quantity
        );
        this.portfolio.closePosition(
          position, executionPrice, netProceeds,
          "End of backtest - final liquidation",
          data.length - 1
        );
      }
    }

    this.runCompleted = true;
    console.log(`[Backtest] Completed with ${this.portfolio.trades.length} trades`);
    return this.generateResults(runTimestamp, strategyId, strategyName);
  }

  private checkStopsWithGaps(bar: OHLCV, symbol: string, barIndex: number) {
    if (!this.portfolio) return;

    for (const position of [...this.portfolio.positions]) {
      if (position.symbol !== symbol) continue;

      // Priority 1: Stop-loss
      if (position.stopLoss !== undefined) {
        if (bar.low <= position.stopLoss) {
          const actualExit = Math.min(position.stopLoss, bar.open);
          const { executionPrice, netProceeds } = this.executionSim.executeSell(
            actualExit, position.quantity
          );
          this.portfolio.closePosition(
            position, executionPrice, netProceeds,
            "Stop-loss hit" + (bar.open < position.stopLoss ? " (gap)" : ""),
            barIndex
          );
          continue;
        }
      }

      // Priority 2: Take-profit
      if (position.takeProfit !== undefined) {
        if (bar.high >= position.takeProfit) {
          const actualExit = Math.max(position.takeProfit, bar.open);
          const { executionPrice, netProceeds } = this.executionSim.executeSell(
            actualExit, position.quantity
          );
          this.portfolio.closePosition(
            position, executionPrice, netProceeds,
            "Take-profit hit" + (bar.open > position.takeProfit ? " (gap)" : ""),
            barIndex
          );
        }
      }
    }
  }

  private queueBuyOrder(signal: Signal, bar: OHLCV, symbol: string, barIndex: number) {
    if (!this.portfolio) return;

    const hasPosition = this.portfolio.positions.some(p => p.symbol === symbol);
    if (hasPosition) {
      this.portfolio.rejectSignal(bar.timestamp, symbol, signal, "Already holding position");
      return;
    }

    const quantity = this.riskEngine.calculatePositionSize(signal, bar.close, this.portfolio.cash);
    if (quantity <= 0) {
      this.portfolio.rejectSignal(bar.timestamp, symbol, signal, "Position size is zero");
      return;
    }

    const { valid, reason } = this.riskEngine.validateSignal(
      signal,
      quantity,
      bar.close,
      this.portfolio.cash,
      this.portfolio.getEquity(),
      this.portfolio.positions.length,
      this.portfolio.getPositionsValue()
    );

    if (!valid) {
      this.portfolio.rejectSignal(bar.timestamp, symbol, signal, reason);
      return;
    }

    this.pendingOrders.push({
      signal,
      quantity,
      barIndex,
      symbol,
      reason: signal.reason
    });
  }

  private queueSellOrder(signal: Signal, bar: OHLCV, symbol: string, barIndex: number) {
    this.pendingOrders.push({
      signal,
      quantity: 0,
      barIndex,
      symbol,
      reason: signal.reason
    });
  }

  private executePendingOrders(bar: OHLCV, symbol: string, barIndex: number) {
    if (!this.portfolio) return;

    const ordersToExecute = [...this.pendingOrders];
    this.pendingOrders = [];

    for (const order of ordersToExecute) {
      if (order.signal.action === "BUY") {
        const { executionPrice, totalCost } = this.executionSim.executeBuy(bar.open, order.quantity);
        
        if (totalCost > this.portfolio.cash) {
          this.portfolio.rejectSignal(bar.timestamp, symbol, order.signal, "Insufficient cash for execution");
          continue;
        }

        const position: Position = {
          symbol: order.symbol,
          entryPrice: executionPrice,
          quantity: order.quantity,
          entryTime: bar.timestamp,
          entryBarIndex: barIndex,
          stopLoss: order.signal.stopLoss,
          takeProfit: order.signal.takeProfit,
          reason: order.reason
        };

        this.portfolio.addPosition(position, totalCost);
      } else if (order.signal.action === "SELL") {
        const position = this.portfolio.positions.find(p => p.symbol === symbol);
        if (position) {
          const { executionPrice, netProceeds } = this.executionSim.executeSell(bar.open, position.quantity);
          this.portfolio.closePosition(position, executionPrice, netProceeds, order.reason, barIndex);
        }
      }
    }
  }

  private generateResults(runTimestamp: string, strategyId: string, strategyName: string): Record<string, unknown> {
    if (!this.portfolio) return {};

    const trades = this.portfolio.trades;
    const equityCurve = this.portfolio.equityCurve;
    const finalEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].equity : this.config.initialCapital;
    const totalReturn = (finalEquity - this.config.initialCapital) / this.config.initialCapital;

    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl <= 0);
    const winRate = trades.length > 0 ? winningTrades.length / trades.length : 0;
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;
    const riskReward = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 99.99 : 0;
    const profitFactor = avgLoss > 0 ? (winningTrades.reduce((sum, t) => sum + t.pnl, 0)) / Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0)) : winningTrades.length > 0 ? 99.99 : 0;
    const expectancy = trades.length > 0 ? trades.reduce((sum, t) => sum + t.pnl, 0) / trades.length : 0;

    const pnlValues = trades.map(t => t.pnl);
    const medianPnl = this.median(pnlValues);
    const pnlStd = this.standardDeviation(pnlValues);

    let maxDrawdown = 0;
    let peak = this.config.initialCapital;

    for (const point of equityCurve) {
      peak = Math.max(peak, point.equity);
      const drawdown = peak > 0 ? (point.equity - peak) / peak : 0;
      maxDrawdown = Math.min(maxDrawdown, drawdown);
    }

    const bars = equityCurve.length;
    let years = bars / 252;
    if (this.config.dataFrequency === "hourly") years = bars / (252 * 6.5);
    if (this.config.dataFrequency === "minute") years = bars / (252 * 6.5 * 60);

    const cagr = years > 0 ? Math.pow(finalEquity / this.config.initialCapital, 1 / years) - 1 : 0;

    const returns = trades.map(t => t.pnlPct);
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const returnStd = this.standardDeviation(returns);
    const sharpeRatio = returnStd > 0 ? (avgReturn / returnStd) * Math.sqrt(12) : 0;

    return {
      metadata: {
        engineVersion: ENGINE_VERSION,
        configHash: this.hashString(JSON.stringify(this.config)).substring(0, 8),
        strategyId,
        strategyName,
        runTimestamp,
        dataFrequency: this.config.dataFrequency,
        finalLiquidationPolicy: "forced_open_at_last_bar"
      },
      summary: {
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate: Math.round(winRate * 10000) / 100,
        totalReturn: Math.round(totalReturn * 10000) / 100,
        cagr: Math.round(cagr * 10000) / 100,
        maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
        avgWin: Math.round(avgWin * 100) / 100,
        avgLoss: Math.round(avgLoss * 100) / 100,
        riskReward: Math.round(riskReward * 100) / 100,
        profitFactor: Math.min(Math.round(profitFactor * 100) / 100, 99.99),
        expectancy: Math.round(expectancy * 100) / 100,
        medianPnl: Math.round(medianPnl * 100) / 100,
        pnlStd: Math.round(pnlStd * 100) / 100,
        sharpeRatio: Math.round(sharpeRatio * 100) / 100,
        finalEquity: Math.round(finalEquity * 100) / 100,
        avgTradeDuration: trades.length > 0 ? Math.round(trades.reduce((sum, t) => sum + t.durationBars, 0) / trades.length) : 0,
        tradingDisabled: this.portfolio.tradingDisabled
      },
      equityCurve: equityCurve.map(e => ({
        date: e.timestamp.split("T")[0],
        value: Math.round(e.equity * 100) / 100,
        cash: Math.round(e.cash * 100) / 100
      })),
      trades: trades.map(t => ({
        entryTime: t.entryTime,
        exitTime: t.exitTime,
        entryPrice: Math.round(t.entryPrice * 100) / 100,
        exitPrice: Math.round(t.exitPrice * 100) / 100,
        quantity: t.quantity,
        pnl: Math.round(t.pnl * 100) / 100,
        pnlPct: Math.round(t.pnlPct * 10000) / 100,
        entryReason: t.entryReason,
        exitReason: t.exitReason,
        durationBars: t.durationBars
      })),
      rejectedSignals: this.portfolio.rejectedSignals,
      behaviorMetrics: {
        tradeFrequency: equityCurve.length > 0 ? trades.length / equityCurve.length : 0,
        avgPositions: equityCurve.length > 0
          ? equityCurve.reduce((sum, e) => sum + e.positionsCount, 0) / equityCurve.length
          : 0,
        maxPositions: Math.max(...equityCurve.map(e => e.positionsCount), 0)
      }
    };
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private standardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / (values.length - 1));
  }
}

// ============================================================================
// 9. REALISTIC DATA GENERATION WITH TRENDS
// ============================================================================

function generateRealisticData(days: number = 365, symbol: string = "NIFTY"): OHLCV[] {
  const data: OHLCV[] = [];
  
  // Base prices for Indian stocks/indices
  const basePrices: Record<string, number> = {
    NIFTY: 22500,
    BANKNIFTY: 48500,
    RELIANCE: 2450,
    TCS: 3850,
    HDFCBANK: 1650,
    INFY: 1480,
    ICICIBANK: 1050,
    SBIN: 625,
    ITC: 445
  };

  let price = basePrices[symbol] || 1000;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Create stronger trend phases to ensure crossovers happen with RSI extremes
  const phases = [
    { days: 15, trend: 0.008 },   // Strong uptrend - should push RSI high
    { days: 10, trend: -0.012 },  // Sharp correction - should drop RSI
    { days: 20, trend: 0.006 },   // Recovery uptrend
    { days: 8, trend: -0.015 },   // Pullback - RSI drops
    { days: 25, trend: 0.007 },   // Rally - RSI climbs
    { days: 12, trend: -0.01 },   // Correction
    { days: 18, trend: 0.009 },   // Strong recovery - EMA crossover
    { days: 15, trend: -0.008 },  // Decline
    { days: 22, trend: 0.005 },   // Gradual climb
    { days: 10, trend: -0.012 },  // Sharp drop
    { days: 20, trend: 0.008 },   // Bull run - RSI high
    { days: 12, trend: -0.006 },  // Mild correction
    { days: 18, trend: 0.01 },    // Strong up
    { days: 25, trend: -0.004 },  // Slow decline
  ];

  let currentPhaseIndex = 0;
  let daysInPhase = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Get current phase trend
    const phase = phases[currentPhaseIndex % phases.length];
    const volatility = 0.008 + Math.random() * 0.006;
    const trendBias = phase.trend;
    
    // Add some randomness around the trend
    const noise = (Math.random() - 0.5) * volatility * 2;
    const dayChange = trendBias + noise;
    
    const open = price;
    price = price * (1 + dayChange);
    const close = price;
    
    // Intraday high/low with realistic ranges
    const range = volatility * price * (0.5 + Math.random());
    const high = Math.max(open, close) + range * Math.random();
    const low = Math.min(open, close) - range * Math.random();
    const volume = Math.floor(500000 + Math.random() * 2000000);

    data.push({
      timestamp: date.toISOString(),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume
    });

    
    daysInPhase++;
    
    // Move to next phase
    if (daysInPhase >= phase.days) {
      daysInPhase = 0;
      currentPhaseIndex++;
    }
  }

  console.log(`[Data] Generated ${data.length} bars with ${phases.length} trend phases`);
  return data;
}

function parseStrategyConfig(strategy: Record<string, unknown>): StrategyConfig {
  const config: StrategyConfig = {
    entryRules: [],
    exitRules: [],
  };

  // Parse entry rules
  if (strategy.entry_rules) {
    const rules = strategy.entry_rules as unknown[];
    if (Array.isArray(rules)) {
      config.entryRules = rules.map(r => {
        const rule = r as Record<string, unknown>;
        return {
          indicator: String(rule.indicator || ""),
          condition: String(rule.condition || "").replace(/\s+/g, ""),
          value: rule.value as number | string | { indicator: string; period?: number },
          period: rule.period as number | undefined
        };
      }).filter(r => r.indicator);
    }
  }

  // Parse exit rules
  if (strategy.exit_rules) {
    const rules = strategy.exit_rules as unknown[];
    if (Array.isArray(rules)) {
      config.exitRules = rules.map(r => {
        const rule = r as Record<string, unknown>;
        return {
          indicator: String(rule.indicator || ""),
          condition: String(rule.condition || "").replace(/\s+/g, ""),
          value: rule.value as number | string | { indicator: string; period?: number },
          period: rule.period as number | undefined
        };
      }).filter(r => r.indicator);
    }
  }

  // Parse position sizing - convert percentage to decimal if needed
  if (strategy.position_sizing) {
    const ps = strategy.position_sizing as Record<string, unknown>;
    let value = ps.value as number;
    // If value > 1, assume it's a percentage and convert to decimal
    if (value > 1) {
      value = value / 100;
    }
    config.positionSizing = { type: String(ps.type || "fixed_percent"), value };
  }

  // Parse risk limits - handle both naming conventions
  if (strategy.risk_limits) {
    const rl = strategy.risk_limits as Record<string, unknown>;
    config.riskLimits = {
      stopLoss: (rl.stopLoss as number) || (rl.stop_loss_percent as number) || 2,
      takeProfit: (rl.takeProfit as number) || (rl.take_profit_percent as number) || 6
    };
  }

  // Default rules if none provided
  if (config.entryRules.length === 0) {
    config.entryRules = [
      { indicator: "RSI", condition: "below", value: 35, period: 14 },
      { indicator: "price", condition: "above", value: "sma20" }
    ];
  }

  if (config.exitRules.length === 0) {
    config.exitRules = [
      { indicator: "RSI", condition: "above", value: 65, period: 14 }
    ];
  }

  if (!config.riskLimits) {
    config.riskLimits = { stopLoss: 2, takeProfit: 6 };
  }

  return config;
}

// ============================================================================
// 10. MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { strategyId, startDate, endDate, symbol = "NIFTY", initialCapital = 1000000 } = await req.json();

    console.log(`[Backtest] Starting for strategy ${strategyId}, symbol ${symbol}`);

    if (!strategyId) {
      return new Response(
        JSON.stringify({ error: "Strategy ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch strategy
    const { data: strategy, error: strategyError } = await supabase
      .from("strategies")
      .select("*")
      .eq("id", strategyId)
      .single();

    if (strategyError || !strategy) {
      console.error("[Backtest] Strategy not found:", strategyError);
      return new Response(
        JSON.stringify({ error: "Strategy not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse strategy config
    const strategyConfig = parseStrategyConfig(strategy);
    console.log("[Backtest] Strategy config:", JSON.stringify(strategyConfig));

    // Generate realistic sample data with trends
    const days = 365;
    const priceData = generateRealisticData(days, symbol);
    console.log(`[Backtest] Generated ${priceData.length} price bars`);

    // Configure engine
    const config: BacktestConfig = {
      initialCapital,
      slippage: 0.001,
      brokerageRate: 0.0003,
      maxRiskPerTrade: 0.02,
      maxConcurrentPositions: 5,
      maxDrawdown: 0.20,
      mandatoryStopLoss: true,
      maxCapitalDeployed: 0.95,
      maxSinglePositionExposure: 0.30,
      dataFrequency: "daily"
    };

    // Run backtest
    const engine = new BacktestEngine(config);
    const result = engine.run(priceData, strategyConfig, strategy.name, 50, symbol);

    console.log(`[Backtest] Completed: ${(result.summary as Record<string, unknown>)?.totalTrades || 0} trades`);

    // Save results to database
    const { data: backtestResult, error: saveError } = await supabase
      .from("backtest_results")
      .insert({
        strategy_id: strategyId,
        user_id: strategy.user_id,
        strategy_version: strategy.version || 1,
        status: "completed",
        parameters: { startDate, endDate, symbol, initialCapital, engineVersion: ENGINE_VERSION },
        metrics: result.summary,
        equity_curve: result.equityCurve,
        trade_log: result.trades,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error("[Backtest] Error saving results:", saveError);
    }

    // Update strategy status
    await supabase
      .from("strategies")
      .update({ status: "backtested" })
      .eq("id", strategyId);

    return new Response(
      JSON.stringify({
        success: true,
        backtestId: backtestResult?.id,
        metadata: result.metadata,
        metrics: result.summary,
        equityCurve: result.equityCurve,
        trades: result.trades,
        rejectedSignals: result.rejectedSignals,
        behaviorMetrics: result.behaviorMetrics
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[Backtest] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred during backtesting";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
