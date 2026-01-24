import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

type ControlScope = "STRATEGY" | "USER" | "BROKER" | "GLOBAL";
type ControlState = "ACTIVE" | "THROTTLED" | "FROZEN" | "KILLED";
type SignalSource = "RECONCILIATION" | "STRATEGY_HEALTH" | "BEHAVIOR" | "EXECUTION" | "RISK" | "MANUAL";

// Escalation thresholds
const THROTTLE_THRESHOLD = 0.5;
const FREEZE_THRESHOLD = 0.7;
const KILL_THRESHOLD = 0.9;

// Cooldown enforcement (seconds)
const MIN_STATE_DURATION: Record<ControlState, number> = {
  ACTIVE: 0,
  THROTTLED: 300,      // 5 minutes
  FROZEN: 1800,        // 30 minutes
  KILLED: Infinity     // permanent
};

// State hierarchy for monotonic escalation
const STATE_HIERARCHY: ControlState[] = ["ACTIVE", "THROTTLED", "FROZEN", "KILLED"];

// Signal source weights (institutional-grade)
const SOURCE_WEIGHT: Record<SignalSource, number> = {
  RECONCILIATION: 1.0,  // Ground truth
  RISK: 1.0,            // Hard limits
  EXECUTION: 0.9,       // Observable failures
  STRATEGY_HEALTH: 0.8, // Derived metrics
  BEHAVIOR: 0.7,        // Pattern-based
  MANUAL: 1.0           // Human override
};

// ============================================================================
// DATA MODELS
// ============================================================================

interface ControlSignal {
  source: SignalSource;
  severity: number;  // 0.0 - 1.0
  reason: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface ControlTarget {
  scope: ControlScope;
  id: string;
}

interface ControlDecision {
  decision_id: string;
  target: ControlTarget;
  previous_state: ControlState;
  new_state: ControlState;
  reason: string;
  signals: ControlSignal[];
  decided_at: string;
  requires_manual_reset: boolean;
  global_kill_override: boolean;
}

interface EvaluateRequest {
  action: "evaluate";
  target: ControlTarget;
  signals: ControlSignal[];
}

interface CanExecuteRequest {
  action: "can_execute";
  strategy_id: string;
  user_id: string;
  broker_id?: string;
}

interface ManualResetRequest {
  action: "manual_reset";
  target: ControlTarget;
  admin_id: string;
  reason: string;
}

interface GetStateRequest {
  action: "get_state";
  target: ControlTarget;
}

interface GetStatusRequest {
  action: "get_status";
}

interface GetAuditRequest {
  action: "get_audit";
  target?: ControlTarget;
  start_time?: string;
  end_time?: string;
  limit?: number;
}

type ControlPlaneRequest = 
  | EvaluateRequest 
  | CanExecuteRequest 
  | ManualResetRequest 
  | GetStateRequest 
  | GetStatusRequest
  | GetAuditRequest;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateDecisionId(): string {
  const now = new Date();
  return now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 20);
}

function severityToState(severity: number): ControlState {
  if (severity >= KILL_THRESHOLD) return "KILLED";
  if (severity >= FREEZE_THRESHOLD) return "FROZEN";
  if (severity >= THROTTLE_THRESHOLD) return "THROTTLED";
  return "ACTIVE";
}

function maxState(a: ControlState, b: ControlState): ControlState {
  const idxA = STATE_HIERARCHY.indexOf(a);
  const idxB = STATE_HIERARCHY.indexOf(b);
  return STATE_HIERARCHY[Math.max(idxA, idxB)];
}

function cooldownElapsed(
  lastTransition: string | null,
  state: ControlState,
  now: Date
): boolean {
  if (!lastTransition) return true;
  
  const lastTime = new Date(lastTransition);
  const elapsed = (now.getTime() - lastTime.getTime()) / 1000;
  const required = MIN_STATE_DURATION[state];
  
  return elapsed >= required;
}

function aggregateReason(signals: ControlSignal[], weightedSeverity: number): string {
  const reasons = signals
    .sort((a, b) => b.severity - a.severity)
    .map(s => {
      const weight = SOURCE_WEIGHT[s.source] || 0.5;
      const weighted = s.severity * weight;
      return `[${s.source}] ${s.reason} (severity=${s.severity.toFixed(2)}, weighted=${weighted.toFixed(2)})`;
    });
  
  return `Max weighted severity: ${weightedSeverity.toFixed(2)} | ${reasons.join("; ")}`;
}

// ============================================================================
// CORE ENGINE
// ============================================================================

