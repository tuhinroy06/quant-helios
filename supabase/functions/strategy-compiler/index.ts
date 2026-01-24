import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ==========================================
// CONSTANTS & TYPES
// ==========================================

const VERSION = "1.0.0";

const ALLOWED_FEATURES = new Set([
  'rsi', 'price_to_sma20', 'price_to_sma50',
  'volatility', 'volume_ratio', 'relative_strength', 'market_regime'
]);

const RUNTIME_FEATURES = new Set(['current_price']);

const ALLOWED_OPERATORS = new Set(['>', '<', '>=', '<=', 'between']);
const ASSET_CLASSES = new Set(['CASH', 'FUTURES', 'OPTIONS']);
const MARKETS = new Set(['NSE', 'BSE']);
const TIMEFRAMES = new Set(['1m', '5m', '15m']);
const HOLDING_TYPES = new Set(['INTRADAY', 'SWING']);
const UNIVERSE_TYPES = new Set(['INDEX', 'STOCK_LIST']);
const DIRECTIONS = new Set(['LONG', 'SHORT', 'BOTH']);
const MARKET_REGIMES = new Set(['TRENDING', 'RANGE', 'HIGH_VOL', 'LOW_VOL']);

const BANNED_KEYWORDS = [
  'override', 'ignore', 'bypass', 'unlimited', 'martingale',
  'revenge', 'double after loss', 'guaranteed', 'insider', 'leak',
  'predict', 'forecast', 'sure profit', 'jailbreak', 'roleplay',
  'pretend', 'testing only', 'remove stop'
];

const HARD_CAPS = {
  max_risk_per_trade_percent: 2.0,
  max_positions: 5,
  min_stop_loss_percent: 0.25,
  max_confidence: 0.9,
  max_leverage: 3,
  max_cooldown_bars: 10,
  max_confirmation_bars: 5
};

const FUTURES_CONTRACT_TYPES = new Set(['NEAR_MONTH', 'NEXT_MONTH', 'FAR_MONTH']);
const FUTURES_MARGIN_MODES = new Set(['SPAN', 'EXPOSURE']);

const OPTIONS_SAFE_STRATEGIES = new Set(['LONG_CALL', 'LONG_PUT', 'DEBIT_SPREAD']);
const OPTIONS_RESTRICTED_STRATEGIES = new Set(['SHORT_CALL', 'SHORT_PUT', 'STRANGLE', 'STRADDLE', 'IRON_CONDOR']);
const OPTIONS_EXPIRY = new Set(['WEEKLY', 'MONTHLY']);
const OPTIONS_STRIKE = new Set(['ATM', 'ITM', 'OTM']);

interface Condition {
  feature: string;
  operator: string;
  value: number | [number, number];
}

interface Strategy {
  strategy_name: string;
  asset_class: string;
  market: string;
  timeframe: string;
  holding_type: string;
  direction: string;
  universe: { type: string; symbols: string[] };
  entry_logic: { conditions: Condition[] };
  exit_logic: {
    stop_loss: { type: string; value: number };
    take_profit: { type: string; value: number };
    time_exit_minutes: number | null;
  };
  risk: {
    max_risk_per_trade_percent: number;
    max_positions: number;
    position_sizing: string;
  };
  filters: {
    volatility: { max: number | null };
    avoid_market_regime: string[] | null;
  };
  confirmation: { bars: number; cooldown_bars: number };
  confidence: number;
  capabilities?: string[];
  futures?: {
    contract_type: string;
    margin_mode: string;
    max_leverage: number;
  };
  options?: {
    strategy_type: string;
    expiry: string;
    strike_selection: string;
    max_loss_percent: number;
    iv_filter: { min: number; max: number };
  };
  metadata?: {
    created_by: string;
    created_from_prompt_hash: string;
    validator_version: string;
    compiler_version: string;
  };
}

// ==========================================
// PROMPT FIREWALL
// ==========================================

function scanPrompt(userInput: string): { passed: boolean; message: string } {
  const textLower = userInput.toLowerCase();

  // Check banned keywords
  for (const keyword of BANNED_KEYWORDS) {
    if (textLower.includes(keyword)) {
      return { passed: false, message: `BANNED_KEYWORD_DETECTED: ${keyword}` };
    }
  }

  // Length check
  if (userInput.length > 2000) {
    return { passed: false, message: "PROMPT_TOO_LONG" };
  }

  // Intent classification
  const intent = classifyIntent(textLower);
  if (intent !== "STRATEGY_CREATION") {
    return { passed: false, message: `INVALID_INTENT: ${intent}` };
  }

  return { passed: true, message: "PASSED" };
}

