import { apiFetch, setTokens, clearTokens } from './client';
import type { UserProgress } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  progress?: UserProgress;
}

export async function register(email: string, password: string, displayName?: string) {
  const data = await apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function login(email: string, password: string) {
  const data = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logout() {
  const refreshToken = localStorage.getItem('lingualearn-refresh-token');
  if (refreshToken) {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      /* ignore */
    }
  }
  clearTokens();
}

export async function fetchMe() {
  return apiFetch<{ user: AuthUser; progress: UserProgress }>('/api/auth/me', { auth: true });
}
