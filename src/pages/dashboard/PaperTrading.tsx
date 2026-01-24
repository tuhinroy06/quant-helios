import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowRight, Activity, RefreshCw, X, Calculator, Brain, Sparkles, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { INDIAN_STOCKS, formatINRSimple } from "@/lib/indian-stocks";
import { useLivePrices } from "@/hooks/useLivePrices";
import { useTransactionCosts } from "@/hooks/useTransactionCosts";
import { useTradeExplanation, TradeData } from "@/hooks/useTradeExplanation";
import { TradeExplanationCard } from "@/components/trading/TradeExplanationCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// New components
import { MarketTicker } from "@/components/paper-trading/MarketTicker";
import { Watchlist } from "@/components/paper-trading/Watchlist";
import { PriceChart } from "@/components/paper-trading/PriceChart";
import { QuickTradePanel } from "@/components/paper-trading/QuickTradePanel";
import { SafetyModeStatus } from "@/components/trading/SafetyModeStatus";

interface PaperAccount {
  id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  currency: string;
}

interface PaperPosition {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number | null;
  status: string;
  opened_at: string;
}

interface PaperTrade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  status: string;
  pnl: number | null;
  opened_at: string;
  closed_at: string | null;
}

interface ClosedTradeResult {
  tradeId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  grossPnl: number;
  netPnl: number;
  fees: number;
  holdingMinutes: number;
  openedAt: string;
  closedAt: string;
}

