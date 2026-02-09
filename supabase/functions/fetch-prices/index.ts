import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INDIAN_API_BASE = "https://stock.indianapi.in";

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
  source: 'indian_api' | 'cache' | 'fallback';
}

// In-memory cache
const priceCache: Map<string, { data: any; expiresAt: number }> = new Map();

function isMarketOpen(): { status: 'open' | 'closed' | 'pre-market' | 'post-market'; message: string } {
  const now = new Date();
  const istOffset = 5.5 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + istOffset * 60000);
  
  const day = ist.getDay();
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  const preMarketStart = 9 * 60;
  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;
  const postMarketEnd = 16 * 60;
  
  if (day === 0 || day === 6) {
    return { status: 'closed', message: 'Market closed (Weekend)' };
  }
  
  if (timeInMinutes >= preMarketStart && timeInMinutes < marketOpen) {
    return { status: 'pre-market', message: 'Pre-market session' };
  }
  
  if (timeInMinutes >= marketOpen && timeInMinutes <= marketClose) {
    return { status: 'open', message: 'Market is open' };
  }
  
  if (timeInMinutes > marketClose && timeInMinutes <= postMarketEnd) {
    return { status: 'post-market', message: 'Post-market session' };
  }
  
  return { status: 'closed', message: 'Market closed' };
}

// Fetch from Indian API
async function fetchFromIndianAPI(
  symbol: string,
  type: 'current' | 'historical',
  apiKey: string
): Promise<any> {
  try {
    if (type === 'current') {
      // Use the /stock endpoint to get current price
      const url = `${INDIAN_API_BASE}/stock?name=${encodeURIComponent(symbol)}`;
      console.log(`[IndianAPI] Fetching current price for ${symbol}`);
      
      const response = await fetch(url, {
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn(`[IndianAPI] HTTP error for ${symbol}: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data && data.currentPrice) {
        const nsePrice = data.currentPrice.NSE || data.currentPrice.BSE;
        const previousClose = data.stockTechnicalData?.previousClose || nsePrice;
        const change = nsePrice - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
        
        return {
          symbol: data.tickerId || symbol.toUpperCase(),
          price: nsePrice,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          open: data.stockTechnicalData?.open || nsePrice,
          high: data.yearHigh || nsePrice,
          low: data.yearLow || nsePrice,
          previousClose: previousClose,
          volume: data.stockTechnicalData?.volume || 0,
          source: 'indian_api' as const,
          companyName: data.companyName,
          industry: data.industry,
        };
      }
      
      console.warn(`[IndianAPI] No data returned for ${symbol}`);
      return null;
    } else {
      // Historical data - use historical endpoint
      const url = `${INDIAN_API_BASE}/historical_data?stock_name=${encodeURIComponent(symbol)}&period=1y&filter=price`;
      console.log(`[IndianAPI] Fetching historical data for ${symbol}`);
      
      const response = await fetch(url, {
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn(`[IndianAPI] HTTP error for historical ${symbol}: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data && data.datasets && data.datasets.length > 0) {
        const priceData = data.datasets[0];
        const prices: PriceData[] = priceData.values?.map((item: any) => ({
          symbol: symbol.toUpperCase(),
          date: item[0], // Date
          open: parseFloat(item[1]) || 0,
          high: parseFloat(item[2]) || 0,
          low: parseFloat(item[3]) || 0,
          close: parseFloat(item[4]) || 0,
          volume: parseInt(item[5]) || 0,
        })) || [];
        
        return prices;
      }
      
      return null;
    }
  } catch (error) {
    console.error(`[IndianAPI] Error fetching ${symbol}:`, error);
    return null;
  }
}

// Fetch trending stocks
async function fetchTrendingStocks(apiKey: string): Promise<any> {
  try {
    const url = `${INDIAN_API_BASE}/trending`;
    console.log(`[IndianAPI] Fetching trending stocks`);
    
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`[IndianAPI] HTTP error for trending: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[IndianAPI] Error fetching trending:`, error);
    return null;
  }
}

// Fetch most active NSE stocks
async function fetchMostActive(apiKey: string): Promise<any> {
  try {
    const url = `${INDIAN_API_BASE}/NSE_most_active`;
    console.log(`[IndianAPI] Fetching NSE most active`);
    
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`[IndianAPI] HTTP error for most active: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[IndianAPI] Error fetching most active:`, error);
    return null;
  }
}

