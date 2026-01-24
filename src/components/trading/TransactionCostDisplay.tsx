import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingDown, Info } from "lucide-react";
import { useTransactionCosts } from "@/hooks/useTransactionCosts";
import { formatINRSimple } from "@/lib/indian-stocks";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TransactionCostDisplayProps {
  quantity: number;
  price: number;
  side: "buy" | "sell";
  showBreakdown?: boolean;
  compact?: boolean;
}

export const TransactionCostDisplay = ({
  quantity,
  price,
  side,
  showBreakdown = true,
  compact = false,
}: TransactionCostDisplayProps) => {
  const { calculateCosts, loading } = useTransactionCosts();
  const [breakdown, setBreakdown] = useState<{
    brokerage: number;
    stt: number;
    exchange_txn_charge: number;
    gst: number;
    sebi_charge: number;
    stamp_duty: number;
    total_charges: number;
    gross_value: number;
    net_value: number;
  } | null>(null);

  useEffect(() => {
    if (quantity > 0 && price > 0) {
      calculateCosts(quantity, price, side).then(setBreakdown);
    }
  }, [quantity, price, side, calculateCosts]);

  if (loading || !breakdown) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Calculator className="w-4 h-4 animate-pulse" />
        <span>Calculating...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs cursor-help">
              <TrendingDown className="w-3 h-3" />
              <span>Charges: {formatINRSimple(breakdown.total_charges)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-64 p-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Brokerage</span>
                <span>{formatINRSimple(breakdown.brokerage)}</span>
              </div>
              <div className="flex justify-between">
                <span>STT</span>
                <span>{formatINRSimple(breakdown.stt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Exchange Charges</span>
                <span>{formatINRSimple(breakdown.exchange_txn_charge)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST</span>
                <span>{formatINRSimple(breakdown.gst)}</span>
              </div>
              <div className="flex justify-between">
                <span>SEBI Charges</span>
                <span>{formatINRSimple(breakdown.sebi_charge)}</span>
              </div>
              <div className="flex justify-between">
                <span>Stamp Duty</span>
                <span>{formatINRSimple(breakdown.stamp_duty)}</span>
              </div>
              <div className="border-t border-border pt-1.5 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatINRSimple(breakdown.total_charges)}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-medium text-foreground">Transaction Costs</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                India-specific charges including STT, GST, SEBI fees, and stamp duty.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Gross Value</span>
          <span className="text-foreground font-medium">{formatINRSimple(breakdown.gross_value)}</span>
        </div>

        {showBreakdown && (
          <div className="space-y-1.5 py-2 border-y border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Brokerage</span>
              <span className="text-muted-foreground">{formatINRSimple(breakdown.brokerage)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">STT (Securities Transaction Tax)</span>
              <span className="text-muted-foreground">{formatINRSimple(breakdown.stt)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Exchange Transaction Charge</span>
              <span className="text-muted-foreground">{formatINRSimple(breakdown.exchange_txn_charge)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">GST (18%)</span>
              <span className="text-muted-foreground">{formatINRSimple(breakdown.gst)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">SEBI Charges</span>
              <span className="text-muted-foreground">{formatINRSimple(breakdown.sebi_charge)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Stamp Duty</span>
              <span className="text-muted-foreground">{formatINRSimple(breakdown.stamp_duty)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Charges</span>
          <span className="text-destructive font-medium">-{formatINRSimple(breakdown.total_charges)}</span>
        </div>

        <div className="flex justify-between text-sm pt-1">
          <span className="text-foreground font-medium">Net Value</span>
          <span className={`font-semibold ${side === "buy" ? "text-foreground" : "text-primary"}`}>
            {formatINRSimple(breakdown.net_value)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
