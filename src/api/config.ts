const rawApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

if (rawApiUrl.startsWith('postgresql://') || rawApiUrl.startsWith('postgres://')) {
  throw new Error(
    'VITE_API_URL is set to a database URL. Use your Railway API URL (https://....up.railway.app), not DATABASE_PUBLIC_URL.',
  );
}

export const API_URL = rawApiUrl || (import.meta.env.DEV ? '' : '');

export const TOKEN_KEY = 'lingualearn-access-token';
export const REFRESH_KEY = 'lingualearn-refresh-token';
