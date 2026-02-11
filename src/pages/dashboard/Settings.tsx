import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, CreditCard, Bell, Shield, Check, ChevronRight, ShieldCheck, ShieldOff, Camera, Phone, MapPin, Building } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PRICING_PLANS, formatPrice } from "@/lib/pricing-config";
import TwoFactorSetup from "@/components/settings/TwoFactorSetup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  preferences: {
    phone?: string;
    location?: string;
    company?: string;
    bio?: string;
    notifications?: {
      backtestCompleted?: boolean;
      paperTradeAlerts?: boolean;
      weeklyPerformance?: boolean;
      productUpdates?: boolean;
    };
  } | null;
}

const Settings = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile>({ 
    display_name: "", 
    avatar_url: null,
    preferences: {
      phone: "",
      location: "",
      company: "",
      bio: "",
      notifications: {
        backtestCompleted: true,
        paperTradeAlerts: true,
        weeklyPerformance: false,
        productUpdates: true,
      }
    }
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "notifications" | "security">("profile");
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [has2FA, setHas2FA] = useState(false);
  const [checking2FA, setChecking2FA] = useState(true);
  const [strategyCount, setStrategyCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, preferences")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        const prefs = (data.preferences as Profile['preferences']) || {};
        setProfile({
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          preferences: {
            phone: prefs?.phone || "",
            location: prefs?.location || "",
            company: prefs?.company || "",
            bio: prefs?.bio || "",
            notifications: prefs?.notifications || {
              backtestCompleted: true,
              paperTradeAlerts: true,
              weeklyPerformance: false,
              productUpdates: true,
            }
          }
        });
      }
    };

    const fetchStrategyCount = async () => {
      if (!user) return;
      const { count } = await supabase
        .from("strategies" as any)
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setStrategyCount(count || 0);
    };

    fetchProfile();
    fetchStrategyCount();
  }, [user]);

  // Check if user has 2FA enabled
  useEffect(() => {
    const check2FAStatus = async () => {
      setChecking2FA(true);
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        setHas2FA(data.totp && data.totp.length > 0);
      } catch {
        console.error("Failed to check 2FA status");
      } finally {
        setChecking2FA(false);
      }
    };
    check2FAStatus();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          display_name: profile.display_name,
          preferences: profile.preferences
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: dataUrl })
          .eq("user_id", user.id);

        if (error) throw error;
        
        setProfile(prev => ({ ...prev, avatar_url: dataUrl }));
        toast.success("Avatar updated successfully");
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload avatar");
      setUploadingAvatar(false);
    }
  };

  const handle2FASuccess = () => {
    setHas2FA(true);
  };

  const handleDisable2FA = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      if (data?.totp && data.totp.length > 0) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: data.totp[0].id,
        });
        if (error) throw error;
        setHas2FA(false);
        toast.success("Two-factor authentication disabled");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to disable 2FA";
      toast.error(message);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences?.notifications,
          [key]: value,
        }
      }
    }));
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ preferences: profile.preferences })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
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

  const currentPlanId = "free";

  const notificationItems = [
    { key: "backtestCompleted", label: "Backtest completed", description: "Get notified when backtests finish" },
    { key: "paperTradeAlerts", label: "Paper trade alerts", description: "Alerts for paper trading activity" },
    { key: "weeklyPerformance", label: "Weekly performance summary", description: "Weekly email with performance metrics" },
    { key: "productUpdates", label: "Product updates", description: "New features and improvements" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your account and preferences.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:w-56 flex-shrink-0"
          >
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="w-4 h-4 ml-auto hidden lg:block" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex-1 min-w-0"
          >
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-foreground font-medium mb-6">Profile Picture</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <Avatar className="w-24 h-24 border-2 border-border">
                        <AvatarImage src={profile.avatar_url || undefined} alt="Profile" />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {profile.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">
                        {profile.display_name || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="mt-2 text-sm text-primary hover:underline"
                      >
                        {uploadingAvatar ? 'Uploading...' : 'Change photo'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-foreground font-medium mb-6">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Display Name</label>
                      <input
                        type="text"
                        value={profile.display_name || ""}
                        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profile.preferences?.phone || ""}
                          onChange={(e) => setProfile({ 
                            ...profile, 
                            preferences: { ...profile.preferences, phone: e.target.value }
                          })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          Location
                        </label>
                        <input
                          type="text"
                          value={profile.preferences?.location || ""}
                          onChange={(e) => setProfile({ 
                            ...profile, 
                            preferences: { ...profile.preferences, location: e.target.value }
                          })}
                          placeholder="Mumbai, India"
                          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Building className="w-4 h-4" />
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={profile.preferences?.company || ""}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          preferences: { ...profile.preferences, company: e.target.value }
                        })}
                        placeholder="Your company name"
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Bio</label>
                      <textarea
                        value={profile.preferences?.bio || ""}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          preferences: { ...profile.preferences, bio: e.target.value }
                        })}
                        placeholder="Tell us a bit about yourself and your trading experience..."
                        rows={3}
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
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
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-foreground font-medium mb-2">Current Plan</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    You are currently on the <span className="text-foreground font-medium">Free</span> plan.
                  </p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="px-3 py-1 bg-secondary rounded-full">{strategyCount} strategies created</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {PRICING_PLANS.map((plan) => {
                    const isCurrent = plan.id === currentPlanId;
                    return (
                      <div
                        key={plan.id}
                        className={`bg-card border rounded-2xl p-6 relative ${
                          plan.popular
                            ? "border-primary/30 ring-1 ring-primary/10"
                            : "border-border"
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-3 left-4 text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-medium">
                            Recommended
                          </span>
                        )}
                        <h4 className="text-xl font-medium text-foreground mb-2">{plan.name}</h4>
                        <div className="mb-4">
                          <span className="text-3xl font-light text-foreground">{formatPrice(plan.price)}</span>
                          <span className="text-muted-foreground">{plan.period}</span>
                        </div>
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <button
                          className={`w-full py-2.5 rounded-full text-sm font-medium transition-colors ${
                            isCurrent
                              ? "bg-secondary text-muted-foreground cursor-not-allowed"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          }`}
                          disabled={isCurrent}
                        >
                          {isCurrent ? "Current Plan" : "Upgrade"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-foreground font-medium mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {notificationItems.map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                      <div>
                        <p className="text-foreground font-medium text-sm">{item.label}</p>
                        <p className="text-muted-foreground text-xs">{item.description}</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={!!(profile.preferences?.notifications as any)?.[item.key]}
                        onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                        className="w-5 h-5 rounded border-border bg-secondary text-primary focus:ring-primary/20" 
                      />
                    </label>
                  ))}
                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
                  >
                    {loading ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-foreground font-medium mb-2">Password</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Change your password to keep your account secure.
                  </p>
                  <button className="px-6 py-2.5 bg-secondary text-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors">
                    Change Password
                  </button>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-foreground font-medium mb-2 flex items-center gap-2">
                        Two-Factor Authentication
                        {has2FA ? (
                          <span className="flex items-center gap-1 text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            Enabled
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-normal bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                            <ShieldOff className="w-3 h-3" />
                            Disabled
                          </span>
                        )}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {has2FA 
                          ? "Your account is protected with two-factor authentication."
                          : "Add an extra layer of security to your account."}
                      </p>
                    </div>
                  </div>
                  {checking2FA ? (
                    <div className="text-sm text-muted-foreground">Checking 2FA status...</div>
                  ) : has2FA ? (
                    <button 
                      onClick={handleDisable2FA}
                      className="px-6 py-2.5 bg-destructive/10 text-destructive rounded-full text-sm font-medium hover:bg-destructive/20 transition-colors"
                    >
                      Disable 2FA
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShow2FASetup(true)}
                      className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Enable 2FA
                    </button>
                  )}
                </div>

                <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6">
                  <h3 className="text-destructive font-medium mb-2">Danger Zone</h3>
                  <p className="text-destructive/70 text-sm mb-4">
                    Permanently delete your account and all associated data.
                  </p>
                  <button className="px-6 py-2.5 bg-destructive/10 text-destructive rounded-full text-sm font-medium hover:bg-destructive/20 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      <TwoFactorSetup
        open={show2FASetup}
        onOpenChange={setShow2FASetup}
        onSuccess={handle2FASuccess}
      />
    </DashboardLayout>
  );
};

export default Settings;
