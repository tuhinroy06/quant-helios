import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, subDays } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Brain,
  ChevronRight,
  RefreshCw,
  PieChart,
  Activity,
  Zap,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { HealthGauge } from '@/components/strategy/HealthGauge';
import { AttributionBadge } from '@/components/trading/TradeExplanationCard';
import { CauseCode, CAUSE_CODE_LABELS } from '@/hooks/useTradeExplanation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ==========================================
// TYPES
// ==========================================

interface Strategy {
  id: string;
  name: string;
  status: string;
  market_type: string;
  health_status: string | null;
}

interface StrategyTrade {
  id: string;
  strategy_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  pnl: number | null;
  pnl_pct: number | null;
  reason: string | null;
  closed_at: string | null;
}

interface TradeExplanation {
  trade_id: string;
  attribution: {
    primaryCause: string;
    primaryDescription: string;
    secondaryCauses: string[];
    marketBehavior: string;
    priorityScore: number;
  };
}

interface StrategyPerformanceData {
  strategy: Strategy;
  trades: StrategyTrade[];
  explanations: Map<string, TradeExplanation>;
  stats: {
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    totalPnl: number;
    avgPnl: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
    maxWin: number;
    maxLoss: number;
    streakCurrent: number;
    streakBest: number;
  };
  causeCounts: Map<string, number>;
  topLossCauses: { cause: string; count: number; totalLoss: number }[];
}

type DateFilter = '7d' | '30d' | '90d' | 'all';

// ==========================================
// HELPERS
// ==========================================

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const calculateStats = (trades: StrategyTrade[]) => {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalPnl: 0,
      avgPnl: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      maxWin: 0,
      maxLoss: 0,
      streakCurrent: 0,
      streakBest: 0
    };
  }

  const pnls = trades.map(t => t.pnl || 0);
  const wins = pnls.filter(p => p > 0);
  const losses = pnls.filter(p => p < 0);
  
  const totalWins = wins.reduce((a, b) => a + b, 0);
  const totalLosses = Math.abs(losses.reduce((a, b) => a + b, 0));

  // Calculate streaks
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  for (const pnl of pnls.reverse()) {
    if (pnl > 0) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  // Current streak from most recent
  for (const pnl of [...pnls].reverse()) {
    if (pnl > 0) {
      currentStreak++;
    } else if (pnl < 0) {
      currentStreak = -1;
      break;
    }
  }

  return {
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: (wins.length / trades.length) * 100,
    totalPnl: pnls.reduce((a, b) => a + b, 0),
    avgPnl: pnls.reduce((a, b) => a + b, 0) / trades.length,
    avgWin: wins.length > 0 ? totalWins / wins.length : 0,
    avgLoss: losses.length > 0 ? totalLosses / losses.length : 0,
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
    maxWin: Math.max(...pnls, 0),
    maxLoss: Math.min(...pnls, 0),
    streakCurrent: currentStreak,
    streakBest: bestStreak
  };
};

// ==========================================
// COMPONENTS
// ==========================================

