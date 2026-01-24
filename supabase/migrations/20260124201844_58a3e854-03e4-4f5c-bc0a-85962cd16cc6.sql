-- ============================================================================
-- COMPLETE ML PAPER TRADING SYSTEM - ALL 16 FEATURES DATABASE SCHEMA
-- ============================================================================

-- ============================================================================
-- FEATURE 1: TRANSACTION COSTS (India-specific)
-- ============================================================================

CREATE TABLE public.transaction_cost_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  brokerage_pct DECIMAL(8,6) NOT NULL DEFAULT 0.0003, -- 0.03%
  max_brokerage_per_order DECIMAL(10,2) NOT NULL DEFAULT 20.00,
  stt_sell_pct DECIMAL(8,6) NOT NULL DEFAULT 0.00025, -- 0.025% (STT on sell)
  exchange_txn_charge_pct DECIMAL(10,8) NOT NULL DEFAULT 0.0000325, -- NSE charges
  gst_pct DECIMAL(5,4) NOT NULL DEFAULT 0.18, -- 18% GST
  stamp_duty_pct DECIMAL(8,6) NOT NULL DEFAULT 0.00015, -- 0.015%
  sebi_charge_pct DECIMAL(12,10) NOT NULL DEFAULT 0.000001, -- Rs.10 per crore
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- FEATURE 2: CAPITAL ALLOCATION ENGINE
-- ============================================================================

CREATE TABLE public.strategy_capital_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.paper_accounts(id) ON DELETE CASCADE NOT NULL,
  strategy TEXT NOT NULL CHECK (strategy IN ('MOMENTUM', 'MEAN_REVERSION', 'TREND_FOLLOWING', 'BREAKOUT', 'SCALPING')),
  allocated_pct DECIMAL(5,2) NOT NULL CHECK (allocated_pct >= 0 AND allocated_pct <= 100),
  allocated_capital DECIMAL(15,2) NOT NULL DEFAULT 0,
  used_capital DECIMAL(15,2) NOT NULL DEFAULT 0,
  max_drawdown_pct DECIMAL(5,2) NOT NULL DEFAULT 10.0,
  peak_capital DECIMAL(15,2) NOT NULL DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, strategy)
);

-- ============================================================================
-- FEATURE 3: POSITION SIZING CONFIG
-- ============================================================================

CREATE TABLE public.position_sizing_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
  risk_per_trade_pct DECIMAL(5,2) NOT NULL DEFAULT 1.0, -- 1% risk per trade
  min_position_size INTEGER NOT NULL DEFAULT 1,
  max_position_size INTEGER NOT NULL DEFAULT 10000,
  use_atr_stops BOOLEAN DEFAULT true,
  atr_multiplier DECIMAL(4,2) DEFAULT 2.0,
  confidence_weighting BOOLEAN DEFAULT true,
  volatility_adjustment BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- FEATURE 4: STATE PERSISTENCE (System State Snapshots)
-- ============================================================================

CREATE TABLE public.trading_state_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.paper_accounts(id) ON DELETE CASCADE NOT NULL,
  config_hash TEXT NOT NULL, -- For immutability verification
  config_run_id TEXT NOT NULL,
  cash DECIMAL(15,2) NOT NULL,
  equity DECIMAL(15,2) NOT NULL,
  positions JSONB DEFAULT '{}',
  open_orders JSONB DEFAULT '{}',
  strategy_allocations JSONB DEFAULT '{}',
  kill_switch_state JSONB DEFAULT '{}',
  ml_state JSONB DEFAULT '{}',
  trades_count INTEGER DEFAULT 0,
  is_latest BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- FEATURE 5: EXECUTION CONFIGS (Backtest/Paper/Live Consistency)
-- ============================================================================

CREATE TABLE public.execution_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  broker_mode TEXT NOT NULL CHECK (broker_mode IN ('PAPER', 'LIVE')) DEFAULT 'PAPER',
  data_mode TEXT NOT NULL CHECK (data_mode IN ('SIMULATED', 'LIVE', 'REPLAY')) DEFAULT 'SIMULATED',
  latency_ms INTEGER DEFAULT 100,
  slippage_bps INTEGER DEFAULT 5,
  use_transaction_costs BOOLEAN DEFAULT true,
  partial_fills_enabled BOOLEAN DEFAULT true,
  partial_fill_rate DECIMAL(3,2) DEFAULT 0.20,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- FEATURE 7: STRATEGY VERSIONING
-- ============================================================================

-- strategy_versions table already exists, add frozen flag
ALTER TABLE public.strategy_versions 
ADD COLUMN IF NOT EXISTS frozen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS performance_metrics JSONB DEFAULT '{}';

-- ============================================================================
-- FEATURE 9-11: PRODUCTION HARDENING
-- ============================================================================

-- Config Immutability (Feature 11)
CREATE TABLE public.immutable_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.paper_accounts(id) ON DELETE CASCADE NOT NULL,
  run_id TEXT NOT NULL UNIQUE,
  config_hash TEXT NOT NULL,
  config_data JSONB NOT NULL,
  time_source TEXT DEFAULT 'SYSTEM_TIME',
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Data Integrity Violations Log (Feature 10)
CREATE TABLE public.data_integrity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  error_code TEXT NOT NULL,
  error_message TEXT,
  tick_price DECIMAL(15,4),
  tick_volume INTEGER,
  tick_timestamp BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- FEATURE 12: LIVE SAFETY MODE
-- ============================================================================

