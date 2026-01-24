-- Create table for storing trade explanations
CREATE TABLE IF NOT EXISTS public.trade_explanations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trade_id TEXT NOT NULL,
    explanation_type TEXT NOT NULL,
    explanation_text TEXT NOT NULL,
    attribution JSONB,
    sanitized_payload JSONB,
    validated BOOLEAN DEFAULT true,
    priority_score INTEGER DEFAULT 99,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(trade_id, explanation_type)
);

-- Enable RLS
ALTER TABLE public.trade_explanations ENABLE ROW LEVEL SECURITY;

-- Create policies for trade explanations
CREATE POLICY "Users can view trade explanations"
ON public.trade_explanations
FOR SELECT
USING (true);

CREATE POLICY "System can insert trade explanations"
ON public.trade_explanations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update trade explanations"
ON public.trade_explanations
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_trade_explanations_trade_id ON public.trade_explanations(trade_id);
CREATE INDEX idx_trade_explanations_type ON public.trade_explanations(explanation_type);

-- Add trigger for updated_at
CREATE TRIGGER update_trade_explanations_updated_at
BEFORE UPDATE ON public.trade_explanations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();