const PaperTrading = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  
  // AI Explanation state
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [closedTradeResult, setClosedTradeResult] = useState<ClosedTradeResult | null>(null);
  const { explainTradeExit, isLoading: isExplaining, explanation } = useTradeExplanation();

  // Transaction costs hook
  const { calculateCosts } = useTransactionCosts();

  const fetchData = async () => {
    if (!user) return;

    // Fetch or create account
    let { data: accountData, error: accountError } = await supabase
      .from("paper_accounts")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (accountError && accountError.code === "PGRST116") {
      const { data: newAccount, error: createError } = await supabase
        .from("paper_accounts")
        .insert({
          user_id: user.id,
          name: "Default Account",
          initial_balance: 1000000,
          current_balance: 1000000,
          currency: "INR",
        })
        .select()
        .single();

      if (createError) {
        toast.error("Failed to create paper account");
        return;
      }
      accountData = newAccount;
    }

    setAccount(accountData);

    if (accountData) {
      // Fetch open positions
      const { data: positionsData } = await supabase
        .from("paper_positions")
        .select("*")
        .eq("account_id", accountData.id)
        .eq("status", "open")
        .order("opened_at", { ascending: false });

      setPositions((positionsData as PaperPosition[]) || []);

      // Fetch closed trades
      const { data: tradesData } = await supabase
        .from("paper_trades")
        .select("*")
        .eq("account_id", accountData.id)
        .order("opened_at", { ascending: false })
        .limit(20);

      setTrades((tradesData as PaperTrade[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Live prices for open positions
  const openSymbols = useMemo(() => positions.map((p) => p.symbol), [positions]);
  const { prices: livePrices, lastUpdated, refresh: refreshPrices, loading: pricesLoading } = useLivePrices({
    symbols: openSymbols,
    refreshInterval: 5000,
    enabled: openSymbols.length > 0,
  });

  // Calculate unrealized P&L
  const calculateUnrealizedPnL = (position: PaperPosition) => {
    const livePrice = livePrices[position.symbol];
    const currentPrice = livePrice?.price || INDIAN_STOCKS.find((s) => s.symbol === position.symbol)?.price || position.entry_price;

    if (position.side === "buy") {
      return (currentPrice - position.entry_price) * position.quantity;
    } else {
      return (position.entry_price - currentPrice) * position.quantity;
    }
  };

  const totalUnrealizedPnL = positions.reduce((sum, p) => sum + calculateUnrealizedPnL(p), 0);
  const realizedPnL = account ? account.current_balance - account.initial_balance : 0;
  const totalPnL = realizedPnL + totalUnrealizedPnL;
  const totalPnLPercent = account ? ((totalPnL / account.initial_balance) * 100).toFixed(2) : "0.00";

  const closePosition = async (position: PaperPosition) => {
    if (!account) return;

    const livePrice = livePrices[position.symbol];
    const exitPrice = livePrice?.price || INDIAN_STOCKS.find((s) => s.symbol === position.symbol)?.price || position.entry_price;
    const closedAt = new Date().toISOString();
    const openedAt = position.opened_at;
    const holdingMinutes = Math.round((new Date(closedAt).getTime() - new Date(openedAt).getTime()) / 60000);

    // Calculate transaction costs on exit
    const exitCosts = await calculateCosts(position.quantity, exitPrice, "sell");
    const transactionCosts = exitCosts?.total_charges || 0;

    let grossPnl: number;
    if (position.side === "buy") {
      grossPnl = (exitPrice - position.entry_price) * position.quantity;
    } else {
      grossPnl = (position.entry_price - exitPrice) * position.quantity;
    }

    // Net P&L after deducting exit costs
    const netPnl = grossPnl - transactionCosts;

    try {
      // Insert into paper_trades with fee tracking
      const { data: tradeData, error: tradeError } = await supabase.from("paper_trades").insert({
        account_id: account.id,
        symbol: position.symbol,
        side: position.side,
        quantity: position.quantity,
        entry_price: position.entry_price,
        exit_price: exitPrice,
        status: "closed",
        pnl: netPnl,
        fees: transactionCosts,
        stop_loss: position.stop_loss,
        take_profit: position.take_profit,
        closed_at: closedAt,
        reason: "MANUAL_EXIT",
      }).select().single();

      if (tradeError) throw tradeError;

      // Update account balance (add back position value minus costs)
      const tradeValue = position.side === "buy" ? exitPrice * position.quantity : 0;
      const newBalance = account.current_balance + tradeValue - transactionCosts + (position.side === "sell" ? grossPnl : 0);
      
      const { error: balanceError } = await supabase
        .from("paper_accounts")
        .update({ current_balance: newBalance })
        .eq("id", account.id);

      if (balanceError) throw balanceError;

      // Delete position
      const { error: deleteError } = await supabase
        .from("paper_positions")
        .delete()
        .eq("id", position.id);

      if (deleteError) throw deleteError;

      // Store closed trade result for AI explanation
      const result: ClosedTradeResult = {
        tradeId: tradeData.id,
        symbol: position.symbol,
        side: position.side,
        quantity: position.quantity,
        entryPrice: position.entry_price,
        exitPrice,
        grossPnl,
        netPnl,
        fees: transactionCosts,
        holdingMinutes,
        openedAt,
        closedAt,
      };
      
      setClosedTradeResult(result);
      setShowExplanationDialog(true);

      toast.success(
        <div className="space-y-1">
          <p>Position closed: {netPnl >= 0 ? "+" : ""}{formatINRSimple(netPnl)}</p>
          <p className="text-xs text-muted-foreground">
            Gross: {formatINRSimple(grossPnl)} • Fees: {formatINRSimple(transactionCosts)}
          </p>
        </div>
      );
      fetchData();
    } catch (error) {
      console.error("Close position error:", error);
      toast.error("Failed to close position");
    }
  };

  // Generate AI explanation for closed trade
  const generateExplanation = async () => {
    if (!closedTradeResult) return;

    const tradeData: TradeData = {
      tradeId: closedTradeResult.tradeId,
      strategyId: 'manual',
      strategyName: 'Manual Paper Trade',
      assetClass: 'EQUITY',
      timeframe: '5m',
      symbol: closedTradeResult.symbol,
      direction: closedTradeResult.side === 'buy' ? 'LONG' : 'SHORT',
      entryPrice: closedTradeResult.entryPrice,
      exitPrice: closedTradeResult.exitPrice,
      quantity: closedTradeResult.quantity,
      entryTimestamp: closedTradeResult.openedAt,
      exitTimestamp: closedTradeResult.closedAt,
      exitReason: 'MANUAL_EXIT',
      holdingMinutes: closedTradeResult.holdingMinutes,
      riskPercent: 1.0
    };

    await explainTradeExit(tradeData);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="h-8 bg-secondary rounded-xl w-1/3 shimmer" />
          <div className="h-12 bg-secondary rounded-xl shimmer" />
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="h-64 bg-secondary rounded-2xl shimmer lg:col-span-2" />
            <div className="h-64 bg-secondary rounded-2xl shimmer" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-light text-foreground mb-1">
              Paper Trading
            </h1>
            <p className="text-muted-foreground text-sm">
              Practice with virtual ₹10L • Learn risk management
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <span className="w-2 h-2 bg-primary rounded-full pulse-dot" />
            <span className="text-primary text-xs font-medium">PAPER</span>
          </div>
        </motion.div>

        {/* Market Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <MarketTicker onSymbolClick={setSelectedSymbol} selectedSymbol={selectedSymbol} />
        </motion.div>

        {/* Main Grid: Chart + Trading Panel */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left: Chart (2/3 width) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <PriceChart symbol={selectedSymbol} />
          </motion.div>

          {/* Right: Trade Panel + Watchlist (1/3 width) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-4"
          >
            {/* Quick Trade Panel */}
            {account && (
              <QuickTradePanel
                symbol={selectedSymbol}
                accountId={account.id}
                currentBalance={account.current_balance}
                onTradeComplete={fetchData}
              />
            )}

            {/* Watchlist */}
            <Watchlist onSymbolSelect={setSelectedSymbol} selectedSymbol={selectedSymbol} />

            {/* Safety Mode Status */}
            {account && (
              <SafetyModeStatus accountId={account.id} compact />
            )}
          </motion.div>
        </div>

        {/* Account Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">Virtual Balance</span>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {formatINRSimple(account?.current_balance || 1000000)}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {totalPnL >= 0 ? (
                <TrendingUp className="w-4 h-4 text-primary" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className="text-muted-foreground text-xs">Total P&L</span>
            </div>
            <p className={`text-xl font-semibold ${totalPnL >= 0 ? "text-primary" : "text-destructive"}`}>
              {totalPnL >= 0 ? "+" : ""}{formatINRSimple(totalPnL)}
              <span className="text-sm ml-1">({totalPnLPercent}%)</span>
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">Open Positions</span>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {positions.length}
            </p>
          </div>
        </motion.div>

        {/* Open Positions */}
        {positions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground text-sm">Open Positions</h3>
              </div>
              <div className="flex items-center gap-2">
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                <button
                  onClick={refreshPrices}
                  disabled={pricesLoading}
                  className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 text-muted-foreground ${pricesLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-border">
              {positions.map((position) => {
                const livePrice = livePrices[position.symbol];
                const currentPrice = livePrice?.price || INDIAN_STOCKS.find((s) => s.symbol === position.symbol)?.price || position.entry_price;
                const unrealizedPnL = calculateUnrealizedPnL(position);
                const pnlPercent = ((unrealizedPnL / (position.entry_price * position.quantity)) * 100).toFixed(2);

                return (
                  <div key={position.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{position.symbol}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${position.side === "buy" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
                          {position.side.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {position.quantity} @ {formatINRSimple(position.entry_price)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">{formatINRSimple(currentPrice)}</p>
                      <p className="text-xs text-muted-foreground">Current</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-sm ${unrealizedPnL >= 0 ? "text-primary" : "text-destructive"}`}>
                        {unrealizedPnL >= 0 ? "+" : ""}{formatINRSimple(unrealizedPnL)}
                      </p>
                      <p className={`text-xs ${unrealizedPnL >= 0 ? "text-primary/70" : "text-destructive/70"}`}>
                        {unrealizedPnL >= 0 ? "+" : ""}{pnlPercent}%
                      </p>
                    </div>
                    <button
                      onClick={() => closePosition(position)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors group"
                      title="Close position"
                    >
                      <X className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Trade History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-foreground text-sm">Trade History</h3>
          </div>
          {trades.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No trades yet. Select a stock and place your first trade!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Symbol</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Side</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Qty</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Entry</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Exit</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium text-foreground">{trade.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={trade.side === "buy" ? "text-primary" : "text-destructive"}>
                          {trade.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{trade.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatINRSimple(trade.entry_price)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {trade.exit_price ? formatINRSimple(trade.exit_price) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {trade.pnl !== null ? (
                          <span className={trade.pnl >= 0 ? "text-primary" : "text-destructive"}>
                            {trade.pnl >= 0 ? "+" : ""}{formatINRSimple(trade.pnl)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* F&O CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap gap-3"
        >
          <Link
            to="/dashboard/fno"
            className="group flex items-center justify-center gap-3 bg-secondary text-foreground px-6 py-3 rounded-xl text-sm font-medium hover:bg-secondary/80 transition-all"
          >
            View Advanced Markets (F&O)
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/dashboard/journal"
            className="group flex items-center justify-center gap-3 bg-primary/10 border border-primary/20 text-primary px-6 py-3 rounded-xl text-sm font-medium hover:bg-primary/20 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Trade Journal
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      {/* AI Explanation Dialog */}
      <Dialog open={showExplanationDialog} onOpenChange={setShowExplanationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Trade Closed
            </DialogTitle>
            <DialogDescription>
              {closedTradeResult && (
                <span className={closedTradeResult.netPnl >= 0 ? 'text-primary' : 'text-destructive'}>
                  {closedTradeResult.netPnl >= 0 ? '+' : ''}{formatINRSimple(closedTradeResult.netPnl)} P&L
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {closedTradeResult && (
            <div className="space-y-4">
              {/* Trade Summary */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-secondary/30 rounded-xl text-sm">
                <div>
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="ml-2 font-medium text-foreground">{closedTradeResult.symbol}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Side:</span>
                  <span className={`ml-2 font-medium ${closedTradeResult.side === 'buy' ? 'text-primary' : 'text-destructive'}`}>
                    {closedTradeResult.side.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Entry:</span>
                  <span className="ml-2 text-foreground">{formatINRSimple(closedTradeResult.entryPrice)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Exit:</span>
                  <span className="ml-2 text-foreground">{formatINRSimple(closedTradeResult.exitPrice)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gross P&L:</span>
                  <span className={`ml-2 ${closedTradeResult.grossPnl >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {closedTradeResult.grossPnl >= 0 ? '+' : ''}{formatINRSimple(closedTradeResult.grossPnl)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fees:</span>
                  <span className="ml-2 text-destructive">-{formatINRSimple(closedTradeResult.fees)}</span>
                </div>
              </div>
              
              {/* AI Explanation */}
              <AnimatePresence mode="wait">
                {explanation ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <TradeExplanationCard explanation={explanation} compact />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-secondary/30 border border-border text-center"
                  >
                    <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Want to understand why this trade performed the way it did?
                    </p>
                    <Button
                      onClick={generateExplanation}
                      disabled={isExplaining}
                      className="gap-2"
                    >
                      {isExplaining ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate AI Explanation
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExplanationDialog(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="secondary"
                  asChild
                  className="flex-1 gap-2"
                >
                  <Link to="/dashboard/journal">
                    <BookOpen className="w-4 h-4" />
                    View Journal
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PaperTrading;
