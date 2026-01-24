/**
 * FEATURE 1: TRANSACTION COST & TAX ENGINE (India-specific)
 * 
 * Calculates all trading costs for Indian markets:
 * - Brokerage (capped)
 * - STT (Securities Transaction Tax)
 * - Exchange charges (NSE/BSE)
 * - GST (18%)
 * - Stamp duty
 * - SEBI charges
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// TYPES
// ============================================================================

interface TransactionCosts {
  brokerage: number;
  stt: number;
  exchange_charges: number;
  gst: number;
  stamp_duty: number;
  sebi_charges: number;
  total_cost: number;
}

interface CostConfig {
  brokerage_pct: number;
  max_brokerage_per_order: number;
  stt_sell_pct: number;
  exchange_txn_charge_pct: number;
  gst_pct: number;
  stamp_duty_pct: number;
  sebi_charge_pct: number;
}

interface CalculateCostsRequest {
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  config_id?: string; // Optional - use default if not provided
}

interface GetNetFillPriceRequest {
  side: "BUY" | "SELL";
  quantity: number;
  gross_price: number;
  config_id?: string;
}

// ============================================================================
// DEFAULT INDIA COST CONFIG
// ============================================================================

const DEFAULT_CONFIG: CostConfig = {
  brokerage_pct: 0.0003, // 0.03%
  max_brokerage_per_order: 20.0,
  stt_sell_pct: 0.00025, // 0.025% on sell
  exchange_txn_charge_pct: 0.0000325, // NSE charges
  gst_pct: 0.18, // 18%
  stamp_duty_pct: 0.00015, // 0.015% on buy
  sebi_charge_pct: 0.000001, // Rs.10 per crore
};

// ============================================================================
// COST CALCULATION ENGINE
// ============================================================================

function calculateCosts(
  side: "BUY" | "SELL",
  quantity: number,
  price: number,
  config: CostConfig
): TransactionCosts {
  const turnover = quantity * price;

  // 1. Brokerage (min of % or flat max)
  const brokerage_calc = turnover * config.brokerage_pct;
  const brokerage = Math.min(brokerage_calc, config.max_brokerage_per_order);

  // 2. STT (only on sell side for delivery)
  const stt = side === "SELL" ? turnover * config.stt_sell_pct : 0;

  // 3. Exchange transaction charges
  const exchange_charges = turnover * config.exchange_txn_charge_pct;

  // 4. SEBI charges
  const sebi_charges = turnover * config.sebi_charge_pct;

  // 5. GST (on brokerage + exchange charges + SEBI)
  const gst_base = brokerage + exchange_charges + sebi_charges;
  const gst = gst_base * config.gst_pct;

  // 6. Stamp duty (only on buy side)
  const stamp_duty = side === "BUY" ? turnover * config.stamp_duty_pct : 0;

  const total_cost = brokerage + stt + exchange_charges + gst + stamp_duty + sebi_charges;

  return {
    brokerage: Math.round(brokerage * 100) / 100,
    stt: Math.round(stt * 100) / 100,
    exchange_charges: Math.round(exchange_charges * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    stamp_duty: Math.round(stamp_duty * 100) / 100,
    sebi_charges: Math.round(sebi_charges * 100) / 100,
    total_cost: Math.round(total_cost * 100) / 100,
  };
}

function getNetFillPrice(
  side: "BUY" | "SELL",
  quantity: number,
  grossPrice: number,
  config: CostConfig
): { net_price: number; costs: TransactionCosts } {
  const costs = calculateCosts(side, quantity, grossPrice, config);

  // Cost per share
  const costPerShare = quantity > 0 ? costs.total_cost / quantity : 0;

  // For buy: effective price increases
  // For sell: effective price decreases
  const net_price =
    side === "BUY" ? grossPrice + costPerShare : grossPrice - costPerShare;

  return {
    net_price: Math.round(net_price * 100) / 100,
    costs,
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

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = claimsData.user.id;
    const body = await req.json();
    const { action } = body;

    let config = DEFAULT_CONFIG;

    // Load custom config if specified
    if (body.config_id) {
      const { data: customConfig } = await supabase
        .from("transaction_cost_configs")
        .select("*")
        .eq("id", body.config_id)
        .eq("user_id", userId)
        .single();

      if (customConfig) {
        config = {
          brokerage_pct: Number(customConfig.brokerage_pct),
          max_brokerage_per_order: Number(customConfig.max_brokerage_per_order),
          stt_sell_pct: Number(customConfig.stt_sell_pct),
          exchange_txn_charge_pct: Number(customConfig.exchange_txn_charge_pct),
          gst_pct: Number(customConfig.gst_pct),
          stamp_duty_pct: Number(customConfig.stamp_duty_pct),
          sebi_charge_pct: Number(customConfig.sebi_charge_pct),
        };
      }
    }

    switch (action) {
      case "calculate": {
        const { side, quantity, price } = body as CalculateCostsRequest;
        
        if (!side || !quantity || !price) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: side, quantity, price" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const costs = calculateCosts(side, quantity, price, config);
        
        return new Response(
          JSON.stringify({
            success: true,
            costs,
            turnover: quantity * price,
            cost_percentage: ((costs.total_cost / (quantity * price)) * 100).toFixed(4),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "net_fill_price": {
        const { side, quantity, gross_price } = body as GetNetFillPriceRequest;
        
        if (!side || !quantity || !gross_price) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: side, quantity, gross_price" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const result = getNetFillPrice(side, quantity, gross_price, config);
        
        return new Response(
          JSON.stringify({
            success: true,
            ...result,
            gross_price,
            side,
            quantity,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "round_trip": {
        // Calculate total costs for a complete trade (buy + sell)
        const { quantity, entry_price, exit_price } = body;
        
        if (!quantity || !entry_price || !exit_price) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: quantity, entry_price, exit_price" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const entryCosts = calculateCosts("BUY", quantity, entry_price, config);
        const exitCosts = calculateCosts("SELL", quantity, exit_price, config);
        
        const totalCosts = {
          brokerage: entryCosts.brokerage + exitCosts.brokerage,
          stt: entryCosts.stt + exitCosts.stt,
          exchange_charges: entryCosts.exchange_charges + exitCosts.exchange_charges,
          gst: entryCosts.gst + exitCosts.gst,
          stamp_duty: entryCosts.stamp_duty + exitCosts.stamp_duty,
          sebi_charges: entryCosts.sebi_charges + exitCosts.sebi_charges,
          total_cost: entryCosts.total_cost + exitCosts.total_cost,
        };

        const grossPnl = (exit_price - entry_price) * quantity;
        const netPnl = grossPnl - totalCosts.total_cost;

        return new Response(
          JSON.stringify({
            success: true,
            entry_costs: entryCosts,
            exit_costs: exitCosts,
            total_costs: totalCosts,
            gross_pnl: Math.round(grossPnl * 100) / 100,
            net_pnl: Math.round(netPnl * 100) / 100,
            cost_impact_pct: grossPnl !== 0 
              ? Math.round((totalCosts.total_cost / Math.abs(grossPnl)) * 10000) / 100
              : 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_config": {
        // Get user's cost configs
        const { data: configs } = await supabase
          .from("transaction_cost_configs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        return new Response(
          JSON.stringify({
            success: true,
            default_config: DEFAULT_CONFIG,
            user_configs: configs || [],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "save_config": {
        const { name, ...costConfig } = body;
        
        const { data: newConfig, error } = await supabase
          .from("transaction_cost_configs")
          .insert({
            user_id: userId,
            name: name || "Custom",
            ...costConfig,
          })
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({ success: true, config: newConfig }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ 
            error: "Unknown action",
            available_actions: ["calculate", "net_fill_price", "round_trip", "get_config", "save_config"]
          }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error("Transaction costs error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
