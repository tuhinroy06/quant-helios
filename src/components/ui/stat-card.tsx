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
        "group relative bg-card border border-border rounded-2xl p-6 hover:border-border/60 transition-all duration-300",
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4">
            <Icon className="w-5 h-5 text-foreground/70" />
          </div>
        )}
        
        <p className="text-3xl font-light text-foreground mb-1 tracking-tight">
          {value}
        </p>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          
          {trend && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                trend.isPositive
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
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
