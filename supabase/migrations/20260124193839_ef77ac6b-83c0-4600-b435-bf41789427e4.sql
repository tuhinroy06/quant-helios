-- Create trade_attributions table for Outcome Attribution Engine data
CREATE TABLE public.trade_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE NOT NULL,
  trade_id UUID,
  trade_source TEXT CHECK (trade_source IN ('paper', 'live', 'backtest')),
  timestamp TIMESTAMPTZ NOT NULL,
  pnl DECIMAL(15,2) NOT NULL,
  primary_cause TEXT CHECK (primary_cause IN ('STRATEGY_LOGIC', 'EXECUTION', 'MARKET_CONDITIONS', 'RISK_MANAGEMENT')) NOT NULL,
  execution_sub_type TEXT,
  stop_loss_hit BOOLEAN DEFAULT false,
  take_profit_hit BOOLEAN DEFAULT false,
  volatility_regime TEXT CHECK (volatility_regime IN ('HIGH', 'NORMAL', 'LOW')),
  liquidity_regime TEXT CHECK (liquidity_regime IN ('HIGH', 'NORMAL', 'LOW')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create behavior_signals table for detected behavioral patterns
CREATE TABLE public.behavior_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
  behavior TEXT NOT NULL,
  strength DECIMAL(3,2) CHECK (strength >= 0 AND strength <= 1) NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1) NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  window_start TIMESTAMPTZ,
  window_end TIMESTAMPTZ
);

-- Create strategy_health_reports table for health assessment history
CREATE TABLE public.strategy_health_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE NOT NULL,
  health_status TEXT CHECK (health_status IN ('HEALTHY', 'DEGRADED', 'UNSTABLE', 'CRITICAL')) NOT NULL,
  health_score DECIMAL(5,2) NOT NULL,
  health_delta DECIMAL(5,2),
  is_improving BOOLEAN,
  is_deteriorating BOOLEAN,
  degradation_reasons JSONB DEFAULT '[]'::jsonb,
  behavior_flags JSONB DEFAULT '[]'::jsonb,
  execution_risk_breakdown JSONB,
  logic_stability_score DECIMAL(3,2),
  logic_stability_by_regime JSONB DEFAULT '{}'::jsonb,
  recommended_action TEXT CHECK (recommended_action IN ('ALLOW', 'THROTTLE', 'REVIEW_REQUIRED', 'EXECUTION_FREEZE')) NOT NULL,
  window_trades INTEGER NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add health_status column to strategies table
ALTER TABLE public.strategies 
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'UNKNOWN',
ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMPTZ;

-- Enable RLS on all new tables
ALTER TABLE public.trade_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_health_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for trade_attributions
CREATE POLICY "Users can view their own trade attributions"
ON public.trade_attributions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trade attributions"
ON public.trade_attributions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trade attributions"
ON public.trade_attributions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trade attributions"
ON public.trade_attributions FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for behavior_signals
CREATE POLICY "Users can view their own behavior signals"
ON public.behavior_signals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own behavior signals"
ON public.behavior_signals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behavior signals"
ON public.behavior_signals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own behavior signals"
ON public.behavior_signals FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for strategy_health_reports
CREATE POLICY "Users can view their own health reports"
ON public.strategy_health_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health reports"
ON public.strategy_health_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health reports"
ON public.strategy_health_reports FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health reports"
ON public.strategy_health_reports FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_trade_attributions_strategy ON public.trade_attributions(strategy_id);
CREATE INDEX idx_trade_attributions_user ON public.trade_attributions(user_id);
CREATE INDEX idx_trade_attributions_timestamp ON public.trade_attributions(timestamp DESC);
CREATE INDEX idx_behavior_signals_strategy ON public.behavior_signals(strategy_id);
CREATE INDEX idx_behavior_signals_user ON public.behavior_signals(user_id);
CREATE INDEX idx_strategy_health_reports_strategy ON public.strategy_health_reports(strategy_id);
CREATE INDEX idx_strategy_health_reports_user ON public.strategy_health_reports(user_id);
CREATE INDEX idx_strategy_health_reports_generated ON public.strategy_health_reports(generated_at DESC);