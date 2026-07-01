import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { API_URL, TOKEN_KEY } from '../api/config';
import * as notifApi from '../api/notifications';
import type { NotificationItem } from '../api/notifications';

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  /** Latest notification for toast display */
  latestToast: NotificationItem | null;
  dismissToast: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const PAGE_SIZE = 20;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestToast, setLatestToast] = useState<NotificationItem | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch initial notifications
  const fetchInitial = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [list, countRes] = await Promise.all([
        notifApi.fetchNotifications({ limit: PAGE_SIZE }),
        notifApi.fetchUnreadCount(),
      ]);
      setNotifications(list.notifications);
      setHasMore(list.hasMore);
      setUnreadCount(countRes.count);
    } catch {
      // silently fail
    }
  }, [isAuthenticated]);

  // SSE connection
  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up on logout
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    void fetchInitial();

    // Try SSE connection
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    // EventSource doesn't support custom headers, so pass token as query param
    const sseUrl = `${API_URL}/api/notifications/stream?token=${encodeURIComponent(token)}`;

    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.addEventListener('notification', (e) => {
        try {
          const data = JSON.parse(e.data) as NotificationItem;
          setNotifications((prev) => [data, ...prev]);
          setUnreadCount((prev) => prev + 1);
          setLatestToast(data);
        } catch {
          // invalid data
        }
      });

      es.addEventListener('connected', () => {
        // SSE connected, clear any polling fallback
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      });

      es.onerror = () => {
        // On SSE failure, fall back to polling
        es.close();
        eventSourceRef.current = null;
        startPolling();
      };
    } catch {
      // SSE not available, use polling
      startPolling();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  function startPolling() {
    if (pollTimerRef.current) return;
    pollTimerRef.current = setInterval(() => {
      void fetchInitial();
    }, 30_000);
  }

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const list = await notifApi.fetchNotifications({
        limit: PAGE_SIZE,
        offset: notifications.length,
      });
      setNotifications((prev) => [...prev, ...list.notifications]);
      setHasMore(list.hasMore);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, notifications.length]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notifApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notifApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    try {
      await notifApi.deleteNotification(id);
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === id);
        if (target && !target.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch {
      // silently fail
    }
  }, []);

  const dismissToast = useCallback(() => setLatestToast(null), []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        latestToast,
        dismissToast,
        markAsRead,
        markAllRead,
        removeNotification,
        loadMore,
        hasMore,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
