import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  type AuthUser,
  clearTokens,
  fetchMe,
  getTokens,
  isApiConfigured,
  loginUser,
  logoutUser,
  registerUser,
  setTokens,
} from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  apiEnabled: boolean;
  login: (email: string, password: string) => Promise<unknown>;
  register: (email: string, password: string, displayName?: string) => Promise<unknown>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isApiConfigured());

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false);
      return;
    }
    const { accessToken } = getTokens();
    if (!accessToken) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((data) => setUser(data.user))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginUser(email, password);
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.progress;
  }, []);

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    const data = await registerUser(email, password, displayName);
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.progress;
  }, []);

  const logout = useCallback(async () => {
    const { refreshToken } = getTokens();
    if (refreshToken) await logoutUser(refreshToken);
    else clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: Boolean(user),
      apiEnabled: isApiConfigured(),
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Re-export getTokens for progress sync
export { getTokens, isApiConfigured };