function classifyIntent(text: string): string {
  if (['just testing', 'pretend', 'roleplay', 'game'].some(w => text.includes(w))) {
    return "ROLEPLAY";
  }
  if (['learn', 'teach me', 'explain', 'what is'].some(w => text.includes(w))) {
    return "EDUCATION_ONLY";
  }
  if (['buy', 'sell', 'entry', 'exit', 'strategy', 'trade', 'when', 'if'].some(w => text.includes(w))) {
    return "STRATEGY_CREATION";
  }
  return "JAILBREAK";
}

// ==========================================
// STRATEGY VALIDATOR
// ==========================================

function validateStrategy(strategy: Strategy): { status: string; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!strategy.strategy_name) errors.push("Missing strategy_name");
  if (!ASSET_CLASSES.has(strategy.asset_class)) errors.push(`Invalid asset_class: ${strategy.asset_class}`);
  if (!MARKETS.has(strategy.market)) errors.push(`Invalid market: ${strategy.market}`);
  if (!TIMEFRAMES.has(strategy.timeframe)) errors.push(`Invalid timeframe: ${strategy.timeframe}`);
  if (!HOLDING_TYPES.has(strategy.holding_type)) errors.push(`Invalid holding_type: ${strategy.holding_type}`);
  if (!DIRECTIONS.has(strategy.direction)) errors.push(`Invalid direction: ${strategy.direction}`);

  // Risk caps
  if (strategy.risk.max_risk_per_trade_percent > HARD_CAPS.max_risk_per_trade_percent) {
    errors.push(`RISK_PER_TRADE_EXCEEDS_CAP: ${strategy.risk.max_risk_per_trade_percent}% > ${HARD_CAPS.max_risk_per_trade_percent}%`);
  }
  if (strategy.risk.max_positions > HARD_CAPS.max_positions) {
    errors.push(`MAX_POSITIONS_EXCEEDS_CAP: ${strategy.risk.max_positions} > ${HARD_CAPS.max_positions}`);
  }
  if (strategy.exit_logic.stop_loss.value < HARD_CAPS.min_stop_loss_percent) {
    errors.push(`STOP_LOSS_TOO_TIGHT: ${strategy.exit_logic.stop_loss.value}% < ${HARD_CAPS.min_stop_loss_percent}%`);
  }
  if (strategy.confidence > HARD_CAPS.max_confidence) {
    errors.push(`CONFIDENCE_EXCEEDS_CAP: ${strategy.confidence} > ${HARD_CAPS.max_confidence}`);
  }

  // Safety rules
  if (strategy.holding_type === 'INTRADAY') {
    const sl = strategy.exit_logic.stop_loss.value;
    const tp = strategy.exit_logic.take_profit.value;
    if (sl > tp) {
      errors.push(`STOP_LOSS_GREATER_THAN_TAKE_PROFIT: SL=${sl}% TP=${tp}%`);
    }
    if (!strategy.exit_logic.time_exit_minutes) {
      errors.push("INTRADAY_MISSING_TIME_EXIT");
    }
  }

  // Asset class specific validation
  if (strategy.asset_class === 'OPTIONS' && !strategy.options) {
    errors.push("OPTIONS_STRATEGY_MISSING_OPTIONS_CONFIG");
  }
  if (strategy.asset_class === 'FUTURES' && !strategy.futures) {
    errors.push("FUTURES_STRATEGY_MISSING_FUTURES_CONFIG");
  }
  if (strategy.asset_class === 'CASH' && strategy.direction !== 'LONG') {
    errors.push(`CASH_ONLY_SUPPORTS_LONG: direction=${strategy.direction}`);
  }

  // Validate entry conditions
  for (const condition of strategy.entry_logic.conditions) {
    if (!ALLOWED_FEATURES.has(condition.feature)) {
      errors.push(`INVALID_FEATURE: ${condition.feature}`);
    }
    if (!ALLOWED_OPERATORS.has(condition.operator)) {
      errors.push(`INVALID_OPERATOR: ${condition.operator}`);
    }
  }

  // Options validation
  if (strategy.options) {
    if (OPTIONS_RESTRICTED_STRATEGIES.has(strategy.options.strategy_type)) {
      errors.push(`RESTRICTED_OPTIONS_STRATEGY: ${strategy.options.strategy_type} requires explicit unlock`);
    }
    if (strategy.options.max_loss_percent > strategy.risk.max_risk_per_trade_percent) {
      errors.push(`OPTIONS_MAX_LOSS_EXCEEDS_RISK_PER_TRADE`);
    }
    if (strategy.options.expiry === 'WEEKLY' && strategy.holding_type === 'SWING') {
      errors.push("WEEKLY_OPTIONS_CANNOT_BE_SWING");
    }
  }

  // Futures validation
  if (strategy.futures) {
    if (strategy.futures.max_leverage > HARD_CAPS.max_leverage) {
      errors.push(`LEVERAGE_EXCEEDS_CAP: ${strategy.futures.max_leverage} > ${HARD_CAPS.max_leverage}`);
    }
  }

  // Warnings
  if (strategy.timeframe === '1m') {
    warnings.push("1-minute timeframe may have high noise");
  }
  if (strategy.risk.max_positions >= 4) {
    warnings.push("High number of concurrent positions");
  }
  if (strategy.futures && strategy.futures.max_leverage > 2) {
    warnings.push("Leverage above 2x increases risk significantly");
  }
  if (strategy.entry_logic.conditions.length === 1) {
    warnings.push("Single condition entry may generate false signals");
  }
  if (strategy.confirmation.bars === 1) {
    warnings.push("No confirmation bars may increase false signals");
  }

  return {
    status: errors.length === 0 ? "VALID" : "REJECTED",
    errors,
    warnings
  };
}

