-- =====================================================
-- PHASE 1: ML Stock Ranking Tables
-- =====================================================

-- Stock rankings table
CREATE TABLE public.stock_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  company_name TEXT,
  rank_score NUMERIC(5,2),
  momentum_score NUMERIC(5,2),
  value_score NUMERIC(5,2),
  quality_score NUMERIC(5,2),
  volatility_score NUMERIC(5,2),
  sector TEXT,
  market_cap_tier TEXT,
  ai_analysis TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own rankings"
  ON public.stock_rankings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rankings"
  ON public.stock_rankings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rankings"
  ON public.stock_rankings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rankings"
  ON public.stock_rankings FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_stock_rankings_user_id ON public.stock_rankings(user_id);
CREATE INDEX idx_stock_rankings_symbol ON public.stock_rankings(symbol);

-- =====================================================
-- PHASE 2: Live Trading Tables
-- =====================================================

-- Broker connections table
CREATE TABLE public.broker_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  broker_name TEXT NOT NULL,
  api_key_encrypted TEXT,
  access_token_encrypted TEXT,
  token_expiry TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own connections"
  ON public.broker_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own connections"
  ON public.broker_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
  ON public.broker_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
  ON public.broker_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Live trading configurations
CREATE TABLE public.live_trading_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
  broker_connection_id UUID REFERENCES public.broker_connections(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  max_position_size NUMERIC(12,2),
  daily_loss_limit NUMERIC(12,2),
  risk_acknowledged BOOLEAN DEFAULT false,
  risk_acknowledged_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_trading_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own configs"
  ON public.live_trading_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own configs"
  ON public.live_trading_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configs"
  ON public.live_trading_configs FOR UPDATE
  USING (auth.uid() = user_id);

-- Live orders table
CREATE TABLE public.live_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  strategy_id UUID REFERENCES public.strategies(id),
  broker_connection_id UUID REFERENCES public.broker_connections(id),
  broker_order_id TEXT,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  order_type TEXT NOT NULL,
  quantity NUMERIC(12,4) NOT NULL,
  price NUMERIC(12,4),
  status TEXT DEFAULT 'pending',
  filled_quantity NUMERIC(12,4),
  average_price NUMERIC(12,4),
  placed_at TIMESTAMPTZ DEFAULT now(),
  executed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own orders"
  ON public.live_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.live_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON public.live_orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_live_orders_user_id ON public.live_orders(user_id);
CREATE INDEX idx_live_orders_status ON public.live_orders(status);

-- =====================================================
-- PHASE 3: B2B Organizations Tables
-- =====================================================

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  max_members INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organization members
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Organization invites
CREATE TABLE public.organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Shared strategies within org
CREATE TABLE public.organization_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID NOT NULL,
  permissions JSONB DEFAULT '{"view": true, "edit": false, "backtest": true}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, strategy_id)
);

-- Enable RLS
ALTER TABLE public.organization_strategies ENABLE ROW LEVEL SECURITY;

-- Helper function to check org membership
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = _user_id
  )
$$;

-- Helper function to check org admin
CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id 
      AND user_id = _user_id 
      AND role IN ('owner', 'admin')
  )
$$;

-- RLS Policies for organizations
CREATE POLICY "Members can view their orgs"
  ON public.organizations FOR SELECT
  USING (public.is_org_member(id, auth.uid()));

CREATE POLICY "Admins can update their orgs"
  ON public.organizations FOR UPDATE
  USING (public.is_org_admin(id, auth.uid()));

-- RLS Policies for organization_members
CREATE POLICY "Members can view org members"
  ON public.organization_members FOR SELECT
  USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Admins can insert org members"
  ON public.organization_members FOR INSERT
  WITH CHECK (public.is_org_admin(organization_id, auth.uid()));

CREATE POLICY "Admins can delete org members"
  ON public.organization_members FOR DELETE
  USING (public.is_org_admin(organization_id, auth.uid()));

-- Allow users to insert themselves as owner when creating org
CREATE POLICY "Users can create orgs"
  ON public.organizations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can add themselves as owner"
  ON public.organization_members FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'owner');

-- RLS Policies for organization_invites
CREATE POLICY "Admins can view org invites"
  ON public.organization_invites FOR SELECT
  USING (public.is_org_admin(organization_id, auth.uid()));

CREATE POLICY "Admins can create org invites"
  ON public.organization_invites FOR INSERT
  WITH CHECK (public.is_org_admin(organization_id, auth.uid()));

CREATE POLICY "Admins can delete org invites"
  ON public.organization_invites FOR DELETE
  USING (public.is_org_admin(organization_id, auth.uid()));

-- RLS Policies for organization_strategies
CREATE POLICY "Members can view shared strategies"
  ON public.organization_strategies FOR SELECT
  USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Admins can share strategies"
  ON public.organization_strategies FOR INSERT
  WITH CHECK (public.is_org_admin(organization_id, auth.uid()));

CREATE POLICY "Admins can unshare strategies"
  ON public.organization_strategies FOR DELETE
  USING (public.is_org_admin(organization_id, auth.uid()));

-- Index for faster lookups
CREATE INDEX idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_org_strategies_org_id ON public.organization_strategies(organization_id);

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broker_connections_updated_at
  BEFORE UPDATE ON public.broker_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_live_trading_configs_updated_at
  BEFORE UPDATE ON public.live_trading_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();