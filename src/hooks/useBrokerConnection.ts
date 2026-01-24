import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type BrokerName = "angelone" | "zerodha" | "upstox";

export interface BrokerConnection {
  id: string;
  broker_name: string;
  is_active: boolean;
  connected_at: string | null;
  last_sync_at: string | null;
  token_expiry: string | null;
}

export interface OAuthInitResponse {
  auth_url: string;
  state: string;
}

export function useBrokerConnection() {
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch user's broker connections
  const fetchConnections = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("broker_connections")
        .select("id, broker_name, is_active, connected_at, last_sync_at, token_expiry")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setConnections(data || []);
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch connections";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Initiate OAuth flow
  const initiateOAuth = useCallback(async (broker: BrokerName): Promise<OAuthInitResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("broker-oauth", {
        body: { action: "initiate", broker }
      });

      if (invokeError) throw invokeError;
      if (!data.success) throw new Error(data.error || "Failed to initiate OAuth");

      return {
        auth_url: data.auth_url,
        state: data.state
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "OAuth initiation failed";
      setError(message);
      toast({
        title: "Connection Failed",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Complete OAuth flow (called after redirect)
  const completeOAuth = useCallback(async (
    broker: BrokerName,
    code: string,
    state: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("broker-oauth", {
        body: { action: "callback", broker, code, state }
      });

      if (invokeError) throw invokeError;
      if (!data.success) throw new Error(data.error || "OAuth callback failed");

      toast({
        title: "Broker Connected",
        description: `Successfully connected to ${broker.toUpperCase()}`,
      });

      await fetchConnections();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "OAuth completion failed";
      setError(message);
      toast({
        title: "Connection Failed",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchConnections]);

  // Disconnect broker
  const disconnect = useCallback(async (connectionId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from("broker_connections")
        .update({ is_active: false, access_token_encrypted: null })
        .eq("id", connectionId);

      if (deleteError) throw deleteError;

      toast({
        title: "Broker Disconnected",
        description: "Broker connection has been removed",
      });

      await fetchConnections();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to disconnect";
      setError(message);
      toast({
        title: "Disconnect Failed",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchConnections]);

  // Refresh token
  const refreshToken = useCallback(async (connectionId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("broker-oauth", {
        body: { action: "refresh", connection_id: connectionId }
      });

      if (invokeError) throw invokeError;
      if (!data.success) throw new Error(data.error || "Token refresh failed");

      toast({
        title: "Token Refreshed",
        description: "Broker session has been renewed",
      });

      await fetchConnections();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Token refresh failed";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchConnections]);

  // Get connection for a specific broker
  const getConnection = useCallback((broker: BrokerName): BrokerConnection | undefined => {
    return connections.find(c => c.broker_name === broker && c.is_active);
  }, [connections]);

  return {
    loading,
    error,
    connections,
    fetchConnections,
    initiateOAuth,
    completeOAuth,
    disconnect,
    refreshToken,
    getConnection,
  };
}
