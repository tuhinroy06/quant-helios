import { motion } from "framer-motion";
import { Wifi, WifiOff, Loader2, Clock, AlertTriangle } from "lucide-react";

interface ConnectionStatusProps {
  loading?: boolean;
  isDataFresh?: boolean;
  error?: string | null;
  lastUpdated?: Date | null;
  // Legacy props for backward compatibility during migration
  connected?: boolean;
  connecting?: boolean;
}

export const ConnectionStatus = ({
  loading = false,
  isDataFresh,
  error,
  lastUpdated,
  // Legacy props
  connected,
  connecting,
}: ConnectionStatusProps) => {
  // Handle legacy props (connected/connecting) for backward compatibility
  const isLoading = loading || connecting;
  const hasError = !!error;
  
  // If using new API (isDataFresh), use that; otherwise fall back to connected
  const isFresh = isDataFresh !== undefined ? isDataFresh : connected;

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-destructive">
        <WifiOff className="w-3 h-3" />
        <span>Live Data Unavailable</span>
      </div>
    );
  }

  // No data yet state
  if (!isFresh && !lastUpdated) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-yellow-500">
        <AlertTriangle className="w-3 h-3" />
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {isFresh ? (
        <>
          <motion.span
            className="w-2 h-2 rounded-full bg-[hsl(142_71%_45%)]"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Wifi className="w-3 h-3 text-[hsl(142_71%_45%)]" />
          <span className="text-[hsl(142_71%_45%)] font-medium">LIVE</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <Clock className="w-3 h-3 text-yellow-500" />
          <span className="text-yellow-500">Stale</span>
        </>
      )}
      {lastUpdated && isFresh && (
        <span className="text-muted-foreground ml-1">
          {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      )}
    </div>
  );
};
