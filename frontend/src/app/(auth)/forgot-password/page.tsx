'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
    } catch {
      // Always show success — don't reveal if email exists
    } finally {
      setIsLoading(false)
      setSubmitted(true)
    }
  }

  if (submitted) {
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
          Check your inbox
        </h2>
        <p style={{ color: '#166534', fontSize: '14px', lineHeight: '1.6' }}>
          If that email exists we&apos;ve sent a reset link. Check your inbox and spam folder.
        </p>
        <a
          href="/login"
          style={{ display: 'inline-block', marginTop: '16px', color: '#033BB0', fontSize: '14px', textDecoration: 'none' }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          ← Back to login
        </a>
      </div>
    )
  }

  return (
    <>
      <a
        href="/login"
        style={{ display: 'block', color: '#6B7280', fontSize: '13px', marginBottom: '28px', textDecoration: 'none' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
      >
        ← Back to login
      </a>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
          Reset your password
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="you@example.com"
            style={{
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
            }}
          />
        </div>

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
          {isLoading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
    </>
  )
}
