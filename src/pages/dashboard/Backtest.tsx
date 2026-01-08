import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, TrendingDown, BarChart3, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BacktestMetrics {
  totalReturn: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  sharpeRatio: number;
  profitFactor: number;
}

interface EquityPoint {
  date: string;
  value: number;
}

const Backtest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [strategy, setStrategy] = useState<{ id: string; name: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BacktestMetrics | null>(null);
  const [equityCurve, setEquityCurve] = useState<EquityPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrategy = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("strategies")
        .select("id, name")
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

    fetchStrategy();
  }, [id, navigate]);

  const runBacktest = async () => {
    if (!strategy || !user) return;
    
    setIsRunning(true);
    setProgress(0);

    // Simulate backtest progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate backtest completion
    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);

      // Generate mock results
      const mockMetrics: BacktestMetrics = {
        totalReturn: 23.4,
        maxDrawdown: -12.8,
        winRate: 58.3,
        totalTrades: 47,
        sharpeRatio: 1.42,
        profitFactor: 1.85,
      };

      const mockEquity: EquityPoint[] = Array.from({ length: 12 }, (_, i) => ({
        date: `2024-${String(i + 1).padStart(2, "0")}`,
        value: 100000 + Math.random() * 30000 - 5000 + (i * 2000),
      }));

      // Save results to database
      try {
        await supabase.from("backtest_results").insert([{
          strategy_id: strategy.id,
          user_id: user.id,
          strategy_version: 1,
          status: "completed",
          parameters: { start_date: "2024-01-01", end_date: "2024-12-31" } as unknown as Record<string, unknown>,
          metrics: mockMetrics as unknown as Record<string, unknown>,
          equity_curve: mockEquity as unknown as Record<string, unknown>,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        }]);

        await supabase
          .from("strategies")
          .update({ status: "backtested" })
          .eq("id", strategy.id);
      } catch (error) {
        console.error("Failed to save backtest results");
      }

      setResults(mockMetrics);
      setEquityCurve(mockEquity);
      setIsRunning(false);
    }, 3500);
  };

  const handleExplainResults = () => {
    navigate(`/dashboard/results/${id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/3" />
            <div className="h-4 bg-secondary rounded w-1/2" />
            <div className="h-64 bg-secondary rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-light text-foreground mb-2">
            Backtesting
          </h1>
          <p className="text-muted-foreground mb-8">
            Test your strategy against historical data.
          </p>

          {/* Strategy Info */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-foreground">{strategy?.name}</h2>
                <p className="text-sm text-muted-foreground">Testing period: Jan 2024 - Dec 2024</p>
              </div>
              {!results && !isRunning && (
                <button
                  onClick={runBacktest}
                  className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Run Backtest
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Running backtest...</span>
                <span className="text-sm text-foreground">{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <>
              {/* Equity Curve Placeholder */}
              <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
                <h3 className="text-foreground font-medium mb-4">Equity Curve</h3>
                <div className="h-[200px] flex items-center justify-center relative">
                  {/* Simple visualization */}
                  <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                    {equityCurve.map((point, idx) => (
                      <div
                        key={idx}
                        className="bg-white/20 hover:bg-white/40 transition-colors rounded-t"
                        style={{
                          height: `${((point.value - 90000) / 50000) * 100}%`,
                          width: "6%",
                        }}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Jan 2024</span>
                  <span>Dec 2024</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-card/50 border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Total Return</span>
                  </div>
                  <p className="text-2xl font-medium text-green-500">+{results.totalReturn}%</p>
                </div>

                <div className="bg-card/50 border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Max Drawdown</span>
                  </div>
                  <p className="text-2xl font-medium text-red-500">{results.maxDrawdown}%</p>
                </div>

                <div className="bg-card/50 border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                  </div>
                  <p className="text-2xl font-medium text-foreground">{results.winRate}%</p>
                </div>

                <div className="bg-card/50 border border-border rounded-xl p-5">
                  <span className="text-sm text-muted-foreground">Total Trades</span>
                  <p className="text-xl font-medium text-foreground mt-1">{results.totalTrades}</p>
                </div>

                <div className="bg-card/50 border border-border rounded-xl p-5">
                  <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                  <p className="text-xl font-medium text-foreground mt-1">{results.sharpeRatio}</p>
                </div>

                <div className="bg-card/50 border border-border rounded-xl p-5">
                  <span className="text-sm text-muted-foreground">Profit Factor</span>
                  <p className="text-xl font-medium text-foreground mt-1">{results.profitFactor}</p>
                </div>
              </div>

              {/* Risk Notice */}
              <div className="bg-card/50 border border-border rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    These results are based on historical data. Past performance does not guarantee future results. Market conditions can change significantly.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleExplainResults}
                className="group w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full text-base font-medium hover:bg-white/90 transition-colors"
              >
                Explain Results
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </>
          )}

          {/* Empty State */}
          {!results && !isRunning && (
            <div className="bg-card/50 border border-border rounded-xl p-12 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-foreground font-medium mb-2">Ready to Backtest</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Click "Run Backtest" to test your strategy against historical market data.
              </p>
              <button
                onClick={runBacktest}
                className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Run Backtest
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Backtest;
