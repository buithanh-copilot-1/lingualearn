import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const { unreadCount, isPanelOpen, setIsPanelOpen } = useNotifications();
  const [shake, setShake] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(unreadCount);

  // Shake animation when new notification arrives
  useEffect(() => {
    if (unreadCount > prevCount.current) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(timer);
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  // Close panel when clicking outside
  useEffect(() => {
    if (!isPanelOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPanelOpen, setIsPanelOpen]);

  return (
    <div className="notification-bell-wrapper" ref={bellRef}>
      <button
        type="button"
        className={`notification-bell-btn ${shake ? 'shake' : ''}`}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isPanelOpen}
      >
        <svg
          className="notification-bell-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isPanelOpen && <NotificationPanel onClose={() => setIsPanelOpen(false)} />}
    </div>
  );
}