// ==========================================
// STRATEGY PARSER
// ==========================================

function parseUserInput(text: string): Strategy {
  const textLower = text.toLowerCase();

  const assetClass = extractAssetClass(textLower);

  return {
    strategy_name: extractStrategyName(text),
    asset_class: assetClass,
    market: extractMarket(textLower),
    timeframe: extractTimeframe(textLower),
    holding_type: extractHoldingType(textLower),
    direction: extractDirection(textLower, assetClass),
    universe: extractUniverse(textLower),
    entry_logic: extractEntryLogic(textLower),
    exit_logic: extractExitLogic(textLower),
    risk: extractRisk(textLower),
    filters: extractFilters(textLower),
    confirmation: extractConfirmation(textLower),
    confidence: calculateConfidence(textLower),
    ...(assetClass === 'FUTURES' ? { futures: extractFuturesConfig(textLower) } : {}),
    ...(assetClass === 'OPTIONS' ? { options: extractOptionsConfig(textLower) } : {})
  };
}

function extractStrategyName(text: string): string {
  // Try to extract a name from quotes or "called X" pattern
  const quoteMatch = text.match(/"([^"]+)"/);
  if (quoteMatch) return quoteMatch[1];

  const calledMatch = text.match(/called\s+(\w+)/i);
  if (calledMatch) return calledMatch[1];

  const namedMatch = text.match(/named?\s+(\w+)/i);
  if (namedMatch) return namedMatch[1];

  return "Custom Strategy";
}

function extractAssetClass(text: string): string {
  if (text.includes('option')) return 'OPTIONS';
  if (text.includes('future')) return 'FUTURES';
  return 'CASH';
}

function extractMarket(text: string): string {
  return text.includes('bse') ? 'BSE' : 'NSE';
}

function extractTimeframe(text: string): string {
  if (text.includes('1m') || text.includes('1 m') || text.includes('1 min')) return '1m';
  if (text.includes('15m') || text.includes('15 m') || text.includes('15 min')) return '15m';
  return '5m';
}

function extractHoldingType(text: string): string {
  return text.includes('swing') ? 'SWING' : 'INTRADAY';
}

function extractDirection(text: string, assetClass: string): string {
  if (assetClass === 'CASH') return 'LONG';
  if (text.includes('short') || text.includes('sell')) return 'SHORT';
  return 'LONG';
}

