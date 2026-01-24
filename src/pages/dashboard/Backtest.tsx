import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, TrendingDown, BarChart3, AlertCircle, Play, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 90));
    }, 200);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-backtest`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            strategyId: strategy.id,
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            symbol: 'NIFTY'
          }),
        }
      );

      clearInterval(interval);
      setProgress(100);

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        setIsRunning(false);
        return;
      }

      setResults(data.metrics);
      setEquityCurve(data.equityCurve || []);
      toast.success('Backtest completed successfully!');
    } catch (error) {
      clearInterval(interval);
      console.error('Backtest error:', error);
      toast.error('Failed to run backtest');
    }
    
    setIsRunning(false);
  };

  const handleExplainResults = () => {
    navigate(`/dashboard/results/${id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="h-8 bg-secondary rounded-xl w-1/3 shimmer" />
            <div className="h-4 bg-secondary rounded-xl w-1/2 shimmer" />
            <div className="h-64 bg-secondary rounded-2xl shimmer" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const metrics = [
    { label: "Total Return", value: `+${results?.totalReturn}%`, icon: TrendingUp, color: "text-[hsl(142_71%_45%)]", bgColor: "bg-[hsl(142_71%_45%/0.1)]" },
    { label: "Max Drawdown", value: `${results?.maxDrawdown}%`, icon: TrendingDown, color: "text-destructive", bgColor: "bg-destructive/10" },
    { label: "Win Rate", value: `${results?.winRate}%`, icon: BarChart3, color: "text-foreground", bgColor: "bg-secondary" },
    { label: "Total Trades", value: results?.totalTrades, icon: BarChart3, color: "text-foreground", bgColor: "bg-secondary" },
    { label: "Sharpe Ratio", value: results?.sharpeRatio, icon: BarChart3, color: "text-foreground", bgColor: "bg-secondary" },
    { label: "Profit Factor", value: results?.profitFactor, icon: BarChart3, color: "text-foreground", bgColor: "bg-secondary" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground mb-2">
            Backtesting
          </h1>
          <p className="text-muted-foreground text-lg">
            Test your strategy against historical data.
          </p>
        </motion.div>

        {/* Strategy Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-foreground mb-1">{strategy?.name}</h2>
              <p className="text-sm text-muted-foreground">Testing period: Jan 2024 - Dec 2024</p>
            </div>
            {!results && !isRunning && (
              <button
                onClick={runBacktest}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Play className="w-4 h-4" />
                Run Backtest
              </button>
            )}
          </div>
        </motion.div>

        {/* Progress Bar */}
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-foreground animate-spin" />
                <span className="text-foreground font-medium">Running backtest...</span>
              </div>
              <span className="text-foreground font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Results */}
        {results && (
          <>
            {/* Equity Curve */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="text-foreground font-medium mb-6">Equity Curve</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityCurve}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(38 60% 50%)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(38 60% 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(220 15% 25%)" 
                      tick={{ fill: "hsl(220 10% 50%)", fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="hsl(220 15% 25%)" 
                      tick={{ fill: "hsl(220 10% 50%)", fontSize: 12 }} 
                      tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(220 18% 6%)", 
                        border: "1px solid hsl(220 15% 14%)", 
                        borderRadius: "12px",
                        boxShadow: "0 8px 30px -10px hsl(220 20% 5% / 0.5)"
                      }} 
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, "Portfolio Value"]} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(38 60% 50%)" 
                      fill="url(#equityGradient)" 
                      strokeWidth={2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Metrics Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {metrics.map((metric, index) => (
                <div 
                  key={metric.label} 
                  className="bg-card border border-border rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                      <metric.icon className={`w-4 h-4 ${metric.color}`} />
                    </div>
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                  </div>
                  <p className={`text-2xl font-light ${index < 2 ? metric.color : "text-foreground"}`}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Risk Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-foreground font-medium text-sm mb-1">Important Notice</p>
                  <p className="text-muted-foreground text-sm">
                    These results are based on historical data. Past performance does not guarantee future results. Market conditions can change significantly.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handleExplainResults}
              className="group w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-base font-medium hover:bg-primary/90 transition-all"
            >
              Explain Results
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </>
        )}

        {/* Empty State */}
        {!results && !isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center text-center p-16 rounded-2xl border-2 border-dashed border-border bg-card/30"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">Ready to Backtest</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              Click "Run Backtest" to test your strategy against historical market data and see how it would have performed.
            </p>
            <button
              onClick={runBacktest}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" />
              Run Backtest
            </button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Backtest;
