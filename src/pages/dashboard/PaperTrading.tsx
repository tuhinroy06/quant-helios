import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowRight, Activity, RefreshCw, X } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { INDIAN_STOCKS, formatINRSimple } from "@/lib/indian-stocks";
import { useLivePrices } from "@/hooks/useLivePrices";

// New components
import { MarketTicker } from "@/components/paper-trading/MarketTicker";
import { Watchlist } from "@/components/paper-trading/Watchlist";
import { PriceChart } from "@/components/paper-trading/PriceChart";
import { QuickTradePanel } from "@/components/paper-trading/QuickTradePanel";

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

const PaperTrading = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");

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

    let pnl: number;
    if (position.side === "buy") {
      pnl = (exitPrice - position.entry_price) * position.quantity;
    } else {
      pnl = (position.entry_price - exitPrice) * position.quantity;
    }

    try {
      // Insert into paper_trades
      const { error: tradeError } = await supabase.from("paper_trades").insert({
        account_id: account.id,
        symbol: position.symbol,
        side: position.side,
        quantity: position.quantity,
        entry_price: position.entry_price,
        exit_price: exitPrice,
        status: "closed",
        pnl,
        stop_loss: position.stop_loss,
        take_profit: position.take_profit,
        closed_at: new Date().toISOString(),
      });

      if (tradeError) throw tradeError;

      // Update account balance
      const tradeValue = position.side === "buy" ? exitPrice * position.quantity : 0;
      const newBalance = account.current_balance + tradeValue + (position.side === "sell" ? pnl : 0);
      
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

      toast.success(`Position closed with ${pnl >= 0 ? "profit" : "loss"} of ${formatINRSimple(Math.abs(pnl))}`);
      fetchData();
    } catch (error) {
      console.error("Close position error:", error);
      toast.error("Failed to close position");
    }
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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full pulse-dot" />
            <span className="text-green-500 text-xs font-medium">PAPER</span>
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
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className="text-muted-foreground text-xs">Total P&L</span>
            </div>
            <p className={`text-xl font-semibold ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
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
                <Activity className="w-4 h-4 text-blue-500" />
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
                        <span className={`text-xs px-1.5 py-0.5 rounded ${position.side === "buy" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
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
                      <p className={`font-medium text-sm ${unrealizedPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {unrealizedPnL >= 0 ? "+" : ""}{formatINRSimple(unrealizedPnL)}
                      </p>
                      <p className={`text-xs ${unrealizedPnL >= 0 ? "text-green-500/70" : "text-red-500/70"}`}>
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
                        <span className={trade.side === "buy" ? "text-green-500" : "text-red-500"}>
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
                          <span className={trade.pnl >= 0 ? "text-green-500" : "text-red-500"}>
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
        >
          <Link
            to="/dashboard/fno"
            className="group flex items-center justify-center gap-3 bg-secondary text-foreground px-6 py-3 rounded-xl text-sm font-medium hover:bg-secondary/80 transition-all"
          >
            View Advanced Markets (F&O)
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PaperTrading;
