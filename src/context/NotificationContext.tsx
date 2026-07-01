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

  // Helper to convert base64 VAPID public key to Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Register Service Worker & Subscribe to Web Push
  useEffect(() => {
    if (!isAuthenticated) return;

    async function registerWebPush() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
      }

      try {
        // 1. Request permission if not determined
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }

        if (Notification.permission !== 'granted') {
          return;
        }

        // 2. Register Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');

        // 3. Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();

        // 4. If no subscription exists, create one
        if (!subscription) {
          const vapidPublicKey = 'BH5g_Z5_9ZAo5HIV1DhUkH1WMGL5SkwJbMekiFTDSmyuttRc1yusmKnyVXWCCClHD_io1wC5M_ctJCJ018oyHak';
          const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
        }

        // 5. Send subscription info to backend
        const subJson = subscription.toJSON();
        if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
          await notifApi.subscribePush({
            endpoint: subJson.endpoint,
            keys: {
              p256dh: subJson.keys.p256dh,
              auth: subJson.keys.auth,
            },
          });
        }
      } catch (err) {
        console.error('Web Push registration failed:', err);
      }
    }

    void registerWebPush();
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
