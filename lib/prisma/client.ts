import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialization to prevent connection during build
function getPrisma() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // During build phase, return a mock client that won't connect
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Return a proxy that throws helpful errors if used during build
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error('Prisma Client cannot be used during build phase. This route should be marked as dynamic.')
      },
    })
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }

  return client
}

export const prisma = getPrisma()

