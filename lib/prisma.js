import { PrismaClient } from '@prisma/client'

const globalForPrisma = global

// Check if prisma exists on the globalForPrisma object
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient()
}

export const prisma = globalForPrisma.prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
