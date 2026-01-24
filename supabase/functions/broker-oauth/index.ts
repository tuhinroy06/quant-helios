/**
 * BROKER OAUTH EDGE FUNCTION
 * 
 * Handles OAuth flows for Indian broker integrations:
 * - Angel One (SmartAPI)
 * - Zerodha (Kite Connect)
 * - Upstox (Upstox Pro API)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Broker OAuth configurations
const BROKER_CONFIGS = {
  angelone: {
    name: "Angel One",
    authUrl: "https://smartapi.angelbroking.com/publisher-login",
    tokenUrl: "https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword",
    apiBaseUrl: "https://apiconnect.angelbroking.com",
  },
  zerodha: {
    name: "Zerodha",
    authUrl: "https://kite.zerodha.com/connect/login",
    tokenUrl: "https://api.kite.trade/session/token",
    apiBaseUrl: "https://api.kite.trade",
  },
  upstox: {
    name: "Upstox",
    authUrl: "https://api-v2.upstox.com/login/authorization/dialog",
    tokenUrl: "https://api-v2.upstox.com/login/authorization/token",
    apiBaseUrl: "https://api-v2.upstox.com",
  },
};

type BrokerName = keyof typeof BROKER_CONFIGS;

// Generate a secure random state token
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Simple encryption for storing tokens (in production, use proper encryption)
function encryptToken(token: string): string {
  // In production, use proper encryption with a secret key
  return btoa(token);
}

function decryptToken(encrypted: string): string {
  return atob(encrypted);
}

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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    const body = await req.json();
    const { action, broker } = body;

    console.log(`[Broker OAuth] Action: ${action}, Broker: ${broker}, User: ${userId}`);

    switch (action) {
      // ====================================================================
      // INITIATE OAUTH FLOW
      // ====================================================================
      case "initiate": {
        if (!broker || !BROKER_CONFIGS[broker as BrokerName]) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid broker" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const brokerConfig = BROKER_CONFIGS[broker as BrokerName];
        const state = generateState();
        
        // Get API credentials from environment
        const apiKey = Deno.env.get(`${broker.toUpperCase()}_API_KEY`);
        
        if (!apiKey) {
          console.log(`[Broker OAuth] Missing API key for ${broker}`);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Broker credentials not configured. Please add ${broker.toUpperCase()}_API_KEY to enable this integration.`,
              requires_setup: true
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Store state for validation during callback
        // In production, store in a temporary table with expiry
        const redirectUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/broker-oauth-callback`;
        
        let authUrl: string;
        
        if (broker === "angelone") {
          // Angel One uses a different flow - API key based login
          authUrl = `${brokerConfig.authUrl}?api_key=${apiKey}`;
        } else if (broker === "zerodha") {
          authUrl = `${brokerConfig.authUrl}?v=3&api_key=${apiKey}`;
        } else if (broker === "upstox") {
          authUrl = `${brokerConfig.authUrl}?response_type=code&client_id=${apiKey}&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${state}`;
        } else {
          authUrl = brokerConfig.authUrl;
        }

        console.log(`[Broker OAuth] Generated auth URL for ${broker}`);

        return new Response(
          JSON.stringify({
            success: true,
            auth_url: authUrl,
            state,
            broker: broker,
            instructions: getBrokerInstructions(broker as BrokerName),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // HANDLE OAUTH CALLBACK
      // ====================================================================
      case "callback": {
        const { code, state: returnedState } = body;

        if (!broker || !code) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing code or broker" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const brokerConfig = BROKER_CONFIGS[broker as BrokerName];
        const apiKey = Deno.env.get(`${broker.toUpperCase()}_API_KEY`);
        const apiSecret = Deno.env.get(`${broker.toUpperCase()}_API_SECRET`);

        if (!apiKey || !apiSecret) {
          return new Response(
            JSON.stringify({ success: false, error: "Broker credentials not configured" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Exchange code for token based on broker
        let accessToken: string;
        let tokenExpiry: Date;

        try {
          if (broker === "angelone") {
            // Angel One token exchange
            const tokenResponse = await fetch(brokerConfig.tokenUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-PrivateKey": apiKey,
                "X-ClientLocalIP": "127.0.0.1",
                "X-ClientPublicIP": "127.0.0.1",
                "X-MACAddress": "00:00:00:00:00:00",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
              },
              body: JSON.stringify({
                clientcode: code, // For Angel One, code is the client code
                password: apiSecret, // Password/MPIN
              }),
            });

            const tokenData = await tokenResponse.json();
            if (!tokenData.data?.jwtToken) {
              throw new Error(tokenData.message || "Failed to get token");
            }
            accessToken = tokenData.data.jwtToken;
            tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          } else if (broker === "zerodha") {
            // Zerodha token exchange
            const checksum = await generateZerodhaChecksum(apiKey, code, apiSecret);
            const tokenResponse = await fetch(brokerConfig.tokenUrl, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                api_key: apiKey,
                request_token: code,
                checksum,
              }),
            });

            const tokenData = await tokenResponse.json();
            if (!tokenData.data?.access_token) {
              throw new Error(tokenData.message || "Failed to get token");
            }
            accessToken = tokenData.data.access_token;
            tokenExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours for Zerodha
          } else if (broker === "upstox") {
            // Upstox token exchange
            const redirectUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/broker-oauth-callback`;
            const tokenResponse = await fetch(brokerConfig.tokenUrl, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                code,
                client_id: apiKey,
                client_secret: apiSecret,
                redirect_uri: redirectUrl,
                grant_type: "authorization_code",
              }),
            });

            const tokenData = await tokenResponse.json();
            if (!tokenData.access_token) {
              throw new Error(tokenData.error || "Failed to get token");
            }
            accessToken = tokenData.access_token;
            tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          } else {
            throw new Error("Unsupported broker");
          }
        } catch (err) {
          console.error(`[Broker OAuth] Token exchange failed:`, err);
          return new Response(
            JSON.stringify({ success: false, error: "Token exchange failed" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Store connection in database
        const { data: connection, error: insertError } = await supabase
          .from("broker_connections")
          .upsert({
            user_id: userId,
            broker_name: broker,
            api_key_encrypted: encryptToken(apiKey),
            access_token_encrypted: encryptToken(accessToken),
            token_expiry: tokenExpiry.toISOString(),
            connected_at: new Date().toISOString(),
            is_active: true,
          }, {
            onConflict: "user_id,broker_name",
          })
          .select()
          .single();

        if (insertError) {
          console.error(`[Broker OAuth] Failed to store connection:`, insertError);
          return new Response(
            JSON.stringify({ success: false, error: "Failed to store connection" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[Broker OAuth] Successfully connected ${broker} for user ${userId}`);

        return new Response(
          JSON.stringify({
            success: true,
            connection_id: connection.id,
            broker: broker,
            expires_at: tokenExpiry.toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // REFRESH TOKEN
      // ====================================================================
      case "refresh": {
        const { connection_id } = body;

        if (!connection_id) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing connection_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get connection
        const { data: connection, error: fetchError } = await supabase
          .from("broker_connections")
          .select("*")
          .eq("id", connection_id)
          .eq("user_id", userId)
          .single();

        if (fetchError || !connection) {
          return new Response(
            JSON.stringify({ success: false, error: "Connection not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // For most Indian brokers, token refresh requires re-authentication
        // Return a flag indicating re-auth is needed
        return new Response(
          JSON.stringify({
            success: false,
            error: "Token expired. Please reconnect to the broker.",
            requires_reauth: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ====================================================================
      // GET CONNECTION STATUS
      // ====================================================================
      case "status": {
        const { data: connections, error: fetchError } = await supabase
          .from("broker_connections")
          .select("id, broker_name, is_active, connected_at, last_sync_at, token_expiry")
          .eq("user_id", userId)
          .eq("is_active", true);

        if (fetchError) {
          return new Response(
            JSON.stringify({ success: false, error: fetchError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check token expiry for each connection
        const connectionsWithStatus = (connections || []).map(conn => ({
          ...conn,
          is_expired: conn.token_expiry ? new Date(conn.token_expiry) < new Date() : false,
        }));

        return new Response(
          JSON.stringify({
            success: true,
            connections: connectionsWithStatus,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (err) {
    console.error("[Broker OAuth] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to generate Zerodha checksum
async function generateZerodhaChecksum(apiKey: string, requestToken: string, apiSecret: string): Promise<string> {
  const data = apiKey + requestToken + apiSecret;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to get broker-specific instructions
function getBrokerInstructions(broker: BrokerName): string {
  switch (broker) {
    case "angelone":
      return "You will be redirected to Angel One login. Enter your Client ID, MPIN, and complete 2FA to connect your account.";
    case "zerodha":
      return "You will be redirected to Kite login. Enter your User ID and PIN to authorize the connection.";
    case "upstox":
      return "You will be redirected to Upstox login. Enter your credentials and authorize the app to access your account.";
    default:
      return "Follow the broker's login process to connect your account.";
  }
}
