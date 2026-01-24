-- Create stoxo_conversations table for chat history persistence
CREATE TABLE public.stoxo_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stoxo_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own conversations
CREATE POLICY "Users can view their own conversations"
ON public.stoxo_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.stoxo_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.stoxo_conversations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.stoxo_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_stoxo_conversations_updated_at
BEFORE UPDATE ON public.stoxo_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster user queries
CREATE INDEX idx_stoxo_conversations_user_id ON public.stoxo_conversations(user_id);
CREATE INDEX idx_stoxo_conversations_last_message ON public.stoxo_conversations(user_id, last_message_at DESC);