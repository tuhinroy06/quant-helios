/**
 * FEATURE 14: MULTI-ACCOUNT ISOLATION
 * 
 * Manages complete account isolation for:
 * - Paper vs Live trading
 * - Strategy-level account separation
 * - Cross-account capital protection
 * - Broker session management
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// TYPES
// ============================================================================

type AccountType = "PAPER" | "LIVE";
type IsolationMode = "THREAD" | "PROCESS";

interface TradingAccount {
  id: string;
  user_id: string;
  account_name: string;
  account_type: AccountType;
  initial_cash: number;
  current_cash: number;
  broker_session_id: string | null;
  isolation_mode: IsolationMode;
  enabled: boolean;
}

interface AccountIsolationCheck {
  can_trade: boolean;
  reason: string;
  account: TradingAccount | null;
  cross_contamination_risk: boolean;
}

// ============================================================================
// ISOLATION LOGIC
// ============================================================================

function checkIsolationViolation(
  sourceAccount: TradingAccount,
  targetAccount: TradingAccount
): { violated: boolean; reason: string } {
  // Rule 1: Never mix PAPER and LIVE
  if (sourceAccount.account_type !== targetAccount.account_type) {
    return {
      violated: true,
      reason: `Cannot transfer between ${sourceAccount.account_type} and ${targetAccount.account_type} accounts`,
    };
  }

  // Rule 2: Process isolation means completely separate
  if (
    sourceAccount.isolation_mode === "PROCESS" ||
    targetAccount.isolation_mode === "PROCESS"
  ) {
    return {
      violated: true,
      reason: "PROCESS isolation mode prohibits cross-account operations",
    };
  }

  // Rule 3: Different broker sessions in LIVE mode
  if (
    sourceAccount.account_type === "LIVE" &&
    sourceAccount.broker_session_id !== targetAccount.broker_session_id
  ) {
    return {
      violated: true,
      reason: "Cannot operate across different broker sessions in LIVE mode",
    };
  }

  return { violated: false, reason: "Isolation check passed" };
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

    console.log(`[Multi-Account] Action: ${action}, User: ${userId}`);

    switch (action) {
      // ====================================================================
      // CREATE TRADING ACCOUNT
      // ====================================================================
      case "create_account": {
        const {
          account_name,
          account_type = "PAPER",
          initial_cash = 500000,
          isolation_mode = "THREAD",
        } = body;

        if (!account_name) {
          return new Response(
            JSON.stringify({ error: "account_name is required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Validate account type
        if (!["PAPER", "LIVE"].includes(account_type)) {
          return new Response(
            JSON.stringify({ error: "account_type must be PAPER or LIVE" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Check max accounts limit (5 per user)
        const { data: existingAccounts, error: countError } = await supabase
          .from("trading_accounts")
          .select("id")
          .eq("user_id", userId);

        if (countError) {
          return new Response(
            JSON.stringify({ error: countError.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        if ((existingAccounts?.length || 0) >= 5) {
          return new Response(
            JSON.stringify({ error: "Maximum 5 trading accounts allowed per user" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { data: account, error } = await supabase
          .from("trading_accounts")
          .insert({
            user_id: userId,
            account_name,
            account_type,
            initial_cash,
            current_cash: initial_cash,
            isolation_mode,
            enabled: true,
          })
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        console.log(`[Multi-Account] Created ${account_type} account: ${account.id}`);

        return new Response(
          JSON.stringify({ success: true, account }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // LIST USER ACCOUNTS
      // ====================================================================
      case "list_accounts": {
        const { account_type, enabled_only = false } = body;

        let query = supabase
          .from("trading_accounts")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (account_type) {
          query = query.eq("account_type", account_type);
        }

        if (enabled_only) {
          query = query.eq("enabled", true);
        }

        const { data: accounts, error } = await query;

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Calculate account summaries
        const summaries = accounts?.map((acc) => ({
          ...acc,
          pnl: Number(acc.current_cash) - Number(acc.initial_cash),
          pnl_pct: ((Number(acc.current_cash) - Number(acc.initial_cash)) / Number(acc.initial_cash)) * 100,
        }));

        return new Response(
          JSON.stringify({ 
            success: true, 
            accounts: summaries,
            total_paper: accounts?.filter((a) => a.account_type === "PAPER").length || 0,
            total_live: accounts?.filter((a) => a.account_type === "LIVE").length || 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // CHECK ISOLATION
      // ====================================================================
      case "check_isolation": {
        const { account_id, target_account_id } = body;

        if (!account_id) {
          return new Response(
            JSON.stringify({ error: "account_id is required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Get source account
        const { data: sourceAccount, error: sourceError } = await supabase
          .from("trading_accounts")
          .select("*")
          .eq("id", account_id)
          .eq("user_id", userId)
          .single();

        if (sourceError || !sourceAccount) {
          return new Response(
            JSON.stringify({ 
              can_trade: false, 
              reason: "Source account not found or not owned by user",
              cross_contamination_risk: false,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if account is enabled
        if (!sourceAccount.enabled) {
          return new Response(
            JSON.stringify({
              can_trade: false,
              reason: "Account is disabled",
              account: sourceAccount,
              cross_contamination_risk: false,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // If target account provided, check cross-account isolation
        if (target_account_id) {
          const { data: targetAccount, error: targetError } = await supabase
            .from("trading_accounts")
            .select("*")
            .eq("id", target_account_id)
            .eq("user_id", userId)
            .single();

          if (targetError || !targetAccount) {
            return new Response(
              JSON.stringify({
                can_trade: false,
                reason: "Target account not found or not owned by user",
                cross_contamination_risk: true,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          const isolationCheck = checkIsolationViolation(sourceAccount, targetAccount);

          return new Response(
            JSON.stringify({
              can_trade: !isolationCheck.violated,
              reason: isolationCheck.reason,
              source_account: sourceAccount,
              target_account: targetAccount,
              cross_contamination_risk: isolationCheck.violated,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            can_trade: true,
            reason: "Account isolation check passed",
            account: sourceAccount,
            cross_contamination_risk: false,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // UPDATE ACCOUNT CASH
      // ====================================================================
      case "update_cash": {
        const { account_id, cash_delta, reason } = body;

        if (!account_id || cash_delta === undefined) {
          return new Response(
            JSON.stringify({ error: "account_id and cash_delta are required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Get current account
        const { data: account, error: fetchError } = await supabase
          .from("trading_accounts")
          .select("*")
          .eq("id", account_id)
          .eq("user_id", userId)
          .single();

        if (fetchError || !account) {
          return new Response(
            JSON.stringify({ error: "Account not found" }),
            { status: 404, headers: corsHeaders }
          );
        }

        const newCash = Number(account.current_cash) + cash_delta;

        // Prevent negative cash
        if (newCash < 0) {
          return new Response(
            JSON.stringify({ 
              error: "Insufficient funds",
              current_cash: Number(account.current_cash),
              requested_delta: cash_delta,
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { data: updated, error: updateError } = await supabase
          .from("trading_accounts")
          .update({ 
            current_cash: newCash,
            updated_at: new Date().toISOString(),
          })
          .eq("id", account_id)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        console.log(`[Multi-Account] Cash updated: ${account_id} ${cash_delta > 0 ? '+' : ''}${cash_delta}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            previous_cash: Number(account.current_cash),
            new_cash: newCash,
            delta: cash_delta,
            reason: reason || "Manual adjustment",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // SET BROKER SESSION
      // ====================================================================
      case "set_broker_session": {
        const { account_id, broker_session_id } = body;

        if (!account_id) {
          return new Response(
            JSON.stringify({ error: "account_id is required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Verify account is LIVE type for broker sessions
        const { data: account, error: fetchError } = await supabase
          .from("trading_accounts")
          .select("*")
          .eq("id", account_id)
          .eq("user_id", userId)
          .single();

        if (fetchError || !account) {
          return new Response(
            JSON.stringify({ error: "Account not found" }),
            { status: 404, headers: corsHeaders }
          );
        }

        if (account.account_type !== "LIVE") {
          return new Response(
            JSON.stringify({ error: "Broker sessions only apply to LIVE accounts" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { error: updateError } = await supabase
          .from("trading_accounts")
          .update({ 
            broker_session_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", account_id);

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        console.log(`[Multi-Account] Broker session set for ${account_id}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: broker_session_id ? "Broker session linked" : "Broker session cleared",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // TOGGLE ACCOUNT
      // ====================================================================
      case "toggle_account": {
        const { account_id, enabled } = body;

        if (!account_id || enabled === undefined) {
          return new Response(
            JSON.stringify({ error: "account_id and enabled are required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { error } = await supabase
          .from("trading_accounts")
          .update({ 
            enabled,
            updated_at: new Date().toISOString(),
          })
          .eq("id", account_id)
          .eq("user_id", userId);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        console.log(`[Multi-Account] Account ${account_id} ${enabled ? 'enabled' : 'disabled'}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Account ${enabled ? 'enabled' : 'disabled'}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({
            error: "Unknown action",
            available_actions: [
              "create_account",
              "list_accounts",
              "check_isolation",
              "update_cash",
              "set_broker_session",
              "toggle_account",
            ],
          }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error("Multi-account error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
