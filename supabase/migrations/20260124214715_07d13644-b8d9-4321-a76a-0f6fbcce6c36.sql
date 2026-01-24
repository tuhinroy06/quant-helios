-- Create stock price cache table for fallback when WebSocket is unavailable
CREATE TABLE public.stock_price_cache (
  symbol TEXT PRIMARY KEY,
  yahoo_symbol TEXT,
  price DECIMAL(12,2) NOT NULL,
  change DECIMAL(12,2) DEFAULT 0,
  change_percent DECIMAL(8,4) DEFAULT 0,
  day_high DECIMAL(12,2),
  day_low DECIMAL(12,2),
  volume BIGINT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'yahoo_finance'
);

-- Index for fast lookups by update time
CREATE INDEX idx_price_cache_updated ON public.stock_price_cache(last_updated);

-- Enable RLS - prices are public data
ALTER TABLE public.stock_price_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read prices (public market data)
CREATE POLICY "Anyone can read stock prices" 
  ON public.stock_price_cache 
  FOR SELECT 
  USING (true);

-- Only service role can write (edge functions)
CREATE POLICY "Service role can manage prices" 
  ON public.stock_price_cache 
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');