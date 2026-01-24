import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, AlertTriangle, Loader2, CheckCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBrokerConnection, BrokerName } from "@/hooks/useBrokerConnection";

interface BrokerConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  broker: {
    name: string;
    apiName: string;
    color: string;
  } | null;
  onConnected?: () => void;
}

export function BrokerConnectionDialog({
  open,
  onOpenChange,
  broker,
  onConnected,
}: BrokerConnectionDialogProps) {
  const [step, setStep] = useState<"info" | "connecting" | "success" | "error">("info");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [authUrl, setAuthUrl] = useState<string>("");
  const { initiateOAuth, loading } = useBrokerConnection();

  const handleConnect = async () => {
    if (!broker) return;

    setStep("connecting");
    const brokerKey = broker.name.toLowerCase().replace(/\s+/g, "") as BrokerName;
    
    const result = await initiateOAuth(brokerKey);
    
    if (result) {
      setAuthUrl(result.auth_url);
      // Open OAuth URL in new window
      window.open(result.auth_url, "_blank", "width=600,height=700");
      setStep("success");
      onConnected?.();
    } else {
      setStep("error");
      setErrorMessage("Failed to initiate broker connection. Please ensure API credentials are configured.");
    }
  };

  const handleClose = () => {
    setStep("info");
    setErrorMessage("");
    setAuthUrl("");
    onOpenChange(false);
  };

  if (!broker) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${broker.color} flex items-center justify-center`}>
              <span className="text-lg font-bold text-white">{broker.name[0]}</span>
            </div>
            Connect {broker.name}
          </DialogTitle>
          <DialogDescription>
            Link your {broker.name} account via {broker.apiName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === "info" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You'll be redirected to {broker.name} to authorize access. We never store your login credentials.
                </AlertDescription>
              </Alert>

              <div className="bg-secondary rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">What we'll access:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• View your portfolio and positions</li>
                  <li>• Place and manage orders</li>
                  <li>• Access market data</li>
                  <li>• View order history</li>
                </ul>
              </div>

              <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-200">
                  <strong>Risk Warning:</strong> Live trading involves real money. Ensure you understand the risks before connecting.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleConnect} 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect to {broker.name}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {step === "connecting" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Initiating connection...</p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
              <div>
                <h3 className="font-medium text-lg">Authorization Started</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete the login in the opened window to finish connecting your account.
                </p>
              </div>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </motion.div>
          )}

          {step === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setStep("info")} className="flex-1">
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
