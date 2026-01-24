/**
 * FEATURE 3: POSITION SIZING ENGINE
 * 
 * Risk-based position sizing:
 * - % risk per trade
 * - ATR/volatility-based stops
 * - Confidence weighting
 * - Volatility adjustment
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// TYPES
// ============================================================================

interface PositionSizeResult {
  quantity: number;
  max_loss_amount: number;
  stop_loss_price: number;
  position_value: number;
  risk_amount: number;
}

interface SizingConfig {
  risk_per_trade_pct: number;
  min_position_size: number;
  max_position_size: number;
  use_atr_stops: boolean;
  atr_multiplier: number;
  confidence_weighting: boolean;
  volatility_adjustment: boolean;
}

type Strategy = "MOMENTUM" | "MEAN_REVERSION" | "TREND_FOLLOWING" | "BREAKOUT" | "SCALPING";

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: SizingConfig = {
  risk_per_trade_pct: 1.0, // 1% risk per trade
  min_position_size: 1,
  max_position_size: 10000,
  use_atr_stops: true,
  atr_multiplier: 2.0,
  confidence_weighting: true,
  volatility_adjustment: true,
};

// ============================================================================
// POSITION SIZING LOGIC
// ============================================================================

// Strategy-specific stop loss percentages
const STRATEGY_STOP_PCTS: Record<Strategy, number> = {
  MOMENTUM: 0.03, // 3%
  MEAN_REVERSION: 0.02, // 2%
  TREND_FOLLOWING: 0.05, // 5%
  BREAKOUT: 0.04, // 4%
  SCALPING: 0.01, // 1%
};

function calculateStopLoss(
  entryPrice: number,
  strategy: Strategy,
  volatility: number,
  atr: number,
  config: SizingConfig
): number {
  let stopPct = STRATEGY_STOP_PCTS[strategy] || 0.03;

  // ATR-based stop if enabled
  if (config.use_atr_stops && atr > 0) {
    const atrStop = (atr * config.atr_multiplier) / entryPrice;
    stopPct = Math.max(stopPct, atrStop);
  }

  // Volatility adjustment (wider stops in high volatility)
  if (config.volatility_adjustment && volatility > 0.03) {
    const volAdjustment = 1 + (volatility - 0.03) * 5;
    stopPct = stopPct * volAdjustment;
  }

  return Math.round(entryPrice * (1 - stopPct) * 100) / 100;
}

function calculatePositionSize(
  availableCapital: number,
  currentPrice: number,
  stopLossPrice: number,
  confidence: number,
  volatility: number,
  config: SizingConfig
): PositionSizeResult {
  // 1. Calculate risk amount
  const riskAmount = availableCapital * (config.risk_per_trade_pct / 100);

  // 2. Calculate stop distance
  let stopDistance = Math.abs(currentPrice - stopLossPrice);

  if (stopDistance === 0) {
    // Fallback to 2x volatility
    stopDistance = currentPrice * volatility * 2;
  }

  // 3. Base quantity calculation (risk-based)
  let baseQuantity = stopDistance > 0 
    ? riskAmount / stopDistance 
    : riskAmount / (currentPrice * 0.02);

  // 4. Confidence weighting
  let adjustedQuantity = baseQuantity;
  if (config.confidence_weighting) {
    adjustedQuantity = baseQuantity * confidence;
  }

  // 5. Volatility adjustment (reduce size in high volatility)
  if (config.volatility_adjustment && volatility > 0.03) {
    const volFactor = 1.0 - Math.min(0.5, (volatility - 0.03) * 10);
    adjustedQuantity *= volFactor;
  }

  // 6. Apply bounds
  let quantity = Math.floor(adjustedQuantity);
  quantity = Math.max(config.min_position_size, Math.min(quantity, config.max_position_size));

  // 7. Calculate actual max loss
  const maxLoss = quantity * stopDistance;
  const positionValue = quantity * currentPrice;

  return {
    quantity,
    max_loss_amount: Math.round(maxLoss * 100) / 100,
    stop_loss_price: stopLossPrice,
    position_value: Math.round(positionValue * 100) / 100,
    risk_amount: Math.round(riskAmount * 100) / 100,
  };
}

// ============================================================================
// HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = userData.user.id;
    const body = await req.json();
    const { action } = body;

    // Load user config or use default
    let config = DEFAULT_CONFIG;
    if (body.account_id) {
      const { data: userConfig } = await supabase
        .from("position_sizing_configs")
        .select("*")
        .eq("account_id", body.account_id)
        .eq("user_id", userId)
        .single();

      if (userConfig) {
        config = {
          risk_per_trade_pct: Number(userConfig.risk_per_trade_pct),
          min_position_size: userConfig.min_position_size,
          max_position_size: userConfig.max_position_size,
          use_atr_stops: userConfig.use_atr_stops,
          atr_multiplier: Number(userConfig.atr_multiplier),
          confidence_weighting: userConfig.confidence_weighting,
          volatility_adjustment: userConfig.volatility_adjustment,
        };
      }
    }

    switch (action) {
      case "calculate": {
        const {
          available_capital,
          current_price,
          strategy,
          confidence = 1.0,
          volatility = 0.02,
          atr = 0,
          stop_loss_price: customStopLoss,
        } = body;

        if (!available_capital || !current_price || !strategy) {
          return new Response(
            JSON.stringify({
              error: "Missing required fields: available_capital, current_price, strategy",
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Calculate stop loss
        const stopLossPrice = customStopLoss || calculateStopLoss(
          current_price,
          strategy as Strategy,
          volatility,
          atr,
          config
        );

        // Calculate position size
        const result = calculatePositionSize(
          available_capital,
          current_price,
          stopLossPrice,
          confidence,
          volatility,
          config
        );

        return new Response(
          JSON.stringify({
            success: true,
            ...result,
            strategy,
            confidence,
            volatility,
            atr,
            config_used: config,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "calculate_stop_loss": {
        const { entry_price, strategy, volatility = 0.02, atr = 0 } = body;

        if (!entry_price || !strategy) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: entry_price, strategy" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const stopLossPrice = calculateStopLoss(
          entry_price,
          strategy as Strategy,
          volatility,
          atr,
          config
        );

        const stopDistance = entry_price - stopLossPrice;
        const stopPct = (stopDistance / entry_price) * 100;

        return new Response(
          JSON.stringify({
            success: true,
            entry_price,
            stop_loss_price: stopLossPrice,
            stop_distance: Math.round(stopDistance * 100) / 100,
            stop_pct: Math.round(stopPct * 100) / 100,
            strategy,
            volatility,
            atr,
            atr_used: config.use_atr_stops && atr > 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "batch_calculate": {
        // Calculate sizes for multiple opportunities
        const { opportunities, available_capital } = body;

        if (!opportunities || !Array.isArray(opportunities) || !available_capital) {
          return new Response(
            JSON.stringify({
              error: "Missing required fields: opportunities (array), available_capital",
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        const results = opportunities.map((opp: {
          symbol: string;
          current_price: number;
          strategy: Strategy;
          confidence?: number;
          volatility?: number;
          atr?: number;
        }) => {
          const stopLossPrice = calculateStopLoss(
            opp.current_price,
            opp.strategy,
            opp.volatility || 0.02,
            opp.atr || 0,
            config
          );

          const sizing = calculatePositionSize(
            available_capital,
            opp.current_price,
            stopLossPrice,
            opp.confidence || 1.0,
            opp.volatility || 0.02,
            config
          );

          return {
            symbol: opp.symbol,
            ...sizing,
            strategy: opp.strategy,
          };
        });

        // Sort by risk-adjusted opportunity (quantity * confidence)
        const sorted = results.sort((a, b) => b.quantity - a.quantity);

        return new Response(
          JSON.stringify({
            success: true,
            total_opportunities: results.length,
            available_capital,
            results: sorted,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_config": {
        const { account_id } = body;

        const { data: userConfig } = await supabase
          .from("position_sizing_configs")
          .select("*")
          .eq("user_id", userId)
          .eq("account_id", account_id || "")
          .maybeSingle();

        return new Response(
          JSON.stringify({
            success: true,
            default_config: DEFAULT_CONFIG,
            user_config: userConfig || null,
            strategy_stop_pcts: STRATEGY_STOP_PCTS,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "save_config": {
        const { account_id, ...configData } = body;

        const insertData = {
          user_id: userId,
          account_id: account_id || null,
          risk_per_trade_pct: configData.risk_per_trade_pct ?? DEFAULT_CONFIG.risk_per_trade_pct,
          min_position_size: configData.min_position_size ?? DEFAULT_CONFIG.min_position_size,
          max_position_size: configData.max_position_size ?? DEFAULT_CONFIG.max_position_size,
          use_atr_stops: configData.use_atr_stops ?? DEFAULT_CONFIG.use_atr_stops,
          atr_multiplier: configData.atr_multiplier ?? DEFAULT_CONFIG.atr_multiplier,
          confidence_weighting: configData.confidence_weighting ?? DEFAULT_CONFIG.confidence_weighting,
          volatility_adjustment: configData.volatility_adjustment ?? DEFAULT_CONFIG.volatility_adjustment,
        };

        const { data: saved, error } = await supabase
          .from("position_sizing_configs")
          .upsert(insertData, { onConflict: "user_id,account_id" })
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({ success: true, config: saved }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({
            error: "Unknown action",
            available_actions: [
              "calculate",
              "calculate_stop_loss",
              "batch_calculate",
              "get_config",
              "save_config",
            ],
          }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error("Position sizing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
