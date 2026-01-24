import { useState, useCallback } from 'react';
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

export const useStoxoAI = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
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

      setMessages(prev => [...prev, assistantMessage]);
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
  }, [isLoading, messages, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
