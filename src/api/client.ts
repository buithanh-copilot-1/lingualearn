const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getTokens() {
  return {
    accessToken: localStorage.getItem('lingualearn-access-token'),
    refreshToken: localStorage.getItem('lingualearn-refresh-token'),
  };
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('lingualearn-access-token', accessToken);
  localStorage.setItem('lingualearn-refresh-token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('lingualearn-access-token');
  localStorage.removeItem('lingualearn-refresh-token');
}

export function isApiConfigured() {
  return Boolean(API_URL);
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken || !API_URL) return null;

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new ApiError('API not configured', 0);

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  let { accessToken } = getTokens();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && getTokens().refreshToken) {
    accessToken = await refreshAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(err.error ?? res.statusText, res.status);
  }

  return res.json() as Promise<T>;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

export async function registerUser(email: string, password: string, displayName?: string) {
  return apiFetch<{
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    progress: unknown;
  }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
}

export async function loginUser(email: string, password: string) {
  return apiFetch<{
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    progress: unknown;
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe() {
  return apiFetch<{ user: AuthUser }>('/api/auth/me');
}

export async function fetchServerProgress() {
  return apiFetch<Record<string, unknown>>('/api/progress');
}

export async function syncFullProgress(progress: unknown) {
  return apiFetch<Record<string, unknown>>('/api/progress/sync', {
    method: 'PUT',
    body: JSON.stringify(progress),
  });
}

export async function logoutUser(refreshToken: string) {
  if (!API_URL) return;
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getTokens().accessToken ?? ''}` },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => undefined);
  clearTokens();
}
