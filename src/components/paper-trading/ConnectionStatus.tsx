import { motion } from "framer-motion";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface ConnectionStatusProps {
  connected: boolean;
  connecting?: boolean;
  error?: string | null;
  lastUpdated?: Date | null;
}

export const ConnectionStatus = ({
  connected,
  connecting = false,
  error,
  lastUpdated,
}: ConnectionStatusProps) => {
  if (connecting) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-destructive">
        <WifiOff className="w-3 h-3" />
        <span>Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {connected ? (
        <>
          <motion.span
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Wifi className="w-3 h-3 text-green-500" />
          <span className="text-green-500 font-medium">LIVE</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <WifiOff className="w-3 h-3 text-yellow-500" />
          <span className="text-yellow-500">Delayed</span>
        </>
      )}
      {lastUpdated && connected && (
        <span className="text-muted-foreground ml-1">
          {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      )}
    </div>
  );
};
