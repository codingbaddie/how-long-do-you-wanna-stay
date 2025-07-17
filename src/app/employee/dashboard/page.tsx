'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import EmployeeDataForm from '@/components/EmployeeDataForm'

export default function EmployeeDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employeeData, setEmployeeData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session as any).user?.role !== 'EMPLOYEE') {
      router.push('/auth/signin?role=employee')
      return
    }

    fetchEmployeeData()
  }, [session, status, router])

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch('/api/employee/data')
      if (response.ok) {
        const data = await response.json()
        setEmployeeData(data.data)
      }
    } catch (error) {
      console.error('Error fetching employee data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDataSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/employee/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setEmployeeData(result.data)
        return { success: true, message: 'Data saved successfully' }
      } else {
        const error = await response.json()
        return { success: false, message: error.error || 'Failed to save data' }
      }
    } catch (error) {
      return { success: false, message: 'An error occurred while saving data' }
    }
  }

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || (session as any).user?.role !== 'EMPLOYEE') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
              <p className="text-gray-600">Welcome, {(session as any).user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Share Your Retention Insights
            </h2>
            <p className="text-gray-600">
              Your responses are completely anonymous and will only be used to generate aggregated insights. 
              This data helps improve workplace conditions across the industry.
            </p>
          </div>

          <EmployeeDataForm 
            initialData={employeeData} 
            onSubmit={handleDataSubmit}
          />
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Privacy & Security</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="ml-3">Your individual responses are never shared with employers</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="ml-3">Data is aggregated with at least 5 responses before being made available</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="ml-3">All data is encrypted and securely stored</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}