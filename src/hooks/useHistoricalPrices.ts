import { useState, useEffect, useCallback } from "react";

export interface OHLCData {
  time: number; // Unix timestamp for lightweight-charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface UseHistoricalPricesOptions {
  symbol: string;
  days?: number;
  enabled?: boolean;
}

export const useHistoricalPrices = ({
  symbol,
  days = 90,
  enabled = true,
}: UseHistoricalPricesOptions) => {
  const [data, setData] = useState<OHLCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol || !enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-prices?symbol=${symbol}&type=historical&days=${days}`,
        {
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch historical data for ${symbol}`);
      }

      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        const ohlcData: OHLCData[] = result.data.map((item: {
          date: string;
          open: number;
          high: number;
          low: number;
          close: number;
          volume: number;
        }) => ({
          time: Math.floor(new Date(item.date).getTime() / 1000),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
        }));
        setData(ohlcData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [symbol, days, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
