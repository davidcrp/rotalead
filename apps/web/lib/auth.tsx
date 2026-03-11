'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  orgId: string;
}
interface Org {
  id: string;
  name: string;
}
interface AuthCtx {
  user: User | null;
  org: Org | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, orgName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const applyAuth = useCallback((data: { token: string; user: User; org: Org }) => {
    localStorage.setItem('rl_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setOrg(data.org);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('rl_token');
    if (!stored) { setLoading(false); return; }
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setToken(stored);
        setUser(data.user);
        setOrg(data.org);
      })
      .catch(() => localStorage.removeItem('rl_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.error || 'Login failed');
    }
    applyAuth(await r.json());
    router.push('/dashboard');
  };

  const register = async (email: string, password: string, orgName: string) => {
    const r = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, orgName }),
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.error || 'Registration failed');
    }
    applyAuth(await r.json());
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('rl_token');
    setUser(null);
    setOrg(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, org, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
