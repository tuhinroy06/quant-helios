import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// ENUMS & TYPES
// ============================================================================

enum PrimaryCause {
  USER_INTERVENTION = "USER_INTERVENTION",
  RISK_CONTROL = "RISK_CONTROL",
  EXECUTION = "EXECUTION",
  STRATEGY_LOGIC = "STRATEGY_LOGIC",
  TIME_DECAY = "TIME_DECAY",
  MARKET_MOVE = "MARKET_MOVE"
}

enum ContributingFactor {
  SLIPPAGE = "SLIPPAGE",
  LATE_ENTRY = "LATE_ENTRY",
  EARLY_EXIT = "EARLY_EXIT",
  VOLATILITY_EXPANSION = "VOLATILITY_EXPANSION",
  LIQUIDITY_DROP = "LIQUIDITY_DROP",
  SPREAD_WIDENING = "SPREAD_WIDENING",
  PARTIAL_FILL = "PARTIAL_FILL",
  RISK_LIMIT_HIT = "RISK_LIMIT_HIT"
}

enum RuledOutCause {
  NOT_MARKET_MANIPULATION = "NOT_MARKET_MANIPULATION",
  NOT_SYSTEM_FAILURE = "NOT_SYSTEM_FAILURE",
  NOT_STRATEGY_BUG = "NOT_STRATEGY_BUG",
  NOT_USER_ERROR = "NOT_USER_ERROR",
  NOT_DATA_ISSUE = "NOT_DATA_ISSUE"
}

enum ExecutionSubType {
  SLIPPAGE = "SLIPPAGE",
  LIQUIDITY = "LIQUIDITY",
  PARTIAL_FILL = "PARTIAL_FILL",
  SPREAD = "SPREAD"
}

interface TradeOutcome {
  realized_pnl: number;
  return_pct: number;
  duration_seconds: number;
  entry_price: number;
  exit_price: number;
  quantity: number;
}

interface Evidence {
  timestamps: Record<string, string>;
  prices: Record<string, number>;
  risk_events: Array<{ type: string; occurred: boolean }>;
  market_conditions: Record<string, number>;
  execution_metrics: Record<string, number>;
}

interface Counterfactual {
  pnl_if_no_slippage?: number;
  pnl_if_exit_rule_followed?: number;
  pnl_if_full_fill?: number;
  pnl_if_ideal_timing?: number;
}

interface AttributionReport {
  trade_id: string;
  user_id: string;
  strategy_id: string;
  instrument: string;
  outcome: TradeOutcome;
  primary_cause: PrimaryCause;
  execution_sub_type: ExecutionSubType | null;
  contributing_factors: ContributingFactor[];
  ruled_out_causes: RuledOutCause[];
  counterfactuals: Counterfactual;
  confidence_score: number;
  evidence: Evidence;
  generated_at: string;
  determinism_hash: string;
}

interface TradeInputData {
  trade_id: string;
  user_id: string;
  strategy_id: string;
  instrument: string;
  instrument_type: 'stock' | 'option' | 'future';
  
  // Trade lifecycle
  entry_time: string;
  exit_time: string;
  entry_price: number;
  exit_price: number;
  intended_entry_price: number;
  intended_exit_price?: number;
  quantity: number;
  intended_quantity: number;
  
  // Strategy config
  stop_loss?: number;
  take_profit?: number;
  max_duration?: number;
  
  // Execution data
  actual_slippage: number;
  allowed_slippage: number;
  fill_quality: number;
  
  // Market data
  volatility_at_entry: number;
  volatility_at_exit: number;
  avg_historical_volatility: number;
  volatility_zscore: number;
  liquidity_score: number;
  spread_at_execution: number;
  
  // Risk events
  stop_loss_hit: boolean;
  take_profit_hit: boolean;
  risk_limit_triggered: boolean;
  user_override: boolean;
  
  // Market conditions
  price_reached_target_later: boolean;
  market_moved_against_entry: number;
  
  // Options-specific
  theta_decay?: number;
  days_to_expiry?: number;
  expiry_pressure?: number;
}

interface ExplanationScopeContract {
  primary_cause: PrimaryCause;
  execution_sub_type: ExecutionSubType | null;
  allowed_system_references: string[];
  forbidden_system_blame: string[];
}

interface LLMExplanationContract {
  allowed_facts: Record<string, unknown>;
  forbidden_topics: string[];
  scope_contract: ExplanationScopeContract | null;
  tone: 'neutral' | 'educational';
  explanation_goals: string[];
  refusal_conditions: Record<string, unknown>;
  required_references: Record<string, string>;
  validation_requirements: Record<string, boolean>;
}

