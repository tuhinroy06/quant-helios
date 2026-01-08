import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, BookOpen, Target, Zap } from "lucide-react";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  preferences: unknown;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, preferences")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) setProfile(data);
    };

    fetchProfile();
  }, [user]);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Trader";

  const stats = [
    { label: "Active Strategies", value: "0", icon: TrendingUp },
    { label: "Paper Trades", value: "0", icon: Target },
    { label: "Lessons Completed", value: "0", icon: BookOpen },
    { label: "Win Rate", value: "—", icon: Zap },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground mb-2">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your trading journey.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-5"
            >
              <stat.icon className="w-5 h-5 text-muted-foreground mb-3" />
              <div className="text-2xl font-light text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-foreground/20 transition-colors cursor-pointer">
              <TrendingUp className="w-6 h-6 text-foreground mb-3" />
              <h3 className="font-medium text-foreground mb-1">
                Create Strategy
              </h3>
              <p className="text-sm text-muted-foreground">
                Build your first AI-powered trading strategy
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 hover:border-foreground/20 transition-colors cursor-pointer">
              <Target className="w-6 h-6 text-foreground mb-3" />
              <h3 className="font-medium text-foreground mb-1">
                Start Paper Trading
              </h3>
              <p className="text-sm text-muted-foreground">
                Practice with simulated trades, no risk
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 hover:border-foreground/20 transition-colors cursor-pointer">
              <BookOpen className="w-6 h-6 text-foreground mb-3" />
              <h3 className="font-medium text-foreground mb-1">
                Learn the Basics
              </h3>
              <p className="text-sm text-muted-foreground">
                Understand market fundamentals
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-card/50 border border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground mb-4">
            You haven't created any strategies yet.
          </p>
          <button className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors">
            Create Your First Strategy
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
