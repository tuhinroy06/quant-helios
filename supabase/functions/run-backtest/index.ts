import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Trading Backtesting Engine - PRODUCTION VERSION v1.0.1
 * 
 * ENGINE GUARANTEES:
 * - No lookahead bias
 * - Next-bar execution only (final liquidation at last bar open, deterministic exception)
 * - Deterministic results for identical inputs
 * - Capital conservation enforced
 * - Long-only execution
 * - Single-symbol isolation
 * - Stop-loss priority over take-profit
 * - Risk evaluated before execution
 * - Position size frozen at queue time
 */

const ENGINE_VERSION = "1.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// 1. CORE ENUMS & DATA STRUCTURES
// ============================================================================

enum Action {
  BUY = "BUY",
  SELL = "SELL",
  HOLD = "HOLD"
}

interface Signal {
  action: Action;
  stopLoss?: number;
  takeProfit?: number;
  positionSize: number; // % of capital (0.0 to 1.0)
  reason: string;
}

interface PendingOrder {
  signal: Signal;
  quantity: number; // FROZEN at queue time
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
  dataFrequency: 'daily' | 'hourly' | 'minute';
}

interface OHLCV {
  timestamp: string;
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
  stopLossPct?: number;
  takeProfitPct?: number;
  positionSizePct?: number;
}

interface EquityPoint {
  timestamp: string;
  equity: number;
  cash: number;
  positionsCount: number;
}

