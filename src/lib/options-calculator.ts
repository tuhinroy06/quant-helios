// Black-Scholes Option Pricing and Greeks Calculator

// Cumulative distribution function for standard normal distribution
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// Standard normal probability density function
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export interface OptionParams {
  S: number;  // Current stock price
  K: number;  // Strike price
  T: number;  // Time to expiration (in years)
  r: number;  // Risk-free interest rate (decimal)
  sigma: number;  // Volatility (decimal)
  optionType: 'call' | 'put';
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface OptionPricing extends Greeks {
  price: number;
  intrinsicValue: number;
  timeValue: number;
}

// Calculate d1 and d2 for Black-Scholes
function calculateD1D2(S: number, K: number, T: number, r: number, sigma: number): { d1: number; d2: number } {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return { d1, d2 };
}

// Black-Scholes option price
export function calculateOptionPrice(params: OptionParams): number {
  const { S, K, T, r, sigma, optionType } = params;
  
  if (T <= 0) {
    // At expiration
    return optionType === 'call' 
      ? Math.max(0, S - K) 
      : Math.max(0, K - S);
  }

  const { d1, d2 } = calculateD1D2(S, K, T, r, sigma);

  if (optionType === 'call') {
    return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  } else {
    return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
  }
}

// Calculate Delta
export function calculateDelta(params: OptionParams): number {
  const { S, K, T, r, sigma, optionType } = params;
  
  if (T <= 0) {
    if (optionType === 'call') {
      return S > K ? 1 : 0;
    } else {
      return S < K ? -1 : 0;
    }
  }

  const { d1 } = calculateD1D2(S, K, T, r, sigma);

  if (optionType === 'call') {
    return normalCDF(d1);
  } else {
    return normalCDF(d1) - 1;
  }
}

// Calculate Gamma (same for calls and puts)
export function calculateGamma(params: OptionParams): number {
  const { S, K, T, r, sigma } = params;
  
  if (T <= 0) return 0;

  const { d1 } = calculateD1D2(S, K, T, r, sigma);
  return normalPDF(d1) / (S * sigma * Math.sqrt(T));
}

// Calculate Theta (in terms of per day)
export function calculateTheta(params: OptionParams): number {
  const { S, K, T, r, sigma, optionType } = params;
  
  if (T <= 0) return 0;

  const { d1, d2 } = calculateD1D2(S, K, T, r, sigma);
  const sqrtT = Math.sqrt(T);

  const term1 = -(S * normalPDF(d1) * sigma) / (2 * sqrtT);

  if (optionType === 'call') {
    const term2 = r * K * Math.exp(-r * T) * normalCDF(d2);
    return (term1 - term2) / 365; // Per day
  } else {
    const term2 = r * K * Math.exp(-r * T) * normalCDF(-d2);
    return (term1 + term2) / 365; // Per day
  }
}

// Calculate Vega (per 1% change in volatility)
export function calculateVega(params: OptionParams): number {
  const { S, K, T, r, sigma } = params;
  
  if (T <= 0) return 0;

  const { d1 } = calculateD1D2(S, K, T, r, sigma);
  return (S * normalPDF(d1) * Math.sqrt(T)) / 100; // Per 1% change
}

// Calculate Rho (per 1% change in interest rate)
export function calculateRho(params: OptionParams): number {
  const { S, K, T, r, sigma, optionType } = params;
  
  if (T <= 0) return 0;

  const { d2 } = calculateD1D2(S, K, T, r, sigma);

  if (optionType === 'call') {
    return (K * T * Math.exp(-r * T) * normalCDF(d2)) / 100;
  } else {
    return (-K * T * Math.exp(-r * T) * normalCDF(-d2)) / 100;
  }
}

// Calculate all Greeks at once
export function calculateGreeks(params: OptionParams): Greeks {
  return {
    delta: calculateDelta(params),
    gamma: calculateGamma(params),
    theta: calculateTheta(params),
    vega: calculateVega(params),
    rho: calculateRho(params),
  };
}

// Calculate complete option pricing
export function calculateOptionPricing(params: OptionParams): OptionPricing {
  const price = calculateOptionPrice(params);
  const greeks = calculateGreeks(params);
  
  const intrinsicValue = params.optionType === 'call'
    ? Math.max(0, params.S - params.K)
    : Math.max(0, params.K - params.S);
  
  const timeValue = price - intrinsicValue;

  return {
    price,
    intrinsicValue,
    timeValue,
    ...greeks,
  };
}

// Generate payoff data for a range of prices
export interface PayoffPoint {
  price: number;
  payoff: number;
  netPayoff: number;
}

export interface OptionLeg {
  type: 'call' | 'put';
  strike: number;
  premium: number;
  quantity: number;  // Positive for buy, negative for sell
}

export function generatePayoffDiagram(
  legs: OptionLeg[],
  currentPrice: number,
  priceRange: number = 0.3  // 30% range
): PayoffPoint[] {
  const minPrice = currentPrice * (1 - priceRange);
  const maxPrice = currentPrice * (1 + priceRange);
  const step = (maxPrice - minPrice) / 100;
  
  const points: PayoffPoint[] = [];
  
  for (let price = minPrice; price <= maxPrice; price += step) {
    let totalNetPayoff = 0;
    let totalIntrinsic = 0;

    for (const leg of legs) {
      const { type, strike, premium, quantity } = leg;
      
      // Calculate intrinsic value at expiration
      let intrinsicValue: number;
      if (type === 'call') {
        intrinsicValue = Math.max(0, price - strike);
      } else {
        intrinsicValue = Math.max(0, strike - price);
      }
      
      // For long positions (quantity > 0): Pay premium, receive intrinsic
      // Net = intrinsic - premium
      // For short positions (quantity < 0): Receive premium, pay intrinsic
      // Net = premium - intrinsic
      if (quantity > 0) {
        // Long: pay premium, get intrinsic value
        totalNetPayoff += (intrinsicValue - premium) * quantity;
      } else {
        // Short: receive premium, pay out intrinsic value
        totalNetPayoff += (premium - intrinsicValue) * Math.abs(quantity);
      }
      
      totalIntrinsic += intrinsicValue * quantity;
    }

    points.push({
      price: Math.round(price * 100) / 100,
      payoff: totalIntrinsic,
      netPayoff: Math.round(totalNetPayoff * 100) / 100,
    });
  }

  return points;
}

// Calculate breakeven points
export function calculateBreakevens(legs: OptionLeg[], currentPrice: number): number[] {
  if (legs.length === 0) return [];
  
  // Use currentPrice to center the payoff diagram properly
  const centerPrice = currentPrice || legs[0].strike;
  
  // Calculate numerically from payoff - find where netPayoff crosses zero
  const payoff = generatePayoffDiagram(legs, centerPrice, 0.5);
  const breakevens: number[] = [];
  
  for (let i = 1; i < payoff.length; i++) {
    const prev = payoff[i - 1];
    const curr = payoff[i];
    
    // Check for zero crossing
    if ((prev.netPayoff < 0 && curr.netPayoff >= 0) || (prev.netPayoff >= 0 && curr.netPayoff < 0)) {
      // Linear interpolation to find exact crossing point
      const breakeven = prev.price + (0 - prev.netPayoff) * (curr.price - prev.price) / (curr.netPayoff - prev.netPayoff);
      breakevens.push(Math.round(breakeven * 100) / 100);
    }
  }

  return breakevens;
}

// Calculate max profit and loss
export function calculateMaxProfitLoss(legs: OptionLeg[], currentPrice: number): { maxProfit: number; maxLoss: number } {
  if (legs.length === 0) return { maxProfit: 0, maxLoss: 0 };
  
  const centerPrice = currentPrice || legs[0].strike;
  const payoff = generatePayoffDiagram(legs, centerPrice, 1);
  
  const netPayoffs = payoff.map(p => p.netPayoff);
  const maxProfit = Math.max(...netPayoffs);
  const maxLoss = Math.min(...netPayoffs);
  
  return {
    maxProfit: maxProfit === Infinity ? Infinity : Math.round(maxProfit * 100) / 100,
    maxLoss: maxLoss === -Infinity ? -Infinity : Math.round(maxLoss * 100) / 100,
  };
}

// Pre-built strategy templates
export type StrategyTemplate = 
  | 'long_call'
  | 'long_put'
  | 'covered_call'
  | 'protective_put'
  | 'bull_call_spread'
  | 'bear_put_spread'
  | 'straddle'
  | 'strangle'
  | 'iron_condor'
  | 'butterfly';

export function getStrategyLegs(
  template: StrategyTemplate,
  currentPrice: number,
  premium: number = 5
): OptionLeg[] {
  switch (template) {
    case 'long_call':
      return [{ type: 'call', strike: currentPrice, premium, quantity: 1 }];
    
    case 'long_put':
      return [{ type: 'put', strike: currentPrice, premium, quantity: 1 }];
    
    case 'covered_call':
      return [{ type: 'call', strike: currentPrice * 1.05, premium, quantity: -1 }];
    
    case 'protective_put':
      return [{ type: 'put', strike: currentPrice * 0.95, premium, quantity: 1 }];
    
    case 'bull_call_spread':
      return [
        { type: 'call', strike: currentPrice, premium: premium * 1.5, quantity: 1 },
        { type: 'call', strike: currentPrice * 1.1, premium: premium * 0.7, quantity: -1 },
      ];
    
    case 'bear_put_spread':
      return [
        { type: 'put', strike: currentPrice, premium: premium * 1.5, quantity: 1 },
        { type: 'put', strike: currentPrice * 0.9, premium: premium * 0.7, quantity: -1 },
      ];
    
    case 'straddle':
      return [
        { type: 'call', strike: currentPrice, premium, quantity: 1 },
        { type: 'put', strike: currentPrice, premium, quantity: 1 },
      ];
    
    case 'strangle':
      return [
        { type: 'call', strike: currentPrice * 1.05, premium: premium * 0.8, quantity: 1 },
        { type: 'put', strike: currentPrice * 0.95, premium: premium * 0.8, quantity: 1 },
      ];
    
    case 'iron_condor':
      return [
        { type: 'put', strike: currentPrice * 0.9, premium: premium * 0.5, quantity: 1 },
        { type: 'put', strike: currentPrice * 0.95, premium: premium * 0.8, quantity: -1 },
        { type: 'call', strike: currentPrice * 1.05, premium: premium * 0.8, quantity: -1 },
        { type: 'call', strike: currentPrice * 1.1, premium: premium * 0.5, quantity: 1 },
      ];
    
    case 'butterfly':
      return [
        { type: 'call', strike: currentPrice * 0.95, premium: premium * 1.5, quantity: 1 },
        { type: 'call', strike: currentPrice, premium: premium, quantity: -2 },
        { type: 'call', strike: currentPrice * 1.05, premium: premium * 0.5, quantity: 1 },
      ];
    
    default:
      return [];
  }
}

export const STRATEGY_DESCRIPTIONS: Record<StrategyTemplate, { name: string; description: string; outlook: string }> = {
  long_call: {
    name: 'Long Call',
    description: 'Buy a call option to profit from price increase',
    outlook: 'Bullish',
  },
  long_put: {
    name: 'Long Put',
    description: 'Buy a put option to profit from price decrease',
    outlook: 'Bearish',
  },
  covered_call: {
    name: 'Covered Call',
    description: 'Sell a call while owning the stock to generate income',
    outlook: 'Neutral to Slightly Bullish',
  },
  protective_put: {
    name: 'Protective Put',
    description: 'Buy a put to protect an existing stock position',
    outlook: 'Bullish with Protection',
  },
  bull_call_spread: {
    name: 'Bull Call Spread',
    description: 'Buy and sell calls at different strikes for limited risk bullish bet',
    outlook: 'Moderately Bullish',
  },
  bear_put_spread: {
    name: 'Bear Put Spread',
    description: 'Buy and sell puts at different strikes for limited risk bearish bet',
    outlook: 'Moderately Bearish',
  },
  straddle: {
    name: 'Long Straddle',
    description: 'Buy both call and put at same strike for big moves in either direction',
    outlook: 'High Volatility Expected',
  },
  strangle: {
    name: 'Long Strangle',
    description: 'Buy OTM call and put for cheaper volatility play',
    outlook: 'High Volatility Expected',
  },
  iron_condor: {
    name: 'Iron Condor',
    description: 'Sell a strangle and buy wings for income in low volatility',
    outlook: 'Low Volatility / Range-bound',
  },
  butterfly: {
    name: 'Butterfly Spread',
    description: 'Complex spread betting on stock staying near a specific price',
    outlook: 'Low Volatility / Pin to Strike',
  },
};
