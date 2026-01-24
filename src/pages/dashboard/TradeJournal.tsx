import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Search,
  Calendar,
  ChevronDown,
  ChevronRight,
  Brain,
  RefreshCw,
  BarChart3,
  Target,
  AlertCircle,
  Sparkles,
  X
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { TradeExplanationCard, AttributionBadge } from '@/components/trading/TradeExplanationCard';
import { 
  useTradeExplanation, 
  TradeData, 
  OutcomeAttribution,
  CauseCode,
  CAUSE_CODE_LABELS
} from '@/hooks/useTradeExplanation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ==========================================
// TYPES
// ==========================================

interface JournalTrade {
  id: string;
  account_id: string;
  strategy_id: string | null;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  pnl: number | null;
  pnl_pct: number | null;
  market: string | null;
  reason: string | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
  // Joined data
  strategy_name?: string;
}

interface TradeExplanationData {
  id: string;
  trade_id: string;
  explanation_type: string;
  explanation_text: string;
  attribution: OutcomeAttribution;
  validated: boolean;
  priority_score: number;
  created_at: string;
}

interface JournalStats {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
}

type DateFilter = 'all' | '7d' | '30d' | '90d';
type OutcomeFilter = 'all' | 'profit' | 'loss';

// ==========================================
// HELPERS
// ==========================================

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

const calculateStats = (trades: JournalTrade[]): JournalStats => {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      totalPnl: 0,
      avgPnl: 0,
      bestTrade: 0,
      worstTrade: 0,
      profitFactor: 0
    };
  }

  const pnls = trades.map(t => t.pnl || 0);
  const wins = pnls.filter(p => p > 0);
  const losses = pnls.filter(p => p < 0);
  
  const totalWins = wins.reduce((a, b) => a + b, 0);
  const totalLosses = Math.abs(losses.reduce((a, b) => a + b, 0));

  return {
    totalTrades: trades.length,
    winRate: (wins.length / trades.length) * 100,
    totalPnl: pnls.reduce((a, b) => a + b, 0),
    avgPnl: pnls.reduce((a, b) => a + b, 0) / trades.length,
    bestTrade: Math.max(...pnls),
    worstTrade: Math.min(...pnls),
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0
  };
};

