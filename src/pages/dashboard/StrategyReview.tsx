import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { VersionHistory } from "@/components/strategy/VersionHistory";
import { useStrategyVersions } from "@/hooks/useStrategyVersions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

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
  status: string;
  version: number | null;
}

interface Rule {
  indicator: string;
  condition: string;
  value: string;
}

const StrategyReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [loading, setLoading] = useState(true);

  const { versions, isLoading: versionsLoading, restoreVersion, refetch } = useStrategyVersions(id);

  const fetchStrategy = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from("strategies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Strategy not found");
      navigate("/dashboard/strategies");
      return;
    }

    setStrategy(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStrategy();
  }, [id, navigate]);

  const handleRestoreVersion = async (version: { id: string; version: number; created_at: string; change_summary: string | null; config_snapshot: Json }) => {
    const success = await restoreVersion(version);
    if (success) {
      await fetchStrategy();
    }
  };

  const handleBacktest = async () => {
    if (!strategy) return;

    try {
      await supabase
        .from("strategies")
        .update({ status: "validated" })
        .eq("id", strategy.id);

      navigate(`/dashboard/backtest/${strategy.id}`);
    } catch (error) {
      toast.error("Failed to update strategy");
    }
  };

  const formatRulesAsText = (rules: Json): string => {
    if (!Array.isArray(rules)) return "No rules defined";
    return (rules as unknown as Rule[])
      .map(r => `${r.indicator} ${r.condition} ${r.value}`)
      .join(" AND ");
  };

  const getPlainEnglishExplanation = (): string => {
    if (!strategy) return "";
    
    const entryRules = strategy.entry_rules as unknown as Rule[];
    const exitRules = strategy.exit_rules as unknown as Rule[];
    
    let explanation = `This strategy trades on ${strategy.market_type === "cash" ? "stocks" : strategy.market_type} using a ${strategy.timeframe} timeframe.\n\n`;
    
    explanation += "**When to Buy:**\n";
    if (Array.isArray(entryRules)) {
      entryRules.forEach(rule => {
        explanation += `• When ${rule.indicator} is ${rule.condition} ${rule.value}\n`;
      });
    }
    
    explanation += "\n**When to Sell:**\n";
    if (Array.isArray(exitRules)) {
      exitRules.forEach(rule => {
        explanation += `• When ${rule.indicator} is ${rule.condition} ${rule.value}\n`;
      });
    }

    return explanation;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/3" />
            <div className="h-4 bg-secondary rounded w-1/2" />
            <div className="h-64 bg-secondary rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!strategy) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-light text-foreground mb-2">
            Strategy Review
          </h1>
          <p className="text-muted-foreground mb-8">
            Review your strategy before backtesting.
          </p>

          {/* Strategy Header */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-foreground">{strategy.name}</h2>
              <span className="px-3 py-1 bg-secondary text-muted-foreground text-sm rounded-full">
                {strategy.status}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Market: {strategy.market_type}</span>
              <span>•</span>
              <span>Timeframe: {strategy.timeframe}</span>
            </div>
          </div>

          {/* Plain English Explanation */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-foreground font-medium">Strategy Explanation</h3>
            </div>
            <div className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
              {getPlainEnglishExplanation()}
            </div>
          </div>

          {/* Technical Details (Collapsible) */}
          <div className="bg-card/50 border border-border rounded-xl overflow-hidden mb-6">
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <span className="text-foreground font-medium">Technical Rules</span>
              {showTechnical ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {showTechnical && (
              <div className="px-6 pb-6 border-t border-border pt-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Entry Conditions:</p>
                    <code className="block bg-secondary p-3 rounded-lg text-sm text-foreground">
                      {formatRulesAsText(strategy.entry_rules)}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Exit Conditions:</p>
                    <code className="block bg-secondary p-3 rounded-lg text-sm text-foreground">
                      {formatRulesAsText(strategy.exit_rules)}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Version History */}
          <VersionHistory
            strategyId={id || ""}
            versions={versions}
            currentVersion={strategy.version || 1}
            onRestore={handleRestoreVersion}
            isLoading={versionsLoading}
          />

          {/* Warning */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 mt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-500 font-medium text-sm">Important Notice</p>
                <p className="text-amber-500/80 text-sm mt-1">
                  This strategy will not place real trades. Backtesting uses historical data to simulate performance. Past results do not guarantee future returns.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleBacktest}
            className="group w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full text-base font-medium hover:bg-white/90 transition-colors"
          >
            Backtest Strategy
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StrategyReview;
