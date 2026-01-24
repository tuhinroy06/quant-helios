import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, TrendingDown, Calculator, Shield, Info } from "lucide-react";
import { formatINRSimple, getStockBySymbol } from "@/lib/indian-stocks";
import { useAlphaVantagePrices } from "@/hooks/useAlphaVantagePrices";
import { useTransactionCosts } from "@/hooks/useTransactionCosts";
import { usePositionSizing } from "@/hooks/usePositionSizing";
import { useSafetyMode } from "@/hooks/useSafetyMode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ConnectionStatus } from "./ConnectionStatus";

interface QuickTradePanelProps {
  symbol: string;
  accountId: string;
  currentBalance: number;
  onTradeComplete: () => void;
}

interface TransactionCostBreakdown {
  brokerage: number;
  stt: number;
  exchange_txn_charge: number;
  gst: number;
  sebi_charge: number;
  stamp_duty: number;
  total_charges: number;
  gross_value: number;
  net_value: number;
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
  const [useAutoSize, setUseAutoSize] = useState(false);
  const [showCosts, setShowCosts] = useState(true);

  // Transaction costs
  const { calculateCosts, loading: costsLoading } = useTransactionCosts();
  const [costBreakdown, setCostBreakdown] = useState<TransactionCostBreakdown | null>(null);

  // Position sizing
  const { calculate: calculateSize, loading: sizingLoading } = usePositionSizing(accountId);

  // Safety mode
  const { status: safetyStatus, applyLimits } = useSafetyMode(accountId);

  // Alpha Vantage prices (replaces WebSocket)
  const { prices, loading: pricesLoading, isDataFresh } = useAlphaVantagePrices({
    symbols: symbol ? [symbol] : [],
    enabled: !!symbol,
  });

  const stockInfo = getStockBySymbol(symbol);
  const currentPrice = prices[symbol]?.price || stockInfo?.price || 0;
  const changePercent = prices[symbol]?.changePercent || 0;
  const isPositive = changePercent >= 0;

  const tradeValue = currentPrice * quantity;
  const totalCost = costBreakdown ? tradeValue + costBreakdown.total_charges : tradeValue;
  const canAfford = totalCost <= currentBalance;

  // Calculate transaction costs when quantity or price changes
  useEffect(() => {
    if (quantity > 0 && currentPrice > 0) {
      calculateCosts(quantity, currentPrice, "buy").then((result) => {
        if (result) setCostBreakdown(result);
      });
    }
  }, [quantity, currentPrice, calculateCosts]);

  // Auto-calculate position size when stop loss changes
  useEffect(() => {
    if (useAutoSize && stopLoss && currentPrice > 0) {
      const sl = parseFloat(stopLoss);
      if (!isNaN(sl) && sl > 0 && sl < currentPrice) {
        calculateSize({
          account_capital: currentBalance,
          entry_price: currentPrice,
          stop_loss: sl,
          take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
        }).then((result) => {
          if (result) {
            setQuantity(result.quantity);
          }
        });
      }
    }
  }, [useAutoSize, stopLoss, takeProfit, currentPrice, currentBalance, calculateSize]);

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

