import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Target,
  Shield,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TradeExplanation, 
  OutcomeAttribution, 
  CauseCode, 
  CAUSE_CODE_LABELS 
} from '@/hooks/useTradeExplanation';

interface TradeExplanationCardProps {
  explanation?: TradeExplanation | null;
  attribution?: OutcomeAttribution | null;
  isLoading?: boolean;
  showFullPayload?: boolean;
  compact?: boolean;
}

const CAUSE_ICONS: Partial<Record<CauseCode, React.ReactNode>> = {
  [CauseCode.LEVERAGE_AMPLIFICATION]: <Zap className="w-4 h-4" />,
  [CauseCode.WHIPSAW_STOP]: <AlertCircle className="w-4 h-4" />,
  [CauseCode.VOLATILITY_EXPANSION]: <TrendingDown className="w-4 h-4" />,
  [CauseCode.IV_CRUSH]: <TrendingDown className="w-4 h-4" />,
  [CauseCode.TREND_REVERSAL]: <TrendingDown className="w-4 h-4" />,
  [CauseCode.MOMENTUM_CONTINUATION]: <TrendingUp className="w-4 h-4" />,
  [CauseCode.BREAKOUT_SUCCESS]: <Target className="w-4 h-4" />,
  [CauseCode.TREND_FOLLOWING]: <TrendingUp className="w-4 h-4" />,
  [CauseCode.THETA_DECAY]: <Clock className="w-4 h-4" />,
  [CauseCode.DELTA_EXPANSION]: <TrendingUp className="w-4 h-4" />,
  [CauseCode.LEVERAGE_BENEFIT]: <Zap className="w-4 h-4" />
};

export function TradeExplanationCard({
  explanation,
  attribution,
  isLoading = false,
  showFullPayload = false,
  compact = false
}: TradeExplanationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const attr = explanation?.attribution || attribution;
  
  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (!attr) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center">
          <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No explanation available</p>
        </CardContent>
      </Card>
    );
  }

  const causeInfo = CAUSE_CODE_LABELS[attr.primaryCause as CauseCode] || {
    label: attr.primaryCause,
    isLoss: false,
    color: 'text-muted-foreground'
  };

  const CauseIcon = CAUSE_ICONS[attr.primaryCause as CauseCode] || <Brain className="w-4 h-4" />;

  if (compact) {
    return (
      <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          causeInfo.isLoss ? 'bg-destructive/10' : 'bg-[hsl(142_71%_45%/0.1)]'
        }`}>
          <span className={causeInfo.color}>{CauseIcon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-medium ${causeInfo.color}`}>
              {causeInfo.label}
            </span>
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              P{attr.priorityScore}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {attr.primaryDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              causeInfo.isLoss ? 'bg-destructive/10' : 'bg-[hsl(142_71%_45%/0.1)]'
            }`}>
              <span className={causeInfo.color}>{CauseIcon}</span>
            </div>
            <div>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <span className={causeInfo.color}>{causeInfo.label}</span>
                <Badge variant="outline" className="text-xs">
                  Priority {attr.priorityScore}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {attr.marketBehavior}
              </p>
            </div>
          </div>
          {explanation?.validated && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Shield className="w-3 h-3" />
              Validated
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Description */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
          <p className="text-sm text-foreground leading-relaxed">
            {attr.primaryDescription}
          </p>
        </div>

        {/* AI Explanation (if available) */}
        {explanation?.explanation && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI Explanation</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-foreground leading-relaxed">
                {explanation.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Secondary Causes */}
        {attr.secondaryCauses && attr.secondaryCauses.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{attr.secondaryCauses.length} contributing factor{attr.secondaryCauses.length > 1 ? 's' : ''}</span>
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-2">
                    {attr.secondaryCauses.map((cause, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 rounded-lg bg-secondary/20 border border-border"
                      >
                        <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-muted-foreground">{index + 1}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{cause}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Debug Payload */}
        {showFullPayload && explanation?.sanitizedPayload && (
          <div className="space-y-2 pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPayload(!showPayload)}
              className="text-xs text-muted-foreground"
            >
              {showPayload ? 'Hide' : 'Show'} Sanitized Payload
            </Button>
            
            <AnimatePresence>
              {showPayload && (
                <motion.pre
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="text-xs bg-secondary/50 p-3 rounded-lg overflow-auto max-h-60"
                >
                  {JSON.stringify(explanation.sanitizedPayload, null, 2)}
                </motion.pre>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Quick Attribution Badge Component
export function AttributionBadge({ 
  causeCode, 
  showIcon = true 
}: { 
  causeCode: CauseCode | string; 
  showIcon?: boolean;
}) {
  const causeInfo = CAUSE_CODE_LABELS[causeCode as CauseCode] || {
    label: causeCode,
    isLoss: false,
    color: 'text-muted-foreground'
  };

  const CauseIcon = CAUSE_ICONS[causeCode as CauseCode];

  return (
    <Badge 
      variant="outline" 
      className={`${causeInfo.color} border-current/30 gap-1`}
    >
      {showIcon && CauseIcon}
      {causeInfo.label}
    </Badge>
  );
}
