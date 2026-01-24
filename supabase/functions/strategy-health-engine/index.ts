import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

type PrimaryCause = "STRATEGY_LOGIC" | "EXECUTION" | "MARKET_CONDITIONS" | "RISK_MANAGEMENT";
type StrategyHealthStatus = "HEALTHY" | "DEGRADED" | "UNSTABLE" | "CRITICAL";
type ExecutionAction = "ALLOW" | "THROTTLE" | "REVIEW_REQUIRED" | "EXECUTION_FREEZE";
type RegimeType = "HIGH" | "NORMAL" | "LOW";

// Configurable thresholds
const MIN_TRADES_FOR_ASSESSMENT = 20;
const RECENCY_DECAY = 0.95;
const EXECUTION_RISK_HIGH = 0.35;
const BEHAVIOR_RISK_HIGH = 0.5;
const LOGIC_INSTABILITY_HIGH = 0.3;
const HEALTHY_THRESHOLD = 80.0;
const DEGRADED_THRESHOLD = 60.0;
const UNSTABLE_THRESHOLD = 40.0;
const DETERIORATION_THRESHOLD = -10.0;
const IMPROVEMENT_THRESHOLD = 5.0;

const HIGH_RISK_BEHAVIORS = new Set([
  "REVENGE_TRADING",
  "OVERTRADING",
  "STRATEGY_DRIFT",
  "IMPULSE_TRADING",
  "LOSS_CHASING"
]);

// ============================================================================
// INTERFACES
// ============================================================================

interface AttributedTradeSummary {
  trade_id: string;
  timestamp: string;
  pnl: number;
  primary_cause: PrimaryCause;
  execution_sub_type: string | null;
  stop_loss_hit: boolean;
  take_profit_hit: boolean;
  volatility_regime: RegimeType | null;
  liquidity_regime: RegimeType | null;
}

interface BehaviorSignal {
  behavior: string;
  strength: number;
  confidence: number;
}

interface PreviousHealthSnapshot {
  health_score: number;
  generated_at: string;
}

interface ExecutionRiskBreakdown {
  overall_risk: number;
  slippage_risk: number;
  liquidity_risk: number;
  partial_fill_risk: number;
}

interface StrategyHealthReport {
  strategy_id: string;
  user_id: string;
  window_trades: number;
  health_status: StrategyHealthStatus;
  health_score: number;
  degradation_reasons: string[];
  health_delta: number | null;
  is_improving: boolean | null;
  is_deteriorating: boolean | null;
  behavior_flags: string[];
  execution_risk_breakdown: ExecutionRiskBreakdown;
  logic_stability_score: number;
  logic_stability_by_regime: Record<string, number>;
  recommended_action: ExecutionAction;
  generated_at: string;
}

// ============================================================================
// CORE ENGINE FUNCTIONS
// ============================================================================

function calculateRecencyWeights(nTrades: number): number[] {
  const weights: number[] = [];
  for (let i = 0; i < nTrades; i++) {
    const weight = Math.pow(RECENCY_DECAY, nTrades - i - 1);
    weights.push(weight);
  }
  return weights;
}

function executionRiskBreakdown(trades: AttributedTradeSummary[]): ExecutionRiskBreakdown {
  if (!trades.length) {
    return { overall_risk: 0, slippage_risk: 0, liquidity_risk: 0, partial_fill_risk: 0 };
  }

  const weights = calculateRecencyWeights(trades.length);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let slippageWeight = 0;
  let liquidityWeight = 0;
  let partialFillWeight = 0;
  let executionWeight = 0;

  trades.forEach((trade, i) => {
    const weight = weights[i];
    if (trade.primary_cause === "EXECUTION") {
      executionWeight += weight;

      const subType = (trade.execution_sub_type || "").toUpperCase();
      if (subType.includes("SLIPPAGE")) {
        slippageWeight += weight;
      } else if (subType.includes("LIQUIDITY") || subType.includes("DEPTH")) {
        liquidityWeight += weight;
      } else if (subType.includes("PARTIAL") || subType.includes("FILL")) {
        partialFillWeight += weight;
      }
    }
  });

  return {
    overall_risk: Math.round((executionWeight / totalWeight) * 1000) / 1000,
    slippage_risk: Math.round((slippageWeight / totalWeight) * 1000) / 1000,
    liquidity_risk: Math.round((liquidityWeight / totalWeight) * 1000) / 1000,
    partial_fill_risk: Math.round((partialFillWeight / totalWeight) * 1000) / 1000,
  };
}

