import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ==========================================
// 1. CORE ENUMS & DATA STRUCTURES
// ==========================================

enum OutcomeType {
  PROFIT = "PROFIT",
  LOSS = "LOSS",
  BREAKEVEN = "BREAKEVEN"
}

enum ExitReason {
  STOP_LOSS = "STOP_LOSS",
  TARGET = "TARGET",
  TIME_EXIT = "TIME_EXIT",
  TRAILING_STOP = "TRAILING_STOP",
  MANUAL_EXIT = "MANUAL_EXIT"
}

enum AssetClass {
  EQUITY = "EQUITY",
  OPTIONS = "OPTIONS",
  FUTURES = "FUTURES"
}

enum CauseCode {
  // Loss causes - Execution issues
  LEVERAGE_AMPLIFICATION = "LEVERAGE_AMPLIFICATION",
  WHIPSAW_STOP = "WHIPSAW_STOP",
  
  // Loss causes - Volatility
  VOLATILITY_EXPANSION = "VOLATILITY_EXPANSION",
  IV_CRUSH = "IV_CRUSH",
  
  // Loss causes - Market structure
  TREND_REVERSAL = "TREND_REVERSAL",
  FALSE_BREAKOUT = "FALSE_BREAKOUT",
  OVERNIGHT_GAP = "OVERNIGHT_GAP",
  
  // Loss causes - Signal/Time
  SIGNAL_NOISE = "SIGNAL_NOISE",
  MOMENTUM_FAILURE = "MOMENTUM_FAILURE",
  THETA_DECAY = "THETA_DECAY",
  FUNDING_PRESSURE = "FUNDING_PRESSURE",
  
  // Profit causes - Momentum
  MOMENTUM_CONTINUATION = "MOMENTUM_CONTINUATION",
  BREAKOUT_SUCCESS = "BREAKOUT_SUCCESS",
  
  // Profit causes - Trend
  TREND_FOLLOWING = "TREND_FOLLOWING",
  RANGE_BOUND_BEHAVIOR = "RANGE_BOUND_BEHAVIOR",
  
  // Profit causes - Options/Derivatives
  DELTA_EXPANSION = "DELTA_EXPANSION",
  VOLATILITY_GAIN = "VOLATILITY_GAIN",
  LEVERAGE_BENEFIT = "LEVERAGE_BENEFIT",
  
  // General
  GENERAL_PROFIT = "GENERAL_PROFIT",
  GENERAL_LOSS = "GENERAL_LOSS"
}

// Cause priority mapping (lower = higher priority)
const CAUSE_PRIORITY: Record<CauseCode, number> = {
  // Execution issues are highest priority
  [CauseCode.LEVERAGE_AMPLIFICATION]: 1,
  [CauseCode.WHIPSAW_STOP]: 1,
  
  // Volatility events
  [CauseCode.VOLATILITY_EXPANSION]: 2,
  [CauseCode.IV_CRUSH]: 2,
  [CauseCode.VOLATILITY_GAIN]: 2,
  
  // Market structure
  [CauseCode.TREND_REVERSAL]: 3,
  [CauseCode.FALSE_BREAKOUT]: 3,
  [CauseCode.OVERNIGHT_GAP]: 3,
  [CauseCode.TREND_FOLLOWING]: 3,
  [CauseCode.BREAKOUT_SUCCESS]: 3,
  [CauseCode.RANGE_BOUND_BEHAVIOR]: 3,
  
  // Signal/timing issues
  [CauseCode.SIGNAL_NOISE]: 4,
  [CauseCode.MOMENTUM_FAILURE]: 4,
  [CauseCode.MOMENTUM_CONTINUATION]: 4,
  [CauseCode.DELTA_EXPANSION]: 4,
  [CauseCode.LEVERAGE_BENEFIT]: 4,
  
  // Time/decay issues
  [CauseCode.THETA_DECAY]: 5,
  [CauseCode.FUNDING_PRESSURE]: 5,
  
  // Fallbacks
  [CauseCode.GENERAL_PROFIT]: 99,
  [CauseCode.GENERAL_LOSS]: 99
};

// ==========================================
// 2. INTERFACES
// ==========================================

interface PnLInfo {
  absolute: number;
  percent: number;
  riskUsedPercent: number;
}

interface StrategyInfo {
  id: string;
  name: string;
  assetClass: string;
  timeframe: string;
}

