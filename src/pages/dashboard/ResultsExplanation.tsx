import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BacktestResult {
  id: string;
  strategy_id: string;
  metrics: {
    totalReturn: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    sharpeRatio: number;
    profitFactor: number;
  };
}

const ResultsExplanation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("backtest_results")
        .select("*")
        .eq("strategy_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        toast.error("Results not found");
        navigate("/dashboard/strategies");
        return;
      }

      setResult(data as unknown as BacktestResult);
      setLoading(false);
    };

    fetchResults();
  }, [id, navigate]);

  const handleStartPaperTrading = () => {
    navigate("/dashboard/paper-trading");
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

  if (!result) return null;

  const metrics = result.metrics;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-light text-foreground mb-2">
            Results Explanation
          </h1>
          <p className="text-muted-foreground mb-8">
            Understanding what your backtest results mean.
          </p>

          {/* Performance Summary */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
            <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Summary
            </h3>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                Your strategy achieved a <span className="text-green-500 font-medium">+{metrics.totalReturn}% return</span> over the testing period. 
                This means if you had invested $100,000, your portfolio would have grown to approximately $
                {(100000 * (1 + metrics.totalReturn / 100)).toLocaleString()}.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The strategy executed <span className="text-foreground font-medium">{metrics.totalTrades} trades</span> with a 
                <span className="text-foreground font-medium"> {metrics.winRate}% win rate</span>, meaning roughly {Math.round(metrics.totalTrades * metrics.winRate / 100)} trades 
                were profitable.
              </p>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
            <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Risk Analysis
            </h3>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                The <span className="text-red-500 font-medium">maximum drawdown was {metrics.maxDrawdown}%</span>. 
                This represents the largest peak-to-trough decline during the testing period.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                In practical terms, at some point during the test, your portfolio would have 
                dropped by {Math.abs(metrics.maxDrawdown)}% from its highest value before recovering. 
                This is an important consideration for risk management.
              </p>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
            <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Key Insights
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2" />
                <span className="text-muted-foreground">
                  <span className="text-foreground">Sharpe Ratio of {metrics.sharpeRatio}:</span> This measures risk-adjusted returns. 
                  A ratio above 1.0 is generally considered good, indicating returns that compensate for the risk taken.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2" />
                <span className="text-muted-foreground">
                  <span className="text-foreground">Profit Factor of {metrics.profitFactor}:</span> This means for every $1 lost, 
                  the strategy made ${metrics.profitFactor}. Values above 1.5 are considered healthy.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2" />
                <span className="text-muted-foreground">
                  <span className="text-foreground">Trade Frequency:</span> {metrics.totalTrades} trades over 12 months averages 
                  to about {Math.round(metrics.totalTrades / 12)} trades per month, which is a moderate frequency.
                </span>
              </li>
            </ul>
          </div>

          {/* Limitations Warning */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-500 font-medium text-sm">Important Limitations</p>
                <ul className="text-amber-500/80 text-sm mt-2 space-y-1">
                  <li>• Backtests use historical data and cannot predict future performance</li>
                  <li>• Real trading involves slippage, fees, and market impact not fully captured here</li>
                  <li>• Market conditions change, making past patterns less reliable</li>
                  <li>• Paper trading is strongly recommended before any real capital deployment</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStartPaperTrading}
            className="group w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full text-base font-medium hover:bg-white/90 transition-colors"
          >
            Start Paper Trading
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ResultsExplanation;
