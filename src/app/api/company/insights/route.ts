import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyName = searchParams.get('companyName')
    const industry = searchParams.get('industry')
    const companySize = searchParams.get('companySize')
    const department = searchParams.get('department')

    if (!companyName || !industry || !companySize) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const insights = await prisma.retentionInsights.findMany({
      where: {
        companyName,
        industry,
        companySize,
        ...(department && { department })
      }
    })

    if (insights.length === 0) {
      return NextResponse.json({ 
        message: 'No data available for the specified criteria. More employee responses are needed.',
        insights: []
      }, { status: 200 })
    }

    // Filter out insights with small sample sizes for privacy
    const filteredInsights = insights.filter(insight => insight.sampleSize >= 5)

    if (filteredInsights.length === 0) {
      return NextResponse.json({ 
        message: 'Insufficient data for reliable insights. At least 5 employee responses are required.',
        insights: []
      }, { status: 200 })
    }

    // Parse JSON fields
    const parsedInsights = filteredInsights.map(insight => ({
      ...insight,
      topReasonsToLeave: JSON.parse(insight.topReasonsToLeave),
      topReasonsToStay: JSON.parse(insight.topReasonsToStay)
    }))

    return NextResponse.json({ insights: parsedInsights }, { status: 200 })
  } catch (error) {
    console.error('Company insights fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyName, industry, companySize, department } = await request.json()

    // Check if company has access to this data (subscription check)
    const companyData = await prisma.companyData.findUnique({
      where: { userId: session.user.id }
    })

    if (!companyData) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 })
    }

    // Basic subscription check (can be expanded)
    if (companyData.subscriptionType === 'BASIC' && department) {
      return NextResponse.json({ 
        error: 'Department-specific insights require Premium subscription' 
      }, { status: 403 })
    }

    // Get industry benchmarks (anonymized data from other companies)
    const industryBenchmarks = await prisma.retentionInsights.findMany({
      where: {
        industry,
        companySize,
        NOT: { companyName }
      },
      select: {
        avgIntendedStayDuration: true,
        avgSatisfactionScore: true,
        avgWorkLifeBalance: true,
        avgCareerGrowth: true,
        avgCompensation: true,
        avgManagement: true,
        sampleSize: true
      }
    })

    const benchmarkData = calculateBenchmarks(industryBenchmarks)

    return NextResponse.json({ 
      message: 'Insights request processed',
      benchmarks: benchmarkData
    }, { status: 200 })
  } catch (error) {
    console.error('Company insights request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateBenchmarks(insights: any[]): any {
  if (insights.length === 0) return null

  const weightedSum = insights.reduce((acc, insight) => {
    const weight = insight.sampleSize
    return {
      avgIntendedStayDuration: acc.avgIntendedStayDuration + (insight.avgIntendedStayDuration * weight),
      avgSatisfactionScore: acc.avgSatisfactionScore + (insight.avgSatisfactionScore * weight),
      avgWorkLifeBalance: acc.avgWorkLifeBalance + (insight.avgWorkLifeBalance * weight),
      avgCareerGrowth: acc.avgCareerGrowth + (insight.avgCareerGrowth * weight),
      avgCompensation: acc.avgCompensation + (insight.avgCompensation * weight),
      avgManagement: acc.avgManagement + (insight.avgManagement * weight),
      totalWeight: acc.totalWeight + weight
    }
  }, {
    avgIntendedStayDuration: 0,
    avgSatisfactionScore: 0,
    avgWorkLifeBalance: 0,
    avgCareerGrowth: 0,
    avgCompensation: 0,
    avgManagement: 0,
    totalWeight: 0
  })

  return {
    avgIntendedStayDuration: weightedSum.avgIntendedStayDuration / weightedSum.totalWeight,
    avgSatisfactionScore: weightedSum.avgSatisfactionScore / weightedSum.totalWeight,
    avgWorkLifeBalance: weightedSum.avgWorkLifeBalance / weightedSum.totalWeight,
    avgCareerGrowth: weightedSum.avgCareerGrowth / weightedSum.totalWeight,
    avgCompensation: weightedSum.avgCompensation / weightedSum.totalWeight,
    avgManagement: weightedSum.avgManagement / weightedSum.totalWeight,
    sampleSize: weightedSum.totalWeight
  }
}