function extractUniverse(text: string): { type: string; symbols: string[] } {
  const symbols: string[] = [];

  if (text.includes('nifty') && !text.includes('bank')) symbols.push('NIFTY');
  if (text.includes('bank nifty') || text.includes('banknifty')) symbols.push('BANKNIFTY');
  if (text.includes('sensex')) symbols.push('SENSEX');
  if (text.includes('reliance')) symbols.push('RELIANCE');
  if (text.includes('tcs')) symbols.push('TCS');
  if (text.includes('hdfc')) symbols.push('HDFC');
  if (text.includes('infosys') || text.includes('infy')) symbols.push('INFOSYS');

  if (symbols.length === 0) symbols.push('NIFTY');

  return { type: "INDEX", symbols };
}

function extractEntryLogic(text: string): { conditions: Condition[] } {
  const conditions: Condition[] = [];

  // RSI patterns
  if (text.includes('rsi')) {
    if (text.includes('below 30') || text.includes('< 30') || text.includes('oversold')) {
      conditions.push({ feature: "rsi", operator: "<", value: 30 });
    } else if (text.includes('above 70') || text.includes('> 70') || text.includes('overbought')) {
      conditions.push({ feature: "rsi", operator: ">", value: 70 });
    } else if (text.includes('above 50') || text.includes('> 50')) {
      conditions.push({ feature: "rsi", operator: ">", value: 50 });
    } else if (text.includes('below 35') || text.includes('< 35')) {
      conditions.push({ feature: "rsi", operator: "<", value: 35 });
    } else {
      // Default RSI oversold
      conditions.push({ feature: "rsi", operator: "<", value: 30 });
    }
  }

  // SMA patterns
  if (text.includes('sma') || text.includes('moving average')) {
    if (text.includes('20') && (text.includes('above') || text.includes('>'))) {
      conditions.push({ feature: "price_to_sma20", operator: ">", value: 1 });
    }
    if (text.includes('50') && (text.includes('above') || text.includes('>'))) {
      conditions.push({ feature: "price_to_sma50", operator: ">", value: 1 });
    }
  }

  // Volume patterns
  if (text.includes('volume') && (text.includes('high') || text.includes('above') || text.includes('surge'))) {
    conditions.push({ feature: "volume_ratio", operator: ">", value: 1.5 });
  }

  // Volatility patterns
  if (text.includes('low volatility')) {
    conditions.push({ feature: "volatility", operator: "<", value: 0.02 });
  } else if (text.includes('high volatility')) {
    conditions.push({ feature: "volatility", operator: ">", value: 0.03 });
  }

  // Market regime
  if (text.includes('trending')) {
    conditions.push({ feature: "market_regime", operator: "=", value: "TRENDING" as any });
  }

  // Relative strength
  if (text.includes('strong') || text.includes('relative strength')) {
    conditions.push({ feature: "relative_strength", operator: ">", value: 0.6 });
  }

  // Default if no conditions found
  if (conditions.length === 0) {
    conditions.push({ feature: "rsi", operator: "<", value: 30 });
  }

  return { conditions };
}

function extractExitLogic(text: string): Strategy['exit_logic'] {
  return {
    stop_loss: extractStopLoss(text),
    take_profit: extractTakeProfit(text),
    time_exit_minutes: extractTimeExit(text)
  };
}

function extractStopLoss(text: string): { type: string; value: number } {
  const match = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:stop|loss|sl)/i);
  let value = match ? parseFloat(match[1]) : 1.0;
  value = Math.max(value, HARD_CAPS.min_stop_loss_percent);
  return { type: "percent", value };
}

function extractTakeProfit(text: string): { type: string; value: number } {
  const match = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:profit|target|tp)/i);
  return { type: "percent", value: match ? parseFloat(match[1]) : 2.0 };
}

function extractTimeExit(text: string): number | null {
  if (text.includes('intraday')) return 360;
  const match = text.match(/(\d+)\s*(?:min|minute)/i);
  return match ? parseInt(match[1]) : null;
}

function extractRisk(text: string): Strategy['risk'] {
  let maxRisk = 1.0;
  if (text.includes('low risk') || text.includes('conservative')) maxRisk = 0.5;
  else if (text.includes('high risk') || text.includes('aggressive')) maxRisk = 2.0;

  let maxPositions = 3;
  if (text.includes('scalp')) maxPositions = 5;
  else if (text.includes('single') || text.includes('one position')) maxPositions = 1;

  return {
    max_risk_per_trade_percent: Math.min(maxRisk, HARD_CAPS.max_risk_per_trade_percent),
    max_positions: Math.min(maxPositions, HARD_CAPS.max_positions),
    position_sizing: "fixed_risk"
  };
}

