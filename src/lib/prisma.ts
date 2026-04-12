import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: ['error'],
  });
}

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const prismaClient = createPrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient;
  }

  return prismaClient;
}
