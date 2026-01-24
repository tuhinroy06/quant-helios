import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { StoxoResponse } from '@/hooks/useStoxoAI';
import { StockOverviewCard } from './StockOverviewCard';
import { PeerComparisonTable } from './PeerComparisonTable';
import { SectorAnalysisModule } from './SectorAnalysisModule';
import { RiskAnalysisCard } from './RiskAnalysisCard';
import { SuggestedPrompts } from './SuggestedPrompts';
import { useAlphaVantagePrices } from '@/hooks/useAlphaVantagePrices';
import { cn } from '@/lib/utils';

interface ResponsePanelProps {
  response: StoxoResponse | undefined;
  onPromptSelect: (prompt: string) => void;
  isLoading?: boolean;
}

export const ResponsePanel = ({ response, onPromptSelect, isLoading }: ResponsePanelProps) => {
  // Extract symbols from response for live price subscription
  const symbols = useMemo(() => {
    if (!response?.stocks) return [];
    return response.stocks.map(s => s.symbol);
  }, [response?.stocks]);

  // Subscribe to prices for displayed stocks
  const { prices, isDataFresh, error } = useAlphaVantagePrices({
    symbols,
    enabled: symbols.length > 0,
  });

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">Ask a question to see analysis here</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={response.type}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Price Data Status */}
        {symbols.length > 0 && (
          <div className="flex items-center justify-end gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
              isDataFresh 
                ? "bg-primary/10 text-primary" 
                : error 
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
            )}>
              {isDataFresh ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span>Live Prices</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>{error ? 'Connection Error' : 'Loading...'}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Insights Text */}
        {response.insights && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl"
          >
            <p className="text-sm text-foreground leading-relaxed">{response.insights}</p>
          </motion.div>
        )}

        {/* Stock Cards with Live Prices */}
        {response.stocks && response.stocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {response.stocks.map((stock, index) => (
              <StockOverviewCard 
                key={stock.symbol} 
                stock={stock} 
                index={index}
                livePrice={prices[stock.symbol] || null}
              />
            ))}
          </div>
        )}

        {/* Comparison Table */}
        {response.comparisonTable && response.comparisonTable.length > 0 && (
          <PeerComparisonTable data={response.comparisonTable} livePrices={prices} />
        )}

        {/* Sector Analysis */}
        {response.sectorData && (
          <SectorAnalysisModule data={response.sectorData} />
        )}

        {/* Risk Analysis for single stock */}
        {response.stocks?.length === 1 && (
          <RiskAnalysisCard
            volatilityScore={response.stocks[0].volatilityScore}
            stockSymbol={response.stocks[0].symbol}
            riskFactors={[
              `P/E ratio: ${response.stocks[0].pe?.toFixed(1) || 'N/A'}`,
              `Market cap: ${response.stocks[0].marketCap}`,
              response.stocks[0].volatilityScore >= 60 
                ? 'High volatility - suitable for risk-tolerant investors'
                : 'Moderate volatility - suitable for balanced portfolios'
            ]}
          />
        )}

        {/* Follow-up Prompts */}
        {response.followUpPrompts && response.followUpPrompts.length > 0 && (
          <div className="pt-2">
            <SuggestedPrompts
              prompts={response.followUpPrompts}
              onSelect={onPromptSelect}
              isLoading={isLoading}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
