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

interface CurrentPriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  timestamp: string;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'post-market';
  source: 'alpha_vantage' | 'cache' | 'simulated';
}

// Map internal symbols to Alpha Vantage format
const SYMBOL_MAP: Record<string, string> = {
  'RELIANCE': 'RELIANCE.BSE',
  'TCS': 'TCS.BSE',
  'HDFCBANK': 'HDFCBANK.BSE',
  'INFY': 'INFY.BSE',
  'ICICIBANK': 'ICICIBANK.BSE',
  'HINDUNILVR': 'HINDUNILVR.BSE',
  'ITC': 'ITC.BSE',
  'SBIN': 'SBIN.BSE',
  'BHARTIARTL': 'BHARTIARTL.BSE',
  'KOTAKBANK': 'KOTAKBANK.BSE',
  'LT': 'LT.BSE',
  'AXISBANK': 'AXISBANK.BSE',
  'ASIANPAINT': 'ASIANPAINT.BSE',
  'MARUTI': 'MARUTI.BSE',
  'SUNPHARMA': 'SUNPHARMA.BSE',
  'TITAN': 'TITAN.BSE',
  'ULTRACEMCO': 'ULTRACEMCO.BSE',
  'WIPRO': 'WIPRO.BSE',
  'BAJFINANCE': 'BAJFINANCE.BSE',
  'HCLTECH': 'HCLTECH.BSE',
  'NIFTY': 'NIFTY50.NS',
  'BANKNIFTY': 'NIFTYBANK.NS',
};

// Fallback base prices for simulation when API fails
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

// In-memory cache for quick lookups
const priceCache: Map<string, { data: any; expiresAt: number }> = new Map();

function isMarketOpen(): { status: 'open' | 'closed' | 'pre-market' | 'post-market'; message: string } {
  const now = new Date();
  const istOffset = 5.5 * 60; // IST is UTC+5:30
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + istOffset * 60000);
  
  const day = ist.getDay();
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // Market: Mon-Fri, 9:15 AM - 3:30 PM IST
  const preMarketStart = 9 * 60; // 9:00 AM
  const marketOpen = 9 * 60 + 15;  // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM
  const postMarketEnd = 16 * 60; // 4:00 PM
  
  // Weekend
  if (day === 0 || day === 6) {
    return { status: 'closed', message: 'Market closed (Weekend)' };
  }
  
  // Pre-market
  if (timeInMinutes >= preMarketStart && timeInMinutes < marketOpen) {
    return { status: 'pre-market', message: 'Pre-market session' };
  }
  
  // Market open
  if (timeInMinutes >= marketOpen && timeInMinutes <= marketClose) {
    return { status: 'open', message: 'Market is open' };
  }
  
  // Post-market
  if (timeInMinutes > marketClose && timeInMinutes <= postMarketEnd) {
    return { status: 'post-market', message: 'Post-market session' };
  }
  
  return { status: 'closed', message: 'Market closed' };
}

async function fetchFromAlphaVantage(
  symbol: string, 
  type: 'current' | 'historical',
  apiKey: string
): Promise<any> {
  const alphaSymbol = SYMBOL_MAP[symbol.toUpperCase()] || `${symbol}.BSE`;
  
  try {
    if (type === 'current') {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaSymbol}&apikey=${apiKey}`;
      console.log(`Fetching current price for ${alphaSymbol}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
        const quote = data['Global Quote'];
        return {
          symbol: symbol.toUpperCase(),
          price: parseFloat(quote['05. price']) || 0,
          change: parseFloat(quote['09. change']) || 0,
          changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
          open: parseFloat(quote['02. open']) || 0,
          high: parseFloat(quote['03. high']) || 0,
          low: parseFloat(quote['04. low']) || 0,
          previousClose: parseFloat(quote['08. previous close']) || 0,
          volume: parseInt(quote['06. volume']) || 0,
          source: 'alpha_vantage' as const,
        };
      }
      
      // Check for rate limit or error
      if (data['Note'] || data['Information']) {
        console.warn('Alpha Vantage rate limit:', data['Note'] || data['Information']);
        return null;
      }
      
      console.warn('No quote data returned for', alphaSymbol, data);
      return null;
    } else {
      // Historical data
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${alphaSymbol}&outputsize=full&apikey=${apiKey}`;
      console.log(`Fetching historical data for ${alphaSymbol}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Time Series (Daily)']) {
        const timeSeries = data['Time Series (Daily)'];
        const historicalData: PriceData[] = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
          symbol: symbol.toUpperCase(),
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }));
        
        // Sort by date ascending
        historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return {
          data: historicalData,
          source: 'alpha_vantage' as const,
        };
      }
      
      if (data['Note'] || data['Information']) {
        console.warn('Alpha Vantage rate limit:', data['Note'] || data['Information']);
        return null;
      }
      
      console.warn('No historical data returned for', alphaSymbol, data);
      return null;
    }
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    return null;
  }
}

