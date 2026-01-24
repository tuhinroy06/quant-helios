import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Target, Shield, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { usePositionSizing } from "@/hooks/usePositionSizing";
import { formatINRSimple } from "@/lib/indian-stocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PositionSizingCalculatorProps {
  accountId?: string;
  accountCapital: number;
  defaultPrice?: number;
  onCalculate?: (quantity: number, riskAmount: number) => void;
}

export const PositionSizingCalculator = ({
  accountId,
  accountCapital,
  defaultPrice = 1000,
  onCalculate,
}: PositionSizingCalculatorProps) => {
  const { calculate, getConfig, config, loading } = usePositionSizing(accountId);

  const [entryPrice, setEntryPrice] = useState(defaultPrice.toString());
  const [stopLoss, setStopLoss] = useState((defaultPrice * 0.97).toFixed(2));
  const [takeProfit, setTakeProfit] = useState((defaultPrice * 1.06).toFixed(2));
  const [atr, setAtr] = useState("");
  const [confidence, setConfidence] = useState("0.8");
  const [useATR, setUseATR] = useState(false);
  const [useConfidence, setUseConfidence] = useState(false);

  const [result, setResult] = useState<{
    quantity: number;
    position_value: number;
    risk_amount: number;
    stop_distance: number;
    stop_distance_pct: number;
    risk_reward_ratio: number | null;
    adjustments: {
      volatility_applied: boolean;
      volatility_factor: number;
      confidence_applied: boolean;
      confidence_factor: number;
    };
    limits: {
      was_clamped: boolean;
      clamp_reason: string | null;
    };
  } | null>(null);

  useEffect(() => {
    getConfig();
  }, [getConfig]);

  const handleCalculate = async () => {
    const sizing = await calculate({
      account_capital: accountCapital,
      entry_price: parseFloat(entryPrice),
      stop_loss: parseFloat(stopLoss),
      take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
      atr: useATR && atr ? parseFloat(atr) : undefined,
      confidence: useConfidence ? parseFloat(confidence) : undefined,
    });

    if (sizing) {
      setResult(sizing);
      onCalculate?.(sizing.quantity, sizing.risk_amount);
    }
  };

  const stopDistancePct = useMemo(() => {
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    if (!entry || !stop) return 0;
    return ((entry - stop) / entry) * 100;
  }, [entryPrice, stopLoss]);

  const riskRewardRatio = useMemo(() => {
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    const target = parseFloat(takeProfit);
    if (!entry || !stop || !target) return null;
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    return risk > 0 ? (reward / risk).toFixed(2) : null;
  }, [entryPrice, stopLoss, takeProfit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Calculator className="w-4 h-4 text-primary" />
        <h3 className="font-medium text-foreground text-sm">Position Sizing Calculator</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Risk-based position sizing with ATR volatility adjustment and confidence weighting.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="p-4 space-y-4">
        {/* Config display */}
        {config && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
            <span>Risk/Trade: <strong className="text-foreground">{config.risk_per_trade_pct}%</strong></span>
            <span>Min: <strong className="text-foreground">{formatINRSimple(config.min_position_size)}</strong></span>
            <span>Max: <strong className="text-foreground">{formatINRSimple(config.max_position_size)}</strong></span>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Entry Price</Label>
            <Input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Stop Loss</Label>
            <Input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Take Profit (optional)</Label>
            <Input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Account Capital</Label>
            <Input
              type="text"
              value={formatINRSimple(accountCapital)}
              disabled
              className="h-9 bg-secondary"
            />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={useATR} onCheckedChange={setUseATR} />
              <Label className="text-xs">Use ATR for Volatility</Label>
            </div>
            {useATR && (
              <Input
                type="number"
                placeholder="ATR"
                value={atr}
                onChange={(e) => setAtr(e.target.value)}
                className="w-24 h-7 text-xs"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={useConfidence} onCheckedChange={setUseConfidence} />
              <Label className="text-xs">Confidence Weighting</Label>
            </div>
            {useConfidence && (
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="1"
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
                className="w-24 h-7 text-xs"
              />
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Stop Distance:</span>
            <span className={`font-medium ${stopDistancePct > 5 ? "text-accent-foreground" : "text-foreground"}`}>
              {stopDistancePct.toFixed(2)}%
            </span>
          </div>
          {riskRewardRatio && (
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">R:R Ratio:</span>
              <span className={`font-medium ${parseFloat(riskRewardRatio) >= 2 ? "text-primary" : "text-foreground"}`}>
                1:{riskRewardRatio}
              </span>
            </div>
          )}
        </div>

        <Button onClick={handleCalculate} className="w-full" disabled={loading}>
          Calculate Position Size
        </Button>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-border pt-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">{result.quantity}</div>
                <div className="text-xs text-muted-foreground">Shares to Buy</div>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <div className="text-xl font-semibold text-foreground">
                  {formatINRSimple(result.position_value)}
                </div>
                <div className="text-xs text-muted-foreground">Position Value</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risk Amount</span>
                <span className="text-destructive font-medium">{formatINRSimple(result.risk_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stop Distance</span>
                <span className="text-foreground">{formatINRSimple(result.stop_distance)} ({result.stop_distance_pct.toFixed(2)}%)</span>
              </div>
              {result.risk_reward_ratio && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk/Reward</span>
                  <span className="text-primary font-medium">1:{result.risk_reward_ratio.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Adjustments */}
            {(result.adjustments.volatility_applied || result.adjustments.confidence_applied) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                <TrendingUp className="w-3 h-3" />
                <span>Adjustments:</span>
                {result.adjustments.volatility_applied && (
                  <span className="text-foreground">Vol ×{result.adjustments.volatility_factor.toFixed(2)}</span>
                )}
                {result.adjustments.confidence_applied && (
                  <span className="text-foreground">Conf ×{result.adjustments.confidence_factor.toFixed(2)}</span>
                )}
              </div>
            )}

            {/* Clamping warning */}
            {result.limits.was_clamped && (
              <div className="flex items-center gap-2 text-xs text-accent-foreground bg-accent/10 rounded-lg p-2">
                <AlertTriangle className="w-3 h-3" />
                <span>{result.limits.clamp_reason}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
