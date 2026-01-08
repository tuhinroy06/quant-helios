import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, MoreVertical, Play, Pencil, Archive, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Strategy {
  id: string;
  name: string;
  description: string | null;
  status: string;
  market_type: string;
  timeframe: string;
  created_at: string;
  updated_at: string;
}

const Strategies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchStrategies = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        toast.error("Failed to load strategies");
        return;
      }

      setStrategies(data || []);
      setLoading(false);
    };

    fetchStrategies();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("strategies")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete strategy");
      return;
    }

    setStrategies(strategies.filter(s => s.id !== id));
    toast.success("Strategy deleted");
  };

  const handleArchive = async (id: string) => {
    const { error } = await supabase
      .from("strategies")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) {
      toast.error("Failed to archive strategy");
      return;
    }

    setStrategies(strategies.map(s => 
      s.id === id ? { ...s, status: "archived" } : s
    ));
    toast.success("Strategy archived");
  };

  const filteredStrategies = strategies.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterStatus || s.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-secondary text-muted-foreground";
      case "validated": return "bg-blue-500/20 text-blue-500";
      case "backtested": return "bg-purple-500/20 text-purple-500";
      case "paper_trading": return "bg-green-500/20 text-green-500";
      case "live": return "bg-amber-500/20 text-amber-500";
      case "archived": return "bg-secondary text-muted-foreground";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-light text-foreground mb-2">
                My Strategies
              </h1>
              <p className="text-muted-foreground">
                View and manage your trading strategies.
              </p>
            </div>
            <Link
              to="/dashboard/strategies/create"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Strategy
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search strategies..."
                className="w-full bg-secondary border border-border rounded-full pl-11 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Filter className="w-4 h-4" />
                {filterStatus || "All Status"}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus(null)}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("draft")}>Draft</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("validated")}>Validated</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("backtested")}>Backtested</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("paper_trading")}>Paper Trading</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("archived")}>Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Strategies List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse">
                  <div className="h-5 bg-secondary rounded w-1/3 mb-3" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredStrategies.length === 0 ? (
            <div className="bg-card/50 border border-border rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-foreground font-medium mb-2">
                {searchQuery || filterStatus ? "No strategies found" : "No strategies yet"}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                {searchQuery || filterStatus
                  ? "Try adjusting your search or filter."
                  : "Create your first trading strategy to get started."}
              </p>
              {!searchQuery && !filterStatus && (
                <Link
                  to="/dashboard/strategies/create"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Strategy
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStrategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="bg-card/50 border border-border rounded-xl p-5 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-foreground font-medium">{strategy.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(strategy.status)}`}>
                          {strategy.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{strategy.market_type}</span>
                        <span>•</span>
                        <span>{strategy.timeframe}</span>
                        <span>•</span>
                        <span>Updated {formatDate(strategy.updated_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {strategy.status === "draft" && (
                        <button
                          onClick={() => navigate(`/dashboard/strategies/${strategy.id}/review`)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          title="Review"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {(strategy.status === "validated" || strategy.status === "draft") && (
                        <button
                          onClick={() => navigate(`/dashboard/backtest/${strategy.id}`)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          title="Backtest"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/strategies/${strategy.id}/review`)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/backtest/${strategy.id}`)}>
                            <Play className="w-4 h-4 mr-2" />
                            Backtest
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchive(strategy.id)}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(strategy.id)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Strategies;
