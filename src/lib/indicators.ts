// Technical Indicators Library for Trading Strategies

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Simple Moving Average
export function calculateSMA(prices: number[], period: number): number[] {
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
export function calculateEMA(prices: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      result.push(prices[0]);
    } else if (i < period - 1) {
      // Use SMA for initial values
      const sum = prices.slice(0, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / (i + 1));
    } else if (i === period - 1) {
      // First EMA is SMA
      const sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    } else {
      const ema = (prices[i] - result[i - 1]) * multiplier + result[i - 1];
      result.push(ema);
    }
  }
  
  return result;
}

// Relative Strength Index
export function calculateRSI(prices: number[], period: number = 14): number[] {
  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate gains and losses
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // First value is NaN
  result.push(NaN);
  
  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else if (i === period - 1) {
      // First RSI using SMA
      const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    } else {
      // Smoothed RSI
      const prevRSI = result[result.length - 1];
      const prevAvgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const prevAvgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      
      const avgGain = (prevAvgGain * (period - 1) + gains[i]) / period;
      const avgLoss = (prevAvgLoss * (period - 1) + losses[i]) / period;
      
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

// MACD (Moving Average Convergence Divergence)
export interface MACDResult {
  macd: number[];
  signal: number[];
  histogram: number[];
}

export function calculateMACD(
  prices: number[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): MACDResult {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  // MACD Line = Fast EMA - Slow EMA
  const macd = fastEMA.map((fast, i) => fast - slowEMA[i]);
  
  // Signal Line = EMA of MACD
  const signal = calculateEMA(macd.filter(v => !isNaN(v)), signalPeriod);
  
  // Pad signal array to match length
  const paddedSignal: number[] = [];
  let signalIndex = 0;
  for (let i = 0; i < macd.length; i++) {
    if (isNaN(macd[i]) || signalIndex >= signal.length) {
      paddedSignal.push(NaN);
    } else {
      paddedSignal.push(signal[signalIndex++]);
    }
  }
  
  // Histogram = MACD - Signal
  const histogram = macd.map((m, i) => m - paddedSignal[i]);
  
  return { macd, signal: paddedSignal, histogram };
}

// Bollinger Bands
export interface BollingerBands {
  upper: number[];
  middle: number[];
  lower: number[];
}

export function calculateBollingerBands(
  prices: number[], 
  period: number = 20, 
  stdDev: number = 2
): BollingerBands {
  const middle = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = middle[i];
      const squaredDiffs = slice.map(p => Math.pow(p - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      const std = Math.sqrt(variance);
      
      upper.push(mean + std * stdDev);
      lower.push(mean - std * stdDev);
    }
  }
  
  return { upper, middle, lower };
}

// ATR (Average True Range)
export function calculateATR(data: OHLCV[], period: number = 14): number[] {
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

// Stochastic Oscillator
export interface StochasticResult {
  k: number[];
  d: number[];
}

export function calculateStochastic(
  data: OHLCV[], 
  kPeriod: number = 14, 
  dPeriod: number = 3
): StochasticResult {
  const k: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < kPeriod - 1) {
      k.push(NaN);
    } else {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highest = Math.max(...slice.map(d => d.high));
      const lowest = Math.min(...slice.map(d => d.low));
      const current = data[i].close;
      
      if (highest === lowest) {
        k.push(50);
      } else {
        k.push(((current - lowest) / (highest - lowest)) * 100);
      }
    }
  }
  
  // %D is SMA of %K
  const d = calculateSMA(k.filter(v => !isNaN(v)), dPeriod);
  
  // Pad D to match length
  const paddedD: number[] = [];
  let dIndex = 0;
  for (let i = 0; i < k.length; i++) {
    if (isNaN(k[i]) || dIndex >= d.length) {
      paddedD.push(NaN);
    } else {
      paddedD.push(d[dIndex++]);
    }
  }
  
  return { k, d: paddedD };
}

// Volume Weighted Average Price (VWAP)
export function calculateVWAP(data: OHLCV[]): number[] {
  const result: number[] = [];
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  
  for (let i = 0; i < data.length; i++) {
    const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
    cumulativeTPV += typicalPrice * data[i].volume;
    cumulativeVolume += data[i].volume;
    
    result.push(cumulativeTPV / cumulativeVolume);
  }
  
  return result;
}

// On-Balance Volume (OBV)
export function calculateOBV(data: OHLCV[]): number[] {
  const result: number[] = [data[0]?.volume || 0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i].close > data[i - 1].close) {
      result.push(result[i - 1] + data[i].volume);
    } else if (data[i].close < data[i - 1].close) {
      result.push(result[i - 1] - data[i].volume);
    } else {
      result.push(result[i - 1]);
    }
  }
  
  return result;
}

// Get indicator value at a specific index
export function getIndicatorValue(values: number[], index: number): number | null {
  if (index < 0 || index >= values.length) return null;
  const value = values[index];
  return isNaN(value) ? null : value;
}