interface InstrumentInfo {
  symbol: string;
  contract?: string;
  expiry?: string;
}

interface EntryContext {
  price: number;
  timestamp: string;
  indicators: Record<string, number>;
  trend: string;
  signalStrength?: number;
}

interface ExitContext {
  price: number;
  timestamp: string;
  exitReason: string;
  holdingMinutes: number;
  maxAdverseExcursionPct: number;
  maxFavorableExcursionPct: number;
  trendInvalidation: boolean;
  gapAgainstPosition: boolean;
  exitNearResistance: boolean;
  thetaDecayPct: number;
  deltaExpansion: number;
  ivExpansion: number;
  leverageRatio: number;
}

interface MarketContext {
  volatilitySpike: boolean;
  volumeSurge: boolean;
  newsEvent: boolean;
  regime: string;
}

interface RiskBehavior {
  stopLossRespected: boolean;
  maxRiskBreached: boolean;
  executionSlippage: string;
}

interface OutcomeAttribution {
  primaryCause: string;
  primaryDescription: string;
  secondaryCauses: string[];
  marketBehavior: string;
  priorityScore: number;
}

interface TradeOutcomeState {
  eventType: string;
  outcome: string;
  tradeId: string;
  timestamp: string;
  pnl: PnLInfo;
  strategy: StrategyInfo;
  instrument: InstrumentInfo;
  entryContext: EntryContext;
  exitContext: ExitContext;
  marketContext: MarketContext;
  riskBehavior: RiskBehavior;
  outcomeAttribution?: OutcomeAttribution;
}

interface TradeData {
  tradeId: string;
  strategyId: string;
  strategyName: string;
  assetClass: string;
  timeframe: string;
  symbol: string;
  contract?: string;
  expiry?: string;
  direction: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTimestamp: string;
  exitTimestamp: string;
  exitReason: string;
  holdingMinutes: number;
  riskPercent: number;
}

interface MarketData {
  entryIndicators?: Record<string, number>;
  trend?: string;
  signalStrength?: number;
  maePct?: number;
  mfePct?: number;
  volatilitySpike?: boolean;
  volumeSurge?: boolean;
  newsEvent?: boolean;
  regime?: string;
  trendInvalidation?: boolean;
  gapAgainstPosition?: boolean;
  exitNearResistance?: boolean;
  thetaDecayPct?: number;
  deltaExpansion?: number;
  ivExpansion?: number;
  leverageRatio?: number;
}

interface ExecutionData {
  stopLossRespected?: boolean;
  maxRiskBreached?: boolean;
  slippage?: string;
}

interface SanitizedPayload {
  strategy: {
    name: string;
    assetClass: string;
    timeframe: string;
  };
  instrument: {
    symbol: string;
    contract?: string;
  };
  entry: {
    trendDirection: string;
    signalStrength: string;
  };
  exit: {
    exitReason: string;
    holdingMinutes: number;
    priceBehavior: string;
  };
  outcome: {
    result: string;
    pnlPercent: number;
    riskUsedPercent: number;
  };
  attribution: {
    primaryCause: string;
    causeDescription: string;
    marketBehavior: string;
  };
  risk: {
    stopLossRespected: boolean;
    executionQuality: string;
  };
}

// ==========================================
// 3. ATTRIBUTION RULE CLASS
// ==========================================

interface AttributionRule {
  conditionFn: (state: TradeOutcomeState) => boolean;
  cause: CauseCode;
  description: string;
  priority: number;
}

function createRule(
  conditionFn: (state: TradeOutcomeState) => boolean,
  cause: CauseCode,
  description: string
): AttributionRule {
  return {
    conditionFn,
    cause,
    description,
    priority: CAUSE_PRIORITY[cause] ?? 99
  };
}

// ==========================================
// 4. LOSS ATTRIBUTION RULES
// ==========================================

