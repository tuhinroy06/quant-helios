import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RankingRequest {
  sector?: string;
  marketCap?: string;
  riskTolerance?: string;
  symbols?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sector, marketCap, riskTolerance, symbols } = await req.json() as RankingRequest;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate stock ranking using AI - Focus on Indian stocks (NSE/BSE)
    const prompt = `You are a financial analyst AI specializing in the Indian stock market (NSE/BSE). Generate a ranked list of 10 INDIAN stocks based on the following criteria:
${sector ? `- Sector: ${sector}` : "- All sectors"}
${marketCap ? `- Market Cap: ${marketCap}` : "- All market caps"}
${riskTolerance ? `- Risk Tolerance: ${riskTolerance}` : "- Moderate risk"}
${symbols?.length ? `- Focus on these symbols: ${symbols.join(", ")}` : ""}

IMPORTANT: Only include stocks listed on NSE (National Stock Exchange of India) or BSE (Bombay Stock Exchange).
Popular Indian stocks include: RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, BHARTIARTL, SBIN, HINDUNILVR, ITC, KOTAKBANK, LT, AXISBANK, MARUTI, SUNPHARMA, TITAN, BAJFINANCE, ASIANPAINT, NESTLEIND, TATAMOTORS, WIPRO, TATASTEEL, ULTRACEMCO, HCLTECH, ADANIENT, ADANIPORTS, POWERGRID, NTPC, ONGC, COALINDIA, JSWSTEEL.

For each stock, provide:
1. Symbol (NSE ticker without .NS suffix)
2. Company name (full Indian company name)
3. Rank score (0-100)
4. Momentum score (0-100)
5. Value score (0-100)
6. Quality score (0-100)
7. Volatility score (0-100, lower is less volatile)
8. Sector (Indian market sectors like IT, Banking, FMCG, Auto, Pharma, Energy, Metals, Infra, Telecom, etc.)
9. Market cap tier (small, mid, large)
10. Brief analysis (2-3 sentences about the Indian company)

Return as JSON array with format:
[{
  "symbol": "RELIANCE",
  "company_name": "Reliance Industries Limited",
  "rank_score": 85,
  "momentum_score": 78,
  "value_score": 65,
  "quality_score": 92,
  "volatility_score": 70,
  "sector": "Energy",
  "market_cap_tier": "large",
  "ai_analysis": "India's largest company by market cap with diversified presence in oil & gas, retail, and telecom..."
}]`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a financial analyst AI. Always respond with valid JSON arrays only, no markdown." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Please add credits to continue using AI features." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";
    
    // Parse the JSON response
    let rankings;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      rankings = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      console.error("Failed to parse AI response:", content);
      rankings = [];
    }

    // Save rankings to database
    if (rankings.length > 0) {
      const rankingsWithUser = rankings.map((r: Record<string, unknown>) => ({
        ...r,
        user_id: user.id,
        last_updated: new Date().toISOString(),
      }));

      // Delete old rankings for this user
      await supabaseClient.from("stock_rankings").delete().eq("user_id", user.id);

      // Insert new rankings
      const { error: insertError } = await supabaseClient.from("stock_rankings").insert(rankingsWithUser);
      if (insertError) {
        console.error("Insert error:", insertError);
      }
    }

    return new Response(JSON.stringify({ rankings }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("stock-ranker error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