function logicStabilityRecencyWeighted(trades: AttributedTradeSummary[]): number {
  if (!trades.length) return 1.0;

  const weights = calculateRecencyWeights(trades.length);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const logicFailureWeight = trades.reduce((sum, trade, i) => {
    if (trade.primary_cause === "STRATEGY_LOGIC") {
      return sum + weights[i];
    }
    return sum;
  }, 0);

  const logicFailureRatio = logicFailureWeight / totalWeight;
  return 1.0 - logicFailureRatio;
}

function logicStabilityByRegime(trades: AttributedTradeSummary[]): Record<string, number> {
  const regimeStats: Record<string, number> = {};

  // Group by volatility regime
  for (const regimeName of ["HIGH", "NORMAL", "LOW"] as RegimeType[]) {
    const regimeTrades = trades.filter(t => t.volatility_regime === regimeName);

    if (regimeTrades.length >= 5) {
      const logicFailures = regimeTrades.filter(
        t => t.primary_cause === "STRATEGY_LOGIC"
      );
      const stability = 1.0 - (logicFailures.length / regimeTrades.length);
      regimeStats[`volatility_${regimeName}`] = Math.round(stability * 100) / 100;
    }
  }

  // Group by liquidity regime
  for (const regimeName of ["HIGH", "NORMAL", "LOW"] as RegimeType[]) {
    const regimeTrades = trades.filter(t => t.liquidity_regime === regimeName);

    if (regimeTrades.length >= 5) {
      const logicFailures = regimeTrades.filter(
        t => t.primary_cause === "STRATEGY_LOGIC"
      );
      const stability = 1.0 - (logicFailures.length / regimeTrades.length);
      regimeStats[`liquidity_${regimeName}`] = Math.round(stability * 100) / 100;
    }
  }

  return regimeStats;
}

function behaviorRisk(behaviors: BehaviorSignal[]): number {
  if (!behaviors.length) return 0.0;

  const riskyBehaviors = behaviors.filter(
    b => HIGH_RISK_BEHAVIORS.has(b.behavior) && b.confidence > 0.7
  );

  return Math.min(riskyBehaviors.length * 0.25, 1.0);
}

function computeHealthScore(
  executionRisk: number,
  logicStability: number,
  behaviorRiskScore: number
): number {
  const score = 100.0 - executionRisk * 30.0 - behaviorRiskScore * 30.0 - (1.0 - logicStability) * 40.0;
  return Math.max(0.0, score);
}

function calculateTrend(
  currentScore: number,
  previous: PreviousHealthSnapshot | null
): { delta: number | null; isImproving: boolean | null; isDeteriorating: boolean | null } {
  if (!previous) {
    return { delta: null, isImproving: null, isDeteriorating: null };
  }

  const delta = currentScore - previous.health_score;
  const isImproving = delta >= IMPROVEMENT_THRESHOLD;
  const isDeteriorating = delta <= DETERIORATION_THRESHOLD;

  return {
    delta: Math.round(delta * 100) / 100,
    isImproving,
    isDeteriorating,
  };
}

function classify(
  score: number,
  execRisk: number,
  behaviorRiskScore: number,
  logicStability: number,
  isDeteriorating: boolean | null
): { status: StrategyHealthStatus; reasons: string[] } {
  const reasons: string[] = [];

  if (execRisk > EXECUTION_RISK_HIGH) {
    reasons.push("High execution dependency");
  }

  if (behaviorRiskScore > BEHAVIOR_RISK_HIGH) {
    reasons.push("Behavioral contamination detected");
  }

  if ((1.0 - logicStability) > LOGIC_INSTABILITY_HIGH) {
    reasons.push("Strategy logic instability");
  }

  if (isDeteriorating) {
    reasons.push("Rapid health deterioration detected");
  }

  if (score >= HEALTHY_THRESHOLD && !isDeteriorating) {
    return { status: "HEALTHY", reasons };
  }

  if (score >= DEGRADED_THRESHOLD) {
    return { status: "DEGRADED", reasons };
  }

  if (score >= UNSTABLE_THRESHOLD) {
    return { status: "UNSTABLE", reasons };
  }

  return { status: "CRITICAL", reasons };
}

