import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert algorithmic trading strategy designer. Your role is to convert natural language descriptions into structured trading strategy JSON.

IMPORTANT RULES:
1. NEVER promise or guarantee profits
2. NEVER generate code - only structured JSON configuration
3. Always emphasize that backtesting is required and past performance doesn't guarantee future results
4. Be conservative with risk parameters
5. Only use well-established technical indicators

When the user describes a strategy, respond with:
1. A brief, clear explanation of what the strategy does in plain English
2. The structured strategy configuration in a specific JSON format

Your response should be conversational but include the strategy details. When you have enough information to create a strategy, include a JSON block with this exact structure:

\`\`\`strategy
{
  "name": "Strategy Name",
  "description": "Brief description",
  "market_type": "cash" | "crypto",
  "timeframe": "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w",
  "entry_rules": [
    { "indicator": "RSI" | "MACD" | "SMA" | "EMA" | "Bollinger Bands" | "Volume" | "Price", "condition": "above" | "below" | "crosses above" | "crosses below", "value": "number or indicator" }
  ],
  "exit_rules": [
    { "indicator": "RSI" | "MACD" | "SMA" | "EMA" | "Bollinger Bands" | "Volume" | "Price", "condition": "above" | "below" | "crosses above" | "crosses below", "value": "number or indicator" }
  ],
  "position_sizing": { "type": "fixed_percent", "value": 5 },
  "risk_limits": { "max_drawdown_percent": 15, "stop_loss_percent": 5 }
}
\`\`\`

If the user's request is unclear, ask clarifying questions about:
- What market they want to trade (stocks, crypto)
- What timeframe they prefer
- What indicators they're interested in
- Their risk tolerance

Always remind users that this strategy needs backtesting before any real trading.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate strategy. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("generate-strategy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
