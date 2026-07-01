import type { FastifyReply } from 'fastify';
import type { NotificationType } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import webpush from 'web-push';
import { config } from '../../config.js';

// Setup VAPID keys
try {
  webpush.setVapidDetails(
    config.vapidEmail,
    config.vapidPublicKey,
    config.vapidPrivateKey
  );
} catch (e) {
  console.error('Failed to set VAPID details:', e);
}

// ---------------------------------------------------------------------------
// SSE Connection Manager
// ---------------------------------------------------------------------------

/** Map of userId → Set of active SSE reply streams */
const sseClients = new Map<string, Set<FastifyReply>>();

export function addSSEClient(userId: string, reply: FastifyReply) {
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId)!.add(reply);
}

export function removeSSEClient(userId: string, reply: FastifyReply) {
  const clients = sseClients.get(userId);
  if (clients) {
    clients.delete(reply);
    if (clients.size === 0) sseClients.delete(userId);
  }
}

function pushSSE(userId: string, event: string, data: unknown) {
  const clients = sseClients.get(userId);
  if (!clients) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const reply of clients) {
    try {
      reply.raw.write(payload);
    } catch {
      clients.delete(reply);
    }
  }
}

// ---------------------------------------------------------------------------
// Create & send a notification
// ---------------------------------------------------------------------------

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export async function sendNotification(input: CreateNotificationInput) {
  // Check user preferences
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: input.userId },
  });

  if (prefs) {
    const prefMap: Record<string, boolean> = {
      streak_reminder: prefs.streakReminder,
      goal_achieved: prefs.goalAchieved,
      streak_milestone: prefs.goalAchieved,
      new_content: prefs.newContent,
      review_due: prefs.reviewDue,
      achievement: prefs.achievements,
      system: prefs.systemNotices,
    };
    if (prefMap[input.type] === false) return null;
  }

  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ? (input.data as unknown as import('@prisma/client').Prisma.InputJsonValue) : undefined,
    },
  });

  // Push via SSE
  pushSSE(input.userId, 'notification', {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  });

  // Push via Web Push in the background
  setImmediate(async () => {
    try {
      await sendWebPush(input.userId, {
        title: notification.title,
        message: notification.message,
        data: input.data,
      });
    } catch (e) {
      // Log error silently
    }
  });

  return notification;
}

/** Broadcast to all users (e.g. new content, system notices) */
export async function broadcastNotification(
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>,
) {
  const users = await prisma.user.findMany({ select: { id: true } });
  for (const user of users) {
    await sendNotification({ userId: user.id, type, title, message, data });
  }
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function getNotifications(
  userId: string,
  options: { limit?: number; offset?: number; unreadOnly?: boolean } = {},
) {
  const { limit = 20, offset = 0, unreadOnly = false } = options;

  const where = {
    userId,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    total,
    hasMore: offset + limit < total,
  };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markAsRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function deleteNotification(userId: string, notificationId: string) {
  return prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
}

// ---------------------------------------------------------------------------
// Preferences
// ---------------------------------------------------------------------------

export async function getPreferences(userId: string) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function updatePreferences(
  userId: string,
  data: Partial<{
    streakReminder: boolean;
    goalAchieved: boolean;
    newContent: boolean;
    reviewDue: boolean;
    achievements: boolean;
    systemNotices: boolean;
  }>,
) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

// ---------------------------------------------------------------------------
// Web Push Subscription Management & Sending
// ---------------------------------------------------------------------------

export async function addPushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

export async function removePushSubscription(userId: string, endpoint: string) {
  try {
    await prisma.pushSubscription.delete({
      where: { endpoint },
    });
  } catch {
    // Already deleted
  }
}

export async function sendWebPush(userId: string, payload: { title: string; message: string; data?: any }) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return;

  const body = JSON.stringify(payload);

  const tasks = subscriptions.map(async (sub) => {
    const webPushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webpush.sendNotification(webPushSubscription, body);
    } catch (err: any) {
      // 410 (Gone) or 404 (Not Found) means subscription has expired or user revoked it
      if (err.statusCode === 410 || err.statusCode === 404) {
        await removePushSubscription(userId, sub.endpoint);
      }
    }
  });

  await Promise.allSettled(tasks);
}
