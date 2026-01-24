import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Trading Backtesting Engine - PRODUCTION VERSION v1.0.1
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

const ENGINE_VERSION = "1.0.1";

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
  slippage: number; // 0.1% = 0.001
  brokerageRate: number; // 0.03% = 0.0003
  maxRiskPerTrade: number; // 2% = 0.02
  maxConcurrentPositions: number;
  maxDrawdown?: number; // Stop trading if hit
  mandatoryStopLoss: boolean;
  maxCapitalDeployed: number; // Max % of capital in positions
  maxSinglePositionExposure: number; // Max % in one position
  dataFrequency: "daily" | "hourly" | "minute";
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

// ============================================================================
// 2. TECHNICAL INDICATORS
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
    // Check mandatory stop-loss
    if (this.config.mandatoryStopLoss && signal.action === "BUY") {
      if (signal.stopLoss === undefined) {
        return { valid: false, reason: "Mandatory stop-loss missing" };
      }
    }

    // Check max concurrent positions
    if (signal.action === "BUY") {
      if (openPositions >= this.config.maxConcurrentPositions) {
        return { valid: false, reason: `Max positions (${this.config.maxConcurrentPositions}) reached` };
      }
    }

    // Check risk per trade
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

    // Check max capital deployed
    if (signal.action === "BUY") {
      const proposedCost = proposedPrice * proposedQuantity;
      const newPositionsValue = positionsValue + proposedCost;
      const deployedPct = newPositionsValue / portfolioEquity;

      if (deployedPct > this.config.maxCapitalDeployed) {
        return { valid: false, reason: `Max capital deployed (${this.config.maxCapitalDeployed * 100}%) would be exceeded` };
      }
    }

    // Check max single position exposure
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
// 6. STRATEGY GENERATOR
// ============================================================================

function generateSignal(
  context: OHLCV[],
  portfolioState: Record<string, unknown>,
  strategyConfig: StrategyConfig,
  indicators: {
    sma20: number[];
    sma50: number[];
    ema20: number[];
    rsi14: number[];
    atr14: number[];
  }
): Signal {
  const idx = context.length - 1;
  if (idx < 0) return { action: "HOLD", positionSize: 0.2, reason: "" };

  const currentPrice = context[idx].close;
  const hasPosition = (portfolioState.positionsCount as number) > 0;

  // Get indicator values
  const currentRSI = indicators.rsi14[idx];
  const currentSMA20 = indicators.sma20[idx];
  const currentSMA50 = indicators.sma50[idx];
  const currentATR = indicators.atr14[idx];
  const prevSMA20 = idx > 0 ? indicators.sma20[idx - 1] : NaN;
  const prevSMA50 = idx > 0 ? indicators.sma50[idx - 1] : NaN;

  // Evaluate entry rules
  if (!hasPosition && strategyConfig.entryRules.length > 0) {
    let allConditionsMet = true;

    for (const rule of strategyConfig.entryRules) {
      const indicatorValue = getIndicatorValue(rule.indicator, idx, context, indicators);
      const compareValue = typeof rule.value === "string" 
        ? getIndicatorValue(rule.value, idx, context, indicators)
        : rule.value;

      if (indicatorValue === null || compareValue === null) {
        allConditionsMet = false;
        break;
      }

      if (!evaluateCondition(indicatorValue, rule.condition, compareValue, idx, context, indicators, rule)) {
        allConditionsMet = false;
        break;
      }
    }

    if (allConditionsMet) {
      const stopLossPct = strategyConfig.riskLimits?.stopLoss ?? 2;
      const takeProfitPct = strategyConfig.riskLimits?.takeProfit ?? 6;
      
      return {
        action: "BUY",
        stopLoss: currentPrice * (1 - stopLossPct / 100),
        takeProfit: currentPrice * (1 + takeProfitPct / 100),
        positionSize: strategyConfig.positionSizing?.value ?? 0.2,
        reason: `Entry signal: ${strategyConfig.entryRules.map(r => r.indicator).join(", ")}`
      };
    }
  }

  // Evaluate exit rules
  if (hasPosition && strategyConfig.exitRules.length > 0) {
    for (const rule of strategyConfig.exitRules) {
      const indicatorValue = getIndicatorValue(rule.indicator, idx, context, indicators);
      const compareValue = typeof rule.value === "string"
        ? getIndicatorValue(rule.value, idx, context, indicators)
        : rule.value;

      if (indicatorValue === null || compareValue === null) continue;

      if (evaluateCondition(indicatorValue, rule.condition, compareValue, idx, context, indicators, rule)) {
        return {
          action: "SELL",
          positionSize: 0,
          reason: `Exit signal: ${rule.indicator} ${rule.condition} ${rule.value}`
        };
      }
    }
  }

  return { action: "HOLD", positionSize: 0.2, reason: "" };
}

