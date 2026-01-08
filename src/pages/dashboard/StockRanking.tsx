import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, RefreshCw, Filter, ArrowUpRight, ArrowDownRight, Sparkles, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface StockRanking {
  id: string;
  symbol: string;
  company_name: string;
  rank_score: number;
  momentum_score: number;
  value_score: number;
  quality_score: number;
  volatility_score: number;
  sector: string;
  market_cap_tier: string;
  ai_analysis: string;
  last_updated: string;
}

const StockRanking = () => {
  const [sector, setSector] = useState<string>("");
  const [marketCap, setMarketCap] = useState<string>("");
  const [riskTolerance, setRiskTolerance] = useState<string>("moderate");
  const [showFilters, setShowFilters] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch existing rankings
  const { data: rankings, isLoading } = useQuery({
    queryKey: ["stock-rankings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_rankings")
        .select("*")
        .order("rank_score", { ascending: false });
      
      if (error) throw error;
      return data as StockRanking[];
    },
  });

  // Generate new rankings mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("stock-ranker", {
        body: { sector, marketCap, riskTolerance },
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.rankings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-rankings"] });
      toast.success("Stock rankings generated successfully!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to generate rankings");
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20";
    if (score >= 60) return "bg-yellow-500/20";
    return "bg-red-500/20";
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-light text-foreground mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-500" />
                ML Stock Ranking
              </h1>
              <p className="text-muted-foreground">
                AI-powered stock analysis and ranking based on multiple factors.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-full hover:bg-secondary/80 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${generateMutation.isPending ? "animate-spin" : ""}`} />
                {generateMutation.isPending ? "Generating..." : "Generate Rankings"}
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card/50 border border-border rounded-xl p-6 mb-6"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Sector</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground"
                  >
                    <option value="">All Sectors</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Energy">Energy</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Market Cap</label>
                  <select
                    value={marketCap}
                    onChange={(e) => setMarketCap(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground"
                  >
                    <option value="">All Sizes</option>
                    <option value="large">Large Cap</option>
                    <option value="mid">Mid Cap</option>
                    <option value="small">Small Cap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Risk Tolerance</label>
                  <select
                    value={riskTolerance}
                    onChange={(e) => setRiskTolerance(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground"
                  >
                    <option value="low">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">Aggressive</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && (!rankings || rankings.length === 0) && (
            <div className="bg-card/50 border border-border rounded-xl p-12 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium text-foreground mb-2">No Rankings Yet</h2>
              <p className="text-muted-foreground mb-6">
                Click "Generate Rankings" to create AI-powered stock rankings based on your criteria.
              </p>
              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="px-6 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                Generate Rankings
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-xl" />
                    <div className="flex-1">
                      <div className="h-5 bg-secondary rounded w-32 mb-2" />
                      <div className="h-4 bg-secondary rounded w-48" />
                    </div>
                    <div className="h-10 bg-secondary rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rankings List */}
          {rankings && rankings.length > 0 && (
            <div className="space-y-4">
              {rankings.map((stock, index) => (
                <motion.div
                  key={stock.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-card/50 border border-border rounded-xl p-6 hover:bg-card/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-foreground">#{index + 1}</span>
                    </div>

                    {/* Stock Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-medium text-foreground">{stock.symbol}</h3>
                        <span className="text-sm text-muted-foreground">{stock.company_name}</span>
                        <span className="px-2 py-0.5 bg-secondary text-xs text-muted-foreground rounded-full">
                          {stock.sector}
                        </span>
                        <span className="px-2 py-0.5 bg-secondary text-xs text-muted-foreground rounded-full capitalize">
                          {stock.market_cap_tier} cap
                        </span>
                      </div>

                      {/* Scores */}
                      <div className="flex flex-wrap gap-3 mt-3">
                        <ScoreBadge label="Momentum" score={stock.momentum_score} />
                        <ScoreBadge label="Value" score={stock.value_score} />
                        <ScoreBadge label="Quality" score={stock.quality_score} />
                        <ScoreBadge label="Low Vol" score={stock.volatility_score} />
                      </div>

                      {/* AI Analysis */}
                      {stock.ai_analysis && (
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {stock.ai_analysis}
                        </p>
                      )}
                    </div>

                    {/* Overall Score */}
                    <div className={`px-4 py-2 rounded-xl ${getScoreBg(stock.rank_score)}`}>
                      <div className="flex items-center gap-1">
                        {stock.rank_score >= 70 ? (
                          <ArrowUpRight className={`w-4 h-4 ${getScoreColor(stock.rank_score)}`} />
                        ) : (
                          <ArrowDownRight className={`w-4 h-4 ${getScoreColor(stock.rank_score)}`} />
                        )}
                        <span className={`text-2xl font-bold ${getScoreColor(stock.rank_score)}`}>
                          {stock.rank_score}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">Overall</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-500 font-medium text-sm">Educational Purpose Only</p>
                <p className="text-amber-500/80 text-sm mt-1">
                  These rankings are generated by AI for educational purposes only. They do not constitute
                  financial advice. Always do your own research before making investment decisions.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

const ScoreBadge = ({ label, score }: { label: string; score: number }) => {
  const getColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`font-medium ${getColor(score)}`}>{score}</span>
    </div>
  );
};

export default StockRanking;
