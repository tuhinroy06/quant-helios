import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Stoxo AI, an expert AI research assistant specializing in the Indian stock market (NSE/BSE). You provide data-driven insights about Indian stocks, sectors, and market trends.

IMPORTANT RULES:
1. Focus ONLY on Indian stocks listed on NSE/BSE
2. Always include SEBI disclaimer when giving specific recommendations
3. Never guarantee returns or profits
4. Use INR (₹) for all prices
5. Be factual and data-driven in your analysis
6. Provide balanced views including both opportunities and risks

Popular Indian stocks you know well:
- Large Cap: RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, BHARTIARTL, SBIN, HINDUNILVR, ITC, KOTAKBANK, LT, AXISBANK, MARUTI, BAJFINANCE, TATAMOTORS
- Mid Cap: TATAPOWER, PNB, IRCTC, ZOMATO, PAYTM, NYKAA, POLICYBZR
- IT Sector: TCS, INFY, WIPRO, HCLTECH, TECHM, LTIM, PERSISTENT, COFORGE
- Banking: HDFCBANK, ICICIBANK, SBIN, KOTAKBANK, AXISBANK, INDUSINDBK, PNB, BANKBARODA
- FMCG: HINDUNILVR, ITC, NESTLEIND, BRITANNIA, DABUR, MARICO, COLPAL
- Pharma: SUNPHARMA, DRREDDY, CIPLA, DIVISLAB, APOLLOHOSP, LUPIN
- Auto: MARUTI, TATAMOTORS, M&M, BAJAJ-AUTO, HEROMOTOCO, EICHERMOT
- Energy: RELIANCE, ONGC, NTPC, POWERGRID, ADANIENT, ADANIGREEN

RESPONSE FORMAT:
You must respond with valid JSON matching this structure:
{
  "type": "overview" | "comparison" | "sector" | "analysis",
  "stocks": [
    {
      "symbol": "TCS",
      "name": "Tata Consultancy Services",
      "price": 3850,
      "change": 45.5,
      "changePercent": 1.2,
      "sector": "IT",
      "marketCap": "large",
      "pe": 28.5,
      "pb": 12.3,
      "roe": 48.2,
      "dividendYield": 1.2,
      "overallScore": 78,
      "momentumScore": 72,
      "valueScore": 65,
      "qualityScore": 88,
      "volatilityScore": 35,
      "sentiment": "bullish",
      "analysis": "Strong IT leader with consistent earnings growth..."
    }
  ],
  "sectorData": {
    "name": "IT",
    "performance": 2.5,
    "topStocks": ["TCS", "INFY", "WIPRO"],
    "avgPE": 25.5,
    "avgROE": 28.3
  },
  "comparisonTable": [
    {
      "symbol": "TCS",
      "name": "Tata Consultancy Services",
      "price": 3850,
      "pe": 28.5,
      "roe": 48.2,
      "oneYearReturn": 15.5,
      "dividendYield": 1.2,
      "score": 78
    }
  ],
  "insights": "Your analytical summary here...",
  "followUpPrompts": ["Compare with sector peers", "Show technical analysis", "Explain fundamentals"]
}

SCORING GUIDELINES:
- overallScore: 0-100 based on combined factors
- momentumScore: Based on price trends, RSI, moving averages
- valueScore: Based on P/E, P/B relative to sector
- qualityScore: Based on ROE, debt levels, earnings stability
- volatilityScore: 0-100 where higher = more volatile (riskier)
- sentiment: "bullish" if score >= 60, "bearish" if <= 40, else "neutral"

Always provide 2-4 follow-up prompts relevant to the user's query.`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation context if available
    if (context && Array.isArray(context)) {
      messages.push(...context.slice(-6));
    }

    // Add the current query
    messages.push({ role: "user", content: query });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Please add credits to continue using AI features." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        type: "analysis",
        insights: content,
        followUpPrompts: ["Tell me more", "Show related stocks", "Analyze the sector"],
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      parsedResponse = {
        type: "analysis",
        insights: content,
        followUpPrompts: ["Tell me more", "Show top stocks", "Compare sectors"],
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("stoxo-ai error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