const LOSS_RULES: AttributionRule[] = [
  // EXECUTION ISSUES (Priority 1)
  createRule(
    (s) => s.strategy.assetClass === AssetClass.FUTURES &&
           s.exitContext.exitReason === ExitReason.STOP_LOSS &&
           Math.abs(s.pnl.percent) > 1.2,
    CauseCode.LEVERAGE_AMPLIFICATION,
    "Leverage amplified adverse price movement beyond typical stop loss"
  ),
  
  createRule(
    (s) => s.strategy.assetClass === AssetClass.FUTURES &&
           s.exitContext.exitReason === ExitReason.STOP_LOSS &&
           s.marketContext.volatilitySpike &&
           s.exitContext.holdingMinutes < 10,
    CauseCode.WHIPSAW_STOP,
    "Short-term volatility whipsaw caused stop-out before trend continuation"
  ),
  
  // VOLATILITY EVENTS (Priority 2)
  createRule(
    (s) => s.exitContext.exitReason === ExitReason.STOP_LOSS &&
           s.marketContext.volatilitySpike &&
           s.strategy.assetClass !== AssetClass.FUTURES,
    CauseCode.VOLATILITY_EXPANSION,
    "Sharp counter-trend volatility spike invalidated position"
  ),
  
  createRule(
    (s) => s.strategy.assetClass === AssetClass.OPTIONS &&
           s.exitContext.ivExpansion < -5.0,
    CauseCode.IV_CRUSH,
    "Implied volatility contraction reduced option premium despite directional move"
  ),
  
  // MARKET STRUCTURE (Priority 3)
  createRule(
    (s) => s.exitContext.exitReason === ExitReason.STOP_LOSS &&
           s.exitContext.trendInvalidation,
    CauseCode.TREND_REVERSAL,
    "Price crossed opposite moving average invalidating trend structure"
  ),
  
  createRule(
    (s) => s.exitContext.exitReason === ExitReason.STOP_LOSS &&
           s.exitContext.holdingMinutes <= 15 &&
           s.strategy.name.toUpperCase().includes("BREAKOUT"),
    CauseCode.FALSE_BREAKOUT,
    "Breakout signal failed, price reversed back into range"
  ),
  
  createRule(
    (s) => s.exitContext.gapAgainstPosition,
    CauseCode.OVERNIGHT_GAP,
    "Gap opening against position direction"
  ),
  
  // SIGNAL/TIMING (Priority 4)
  createRule(
    (s) => s.exitContext.exitReason === ExitReason.STOP_LOSS &&
           s.exitContext.holdingMinutes <= 5,
    CauseCode.SIGNAL_NOISE,
    "Stop loss triggered within early bars indicating false signal"
  ),
  
  createRule(
    (s) => s.exitContext.exitReason === ExitReason.TIME_EXIT &&
           Math.abs(s.pnl.percent) < 0.5,
    CauseCode.MOMENTUM_FAILURE,
    "Lack of directional momentum, price remained flat"
  ),
  
  createRule(
    (s) => s.exitContext.maxFavorableExcursionPct > Math.abs(s.pnl.percent) * 2 &&
           s.pnl.absolute < 0 &&
           s.exitContext.maxFavorableExcursionPct > 0.5,
    CauseCode.MOMENTUM_FAILURE,
    "Initial favorable movement failed to sustain, reversed into loss"
  ),
  
  // TIME/DECAY (Priority 5)
  createRule(
    (s) => s.strategy.assetClass === AssetClass.OPTIONS &&
           s.exitContext.thetaDecayPct > 2.0,
    CauseCode.THETA_DECAY,
    "Options premium decay exceeded directional movement"
  ),
  
  createRule(
    (s) => s.strategy.assetClass === AssetClass.FUTURES &&
           s.exitContext.holdingMinutes > 1440 &&
           Math.abs(s.pnl.percent) < 0.3,
    CauseCode.FUNDING_PRESSURE,
    "Funding costs accumulated during extended holding period"
  )
];

// ==========================================
// 5. PROFIT ATTRIBUTION RULES
// ==========================================

