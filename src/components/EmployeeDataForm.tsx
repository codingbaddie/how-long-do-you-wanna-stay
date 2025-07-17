'use client'

import { useState, useEffect } from 'react'

interface EmployeeDataFormProps {
  initialData: any
  onSubmit: (data: any) => Promise<{ success: boolean; message: string }>
}

export default function EmployeeDataForm({ initialData, onSubmit }: EmployeeDataFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    companySize: 'SMALL_11_50',
    industry: '',
    department: '',
    position: '',
    yearsAtCompany: 1,
    intendedStayDuration: '',
    satisfactionScore: 5,
    workLifeBalance: 5,
    careerGrowth: 5,
    compensation: 5,
    management: 5,
    reasonsToLeave: [] as string[],
    reasonsToStay: [] as string[]
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const companySizes = [
    { value: 'STARTUP_1_10', label: '1-10 employees' },
    { value: 'SMALL_11_50', label: '11-50 employees' },
    { value: 'MEDIUM_51_200', label: '51-200 employees' },
    { value: 'LARGE_201_1000', label: '201-1000 employees' },
    { value: 'ENTERPRISE_1000_PLUS', label: '1000+ employees' }
  ]

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Transportation', 'Government', 'Non-profit',
    'Consulting', 'Media', 'Real Estate', 'Hospitality', 'Other'
  ]

  const stayDurations = [
    { value: 'less_than_6_months', label: 'Less than 6 months' },
    { value: '6_months_to_1_year', label: '6 months to 1 year' },
    { value: '1_to_2_years', label: '1 to 2 years' },
    { value: '2_to_5_years', label: '2 to 5 years' },
    { value: 'more_than_5_years', label: 'More than 5 years' }
  ]

  const reasonsToLeaveOptions = [
    'Better compensation elsewhere',
    'Limited career growth',
    'Poor work-life balance',
    'Ineffective management',
    'Company culture issues',
    'Lack of recognition',
    'Job insecurity',
    'Boring/unchallenging work',
    'Remote work restrictions',
    'Commute issues'
  ]

  const reasonsToStayOptions = [
    'Good compensation',
    'Great career opportunities',
    'Excellent work-life balance',
    'Supportive management',
    'Strong company culture',
    'Job security',
    'Interesting/challenging work',
    'Flexible work arrangements',
    'Good benefits',
    'Great colleagues'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsAtCompany' || name.includes('Score') || name.includes('Balance') || name.includes('Growth') || name.includes('compensation') || name.includes('management')
        ? parseInt(value) 
        : value
    }))
  }

  const handleCheckboxChange = (field: 'reasonsToLeave' | 'reasonsToStay', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const result = await onSubmit(formData)
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while saving your data'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Size
            </label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {companySizes.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years at Company
            </label>
            <input
              type="number"
              name="yearsAtCompany"
              value={formData.yearsAtCompany}
              onChange={handleInputChange}
              min="0"
              max="50"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Retention Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Retention Information</h3>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How long do you intend to stay at your current company?
          </label>
          <select
            name="intendedStayDuration"
            value={formData.intendedStayDuration}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select duration</option>
            {stayDurations.map(duration => (
              <option key={duration.value} value={duration.value}>{duration.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Satisfaction Scores */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Satisfaction Scores (1-10)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'satisfactionScore', label: 'Overall Job Satisfaction' },
            { name: 'workLifeBalance', label: 'Work-Life Balance' },
            { name: 'careerGrowth', label: 'Career Growth Opportunities' },
            { name: 'compensation', label: 'Compensation & Benefits' },
            { name: 'management', label: 'Management Quality' }
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
              </label>
              <input
                type="range"
                name={field.name}
                min="1"
                max="10"
                value={formData[field.name as keyof typeof formData] as number}
                onChange={handleInputChange}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1</span>
                <span className="font-medium">{formData[field.name as keyof typeof formData]}</span>
                <span>10</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reasons to Leave */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reasons You Might Leave</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reasonsToLeaveOptions.map(reason => (
            <label key={reason} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.reasonsToLeave.includes(reason)}
                onChange={() => handleCheckboxChange('reasonsToLeave', reason)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{reason}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reasons to Stay */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reasons You Might Stay</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reasonsToStayOptions.map(reason => (
            <label key={reason} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.reasonsToStay.includes(reason)}
                onChange={() => handleCheckboxChange('reasonsToStay', reason)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{reason}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Data'}
        </button>
      </div>
    </form>
  )
}