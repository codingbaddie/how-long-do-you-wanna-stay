import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    // Test if tables exist
    const users = await prisma.user.count()
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      testQuery: result,
      userCount: users,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'not set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}