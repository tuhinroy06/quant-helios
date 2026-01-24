/**
 * FEATURE 15: EMERGENCY FLATTEN / OPS-LEVEL SAFETY
 * 
 * Production-grade emergency intervention system:
 * - Instant position flattening
 * - Kill switch activation
 * - Health heartbeat monitoring
 * - System health logging
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// TYPES
// ============================================================================

type EmergencyEventType = "EMERGENCY_FLATTEN" | "KILL_SWITCH" | "MANUAL_HALT" | "SYSTEM_ERROR";

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  side: string;
  entry_price: number;
  current_price?: number;
}

interface FlattenResult {
  position_id: string;
  symbol: string;
  quantity: number;
  side: string;
  entry_price: number;
  exit_price: number;
  pnl: number;
  status: "closed" | "failed";
  error?: string;
}

interface SystemHealth {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  disk_free_gb: number;
  is_healthy: boolean;
  warnings: string[];
  errors: string[];
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

    console.log(`[Emergency Flatten] Action: ${action}, User: ${userId}`);

    switch (action) {
      // ====================================================================
      // EMERGENCY FLATTEN ALL POSITIONS
      // ====================================================================
      case "flatten_all": {
        const { account_id, reason, force = false } = body;

        if (!account_id || !reason) {
          return new Response(
            JSON.stringify({ error: "account_id and reason are required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        console.log(`🚨 [EMERGENCY] Flatten initiated for ${account_id}: ${reason}`);

        // Get all open positions
        const { data: positions, error: posError } = await supabase
          .from("paper_positions")
          .select("*")
          .eq("account_id", account_id)
          .eq("status", "open");

        if (posError) {
          return new Response(
            JSON.stringify({ error: posError.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        if (!positions || positions.length === 0) {
          // Log the event even with no positions
          await supabase.from("emergency_events").insert({
            user_id: userId,
            account_id,
            event_type: "EMERGENCY_FLATTEN" as EmergencyEventType,
            reason,
            positions_closed: 0,
            total_pnl: 0,
            metadata: { message: "No open positions to flatten" },
          });

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "No open positions to flatten",
              positions_closed: 0,
              total_pnl: 0,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Flatten each position
        const results: FlattenResult[] = [];
        let totalPnl = 0;

        for (const position of positions) {
          try {
            // Use entry price as exit price (simulated market close)
            // In production, would fetch live price from broker
            const exitPrice = position.entry_price * (1 + (Math.random() - 0.5) * 0.02);
            
            const pnl = position.side === "buy"
              ? (exitPrice - position.entry_price) * position.quantity
              : (position.entry_price - exitPrice) * position.quantity;

            // Insert closed trade
            await supabase.from("paper_trades").insert({
              account_id,
              symbol: position.symbol,
              side: position.side,
              quantity: position.quantity,
              entry_price: position.entry_price,
              exit_price: exitPrice,
              pnl,
              status: "closed",
              stop_loss: position.stop_loss,
              take_profit: position.take_profit,
              reason: `EMERGENCY_FLATTEN: ${reason}`,
              closed_at: new Date().toISOString(),
            });

            // Delete position
            await supabase
              .from("paper_positions")
              .delete()
              .eq("id", position.id);

            results.push({
              position_id: position.id,
              symbol: position.symbol,
              quantity: position.quantity,
              side: position.side,
              entry_price: position.entry_price,
              exit_price: exitPrice,
              pnl,
              status: "closed",
            });

            totalPnl += pnl;
          } catch (err) {
            results.push({
              position_id: position.id,
              symbol: position.symbol,
              quantity: position.quantity,
              side: position.side,
              entry_price: position.entry_price,
              exit_price: 0,
              pnl: 0,
              status: "failed",
              error: err instanceof Error ? err.message : "Unknown error",
            });
          }
        }

        // Update account balance
        const { data: account } = await supabase
          .from("paper_accounts")
          .select("current_balance")
          .eq("id", account_id)
          .single();

        if (account) {
          const positionValue = positions.reduce((sum, p) => {
            if (p.side === "buy") {
              return sum + p.entry_price * p.quantity;
            }
            return sum;
          }, 0);

          await supabase
            .from("paper_accounts")
            .update({ 
              current_balance: Number(account.current_balance) + positionValue + totalPnl,
            })
            .eq("id", account_id);
        }

        // Log emergency event
        await supabase.from("emergency_events").insert({
          user_id: userId,
          account_id,
          event_type: "EMERGENCY_FLATTEN" as EmergencyEventType,
          reason,
          positions_closed: results.filter((r) => r.status === "closed").length,
          total_pnl: totalPnl,
          metadata: { 
            results, 
            force,
            initiated_at: new Date().toISOString(),
          },
        });

        console.log(`🚨 [EMERGENCY] Flatten complete: ${results.length} positions, PnL: ${totalPnl.toFixed(2)}`);

        return new Response(
          JSON.stringify({
            success: true,
            positions_closed: results.filter((r) => r.status === "closed").length,
            positions_failed: results.filter((r) => r.status === "failed").length,
            total_pnl: totalPnl,
            results,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // ACTIVATE KILL SWITCH
      // ====================================================================
      case "activate_kill_switch": {
        const { account_id, reason, scope = "account" } = body;

        if (!reason) {
          return new Response(
            JSON.stringify({ error: "reason is required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        console.log(`🔴 [KILL SWITCH] Activated for ${scope}: ${reason}`);

        // Log kill switch event
        await supabase.from("emergency_events").insert({
          user_id: userId,
          account_id: account_id || null,
          event_type: "KILL_SWITCH" as EmergencyEventType,
          reason,
          metadata: { 
            scope,
            activated_at: new Date().toISOString(),
          },
        });

        // If account-level, disable the account
        if (account_id) {
          await supabase
            .from("trading_accounts")
            .update({ enabled: false })
            .eq("id", account_id)
            .eq("user_id", userId);

          // Also disable in paper_accounts if it exists
          await supabase
            .from("paper_accounts")
            .update({ is_active: false, status: "KILLED" })
            .eq("id", account_id)
            .eq("user_id", userId);
        }

        // If global scope, disable all accounts
        if (scope === "global") {
          await supabase
            .from("trading_accounts")
            .update({ enabled: false })
            .eq("user_id", userId);

          await supabase
            .from("paper_accounts")
            .update({ is_active: false, status: "KILLED" })
            .eq("user_id", userId);
        }

        // Update control plane state
        await supabase.from("control_states").upsert({
          scope: scope === "global" ? "GLOBAL" : "USER",
          target_id: scope === "global" ? "GLOBAL" : userId,
          state: "KILLED",
          last_transition_at: new Date().toISOString(),
        }, { onConflict: "scope,target_id" });

        return new Response(
          JSON.stringify({
            success: true,
            message: `Kill switch activated for ${scope}`,
            scope,
            reason,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // HEALTH HEARTBEAT
      // ====================================================================
      case "heartbeat": {
        const { account_id, uptime_seconds, system_health, accounts_status } = body;

        if (!account_id) {
          return new Response(
            JSON.stringify({ error: "account_id is required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Insert heartbeat
        const { error } = await supabase.from("health_heartbeats").insert({
          account_id,
          status: "healthy",
          uptime_seconds: uptime_seconds || 0,
          system_health: system_health || {},
          accounts_status: accounts_status || {},
        });

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Check for missed heartbeats (stale threshold: 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        
        const { data: lastHeartbeat } = await supabase
          .from("health_heartbeats")
          .select("created_at")
          .eq("account_id", account_id)
          .order("created_at", { ascending: false })
          .limit(2);

        let heartbeat_gap = 0;
        if (lastHeartbeat && lastHeartbeat.length > 1) {
          const current = new Date(lastHeartbeat[0].created_at).getTime();
          const previous = new Date(lastHeartbeat[1].created_at).getTime();
          heartbeat_gap = (current - previous) / 1000;
        }

        return new Response(
          JSON.stringify({
            success: true,
            received_at: new Date().toISOString(),
            heartbeat_gap_seconds: heartbeat_gap,
            status: heartbeat_gap > 300 ? "warning" : "healthy",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // LOG SYSTEM HEALTH
      // ====================================================================
      case "log_system_health": {
        const { account_id, health } = body;

        if (!account_id || !health) {
          return new Response(
            JSON.stringify({ error: "account_id and health are required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const systemHealth: SystemHealth = {
          cpu_percent: health.cpu_percent ?? 0,
          memory_percent: health.memory_percent ?? 0,
          disk_percent: health.disk_percent ?? 0,
          disk_free_gb: health.disk_free_gb ?? 0,
          is_healthy: health.is_healthy ?? true,
          warnings: health.warnings ?? [],
          errors: health.errors ?? [],
        };

        // Determine overall health
        const isHealthy = 
          systemHealth.cpu_percent < 90 &&
          systemHealth.memory_percent < 90 &&
          systemHealth.disk_percent < 90 &&
          systemHealth.errors.length === 0;

        const { error } = await supabase.from("system_health_logs").insert({
          account_id,
          cpu_percent: systemHealth.cpu_percent,
          memory_percent: systemHealth.memory_percent,
          disk_percent: systemHealth.disk_percent,
          disk_free_gb: systemHealth.disk_free_gb,
          is_healthy: isHealthy,
          warnings: systemHealth.warnings,
          errors: systemHealth.errors,
        });

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        // If unhealthy, log as system error
        if (!isHealthy) {
          await supabase.from("emergency_events").insert({
            user_id: userId,
            account_id,
            event_type: "SYSTEM_ERROR" as EmergencyEventType,
            reason: `System health degraded: CPU ${systemHealth.cpu_percent}%, Memory ${systemHealth.memory_percent}%`,
            metadata: systemHealth,
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            is_healthy: isHealthy,
            health: systemHealth,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // GET EMERGENCY EVENTS
      // ====================================================================
      case "get_events": {
        const { account_id, event_type, limit = 50 } = body;

        let query = supabase
          .from("emergency_events")
          .select("*")
          .eq("user_id", userId)
          .order("activated_at", { ascending: false })
          .limit(limit);

        if (account_id) {
          query = query.eq("account_id", account_id);
        }

        if (event_type) {
          query = query.eq("event_type", event_type);
        }

        const { data: events, error } = await query;

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            events,
            total: events?.length || 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // GET HEALTH STATUS
      // ====================================================================
      case "get_health_status": {
        const { account_id } = body;

        if (!account_id) {
          return new Response(
            JSON.stringify({ error: "account_id is required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Get latest health log
        const { data: healthLog } = await supabase
          .from("system_health_logs")
          .select("*")
          .eq("account_id", account_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get latest heartbeat
        const { data: heartbeat } = await supabase
          .from("health_heartbeats")
          .select("*")
          .eq("account_id", account_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Check heartbeat freshness
        const heartbeatAge = heartbeat
          ? (Date.now() - new Date(heartbeat.created_at).getTime()) / 1000
          : Infinity;

        const heartbeatStale = heartbeatAge > 300; // 5 minutes

        return new Response(
          JSON.stringify({
            success: true,
            system_health: healthLog || null,
            heartbeat: heartbeat || null,
            heartbeat_age_seconds: heartbeatAge === Infinity ? null : Math.round(heartbeatAge),
            heartbeat_stale: heartbeatStale,
            overall_status: healthLog?.is_healthy && !heartbeatStale ? "healthy" : "degraded",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({
            error: "Unknown action",
            available_actions: [
              "flatten_all",
              "activate_kill_switch",
              "heartbeat",
              "log_system_health",
              "get_events",
              "get_health_status",
            ],
          }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error("Emergency flatten error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
