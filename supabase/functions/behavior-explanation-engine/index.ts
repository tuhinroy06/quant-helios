/**
 * UNIFIED BEHAVIOR & EXPLANATION ENGINE
 * Single source of truth for "what happened" and "why it happened"
 * 
 * Features:
 * - Entry, Exit, Trade-level, Streak, Strategy, Risk behavior detection
 * - Template-based explanations
 * - Multi-level analysis (trade, streak, strategy)
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type SupabaseAny = SupabaseClient<any, any, any>;

// ============================================================================
// ENUMS & TYPES
// ============================================================================

type BehaviorCategory = 'entry' | 'exit' | 'trade_level' | 'streak' | 'strategy' | 'risk';

type BehaviorType =
  // Entry behaviors
  | 'weak_signal_entry'
  | 'late_entry'
  | 'entry_blocked'
  | 'trend_aligned_entry'
  | 'regime_misaligned_entry'
  // Exit behaviors
  | 'early_stop_out'
  | 'efficient_profit_capture'
  | 'iv_crush'
  | 'leverage_amplification'
  | 'momentum_target'
  | 'grind_target'
  // Trade-level behaviors
  | 'clean_win'
  | 'whipsaw_loss'
  | 'missed_favorable_excursion'
  | 'risk_contained_loss'
  | 'overextended_hold'
  // Streak behaviors
  | 'loss_clustering'
  | 'win_clustering'
  | 'volatility_driven_streak'
  | 'regime_mismatch_streak'
  // Strategy behaviors
  | 'regime_dependency'
  | 'strategy_decay'
  | 'capital_inefficiency'
  | 'risk_overuse'
  | 'risk_underuse'
  | 'greeks_dominance'
  // Risk behaviors
  | 'risk_respected'
  | 'risk_cap_blocking'
  | 'slippage_impact'
  | 'overexposure_attempt';

interface Behavior {
  type: BehaviorType;
  category: BehaviorCategory;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  detectedAt: string;
  context: Record<string, any>;
}

interface Trade {
  id: string;
  timestamp: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  
  entryContext: {
    signalStrength: number;
    trendAlignment: 'with' | 'against' | 'neutral';
    regimeType: 'trending' | 'ranging' | 'volatile' | 'calm';
    volatility: number;
    entryReason: string;
  };
  
  exitContext: {
    exitReason: 'stop_loss' | 'take_profit' | 'time_exit' | 'signal_reversal';
    mae: number;
    mfe: number;
    holdTime: number;
  };
  
  risk: {
    riskAmount: number;
    riskPercent: number;
    leverage?: number;
    slippage?: number;
    blocked: boolean;
    blockReason?: string;
  };
  
  options?: {
    iv: number;
    ivChange: number;
    theta: number;
    delta: number;
    gamma: number;
  };
}

interface Explanation {
  summary: string;
  observations: string[];
  marketContext: string;
  causation: string;
  riskInteraction: string;
  severity: 'low' | 'medium' | 'high';
  behaviors: Behavior[];
}

// ============================================================================
// BEHAVIOR DETECTOR
// ============================================================================

class BehaviorDetector {
  
  // A. ENTRY BEHAVIOR DETECTION
  detectEntryBehaviors(trade: Trade): Behavior[] {
    const behaviors: Behavior[] = [];
    const timestamp = trade.timestamp;
    
    // Weak signal entry
    if (trade.entryContext.signalStrength < 0.4) {
      behaviors.push({
        type: 'weak_signal_entry',
        category: 'entry',
        severity: 'medium',
        confidence: 1 - trade.entryContext.signalStrength,
        detectedAt: timestamp,
        context: { signalStrength: trade.entryContext.signalStrength }
      });
    }
    
    // Trend alignment
    if (trade.entryContext.trendAlignment === 'with') {
      behaviors.push({
        type: 'trend_aligned_entry',
        category: 'entry',
        severity: 'low',
        confidence: 0.8,
        detectedAt: timestamp,
        context: { trendAlignment: trade.entryContext.trendAlignment }
      });
    }
    
    // Regime misalignment
    if (trade.entryContext.regimeType === 'ranging' && 
        trade.entryContext.trendAlignment !== 'neutral') {
      behaviors.push({
        type: 'regime_misaligned_entry',
        category: 'entry',
        severity: 'high',
        confidence: 0.7,
        detectedAt: timestamp,
        context: { 
          regimeType: trade.entryContext.regimeType,
          trendAlignment: trade.entryContext.trendAlignment
        }
      });
    }
    
    // Entry blocked
    if (trade.risk.blocked) {
      behaviors.push({
        type: 'entry_blocked',
        category: 'entry',
        severity: 'low',
        confidence: 1.0,
        detectedAt: timestamp,
        context: { blockReason: trade.risk.blockReason }
      });
    }
    
    return behaviors;
  }
  
  // B. EXIT BEHAVIOR DETECTION
  detectExitBehaviors(trade: Trade): Behavior[] {
    const behaviors: Behavior[] = [];
    const timestamp = trade.timestamp;
    
    // Early stop-out
    const maeRatio = Math.abs(trade.exitContext.mae / (trade.pnl || 1));
    if (trade.exitContext.exitReason === 'stop_loss' && maeRatio < 2) {
      behaviors.push({
        type: 'early_stop_out',
        category: 'exit',
        severity: 'high',
        confidence: 0.8,
        detectedAt: timestamp,
        context: { 
          mae: trade.exitContext.mae,
          maeRatio,
          volatility: trade.entryContext.volatility
        }
      });
    }
    
    // Efficient profit capture
    if (trade.pnl > 0 && trade.exitContext.mfe > 0) {
      const captureEfficiency = trade.pnl / trade.exitContext.mfe;
      if (captureEfficiency > 0.8) {
        behaviors.push({
          type: 'efficient_profit_capture',
          category: 'exit',
          severity: 'low',
          confidence: captureEfficiency,
          detectedAt: timestamp,
          context: { captureEfficiency, mfe: trade.exitContext.mfe }
        });
      }
    }
    
    // IV crush (options specific)
    if (trade.options && trade.options.ivChange < -0.2) {
      behaviors.push({
        type: 'iv_crush',
        category: 'exit',
        severity: 'high',
        confidence: Math.abs(trade.options.ivChange),
        detectedAt: timestamp,
        context: { ivChange: trade.options.ivChange }
      });
    }
    
    // Leverage amplification
    if (trade.risk.leverage && trade.risk.leverage > 2) {
      const amplification = Math.abs(trade.pnlPercent * trade.risk.leverage);
      behaviors.push({
        type: 'leverage_amplification',
        category: 'exit',
        severity: trade.pnl < 0 ? 'high' : 'medium',
        confidence: 0.9,
        detectedAt: timestamp,
        context: { leverage: trade.risk.leverage, amplification }
      });
    }
    
    return behaviors;
  }
  
  // C. TRADE-LEVEL BEHAVIOR DETECTION
  detectTradeLevelBehaviors(trade: Trade): Behavior[] {
    const behaviors: Behavior[] = [];
    const timestamp = trade.timestamp;
    
    // Clean win
    if (trade.pnl > 0 && trade.exitContext.mae / (trade.pnl || 1) > -0.2) {
      behaviors.push({
        type: 'clean_win',
        category: 'trade_level',
        severity: 'low',
        confidence: 0.9,
        detectedAt: timestamp,
        context: { pnl: trade.pnl, mae: trade.exitContext.mae }
      });
    }
    
    // Whipsaw loss
    if (trade.pnl < 0 && trade.exitContext.mfe > Math.abs(trade.pnl) * 1.5) {
      behaviors.push({
        type: 'whipsaw_loss',
        category: 'trade_level',
        severity: 'high',
        confidence: 0.85,
        detectedAt: timestamp,
        context: { 
          pnl: trade.pnl, 
          mfe: trade.exitContext.mfe,
          mfeRatio: trade.exitContext.mfe / Math.abs(trade.pnl)
        }
      });
    }
    
    // Missed favorable excursion
    if (trade.exitContext.mfe > Math.abs(trade.pnl) * 2) {
      behaviors.push({
        type: 'missed_favorable_excursion',
        category: 'trade_level',
        severity: 'medium',
        confidence: 0.75,
        detectedAt: timestamp,
        context: { mfe: trade.exitContext.mfe, pnl: trade.pnl }
      });
    }
    
    // Risk-contained loss
    if (trade.pnl < 0 && Math.abs(trade.pnl) <= trade.risk.riskAmount * 1.1) {
      behaviors.push({
        type: 'risk_contained_loss',
        category: 'trade_level',
        severity: 'low',
        confidence: 0.95,
        detectedAt: timestamp,
        context: { pnl: trade.pnl, riskAmount: trade.risk.riskAmount }
      });
    }
    
    // Overextended hold
    if (trade.exitContext.holdTime > 240 && trade.pnl < 0) {
      behaviors.push({
        type: 'overextended_hold',
        category: 'trade_level',
        severity: 'medium',
        confidence: 0.7,
        detectedAt: timestamp,
        context: { holdTime: trade.exitContext.holdTime }
      });
    }
    
    return behaviors;
  }
  
  // D. STREAK BEHAVIOR DETECTION
  detectStreakBehaviors(trades: Trade[]): Behavior[] {
    const behaviors: Behavior[] = [];
    
    if (trades.length < 3) return behaviors;
    
    const losses = trades.filter(t => t.pnl < 0);
    const wins = trades.filter(t => t.pnl > 0);
    const timestamp = trades[trades.length - 1].timestamp;
    
    // Loss clustering
    if (losses.length >= 3) {
      const avgVolatility = losses.reduce((sum, t) => sum + t.entryContext.volatility, 0) / losses.length;
      
      behaviors.push({
        type: 'loss_clustering',
        category: 'streak',
        severity: losses.length >= 5 ? 'high' : 'medium',
        confidence: 0.8,
        detectedAt: timestamp,
        context: { 
          streakLength: losses.length,
          avgVolatility,
          totalLoss: losses.reduce((sum, t) => sum + t.pnl, 0)
        }
      });
      
      // Volatility-driven streak
      if (avgVolatility > 0.02) {
        behaviors.push({
          type: 'volatility_driven_streak',
          category: 'streak',
          severity: 'high',
          confidence: 0.85,
          detectedAt: timestamp,
          context: { avgVolatility, streakLength: losses.length }
        });
      }
      
      // Regime mismatch streak
      const regimeMismatches = losses.filter(t => 
        t.entryContext.regimeType === 'ranging' && 
        t.entryContext.trendAlignment !== 'neutral'
      );
      
      if (regimeMismatches.length / losses.length > 0.6) {
        behaviors.push({
          type: 'regime_mismatch_streak',
          category: 'streak',
          severity: 'high',
          confidence: 0.9,
          detectedAt: timestamp,
          context: { 
            mismatchCount: regimeMismatches.length,
            totalLosses: losses.length
          }
        });
      }
    }
    
    // Win clustering
    if (wins.length >= 3) {
      behaviors.push({
        type: 'win_clustering',
        category: 'streak',
        severity: 'low',
        confidence: 0.8,
        detectedAt: timestamp,
        context: { 
          streakLength: wins.length,
          totalProfit: wins.reduce((sum, t) => sum + t.pnl, 0)
        }
      });
    }
    
    return behaviors;
  }
  
  // E. STRATEGY BEHAVIOR DETECTION
  detectStrategyBehaviors(trades: Trade[]): Behavior[] {
    const behaviors: Behavior[] = [];
    
    if (trades.length < 10) return behaviors;
    
    const timestamp = trades[trades.length - 1].timestamp;
    
    // Group by regime
    const regimePerformance: Record<string, { wins: number; losses: number; pnl: number }> = {};
    
    trades.forEach(t => {
      const regime = t.entryContext.regimeType;
      if (!regimePerformance[regime]) {
        regimePerformance[regime] = { wins: 0, losses: 0, pnl: 0 };
      }
      
      regimePerformance[regime].pnl += t.pnl;
      if (t.pnl > 0) regimePerformance[regime].wins++;
      else regimePerformance[regime].losses++;
    });
    
    // Regime dependency
    const regimes = Object.keys(regimePerformance);
    const pnlVariance = this.calculateVariance(regimes.map(r => regimePerformance[r].pnl));
    
    if (pnlVariance > 1000 && regimes.length > 1) {
      behaviors.push({
        type: 'regime_dependency',
        category: 'strategy',
        severity: 'high',
        confidence: 0.85,
        detectedAt: timestamp,
        context: { regimePerformance, pnlVariance }
      });
    }
    
    // Capital inefficiency
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    
    if (winningTrades.length > 0 && losingTrades.length > 0) {
      const avgWin = winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length;
      const avgLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length);
      
      if (avgLoss > 0 && avgWin / avgLoss < 1.2) {
        behaviors.push({
          type: 'capital_inefficiency',
          category: 'strategy',
          severity: 'medium',
          confidence: 0.75,
          detectedAt: timestamp,
          context: { avgWin, avgLoss, ratio: avgWin / avgLoss }
        });
      }
    }
    
    // Risk overuse/underuse
    const avgRiskUsed = trades.reduce((sum, t) => sum + t.risk.riskPercent, 0) / trades.length;
    
    if (avgRiskUsed > 0.03) {
      behaviors.push({
        type: 'risk_overuse',
        category: 'strategy',
        severity: 'high',
        confidence: 0.9,
        detectedAt: timestamp,
        context: { avgRiskUsed }
      });
    } else if (avgRiskUsed < 0.005) {
      behaviors.push({
        type: 'risk_underuse',
        category: 'strategy',
        severity: 'medium',
        confidence: 0.8,
        detectedAt: timestamp,
        context: { avgRiskUsed }
      });
    }
    
    // Greeks dominance (options specific)
    const optionTrades = trades.filter(t => t.options);
    if (optionTrades.length > 5) {
      const thetaDominant = optionTrades.filter(t => 
        t.options && Math.abs(t.options.theta * t.exitContext.holdTime / 60) > Math.abs(t.pnl) * 0.3
      );
      
      if (thetaDominant.length / optionTrades.length > 0.5) {
        behaviors.push({
          type: 'greeks_dominance',
          category: 'strategy',
          severity: 'medium',
          confidence: 0.8,
          detectedAt: timestamp,
          context: { 
            thetaDominantCount: thetaDominant.length,
            totalOptionsTradesCount: optionTrades.length
          }
        });
      }
    }
    
    return behaviors;
  }
  
  // F. RISK BEHAVIOR DETECTION
  detectRiskBehaviors(trade: Trade): Behavior[] {
    const behaviors: Behavior[] = [];
    const timestamp = trade.timestamp;
    
    // Risk respected
    if (trade.pnl < 0 && Math.abs(trade.pnl) <= trade.risk.riskAmount * 1.1) {
      behaviors.push({
        type: 'risk_respected',
        category: 'risk',
        severity: 'low',
        confidence: 0.95,
        detectedAt: timestamp,
        context: { 
          actualLoss: Math.abs(trade.pnl),
          plannedRisk: trade.risk.riskAmount
        }
      });
    }
    
    // Risk cap blocking
    if (trade.risk.blocked && trade.risk.blockReason?.includes('risk cap')) {
      behaviors.push({
        type: 'risk_cap_blocking',
        category: 'risk',
        severity: 'low',
        confidence: 1.0,
        detectedAt: timestamp,
        context: { blockReason: trade.risk.blockReason }
      });
    }
    
    // Slippage impact
    if (trade.risk.slippage && Math.abs(trade.risk.slippage) > trade.risk.riskAmount * 0.1) {
      behaviors.push({
        type: 'slippage_impact',
        category: 'risk',
        severity: 'medium',
        confidence: 0.85,
        detectedAt: timestamp,
        context: { 
          slippage: trade.risk.slippage,
          slippagePercent: trade.risk.slippage / trade.risk.riskAmount
        }
      });
    }
    
    return behaviors;
  }
  
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  }
}

// ============================================================================
// EXPLANATION ENGINE
// ============================================================================

class ExplanationEngine {
  
  private templates: Record<BehaviorType, (b: Behavior) => string> = {
    // Entry behaviors
    weak_signal_entry: (b) => 
      `The strategy entered during a weak momentum phase with signal strength of ${(b.context.signalStrength * 100).toFixed(0)}%.`,
    
    late_entry: (b) =>
      `Entry occurred late in the move, reducing profit potential.`,
    
    trend_aligned_entry: (b) =>
      `Entry was aligned with the prevailing trend direction.`,
    
    regime_misaligned_entry: (b) =>
      `The strategy entered against the current ${b.context.regimeType} regime, creating misalignment.`,
    
    entry_blocked: (b) =>
      `Entry was blocked due to ${b.context.blockReason || 'risk controls'}.`,
    
    // Exit behaviors
    early_stop_out: (b) =>
      `The position experienced high adverse movement early (MAE ratio: ${b.context.maeRatio?.toFixed(2) || 'N/A'}), triggering a stop-loss.`,
    
    efficient_profit_capture: (b) =>
      `Profit was captured efficiently with ${((b.context.captureEfficiency || 0) * 100).toFixed(0)}% of maximum favorable excursion realized.`,
    
    iv_crush: (b) =>
      `Implied volatility decreased by ${(Math.abs(b.context.ivChange || 0) * 100).toFixed(0)}%, negatively impacting option value.`,
    
    leverage_amplification: (b) =>
      `Leverage of ${b.context.leverage}x amplified the outcome by ${(b.context.amplification || 0).toFixed(1)}%.`,
    
    momentum_target: (b) =>
      `Target was reached via momentum continuation.`,
    
    grind_target: (b) =>
      `Target was reached through gradual price movement.`,
    
    // Trade-level behaviors
    clean_win: (b) =>
      `The trade moved favorably with minimal adverse excursion, resulting in a clean win.`,
    
    whipsaw_loss: (b) =>
      `Although price initially moved favorably (MFE: $${(b.context.mfe || 0).toFixed(2)}), the move failed to sustain and reversed.`,
    
    missed_favorable_excursion: (b) =>
      `The position reached a favorable excursion of $${(b.context.mfe || 0).toFixed(2)} but only captured $${Math.abs(b.context.pnl || 0).toFixed(2)}.`,
    
    risk_contained_loss: (b) =>
      `Risk controls worked as intended, limiting loss to $${Math.abs(b.context.pnl || 0).toFixed(2)} against planned risk of $${(b.context.riskAmount || 0).toFixed(2)}.`,
    
    overextended_hold: (b) =>
      `The position was held for ${((b.context.holdTime || 0) / 60).toFixed(1)} hours, extending beyond typical duration.`,
    
    // Streak behaviors
    loss_clustering: (b) =>
      `This sequence includes ${b.context.streakLength} consecutive losses totaling $${Math.abs(b.context.totalLoss || 0).toFixed(2)}.`,
    
    volatility_driven_streak: (b) =>
      `The loss streak occurred during a volatility expansion phase (avg: ${((b.context.avgVolatility || 0) * 100).toFixed(2)}%), increasing stop-outs.`,
    
    regime_mismatch_streak: (b) =>
      `${b.context.mismatchCount} of ${b.context.totalLosses} losses resulted from regime misalignment.`,
    
    win_clustering: (b) =>
      `This sequence includes ${b.context.streakLength} consecutive wins totaling $${(b.context.totalProfit || 0).toFixed(2)}.`,
    
    // Strategy behaviors
    regime_dependency: (b) =>
      `The strategy performs consistently in trending markets but degrades during range-bound regimes.`,
    
    strategy_decay: (b) =>
      `Strategy performance has degraded over the analysis period.`,
    
    capital_inefficiency: (b) =>
      `Average win-to-loss ratio of ${(b.context.ratio || 0).toFixed(2)} suggests capital deployment inefficiency.`,
    
    risk_overuse: (b) =>
      `Average risk per trade of ${((b.context.avgRiskUsed || 0) * 100).toFixed(2)}% exceeds recommended levels.`,
    
    risk_underuse: (b) =>
      `Average risk per trade of ${((b.context.avgRiskUsed || 0) * 100).toFixed(2)}% indicates conservative capital deployment.`,
    
    greeks_dominance: (b) =>
      `Theta decay dominated ${((b.context.thetaDominantCount / (b.context.totalOptionsTradesCount || 1)) * 100).toFixed(0)}% of option trades.`,
    
    // Risk behaviors
    risk_respected: (b) =>
      `Risk limits were respected with actual loss of $${(b.context.actualLoss || 0).toFixed(2)} vs planned $${(b.context.plannedRisk || 0).toFixed(2)}.`,
    
    risk_cap_blocking: (b) =>
      `Risk limits prevented additional entries during the drawdown period.`,
    
    slippage_impact: (b) =>
      `Slippage of ${((b.context.slippagePercent || 0) * 100).toFixed(1)}% impacted execution quality.`,
    
    overexposure_attempt: (b) =>
      `An attempt to exceed exposure limits was blocked.`
  };
  
  explainTrade(trade: Trade, behaviors: Behavior[]): Explanation {
    const observations = behaviors.map(b => {
      const template = this.templates[b.type];
      return template ? template(b) : `Detected behavior: ${b.type}`;
    });
    
    const marketContext = this.buildMarketContext(trade);
    const causation = this.buildCausation(trade, behaviors);
    const riskInteraction = this.buildRiskInteraction(trade, behaviors);
    const severity = this.determineSeverity(behaviors);
    
    // Build trade summary
    const outcome = trade.pnl > 0 ? 'profit' : 'loss';
    const primaryBehavior = behaviors.find(b => b.severity === 'high') || behaviors[0];
    
    let summary: string;
    if (!primaryBehavior) {
      summary = `This trade resulted in a $${Math.abs(trade.pnl).toFixed(2)} ${outcome}.`;
    } else {
      const behaviorDesc = primaryBehavior.type.replace(/_/g, ' ');
      summary = `This trade was ${trade.exitContext.exitReason.replace(/_/g, ' ')} due to ${behaviorDesc}. ${
        trade.risk.blocked ? 'Risk controls worked as intended, limiting exposure.' : 'Risk controls operated normally.'
      }`;
    }
    
    return {
      summary,
      observations,
      marketContext,
      causation,
      riskInteraction,
      severity,
      behaviors
    };
  }
  
  explainStreak(trades: Trade[], behaviors: Behavior[]): Explanation {
    const observations = behaviors.map(b => {
      const template = this.templates[b.type];
      return template ? template(b) : `Detected behavior: ${b.type}`;
    });
    
    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const avgVolatility = trades.reduce((sum, t) => sum + t.entryContext.volatility, 0) / trades.length;
    
    const marketContext = `The streak occurred across ${trades.length} trades with average volatility of ${(avgVolatility * 100).toFixed(2)}%.`;
    
    const causation = totalPnl < 0 
      ? `The loss streak reflects repeated ${behaviors.find(b => b.category === 'streak')?.type.replace(/_/g, ' ') || 'adverse conditions'}.`
      : `The winning streak benefited from favorable market alignment and execution.`;
    
    const riskInteraction = this.buildStreakRiskInteraction(trades, behaviors);
    const severity = this.determineSeverity(behaviors);
    
    const summary = totalPnl < 0
      ? `Loss streak of ${trades.length} trades totaling $${Math.abs(totalPnl).toFixed(2)} driven by ${behaviors[0]?.type.replace(/_/g, ' ') || 'market conditions'}.`
      : `Win streak of ${trades.length} trades totaling $${totalPnl.toFixed(2)}.`;
    
    return {
      summary,
      observations,
      marketContext,
      causation,
      riskInteraction,
      severity,
      behaviors
    };
  }
  
  explainStrategy(trades: Trade[], behaviors: Behavior[]): Explanation {
    const observations = behaviors.map(b => {
      const template = this.templates[b.type];
      return template ? template(b) : `Detected behavior: ${b.type}`;
    });
    
    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const winRate = trades.filter(t => t.pnl > 0).length / trades.length;
    
    const marketContext = `Performance analyzed across ${trades.length} trades with ${(winRate * 100).toFixed(1)}% win rate.`;
    
    const dominantBehavior = behaviors.find(b => b.category === 'strategy');
    const causation = dominantBehavior
      ? this.templates[dominantBehavior.type](dominantBehavior)
      : `Overall performance is driven by ${totalPnl > 0 ? 'consistent execution' : 'challenging market conditions'}.`;
    
    const riskInteraction = this.buildStrategyRiskInteraction(trades, behaviors);
    const severity = this.determineSeverity(behaviors);
    
    const summary = `Strategy generated $${totalPnl.toFixed(2)} across ${trades.length} trades. ${dominantBehavior ? this.templates[dominantBehavior.type](dominantBehavior) : ''}`;
    
    return {
      summary,
      observations,
      marketContext,
      causation,
      riskInteraction,
      severity,
      behaviors
    };
  }
  
  private buildMarketContext(trade: Trade): string {
    const { regimeType, volatility, trendAlignment } = trade.entryContext;
    return `Market was ${regimeType} with ${(volatility * 100).toFixed(2)}% volatility, trend alignment: ${trendAlignment}.`;
  }
  
  private buildCausation(trade: Trade, behaviors: Behavior[]): string {
    const primaryBehavior = behaviors.find(b => b.severity === 'high') || behaviors[0];
    
    if (!primaryBehavior) {
      return trade.pnl > 0 
        ? 'The trade executed as planned and reached its target.'
        : 'The trade was stopped out within expected risk parameters.';
    }
    
    if (trade.pnl < 0) {
      return `The loss resulted from ${primaryBehavior.type.replace(/_/g, ' ')}, leading to ${trade.exitContext.exitReason.replace(/_/g, ' ')}.`;
    } else {
      return `The profit resulted from ${primaryBehavior.type.replace(/_/g, ' ')}, successfully reaching the target.`;
    }
  }
  
  private buildRiskInteraction(trade: Trade, behaviors: Behavior[]): string {
    const riskBehavior = behaviors.find(b => b.category === 'risk');
    
    if (riskBehavior) {
      return this.templates[riskBehavior.type](riskBehavior);
    }
    
    if (trade.risk.blocked) {
      return 'Risk controls prevented the trade from executing.';
    }
    
    return `Risk management operated normally with ${(trade.risk.riskPercent * 100).toFixed(2)}% of capital at risk.`;
  }
  
  private buildStreakRiskInteraction(trades: Trade[], behaviors: Behavior[]): string {
    const blockedCount = trades.filter(t => t.risk.blocked).length;
    const avgRisk = trades.reduce((sum, t) => sum + t.risk.riskPercent, 0) / trades.length;
    
    if (blockedCount > 0) {
      return `Risk controls blocked ${blockedCount} trades during this period. Average risk: ${(avgRisk * 100).toFixed(2)}%.`;
    }
    
    return `Risk averaged ${(avgRisk * 100).toFixed(2)}% per trade across the streak.`;
  }
  
  private buildStrategyRiskInteraction(trades: Trade[], behaviors: Behavior[]): string {
    const riskBehavior = behaviors.find(b => b.category === 'risk' || b.type.includes('risk'));
    
    if (riskBehavior) {
      return this.templates[riskBehavior.type](riskBehavior);
    }
    
    const avgRisk = trades.reduce((sum, t) => sum + t.risk.riskPercent, 0) / trades.length;
    const maxDrawdown = this.calculateMaxDrawdown(trades);
    
    return `Average risk per trade: ${(avgRisk * 100).toFixed(2)}%. Maximum drawdown: ${(maxDrawdown * 100).toFixed(2)}%.`;
  }
  
  private determineSeverity(behaviors: Behavior[]): 'low' | 'medium' | 'high' {
    if (behaviors.some(b => b.severity === 'high')) return 'high';
    if (behaviors.some(b => b.severity === 'medium')) return 'medium';
    return 'low';
  }
  
  private calculateMaxDrawdown(trades: Trade[]): number {
    let peak = 0;
    let maxDD = 0;
    let cumulative = 0;
    
    trades.forEach(t => {
      cumulative += t.pnl;
      if (cumulative > peak) peak = cumulative;
      const dd = peak > 0 ? (peak - cumulative) / peak : 0;
      if (dd > maxDD) maxDD = dd;
    });
    
    return maxDD;
  }
}

// ============================================================================
// MAIN ENGINE
// ============================================================================

class BehaviorExplanationEngine {
  private detector = new BehaviorDetector();
  private explainer = new ExplanationEngine();
  
  analyzeTrade(trade: Trade): Explanation {
    const behaviors: Behavior[] = [
      ...this.detector.detectEntryBehaviors(trade),
      ...this.detector.detectExitBehaviors(trade),
      ...this.detector.detectTradeLevelBehaviors(trade),
      ...this.detector.detectRiskBehaviors(trade)
    ];
    
    return this.explainer.explainTrade(trade, behaviors);
  }
  
  analyzeStreak(trades: Trade[]): Explanation {
    if (trades.length === 0) {
      throw new Error('Cannot analyze empty trade streak');
    }
    
    const tradeBehaviors = trades.flatMap(t => [
      ...this.detector.detectEntryBehaviors(t),
      ...this.detector.detectExitBehaviors(t),
      ...this.detector.detectTradeLevelBehaviors(t),
      ...this.detector.detectRiskBehaviors(t)
    ]);
    
    const streakBehaviors = this.detector.detectStreakBehaviors(trades);
    const allBehaviors = [...tradeBehaviors, ...streakBehaviors];
    
    return this.explainer.explainStreak(trades, allBehaviors);
  }
  
  analyzeStrategy(trades: Trade[]): Explanation {
    if (trades.length === 0) {
      throw new Error('Cannot analyze strategy with no trades');
    }
    
    const tradeBehaviors = trades.flatMap(t => [
      ...this.detector.detectEntryBehaviors(t),
      ...this.detector.detectExitBehaviors(t),
      ...this.detector.detectTradeLevelBehaviors(t),
      ...this.detector.detectRiskBehaviors(t)
    ]);
    
    const streakBehaviors = this.detector.detectStreakBehaviors(trades);
    const strategyBehaviors = this.detector.detectStrategyBehaviors(trades);
    
    const allBehaviors = [...tradeBehaviors, ...streakBehaviors, ...strategyBehaviors];
    const uniqueBehaviors = this.deduplicateBehaviors(allBehaviors);
    
    return this.explainer.explainStrategy(trades, uniqueBehaviors);
  }
  
  getAllBehaviors(trades: Trade[]): Behavior[] {
    const allBehaviors = trades.flatMap(t => [
      ...this.detector.detectEntryBehaviors(t),
      ...this.detector.detectExitBehaviors(t),
      ...this.detector.detectTradeLevelBehaviors(t),
      ...this.detector.detectRiskBehaviors(t)
    ]);
    
    if (trades.length >= 3) {
      allBehaviors.push(...this.detector.detectStreakBehaviors(trades));
    }
    
    if (trades.length >= 10) {
      allBehaviors.push(...this.detector.detectStrategyBehaviors(trades));
    }
    
    return this.deduplicateBehaviors(allBehaviors);
  }
  
  private deduplicateBehaviors(behaviors: Behavior[]): Behavior[] {
    const seen = new Map<BehaviorType, Behavior>();
    
    behaviors.forEach(b => {
      const existing = seen.get(b.type);
      if (!existing || b.severity === 'high' || (b.severity === 'medium' && existing.severity === 'low')) {
        seen.set(b.type, b);
      }
    });
    
    return Array.from(seen.values());
  }
}

// ============================================================================
// PERSISTENCE HELPERS
// ============================================================================

async function saveExplanation(
  supabase: SupabaseAny,
  userId: string,
  explanation: Explanation,
  type: 'trade' | 'streak' | 'strategy',
  tradeId?: string,
  strategyId?: string,
  accountId?: string,
  tradeCount?: number,
  totalPnl?: number
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('trade_explanations')
    .insert({
      user_id: userId,
      trade_id: tradeId,
      strategy_id: strategyId,
      account_id: accountId,
      summary: explanation.summary,
      observations: explanation.observations,
      market_context: explanation.marketContext,
      causation: explanation.causation,
      risk_interaction: explanation.riskInteraction,
      severity: explanation.severity,
      behaviors: explanation.behaviors,
      explanation_type: type,
      trade_count: tradeCount || 1,
      total_pnl: totalPnl
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('[ERROR] Failed to save explanation:', error);
    return null;
  }
  
  return data;
}

async function saveBehaviors(
  supabase: SupabaseAny,
  userId: string,
  strategyId: string | null,
  behaviors: Behavior[],
  tradeId?: string
): Promise<void> {
  for (const behavior of behaviors) {
    await supabase
      .from('behavior_signals')
      .insert({
        user_id: userId,
        strategy_id: strategyId,
        behavior: behavior.type,
        strength: behavior.confidence,
        confidence: behavior.confidence,
        detected_at: behavior.detectedAt,
        category: behavior.category,
        severity: behavior.severity,
        context: behavior.context,
        trade_id: tradeId
      });
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let body: Record<string, unknown> = {};
    try {
      const text = await req.text();
      if (text && text.trim()) {
        body = JSON.parse(text);
      }
    } catch {
      // No body or invalid JSON
    }

    const { action } = body;
    const engine = new BehaviorExplanationEngine();

    console.log(`[BEHAVIOR-ENGINE] Action: ${action}`);

    switch (action) {
      case 'analyze_trade': {
        const { user_id, trade, strategy_id, account_id, save = true } = body as {
          user_id: string;
          trade: Trade;
          strategy_id?: string;
          account_id?: string;
          save?: boolean;
        };

        if (!trade) {
          return new Response(JSON.stringify({ error: 'trade data required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const explanation = engine.analyzeTrade(trade);

        if (save && user_id) {
          await saveExplanation(
            supabase,
            user_id,
            explanation,
            'trade',
            trade.id,
            strategy_id,
            account_id,
            1,
            trade.pnl
          );
          
          await saveBehaviors(supabase, user_id, strategy_id || null, explanation.behaviors, trade.id);
        }

        return new Response(JSON.stringify({ explanation }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'analyze_streak': {
        const { user_id, trades, strategy_id, account_id, save = true } = body as {
          user_id: string;
          trades: Trade[];
          strategy_id?: string;
          account_id?: string;
          save?: boolean;
        };

        if (!trades || trades.length === 0) {
          return new Response(JSON.stringify({ error: 'trades array required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const explanation = engine.analyzeStreak(trades);
        const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

        if (save && user_id) {
          await saveExplanation(
            supabase,
            user_id,
            explanation,
            'streak',
            undefined,
            strategy_id,
            account_id,
            trades.length,
            totalPnl
          );
          
          await saveBehaviors(supabase, user_id, strategy_id || null, explanation.behaviors);
        }

        return new Response(JSON.stringify({ explanation }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'analyze_strategy': {
        const { user_id, trades, strategy_id, account_id, save = true } = body as {
          user_id: string;
          trades: Trade[];
          strategy_id?: string;
          account_id?: string;
          save?: boolean;
        };

        if (!trades || trades.length === 0) {
          return new Response(JSON.stringify({ error: 'trades array required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const explanation = engine.analyzeStrategy(trades);
        const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

        if (save && user_id) {
          await saveExplanation(
            supabase,
            user_id,
            explanation,
            'strategy',
            undefined,
            strategy_id,
            account_id,
            trades.length,
            totalPnl
          );
          
          await saveBehaviors(supabase, user_id, strategy_id || null, explanation.behaviors);
        }

        return new Response(JSON.stringify({ explanation }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_behaviors': {
        const { trades } = body as { trades: Trade[] };

        if (!trades || trades.length === 0) {
          return new Response(JSON.stringify({ error: 'trades array required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const behaviors = engine.getAllBehaviors(trades);

        return new Response(JSON.stringify({ behaviors }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_explanations': {
        const { user_id, strategy_id, type, limit = 50 } = body as {
          user_id: string;
          strategy_id?: string;
          type?: 'trade' | 'streak' | 'strategy';
          limit?: number;
        };

        if (!user_id) {
          return new Response(JSON.stringify({ error: 'user_id required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let query = supabase
          .from('trade_explanations')
          .select('*')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (strategy_id) {
          query = query.eq('strategy_id', strategy_id);
        }

        if (type) {
          query = query.eq('explanation_type', type);
        }

        const { data, error } = await query;

        if (error) {
          console.error('[ERROR] Failed to fetch explanations:', error);
          return new Response(JSON.stringify({ error: 'Failed to fetch explanations' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ explanations: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_behavior_signals': {
        const { user_id, strategy_id, limit = 100 } = body as {
          user_id: string;
          strategy_id?: string;
          limit?: number;
        };

        if (!user_id) {
          return new Response(JSON.stringify({ error: 'user_id required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let query = supabase
          .from('behavior_signals')
          .select('*')
          .eq('user_id', user_id)
          .order('detected_at', { ascending: false })
          .limit(limit);

        if (strategy_id) {
          query = query.eq('strategy_id', strategy_id);
        }

        const { data, error } = await query;

        if (error) {
          console.error('[ERROR] Failed to fetch behavior signals:', error);
          return new Response(JSON.stringify({ error: 'Failed to fetch signals' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ signals: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ 
          error: 'Unknown action',
          available_actions: [
            'analyze_trade',
            'analyze_streak', 
            'analyze_strategy',
            'get_behaviors',
            'get_explanations',
            'get_behavior_signals'
          ],
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('[ERROR]', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
