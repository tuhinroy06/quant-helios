import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, CreditCard, Bell, Shield, Check } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({ display_name: "", avatar_url: null });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "notifications" | "security">("profile");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: profile.display_name })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "billing" as const, label: "Billing & Plans", icon: CreditCard },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "security" as const, label: "Security", icon: Shield },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["3 strategies", "5 backtests/day", "Basic indicators"],
      current: true,
    },
    {
      name: "Retail",
      price: "$29",
      period: "/month",
      features: ["10 strategies", "50 backtests/day", "Paper trading", "AI assistant"],
      current: false,
      recommended: true,
    },
    {
      name: "Pro",
      price: "$99",
      period: "/month",
      features: ["50 strategies", "Unlimited backtests", "F&O access", "Priority support"],
      current: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-light text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground mb-8">
            Manage your account and preferences.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-black"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <h3 className="text-foreground font-medium mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Display Name</label>
                    <input
                      type="text"
                      value={profile.display_name || ""}
                      onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <h3 className="text-foreground font-medium mb-2">Current Plan</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  You are currently on the <span className="text-foreground font-medium">Free</span> plan.
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>3/3 strategies used</span>
                  <span>•</span>
                  <span>2/5 backtests today</span>
                </div>
              </div>

              {/* Plans */}
              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`bg-card/50 border rounded-xl p-6 ${
                      plan.recommended
                        ? "border-white/30 ring-1 ring-white/10"
                        : "border-border"
                    }`}
                  >
                    {plan.recommended && (
                      <span className="text-xs bg-white text-black px-2 py-1 rounded-full font-medium mb-4 inline-block">
                        Recommended
                      </span>
                    )}
                    <h4 className="text-xl font-medium text-foreground">{plan.name}</h4>
                    <div className="mt-2 mb-4">
                      <span className="text-3xl font-light text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 rounded-full text-sm font-medium transition-colors ${
                        plan.current
                          ? "bg-secondary text-muted-foreground cursor-not-allowed"
                          : "bg-white text-black hover:bg-white/90"
                      }`}
                      disabled={plan.current}
                    >
                      {plan.current ? "Current Plan" : "Upgrade"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-card/50 border border-border rounded-xl p-6">
              <h3 className="text-foreground font-medium mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: "Backtest completed", description: "Get notified when backtests finish" },
                  { label: "Paper trade alerts", description: "Alerts for paper trading activity" },
                  { label: "Weekly performance summary", description: "Weekly email with performance metrics" },
                  { label: "Product updates", description: "New features and improvements" },
                ].map((item) => (
                  <label key={item.label} className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer">
                    <div>
                      <p className="text-foreground font-medium text-sm">{item.label}</p>
                      <p className="text-muted-foreground text-xs">{item.description}</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded border-border" defaultChecked />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <h3 className="text-foreground font-medium mb-4">Password</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Change your password to keep your account secure.
                </p>
                <button className="px-6 py-2 bg-secondary text-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors">
                  Change Password
                </button>
              </div>

              <div className="bg-card/50 border border-border rounded-xl p-6">
                <h3 className="text-foreground font-medium mb-4">Two-Factor Authentication</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add an extra layer of security to your account.
                </p>
                <button className="px-6 py-2 bg-secondary text-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors">
                  Enable 2FA
                </button>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-red-500 font-medium mb-4">Danger Zone</h3>
                <p className="text-red-500/80 text-sm mb-4">
                  Permanently delete your account and all associated data.
                </p>
                <button className="px-6 py-2 bg-red-500/20 text-red-500 rounded-full text-sm font-medium hover:bg-red-500/30 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
