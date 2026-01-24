import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types
export type ControlScope = "STRATEGY" | "USER" | "BROKER" | "GLOBAL";
export type ControlState = "ACTIVE" | "THROTTLED" | "FROZEN" | "KILLED";
export type SignalSource = "RECONCILIATION" | "STRATEGY_HEALTH" | "BEHAVIOR" | "EXECUTION" | "RISK" | "MANUAL";

export interface ControlSignal {
  source: SignalSource;
  severity: number;
  reason: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ControlTarget {
  scope: ControlScope;
  id: string;
}

export interface ControlDecision {
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

export interface ControlStatus {
  global_killed: boolean;
  total_targets: number;
  by_state: Record<ControlState, number>;
  by_scope: Record<ControlScope, Record<string, number>>;
  last_updated: string;
}

export interface CanExecuteResult {
  can_execute: boolean;
  reason: string;
}

export function useControlPlane() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ControlStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const invokeControlPlane = useCallback(async (action: string, payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("global-control-plane", {
        body: { action, ...payload }
      });
      
      if (invokeError) throw invokeError;
      if (!data.success) throw new Error(data.error);
      
      return data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Control plane error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Evaluate control signals
  const evaluate = useCallback(async (
    target: ControlTarget,
    signals: ControlSignal[]
  ): Promise<ControlDecision> => {
    return await invokeControlPlane("evaluate", { target, signals });
  }, [invokeControlPlane]);

  // Check if execution is allowed
  const canExecute = useCallback(async (
    strategyId: string,
    userId: string,
    brokerId?: string
  ): Promise<CanExecuteResult> => {
    return await invokeControlPlane("can_execute", {
      strategy_id: strategyId,
      user_id: userId,
      broker_id: brokerId
    });
  }, [invokeControlPlane]);

  // Manual reset (admin only)
  const manualReset = useCallback(async (
    target: ControlTarget,
    adminId: string,
    reason: string
  ): Promise<ControlDecision> => {
    const result = await invokeControlPlane("manual_reset", {
      target,
      admin_id: adminId,
      reason
    });
    
    toast({
      title: "Control Reset",
      description: `${target.scope}:${target.id} reset to ACTIVE`,
    });
    
    return result;
  }, [invokeControlPlane, toast]);

  // Get state of a target
  const getState = useCallback(async (target: ControlTarget): Promise<ControlState> => {
    const result = await invokeControlPlane("get_state", { target });
    return result.state;
  }, [invokeControlPlane]);

  // Get system status
  const getStatus = useCallback(async (): Promise<ControlStatus> => {
    const result = await invokeControlPlane("get_status", {});
    setStatus(result);
    return result;
  }, [invokeControlPlane]);

  // Get audit trail
  const getAudit = useCallback(async (
    target?: ControlTarget,
    startTime?: string,
    endTime?: string,
    limit: number = 100
  ): Promise<unknown[]> => {
    return await invokeControlPlane("get_audit", {
      target,
      start_time: startTime,
      end_time: endTime,
      limit
    });
  }, [invokeControlPlane]);

  // Activate global kill switch
  const activateGlobalKill = useCallback(async (reason: string): Promise<ControlDecision> => {
    const signal: ControlSignal = {
      source: "MANUAL",
      severity: 1.0,
      reason: `GLOBAL KILL: ${reason}`,
      timestamp: new Date().toISOString(),
      metadata: { action: "global_kill" }
    };
    
    const result = await evaluate(
      { scope: "GLOBAL", id: "GLOBAL" },
      [signal]
    );
    
    toast({
      title: "🚨 GLOBAL KILL ACTIVATED",
      description: "All trading has been halted immediately",
      variant: "destructive",
    });
    
    return result;
  }, [evaluate, toast]);

  // Reset global kill switch
  const resetGlobalKill = useCallback(async (adminId: string, reason: string): Promise<ControlDecision> => {
    return await manualReset(
      { scope: "GLOBAL", id: "GLOBAL" },
      adminId,
      reason
    );
  }, [manualReset]);

  return {
    loading,
    error,
    status,
    evaluate,
    canExecute,
    manualReset,
    getState,
    getStatus,
    getAudit,
    activateGlobalKill,
    resetGlobalKill
  };
}