function StrategyCard({ data }: { data: StrategyPerformanceData }) {
  const { strategy, stats, topLossCauses } = data;
  const isProfitable = stats.totalPnl >= 0;
  
  return (
    <Card className="overflow-hidden hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium truncate">
              {strategy.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs capitalize">
                {strategy.market_type}
              </Badge>
              <Badge 
                variant={strategy.status === 'live' ? 'default' : 'secondary'} 
                className="text-xs capitalize"
              >
                {strategy.status}
              </Badge>
            </div>
          </div>
          <HealthGauge 
            score={stats.winRate} 
            size="sm" 
            showLabel={false}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className={`text-lg font-semibold ${stats.winRate >= 50 ? 'text-primary' : 'text-destructive'}`}>
              {stats.winRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Trades</p>
            <p className="text-lg font-semibold text-foreground">
              {stats.totalTrades}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">P&L</p>
            <p className={`text-lg font-semibold ${isProfitable ? 'text-primary' : 'text-destructive'}`}>
              {formatINR(stats.totalPnl)}
            </p>
          </div>
        </div>
        
        {/* Win/Loss Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.wins}W</span>
            <span>{stats.losses}L</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${stats.winRate}%` }}
            />
            <div 
              className="h-full bg-destructive transition-all"
              style={{ width: `${100 - stats.winRate}%` }}
            />
          </div>
        </div>
        
        {/* Advanced Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between p-2 bg-secondary/30 rounded-lg">
            <span className="text-muted-foreground">Profit Factor</span>
            <span className={`font-medium ${stats.profitFactor >= 1.5 ? 'text-primary' : stats.profitFactor >= 1 ? 'text-foreground' : 'text-destructive'}`}>
              {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between p-2 bg-secondary/30 rounded-lg">
            <span className="text-muted-foreground">Avg Win</span>
            <span className="font-medium text-primary">{formatINR(stats.avgWin)}</span>
          </div>
          <div className="flex justify-between p-2 bg-secondary/30 rounded-lg">
            <span className="text-muted-foreground">Avg Loss</span>
            <span className="font-medium text-destructive">-{formatINR(stats.avgLoss)}</span>
          </div>
          <div className="flex justify-between p-2 bg-secondary/30 rounded-lg">
            <span className="text-muted-foreground">Best Streak</span>
            <span className="font-medium text-foreground">{stats.streakBest}</span>
          </div>
        </div>
        
        {/* Top Loss Causes */}
        {topLossCauses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3" />
              <span>Top Loss Causes</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topLossCauses.slice(0, 3).map(({ cause, count }) => (
                <div key={cause} className="flex items-center gap-1">
                  <AttributionBadge causeCode={cause} showIcon={false} />
                  <span className="text-xs text-muted-foreground">×{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/dashboard/strategies/${strategy.id}/review`}>
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CauseBreakdownChart({ 
  causeCounts, 
  totalLosses 
}: { 
  causeCounts: { cause: string; count: number; percentage: number }[];
  totalLosses: number;
}) {
  if (causeCounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Shield className="w-10 h-10 text-primary mb-3" />
        <p className="text-sm text-muted-foreground">No losses recorded yet!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {causeCounts.map(({ cause, count, percentage }) => {
        const causeInfo = CAUSE_CODE_LABELS[cause as CauseCode];
        return (
          <div key={cause} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className={causeInfo?.color || 'text-muted-foreground'}>
                {causeInfo?.label || cause}
              </span>
              <span className="text-muted-foreground">
                {count} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

const StrategyPerformance = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [performanceData, setPerformanceData] = useState<Map<string, StrategyPerformanceData>>(new Map());
  const [dateFilter, setDateFilter] = useState<DateFilter>('30d');
  const [sortBy, setSortBy] = useState<'pnl' | 'winRate' | 'trades'>('pnl');

  // Fetch all data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch strategies
        const { data: strategiesData, error: strategiesError } = await supabase
          .from('strategies')
          .select('id, name, status, market_type, health_status')
          .eq('user_id', user.id);

        if (strategiesError) throw strategiesError;
        setStrategies(strategiesData || []);

        if (!strategiesData || strategiesData.length === 0) {
          setIsLoading(false);
          return;
        }

        // Get user's paper account
        const { data: accountData } = await supabase
          .from('paper_accounts')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!accountData) {
          setIsLoading(false);
          return;
        }

        // Calculate date range
        let dateCondition = '';
        if (dateFilter !== 'all') {
          const days = parseInt(dateFilter.replace('d', ''));
          const startDate = subDays(new Date(), days).toISOString();
          dateCondition = startDate;
        }

        // Fetch all trades with strategy_id
        let tradesQuery = supabase
          .from('paper_trades')
          .select('id, strategy_id, symbol, side, pnl, pnl_pct, reason, closed_at')
          .eq('account_id', accountData.id)
          .eq('status', 'closed')
          .not('strategy_id', 'is', null);

        if (dateCondition) {
          tradesQuery = tradesQuery.gte('closed_at', dateCondition);
        }

        const { data: tradesData, error: tradesError } = await tradesQuery;
        if (tradesError) throw tradesError;

        // Fetch explanations for these trades
        const tradeIds = (tradesData || []).map(t => t.id);
        let explanationsMap = new Map<string, TradeExplanation>();
        
        if (tradeIds.length > 0) {
          const { data: explanationsData } = await supabase
            .from('trade_explanations')
            .select('trade_id, attribution')
            .in('trade_id', tradeIds);

          if (explanationsData) {
            explanationsData.forEach(exp => {
              explanationsMap.set(exp.trade_id, exp as unknown as TradeExplanation);
            });
          }
        }

        // Build performance data per strategy
        const perfMap = new Map<string, StrategyPerformanceData>();
        
        for (const strategy of strategiesData) {
          const strategyTrades = (tradesData || []).filter(t => t.strategy_id === strategy.id) as StrategyTrade[];
          const stats = calculateStats(strategyTrades);
          
          // Count causes for losses
          const causeCounts = new Map<string, number>();
          const lossCauseTotals = new Map<string, number>();
          
          for (const trade of strategyTrades) {
            if ((trade.pnl || 0) < 0) {
              const exp = explanationsMap.get(trade.id);
              if (exp?.attribution?.primaryCause) {
                const cause = exp.attribution.primaryCause;
                causeCounts.set(cause, (causeCounts.get(cause) || 0) + 1);
                lossCauseTotals.set(cause, (lossCauseTotals.get(cause) || 0) + Math.abs(trade.pnl || 0));
              }
            }
          }
          
          // Sort causes by count
          const topLossCauses = Array.from(causeCounts.entries())
            .map(([cause, count]) => ({
              cause,
              count,
              totalLoss: lossCauseTotals.get(cause) || 0
            }))
            .sort((a, b) => b.count - a.count);
          
          perfMap.set(strategy.id, {
            strategy,
            trades: strategyTrades,
            explanations: explanationsMap,
            stats,
            causeCounts,
            topLossCauses
          });
        }
        
        setPerformanceData(perfMap);
      } catch (error) {
        console.error('Failed to fetch strategy performance:', error);
        toast.error('Failed to load performance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, dateFilter]);

  // Sorted strategies
  const sortedStrategies = useMemo(() => {
    const dataArray = Array.from(performanceData.values());
    
    return dataArray.sort((a, b) => {
      switch (sortBy) {
        case 'pnl':
          return b.stats.totalPnl - a.stats.totalPnl;
        case 'winRate':
          return b.stats.winRate - a.stats.winRate;
        case 'trades':
          return b.stats.totalTrades - a.stats.totalTrades;
        default:
          return 0;
      }
    });
  }, [performanceData, sortBy]);

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    let totalTrades = 0;
    let totalWins = 0;
    let totalPnl = 0;
    const allCauses = new Map<string, number>();
    
    for (const data of performanceData.values()) {
      totalTrades += data.stats.totalTrades;
      totalWins += data.stats.wins;
      totalPnl += data.stats.totalPnl;
      
      for (const [cause, count] of data.causeCounts) {
        allCauses.set(cause, (allCauses.get(cause) || 0) + count);
      }
    }
    
    const totalLosses = totalTrades - totalWins;
    const causesArray = Array.from(allCauses.entries())
      .map(([cause, count]) => ({
        cause,
        count,
        percentage: totalLosses > 0 ? (count / totalLosses) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    return {
      totalStrategies: performanceData.size,
      totalTrades,
      winRate: totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0,
      totalPnl,
      topCauses: causesArray.slice(0, 5),
      totalLosses
    };
  }, [performanceData]);

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
              <BarChart3 className="w-7 h-7 text-primary" />
              Strategy Performance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Compare strategies with win rates and loss cause analysis
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger className="w-32">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-32">
                <Activity className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pnl">By P&L</SelectItem>
                <SelectItem value="winRate">By Win Rate</SelectItem>
                <SelectItem value="trades">By Trades</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Aggregate Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Strategies</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {aggregateStats.totalStrategies}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Trades</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {aggregateStats.totalTrades}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Avg Win Rate</span>
              </div>
              <p className={`text-2xl font-bold ${aggregateStats.winRate >= 50 ? 'text-primary' : 'text-destructive'}`}>
                {aggregateStats.winRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                {aggregateStats.totalPnl >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-primary" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-destructive" />
                )}
                <span className="text-sm text-muted-foreground">Total P&L</span>
              </div>
              <p className={`text-2xl font-bold ${aggregateStats.totalPnl >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatINR(aggregateStats.totalPnl)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Strategy Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <PieChart className="w-5 h-5 text-muted-foreground" />
              Strategy Breakdown
            </h2>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedStrategies.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No strategies with trades</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create strategies and execute trades to see performance analytics
                  </p>
                  <Button asChild>
                    <Link to="/dashboard/strategies/create">Create Strategy</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {sortedStrategies.map((data) => (
                  <StrategyCard key={data.strategy.id} data={data} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Loss Cause Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Brain className="w-5 h-5 text-muted-foreground" />
              Loss Cause Analysis
            </h2>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Top Loss Causes Across All Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <CauseBreakdownChart 
                    causeCounts={aggregateStats.topCauses}
                    totalLosses={aggregateStats.totalLosses}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Quick Tips */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Improvement Tips
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {aggregateStats.topCauses.slice(0, 2).map(({ cause }) => {
                    const tips: Record<string, string> = {
                      'WHIPSAW_STOP': 'Consider widening stop-loss or using ATR-based stops',
                      'VOLATILITY_EXPANSION': 'Add volatility filters to avoid entries during spikes',
                      'IV_CRUSH': 'Avoid holding options through earnings or events',
                      'TREND_REVERSAL': 'Add trend confirmation before entries',
                      'FALSE_BREAKOUT': 'Wait for breakout confirmation with volume',
                      'MOMENTUM_FAILURE': 'Use momentum indicators to filter weak signals',
                      'LEVERAGE_AMPLIFICATION': 'Reduce position size or leverage ratio'
                    };
                    return (
                      <li key={cause} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{tips[cause] || `Review ${CAUSE_CODE_LABELS[cause as CauseCode]?.label || cause} trades`}</span>
                      </li>
                    );
                  })}
                  {aggregateStats.topCauses.length === 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Keep trading to build your performance data</span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StrategyPerformance;
