'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { AuthResponse } from '@/types'

type Role = 'candidate' | 'employer'
type FieldErrors = Record<string, string[]>

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [companyName, setCompanyName] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function selectRole(role: Role) {
    setSelectedRole(role)
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRole) return

    setIsLoading(true)
    setError(null)
    setFieldErrors({})

    try {
      const body: Record<string, string> = {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role: selectedRole,
      }
      if (selectedRole === 'employer') body.company_name = companyName

      const data: AuthResponse = await api.post('/api/auth/register', body)
      login(data.token, data.user)
      router.push(selectedRole === 'employer' ? '/employer/dashboard' : '/candidate/dashboard')
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string; errors?: FieldErrors }
      if (e.errors) setFieldErrors(e.errors)
      else setError(e.message ?? 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Join UmmahJobs</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Choose how you want to use the platform</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => selectRole('candidate')}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-200 p-6 text-center hover:border-[#033BB0] hover:bg-green-50 transition-colors"
          >
            <svg className="h-10 w-10 text-[#033BB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900 text-sm">I&apos;m looking for work</p>
              <p className="text-xs text-gray-500 mt-1">Find halal jobs and opportunities</p>
            </div>
          </button>

          <button
            onClick={() => selectRole('employer')}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-200 p-6 text-center hover:border-[#033BB0] hover:bg-green-50 transition-colors"
          >
            <svg className="h-10 w-10 text-[#033BB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900 text-sm">I&apos;m hiring</p>
              <p className="text-xs text-gray-500 mt-1">Post jobs and find Muslim talent</p>
            </div>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium hover:underline" style={{ color: '#033BB0' }}>
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <button
        onClick={() => setStep(1)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-5 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: '#033BB0' }}>
          {selectedRole === 'employer' ? 'Employer' : 'Candidate'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#033BB0] focus:border-transparent"
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name[0]}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#033BB0] focus:border-transparent"
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email[0]}</p>}
        </div>

        {selectedRole === 'employer' && (
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
            <input
              id="company_name"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#033BB0] focus:border-transparent"
            />
            {fieldErrors.company_name && <p className="mt-1 text-xs text-red-600">{fieldErrors.company_name[0]}</p>}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#033BB0] focus:border-transparent"
            placeholder="Min. 8 characters"
          />
          {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password[0]}</p>}
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
          <input
            id="password_confirmation"
            type="password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#033BB0] focus:border-transparent"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

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
          {isLoading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium hover:underline" style={{ color: '#033BB0' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
