import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma client.
 * In dev, Next.js / NestJS hot-reload would otherwise create a new client per
 * reload and exhaust the connection pool, so we cache it on `globalThis`.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
export default prisma;
