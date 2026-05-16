'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import type { User } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const token = searchParams.get('token')
    if (!token) {
      setError('Sign-in failed. Please try again.')
      return
    }

    // Persist token first so api.ts picks it up via localStorage.
    localStorage.setItem('uj_token', token)

    fetch(`${API}/api/auth/me`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load profile')
        return res.json()
      })
      .then((data: { user: User }) => {
        login(token, data.user)
        const role = data.user.role
        if (!role) router.replace('/auth/complete-profile')
        else if (role === 'admin') router.replace('/admin')
        else if (role === 'employer') router.replace('/employer')
        else router.replace('/candidate')
      })
      .catch(() => {
        localStorage.removeItem('uj_token')
        setError('Sign-in failed. Please try again.')
      })
  }, [searchParams, router, login])

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '40px 0' }}>
        <p style={{ color: '#DC2626', fontSize: '15px' }}>{error}</p>
        <a href="/login" style={{ color: '#033BB0', fontWeight: 500, textDecoration: 'none' }}>
          ← Back to login
        </a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '40px 0' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E5E7EB',
          borderTopColor: '#033BB0',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: '#6B7280', fontSize: '14px' }}>Signing you in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <AuthCallbackInner />
    </Suspense>
  )
}
