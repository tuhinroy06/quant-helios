-- ============================================================================
-- RECONCILIATION ENGINE TABLES - Institution Grade
-- Supports all 15 critical requirements
-- ============================================================================

-- Repair Records Table (Immutable Audit Log - Write Once)
CREATE TABLE public.reconciliation_repair_records (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    repair_id text NOT NULL UNIQUE,
    timestamp timestamptz NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    strategy_id uuid,
    broker_account_id text NOT NULL,
    diff_status text NOT NULL,
    diff_severity text NOT NULL CHECK (diff_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    action_taken text NOT NULL,
    mode text NOT NULL CHECK (mode IN ('OBSERVE', 'REPAIR', 'MANUAL')),
    was_applied boolean NOT NULL DEFAULT false,
    confidence text NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    reason text NOT NULL,
    description text NOT NULL,
    side_effects jsonb NOT NULL DEFAULT '[]'::jsonb,
    fingerprint text NOT NULL,
    monetary_impact numeric DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fingerprint deduplication
CREATE INDEX idx_repair_records_fingerprint ON public.reconciliation_repair_records(fingerprint);
CREATE INDEX idx_repair_records_strategy ON public.reconciliation_repair_records(strategy_id);
CREATE INDEX idx_repair_records_user ON public.reconciliation_repair_records(user_id);
CREATE INDEX idx_repair_records_timestamp ON public.reconciliation_repair_records(timestamp DESC);
CREATE INDEX idx_repair_records_severity ON public.reconciliation_repair_records(diff_severity);

-- Broker Fills Table (Normalized fills from broker)
CREATE TABLE public.reconciliation_broker_fills (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    fill_id text NOT NULL,
    broker_order_id text NOT NULL,
    symbol text NOT NULL,
    side text NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity numeric NOT NULL,
    price numeric NOT NULL,
    commission numeric DEFAULT 0,
    timestamp timestamptz NOT NULL,
    broker_name text NOT NULL,
    user_id uuid NOT NULL,
    strategy_id uuid,
    broker_account_id text NOT NULL,
    is_reconciled boolean DEFAULT false,
    reconciled_at timestamptz,
    raw_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(broker_name, fill_id)
);

CREATE INDEX idx_broker_fills_user ON public.reconciliation_broker_fills(user_id);
CREATE INDEX idx_broker_fills_timestamp ON public.reconciliation_broker_fills(timestamp DESC);
CREATE INDEX idx_broker_fills_reconciled ON public.reconciliation_broker_fills(is_reconciled);
CREATE INDEX idx_broker_fills_symbol ON public.reconciliation_broker_fills(symbol);

-- Capital Snapshots Table (Non-derivative - direct broker query)
CREATE TABLE public.reconciliation_capital_snapshots (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    broker_account_id text NOT NULL,
    broker_name text NOT NULL,
    total_equity numeric NOT NULL,
    cash_balance numeric NOT NULL,
    used_margin numeric DEFAULT 0,
    available_capital numeric NOT NULL,
    positions_value numeric DEFAULT 0,
    unrealized_pnl numeric DEFAULT 0,
    snapshot_timestamp timestamptz NOT NULL,
    is_reconciled boolean DEFAULT false,
    internal_equity numeric,
    discrepancy numeric DEFAULT 0,
    discrepancy_pct numeric DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_capital_snapshots_user ON public.reconciliation_capital_snapshots(user_id);
CREATE INDEX idx_capital_snapshots_timestamp ON public.reconciliation_capital_snapshots(snapshot_timestamp DESC);
CREATE INDEX idx_capital_snapshots_account ON public.reconciliation_capital_snapshots(broker_account_id);

-- Escalation Events Table
CREATE TABLE public.reconciliation_escalation_events (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id text NOT NULL UNIQUE,
    timestamp timestamptz NOT NULL DEFAULT now(),
    severity text NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    strategy_id uuid,
    user_id uuid NOT NULL,
    broker_account_id text NOT NULL,
    reason text NOT NULL,
    action_taken text NOT NULL,
    diff_count integer DEFAULT 1,
    is_resolved boolean DEFAULT false,
    resolved_at timestamptz,
    resolved_by uuid,
    resolution_notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_escalation_events_user ON public.reconciliation_escalation_events(user_id);
CREATE INDEX idx_escalation_events_severity ON public.reconciliation_escalation_events(severity);
CREATE INDEX idx_escalation_events_resolved ON public.reconciliation_escalation_events(is_resolved);
CREATE INDEX idx_escalation_events_timestamp ON public.reconciliation_escalation_events(timestamp DESC);

-- Strategy Freeze States Table (tracks frozen strategies)
CREATE TABLE public.reconciliation_freeze_states (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    scope text NOT NULL CHECK (scope IN ('GLOBAL', 'STRATEGY', 'USER', 'ACCOUNT')),
    target_id text NOT NULL,
    is_frozen boolean NOT NULL DEFAULT true,
    frozen_at timestamptz NOT NULL DEFAULT now(),
    frozen_reason text NOT NULL,
    frozen_by text,
    unfrozen_at timestamptz,
    unfrozen_by uuid,
    requires_manual_reset boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(scope, target_id)
);

CREATE INDEX idx_freeze_states_frozen ON public.reconciliation_freeze_states(is_frozen);
CREATE INDEX idx_freeze_states_scope ON public.reconciliation_freeze_states(scope);

-- Reconciliation Cycles Table (tracks each run)
CREATE TABLE public.reconciliation_cycles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cycle_number integer NOT NULL,
    user_id uuid,
    mode text NOT NULL CHECK (mode IN ('OBSERVE', 'REPAIR', 'MANUAL')),
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'blocked')),
    fills_checked integer DEFAULT 0,
    orders_checked integer DEFAULT 0,
    positions_checked integer DEFAULT 0,
    capital_checked boolean DEFAULT false,
    diffs_found integer DEFAULT 0,
    repairs_applied integer DEFAULT 0,
    escalations_created integer DEFAULT 0,
    global_freeze_triggered boolean DEFAULT false,
    error_message text,
    metrics jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reconciliation_cycles_user ON public.reconciliation_cycles(user_id);
CREATE INDEX idx_reconciliation_cycles_status ON public.reconciliation_cycles(status);
CREATE INDEX idx_reconciliation_cycles_started ON public.reconciliation_cycles(started_at DESC);

-- Fingerprint Deduplication Cache (TTL-based)
CREATE TABLE public.reconciliation_fingerprint_cache (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    fingerprint text NOT NULL UNIQUE,
    applied_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    user_id uuid,
    strategy_id uuid,
    diff_type text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fingerprint_cache_expires ON public.reconciliation_fingerprint_cache(expires_at);
CREATE INDEX idx_fingerprint_cache_fingerprint ON public.reconciliation_fingerprint_cache(fingerprint);

-- Enable RLS on all tables
ALTER TABLE public.reconciliation_repair_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_broker_fills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_capital_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_escalation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_freeze_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_fingerprint_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for repair_records (immutable - no update/delete)
CREATE POLICY "Service role can insert repair records"
ON public.reconciliation_repair_records FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own repair records"
ON public.reconciliation_repair_records FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all repair records"
ON public.reconciliation_repair_records FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for broker_fills
CREATE POLICY "Users can manage their own broker fills"
ON public.reconciliation_broker_fills FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for capital_snapshots
CREATE POLICY "Users can manage their own capital snapshots"
ON public.reconciliation_capital_snapshots FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for escalation_events
CREATE POLICY "Users can view their own escalation events"
ON public.reconciliation_escalation_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert escalation events"
ON public.reconciliation_escalation_events FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage all escalation events"
ON public.reconciliation_escalation_events FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for freeze_states (service role only for modifications)
CREATE POLICY "Users can view freeze states affecting them"
ON public.reconciliation_freeze_states FOR SELECT
TO authenticated
USING (
    scope = 'GLOBAL' OR 
    (scope = 'USER' AND target_id = auth.uid()::text) OR
    (scope = 'STRATEGY' AND target_id IN (
        SELECT id::text FROM strategies WHERE user_id = auth.uid()
    ))
);

CREATE POLICY "Service role can manage freeze states"
ON public.reconciliation_freeze_states FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') = 'service_role');

-- RLS Policies for reconciliation_cycles
CREATE POLICY "Users can view their own cycles"
ON public.reconciliation_cycles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can manage cycles"
ON public.reconciliation_cycles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for fingerprint_cache
CREATE POLICY "Users can manage their own fingerprints"
ON public.reconciliation_fingerprint_cache FOR ALL
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Cleanup function for expired fingerprints
CREATE OR REPLACE FUNCTION public.cleanup_expired_fingerprints()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.reconciliation_fingerprint_cache
    WHERE expires_at < now();
END;
$$;