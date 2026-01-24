import { useState, useEffect, useRef, useCallback } from "react";

export interface LivePrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  marketStatus?: 'open' | 'closed' | 'pre-market' | 'post-market';
  source?: 'alpha_vantage' | 'cache' | 'simulated';
}

interface UseAlphaVantagePricesOptions {
  symbols: string[];
  enabled?: boolean;
  refreshInterval?: number; // in milliseconds, default 60000 (60 seconds)
}

export const useAlphaVantagePrices = ({
  symbols,
  enabled = true,
  refreshInterval = 60000,
}: UseAlphaVantagePricesOptions) => {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const pollingIntervalRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);
  
  // Stabilize symbols array by joining and comparing as string
  const symbolsKey = symbols.sort().join(',');

  // Fetch prices from Alpha Vantage edge function
  const fetchPrices = useCallback(async (symbolsToFetch: string[]) => {
    if (symbolsToFetch.length === 0 || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Fetch in batches to avoid overwhelming the API
      const batchSize = 5;
      const batches: string[][] = [];
      for (let i = 0; i < symbolsToFetch.length; i += batchSize) {
        batches.push(symbolsToFetch.slice(i, i + batchSize));
      }

      const allPrices: Record<string, LivePrice> = {};

      for (const batch of batches) {
        if (!mountedRef.current) break;
        
        const pricePromises = batch.map(async (symbol) => {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-prices?symbol=${symbol}&type=current`,
              {
                headers: {
                  "Content-Type": "application/json",
                  "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                },
              }
            );

            if (!response.ok) return null;
            return response.json();
          } catch {
            return null;
          }
        });

        const results = await Promise.all(pricePromises);

        results.forEach((result) => {
          if (result && result.symbol) {
            allPrices[result.symbol] = {
              symbol: result.symbol,
              price: result.price,
              change: result.change,
              changePercent: result.changePercent,
              timestamp: result.timestamp,
              marketStatus: result.marketStatus,
              source: result.source,
            };
          }
        });

        // Small delay between batches to avoid rate limiting
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      if (mountedRef.current) {
        setPrices(prev => ({ ...prev, ...allPrices }));
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("[Alpha Vantage] Fetch error:", err);
      if (mountedRef.current) {
        setError("Failed to fetch prices");
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial fetch and periodic refresh - use symbolsKey for stability
  useEffect(() => {
    mountedRef.current = true;
    
    if (!enabled || !symbolsKey) {
      return;
    }

    const symbolsArray = symbolsKey.split(',').filter(Boolean);
    
    // Initial fetch
    fetchPrices(symbolsArray);

    // Set up polling interval
    pollingIntervalRef.current = window.setInterval(() => {
      if (mountedRef.current) {
        fetchPrices(symbolsArray);
      }
    }, refreshInterval);

    return () => {
      mountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [enabled, symbolsKey, refreshInterval, fetchPrices]);

  const getPrice = useCallback(
    (symbol: string): LivePrice | null => {
      return prices[symbol] || null;
    },
    [prices]
  );

  const refresh = useCallback(() => {
    const symbolsArray = symbolsKey.split(',').filter(Boolean);
    if (symbolsArray.length > 0) {
      fetchPrices(symbolsArray);
    }
  }, [symbolsKey, fetchPrices]);

  // Check if data is fresh (less than 2 minutes old)
  const isDataFresh = lastUpdated 
    ? (Date.now() - lastUpdated.getTime()) < 2 * 60 * 1000 
    : false;

  return {
    prices,
    loading,
    error,
    lastUpdated,
    isDataFresh,
    getPrice,
    refresh,
  };
};

// Re-export with old name for backward compatibility during migration
export const useWebSocketPrices = useAlphaVantagePrices;
