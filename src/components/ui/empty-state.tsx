import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 rounded-2xl border-2 border-dashed border-border bg-card/30",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};
