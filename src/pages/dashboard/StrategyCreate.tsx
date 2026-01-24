import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wrench, ArrowRight, Send, Plus, Trash2, Brain } from "lucide-react";
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

interface ParsedStrategy {
  name: string;
  description: string;
  market_type: "cash" | "crypto";
  timeframe: string;
  entry_rules: { indicator: string; condition: string; value: string }[];
  exit_rules: { indicator: string; condition: string; value: string }[];
  position_sizing?: { type: string; value: number };
  risk_limits?: { max_drawdown_percent: number; stop_loss_percent: number };
}

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-strategy`;

const StrategyCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // AI Mode State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! Describe the trading strategy you want to create. For example:\n\n• \"Buy when RSI is below 30 and sell when it goes above 70\"\n• \"Create a moving average crossover strategy for crypto\"\n• \"Build a momentum strategy using MACD for daily trading\"\n\nI'll help you build a structured strategy that you can backtest." }
  ]);
  const [parsedStrategy, setParsedStrategy] = useState<ParsedStrategy | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Parse strategy JSON from AI response
  const parseStrategyFromResponse = (content: string): ParsedStrategy | null => {
    const strategyMatch = content.match(/```strategy\s*([\s\S]*?)```/);
    if (strategyMatch) {
      try {
        return JSON.parse(strategyMatch[1].trim());
      } catch (e) {
        console.error("Failed to parse strategy JSON:", e);
      }
    }
    return null;
  };

  const handleAiSubmit = async () => {
    if (!aiPrompt.trim() || aiGenerating) return;

    const userMessage: Message = { role: "user", content: aiPrompt };
    setMessages(prev => [...prev, userMessage]);
    setAiPrompt("");
    setAiGenerating(true);

    let assistantContent = "";

    const updateAssistantMessage = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2].role === "user") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (response.status === 402) {
          toast.error("AI credits exhausted. Please add credits to continue.");
        } else {
          toast.error(errorData.error || "Failed to generate strategy");
        }
        setAiGenerating(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistantMessage(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Check if we got a strategy in the response
      const strategy = parseStrategyFromResponse(assistantContent);
      if (strategy) {
        setParsedStrategy(strategy);
      }

    } catch (error) {
      console.error("AI error:", error);
      toast.error("Failed to connect to AI. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateFromAI = async () => {
    if (!user || !parsedStrategy) return;

    try {
      const { data, error } = await supabase
        .from("strategies")
        .insert({
          user_id: user.id,
          name: parsedStrategy.name,
          description: parsedStrategy.description,
          market_type: parsedStrategy.market_type,
          timeframe: parsedStrategy.timeframe,
          entry_rules: JSON.parse(JSON.stringify(parsedStrategy.entry_rules.map((r, i) => ({ ...r, id: String(i) })))),
          exit_rules: JSON.parse(JSON.stringify(parsedStrategy.exit_rules.map((r, i) => ({ ...r, id: String(i) })))),
          position_sizing: parsedStrategy.position_sizing ? JSON.parse(JSON.stringify(parsedStrategy.position_sizing)) : null,
          risk_limits: parsedStrategy.risk_limits ? JSON.parse(JSON.stringify(parsedStrategy.risk_limits)) : null,
          status: "draft",
          version: 1,
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial version snapshot
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
      console.error("Create error:", error);
      toast.error("Failed to create strategy");
    }
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

      // Create initial version snapshot
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

  // Format AI response for display (remove JSON blocks)
  const formatDisplayContent = (content: string) => {
    return content.replace(/```strategy[\s\S]*?```/g, "").trim();
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

          <Tabs defaultValue="compiler" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="compiler" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Smart Compiler
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
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
              
              {/* Info about the compiler */}
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

            {/* AI-Assisted Tab */}
            <TabsContent value="ai">
              <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
                {/* Chat Messages */}
                <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, idx) => (
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
                        <p className="whitespace-pre-wrap text-sm">
                          {formatDisplayContent(msg.content)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {aiGenerating && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex justify-start">
                      <div className="bg-secondary text-foreground p-4 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAiSubmit()}
                      placeholder="Describe your strategy..."
                      disabled={aiGenerating}
                      className="flex-1 bg-secondary border border-border rounded-full px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
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

              {/* Strategy Preview & Create Button */}
              {parsedStrategy && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="bg-card/50 border border-white/20 rounded-xl p-6 mb-4">
                    <h3 className="text-foreground font-medium mb-3">Strategy Ready</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-foreground ml-2">{parsedStrategy.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Market:</span>
                        <span className="text-foreground ml-2">{parsedStrategy.market_type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timeframe:</span>
                        <span className="text-foreground ml-2">{parsedStrategy.timeframe}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rules:</span>
                        <span className="text-foreground ml-2">
                          {parsedStrategy.entry_rules.length} entry, {parsedStrategy.exit_rules.length} exit
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateFromAI}
                    className="group w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full text-base font-medium hover:bg-white/90 transition-colors"
                  >
                    Create & Review Strategy
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </motion.div>
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
