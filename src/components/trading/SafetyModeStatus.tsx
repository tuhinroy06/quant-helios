import { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { useSafetyMode } from "@/hooks/useSafetyMode";
import { formatINRSimple } from "@/lib/indian-stocks";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface SafetyModeStatusProps {
  accountId: string;
  compact?: boolean;
}

export const SafetyModeStatus = ({
  accountId,
  compact = false,
}: SafetyModeStatusProps) => {
  const { status, loading, enableSafetyMode, fetchStatus } = useSafetyMode(accountId);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleEnableSafetyMode = async () => {
    const success = await enableSafetyMode();
    if (success) {
      toast.success("Live Safety Mode enabled for 30 days");
    } else {
      toast.error("Failed to enable safety mode");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Shield className="w-4 h-4 animate-pulse" />
        <span>Loading safety status...</span>
      </div>
    );
  }

  // Not enabled
  if (!status || !status.enabled) {
    if (compact) {
      return (
        <button
          onClick={handleEnableSafetyMode}
          className="flex items-center gap-1.5 px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
        >
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Enable Safety Mode</span>
        </button>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground">Live Safety Mode</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Enable 30-day safety mode for new live trading accounts. Reduces position sizes and adds extra protections.
        </p>
        <Button onClick={handleEnableSafetyMode} variant="outline" size="sm" className="w-full">
          <Shield className="w-4 h-4 mr-2" />
          Enable Safety Mode
        </Button>
      </motion.div>
    );
  }

  // Compact mode
  if (compact) {
    const progressPct = ((30 - status.days_remaining) / 30) * 100;
    
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
        <Shield className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-amber-500 text-xs font-medium">
          Safety Mode: {status.days_remaining}d left
        </span>
        <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    );
  }

  // Full display
  const progressPct = ((30 - status.days_remaining) / 30) * 100;
  const sizeReductionPct = Math.round((1 - status.position_size_multiplier) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-amber-500/30 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          <h3 className="font-medium text-amber-500 text-sm">Live Safety Mode Active</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{status.days_remaining} days remaining</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Day {status.days_active} of 30</span>
            <span className="text-foreground">{Math.round(progressPct)}% complete</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        {/* Active Restrictions */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Active Restrictions
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-lg font-bold text-foreground">
                {sizeReductionPct}%
              </div>
              <div className="text-xs text-muted-foreground">Size Reduction</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-lg font-bold text-foreground">
                {status.max_concurrent_positions}
              </div>
              <div className="text-xs text-muted-foreground">Max Positions</div>
            </div>
          </div>
        </div>

        {/* Override Limits */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-primary" />
            Tighter Kill Switch Limits
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between bg-secondary/30 rounded px-2 py-1.5">
              <span className="text-muted-foreground">Max Daily Loss</span>
              <span className="text-destructive font-medium">{formatINRSimple(status.max_daily_loss_override)}</span>
            </div>
            <div className="flex justify-between bg-secondary/30 rounded px-2 py-1.5">
              <span className="text-muted-foreground">Max Drawdown</span>
              <span className="text-destructive font-medium">{status.max_drawdown_override}%</span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5" />
            <span>
              Safety mode protects new accounts from overtrading. Restrictions automatically lift after 30 days of live trading.
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
