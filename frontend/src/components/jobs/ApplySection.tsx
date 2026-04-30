'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { DuaHandsIcon } from '@/components/ui/IslamicIcons'

interface Props {
  jobId: number
  applyType: string
  applyUrl: string | null
  isExternal?: boolean
  employerId?: string | null
}

type ApplyState = 'idle' | 'loading' | 'success' | 'duplicate' | 'error' | 'already_applied'

export default function ApplySection({ jobId, applyType, applyUrl, isExternal, employerId }: Props) {
  const { isAuthenticated, role, isLoading } = useAuth()
  const [applyState, setApplyState] = useState<ApplyState>('idle')
  const [coverLetter, setCoverLetter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [cvPath, setCvPath] = useState<string | null>(null)
  const [profilePct, setProfilePct] = useState<number>(0)
  const [noCvGate, setNoCvGate] = useState(false)

  // Fetch candidate profile + already-applied check in parallel
  useEffect(() => {
    if (isLoading || !isAuthenticated || role !== 'candidate' || applyType !== 'platform') return
    const token = typeof window !== 'undefined' ? localStorage.getItem('uj_token') : null
    if (!token) return
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate/applications/check/${jobId}`, { headers })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.applied) setApplyState('already_applied') })
      .catch(() => null)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate/profile`, { headers })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setCvPath(data.cv_path ?? null)
          setProfilePct(data.profile_complete_pct ?? 0)
        }
      })
      .catch(() => null)
  }, [isLoading, isAuthenticated, role, jobId, applyType])

  function handleApplyClick() {
    if (!cvPath) { setNoCvGate(true); return }
    setNoCvGate(false)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const token = typeof window !== 'undefined' ? localStorage.getItem('uj_token') : null
    if (!token) return
    setApplyState('loading')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate/applications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ job_id: jobId, cover_letter: coverLetter }),
      })
      if (res.status === 409 || res.status === 422) {
        const data = await res.json()
        if (data.error?.includes('already applied') || data.message?.includes('already applied')) {
          setApplyState('duplicate')
        } else {
          setApplyState('error')
        }
      } else if (res.ok) {
        setApplyState('success')
        // Matomo Goal 2 — Job Application (UMG site ID 3). Fires only on confirmed
        // backend success so abandoned/duplicate submissions don't pollute the funnel.
        if (typeof window !== 'undefined') {
          const w = window as Window & { _paq?: unknown[] }
          if (Array.isArray(w._paq)) {
            w._paq.push(['trackGoal', 2])
          }
        }
      } else {
        setApplyState('error')
      }
    } catch {
      setApplyState('error')
    }
  }

  // External employer jobs — always redirect externally, never allow platform submission
  if (isExternal || !employerId) {
    if (applyUrl) {
      return (
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            width: '100%',
            padding: '14px',
            background: '#033BB0',
            color: 'white',
            textAlign: 'center',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          Apply on Company Website →
        </a>
      )
    }
    return (
      <div style={{
        padding: '16px',
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#6B7280',
        fontSize: '14px',
      }}>
        Visit the company website to apply for this role.
      </div>
    )
  }

  // External apply — plain link, no auth needed
  if (applyType === 'external' && applyUrl) {
    return (
      <a
        href={applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center px-5 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#033BB0' }}
      >
        Apply Now →
      </a>
    )
  }

  // Platform apply — already applied state
  if (applyState === 'already_applied') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-green-800">You applied for this job</span>
        </div>
        <Link
          href="/candidate/applications"
          className="text-xs font-medium hover:underline"
          style={{ color: '#033BB0' }}
        >
          Track application →
        </Link>
      </div>
    )
  }

  // Platform apply — success state
  if (applyState === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-2 mb-3">
          <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-green-800">JazakAllah Khayran!</p>
              <span className="text-green-600"><DuaHandsIcon size={16} /></span>
            </div>
            <p className="text-xs text-green-700 mt-0.5">Your application has been submitted. May Allah bless your efforts and open the right doors for you.</p>
          </div>
        </div>
        <Link
          href="/candidate/applications"
          className="block w-full text-center px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: '#0FBB0F' }}
        >
          View My Applications
        </Link>
      </div>
    )
  }

  // Platform apply — duplicate state
  if (applyState === 'duplicate') {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">You have already applied for this job.</p>
        </div>
      </div>
    )
  }

  // Platform apply — not authenticated
  if (!isLoading && !isAuthenticated) {
    if (!showForm) {
      return (
        <button
          onClick={() => setShowForm(true)}
          className="block w-full text-center px-5 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#033BB0' }}
        >
          Apply Now →
        </button>
      )
    }
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-700 mb-3">Please log in to apply for this job.</p>
        <Link
          href="/login"
          className="inline-block px-5 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: '#033BB0' }}
        >
          Log in to apply
        </Link>
      </div>
    )
  }

  // Platform apply — authenticated but not candidate
  if (!isLoading && isAuthenticated && role !== 'candidate') {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-600">Only candidates can apply for jobs.</p>
      </div>
    )
  }

  // No CV gate
  if (noCvGate) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-2 mb-3">
          <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">CV required to apply</p>
            <p className="text-xs text-amber-700 mt-0.5">Please upload your CV before submitting an application. Employers need it to review your candidacy.</p>
          </div>
        </div>
        <Link
          href="/candidate/profile/edit"
          className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: '#033BB0' }}
        >
          Upload CV →
        </Link>
        <button
          onClick={() => setNoCvGate(false)}
          className="w-full text-center text-xs text-gray-500 hover:text-gray-700 mt-2"
        >
          Cancel
        </button>
      </div>
    )
  }

  // Platform apply — candidate, ready to apply
  if (!showForm) {
    return (
      <button
        onClick={handleApplyClick}
        className="block w-full text-center px-5 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#033BB0' }}
      >
        Apply Now →
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      {/* Profile completion nudge */}
      {profilePct < 70 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-700 truncate">Your profile is <strong>{profilePct}%</strong> complete — a fuller profile stands out to employers.</p>
          </div>
          <Link
            href="/candidate/profile/edit"
            className="text-xs font-semibold whitespace-nowrap hover:underline shrink-0"
            style={{ color: '#033BB0' }}
          >
            Complete →
          </Link>
        </div>
      )}

      <h4 className="text-sm font-semibold text-gray-900 mb-3">Apply for this position</h4>
      <form onSubmit={handleSubmit}>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Cover Letter <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="Tell the employer why you're a great fit..."
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:border-transparent"
          style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
          disabled={applyState === 'loading'}
        />
        <p className="text-xs text-gray-400 text-right mt-0.5 mb-3">{coverLetter.length}/2000</p>

        {applyState === 'error' && (
          <p className="text-xs text-red-600 mb-3">Something went wrong. Please try again.</p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={applyState === 'loading'}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#033BB0' }}
          >
            {applyState === 'loading' ? 'Submitting…' : 'Submit Application'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-3 py-2.5 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
