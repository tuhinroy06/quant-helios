import { motion } from "framer-motion";
import { Plus, FolderOpen, GraduationCap, BarChart3, ArrowRight, TrendingUp, Target, Activity, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { StatCard } from "@/components/ui/stat-card";
import { PerformanceChart } from "@/components/charts";

const Overview = () => {
  const { user } = useAuth();

  // Fetch strategies count
  const { data: strategiesCount = 0 } = useQuery({
    queryKey: ["strategies-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from("strategies")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch backtests count
  const { data: backtestsCount = 0 } = useQuery({
    queryKey: ["backtests-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from("backtest_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch paper trades count
  const { data: paperTradesCount = 0 } = useQuery({
    queryKey: ["paper-trades-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data: accounts } = await supabase
        .from("paper_accounts")
        .select("id")
        .eq("user_id", user.id);
      if (!accounts || accounts.length === 0) return 0;
      const { count } = await supabase
        .from("paper_trades")
        .select("*", { count: "exact", head: true })
        .in("account_id", accounts.map(a => a.id));
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch recent activity
  const { data: recentActivity = [] } = useQuery({
    queryKey: ["recent-activity", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const [strategiesRes, backtestsRes] = await Promise.all([
        supabase
          .from("strategies")
          .select("id, name, created_at, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("backtest_results")
          .select("id, strategy_id, created_at, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const activities: Array<{
        id: string;
        type: "strategy" | "backtest";
        title: string;
        status: string;
        timestamp: string;
      }> = [];

      strategiesRes.data?.forEach(s => {
        activities.push({
          id: s.id,
          type: "strategy",
          title: s.name,
          status: s.status || "draft",
          timestamp: s.created_at,
        });
      });

      backtestsRes.data?.forEach(b => {
        activities.push({
          id: b.id,
          type: "backtest",
          title: `Backtest #${b.id.slice(0, 8)}`,
          status: b.status || "pending",
          timestamp: b.created_at,
        });
      });

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 4);
    },
    enabled: !!user,
  });

  // Fetch backtest performance data
  const { data: performanceData = [] } = useQuery({
    queryKey: ["performance-data", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data } = await supabase
        .from("backtest_results")
        .select("created_at, metrics")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(30);
      
      if (!data || data.length === 0) {
        return Array.from({ length: 7 }, (_, i) => ({
          date: format(subDays(new Date(), 6 - i), "MMM d"),
          value: 0,
        }));
      }

      return data.map(d => ({
        date: format(new Date(d.created_at), "MMM d"),
        value: (d.metrics as Record<string, number>)?.totalReturn || 0,
      }));
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "status-success";
      case "validated": return "status-info";
      case "running": return "status-warning";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  const getActivityIcon = (type: string) => {
    return type === "strategy" ? Target : BarChart3;
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-display-md text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-body-md text-muted-foreground">
            Start building or continue working on your trading strategies.
          </p>
        </motion.div>

        {/* Hero CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link 
            to="/dashboard/strategies/create" 
            className="group block relative overflow-hidden bg-gradient-to-br from-card to-secondary/50 border border-border rounded-2xl p-8 card-hover"
          >
            {/* Warm accent glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-warm-500/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
              <div className="flex items-start gap-4 md:gap-5">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-warm-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-warm-500" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-medium text-foreground mb-1">Create New Strategy</h2>
                  <p className="text-muted-foreground text-xs md:text-sm max-w-md">
                    Build a trading strategy with AI assistance or define your own rules.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 bg-foreground text-background pl-4 md:pl-5 pr-2.5 md:pr-3 py-2 md:py-2.5 rounded-full group-hover:bg-foreground/90 transition-colors">
                <span className="font-medium text-sm">Create</span>
                <div className="w-6 h-6 md:w-7 md:h-7 bg-background/10 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          <StatCard
            label="Active Strategies"
            value={strategiesCount}
            icon={Target}
            delay={0.15}
          />
          <StatCard
            label="Paper Trades"
            value={paperTradesCount}
            icon={TrendingUp}
            delay={0.2}
          />
          <StatCard
            label="Backtests Run"
            value={backtestsCount}
            icon={BarChart3}
            delay={0.25}
          />
        </div>

        {/* Performance Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.3 }} 
          className="bg-card border border-border rounded-2xl p-4 md:p-6"
        >
          <h3 className="text-foreground font-medium mb-4 md:mb-6">Backtest Performance</h3>
          <PerformanceChart data={performanceData} height={200} />
        </motion.div>

        {/* Recent Activity & Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Recent Activity Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.35 }} 
            className="md:col-span-1 lg:col-span-3 bg-card border border-border rounded-2xl p-4 md:p-6"
          >
            <div className="flex items-center gap-2 mb-4 md:mb-5">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-foreground font-medium text-sm md:text-base">Recent Activity</h3>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No recent activity. Create your first strategy!
              </p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center justify-between p-2.5 md:p-3 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground text-xs md:text-sm font-medium truncate">{activity.title}</p>
                          <p className="text-muted-foreground text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 md:px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }} 
            className="md:col-span-1 lg:col-span-2 space-y-2 md:space-y-3"
          >
            <h3 className="text-sm text-muted-foreground font-medium mb-3 md:mb-4">Quick Links</h3>
            {[
              { title: "My Strategies", icon: FolderOpen, href: "/dashboard/strategies" },
              { title: "Learn & Understand", icon: GraduationCap, href: "/dashboard/learn" },
              { title: "F&O Simulator", icon: BarChart3, href: "/dashboard/fno" },
            ].map((card) => (
              <Link 
                key={card.title} 
                to={card.href} 
                className="group flex items-center gap-3 md:gap-4 bg-card border border-border rounded-xl p-3 md:p-4 hover:bg-card/80 hover:border-border/80 transition-all"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-warm-500/10 transition-colors">
                  <card.icon className="w-4 h-4 text-muted-foreground group-hover:text-warm-500 transition-colors" />
                </div>
                <span className="text-foreground text-sm font-medium flex-1">{card.title}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
