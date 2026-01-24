import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ==========================================
// TYPES
// ==========================================

export enum CauseCode {
  LEVERAGE_AMPLIFICATION = "LEVERAGE_AMPLIFICATION",
  WHIPSAW_STOP = "WHIPSAW_STOP",
  VOLATILITY_EXPANSION = "VOLATILITY_EXPANSION",
  IV_CRUSH = "IV_CRUSH",
  TREND_REVERSAL = "TREND_REVERSAL",
  FALSE_BREAKOUT = "FALSE_BREAKOUT",
  OVERNIGHT_GAP = "OVERNIGHT_GAP",
  SIGNAL_NOISE = "SIGNAL_NOISE",
  MOMENTUM_FAILURE = "MOMENTUM_FAILURE",
  THETA_DECAY = "THETA_DECAY",
  FUNDING_PRESSURE = "FUNDING_PRESSURE",
  MOMENTUM_CONTINUATION = "MOMENTUM_CONTINUATION",
  BREAKOUT_SUCCESS = "BREAKOUT_SUCCESS",
  TREND_FOLLOWING = "TREND_FOLLOWING",
  RANGE_BOUND_BEHAVIOR = "RANGE_BOUND_BEHAVIOR",
  DELTA_EXPANSION = "DELTA_EXPANSION",
  VOLATILITY_GAIN = "VOLATILITY_GAIN",
  LEVERAGE_BENEFIT = "LEVERAGE_BENEFIT",
  GENERAL_PROFIT = "GENERAL_PROFIT",
  GENERAL_LOSS = "GENERAL_LOSS"
}

export interface TradeData {
  tradeId: string;
  strategyId: string;
  strategyName: string;
  assetClass: 'EQUITY' | 'OPTIONS' | 'FUTURES';
  timeframe: string;
  symbol: string;
  contract?: string;
  expiry?: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTimestamp: string;
  exitTimestamp: string;
  exitReason: 'STOP_LOSS' | 'TARGET' | 'TIME_EXIT' | 'TRAILING_STOP' | 'MANUAL_EXIT';
  holdingMinutes: number;
  riskPercent: number;
}

export interface MarketData {
  entryIndicators?: Record<string, number>;
  trend?: 'UP' | 'DOWN' | 'SIDEWAYS' | 'UNKNOWN';
  signalStrength?: number;
  maePct?: number;
  mfePct?: number;
  volatilitySpike?: boolean;
  volumeSurge?: boolean;
  newsEvent?: boolean;
  regime?: string;
  trendInvalidation?: boolean;
  gapAgainstPosition?: boolean;
  exitNearResistance?: boolean;
  thetaDecayPct?: number;
  deltaExpansion?: number;
  ivExpansion?: number;
  leverageRatio?: number;
}

export interface ExecutionData {
  stopLossRespected?: boolean;
  maxRiskBreached?: boolean;
  slippage?: 'NORMAL' | 'HIGH' | 'EXTREME';
}

export interface OutcomeAttribution {
  primaryCause: CauseCode;
  primaryDescription: string;
  secondaryCauses: string[];
  marketBehavior: string;
  priorityScore: number;
}

export interface TradeExplanation {
  tradeId: string;
  explanation: string;
  attribution: OutcomeAttribution;
  validated: boolean;
  sanitizedPayload: Record<string, unknown>;
}

export interface StoredExplanation {
  id: string;
  trade_id: string;
  explanation_type: string;
  explanation_text: string;
  attribution: OutcomeAttribution;
  sanitized_payload: Record<string, unknown>;
  validated: boolean;
  priority_score: number;
  created_at: string;
}

// ==========================================
// CAUSE CODE METADATA
// ==========================================

