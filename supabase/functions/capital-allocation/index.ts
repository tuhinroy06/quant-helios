/**
 * FEATURE 2: CAPITAL ALLOCATION ENGINE
 * 
 * Manages capital allocation across strategies:
 * - Per-strategy capital limits
 * - Drawdown protection per strategy
 * - Capital utilization tracking
 * - Strategy-level kill switches
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// TYPES
// ============================================================================

type Strategy = "MOMENTUM" | "MEAN_REVERSION" | "TREND_FOLLOWING" | "BREAKOUT" | "SCALPING";

interface StrategyAllocation {
  strategy: Strategy;
  allocated_pct: number;
  allocated_capital: number;
  used_capital: number;
  peak_capital: number;
  max_drawdown_pct: number;
  enabled: boolean;
}

interface AllocationStatus {
  strategy: string;
  allocated: number;
  used: number;
  available: number;
  utilization_pct: number;
  current_drawdown_pct: number;
  enabled: boolean;
}

// ============================================================================
// ALLOCATION LOGIC
// ============================================================================

function calculateAvailableCapital(alloc: StrategyAllocation): number {
  return Math.max(0, alloc.allocated_capital - alloc.used_capital);
}

function calculateUtilization(alloc: StrategyAllocation): number {
  if (alloc.allocated_capital === 0) return 0;
  return (alloc.used_capital / alloc.allocated_capital) * 100;
}

function calculateCurrentDrawdown(alloc: StrategyAllocation): number {
  if (alloc.peak_capital === 0) return 0;
  return ((alloc.peak_capital - alloc.allocated_capital) / alloc.peak_capital) * 100;
}

function canUseCapital(
  alloc: StrategyAllocation,
  amount: number
): { allowed: boolean; reason: string } {
  if (!alloc.enabled) {
    return { allowed: false, reason: `Strategy ${alloc.strategy} is disabled` };
  }

  const currentDrawdown = calculateCurrentDrawdown(alloc);
  if (currentDrawdown >= alloc.max_drawdown_pct) {
    return {
      allowed: false,
      reason: `Strategy ${alloc.strategy} exceeded max drawdown (${currentDrawdown.toFixed(2)}%)`,
    };
  }

  const available = calculateAvailableCapital(alloc);
  if (amount > available) {
    return {
      allowed: false,
      reason: `Insufficient capital for ${alloc.strategy}. Need ₹${amount.toFixed(2)}, available ₹${available.toFixed(2)}`,
    };
  }

  return { allowed: true, reason: "OK" };
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
    const { action, account_id } = body;

    console.log(`[Capital Allocation] Action: ${action}, Account: ${account_id}`);

    switch (action) {
      case "initialize": {
        // Initialize allocations for a paper account
        const { total_capital, allocations } = body;

        if (!account_id || !total_capital || !allocations) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: account_id, total_capital, allocations" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Validate allocations sum to <= 100%
        const totalPct = Object.values(allocations as Record<string, number>).reduce((a, b) => a + b, 0);
        if (totalPct > 100) {
          return new Response(
            JSON.stringify({ error: `Total allocation ${totalPct}% exceeds 100%` }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Create allocations
        const insertData = Object.entries(allocations as Record<Strategy, number>).map(
          ([strategy, pct]) => ({
            user_id: userId,
            account_id,
            strategy,
            allocated_pct: pct,
            allocated_capital: (total_capital * pct) / 100,
            used_capital: 0,
            peak_capital: (total_capital * pct) / 100,
            max_drawdown_pct: 10.0,
            enabled: true,
          })
        );

        const { data: created, error } = await supabase
          .from("strategy_capital_allocations")
          .upsert(insertData, { onConflict: "account_id,strategy" })
          .select();

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({ success: true, allocations: created }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_status": {
        if (!account_id) {
          return new Response(
            JSON.stringify({ error: "Missing account_id" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { data: allocations, error } = await supabase
          .from("strategy_capital_allocations")
          .select("*")
          .eq("account_id", account_id)
          .eq("user_id", userId);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        const status: AllocationStatus[] = (allocations || []).map((alloc) => ({
          strategy: alloc.strategy,
          allocated: Number(alloc.allocated_capital),
          used: Number(alloc.used_capital),
          available: Math.max(0, Number(alloc.allocated_capital) - Number(alloc.used_capital)),
          utilization_pct:
            Number(alloc.allocated_capital) > 0
              ? (Number(alloc.used_capital) / Number(alloc.allocated_capital)) * 100
              : 0,
          current_drawdown_pct:
            Number(alloc.peak_capital) > 0
              ? ((Number(alloc.peak_capital) - Number(alloc.allocated_capital)) /
                  Number(alloc.peak_capital)) *
                100
              : 0,
          enabled: alloc.enabled,
        }));

        const totalAllocated = status.reduce((sum, s) => sum + s.allocated, 0);
        const totalUsed = status.reduce((sum, s) => sum + s.used, 0);

        return new Response(
          JSON.stringify({
            success: true,
            account_id,
            total_allocated: totalAllocated,
            total_used: totalUsed,
            total_available: totalAllocated - totalUsed,
            overall_utilization_pct: totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0,
            strategies: status,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "can_use": {
        const { strategy, amount } = body;

        if (!account_id || !strategy || amount === undefined) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: account_id, strategy, amount" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { data: alloc, error } = await supabase
          .from("strategy_capital_allocations")
          .select("*")
          .eq("account_id", account_id)
          .eq("strategy", strategy)
          .eq("user_id", userId)
          .single();

        if (error || !alloc) {
          return new Response(
            JSON.stringify({ allowed: false, reason: `No allocation found for ${strategy}` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const strategyAlloc: StrategyAllocation = {
          strategy: alloc.strategy,
          allocated_pct: Number(alloc.allocated_pct),
          allocated_capital: Number(alloc.allocated_capital),
          used_capital: Number(alloc.used_capital),
          peak_capital: Number(alloc.peak_capital),
          max_drawdown_pct: Number(alloc.max_drawdown_pct),
          enabled: alloc.enabled,
        };

        const result = canUseCapital(strategyAlloc, amount);

        return new Response(
          JSON.stringify({
            ...result,
            available: calculateAvailableCapital(strategyAlloc),
            utilization_pct: calculateUtilization(strategyAlloc),
            current_drawdown_pct: calculateCurrentDrawdown(strategyAlloc),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "allocate": {
        const { strategy, amount } = body;

        if (!account_id || !strategy || amount === undefined) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: account_id, strategy, amount" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Get current allocation
        const { data: alloc, error: fetchError } = await supabase
          .from("strategy_capital_allocations")
          .select("*")
          .eq("account_id", account_id)
          .eq("strategy", strategy)
          .eq("user_id", userId)
          .single();

        if (fetchError || !alloc) {
          return new Response(
            JSON.stringify({ success: false, error: `No allocation found for ${strategy}` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const strategyAlloc: StrategyAllocation = {
          strategy: alloc.strategy,
          allocated_pct: Number(alloc.allocated_pct),
          allocated_capital: Number(alloc.allocated_capital),
          used_capital: Number(alloc.used_capital),
          peak_capital: Number(alloc.peak_capital),
          max_drawdown_pct: Number(alloc.max_drawdown_pct),
          enabled: alloc.enabled,
        };

        // Check if can use
        const check = canUseCapital(strategyAlloc, amount);
        if (!check.allowed) {
          return new Response(
            JSON.stringify({ success: false, error: check.reason }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update used capital
        const { error: updateError } = await supabase
          .from("strategy_capital_allocations")
          .update({
            used_capital: Number(alloc.used_capital) + amount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", alloc.id);

        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[Capital Allocation] Allocated ₹${amount} to ${strategy}`);

        return new Response(
          JSON.stringify({
            success: true,
            allocated_amount: amount,
            new_used_capital: Number(alloc.used_capital) + amount,
            new_available: calculateAvailableCapital(strategyAlloc) - amount,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "release": {
        const { strategy, amount, pnl = 0 } = body;

        if (!account_id || !strategy || amount === undefined) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: account_id, strategy, amount" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { data: alloc, error: fetchError } = await supabase
          .from("strategy_capital_allocations")
          .select("*")
          .eq("account_id", account_id)
          .eq("strategy", strategy)
          .eq("user_id", userId)
          .single();

        if (fetchError || !alloc) {
          return new Response(
            JSON.stringify({ success: false, error: `No allocation found for ${strategy}` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const newUsedCapital = Math.max(0, Number(alloc.used_capital) - amount);
        const newAllocatedCapital = Number(alloc.allocated_capital) + pnl;
        const newPeakCapital = Math.max(Number(alloc.peak_capital), newAllocatedCapital);

        const { error: updateError } = await supabase
          .from("strategy_capital_allocations")
          .update({
            used_capital: newUsedCapital,
            allocated_capital: newAllocatedCapital,
            peak_capital: newPeakCapital,
            updated_at: new Date().toISOString(),
          })
          .eq("id", alloc.id);

        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[Capital Allocation] Released ₹${amount} from ${strategy}, PnL: ₹${pnl}`);

        return new Response(
          JSON.stringify({
            success: true,
            released_amount: amount,
            pnl_applied: pnl,
            new_used_capital: newUsedCapital,
            new_allocated_capital: newAllocatedCapital,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "disable_strategy": {
        const { strategy, reason } = body;

        if (!account_id || !strategy) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: account_id, strategy" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { error: updateError } = await supabase
          .from("strategy_capital_allocations")
          .update({
            enabled: false,
            updated_at: new Date().toISOString(),
          })
          .eq("account_id", account_id)
          .eq("strategy", strategy)
          .eq("user_id", userId);

        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[Capital Allocation] STRATEGY DISABLED: ${strategy} - ${reason}`);

        return new Response(
          JSON.stringify({ success: true, strategy, disabled: true, reason }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "rebalance": {
        const { new_total_capital } = body;

        if (!account_id || !new_total_capital) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: account_id, new_total_capital" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { data: allocations, error: fetchError } = await supabase
          .from("strategy_capital_allocations")
          .select("*")
          .eq("account_id", account_id)
          .eq("user_id", userId);

        if (fetchError || !allocations) {
          return new Response(
            JSON.stringify({ success: false, error: "Failed to fetch allocations" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Rebalance maintaining proportions
        const updates = allocations.map((alloc) => ({
          id: alloc.id,
          allocated_capital: (new_total_capital * Number(alloc.allocated_pct)) / 100,
          updated_at: new Date().toISOString(),
        }));

        for (const update of updates) {
          await supabase
            .from("strategy_capital_allocations")
            .update({
              allocated_capital: update.allocated_capital,
              updated_at: update.updated_at,
            })
            .eq("id", update.id);
        }

        console.log(`[Capital Allocation] Rebalanced to new total: ₹${new_total_capital}`);

        return new Response(
          JSON.stringify({ success: true, new_total_capital, rebalanced_count: updates.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({
            error: "Unknown action",
            available_actions: [
              "initialize",
              "get_status",
              "can_use",
              "allocate",
              "release",
              "disable_strategy",
              "rebalance",
            ],
          }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error("Capital allocation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