const PROFIT_RULES: AttributionRule[] = [
  // MOMENTUM (Priority 4)
  createRule(
    (s) => s.exitContext.exitReason === ExitReason.TARGET &&
           s.exitContext.holdingMinutes <= 10,
    CauseCode.MOMENTUM_CONTINUATION,
    "Strong directional momentum hit target quickly"
  ),
  
  createRule(
    (s) => s.exitContext.exitReason === ExitReason.TARGET &&
           s.strategy.name.toUpperCase().includes("BREAKOUT"),
    CauseCode.BREAKOUT_SUCCESS,
    "Breakout signal confirmed, price sustained move"
  ),
  
  // TREND (Priority 3)
  createRule(
    (s) => s.exitContext.exitReason === ExitReason.TARGET &&
           s.exitContext.holdingMinutes > 30,
    CauseCode.TREND_FOLLOWING,
    "Gradual trend continuation reached target"
  ),
  
  createRule(
    (s) => s.exitContext.exitNearResistance,
    CauseCode.RANGE_BOUND_BEHAVIOR,
    "Exit near key resistance in ranging market"
  ),
  
  // DERIVATIVES (Priority 4)
  createRule(
    (s) => s.strategy.assetClass === AssetClass.OPTIONS &&
           s.exitContext.deltaExpansion > 10,
    CauseCode.DELTA_EXPANSION,
    "Directional move expanded option delta favorably"
  ),
  
  createRule(
    (s) => s.strategy.assetClass === AssetClass.OPTIONS &&
           s.exitContext.ivExpansion > 5,
    CauseCode.VOLATILITY_GAIN,
    "Implied volatility expansion increased option value"
  ),
  
  createRule(
    (s) => s.strategy.assetClass === AssetClass.FUTURES &&
           s.pnl.percent > 1.5 &&
           s.exitContext.holdingMinutes < 30,
    CauseCode.LEVERAGE_BENEFIT,
    "Leverage amplified favorable directional move"
  )
];

// ==========================================
// 6. OUTCOME ATTRIBUTION ENGINE
// ==========================================

function attributeOutcome(state: TradeOutcomeState): OutcomeAttribution {
  const isProfit = state.pnl.absolute > 0;
  const rules = isProfit ? PROFIT_RULES : LOSS_RULES;
  
  // Collect ALL matching rules
  const matchingRules: AttributionRule[] = [];
  for (const rule of rules) {
    try {
      if (rule.conditionFn(state)) {
        matchingRules.push(rule);
      }
    } catch {
      // Rule evaluation failed, skip
    }
  }
  
  // Sort by priority (lower number = higher priority)
  matchingRules.sort((a, b) => a.priority - b.priority);
  
  let primaryCause: { code: string; description: string; priority: number };
  let secondaryCauses: string[] = [];
  
  if (matchingRules.length > 0) {
    const primaryRule = matchingRules[0];
    primaryCause = {
      code: primaryRule.cause,
      description: primaryRule.description,
      priority: primaryRule.priority
    };
    secondaryCauses = matchingRules.slice(1, 4).map(r => r.description);
  } else {
    primaryCause = {
      code: isProfit ? CauseCode.GENERAL_PROFIT : CauseCode.GENERAL_LOSS,
      description: isProfit 
        ? 'Price moved favorably toward target'
        : 'Price moved unfavorably triggering exit',
      priority: 99
    };
  }
  
  return {
    primaryCause: primaryCause.code,
    primaryDescription: primaryCause.description,
    secondaryCauses,
    marketBehavior: inferMarketBehavior(state),
    priorityScore: primaryCause.priority
  };
}

function inferMarketBehavior(state: TradeOutcomeState): string {
  const mae = state.exitContext.maxAdverseExcursionPct;
  const mfe = state.exitContext.maxFavorableExcursionPct;
  
  if (mae > 1.5) {
    return "High adverse movement during trade";
  }
  
  if (mfe > 2.0 && state.pnl.absolute < 0) {
    return "Initial favorable move reversed sharply";
  }
  
  if (state.exitContext.exitReason === ExitReason.STOP_LOSS && 
      state.exitContext.holdingMinutes <= 5) {
    return "Sharp reversal within entry zone";
  }
  
  if (state.marketContext.volatilitySpike) {
    return "High volatility expansion event";
  }
  
  if (state.exitContext.holdingMinutes > 60) {
    return "Sustained directional move";
  }
  
  if (state.marketContext.volumeSurge) {
    return "Elevated volume activity";
  }
  
  return "Normal market conditions";
}

// ==========================================
// 7. TRADE OUTCOME STATE BUILDER
// ==========================================

