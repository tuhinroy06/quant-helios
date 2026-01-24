import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useControlPlane, ControlStatus } from "@/hooks/useControlPlane";
import { ControlStatusBadge } from "./ControlStatusBadge";
import { useAuth } from "@/contexts/AuthContext";

interface GlobalKillSwitchProps {
  status: ControlStatus | null;
  onStatusChange?: () => void;
}

export function GlobalKillSwitch({ status, onStatusChange }: GlobalKillSwitchProps) {
  const { activateGlobalKill, resetGlobalKill, loading } = useControlPlane();
  const { user } = useAuth();
  const [showKillDialog, setShowKillDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [reason, setReason] = useState("");
  
  const isGlobalKilled = status?.global_killed ?? false;
  
  const handleKill = async () => {
    if (!reason.trim()) return;
    
    try {
      await activateGlobalKill(reason);
      setShowKillDialog(false);
      setReason("");
      onStatusChange?.();
    } catch (error) {
      console.error("Failed to activate kill switch:", error);
    }
  };
  
  const handleReset = async () => {
    if (!reason.trim() || !user) return;
    
    try {
      await resetGlobalKill(user.id, reason);
      setShowResetDialog(false);
      setReason("");
      onStatusChange?.();
    } catch (error) {
      console.error("Failed to reset kill switch:", error);
    }
  };
  
  return (
    <div className="bg-card/50 border border-border rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StopCircle className={`w-6 h-6 ${isGlobalKilled ? 'text-red-500' : 'text-muted-foreground'}`} />
          <div>
            <h3 className="text-foreground font-medium flex items-center gap-2">
              Global Kill Switch
              <ControlStatusBadge 
                state={isGlobalKilled ? "KILLED" : "ACTIVE"} 
                size="sm" 
              />
            </h3>
            <p className="text-muted-foreground text-sm">
              {isGlobalKilled 
                ? "All trading is halted. Manual reset required."
                : "Immediately halt all automated trading"
              }
            </p>
          </div>
        </div>
        
        {isGlobalKilled ? (
          <Button 
            variant="outline"
            onClick={() => setShowResetDialog(true)}
            disabled={loading}
            className="border-green-500/50 text-green-500 hover:bg-green-500/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset System
          </Button>
        ) : (
          <motion.button
            onClick={() => setShowKillDialog(true)}
            disabled={loading}
            className="px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
          >
            STOP ALL TRADING
          </motion.button>
        )}
      </div>
      
      {/* Kill Confirmation Dialog */}
      <AlertDialog open={showKillDialog} onOpenChange={setShowKillDialog}>
        <AlertDialogContent className="bg-background border-red-500/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Activate Global Kill Switch
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately halt ALL trading across all strategies, users, and brokers.
              This action requires manual reset by an administrator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Reason for emergency stop..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-secondary"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKill}
              disabled={!reason.trim() || loading}
              className="bg-red-500 hover:bg-red-600"
            >
              {loading ? "Activating..." : "CONFIRM KILL"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Reset Global Kill Switch
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will re-enable trading across the entire system.
              Ensure all issues have been resolved before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Justification for reset..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-secondary"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={!reason.trim() || loading}
              className="bg-green-500 hover:bg-green-600"
            >
              {loading ? "Resetting..." : "Confirm Reset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
