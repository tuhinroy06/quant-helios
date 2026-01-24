import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

interface MarketStatusBadgeProps {
  status: 'open' | 'closed' | 'pre-market' | 'post-market' | null;
  source?: 'alpha_vantage' | 'cache' | 'simulated' | null;
  showSource?: boolean;
  className?: string;
}

export const MarketStatusBadge = ({ 
  status, 
  source, 
  showSource = false,
  className = "" 
}: MarketStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return {
          label: 'Market Open',
          variant: 'default' as const,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10 border-green-500/20',
          pulse: true,
        };
      case 'pre-market':
        return {
          label: 'Pre-Market',
          variant: 'secondary' as const,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10 border-yellow-500/20',
          pulse: false,
        };
      case 'post-market':
        return {
          label: 'Post-Market',
          variant: 'secondary' as const,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10 border-orange-500/20',
          pulse: false,
        };
      case 'closed':
      default:
        return {
          label: 'Market Closed',
          variant: 'outline' as const,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/50 border-muted',
          pulse: false,
        };
    }
  };

  const getSourceLabel = () => {
    switch (source) {
      case 'alpha_vantage':
        return 'Live';
      case 'cache':
        return 'Cached';
      case 'simulated':
        return 'Simulated';
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  const sourceLabel = getSourceLabel();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={config.variant}
        className={`${config.bgColor} border text-xs font-medium`}
      >
        <Circle 
          className={`w-2 h-2 mr-1.5 fill-current ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} 
        />
        {config.label}
      </Badge>
      {showSource && sourceLabel && (
        <Badge variant="outline" className="text-xs">
          {sourceLabel}
        </Badge>
      )}
    </div>
  );
};
