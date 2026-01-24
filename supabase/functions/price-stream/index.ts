import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Yahoo Finance symbol mappings for Indian stocks
const YAHOO_SYMBOLS: Record<string, string> = {
  // Indices
  "NIFTY": "^NSEI",
  "NIFTY50": "^NSEI",
  "BANKNIFTY": "^NSEBANK",
  "NIFTYIT": "^CNXIT",
  "NIFTYMIDCAP": "^NSEMDCP50",
  // Stocks use .NS suffix
};

const getYahooSymbol = (symbol: string): string => {
  return YAHOO_SYMBOLS[symbol] || `${symbol}.NS`;
};

// Simulated real-time price generator with market-like behavior
class PriceSimulator {
  private basePrices: Map<string, number> = new Map();
  private lastPrices: Map<string, number> = new Map();
  private volatility: Map<string, number> = new Map();
  
  constructor() {
    // Base prices for popular stocks
    const stocks: Record<string, { price: number; vol: number }> = {
      "NIFTY": { price: 24500, vol: 0.002 },
      "BANKNIFTY": { price: 51800, vol: 0.003 },
      "RELIANCE": { price: 2850, vol: 0.015 },
      "TCS": { price: 3950, vol: 0.012 },
      "HDFCBANK": { price: 1680, vol: 0.014 },
      "INFY": { price: 1520, vol: 0.018 },
      "ICICIBANK": { price: 1120, vol: 0.016 },
      "HINDUNILVR": { price: 2450, vol: 0.01 },
      "ITC": { price: 460, vol: 0.012 },
      "SBIN": { price: 780, vol: 0.02 },
      "BHARTIARTL": { price: 1620, vol: 0.015 },
      "KOTAKBANK": { price: 1850, vol: 0.014 },
      "LT": { price: 3400, vol: 0.013 },
      "AXISBANK": { price: 1080, vol: 0.018 },
      "MARUTI": { price: 10800, vol: 0.012 },
      "SUNPHARMA": { price: 1620, vol: 0.016 },
      "TITAN": { price: 3200, vol: 0.014 },
      "BAJFINANCE": { price: 6800, vol: 0.02 },
      "ASIANPAINT": { price: 2950, vol: 0.012 },
      "WIPRO": { price: 445, vol: 0.015 },
      "TATAMOTORS": { price: 920, vol: 0.025 },
      "TATASTEEL": { price: 145, vol: 0.022 },
      "POWERGRID": { price: 295, vol: 0.01 },
      "NTPC": { price: 385, vol: 0.012 },
      "ONGC": { price: 265, vol: 0.018 },
      "COALINDIA": { price: 420, vol: 0.015 },
      "JSWSTEEL": { price: 890, vol: 0.02 },
      "ADANIENT": { price: 2850, vol: 0.03 },
      "ADANIPORTS": { price: 1280, vol: 0.022 },
      "ULTRACEMCO": { price: 11200, vol: 0.012 },
      "GRASIM": { price: 2450, vol: 0.014 },
      "TECHM": { price: 1650, vol: 0.018 },
      "HCLTECH": { price: 1780, vol: 0.016 },
      "NESTLEIND": { price: 2480, vol: 0.008 },
      "M&M": { price: 2850, vol: 0.016 },
      "BAJAJFINSV": { price: 1650, vol: 0.018 },
      "DRREDDY": { price: 6200, vol: 0.014 },
      "CIPLA": { price: 1480, vol: 0.015 },
      "APOLLOHOSP": { price: 6800, vol: 0.016 },
      "EICHERMOT": { price: 4850, vol: 0.014 },
      "HEROMOTOCO": { price: 4200, vol: 0.012 },
      "BPCL": { price: 585, vol: 0.018 },
      "DIVISLAB": { price: 4950, vol: 0.015 },
      "BRITANNIA": { price: 5200, vol: 0.01 },
      "SHREECEM": { price: 26500, vol: 0.012 },
      "INDUSINDBK": { price: 1420, vol: 0.02 },
      "TATACONSUM": { price: 1120, vol: 0.014 },
      "HINDALCO": { price: 620, vol: 0.022 },
      "VEDL": { price: 445, vol: 0.025 },
    };
    
    for (const [symbol, data] of Object.entries(stocks)) {
      this.basePrices.set(symbol, data.price);
      this.lastPrices.set(symbol, data.price);
      this.volatility.set(symbol, data.vol);
    }
  }
  
