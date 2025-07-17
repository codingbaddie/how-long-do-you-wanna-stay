import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const employeeData = await prisma.employeeData.upsert({
      where: { userId: session.user.id },
      update: {
        companyName: data.companyName,
        companySize: data.companySize,
        industry: data.industry,
        department: data.department,
        position: data.position,
        yearsAtCompany: data.yearsAtCompany,
        intendedStayDuration: data.intendedStayDuration,
        satisfactionScore: data.satisfactionScore,
        workLifeBalance: data.workLifeBalance,
        careerGrowth: data.careerGrowth,
        compensation: data.compensation,
        management: data.management,
        reasonsToLeave: JSON.stringify(data.reasonsToLeave),
        reasonsToStay: JSON.stringify(data.reasonsToStay)
      },
      create: {
        userId: session.user.id,
        companyName: data.companyName,
        companySize: data.companySize,
        industry: data.industry,
        department: data.department,
        position: data.position,
        yearsAtCompany: data.yearsAtCompany,
        intendedStayDuration: data.intendedStayDuration,
        satisfactionScore: data.satisfactionScore,
        workLifeBalance: data.workLifeBalance,
        careerGrowth: data.careerGrowth,
        compensation: data.compensation,
        management: data.management,
        reasonsToLeave: JSON.stringify(data.reasonsToLeave),
        reasonsToStay: JSON.stringify(data.reasonsToStay)
      }
    })

    // Trigger insights recalculation
    await updateRetentionInsights(data.companyName, data.industry, data.companySize, data.department)

    return NextResponse.json({ message: 'Data saved successfully', data: employeeData }, { status: 200 })
  } catch (error) {
    console.error('Employee data save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employeeData = await prisma.employeeData.findUnique({
      where: { userId: session.user.id }
    })

    if (employeeData) {
      employeeData.reasonsToLeave = JSON.parse(employeeData.reasonsToLeave)
      employeeData.reasonsToStay = JSON.parse(employeeData.reasonsToStay)
    }

    return NextResponse.json({ data: employeeData }, { status: 200 })
  } catch (error) {
    console.error('Employee data fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateRetentionInsights(companyName: string, industry: string, companySize: string, department?: string) {
  const employeeData = await prisma.employeeData.findMany({
    where: {
      companyName,
      industry,
      companySize,
      ...(department && { department })
    }
  })

  if (employeeData.length === 0) return

  const avgIntendedStayDuration = calculateAvgStayDuration(employeeData)
  const avgSatisfactionScore = average(employeeData.map(e => e.satisfactionScore))
  const avgWorkLifeBalance = average(employeeData.map(e => e.workLifeBalance))
  const avgCareerGrowth = average(employeeData.map(e => e.careerGrowth))
  const avgCompensation = average(employeeData.map(e => e.compensation))
  const avgManagement = average(employeeData.map(e => e.management))

  const riskCounts = calculateRiskCounts(employeeData)
  const topReasonsToLeave = JSON.stringify(getMostCommonReasons(employeeData.map(e => JSON.parse(e.reasonsToLeave))))
  const topReasonsToStay = JSON.stringify(getMostCommonReasons(employeeData.map(e => JSON.parse(e.reasonsToStay))))

  await prisma.retentionInsights.upsert({
    where: {
      companyName_industry_companySize_department: {
        companyName,
        industry,
        companySize,
        department: department || null
      }
    },
    update: {
      avgIntendedStayDuration,
      avgSatisfactionScore,
      avgWorkLifeBalance,
      avgCareerGrowth,
      avgCompensation,
      avgManagement,
      highRiskCount: riskCounts.high,
      mediumRiskCount: riskCounts.medium,
      lowRiskCount: riskCounts.low,
      sampleSize: employeeData.length,
      topReasonsToLeave,
      topReasonsToStay
    },
    create: {
      companyName,
      industry,
      companySize,
      department,
      avgIntendedStayDuration,
      avgSatisfactionScore,
      avgWorkLifeBalance,
      avgCareerGrowth,
      avgCompensation,
      avgManagement,
      highRiskCount: riskCounts.high,
      mediumRiskCount: riskCounts.medium,
      lowRiskCount: riskCounts.low,
      sampleSize: employeeData.length,
      topReasonsToLeave,
      topReasonsToStay
    }
  })
}

function calculateAvgStayDuration(data: { intendedStayDuration: string }[]): number {
  const durationMap = {
    'less_than_6_months': 0.25,
    '6_months_to_1_year': 0.75,
    '1_to_2_years': 1.5,
    '2_to_5_years': 3.5,
    'more_than_5_years': 7
  }
  
  const total = data.reduce((sum, emp) => sum + (durationMap[emp.intendedStayDuration] || 0), 0)
  return total / data.length
}

function average(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}

function calculateRiskCounts(data: { intendedStayDuration: string }[]): { high: number; medium: number; low: number } {
  return data.reduce((counts, emp) => {
    if (emp.intendedStayDuration === 'less_than_6_months') counts.high++
    else if (emp.intendedStayDuration === '6_months_to_1_year') counts.medium++
    else counts.low++
    return counts
  }, { high: 0, medium: 0, low: 0 })
}

function getMostCommonReasons(reasonsArray: string[][]): string[] {
  const reasonCounts = new Map<string, number>()
  
  reasonsArray.forEach(reasons => {
    reasons.forEach(reason => {
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1)
    })
  })
  
  return Array.from(reasonCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason]) => reason)
}