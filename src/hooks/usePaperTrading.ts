import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PaperAccount {
  id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  currency: string;
  status: string;
}

export interface PaperPosition {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number | null;
  status: string;
  opened_at: string;
}

export interface PaperTrade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  status: string;
  pnl: number | null;
  pnl_pct: number | null;
  fees: number | null;
  opened_at: string;
  closed_at: string | null;
  reason: string | null;
}

export interface PaperTradingStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
}

export const usePaperTrading = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [stats, setStats] = useState<PaperTradingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    if (!user) return null;

    // Try to get existing account
    let { data: accountData, error: accountError } = await supabase
      .from('paper_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (accountError && accountError.code !== 'PGRST116') {
      console.error('Error fetching account:', accountError);
      throw accountError;
    }

    // Create new account if none exists
    if (!accountData) {
      const { data: newAccount, error: createError } = await supabase
        .from('paper_accounts')
        .insert({
          user_id: user.id,
          name: 'Paper Trading Account',
          initial_balance: 1000000,
          current_balance: 1000000,
          currency: 'INR',
          status: 'active',
          is_active: true,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating account:', createError);
        throw createError;
      }
      accountData = newAccount;
    }

    return accountData;
  }, [user]);

  const fetchPositions = useCallback(async (accountId: string) => {
    const { data, error } = await supabase
      .from('paper_positions')
      .select('*')
      .eq('account_id', accountId)
      .eq('status', 'open')
      .order('opened_at', { ascending: false });

    if (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }

    return (data as PaperPosition[]) || [];
  }, []);

  const fetchTrades = useCallback(async (accountId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('paper_trades')
      .select('*')
      .eq('account_id', accountId)
      .order('opened_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trades:', error);
      throw error;
    }

    return (data as PaperTrade[]) || [];
  }, []);

  const calculateStats = useCallback((tradeList: PaperTrade[]): PaperTradingStats => {
    const closedTrades = tradeList.filter(t => t.status === 'closed' && t.pnl !== null);
    
    if (closedTrades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        profitFactor: 0,
      };
    }

    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
    
    const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
    
    const pnlValues = closedTrades.map(t => t.pnl || 0);
    const largestWin = Math.max(0, ...pnlValues);
    const largestLoss = Math.min(0, ...pnlValues);

    return {
      totalTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      totalPnL: closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      avgWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
      avgLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
      largestWin,
      largestLoss,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
    };
  }, []);

  const refreshData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accountData = await fetchAccount();
      if (!accountData) {
        setLoading(false);
        return;
      }

      setAccount(accountData);

      const [positionsData, tradesData] = await Promise.all([
        fetchPositions(accountData.id),
        fetchTrades(accountData.id),
      ]);

      setPositions(positionsData);
      setTrades(tradesData);
      setStats(calculateStats(tradesData));
    } catch (err) {
      console.error('Error refreshing paper trading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      toast.error('Failed to load paper trading data');
    } finally {
      setLoading(false);
    }
  }, [user, fetchAccount, fetchPositions, fetchTrades, calculateStats]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time subscription for positions and trades
  useEffect(() => {
    if (!account?.id) return;

    const positionsChannel = supabase
      .channel('paper-positions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paper_positions',
          filter: `account_id=eq.${account.id}`,
        },
        () => {
          fetchPositions(account.id).then(setPositions);
        }
      )
      .subscribe();

    const tradesChannel = supabase
      .channel('paper-trades-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paper_trades',
          filter: `account_id=eq.${account.id}`,
        },
        async () => {
          const newTrades = await fetchTrades(account.id);
          setTrades(newTrades);
          setStats(calculateStats(newTrades));
        }
      )
      .subscribe();

    const accountChannel = supabase
      .channel('paper-account-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'paper_accounts',
          filter: `id=eq.${account.id}`,
        },
        (payload) => {
          setAccount(payload.new as PaperAccount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(positionsChannel);
      supabase.removeChannel(tradesChannel);
      supabase.removeChannel(accountChannel);
    };
  }, [account?.id, fetchPositions, fetchTrades, calculateStats]);

  return {
    account,
    positions,
    trades,
    stats,
    loading,
    error,
    refreshData,
  };
};
