import { prisma } from './prisma'

export async function initializeDatabase() {
  try {
    // Check if database is accessible
    await prisma.$connect()
    
    // Try to query a table to see if schema exists
    await prisma.user.count()
    
    console.log('Database already initialized')
    return true
  } catch (error) {
    console.log('Database needs initialization, running migrations...')
    
    try {
      // On Vercel, we need to push the schema since migrations don't work with SQLite
      const { execSync } = require('child_process')
      execSync('npx prisma db push --force-reset', { stdio: 'inherit' })
      
      console.log('Database initialized successfully')
      return true
    } catch (initError) {
      console.error('Failed to initialize database:', initError)
      return false
    }
  }
}