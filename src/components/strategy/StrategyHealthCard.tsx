import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  AlertTriangle, 
  ArrowDown, 
  ArrowUp, 
  CheckCircle, 
  RefreshCw, 
  Shield, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HealthGauge } from "./HealthGauge";
import { 
  useStrategyHealth, 
  StrategyHealthReport, 
  StrategyHealthStatus,
  ExecutionAction 
} from "@/hooks/useStrategyHealth";
import { cn } from "@/lib/utils";

interface StrategyHealthCardProps {
  strategyId: string;
  className?: string;
  onHealthChange?: (report: StrategyHealthReport) => void;
}

const statusConfig: Record<StrategyHealthStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof CheckCircle;
}> = {
  HEALTHY: {
    label: "Healthy",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    icon: CheckCircle,
  },
  DEGRADED: {
    label: "Degraded",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    icon: AlertTriangle,
  },
  UNSTABLE: {
    label: "Unstable",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    icon: AlertTriangle,
  },
  CRITICAL: {
    label: "Critical",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: XCircle,
  },
  UNKNOWN: {
    label: "Unknown",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    icon: Activity,
  },
};

const actionConfig: Record<ExecutionAction, {
  label: string;
  color: string;
  description: string;
}> = {
  ALLOW: {
    label: "Allow Execution",
    color: "text-chart-2",
    description: "Strategy is safe to execute",
  },
  THROTTLE: {
    label: "Throttle",
    color: "text-chart-4",
    description: "Reduced execution recommended",
  },
  REVIEW_REQUIRED: {
    label: "Review Required",
    color: "text-chart-5",
    description: "Manual review before execution",
  },
  EXECUTION_FREEZE: {
    label: "Execution Frozen",
    color: "text-destructive",
    description: "Execution halted until resolved",
  },
};

export function StrategyHealthCard({ 
  strategyId, 
  className,
  onHealthChange 
}: StrategyHealthCardProps) {
  const { 
    latestReport, 
    isLoading, 
    isEvaluating, 
    evaluateHealth, 
    fetchLatestReport 
  } = useStrategyHealth();

  const [report, setReport] = useState<StrategyHealthReport | null>(null);

  useEffect(() => {
    fetchLatestReport(strategyId).then((r) => {
      if (r) setReport(r);
    });
  }, [strategyId, fetchLatestReport]);

  useEffect(() => {
    if (latestReport && latestReport.strategy_id === strategyId) {
      setReport(latestReport);
      onHealthChange?.(latestReport);
    }
  }, [latestReport, strategyId, onHealthChange]);

  const handleRefresh = async () => {
    const newReport = await evaluateHealth(strategyId);
    if (newReport) {
      setReport(newReport);
      onHealthChange?.(newReport);
    }
  };

  const status = report?.health_status || "UNKNOWN";
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  const actionInfo = report ? actionConfig[report.recommended_action] : null;

  const TrendIcon = report?.is_improving 
    ? TrendingUp 
    : report?.is_deteriorating 
      ? TrendingDown 
      : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card/50 border border-border rounded-xl p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-foreground font-medium">Strategy Health</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isEvaluating || isLoading}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", (isEvaluating || isLoading) && "animate-spin")} />
          {isEvaluating ? "Evaluating..." : "Refresh"}
        </Button>
      </div>

      {!report ? (
        <div className="text-center py-8">
          <Activity className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm mb-4">
            No health assessment available
          </p>
          <Button onClick={handleRefresh} disabled={isEvaluating}>
            Run Health Check
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Score and Status */}
          <div className="flex items-center gap-6">
            <HealthGauge score={report.health_score} size="md" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn("gap-1", statusInfo.bgColor, statusInfo.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </Badge>
                {report.health_delta !== null && (
                  <Badge variant="outline" className="gap-1">
                    <TrendIcon className={cn(
                      "w-3 h-3",
                      report.is_improving && "text-chart-2",
                      report.is_deteriorating && "text-destructive"
                    )} />
                    {report.health_delta > 0 ? "+" : ""}{report.health_delta}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {report.window_trades} trades
              </p>
              {report.generated_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last checked: {new Date(report.generated_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Execution Action */}
          {actionInfo && (
            <div className={cn(
              "rounded-lg p-3 border",
              report.recommended_action === "ALLOW" && "border-chart-2/30 bg-chart-2/5",
              report.recommended_action === "THROTTLE" && "border-chart-4/30 bg-chart-4/5",
              report.recommended_action === "REVIEW_REQUIRED" && "border-chart-5/30 bg-chart-5/5",
              report.recommended_action === "EXECUTION_FREEZE" && "border-destructive/30 bg-destructive/5"
            )}>
              <div className="flex items-center gap-2">
                <Shield className={cn("w-4 h-4", actionInfo.color)} />
                <span className={cn("font-medium text-sm", actionInfo.color)}>
                  {actionInfo.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {actionInfo.description}
              </p>
            </div>
          )}

          {/* Execution Risk Breakdown */}
          {report.execution_risk_breakdown && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Execution Risk</h4>
              <div className="space-y-2">
                <RiskBar label="Overall" value={report.execution_risk_breakdown.overall_risk} />
                <RiskBar label="Slippage" value={report.execution_risk_breakdown.slippage_risk} />
                <RiskBar label="Liquidity" value={report.execution_risk_breakdown.liquidity_risk} />
                <RiskBar label="Partial Fill" value={report.execution_risk_breakdown.partial_fill_risk} />
              </div>
            </div>
          )}

          {/* Logic Stability */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Logic Stability</h4>
              <span className="text-sm text-muted-foreground">
                {Math.round(report.logic_stability_score * 100)}%
              </span>
            </div>
            <Progress 
              value={report.logic_stability_score * 100} 
              className="h-2"
            />
          </div>

          {/* Degradation Reasons */}
          {report.degradation_reasons.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-chart-4" />
                Issues Detected
              </h4>
              <ul className="space-y-1">
                {report.degradation_reasons.map((reason, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-chart-4 mt-0.5">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Behavior Flags */}
          {report.behavior_flags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Behavior Patterns</h4>
              <div className="flex flex-wrap gap-2">
                {report.behavior_flags.map((flag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {flag.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Regime-Conditional Stability */}
          {Object.keys(report.logic_stability_by_regime).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Stability by Regime</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(report.logic_stability_by_regime).map(([regime, stability]) => (
                  <div 
                    key={regime} 
                    className="flex items-center justify-between text-xs bg-secondary/50 rounded px-2 py-1"
                  >
                    <span className="text-muted-foreground capitalize">
                      {regime.replace(/_/g, " ")}
                    </span>
                    <span className={cn(
                      "font-medium",
                      stability >= 0.7 ? "text-chart-2" : 
                      stability >= 0.5 ? "text-chart-4" : "text-destructive"
                    )}>
                      {Math.round(stability * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function RiskBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  
  const getRiskColor = (pct: number) => {
    if (pct < 20) return "bg-chart-2";
    if (pct < 40) return "bg-chart-4";
    if (pct < 60) return "bg-chart-5";
    return "bg-destructive";
  };
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", getRiskColor(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">
        {percentage}%
      </span>
    </div>
  );
}