// Generate fallback data when API is unavailable
function generateFallbackData(symbol: string): CurrentPriceData {
  const marketStatus = isMarketOpen();
  const basePrice = 1000 + Math.random() * 4000;
  const change = (Math.random() - 0.5) * 100;
  
  return {
    symbol: symbol.toUpperCase(),
    price: Math.round(basePrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round((change / basePrice) * 10000) / 100,
    open: Math.round(basePrice * 100) / 100,
    high: Math.round((basePrice * 1.02) * 100) / 100,
    low: Math.round((basePrice * 0.98) * 100) / 100,
    previousClose: Math.round((basePrice - change) * 100) / 100,
    volume: Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString(),
    marketStatus: marketStatus.status,
    source: 'fallback',
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get("symbol");
    const type = (url.searchParams.get("type") || "current") as 'current' | 'historical';
    const endpoint = url.searchParams.get("endpoint"); // trending, most_active
    
    const INDIAN_API_KEY = Deno.env.get("INDIAN_API_KEY");
    
    if (!INDIAN_API_KEY) {
      console.warn("[IndianAPI] API key not configured, using fallback data");
    }

    // Handle special endpoints
    if (endpoint === 'trending' && INDIAN_API_KEY) {
      const trendingData = await fetchTrendingStocks(INDIAN_API_KEY);
      if (trendingData) {
        return new Response(JSON.stringify(trendingData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    
    if (endpoint === 'most_active' && INDIAN_API_KEY) {
      const activeData = await fetchMostActive(INDIAN_API_KEY);
      if (activeData) {
        return new Response(JSON.stringify(activeData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cacheKey = `${symbol.toUpperCase()}-${type}`;
    const marketStatus = isMarketOpen();
    
    // Check cache first
    const cached = priceCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`[Cache] Hit for ${cacheKey}`);
      return new Response(JSON.stringify({
        ...cached.data,
        marketStatus: marketStatus.status,
        source: 'cache',
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result = null;
    
    // Try Indian API first
    if (INDIAN_API_KEY) {
      result = await fetchFromIndianAPI(symbol, type, INDIAN_API_KEY);
    }
    
    if (result) {
      // Cache the result
      const cacheDuration = marketStatus.status === 'open' ? 30000 : 300000; // 30s during market, 5min otherwise
      priceCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + cacheDuration,
      });
      
      if (type === 'current') {
        return new Response(JSON.stringify({
          ...result,
          timestamp: new Date().toISOString(),
          marketStatus: marketStatus.status,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        // Normalize historical data to always wrap in { data, source, marketStatus }
        const historicalArray = Array.isArray(result) ? result : [];
        return new Response(JSON.stringify({
          data: historicalArray,
          source: 'indian_api',
          marketStatus: marketStatus.status,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    
    // If Indian API fails, return fallback data
    console.warn(`[IndianAPI] All sources failed for ${symbol}, using fallback`);
    
    if (type === 'current') {
      const fallbackData = generateFallbackData(symbol);
      return new Response(JSON.stringify(fallbackData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Generate fallback historical data
      const fallbackHistory: PriceData[] = [];
      const basePrice = 1000 + Math.random() * 2000;
      for (let i = 365; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const price = basePrice * (1 + (Math.random() - 0.5) * 0.1);
        fallbackHistory.push({
          symbol: symbol.toUpperCase(),
          date: date.toISOString().split('T')[0],
          open: price * 0.99,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: Math.floor(Math.random() * 1000000),
        });
      }
      return new Response(JSON.stringify(fallbackHistory), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error: unknown) {
    console.error("[IndianAPI] Error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
