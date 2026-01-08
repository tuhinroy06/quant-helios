import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Indian stock symbols with base prices for simulation
const STOCK_BASE_PRICES: Record<string, number> = {
  'RELIANCE': 2450,
  'TCS': 3850,
  'HDFCBANK': 1650,
  'INFY': 1480,
  'ICICIBANK': 1050,
  'HINDUNILVR': 2580,
  'ITC': 445,
  'SBIN': 625,
  'BHARTIARTL': 1420,
  'KOTAKBANK': 1780,
  'LT': 3350,
  'AXISBANK': 1120,
  'ASIANPAINT': 2850,
  'MARUTI': 10500,
  'SUNPHARMA': 1250,
  'TITAN': 3180,
  'ULTRACEMCO': 9800,
  'WIPRO': 485,
  'BAJFINANCE': 6800,
  'HCLTECH': 1350,
  'NIFTY': 22500,
  'BANKNIFTY': 48500,
};

// Generate realistic price data for a symbol
function generatePriceData(symbol: string, days: number = 365): PriceData[] {
  const data: PriceData[] = [];
  let price = STOCK_BASE_PRICES[symbol] || 1000;
  
  // Volatility varies by stock type
  const isIndex = symbol === 'NIFTY' || symbol === 'BANKNIFTY';
  const volatility = isIndex ? 0.012 : 0.022;
  const trend = 0.0002; // Slight upward bias

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Add some cyclical patterns
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const seasonal = Math.sin(dayOfYear / 365 * Math.PI * 2) * 0.002;
    
    const change = (Math.random() - 0.5) * 2 * volatility + trend + seasonal;
    const open = price;
    price = price * (1 + change);
    const close = price;
    
    // High and low with realistic wicks
    const range = Math.abs(close - open) + price * (Math.random() * 0.01);
    const high = Math.max(open, close) + Math.random() * range * 0.5;
    const low = Math.min(open, close) - Math.random() * range * 0.5;
    
    // Volume varies with volatility
    const baseVolume = isIndex ? 500000 : 100000;
    const volume = Math.floor(baseVolume + Math.random() * baseVolume * 2 * (Math.abs(change) * 50));

    data.push({
      symbol,
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume
    });
  }

  return data;
}

// Get current simulated price
function getCurrentPrice(symbol: string): { price: number; change: number; changePercent: number } {
  const basePrice = STOCK_BASE_PRICES[symbol] || 1000;
  const volatility = 0.015;
  
  // Use time-based seed for consistency within the same minute
  const now = new Date();
  const seed = Math.floor(now.getTime() / 60000);
  const random = Math.sin(seed * symbol.length) * 0.5 + 0.5;
  
  const change = (random - 0.5) * 2 * volatility * basePrice;
  const price = basePrice + change;
  const changePercent = (change / basePrice) * 100;
  
  return {
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol') || 'NIFTY';
    const days = parseInt(url.searchParams.get('days') || '365');
    const type = url.searchParams.get('type') || 'historical'; // 'historical' or 'current'

    if (type === 'current') {
      // Return current price
      const priceInfo = getCurrentPrice(symbol.toUpperCase());
      return new Response(
        JSON.stringify({
          symbol: symbol.toUpperCase(),
          ...priceInfo,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return historical data
    const priceData = generatePriceData(symbol.toUpperCase(), days);

    return new Response(
      JSON.stringify({
        symbol: symbol.toUpperCase(),
        count: priceData.length,
        data: priceData
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Price fetch error:", error);
    const message = error instanceof Error ? error.message : "An error occurred fetching prices";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
