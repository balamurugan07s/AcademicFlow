import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
import { env } from '../config/env.js';

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prismaInstance;
}

export async function checkDatabaseConnection(): Promise<{ isHealthy: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return {
      isHealthy: true,
      latencyMs: Date.now() - start,
    };
  } catch (error: any) {
    logger.warn('Database health check ping failed (running without live Postgres server or during test mode)', {
      error: error.message,
    });
    return {
      isHealthy: false,
      latencyMs: Date.now() - start,
      error: error.message,
    };
  }
}
