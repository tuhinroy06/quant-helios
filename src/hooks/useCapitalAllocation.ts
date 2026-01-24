import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StrategyAllocation {
  id: string;
  strategy: string;
  allocated_pct: number;
  allocated_capital: number;
  used_capital: number;
  available_capital: number;
  max_drawdown_pct: number;
  peak_capital: number;
  current_drawdown_pct: number;
  enabled: boolean;
  is_killed: boolean;
}

interface AllocationSummary {
  total_capital: number;
  allocated_capital: number;
  unallocated_capital: number;
  total_used: number;
  total_available: number;
  allocation_pct: number;
  strategies: StrategyAllocation[];
}

export const useCapitalAllocation = (accountId?: string) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<StrategyAllocation[]>([]);
  const [summary, setSummary] = useState<AllocationSummary | null>(null);

  const fetchAllocations = useCallback(async () => {
    if (!user || !accountId) return;
    setLoading(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capital-allocation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "get_allocations",
            account_id: accountId,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setAllocations(result.allocations || []);
      setSummary(result.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch allocations");
    } finally {
      setLoading(false);
    }
  }, [user, accountId]);

  const createAllocation = useCallback(async (
    strategy: string,
    allocatedPct: number,
    maxDrawdownPct: number = 10
  ): Promise<StrategyAllocation | null> => {
    if (!user || !accountId) return null;
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capital-allocation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "create_allocation",
            account_id: accountId,
            strategy,
            allocated_pct: allocatedPct,
            max_drawdown_pct: maxDrawdownPct,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await fetchAllocations();
      return result.allocation;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create allocation");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, accountId, fetchAllocations]);

  const updateAllocation = useCallback(async (
    allocationId: string,
    updates: Partial<{ allocated_pct: number; max_drawdown_pct: number; enabled: boolean }>
  ): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capital-allocation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "update_allocation",
            allocation_id: allocationId,
            ...updates,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await fetchAllocations();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update allocation");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchAllocations]);

  const recordCapitalUsage = useCallback(async (
    strategy: string,
    amount: number
  ): Promise<boolean> => {
    if (!user || !accountId) return false;

    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capital-allocation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "record_usage",
            account_id: accountId,
            strategy,
            amount,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await fetchAllocations();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record usage");
      return false;
    }
  }, [user, accountId, fetchAllocations]);

  useEffect(() => {
    if (accountId) {
      fetchAllocations();
    }
  }, [accountId, fetchAllocations]);

  return {
    allocations,
    summary,
    loading,
    error,
    fetchAllocations,
    createAllocation,
    updateAllocation,
    recordCapitalUsage,
  };
};
