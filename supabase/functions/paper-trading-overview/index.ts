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

    // Get or create paper account
    let { data: account, error: accountError } = await supabaseClient
      .from("paper_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!account) {
      const { data: newAccount, error: createError } = await supabaseClient
        .from("paper_accounts")
        .insert({
          user_id: user.id,
          initial_balance: 1000000,
          current_balance: 1000000,
          currency: "INR",
          name: "Paper Trading Account",
          status: "active",
        })
        .select()
        .single();

      if (createError) {
        return new Response(
          JSON.stringify({ error: "Failed to create paper account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      account = newAccount;
    }

    // Get open positions count
    const { count: openPositionsCount } = await supabaseClient
      .from("paper_positions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "open");

    // Get total P&L from closed trades
    const { data: closedTrades } = await supabaseClient
      .from("paper_trades")
      .select("pnl")
      .eq("account_id", account.id)
      .eq("status", "closed");

    const totalPnl = closedTrades?.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0) || 0;
    const totalPnlPct = account.initial_balance > 0 
      ? (totalPnl / account.initial_balance) * 100 
      : 0;

    // Get completed trades count for unlock requirements
    const { count: completedTradesCount } = await supabaseClient
      .from("paper_trades")
      .select("*", { count: "exact", head: true })
      .eq("account_id", account.id)
      .eq("status", "closed");

    return new Response(
      JSON.stringify({
        account_id: account.id,
        virtual_balance: Number(account.current_balance),
        initial_balance: Number(account.initial_balance),
        total_pnl: totalPnl,
        total_pnl_pct: Number(totalPnlPct.toFixed(2)),
        open_positions_count: openPositionsCount || 0,
        completed_trades_count: completedTradesCount || 0,
        paper_trading_status: account.status || "active",
        currency: account.currency,
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