  // Calculate R:R ratio
  const riskRewardRatio = useMemo(() => {
    if (!stopLoss || !takeProfit) return null;
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    if (isNaN(sl) || isNaN(tp)) return null;
    
    const riskDistance = Math.abs(currentPrice - sl);
    const rewardDistance = Math.abs(tp - currentPrice);
    return riskDistance > 0 ? (rewardDistance / riskDistance).toFixed(2) : null;
  }, [stopLoss, takeProfit, currentPrice]);

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
      toast.error("Insufficient balance (including transaction costs)");
      return;
    }

    setIsSubmitting(true);

    try {
      // Apply safety mode limits if active
      let finalQuantity = quantity;
      if (safetyStatus?.enabled) {
        const { data: positionsCount } = await supabase
          .from("paper_positions")
          .select("id", { count: "exact" })
          .eq("account_id", accountId)
          .eq("status", "open");

        const limits = await applyLimits(quantity, positionsCount?.length || 0);
        if (limits && !limits.can_open_position) {
          toast.error(`Safety mode: Max ${limits.max_positions} positions allowed`);
          setIsSubmitting(false);
          return;
        }
        if (limits && limits.adjusted_quantity !== quantity) {
          finalQuantity = limits.adjusted_quantity;
          toast.info(`Safety mode: Quantity reduced to ${finalQuantity}`);
        }
      }

      // Calculate final costs
      const finalCosts = await calculateCosts(finalQuantity, currentPrice, side);
      const totalCharges = finalCosts?.total_charges || 0;

      // Insert position with fee info
      const { error: positionError } = await supabase
        .from("paper_positions")
        .insert({
          user_id: user.id,
          account_id: accountId,
          symbol,
          side,
          quantity: finalQuantity,
          entry_price: currentPrice,
          stop_loss: sl,
          take_profit: tp,
          status: "open",
          market: "NSE",
        });

      if (positionError) throw positionError;

      // Update balance for buys (deduct trade value + costs)
      if (side === "buy") {
        const newBalance = currentBalance - (currentPrice * finalQuantity) - totalCharges;
        const { error: balanceError } = await supabase
          .from("paper_accounts")
          .update({ current_balance: newBalance })
          .eq("id", accountId);

        if (balanceError) throw balanceError;
      }

      // Log the trade with costs for paper_trades tracking
      await supabase.from("paper_trade_logs").insert({
        user_id: user.id,
        event_type: "TRADE_OPENED",
        message: `${side.toUpperCase()} ${finalQuantity} ${symbol} @ ${formatINRSimple(currentPrice)}`,
        metadata: {
          symbol,
          side,
          quantity: finalQuantity,
          entry_price: currentPrice,
          stop_loss: sl,
          take_profit: tp,
          transaction_costs: totalCharges,
          safety_mode_active: safetyStatus?.enabled || false,
        },
      });

      toast.success(
        <div className="space-y-1">
          <p>{side.toUpperCase()} order placed: {finalQuantity} {symbol}</p>
          <p className="text-xs text-muted-foreground">
            Entry: {formatINRSimple(currentPrice)} • Costs: {formatINRSimple(totalCharges)}
          </p>
        </div>
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
      {/* Header with price */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-foreground">{symbol}</span>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-sm ${
                isPositive ? "text-primary" : "text-destructive"
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
            </span>
            <ConnectionStatus loading={pricesLoading} isDataFresh={isDataFresh} />
          </div>
        </div>
        <motion.p 
          key={currentPrice}
          initial={{ scale: 1.02 }}
          animate={{ scale: 1 }}
          className="text-2xl font-semibold text-foreground"
        >
          {formatINRSimple(currentPrice)}
        </motion.p>
      </div>

      {/* Safety Mode Badge */}
      {safetyStatus?.enabled && (
        <div className="flex items-center gap-2 px-2 py-1.5 bg-accent/10 border border-accent/20 rounded-lg mb-3">
          <Shield className="w-3.5 h-3.5 text-accent-foreground" />
          <span className="text-xs text-accent-foreground">
            Safety Mode: {safetyStatus.days_remaining}d left • {Math.round((1 - safetyStatus.position_size_multiplier) * 100)}% size reduction
          </span>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {/* Auto Position Sizing Toggle */}
        <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Auto Position Size</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Automatically calculates quantity based on 1% risk per trade
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch checked={useAutoSize} onCheckedChange={setUseAutoSize} />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Quantity</Label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="mt-1"
            disabled={useAutoSize}
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

      {/* Trade Summary */}
      <div className="p-3 bg-secondary/50 rounded-lg mb-3 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Trade Value</span>
          <span className="font-medium text-foreground">{formatINRSimple(tradeValue)}</span>
        </div>

        {/* Transaction Costs */}
        {showCosts && costBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-1 pt-1 border-t border-border"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-between text-xs cursor-help">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Transaction Costs
                      <Info className="w-3 h-3" />
                    </span>
                    <span className="text-destructive">-{formatINRSimple(costBreakdown.total_charges)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-48">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Brokerage</span>
                      <span>{formatINRSimple(costBreakdown.brokerage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>STT</span>
                      <span>{formatINRSimple(costBreakdown.stt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exchange</span>
                      <span>{formatINRSimple(costBreakdown.exchange_txn_charge)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST</span>
                      <span>{formatINRSimple(costBreakdown.gst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SEBI</span>
                      <span>{formatINRSimple(costBreakdown.sebi_charge)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stamp</span>
                      <span>{formatINRSimple(costBreakdown.stamp_duty)}</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}

        <div className="flex justify-between text-sm pt-1 border-t border-border">
          <span className="text-muted-foreground">Total Required</span>
          <span className={`font-medium ${canAfford ? "text-foreground" : "text-destructive"}`}>
            {formatINRSimple(totalCost)}
          </span>
        </div>

        {risk && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Risk Amount</span>
              <span className="text-foreground">{formatINRSimple(risk.totalRisk)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Risk %</span>
              <span className={risk.riskPercent <= 2 ? "text-primary" : "text-destructive"}>
                {risk.riskPercent.toFixed(2)}%
              </span>
            </div>
            {riskRewardRatio && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">R:R Ratio</span>
                <span className={parseFloat(riskRewardRatio) >= 2 ? "text-primary" : "text-foreground"}>
                  1:{riskRewardRatio}
                </span>
              </div>
            )}
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
            Risk exceeds 2% limit. {useAutoSize ? "Adjust stop loss closer to entry." : "Reduce quantity or adjust stop loss."}
          </p>
        </motion.div>
      )}

      {/* Trade Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
          disabled={isSubmitting || !stopLoss || (risk && !isRiskValid) || !canAfford}
          onClick={() => placeTrade("buy")}
        >
          {isSubmitting ? "..." : "BUY"}
        </Button>
        <Button
          variant="outline"
          className="bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20"
          disabled={isSubmitting || !stopLoss || (risk && !isRiskValid)}
          onClick={() => placeTrade("sell")}
        >
          {isSubmitting ? "..." : "SELL"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Max 2% risk • Realistic transaction costs included
      </p>
    </div>
  );
};
