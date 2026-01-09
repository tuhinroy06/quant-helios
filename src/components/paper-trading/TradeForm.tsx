import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiskCalculator } from "./RiskCalculator";
import { INDIAN_STOCKS } from "@/lib/indian-stocks";
import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TradeFormProps {
  accountBalance: number;
  onSubmit: (trade: {
    symbol: string;
    side: "buy" | "sell";
    quantity: number;
    entry_price: number;
    stop_loss: number;
    take_profit?: number;
  }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const TradeForm = ({
  accountBalance,
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

    // Check balance
    const tradeValue = entryNum * qtyNum;
    if (tradeValue > accountBalance) {
      setError("Insufficient virtual balance for this trade");
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
      });
    } catch (err: any) {
      setError(err.message || "Failed to place trade");
    }
  };

  const entryNum = parseFloat(entryPrice) || 0;
  const slNum = parseFloat(stopLoss) || 0;
  const qtyNum = parseFloat(quantity) || 0;

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
            This trade uses virtual funds only. No real money is involved.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
