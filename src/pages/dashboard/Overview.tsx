import { motion } from "framer-motion";
import { Plus, FolderOpen, GraduationCap, BarChart3, ArrowRight, TrendingUp, Target, Activity, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays } from "date-fns";
import { StatCard } from "@/components/ui/stat-card";

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
        .slice(0, 5);
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

  // Weekly activity
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-500 bg-green-500/10";
      case "validated": return "text-blue-500 bg-blue-500/10";
      case "running": return "text-yellow-500 bg-yellow-500/10";
      default: return "text-muted-foreground bg-secondary";
    }
  };

  const getActivityIcon = (type: string) => {
    return type === "strategy" ? Target : BarChart3;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-lg">
            Start building or continue working on your trading strategies.
          </p>
        </motion.div>

        {/* Hero CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Link 
            to="/dashboard/strategies/create" 
            className="group block relative overflow-hidden bg-gradient-to-br from-card to-secondary/30 border border-border rounded-3xl p-8 md:p-10 hover:border-border/60 transition-all duration-500"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-7 h-7 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-medium text-foreground mb-2">Create New Strategy</h2>
                  <p className="text-muted-foreground max-w-md">
                    Build a trading strategy with AI assistance or define your own rules manually.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-primary text-primary-foreground pl-4 pr-6 py-3 rounded-full group-hover:bg-primary/90 transition-colors">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }} 
            className="lg:col-span-2 bg-card border border-border rounded-2xl p-6"
          >
            <h3 className="text-foreground font-medium mb-6">Backtest Performance</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0 0% 100%)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="hsl(0 0% 100%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="hsl(0 0% 30%)" tick={{ fill: "hsl(0 0% 50%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="hsl(0 0% 30%)" tick={{ fill: "hsl(0 0% 50%)", fontSize: 12 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(0 0% 8%)", 
                      border: "1px solid hsl(0 0% 15%)", 
                      borderRadius: "12px",
                      boxShadow: "0 8px 30px -10px rgba(0,0,0,0.5)"
                    }} 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Return"]} 
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(0 0% 100%)" fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.35 }} 
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h3 className="text-foreground font-medium mb-6">Weekly Activity</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <XAxis dataKey="day" stroke="hsl(0 0% 30%)" tick={{ fill: "hsl(0 0% 50%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="hsl(0 0% 30%)" tick={{ fill: "hsl(0 0% 50%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(0 0% 8%)", 
                      border: "1px solid hsl(0 0% 15%)", 
                      borderRadius: "12px" 
                    }} 
                  />
                  <Bar dataKey="strategies" name="Strategies" fill="hsl(0 0% 100%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="backtests" name="Backtests" fill="hsl(0 0% 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Quick Links */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }} 
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-foreground font-medium">Recent Activity</h3>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No recent activity. Create your first strategy!
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center">
                          <Icon className="w-4 h-4 text-foreground/70" />
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-medium">{activity.title}</p>
                          <p className="text-muted-foreground text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${getStatusColor(activity.status)}`}>
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
            transition={{ duration: 0.5, delay: 0.45 }} 
            className="space-y-4"
          >
            {[
              { title: "My Strategies", description: "View and manage strategies", icon: FolderOpen, href: "/dashboard/strategies", count: strategiesCount },
              { title: "Learn & Understand", description: "Educational resources", icon: GraduationCap, href: "/dashboard/learn" },
              { title: "F&O Simulator", description: "Options pricing calculator", icon: BarChart3, href: "/dashboard/fno" },
            ].map((card, index) => (
              <Link 
                key={card.title} 
                to={card.href} 
                className="group flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:bg-card/80 hover:border-border/60 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <card.icon className="w-5 h-5 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-foreground font-medium">{card.title}</h3>
                    {card.count !== undefined && (
                      <span className="text-sm text-muted-foreground">{card.count}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{card.description}</p>
                </div>
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