interface EngineConfig {
  volatility_expansion_threshold: number;
  slippage_threshold: number;
  liquidity_threshold: number;
  min_confidence_score: number;
  market_move_zscore_threshold: number;
  theta_decay_threshold: number;
}

// ============================================================================
// OUTCOME ATTRIBUTION ENGINE
// ============================================================================

class OutcomeAttributionEngine {
  private config: EngineConfig;

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = {
      volatility_expansion_threshold: config.volatility_expansion_threshold ?? 0.15,
      slippage_threshold: config.slippage_threshold ?? 0.02,
      liquidity_threshold: config.liquidity_threshold ?? 0.5,
      min_confidence_score: config.min_confidence_score ?? 0.6,
      market_move_zscore_threshold: config.market_move_zscore_threshold ?? 2.0,
      theta_decay_threshold: config.theta_decay_threshold ?? 0.05
    };
  }

  attributeOutcome(tradeData: TradeInputData): AttributionReport {
    console.log(`[OAE] Attributing outcome for trade ${tradeData.trade_id}`);
    
    // Calculate outcome metrics
    const outcome = this.calculateOutcome(tradeData);
    
    // Determine primary cause with execution sub-type
    const { primaryCause, executionSubType } = this.determinePrimaryCause(tradeData, outcome);
    
    // Identify contributing factors
    const contributingFactors = this.identifyContributingFactors(tradeData);
    
    // Rule out false causes
    const ruledOut = this.ruleOutCauses(tradeData);
    
    // Calculate counterfactuals
    const counterfactuals = this.calculateCounterfactuals(tradeData, outcome);
    
    // Build evidence
    const evidence = this.buildEvidence(tradeData);
    
    // Calculate confidence with penalties
    const confidence = this.calculateConfidence(tradeData, primaryCause, contributingFactors);
    
    const generatedAt = new Date().toISOString();
    
    // Create report
    const report: AttributionReport = {
      trade_id: tradeData.trade_id,
      user_id: tradeData.user_id,
      strategy_id: tradeData.strategy_id,
      instrument: tradeData.instrument,
      outcome,
      primary_cause: primaryCause,
      execution_sub_type: executionSubType,
      contributing_factors: contributingFactors,
      ruled_out_causes: ruledOut,
      counterfactuals,
      confidence_score: confidence,
      evidence,
      generated_at: generatedAt,
      determinism_hash: ''
    };
    
    // Generate determinism hash
    report.determinism_hash = this.generateHash(report);
    
    console.log(`[OAE] Attribution complete: ${primaryCause}, confidence: ${confidence.toFixed(2)}`);
    
    return report;
  }

  private calculateOutcome(td: TradeInputData): TradeOutcome {
    const pnl = (td.exit_price - td.entry_price) * td.quantity;
    const returnPct = ((td.exit_price - td.entry_price) / td.entry_price) * 100;
    const entryTime = new Date(td.entry_time).getTime();
    const exitTime = new Date(td.exit_time).getTime();
    const duration = Math.floor((exitTime - entryTime) / 1000);
    
    return {
      realized_pnl: pnl,
      return_pct: returnPct,
      duration_seconds: duration,
      entry_price: td.entry_price,
      exit_price: td.exit_price,
      quantity: td.quantity
    };
  }

  private determinePrimaryCause(
    td: TradeInputData, 
    outcome: TradeOutcome
  ): { primaryCause: PrimaryCause; executionSubType: ExecutionSubType | null } {
    /**
     * CRITICAL: Priority order is MANDATORY and EXPLICIT
     * 
     * Priority Order (NEVER violate):
     * 1. USER_INTERVENTION
     * 2. RISK_CONTROL
     * 3. TIME_DECAY (options)
     * 4. EXECUTION
     * 5. STRATEGY_LOGIC
     * 6. MARKET_MOVE (only if statistically exceptional)
     */
    
    // PRIORITY 1: USER_INTERVENTION (highest priority)
    if (td.user_override) {
      return { primaryCause: PrimaryCause.USER_INTERVENTION, executionSubType: null };
    }
    
    // PRIORITY 2: RISK_CONTROL
    if (td.stop_loss_hit || td.risk_limit_triggered) {
      return { primaryCause: PrimaryCause.RISK_CONTROL, executionSubType: null };
    }
    
    if (td.take_profit_hit) {
      return { primaryCause: PrimaryCause.RISK_CONTROL, executionSubType: null };
    }
    
    // PRIORITY 3: TIME_DECAY (options-specific)
    if (td.instrument_type === 'option' && td.theta_decay !== undefined) {
      const thetaImpactPct = outcome.realized_pnl !== 0 
        ? Math.abs(td.theta_decay / outcome.realized_pnl) 
        : 0;
      
      if (thetaImpactPct > this.config.theta_decay_threshold) {
        return { primaryCause: PrimaryCause.TIME_DECAY, executionSubType: null };
      }
      
      if (td.days_to_expiry && td.days_to_expiry <= 5 && 
          td.expiry_pressure && td.expiry_pressure > 0.3) {
        return { primaryCause: PrimaryCause.TIME_DECAY, executionSubType: null };
      }
    }
    
    // PRIORITY 4: EXECUTION
    const executionIssues: ExecutionSubType[] = [];
    
    // Slippage breach
    if (Math.abs(td.actual_slippage) > td.allowed_slippage) {
      executionIssues.push(ExecutionSubType.SLIPPAGE);
    }
    
    // Liquidity issues
    if (td.liquidity_score < this.config.liquidity_threshold) {
      executionIssues.push(ExecutionSubType.LIQUIDITY);
    }
    
    // Partial fill
    if (td.quantity < td.intended_quantity * 0.95) {
      executionIssues.push(ExecutionSubType.PARTIAL_FILL);
    }
    
    // Spread issues
    const spreadPct = td.spread_at_execution / td.intended_entry_price;
    if (spreadPct > 0.002) {
      executionIssues.push(ExecutionSubType.SPREAD);
    }
    
    if (executionIssues.length > 0) {
      // Choose most impactful sub-type
      let subType = ExecutionSubType.SPREAD;
      if (executionIssues.includes(ExecutionSubType.SLIPPAGE)) {
        subType = ExecutionSubType.SLIPPAGE;
      } else if (executionIssues.includes(ExecutionSubType.LIQUIDITY)) {
        subType = ExecutionSubType.LIQUIDITY;
      } else if (executionIssues.includes(ExecutionSubType.PARTIAL_FILL)) {
        subType = ExecutionSubType.PARTIAL_FILL;
      }
      
      return { primaryCause: PrimaryCause.EXECUTION, executionSubType: subType };
    }
    
    // PRIORITY 5: STRATEGY_LOGIC
    if (!td.stop_loss_hit && !td.take_profit_hit && 
        td.price_reached_target_later && !td.risk_limit_triggered) {
      return { primaryCause: PrimaryCause.STRATEGY_LOGIC, executionSubType: null };
    }
    
    if (td.intended_exit_price && !td.take_profit_hit) {
      const direction = td.exit_price > td.entry_price ? 1 : -1;
      const intendedDirection = td.intended_exit_price > td.entry_price ? 1 : -1;
      
      if (direction === intendedDirection && 
          Math.abs(td.exit_price - td.entry_price) < Math.abs(td.intended_exit_price - td.entry_price)) {
        return { primaryCause: PrimaryCause.STRATEGY_LOGIC, executionSubType: null };
      }
    }
    
    // PRIORITY 6: MARKET_MOVE (ONLY if statistically exceptional)
    if (td.volatility_zscore > this.config.market_move_zscore_threshold) {
      const volatilityExpansion = (td.volatility_at_exit - td.avg_historical_volatility) / 
                                   td.avg_historical_volatility;
      
      if (volatilityExpansion > this.config.volatility_expansion_threshold) {
        return { primaryCause: PrimaryCause.MARKET_MOVE, executionSubType: null };
      }
    }
    
    if (td.stop_loss && Math.abs(td.market_moved_against_entry) > Math.abs(td.stop_loss) * 1.5) {
      if (!td.stop_loss_hit) {
        return { primaryCause: PrimaryCause.MARKET_MOVE, executionSubType: null };
      }
    }
    
    // DEFAULT: STRATEGY_LOGIC (correct fallback, not MARKET_MOVE)
    return { primaryCause: PrimaryCause.STRATEGY_LOGIC, executionSubType: null };
  }

  private identifyContributingFactors(td: TradeInputData): ContributingFactor[] {
    const factors: ContributingFactor[] = [];
    
    // Slippage
    if (Math.abs(td.actual_slippage) > 0) {
      factors.push(ContributingFactor.SLIPPAGE);
    }
    
    // Volatility expansion
    const volChange = (td.volatility_at_exit - td.volatility_at_entry) / td.volatility_at_entry;
    if (volChange > this.config.volatility_expansion_threshold) {
      factors.push(ContributingFactor.VOLATILITY_EXPANSION);
    }
    
    // Liquidity
    if (td.liquidity_score < this.config.liquidity_threshold) {
      factors.push(ContributingFactor.LIQUIDITY_DROP);
    }
    
    // Early exit
    if (td.price_reached_target_later && !td.take_profit_hit) {
      factors.push(ContributingFactor.EARLY_EXIT);
    }
    
    // Partial fill
    if (td.quantity < td.intended_quantity) {
      factors.push(ContributingFactor.PARTIAL_FILL);
    }
    
    // Spread widening
    if (td.spread_at_execution > td.intended_entry_price * 0.001) {
      factors.push(ContributingFactor.SPREAD_WIDENING);
    }
    
    // Risk limit
    if (td.risk_limit_triggered) {
      factors.push(ContributingFactor.RISK_LIMIT_HIT);
    }
    
    return factors;
  }

  private ruleOutCauses(td: TradeInputData): RuledOutCause[] {
    const ruledOut: RuledOutCause[] = [];
    
    // Always rule out manipulation
    ruledOut.push(RuledOutCause.NOT_MARKET_MANIPULATION);
    
    // System failure (if fills executed properly)
    if (td.fill_quality > 0.8) {
      ruledOut.push(RuledOutCause.NOT_SYSTEM_FAILURE);
    }
    
    // Strategy bug (if logic followed correctly)
    if (!td.user_override) {
      ruledOut.push(RuledOutCause.NOT_STRATEGY_BUG);
    }
    
    ruledOut.push(RuledOutCause.NOT_DATA_ISSUE);
    
    return ruledOut;
  }

  private calculateCounterfactuals(td: TradeInputData, outcome: TradeOutcome): Counterfactual {
    const cf: Counterfactual = {};
    
    // If no slippage
    if (td.actual_slippage !== 0) {
      cf.pnl_if_no_slippage = outcome.realized_pnl + (td.actual_slippage * td.quantity);
    }
    
    // If exit rule followed
    if (td.intended_exit_price && td.price_reached_target_later) {
      cf.pnl_if_exit_rule_followed = (td.intended_exit_price - td.entry_price) * td.quantity;
    }
    
    // If full fill
    if (td.quantity < td.intended_quantity) {
      cf.pnl_if_full_fill = outcome.realized_pnl * (td.intended_quantity / td.quantity);
    }
    
    return cf;
  }

  private buildEvidence(td: TradeInputData): Evidence {
    return {
      timestamps: {
        entry: td.entry_time,
        exit: td.exit_time
      },
      prices: {
        entry: td.entry_price,
        exit: td.exit_price,
        intended_entry: td.intended_entry_price
      },
      risk_events: [
        { type: 'stop_loss_hit', occurred: td.stop_loss_hit },
        { type: 'take_profit_hit', occurred: td.take_profit_hit },
        { type: 'risk_limit', occurred: td.risk_limit_triggered }
      ],
      market_conditions: {
        volatility_entry: td.volatility_at_entry,
        volatility_exit: td.volatility_at_exit,
        liquidity_score: td.liquidity_score
      },
      execution_metrics: {
        slippage: td.actual_slippage,
        fill_quality: td.fill_quality,
        quantity_filled: td.quantity,
        quantity_intended: td.intended_quantity
      }
    };
  }

  private calculateConfidence(
    td: TradeInputData,
    cause: PrimaryCause,
    contributingFactors: ContributingFactor[]
  ): number {
    let confidence = 1.0;
    
    // Base data quality penalties
    if (td.fill_quality < 0.9) {
      confidence *= 0.9;
    }
    
    if (td.liquidity_score < 0.6) {
      confidence *= 0.85;
    }
    
    // Multiple contributing factors penalty
    if (contributingFactors.length >= 3) {
      confidence *= 0.8;
    } else if (contributingFactors.length >= 2) {
      confidence *= 0.9;
    }
    
    // Partial fills + slippage combination
    const hasPartialFill = td.quantity < td.intended_quantity * 0.95;
    const hasSlippage = Math.abs(td.actual_slippage) > td.allowed_slippage;
    
    if (hasPartialFill && hasSlippage) {
      confidence *= 0.7;
    }
    
    // Strategy logic inference (harder to be certain)
    if (cause === PrimaryCause.STRATEGY_LOGIC) {
      confidence *= 0.75;
    }
    
    // Counterfactual dependency
    if (cause === PrimaryCause.STRATEGY_LOGIC && td.price_reached_target_later) {
      confidence *= 0.85;
    }
    
    // Low liquidity during execution
    if (cause === PrimaryCause.EXECUTION && td.liquidity_score < 0.5) {
      confidence *= 0.8;
    }
    
    // Market move without strong statistical signal
    if (cause === PrimaryCause.MARKET_MOVE && 
        td.volatility_zscore < this.config.market_move_zscore_threshold) {
      confidence *= 0.7;
    }
    
    // Conflicting signals
    let conflictingCount = 0;
    if (hasSlippage) conflictingCount++;
    if (td.stop_loss_hit) conflictingCount++;
    if (td.price_reached_target_later) conflictingCount++;
    
    if (conflictingCount >= 2) {
      confidence *= 0.85;
    }
    
    return Math.max(Math.min(confidence, 1.0), 0.0);
  }

  private generateHash(report: AttributionReport): string {
    const hashInput = `${report.trade_id}_${report.primary_cause}_${report.outcome.realized_pnl}_${report.generated_at}`;
    
    // Simple hash for edge function (deterministic)
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16).padStart(16, '0').slice(0, 16);
  }
}

