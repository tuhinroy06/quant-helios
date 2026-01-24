import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Plus, Settings, AlertTriangle, TrendingDown, Pause, Play } from "lucide-react";
import { useCapitalAllocation } from "@/hooks/useCapitalAllocation";
import { formatINRSimple, formatINR } from "@/lib/indian-stocks";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CapitalAllocationDashboardProps {
  accountId: string;
  totalCapital: number;
}

export const CapitalAllocationDashboard = ({
  accountId,
  totalCapital,
}: CapitalAllocationDashboardProps) => {
  const { allocations, summary, loading, fetchAllocations, createAllocation, updateAllocation } = useCapitalAllocation(accountId);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStrategy, setNewStrategy] = useState("");
  const [newAllocPct, setNewAllocPct] = useState("20");
  const [newMaxDrawdown, setNewMaxDrawdown] = useState("10");

  const handleCreateAllocation = async () => {
    if (!newStrategy.trim()) {
      toast.error("Strategy name is required");
      return;
    }

    const result = await createAllocation(
      newStrategy.toUpperCase().replace(/\s+/g, "_"),
      parseFloat(newAllocPct),
      parseFloat(newMaxDrawdown)
    );

    if (result) {
      toast.success("Strategy allocation created");
      setShowAddDialog(false);
      setNewStrategy("");
      setNewAllocPct("20");
      setNewMaxDrawdown("10");
    }
  };

  const handleToggleStrategy = async (allocationId: string, enabled: boolean) => {
    const success = await updateAllocation(allocationId, { enabled: !enabled });
    if (success) {
      toast.success(`Strategy ${enabled ? "paused" : "resumed"}`);
    }
  };

  const allocatedPct = summary?.allocation_pct || 0;
  const unallocatedPct = 100 - allocatedPct;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-foreground text-sm">Capital Allocation</h3>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Strategy Allocation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="strategy">Strategy Name</Label>
                <Input
                  id="strategy"
                  value={newStrategy}
                  onChange={(e) => setNewStrategy(e.target.value)}
                  placeholder="e.g., MOMENTUM"
                />
              </div>
              <div>
                <Label htmlFor="alloc">Allocation %</Label>
                <Input
                  id="alloc"
                  type="number"
                  value={newAllocPct}
                  onChange={(e) => setNewAllocPct(e.target.value)}
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="drawdown">Max Drawdown %</Label>
                <Input
                  id="drawdown"
                  type="number"
                  value={newMaxDrawdown}
                  onChange={(e) => setNewMaxDrawdown(e.target.value)}
                  min="1"
                  max="50"
                />
              </div>
              <Button onClick={handleCreateAllocation} className="w-full" disabled={loading}>
                Create Allocation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Total Capital</span>
          <span className="text-sm font-semibold text-foreground">{formatINR(totalCapital)}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Allocated</span>
            <span className="text-foreground">{allocatedPct.toFixed(1)}%</span>
          </div>
          <Progress value={allocatedPct} className="h-2" />
        </div>

        {unallocatedPct > 0 && (
          <div className="flex items-center gap-2 text-xs text-amber-500">
            <AlertTriangle className="w-3 h-3" />
            <span>{unallocatedPct.toFixed(1)}% unallocated ({formatINR(summary?.unallocated_capital || 0)})</span>
          </div>
        )}
      </div>

      {/* Allocations List */}
      {allocations.length > 0 ? (
        <div className="border-t border-border divide-y divide-border">
          {allocations.map((alloc) => (
            <div
              key={alloc.id}
              className={`p-3 ${!alloc.enabled ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{alloc.strategy}</span>
                  {alloc.is_killed && (
                    <span className="px-1.5 py-0.5 text-xs bg-destructive/20 text-destructive rounded">KILLED</span>
                  )}
                </div>
                <button
                  onClick={() => handleToggleStrategy(alloc.id, alloc.enabled)}
                  className="p-1 hover:bg-secondary rounded"
                >
                  {alloc.enabled ? (
                    <Pause className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-primary" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Allocation</span>
                  <span className="text-foreground">{alloc.allocated_pct}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Used</span>
                  <span className="text-foreground">{formatINRSimple(alloc.used_capital)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Available</span>
                  <span className="text-primary">{formatINRSimple(alloc.available_capital)}</span>
                </div>
              </div>

              {alloc.current_drawdown_pct > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <TrendingDown className="w-3 h-3 text-destructive" />
                  <span className="text-destructive">
                    Drawdown: {alloc.current_drawdown_pct.toFixed(1)}% / {alloc.max_drawdown_pct}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-sm text-muted-foreground">
          No strategy allocations yet.
          <br />
          Click + to add your first allocation.
        </div>
      )}
    </motion.div>
  );
};
