import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ============================================================================
// TYPES
// ============================================================================

export type StrategyHealthStatus = "HEALTHY" | "DEGRADED" | "UNSTABLE" | "CRITICAL" | "UNKNOWN";
export type ExecutionAction = "ALLOW" | "THROTTLE" | "REVIEW_REQUIRED" | "EXECUTION_FREEZE";

export interface ExecutionRiskBreakdown {
  overall_risk: number;
  slippage_risk: number;
  liquidity_risk: number;
  partial_fill_risk: number;
}

export interface StrategyHealthReport {
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

interface UseStrategyHealthReturn {
  report: StrategyHealthReport | null;
  latestReport: StrategyHealthReport | null;
  isLoading: boolean;
  isEvaluating: boolean;
  error: string | null;
  evaluateHealth: (strategyId: string, minTrades?: number) => Promise<StrategyHealthReport | null>;
  fetchLatestReport: (strategyId: string) => Promise<StrategyHealthReport | null>;
  isExecutionSafe: (report: StrategyHealthReport | null) => boolean;
  requiresIntervention: (report: StrategyHealthReport | null) => boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useStrategyHealth(): UseStrategyHealthReturn {
  const [report, setReport] = useState<StrategyHealthReport | null>(null);
  const [latestReport, setLatestReport] = useState<StrategyHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluateHealth = useCallback(async (
    strategyId: string,
    minTrades: number = 20
  ): Promise<StrategyHealthReport | null> => {
    setIsEvaluating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("strategy-health-engine", {
        body: { strategy_id: strategyId, min_trades: minTrades },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to evaluate strategy health");
      }

      const healthReport = data.report as StrategyHealthReport;
      setReport(healthReport);
      setLatestReport(healthReport);

      return healthReport;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error("Failed to evaluate strategy health", { description: message });
      return null;
    } finally {
      setIsEvaluating(false);
    }
  }, []);

  const fetchLatestReport = useCallback(async (
    strategyId: string
  ): Promise<StrategyHealthReport | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from("strategy_health_reports")
        .select("*")
        .eq("strategy_id", strategyId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .single();

      if (dbError) {
        if (dbError.code === "PGRST116") {
          // No report found
          return null;
        }
        throw new Error(dbError.message);
      }

      const healthReport: StrategyHealthReport = {
        strategy_id: data.strategy_id,
        user_id: data.user_id,
        window_trades: data.window_trades,
        health_status: data.health_status as StrategyHealthStatus,
        health_score: Number(data.health_score),
        degradation_reasons: (data.degradation_reasons as string[]) || [],
        health_delta: data.health_delta ? Number(data.health_delta) : null,
        is_improving: data.is_improving,
        is_deteriorating: data.is_deteriorating,
        behavior_flags: (data.behavior_flags as string[]) || [],
        execution_risk_breakdown: (data.execution_risk_breakdown as unknown as ExecutionRiskBreakdown) || {
          overall_risk: 0,
          slippage_risk: 0,
          liquidity_risk: 0,
          partial_fill_risk: 0,
        },
        logic_stability_score: Number(data.logic_stability_score),
        logic_stability_by_regime: (data.logic_stability_by_regime as unknown as Record<string, number>) || {},
        recommended_action: data.recommended_action as ExecutionAction,
        generated_at: data.generated_at,
      };

      setLatestReport(healthReport);
      return healthReport;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isExecutionSafe = useCallback((report: StrategyHealthReport | null): boolean => {
    if (!report) return true; // No report = allow by default
    return report.recommended_action === "ALLOW" || report.recommended_action === "THROTTLE";
  }, []);

  const requiresIntervention = useCallback((report: StrategyHealthReport | null): boolean => {
    if (!report) return false;
    return (
      report.recommended_action === "REVIEW_REQUIRED" ||
      report.recommended_action === "EXECUTION_FREEZE"
    );
  }, []);

  return {
    report,
    latestReport,
    isLoading,
    isEvaluating,
    error,
    evaluateHealth,
    fetchLatestReport,
    isExecutionSafe,
    requiresIntervention,
  };
}
