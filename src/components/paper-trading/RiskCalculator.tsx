import { AlertTriangle, CheckCircle } from "lucide-react";

interface RiskCalculatorProps {
  entryPrice: number;
  stopLoss: number;
  quantity: number;
  accountBalance: number;
  side: "buy" | "sell";
}

export const RiskCalculator = ({
  entryPrice,
  stopLoss,
  quantity,
  accountBalance,
  side,
}: RiskCalculatorProps) => {
  if (!entryPrice || !stopLoss || !quantity || !accountBalance) {
    return null;
  }

  const riskPerShare = Math.abs(entryPrice - stopLoss);
  const totalRisk = riskPerShare * quantity;
  const riskPercent = (totalRisk / accountBalance) * 100;
  const tradeValue = entryPrice * quantity;

  const isWithinLimit = riskPercent <= 2;
  const hasValidStopLoss = side === "buy" 
    ? stopLoss < entryPrice 
    : stopLoss > entryPrice;

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
      <h4 className="text-sm font-medium text-foreground">Risk Analysis</h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Trade Value</p>
          <p className="font-medium">₹{tradeValue.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Risk per Share</p>
          <p className="font-medium">₹{riskPerShare.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total Risk</p>
          <p className="font-medium">₹{totalRisk.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Risk % of Account</p>
          <p className={`font-medium ${isWithinLimit ? "text-foreground" : "text-destructive"}`}>
            {riskPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-border space-y-2">
        {!hasValidStopLoss && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>
              Stop loss must be {side === "buy" ? "below" : "above"} entry price
            </span>
          </div>
        )}
        {hasValidStopLoss && !isWithinLimit && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Risk exceeds 2% limit. Reduce position size or adjust stop loss.</span>
          </div>
        )}
        {hasValidStopLoss && isWithinLimit && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Risk is within acceptable limits</span>
          </div>
        )}
      </div>
    </div>
  );
};
