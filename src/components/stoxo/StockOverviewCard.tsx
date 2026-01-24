import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StockData } from '@/hooks/useStoxoAI';
import { formatINR } from '@/lib/indian-stocks';
import { LivePrice } from '@/hooks/useWebSocketPrices';

interface StockOverviewCardProps {
  stock: StockData;
  index?: number;
  livePrice?: LivePrice | null;
}

export const StockOverviewCard = ({ stock, index = 0, livePrice }: StockOverviewCardProps) => {
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);

  // Detect price changes for flash animation
  useEffect(() => {
    if (livePrice && prevPrice !== null) {
      if (livePrice.price > prevPrice) {
        setPriceFlash('up');
      } else if (livePrice.price < prevPrice) {
        setPriceFlash('down');
      }
      
      const timer = setTimeout(() => setPriceFlash(null), 500);
      return () => clearTimeout(timer);
    }
    if (livePrice) {
      setPrevPrice(livePrice.price);
    }
  }, [livePrice?.price]);

  // Use live price if available, otherwise fall back to stock data
  const displayPrice = livePrice?.price ?? stock.price;
  const displayChange = livePrice?.change ?? stock.change;
  const displayChangePercent = livePrice?.changePercent ?? stock.changePercent;
  const isLive = !!livePrice;

  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return {
          bg: 'bg-success/10',
          border: 'border-success/30',
          text: 'text-success',
          icon: TrendingUp,
        };
      case 'bearish':
        return {
          bg: 'bg-destructive/10',
          border: 'border-destructive/30',
          text: 'text-destructive',
          icon: TrendingDown,
        };
      default:
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          text: 'text-warning',
          icon: Minus,
        };
    }
  };

  const sentimentStyles = getSentimentStyles(stock.sentiment);
  const SentimentIcon = sentimentStyles.icon;
  const isPositive = displayChangePercent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={cn(
        "overflow-hidden hover:shadow-lg transition-all duration-300",
        sentimentStyles.bg,
        sentimentStyles.border
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{stock.symbol}</h3>
                <Badge variant="outline" className="text-xs">
                  {stock.sector}
                </Badge>
                {isLive && (
                  <div className="flex items-center gap-1">
                    <Radio className="h-3 w-3 text-success animate-pulse" />
                    <span className="text-[10px] text-success font-medium">LIVE</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{stock.name}</p>
            </div>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
              sentimentStyles.bg,
              sentimentStyles.text
            )}>
              <SentimentIcon className="h-3 w-3" />
              {stock.sentiment.charAt(0).toUpperCase() + stock.sentiment.slice(1)}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={displayPrice}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "text-2xl font-bold transition-colors duration-300",
                    priceFlash === 'up' && "text-success",
                    priceFlash === 'down' && "text-destructive",
                    !priceFlash && "text-foreground"
                  )}
                >
                  {formatINR(displayPrice)}
                </motion.p>
              </AnimatePresence>
              <div className={cn(
                "flex items-center gap-1 text-sm",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{isPositive ? '+' : ''}{displayChangePercent.toFixed(2)}%</span>
                {isLive && (
                  <span className="text-muted-foreground text-xs ml-1">
                    ({isPositive ? '+' : ''}{formatINR(displayChange)})
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">AI Score</p>
              <p className={cn(
                "text-xl font-bold",
                stock.overallScore >= 70 ? "text-success" :
                stock.overallScore >= 40 ? "text-warning" : "text-destructive"
              )}>
                {stock.overallScore}
              </p>
            </div>
          </div>

          {/* Score Bars */}
          <div className="space-y-2">
            <ScoreBar label="Momentum" value={stock.momentumScore} />
            <ScoreBar label="Value" value={stock.valueScore} />
            <ScoreBar label="Quality" value={stock.qualityScore} />
          </div>

          {/* Analysis */}
          {stock.analysis && (
            <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
              {stock.analysis}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ScoreBar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground w-16">{label}</span>
    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={cn(
          "h-full rounded-full",
          value >= 70 ? "bg-success" :
          value >= 40 ? "bg-warning" : "bg-destructive"
        )}
      />
    </div>
    <span className="text-xs font-medium text-foreground w-8 text-right">{value}</span>
  </div>
);
