// Strategy Execution Engine for Backtesting
import { 
  OHLCV, 
  calculateSMA, 
  calculateEMA, 
  calculateRSI, 
  calculateMACD, 
  calculateBollingerBands,
  calculateATR,
  calculateStochastic,
  getIndicatorValue 
} from './indicators';

export interface StrategyRule {
  indicator: string;
  condition: 'crosses_above' | 'crosses_below' | 'greater_than' | 'less_than' | 'equals';
  value: number | string;
  period?: number;
}

export interface StrategyConfig {
  entryRules: StrategyRule[];
  exitRules: StrategyRule[];
  positionSizing?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  riskLimits?: {
    stopLoss?: number;
    takeProfit?: number;
    maxPositionSize?: number;
  };
}

export interface Trade {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  side: 'long' | 'short';
  quantity: number;
  pnl: number;
  pnlPercent: number;
  exitReason: string;
}

export interface BacktestResult {
  trades: Trade[];
  metrics: {
    totalReturn: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    sharpeRatio: number;
    profitFactor: number;
    avgWinPercent: number;
    avgLossPercent: number;
    largestWin: number;
    largestLoss: number;
    consecutiveWins: number;
    consecutiveLosses: number;
  };
  equityCurve: { date: string; value: number }[];
}

interface IndicatorCache {
  sma: Map<number, number[]>;
  ema: Map<number, number[]>;
  rsi: Map<number, number[]>;
  macd: ReturnType<typeof calculateMACD> | null;
  bollingerBands: Map<number, ReturnType<typeof calculateBollingerBands>>;
  atr: Map<number, number[]>;
  stochastic: Map<number, ReturnType<typeof calculateStochastic>>;
}

// Calculate all indicators needed for the strategy
function calculateIndicators(data: OHLCV[], config: StrategyConfig): IndicatorCache {
  const closes = data.map(d => d.close);
  const cache: IndicatorCache = {
    sma: new Map(),
    ema: new Map(),
    rsi: new Map(),
    macd: null,
    bollingerBands: new Map(),
    atr: new Map(),
    stochastic: new Map(),
  };

  const allRules = [...config.entryRules, ...config.exitRules];

  for (const rule of allRules) {
    const period = rule.period || 14;
    
    switch (rule.indicator.toLowerCase()) {
      case 'sma':
        if (!cache.sma.has(period)) {
          cache.sma.set(period, calculateSMA(closes, period));
        }
        break;
      case 'ema':
        if (!cache.ema.has(period)) {
          cache.ema.set(period, calculateEMA(closes, period));
        }
        break;
      case 'rsi':
        if (!cache.rsi.has(period)) {
          cache.rsi.set(period, calculateRSI(closes, period));
        }
        break;
      case 'macd':
      case 'macd_line':
      case 'macd_signal':
      case 'macd_histogram':
        if (!cache.macd) {
          cache.macd = calculateMACD(closes);
        }
        break;
      case 'bollinger_upper':
      case 'bollinger_lower':
      case 'bollinger_middle':
        if (!cache.bollingerBands.has(period)) {
          cache.bollingerBands.set(period, calculateBollingerBands(closes, period));
        }
        break;
      case 'atr':
        if (!cache.atr.has(period)) {
          cache.atr.set(period, calculateATR(data, period));
        }
        break;
      case 'stochastic_k':
      case 'stochastic_d':
        if (!cache.stochastic.has(period)) {
          cache.stochastic.set(period, calculateStochastic(data, period));
        }
        break;
    }
  }

  // Always calculate basic indicators for price comparisons
  if (!cache.sma.has(20)) cache.sma.set(20, calculateSMA(closes, 20));
  if (!cache.rsi.has(14)) cache.rsi.set(14, calculateRSI(closes, 14));

  return cache;
}

