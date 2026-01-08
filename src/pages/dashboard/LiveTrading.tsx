import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Lock, AlertTriangle, ArrowLeft, CheckCircle, 
  Zap, Shield, Link2, TrendingUp, StopCircle,
  AlertOctagon, Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

const LiveTrading = () => {
  const { user } = useAuth();
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  // Fetch user's paper trades count
  const { data: paperTradesCount } = useQuery({
    queryKey: ["paper-trades-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      // Get paper accounts first
      const { data: accounts } = await supabase
        .from("paper_accounts")
        .select("id")
        .eq("user_id", user.id);
      
      if (!accounts || accounts.length === 0) return 0;
      
      const accountIds = accounts.map(a => a.id);
      
      const { count } = await supabase
        .from("paper_trades")
        .select("*", { count: "exact", head: true })
        .in("account_id", accountIds)
        .eq("status", "closed");
      
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch broker connections
  const { data: brokerConnections } = useQuery({
    queryKey: ["broker-connections", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("broker_connections")
        .select("*")
        .eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const unlockRequirements = [
    {
      label: "Complete 30+ paper trades",
      completed: (paperTradesCount || 0) >= 30,
      progress: `${paperTradesCount || 0}/30`,
    },
    {
      label: "Pro subscription active",
      completed: false, // Would check subscription status
      progress: "Not subscribed",
    },
    {
      label: "Connect a broker",
      completed: (brokerConnections?.length || 0) > 0,
      progress: brokerConnections?.length ? `${brokerConnections.length} connected` : "None",
    },
    {
      label: "Acknowledge trading risks",
      completed: riskAcknowledged,
      progress: riskAcknowledged ? "Done" : "Pending",
    },
  ];

  const completedCount = unlockRequirements.filter(r => r.completed).length;
  const isUnlocked = completedCount === unlockRequirements.length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Link */}
          <Link
            to="/dashboard/overview"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            <h1 className="font-display text-3xl font-light text-foreground">
              Live Trading
            </h1>
            {!isUnlocked && (
              <Lock className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <p className="text-muted-foreground mb-8">
            Execute real trades through connected brokers • {isUnlocked ? "Unlocked" : "Currently locked"}
          </p>

          {!isUnlocked ? (
            <>
              {/* Locked State Card */}
              <div className="bg-card/50 border border-border rounded-xl p-8 mb-6 text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-xl font-medium text-foreground mb-2">
                  Live Trading is Locked
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Complete the requirements below to unlock live trading. 
                  This multi-step process protects you from trading before you're ready.
                </p>
              </div>

              {/* Unlock Requirements */}
              <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-foreground font-medium flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Unlock Requirements
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {completedCount}/{unlockRequirements.length} completed
                  </span>
                </div>
                <div className="space-y-3">
                  {unlockRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        req.completed ? "bg-green-500/10" : "bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {req.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                        )}
                        <span className={req.completed ? "text-foreground" : "text-muted-foreground"}>
                          {req.label}
                        </span>
                      </div>
                      <span className={`text-sm ${req.completed ? "text-green-500" : "text-muted-foreground"}`}>
                        {req.progress}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Disclosure */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
                <h3 className="text-red-500 font-medium mb-4 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5" />
                  Risk Disclosure - CRITICAL
                </h3>
                <div className="space-y-3 text-sm text-red-500/80">
                  <p>
                    <strong className="text-red-500">Live trading involves real money and substantial risk of loss.</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You could lose your entire investment</li>
                    <li>Past performance does not guarantee future results</li>
                    <li>Algorithmic strategies can fail in unexpected market conditions</li>
                    <li>Technical failures may prevent order execution or cause unintended trades</li>
                    <li>You are solely responsible for your trading decisions</li>
                  </ul>
                </div>

                {/* Risk Acknowledgment */}
                <label className="flex items-start gap-3 mt-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={riskAcknowledged}
                    onChange={(e) => setRiskAcknowledged(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-red-500/50 bg-transparent text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-red-500">
                    I understand and accept all risks associated with live trading. I acknowledge that I am solely 
                    responsible for my trading decisions and any resulting losses. I have sufficient financial 
                    resources to withstand potential losses.
                  </span>
                </label>
              </div>

              {/* Supported Brokers */}
              <div className="bg-card/50 border border-border rounded-xl p-6 mb-8">
                <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  Supported Brokers
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {["Zerodha", "Upstox", "Interactive Brokers"].map((broker) => (
                    <div key={broker} className="p-4 bg-secondary rounded-lg text-center">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg font-bold text-foreground">{broker[0]}</span>
                      </div>
                      <p className="text-foreground font-medium">{broker}</p>
                      <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Unlocked State - Trading Interface */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h3 className="text-green-500 font-medium">Live Trading Unlocked</h3>
                    <p className="text-green-500/80 text-sm">
                      You have access to live trading. Trade responsibly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Kill Switch */}
              <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StopCircle className="w-6 h-6 text-red-500" />
                    <div>
                      <h3 className="text-foreground font-medium">Emergency Stop</h3>
                      <p className="text-muted-foreground text-sm">
                        Immediately halt all automated trading
                      </p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors">
                    STOP ALL TRADING
                  </button>
                </div>
              </div>

              {/* Active Strategies */}
              <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
                <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Active Trading Strategies
                </h3>
                <div className="text-center py-8 text-muted-foreground">
                  <p>No strategies are currently running in live mode.</p>
                  <Link
                    to="/dashboard/strategies"
                    className="text-foreground underline mt-2 inline-block"
                  >
                    Configure a strategy for live trading
                  </Link>
                </div>
              </div>

              {/* Safety Features */}
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Safety Features
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="text-foreground font-medium mb-1">Daily Loss Limit</h4>
                    <p className="text-sm text-muted-foreground">
                      Auto-stop trading after reaching daily loss threshold
                    </p>
                    <p className="text-lg font-medium text-foreground mt-2">₹10,000</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="text-foreground font-medium mb-1">Max Position Size</h4>
                    <p className="text-sm text-muted-foreground">
                      Maximum capital allocated per trade
                    </p>
                    <p className="text-lg font-medium text-foreground mt-2">₹50,000</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="text-foreground font-medium mb-1">Trading Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Only trade during market hours
                    </p>
                    <p className="text-lg font-medium text-foreground mt-2">9:15 AM - 3:30 PM</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="text-foreground font-medium mb-1">Order Confirmation</h4>
                    <p className="text-sm text-muted-foreground">
                      Require confirmation for large orders
                    </p>
                    <p className="text-lg font-medium text-foreground mt-2">Enabled</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Back to Dashboard */}
          <Link
            to="/dashboard/overview"
            className="group w-full flex items-center justify-center gap-3 bg-secondary text-foreground px-8 py-4 rounded-full text-base font-medium hover:bg-secondary/80 transition-colors mt-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default LiveTrading;
