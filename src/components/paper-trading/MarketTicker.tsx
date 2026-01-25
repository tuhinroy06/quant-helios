import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatINRSimple } from "@/lib/indian-stocks";
import { useAlphaVantagePrices } from "@/hooks/useAlphaVantagePrices";
import { ConnectionStatus } from "./ConnectionStatus";

interface MarketTickerProps {
  onSymbolClick?: (symbol: string) => void;
  selectedSymbol?: string;
}

const TICKER_SYMBOLS = ["NIFTY", "BANKNIFTY", "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "ITC", "SBIN", "LT"];

export const MarketTicker = ({ onSymbolClick, selectedSymbol }: MarketTickerProps) => {
  const { prices, loading, error, isDataFresh, lastUpdated } = useAlphaVantagePrices({
    symbols: TICKER_SYMBOLS,
    enabled: true,
    refreshInterval: 120000, // 2 minutes to reduce API load
  });

  return (
    <div className="w-full bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-secondary/30">
        <span className="text-xs text-muted-foreground font-medium">Market Overview</span>
        <ConnectionStatus loading={loading} isDataFresh={isDataFresh} error={error} lastUpdated={lastUpdated} />
      </div>
      <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
        {TICKER_SYMBOLS.map((symbol) => {
          const priceData = prices[symbol];
          const hasData = !!priceData?.price;
          const price = priceData?.price || 0;
          const changePercent = priceData?.changePercent || 0;
          const isPositive = changePercent >= 0;
          const isSelected = selectedSymbol === symbol;

          return (
            <motion.button
              key={symbol}
              onClick={() => onSymbolClick?.(symbol)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg transition-colors min-w-[100px] ${
                isSelected
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-secondary"
              }`}
            >
              <span className="text-xs font-medium text-foreground">{symbol}</span>
              {loading ? (
                <span className="text-sm font-semibold text-muted-foreground">...</span>
              ) : hasData ? (
                <>
                  <span className="text-sm font-semibold text-foreground">
                    {formatINRSimple(price)}
                  </span>
                  <div
                    className={`flex items-center gap-0.5 text-xs ${
                      isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {isPositive ? "+" : ""}
                      {changePercent.toFixed(2)}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <AlertTriangle className="w-3 h-3 text-yellow-500 mb-0.5" />
                  <span className="text-xs text-muted-foreground">No data</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
