import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wrench, ArrowRight, Plus, Trash2, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StrategyCompilerCard } from "@/components/strategy/StrategyCompilerCard";
import { CompilationResult } from "@/hooks/useStrategyCompiler";

interface Rule {
  id: string;
  indicator: string;
  condition: string;
  value: string;
}

const StrategyCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Manual Mode State
  const [strategyName, setStrategyName] = useState("");
  const [marketType, setMarketType] = useState<"cash" | "crypto" | "fno">("cash");
  const [timeframe, setTimeframe] = useState("1d");
  const [entryRules, setEntryRules] = useState<Rule[]>([
    { id: "1", indicator: "RSI", condition: "below", value: "30" }
  ]);
  const [exitRules, setExitRules] = useState<Rule[]>([
    { id: "1", indicator: "RSI", condition: "above", value: "70" }
  ]);

  const indicators = ["RSI", "MACD", "SMA", "EMA", "Bollinger Bands", "Volume", "Price"];
  const conditions = ["above", "below", "crosses above", "crosses below", "equals"];
  const timeframes = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];

  const addRule = (type: "entry" | "exit") => {
    const newRule: Rule = {
      id: Date.now().toString(),
      indicator: "RSI",
      condition: "above",
      value: "50"
    };
    if (type === "entry") {
      setEntryRules([...entryRules, newRule]);
    } else {
      setExitRules([...exitRules, newRule]);
    }
  };

  const removeRule = (type: "entry" | "exit", id: string) => {
    if (type === "entry") {
      setEntryRules(entryRules.filter(r => r.id !== id));
    } else {
      setExitRules(exitRules.filter(r => r.id !== id));
    }
  };

  const updateRule = (type: "entry" | "exit", id: string, field: keyof Rule, value: string) => {
    const updateFn = (rules: Rule[]) =>
      rules.map(r => r.id === id ? { ...r, [field]: value } : r);
    
    if (type === "entry") {
      setEntryRules(updateFn(entryRules));
    } else {
      setExitRules(updateFn(exitRules));
    }
  };

  const handleManualSubmit = async () => {
    if (!strategyName.trim()) {
      toast.error("Please enter a strategy name");
      return;
    }
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("strategies")
        .insert({
          user_id: user.id,
          name: strategyName,
          market_type: marketType,
          timeframe,
          entry_rules: JSON.parse(JSON.stringify(entryRules)),
          exit_rules: JSON.parse(JSON.stringify(exitRules)),
          status: "draft",
          version: 1,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("strategy_versions").insert({
        strategy_id: data.id,
        version: 1,
        config_snapshot: {
          name: data.name,
          market_type: data.market_type,
          timeframe: data.timeframe,
          entry_rules: data.entry_rules,
          exit_rules: data.exit_rules,
          position_sizing: data.position_sizing,
          risk_limits: data.risk_limits,
          config: data.config,
        },
        change_summary: "Initial strategy creation",
      });

      toast.success("Strategy created!");
      navigate(`/dashboard/strategies/${data.id}/review`);
    } catch (error) {
      toast.error("Failed to create strategy");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-light text-foreground mb-2">
            Create Strategy
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-6 md:mb-8">
            Build a new trading strategy using the smart compiler or manual rules.
          </p>

          <Tabs defaultValue="compiler" className="w-full">
            <TabsList className="flex w-full mb-6 md:mb-8 overflow-x-auto gap-1 bg-transparent pb-1">
              <TabsTrigger value="compiler" className="flex items-center gap-2 flex-shrink-0 text-sm">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Smart</span> Compiler
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2 flex-shrink-0 text-sm">
                <Wrench className="w-4 h-4" />
                Manual
              </TabsTrigger>
            </TabsList>

            {/* Smart Compiler Tab */}
            <TabsContent value="compiler">
              <StrategyCompilerCard
                onStrategyCompiled={async (result: CompilationResult) => {
                  if (result.status === 'VALID' && result.strategy_json && user) {
                    // Optionally auto-create the strategy
                  }
                }}
              />
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 rounded-xl bg-secondary/30 border border-border"
              >
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  About the Strategy Compiler
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>Prompt Firewall</strong>: Rejects dangerous patterns like martingale or revenge trading</li>
                  <li>• <strong>Hard Caps</strong>: Enforces max 2% risk/trade, max 5 positions, min 0.25% stop loss</li>
                  <li>• <strong>Validation</strong>: Checks for conflicting rules and missing safety parameters</li>
                  <li>• <strong>Code Generation</strong>: Produces deterministic Python code for backtesting</li>
                </ul>
              </motion.div>
            </TabsContent>

            {/* Manual Builder Tab */}
            <TabsContent value="manual">
              <div className="space-y-6">
                <div className="bg-card/50 border border-border rounded-xl p-4 md:p-6">
                  <h3 className="text-foreground font-medium mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Strategy Name</label>
                      <input
                        type="text"
                        value={strategyName}
                        onChange={(e) => setStrategyName(e.target.value)}
                        placeholder="e.g., RSI Mean Reversion"
                        className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 md:py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Market Type</label>
                        <select
                          value={marketType}
                          onChange={(e) => setMarketType(e.target.value as "cash" | "crypto" | "fno")}
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 md:py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-white/20 [&>option]:bg-secondary [&>option]:text-foreground"
                        >
                          <option value="cash">Cash / Stocks</option>
                          <option value="crypto">Cryptocurrency</option>
                          <option value="fno" disabled>F&O (Locked)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Timeframe</label>
                        <select
                          value={timeframe}
                          onChange={(e) => setTimeframe(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 md:py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-white/20 [&>option]:bg-secondary [&>option]:text-foreground"
                        >
                          {timeframes.map(tf => (
                            <option key={tf} value={tf}>{tf}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Entry Rules */}
                <div className="bg-card/50 border border-border rounded-xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-foreground font-medium">Entry Rules</h3>
                    <button
                      onClick={() => addRule("entry")}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Rule</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {entryRules.map((rule) => (
                      <div key={rule.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-secondary/30 rounded-lg sm:p-0 sm:bg-transparent">
                        <div className="grid grid-cols-2 sm:flex sm:flex-1 gap-2">
                          <select
                            value={rule.indicator}
                            onChange={(e) => updateRule("entry", rule.id, "indicator", e.target.value)}
                            className="w-full sm:flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none [&>option]:bg-secondary [&>option]:text-foreground"
                          >
                            {indicators.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                          </select>
                          <select
                            value={rule.condition}
                            onChange={(e) => updateRule("entry", rule.id, "condition", e.target.value)}
                            className="w-full sm:flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none [&>option]:bg-secondary [&>option]:text-foreground"
                          >
                            {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={rule.value}
                            onChange={(e) => updateRule("entry", rule.id, "value", e.target.value)}
                            className="flex-1 sm:w-20 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none"
                          />
                          <button
                            onClick={() => removeRule("entry", rule.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exit Rules */}
                <div className="bg-card/50 border border-border rounded-xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-foreground font-medium">Exit Rules</h3>
                    <button
                      onClick={() => addRule("exit")}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Rule</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {exitRules.map((rule) => (
                      <div key={rule.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-secondary/30 rounded-lg sm:p-0 sm:bg-transparent">
                        <div className="grid grid-cols-2 sm:flex sm:flex-1 gap-2">
                          <select
                            value={rule.indicator}
                            onChange={(e) => updateRule("exit", rule.id, "indicator", e.target.value)}
                            className="w-full sm:flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none [&>option]:bg-secondary [&>option]:text-foreground"
                          >
                            {indicators.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                          </select>
                          <select
                            value={rule.condition}
                            onChange={(e) => updateRule("exit", rule.id, "condition", e.target.value)}
                            className="w-full sm:flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none [&>option]:bg-secondary [&>option]:text-foreground"
                          >
                            {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={rule.value}
                            onChange={(e) => updateRule("exit", rule.id, "value", e.target.value)}
                            className="flex-1 sm:w-20 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none"
                          />
                          <button
                            onClick={() => removeRule("exit", rule.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleManualSubmit}
                  className="group w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full text-base font-medium hover:bg-white/90 transition-colors"
                >
                  Continue to Review
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StrategyCreate;