function buildTradeOutcomeState(
  tradeData: TradeData,
  marketData: MarketData,
  executionData: ExecutionData
): TradeOutcomeState {
  let pnlAbsolute = tradeData.exitPrice - tradeData.entryPrice;
  if (tradeData.direction === 'SHORT') {
    pnlAbsolute = -pnlAbsolute;
  }
  pnlAbsolute *= tradeData.quantity;
  
  const pnlPercent = (pnlAbsolute / (tradeData.entryPrice * tradeData.quantity)) * 100;
  const outcome = pnlAbsolute > 0 ? OutcomeType.PROFIT : OutcomeType.LOSS;
  
  return {
    eventType: "TRADE_EXIT",
    outcome,
    tradeId: tradeData.tradeId,
    timestamp: new Date().toISOString(),
    
    pnl: {
      absolute: Math.round(pnlAbsolute * 100) / 100,
      percent: Math.round(pnlPercent * 100) / 100,
      riskUsedPercent: Math.round((Math.abs(pnlPercent) / (tradeData.riskPercent || 1.0)) * 100) / 100
    },
    
    strategy: {
      id: tradeData.strategyId,
      name: tradeData.strategyName,
      assetClass: tradeData.assetClass,
      timeframe: tradeData.timeframe
    },
    
    instrument: {
      symbol: tradeData.symbol,
      contract: tradeData.contract,
      expiry: tradeData.expiry
    },
    
    entryContext: {
      price: tradeData.entryPrice,
      timestamp: tradeData.entryTimestamp,
      indicators: marketData.entryIndicators || {},
      trend: marketData.trend || 'UNKNOWN',
      signalStrength: marketData.signalStrength
    },
    
    exitContext: {
      price: tradeData.exitPrice,
      timestamp: tradeData.exitTimestamp,
      exitReason: tradeData.exitReason,
      holdingMinutes: tradeData.holdingMinutes,
      maxAdverseExcursionPct: marketData.maePct || 0.0,
      maxFavorableExcursionPct: marketData.mfePct || 0.0,
      trendInvalidation: marketData.trendInvalidation || false,
      gapAgainstPosition: marketData.gapAgainstPosition || false,
      exitNearResistance: marketData.exitNearResistance || false,
      thetaDecayPct: marketData.thetaDecayPct || 0.0,
      deltaExpansion: marketData.deltaExpansion || 0.0,
      ivExpansion: marketData.ivExpansion || 0.0,
      leverageRatio: marketData.leverageRatio || 1.0
    },
    
    marketContext: {
      volatilitySpike: marketData.volatilitySpike || false,
      volumeSurge: marketData.volumeSurge || false,
      newsEvent: marketData.newsEvent || false,
      regime: marketData.regime || 'NORMAL'
    },
    
    riskBehavior: {
      stopLossRespected: executionData.stopLossRespected ?? true,
      maxRiskBreached: executionData.maxRiskBreached || false,
      executionSlippage: executionData.slippage || 'NORMAL'
    }
  };
}

// ==========================================
// 8. SANITIZED PAYLOAD BUILDER
// ==========================================

function buildSanitizedPayload(state: TradeOutcomeState): SanitizedPayload {
  const describePriceBehavior = (): string => {
    const mae = state.exitContext.maxAdverseExcursionPct;
    const mfe = state.exitContext.maxFavorableExcursionPct;
    
    if (mfe > 1.5 && mae < 0.5) return "Primarily favorable movement";
    if (mae > 1.5 && mfe < 0.5) return "Primarily adverse movement";
    if (mfe > 1.0 && mae > 1.0) return "High two-way volatility";
    return "Limited price movement";
  };
  
  return {
    strategy: {
      name: state.strategy.name,
      assetClass: state.strategy.assetClass,
      timeframe: state.strategy.timeframe
    },
    instrument: {
      symbol: state.instrument.symbol,
      contract: state.strategy.assetClass !== AssetClass.EQUITY ? state.instrument.contract : undefined
    },
    entry: {
      trendDirection: state.entryContext.trend,
      signalStrength: state.entryContext.signalStrength && state.entryContext.signalStrength > 0.7 
        ? "STRONG" : "MODERATE"
    },
    exit: {
      exitReason: state.exitContext.exitReason,
      holdingMinutes: state.exitContext.holdingMinutes,
      priceBehavior: describePriceBehavior()
    },
    outcome: {
      result: state.outcome,
      pnlPercent: state.pnl.percent,
      riskUsedPercent: state.pnl.riskUsedPercent
    },
    attribution: {
      primaryCause: state.outcomeAttribution?.primaryCause || '',
      causeDescription: state.outcomeAttribution?.primaryDescription || '',
      marketBehavior: state.outcomeAttribution?.marketBehavior || ''
    },
    risk: {
      stopLossRespected: state.riskBehavior.stopLossRespected,
      executionQuality: state.riskBehavior.executionSlippage
    }
  };
}

