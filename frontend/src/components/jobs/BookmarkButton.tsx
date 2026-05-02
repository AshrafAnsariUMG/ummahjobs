'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/Toast'

const API = process.env.NEXT_PUBLIC_API_URL

export default function BookmarkButton({
  jobId,
  initialSaved = false,
}: {
  jobId: number
  initialSaved?: boolean
}) {
  const { isAuthenticated, token } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  // Load real saved state from backend once auth is known
  useEffect(() => {
    if (!isAuthenticated || !token) return
    fetch(`${API}/api/candidate/saved-jobs/check/${jobId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then((r) => r.json())
      .then((d: { saved: boolean }) => setSaved(d.saved))
      .catch(() => {})
  }, [jobId, isAuthenticated, token])

  async function toggle() {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const prev = saved
    setSaved(!prev) // optimistic
    setLoading(true)

    try {
      if (!prev) {
        const res = await fetch(`${API}/api/candidate/saved-jobs`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token!}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ job_id: jobId }),
        })
        if (!res.ok) throw new Error()
        showToast('JazakAllah Khayran! Job saved.', 'success')
      } else {
        const res = await fetch(`${API}/api/candidate/saved-jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token!}`,
            Accept: 'application/json',
          },
        })
        if (!res.ok) throw new Error()
        showToast('Bookmark removed.', 'info')
      }
    } catch {
      setSaved(prev) // roll back optimistic update
      showToast('Could not update saved jobs. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? 'Remove bookmark' : 'Save job'}
      className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50"
      style={saved ? { backgroundColor: '#E6EDFF', borderColor: '#033BB0' } : undefined}
    >
      <svg
        className="w-5 h-5"
        fill={saved ? '#033BB0' : 'none'}
        viewBox="0 0 24 24"
        stroke={saved ? '#033BB0' : 'currentColor'}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  )
}
