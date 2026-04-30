'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { AuthResponse } from '@/types'

type Role = 'candidate' | 'employer'
type FieldErrors = Record<string, string[]>

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
  fontWeight: '500',
  color: '#374151',
  marginBottom: '6px',
  display: 'block',
}

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
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [focused, setFocused] = useState<string | null>(null)

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
      if (selectedRole === 'candidate') {
        new Image().src = 'https://analytics.ummahmediagroup.com/matomo.php?idsite=3&rec=1&idgoal=1'
      }
      router.push(selectedRole === 'employer' ? '/employer/dashboard' : '/candidate/dashboard')
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string; errors?: FieldErrors }
      if (e.errors) setFieldErrors(e.errors)
      else setError(e.message ?? 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isEmployer = selectedRole === 'employer'
  const roleColor = isEmployer ? '#0FBB0F' : '#033BB0'
  const roleBg = isEmployer ? '#F0FFF0' : '#EFF6FF'

  // ── Step 1: Role selection ──
  if (step === 1) {
    return (
      <>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            How will you use UmmahJobs?
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Candidate card */}
          <RoleCard
            onClick={() => selectRole('candidate')}
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

          {/* Employer card */}
          <RoleCard
            onClick={() => selectRole('employer')}
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

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6B7280' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#033BB0', fontWeight: '500', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Sign in →
          </a>
        </p>
      </>
    )
  }

  // ── Step 2: Form ──
  return (
    <>
      <button
        onClick={() => setStep(1)}
        style={{ color: '#6B7280', fontSize: '13px', marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
      >
        ← Back
      </button>

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827' }}>
          Create your account
        </h1>
        <span style={{
          fontSize: '12px',
          padding: '2px 10px',
          borderRadius: '20px',
          background: roleBg,
          color: roleColor,
          fontWeight: '500',
        }}>
          {isEmployer ? 'Employer' : 'Candidate'}
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Name */}
        <div>
          <label htmlFor="name" style={labelStyle}>Full name</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
            style={inputStyle(focused === 'name')}
          />
          {fieldErrors.name && <p style={{ marginTop: '4px', fontSize: '12px', color: '#DC2626' }}>{fieldErrors.name[0]}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" style={labelStyle}>Email address</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            style={inputStyle(focused === 'email')}
          />
          {fieldErrors.email && <p style={{ marginTop: '4px', fontSize: '12px', color: '#DC2626' }}>{fieldErrors.email[0]}</p>}
        </div>

        {/* Company name (employer only) */}
        {isEmployer && (
          <div>
            <label htmlFor="company_name" style={labelStyle}>Company name</label>
            <input
              id="company_name"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onFocus={() => setFocused('company_name')}
              onBlur={() => setFocused(null)}
              style={inputStyle(focused === 'company_name')}
            />
            {fieldErrors.company_name && <p style={{ marginTop: '4px', fontSize: '12px', color: '#DC2626' }}>{fieldErrors.company_name[0]}</p>}
          </div>
        )}

        {/* Password */}
        <div>
          <label htmlFor="password" style={labelStyle}>Password</label>
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
              style={{ ...inputStyle(focused === 'password'), paddingRight: '44px' }}
            />
            <EyeButton show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </div>
          {fieldErrors.password && <p style={{ marginTop: '4px', fontSize: '12px', color: '#DC2626' }}>{fieldErrors.password[0]}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="password_confirmation" style={labelStyle}>Confirm password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password_confirmation"
              type={showPasswordConfirm ? 'text' : 'password'}
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              onFocus={() => setFocused('password_confirmation')}
              onBlur={() => setFocused(null)}
              style={{ ...inputStyle(focused === 'password_confirmation'), paddingRight: '44px' }}
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
            background: roleColor,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: isLoading ? 0.8 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {isLoading && (
            <svg className="animate-spin" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {isLoading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6B7280' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: '#033BB0', fontWeight: '500', textDecoration: 'none' }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          Sign in →
        </a>
      </p>
    </>
  )
}

function RoleCard({
  onClick,
  icon,
  title,
  description,
  hoverBorder,
  hoverBg,
}: {
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
  hoverBorder: string
  hoverBg: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        border: `2px solid ${hovered ? hoverBorder : '#E5E7EB'}`,
        borderRadius: '12px',
        padding: '20px 16px',
        cursor: 'pointer',
        textAlign: 'center',
        background: hovered ? hoverBg : 'white',
        transition: 'border-color 0.15s, background 0.15s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {icon}
      <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{title}</p>
      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{description}</p>
    </button>
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