// ==========================================
// COMPONENTS
// ==========================================

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend 
}: { 
  label: string; 
  value: string; 
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-xl font-semibold ${
        trend === 'up' ? 'text-primary' : 
        trend === 'down' ? 'text-destructive' : 
        'text-foreground'
      }`}>
        {value}
      </p>
    </div>
  );
}

function TradeRow({ 
  trade, 
  explanation,
  isExpanded,
  onToggle,
  onGenerateExplanation,
  isGenerating
}: { 
  trade: JournalTrade;
  explanation?: TradeExplanationData;
  isExpanded: boolean;
  onToggle: () => void;
  onGenerateExplanation: () => void;
  isGenerating: boolean;
}) {
  const isPnlPositive = (trade.pnl || 0) >= 0;
  
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className={`border-b border-border transition-colors ${isExpanded ? 'bg-secondary/20' : 'hover:bg-secondary/10'}`}>
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-4 flex items-center gap-4 text-left">
            <div className="w-6 flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            
            {/* Date */}
            <div className="w-28 flex-shrink-0">
              <p className="text-sm font-medium text-foreground">
                {format(parseISO(trade.closed_at || trade.opened_at), 'dd MMM yyyy')}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(trade.closed_at || trade.opened_at), 'HH:mm')}
              </p>
            </div>
            
            {/* Symbol & Side */}
            <div className="w-32 flex-shrink-0">
              <p className="text-sm font-medium text-foreground">{trade.symbol}</p>
              <Badge 
                variant="outline" 
                className={`text-xs mt-0.5 ${
                  trade.side === 'buy' ? 'text-primary border-primary/30' : 'text-destructive border-destructive/30'
                }`}
              >
                {trade.side.toUpperCase()}
              </Badge>
            </div>
            
            {/* Entry/Exit */}
            <div className="w-32 flex-shrink-0 hidden md:block">
              <p className="text-xs text-muted-foreground">
                {formatINR(trade.entry_price)} → {trade.exit_price ? formatINR(trade.exit_price) : '—'}
              </p>
            </div>
            
            {/* P&L */}
            <div className="w-28 flex-shrink-0">
              <p className={`text-sm font-medium ${isPnlPositive ? 'text-primary' : 'text-destructive'}`}>
                {isPnlPositive ? '+' : ''}{formatINR(trade.pnl || 0)}
              </p>
              {trade.pnl_pct !== null && (
                <p className={`text-xs ${isPnlPositive ? 'text-primary/70' : 'text-destructive/70'}`}>
                  {isPnlPositive ? '+' : ''}{trade.pnl_pct.toFixed(2)}%
                </p>
              )}
            </div>
            
            {/* Exit Reason */}
            <div className="w-28 flex-shrink-0 hidden lg:block">
              <Badge variant="secondary" className="text-xs capitalize">
                {trade.reason?.replace('_', ' ') || 'manual'}
              </Badge>
            </div>
            
            {/* Attribution Badge */}
            <div className="flex-1 flex justify-end items-center gap-2">
              {explanation ? (
                <AttributionBadge 
                  causeCode={explanation.attribution.primaryCause} 
                  showIcon={true}
                />
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  <Brain className="w-3 h-3 mr-1" />
                  No analysis
                </Badge>
              )}
            </div>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4 pl-14"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Trade Details */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      Trade Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="ml-2 text-foreground">{trade.quantity}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Market:</span>
                        <span className="ml-2 text-foreground capitalize">{trade.market || 'Equity'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Entry:</span>
                        <span className="ml-2 text-foreground">{formatINR(trade.entry_price)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Exit:</span>
                        <span className="ml-2 text-foreground">{trade.exit_price ? formatINR(trade.exit_price) : '—'}</span>
                      </div>
                      {trade.strategy_name && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Strategy:</span>
                          <span className="ml-2 text-foreground">{trade.strategy_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* AI Explanation */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Analysis
                      </h4>
                      {!explanation && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateExplanation();
                          }}
                          disabled={isGenerating}
                          className="text-xs"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Brain className="w-3 h-3 mr-1" />
                              Generate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {explanation ? (
                      <TradeExplanationCard
                        attribution={explanation.attribution}
                        explanation={{
                          tradeId: explanation.trade_id,
                          explanation: explanation.explanation_text,
                          attribution: explanation.attribution,
                          validated: explanation.validated,
                          sanitizedPayload: {}
                        }}
                        compact
                      />
                    ) : (
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border text-center">
                        <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No AI analysis yet. Click "Generate" to create one.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

const TradeJournal = () => {
  const { user } = useAuth();
  const { explainTradeExit, isLoading: isExplaining } = useTradeExplanation();
  
  const [trades, setTrades] = useState<JournalTrade[]>([]);
  const [explanations, setExplanations] = useState<Map<string, TradeExplanationData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
  const [generatingTradeId, setGeneratingTradeId] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('30d');
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const [causeFilter, setCauseFilter] = useState<string>('all');

  // Fetch trades and explanations
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get user's paper account
        const { data: accountData, error: accountError } = await supabase
          .from('paper_accounts')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (accountError) {
          if (accountError.code !== 'PGRST116') {
            throw accountError;
          }
          setTrades([]);
          return;
        }

        // Fetch all closed trades
        const { data: tradesData, error: tradesError } = await supabase
          .from('paper_trades')
          .select(`
            *,
            strategies:strategy_id (name)
          `)
          .eq('account_id', accountData.id)
          .eq('status', 'closed')
          .order('closed_at', { ascending: false });
        
        if (tradesError) throw tradesError;
        
        // Map strategy names
        const mappedTrades = (tradesData || []).map(t => ({
          ...t,
          strategy_name: t.strategies?.name
        })) as JournalTrade[];
        
        setTrades(mappedTrades);
        
        // Fetch explanations for these trades
        if (mappedTrades.length > 0) {
          const tradeIds = mappedTrades.map(t => t.id);
          const { data: explanationsData } = await supabase
            .from('trade_explanations')
            .select('*')
            .in('trade_id', tradeIds);
          
          if (explanationsData) {
            const expMap = new Map<string, TradeExplanationData>();
            explanationsData.forEach(exp => {
              expMap.set(exp.trade_id, exp as unknown as TradeExplanationData);
            });
            setExplanations(expMap);
          }
        }
      } catch (error) {
        console.error('Failed to fetch trade journal:', error);
        toast.error('Failed to load trade journal');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Filter trades
  const filteredTrades = useMemo(() => {
    let filtered = [...trades];
    
    // Date filter
    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter.replace('d', ''));
      const startDate = startOfDay(subDays(new Date(), days));
      const endDate = endOfDay(new Date());
      
      filtered = filtered.filter(t => {
        const tradeDate = parseISO(t.closed_at || t.opened_at);
        return isWithinInterval(tradeDate, { start: startDate, end: endDate });
      });
    }
    
    // Outcome filter
    if (outcomeFilter === 'profit') {
      filtered = filtered.filter(t => (t.pnl || 0) > 0);
    } else if (outcomeFilter === 'loss') {
      filtered = filtered.filter(t => (t.pnl || 0) < 0);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.symbol.toLowerCase().includes(query) ||
        t.strategy_name?.toLowerCase().includes(query)
      );
    }
    
    // Cause filter
    if (causeFilter !== 'all') {
      filtered = filtered.filter(t => {
        const exp = explanations.get(t.id);
        return exp?.attribution.primaryCause === causeFilter;
      });
    }
    
    return filtered;
  }, [trades, dateFilter, outcomeFilter, searchQuery, causeFilter, explanations]);

  // Calculate stats
  const stats = useMemo(() => calculateStats(filteredTrades), [filteredTrades]);

  // Generate explanation for a trade
  const handleGenerateExplanation = async (trade: JournalTrade) => {
    setGeneratingTradeId(trade.id);
    
    try {
      const tradeData: TradeData = {
        tradeId: trade.id,
        strategyId: trade.strategy_id || 'manual',
        strategyName: trade.strategy_name || 'Manual Trade',
        assetClass: (trade.market?.toUpperCase() as 'EQUITY' | 'OPTIONS' | 'FUTURES') || 'EQUITY',
        timeframe: '5m',
        symbol: trade.symbol,
        direction: trade.side === 'buy' ? 'LONG' : 'SHORT',
        entryPrice: trade.entry_price,
        exitPrice: trade.exit_price || trade.entry_price,
        quantity: trade.quantity,
        entryTimestamp: trade.opened_at,
        exitTimestamp: trade.closed_at || trade.opened_at,
        exitReason: (trade.reason?.toUpperCase() as 'STOP_LOSS' | 'TARGET' | 'TIME_EXIT' | 'TRAILING_STOP' | 'MANUAL_EXIT') || 'MANUAL_EXIT',
        holdingMinutes: trade.closed_at && trade.opened_at 
          ? Math.round((new Date(trade.closed_at).getTime() - new Date(trade.opened_at).getTime()) / 60000)
          : 0,
        riskPercent: 1.0
      };
      
      const result = await explainTradeExit(tradeData);
      
      if (result) {
        // Refresh explanations
        const { data: expData } = await supabase
          .from('trade_explanations')
          .select('*')
          .eq('trade_id', trade.id)
          .single();
        
        if (expData) {
          setExplanations(prev => {
            const updated = new Map(prev);
            updated.set(trade.id, expData as unknown as TradeExplanationData);
            return updated;
          });
        }
        
        toast.success('AI analysis generated');
      }
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      toast.error('Failed to generate explanation');
    } finally {
      setGeneratingTradeId(null);
    }
  };

  // Get unique cause codes for filter
  const availableCauses = useMemo(() => {
    const causes = new Set<string>();
    explanations.forEach(exp => {
      causes.add(exp.attribution.primaryCause);
    });
    return Array.from(causes);
  }, [explanations]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-primary" />
              Trade Journal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review your trades with AI-powered insights and cause attribution
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="self-start"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3"
        >
          <StatCard 
            label="Total Trades" 
            value={stats.totalTrades.toString()} 
            icon={BarChart3}
          />
          <StatCard 
            label="Win Rate" 
            value={`${stats.winRate.toFixed(1)}%`} 
            icon={Target}
            trend={stats.winRate >= 50 ? 'up' : 'down'}
          />
          <StatCard 
            label="Total P&L" 
            value={formatINR(stats.totalPnl)} 
            icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
            trend={stats.totalPnl >= 0 ? 'up' : 'down'}
          />
          <StatCard 
            label="Avg P&L" 
            value={formatINR(stats.avgPnl)} 
            icon={BarChart3}
            trend={stats.avgPnl >= 0 ? 'up' : 'down'}
          />
          <StatCard 
            label="Best Trade" 
            value={formatINR(stats.bestTrade)} 
            icon={TrendingUp}
            trend="up"
          />
          <StatCard 
            label="Worst Trade" 
            value={formatINR(stats.worstTrade)} 
            icon={TrendingDown}
            trend="down"
          />
          <StatCard 
            label="Profit Factor" 
            value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)} 
            icon={Target}
            trend={stats.profitFactor >= 1.5 ? 'up' : stats.profitFactor >= 1 ? 'neutral' : 'down'}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-3"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search symbol or strategy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          
          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Outcome Filter */}
          <Select value={outcomeFilter} onValueChange={(v) => setOutcomeFilter(v as OutcomeFilter)}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trades</SelectItem>
              <SelectItem value="profit">Profits Only</SelectItem>
              <SelectItem value="loss">Losses Only</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Cause Filter */}
          {availableCauses.length > 0 && (
            <Select value={causeFilter} onValueChange={setCauseFilter}>
              <SelectTrigger className="w-44">
                <Brain className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by cause" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Causes</SelectItem>
                {availableCauses.map(cause => (
                  <SelectItem key={cause} value={cause}>
                    {CAUSE_CODE_LABELS[cause as CauseCode]?.label || cause}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Active Filters */}
          {(searchQuery || dateFilter !== '30d' || outcomeFilter !== 'all' || causeFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setDateFilter('30d');
                setOutcomeFilter('all');
                setCauseFilter('all');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}
        </motion.div>

        {/* Trade List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {filteredTrades.length} trade{filteredTrades.length !== 1 ? 's' : ''} found
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="hidden md:inline">Click a row to expand</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-6 h-6 rounded" />
                      <Skeleton className="h-12 flex-1 rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredTrades.length === 0 ? (
                <div className="py-16 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No trades found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {trades.length === 0 
                      ? "Start paper trading to see your trades here with AI-powered insights."
                      : "Try adjusting your filters to see more results."
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredTrades.map((trade) => (
                    <TradeRow
                      key={trade.id}
                      trade={trade}
                      explanation={explanations.get(trade.id)}
                      isExpanded={expandedTradeId === trade.id}
                      onToggle={() => setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id)}
                      onGenerateExplanation={() => handleGenerateExplanation(trade)}
                      isGenerating={generatingTradeId === trade.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TradeJournal;