// ============================================================================
// LLM CONTRACT BINDER
// ============================================================================

class LLMContractBinder {
  private minConfidence: number;

  constructor(minConfidence: number = 0.6) {
    this.minConfidence = minConfidence;
  }

  createContract(report: AttributionReport): LLMExplanationContract {
    // Check refusal conditions first
    if (report.confidence_score < this.minConfidence) {
      return this.createRefusalContract(report, 'confidence_too_low');
    }
    
    // Build allowed facts
    const allowedFacts: Record<string, unknown> = {
      trade_id: report.trade_id,
      instrument: report.instrument,
      outcome: {
        pnl: report.outcome.realized_pnl,
        return_pct: report.outcome.return_pct,
        duration_seconds: report.outcome.duration_seconds
      },
      primary_cause: report.primary_cause,
      contributing_factors: report.contributing_factors,
      ruled_out_causes: report.ruled_out_causes,
      counterfactuals: report.counterfactuals,
      confidence_score: report.confidence_score
    };
    
    // Create scope contract
    const scopeContract: ExplanationScopeContract = {
      primary_cause: report.primary_cause,
      execution_sub_type: report.execution_sub_type,
      allowed_system_references: [],
      forbidden_system_blame: [
        'platform_caused',
        'system_failure',
        'software_bug',
        'connection_issue',
        'data_feed_problem'
      ]
    };
    
    return {
      allowed_facts: allowedFacts,
      forbidden_topics: [
        'future_prediction',
        'blame_assignment',
        'alternative_causes',
        'market_timing_advice',
        'guaranteed_outcomes',
        'counterfactual_advice'
      ],
      scope_contract: scopeContract,
      tone: 'neutral',
      explanation_goals: [
        'explain_why_profit_or_loss',
        'explain_trade_behavior',
        'clarify_attribution'
      ],
      refusal_conditions: {
        min_confidence: this.minConfidence,
        current_confidence: report.confidence_score
      },
      required_references: {
        hash: report.determinism_hash,
        timestamp: report.generated_at
      },
      validation_requirements: {
        must_mention_primary_cause: true,
        must_include_numeric_reference: true,
        must_reference_attribution_hash: true
      }
    };
  }

