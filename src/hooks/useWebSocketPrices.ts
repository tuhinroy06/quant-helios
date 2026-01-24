import { useState, useEffect, useRef, useCallback } from "react";

export interface LivePrice {
  symbol: string;
  yahooSymbol?: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface UseWebSocketPricesOptions {
  symbols: string[];
  enabled?: boolean;
  fallbackToPolling?: boolean;
}

interface WebSocketMessage {
  type: string;
  symbol?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  timestamp?: string;
  symbols?: string[];
  message?: string;
}

const WEBSOCKET_URL = `wss://axwhhazpvpkvheoruetu.supabase.co/functions/v1/price-stream`;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000]; // Exponential backoff

export const useWebSocketPrices = ({
  symbols,
  enabled = true,
  fallbackToPolling = true,
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

  // Keep refs updated
  useEffect(() => {
    symbolsRef.current = symbols;
  }, [symbols]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

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

        // Subscribe to symbols
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
            setPrices((prev) => ({
              ...prev,
              [message.symbol!]: {
                symbol: message.symbol!,
                price: message.price || 0,
                change: message.change || 0,
                changePercent: message.changePercent || 0,
                timestamp: message.timestamp || new Date().toISOString(),
              },
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

        // Attempt reconnection if enabled
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
  }, [symbols, connected]);

  const getPrice = useCallback(
    (symbol: string): LivePrice | null => {
      return prices[symbol] || null;
    },
    [prices]
  );

  const refresh = useCallback(() => {
    disconnect();
    reconnectAttemptRef.current = 0;
    setTimeout(connect, 100);
  }, [connect, disconnect]);

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
