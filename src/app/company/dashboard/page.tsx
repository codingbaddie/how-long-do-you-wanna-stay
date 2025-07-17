'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CompanyInsightsDashboard from '@/components/CompanyInsightsDashboard'

export default function CompanyDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companyData, setCompanyData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'COMPANY') {
      router.push('/auth/signin?role=company')
      return
    }

    setCompanyData(session.user.companyData)
    setIsLoading(false)
  }, [session, status, router])

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'COMPANY') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
              <p className="text-gray-600">Welcome, {session.user.email}</p>
              {companyData && (
                <p className="text-sm text-gray-500">
                  {companyData.companyName} • {companyData.industry}
                </p>
              )}
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
        <CompanyInsightsDashboard companyData={companyData} />
      </div>
    </div>
  )
}