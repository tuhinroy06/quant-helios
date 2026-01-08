
-- =============================================
-- PHASE 1: AlgoTrade Pro Database Schema
-- =============================================

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('retail', 'pro', 'b2b_admin', 'b2b_member', 'admin');

-- 2. User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'retail',
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- 4. Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.user_roles
    WHERE user_id = _user_id
    ORDER BY CASE role
        WHEN 'admin' THEN 1
        WHEN 'b2b_admin' THEN 2
        WHEN 'pro' THEN 3
        WHEN 'b2b_member' THEN 4
        WHEN 'retail' THEN 5
    END
    LIMIT 1
$$;

-- 5. Trigger to auto-assign retail role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'retail');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- RLS for user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- STRATEGIES TABLE
-- =============================================

CREATE TABLE public.strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'backtested', 'paper_trading', 'live', 'archived')),
    market_type TEXT NOT NULL CHECK (market_type IN ('cash', 'crypto', 'fno')),
    timeframe TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    entry_rules JSONB NOT NULL DEFAULT '[]',
    exit_rules JSONB NOT NULL DEFAULT '[]',
    position_sizing JSONB DEFAULT '{}',
    risk_limits JSONB DEFAULT '{}',
    validation_result JSONB,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own strategies"
    ON public.strategies FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view public strategies"
    ON public.strategies FOR SELECT
    TO authenticated
    USING (is_public = true);

CREATE POLICY "Users can create their own strategies"
    ON public.strategies FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies"
    ON public.strategies FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies"
    ON public.strategies FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE TRIGGER update_strategies_updated_at
    BEFORE UPDATE ON public.strategies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- STRATEGY VERSIONS (Immutable History)
-- =============================================

CREATE TABLE public.strategy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE NOT NULL,
    version INTEGER NOT NULL,
    config_snapshot JSONB NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.strategy_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their strategies"
    ON public.strategy_versions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.strategies s
            WHERE s.id = strategy_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create versions for their strategies"
    ON public.strategy_versions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.strategies s
            WHERE s.id = strategy_id AND s.user_id = auth.uid()
        )
    );

-- =============================================
-- BACKTEST RESULTS
-- =============================================

CREATE TABLE public.backtest_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    strategy_version INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    parameters JSONB NOT NULL DEFAULT '{}',
    results JSONB,
    metrics JSONB,
    equity_curve JSONB,
    trade_log JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.backtest_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own backtest results"
    ON public.backtest_results FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create backtest results"
    ON public.backtest_results FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backtest results"
    ON public.backtest_results FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- =============================================
-- PAPER TRADING
-- =============================================

CREATE TABLE public.paper_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT DEFAULT 'Default Account',
    initial_balance DECIMAL(15,2) DEFAULT 100000.00,
    current_balance DECIMAL(15,2) DEFAULT 100000.00,
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.paper_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own paper accounts"
    ON public.paper_accounts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own paper accounts"
    ON public.paper_accounts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own paper accounts"
    ON public.paper_accounts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own paper accounts"
    ON public.paper_accounts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE TRIGGER update_paper_accounts_updated_at
    BEFORE UPDATE ON public.paper_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.paper_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.paper_accounts(id) ON DELETE CASCADE NOT NULL,
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
    order_type TEXT DEFAULT 'market' CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')),
    quantity DECIMAL(15,6) NOT NULL,
    entry_price DECIMAL(15,6) NOT NULL,
    exit_price DECIMAL(15,6),
    stop_loss DECIMAL(15,6),
    take_profit DECIMAL(15,6),
    status TEXT DEFAULT 'open' CHECK (status IN ('pending', 'open', 'closed', 'cancelled')),
    pnl DECIMAL(15,2),
    fees DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.paper_trades ENABLE ROW LEVEL SECURITY;

-- Function to check paper account ownership
CREATE OR REPLACE FUNCTION public.owns_paper_account(_account_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.paper_accounts
        WHERE id = _account_id AND user_id = auth.uid()
    )
$$;

CREATE POLICY "Users can view their own paper trades"
    ON public.paper_trades FOR SELECT
    TO authenticated
    USING (public.owns_paper_account(account_id));

CREATE POLICY "Users can create paper trades in their accounts"
    ON public.paper_trades FOR INSERT
    TO authenticated
    WITH CHECK (public.owns_paper_account(account_id));

CREATE POLICY "Users can update their own paper trades"
    ON public.paper_trades FOR UPDATE
    TO authenticated
    USING (public.owns_paper_account(account_id));

CREATE POLICY "Users can delete their own paper trades"
    ON public.paper_trades FOR DELETE
    TO authenticated
    USING (public.owns_paper_account(account_id));

