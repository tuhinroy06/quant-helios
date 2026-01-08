import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  className,
  delay = 0,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "group relative bg-card border border-border rounded-2xl p-6 card-hover",
        className
      )}
    >
      {/* Warm accent on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-warm-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-5 group-hover:bg-warm-500/10 transition-colors duration-300">
            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-warm-500 transition-colors duration-300" />
          </div>
        )}
        
        <p className="text-3xl font-medium text-foreground mb-1 tracking-tight">
          {value}
        </p>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          
          {trend && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                trend.isPositive
                  ? "status-success"
                  : "status-error"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