// Get indicator value at a specific index
function getIndicator(
  indicator: string, 
  index: number, 
  data: OHLCV[], 
  cache: IndicatorCache,
  period: number = 14
): number | null {
  switch (indicator.toLowerCase()) {
    case 'price':
    case 'close':
      return data[index]?.close ?? null;
    case 'open':
      return data[index]?.open ?? null;
    case 'high':
      return data[index]?.high ?? null;
    case 'low':
      return data[index]?.low ?? null;
    case 'volume':
      return data[index]?.volume ?? null;
    case 'sma':
      return getIndicatorValue(cache.sma.get(period) || [], index);
    case 'ema':
      return getIndicatorValue(cache.ema.get(period) || [], index);
    case 'rsi':
      return getIndicatorValue(cache.rsi.get(period) || [], index);
    case 'macd':
    case 'macd_line':
      return cache.macd ? getIndicatorValue(cache.macd.macd, index) : null;
    case 'macd_signal':
      return cache.macd ? getIndicatorValue(cache.macd.signal, index) : null;
    case 'macd_histogram':
      return cache.macd ? getIndicatorValue(cache.macd.histogram, index) : null;
    case 'bollinger_upper':
      return getIndicatorValue(cache.bollingerBands.get(period)?.upper || [], index);
    case 'bollinger_lower':
      return getIndicatorValue(cache.bollingerBands.get(period)?.lower || [], index);
    case 'bollinger_middle':
      return getIndicatorValue(cache.bollingerBands.get(period)?.middle || [], index);
    case 'atr':
      return getIndicatorValue(cache.atr.get(period) || [], index);
    case 'stochastic_k':
      return getIndicatorValue(cache.stochastic.get(period)?.k || [], index);
    case 'stochastic_d':
      return getIndicatorValue(cache.stochastic.get(period)?.d || [], index);
    default:
      return null;
  }
}

// Evaluate a single rule
function evaluateRule(
  rule: StrategyRule,
  index: number,
  data: OHLCV[],
  cache: IndicatorCache
): boolean {
  const currentValue = getIndicator(rule.indicator, index, data, cache, rule.period);
  const prevValue = getIndicator(rule.indicator, index - 1, data, cache, rule.period);
  
  if (currentValue === null) return false;

  // Determine comparison value
  let compareValue: number;
  if (typeof rule.value === 'string') {
    // It's another indicator
    const otherValue = getIndicator(rule.value, index, data, cache, rule.period);
    if (otherValue === null) return false;
    compareValue = otherValue;
  } else {
    compareValue = rule.value;
  }

  const prevCompareValue = typeof rule.value === 'string' 
    ? getIndicator(rule.value, index - 1, data, cache, rule.period)
    : rule.value;

  switch (rule.condition) {
    case 'greater_than':
      return currentValue > compareValue;
    case 'less_than':
      return currentValue < compareValue;
    case 'equals':
      return Math.abs(currentValue - compareValue) < 0.001;
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

// Check if all entry rules are satisfied
function checkEntrySignal(
  index: number,
  data: OHLCV[],
  cache: IndicatorCache,
  config: StrategyConfig
): boolean {
  if (config.entryRules.length === 0) return false;
  return config.entryRules.every(rule => evaluateRule(rule, index, data, cache));
}

// Check if any exit rule is satisfied
function checkExitSignal(
  index: number,
  data: OHLCV[],
  cache: IndicatorCache,
  config: StrategyConfig,
  entryPrice: number
): { shouldExit: boolean; reason: string } {
  // Check stop loss
  if (config.riskLimits?.stopLoss) {
    const stopPrice = entryPrice * (1 - config.riskLimits.stopLoss / 100);
    if (data[index].low <= stopPrice) {
      return { shouldExit: true, reason: 'Stop Loss' };
    }
  }

  // Check take profit
  if (config.riskLimits?.takeProfit) {
    const targetPrice = entryPrice * (1 + config.riskLimits.takeProfit / 100);
    if (data[index].high >= targetPrice) {
      return { shouldExit: true, reason: 'Take Profit' };
    }
  }

  // Check exit rules
  for (const rule of config.exitRules) {
    if (evaluateRule(rule, index, data, cache)) {
      return { shouldExit: true, reason: 'Exit Signal' };
    }
  }

  return { shouldExit: false, reason: '' };
}

// Calculate position size based on config
function calculatePositionSize(
  capital: number,
  price: number,
  config: StrategyConfig
): number {
  if (!config.positionSizing) {
    // Default to 10% of capital
    return Math.floor((capital * 0.1) / price);
  }

  if (config.positionSizing.type === 'fixed') {
    return Math.floor(config.positionSizing.value / price);
  } else {
    return Math.floor((capital * config.positionSizing.value / 100) / price);
  }
}

// Main backtest function
export function runBacktest(
  data: OHLCV[],
  config: StrategyConfig,
  initialCapital: number = 1000000
): BacktestResult {
  const cache = calculateIndicators(data, config);
  const trades: Trade[] = [];
  const equityCurve: { date: string; value: number }[] = [];
  
  let capital = initialCapital;
  let position: { entryDate: string; entryPrice: number; quantity: number } | null = null;
  let peakCapital = initialCapital;
  let maxDrawdown = 0;
  let consecutiveWins = 0;
  let consecutiveLosses = 0;
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;

  // Skip first 50 bars to allow indicators to warm up
  const startIndex = 50;

  for (let i = startIndex; i < data.length; i++) {
    const currentDate = data[i].date;
    const currentPrice = data[i].close;

    if (position === null) {
      // Check for entry signal
      if (checkEntrySignal(i, data, cache, config)) {
        const quantity = calculatePositionSize(capital, currentPrice, config);
        if (quantity > 0) {
          position = {
            entryDate: currentDate,
            entryPrice: currentPrice,
            quantity
          };
        }
      }
    } else {
      // Check for exit signal
      const { shouldExit, reason } = checkExitSignal(i, data, cache, config, position.entryPrice);
      
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
          exitReason: i === data.length - 1 ? 'End of Data' : reason
        });

        capital += pnl;
        position = null;

        // Track consecutive wins/losses
        if (pnl > 0) {
          consecutiveWins++;
          consecutiveLosses = 0;
          maxConsecutiveWins = Math.max(maxConsecutiveWins, consecutiveWins);
        } else {
          consecutiveLosses++;
          consecutiveWins = 0;
          maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
        }
      }
    }

    // Track equity and drawdown
    const currentEquity = capital + (position ? (currentPrice - position.entryPrice) * position.quantity : 0);
    equityCurve.push({ date: currentDate, value: currentEquity });
    
    peakCapital = Math.max(peakCapital, currentEquity);
    const drawdown = ((peakCapital - currentEquity) / peakCapital) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  // Calculate metrics
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl <= 0);
  
  const totalReturn = ((capital - initialCapital) / initialCapital) * 100;
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  
  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
  
  const avgWinPercent = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / winningTrades.length 
    : 0;
  const avgLossPercent = losingTrades.length > 0 
    ? losingTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / losingTrades.length 
    : 0;
  
  const largestWin = Math.max(...trades.map(t => t.pnl), 0);
  const largestLoss = Math.min(...trades.map(t => t.pnl), 0);

  // Calculate Sharpe Ratio (simplified - using monthly returns approximation)
  const returns = trades.map(t => t.pnlPercent);
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdDev = returns.length > 1 
    ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1))
    : 0;
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(12) : 0;

  return {
    trades,
    metrics: {
      totalReturn: Math.round(totalReturn * 100) / 100,
      maxDrawdown: -Math.round(maxDrawdown * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      totalTrades: trades.length,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      avgWinPercent: Math.round(avgWinPercent * 100) / 100,
      avgLossPercent: Math.round(avgLossPercent * 100) / 100,
      largestWin: Math.round(largestWin),
      largestLoss: Math.round(largestLoss),
      consecutiveWins: maxConsecutiveWins,
      consecutiveLosses: maxConsecutiveLosses
    },
    equityCurve
  };
}

