import { motion } from "framer-motion";
import { Plus, FolderOpen, GraduationCap, BarChart3, ArrowRight, TrendingUp, Target, Activity, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays } from "date-fns";

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

  // Fetch recent activity (strategies, backtests)
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
        .slice(0, 6);
    },
    enabled: !!user,
  });

  // Fetch backtest performance data for chart
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
        // Return sample data for empty state
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

  // Weekly activity chart data
  const { data: weeklyActivity = [] } = useQuery({
    queryKey: ["weekly-activity", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          day: format(date, "EEE"),
          date: format(date, "yyyy-MM-dd"),
          strategies: 0,
          backtests: 0,
        };
      });

      const [strategiesRes, backtestsRes] = await Promise.all([
        supabase
          .from("strategies")
          .select("created_at")
          .eq("user_id", user.id)
          .gte("created_at", subDays(new Date(), 7).toISOString()),
        supabase
          .from("backtest_results")
          .select("created_at")
          .eq("user_id", user.id)
          .gte("created_at", subDays(new Date(), 7).toISOString()),
      ]);

      strategiesRes.data?.forEach(s => {
        const day = days.find(d => d.date === format(new Date(s.created_at), "yyyy-MM-dd"));
        if (day) day.strategies++;
      });

      backtestsRes.data?.forEach(b => {
        const day = days.find(d => d.date === format(new Date(b.created_at), "yyyy-MM-dd"));
        if (day) day.backtests++;
      });

      return days;
    },
    enabled: !!user,
  });

  const stats = [
    { label: "Active Strategies", value: strategiesCount.toString(), icon: Target, color: "text-blue-500" },
    { label: "Paper Trades", value: paperTradesCount.toString(), icon: TrendingUp, color: "text-green-500" },
    { label: "Backtests Run", value: backtestsCount.toString(), icon: BarChart3, color: "text-purple-500" },
  ];

  const primaryCard = {
    title: "Create Strategy",
    description: "Build a new trading strategy with AI assistance or manual rules",
    icon: Plus,
    href: "/dashboard/strategies/create",
  };

  const secondaryCards = [
    { title: "My Strategies", description: "View and manage your existing strategies", icon: FolderOpen, href: "/dashboard/strategies", count: strategiesCount },
    { title: "Learn & Understand", description: "Educational resources to improve your trading knowledge", icon: GraduationCap, href: "/dashboard/learn" },
    { title: "F&O Simulator", description: "Options pricing and Greeks calculator", icon: BarChart3, href: "/dashboard/fno" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-500 bg-green-500/20";
      case "validated": return "text-blue-500 bg-blue-500/20";
      case "running": return "text-yellow-500 bg-yellow-500/20";
      default: return "text-muted-foreground bg-secondary";
    }
  };

  const getActivityIcon = (type: string) => {
    return type === "strategy" ? Target : BarChart3;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Start building or continue working on your trading strategies.</p>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card/50 border border-border rounded-xl p-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-medium text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="lg:col-span-2 bg-card/50 border border-border rounded-xl p-6">
            <h3 className="text-foreground font-medium mb-4">Backtest Performance</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#666" tick={{ fill: "#888", fontSize: 12 }} />
                  <YAxis stroke="#666" tick={{ fill: "#888", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} formatter={(value: number) => [`${value.toFixed(1)}%`, "Return"]} />
                  <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-card/50 border border-border rounded-xl p-6">
            <h3 className="text-foreground font-medium mb-4">Weekly Activity</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <XAxis dataKey="day" stroke="#666" tick={{ fill: "#888", fontSize: 12 }} />
                  <YAxis stroke="#666" tick={{ fill: "#888", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                  <Bar dataKey="strategies" name="Strategies" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="backtests" name="Backtests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="bg-card/50 border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground font-medium flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h3>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No recent activity. Create your first strategy to get started!</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-foreground" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">{activity.title}</p>
                        <p className="text-muted-foreground text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Primary Action Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mb-6">
          <Link to={primaryCard.href} className="group block bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] hover:border-white/20 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                  <primaryCard.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-foreground mb-2">{primaryCard.title}</h2>
                  <p className="text-muted-foreground">{primaryCard.description}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </motion.div>

        {/* Secondary Cards Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="grid md:grid-cols-3 gap-4">
          {secondaryCards.map((card) => (
            <Link key={card.title} to={card.href} className="group block bg-card/50 border border-border rounded-xl p-6 transition-all hover:bg-card hover:border-white/20">
              <div className="flex items-center justify-between mb-4">
                <card.icon className="w-6 h-6 text-foreground" />
                {card.count !== undefined && <span className="text-sm text-muted-foreground">{card.count}</span>}
              </div>
              <h3 className="text-foreground font-medium mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </Link>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