export const CAUSE_CODE_LABELS: Record<CauseCode, { label: string; isLoss: boolean; color: string }> = {
  [CauseCode.LEVERAGE_AMPLIFICATION]: { label: "Leverage Amplification", isLoss: true, color: "text-destructive" },
  [CauseCode.WHIPSAW_STOP]: { label: "Whipsaw Stop", isLoss: true, color: "text-destructive" },
  [CauseCode.VOLATILITY_EXPANSION]: { label: "Volatility Expansion", isLoss: true, color: "text-destructive" },
  [CauseCode.IV_CRUSH]: { label: "IV Crush", isLoss: true, color: "text-destructive" },
  [CauseCode.TREND_REVERSAL]: { label: "Trend Reversal", isLoss: true, color: "text-destructive" },
  [CauseCode.FALSE_BREAKOUT]: { label: "False Breakout", isLoss: true, color: "text-destructive" },
  [CauseCode.OVERNIGHT_GAP]: { label: "Overnight Gap", isLoss: true, color: "text-destructive" },
  [CauseCode.SIGNAL_NOISE]: { label: "Signal Noise", isLoss: true, color: "text-destructive" },
  [CauseCode.MOMENTUM_FAILURE]: { label: "Momentum Failure", isLoss: true, color: "text-destructive" },
  [CauseCode.THETA_DECAY]: { label: "Theta Decay", isLoss: true, color: "text-destructive" },
  [CauseCode.FUNDING_PRESSURE]: { label: "Funding Pressure", isLoss: true, color: "text-destructive" },
  [CauseCode.MOMENTUM_CONTINUATION]: { label: "Momentum Continuation", isLoss: false, color: "text-[hsl(142_71%_45%)]" },
  [CauseCode.BREAKOUT_SUCCESS]: { label: "Breakout Success", isLoss: false, color: "text-[hsl(142_71%_45%)]" },
  [CauseCode.TREND_FOLLOWING]: { label: "Trend Following", isLoss: false, color: "text-[hsl(142_71%_45%)]" },
  [CauseCode.RANGE_BOUND_BEHAVIOR]: { label: "Range Bound Behavior", isLoss: false, color: "text-[hsl(142_71%_45%)]" },
  [CauseCode.DELTA_EXPANSION]: { label: "Delta Expansion", isLoss: false, color: "text-[hsl(142_71%_45%)]" },
  [CauseCode.VOLATILITY_GAIN]: { label: "Volatility Gain", isLoss: false, color: "text-[hsl(142_71%_45%)]" },
  [CauseCode.LEVERAGE_BENEFIT]: { label: "Leverage Benefit", isLoss: false, color: "text-[hsl(142_71%_45%)]" },
  [CauseCode.GENERAL_PROFIT]: { label: "General Profit", isLoss: false, color: "text-[hsl(142_71%_45%)]" },
  [CauseCode.GENERAL_LOSS]: { label: "General Loss", isLoss: true, color: "text-destructive" }
};

// ==========================================
// HOOK
// ==========================================

export function useTradeExplanation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<TradeExplanation | null>(null);

  const explainTradeExit = useCallback(async (
    tradeData: TradeData,
    marketData?: MarketData,
    executionData?: ExecutionData
  ): Promise<TradeExplanation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('trade-explanation', {
        body: {
          action: 'explain_exit',
          tradeData,
          marketData: marketData || {},
          executionData: executionData || {}
        }
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const result: TradeExplanation = {
        tradeId: data.tradeId,
        explanation: data.explanation,
        attribution: data.attribution,
        validated: data.validated,
        sanitizedPayload: data.sanitizedPayload
      };

      setExplanation(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate explanation';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAttribution = useCallback(async (
    tradeData: TradeData,
    marketData?: MarketData,
    executionData?: ExecutionData
  ): Promise<OutcomeAttribution | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('trade-explanation', {
        body: {
          action: 'get_attribution',
          tradeData,
          marketData: marketData || {},
          executionData: executionData || {}
        }
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.attribution as OutcomeAttribution;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get attribution';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStoredExplanation = useCallback(async (
    tradeId: string
  ): Promise<StoredExplanation[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('trade-explanation', {
        body: {
          action: 'get_explanation',
          tradeId
        }
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.explanations as StoredExplanation[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch explanation';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCauseLabel = useCallback((causeCode: CauseCode | string) => {
    return CAUSE_CODE_LABELS[causeCode as CauseCode] || { 
      label: causeCode, 
      isLoss: false, 
      color: 'text-muted-foreground' 
    };
  }, []);

  return {
    isLoading,
    error,
    explanation,
    explainTradeExit,
    getAttribution,
    getStoredExplanation,
    getCauseLabel,
    CAUSE_CODE_LABELS
  };
}