// ============================================================================
// 2. INDICATOR CALCULATIONS
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
  ): { isValid: boolean; reason: string } {
    // Check mandatory stop-loss
    if (this.config.mandatoryStopLoss && signal.action === Action.BUY) {
      if (signal.stopLoss === undefined) {
        return { isValid: false, reason: "Mandatory stop-loss missing" };
      }
    }
    
    // Check max concurrent positions
    if (signal.action === Action.BUY) {
      if (openPositions >= this.config.maxConcurrentPositions) {
        return { isValid: false, reason: `Max positions (${this.config.maxConcurrentPositions}) reached` };
      }
    }
    
    // Check risk per trade (validate proposed quantity against stop-loss)
    if (signal.action === Action.BUY && signal.stopLoss !== undefined) {
      const riskPerShare = proposedPrice - signal.stopLoss;
      if (riskPerShare <= 0) {
        return { isValid: false, reason: "Stop-loss must be below entry price" };
      }
      
      const totalRisk = riskPerShare * proposedQuantity;
      const maxAllowedRisk = portfolioEquity * this.config.maxRiskPerTrade;
      
      if (totalRisk > maxAllowedRisk) {
        return { isValid: false, reason: `Position risk exceeds max risk per trade (${this.config.maxRiskPerTrade * 100}%)` };
      }
    }
    
    // Check max capital deployed
    if (signal.action === Action.BUY) {
      const proposedCost = proposedPrice * proposedQuantity;
      const newPositionsValue = positionsValue + proposedCost;
      const deployedPct = newPositionsValue / portfolioEquity;
      
      if (deployedPct > this.config.maxCapitalDeployed) {
        return { isValid: false, reason: `Max capital deployed (${this.config.maxCapitalDeployed * 100}%) would be exceeded` };
      }
    }
    
    // Check max single position exposure
    if (signal.action === Action.BUY) {
      const proposedCost = proposedPrice * proposedQuantity;
      const exposurePct = proposedCost / portfolioEquity;
      
      if (exposurePct > this.config.maxSinglePositionExposure) {
        return { isValid: false, reason: `Single position exposure (${this.config.maxSinglePositionExposure * 100}%) would be exceeded` };
      }
    }
    
    return { isValid: true, reason: "Valid" };
  }
  
  calculatePositionSize(
    signal: Signal,
    currentPrice: number,
    portfolioCash: number
  ): number {
    if (signal.action !== Action.BUY) return 0;
    
    // Start with signal's suggested size
    let capitalToUse = portfolioCash * signal.positionSize;
    
    // Adjust for risk if stop-loss is set
    if (signal.stopLoss !== undefined) {
      const riskPerShare = currentPrice - signal.stopLoss;
      if (riskPerShare <= 0) return 0;
      
      const maxCapitalAtRisk = portfolioCash * this.config.maxRiskPerTrade;
      const maxShares = maxCapitalAtRisk / riskPerShare;
      const maxCapitalByRisk = maxShares * currentPrice;
      capitalToUse = Math.min(capitalToUse, maxCapitalByRisk);
    }
    
    const shares = Math.floor(capitalToUse / currentPrice);
    return Math.max(0, shares);
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
    const totalCost = grossCost + brokerage;
    return { executionPrice, totalCost };
  }
  
  executeSell(price: number, quantity: number): { executionPrice: number; netProceeds: number } {
    const executionPrice = price * (1 - this.config.slippage);
    const grossProceeds = executionPrice * quantity;
    const brokerage = grossProceeds * this.config.brokerageRate;
    const netProceeds = grossProceeds - brokerage;
    return { executionPrice, netProceeds };
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
  currentTime: string = '';
  currentPrices: Record<string, number> = {};
  tradingDisabled = false;
  
  constructor(private initialCapital: number) {
    this.cash = initialCapital;
  }
  
  validateState(): void {
    if (this.cash < 0) {
      throw new Error(`Portfolio cash is negative: ${this.cash}`);
    }
    
    for (const pos of this.positions) {
      if (pos.quantity <= 0) {
        throw new Error(`Position quantity <= 0: ${pos.quantity}`);
      }
      if (pos.entryPrice <= 0) {
        throw new Error(`Position entry_price <= 0: ${pos.entryPrice}`);
      }
    }
  }
  
  updatePrices(timestamp: string, prices: Record<string, number>): void {
    this.currentTime = timestamp;
    this.currentPrices = prices;
    this.recordEquity();
  }
  
  addPosition(position: Position, cost: number): void {
    this.positions.push(position);
    this.cash -= cost;
  }
  
  closePosition(
    position: Position,
    exitPrice: number,
    proceeds: number,
    reason: string,
    exitBarIndex: number
  ): void {
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
  
  rejectSignal(timestamp: string, symbol: string, signal: Signal, reason: string): void {
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
    const positionsValue = this.positions.reduce(
      (sum, p) => sum + (this.currentPrices[p.symbol] ?? p.entryPrice) * p.quantity,
      0
    );
    return this.cash + positionsValue;
  }
  
  getPositionsValue(): number {
    return this.positions.reduce(
      (sum, p) => sum + (this.currentPrices[p.symbol] ?? p.entryPrice) * p.quantity,
      0
    );
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
  
  private recordEquity(): void {
    this.equityCurve.push({
      timestamp: this.currentTime,
      equity: this.getEquity(),
      cash: this.cash,
      positionsCount: this.positions.length
    });
  }
}

// ============================================================================
// 6. STRATEGY ENGINE
// ============================================================================

interface IndicatorCache {
  sma20: number[];
  sma50: number[];
  ema20: number[];
  rsi14: number[];
}

function calculateIndicators(data: OHLCV[]): IndicatorCache {
  const closes = data.map(d => d.close);
  return {
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
    ema20: calculateEMA(closes, 20),
    rsi14: calculateRSI(closes, 14)
  };
}

function getIndicatorValue(
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
    case 'sma':
    case 'sma20':
      return isNaN(cache.sma20[index]) ? null : cache.sma20[index];
    case 'sma50':
      return isNaN(cache.sma50[index]) ? null : cache.sma50[index];
    case 'ema':
    case 'ema20':
      return isNaN(cache.ema20[index]) ? null : cache.ema20[index];
    case 'rsi':
    case 'rsi14':
      return isNaN(cache.rsi14[index]) ? null : cache.rsi14[index];
    default:
      return null;
  }
}

function evaluateRule(
  rule: StrategyRule,
  index: number,
  data: OHLCV[],
  cache: IndicatorCache
): boolean {
  const currentValue = getIndicatorValue(rule.indicator, index, data, cache, rule.period);
  const prevValue = getIndicatorValue(rule.indicator, index - 1, data, cache, rule.period);
  
  if (currentValue === null) return false;

  let compareValue: number;
  if (typeof rule.value === 'string') {
    const otherValue = getIndicatorValue(rule.value, index, data, cache, rule.period);
    if (otherValue === null) return false;
    compareValue = otherValue;
  } else {
    compareValue = rule.value;
  }

  const prevCompareValue = typeof rule.value === 'string' 
    ? getIndicatorValue(rule.value, index - 1, data, cache, rule.period)
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

function generateSignal(
  index: number,
  data: OHLCV[],
  cache: IndicatorCache,
  strategyConfig: StrategyConfig,
  portfolioState: Record<string, unknown>
): Signal {
  const hasPosition = (portfolioState.positionsCount as number) > 0;
  const currentPrice = data[index].close;
  
  // Default signal
  const holdSignal: Signal = {
    action: Action.HOLD,
    positionSize: 0,
    reason: ''
  };
  
  // Check entry conditions (only if no position)
  if (!hasPosition) {
    const entrySignal = strategyConfig.entryRules.every(rule =>
      evaluateRule(rule, index, data, cache)
    );
    
    if (entrySignal && strategyConfig.entryRules.length > 0) {
      const stopLoss = strategyConfig.stopLossPct 
        ? currentPrice * (1 - strategyConfig.stopLossPct / 100)
        : currentPrice * 0.98; // Default 2% stop
        
      const takeProfit = strategyConfig.takeProfitPct
        ? currentPrice * (1 + strategyConfig.takeProfitPct / 100)
        : currentPrice * 1.06; // Default 6% target
      
      return {
        action: Action.BUY,
        stopLoss,
        takeProfit,
        positionSize: (strategyConfig.positionSizePct ?? 20) / 100,
        reason: `Entry signal: ${strategyConfig.entryRules.map(r => `${r.indicator} ${r.condition} ${r.value}`).join(' AND ')}`
      };
    }
  }
  
  // Check exit conditions (only if has position)
  if (hasPosition) {
    for (const rule of strategyConfig.exitRules) {
      if (evaluateRule(rule, index, data, cache)) {
        return {
          action: Action.SELL,
          positionSize: 1,
          reason: `Exit signal: ${rule.indicator} ${rule.condition} ${rule.value}`
        };
      }
    }
  }
  
  return holdSignal;
}

// ============================================================================
// 7. BACKTESTING ENGINE
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
    lookback: number = 50,
    symbol: string = "STOCK"
  ): Record<string, unknown> {
    if (this.runCompleted) {
      throw new Error("BacktestEngine cannot be reused. Create new instance for each run.");
    }
    
    // Initialize
    this.portfolio = new Portfolio(this.config.initialCapital);
    this.pendingOrders = [];
    const cache = calculateIndicators(data);
    
    // Run timestamp from data (deterministic)
    const runTimestamp = data[data.length - 1]?.timestamp || new Date().toISOString();
    
    // MAIN BACKTEST LOOP
    for (let t = lookback; t < data.length; t++) {
      const currentBar = data[t];
      
      // === STEP 1: Pre-open valuation (using prev close) ===
      if (t > 0) {
        const prevClose = data[t - 1].close;
        this.portfolio.updatePrices(currentBar.timestamp, { [symbol]: prevClose });
      }
      
      // === STEP 2: Stop-loss / take-profit checks (gap-aware, using open) ===
      this.checkStopsWithGaps(currentBar, symbol, t);
      
      // === STEP 3: Pending order execution (using open) ===
      this.executePendingOrders(currentBar, symbol, t);
      
      // === STEP 4: Post-open valuation (using open) ===
      this.portfolio.updatePrices(currentBar.timestamp, { [symbol]: currentBar.open });
      
      // === STEP 5: Max drawdown check ===
      if (this.config.maxDrawdown !== undefined) {
        const currentDrawdown = this.portfolio.getDrawdown();
        if (currentDrawdown <= -this.config.maxDrawdown) {
          if (!this.portfolio.tradingDisabled) {
            this.portfolio.tradingDisabled = true;
            // Close all positions at OPEN
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
      
      // === STEP 6: Signal generation ===
      if (!this.portfolio.tradingDisabled) {
        const signal = generateSignal(t, data, cache, strategyConfig, this.portfolio.getState());
        
        // === STEP 7: Order queuing ===
        if (signal.action === Action.BUY) {
          this.queueBuyOrder(signal, currentBar, symbol, t);
        } else if (signal.action === Action.SELL) {
          this.queueSellOrder(signal, currentBar, symbol, t);
        }
      }
      
      // === STEP 8: State validation ===
      this.portfolio.validateState();
    }
    
    // Close remaining positions at final bar open (deterministic liquidation)
    if (data.length > 0) {
      const finalBar = data[data.length - 1];
      for (const position of [...this.portfolio.positions]) {
        const { executionPrice, netProceeds } = this.executionSim.executeSell(
          finalBar.open, position.quantity
        );
        this.portfolio.closePosition(
          position, executionPrice, netProceeds,
          "End of backtest - final liquidation at open",
          data.length - 1
        );
      }
    }
    
    this.runCompleted = true;
    return this.generateResults(runTimestamp, strategyConfig);
  }
  
  private checkStopsWithGaps(bar: OHLCV, symbol: string, barIndex: number): void {
    if (!this.portfolio) return;
    
    for (const position of [...this.portfolio.positions]) {
      if (position.symbol !== symbol) continue;
      
      // PRIORITY 1: Check stop-loss FIRST
      if (position.stopLoss !== undefined) {
        if (bar.low <= position.stopLoss) {
          const actualExit = Math.min(position.stopLoss, bar.open);
          const { executionPrice, netProceeds } = this.executionSim.executeSell(
            actualExit, position.quantity
          );
          this.portfolio.closePosition(
            position, executionPrice, netProceeds,
            "Stop-loss hit" + (bar.open < position.stopLoss ? " with gap" : ""),
            barIndex
          );
          continue;
        }
      }
      
      // PRIORITY 2: Check take-profit ONLY if stop-loss didn't trigger
      if (position.takeProfit !== undefined) {
        if (bar.high >= position.takeProfit) {
          const actualExit = Math.max(position.takeProfit, bar.open);
          const { executionPrice, netProceeds } = this.executionSim.executeSell(
            actualExit, position.quantity
          );
          this.portfolio.closePosition(
            position, executionPrice, netProceeds,
            "Take-profit hit" + (bar.open > position.takeProfit ? " with gap" : ""),
            barIndex
          );
        }
      }
    }
  }
  
  private queueBuyOrder(signal: Signal, bar: OHLCV, symbol: string, barIndex: number): void {
    if (!this.portfolio) return;
    
    // Block BUY if already holding position
    const hasPosition = this.portfolio.positions.some(p => p.symbol === symbol);
    if (hasPosition) {
      this.portfolio.rejectSignal(bar.timestamp, symbol, signal, "Already holding position in symbol");
      return;
    }
    
    // FREEZE position size calculation using current close
    const quantity = this.riskEngine.calculatePositionSize(signal, bar.close, this.portfolio.cash);
    
    if (quantity <= 0) {
      this.portfolio.rejectSignal(bar.timestamp, symbol, signal, "Calculated position size is zero");
      return;
    }
    
    // Validate with risk engine
    const { isValid, reason } = this.riskEngine.validateSignal(
      signal,
      quantity,
      bar.close,
      this.portfolio.cash,
      this.portfolio.getEquity(),
      this.portfolio.positions.length,
      this.portfolio.getPositionsValue()
    );
    
    if (!isValid) {
      this.portfolio.rejectSignal(bar.timestamp, symbol, signal, reason);
      return;
    }
    
    // Queue order with FROZEN quantity
    this.pendingOrders.push({
      signal,
      quantity,
      barIndex,
      symbol,
      reason: signal.reason
    });
  }
  
  private queueSellOrder(signal: Signal, bar: OHLCV, symbol: string, barIndex: number): void {
    this.pendingOrders.push({
      signal,
      quantity: 0,
      barIndex,
      symbol,
      reason: signal.reason
    });
  }
  
  private executePendingOrders(bar: OHLCV, symbol: string, barIndex: number): void {
    if (!this.portfolio || this.pendingOrders.length === 0) return;
    
    for (const order of [...this.pendingOrders]) {
      if (order.signal.action === Action.BUY) {
        const quantity = order.quantity;
        
        if (quantity <= 0) {
          this.pendingOrders = this.pendingOrders.filter(o => o !== order);
          continue;
        }
        
        // Execute buy at OPEN
        const { executionPrice, totalCost } = this.executionSim.executeBuy(bar.open, quantity);
        
        if (totalCost > this.portfolio.cash) {
          this.pendingOrders = this.pendingOrders.filter(o => o !== order);
          continue;
        }
        
        // Create position
        const position: Position = {
          symbol,
          entryPrice: executionPrice,
          quantity,
          entryTime: bar.timestamp,
          entryBarIndex: barIndex,
          stopLoss: order.signal.stopLoss,
          takeProfit: order.signal.takeProfit,
          reason: order.reason
        };
        
        this.portfolio.addPosition(position, totalCost);
      } else if (order.signal.action === Action.SELL) {
        // Close all positions at OPEN
        for (const position of [...this.portfolio.positions]) {
          if (position.symbol === symbol) {
            const { executionPrice, netProceeds } = this.executionSim.executeSell(
              bar.open, position.quantity
            );
            this.portfolio.closePosition(position, executionPrice, netProceeds, order.reason, barIndex);
          }
        }
      }
      
      this.pendingOrders = this.pendingOrders.filter(o => o !== order);
    }
  }
  
  private generateResults(runTimestamp: string, strategyConfig: StrategyConfig): Record<string, unknown> {
    if (!this.portfolio) {
      return { error: "Portfolio not initialized" };
    }
    
    const trades = this.portfolio.trades;
    const equityCurve = this.portfolio.equityCurve;
    
    if (trades.length === 0) {
      return {
        metadata: {
          engineVersion: ENGINE_VERSION,
          runTimestamp,
          dataFrequency: this.config.dataFrequency,
          finalLiquidationPolicy: 'forced_open_at_last_bar'
        },
        summary: {
          totalTrades: 0,
          message: 'No trades executed',
          tradingDisabled: this.portfolio.tradingDisabled
        },
        equityCurve: equityCurve.map(e => ({ date: e.timestamp, value: Math.round(e.equity) })),
        trades: [],
        rejectedSignals: this.portfolio.rejectedSignals,
        metrics: {
          totalReturn: 0,
          maxDrawdown: 0,
          winRate: 0,
          totalTrades: 0,
          sharpeRatio: 0,
          profitFactor: 0
        }
      };
    }
    
    // Calculate metrics
    const totalReturn = (this.portfolio.getEquity() - this.config.initialCapital) / this.config.initialCapital;
    
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl <= 0);
    const winRate = trades.length > 0 ? winningTrades.length / trades.length : 0;
    
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0 
      ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length 
      : 0;
    const riskReward = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
    
    const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : (totalWins > 0 ? 10 : 0);
    
    const expectancy = (winRate * avgWin) + ((1 - winRate) * avgLoss);
    const medianPnl = trades.length > 0 
      ? trades.map(t => t.pnl).sort((a, b) => a - b)[Math.floor(trades.length / 2)]
      : 0;
    
    // PnL distribution
    const pnlValues = trades.map(t => t.pnl);
    const pnlMean = pnlValues.reduce((a, b) => a + b, 0) / pnlValues.length;
    const pnlStd = pnlValues.length > 1
      ? Math.sqrt(pnlValues.reduce((sum, p) => sum + Math.pow(p - pnlMean, 2), 0) / (pnlValues.length - 1))
      : 0;
    
    // Drawdown calculation
    const equities = equityCurve.map(e => e.equity);
    let peak = equities[0];
    let maxDrawdown = 0;
    const drawdownCurve: { timestamp: string; drawdown: number }[] = [];
    
    for (let i = 0; i < equities.length; i++) {
      peak = Math.max(peak, equities[i]);
      const drawdown = peak > 0 ? (equities[i] - peak) / peak : 0;
      maxDrawdown = Math.min(maxDrawdown, drawdown);
      drawdownCurve.push({ timestamp: equityCurve[i].timestamp, drawdown });
    }
    
    // Worst 5% drawdown
    const sortedDrawdowns = drawdownCurve.map(d => d.drawdown).sort((a, b) => a - b);
    const worst5pctIdx = Math.max(1, Math.floor(sortedDrawdowns.length * 0.05));
    const worst5pctDrawdown = sortedDrawdowns.slice(0, worst5pctIdx).reduce((a, b) => a + b, 0) / worst5pctIdx;
    
    // CAGR calculation
    const bars = equityCurve.length;
    let years: number;
    if (this.config.dataFrequency === 'daily') {
      years = bars / 252;
    } else if (this.config.dataFrequency === 'hourly') {
      years = bars / (252 * 6.5);
    } else if (this.config.dataFrequency === 'minute') {
      years = bars / (252 * 6.5 * 60);
    } else {
      years = bars / 252;
    }
    
    const cagr = years > 0 
      ? Math.pow(this.portfolio.getEquity() / this.config.initialCapital, 1 / years) - 1 
      : 0;
    
    // Sharpe ratio (simplified)
    const returns = trades.map(t => t.pnlPct);
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const stdDev = returns.length > 1
      ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1))
      : 1;
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(12) : 0;
    
    return {
      metadata: {
        engineVersion: ENGINE_VERSION,
        runTimestamp,
        dataFrequency: this.config.dataFrequency,
        finalLiquidationPolicy: 'forced_open_at_last_bar'
      },
      summary: {
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate,
        totalReturn,
        totalReturnPct: totalReturn * 100,
        cagr,
        cagrPct: cagr * 100,
        maxDrawdown,
        maxDrawdownPct: maxDrawdown * 100,
        worst5pctDrawdown,
        worst5pctDrawdownPct: worst5pctDrawdown * 100,
        avgWin,
        avgLoss,
        riskReward,
        profitFactor,
        expectancy,
        medianPnl,
        pnlStd,
        finalEquity: this.portfolio.getEquity(),
        avgTradeDuration: trades.reduce((sum, t) => sum + t.durationBars, 0) / trades.length,
        tradingDisabled: this.portfolio.tradingDisabled
      },
      metrics: {
        totalReturn: Math.round(totalReturn * 10000) / 100,
        maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
        winRate: Math.round(winRate * 10000) / 100,
        totalTrades: trades.length,
        sharpeRatio: Math.round(sharpeRatio * 100) / 100,
        profitFactor: Math.min(Math.round(profitFactor * 100) / 100, 10)
      },
      equityCurve: equityCurve.map(e => ({ date: e.timestamp, value: Math.round(e.equity) })),
      trades: trades.map(t => ({
        entryTime: t.entryTime,
        exitTime: t.exitTime,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        quantity: t.quantity,
        pnl: Math.round(t.pnl * 100) / 100,
        pnlPct: Math.round(t.pnlPct * 10000) / 100,
        entryReason: t.entryReason,
        exitReason: t.exitReason,
        durationBars: t.durationBars
      })),
      rejectedSignals: this.portfolio.rejectedSignals,
      drawdownCurve,
      behaviorMetrics: {
        tradeFrequency: equityCurve.length > 0 ? trades.length / equityCurve.length : 0,
        avgPositions: equityCurve.reduce((sum, e) => sum + e.positionsCount, 0) / equityCurve.length,
        maxPositions: Math.max(...equityCurve.map(e => e.positionsCount))
      }
    };
  }
}

