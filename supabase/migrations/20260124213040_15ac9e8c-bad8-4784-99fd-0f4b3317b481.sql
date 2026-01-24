-- ============================================================================
-- UNIFIED BEHAVIOR & EXPLANATION ENGINE - Schema Enhancement
-- Enhance existing tables and add new ones for behavior detection
-- ============================================================================

-- Add missing columns to trade_explanations table
ALTER TABLE public.trade_explanations 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.paper_accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS observations JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS market_context TEXT,
  ADD COLUMN IF NOT EXISTS causation TEXT,
  ADD COLUMN IF NOT EXISTS risk_interaction TEXT,
  ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS behaviors JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS trade_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_pnl DECIMAL(15, 2);

-- Add check constraint for severity if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'trade_explanations_severity_check'
  ) THEN
    ALTER TABLE public.trade_explanations 
      ADD CONSTRAINT trade_explanations_severity_check 
      CHECK (severity IS NULL OR severity IN ('low', 'medium', 'high'));
  END IF;
END $$;

-- Enable RLS on trade_explanations if not already enabled
ALTER TABLE public.trade_explanations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own explanations" ON public.trade_explanations;
DROP POLICY IF EXISTS "Users can create their own explanations" ON public.trade_explanations;
DROP POLICY IF EXISTS "Users can delete their own explanations" ON public.trade_explanations;

CREATE POLICY "Users can view their own explanations"
  ON public.trade_explanations
  FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create their own explanations"
  ON public.trade_explanations
  FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can delete their own explanations"
  ON public.trade_explanations
  FOR DELETE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_trade_explanations_user_id ON public.trade_explanations(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_explanations_strategy_id ON public.trade_explanations(strategy_id);
CREATE INDEX IF NOT EXISTS idx_trade_explanations_severity ON public.trade_explanations(severity);

-- Add category column to behavior_signals if not exists
ALTER TABLE public.behavior_signals 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS trade_id UUID;

-- Streak analyses table
CREATE TABLE IF NOT EXISTS public.streak_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.paper_accounts(id) ON DELETE SET NULL,
  
  -- Streak identification
  streak_type TEXT NOT NULL DEFAULT 'mixed',
  streak_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  streak_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trade_count INTEGER NOT NULL DEFAULT 0,
  trade_ids JSONB NOT NULL DEFAULT '[]',
  
  -- Streak metrics
  total_pnl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  avg_pnl DECIMAL(15, 2),
  avg_volatility DECIMAL(10, 6),
  
  -- Explanation reference
  explanation_id UUID,
  
  -- Detected behaviors
  behaviors JSONB NOT NULL DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on streak_analyses
ALTER TABLE public.streak_analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies for streak_analyses
CREATE POLICY "Users can view their own streak analyses"
  ON public.streak_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own streak analyses"
  ON public.streak_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streak analyses"
  ON public.streak_analyses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for streak_analyses
CREATE INDEX IF NOT EXISTS idx_streak_analyses_user_id ON public.streak_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_analyses_strategy_id ON public.streak_analyses(strategy_id);
CREATE INDEX IF NOT EXISTS idx_streak_analyses_type ON public.streak_analyses(streak_type);