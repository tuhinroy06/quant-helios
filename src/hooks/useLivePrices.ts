import { useState, useEffect, useCallback, useRef } from "react";

interface LivePrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  volume?: number;
  timestamp: string;
  marketStatus?: 'open' | 'closed' | 'pre-market' | 'post-market';
  source?: 'alpha_vantage' | 'cache' | 'simulated';
}

interface UseLivePricesOptions {
  symbols: string[];
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

export const useLivePrices = ({ 
  symbols, 
  refreshInterval = 5000, 
  enabled = true 
}: UseLivePricesOptions) => {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | 'pre-market' | 'post-market'>('closed');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Fetch prices for all symbols in parallel
      const pricePromises = symbols.map(async (symbol) => {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-prices?symbol=${symbol}&type=current`,
          {
            headers: {
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch price for ${symbol}`);
        }

        return response.json();
      });

      const results = await Promise.all(pricePromises);
      
      const newPrices: Record<string, LivePrice> = {};
      results.forEach((result) => {
        if (result && result.symbol) {
          newPrices[result.symbol] = {
            symbol: result.symbol,
            price: result.price,
            change: result.change,
            changePercent: result.changePercent,
            open: result.open,
            high: result.high,
            low: result.low,
            previousClose: result.previousClose,
            volume: result.volume,
            timestamp: result.timestamp,
            marketStatus: result.marketStatus,
            source: result.source,
          };
          
          // Update global market status from first result
          if (result.marketStatus) {
            setMarketStatus(result.marketStatus);
          }
        }
      });

      setPrices(newPrices);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices");
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchPrices();

    // Adjust refresh interval based on market status
    const interval = marketStatus === 'open' ? refreshInterval : refreshInterval * 2;
    
    // Set up interval for real-time updates
    intervalRef.current = setInterval(fetchPrices, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPrices, refreshInterval, enabled, marketStatus]);

  const getPrice = useCallback((symbol: string): LivePrice | null => {
    return prices[symbol] || null;
  }, [prices]);

  const refresh = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  return {
    prices,
    loading,
    error,
    lastUpdated,
    marketStatus,
    getPrice,
    refresh,
  };
};
