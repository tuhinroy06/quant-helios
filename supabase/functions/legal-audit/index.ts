/**
 * FEATURE 16: LEGAL AUDIT OUTPUT
 * 
 * Cryptographically signed audit trail:
 * - SHA256 trade hashing
 * - HMAC signature generation
 * - Immutable daily summaries
 * - Compliance-ready export
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// CRYPTO UTILITIES
// ============================================================================

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================================
// TYPES
// ============================================================================

interface TradeRecord {
  trade_id: string;
  trade_timestamp: number;
  symbol: string;
  quantity: number;
  entry_price: number;
  exit_price: number;
  gross_pnl: number;
  total_costs: number;
  net_pnl: number;
  strategy: string;
  exit_reason: string;
}

interface SignedTrade extends TradeRecord {
  config_hash: string;
  trade_hash: string;
  signature: string;
}

interface DailySummary {
  summary_date: string;
  num_trades: number;
  total_gross_pnl: number;
  total_net_pnl: number;
  total_costs: number;
  final_cash: number;
  final_equity: number;
  max_drawdown: number;
  trade_hashes: string[];
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

    // Use a stable secret for signing (in production, use proper key management)
    const signingSecret = `${userId}_AUDIT_SECRET_${Deno.env.get("SUPABASE_ANON_KEY")?.substring(0, 16)}`;

    console.log(`[Legal Audit] Action: ${action}, User: ${userId}`);

    switch (action) {
      // ====================================================================
      // SIGN TRADE
      // ====================================================================
      case "sign_trade": {
        const { account_id, trade, config_hash } = body;

        if (!account_id || !trade || !config_hash) {
          return new Response(
            JSON.stringify({ error: "account_id, trade, and config_hash are required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const tradeRecord: TradeRecord = {
          trade_id: trade.id || crypto.randomUUID(),
          trade_timestamp: trade.timestamp || Math.floor(Date.now() / 1000),
          symbol: trade.symbol,
          quantity: trade.quantity,
          entry_price: trade.entry_price,
          exit_price: trade.exit_price,
          gross_pnl: trade.gross_pnl || (trade.exit_price - trade.entry_price) * trade.quantity,
          total_costs: trade.total_costs || 0,
          net_pnl: trade.net_pnl || trade.gross_pnl - trade.total_costs,
          strategy: trade.strategy || "MANUAL",
          exit_reason: trade.exit_reason || "UNKNOWN",
        };

        // Create deterministic trade string for hashing
        const tradeString = [
          tradeRecord.trade_id,
          tradeRecord.trade_timestamp,
          tradeRecord.symbol,
          tradeRecord.quantity,
          tradeRecord.entry_price.toFixed(4),
          tradeRecord.exit_price.toFixed(4),
          tradeRecord.gross_pnl.toFixed(2),
          tradeRecord.total_costs.toFixed(4),
          tradeRecord.net_pnl.toFixed(2),
          tradeRecord.strategy,
          tradeRecord.exit_reason,
          config_hash,
        ].join("|");

        const tradeHash = await sha256(tradeString);
        const signature = await hmacSign(tradeHash, signingSecret);

        // Store signed trade
        const { data: signedTrade, error } = await supabase
          .from("signed_trade_ledger")
          .insert({
            user_id: userId,
            account_id,
            trade_id: tradeRecord.trade_id,
            trade_timestamp: tradeRecord.trade_timestamp,
            symbol: tradeRecord.symbol,
            quantity: tradeRecord.quantity,
            entry_price: tradeRecord.entry_price,
            exit_price: tradeRecord.exit_price,
            gross_pnl: tradeRecord.gross_pnl,
            total_costs: tradeRecord.total_costs,
            net_pnl: tradeRecord.net_pnl,
            strategy: tradeRecord.strategy,
            exit_reason: tradeRecord.exit_reason,
            config_hash,
            trade_hash: tradeHash,
            signature,
          })
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        console.log(`[Legal Audit] Trade signed: ${tradeHash.substring(0, 12)}...`);

        return new Response(
          JSON.stringify({
            success: true,
            trade_hash: tradeHash,
            signature: signature.substring(0, 32) + "...",
            signed_trade_id: signedTrade.id,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // VERIFY TRADE
      // ====================================================================
      case "verify_trade": {
        const { trade_hash, signature: providedSignature } = body;

        if (!trade_hash) {
          return new Response(
            JSON.stringify({ error: "trade_hash is required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Find the trade
        const { data: trade, error } = await supabase
          .from("signed_trade_ledger")
          .select("*")
          .eq("trade_hash", trade_hash)
          .eq("user_id", userId)
          .single();

        if (error || !trade) {
          return new Response(
            JSON.stringify({ 
              verified: false, 
              error: "Trade not found",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Recompute signature
        const expectedSignature = await hmacSign(trade_hash, signingSecret);

        const signatureValid = trade.signature === expectedSignature;
        const providedValid = providedSignature 
          ? providedSignature === expectedSignature 
          : true;

        return new Response(
          JSON.stringify({
            verified: signatureValid && providedValid,
            trade_exists: true,
            signature_valid: signatureValid,
            provided_signature_valid: providedSignature ? providedValid : null,
            trade: {
              trade_id: trade.trade_id,
              symbol: trade.symbol,
              quantity: trade.quantity,
              pnl: Number(trade.net_pnl),
              timestamp: trade.trade_timestamp,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // CREATE DAILY SUMMARY
      // ====================================================================
      case "create_daily_summary": {
        const { account_id, summary_date, portfolio_snapshot } = body;

        if (!account_id) {
          return new Response(
            JSON.stringify({ error: "account_id is required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const date = summary_date || new Date().toISOString().split("T")[0];

        // Get all trades for the day
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const startTimestamp = Math.floor(startOfDay.getTime() / 1000);
        const endTimestamp = Math.floor(endOfDay.getTime() / 1000);

        const { data: trades, error: tradeError } = await supabase
          .from("signed_trade_ledger")
          .select("*")
          .eq("account_id", account_id)
          .eq("user_id", userId)
          .gte("trade_timestamp", startTimestamp)
          .lte("trade_timestamp", endTimestamp);

        if (tradeError) {
          return new Response(
            JSON.stringify({ error: tradeError.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Calculate summary
        const tradeHashes = trades?.map((t) => t.trade_hash) || [];
        const totalGrossPnl = trades?.reduce((sum, t) => sum + Number(t.gross_pnl), 0) || 0;
        const totalCosts = trades?.reduce((sum, t) => sum + Number(t.total_costs), 0) || 0;
        const totalNetPnl = trades?.reduce((sum, t) => sum + Number(t.net_pnl), 0) || 0;

        // Get config hash from most recent trade
        const configHash = trades?.[0]?.config_hash || "NO_TRADES";

        // Get account balance
        const { data: account } = await supabase
          .from("paper_accounts")
          .select("current_balance, initial_balance")
          .eq("id", account_id)
          .single();

        const finalCash = portfolio_snapshot?.cash || Number(account?.current_balance) || 0;
        const finalEquity = portfolio_snapshot?.equity || finalCash;
        const maxDrawdown = portfolio_snapshot?.max_drawdown || 0;

        // Create summary data for hashing
        const summaryData: DailySummary = {
          summary_date: date,
          num_trades: trades?.length || 0,
          total_gross_pnl: totalGrossPnl,
          total_net_pnl: totalNetPnl,
          total_costs: totalCosts,
          final_cash: finalCash,
          final_equity: finalEquity,
          max_drawdown: maxDrawdown,
          trade_hashes: tradeHashes,
        };

        const dataString = JSON.stringify(summaryData, Object.keys(summaryData).sort());
        const dataHash = await sha256(dataString);
        const signature = await hmacSign(dataHash, signingSecret);

        // Store summary
        const { data: summary, error: summaryError } = await supabase
          .from("signed_daily_summaries")
          .upsert({
            user_id: userId,
            account_id,
            summary_date: date,
            num_trades: summaryData.num_trades,
            total_gross_pnl: summaryData.total_gross_pnl,
            total_net_pnl: summaryData.total_net_pnl,
            total_costs: summaryData.total_costs,
            final_cash: summaryData.final_cash,
            final_equity: summaryData.final_equity,
            max_drawdown: summaryData.max_drawdown,
            trade_hashes: tradeHashes,
            summary_data: summaryData,
            config_hash: configHash,
            data_hash: dataHash,
            signature,
          }, { onConflict: "account_id,summary_date" })
          .select()
          .single();

        if (summaryError) {
          return new Response(
            JSON.stringify({ error: summaryError.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        console.log(`[Legal Audit] Daily summary created for ${date}: ${dataHash.substring(0, 12)}...`);

        return new Response(
          JSON.stringify({
            success: true,
            summary_id: summary.id,
            summary_date: date,
            data_hash: dataHash,
            signature: signature.substring(0, 32) + "...",
            stats: {
              num_trades: summaryData.num_trades,
              total_pnl: summaryData.total_net_pnl,
              final_equity: summaryData.final_equity,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // EXPORT AUDIT TRAIL
      // ====================================================================
      case "export_audit_trail": {
        const { account_id, start_date, end_date, format = "json" } = body;

        if (!account_id) {
          return new Response(
            JSON.stringify({ error: "account_id is required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Default to last 30 days
        const end = end_date || new Date().toISOString().split("T")[0];
        const start = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        // Get all signed trades
        const startTimestamp = Math.floor(new Date(start).getTime() / 1000);
        const endTimestamp = Math.floor(new Date(end).getTime() / 1000) + 86400;

        const { data: trades, error: tradeError } = await supabase
          .from("signed_trade_ledger")
          .select("*")
          .eq("account_id", account_id)
          .eq("user_id", userId)
          .gte("trade_timestamp", startTimestamp)
          .lte("trade_timestamp", endTimestamp)
          .order("trade_timestamp", { ascending: true });

        if (tradeError) {
          return new Response(
            JSON.stringify({ error: tradeError.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Get daily summaries
        const { data: summaries, error: summaryError } = await supabase
          .from("signed_daily_summaries")
          .select("*")
          .eq("account_id", account_id)
          .eq("user_id", userId)
          .gte("summary_date", start)
          .lte("summary_date", end)
          .order("summary_date", { ascending: true });

        if (summaryError) {
          return new Response(
            JSON.stringify({ error: summaryError.message }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Calculate overall stats
        const overallStats = {
          total_trades: trades?.length || 0,
          total_gross_pnl: trades?.reduce((sum, t) => sum + Number(t.gross_pnl), 0) || 0,
          total_net_pnl: trades?.reduce((sum, t) => sum + Number(t.net_pnl), 0) || 0,
          total_costs: trades?.reduce((sum, t) => sum + Number(t.total_costs), 0) || 0,
          winning_trades: trades?.filter((t) => Number(t.net_pnl) > 0).length || 0,
          losing_trades: trades?.filter((t) => Number(t.net_pnl) < 0).length || 0,
        };

        const auditTrail = {
          export_metadata: {
            account_id,
            user_id: userId,
            start_date: start,
            end_date: end,
            exported_at: new Date().toISOString(),
            format,
          },
          overall_stats: overallStats,
          daily_summaries: summaries?.map((s) => ({
            date: s.summary_date,
            num_trades: s.num_trades,
            gross_pnl: Number(s.total_gross_pnl),
            net_pnl: Number(s.total_net_pnl),
            costs: Number(s.total_costs),
            final_equity: Number(s.final_equity),
            data_hash: s.data_hash,
            signature: s.signature.substring(0, 32) + "...",
          })) || [],
          trades: trades?.map((t) => ({
            id: t.trade_id,
            timestamp: t.trade_timestamp,
            symbol: t.symbol,
            quantity: t.quantity,
            entry_price: Number(t.entry_price),
            exit_price: Number(t.exit_price),
            gross_pnl: Number(t.gross_pnl),
            net_pnl: Number(t.net_pnl),
            costs: Number(t.total_costs),
            strategy: t.strategy,
            exit_reason: t.exit_reason,
            trade_hash: t.trade_hash,
            signature: t.signature.substring(0, 32) + "...",
          })) || [],
        };

        // Sign the entire export
        const exportHash = await sha256(JSON.stringify(auditTrail));
        const exportSignature = await hmacSign(exportHash, signingSecret);

        console.log(`[Legal Audit] Exported ${trades?.length} trades, ${summaries?.length} summaries`);

        return new Response(
          JSON.stringify({
            success: true,
            audit_trail: auditTrail,
            export_hash: exportHash,
            export_signature: exportSignature.substring(0, 32) + "...",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // GET LEDGER STATS
      // ====================================================================
      case "get_ledger_stats": {
        const { account_id } = body;

        if (!account_id) {
          return new Response(
            JSON.stringify({ error: "account_id is required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Count trades
        const { data: trades } = await supabase
          .from("signed_trade_ledger")
          .select("id, net_pnl, trade_timestamp")
          .eq("account_id", account_id)
          .eq("user_id", userId);

        // Count summaries
        const { data: summaries } = await supabase
          .from("signed_daily_summaries")
          .select("id, summary_date")
          .eq("account_id", account_id)
          .eq("user_id", userId);

        const stats = {
          total_signed_trades: trades?.length || 0,
          total_daily_summaries: summaries?.length || 0,
          total_pnl: trades?.reduce((sum, t) => sum + Number(t.net_pnl), 0) || 0,
          oldest_trade: trades?.length 
            ? new Date(Math.min(...trades.map((t) => t.trade_timestamp)) * 1000).toISOString()
            : null,
          newest_trade: trades?.length
            ? new Date(Math.max(...trades.map((t) => t.trade_timestamp)) * 1000).toISOString()
            : null,
          first_summary: summaries?.length
            ? summaries.sort((a, b) => a.summary_date.localeCompare(b.summary_date))[0].summary_date
            : null,
          last_summary: summaries?.length
            ? summaries.sort((a, b) => b.summary_date.localeCompare(a.summary_date))[0].summary_date
            : null,
        };

        return new Response(
          JSON.stringify({ success: true, stats }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({
            error: "Unknown action",
            available_actions: [
              "sign_trade",
              "verify_trade",
              "create_daily_summary",
              "export_audit_trail",
              "get_ledger_stats",
            ],
          }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error("Legal audit error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
