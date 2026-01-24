-- Control States: Current state of each target (strategy, user, broker, global)
CREATE TABLE public.control_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('STRATEGY', 'USER', 'BROKER', 'GLOBAL')),
  target_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (state IN ('ACTIVE', 'THROTTLED', 'FROZEN', 'KILLED')),
  last_transition_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(scope, target_id)
);

-- Control Signals: Incoming signals that trigger control decisions
CREATE TABLE public.control_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('RECONCILIATION', 'STRATEGY_HEALTH', 'BEHAVIOR', 'EXECUTION', 'RISK', 'MANUAL')),
  severity DECIMAL(3,2) NOT NULL CHECK (severity >= 0 AND severity <= 1),
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  scope TEXT NOT NULL CHECK (scope IN ('STRATEGY', 'USER', 'BROKER', 'GLOBAL')),
  target_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Control Decisions: Complete audit trail of all control decisions
CREATE TABLE public.control_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id TEXT NOT NULL UNIQUE,
  scope TEXT NOT NULL CHECK (scope IN ('STRATEGY', 'USER', 'BROKER', 'GLOBAL')),
  target_id TEXT NOT NULL,
  previous_state TEXT NOT NULL CHECK (previous_state IN ('ACTIVE', 'THROTTLED', 'FROZEN', 'KILLED')),
  new_state TEXT NOT NULL CHECK (new_state IN ('ACTIVE', 'THROTTLED', 'FROZEN', 'KILLED')),
  reason TEXT NOT NULL,
  signals JSONB DEFAULT '[]',
  requires_manual_reset BOOLEAN DEFAULT false,
  global_kill_override BOOLEAN DEFAULT false,
  decided_at TIMESTAMPTZ NOT NULL,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_control_states_scope_target ON public.control_states(scope, target_id);
CREATE INDEX idx_control_states_state ON public.control_states(state);
CREATE INDEX idx_control_signals_scope_target ON public.control_signals(scope, target_id);
CREATE INDEX idx_control_signals_created ON public.control_signals(created_at DESC);
CREATE INDEX idx_control_decisions_scope_target ON public.control_decisions(scope, target_id);
CREATE INDEX idx_control_decisions_decided ON public.control_decisions(decided_at DESC);

-- Enable RLS
ALTER TABLE public.control_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_decisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for control_states
-- Users can read their own strategy/user states + global state
CREATE POLICY "Users can read own and global control states"
ON public.control_states FOR SELECT
USING (
  scope = 'GLOBAL' OR
  (scope = 'USER' AND target_id = auth.uid()::text) OR
  (scope = 'STRATEGY' AND target_id IN (
    SELECT id::text FROM public.strategies WHERE user_id = auth.uid()
  ))
);

-- Only service role can modify control states
CREATE POLICY "Service role can manage control states"
ON public.control_states FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for control_signals
CREATE POLICY "Users can read own signals"
ON public.control_signals FOR SELECT
USING (
  scope = 'GLOBAL' OR
  (scope = 'USER' AND target_id = auth.uid()::text) OR
  (scope = 'STRATEGY' AND target_id IN (
    SELECT id::text FROM public.strategies WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Service role can manage control signals"
ON public.control_signals FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for control_decisions
CREATE POLICY "Users can read own decisions"
ON public.control_decisions FOR SELECT
USING (
  scope = 'GLOBAL' OR
  (scope = 'USER' AND target_id = auth.uid()::text) OR
  (scope = 'STRATEGY' AND target_id IN (
    SELECT id::text FROM public.strategies WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Service role can manage control decisions"
ON public.control_decisions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger to update updated_at
CREATE TRIGGER update_control_states_updated_at
BEFORE UPDATE ON public.control_states
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();