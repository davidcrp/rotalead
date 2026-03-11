'use client';

import { useCallback } from 'react';
import { useAuth } from './auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useApi() {
  const { token, logout } = useAuth();

  const request = useCallback(async (path: string, options: RequestInit = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      logout();
      throw new Error('Session expired');
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }

    return res.json();
  }, [token, logout]);

  return { request };
}
