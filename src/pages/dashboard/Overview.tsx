import { motion } from "framer-motion";
import { Plus, FolderOpen, GraduationCap, Lock, ArrowRight, TrendingUp, Target, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

const Overview = () => {
  const { user } = useAuth();

  const primaryCard = {
    title: "Create Strategy",
    description: "Build a new trading strategy with AI assistance or manual rules",
    icon: Plus,
    href: "/dashboard/strategies/create",
    primary: true,
  };

  const secondaryCards = [
    {
      title: "My Strategies",
      description: "View and manage your existing strategies",
      icon: FolderOpen,
      href: "/dashboard/strategies",
      count: 0,
    },
    {
      title: "Learn & Understand",
      description: "Educational resources to improve your trading knowledge",
      icon: GraduationCap,
      href: "/dashboard/learn",
    },
    {
      title: "Advanced Markets (F&O)",
      description: "Futures and options trading simulation",
      icon: Lock,
      href: "/dashboard/fno",
      locked: true,
    },
  ];

  const stats = [
    { label: "Active Strategies", value: "0", icon: Target },
    { label: "Paper Trades", value: "0", icon: TrendingUp },
    { label: "Backtests Run", value: "0", icon: BarChart3 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Start building or continue working on your trading strategies.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-card/50 border border-border rounded-xl p-5"
            >
              <stat.icon className="w-5 h-5 text-muted-foreground mb-3" />
              <p className="text-2xl font-medium text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Primary Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Link
            to={primaryCard.href}
            className="group block bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                  <primaryCard.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-foreground mb-2">
                    {primaryCard.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {primaryCard.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </motion.div>

        {/* Secondary Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {secondaryCards.map((card) => (
            <Link
              key={card.title}
              to={card.href}
              className={`group block bg-card/50 border border-border rounded-xl p-6 transition-all ${
                card.locked
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-card hover:border-white/20"
              }`}
              onClick={(e) => card.locked && e.preventDefault()}
            >
              <div className="flex items-center justify-between mb-4">
                <card.icon className={`w-6 h-6 ${card.locked ? "text-muted-foreground" : "text-foreground"}`} />
                {card.locked && (
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    Locked
                  </span>
                )}
                {card.count !== undefined && (
                  <span className="text-sm text-muted-foreground">{card.count}</span>
                )}
              </div>
              <h3 className="text-foreground font-medium mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </Link>
          ))}
        </motion.div>

        {/* Getting Started Hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 bg-card/30 border border-border rounded-xl p-6"
        >
          <h3 className="text-foreground font-medium mb-2">Getting Started</h3>
          <p className="text-muted-foreground text-sm mb-4">
            New here? Follow these steps to build your first strategy:
          </p>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-foreground">1</span>
              Create a strategy using AI or manual builder
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-foreground">2</span>
              Backtest your strategy with historical data
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-foreground">3</span>
              Practice with paper trading (no real money)
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-foreground">4</span>
              Learn and refine based on results
            </li>
          </ol>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
