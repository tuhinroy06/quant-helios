import { motion } from 'framer-motion';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RiskAnalysisCardProps {
  volatilityScore: number;
  riskFactors?: string[];
  stockSymbol?: string;
}

export const RiskAnalysisCard = ({ volatilityScore, riskFactors, stockSymbol }: RiskAnalysisCardProps) => {
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'High', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle };
    if (score >= 40) return { level: 'Medium', color: 'text-warning', bg: 'bg-warning/10', icon: TrendingUp };
    return { level: 'Low', color: 'text-success', bg: 'bg-success/10', icon: Shield };
  };

  const risk = getRiskLevel(volatilityScore);
  const RiskIcon = risk.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn("overflow-hidden", risk.bg, `border-${risk.color.replace('text-', '')}/30`)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <RiskIcon className={cn("h-4 w-4", risk.color)} />
              Risk Analysis {stockSymbol && `- ${stockSymbol}`}
            </CardTitle>
            <span className={cn("text-sm font-semibold", risk.color)}>
              {risk.level} Risk
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Volatility Gauge */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Volatility Score</span>
              <span className={cn("text-lg font-bold", risk.color)}>{volatilityScore}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${volatilityScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  volatilityScore >= 70 ? "bg-destructive" :
                  volatilityScore >= 40 ? "bg-warning" : "bg-success"
                )}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">Low</span>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>

          {/* Risk Factors */}
          {riskFactors && riskFactors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Key Risk Factors</p>
              <ul className="space-y-1.5">
                {riskFactors.map((factor, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", risk.bg.replace('/10', ''))} />
                    {factor}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