function extractFilters(text: string): Strategy['filters'] {
  let avoidRegime: string[] | null = null;
  if (text.includes('avoid sideways') || text.includes('avoid range')) {
    avoidRegime = ["RANGE"];
  } else if (text.includes('avoid volatile')) {
    avoidRegime = ["HIGH_VOL"];
  }

  const maxVolatility = text.includes('low volatility') ? 0.02 : null;

  return {
    volatility: { max: maxVolatility },
    avoid_market_regime: avoidRegime
  };
}

function extractConfirmation(text: string): Strategy['confirmation'] {
  let bars = 1;
  if (text.includes('confirmation') || text.includes('high confidence') || text.includes('confirm')) {
    bars = 2;
  }
  if (text.includes('strong confirmation')) {
    bars = 3;
  }

  let cooldownBars = 0;
  if (text.includes('cooldown') || (text.includes('stop') && text.includes('loss'))) {
    cooldownBars = 3;
  }

  return {
    bars: Math.min(bars, HARD_CAPS.max_confirmation_bars),
    cooldown_bars: Math.min(cooldownBars, HARD_CAPS.max_cooldown_bars)
  };
}

function calculateConfidence(text: string): number {
  let score = 0.5;
  if (text.includes('high confidence')) score += 0.3;
  if (text.includes('confirmation')) score += 0.1;
  if (text.includes('multiple') || text.includes('several')) score += 0.1;
  return Math.min(score, HARD_CAPS.max_confidence);
}

function extractFuturesConfig(text: string): Strategy['futures'] {
  let contractType = 'NEAR_MONTH';
  if (text.includes('next month')) contractType = 'NEXT_MONTH';
  if (text.includes('far month')) contractType = 'FAR_MONTH';

  let maxLeverage = 2;
  const leverageMatch = text.match(/(\d+)x\s*(?:leverage|lev)/i);
  if (leverageMatch) {
    maxLeverage = Math.min(parseInt(leverageMatch[1]), HARD_CAPS.max_leverage);
  }

  return {
    contract_type: contractType,
    margin_mode: "SPAN",
    max_leverage: maxLeverage
  };
}

function extractOptionsConfig(text: string): Strategy['options'] {
  let strategyType = 'LONG_CALL';
  if (text.includes('put')) strategyType = 'LONG_PUT';
  else if (text.includes('spread')) strategyType = 'DEBIT_SPREAD';

  let expiry = 'MONTHLY';
  if (text.includes('weekly')) expiry = 'WEEKLY';

  let strike = 'ATM';
  if (text.includes('itm') || text.includes('in the money')) strike = 'ITM';
  if (text.includes('otm') || text.includes('out of the money')) strike = 'OTM';

  return {
    strategy_type: strategyType,
    expiry,
    strike_selection: strike,
    max_loss_percent: 1.0,
    iv_filter: { min: 15, max: 40 }
  };
}

// ==========================================
// CODE GENERATOR
// ==========================================

