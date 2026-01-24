import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiskCalculator } from "./RiskCalculator";
import { INDIAN_STOCKS, formatINRSimple } from "@/lib/indian-stocks";
import { AlertCircle, Loader2, Calculator, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTransactionCosts } from "@/hooks/useTransactionCosts";
import { usePositionSizing } from "@/hooks/usePositionSizing";

interface TradeFormProps {
  accountBalance: number;
  accountId?: string;
  onSubmit: (trade: {
    symbol: string;
    side: "buy" | "sell";
    quantity: number;
    entry_price: number;
    stop_loss: number;
    take_profit?: number;
    transaction_costs?: number;
  }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const TradeForm = ({
  accountBalance,
  accountId,
  onSubmit,
  isSubmitting,
  onCancel,
}: TradeFormProps) => {
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [error, setError] = useState("");
  const [useAutoSize, setUseAutoSize] = useState(false);

  // Transaction costs and position sizing
  const { calculateCosts } = useTransactionCosts();
  const { calculate: calculateSize } = usePositionSizing(accountId);
  const [transactionCosts, setTransactionCosts] = useState(0);

  // Auto-fill entry price when symbol changes
  useEffect(() => {
    if (symbol) {
      const stock = INDIAN_STOCKS.find((s) => s.symbol === symbol);
      if (stock) {
        setEntryPrice(stock.price.toString());
      }
    }
  }, [symbol]);

  // Calculate transaction costs
  useEffect(() => {
    const qty = parseFloat(quantity);
    const price = parseFloat(entryPrice);
    if (qty > 0 && price > 0) {
      calculateCosts(qty, price, side).then((result) => {
        if (result) {
          setTransactionCosts(result.total_charges);
        }
      });
    }
  }, [quantity, entryPrice, side, calculateCosts]);

  // Auto position sizing
  useEffect(() => {
    if (useAutoSize && entryPrice && stopLoss) {
      const entry = parseFloat(entryPrice);
      const sl = parseFloat(stopLoss);
      const tp = takeProfit ? parseFloat(takeProfit) : undefined;

      if (entry > 0 && sl > 0) {
        calculateSize({
          account_capital: accountBalance,
          entry_price: entry,
          stop_loss: sl,
          take_profit: tp,
        }).then((result) => {
          if (result) {
            setQuantity(result.quantity.toString());
          }
        });
      }
    }
  }, [useAutoSize, entryPrice, stopLoss, takeProfit, accountBalance, calculateSize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!symbol || !quantity || !entryPrice || !stopLoss) {
      setError("Please fill in all required fields");
      return;
    }

    const entryNum = parseFloat(entryPrice);
    const slNum = parseFloat(stopLoss);
    const qtyNum = parseFloat(quantity);
    const tpNum = takeProfit ? parseFloat(takeProfit) : undefined;

    // Validate stop loss direction
    if (side === "buy" && slNum >= entryNum) {
      setError("For buy orders, stop loss must be below entry price");
      return;
    }
    if (side === "sell" && slNum <= entryNum) {
      setError("For sell orders, stop loss must be above entry price");
      return;
    }

    // Validate take profit direction
    if (tpNum) {
      if (side === "buy" && tpNum <= entryNum) {
        setError("For buy orders, take profit must be above entry price");
        return;
      }
      if (side === "sell" && tpNum >= entryNum) {
        setError("For sell orders, take profit must be below entry price");
        return;
      }
    }

    // Check risk
    const totalRisk = Math.abs(entryNum - slNum) * qtyNum;
    const riskPercent = (totalRisk / accountBalance) * 100;
    if (riskPercent > 2) {
      setError(`Risk exceeds 2% limit (${riskPercent.toFixed(2)}%). Reduce position size or adjust stop loss.`);
      return;
    }

    // Check balance (including transaction costs)
    const tradeValue = entryNum * qtyNum;
    const totalRequired = tradeValue + transactionCosts;
    if (totalRequired > accountBalance) {
      setError(`Insufficient virtual balance. Need ${formatINRSimple(totalRequired)} (includes ${formatINRSimple(transactionCosts)} in fees)`);
      return;
    }

    try {
      await onSubmit({
        symbol,
        side,
        quantity: qtyNum,
        entry_price: entryNum,
        stop_loss: slNum,
        take_profit: tpNum,
        transaction_costs: transactionCosts,
      });
    } catch (err: any) {
      setError(err.message || "Failed to place trade");
    }
  };

  const entryNum = parseFloat(entryPrice) || 0;
  const slNum = parseFloat(stopLoss) || 0;
  const qtyNum = parseFloat(quantity) || 0;
  const tradeValue = entryNum * qtyNum;
  const totalRequired = tradeValue + transactionCosts;

  // Calculate R:R ratio
  const riskRewardRatio = useMemo(() => {
    const tp = parseFloat(takeProfit);
    if (!entryNum || !slNum || !tp) return null;
    const riskDistance = Math.abs(entryNum - slNum);
    const rewardDistance = Math.abs(tp - entryNum);
    return riskDistance > 0 ? (rewardDistance / riskDistance).toFixed(2) : null;
  }, [entryNum, slNum, takeProfit]);

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Simulate a Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Stock Symbol *</Label>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger id="symbol">
                  <SelectValue placeholder="Select stock" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STOCKS.map((stock) => (
                    <SelectItem key={stock.symbol} value={stock.symbol}>
                      {stock.symbol} - {stock.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="side">Side *</Label>
              <Select value={side} onValueChange={(v) => setSide(v as "buy" | "sell")}>
                <SelectTrigger id="side">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy (Long)</SelectItem>
                  <SelectItem value="sell">Sell (Short)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto Position Sizing */}
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Auto Position Sizing (1% risk)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      Automatically calculates the optimal quantity based on your stop loss and 1% risk per trade.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch checked={useAutoSize} onCheckedChange={setUseAutoSize} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 10"
                disabled={useAutoSize}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_price">Entry Price (₹) *</Label>
              <Input
                id="entry_price"
                type="number"
                min="0.01"
                step="0.01"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="e.g., 2850"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stop_loss" className="flex items-center gap-1">
                Stop Loss (₹) *
                <span className="text-xs text-muted-foreground">(mandatory)</span>
              </Label>
              <Input
                id="stop_loss"
                type="number"
                min="0.01"
                step="0.01"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder={side === "buy" ? "Below entry" : "Above entry"}
              />
              <p className="text-xs text-muted-foreground">
                Stop loss protects your capital. Every trade must have one.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="take_profit">Take Profit (₹)</Label>
              <Input
                id="take_profit"
                type="number"
                min="0.01"
                step="0.01"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder={side === "buy" ? "Above entry" : "Below entry"}
              />
              <p className="text-xs text-muted-foreground">Optional target price</p>
            </div>
          </div>

          {/* Trade Summary with Costs */}
          {entryNum > 0 && qtyNum > 0 && (
            <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trade Value</span>
                <span className="text-foreground font-medium">{formatINRSimple(tradeValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction Costs</span>
                <span className="text-destructive">-{formatINRSimple(transactionCosts)}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-border">
                <span className="text-muted-foreground">Total Required</span>
                <span className={`font-medium ${totalRequired <= accountBalance ? "text-foreground" : "text-destructive"}`}>
                  {formatINRSimple(totalRequired)}
                </span>
              </div>
              {riskRewardRatio && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk:Reward</span>
                  <span className={parseFloat(riskRewardRatio) >= 2 ? "text-primary" : "text-foreground"}>
                    1:{riskRewardRatio}
                  </span>
                </div>
              )}
            </div>
          )}

          {entryNum > 0 && slNum > 0 && qtyNum > 0 && (
            <RiskCalculator
              entryPrice={entryNum}
              stopLoss={slNum}
              quantity={qtyNum}
              accountBalance={accountBalance}
              side={side}
            />
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing Trade...
                </>
              ) : (
                "Place Paper Trade"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Realistic simulation with India-specific transaction costs (STT, GST, SEBI fees)
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
