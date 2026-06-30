export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? '' : '');

export const TOKEN_KEY = 'lingualearn-access-token';
export const REFRESH_KEY = 'lingualearn-refresh-token';
