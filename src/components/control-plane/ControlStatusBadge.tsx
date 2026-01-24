import { cn } from "@/lib/utils";
import { ControlState } from "@/hooks/useControlPlane";
import { AlertCircle, CheckCircle, Pause, StopCircle, XCircle } from "lucide-react";

interface ControlStatusBadgeProps {
  state: ControlState;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const stateConfig: Record<ControlState, { 
  label: string; 
  className: string; 
  Icon: typeof CheckCircle 
}> = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-500/20 text-green-500 border-green-500/30",
    Icon: CheckCircle
  },
  THROTTLED: {
    label: "Throttled",
    className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    Icon: Pause
  },
  FROZEN: {
    label: "Frozen",
    className: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    Icon: AlertCircle
  },
  KILLED: {
    label: "Killed",
    className: "bg-red-500/20 text-red-500 border-red-500/30",
    Icon: XCircle
  }
};

const sizeConfig = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5"
};

const iconSizeConfig = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5"
};

export function ControlStatusBadge({ 
  state, 
  size = "md", 
  showIcon = true 
}: ControlStatusBadgeProps) {
  const config = stateConfig[state];
  const Icon = config.Icon;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium",
      config.className,
      sizeConfig[size]
    )}>
      {showIcon && <Icon className={iconSizeConfig[size]} />}
      {config.label}
    </span>
  );
}
