import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HealthGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function HealthGauge({ 
  score, 
  size = "md", 
  showLabel = true,
  className 
}: HealthGaugeProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Calculate color based on score
  const getColor = (score: number): string => {
    if (score >= 80) return "hsl(var(--chart-2))"; // Green
    if (score >= 60) return "hsl(var(--chart-4))"; // Yellow/Orange
    if (score >= 40) return "hsl(var(--chart-5))"; // Orange
    return "hsl(var(--destructive))"; // Red
  };

  const sizeConfig = {
    sm: { diameter: 60, strokeWidth: 4, fontSize: "text-sm" },
    md: { diameter: 100, strokeWidth: 6, fontSize: "text-xl" },
    lg: { diameter: 140, strokeWidth: 8, fontSize: "text-3xl" },
  };

  const { diameter, strokeWidth, fontSize } = sizeConfig[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={getColor(normalizedScore)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold text-foreground", fontSize)}>
            {Math.round(normalizedScore)}
          </span>
          {size !== "sm" && (
            <span className="text-xs text-muted-foreground">/100</span>
          )}
        </div>
      )}
    </div>
  );
}