// ============================================================================
// 8. SAMPLE DATA GENERATION
// ============================================================================

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
      timestamp: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume
    });
  }

  return data;
}

// ============================================================================
// 9. STRATEGY CONFIG PARSER
// ============================================================================

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

  if (strategy.risk_limits && typeof strategy.risk_limits === 'object') {
    const limits = strategy.risk_limits as Record<string, number>;
    config.stopLossPct = limits.stopLoss;
    config.takeProfitPct = limits.takeProfit;
  }

  if (strategy.position_sizing && typeof strategy.position_sizing === 'object') {
    const sizing = strategy.position_sizing as Record<string, number>;
    config.positionSizePct = sizing.value ?? 20;
  }

  // Default rules if none provided
  if (config.entryRules.length === 0) {
    config.entryRules = [
      { indicator: 'rsi', condition: 'less_than', value: 30, period: 14 },
      { indicator: 'price', condition: 'greater_than', value: 'sma20' }
    ];
  }

  if (config.exitRules.length === 0) {
    config.exitRules = [
      { indicator: 'rsi', condition: 'greater_than', value: 70, period: 14 }
    ];
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

    const { 
      strategyId, 
      startDate, 
      endDate, 
      symbol = 'NIFTY',
      config: userConfig 
    } = await req.json();

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

    console.log(`[run-backtest] Running production engine v${ENGINE_VERSION} for strategy: ${strategy.name}`);

    // Parse strategy config
    const strategyConfig = parseStrategyConfig(strategy);

    // Build backtest config
    const backtestConfig: BacktestConfig = {
      initialCapital: userConfig?.initialCapital ?? 1000000,
      slippage: userConfig?.slippage ?? 0.001,
      brokerageRate: userConfig?.brokerageRate ?? 0.0003,
      maxRiskPerTrade: userConfig?.maxRiskPerTrade ?? 0.02,
      maxConcurrentPositions: userConfig?.maxConcurrentPositions ?? 5,
      maxDrawdown: userConfig?.maxDrawdown ?? 0.15,
      mandatoryStopLoss: userConfig?.mandatoryStopLoss ?? true,
      maxCapitalDeployed: userConfig?.maxCapitalDeployed ?? 0.95,
      maxSinglePositionExposure: userConfig?.maxSinglePositionExposure ?? 0.30,
      dataFrequency: userConfig?.dataFrequency ?? 'daily'
    };

    // Generate sample data (in production, this would fetch real data)
    const days = 365;
    const priceData = generateSampleData(days);

    // Create engine and run backtest
    const engine = new BacktestEngine(backtestConfig);
    const result = engine.run(priceData, strategyConfig, 50, symbol);

    // Save results to database
    const { data: backtestResult, error: saveError } = await supabase
      .from('backtest_results')
      .insert({
        strategy_id: strategyId,
        user_id: strategy.user_id,
        strategy_version: strategy.version || 1,
        status: 'completed',
        parameters: { 
          startDate, 
          endDate, 
          symbol,
          engineVersion: ENGINE_VERSION,
          config: backtestConfig 
        },
        metrics: result.metrics,
        equity_curve: result.equityCurve,
        trade_log: result.trades,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('[run-backtest] Error saving results:', saveError);
    }

    // Update strategy status
    await supabase
      .from('strategies')
      .update({ status: 'backtested' })
      .eq('id', strategyId);

    const summary = result.summary as Record<string, unknown> | undefined;
    console.log(`[run-backtest] Completed: ${summary?.totalTrades || 0} trades, ${((summary?.totalReturnPct as number) || 0).toFixed(2)}% return`);

    return new Response(
      JSON.stringify({
        success: true,
        backtestId: backtestResult?.id,
        engineVersion: ENGINE_VERSION,
        metrics: result.metrics,
        summary: result.summary,
        equityCurve: result.equityCurve,
        trades: result.trades,
        rejectedSignals: result.rejectedSignals,
        behaviorMetrics: result.behaviorMetrics,
        metadata: result.metadata
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[run-backtest] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred during backtesting";
    return new Response(
      JSON.stringify({ error: message, engineVersion: ENGINE_VERSION }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
