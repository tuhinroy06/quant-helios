import { X, TrendingUp, TrendingDown, Star, ExternalLink, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScreenerStock } from '@/hooks/useScreenerData';
import { formatINRSimple, formatMarketCap } from '@/lib/indian-stocks';
import { cn } from '@/lib/utils';

interface StockDetailPanelProps {
  stock: ScreenerStock | null;
  onClose: () => void;
  onAddToWatchlist?: (symbol: string) => void;
  isWatchlisted?: boolean;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  good?: boolean;
  bad?: boolean;
}

const MetricCard = ({ label, value, suffix = '', good, bad }: MetricCardProps) => (
  <div className="bg-muted/50 rounded-lg p-3">
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className={cn(
      'text-lg font-semibold',
      good && 'text-emerald-500',
      bad && 'text-red-500'
    )}>
      {value}{suffix}
    </div>
  </div>
);

export const StockDetailPanel = ({ 
  stock, 
  onClose, 
  onAddToWatchlist,
  isWatchlisted 
}: StockDetailPanelProps) => {
  
  if (!stock) return null;
  
  const isPositive = (stock.changePercent || 0) >= 0;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-[400px] bg-background border-l border-border shadow-2xl z-50"
      >
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-primary">{stock.symbol}</h2>
                  <Badge variant="secondary">{stock.sector}</Badge>
                </div>
                <p className="text-muted-foreground">{stock.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Price Section */}
            <div className="bg-muted/30 rounded-xl p-4 mb-6">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold">
                  {formatINRSimple(stock.livePrice || stock.price)}
                </span>
                <div className={cn(
                  'flex items-center gap-1 text-lg font-medium pb-0.5',
                  isPositive ? 'text-emerald-500' : 'text-red-500'
                )}>
                  {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {isPositive ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>M.Cap: {formatMarketCap(stock.marketCap)}</span>
                <span className="capitalize">{stock.marketCapCategory} Cap</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 mb-6">
              <Button 
                variant={isWatchlisted ? "secondary" : "outline"} 
                className="flex-1 gap-2"
                onClick={() => onAddToWatchlist?.(stock.symbol)}
              >
                <Star className={cn(
                  'h-4 w-4',
                  isWatchlisted && 'fill-yellow-400 text-yellow-400'
                )} />
                {isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analyze
              </Button>
            </div>
            
            <Separator className="mb-6" />
            
            {/* Valuation Metrics */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Valuation
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard label="P/E Ratio" value={stock.pe?.toFixed(1) || '—'} />
                <MetricCard label="P/B Ratio" value={stock.pb?.toFixed(2) || '—'} />
                <MetricCard label="EV/EBITDA" value={stock.evToEbitda?.toFixed(1) || '—'} />
                <MetricCard 
                  label="PEG Ratio" 
                  value={stock.peg?.toFixed(2) || '—'} 
                  good={(stock.peg || 999) < 1}
                  bad={(stock.peg || 0) > 2}
                />
              </div>
            </div>
            
            {/* Profitability Metrics */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Profitability
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard 
                  label="ROE" 
                  value={stock.roe?.toFixed(1) || '—'} 
                  suffix="%" 
                  good={stock.roe >= 15}
                  bad={stock.roe < 10}
                />
                <MetricCard 
                  label="ROCE" 
                  value={stock.roce?.toFixed(1) || '—'} 
                  suffix="%" 
                  good={stock.roce >= 15}
                  bad={stock.roce < 10}
                />
                <MetricCard label="NPM" value={stock.npm?.toFixed(1) || '—'} suffix="%" />
                <MetricCard label="OPM" value={stock.opm?.toFixed(1) || '—'} suffix="%" />
              </div>
            </div>
            
            {/* Growth Metrics */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Growth (3Y CAGR)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard 
                  label="Sales Growth" 
                  value={stock.salesGrowth3Y?.toFixed(1) || '—'} 
                  suffix="%" 
                  good={stock.salesGrowth3Y >= 15}
                />
                <MetricCard 
                  label="Profit Growth" 
                  value={stock.profitGrowth3Y?.toFixed(1) || '—'} 
                  suffix="%" 
                  good={stock.profitGrowth3Y >= 15}
                />
                <MetricCard label="EPS Growth" value={stock.epsGrowth?.toFixed(1) || '—'} suffix="%" />
                <MetricCard label="Dividend Yield" value={stock.dividendYield?.toFixed(2) || '—'} suffix="%" />
              </div>
            </div>
            
            {/* Financial Health */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Financial Health
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard 
                  label="Debt/Equity" 
                  value={stock.debtToEquity?.toFixed(2) || '—'} 
                  good={stock.debtToEquity < 0.5}
                  bad={stock.debtToEquity > 1}
                />
                <MetricCard 
                  label="Current Ratio" 
                  value={stock.currentRatio?.toFixed(2) || '—'} 
                  good={stock.currentRatio >= 1.5}
                  bad={stock.currentRatio < 1}
                />
                <MetricCard 
                  label="Interest Coverage" 
                  value={stock.interestCoverage?.toFixed(1) || '—'} 
                  good={stock.interestCoverage >= 3}
                />
                <MetricCard 
                  label="Promoter Holding" 
                  value={stock.promoterHolding?.toFixed(1) || '—'} 
                  suffix="%" 
                />
              </div>
            </div>
            
            {/* 52 Week Range */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                52-Week Range
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-red-500">{formatINRSimple(stock.week52Low || 0)}</span>
                  <span className="text-emerald-500">{formatINRSimple(stock.week52High || 0)}</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500"
                    style={{ width: '100%' }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background"
                    style={{ 
                      left: `${Math.max(0, Math.min(100, 
                        ((stock.price - (stock.week52Low || 0)) / 
                        ((stock.week52High || 1) - (stock.week52Low || 0))) * 100
                      ))}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>
                <div className="text-center mt-2 text-xs text-muted-foreground">
                  {stock.distFrom52High?.toFixed(1)}% from 52W High
                </div>
              </div>
            </div>
            
            {/* Returns */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Returns
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard 
                  label="1 Year" 
                  value={stock.return1Y?.toFixed(1) || '—'} 
                  suffix="%" 
                  good={stock.return1Y > 0}
                  bad={stock.return1Y < 0}
                />
                <MetricCard 
                  label="3 Year" 
                  value={stock.return3Y?.toFixed(1) || '—'} 
                  suffix="%" 
                  good={stock.return3Y > 0}
                  bad={stock.return3Y < 0}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
};

export default StockDetailPanel;
