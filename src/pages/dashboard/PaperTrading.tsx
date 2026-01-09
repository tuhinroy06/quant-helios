import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowRight, Activity, Plus, X, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { INDIAN_STOCKS, getSimulatedPrice, formatINRSimple } from "@/lib/indian-stocks";
import { useLivePrices } from "@/hooks/useLivePrices";

interface PaperAccount {
  id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  currency: string;
}

interface PaperTrade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  status: "pending" | "open" | "closed" | "cancelled";
  pnl: number | null;
  opened_at: string;
  closed_at: string | null;
}

const PaperTrading = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTradeForm, setShowTradeForm] = useState(false);
  
  // Trade form state
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [tradeSide, setTradeSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!user) return;

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

  const placeTrade = async () => {
    if (!account || !selectedSymbol || quantity <= 0) {
      toast.error("Please fill all fields");
      return;
    }

    const stock = INDIAN_STOCKS.find(s => s.symbol === selectedSymbol);
    if (!stock) {
      toast.error("Invalid stock selected");
      return;
    }

    const entryPrice = getSimulatedPrice(stock.price);
    const tradeValue = entryPrice * quantity;

    if (tradeSide === "buy" && tradeValue > account.current_balance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert trade
      const { error: tradeError } = await supabase
        .from("paper_trades")
        .insert({
          account_id: account.id,
          symbol: selectedSymbol,
          side: tradeSide,
          quantity,
          entry_price: entryPrice,
          status: "open",
          order_type: "market",
        });

      if (tradeError) throw tradeError;

      // Update balance for buys
      if (tradeSide === "buy") {
        const newBalance = account.current_balance - tradeValue;
        const { error: balanceError } = await supabase
          .from("paper_accounts")
          .update({ current_balance: newBalance })
          .eq("id", account.id);

        if (balanceError) throw balanceError;
      }

      toast.success(`${tradeSide.toUpperCase()} order placed for ${quantity} ${selectedSymbol} at ${formatINRSimple(entryPrice)}`);
      setShowTradeForm(false);
      setSelectedSymbol("");
      setQuantity(1);
      fetchData();
    } catch (error) {
      toast.error("Failed to place trade");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeTrade = async (trade: PaperTrade) => {
    if (!account || trade.status !== "open") return;

    const stock = INDIAN_STOCKS.find(s => s.symbol === trade.symbol);
    const exitPrice = stock ? getSimulatedPrice(stock.price, 0.03) : trade.entry_price * (1 + (Math.random() * 0.06 - 0.03));
    
    let pnl = 0;
    if (trade.side === "buy") {
      pnl = (exitPrice - trade.entry_price) * trade.quantity;
    } else {
      pnl = (trade.entry_price - exitPrice) * trade.quantity;
    }

    try {
      // Update trade
      const { error: tradeError } = await supabase
        .from("paper_trades")
        .update({
          exit_price: exitPrice,
          status: "closed",
          pnl,
          closed_at: new Date().toISOString(),
        })
        .eq("id", trade.id);

      if (tradeError) throw tradeError;

      // Update balance
      const tradeValue = exitPrice * trade.quantity;
      let newBalance = account.current_balance;
      
      if (trade.side === "buy") {
        newBalance = account.current_balance + tradeValue;
      } else {
        newBalance = account.current_balance + pnl;
      }

      const { error: balanceError } = await supabase
        .from("paper_accounts")
        .update({ current_balance: newBalance })
        .eq("id", account.id);

      if (balanceError) throw balanceError;

      toast.success(`Position closed with ${pnl >= 0 ? "profit" : "loss"} of ${formatINRSimple(Math.abs(pnl))}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to close trade");
    }
  };

  const openPositions = trades.filter(t => t.status === "open");
  
  // Get symbols of open positions for live price tracking
  const openSymbols = useMemo(() => 
    openPositions.map(t => t.symbol), 
    [openPositions]
  );
  
  // Fetch live prices for open positions (refresh every 5 seconds)
  const { prices: livePrices, lastUpdated, refresh: refreshPrices, loading: pricesLoading } = useLivePrices({
    symbols: openSymbols,
    refreshInterval: 5000,
    enabled: openSymbols.length > 0,
  });

  // Calculate unrealized P&L using live prices
  const calculateUnrealizedPnL = (trade: PaperTrade) => {
    const livePrice = livePrices[trade.symbol];
    const currentPrice = livePrice?.price || INDIAN_STOCKS.find(s => s.symbol === trade.symbol)?.price || trade.entry_price;
    
    if (trade.side === "buy") {
      return (currentPrice - trade.entry_price) * trade.quantity;
    } else {
      return (trade.entry_price - currentPrice) * trade.quantity;
    }
  };

  // Calculate total unrealized P&L from open positions
  const totalUnrealizedPnL = openPositions.reduce((sum, trade) => sum + calculateUnrealizedPnL(trade), 0);
  
  const totalPnL = account ? (account.current_balance - account.initial_balance) + totalUnrealizedPnL : 0;
  const totalPnLPercent = account ? ((totalPnL / account.initial_balance) * 100).toFixed(2) : "0.00";

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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-foreground mb-2">
              Paper Trading
            </h1>
            <p className="text-muted-foreground text-lg">
              Practice trading with virtual money.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full pulse-dot" />
            <span className="text-green-500 text-sm font-medium">Paper Trading ON</span>
          </div>
        </motion.div>

        {/* Account Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Wallet className="w-5 h-5 text-foreground/70" />
              </div>
              <span className="text-muted-foreground text-sm">Virtual Balance</span>
            </div>
            <p className="text-3xl font-light text-foreground mb-1">
              {formatINRSimple(account?.current_balance || 1000000)}
            </p>
            <p className="text-sm text-muted-foreground">
              Started with {formatINRSimple(account?.initial_balance || 1000000)}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalPnL >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                {totalPnL >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
              </div>
              <span className="text-muted-foreground text-sm">Total P&L</span>
            </div>
            <p className={`text-3xl font-light ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalPnL >= 0 ? "+" : ""}{formatINRSimple(totalPnL)}
            </p>
            <p className={`text-sm ${totalPnL >= 0 ? "text-green-500/70" : "text-red-500/70"}`}>
              {totalPnL >= 0 ? "+" : ""}{totalPnLPercent}%
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Activity className="w-5 h-5 text-foreground/70" />
              </div>
              <span className="text-muted-foreground text-sm">Open Positions</span>
            </div>
            <p className="text-3xl font-light text-foreground mb-1">
              {openPositions.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {trades.filter(t => t.status === "closed").length} closed
            </p>
          </div>
        </motion.div>

        {/* Trade Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <button
            onClick={() => setShowTradeForm(!showTradeForm)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-medium hover:bg-primary/90 transition-colors"
          >
            {showTradeForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showTradeForm ? "Cancel" : "Place New Trade"}
          </button>
        </motion.div>

        {/* Trade Form */}
        {showTradeForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h3 className="text-foreground font-medium mb-4">New Trade</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Stock Symbol</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground"
                >
                  <option value="">Select a stock</option>
                  {INDIAN_STOCKS.map((stock) => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.symbol} - {stock.name} (≈{formatINRSimple(stock.price)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2">Side</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTradeSide("buy")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    tradeSide === "buy" ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setTradeSide("sell")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    tradeSide === "sell" ? "bg-red-500 text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>
            {selectedSymbol && (
              <div className="p-4 bg-secondary/50 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  Estimated Value: <span className="text-foreground font-medium">
                    {formatINRSimple((INDIAN_STOCKS.find(s => s.symbol === selectedSymbol)?.price || 0) * quantity)}
                  </span>
                </p>
              </div>
            )}
            <button
              onClick={placeTrade}
              disabled={isSubmitting || !selectedSymbol}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Placing..." : `Place ${tradeSide.toUpperCase()} Order`}
            </button>
          </motion.div>
        )}

        {/* Open Positions */}
        {openPositions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-500" />
                <h3 className="text-foreground font-medium">Open Positions</h3>
              </div>
              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                <button
                  onClick={refreshPrices}
                  disabled={pricesLoading}
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  title="Refresh prices"
                >
                  <RefreshCw className={`w-4 h-4 text-muted-foreground ${pricesLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-border">
              {openPositions.map((trade) => {
                const livePrice = livePrices[trade.symbol];
                const currentPrice = livePrice?.price || INDIAN_STOCKS.find(s => s.symbol === trade.symbol)?.price || trade.entry_price;
                const priceChange = livePrice?.changePercent || 0;
                const unrealizedPnL = calculateUnrealizedPnL(trade);

                return (
                  <div key={trade.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{trade.symbol}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${trade.side === "buy" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                          {trade.side.toUpperCase()}
                        </span>
                        {livePrice && (
                          <span className="text-xs text-muted-foreground">
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {trade.quantity} @ {formatINRSimple(trade.entry_price)}
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-sm text-foreground font-medium">
                        {formatINRSimple(currentPrice)}
                      </p>
                      <p className={`text-xs ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-right flex-1">
                      <p className={`font-medium ${unrealizedPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {unrealizedPnL >= 0 ? "+" : ""}{formatINRSimple(unrealizedPnL)}
                      </p>
                      <button
                        onClick={() => closeTrade(trade)}
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        Close Position
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Trade Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-foreground font-medium">Trade Log</h3>
          </div>
          {trades.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No trades yet. Place your first trade above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left text-xs text-muted-foreground font-medium px-6 py-4 uppercase tracking-wider">Symbol</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-6 py-4 uppercase tracking-wider">Side</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-6 py-4 uppercase tracking-wider">Qty</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-6 py-4 uppercase tracking-wider">Entry</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-6 py-4 uppercase tracking-wider">Exit</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-6 py-4 uppercase tracking-wider">P&L</th>
                    <th className="text-left text-xs text-muted-foreground font-medium px-6 py-4 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{trade.symbol}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${trade.side === "buy" ? "text-green-500" : "text-red-500"}`}>
                          {trade.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{trade.quantity}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatINRSimple(trade.entry_price)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {trade.exit_price ? formatINRSimple(trade.exit_price) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {trade.pnl !== null ? (
                          <span className={`text-sm font-medium ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {trade.pnl >= 0 ? "+" : ""}{formatINRSimple(trade.pnl)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          trade.status === "open"
                            ? "bg-blue-500/10 text-blue-500"
                            : trade.status === "closed"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/dashboard/fno"
            className="group flex items-center justify-center gap-3 bg-secondary text-foreground px-8 py-4 rounded-2xl text-base font-medium hover:bg-secondary/80 transition-all"
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
