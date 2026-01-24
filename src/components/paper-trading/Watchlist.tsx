import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, TrendingUp, TrendingDown, Star, Search } from "lucide-react";
import { INDIAN_STOCKS, formatINRSimple, searchStocks } from "@/lib/indian-stocks";
import { useWebSocketPrices } from "@/hooks/useWebSocketPrices";
import { ConnectionStatus } from "./ConnectionStatus";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WatchlistProps {
  onSymbolSelect: (symbol: string) => void;
  selectedSymbol: string;
}

const DEFAULT_WATCHLIST = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"];

export const Watchlist = ({ onSymbolSelect, selectedSymbol }: WatchlistProps) => {
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { prices, connected, connecting, lastUpdated } = useWebSocketPrices({
    symbols: watchlist,
    enabled: true,
  });

  const loading = !connected && Object.keys(prices).length === 0;

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
    setDialogOpen(false);
    setSearchQuery("");
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((s) => s !== symbol));
  };

  // Use searchStocks for better search across all stocks
  const filteredStocks = searchQuery
    ? searchStocks(searchQuery).filter(stock => !watchlist.includes(stock.symbol))
    : INDIAN_STOCKS.filter(stock => !watchlist.includes(stock.symbol));

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <h3 className="font-medium text-foreground text-sm">Watchlist</h3>
          <ConnectionStatus connected={connected} connecting={connecting} />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add to Watchlist</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks by symbol or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[350px]">
              <div className="space-y-1">
                {filteredStocks.slice(0, 50).map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => addToWatchlist(stock.symbol)}
                    className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-medium text-foreground text-sm">
                        {stock.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stock.name} • {stock.sector}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatINRSimple(stock.price)}
                    </span>
                  </button>
                ))}
                {filteredStocks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No stocks found
                  </p>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
        {watchlist.map((symbol) => {
          const stock = INDIAN_STOCKS.find((s) => s.symbol === symbol);
          const priceData = prices[symbol];
          const price = priceData?.price || stock?.price || 0;
          const changePercent = priceData?.changePercent || 0;
          const isPositive = changePercent >= 0;
          const isSelected = selectedSymbol === symbol;

          return (
            <motion.div
              key={symbol}
              whileHover={{ backgroundColor: "hsl(var(--secondary) / 0.5)" }}
              className={`group flex items-center justify-between p-3 cursor-pointer transition-colors ${
                isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
              }`}
              onClick={() => onSymbolSelect(symbol)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {symbol}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {stock?.name || symbol}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {loading ? "..." : formatINRSimple(price)}
                  </p>
                  <p
                    className={`text-xs flex items-center justify-end gap-0.5 ${
                      isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {isPositive ? "+" : ""}
                    {changePercent.toFixed(2)}%
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(symbol);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
