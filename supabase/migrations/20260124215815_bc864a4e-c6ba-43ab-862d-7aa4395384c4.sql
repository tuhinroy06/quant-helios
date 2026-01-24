-- Create screener presets table
CREATE TABLE public.screener_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX idx_screener_presets_user ON public.screener_presets(user_id);

-- Enable RLS
ALTER TABLE public.screener_presets ENABLE ROW LEVEL SECURITY;

-- Users can only see their own presets
CREATE POLICY "Users can view own presets" 
  ON public.screener_presets 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own presets
CREATE POLICY "Users can create own presets" 
  ON public.screener_presets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own presets
CREATE POLICY "Users can update own presets" 
  ON public.screener_presets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own presets
CREATE POLICY "Users can delete own presets" 
  ON public.screener_presets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_screener_presets_updated_at
  BEFORE UPDATE ON public.screener_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();