async function evaluate(
  supabase: SupabaseClient,
  target: ControlTarget,
  signals: ControlSignal[]
): Promise<ControlDecision> {
  const now = new Date();
  const nowIso = now.toISOString();
  
  // Get current state
  const { data: stateRow } = await supabase
    .from("control_states")
    .select("state, last_transition_at")
    .eq("scope", target.scope)
    .eq("target_id", target.id)
    .single();
  
  const currentState: ControlState = (stateRow as any)?.state || "ACTIVE";
  const lastTransition: string | null = (stateRow as any)?.last_transition_at || null;
  
  // CRITICAL: Check if GLOBAL KILL is active
  if (target.scope !== "GLOBAL" || target.id !== "GLOBAL") {
    const { data: globalState } = await supabase
      .from("control_states")
      .select("state")
      .eq("scope", "GLOBAL")
      .eq("target_id", "GLOBAL")
      .single();
    
    if ((globalState as any)?.state === "KILLED") {
      console.log(`GLOBAL KILL ACTIVE - Force killing ${target.scope}:${target.id}`);
      
      const decision: ControlDecision = {
        decision_id: generateDecisionId(),
        target,
        previous_state: currentState,
        new_state: "KILLED",
        reason: "GLOBAL KILL SWITCH ACTIVE - All trading halted",
        signals,
        decided_at: nowIso,
        requires_manual_reset: true,
        global_kill_override: true
      };
      
      await commitDecision(supabase, decision);
      return decision;
    }
  }
  
  // Handle empty signals
  if (!signals || signals.length === 0) {
    signals = [{
      source: "MANUAL",
      severity: 0.0,
      reason: "No signals - maintaining state",
      timestamp: nowIso
    }];
  }
  
  // Calculate weighted severity
  const weightedSeverity = Math.max(
    ...signals.map(s => s.severity * (SOURCE_WEIGHT[s.source] || 0.5))
  );
  
  const reason = aggregateReason(signals, weightedSeverity);
  
  // Determine desired state based on weighted severity
  let desiredState = severityToState(weightedSeverity);
  
  // Enforce monotonic escalation (can only get worse automatically)
  desiredState = maxState(currentState, desiredState);
  
  // KILL bypasses cooldown
  if (desiredState === "KILLED") {
    console.log(`KILL signal for ${target.scope}:${target.id} - bypassing cooldown`);
  } else if (!cooldownElapsed(lastTransition, currentState, now)) {
    console.log(`Cooldown active for ${target.scope}:${target.id}, maintaining ${currentState}`);
    desiredState = currentState;
  }
  
  const decision: ControlDecision = {
    decision_id: generateDecisionId(),
    target,
    previous_state: currentState,
    new_state: desiredState,
    reason,
    signals,
    decided_at: nowIso,
    requires_manual_reset: desiredState === "FROZEN" || desiredState === "KILLED",
    global_kill_override: false
  };
  
  await commitDecision(supabase, decision);
  return decision;
}

async function commitDecision(
  supabase: SupabaseClient,
  decision: ControlDecision
): Promise<void> {
  // Upsert state
  await supabase
    .from("control_states")
    .upsert({
      scope: decision.target.scope,
      target_id: decision.target.id,
      state: decision.new_state,
      last_transition_at: decision.decided_at,
      updated_at: decision.decided_at
    } as any, {
      onConflict: "scope,target_id"
    });
  
  // Insert decision audit log
  await supabase
    .from("control_decisions")
    .insert({
      decision_id: decision.decision_id,
      scope: decision.target.scope,
      target_id: decision.target.id,
      previous_state: decision.previous_state,
      new_state: decision.new_state,
      reason: decision.reason,
      signals: decision.signals,
      requires_manual_reset: decision.requires_manual_reset,
      global_kill_override: decision.global_kill_override,
      decided_at: decision.decided_at
    } as any);
  
  // Store signals
  if (decision.signals.length > 0) {
    const signalRows = decision.signals.map(s => ({
      source: s.source,
      severity: s.severity,
      reason: s.reason,
      metadata: s.metadata || {},
      scope: decision.target.scope,
      target_id: decision.target.id,
      created_at: s.timestamp
    }));
    
    await supabase.from("control_signals").insert(signalRows as any);
  }
  
  console.log(`State transition: ${decision.target.scope}:${decision.target.id} ${decision.previous_state} → ${decision.new_state}`);
}

async function canExecute(
  supabase: SupabaseClient,
  strategyId: string,
  userId: string,
  brokerId?: string
): Promise<{ can_execute: boolean; reason: string }> {
  const checks: Array<{ scope: ControlScope; id: string; name: string }> = [
    { scope: "GLOBAL", id: "GLOBAL", name: "Global trading" },
    { scope: "USER", id: userId, name: `User ${userId}` },
    { scope: "STRATEGY", id: strategyId, name: `Strategy ${strategyId}` }
  ];
  
  if (brokerId) {
    checks.push({ scope: "BROKER", id: brokerId, name: `Broker ${brokerId}` });
  }
  
  for (const check of checks) {
    const { data: stateRow } = await supabase
      .from("control_states")
      .select("state")
      .eq("scope", check.scope)
      .eq("target_id", check.id)
      .single();
    
    const state: ControlState = (stateRow as any)?.state || "ACTIVE";
    
    if (state !== "ACTIVE") {
      const reason = `${check.name} is ${state}`;
      console.log(`Execution blocked: ${reason}`);
      return { can_execute: false, reason };
    }
  }
  
  return { can_execute: true, reason: "All checks passed" };
}

