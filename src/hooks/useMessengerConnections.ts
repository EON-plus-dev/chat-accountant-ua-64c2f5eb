import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MessengerProvider = "telegram" | "viber";
export type MessengerStatus = "disconnected" | "pending" | "connected" | "error";

export interface MessengerConnection {
  id: string;
  provider: MessengerProvider;
  status: MessengerStatus;
  external_chat_id: string | null;
  external_username: string | null;
  pairing_code: string | null;
  pairing_code_expires_at: string | null;
  connected_at: string | null;
  last_message_at: string | null;
  metadata: Record<string, unknown>;
  updated_at: string;
}

export type MessengerConnectionsMap = Record<MessengerProvider, MessengerConnection | null>;

const PAIRING_TTL_MIN = 15;
const PROVIDERS: MessengerProvider[] = ["telegram", "viber"];

function generatePairingCode(): string {
  // 8-symbol uppercase code, no easily confused characters
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const arr = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < 8; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < 8; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

const emptyMap: MessengerConnectionsMap = { telegram: null, viber: null };

export function useMessengerConnections() {
  const [connections, setConnections] = useState<MessengerConnectionsMap>(emptyMap);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [busyProvider, setBusyProvider] = useState<MessengerProvider | null>(null);

  const refresh = useCallback(async (uid?: string | null) => {
    const id = uid ?? userId;
    if (!id) {
      setConnections(emptyMap);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("user_messenger_connections")
      .select("*")
      .eq("user_id", id);
    if (error) {
      console.error("[useMessengerConnections] load", error);
      setConnections(emptyMap);
      setLoading(false);
      return;
    }
    const map: MessengerConnectionsMap = { telegram: null, viber: null };
    (data ?? []).forEach((row) => {
      const r = row as unknown as MessengerConnection;
      if (PROVIDERS.includes(r.provider)) {
        map[r.provider] = r;
      }
    });
    setConnections(map);
    setLoading(false);
  }, [userId]);

  // bootstrap auth + load
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const uid = data.user?.id ?? null;
      setUserId(uid);
      await refresh(uid);
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // realtime: react to row changes (e.g. bot edge function flips status to "connected")
  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel(`messenger-conn-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_messenger_connections", filter: `user_id=eq.${userId}` },
        () => { refresh(userId); }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, refresh]);

  const startPairing = useCallback(async (provider: MessengerProvider) => {
    if (!userId) return { error: "unauthenticated" as const };
    setBusyProvider(provider);
    const code = generatePairingCode();
    const expiresAt = new Date(Date.now() + PAIRING_TTL_MIN * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("user_messenger_connections")
      .upsert(
        {
          user_id: userId,
          provider,
          status: "pending",
          pairing_code: code,
          pairing_code_expires_at: expiresAt,
          external_chat_id: null,
          external_username: null,
        } as never,
        { onConflict: "user_id,provider" }
      )
      .select("*")
      .single();
    setBusyProvider(null);
    if (error) {
      console.error("[useMessengerConnections] startPairing", error);
      return { error: error.message };
    }
    const row = data as unknown as MessengerConnection;
    setConnections((prev) => ({ ...prev, [provider]: row }));
    return { error: null, code, expiresAt, connection: row };
  }, [userId]);

  const disconnect = useCallback(async (provider: MessengerProvider) => {
    if (!userId) return { error: "unauthenticated" as const };
    setBusyProvider(provider);
    const { data, error } = await supabase
      .from("user_messenger_connections")
      .upsert(
        {
          user_id: userId,
          provider,
          status: "disconnected",
          pairing_code: null,
          pairing_code_expires_at: null,
          external_chat_id: null,
          external_username: null,
          connected_at: null,
        } as never,
        { onConflict: "user_id,provider" }
      )
      .select("*")
      .single();
    setBusyProvider(null);
    if (error) {
      console.error("[useMessengerConnections] disconnect", error);
      return { error: error.message };
    }
    const row = data as unknown as MessengerConnection;
    setConnections((prev) => ({ ...prev, [provider]: row }));
    return { error: null };
  }, [userId]);

  return {
    connections,
    loading,
    busyProvider,
    refresh: () => refresh(userId),
    startPairing,
    disconnect,
  };
}
