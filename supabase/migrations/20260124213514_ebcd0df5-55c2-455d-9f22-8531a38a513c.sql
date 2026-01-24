-- Attribution Reports table for storing deterministic causal attribution
CREATE TABLE public.attribution_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trade_id TEXT NOT NULL,
    user_id UUID NOT NULL,
    strategy_id TEXT NOT NULL,
    instrument TEXT NOT NULL,
    
    -- Outcome metrics
    realized_pnl DECIMAL NOT NULL,
    return_pct DECIMAL NOT NULL,
    duration_seconds INTEGER NOT NULL,
    entry_price DECIMAL NOT NULL,
    exit_price DECIMAL NOT NULL,
    quantity DECIMAL NOT NULL,
    
    -- Causal attribution
    primary_cause TEXT NOT NULL,
    execution_sub_type TEXT,
    contributing_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
    ruled_out_causes TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Counterfactuals
    counterfactuals JSONB DEFAULT '{}'::JSONB,
    
    -- Confidence and evidence
    confidence_score DECIMAL NOT NULL,
    evidence JSONB NOT NULL,
    
    -- Audit trail
    determinism_hash TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LLM Explanation Contracts table
CREATE TABLE public.llm_explanation_contracts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    attribution_report_id UUID REFERENCES public.attribution_reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Contract data
    allowed_facts JSONB NOT NULL,
    forbidden_topics TEXT[] NOT NULL,
    scope_contract JSONB,
    tone TEXT DEFAULT 'neutral',
    explanation_goals TEXT[] DEFAULT ARRAY[]::TEXT[],
    refusal_conditions JSONB DEFAULT '{}'::JSONB,
    required_references JSONB DEFAULT '{}'::JSONB,
    validation_requirements JSONB DEFAULT '{}'::JSONB,
    
    -- LLM response tracking
    llm_response TEXT,
    response_valid BOOLEAN,
    response_violations TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_attribution_reports_user_id ON public.attribution_reports(user_id);
CREATE INDEX idx_attribution_reports_trade_id ON public.attribution_reports(trade_id);
CREATE INDEX idx_attribution_reports_strategy_id ON public.attribution_reports(strategy_id);
CREATE INDEX idx_attribution_reports_primary_cause ON public.attribution_reports(primary_cause);
CREATE INDEX idx_llm_contracts_user_id ON public.llm_explanation_contracts(user_id);
CREATE INDEX idx_llm_contracts_attribution_id ON public.llm_explanation_contracts(attribution_report_id);

-- Enable RLS
ALTER TABLE public.attribution_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_explanation_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attribution_reports
CREATE POLICY "Users can view their own attribution reports"
ON public.attribution_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attribution reports"
ON public.attribution_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for llm_explanation_contracts
CREATE POLICY "Users can view their own LLM contracts"
ON public.llm_explanation_contracts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LLM contracts"
ON public.llm_explanation_contracts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LLM contracts"
ON public.llm_explanation_contracts FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_llm_contracts_updated_at
BEFORE UPDATE ON public.llm_explanation_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();