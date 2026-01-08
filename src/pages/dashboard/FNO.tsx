import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, AlertTriangle, ArrowLeft, CheckCircle, BookOpen, TrendingUp, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const FNO = () => {
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  const unlockRequirements = [
    { label: "Complete 20+ paper trades", completed: false, progress: "12/20" },
    { label: "Achieve 50%+ win rate in paper trading", completed: true, progress: "58%" },
    { label: "Complete F&O basics course", completed: false, progress: "3/8 lessons" },
    { label: "Acknowledge risk disclosure", completed: riskAcknowledged, progress: riskAcknowledged ? "Done" : "Pending" },
  ];

  const completedCount = unlockRequirements.filter(r => r.completed).length;
  const progressPercent = (completedCount / unlockRequirements.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/dashboard/overview"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <Lock className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">
                Advanced Markets
              </h1>
              <p className="text-muted-foreground">Futures & Options Trading Simulation</p>
            </div>
          </div>
        </motion.div>

        {/* Locked State Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative overflow-hidden bg-gradient-to-br from-card to-secondary/30 border border-border rounded-3xl p-8 md:p-10 text-center"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-medium text-foreground mb-3">
              F&O Trading is Currently Locked
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Complete the requirements below to unlock futures and options simulation. 
              This is for your protection – derivatives carry significant risk.
            </p>
            
            {/* Progress bar */}
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium">{completedCount}/{unlockRequirements.length}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Educational Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-foreground/70" />
            </div>
            <h3 className="text-foreground font-medium">What are Futures & Options?</h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground pl-[52px]">
            <p>
              <strong className="text-foreground">Futures</strong> are contracts to buy or sell an asset at a 
              predetermined price at a specific future date.
            </p>
            <p>
              <strong className="text-foreground">Options</strong> give you the right (but not obligation) to buy 
              (call) or sell (put) an asset at a set price before a certain date.
            </p>
            <p className="text-muted-foreground/80">
              Both instruments involve leverage and can result in losses exceeding your initial investment.
            </p>
          </div>
        </motion.div>

        {/* Unlock Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-foreground/70" />
              </div>
              <h3 className="text-foreground font-medium">Unlock Requirements</h3>
            </div>
            <span className="text-sm text-muted-foreground px-3 py-1 bg-secondary rounded-full">
              {completedCount}/{unlockRequirements.length} completed
            </span>
          </div>
          <div className="space-y-3">
            {unlockRequirements.map((req, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                  req.completed ? "bg-green-500/5 border border-green-500/20" : "bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {req.completed ? (
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className={req.completed ? "text-foreground" : "text-muted-foreground"}>
                    {req.label}
                  </span>
                </div>
                <span className={`text-sm font-medium ${req.completed ? "text-green-500" : "text-muted-foreground"}`}>
                  {req.progress}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risk Disclosure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-red-400 font-medium">Risk Disclosure</h3>
          </div>
          <div className="space-y-3 text-sm text-red-400/80 pl-[52px]">
            <p>
              <strong className="text-red-400">Derivatives trading carries substantial risk of loss.</strong> 
              {" "}You could lose more than your initial investment.
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-400/70">
              <li>Futures and options are leveraged products</li>
              <li>Options can expire worthless, losing 100% of premium paid</li>
              <li>Futures positions can incur unlimited losses</li>
              <li>Time decay (theta) works against option buyers</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 mt-6 cursor-pointer pl-[52px]">
            <input
              type="checkbox"
              checked={riskAcknowledged}
              onChange={(e) => setRiskAcknowledged(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-red-500/30 bg-transparent text-red-500 focus:ring-red-500/50"
            />
            <span className="text-sm text-red-400">
              I understand the risks and have read the disclosure above.
            </span>
          </label>
        </motion.div>

        {/* What You'll Get */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-foreground/70" />
            </div>
            <h3 className="text-foreground font-medium">When Unlocked, You'll Access:</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Options Simulator", desc: "Trade calls, puts, and spreads with virtual money" },
              { title: "Payoff Diagrams", desc: "Visualize profit/loss scenarios before entering" },
              { title: "Greeks Calculator", desc: "Understand Delta, Gamma, Theta, and Vega" },
              { title: "Strategy Templates", desc: "Iron condors, straddles, covered calls, and more" },
            ].map((item) => (
              <div key={item.title} className="p-4 bg-secondary/50 rounded-xl">
                <h4 className="text-foreground font-medium mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <Link
            to="/dashboard/overview"
            className="group w-full flex items-center justify-center gap-3 bg-secondary text-foreground px-8 py-4 rounded-2xl text-base font-medium hover:bg-secondary/80 transition-all"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default FNO;