// Parse strategy rules from database format
export function parseStrategyConfig(strategy: {
  entry_rules?: unknown;
  exit_rules?: unknown;
  position_sizing?: unknown;
  risk_limits?: unknown;
}): StrategyConfig {
  const config: StrategyConfig = {
    entryRules: [],
    exitRules: [],
  };

  // Parse entry rules
  if (strategy.entry_rules && typeof strategy.entry_rules === 'object') {
    const rules = strategy.entry_rules as Record<string, unknown>;
    if (Array.isArray(rules)) {
      config.entryRules = rules as StrategyRule[];
    } else if (rules.conditions && Array.isArray(rules.conditions)) {
      config.entryRules = rules.conditions as StrategyRule[];
    }
  }

  // Parse exit rules
  if (strategy.exit_rules && typeof strategy.exit_rules === 'object') {
    const rules = strategy.exit_rules as Record<string, unknown>;
    if (Array.isArray(rules)) {
      config.exitRules = rules as StrategyRule[];
    } else if (rules.conditions && Array.isArray(rules.conditions)) {
      config.exitRules = rules.conditions as StrategyRule[];
    }
  }

  // Parse position sizing
  if (strategy.position_sizing && typeof strategy.position_sizing === 'object') {
    config.positionSizing = strategy.position_sizing as StrategyConfig['positionSizing'];
  }

  // Parse risk limits
  if (strategy.risk_limits && typeof strategy.risk_limits === 'object') {
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

// Generate sample price data for testing
export function generateSampleData(symbol: string, days: number = 365): OHLCV[] {
  const data: OHLCV[] = [];
  let price = 1000 + Math.random() * 500;
  const volatility = 0.02;
  const trend = 0.0003;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.5) * 2 * volatility + trend;
    const open = price;
    price = price * (1 + change);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
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