// ==========================================
// 9. EXPLANATION PROMPTS
// ==========================================

const SYSTEM_PROMPT = `You are an explanation engine for an Indian stock trading system.

Your role: Explain trade outcomes using ONLY the provided facts.

Structure your explanation:
1. Why the trade was entered (entry logic)
2. What market behavior followed (execution context)
3. Why this resulted in PROFIT or LOSS (outcome attribution)
4. How risk controls behaved (risk management)

CRITICAL RULES:
- Use ONLY facts from the provided state
- Do NOT give advice or suggestions
- Do NOT predict future outcomes
- Do NOT suggest improvements or optimizations
- Do NOT use phrases like "could have", "next time", "should change"
- Use neutral, factual language
- Loss explanation ≠ excuse
- Profit explanation ≠ brag
- Use Indian market terminology (NSE, NIFTY, BANKNIFTY, etc.)

Output format: Clear, concise prose. 3-5 sentences maximum.`;

function getExplanationPrompt(explanationType: string, payload: SanitizedPayload): { system: string; user: string } {
  const payloadJson = JSON.stringify(payload, null, 2);
  
  let userPrompt: string;
  
  if (explanationType === "EXIT_LOSS") {
    userPrompt = `Explain this LOSS trade outcome:

${payloadJson}

Focus on: Why entry occurred, what market did, why loss resulted, risk behavior.`;
  } else if (explanationType === "EXIT_PROFIT") {
    userPrompt = `Explain this PROFIT trade outcome:

${payloadJson}

Focus on: Why entry occurred, what market did, why profit resulted, risk behavior.`;
  } else if (explanationType === "ENTRY_EXPLANATION") {
    userPrompt = `Explain why this trade entry occurred:

${payloadJson}

Focus only on: Entry logic and signal conditions.`;
  } else {
    throw new Error(`Unknown explanation type: ${explanationType}`);
  }
  
  return { system: SYSTEM_PROMPT, user: userPrompt };
}

// ==========================================
// 10. EXPLANATION VALIDATOR
// ==========================================

const FORBIDDEN_PHRASES = [
  "could have avoided",
  "could have been",
  "next time",
  "better to",
  "should change",
  "should have",
  "optimize",
  "improve",
  "likely future",
  "will probably",
  "recommend",
  "suggest",
  "consider",
  "try to",
  "instead of"
];

const PREDICTION_PATTERNS = [
  /\bwill\b.*\b(rise|fall|increase|decrease)\b/i,
  /\bexpect\b.*\bto\b/i,
  /\blikely\b.*\bhappen\b/i,
  /\bprobably\b.*\bmove\b/i
];

function validateExplanation(explanation: string): { isValid: boolean; error?: string } {
  const explanationLower = explanation.toLowerCase();
  
  // Check for forbidden phrases
  for (const phrase of FORBIDDEN_PHRASES) {
    if (explanationLower.includes(phrase)) {
      return { isValid: false, error: `Contains forbidden phrase: '${phrase}'` };
    }
  }
  
  // Check length
  if (explanation.length < 50) {
    return { isValid: false, error: "Explanation too short (min 50 chars)" };
  }
  
  if (explanation.length > 1000) {
    return { isValid: false, error: "Explanation too long (max 1000 chars)" };
  }
  
  // Check for prediction patterns
  for (const pattern of PREDICTION_PATTERNS) {
    if (pattern.test(explanationLower)) {
      return { isValid: false, error: `Contains predictive content` };
    }
  }
  
  return { isValid: true };
}

// ==========================================
// 11. LOVABLE AI INTEGRATION
// ==========================================

async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    throw new Error('LOVABLE_API_KEY not configured');
  }
  
  const response = await fetch('https://api.lovable.dev/ai/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${lovableApiKey}`
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.3
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Lovable AI error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || data.content || '';
}

