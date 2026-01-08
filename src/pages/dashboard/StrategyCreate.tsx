import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wrench, ArrowRight, Send, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Rule {
  id: string;
  indicator: string;
  condition: string;
  value: string;
}

const StrategyCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // AI Mode State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hi! Describe the trading strategy you want to create. For example: \"Buy when RSI is below 30 and sell when it goes above 70\" or \"Create a moving average crossover strategy for crypto.\"" }
  ]);

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

  const handleAiSubmit = async () => {
    if (!aiPrompt.trim()) return;
    
    setAiMessages(prev => [...prev, { role: "user", content: aiPrompt }]);
    setAiGenerating(true);
    setAiPrompt("");

    // Simulate AI response (in production, this would call the edge function)
    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        role: "ai",
        content: "I've understood your strategy. Here's what I'll create:\n\n**Strategy: RSI Mean Reversion**\n- Market: Cash/Stocks\n- Timeframe: Daily\n- Entry: Buy when RSI(14) < 30\n- Exit: Sell when RSI(14) > 70\n- Position Size: 5% of portfolio per trade\n\nThis is a classic mean reversion strategy. Would you like to proceed to review, or would you like to modify anything?"
      }]);
      setAiGenerating(false);
    }, 2000);
  };

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
        .insert([{
          user_id: user.id,
          name: strategyName,
          market_type: marketType,
          timeframe,
          entry_rules: entryRules as unknown as Record<string, unknown>,
          exit_rules: exitRules as unknown as Record<string, unknown>,
          status: "draft",
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success("Strategy created!");
      navigate(`/dashboard/strategies/${data.id}/review`);
    } catch (error) {
      toast.error("Failed to create strategy");
    }
  };

  const handleAiContinue = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("strategies")
        .insert([{
          user_id: user.id,
          name: "RSI Mean Reversion",
          market_type: "cash",
          timeframe: "1d",
          entry_rules: [{ indicator: "RSI", condition: "below", value: "30" }] as unknown as Record<string, unknown>,
          exit_rules: [{ indicator: "RSI", condition: "above", value: "70" }] as unknown as Record<string, unknown>,
          status: "draft",
        }])
        .select()
        .single();

      if (error) throw error;
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
          <h1 className="font-display text-3xl font-light text-foreground mb-2">
            Create Strategy
          </h1>
          <p className="text-muted-foreground mb-8">
            Build a new trading strategy using AI assistance or manual rules.
          </p>

          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI-Assisted
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Manual Builder
              </TabsTrigger>
            </TabsList>

            {/* AI-Assisted Tab */}
            <TabsContent value="ai">
              <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
                {/* Chat Messages */}
                <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                  {aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-xl ${
                          msg.role === "user"
                            ? "bg-white text-black"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {aiGenerating && (
                    <div className="flex justify-start">
                      <div className="bg-secondary text-foreground p-4 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-150" />
                          <div className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-300" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAiSubmit()}
                      placeholder="Describe your strategy..."
                      className="flex-1 bg-secondary border border-border rounded-full px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                    <button
                      onClick={handleAiSubmit}
                      disabled={aiGenerating || !aiPrompt.trim()}
                      className="p-3 bg-white text-black rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {aiMessages.length > 2 && (
                <button
                  onClick={handleAiContinue}
                  className="group w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full text-base font-medium hover:bg-white/90 transition-colors mt-6"
                >
                  Continue to Review
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </TabsContent>

            {/* Manual Builder Tab */}
            <TabsContent value="manual">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-card/50 border border-border rounded-xl p-6">
                  <h3 className="text-foreground font-medium mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Strategy Name</label>
                      <input
                        type="text"
                        value={strategyName}
                        onChange={(e) => setStrategyName(e.target.value)}
                        placeholder="e.g., RSI Mean Reversion"
                        className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Market Type</label>
                        <select
                          value={marketType}
                          onChange={(e) => setMarketType(e.target.value as "cash" | "crypto" | "fno")}
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-white/20"
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
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-white/20"
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
                <div className="bg-card/50 border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-foreground font-medium">Entry Rules</h3>
                    <button
                      onClick={() => addRule("entry")}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Rule
                    </button>
                  </div>
                  <div className="space-y-3">
                    {entryRules.map((rule) => (
                      <div key={rule.id} className="flex items-center gap-3">
                        <select
                          value={rule.indicator}
                          onChange={(e) => updateRule("entry", rule.id, "indicator", e.target.value)}
                          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none"
                        >
                          {indicators.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                        <select
                          value={rule.condition}
                          onChange={(e) => updateRule("entry", rule.id, "condition", e.target.value)}
                          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none"
                        >
                          {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                        </select>
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => updateRule("entry", rule.id, "value", e.target.value)}
                          className="w-20 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none"
                        />
                        <button
                          onClick={() => removeRule("entry", rule.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exit Rules */}
                <div className="bg-card/50 border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-foreground font-medium">Exit Rules</h3>
                    <button
                      onClick={() => addRule("exit")}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Rule
                    </button>
                  </div>
                  <div className="space-y-3">
                    {exitRules.map((rule) => (
                      <div key={rule.id} className="flex items-center gap-3">
                        <select
                          value={rule.indicator}
                          onChange={(e) => updateRule("exit", rule.id, "indicator", e.target.value)}
                          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none"
                        >
                          {indicators.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                        <select
                          value={rule.condition}
                          onChange={(e) => updateRule("exit", rule.id, "condition", e.target.value)}
                          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none"
                        >
                          {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                        </select>
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => updateRule("exit", rule.id, "value", e.target.value)}
                          className="w-20 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none"
                        />
                        <button
                          onClick={() => removeRule("exit", rule.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