function generatePythonCode(strategy: Strategy): string {
  const lines: string[] = [
    "def evaluate(features: dict, position: dict | None, state: dict, now_ts: int) -> dict:",
    "    should_enter = False",
    "    should_exit = False",
    "    exit_reason = None",
    "    new_state = state.copy()",
    "",
    "    confirmation_count = new_state.get('confirmation_count', 0)",
    "    cooldown_remaining = new_state.get('cooldown_remaining', 0)",
    ""
  ];

  const confirmationBars = strategy.confirmation.bars;
  const cooldownRequired = strategy.confirmation.cooldown_bars;

  lines.push("    if position is None:");
  lines.push("        if cooldown_remaining > 0:");
  lines.push("            new_state['cooldown_remaining'] = cooldown_remaining - 1");
  lines.push("            new_state['confirmation_count'] = 0");
  lines.push("        else:");

  // Build entry conditions
  const entryConditions: string[] = [];
  for (const condition of strategy.entry_logic.conditions) {
    const feature = condition.feature;
    const operator = condition.operator;
    const value = condition.value;

    if (operator === 'between' && Array.isArray(value)) {
      entryConditions.push(`features.get('${feature}', 0) >= ${value[0]} and features.get('${feature}', 0) <= ${value[1]}`);
    } else {
      entryConditions.push(`features.get('${feature}', 0) ${operator} ${value}`);
    }
  }

  // Add regime filter
  if (strategy.filters.avoid_market_regime && strategy.filters.avoid_market_regime.length > 0) {
    const regimeChecks = strategy.filters.avoid_market_regime.map(r => 
      `features.get('market_regime', '') != '${r}'`
    );
    entryConditions.push(regimeChecks.join(' and '));
  }

  // Add volatility filter
  if (strategy.filters.volatility.max) {
    entryConditions.push(`features.get('volatility', 0) <= ${strategy.filters.volatility.max}`);
  }

  const allConditions = entryConditions.join(' and ');

  lines.push(`            conditions_met = ${allConditions}`);
  lines.push("");
  lines.push("            if conditions_met:");
  lines.push("                new_state['confirmation_count'] = confirmation_count + 1");
  lines.push("            else:");
  lines.push("                new_state['confirmation_count'] = 0");
  lines.push("");
  lines.push(`            if new_state['confirmation_count'] >= ${confirmationBars}:`);
  lines.push("                should_enter = True");
  lines.push("                new_state['confirmation_count'] = 0");
  lines.push("");

  // Exit logic
  lines.push("    else:");
  lines.push("        entry_price = position.get('entry_price', 0)");
  lines.push("        current_price = features.get('current_price', entry_price)");
  lines.push("");

  if (strategy.direction === 'LONG') {
    lines.push("        pnl_percent = ((current_price - entry_price) / entry_price) * 100 if entry_price > 0 else 0");
  } else {
    lines.push("        pnl_percent = ((entry_price - current_price) / entry_price) * 100 if entry_price > 0 else 0");
  }

  lines.push("");

  const slValue = strategy.exit_logic.stop_loss.value;
  const tpValue = strategy.exit_logic.take_profit.value;

  lines.push(`        if pnl_percent <= -${slValue}:`);
  lines.push("            should_exit = True");
  lines.push("            exit_reason = 'STOP_LOSS'");
  lines.push(`            new_state['cooldown_remaining'] = ${cooldownRequired}`);
  lines.push(`        elif pnl_percent >= ${tpValue}:`);
  lines.push("            should_exit = True");
  lines.push("            exit_reason = 'TARGET'");
  lines.push("            new_state['cooldown_remaining'] = 0");

  if (strategy.exit_logic.time_exit_minutes) {
    lines.push("        else:");
    lines.push("            holding_minutes = position.get('holding_minutes', 0)");
    lines.push(`            if holding_minutes >= ${strategy.exit_logic.time_exit_minutes}:`);
    lines.push("                should_exit = True");
    lines.push("                exit_reason = 'TIME_EXIT'");
    lines.push("                new_state['cooldown_remaining'] = 0");
  }

  lines.push("");
  lines.push("    return {");
  lines.push("        'enter': should_enter,");
  lines.push("        'exit': should_exit,");
  lines.push("        'exit_reason': exit_reason,");
  lines.push("        'state': new_state");
  lines.push("    }");

  return lines.join('\n');
}

// ==========================================
// RISK GRADE CALCULATOR
// ==========================================

function calculateRiskGrade(strategy: Strategy): string {
  let score = 0;

  if (strategy.risk.max_risk_per_trade_percent > 1.5) score += 2;
  else if (strategy.risk.max_risk_per_trade_percent > 1.0) score += 1;

  if (strategy.asset_class === 'OPTIONS') score += 2;
  else if (strategy.asset_class === 'FUTURES') score += 1;

  if (strategy.exit_logic.stop_loss.value < 0.5) score += 1;
  if (strategy.holding_type === 'SWING') score += 1;

  if (strategy.futures && strategy.futures.max_leverage > 2) score += 1;

  if (score >= 4) return "HIGH";
  if (score >= 2) return "MEDIUM";
  return "LOW";
}

// ==========================================
// HASH GENERATOR
// ==========================================

