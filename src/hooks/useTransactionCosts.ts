import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TransactionCostBreakdown {
  brokerage: number;
  stt: number;
  exchange_txn_charge: number;
  gst: number;
  sebi_charge: number;
  stamp_duty: number;
  total_charges: number;
  gross_value: number;
  net_value: number;
}

interface TransactionCostConfig {
  id: string;
  name: string;
  brokerage_pct: number;
  max_brokerage_per_order: number;
  stt_sell_pct: number;
  exchange_txn_charge_pct: number;
  gst_pct: number;
  sebi_charge_pct: number;
  stamp_duty_pct: number;
  is_default: boolean;
}

export const useTransactionCosts = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<TransactionCostConfig | null>(null);

  const calculateCosts = useCallback(async (
    quantity: number,
    price: number,
    side: "buy" | "sell"
  ): Promise<TransactionCostBreakdown | null> => {
    if (!user) return null;
    setLoading(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transaction-costs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "calculate",
            quantity,
            price,
            side,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      return result.breakdown;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate costs");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getConfig = useCallback(async (): Promise<TransactionCostConfig | null> => {
    if (!user) return null;
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transaction-costs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({ action: "get_config" }),
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
  }, [user]);

  const updateConfig = useCallback(async (
    updates: Partial<TransactionCostConfig>
  ): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transaction-costs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "update_config",
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
  }, [user]);

  return {
    calculateCosts,
    getConfig,
    updateConfig,
    config,
    loading,
    error,
  };
};
