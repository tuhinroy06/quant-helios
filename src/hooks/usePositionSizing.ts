import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PositionSizeResult {
  quantity: number;
  position_value: number;
  risk_amount: number;
  stop_distance: number;
  stop_distance_pct: number;
  risk_reward_ratio: number | null;
  adjustments: {
    volatility_applied: boolean;
    volatility_factor: number;
    confidence_applied: boolean;
    confidence_factor: number;
  };
  limits: {
    min_position: number;
    max_position: number;
    was_clamped: boolean;
    clamp_reason: string | null;
  };
}

interface PositionSizingConfig {
  id: string;
  risk_per_trade_pct: number;
  min_position_size: number;
  max_position_size: number;
  use_atr_stops: boolean;
  atr_multiplier: number;
  volatility_adjustment: boolean;
  confidence_weighting: boolean;
}

interface CalculateParams {
  account_capital: number;
  entry_price: number;
  stop_loss: number;
  take_profit?: number;
  atr?: number;
  confidence?: number;
}

export const usePositionSizing = (accountId?: string) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<PositionSizingConfig | null>(null);

  const calculate = useCallback(async (
    params: CalculateParams
  ): Promise<PositionSizeResult | null> => {
    if (!user) return null;
    setLoading(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/position-sizing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "calculate",
            account_id: accountId,
            ...params,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      return result.sizing;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate position size");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, accountId]);

  const getConfig = useCallback(async (): Promise<PositionSizingConfig | null> => {
    if (!user) return null;
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/position-sizing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "get_config",
            account_id: accountId,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setConfig(result.config);
      return result.config;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get config");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, accountId]);

  const updateConfig = useCallback(async (
    updates: Partial<PositionSizingConfig>
  ): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/position-sizing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "update_config",
            account_id: accountId,
            ...updates,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setConfig(result.config);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update config");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, accountId]);

  return {
    calculate,
    getConfig,
    updateConfig,
    config,
    loading,
    error,
  };
};
