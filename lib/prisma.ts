// Prisma 클라이언트 싱글턴.
// Next.js dev 모드의 HMR 로 인해 요청마다 새 클라이언트가 생겨 커넥션이
// 폭증하는 것을 막기 위해 globalThis 에 캐싱한다.
import { PrismaClient } from './generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