function determineAction(
  status: StrategyHealthStatus,
  isDeteriorating: boolean | null,
  behaviorRiskScore: number
): ExecutionAction {
  if (status === "CRITICAL") {
    return "EXECUTION_FREEZE";
  }

  if (status === "UNSTABLE") {
    return "REVIEW_REQUIRED";
  }

  if (status === "DEGRADED" && isDeteriorating) {
    return "REVIEW_REQUIRED";
  }

  if (behaviorRiskScore > BEHAVIOR_RISK_HIGH) {
    return "THROTTLE";
  }

  if (status === "DEGRADED") {
    return "THROTTLE";
  }

  return "ALLOW";
}

function createInsufficientDataReport(
  userId: string,
  strategyId: string,
  tradeCount: number,
  minTrades: number
): StrategyHealthReport {
  return {
    strategy_id: strategyId,
    user_id: userId,
    window_trades: tradeCount,
    health_status: "DEGRADED",
    health_score: 50.0,
    degradation_reasons: [`Insufficient trade history (${tradeCount}/${minTrades} trades)`],
    health_delta: null,
    is_improving: null,
    is_deteriorating: null,
    behavior_flags: [],
    execution_risk_breakdown: {
      overall_risk: 0,
      slippage_risk: 0,
      liquidity_risk: 0,
      partial_fill_risk: 0,
    },
    logic_stability_score: 0,
    logic_stability_by_regime: {},
    recommended_action: "REVIEW_REQUIRED",
    generated_at: new Date().toISOString(),
  };
}

function evaluateStrategyHealth(
  userId: string,
  strategyId: string,
  trades: AttributedTradeSummary[],
  behaviors: BehaviorSignal[],
  previousHealth: PreviousHealthSnapshot | null,
  minTrades: number = MIN_TRADES_FOR_ASSESSMENT
): StrategyHealthReport {
  // Insufficient data handling
  if (trades.length < minTrades) {
    return createInsufficientDataReport(userId, strategyId, trades.length, minTrades);
  }

  // Sort trades by timestamp (most recent last)
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate risk dimensions with recency weighting
  const execBreakdown = executionRiskBreakdown(sortedTrades);
  const logicStability = logicStabilityRecencyWeighted(sortedTrades);
  const logicByRegime = logicStabilityByRegime(sortedTrades);
  const behaviorRiskScore = behaviorRisk(behaviors);

  // Compute composite health score
  const healthScore = computeHealthScore(
    execBreakdown.overall_risk,
    logicStability,
    behaviorRiskScore
  );

  // Calculate health trend
  const trend = calculateTrend(healthScore, previousHealth);

  // Classify health status
  const { status, reasons } = classify(
    healthScore,
    execBreakdown.overall_risk,
    behaviorRiskScore,
    logicStability,
    trend.isDeteriorating
  );

  // Determine machine action
  const action = determineAction(status, trend.isDeteriorating, behaviorRiskScore);

  // Extract high-confidence behavior flags
  const behaviorFlags = behaviors
    .filter(b => b.strength > 0.6 && b.confidence > 0.6)
    .map(b => b.behavior);

  return {
    strategy_id: strategyId,
    user_id: userId,
    window_trades: trades.length,
    health_status: status,
    health_score: Math.round(Math.max(0.0, healthScore) * 100) / 100,
    degradation_reasons: reasons,
    health_delta: trend.delta,
    is_improving: trend.isImproving,
    is_deteriorating: trend.isDeteriorating,
    behavior_flags: behaviorFlags,
    execution_risk_breakdown: execBreakdown,
    logic_stability_score: Math.round(logicStability * 100) / 100,
    logic_stability_by_regime: logicByRegime,
    recommended_action: action,
    generated_at: new Date().toISOString(),
  };
}

