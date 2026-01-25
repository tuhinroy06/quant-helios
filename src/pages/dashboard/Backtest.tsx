import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, TrendingDown, BarChart3, AlertCircle, Play, Loader2, Clock, Target, Zap, Activity, Shield, Ban } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatINR } from "@/lib/indian-stocks";
import { EquityCurveChart, PnLHistogramChart } from "@/components/charts";

interface BacktestMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalReturn: number;
  cagr: number;
  maxDrawdown: number;
  avgWin: number;
  avgLoss: number;
  riskReward: number;
  profitFactor: number;
  expectancy: number;
  medianPnl: number;
  pnlStd: number;
  sharpeRatio: number;
  finalEquity: number;
  avgTradeDuration: number;
  tradingDisabled: boolean;
}

interface EquityPoint {
  date: string;
  value: number;
  cash?: number;
}

interface TradeRecord {
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPct: number;
  entryReason: string;
  exitReason: string;
  durationBars: number;
}

interface BacktestMetadata {
  engineVersion: string;
  configHash: string;
  strategyId: string;
  strategyName: string;
  runTimestamp: string;
  finalLiquidationPolicy: string;
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
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [metadata, setMetadata] = useState<BacktestMetadata | null>(null);
  const [rejectedSignals, setRejectedSignals] = useState<unknown[]>([]);
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
      setProgress(prev => Math.min(prev + 3, 90));
    }, 150);

    try {
      const { data, error } = await supabase.functions.invoke('run-backtest', {
      const { data, error } = await supabase.functions.invoke("run-backtest", {
        body: {
          strategyId: strategy.id,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          symbol: 'NIFTY',
          initialCapital: 1000000
        }
      });

      clearInterval(interval);
      setProgress(100);

      if (error) {
        console.error('Backtest error:', error);
        toast.error(error.message || 'Failed to run backtest');
        const status = error.context?.status ?? error.status;
        const body = error.context?.body;
        const errorBody = typeof body === "string" ? body : body ? JSON.stringify(body) : "";
        const statusLabel = status ? `Status ${status}` : "Status unavailable";
        toast.error(`Backtest failed (${statusLabel}): ${errorBody || error.message}`);
        setIsRunning(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setIsRunning(false);
        return;
      }

      setResults(data?.metrics ?? null);
      setEquityCurve(data?.equityCurve || []);
      setTrades(data?.trades || []);
      setMetadata(data?.metadata ?? null);
      setRejectedSignals(data?.rejectedSignals || []);
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
        <div className="max-w-6xl mx-auto">
          <div className="space-y-4">
            <div className="h-8 bg-secondary rounded-xl w-1/3 shimmer" />
            <div className="h-4 bg-secondary rounded-xl w-1/2 shimmer" />
            <div className="h-64 bg-secondary rounded-2xl shimmer" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const primaryMetrics = [
    { label: "Total Return", value: `${results?.totalReturn > 0 ? '+' : ''}${results?.totalReturn}%`, icon: TrendingUp, color: results?.totalReturn >= 0 ? "text-[hsl(142_71%_45%)]" : "text-destructive", bgColor: results?.totalReturn >= 0 ? "bg-[hsl(142_71%_45%/0.1)]" : "bg-destructive/10" },
    { label: "CAGR", value: `${results?.cagr > 0 ? '+' : ''}${results?.cagr}%`, icon: Activity, color: results?.cagr >= 0 ? "text-[hsl(142_71%_45%)]" : "text-destructive", bgColor: results?.cagr >= 0 ? "bg-[hsl(142_71%_45%/0.1)]" : "bg-destructive/10" },
    { label: "Max Drawdown", value: `${results?.maxDrawdown}%`, icon: TrendingDown, color: "text-destructive", bgColor: "bg-destructive/10" },
    { label: "Win Rate", value: `${results?.winRate}%`, icon: Target, color: "text-foreground", bgColor: "bg-secondary" },
    { label: "Sharpe Ratio", value: results?.sharpeRatio?.toFixed(2), icon: Zap, color: "text-foreground", bgColor: "bg-secondary" },
    { label: "Profit Factor", value: results?.profitFactor?.toFixed(2), icon: BarChart3, color: "text-foreground", bgColor: "bg-secondary" },
  ];

  const secondaryMetrics = [
    { label: "Total Trades", value: results?.totalTrades },
    { label: "Winning Trades", value: results?.winningTrades },
    { label: "Losing Trades", value: results?.losingTrades },
    { label: "Avg Win", value: formatINR(results?.avgWin || 0) },
    { label: "Avg Loss", value: formatINR(results?.avgLoss || 0) },
    { label: "Risk/Reward", value: results?.riskReward?.toFixed(2) },
    { label: "Expectancy", value: formatINR(results?.expectancy || 0) },
    { label: "Median PnL", value: formatINR(results?.medianPnl || 0) },
    { label: "PnL Std Dev", value: formatINR(results?.pnlStd || 0) },
    { label: "Avg Duration", value: `${results?.avgTradeDuration || 0} bars` },
    { label: "Final Equity", value: formatINR(results?.finalEquity || 0) },
    { label: "Rejected Signals", value: rejectedSignals.length },
  ];

  const tradePnLData = trades.map((t, i) => ({
    trade: i + 1,
    pnl: t.pnl,
    pnlPct: t.pnlPct
  }));

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">
              Backtesting
            </h1>
            {metadata && (
              <Badge variant="outline" className="text-xs">
                Engine v{metadata.engineVersion}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-lg">
            Production-grade backtesting with realistic execution simulation.
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
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Symbol: NIFTY</span>
                <span>Capital: ₹10,00,000</span>
                <span>Period: Jan 2024 - Dec 2024</span>
              </div>
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
                <span className="text-foreground font-medium">Running production backtest...</span>
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
            <p className="text-xs text-muted-foreground mt-3">
              Executing next-bar logic with slippage, brokerage, and risk validation...
            </p>
          </motion.div>
        )}

        {/* Results */}
        {results && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trades">Trades ({trades.length})</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Trading Disabled Warning */}
              {results.tradingDisabled && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <Ban className="w-5 h-5 text-destructive" />
                    <span className="text-destructive font-medium">Trading was disabled due to max drawdown breach</span>
                  </div>
                </motion.div>
              )}

              {/* Equity Curve */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h3 className="text-foreground font-medium mb-6">Equity Curve</h3>
                <EquityCurveChart data={equityCurve} height={256} />
              </motion.div>

              {/* Primary Metrics Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
              >
                {primaryMetrics.map((metric) => (
                  <div 
                    key={metric.label} 
                    className="bg-card border border-border rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                        <metric.icon className={`w-4 h-4 ${metric.color}`} />
                      </div>
                    </div>
                    <p className={`text-xl font-light ${metric.color}`}>
                      {metric.value}
                    </p>
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                  </div>
                ))}
              </motion.div>

              {/* Secondary Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h3 className="text-foreground font-medium mb-4">Detailed Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {secondaryMetrics.map((metric) => (
                    <div key={metric.label} className="p-3 bg-secondary/30 rounded-xl">
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-foreground font-medium">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="trades" className="space-y-6">
              {/* Trade PnL Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h3 className="text-foreground font-medium mb-6">Trade P&L Distribution</h3>
                <PnLHistogramChart data={tradePnLData} height={192} />
              </motion.div>

              {/* Trade Log Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-border">
                  <h3 className="text-foreground font-medium">Trade Log</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-3 text-muted-foreground font-medium">#</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Entry</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Exit</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">Entry ₹</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">Exit ₹</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">Qty</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">P&L</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">P&L %</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Exit Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.slice(0, 20).map((trade, i) => (
                        <tr key={i} className="border-t border-border hover:bg-secondary/20">
                          <td className="p-3 text-foreground">{i + 1}</td>
                          <td className="p-3 text-foreground text-xs">{trade.entryTime?.split("T")[0]}</td>
                          <td className="p-3 text-foreground text-xs">{trade.exitTime?.split("T")[0]}</td>
                          <td className="p-3 text-right text-foreground">₹{trade.entryPrice?.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right text-foreground">₹{trade.exitPrice?.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right text-foreground">{trade.quantity}</td>
                          <td className={`p-3 text-right font-medium ${trade.pnl >= 0 ? 'text-[hsl(142_71%_45%)]' : 'text-destructive'}`}>
                            {trade.pnl >= 0 ? '+' : ''}{formatINR(trade.pnl)}
                          </td>
                          <td className={`p-3 text-right ${trade.pnlPct >= 0 ? 'text-[hsl(142_71%_45%)]' : 'text-destructive'}`}>
                            {trade.pnlPct >= 0 ? '+' : ''}{trade.pnlPct?.toFixed(2)}%
                          </td>
                          <td className="p-3">
                            <Badge variant={trade.exitReason?.includes("Stop") ? "destructive" : trade.exitReason?.includes("profit") ? "default" : "secondary"} className="text-xs">
                              {trade.exitReason}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {trades.length > 20 && (
                    <div className="p-3 text-center text-sm text-muted-foreground border-t border-border">
                      Showing 20 of {trades.length} trades
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {/* Engine Info */}
              {metadata && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="text-foreground font-medium">Engine Configuration</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Engine Version</p>
                      <p className="text-foreground font-mono">{metadata.engineVersion}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Config Hash</p>
                      <p className="text-foreground font-mono">{metadata.configHash}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Strategy ID</p>
                      <p className="text-foreground font-mono">{metadata.strategyId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Liquidation Policy</p>
                      <p className="text-foreground">{metadata.finalLiquidationPolicy}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Rejected Signals */}
              {rejectedSignals.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Ban className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-foreground font-medium">Rejected Signals ({rejectedSignals.length})</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    These signals were blocked by the risk engine due to validation failures.
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(rejectedSignals as Array<{ timestamp: string; rejectionReason: string }>).slice(0, 10).map((signal, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg text-sm">
                        <span className="text-muted-foreground">{signal.timestamp?.split("T")[0]}</span>
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                          {signal.rejectionReason}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Risk Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-sm mb-1">Engine Guarantees</p>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>• No lookahead bias - signals use only past data</li>
                      <li>• Next-bar execution - orders execute at following bar open</li>
                      <li>• Realistic fills - includes slippage (0.1%) and brokerage (0.03%)</li>
                      <li>• Risk validation - position sizing respects 2% max risk per trade</li>
                      <li>• Deterministic results - identical inputs produce identical outputs</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        )}

        {/* Action Button */}
        {results && (
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
            <p className="text-muted-foreground max-w-sm mb-4">
              Run a production-grade backtest with realistic execution, slippage, and risk management.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs text-muted-foreground">
              <Badge variant="outline">Next-bar execution</Badge>
              <Badge variant="outline">0.1% slippage</Badge>
              <Badge variant="outline">Stop-loss priority</Badge>
              <Badge variant="outline">Risk validation</Badge>
            </div>
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
