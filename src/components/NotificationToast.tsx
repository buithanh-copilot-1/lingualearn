import { useEffect, useState, useCallback } from 'react';
import { useNotifications } from '../context/NotificationContext';
import type { NotificationItem } from '../api/notifications';

interface ToastEntry {
  notification: NotificationItem;
  exiting: boolean;
}

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 5000;

export default function NotificationToast() {
  const { latestToast, dismissToast } = useNotifications();
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  // When a new toast arrives, add it
  useEffect(() => {
    if (!latestToast) return;

    setToasts((prev) => {
      const next = [{ notification: latestToast, exiting: false }, ...prev];
      // Limit to MAX_TOASTS
      return next.slice(0, MAX_TOASTS);
    });

    dismissToast();
  }, [latestToast, dismissToast]);

  // Auto-dismiss
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      removeToast(toasts[toasts.length - 1].notification.id);
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.notification.id === id ? { ...t, exiting: true } : t)),
    );
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.notification.id !== id));
    }, 300);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="notification-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.notification.id}
          className={`notification-toast ${toast.exiting ? 'exiting' : 'entering'}`}
        >
          <div className="notification-toast-content">
            <div className="notification-toast-title">{toast.notification.title}</div>
            <div className="notification-toast-message">{toast.notification.message}</div>
          </div>
          <button
            type="button"
            className="notification-toast-close"
            onClick={() => removeToast(toast.notification.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
