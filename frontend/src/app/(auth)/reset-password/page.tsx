'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

type FieldErrors = Record<string, string[]>

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(2)

  useEffect(() => {
    if (!success) return
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          router.push('/login')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [success, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setFieldErrors({})

    try {
      await api.post('/api/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string; errors?: FieldErrors }
      if (e.errors) setFieldErrors(e.errors)
      else setError(e.message ?? 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = (fieldName: string): React.CSSProperties => ({
    width: '100%',
    height: '44px',
    border: focused === fieldName ? '1px solid #033BB0' : '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '0 44px 0 12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: focused === fieldName ? '0 0 0 3px rgba(3,59,176,0.1)' : 'none',
    background: 'transparent',
    color: '#111827',
  })

  // Invalid token
  if (!token || !email) {
    return (
      <div style={{
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '12px',
        padding: '28px 24px',
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#DC2626', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          Invalid reset link
        </h2>
        <p style={{ color: '#DC2626', fontSize: '14px', marginBottom: '20px' }}>
          Please request a new password reset.
        </p>
        <a
          href="/forgot-password"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#033BB0',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
          }}
        >
          Request new link
        </a>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div style={{
        background: '#F0FFF0',
        border: '1px solid #BBF7D0',
        borderRadius: '12px',
        padding: '28px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#0FBB0F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} width={18} height={18}>
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{ color: '#166534', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          Password reset!
        </h2>
        <p style={{ color: '#166534', fontSize: '14px' }}>
          Redirecting you to login in {countdown}…
        </p>
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
          Set a new password
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          Choose a strong password
        </p>
      </div>

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
        {/* New password */}
        <div>
          <label htmlFor="password" style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
            New password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              placeholder="Min. 8 characters"
              style={inputStyle('password')}
            />
            <EyeButton show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </div>
          {fieldErrors.password && <p style={{ marginTop: '4px', fontSize: '12px', color: '#DC2626' }}>{fieldErrors.password[0]}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="password_confirmation" style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
            Confirm password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password_confirmation"
              type={showPasswordConfirm ? 'text' : 'password'}
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              onFocus={() => setFocused('password_confirmation')}
              onBlur={() => setFocused(null)}
              style={inputStyle('password_confirmation')}
            />
            <EyeButton show={showPasswordConfirm} onToggle={() => setShowPasswordConfirm((v) => !v)} />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            height: '44px',
            background: '#033BB0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: isLoading ? 0.8 : 1,
            transition: 'background 0.15s',
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
          {isLoading ? 'Saving…' : 'Reset Password'}
        </button>
      </form>
    </>
  )
}

function EyeButton({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: hovered ? '#374151' : '#9CA3AF',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.15s',
      }}
    >
      {show ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center' }}>Loading…</p>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
