import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SafetyStatus {
  enabled: boolean;
  days_active: number;
  days_remaining: number;
  position_size_multiplier: number;
  max_concurrent_positions: number;
  max_daily_loss_override: number;
  max_drawdown_override: number;
}

interface SafetyLimits {
  safety_active: boolean;
  days_remaining: number;
  original_quantity: number;
  adjusted_quantity: number;
  reduction_pct: number;
  can_open_position: boolean;
  current_positions: number;
  max_positions: number;
  kill_switch_overrides: {
    max_daily_loss: number;
    max_drawdown_pct: number;
  };
}

export const useSafetyMode = (accountId?: string) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SafetyStatus | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!user || !accountId) return;
    setLoading(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading-engine`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "get_safety_status",
            account_id: accountId,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      if (result.enabled !== undefined) {
        setStatus({
          enabled: result.enabled,
          days_active: result.days_active,
          days_remaining: result.days_remaining,
          position_size_multiplier: result.position_size_multiplier,
          max_concurrent_positions: result.max_concurrent_positions,
          max_daily_loss_override: result.max_daily_loss_override,
          max_drawdown_override: result.max_drawdown_override,
        });
      } else {
        setStatus(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch safety status");
    } finally {
      setLoading(false);
    }
  }, [user, accountId]);

  const enableSafetyMode = useCallback(async (
    options?: {
      position_size_multiplier?: number;
      max_concurrent_positions?: number;
      max_daily_loss_override?: number;
      max_drawdown_override?: number;
    }
  ): Promise<boolean> => {
    if (!user || !accountId) return false;
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading-engine`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "enable_safety_mode",
            account_id: accountId,
            ...options,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await fetchStatus();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable safety mode");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, accountId, fetchStatus]);

  const applyLimits = useCallback(async (
    quantity: number,
    currentPositions: number = 0
  ): Promise<SafetyLimits | null> => {
    if (!user || !accountId) return null;

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading-engine`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "apply_safety_limits",
            account_id: accountId,
            quantity,
            current_positions: currentPositions,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply safety limits");
      return null;
    }
  }, [user, accountId]);

  useEffect(() => {
    if (accountId) {
      fetchStatus();
    }
  }, [accountId, fetchStatus]);

  return {
    status,
    loading,
    error,
    fetchStatus,
    enableSafetyMode,
    applyLimits,
  };
};