// ============================================================================
// EDGE FUNCTION HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { strategy_id, min_trades = MIN_TRADES_FOR_ASSESSMENT } = body;

    if (!strategy_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: strategy_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify strategy ownership
    const { data: strategy, error: strategyError } = await supabaseClient
      .from("strategies")
      .select("id, user_id")
      .eq("id", strategy_id)
      .eq("user_id", user.id)
      .single();

    if (strategyError || !strategy) {
      return new Response(
        JSON.stringify({ error: "Strategy not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Strategy Health Engine] Evaluating strategy: ${strategy_id} for user: ${user.id}`);

    // Fetch attributed trades
    const { data: trades, error: tradesError } = await supabaseClient
      .from("trade_attributions")
      .select("*")
      .eq("strategy_id", strategy_id)
      .eq("user_id", user.id)
      .order("timestamp", { ascending: true });

    if (tradesError) {
      console.error("[Strategy Health Engine] Error fetching trades:", tradesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch trade data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map database rows to AttributedTradeSummary
    const attributedTrades: AttributedTradeSummary[] = (trades || []).map(t => ({
      trade_id: t.trade_id || t.id,
      timestamp: t.timestamp,
      pnl: Number(t.pnl),
      primary_cause: t.primary_cause as PrimaryCause,
      execution_sub_type: t.execution_sub_type,
      stop_loss_hit: t.stop_loss_hit || false,
      take_profit_hit: t.take_profit_hit || false,
      volatility_regime: t.volatility_regime as RegimeType | null,
      liquidity_regime: t.liquidity_regime as RegimeType | null,
    }));

    // Fetch behavior signals
    const { data: behaviorData, error: behaviorError } = await supabaseClient
      .from("behavior_signals")
      .select("behavior, strength, confidence")
      .eq("strategy_id", strategy_id)
      .eq("user_id", user.id)
      .gte("detected_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    if (behaviorError) {
      console.error("[Strategy Health Engine] Error fetching behaviors:", behaviorError);
    }

    const behaviors: BehaviorSignal[] = (behaviorData || []).map(b => ({
      behavior: b.behavior,
      strength: Number(b.strength),
      confidence: Number(b.confidence),
    }));

    // Fetch previous health snapshot
    const { data: previousData } = await supabaseClient
      .from("strategy_health_reports")
      .select("health_score, generated_at")
      .eq("strategy_id", strategy_id)
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    const previousHealth: PreviousHealthSnapshot | null = previousData
      ? {
          health_score: Number(previousData.health_score),
          generated_at: previousData.generated_at,
        }
      : null;

    console.log(`[Strategy Health Engine] Found ${attributedTrades.length} trades, ${behaviors.length} behaviors`);

    // Evaluate strategy health
    const report = evaluateStrategyHealth(
      user.id,
      strategy_id,
      attributedTrades,
      behaviors,
      previousHealth,
      min_trades
    );

    // Store health report
    const { error: insertError } = await supabaseClient
      .from("strategy_health_reports")
      .insert({
        user_id: user.id,
        strategy_id: strategy_id,
        health_status: report.health_status,
        health_score: report.health_score,
        health_delta: report.health_delta,
        is_improving: report.is_improving,
        is_deteriorating: report.is_deteriorating,
        degradation_reasons: report.degradation_reasons,
        behavior_flags: report.behavior_flags,
        execution_risk_breakdown: report.execution_risk_breakdown,
        logic_stability_score: report.logic_stability_score,
        logic_stability_by_regime: report.logic_stability_by_regime,
        recommended_action: report.recommended_action,
        window_trades: report.window_trades,
        generated_at: report.generated_at,
      });

    if (insertError) {
      console.error("[Strategy Health Engine] Error storing report:", insertError);
    }

    // Update strategy health status
    await supabaseClient
      .from("strategies")
      .update({
        health_status: report.health_status,
        last_health_check: report.generated_at,
      })
      .eq("id", strategy_id);

    console.log(`[Strategy Health Engine] Report generated: ${report.health_status} (${report.health_score}/100)`);

    return new Response(
      JSON.stringify({
        success: true,
        report,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("[Strategy Health Engine] Error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
