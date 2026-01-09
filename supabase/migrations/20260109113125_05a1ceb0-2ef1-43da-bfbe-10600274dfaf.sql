-- Add status column to paper_accounts if not exists
ALTER TABLE paper_accounts 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed'));

-- Add missing columns to paper_trades
ALTER TABLE paper_trades 
  ADD COLUMN IF NOT EXISTS market text DEFAULT 'equity',
  ADD COLUMN IF NOT EXISTS pnl_pct numeric,
  ADD COLUMN IF NOT EXISTS reason text;

-- Create paper_positions table for open trades
CREATE TABLE IF NOT EXISTS paper_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid NOT NULL REFERENCES paper_accounts(id) ON DELETE CASCADE,
  strategy_id uuid REFERENCES strategies(id),
  symbol text NOT NULL,
  market text NOT NULL DEFAULT 'equity',
  side text NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity numeric NOT NULL,
  entry_price numeric NOT NULL,
  stop_loss numeric NOT NULL,
  take_profit numeric,
  unrealized_pnl numeric DEFAULT 0,
  opened_at timestamptz NOT NULL DEFAULT now(),
  status text DEFAULT 'open' CHECK (status IN ('open', 'pending_close')),
  created_at timestamptz DEFAULT now()
);

-- Create paper_trade_logs table for audit & learning
CREATE TABLE IF NOT EXISTS paper_trade_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trade_id uuid,
  event_type text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE paper_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trade_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for paper_positions
CREATE POLICY "Users can view their own positions" ON paper_positions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own positions" ON paper_positions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions" ON paper_positions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own positions" ON paper_positions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for paper_trade_logs
CREATE POLICY "Users can view their own trade logs" ON paper_trade_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trade logs" ON paper_trade_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create helper function for paper account ownership check
CREATE OR REPLACE FUNCTION owns_paper_position(position_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM paper_positions
    WHERE id = position_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;