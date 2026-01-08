import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, AlertTriangle, ArrowLeft, CheckCircle, BookOpen, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const FNO = () => {
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  const unlockRequirements = [
    {
      label: "Complete 20+ paper trades",
      completed: false,
      progress: "12/20",
    },
    {
      label: "Achieve 50%+ win rate in paper trading",
      completed: true,
      progress: "58%",
    },
    {
      label: "Complete F&O basics course",
      completed: false,
      progress: "3/8 lessons",
    },
    {
      label: "Acknowledge risk disclosure",
      completed: riskAcknowledged,
      progress: riskAcknowledged ? "Done" : "Pending",
    },
  ];

  const completedCount = unlockRequirements.filter(r => r.completed).length;

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
            <Lock className="w-8 h-8 text-muted-foreground" />
            <h1 className="font-display text-3xl font-light text-foreground">
              Advanced Markets (F&O)
            </h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Futures & Options trading simulation • Currently locked
          </p>

          {/* Locked State Card */}
          <div className="bg-card/50 border border-border rounded-xl p-8 mb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">
              F&O Trading is Locked
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Complete the requirements below to unlock futures and options simulation. 
              This is for your protection – derivatives carry significant risk.
            </p>
          </div>

          {/* Educational Intro */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
            <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              What are Futures & Options?
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Futures</strong> are contracts to buy or sell an asset at a 
                predetermined price at a specific future date. They're commonly used for hedging and speculation.
              </p>
              <p>
                <strong className="text-foreground">Options</strong> give you the right (but not obligation) to buy 
                (call) or sell (put) an asset at a set price before a certain date. They can be used for 
                income, hedging, or leveraged bets.
              </p>
              <p>
                Both instruments involve leverage and can result in losses exceeding your initial investment.
              </p>
            </div>
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
              <AlertTriangle className="w-5 h-5" />
              Risk Disclosure
            </h3>
            <div className="space-y-3 text-sm text-red-500/80">
              <p>
                <strong className="text-red-500">Derivatives trading carries substantial risk of loss.</strong> 
                You could lose more than your initial investment.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Futures and options are leveraged products</li>
                <li>Options can expire worthless, losing 100% of premium paid</li>
                <li>Futures positions can incur unlimited losses</li>
                <li>Time decay (theta) works against option buyers</li>
                <li>Volatility changes can drastically affect option prices</li>
              </ul>
              <p>
                Even in simulation mode, we require you to understand these risks before proceeding.
              </p>
            </div>

            {/* Risk Acknowledgment Checkbox */}
            <label className="flex items-start gap-3 mt-6 cursor-pointer">
              <input
                type="checkbox"
                checked={riskAcknowledged}
                onChange={(e) => setRiskAcknowledged(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-red-500/50 bg-transparent text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-red-500">
                I understand the risks associated with futures and options trading. I acknowledge that 
                derivatives can result in significant losses and I have read the risk disclosure above.
              </span>
            </label>
          </div>

          {/* What You'll Get */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-8">
            <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              When Unlocked, You'll Access:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="text-foreground font-medium mb-1">Options Simulator</h4>
                <p className="text-sm text-muted-foreground">
                  Trade calls, puts, and spreads with virtual money
                </p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="text-foreground font-medium mb-1">Payoff Diagrams</h4>
                <p className="text-sm text-muted-foreground">
                  Visualize profit/loss scenarios before entering trades
                </p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="text-foreground font-medium mb-1">Greeks Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  Understand Delta, Gamma, Theta, and Vega
                </p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="text-foreground font-medium mb-1">Strategy Templates</h4>
                <p className="text-sm text-muted-foreground">
                  Iron condors, straddles, covered calls, and more
                </p>
              </div>
            </div>
          </div>

          {/* Back to Dashboard Button */}
          <Link
            to="/dashboard/overview"
            className="group w-full flex items-center justify-center gap-3 bg-secondary text-foreground px-8 py-4 rounded-full text-base font-medium hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default FNO;
