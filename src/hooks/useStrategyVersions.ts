import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface StrategyVersion {
  id: string;
  version: number;
  created_at: string;
  change_summary: string | null;
  config_snapshot: Json;
}

interface Strategy {
  id: string;
  name: string;
  market_type: string;
  timeframe: string;
  entry_rules: Json;
  exit_rules: Json;
  position_sizing: Json | null;
  risk_limits: Json | null;
  config: Json;
  version: number | null;
}

export const useStrategyVersions = (strategyId: string | undefined) => {
  const [versions, setVersions] = useState<StrategyVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVersions = async () => {
    if (!strategyId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("strategy_versions")
      .select("*")
      .eq("strategy_id", strategyId)
      .order("version", { ascending: false });

    if (error) {
      console.error("Failed to fetch versions:", error);
    } else {
      setVersions(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVersions();
  }, [strategyId]);

  const createVersion = async (
    strategy: Strategy,
    changeSummary?: string
  ): Promise<boolean> => {
    if (!strategyId) return false;

    const configSnapshot = {
      name: strategy.name,
      market_type: strategy.market_type,
      timeframe: strategy.timeframe,
      entry_rules: strategy.entry_rules,
      exit_rules: strategy.exit_rules,
      position_sizing: strategy.position_sizing,
      risk_limits: strategy.risk_limits,
      config: strategy.config,
    };

    const newVersion = (strategy.version || 1);

    const { error } = await supabase.from("strategy_versions").insert({
      strategy_id: strategyId,
      version: newVersion,
      config_snapshot: configSnapshot as Json,
      change_summary: changeSummary || `Version ${newVersion} snapshot`,
    });

    if (error) {
      console.error("Failed to create version:", error);
      return false;
    }

    await fetchVersions();
    return true;
  };

  const restoreVersion = async (version: StrategyVersion): Promise<boolean> => {
    if (!strategyId) return false;

    const snapshot = version.config_snapshot as Record<string, Json>;

    // First, create a snapshot of current state before restoring
    const { data: currentStrategy } = await supabase
      .from("strategies")
      .select("*")
      .eq("id", strategyId)
      .single();

    if (currentStrategy) {
      await createVersion(currentStrategy, `Auto-saved before restoring to v${version.version}`);
    }

    // Get max version number
    const maxVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version)) + 1 : 1;

    // Restore the version
    const { error } = await supabase
      .from("strategies")
      .update({
        name: snapshot.name as string,
        market_type: snapshot.market_type as string,
        timeframe: snapshot.timeframe as string,
        entry_rules: snapshot.entry_rules,
        exit_rules: snapshot.exit_rules,
        position_sizing: snapshot.position_sizing,
        risk_limits: snapshot.risk_limits,
        config: snapshot.config || {},
        version: maxVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", strategyId);

    if (error) {
      console.error("Failed to restore version:", error);
      toast.error("Failed to restore version");
      return false;
    }

    toast.success(`Restored to version ${version.version}`);
    await fetchVersions();
    return true;
  };

  return {
    versions,
    isLoading,
    createVersion,
    restoreVersion,
    refetch: fetchVersions,
  };
};