CREATE TABLE public.live_safety_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  days_active INTEGER DEFAULT 0,
  position_size_multiplier DECIMAL(4,2) DEFAULT 0.25, -- 25% of normal
  max_concurrent_positions INTEGER DEFAULT 1,
  max_daily_loss_override DECIMAL(12,2) DEFAULT 2500.00,
  max_drawdown_override DECIMAL(5,2) DEFAULT 5.0,
  disable_auto_reenable BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- FEATURE 13: SYSTEM MONITORING
-- ============================================================================

CREATE TABLE public.system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  cpu_percent DECIMAL(5,2),
  memory_percent DECIMAL(5,2),
  disk_percent DECIMAL(5,2),
  disk_free_gb DECIMAL(8,2),
  is_healthy BOOLEAN DEFAULT true,
  warnings JSONB DEFAULT '[]',
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- FEATURE 14: MULTI-ACCOUNT ISOLATION
-- ============================================================================

CREATE TABLE public.trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('PAPER', 'LIVE')) DEFAULT 'PAPER',
  initial_cash DECIMAL(15,2) NOT NULL DEFAULT 500000,
  current_cash DECIMAL(15,2) NOT NULL DEFAULT 500000,
  broker_session_id TEXT,
  isolation_mode TEXT CHECK (isolation_mode IN ('THREAD', 'PROCESS')) DEFAULT 'THREAD',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- FEATURE 15: OPS-LEVEL SAFETY
-- ============================================================================

CREATE TABLE public.emergency_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('EMERGENCY_FLATTEN', 'KILL_SWITCH', 'MANUAL_HALT', 'SYSTEM_ERROR')),
  reason TEXT NOT NULL,
  positions_closed INTEGER DEFAULT 0,
  total_pnl DECIMAL(15,2),
  metadata JSONB DEFAULT '{}',
  activated_at TIMESTAMPTZ DEFAULT now()
);

-- Health Heartbeat (for external monitoring)
CREATE TABLE public.health_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'CRITICAL', 'OFFLINE')),
  system_health JSONB DEFAULT '{}',
  accounts_status JSONB DEFAULT '{}',
  uptime_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- FEATURE 16: LEGAL & AUDIT OUTPUT
-- ============================================================================

CREATE TABLE public.signed_trade_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.paper_accounts(id) ON DELETE CASCADE NOT NULL,
  trade_id UUID,
  trade_timestamp BIGINT NOT NULL,
  symbol TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  entry_price DECIMAL(15,4) NOT NULL,
  exit_price DECIMAL(15,4) NOT NULL,
  gross_pnl DECIMAL(15,2) NOT NULL,
  net_pnl DECIMAL(15,2) NOT NULL,
  total_costs DECIMAL(12,4) NOT NULL,
  strategy TEXT NOT NULL,
  exit_reason TEXT NOT NULL,
  config_hash TEXT NOT NULL,
  trade_hash TEXT NOT NULL, -- SHA256 of trade data
  signature TEXT NOT NULL, -- HMAC signature
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.signed_daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.paper_accounts(id) ON DELETE CASCADE NOT NULL,
  summary_date DATE NOT NULL,
  num_trades INTEGER NOT NULL DEFAULT 0,
  total_gross_pnl DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_net_pnl DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_costs DECIMAL(15,2) NOT NULL DEFAULT 0,
  final_equity DECIMAL(15,2) NOT NULL,
  final_cash DECIMAL(15,2) NOT NULL,
  max_drawdown DECIMAL(5,2),
  trade_hashes JSONB DEFAULT '[]',
  summary_data JSONB NOT NULL,
  data_hash TEXT NOT NULL, -- SHA256 of summary
  signature TEXT NOT NULL, -- HMAC signature
  config_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, summary_date)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_strategy_allocations_account ON public.strategy_capital_allocations(account_id);
CREATE INDEX idx_trading_snapshots_account ON public.trading_state_snapshots(account_id, created_at DESC);
CREATE INDEX idx_immutable_configs_run ON public.immutable_configs(run_id);
CREATE INDEX idx_data_integrity_logs_symbol ON public.data_integrity_logs(symbol, created_at DESC);
CREATE INDEX idx_signed_ledger_account ON public.signed_trade_ledger(account_id, trade_timestamp DESC);
CREATE INDEX idx_daily_summaries_account ON public.signed_daily_summaries(account_id, summary_date DESC);
CREATE INDEX idx_health_heartbeats_account ON public.health_heartbeats(account_id, created_at DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.transaction_cost_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_capital_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_sizing_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_state_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immutable_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_integrity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_safety_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signed_trade_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signed_daily_summaries ENABLE ROW LEVEL SECURITY;

-- Users can manage their own data
CREATE POLICY "Users manage own transaction costs" ON public.transaction_cost_configs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own capital allocations" ON public.strategy_capital_allocations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own position sizing" ON public.position_sizing_configs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own state snapshots" ON public.trading_state_snapshots
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own execution configs" ON public.execution_configs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own immutable configs" ON public.immutable_configs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users view own integrity logs" ON public.data_integrity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own safety configs" ON public.live_safety_configs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users view system health" ON public.system_health_logs
  FOR SELECT USING (true);

CREATE POLICY "Users manage own trading accounts" ON public.trading_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users view own emergency events" ON public.emergency_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view health heartbeats" ON public.health_heartbeats
  FOR SELECT USING (true);

CREATE POLICY "Users view own signed ledger" ON public.signed_trade_ledger
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own daily summaries" ON public.signed_daily_summaries
  FOR SELECT USING (auth.uid() = user_id);