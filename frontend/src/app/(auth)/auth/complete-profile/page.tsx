'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { User } from '@/types'

type Role = 'candidate' | 'employer'

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

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '6px',
  display: 'block',
}

export default function CompleteProfilePage() {
  const router = useRouter()
  const { user, role, isLoading, isAuthenticated, updateUser } = useAuth()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace('/login')
    } else if (role) {
      // Role already set — bounce to their dashboard.
      if (role === 'admin') router.replace('/admin')
      else if (role === 'employer') router.replace('/employer')
      else router.replace('/candidate')
    }
  }, [isLoading, isAuthenticated, role, router])

  function selectRole(next: Role) {
    setSelectedRole(next)
    if (next === 'employer') {
      setStep(2)
    } else {
      void submit('candidate')
    }
  }

  async function submit(roleArg: Role) {
    if (roleArg === 'employer' && !companyName.trim()) {
      setError('Please enter your company name.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const data = await api.post('/api/auth/complete-profile', {
        role: roleArg,
        ...(roleArg === 'employer' ? { company_name: companyName.trim() } : {}),
      }) as { user: User; role: Role }
      updateUser(data.user)
      router.replace(roleArg === 'employer' ? '/employer' : '/candidate')
    } catch (err) {
      const e = err as { message?: string }
      setError(e.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (isLoading || !isAuthenticated || role) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid #E5E7EB',
            borderTopColor: '#033BB0',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (step === 1) {
    return (
      <>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            Welcome{user?.display_name ? `, ${user.display_name.split(' ')[0]}` : ''}!
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            One last step — how will you use UmmahJobs?
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

        <div style={{ display: 'flex', gap: '12px' }}>
          <RoleCard
            onClick={() => selectRole('candidate')}
            disabled={submitting}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#033BB0" strokeWidth={1.5} width={32} height={32}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            }
            title="I'm looking for work"
            description="Find halal jobs and opportunities"
            hoverBorder="#033BB0"
            hoverBg="#EFF6FF"
          />
          <RoleCard
            onClick={() => selectRole('employer')}
            disabled={submitting}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#0FBB0F" strokeWidth={1.5} width={32} height={32}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            }
            title="I'm hiring"
            description="Post jobs and find Muslim talent"
            hoverBorder="#0FBB0F"
            hoverBg="#F0FFF0"
          />
        </div>
      </>
    )
  }

  // Step 2 — employer: capture company name
  const roleColor = '#0FBB0F'
  return (
    <>
      <button
        type="button"
        onClick={() => { setStep(1); setSelectedRole(null); setError(null) }}
        style={{ color: '#6B7280', fontSize: '13px', marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
      >
        ← Back
      </button>

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827' }}>
          Tell us about your company
        </h1>
        <span style={{
          fontSize: '12px',
          padding: '2px 10px',
          borderRadius: '20px',
          background: '#F0FFF0',
          color: roleColor,
          fontWeight: 500,
        }}>
          Employer
        </span>
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

      <form
        onSubmit={(e) => { e.preventDefault(); void submit('employer') }}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <div>
          <label htmlFor="company_name" style={labelStyle}>Company name</label>
          <input
            id="company_name"
            type="text"
            required
            autoFocus
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onFocus={() => setFocused('company_name')}
            onBlur={() => setFocused(null)}
            style={inputStyle(focused === 'company_name')}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            height: '44px',
            background: roleColor,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            marginTop: '4px',
            opacity: submitting ? 0.8 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {submitting ? 'Setting up your account…' : 'Finish Setup'}
        </button>
      </form>
    </>
  )
}

function RoleCard({
  onClick, disabled, icon, title, description, hoverBorder, hoverBg,
}: {
  onClick: () => void
  disabled?: boolean
  icon: React.ReactNode
  title: string
  description: string
  hoverBorder: string
  hoverBg: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: '20px 16px',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        background: 'white',
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.15s',
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        e.currentTarget.style.borderColor = hoverBorder
        e.currentTarget.style.background = hoverBg
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB'
        e.currentTarget.style.background = 'white'
      }}
    >
      {icon}
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#6B7280' }}>{description}</div>
    </button>
  )
}