async function manualReset(
  supabase: SupabaseClient,
  target: ControlTarget,
  adminId: string,
  reason: string
): Promise<ControlDecision> {
  const now = new Date();
  const nowIso = now.toISOString();
  
  // Get current state
  const { data: stateRow } = await supabase
    .from("control_states")
    .select("state")
    .eq("scope", target.scope)
    .eq("target_id", target.id)
    .single();
  
  const currentState: ControlState = (stateRow as any)?.state || "ACTIVE";
  
  const signal: ControlSignal = {
    source: "MANUAL",
    severity: 0.0,
    reason: `Manual reset by ${adminId}: ${reason}`,
    timestamp: nowIso,
    metadata: { admin_id: adminId, action: "reset" }
  };
  
  const decision: ControlDecision = {
    decision_id: generateDecisionId(),
    target,
    previous_state: currentState,
    new_state: "ACTIVE",
    reason: signal.reason,
    signals: [signal],
    decided_at: nowIso,
    requires_manual_reset: false,
    global_kill_override: false
  };
  
  // Force commit (bypasses normal escalation rules)
  await supabase
    .from("control_states")
    .upsert({
      scope: target.scope,
      target_id: target.id,
      state: "ACTIVE",
      last_transition_at: nowIso,
      updated_at: nowIso
    } as any, {
      onConflict: "scope,target_id"
    });
  
  await supabase
    .from("control_decisions")
    .insert({
      decision_id: decision.decision_id,
      scope: target.scope,
      target_id: target.id,
      previous_state: decision.previous_state,
      new_state: decision.new_state,
      reason: decision.reason,
      signals: decision.signals,
      requires_manual_reset: false,
      global_kill_override: false,
      decided_at: nowIso,
      admin_id: adminId
    } as any);
  
  console.log(`Manual reset: ${target.scope}:${target.id} by ${adminId}`);
  return decision;
}

async function getState(
  supabase: SupabaseClient,
  target: ControlTarget
): Promise<ControlState> {
  const { data } = await supabase
    .from("control_states")
    .select("state")
    .eq("scope", target.scope)
    .eq("target_id", target.id)
    .single();
  
  return (data as any)?.state || "ACTIVE";
}

async function getStatus(
  supabase: SupabaseClient
): Promise<Record<string, unknown>> {
  // Check global kill
  const { data: globalState } = await supabase
    .from("control_states")
    .select("state")
    .eq("scope", "GLOBAL")
    .eq("target_id", "GLOBAL")
    .single();
  
  const globalKilled = (globalState as any)?.state === "KILLED";
  
  // Get all states
  const { data: allStates } = await supabase
    .from("control_states")
    .select("scope, state");
  
  const byState: Record<ControlState, number> = {
    ACTIVE: 0,
    THROTTLED: 0,
    FROZEN: 0,
    KILLED: 0
  };
  
  const byScope: Record<ControlScope, Record<string, number>> = {
    STRATEGY: {},
    USER: {},
    BROKER: {},
    GLOBAL: {}
  };
  
  for (const row of (allStates || []) as any[]) {
    byState[row.state as ControlState]++;
    
    if (!byScope[row.scope as ControlScope][row.state]) {
      byScope[row.scope as ControlScope][row.state] = 0;
    }
    byScope[row.scope as ControlScope][row.state]++;
  }
  
  return {
    global_killed: globalKilled,
    total_targets: ((allStates as any[]) || []).length,
    by_state: byState,
    by_scope: byScope,
    last_updated: new Date().toISOString()
  };
}

async function getAudit(
  supabase: SupabaseClient,
  target?: ControlTarget,
  startTime?: string,
  endTime?: string,
  limit: number = 100
): Promise<unknown[]> {
  let query = supabase
    .from("control_decisions")
    .select("*")
    .order("decided_at", { ascending: false })
    .limit(limit);
  
  if (target) {
    query = query.eq("scope", target.scope).eq("target_id", target.id);
  }
  
  if (startTime) {
    query = query.gte("decided_at", startTime);
  }
  
  if (endTime) {
    query = query.lte("decided_at", endTime);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching audit trail:", error);
    return [];
  }
  
  return data || [];
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body: ControlPlaneRequest = await req.json();
    
    console.log(`Control Plane action: ${body.action}`);
    
    let result: unknown;
    
    switch (body.action) {
      case "evaluate": {
        const { target, signals } = body as EvaluateRequest;
        result = await evaluate(supabase, target, signals);
        break;
      }
      
      case "can_execute": {
        const { strategy_id, user_id, broker_id } = body as CanExecuteRequest;
        result = await canExecute(supabase, strategy_id, user_id, broker_id);
        break;
      }
      
      case "manual_reset": {
        const { target, admin_id, reason } = body as ManualResetRequest;
        result = await manualReset(supabase, target, admin_id, reason);
        break;
      }
      
      case "get_state": {
        const { target } = body as GetStateRequest;
        result = { state: await getState(supabase, target) };
        break;
      }
      
      case "get_status": {
        result = await getStatus(supabase);
        break;
      }
      
      case "get_audit": {
        const { target, start_time, end_time, limit } = body as GetAuditRequest;
        result = await getAudit(supabase, target, start_time, end_time, limit);
        break;
      }
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Control Plane error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
