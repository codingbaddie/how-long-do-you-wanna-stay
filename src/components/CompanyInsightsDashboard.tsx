'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface CompanyInsightsDashboardProps {
  companyData: {
    companyName: string
    industry: string
    companySize: string
  } | null
}

export default function CompanyInsightsDashboard({ companyData }: CompanyInsightsDashboardProps) {
  const [insights, setInsights] = useState<any[]>([])
  const [benchmarks, setBenchmarks] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')

  useEffect(() => {
    if (companyData) {
      fetchInsights()
    }
  }, [companyData, selectedDepartment, fetchInsights])

  const fetchInsights = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        companyName: companyData.companyName,
        industry: companyData.industry,
        companySize: companyData.companySize,
        ...(selectedDepartment && { department: selectedDepartment })
      })

      const response = await fetch(`/api/company/insights?${params}`)
      const data = await response.json()

      if (response.ok) {
        setInsights(data.insights || [])
        
        // Fetch industry benchmarks
        const benchmarkResponse = await fetch('/api/company/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: companyData.companyName,
            industry: companyData.industry,
            companySize: companyData.companySize,
            department: selectedDepartment
          })
        })

        if (benchmarkResponse.ok) {
          const benchmarkData = await benchmarkResponse.json()
          setBenchmarks(benchmarkData.benchmarks)
        }
      } else {
        setError(data.message || 'Failed to fetch insights')
      }
    } catch (error) {
      setError('An error occurred while fetching insights')
    } finally {
      setIsLoading(false)
    }
  }, [companyData, selectedDepartment])

  const handleDepartmentFilter = (department: string) => {
    setSelectedDepartment(department)
  }

  const getAvailableDepartments = () => {
    const departments = new Set<string>()
    insights.forEach(insight => {
      if (insight.department) {
        departments.add(insight.department)
      }
    })
    return Array.from(departments)
  }

  const prepareChartData = () => {
    if (!insights.length) return []

    const insight = insights[0]
    return [
      { name: 'Satisfaction', value: insight.avgSatisfactionScore },
      { name: 'Work-Life Balance', value: insight.avgWorkLifeBalance },
      { name: 'Career Growth', value: insight.avgCareerGrowth },
      { name: 'Compensation', value: insight.avgCompensation },
      { name: 'Management', value: insight.avgManagement }
    ]
  }

  const prepareRiskData = () => {
    if (!insights.length) return []

    const insight = insights[0]
    const total = insight.highRiskCount + insight.mediumRiskCount + insight.lowRiskCount
    
    return [
      { name: 'High Risk', value: insight.highRiskCount, percentage: (insight.highRiskCount / total * 100).toFixed(1) },
      { name: 'Medium Risk', value: insight.mediumRiskCount, percentage: (insight.mediumRiskCount / total * 100).toFixed(1) },
      { name: 'Low Risk', value: insight.lowRiskCount, percentage: (insight.lowRiskCount / total * 100).toFixed(1) }
    ]
  }

  const COLORS = ['#ef4444', '#f59e0b', '#22c55e']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">No Data Available</h3>
            <p className="mt-1 text-sm text-yellow-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const departments = getAvailableDepartments()
  const chartData = prepareChartData()
  const riskData = prepareRiskData()

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      {departments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Filter by Department</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDepartmentFilter('')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedDepartment === '' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Departments
            </button>
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => handleDepartmentFilter(dept)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  selectedDepartment === dept 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-500">Sample Size</h4>
            <p className="text-2xl font-bold text-gray-900">{insights[0].sampleSize}</p>
            <p className="text-sm text-gray-600">Employee responses</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-500">Average Stay Duration</h4>
            <p className="text-2xl font-bold text-gray-900">
              {insights[0].avgIntendedStayDuration.toFixed(1)} years
            </p>
            <p className="text-sm text-gray-600">Intended stay</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-500">Overall Satisfaction</h4>
            <p className="text-2xl font-bold text-gray-900">
              {insights[0].avgSatisfactionScore.toFixed(1)}/10
            </p>
            <p className="text-sm text-gray-600">Average score</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-500">High Risk</h4>
            <p className="text-2xl font-bold text-red-600">
              {riskData.length > 0 ? riskData[0].percentage : 0}%
            </p>
            <p className="text-sm text-gray-600">May leave within 6 months</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Satisfaction Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Satisfaction Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="value" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Retention Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Reasons */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Reasons to Leave</h3>
            <div className="space-y-2">
              {insights[0].topReasonsToLeave.map((reason: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-800">{reason}</span>
                  <span className="text-xs text-red-600">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Reasons to Stay</h3>
            <div className="space-y-2">
              {insights[0].topReasonsToStay.map((reason: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-green-800">{reason}</span>
                  <span className="text-xs text-green-600">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Industry Benchmarks */}
      {benchmarks && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Industry Benchmarks</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Industry Average Stay</p>
              <p className="text-xl font-bold text-gray-900">
                {benchmarks.avgIntendedStayDuration.toFixed(1)} years
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Industry Satisfaction</p>
              <p className="text-xl font-bold text-gray-900">
                {benchmarks.avgSatisfactionScore.toFixed(1)}/10
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Benchmark Sample Size</p>
              <p className="text-xl font-bold text-gray-900">
                {benchmarks.sampleSize} responses
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Data Privacy & Ethics</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3">All data shown is aggregated and anonymous - no individual responses are identifiable</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3">Data is only shown when there are at least 5 employee responses for statistical reliability</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3">Use these insights to improve workplace conditions and employee satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  )
}