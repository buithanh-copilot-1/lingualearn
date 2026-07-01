import { apiFetch } from './client';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationList {
  notifications: NotificationItem[];
  total: number;
  hasMore: boolean;
}

export function fetchNotifications(options?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}) {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));
  if (options?.unreadOnly) params.set('unreadOnly', 'true');
  const qs = params.toString();
  return apiFetch<NotificationList>(`/api/notifications${qs ? `?${qs}` : ''}`, { auth: true });
}

export function fetchUnreadCount() {
  return apiFetch<{ count: number }>('/api/notifications/unread-count', { auth: true });
}

export function markNotificationRead(id: string) {
  return apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    auth: true,
  });
}

export function markAllNotificationsRead() {
  return apiFetch<{ success: boolean }>('/api/notifications/read-all', {
    method: 'PATCH',
    auth: true,
  });
}

export function deleteNotification(id: string) {
  return apiFetch<{ success: boolean }>(`/api/notifications/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export interface NotificationPreferences {
  userId: string;
  streakReminder: boolean;
  goalAchieved: boolean;
  newContent: boolean;
  reviewDue: boolean;
  achievements: boolean;
  systemNotices: boolean;
}

export function fetchNotificationPreferences() {
  return apiFetch<NotificationPreferences>('/api/notifications/preferences', { auth: true });
}

export function updateNotificationPreferences(
  data: Partial<Omit<NotificationPreferences, 'userId'>>,
) {
  return apiFetch<NotificationPreferences>('/api/notifications/preferences', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(data),
  });
}

export function triggerTestNotification(delayMs: number, message: string) {
  return apiFetch<{ success: boolean; delayMs: number }>('/api/notifications/test-schedule', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ delayMs, message }),
  });
}

export function subscribePush(subscription: any) {
  return apiFetch<{ success: boolean }>('/api/notifications/push/subscribe', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(subscription),
  });
}

export function unsubscribePush(endpoint: string) {
  return apiFetch<{ success: boolean }>('/api/notifications/push/unsubscribe', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ endpoint }),
  });
}
