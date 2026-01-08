import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowRight, Lock, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  useEffect(() => {
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
            initial_balance: 100000,
            current_balance: 100000,
            currency: "USD",
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
          .limit(10);

        setTrades((tradesData as PaperTrade[]) || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const totalPnL = account ? account.current_balance - account.initial_balance : 0;
  const totalPnLPercent = account ? ((totalPnL / account.initial_balance) * 100).toFixed(2) : "0.00";

  const sampleTrades: PaperTrade[] = [
    { id: "1", symbol: "AAPL", side: "buy", quantity: 10, entry_price: 175.50, exit_price: 182.30, status: "closed", pnl: 68.00, opened_at: "2024-01-15T10:30:00Z", closed_at: "2024-01-18T14:45:00Z" },
    { id: "2", symbol: "MSFT", side: "buy", quantity: 5, entry_price: 378.20, exit_price: null, status: "open", pnl: null, opened_at: "2024-01-20T09:15:00Z", closed_at: null },
    { id: "3", symbol: "GOOGL", side: "sell", quantity: 8, entry_price: 142.80, exit_price: 138.50, status: "closed", pnl: 34.40, opened_at: "2024-01-12T11:00:00Z", closed_at: "2024-01-14T16:30:00Z" },
  ];

  const displayTrades = trades.length > 0 ? trades : sampleTrades;

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
              ${account?.current_balance.toLocaleString() || "100,000"}
            </p>
            <p className="text-sm text-muted-foreground">
              Started with ${account?.initial_balance.toLocaleString() || "100,000"}
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
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString()}
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
              {displayTrades.filter(t => t.status === "open").length}
            </p>
            <p className="text-sm text-muted-foreground">
              {displayTrades.filter(t => t.status === "closed").length} closed
            </p>
          </div>
        </motion.div>

        {/* Trade Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-foreground font-medium">Trade Log</h3>
          </div>
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
                {displayTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{trade.symbol}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${trade.side === "buy" ? "text-green-500" : "text-red-500"}`}>
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{trade.quantity}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">${trade.entry_price}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {trade.exit_price ? `$${trade.exit_price}` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {trade.pnl !== null ? (
                        <span className={`text-sm font-medium ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
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
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <button className="group flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-base font-medium hover:bg-primary/90 transition-all">
            Continue Practicing
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <Link
            to="/dashboard/fno"
            className="group flex items-center justify-center gap-3 bg-secondary text-foreground px-8 py-4 rounded-2xl text-base font-medium hover:bg-secondary/80 transition-all"
          >
            <Lock className="w-4 h-4" />
            View Advanced Markets (F&O)
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PaperTrading;
