import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Code,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Loader2,
  Zap,
  Target,
  Clock,
  TrendingUp,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  useStrategyCompiler,
  CompilationResult,
  RISK_GRADE_COLORS,
  FEATURE_LABELS,
  HARD_CAPS
} from '@/hooks/useStrategyCompiler';
import { useAuth } from '@/contexts/AuthContext';

interface StrategyCompilerCardProps {
  onStrategyCompiled?: (result: CompilationResult) => void;
  initialPrompt?: string;
  compact?: boolean;
}

export function StrategyCompilerCard({
  onStrategyCompiled,
  initialPrompt = '',
  compact = false
}: StrategyCompilerCardProps) {
  const { user } = useAuth();
  const { compile, isLoading, compilationResult, error, clearResult } = useStrategyCompiler();
  
  const [prompt, setPrompt] = useState(initialPrompt);
  const [showCode, setShowCode] = useState(false);
  const [showConditions, setShowConditions] = useState(true);
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);

  useEffect(() => {
    if (compilationResult && onStrategyCompiled) {
      onStrategyCompiled(compilationResult);
    }
  }, [compilationResult, onStrategyCompiled]);

  const handleCompile = async () => {
    if (!prompt.trim()) return;
    await compile(prompt, user?.id);
  };

  const handleCopyCode = () => {
    if (compilationResult?.python_code) {
      navigator.clipboard.writeText(compilationResult.python_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setPrompt('');
    clearResult();
  };

  const result = compilationResult;
  const strategy = result?.strategy_json;
  const validation = result?.validation;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Strategy Compiler
          <Badge variant="outline" className="text-xs ml-auto">v1.0</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">
              Describe your trading strategy in plain English
            </label>
            <span className={`text-xs ${charCount > 1800 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {charCount}/2000
            </span>
          </div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Buy NIFTY when RSI is below 30 and price is above 20 SMA. Use 1% stop loss and 2% target. Intraday only with confirmation."
            className="min-h-[120px] resize-none"
            maxLength={2000}
          />
          
          {/* Quick Examples */}
          {!compact && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Try:</span>
              <button
                onClick={() => setPrompt("Buy BANKNIFTY when RSI below 30 with volume surge. 1% stop loss, 2% target. Intraday with confirmation.")}
                className="text-xs text-primary hover:underline"
              >
                RSI Oversold
              </button>
              <button
                onClick={() => setPrompt("Long NIFTY futures when price above 50 SMA and trending market. 1.5% stop, 3% target. Low risk.")}
                className="text-xs text-primary hover:underline"
              >
                Trend Following
              </button>
              <button
                onClick={() => setPrompt("Buy NIFTY call options when RSI above 50 and high relative strength. ATM strike, monthly expiry. 1% max loss.")}
                className="text-xs text-primary hover:underline"
              >
                Options Momentum
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleCompile}
            disabled={isLoading || !prompt.trim()}
            className="flex-1 gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Compile Strategy
              </>
            )}
          </Button>
          {(prompt || result) && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2"
          >
            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Compilation Result */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.status === 'VALID' ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Compiled Successfully
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="w-3 h-3" />
                      Rejected
                    </Badge>
                  )}
                  {validation?.risk_grade && (
                    <Badge 
                      variant="outline" 
                      className={`${RISK_GRADE_COLORS[validation.risk_grade]} border-current/30`}
                    >
                      {validation.risk_grade} Risk
                    </Badge>
                  )}
                </div>
                {validation?.strategy_version && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {validation.strategy_version.slice(0, 8)}
                  </span>
                )}
              </div>

              {/* Rejection Errors */}
              {result.status === 'REJECTED' && (result.errors || result.reason) && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Validation Failed
                  </div>
                  <ul className="text-sm text-destructive/80 space-y-1 pl-6 list-disc">
                    {result.reason && <li>{result.reason}</li>}
                    {result.errors?.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validation?.warnings && validation.warnings.length > 0 && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-medium text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Warnings
                  </div>
                  <ul className="text-sm text-yellow-600/80 dark:text-yellow-400/80 space-y-1 pl-6 list-disc">
                    {validation.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              {/* Strategy Summary */}
              {strategy && result.status === 'VALID' && (
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">{strategy.strategy_name}</h4>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-xs">{strategy.asset_class}</Badge>
                      <Badge variant="outline" className="text-xs">{strategy.timeframe}</Badge>
                      <Badge variant="outline" className="text-xs">{strategy.holding_type}</Badge>
                    </div>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2 rounded-lg bg-secondary/50 text-center">
                      <Target className="w-4 h-4 mx-auto text-primary mb-1" />
                      <p className="text-xs text-muted-foreground">Direction</p>
                      <p className="text-sm font-medium text-foreground">{strategy.direction}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50 text-center">
                      <Shield className="w-4 h-4 mx-auto text-destructive mb-1" />
                      <p className="text-xs text-muted-foreground">Stop Loss</p>
                      <p className="text-sm font-medium text-foreground">{strategy.exit_logic.stop_loss.value}%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50 text-center">
                      <TrendingUp className="w-4 h-4 mx-auto text-primary mb-1" />
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-sm font-medium text-foreground">{strategy.exit_logic.take_profit.value}%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50 text-center">
                      <Zap className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
                      <p className="text-xs text-muted-foreground">Max Risk</p>
                      <p className="text-sm font-medium text-foreground">{strategy.risk.max_risk_per_trade_percent}%</p>
                    </div>
                  </div>

                  {/* Entry Conditions */}
                  <Collapsible open={showConditions} onOpenChange={setShowConditions}>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full">
                      {showConditions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Entry Conditions ({strategy.entry_logic.conditions.length})
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 space-y-2">
                        {strategy.entry_logic.conditions.map((cond, i) => (
                          <div 
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 text-sm"
                          >
                            <Badge variant="secondary" className="text-xs">
                              {FEATURE_LABELS[cond.feature]?.label || cond.feature}
                            </Badge>
                            <span className="text-muted-foreground">{cond.operator}</span>
                            <span className="font-mono text-foreground">
                              {Array.isArray(cond.value) ? cond.value.join(' - ') : cond.value}
                            </span>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                {FEATURE_LABELS[cond.feature]?.description || 'Technical indicator'}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Capabilities */}
                  {strategy.capabilities && strategy.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {strategy.capabilities.map((cap, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {cap.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Python Code */}
                  {result.python_code && (
                    <Collapsible open={showCode} onOpenChange={setShowCode}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Code className="w-4 h-4" />
                          {showCode ? 'Hide' : 'View'} Generated Code
                          {showCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-3 relative">
                          <pre className="p-4 rounded-lg bg-secondary/50 border border-border text-xs font-mono overflow-x-auto max-h-[300px]">
                            {result.python_code}
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyCode}
                            className="absolute top-2 right-2"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {/* Hard Caps Info */}
        {!compact && !result && !isLoading && (
          <div className="p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Shield className="w-4 h-4 text-primary" />
              Safety Limits
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Max Risk/Trade: {HARD_CAPS.max_risk_per_trade_percent}%</div>
              <div>Max Positions: {HARD_CAPS.max_positions}</div>
              <div>Min Stop Loss: {HARD_CAPS.min_stop_loss_percent}%</div>
              <div>Max Leverage: {HARD_CAPS.max_leverage}x</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
