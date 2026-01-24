import { ControlStatus, ControlState } from "@/hooks/useControlPlane";
import { ControlStatusBadge } from "./ControlStatusBadge";
import { Activity, AlertTriangle, ShieldCheck } from "lucide-react";

interface ControlStatusSummaryProps {
  status: ControlStatus | null;
  loading?: boolean;
}

export function ControlStatusSummary({ status, loading }: ControlStatusSummaryProps) {
  if (loading) {
    return (
      <div className="bg-card/50 border border-border rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (!status) {
    return null;
  }
  
  const { by_state, total_targets, global_killed } = status;
  
  const hasIssues = by_state.THROTTLED > 0 || by_state.FROZEN > 0 || by_state.KILLED > 0;
  
  return (
    <div className="bg-card/50 border border-border rounded-xl p-6">
      <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        System Control Status
      </h3>
      
      {global_killed ? (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-red-500 font-medium">Global Kill Switch Active</p>
            <p className="text-sm text-muted-foreground">All trading is halted system-wide</p>
          </div>
        </div>
      ) : hasIssues ? (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="text-yellow-500 font-medium">Some Controls Active</p>
            <p className="text-sm text-muted-foreground">
              {by_state.THROTTLED > 0 && `${by_state.THROTTLED} throttled`}
              {by_state.FROZEN > 0 && `, ${by_state.FROZEN} frozen`}
              {by_state.KILLED > 0 && `, ${by_state.KILLED} killed`}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-green-500 font-medium">All Systems Normal</p>
            <p className="text-sm text-muted-foreground">
              {total_targets} targets monitored, all active
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-4">
        {(Object.keys(by_state) as ControlState[]).map(state => (
          <div key={state} className="text-center">
            <div className="text-2xl font-semibold text-foreground">
              {by_state[state]}
            </div>
            <ControlStatusBadge state={state} size="sm" showIcon={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
