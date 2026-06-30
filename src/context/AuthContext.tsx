import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import * as authApi from '../api/auth';
import type { AuthUser } from '../api/auth';
import { TOKEN_KEY } from '../api/config';
import { useProgressContext, loadLocalProgress } from './ProgressContext';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function hasServerProgress(p: { completedLessons: string[]; learnedWords: string[]; quizScores: unknown[] }) {
  return p.completedLessons.length > 0 || p.learnedWords.length > 0 || p.quizScores.length > 0;
}

function hasLocalProgress() {
  const local = loadLocalProgress();
  return (
    local.completedLessons.length > 0 ||
    local.learnedWords.length > 0 ||
    local.reviewedGrammar.length > 0 ||
    local.quizScores.length > 0
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setProgressFromServer, importLocalToServer } = useProgressContext();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem(TOKEN_KEY));
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const handleAuthSuccess = useCallback(
    async (data: { user: AuthUser; progress?: import('../types').UserProgress }) => {
      setUser(data.user);
      if (data.progress) {
        if (!hasServerProgress(data.progress) && hasLocalProgress()) {
          await importLocalToServer();
        } else {
          setProgressFromServer(data.progress);
        }
      }
    },
    [setProgressFromServer, importLocalToServer],
  );

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setIsLoading(false);
      return;
    }

    authApi
      .fetchMe()
      .then(async (data) => {
        setUser(data.user);
        if (!hasServerProgress(data.progress) && hasLocalProgress()) {
          await importLocalToServer();
        } else {
          setProgressFromServer(data.progress);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('lingualearn-refresh-token');
      })
      .finally(() => setIsLoading(false));
  }, [setProgressFromServer, importLocalToServer]);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const data = await authApi.login(email, password);
        await handleAuthSuccess(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Login failed');
        throw e;
      }
    },
    [handleAuthSuccess],
  );

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setError(null);
      try {
        const data = await authApi.register(email, password, displayName);
        await handleAuthSuccess(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Registration failed');
        throw e;
      }
    },
    [handleAuthSuccess],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setProgressFromServer(loadLocalProgress());
  }, [setProgressFromServer]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
