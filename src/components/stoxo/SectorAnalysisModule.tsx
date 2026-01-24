import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SectorData } from '@/hooks/useStoxoAI';

interface SectorAnalysisModuleProps {
  data: SectorData;
}

export const SectorAnalysisModule = ({ data }: SectorAnalysisModuleProps) => {
  if (!data) return null;

  const isPositive = data.performance >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <BarChart3 className="h-4 w-4 text-violet-400" />
              </div>
              <CardTitle className="text-base font-semibold">{data.name} Sector</CardTitle>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "font-medium",
                isPositive ? "border-success/30 text-success" : "border-destructive/30 text-destructive"
              )}
            >
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {isPositive ? '+' : ''}{data.performance.toFixed(2)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-card/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Avg P/E Ratio</p>
              <p className="text-lg font-semibold text-foreground">{data.avgPE.toFixed(1)}</p>
            </div>
            <div className="p-3 rounded-xl bg-card/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Avg ROE</p>
              <p className="text-lg font-semibold text-foreground">{data.avgROE.toFixed(1)}%</p>
            </div>
          </div>

          {/* Top Stocks */}
          {data.topStocks?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Top Performers</p>
              <div className="flex flex-wrap gap-2">
                {data.topStocks.map((stock, index) => (
                  <motion.div
                    key={stock}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge variant="secondary" className="font-medium">
                      {stock}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