  private createRefusalContract(report: AttributionReport, reason: string): LLMExplanationContract {
    return {
      allowed_facts: {
        refusal_reason: reason,
        confidence_score: report.confidence_score,
        min_required: this.minConfidence
      },
      forbidden_topics: [],
      scope_contract: null,
      tone: 'neutral',
      explanation_goals: ['refuse_politely'],
      refusal_conditions: { must_refuse: true },
      required_references: {},
      validation_requirements: {}
    };
  }

  validateLLMResponse(response: string, contract: LLMExplanationContract): { 
    isValid: boolean; 
    violations: string[] 
  } {
    const violations: string[] = [];
    const responseLower = response.toLowerCase();
    
    // MANDATORY REQUIREMENT CHECKS
    
    // 1. Must mention primary cause
    if (contract.validation_requirements.must_mention_primary_cause) {
      const primaryCauseValue = String(contract.allowed_facts.primary_cause || '')
        .toLowerCase().replace(/_/g, ' ');
      if (primaryCauseValue && !responseLower.includes(primaryCauseValue)) {
        violations.push(`Missing required primary cause mention: ${primaryCauseValue}`);
      }
    }
    
    // 2. Must include numeric reference
    if (contract.validation_requirements.must_include_numeric_reference) {
      const numericPatterns = [
        /\$[\d,]+\.?\d*/,
        /[\d,]+\.?\d*%/,
        /[\d,]+\.?\d+ (dollars|USD|points)/i
      ];
      const hasNumeric = numericPatterns.some(pattern => pattern.test(response));
      if (!hasNumeric) {
        violations.push('Missing required numeric reference (PnL, price, or percentage)');
      }
    }
    
    // 3. Must reference attribution hash
    if (contract.validation_requirements.must_reference_attribution_hash) {
      const attributionHash = contract.required_references.hash;
      if (attributionHash && !response.includes(attributionHash)) {
        violations.push(`Missing required attribution hash reference: ${attributionHash}`);
      }
    }
    
    // FORBIDDEN TOPICS CHECKS
    const forbiddenKeywords: Record<string, string[]> = {
      future_prediction: [
        'will happen', 'going to', 'will be', 'predict', 'forecast',
        'next time', 'in the future', 'tomorrow', 'soon'
      ],
      blame_assignment: [
        'your fault', 'you caused', 'you should have', 'your mistake',
        'you failed', 'your error'
      ],
      alternative_causes: [
        'could have been caused by', 'might have been due to',
        'possibly because of', 'maybe it was'
      ],
      market_timing_advice: [
        'should enter at', 'should exit when', 'better to buy',
        'next time enter', 'wait for', 'time your entry'
      ],
      guaranteed_outcomes: [
        'will definitely', 'guaranteed to', 'always results in',
        'never fails', 'certain to'
      ],
      counterfactual_advice: [
        'you would have made', 'you should have', 'would have been better',
        'could have profited', "should've", "would've made more"
      ]
    };
    
    for (const topic of contract.forbidden_topics) {
      if (forbiddenKeywords[topic]) {
        for (const keyword of forbiddenKeywords[topic]) {
          if (responseLower.includes(keyword)) {
            violations.push(`Forbidden topic '${topic}' detected: '${keyword}'`);
          }
        }
      }
    }
    
    // SYSTEM BOUNDARY CHECKS
    if (contract.scope_contract) {
      const systemBlameKeywords = [
        'platform caused', 'system failure', 'software bug',
        'connection issue', 'data feed problem', 'system error',
        'platform error', 'technical glitch'
      ];
      for (const keyword of systemBlameKeywords) {
        if (responseLower.includes(keyword)) {
          violations.push(`Forbidden system blame detected: '${keyword}'`);
        }
      }
    }
    
    // COUNTERFACTUAL SAFETY CHECKS
    const counterfactuals = contract.allowed_facts.counterfactuals as Record<string, unknown> | undefined;
    if (counterfactuals && Object.keys(counterfactuals).length > 0) {
      const advisoryPhrases = [
        'you would have', 'should have', 'would have been better',
        'could have made more', 'better outcome if'
      ];
      for (const phrase of advisoryPhrases) {
        if (responseLower.includes(phrase)) {
          violations.push(`Counterfactual used as advice (forbidden): '${phrase}'`);
        }
      }
    }
    
    // CONTRADICTION CHECKS
    const ruledOut = (contract.allowed_facts.ruled_out_causes as string[] || [])
      .map(r => r.toLowerCase());
    
    const alternativeCauseKeywords = [
      'manipulation', 'fraud', 'insider', 'conspiracy',
      'algorithm bias', 'market maker'
    ];
    
    for (const altCause of alternativeCauseKeywords) {
      if (responseLower.includes(altCause)) {
        if (ruledOut.some(item => item.includes(altCause))) {
          violations.push(`Mentioned ruled-out cause: '${altCause}'`);
        } else {
          violations.push(`Introduced alternative cause not in report: '${altCause}'`);
        }
      }
    }
    
    return {
      isValid: violations.length === 0,
      violations
    };
  }

