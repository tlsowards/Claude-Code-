import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { site, subscription } from '../config';

export interface Me {
  user: { id: number; name: string; email: string };
  subscription: { active: boolean; status: string; enrolledAt: string | null; trialEndsAt: string | null; nextPayment: string | null };
  courses: { id: number; title: string; url: string; progress: number; completed: boolean; certificate: string }[];
}

interface AuthState {
  token: string | null;
  me: Me | null;
  loading: boolean;
  error: string | null;
  /** True when the reader may see subscriber content. Always true while the paywall is not enforced. */
  canAccess: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const KEY = 'sowards.app.token';
const AuthContext = createContext<AuthState | null>(null);

function readToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function writeToken(t: string | null) {
  try {
    if (t) localStorage.setItem(KEY, t);
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readToken());
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(readToken()));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const t = readToken();
    if (!t) {
      setMe(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${site.apiBase}/app-me`, { headers: { 'X-Sowards-Token': t } });
      if (r.status === 401) {
        writeToken(null);
        setToken(null);
        setMe(null);
      } else if (r.ok) {
        setMe((await r.json()) as Me);
      }
    } catch {
      /* offline: keep whatever we had */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(async (username: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch(`${site.apiBase}/app-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError((data && data.message) || 'Sign-in failed.');
        return false;
      }
      writeToken(data.token);
      setToken(data.token);
      setMe({ user: data.user, subscription: data.subscription, courses: data.courses });
      return true;
    } catch {
      setError('Could not reach sowardsconsulting.com. Check your connection and try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    const t = readToken();
    writeToken(null);
    setToken(null);
    setMe(null);
    if (t) {
      try {
        await fetch(`${site.apiBase}/app-logout`, { method: 'POST', headers: { 'X-Sowards-Token': t } });
      } catch {
        /* best effort */
      }
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      me,
      loading,
      error,
      canAccess: !subscription.enforced || Boolean(me?.subscription.active),
      signIn,
      signOut,
      refresh,
    }),
    [token, me, loading, error, signIn, signOut, refresh],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
