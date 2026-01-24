import { CheckCircle, Clock, ExternalLink, RefreshCw, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrokerConnection } from "@/hooks/useBrokerConnection";

interface Broker {
  name: string;
  apiName: string;
  features: string[];
  status: "ready" | "coming_soon";
  color: string;
}

interface BrokerCardProps {
  broker: Broker;
  connection?: BrokerConnection;
  isSelected: boolean;
  onSelect: () => void;
  onConnect: () => void;
  onDisconnect: (connectionId: string) => void;
  onRefresh: (connectionId: string) => void;
  isLoading?: boolean;
}

export function BrokerCard({
  broker,
  connection,
  isSelected,
  onSelect,
  onConnect,
  onDisconnect,
  onRefresh,
  isLoading,
}: BrokerCardProps) {
  const isConnected = connection?.is_active;
  const isExpired = connection?.token_expiry 
    ? new Date(connection.token_expiry) < new Date() 
    : false;

  return (
    <div
      onClick={() => broker.status === "ready" && onSelect()}
      className={`p-4 rounded-xl border transition-all ${
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-secondary hover:bg-secondary/80"
      } ${broker.status === "ready" ? "cursor-pointer" : "opacity-60"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${broker.color} flex items-center justify-center`}>
            <span className="text-lg font-bold text-white">{broker.name[0]}</span>
          </div>
          <div>
            <p className="text-foreground font-medium">{broker.name}</p>
            <p className="text-xs text-muted-foreground">{broker.apiName}</p>
          </div>
        </div>
        {broker.status === "ready" ? (
          isConnected ? (
            <span className={`flex items-center gap-1 text-xs ${isExpired ? 'text-amber-500' : 'text-emerald-500'}`}>
              <CheckCircle className="w-3 h-3" />
              {isExpired ? 'Expired' : 'Connected'}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <CheckCircle className="w-3 h-3" />
              Ready
            </span>
          )
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Soon
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1">
        {broker.features.slice(0, 3).map((feature, idx) => (
          <span
            key={idx}
            className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-muted-foreground"
          >
            {feature}
          </span>
        ))}
      </div>

      {broker.status === "ready" && (
        <div className="mt-3 space-y-2">
          {isConnected ? (
            <div className="flex gap-2">
              {isExpired && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefresh(connection.id);
                  }}
                  disabled={isLoading}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reconnect
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDisconnect(connection.id);
                }}
                disabled={isLoading}
              >
                <Unlink className="w-3 h-3 mr-1" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onConnect();
              }}
              disabled={isLoading}
            >
              Connect
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
