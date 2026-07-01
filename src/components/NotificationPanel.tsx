import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const TYPE_ICONS: Record<string, string> = {
  streak_reminder: '🔥',
  goal_achieved: '🎯',
  streak_milestone: '🏆',
  new_content: '📚',
  review_due: '📝',
  achievement: '⭐',
  system: '🔧',
};

function timeAgo(dateStr: string, locale: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return locale === 'vi' ? 'Vừa xong' : 'Just now';
  if (minutes < 60) return locale === 'vi' ? `${minutes} phút trước` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return locale === 'vi' ? `${hours} giờ trước` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return locale === 'vi' ? `${days} ngày trước` : `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

interface Props {
  onClose: () => void;
}

export default function NotificationPanel({ onClose: _onClose }: Props) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    removeNotification,
    loadMore,
    hasMore,
    isLoading,
  } = useNotifications();
  const { locale } = useLanguage();

  const handleClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(id);
    }
  };

  return (
    <div className="notification-panel" role="dialog" aria-label="Notifications">
      <div className="notification-panel-header">
        <h3 className="notification-panel-title">
          {locale === 'vi' ? 'Thông báo' : 'Notifications'}
          {unreadCount > 0 && (
            <span className="notification-panel-count">{unreadCount}</span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            type="button"
            className="notification-mark-all-btn"
            onClick={() => void markAllRead()}
          >
            {locale === 'vi' ? 'Đọc tất cả' : 'Mark all read'}
          </button>
        )}
      </div>

      <div className="notification-panel-list">
        {notifications.length === 0 ? (
          <div className="notification-empty">
            <span className="notification-empty-icon">🔔</span>
            <p>{locale === 'vi' ? 'Chưa có thông báo nào' : 'No notifications yet'}</p>
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${n.isRead ? '' : 'unread'}`}
                onClick={() => void handleClick(n.id, n.isRead)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleClick(n.id, n.isRead);
                }}
              >
                <span className="notification-item-icon">
                  {TYPE_ICONS[n.type] || '🔔'}
                </span>
                <div className="notification-item-content">
                  <div className="notification-item-title">{n.title}</div>
                  <div className="notification-item-message">{n.message}</div>
                  <div className="notification-item-time">{timeAgo(n.createdAt, locale)}</div>
                </div>
                <button
                  type="button"
                  className="notification-item-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    void removeNotification(n.id);
                  }}
                  aria-label="Delete notification"
                >
                  ×
                </button>
                {!n.isRead && <span className="notification-item-dot" />}
              </div>
            ))}

            {hasMore && (
              <button
                type="button"
                className="notification-load-more"
                onClick={() => void loadMore()}
                disabled={isLoading}
              >
                {isLoading
                  ? (locale === 'vi' ? 'Đang tải...' : 'Loading...')
                  : (locale === 'vi' ? 'Xem thêm' : 'Load more')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
