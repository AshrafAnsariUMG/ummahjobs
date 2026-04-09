'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { AuthResponse } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [legacyMessage, setLegacyMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setLegacyMessage(null)

    try {
      const data: AuthResponse = await api.post('/api/auth/login', { email, password })
      login(data.token, data.user)
      const role = data.user.role
      if (role === 'admin') router.push('/admin')
      else if (role === 'employer') router.push('/employer/dashboard')
      else router.push('/candidate/dashboard')
    } catch (err: unknown) {
      const e = err as { status?: number; error?: string; message?: string }
      if (e.error === 'legacy_password') {
        setLegacyMessage(e.message ?? "We've upgraded our platform. Check your email for a reset link.")
      } else {
        setError(e.message ?? 'Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold" style={{ color: '#033BB0' }}>UmmahJobs</h1>
        <p className="mt-2 text-sm text-gray-500">
          Connecting Muslim professionals with halal opportunities
        </p>
      </div>

      {legacyMessage && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-medium mb-1">We&apos;ve upgraded our platform.</p>
          <p>{legacyMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#033BB0] focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-[#033BB0]">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#033BB0] focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-medium text-white transition-opacity disabled:opacity-70"
          style={{ backgroundColor: '#033BB0' }}
        >
          {isLoading && (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {isLoading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        disabled
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 px-4 text-sm text-gray-400 cursor-not-allowed"
      >
        Continue with UmmahPass
        <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">coming soon</span>
      </button>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium hover:underline" style={{ color: '#033BB0' }}>
          Register here
        </Link>
      </p>
    </div>
  )
}