  generateSystemPrompt(contract: LLMExplanationContract): string {
    const scopeRules = contract.scope_contract 
      ? 'FORBIDDEN: Do not blame platform, system, or infrastructure. Focus only on trade-level causes.'
      : '';
    
    return `You are a trade attribution explanation system.

ALLOWED FACTS ONLY:
${JSON.stringify(contract.allowed_facts, null, 2)}

FORBIDDEN TOPICS:
${contract.forbidden_topics.join(', ')}

SYSTEM BOUNDARY RULES:
${scopeRules}

COUNTERFACTUAL USAGE RULES (CRITICAL):
- Counterfactuals may be DESCRIBED objectively
- Counterfactuals must NEVER be RECOMMENDED or used as advice
- FORBIDDEN: "You would have made more money if..."
- ALLOWED: "Under the scenario where X occurred, the outcome would have been Y"
- Frame as educational reference, not advisory

STRICT RULES:
1. You CANNOT introduce new causes
2. You CANNOT contradict the attribution report
3. You CANNOT speculate about future outcomes
4. You MUST cite attribution fields
5. You MUST refuse if confidence < ${contract.refusal_conditions.min_confidence ?? 0.6}
6. Tone: ${contract.tone}

MANDATORY REQUIREMENTS:
- MUST mention primary cause: ${contract.validation_requirements.must_mention_primary_cause ?? true}
- MUST include numeric reference (PnL or price): ${contract.validation_requirements.must_include_numeric_reference ?? true}
- MUST reference attribution hash: ${contract.validation_requirements.must_reference_attribution_hash ?? true}

REQUIRED REFERENCES:
- Attribution Hash: ${contract.required_references.hash ?? 'N/A'}
- Generated At: ${contract.required_references.timestamp ?? 'N/A'}

Explain the trade outcome based ONLY on the allowed facts above.
Every sentence must be traceable to the attribution report.`;
  }
}

