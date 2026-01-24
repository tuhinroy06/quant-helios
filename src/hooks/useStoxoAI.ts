import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  marketCap: string;
  pe?: number;
  pb?: number;
  roe?: number;
  dividendYield?: number;
  overallScore: number;
  momentumScore: number;
  valueScore: number;
  qualityScore: number;
  volatilityScore: number;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  analysis: string;
}

export interface SectorData {
  name: string;
  performance: number;
  topStocks: string[];
  avgPE: number;
  avgROE: number;
}

export interface ComparisonRow {
  symbol: string;
  name: string;
  price: number;
  pe: number;
  roe: number;
  oneYearReturn: number;
  dividendYield: number;
  score: number;
}

export interface ChartPoint {
  date: string;
  value: number;
  benchmark?: number;
}

export interface StoxoResponse {
  type: 'overview' | 'comparison' | 'sector' | 'analysis' | 'welcome';
  stocks?: StockData[];
  sectorData?: SectorData;
  comparisonTable?: ComparisonRow[];
  chartData?: ChartPoint[];
  insights: string;
  followUpPrompts: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: StoxoResponse;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessageAt: Date;
  messageCount: number;
}

// DbConversation type removed - using inline type assertions for JSON compatibility

const generateTitle = (content: string): string => {
  // Extract key topics from the first message
  const words = content.trim().split(/\s+/).slice(0, 6);
  let title = words.join(' ');
  if (title.length > 40) {
    title = title.substring(0, 37) + '...';
  }
  return title || 'New Conversation';
};

export const useStoxoAI = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setActiveConversationId(null);
    }
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingConversations(true);
    try {
      const { data, error } = await supabase
        .from('stoxo_conversations')
        .select('id, title, messages, last_message_at')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const convs: Conversation[] = (data || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        lastMessageAt: new Date(d.last_message_at),
        messageCount: Array.isArray(d.messages) ? d.messages.length : 0,
      }));
      
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user]);

  const loadConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('stoxo_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: 'Conversation not found',
          description: 'This conversation may have been deleted.',
          variant: 'destructive',
        });
        return;
      }

      // Parse messages from JSON
      const messagesData = data.messages as unknown as any[];
      const loadedMessages: ChatMessage[] = (messagesData || []).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));

      setMessages(loadedMessages);
      setActiveConversationId(conversationId);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast({
        title: 'Error loading conversation',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const saveConversation = useCallback(async (newMessages: ChatMessage[], isNew = false) => {
    if (!user || newMessages.length === 0) return;

    setIsSaving(true);
    try {
      const firstUserMessage = newMessages.find(m => m.role === 'user');
      const title = firstUserMessage ? generateTitle(firstUserMessage.content) : 'New Conversation';

      // Serialize messages for JSON storage
      const serializedMessages = newMessages.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      }));

      if (activeConversationId && !isNew) {
        // Update existing conversation
        const { error } = await supabase
          .from('stoxo_conversations')
          .update({
            messages: serializedMessages as unknown as any,
            last_message_at: new Date().toISOString(),
          })
          .eq('id', activeConversationId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new conversation
        const { data, error } = await supabase
          .from('stoxo_conversations')
          .insert({
            user_id: user.id,
            title,
            messages: serializedMessages as unknown as any,
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;
        if (data) {
          setActiveConversationId(data.id);
        }
      }

      // Refresh conversations list
      await loadConversations();
    } catch (error) {
      console.error('Failed to save conversation:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, activeConversationId, loadConversations]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('stoxo-ai', {
        body: {
          action: 'ask',
          query: content.trim(),
          context: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        if (data.error.includes('Rate limit')) {
          toast({
            title: 'Rate Limited',
            description: 'Please wait a moment before sending another message.',
            variant: 'destructive',
          });
        } else if (data.error.includes('credits')) {
          toast({
            title: 'Credits Required',
            description: 'Please add credits to continue using Stoxo AI.',
            variant: 'destructive',
          });
        }
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.insights || 'Here\'s what I found:',
        response: data as StoxoResponse,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Auto-save after each assistant response
      if (user) {
        await saveConversation(finalMessages, !activeConversationId);
      }
    } catch (error) {
      console.error('Stoxo AI error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, toast, user, activeConversationId, saveConversation]);

  const createNewConversation = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('stoxo_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // If deleting active conversation, clear the chat
      if (activeConversationId === conversationId) {
        setMessages([]);
        setActiveConversationId(null);
      }

      await loadConversations();
      
      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been removed.',
      });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast({
        title: 'Error deleting conversation',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, activeConversationId, loadConversations, toast]);

  const renameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('stoxo_conversations')
        .update({ title: newTitle })
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadConversations();
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      toast({
        title: 'Error renaming conversation',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, loadConversations, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    // Conversation management
    conversations,
    activeConversationId,
    isLoadingConversations,
    isSaving,
    loadConversation,
    createNewConversation,
    deleteConversation,
    renameConversation,
  };
};
