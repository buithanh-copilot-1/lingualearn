import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, verifyPassword, hashToken, verifyTokenHash } from '../../utils/password.js';
import { ensureUserRecords, buildProgressResponse } from '../progress/progress.service.js';
import { config } from '../../config.js';
import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'crypto';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

function sanitizeUser(user: { id: string; email: string; displayName: string | null; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  };
}

async function issueTokens(app: FastifyInstance, user: { id: string; email: string }) {
  const accessToken = app.jwt.sign(
    { sub: user.id, email: user.email },
    { expiresIn: config.accessTokenExpires },
  );

  const refreshToken = randomBytes(48).toString('hex');
  const tokenHash = await hashToken(refreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.refreshTokenExpiresDays);

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  return { accessToken, refreshToken };
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const body = registerSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input', details: body.error.flatten() });
    }

    const existing = await prisma.user.findUnique({ where: { email: body.data.email } });
    if (existing) {
      return reply.status(409).send({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(body.data.password);
    const user = await prisma.user.create({
      data: {
        email: body.data.email,
        passwordHash,
        displayName: body.data.displayName ?? null,
      },
    });

    await ensureUserRecords(user.id);
    const tokens = await issueTokens(app, user);

    return reply.status(201).send({
      user: sanitizeUser(user),
      ...tokens,
      progress: await buildProgressResponse(user.id),
    });
  });

  app.post('/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const user = await prisma.user.findUnique({ where: { email: body.data.email } });
    if (!user || !(await verifyPassword(body.data.password, user.passwordHash))) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    await ensureUserRecords(user.id);
    const tokens = await issueTokens(app, user);

    return {
      user: sanitizeUser(user),
      ...tokens,
      progress: await buildProgressResponse(user.id),
    };
  });

  app.post('/refresh', async (request, reply) => {
    const body = refreshSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const tokens = await prisma.refreshToken.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    let matched: (typeof tokens)[0] | null = null;
    for (const t of tokens) {
      if (await verifyTokenHash(body.data.refreshToken, t.tokenHash)) {
        matched = t;
        break;
      }
    }

    if (!matched) {
      return reply.status(401).send({ error: 'Invalid refresh token' });
    }

    await prisma.refreshToken.delete({ where: { id: matched.id } });
    const newTokens = await issueTokens(app, matched.user);

    return {
      user: sanitizeUser(matched.user),
      ...newTokens,
    };
  });

  app.post('/logout', async (request, reply) => {
    const body = refreshSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const tokens = await prisma.refreshToken.findMany({
      where: { expiresAt: { gt: new Date() } },
    });

    for (const t of tokens) {
      if (await verifyTokenHash(body.data.refreshToken, t.tokenHash)) {
        await prisma.refreshToken.delete({ where: { id: t.id } });
        break;
      }
    }

    return { success: true };
  });

  app.get('/me', { preHandler: [app.authenticate] }, async (request) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: request.user.sub },
    });
    return {
      user: sanitizeUser(user),
      progress: await buildProgressResponse(user.id),
    };
  });

  app.put('/profile', { preHandler: [app.authenticate] }, async (request, reply) => {
    const updateProfileSchema = z.object({
      displayName: z.string().min(1).max(50),
    });

    const body = updateProfileSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const user = await prisma.user.update({
      where: { id: request.user.sub },
      data: {
        displayName: body.data.displayName,
      },
    });

    return {
      success: true,
      user: sanitizeUser(user),
    };
  });
}