// ============================================================================
// HTTP HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body safely
    let body: Record<string, unknown> = {};
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const text = await req.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    }

    const action = body.action as string;
    console.log(`[OAE] Action: ${action}`);

    switch (action) {
      case 'attribute_outcome': {
        const tradeData = body.trade_data as TradeInputData;
        const config = body.config as Partial<EngineConfig> | undefined;
        const store = body.store !== false;
        
        if (!tradeData) {
          throw new Error('trade_data is required');
        }
        
        const engine = new OutcomeAttributionEngine(config);
        const report = engine.attributeOutcome(tradeData);
        
        // Store in database if requested
        if (store) {
          const { error: insertError } = await supabase
            .from('attribution_reports')
            .upsert({
              trade_id: report.trade_id,
              user_id: report.user_id,
              strategy_id: report.strategy_id,
              instrument: report.instrument,
              realized_pnl: report.outcome.realized_pnl,
              return_pct: report.outcome.return_pct,
              duration_seconds: report.outcome.duration_seconds,
              entry_price: report.outcome.entry_price,
              exit_price: report.outcome.exit_price,
              quantity: report.outcome.quantity,
              primary_cause: report.primary_cause,
              execution_sub_type: report.execution_sub_type,
              contributing_factors: report.contributing_factors,
              ruled_out_causes: report.ruled_out_causes,
              counterfactuals: report.counterfactuals,
              confidence_score: report.confidence_score,
              evidence: report.evidence,
              determinism_hash: report.determinism_hash,
              generated_at: report.generated_at
            }, { onConflict: 'trade_id' });
          
          if (insertError) {
            console.error('[OAE] Failed to store report:', insertError);
          }
        }
        
        return new Response(
          JSON.stringify({ success: true, report }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_llm_contract': {
        const reportId = body.report_id as string;
        const report = body.report as AttributionReport | undefined;
        const minConfidence = body.min_confidence as number | undefined;
        
        let attributionReport = report;
        
        // Fetch from database if report_id provided
        if (reportId && !attributionReport) {
          const { data, error } = await supabase
            .from('attribution_reports')
            .select('*')
            .eq('id', reportId)
            .single();
          
          if (error || !data) {
            throw new Error(`Attribution report not found: ${reportId}`);
          }
          
          attributionReport = {
            trade_id: data.trade_id,
            user_id: data.user_id,
            strategy_id: data.strategy_id,
            instrument: data.instrument,
            outcome: {
              realized_pnl: parseFloat(data.realized_pnl),
              return_pct: parseFloat(data.return_pct),
              duration_seconds: data.duration_seconds,
              entry_price: parseFloat(data.entry_price),
              exit_price: parseFloat(data.exit_price),
              quantity: parseFloat(data.quantity)
            },
            primary_cause: data.primary_cause as PrimaryCause,
            execution_sub_type: data.execution_sub_type as ExecutionSubType | null,
            contributing_factors: data.contributing_factors as ContributingFactor[],
            ruled_out_causes: data.ruled_out_causes as RuledOutCause[],
            counterfactuals: data.counterfactuals as Counterfactual,
            confidence_score: parseFloat(data.confidence_score),
            evidence: data.evidence as Evidence,
            generated_at: data.generated_at,
            determinism_hash: data.determinism_hash
          };
        }
        
        if (!attributionReport) {
          throw new Error('report or report_id is required');
        }
        
        const binder = new LLMContractBinder(minConfidence);
        const contract = binder.createContract(attributionReport);
        const systemPrompt = binder.generateSystemPrompt(contract);
        
        // Store contract
        const { data: contractData, error: contractError } = await supabase
          .from('llm_explanation_contracts')
          .insert({
            attribution_report_id: reportId || null,
            user_id: attributionReport.user_id,
            allowed_facts: contract.allowed_facts,
            forbidden_topics: contract.forbidden_topics,
            scope_contract: contract.scope_contract,
            tone: contract.tone,
            explanation_goals: contract.explanation_goals,
            refusal_conditions: contract.refusal_conditions,
            required_references: contract.required_references,
            validation_requirements: contract.validation_requirements
          })
          .select()
          .single();
        
        if (contractError) {
          console.error('[OAE] Failed to store contract:', contractError);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            contract,
            system_prompt: systemPrompt,
            contract_id: contractData?.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'validate_llm_response': {
        const contractId = body.contract_id as string;
        const contract = body.contract as LLMExplanationContract | undefined;
        const llmResponse = body.llm_response as string;
        
        if (!llmResponse) {
          throw new Error('llm_response is required');
        }
        
        let validationContract = contract;
        
        // Fetch from database if contract_id provided
        if (contractId && !validationContract) {
          const { data, error } = await supabase
            .from('llm_explanation_contracts')
            .select('*')
            .eq('id', contractId)
            .single();
          
          if (error || !data) {
            throw new Error(`Contract not found: ${contractId}`);
          }
          
          validationContract = {
            allowed_facts: data.allowed_facts,
            forbidden_topics: data.forbidden_topics,
            scope_contract: data.scope_contract,
            tone: data.tone,
            explanation_goals: data.explanation_goals,
            refusal_conditions: data.refusal_conditions,
            required_references: data.required_references,
            validation_requirements: data.validation_requirements
          };
        }
        
        if (!validationContract) {
          throw new Error('contract or contract_id is required');
        }
        
        const binder = new LLMContractBinder();
        const { isValid, violations } = binder.validateLLMResponse(llmResponse, validationContract);
        
        // Update contract with response validation
        if (contractId) {
          await supabase
            .from('llm_explanation_contracts')
            .update({
              llm_response: llmResponse,
              response_valid: isValid,
              response_violations: violations
            })
            .eq('id', contractId);
        }
        
        return new Response(
          JSON.stringify({ success: true, is_valid: isValid, violations }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_attribution_report': {
        const tradeId = body.trade_id as string;
        const reportId = body.report_id as string;
        
        let query = supabase.from('attribution_reports').select('*');
        
        if (tradeId) {
          query = query.eq('trade_id', tradeId);
        } else if (reportId) {
          query = query.eq('id', reportId);
        } else {
          throw new Error('trade_id or report_id is required');
        }
        
        const { data, error } = await query.single();
        
        if (error) {
          throw new Error(`Report not found: ${error.message}`);
        }
        
        return new Response(
          JSON.stringify({ success: true, report: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list_reports': {
        const userId = body.user_id as string;
        const strategyId = body.strategy_id as string;
        const limit = (body.limit as number) || 50;
        
        let query = supabase
          .from('attribution_reports')
          .select('*')
          .order('generated_at', { ascending: false })
          .limit(limit);
        
        if (userId) {
          query = query.eq('user_id', userId);
        }
        if (strategyId) {
          query = query.eq('strategy_id', strategyId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw new Error(`Failed to list reports: ${error.message}`);
        }
        
        return new Response(
          JSON.stringify({ success: true, reports: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_cause_statistics': {
        const userId = body.user_id as string;
        const strategyId = body.strategy_id as string;
        const dateFrom = body.date_from as string;
        const dateTo = body.date_to as string;
        
        let query = supabase
          .from('attribution_reports')
          .select('primary_cause, contributing_factors, realized_pnl, confidence_score');
        
        if (userId) query = query.eq('user_id', userId);
        if (strategyId) query = query.eq('strategy_id', strategyId);
        if (dateFrom) query = query.gte('generated_at', dateFrom);
        if (dateTo) query = query.lte('generated_at', dateTo);
        
        const { data, error } = await query;
        
        if (error) {
          throw new Error(`Failed to get statistics: ${error.message}`);
        }
        
        // Aggregate statistics
        const causeStats: Record<string, { count: number; total_pnl: number; avg_confidence: number }> = {};
        const factorStats: Record<string, { count: number }> = {};
        
        for (const report of data || []) {
          const cause = report.primary_cause;
          if (!causeStats[cause]) {
            causeStats[cause] = { count: 0, total_pnl: 0, avg_confidence: 0 };
          }
          causeStats[cause].count++;
          causeStats[cause].total_pnl += parseFloat(report.realized_pnl);
          causeStats[cause].avg_confidence += parseFloat(report.confidence_score);
          
          for (const factor of report.contributing_factors || []) {
            if (!factorStats[factor]) {
              factorStats[factor] = { count: 0 };
            }
            factorStats[factor].count++;
          }
        }
        
        // Calculate averages
        for (const cause in causeStats) {
          causeStats[cause].avg_confidence /= causeStats[cause].count;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            cause_statistics: causeStats,
            factor_statistics: factorStats,
            total_reports: data?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ 
            error: 'Unknown action',
            available_actions: [
              'attribute_outcome',
              'create_llm_contract',
              'validate_llm_response',
              'get_attribution_report',
              'list_reports',
              'get_cause_statistics'
            ]
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[OAE] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
