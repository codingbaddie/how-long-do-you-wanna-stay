import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma, ensureDatabaseExists } from '@/lib/prisma-vercel'

export async function POST(request: NextRequest) {
  try {
    console.log('Signup request received')
    
    const { email, password, role, companyName, industry, companySize } = await request.json()
    console.log('Request data:', { email, role, companyName, industry, companySize })

    if (!email || !password || !role) {
      console.log('Missing required fields:', { email: !!email, password: !!password, role: !!role })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure database exists and is accessible
    const dbReady = await ensureDatabaseExists()
    if (!dbReady) {
      console.error('Database is not ready')
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Check if user exists
    console.log('Checking if user exists...')
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('User already exists')
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    console.log('Hashing password...')
    const hashedPassword = await hash(password, 12)

    console.log('Creating user...')
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as any,
        ...(role === 'COMPANY' && {
          companyData: {
            create: {
              companyName,
              industry,
              companySize: companySize as any
            }
          }
        })
      }
    })

    console.log('User created successfully:', user.id)
    return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    
    // Provide more detailed error information
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}