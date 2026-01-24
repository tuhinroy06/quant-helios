import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Shield, Link2, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlobalKillSwitch } from "@/components/control-plane/GlobalKillSwitch";
import { ControlStatusSummary } from "@/components/control-plane/ControlStatusSummary";
import { useControlPlane } from "@/hooks/useControlPlane";
import { useBrokerConnection } from "@/hooks/useBrokerConnection";
import { BrokerCard } from "@/components/live-trading/BrokerCard";
import { BrokerConnectionDialog } from "@/components/live-trading/BrokerConnectionDialog";

interface Broker {
  name: string;
  apiName: string;
  features: string[];
  status: "ready" | "coming_soon";
  color: string;
}

const INDIAN_BROKERS: Broker[] = [
  {
    name: "Angel One",
    apiName: "SmartAPI",
    features: ["Options chain", "GTT orders", "Basket orders"],
    status: "ready",
    color: "bg-blue-500",
  },
  {
    name: "Zerodha",
    apiName: "Kite Connect",
    features: ["Market data", "Order placement", "Portfolio sync", "GTT orders"],
    status: "ready",
    color: "bg-orange-500",
  },
  {
    name: "Upstox",
    apiName: "Upstox Pro API",
    features: ["Realtime streaming", "Historical data", "Options trading"],
    status: "ready",
    color: "bg-purple-500",
  },
  {
    name: "ICICI Direct",
    apiName: "Breeze API",
    features: ["Equity", "F&O", "Currency trading"],
    status: "coming_soon",
    color: "bg-red-500",
  },
  {
    name: "5Paisa",
    apiName: "Open API",
    features: ["Trade execution", "Holdings", "Positions"],
    status: "coming_soon",
    color: "bg-teal-500",
  },
  {
    name: "Groww",
    apiName: "Partner API",
    features: ["Equity investing", "Mutual funds"],
    status: "coming_soon",
    color: "bg-emerald-500",
  },
];

const LiveTrading = () => {
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [brokerToConnect, setBrokerToConnect] = useState<Broker | null>(null);
  
  const { getStatus, status, loading } = useControlPlane();
  const { 
    connections, 
    fetchConnections, 
    disconnect, 
    refreshToken,
    loading: brokerLoading,
    getConnection
  } = useBrokerConnection();
  
  useEffect(() => {
    getStatus();
    fetchConnections();
  }, []);

  const handleConnect = (broker: Broker) => {
    setBrokerToConnect(broker);
    setConnectDialogOpen(true);
  };

  const handleDisconnect = async (connectionId: string) => {
    await disconnect(connectionId);
  };

  const handleRefresh = async (connectionId: string) => {
    await refreshToken(connectionId);
  };

  const getBrokerKey = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Link */}
          <Link
            to="/dashboard/overview"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-amber-500" />
            <h1 className="font-display text-3xl font-light text-foreground">
              Live Trading
            </h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Connect your broker and execute real trades • Supports major Indian brokers
          </p>

          {/* Supported Brokers */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
            <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Supported Indian Brokers
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDIAN_BROKERS.map((broker) => {
                const brokerKey = getBrokerKey(broker.name);
                const connection = connections.find(
                  c => c.broker_name === brokerKey && c.is_active
                );
                
                return (
                  <BrokerCard
                    key={broker.name}
                    broker={broker}
                    connection={connection}
                    isSelected={selectedBroker === broker.name}
                    onSelect={() => setSelectedBroker(broker.name)}
                    onConnect={() => handleConnect(broker)}
                    onDisconnect={handleDisconnect}
                    onRefresh={handleRefresh}
                    isLoading={brokerLoading}
                  />
                );
              })}
            </div>
          </div>

          {/* Global Kill Switch */}
          <div className="mb-6">
            <GlobalKillSwitch status={status} onStatusChange={() => getStatus()} />
          </div>
          
          {/* Control Status Summary */}
          <div className="mb-6">
            <ControlStatusSummary status={status} loading={loading} />
          </div>

          {/* Active Strategies */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
            <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Active Trading Strategies
            </h3>
            <div className="text-center py-8 text-muted-foreground">
              <p>No strategies are currently running in live mode.</p>
              <Link
                to="/dashboard/strategies"
                className="text-foreground underline mt-2 inline-block"
              >
                Configure a strategy for live trading
              </Link>
            </div>
          </div>

          {/* Safety Features */}
          <div className="bg-card/50 border border-border rounded-xl p-6 mb-6">
            <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Safety Features
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="text-foreground font-medium mb-1">Daily Loss Limit</h4>
                <p className="text-sm text-muted-foreground">
                  Auto-stop trading after reaching daily loss threshold
                </p>
                <p className="text-lg font-medium text-foreground mt-2">₹10,000</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="text-foreground font-medium mb-1">Max Position Size</h4>
                <p className="text-sm text-muted-foreground">
                  Maximum capital allocated per trade
                </p>
                <p className="text-lg font-medium text-foreground mt-2">₹50,000</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="text-foreground font-medium mb-1">Trading Hours</h4>
                <p className="text-sm text-muted-foreground">
                  Only trade during market hours (NSE/BSE)
                </p>
                <p className="text-lg font-medium text-foreground mt-2">9:15 AM - 3:30 PM</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="text-foreground font-medium mb-1">Order Confirmation</h4>
                <p className="text-sm text-muted-foreground">
                  Require confirmation for large orders
                </p>
                <p className="text-lg font-medium text-foreground mt-2">Enabled</p>
              </div>
            </div>
          </div>

          {/* Back to Dashboard */}
          <Link
            to="/dashboard/overview"
            className="group w-full flex items-center justify-center gap-3 bg-secondary text-foreground px-8 py-4 rounded-full text-base font-medium hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>

      {/* Connection Dialog */}
      <BrokerConnectionDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        broker={brokerToConnect}
        onConnected={() => {
          fetchConnections();
          setConnectDialogOpen(false);
        }}
      />
    </DashboardLayout>
  );
};

export default LiveTrading;
