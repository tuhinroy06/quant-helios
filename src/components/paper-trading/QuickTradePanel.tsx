import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { INDIAN_STOCKS, formatINRSimple } from "@/lib/indian-stocks";
import { useLivePrices } from "@/hooks/useLivePrices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface QuickTradePanelProps {
  symbol: string;
  accountId: string;
  currentBalance: number;
  onTradeComplete: () => void;
}

export const QuickTradePanel = ({
  symbol,
  accountId,
  currentBalance,
  onTradeComplete,
}: QuickTradePanelProps) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { prices } = useLivePrices({
    symbols: [symbol],
    refreshInterval: 5000,
    enabled: !!symbol,
  });

  const stockInfo = INDIAN_STOCKS.find((s) => s.symbol === symbol);
  const currentPrice = prices[symbol]?.price || stockInfo?.price || 0;
  const changePercent = prices[symbol]?.changePercent || 0;
  const isPositive = changePercent >= 0;

  const tradeValue = currentPrice * quantity;
  const canAfford = tradeValue <= currentBalance;

  const calculateRisk = () => {
    if (!stopLoss) return null;
    const sl = parseFloat(stopLoss);
    if (isNaN(sl) || sl <= 0) return null;
    
    const riskPerShare = Math.abs(currentPrice - sl);
    const totalRisk = riskPerShare * quantity;
    const riskPercent = (totalRisk / currentBalance) * 100;
    
    return { riskPerShare, totalRisk, riskPercent };
  };

  const risk = calculateRisk();
  const isRiskValid = risk ? risk.riskPercent <= 2 : false;

  const placeTrade = async (side: "buy" | "sell") => {
    if (!user || !accountId || !symbol) {
      toast.error("Invalid trade parameters");
      return;
    }

    if (!stopLoss) {
      toast.error("Stop loss is required");
      return;
    }

    const sl = parseFloat(stopLoss);
    const tp = takeProfit ? parseFloat(takeProfit) : null;

    if (side === "buy" && sl >= currentPrice) {
      toast.error("Stop loss must be below entry price for buy orders");
      return;
    }

    if (side === "sell" && sl <= currentPrice) {
      toast.error("Stop loss must be above entry price for sell orders");
      return;
    }

    if (risk && risk.riskPercent > 2) {
      toast.error("Risk cannot exceed 2% of account balance");
      return;
    }

    if (side === "buy" && !canAfford) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert position
      const { error: positionError } = await supabase
        .from("paper_positions")
        .insert({
          user_id: user.id,
          account_id: accountId,
          symbol,
          side,
          quantity,
          entry_price: currentPrice,
          stop_loss: sl,
          take_profit: tp,
          status: "open",
          market: "NSE",
        });

      if (positionError) throw positionError;

      // Update balance for buys
      if (side === "buy") {
        const newBalance = currentBalance - tradeValue;
        const { error: balanceError } = await supabase
          .from("paper_accounts")
          .update({ current_balance: newBalance })
          .eq("id", accountId);

        if (balanceError) throw balanceError;
      }

      toast.success(
        `${side.toUpperCase()} order placed: ${quantity} ${symbol} at ${formatINRSimple(currentPrice)}`
      );
      setQuantity(1);
      setStopLoss("");
      setTakeProfit("");
      onTradeComplete();
    } catch (error) {
      console.error("Trade error:", error);
      toast.error("Failed to place trade");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!symbol) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <p className="text-center text-muted-foreground">
          Select a stock to trade
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-foreground">{symbol}</span>
          <span
            className={`flex items-center gap-1 text-sm ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
          </span>
        </div>
        <p className="text-2xl font-semibold text-foreground">
          {formatINRSimple(currentPrice)}
        </p>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <Label className="text-xs text-muted-foreground">Quantity</Label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Stop Loss *</Label>
            <Input
              type="number"
              placeholder="Required"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Take Profit</Label>
            <Input
              type="number"
              placeholder="Optional"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Trade Value */}
      <div className="p-3 bg-secondary/50 rounded-lg mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Trade Value</span>
          <span className={`font-medium ${canAfford ? "text-foreground" : "text-destructive"}`}>
            {formatINRSimple(tradeValue)}
          </span>
        </div>
        {risk && (
          <>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Risk Amount</span>
              <span className="text-foreground">{formatINRSimple(risk.totalRisk)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Risk %</span>
              <span className={risk.riskPercent <= 2 ? "text-green-500" : "text-destructive"}>
                {risk.riskPercent.toFixed(2)}%
              </span>
            </div>
          </>
        )}
      </div>

      {/* Risk Warning */}
      {risk && risk.riskPercent > 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-3"
        >
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">
            Risk exceeds 2% limit. Reduce quantity or adjust stop loss.
          </p>
        </motion.div>
      )}

      {/* Trade Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20 hover:text-green-600"
          disabled={isSubmitting || !stopLoss || (risk && !isRiskValid) || !canAfford}
          onClick={() => placeTrade("buy")}
        >
          {isSubmitting ? "..." : "BUY"}
        </Button>
        <Button
          variant="outline"
          className="bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20 hover:text-red-600"
          disabled={isSubmitting || !stopLoss || (risk && !isRiskValid)}
          onClick={() => placeTrade("sell")}
        >
          {isSubmitting ? "..." : "SELL"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Max 2% risk per trade enforced
      </p>
    </div>
  );
};