async function generateHash(data: any): Promise<string> {
  const encoder = new TextEncoder();
  const dataStr = JSON.stringify(data, Object.keys(data).sort());
  const dataBytes = encoder.encode(dataStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==========================================
// CAPABILITIES EXTRACTOR
// ==========================================

function extractCapabilities(strategy: Strategy): string[] {
  const capabilities: string[] = [];

  if (strategy.direction === 'LONG') capabilities.push('LONG_ONLY');
  else if (strategy.direction === 'SHORT') capabilities.push('SHORT_ONLY');
  else capabilities.push('BIDIRECTIONAL');

  const needsRegime = strategy.entry_logic.conditions.some(c => c.feature === 'market_regime');
  if (needsRegime || (strategy.filters.avoid_market_regime && strategy.filters.avoid_market_regime.length > 0)) {
    capabilities.push('REQUIRES_MARKET_REGIME');
  }

  if (strategy.confirmation.bars > 1) capabilities.push('USES_CONFIRMATION');
  if (strategy.confirmation.cooldown_bars > 0) capabilities.push('USES_COOLDOWN');

  if (strategy.asset_class === 'FUTURES') capabilities.push('FUTURES_TRADING');
  if (strategy.asset_class === 'OPTIONS') capabilities.push('OPTIONS_TRADING');

  return capabilities;
}

// ==========================================
// MAIN HANDLER
// ==========================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userInput, strategyJson, userId } = await req.json();

    if (action === 'scan_prompt') {
      // Just scan the prompt without compiling
      const result = scanPrompt(userInput);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === 'validate') {
      // Validate an existing strategy JSON
      if (!strategyJson) {
        return new Response(JSON.stringify({ error: "Missing strategyJson" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const validation = validateStrategy(strategyJson);
      const riskGrade = calculateRiskGrade(strategyJson);
      const strategyHash = await generateHash(strategyJson);

      return new Response(JSON.stringify({
        ...validation,
        risk_grade: riskGrade,
        strategy_version: strategyHash,
        validated_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === 'compile') {
      // Full compilation: scan -> parse -> validate -> generate code
      if (!userInput) {
        return new Response(JSON.stringify({ error: "Missing userInput" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Step 1: Firewall scan
      const firewallResult = scanPrompt(userInput);
      if (!firewallResult.passed) {
        return new Response(JSON.stringify({
          status: "REJECTED",
          reason: firewallResult.message,
          rejected_at: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Step 2: Parse user input
      const strategy = parseUserInput(userInput);

      // Step 3: Add metadata
      const promptHash = await generateHash(userInput);
      strategy.metadata = {
        created_by: userId || "anonymous",
        created_from_prompt_hash: promptHash,
        validator_version: VERSION,
        compiler_version: VERSION
      };

      // Step 4: Extract capabilities
      strategy.capabilities = extractCapabilities(strategy);

      // Step 5: Validate
      const validation = validateStrategy(strategy);

      if (validation.status === "REJECTED") {
        return new Response(JSON.stringify({
          status: "REJECTED",
          errors: validation.errors,
          warnings: validation.warnings,
          rejected_at: new Date().toISOString(),
          partial_strategy: strategy
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Step 6: Generate code
      const pythonCode = generatePythonCode(strategy);

      // Step 7: Calculate risk grade and hash
      const riskGrade = calculateRiskGrade(strategy);
      const strategyHash = await generateHash(strategy);

      return new Response(JSON.stringify({
        status: "VALID",
        strategy_json: strategy,
        python_code: pythonCode,
        validation: {
          status: "VALID",
          warnings: validation.warnings,
          risk_grade: riskGrade,
          strategy_version: strategyHash,
          validated_at: new Date().toISOString()
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === 'generate_code') {
      // Generate Python code from existing strategy JSON
      if (!strategyJson) {
        return new Response(JSON.stringify({ error: "Missing strategyJson" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const pythonCode = generatePythonCode(strategyJson);
      return new Response(JSON.stringify({ python_code: pythonCode }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === 'get_schema') {
      // Return allowed features, operators, etc.
      return new Response(JSON.stringify({
        version: VERSION,
        allowed_features: Array.from(ALLOWED_FEATURES),
        runtime_features: Array.from(RUNTIME_FEATURES),
        allowed_operators: Array.from(ALLOWED_OPERATORS),
        asset_classes: Array.from(ASSET_CLASSES),
        markets: Array.from(MARKETS),
        timeframes: Array.from(TIMEFRAMES),
        holding_types: Array.from(HOLDING_TYPES),
        directions: Array.from(DIRECTIONS),
        market_regimes: Array.from(MARKET_REGIMES),
        hard_caps: HARD_CAPS,
        options_safe_strategies: Array.from(OPTIONS_SAFE_STRATEGIES),
        options_restricted_strategies: Array.from(OPTIONS_RESTRICTED_STRATEGIES)
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Strategy compiler error:", error);
    return new Response(JSON.stringify({ 
      error: "COMPILATION_FAILED",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
