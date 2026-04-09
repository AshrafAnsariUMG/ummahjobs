'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AdminPage() {
  const { user, role, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (role && role !== 'admin') {
      router.replace('/login')
    }
  }, [role, router])

  if (role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold" style={{ color: '#033BB0' }}>UmmahJobs Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.display_name}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h2>
        <p className="text-sm text-gray-500">Admin tools — coming soon.</p>
      </main>
    </div>
  )
}
