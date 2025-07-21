'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to takeoffs dashboard as the main page
    router.push('/takeoffs')
  }, [router])

  // Show a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 bg-white rounded animate-pulse"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Planza...</h2>
        <p className="text-gray-600">Setting up your construction takeoff platform</p>
      </div>
    </div>
  )
} 