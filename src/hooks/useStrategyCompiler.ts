import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ==========================================
// TYPES
// ==========================================

export interface Condition {
  feature: string;
  operator: string;
  value: number | [number, number];
}

export interface CompiledStrategy {
  strategy_name: string;
  asset_class: 'CASH' | 'FUTURES' | 'OPTIONS';
  market: 'NSE' | 'BSE';
  timeframe: '1m' | '5m' | '15m';
  holding_type: 'INTRADAY' | 'SWING';
  direction: 'LONG' | 'SHORT' | 'BOTH';
  universe: { type: string; symbols: string[] };
  entry_logic: { conditions: Condition[] };
  exit_logic: {
    stop_loss: { type: string; value: number };
    take_profit: { type: string; value: number };
    time_exit_minutes: number | null;
  };
  risk: {
    max_risk_per_trade_percent: number;
    max_positions: number;
    position_sizing: string;
  };
  filters: {
    volatility: { max: number | null };
    avoid_market_regime: string[] | null;
  };
  confirmation: { bars: number; cooldown_bars: number };
  confidence: number;
  capabilities?: string[];
  futures?: {
    contract_type: string;
    margin_mode: string;
    max_leverage: number;
  };
  options?: {
    strategy_type: string;
    expiry: string;
    strike_selection: string;
    max_loss_percent: number;
    iv_filter: { min: number; max: number };
  };
  metadata?: {
    created_by: string;
    created_from_prompt_hash: string;
    validator_version: string;
    compiler_version: string;
  };
}

export interface ValidationResult {
  status: 'VALID' | 'REJECTED';
  errors: string[];
  warnings: string[];
  risk_grade: 'LOW' | 'MEDIUM' | 'HIGH';
  strategy_version: string;
  validated_at: string;
}

export interface CompilationResult {
  status: 'VALID' | 'REJECTED';
  strategy_json?: CompiledStrategy;
  python_code?: string;
  validation?: ValidationResult;
  errors?: string[];
  warnings?: string[];
  reason?: string;
  partial_strategy?: CompiledStrategy;
}

export interface SchemaInfo {
  version: string;
  allowed_features: string[];
  runtime_features: string[];
  allowed_operators: string[];
  asset_classes: string[];
  markets: string[];
  timeframes: string[];
  holding_types: string[];
  directions: string[];
  market_regimes: string[];
  hard_caps: {
    max_risk_per_trade_percent: number;
    max_positions: number;
    min_stop_loss_percent: number;
    max_confidence: number;
    max_leverage: number;
    max_cooldown_bars: number;
    max_confirmation_bars: number;
  };
  options_safe_strategies: string[];
  options_restricted_strategies: string[];
}

export interface FirewallResult {
  passed: boolean;
  message: string;
}

// ==========================================
// HOOK
// ==========================================

export function useStrategyCompiler() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [schemaInfo, setSchemaInfo] = useState<SchemaInfo | null>(null);

  /**
   * Scan a prompt through the firewall without compiling
   */
  const scanPrompt = useCallback(async (userInput: string): Promise<FirewallResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('strategy-compiler', {
        body: { action: 'scan_prompt', userInput }
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data.error) throw new Error(data.error);

      return data as FirewallResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to scan prompt';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Compile a natural language strategy description into structured JSON and Python code
   */
  const compile = useCallback(async (
    userInput: string, 
    userId?: string
  ): Promise<CompilationResult | null> => {
    setIsLoading(true);
    setError(null);
    setCompilationResult(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('strategy-compiler', {
        body: { action: 'compile', userInput, userId }
      });

      if (invokeError) throw new Error(invokeError.message);
      
      const result = data as CompilationResult;
      setCompilationResult(result);

      if (result.status === 'REJECTED') {
        const reason = result.reason || result.errors?.join(', ') || 'Strategy rejected';
        toast.error(`Strategy rejected: ${reason}`);
      } else {
        toast.success('Strategy compiled successfully');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Compilation failed';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Validate an existing strategy JSON
   */
  const validate = useCallback(async (strategyJson: CompiledStrategy): Promise<ValidationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('strategy-compiler', {
        body: { action: 'validate', strategyJson }
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data.error) throw new Error(data.error);

      return data as ValidationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation failed';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate Python code from strategy JSON
   */
  const generateCode = useCallback(async (strategyJson: CompiledStrategy): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('strategy-compiler', {
        body: { action: 'generate_code', strategyJson }
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data.error) throw new Error(data.error);

      return data.python_code as string;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Code generation failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get schema information (allowed features, operators, etc.)
   */
  const getSchema = useCallback(async (): Promise<SchemaInfo | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('strategy-compiler', {
        body: { action: 'get_schema' }
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data.error) throw new Error(data.error);

      setSchemaInfo(data as SchemaInfo);
      return data as SchemaInfo;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get schema';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear current compilation result
   */
  const clearResult = useCallback(() => {
    setCompilationResult(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    compilationResult,
    schemaInfo,
    scanPrompt,
    compile,
    validate,
    generateCode,
    getSchema,
    clearResult
  };
}

// ==========================================
// CONSTANTS EXPORT
// ==========================================

export const HARD_CAPS = {
  max_risk_per_trade_percent: 2.0,
  max_positions: 5,
  min_stop_loss_percent: 0.25,
  max_confidence: 0.9,
  max_leverage: 3,
  max_cooldown_bars: 10,
  max_confirmation_bars: 5
};

export const RISK_GRADE_COLORS = {
  LOW: 'text-primary',
  MEDIUM: 'text-yellow-500',
  HIGH: 'text-destructive'
};

export const ASSET_CLASS_LABELS = {
  CASH: { label: 'Cash/Equity', description: 'Long-only stock trading' },
  FUTURES: { label: 'Futures', description: 'Leveraged index/stock futures' },
  OPTIONS: { label: 'Options', description: 'Options strategies' }
};

export const FEATURE_LABELS: Record<string, { label: string; description: string }> = {
  rsi: { label: 'RSI', description: 'Relative Strength Index (14-period)' },
  price_to_sma20: { label: 'Price/SMA20', description: 'Current price relative to 20-period SMA' },
  price_to_sma50: { label: 'Price/SMA50', description: 'Current price relative to 50-period SMA' },
  volatility: { label: 'Volatility', description: 'ATR-based volatility measure' },
  volume_ratio: { label: 'Volume Ratio', description: 'Current volume vs average volume' },
  relative_strength: { label: 'Relative Strength', description: 'Stock strength vs market' },
  market_regime: { label: 'Market Regime', description: 'Current market condition' }
};