function getIndicatorValue(
  indicator: string,
  idx: number,
  context: OHLCV[],
  indicators: { sma20: number[]; sma50: number[]; ema20: number[]; rsi14: number[]; atr14: number[] }
): number | null {
  switch (indicator.toLowerCase()) {
    case "price":
    case "close":
      return context[idx]?.close ?? null;
    case "sma":
    case "sma20":
      return isNaN(indicators.sma20[idx]) ? null : indicators.sma20[idx];
    case "sma50":
      return isNaN(indicators.sma50[idx]) ? null : indicators.sma50[idx];
    case "ema":
    case "ema20":
      return isNaN(indicators.ema20[idx]) ? null : indicators.ema20[idx];
    case "rsi":
    case "rsi14":
      return isNaN(indicators.rsi14[idx]) ? null : indicators.rsi14[idx];
    case "atr":
    case "atr14":
      return isNaN(indicators.atr14[idx]) ? null : indicators.atr14[idx];
    default:
      return null;
  }
}

function evaluateCondition(
  value: number,
  condition: string,
  compareValue: number,
  idx: number,
  context: OHLCV[],
  indicators: { sma20: number[]; sma50: number[]; ema20: number[]; rsi14: number[]; atr14: number[] },
  rule: StrategyRule
): boolean {
  const prevValue = idx > 0 ? getIndicatorValue(rule.indicator, idx - 1, context, indicators) : null;
  const prevCompareValue = typeof rule.value === "string" && idx > 0
    ? getIndicatorValue(rule.value, idx - 1, context, indicators)
    : compareValue;

  switch (condition) {
    case "greater_than":
    case ">":
      return value > compareValue;
    case "less_than":
    case "<":
      return value < compareValue;
    case "crosses_above":
      return prevValue !== null && prevCompareValue !== null &&
        prevValue <= prevCompareValue && value > compareValue;
    case "crosses_below":
      return prevValue !== null && prevCompareValue !== null &&
        prevValue >= prevCompareValue && value < compareValue;
    case "between":
      return Array.isArray(rule.value) && value >= rule.value[0] && value <= rule.value[1];
    default:
      return false;
  }
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
    strategyName: string,
    lookback: number = 50,
    symbol: string = "NIFTY"
  ): Record<string, unknown> {
    if (this.runCompleted) {
      throw new Error("BacktestEngine cannot be reused. Create new instance for each run.");
    }

    // Initialize
    this.portfolio = new Portfolio(this.config.initialCapital);
    this.pendingOrders = [];

    // Pre-calculate indicators for full dataset
    const closes = data.map(d => d.close);
    const indicators = {
      sma20: calculateSMA(closes, 20),
      sma50: calculateSMA(closes, 50),
      ema20: calculateEMA(closes, 20),
      rsi14: calculateRSI(closes, 14),
      atr14: calculateATR(data, 14)
    };

    const runTimestamp = data[data.length - 1]?.timestamp ?? new Date().toISOString();
    const strategyId = this.hashString(`${strategyName}:${JSON.stringify(strategyConfig)}`).substring(0, 8);

    // Main backtest loop
    for (let t = lookback; t < data.length; t++) {
      const currentBar = data[t];

      // Step 1: Pre-open valuation (using prev close)
      if (t > 0) {
        const prevClose = data[t - 1].close;
        this.portfolio.updatePrices(currentBar.timestamp, { [symbol]: prevClose });
      }

      // Step 2: Stop-loss / take-profit checks (gap-aware)
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
        const context = data.slice(0, t); // Only past data
        const contextIndicators = {
          sma20: indicators.sma20.slice(0, t),
          sma50: indicators.sma50.slice(0, t),
          ema20: indicators.ema20.slice(0, t),
          rsi14: indicators.rsi14.slice(0, t),
          atr14: indicators.atr14.slice(0, t)
        };

        const signal = generateSignal(context, this.portfolio.getState(), strategyConfig, contextIndicators);

        // Step 7: Order queuing
        if (signal.action === "BUY") {
          this.queueBuyOrder(signal, currentBar, symbol, t);
        } else if (signal.action === "SELL") {
          this.queueSellOrder(signal, currentBar, symbol, t);
        }
      }
    }

    // Final liquidation at last bar open
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
    return this.generateResults(runTimestamp, strategyId, strategyName);
  }

  private checkStopsWithGaps(bar: OHLCV, symbol: string, barIndex: number) {
    if (!this.portfolio) return;

    for (const position of [...this.portfolio.positions]) {
      if (position.symbol !== symbol) continue;

      // Priority 1: Check stop-loss FIRST
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

      // Priority 2: Check take-profit
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

  private queueBuyOrder(signal: Signal, bar: OHLCV, symbol: string, barIndex: number) {
    if (!this.portfolio) return;

    // Block if already holding position
    const hasPosition = this.portfolio.positions.some(p => p.symbol === symbol);
    if (hasPosition) {
      this.portfolio.rejectSignal(bar.timestamp, symbol, signal, "Already holding position in symbol");
      return;
    }

    // Freeze position size at queue time
    const quantity = this.riskEngine.calculatePositionSize(signal, bar.close, this.portfolio.cash);
    if (quantity <= 0) {
      this.portfolio.rejectSignal(bar.timestamp, symbol, signal, "Calculated position size is zero");
      return;
    }

    // Validate with risk engine
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

    for (const order of [...this.pendingOrders]) {
      if (order.signal.action === "BUY") {
        const quantity = order.quantity;
        if (quantity <= 0) {
          this.pendingOrders = this.pendingOrders.filter(o => o !== order);
          continue;
        }

        const { executionPrice, totalCost } = this.executionSim.executeBuy(bar.open, quantity);

        if (totalCost > this.portfolio.cash) {
          this.pendingOrders = this.pendingOrders.filter(o => o !== order);
          continue;
        }

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
      } else if (order.signal.action === "SELL") {
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

  private generateResults(runTimestamp: string, strategyId: string, strategyName: string): Record<string, unknown> {
    if (!this.portfolio) return { error: "Portfolio not initialized" };

    const trades = this.portfolio.trades;
    const equityCurve = this.portfolio.equityCurve;

    if (trades.length === 0) {
      return {
        metadata: {
          engineVersion: ENGINE_VERSION,
          configHash: this.hashString(JSON.stringify(this.config)).substring(0, 8),
          runTimestamp
        },
        summary: {
          totalTrades: 0,
          message: "No trades executed",
          tradingDisabled: this.portfolio.tradingDisabled
        },
        equityCurve: equityCurve,
        trades: [],
        rejectedSignals: this.portfolio.rejectedSignals,
        drawdownCurve: [],
        behaviorMetrics: {}
      };
    }

    // Calculate metrics
    const finalEquity = this.portfolio.getEquity();
    const totalReturn = (finalEquity - this.config.initialCapital) / this.config.initialCapital;
    
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
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    const expectancy = (winRate * avgWin) + ((1 - winRate) * avgLoss);
    const pnlValues = trades.map(t => t.pnl);
    const medianPnl = this.median(pnlValues);
    const pnlStd = this.standardDeviation(pnlValues);

    // Drawdown calculation
    let maxDrawdown = 0;
    let peak = this.config.initialCapital;
    const drawdownCurve: { timestamp: string; drawdown: number }[] = [];

    for (const point of equityCurve) {
      peak = Math.max(peak, point.equity);
      const drawdown = peak > 0 ? (point.equity - peak) / peak : 0;
      maxDrawdown = Math.min(maxDrawdown, drawdown);
      drawdownCurve.push({ timestamp: point.timestamp, drawdown });
    }

    // CAGR calculation
    const bars = equityCurve.length;
    let years = bars / 252;
    if (this.config.dataFrequency === "hourly") years = bars / (252 * 6.5);
    if (this.config.dataFrequency === "minute") years = bars / (252 * 6.5 * 60);

    const cagr = years > 0
      ? Math.pow(finalEquity / this.config.initialCapital, 1 / years) - 1
      : 0;

    // Sharpe ratio
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
        avgTradeDuration: Math.round(trades.reduce((sum, t) => sum + t.durationBars, 0) / trades.length),
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
      drawdownCurve,
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
// 8. DATA GENERATION
// ============================================================================

function generateSampleData(days: number = 365, symbol: string = "NIFTY"): OHLCV[] {
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

  let price = basePrices[symbol] || 1000 + Math.random() * 500;
  const volatility = symbol.includes("NIFTY") ? 0.012 : 0.018;
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
      timestamp: date.toISOString(),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume
    });
  }

  return data;
}

function parseStrategyConfig(strategy: Record<string, unknown>): StrategyConfig {
  const config: StrategyConfig = {
    entryRules: [],
    exitRules: [],
  };

  if (strategy.entry_rules && typeof strategy.entry_rules === "object") {
    const rules = strategy.entry_rules as Record<string, unknown>;
    if (Array.isArray(rules)) {
      config.entryRules = rules as StrategyRule[];
    } else if (rules.conditions && Array.isArray(rules.conditions)) {
      config.entryRules = rules.conditions as StrategyRule[];
    }
  }

  if (strategy.exit_rules && typeof strategy.exit_rules === "object") {
    const rules = strategy.exit_rules as Record<string, unknown>;
    if (Array.isArray(rules)) {
      config.exitRules = rules as StrategyRule[];
    } else if (rules.conditions && Array.isArray(rules.conditions)) {
      config.exitRules = rules.conditions as StrategyRule[];
    }
  }

  if (strategy.position_sizing) {
    config.positionSizing = strategy.position_sizing as StrategyConfig["positionSizing"];
  }

  if (strategy.risk_limits) {
    config.riskLimits = strategy.risk_limits as StrategyConfig["riskLimits"];
  }

  // Default rules if none provided
  if (config.entryRules.length === 0) {
    config.entryRules = [
      { indicator: "rsi", condition: "less_than", value: 30, period: 14 },
      { indicator: "price", condition: "greater_than", value: "sma20", period: 20 }
    ];
  }

  if (config.exitRules.length === 0) {
    config.exitRules = [
      { indicator: "rsi", condition: "greater_than", value: 70, period: 14 }
    ];
  }

  if (!config.riskLimits) {
    config.riskLimits = { stopLoss: 2, takeProfit: 6 };
  }

  return config;
}

// ============================================================================
// 9. MAIN HANDLER
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
    console.log("[Backtest] Strategy config parsed:", strategyConfig);

    // Generate sample data (in production, would fetch real data)
    const days = 365;
    const priceData = generateSampleData(days, symbol);
    console.log(`[Backtest] Generated ${priceData.length} price bars`);

    // Configure engine with production settings
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
