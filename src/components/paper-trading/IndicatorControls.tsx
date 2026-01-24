import { Activity, TrendingUp, Waves, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IndicatorSettings {
  sma20: boolean;
  ema50: boolean;
  bollinger: boolean;
  rsi: boolean;
  macd: boolean;
}

interface IndicatorControlsProps {
  indicators: IndicatorSettings;
  onToggle: (indicator: keyof IndicatorSettings) => void;
}

const indicatorConfig = [
  { key: "sma20" as const, label: "SMA 20", icon: TrendingUp, color: "text-yellow-500" },
  { key: "ema50" as const, label: "EMA 50", icon: TrendingUp, color: "text-purple-500" },
  { key: "bollinger" as const, label: "BB", icon: Waves, color: "text-cyan-500" },
  { key: "rsi" as const, label: "RSI", icon: Activity, color: "text-orange-500" },
  { key: "macd" as const, label: "MACD", icon: BarChart2, color: "text-pink-500" },
];

export const IndicatorControls = ({ indicators, onToggle }: IndicatorControlsProps) => {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {indicatorConfig.map(({ key, label, icon: Icon, color }) => (
        <button
          key={key}
          onClick={() => onToggle(key)}
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all",
            indicators[key]
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
          title={`Toggle ${label}`}
        >
          <Icon className={cn("w-3 h-3", indicators[key] && color)} />
          {label}
        </button>
      ))}
    </div>
  );
};
