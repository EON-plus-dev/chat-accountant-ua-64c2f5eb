import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Module-level cache to dedupe concurrent has_role calls across hook instances
const adminCache = new Map<string, boolean>();
const inflight = new Map<string, Promise<boolean>>();

async function checkAdminRole(userId: string, retries = 2): Promise<boolean> {
  if (adminCache.has(userId)) return adminCache.get(userId)!;
  if (inflight.has(userId)) return inflight.get(userId)!;

  const p = (async () => {
    let lastErr: unknown = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase.rpc('has_role' as any, {
          _user_id: userId,
          _role: 'admin',
        });
        if (error) throw error;
        const result = !!data;
        adminCache.set(userId, result);
        return result;
      } catch (e) {
        lastErr = e;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        }
      }
    }
    console.warn('[useAdminAuth] has_role failed after retries:', lastErr);
    throw lastErr;
  })();

  inflight.set(userId, p);
  try {
    return await p;
  } finally {
    inflight.delete(userId);
  }
}

export type AdminCheckState = 'idle' | 'checking' | 'admin' | 'not_admin' | 'error';

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AdminCheckState>('idle');

  useEffect(() => {
    let mounted = true;

    const run = (u: User | null) => {
      if (!mounted) return;
      setUser(u);
      if (!u) {
        setState('not_admin');
        return;
      }
      setState((prev) => (prev === 'admin' ? 'admin' : 'checking'));
      checkAdminRole(u.id)
        .then((isAdmin) => {
          if (!mounted) return;
          setState(isAdmin ? 'admin' : 'not_admin');
        })
        .catch(() => {
          if (!mounted) return;
          setState('error');
        });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      run(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        run(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const retry = () => {
    if (user) {
      adminCache.delete(user.id);
      setState('checking');
      checkAdminRole(user.id)
        .then((isAdmin) => setState(isAdmin ? 'admin' : 'not_admin'))
        .catch(() => setState('error'));
    }
  };

  return {
    user,
    isAdmin: state === 'admin',
    isLoading: state === 'idle' || state === 'checking',
    hasError: state === 'error',
    retry,
  };
}
