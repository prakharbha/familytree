import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Prevent connection during build
if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
  // During build, don't connect to database
  // The client will be lazy-initialized when actually used
}

