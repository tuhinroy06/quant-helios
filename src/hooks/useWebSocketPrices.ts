import { useState, useEffect, useRef, useCallback } from "react";

export interface LivePrice {
  symbol: string;
  yahooSymbol?: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  marketStatus?: 'open' | 'closed' | 'pre-market' | 'post-market';
  source?: 'alpha_vantage' | 'websocket' | 'cache' | 'simulated';
}

interface UseWebSocketPricesOptions {
  symbols: string[];
  enabled?: boolean;
  fallbackToPolling?: boolean;
  useAlphaVantage?: boolean;
}

interface WebSocketMessage {
  type: string;
  symbol?: string;
  yahooSymbol?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  timestamp?: string;
  symbols?: string[];
  message?: string;
}

const WEBSOCKET_URL = `wss://axwhhazpvpkvheoruetu.supabase.co/functions/v1/price-stream`;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

export const useWebSocketPrices = ({
  symbols,
  enabled = true,
  fallbackToPolling = true,
  useAlphaVantage = true, // Default to using Alpha Vantage
}: UseWebSocketPricesOptions) => {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const symbolsRef = useRef<string[]>(symbols);
  const enabledRef = useRef(enabled);
  const alphaVantagePricesRef = useRef<Record<string, LivePrice>>({});
  const pollingIntervalRef = useRef<number | null>(null);

  // Keep refs updated
  useEffect(() => {
    symbolsRef.current = symbols;
  }, [symbols]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Fetch prices from Alpha Vantage edge function
  const fetchAlphaVantagePrices = useCallback(async (symbolsToFetch: string[]) => {
    if (symbolsToFetch.length === 0) return;

    try {
      // Fetch in batches to avoid overwhelming the API
      const batchSize = 5;
      const batches: string[][] = [];
      for (let i = 0; i < symbolsToFetch.length; i += batchSize) {
        batches.push(symbolsToFetch.slice(i, i + batchSize));
      }

      for (const batch of batches) {
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
            const priceData: LivePrice = {
              symbol: result.symbol,
              price: result.price,
              change: result.change,
              changePercent: result.changePercent,
              timestamp: result.timestamp,
              marketStatus: result.marketStatus,
              source: result.source === 'alpha_vantage' ? 'alpha_vantage' : result.source,
            };

            alphaVantagePricesRef.current[result.symbol] = priceData;

            setPrices((prev) => ({
              ...prev,
              [result.symbol]: priceData,
            }));
          }
        });

        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("[Alpha Vantage] Fetch error:", err);
    }
  }, []);

  // Initial Alpha Vantage fetch
  useEffect(() => {
    if (enabled && useAlphaVantage && symbols.length > 0) {
      fetchAlphaVantagePrices(symbols);
    }
  }, [enabled, useAlphaVantage, symbols, fetchAlphaVantagePrices]);

  // Periodic Alpha Vantage refresh (every 60 seconds)
  useEffect(() => {
    if (!enabled || !useAlphaVantage || symbols.length === 0) return;

    pollingIntervalRef.current = window.setInterval(() => {
      fetchAlphaVantagePrices(symbols);
    }, 60000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [enabled, useAlphaVantage, symbols, fetchAlphaVantagePrices]);

  const connect = useCallback(() => {
    if (!enabledRef.current || symbolsRef.current.length === 0) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnecting(true);
    setError(null);

    try {
      console.log("[WS Hook] Connecting to price stream...");
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WS Hook] Connected!");
        setConnected(true);
        setConnecting(false);
        setError(null);
        reconnectAttemptRef.current = 0;

        if (symbolsRef.current.length > 0) {
          ws.send(JSON.stringify({
            action: "subscribe",
            symbols: symbolsRef.current,
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === "price" && message.symbol) {
            // Check if we have fresh Alpha Vantage data (< 2 minutes old)
            const alphaPrice = alphaVantagePricesRef.current[message.symbol];
            const isAlphaFresh = alphaPrice && 
              (Date.now() - new Date(alphaPrice.timestamp).getTime() < 2 * 60 * 1000);

            // Use Alpha Vantage as base when available
            const finalPrice: LivePrice = isAlphaFresh ? {
              symbol: message.symbol,
              yahooSymbol: message.yahooSymbol,
              price: alphaPrice.price,
              change: alphaPrice.change,
              changePercent: alphaPrice.changePercent,
              timestamp: message.timestamp || new Date().toISOString(),
              marketStatus: alphaPrice.marketStatus,
              source: 'alpha_vantage',
            } : {
              symbol: message.symbol,
              yahooSymbol: message.yahooSymbol,
              price: message.price || 0,
              change: message.change || 0,
              changePercent: message.changePercent || 0,
              timestamp: message.timestamp || new Date().toISOString(),
              source: 'websocket',
            };

            setPrices((prev) => ({
              ...prev,
              [message.symbol!]: finalPrice,
            }));
            setLastUpdated(new Date());
          } else if (message.type === "subscribed") {
            console.log("[WS Hook] Subscribed to:", message.symbols);
          } else if (message.type === "error") {
            console.error("[WS Hook] Server error:", message.message);
            setError(message.message || "Server error");
          }
        } catch (parseError) {
          console.error("[WS Hook] Failed to parse message:", parseError);
        }
      };

      ws.onclose = (event) => {
        console.log("[WS Hook] Disconnected:", event.code, event.reason);
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;

        if (enabledRef.current && reconnectAttemptRef.current < RECONNECT_DELAYS.length) {
          const delay = RECONNECT_DELAYS[reconnectAttemptRef.current];
          console.log(`[WS Hook] Reconnecting in ${delay}ms...`);

          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectAttemptRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptRef.current >= RECONNECT_DELAYS.length) {
          setError("Connection failed after multiple attempts");
        }
      };

      ws.onerror = (event) => {
        console.error("[WS Hook] WebSocket error:", event);
        setError("Connection error");
      };
    } catch (err) {
      console.error("[WS Hook] Failed to create WebSocket:", err);
      setConnecting(false);
      setError("Failed to connect");
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
  }, []);

  const subscribe = useCallback((newSymbols: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: "subscribe",
        symbols: newSymbols,
      }));
    }
  }, []);

  const unsubscribe = useCallback((symbolsToRemove: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: "unsubscribe",
        symbols: symbolsToRemove,
      }));
    }
  }, []);

  // Connect/disconnect based on enabled state
  useEffect(() => {
    if (enabled && symbols.length > 0) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Update subscriptions when symbols change
  useEffect(() => {
    if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: "subscribe",
        symbols,
      }));
    }

    // Also fetch Alpha Vantage for new symbols
    if (useAlphaVantage && symbols.length > 0) {
      const newSymbols = symbols.filter(s => !alphaVantagePricesRef.current[s]);
      if (newSymbols.length > 0) {
        fetchAlphaVantagePrices(newSymbols);
      }
    }
  }, [symbols, connected, useAlphaVantage, fetchAlphaVantagePrices]);

  const getPrice = useCallback(
    (symbol: string): LivePrice | null => {
      return prices[symbol] || null;
    },
    [prices]
  );

  const refresh = useCallback(() => {
    // Refresh Alpha Vantage prices
    if (useAlphaVantage) {
      fetchAlphaVantagePrices(symbolsRef.current);
    }
    
    // Reconnect WebSocket
    disconnect();
    reconnectAttemptRef.current = 0;
    setTimeout(connect, 100);
  }, [connect, disconnect, useAlphaVantage, fetchAlphaVantagePrices]);

  return {
    prices,
    connected,
    connecting,
    error,
    lastUpdated,
    getPrice,
    refresh,
    subscribe,
    unsubscribe,
  };
};
