import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { INDIAN_STOCKS, formatINRSimple } from "@/lib/indian-stocks";
import { useWebSocketPrices } from "@/hooks/useWebSocketPrices";
import { ConnectionStatus } from "./ConnectionStatus";

interface MarketTickerProps {
  onSymbolClick?: (symbol: string) => void;
  selectedSymbol?: string;
}

const TICKER_SYMBOLS = ["NIFTY", "BANKNIFTY", "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "ITC", "SBIN", "LT"];

export const MarketTicker = ({ onSymbolClick, selectedSymbol }: MarketTickerProps) => {
  const { prices, connected, connecting, lastUpdated } = useWebSocketPrices({
    symbols: TICKER_SYMBOLS,
    enabled: true,
  });

  const loading = !connected && Object.keys(prices).length === 0;

  return (
    <div className="w-full bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-secondary/30">
        <span className="text-xs text-muted-foreground font-medium">Market Overview</span>
        <ConnectionStatus connected={connected} connecting={connecting} lastUpdated={lastUpdated} />
      </div>
      <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
        {TICKER_SYMBOLS.map((symbol) => {
          const priceData = prices[symbol];
          const stockInfo = INDIAN_STOCKS.find((s) => s.symbol === symbol);
          const price = priceData?.price || stockInfo?.price || 0;
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
              <span className="text-sm font-semibold text-foreground">
                {loading ? "..." : formatINRSimple(price)}
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
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
