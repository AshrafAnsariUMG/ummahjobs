'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { SavedJob } from '@/types'
import { timeAgo } from '@/lib/timeAgo'

interface SavedJobsPage {
  total: number
  data: SavedJob[]
}

type SortOrder = 'newest' | 'oldest'

function LogoFallback({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white"
      style={{ backgroundColor: '#033BB0' }}
    >
      {initials}
    </div>
  )
}

export default function CandidateSavedJobsPage() {
  const { showToast } = useToast()
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortOrder>('newest')
  const [removing, setRemoving] = useState<number | null>(null)

  useEffect(() => {
    api.get('/api/candidate/saved-jobs')
      .then((res: SavedJobsPage) => {
        setSavedJobs(res.data)
        setTotal(res.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleRemove(jobId: number, savedId: number) {
    setRemoving(savedId)
    // Optimistic removal
    setSavedJobs((prev) => prev.filter((s) => s.id !== savedId))
    setTotal((t) => t - 1)
    try {
      await api.delete(`/api/candidate/saved-jobs/${jobId}`)
      showToast('Removed from saved jobs.', 'success')
    } catch {
      // Revert on failure — refetch
      api.get('/api/candidate/saved-jobs')
        .then((res: SavedJobsPage) => { setSavedJobs(res.data); setTotal(res.total) })
        .catch(() => {})
      showToast('Failed to remove job.', 'error')
    } finally {
      setRemoving(null)
    }
  }

  const sorted = [...savedJobs].sort((a, b) => {
    const ta = new Date(a.saved_at).getTime()
    const tb = new Date(b.saved_at).getTime()
    return sort === 'newest' ? tb - ta : ta - tb
  })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Saved Jobs</h1>
        <p className="text-sm text-gray-400 mt-1">
          {loading ? 'Loading…' : `${total} saved job${total !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Sort bar */}
      {!loading && savedJobs.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-gray-500">Sort:</span>
          {(['newest', 'oldest'] as SortOrder[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                sort === s
                  ? 'text-white border-transparent'
                  : 'text-gray-600 border-gray-200 hover:border-blue-200'
              }`}
              style={sort === s ? { backgroundColor: '#033BB0' } : undefined}
            >
              {s === 'newest' ? 'Saved recently' : 'Oldest first'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-white rounded-xl border border-gray-200" />)}
        </div>
      ) : sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map((saved) => {
            const job = saved.job
            if (!job) return null
            return (
              <div
                key={saved.id}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all"
              >
                {/* Logo */}
                <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 bg-gray-50">
                  {job.employer?.logo_path ? (
                    <img src={job.employer.logo_path} alt={job.employer.company_name} className="w-full h-full object-contain" />
                  ) : (
                    <LogoFallback name={job.employer?.company_name ?? 'J'} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="font-semibold text-sm text-gray-900 hover:underline truncate block"
                    style={{ color: '#033BB0' }}
                  >
                    {job.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {job.employer?.company_name}
                    {job.location && <span className="text-gray-400"> · {job.location}</span>}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {job.job_type && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {job.job_type}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">Saved {timeAgo(saved.saved_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#033BB0' }}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleRemove(job.id, saved.id)}
                    disabled={removing === saved.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Remove from saved"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E6EDFF' }}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h2 className="font-semibold text-gray-900 mb-2">No saved jobs yet</h2>
          <p className="text-sm text-gray-500 mb-6">Save jobs while browsing to review them later.</p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#033BB0' }}
          >
            Browse Jobs →
          </Link>
        </div>
      )}
    </div>
  )
}