  getPrice(symbol: string): { price: number; change: number; changePercent: number } {
    const basePrice = this.basePrices.get(symbol) || 1000;
    const lastPrice = this.lastPrices.get(symbol) || basePrice;
    const vol = this.volatility.get(symbol) || 0.015;
    
    // Generate realistic tick movement
    const tickChange = (Math.random() - 0.5) * 2 * vol * lastPrice;
    const newPrice = Math.max(lastPrice + tickChange, basePrice * 0.8);
    
    this.lastPrices.set(symbol, newPrice);
    
    const change = newPrice - basePrice;
    const changePercent = (change / basePrice) * 100;
    
    return {
      price: Math.round(newPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
    };
  }
}

const priceSimulator = new PriceSimulator();

// Store active WebSocket connections and their subscriptions
const connections = new Map<WebSocket, Set<string>>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if this is a WebSocket upgrade request
  const upgradeHeader = req.headers.get("upgrade");
  
  if (upgradeHeader?.toLowerCase() === "websocket") {
    try {
      const { socket, response } = Deno.upgradeWebSocket(req);
      
      const subscriptions = new Set<string>();
      connections.set(socket, subscriptions);
      
      let priceInterval: number | null = null;
      
      socket.onopen = () => {
        console.log("[WS] Client connected");
        
        // Send connection confirmation
        socket.send(JSON.stringify({
          type: "connected",
          message: "WebSocket connected to price stream",
          timestamp: new Date().toISOString(),
        }));
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("[WS] Received message:", message);
          
          if (message.action === "subscribe" && Array.isArray(message.symbols)) {
            // Add symbols to subscription
            for (const symbol of message.symbols) {
              subscriptions.add(symbol.toUpperCase());
            }
            
            console.log(`[WS] Subscribed to: ${Array.from(subscriptions).join(", ")}`);
            
            // Send subscription confirmation
            socket.send(JSON.stringify({
              type: "subscribed",
              symbols: Array.from(subscriptions),
              timestamp: new Date().toISOString(),
            }));
            
            // Start streaming prices if not already
            if (!priceInterval && subscriptions.size > 0) {
              priceInterval = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                  for (const symbol of subscriptions) {
                    const priceData = priceSimulator.getPrice(symbol);
                    socket.send(JSON.stringify({
                      type: "price",
                      symbol,
                      yahooSymbol: getYahooSymbol(symbol),
                      ...priceData,
                      timestamp: new Date().toISOString(),
                    }));
                  }
                }
              }, 1000); // Send price updates every second
            }
          } else if (message.action === "unsubscribe" && Array.isArray(message.symbols)) {
            // Remove symbols from subscription
            for (const symbol of message.symbols) {
              subscriptions.delete(symbol.toUpperCase());
            }
            
            console.log(`[WS] Unsubscribed, remaining: ${Array.from(subscriptions).join(", ")}`);
            
            // Stop interval if no more subscriptions
            if (subscriptions.size === 0 && priceInterval) {
              clearInterval(priceInterval);
              priceInterval = null;
            }
            
            socket.send(JSON.stringify({
              type: "unsubscribed",
              symbols: Array.from(subscriptions),
              timestamp: new Date().toISOString(),
            }));
          }
        } catch (error) {
          console.error("[WS] Error processing message:", error);
          socket.send(JSON.stringify({
            type: "error",
            message: "Failed to process message",
            timestamp: new Date().toISOString(),
          }));
        }
      };
      
      socket.onclose = () => {
        console.log("[WS] Client disconnected");
        if (priceInterval) {
          clearInterval(priceInterval);
        }
        connections.delete(socket);
      };
      
      socket.onerror = (error) => {
        console.error("[WS] WebSocket error:", error);
      };
      
      return response;
    } catch (error) {
      console.error("[WS] Failed to upgrade connection:", error);
      return new Response(JSON.stringify({ error: "Failed to establish WebSocket connection" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
  
  // Handle regular HTTP requests (for fallback/REST API)
  try {
    const url = new URL(req.url);
    const symbols = url.searchParams.get("symbols")?.split(",") || [];
    
    if (symbols.length === 0) {
      return new Response(JSON.stringify({
        error: "No symbols provided",
        usage: "?symbols=RELIANCE,TCS,INFY or connect via WebSocket",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const prices: Record<string, any> = {};
    for (const symbol of symbols) {
      const cleanSymbol = symbol.trim().toUpperCase();
      prices[cleanSymbol] = {
        ...priceSimulator.getPrice(cleanSymbol),
        yahooSymbol: getYahooSymbol(cleanSymbol),
        timestamp: new Date().toISOString(),
      };
    }
    
    return new Response(JSON.stringify({
      type: "prices",
      data: prices,
      source: "simulated",
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[HTTP] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
