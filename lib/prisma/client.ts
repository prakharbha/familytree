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

  // Use POSTGRES_PRISMA_URL or POSTGRES_URL if DATABASE_URL is not available (for Vercel)
  // Set DATABASE_URL if not already set, so Prisma schema can read it
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || ''
  }
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL environment variable is required')
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

