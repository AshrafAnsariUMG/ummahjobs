'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { AuthResponse } from '@/types'

const inputStyle = (focused: boolean): React.CSSProperties => ({
  width: '100%',
  height: '44px',
  border: focused ? '1px solid #033BB0' : '1px solid #D1D5DB',
  borderRadius: '8px',
  padding: '0 12px',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxShadow: focused ? '0 0 0 3px rgba(3,59,176,0.1)' : 'none',
  background: 'transparent',
  color: '#111827',
})

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [legacyMessage, setLegacyMessage] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)

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
    <>
      {/* Heading */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          Sign in to your UmmahJobs account
        </p>
      </div>

      {/* Legacy password info */}
      {legacyMessage && (
        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#1E40AF',
          fontSize: '14px',
          marginBottom: '16px',
        }}>
          <p style={{ fontWeight: '600', marginBottom: '4px' }}>Platform upgrade</p>
          <p>{legacyMessage}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#DC2626',
          fontSize: '14px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Email */}
        <div>
          <label htmlFor="email" style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            placeholder="you@example.com"
            style={inputStyle(focused === 'email')}
          />
        </div>

        {/* Password */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label htmlFor="password" style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Password
            </label>
            <a href="/forgot-password" style={{ fontSize: '13px', color: '#033BB0', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Forgot password?
            </a>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              placeholder="••••••••"
              style={{ ...inputStyle(focused === 'password'), paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9CA3AF',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#374151')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            height: '44px',
            background: isLoading ? '#0256CC' : '#033BB0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.15s',
            opacity: isLoading ? 0.8 : 1,
          }}
          onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#0256CC' }}
          onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = '#033BB0' }}
        >
          {isLoading && (
            <svg className="animate-spin" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {isLoading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        <span style={{ color: '#9CA3AF', fontSize: '13px' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
      </div>

      {/* UmmahPass button */}
      <button
        disabled
        style={{
          width: '100%',
          height: '44px',
          border: '1px solid #D1D5DB',
          borderRadius: '8px',
          background: 'white',
          color: '#9CA3AF',
          fontSize: '15px',
          cursor: 'not-allowed',
          opacity: 0.65,
        }}
      >
        Continue with UmmahPass (coming soon)
      </button>

      {/* Bottom link */}
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6B7280' }}>
        Don&apos;t have an account?{' '}
        <a href="/register" style={{ color: '#033BB0', fontWeight: '500', textDecoration: 'none' }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          Create one free →
        </a>
      </p>
    </>
  )
}
