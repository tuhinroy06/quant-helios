import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_RISK_PERCENT = 2; // Maximum 2% risk per trade

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
    const { symbol, market = "equity", side, quantity, entry_price, stop_loss, take_profit, strategy_id } = body;

    // Validation 1: Required fields
    if (!symbol || !side || !quantity || !entry_price) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: symbol, side, quantity, entry_price" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validation 2: Stop loss is MANDATORY
    if (!stop_loss) {
      return new Response(
        JSON.stringify({ 
          error: "Stop loss is mandatory", 
          message: "Every trade must have a stop loss to protect your capital. This is a non-negotiable risk management rule."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validation 3: Stop loss direction
    if (side === "buy" && stop_loss >= entry_price) {
      return new Response(
        JSON.stringify({ error: "For buy orders, stop loss must be below entry price" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (side === "sell" && stop_loss <= entry_price) {
      return new Response(
        JSON.stringify({ error: "For sell orders, stop loss must be above entry price" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validation 4: Take profit direction (if provided)
    if (take_profit) {
      if (side === "buy" && take_profit <= entry_price) {
        return new Response(
          JSON.stringify({ error: "For buy orders, take profit must be above entry price" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (side === "sell" && take_profit >= entry_price) {
        return new Response(
          JSON.stringify({ error: "For sell orders, take profit must be below entry price" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get paper account
    const { data: account, error: accountError } = await supabaseClient
      .from("paper_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!account) {
      return new Response(
        JSON.stringify({ error: "Paper account not found. Please refresh the page." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validation 5: Account is active
    if (account.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Your paper trading account is suspended" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tradeValue = quantity * entry_price;
    const riskPerShare = Math.abs(entry_price - stop_loss);
    const totalRisk = riskPerShare * quantity;
    const riskPercent = (totalRisk / account.current_balance) * 100;

    // Validation 6: Sufficient balance
    if (tradeValue > account.current_balance) {
      return new Response(
        JSON.stringify({ 
          error: "Insufficient virtual balance",
          required: tradeValue,
          available: account.current_balance
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validation 7: Risk per trade limit
    if (riskPercent > MAX_RISK_PERCENT) {
      return new Response(
        JSON.stringify({ 
          error: `Risk per trade exceeds ${MAX_RISK_PERCENT}% limit`,
          message: `This trade risks ${riskPercent.toFixed(2)}% of your account. Reduce position size or widen stop loss placement.`,
          risk_percent: riskPercent,
          max_allowed: MAX_RISK_PERCENT
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create position
    const { data: position, error: positionError } = await supabaseClient
      .from("paper_positions")
      .insert({
        user_id: user.id,
        account_id: account.id,
        strategy_id: strategy_id || null,
        symbol,
        market,
        side,
        quantity,
        entry_price,
        stop_loss,
        take_profit: take_profit || null,
        unrealized_pnl: 0,
        status: "open",
      })
      .select()
      .single();

    if (positionError) {
      return new Response(
        JSON.stringify({ error: "Failed to create position", details: positionError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduct from balance
    const newBalance = account.current_balance - tradeValue;
    await supabaseClient
      .from("paper_accounts")
      .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", account.id);

    // Log the trade
    await supabaseClient
      .from("paper_trade_logs")
      .insert({
        user_id: user.id,
        trade_id: position.id,
        event_type: "opened",
        message: `Opened ${side.toUpperCase()} position: ${quantity} ${symbol} @ ₹${entry_price}. Stop loss set at ₹${stop_loss}.`,
        metadata: {
          symbol,
          side,
          quantity,
          entry_price,
          stop_loss,
          take_profit,
          risk_percent: riskPercent,
          trade_value: tradeValue,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        position_id: position.id,
        message: `Position opened: ${side.toUpperCase()} ${quantity} ${symbol} @ ₹${entry_price}`,
        new_balance: newBalance,
        risk_percent: Number(riskPercent.toFixed(2)),
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