// Generate simulated price as fallback
function generateSimulatedPrice(symbol: string): CurrentPriceData {
  const basePrice = STOCK_BASE_PRICES[symbol.toUpperCase()] || 1000;
  const volatility = 0.015;
  
  const now = new Date();
  const seed = Math.floor(now.getTime() / 60000);
  const random = Math.sin(seed * symbol.length) * 0.5 + 0.5;
  
  const change = (random - 0.5) * 2 * volatility * basePrice;
  const price = basePrice + change;
  const changePercent = (change / basePrice) * 100;
  
  const marketStatus = isMarketOpen();
  
  return {
    symbol: symbol.toUpperCase(),
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    open: Math.round(basePrice * 0.998 * 100) / 100,
    high: Math.round(price * 1.01 * 100) / 100,
    low: Math.round(price * 0.99 * 100) / 100,
    previousClose: basePrice,
    volume: Math.floor(100000 + Math.random() * 500000),
    timestamp: now.toISOString(),
    marketStatus: marketStatus.status,
    source: 'simulated',
  };
}

// Generate simulated historical data as fallback
function generateSimulatedHistorical(symbol: string, days: number = 365): { data: PriceData[]; source: 'simulated' } {
  const data: PriceData[] = [];
  let price = STOCK_BASE_PRICES[symbol.toUpperCase()] || 1000;
  
  const isIndex = symbol === 'NIFTY' || symbol === 'BANKNIFTY';
  const volatility = isIndex ? 0.012 : 0.022;
  const trend = 0.0002;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const seasonal = Math.sin(dayOfYear / 365 * Math.PI * 2) * 0.002;
    
    const change = (Math.random() - 0.5) * 2 * volatility + trend + seasonal;
    const open = price;
    price = price * (1 + change);
    const close = price;
    
    const range = Math.abs(close - open) + price * (Math.random() * 0.01);
    const high = Math.max(open, close) + Math.random() * range * 0.5;
    const low = Math.min(open, close) - Math.random() * range * 0.5;
    
    const baseVolume = isIndex ? 500000 : 100000;
    const volume = Math.floor(baseVolume + Math.random() * baseVolume * 2 * (Math.abs(change) * 50));

    data.push({
      symbol: symbol.toUpperCase(),
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume
    });
  }

  return { data, source: 'simulated' };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol') || 'NIFTY';
    const days = parseInt(url.searchParams.get('days') || '365');
    const type = url.searchParams.get('type') || 'historical';

    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    const marketStatus = isMarketOpen();
    const cacheKey = `${symbol}-${type}`;
    
    // Check in-memory cache first
    const cached = priceCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`Cache hit for ${cacheKey}`);
      const cachedData = cached.data;
      if (type === 'current') {
        return new Response(
          JSON.stringify({
            ...cachedData,
            marketStatus: marketStatus.status,
            source: 'cache',
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify(cachedData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === 'current') {
      // Try Alpha Vantage first
      if (apiKey) {
        const alphaData = await fetchFromAlphaVantage(symbol, 'current', apiKey);
        if (alphaData) {
          const response: CurrentPriceData = {
            ...alphaData,
            timestamp: new Date().toISOString(),
            marketStatus: marketStatus.status,
          };
          
          // Cache for 1 minute during market hours, 5 minutes otherwise
          const ttl = marketStatus.status === 'open' ? 60000 : 300000;
          priceCache.set(cacheKey, { data: response, expiresAt: Date.now() + ttl });
          
          return new Response(
            JSON.stringify(response),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      // Fallback to simulated data
      console.log(`Falling back to simulated data for ${symbol}`);
      const simulatedData = generateSimulatedPrice(symbol);
      
      return new Response(
        JSON.stringify(simulatedData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Historical data
    if (apiKey) {
      const alphaData = await fetchFromAlphaVantage(symbol, 'historical', apiKey);
      if (alphaData) {
        // Filter to requested number of days
        const filteredData = alphaData.data.slice(-days);
        
        const response = {
          symbol: symbol.toUpperCase(),
          count: filteredData.length,
          source: alphaData.source,
          marketStatus: marketStatus.status,
          data: filteredData,
        };
        
        // Cache historical data for 1 hour
        priceCache.set(cacheKey, { data: response, expiresAt: Date.now() + 3600000 });
        
        return new Response(
          JSON.stringify(response),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Fallback to simulated historical data
    console.log(`Falling back to simulated historical data for ${symbol}`);
    const simulatedHistorical = generateSimulatedHistorical(symbol, days);
    
    return new Response(
      JSON.stringify({
        symbol: symbol.toUpperCase(),
        count: simulatedHistorical.data.length,
        source: simulatedHistorical.source,
        marketStatus: marketStatus.status,
        data: simulatedHistorical.data,
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
