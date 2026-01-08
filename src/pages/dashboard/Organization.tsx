import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Users, FolderOpen, Settings, Plus, 
  Mail, Trash2, Crown, Shield, User, Check, X
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  max_members: number;
  created_at: string;
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

const Organization = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "strategies" | "settings">("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  // Fetch user's organizations
  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("organizations")
        .select("*");
      if (error) throw error;
      return data as Organization[];
    },
    enabled: !!user,
  });

  // Fetch organization members
  const { data: members } = useQuery({
    queryKey: ["org-members", organizations?.[0]?.id],
    queryFn: async () => {
      if (!organizations?.[0]) return [];
      const { data, error } = await supabase
        .from("organization_members")
        .select("*")
        .eq("organization_id", organizations[0].id);
      if (error) throw error;
      return data as OrganizationMember[];
    },
    enabled: !!organizations?.[0],
  });

  // Create organization mutation
  const createOrgMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({ name, slug })
        .select()
        .single();
      
      if (orgError) throw orgError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: "owner",
        });
      
      if (memberError) throw memberError;
      
      return org;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setShowCreateModal(false);
      setNewOrgName("");
      toast.success("Organization created successfully!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create organization");
    },
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!user || !organizations?.[0]) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("organization_invites")
        .insert({
          organization_id: organizations[0].id,
          email,
          role,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("member");
      toast.success("Invitation sent!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    },
  });

  const currentOrg = organizations?.[0];
  const userRole = members?.find(m => m.user_id === user?.id)?.role;
  const isAdmin = userRole === "owner" || userRole === "admin";

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Building2 },
    { id: "members" as const, label: "Members", icon: Users },
    { id: "strategies" as const, label: "Shared Strategies", icon: FolderOpen },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-light text-foreground mb-2 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-500" />
                Organization
              </h1>
              <p className="text-muted-foreground">
                Manage your team and shared resources.
              </p>
            </div>
            {!currentOrg && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Organization
              </button>
            )}
          </div>

          {/* No Organization State */}
          {!isLoading && !currentOrg && (
            <div className="bg-card/50 border border-border rounded-xl p-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium text-foreground mb-2">No Organization Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create an organization to collaborate with your team, share strategies, and manage access.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
              >
                Create Organization
              </button>
            </div>
          )}

          {/* Organization Content */}
          {currentOrg && (
            <>
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

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="bg-card/50 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-foreground">
                          {currentOrg.name[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-medium text-foreground">{currentOrg.name}</h2>
                        <p className="text-muted-foreground">@{currentOrg.slug}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-secondary rounded-lg">
                        <Users className="w-5 h-5 text-muted-foreground mb-2" />
                        <p className="text-2xl font-medium text-foreground">{members?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Team Members</p>
                      </div>
                      <div className="p-4 bg-secondary rounded-lg">
                        <FolderOpen className="w-5 h-5 text-muted-foreground mb-2" />
                        <p className="text-2xl font-medium text-foreground">0</p>
                        <p className="text-sm text-muted-foreground">Shared Strategies</p>
                      </div>
                      <div className="p-4 bg-secondary rounded-lg">
                        <Shield className="w-5 h-5 text-muted-foreground mb-2" />
                        <p className="text-2xl font-medium text-foreground capitalize">{userRole}</p>
                        <p className="text-sm text-muted-foreground">Your Role</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Members Tab */}
              {activeTab === "members" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-foreground font-medium">Team Members</h3>
                    {isAdmin && (
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors text-sm"
                      >
                        <Mail className="w-4 h-4" />
                        Invite Member
                      </button>
                    )}
                  </div>

                  <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
                    {members?.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border-b border-border last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              {member.user_id === user?.id ? "You" : member.user_id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Joined {new Date(member.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
                            {getRoleIcon(member.role)}
                            <span className="text-sm text-foreground capitalize">{member.role}</span>
                          </div>
                          {isAdmin && member.user_id !== user?.id && (
                            <button className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategies Tab */}
              {activeTab === "strategies" && (
                <div className="bg-card/50 border border-border rounded-xl p-12 text-center">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-medium text-foreground mb-2">No Shared Strategies</h2>
                  <p className="text-muted-foreground mb-6">
                    Share strategies with your team to collaborate on trading ideas.
                  </p>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div className="bg-card/50 border border-border rounded-xl p-6">
                    <h3 className="text-foreground font-medium mb-4">Organization Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Organization Name</label>
                        <input
                          type="text"
                          value={currentOrg.name}
                          disabled={!isAdmin}
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">URL Slug</label>
                        <input
                          type="text"
                          value={currentOrg.slug}
                          disabled
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <h3 className="text-red-500 font-medium mb-2">Danger Zone</h3>
                      <p className="text-red-500/80 text-sm mb-4">
                        Deleting the organization will remove all members and shared data.
                      </p>
                      <button className="px-4 py-2 bg-red-500/20 text-red-500 rounded-full text-sm font-medium hover:bg-red-500/30 transition-colors">
                        Delete Organization
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Create Organization Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4"
              >
                <h3 className="text-xl font-medium text-foreground mb-4">Create Organization</h3>
                <div className="mb-6">
                  <label className="block text-sm text-muted-foreground mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="My Trading Team"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-full hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => createOrgMutation.mutate(newOrgName)}
                    disabled={!newOrgName.trim() || createOrgMutation.isPending}
                    className="flex-1 px-4 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {createOrgMutation.isPending ? "Creating..." : "Create"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4"
              >
                <h3 className="text-xl font-medium text-foreground mb-4">Invite Team Member</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Email Address</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-full hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                    disabled={!inviteEmail.trim() || inviteMutation.isPending}
                    className="flex-1 px-4 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {inviteMutation.isPending ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Organization;