-- =============================================
-- F&O SIMULATIONS (Gated)
-- =============================================

CREATE TABLE public.fno_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    instrument_type TEXT NOT NULL CHECK (instrument_type IN ('call', 'put', 'future', 'spread')),
    underlying TEXT NOT NULL,
    strike_price DECIMAL(15,2),
    expiry_date DATE,
    premium DECIMAL(15,2),
    lot_size INTEGER DEFAULT 1,
    quantity INTEGER DEFAULT 1,
    direction TEXT DEFAULT 'long' CHECK (direction IN ('long', 'short')),
    config JSONB NOT NULL DEFAULT '{}',
    payoff_data JSONB,
    greeks JSONB,
    max_profit DECIMAL(15,2),
    max_loss DECIMAL(15,2),
    breakeven_points JSONB,
    risk_acknowledged BOOLEAN DEFAULT false NOT NULL,
    risk_acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.fno_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own F&O simulations"
    ON public.fno_simulations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create F&O simulations"
    ON public.fno_simulations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own F&O simulations"
    ON public.fno_simulations FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own F&O simulations"
    ON public.fno_simulations FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE TRIGGER update_fno_simulations_updated_at
    BEFORE UPDATE ON public.fno_simulations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SUBSCRIPTION & BILLING
-- =============================================

CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'retail', 'pro', 'enterprise')),
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    region TEXT DEFAULT 'global',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Plans are publicly readable
CREATE POLICY "Anyone can view active subscription plans"
    ON public.subscription_plans FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
    ON public.subscription_plans FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'past_due')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
    ON public.user_subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
    ON public.user_subscriptions FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscriptions"
    ON public.user_subscriptions FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- AUDIT LOGS (Immutable)
-- =============================================

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Only system can insert audit logs (via security definer functions)
CREATE POLICY "System can insert audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION public.create_audit_log(
    _action TEXT,
    _resource_type TEXT,
    _resource_id UUID DEFAULT NULL,
    _old_values JSONB DEFAULT NULL,
    _new_values JSONB DEFAULT NULL,
    _details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, details)
    VALUES (auth.uid(), _action, _resource_type, _resource_id, _old_values, _new_values, _details)
    RETURNING id INTO _log_id;
    RETURN _log_id;
END;
$$;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_strategies_user_id ON public.strategies(user_id);
CREATE INDEX idx_strategies_status ON public.strategies(status);
CREATE INDEX idx_strategies_market_type ON public.strategies(market_type);
CREATE INDEX idx_strategy_versions_strategy_id ON public.strategy_versions(strategy_id);
CREATE INDEX idx_backtest_results_strategy_id ON public.backtest_results(strategy_id);
CREATE INDEX idx_backtest_results_user_id ON public.backtest_results(user_id);
CREATE INDEX idx_paper_accounts_user_id ON public.paper_accounts(user_id);
CREATE INDEX idx_paper_trades_account_id ON public.paper_trades(account_id);
CREATE INDEX idx_paper_trades_status ON public.paper_trades(status);
CREATE INDEX idx_fno_simulations_user_id ON public.fno_simulations(user_id);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =============================================
-- INSERT DEFAULT SUBSCRIPTION PLANS
-- =============================================

INSERT INTO public.subscription_plans (name, tier, price_monthly, price_yearly, features, limits) VALUES
('Free', 'free', 0, 0, 
    '{"strategies": true, "backtesting": true, "paper_trading": false, "fno": false, "ai_assistant": false}'::jsonb,
    '{"max_strategies": 3, "max_backtests_per_day": 5, "max_paper_accounts": 0}'::jsonb
),
('Retail', 'retail', 29, 290, 
    '{"strategies": true, "backtesting": true, "paper_trading": true, "fno": false, "ai_assistant": true}'::jsonb,
    '{"max_strategies": 10, "max_backtests_per_day": 50, "max_paper_accounts": 2}'::jsonb
),
('Pro', 'pro', 99, 990, 
    '{"strategies": true, "backtesting": true, "paper_trading": true, "fno": true, "ai_assistant": true, "priority_support": true}'::jsonb,
    '{"max_strategies": 50, "max_backtests_per_day": 500, "max_paper_accounts": 10}'::jsonb
),
('Enterprise', 'enterprise', NULL, NULL, 
    '{"strategies": true, "backtesting": true, "paper_trading": true, "fno": true, "ai_assistant": true, "priority_support": true, "dedicated_support": true, "custom_integrations": true, "team_management": true}'::jsonb,
    '{"max_strategies": -1, "max_backtests_per_day": -1, "max_paper_accounts": -1}'::jsonb
);
