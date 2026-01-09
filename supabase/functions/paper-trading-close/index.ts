import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { position_id, exit_price, reason = "manual" } = body;

    if (!position_id || !exit_price) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: position_id, exit_price" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get position
    const { data: position, error: positionError } = await supabaseClient
      .from("paper_positions")
      .select("*")
      .eq("id", position_id)
      .eq("user_id", user.id)
      .single();

    if (!position) {
      return new Response(
        JSON.stringify({ error: "Position not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (position.status !== "open") {
      return new Response(
        JSON.stringify({ error: "Position is not open" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate P&L
    let pnl: number;
    if (position.side === "buy") {
      pnl = (exit_price - position.entry_price) * position.quantity;
    } else {
      pnl = (position.entry_price - exit_price) * position.quantity;
    }
    const pnlPct = (pnl / (position.entry_price * position.quantity)) * 100;

    // Get account
    const { data: account } = await supabaseClient
      .from("paper_accounts")
      .select("*")
      .eq("id", position.account_id)
      .single();

    if (!account) {
      return new Response(
        JSON.stringify({ error: "Account not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate new balance (return trade value + P&L)
    const tradeValue = position.entry_price * position.quantity;
    const newBalance = account.current_balance + tradeValue + pnl;

    // Create closed trade record
    const { error: tradeError } = await supabaseClient
      .from("paper_trades")
      .insert({
        account_id: position.account_id,
        strategy_id: position.strategy_id,
        symbol: position.symbol,
        side: position.side,
        quantity: position.quantity,
        entry_price: position.entry_price,
        exit_price,
        pnl,
        pnl_pct: pnlPct,
        market: position.market,
        reason,
        status: "closed",
        opened_at: position.opened_at,
        closed_at: new Date().toISOString(),
      });

    if (tradeError) {
      return new Response(
        JSON.stringify({ error: "Failed to record closed trade", details: tradeError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete position
    await supabaseClient
      .from("paper_positions")
      .delete()
      .eq("id", position_id);

    // Update account balance
    await supabaseClient
      .from("paper_accounts")
      .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", account.id);

    // Generate educational message based on outcome
    let educationalMessage = "";
    if (reason === "stop_loss") {
      educationalMessage = pnl < 0 
        ? `Your stop loss protected you from a larger loss. The position was closed at ₹${exit_price}, limiting your loss to ₹${Math.abs(pnl).toFixed(2)}.`
        : `Stop loss triggered with a small profit of ₹${pnl.toFixed(2)}. This can happen when price gaps.`;
    } else if (reason === "take_profit") {
      educationalMessage = `Target reached! You secured a profit of ₹${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%). Discipline in taking profits is key to consistent trading.`;
    } else {
      educationalMessage = pnl >= 0
        ? `Position closed manually with a profit of ₹${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%).`
        : `Position closed manually with a loss of ₹${Math.abs(pnl).toFixed(2)} (${Math.abs(pnlPct).toFixed(2)}%). Review your trade to understand what happened.`;
    }

    // Log the close
    await supabaseClient
      .from("paper_trade_logs")
      .insert({
        user_id: user.id,
        trade_id: position_id,
        event_type: reason === "stop_loss" ? "sl_hit" : reason === "take_profit" ? "tp_hit" : "manual_close",
        message: educationalMessage,
        metadata: {
          symbol: position.symbol,
          side: position.side,
          quantity: position.quantity,
          entry_price: position.entry_price,
          exit_price,
          pnl,
          pnl_pct: pnlPct,
          reason,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        pnl: Number(pnl.toFixed(2)),
        pnl_pct: Number(pnlPct.toFixed(2)),
        new_balance: Number(newBalance.toFixed(2)),
        message: educationalMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