// ==========================================
// 12. MAIN HANDLER
// ==========================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body = await req.json();
    const { action, tradeData, marketData, executionData, tradeId } = body;
    
    console.log(`[trade-explanation] Action: ${action}`);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    switch (action) {
      case 'explain_exit': {
        // Build state from trade data
        const state = buildTradeOutcomeState(tradeData, marketData || {}, executionData || {});
        
        // Attribute outcome (RULE-BASED, NOT LLM)
        const attribution = attributeOutcome(state);
        state.outcomeAttribution = attribution;
        
        // Build sanitized payload
        const sanitizedPayload = buildSanitizedPayload(state);
        
        // Get prompts
        const explanationType = `EXIT_${state.outcome}`;
        const prompts = getExplanationPrompt(explanationType, sanitizedPayload);
        
        // Call Lovable AI
        let explanationText: string;
        try {
          explanationText = await callLovableAI(prompts.system, prompts.user);
        } catch (aiError) {
          console.error('[trade-explanation] AI error:', aiError);
          // Fallback to attribution description
          explanationText = `${attribution.primaryDescription}. ${attribution.marketBehavior}.`;
        }
        
        // Validate
        const validation = validateExplanation(explanationText);
        
        if (!validation.isValid) {
          console.warn(`[trade-explanation] Validation failed: ${validation.error}`);
          explanationText = `[VALIDATION OVERRIDE] ${attribution.primaryDescription}. ${attribution.marketBehavior}.`;
        }
        
        // Store explanation
        const { error: storeError } = await supabase
          .from('trade_explanations')
          .upsert({
            trade_id: tradeData.tradeId,
            explanation_type: explanationType,
            explanation_text: explanationText,
            attribution: attribution,
            sanitized_payload: sanitizedPayload,
            validated: validation.isValid,
            priority_score: attribution.priorityScore,
            created_at: new Date().toISOString()
          }, { onConflict: 'trade_id,explanation_type' });
        
        if (storeError) {
          console.warn('[trade-explanation] Storage warning:', storeError.message);
        }
        
        return new Response(JSON.stringify({
          success: true,
          tradeId: tradeData.tradeId,
          explanation: explanationText,
          attribution: {
            primaryCause: attribution.primaryCause,
            primaryDescription: attribution.primaryDescription,
            secondaryCauses: attribution.secondaryCauses,
            marketBehavior: attribution.marketBehavior,
            priorityScore: attribution.priorityScore
          },
          validated: validation.isValid,
          sanitizedPayload
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      case 'get_attribution': {
        // Get attribution without LLM call
        const state = buildTradeOutcomeState(tradeData, marketData || {}, executionData || {});
        const attribution = attributeOutcome(state);
        
        return new Response(JSON.stringify({
          success: true,
          tradeId: tradeData.tradeId,
          outcome: state.outcome,
          attribution: {
            primaryCause: attribution.primaryCause,
            primaryDescription: attribution.primaryDescription,
            secondaryCauses: attribution.secondaryCauses,
            marketBehavior: attribution.marketBehavior,
            priorityScore: attribution.priorityScore
          },
          pnl: state.pnl
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      case 'get_explanation': {
        // Retrieve stored explanation
        const { data, error } = await supabase
          .from('trade_explanations')
          .select('*')
          .eq('trade_id', tradeId)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw new Error(`Failed to fetch explanation: ${error.message}`);
        }
        
        return new Response(JSON.stringify({
          success: true,
          tradeId,
          explanations: data || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      case 'list_cause_codes': {
        // Return all available cause codes for UI
        const causeCodes = Object.entries(CauseCode).map(([key, value]) => ({
          code: value,
          priority: CAUSE_PRIORITY[value as CauseCode] || 99,
          isLoss: key.includes('LOSS') || 
                  ['LEVERAGE_AMPLIFICATION', 'WHIPSAW_STOP', 'VOLATILITY_EXPANSION', 
                   'IV_CRUSH', 'TREND_REVERSAL', 'FALSE_BREAKOUT', 'OVERNIGHT_GAP',
                   'SIGNAL_NOISE', 'MOMENTUM_FAILURE', 'THETA_DECAY', 'FUNDING_PRESSURE'].includes(value)
        }));
        
        return new Response(JSON.stringify({
          success: true,
          causeCodes: causeCodes.sort((a, b) => a.priority - b.priority)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      default:
        return new Response(JSON.stringify({
          error: `Unknown action: ${action}`,
          availableActions: ['explain_exit', 'get_attribution', 'get_explanation', 'list_cause_codes']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('[trade-explanation] Error:', errorMessage);
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
