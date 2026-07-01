import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import {
  addSSEClient,
  removeSSEClient,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  addPushSubscription,
  removePushSubscription,
} from './notification.service.js';

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

const preferencesSchema = z.object({
  streakReminder: z.boolean().optional(),
  goalAchieved: z.boolean().optional(),
  newContent: z.boolean().optional(),
  reviewDue: z.boolean().optional(),
  achievements: z.boolean().optional(),
  systemNotices: z.boolean().optional(),
});

export async function notificationRoutes(app: FastifyInstance) {
  // ── SSE stream (special auth via query param) ───────────────────────
  // EventSource API can't set headers, so we accept token as query param.
  // This route is registered BEFORE the preHandler hook below.
  app.get('/stream', async (request, reply) => {
    const { token } = request.query as { token?: string };
    if (!token) {
      return reply.status(401).send({ error: 'Missing token' });
    }

    let payload: { sub: string };
    try {
      payload = app.jwt.verify<{ sub: string }>(token);
    } catch {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    const userId = payload.sub;

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // nginx compatibility
    });

    // Send initial ping
    reply.raw.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

    addSSEClient(userId, reply);

    // Heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(() => {
      try {
        reply.raw.write(`: heartbeat\n\n`);
      } catch {
        clearInterval(heartbeat);
      }
    }, 30_000);

    // Clean up on close
    request.raw.on('close', () => {
      clearInterval(heartbeat);
      removeSSEClient(userId, reply);
    });

    // Don't call reply.send() — we're streaming
    await reply.hijack();
  });

  // All other routes need standard JWT auth
  app.addHook('preHandler', app.authenticate);

  // ── List notifications (paginated) ──────────────────────────────────
  app.get('/', async (request) => {
    const query = request.query as {
      limit?: string;
      offset?: string;
      unreadOnly?: string;
    };

    return getNotifications(request.user.sub, {
      limit: query.limit ? +query.limit : undefined,
      offset: query.offset ? +query.offset : undefined,
      unreadOnly: query.unreadOnly === 'true',
    });
  });

  // ── Unread count ────────────────────────────────────────────────────
  app.get('/unread-count', async (request) => {
    const count = await getUnreadCount(request.user.sub);
    return { count };
  });

  // ── Mark one as read ────────────────────────────────────────────────
  app.patch('/:id/read', async (request) => {
    const { id } = request.params as { id: string };
    await markAsRead(request.user.sub, id);
    return { success: true };
  });

  // ── Mark all as read ────────────────────────────────────────────────
  app.patch('/read-all', async (request) => {
    await markAllAsRead(request.user.sub);
    return { success: true };
  });

  // ── Delete notification ─────────────────────────────────────────────
  app.delete('/:id', async (request) => {
    const { id } = request.params as { id: string };
    await deleteNotification(request.user.sub, id);
    return { success: true };
  });

  // ── Get preferences ─────────────────────────────────────────────────
  app.get('/preferences', async (request) => {
    return getPreferences(request.user.sub);
  });

  // ── Update preferences ──────────────────────────────────────────────
  app.put('/preferences', async (request, reply) => {
    const body = preferencesSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }
    return updatePreferences(request.user.sub, body.data);
  });

  // ── Web Push Subscribe ──────────────────────────────────────────────
  app.post('/push/subscribe', async (request, reply) => {
    const body = pushSubscriptionSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }
    await addPushSubscription(request.user.sub, body.data);
    return { success: true };
  });

  // ── Web Push Unsubscribe ────────────────────────────────────────────
  app.post('/push/unsubscribe', async (request, reply) => {
    const body = z.object({ endpoint: z.string().url() }).safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }
    await removePushSubscription(request.user.sub, body.data.endpoint);
    return { success: true };
  });

  // ── Test Schedule Endpoint ──────────────────────────────────────────
  app.post('/test-schedule', async (request, reply) => {
    const bodySchema = z.object({
      delayMs: z.number().int().min(0),
      message: z.string().min(1),
    });

    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const userId = request.user.sub;
    const { delayMs, message } = parsed.data;

    setTimeout(async () => {
      try {
        await import('./notification.service.js').then(({ sendNotification }) =>
          sendNotification({
            userId,
            type: 'system',
            title: 'Test Notification 🔔',
            message,
          })
        );
      } catch (err) {
        app.log.error(err, 'Failed to send test notification');
      }
    }, delayMs);

    return { success: true, delayMs };
  });
}
