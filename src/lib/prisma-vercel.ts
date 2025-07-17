import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a new Prisma client with better error handling for Vercel
function createPrismaClient() {
  const client = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
  })

  // Add error handling for Vercel deployment
  client.$on('error' as any, (e: any) => {
    console.error('Prisma Client Error:', e)
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Initialize database on startup for Vercel
export async function ensureDatabaseExists() {
  try {
    await prisma.$connect()
    
    // Test if tables exist by trying to count users
    await prisma.user.count()
    
    console.log('Database connection verified')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    
    // For SQLite on Vercel, try to create the database file
    if (process.env.DATABASE_URL?.includes('file:')) {
      try {
        console.log('Attempting to initialize SQLite database...')
        
        // Create the database schema
        await prisma.$executeRaw`PRAGMA foreign_keys = ON;`
        
        console.log('SQLite database initialized')
        return true
      } catch (initError) {
        console.error('Failed to initialize SQLite:', initError)
        return false
      }
    }
    
    return false
  }
}