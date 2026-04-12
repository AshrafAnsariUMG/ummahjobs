'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { EmployerApplicant } from '@/types'
import { timeAgo } from '@/lib/timeAgo'

interface ApplicantsResponse {
  data: EmployerApplicant[]
  total: number
}

type StatusFilter = 'all' | 'applied' | 'viewed' | 'shortlisted' | 'offer'

const STATUS_STEPS = ['applied', 'viewed', 'shortlisted', 'offer'] as const

const STATUS_STYLES: Record<string, string> = {
  applied:     'bg-blue-100 text-blue-700',
  viewed:      'bg-amber-100 text-amber-700',
  shortlisted: 'bg-green-100 text-green-700',
  offer:       'bg-purple-100 text-purple-700',
}

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied', viewed: 'Viewed', shortlisted: 'Shortlisted', offer: 'Offer',
}

function ApplicantCard({
  app,
  onStatusChange,
}: {
  app: EmployerApplicant
  onStatusChange: (id: number, status: EmployerApplicant['status']) => void
}) {
  const { showToast } = useToast()
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const candidate = app.candidate
  const name = candidate?.user?.display_name ?? 'Unknown Candidate'
  const email = candidate?.user?.email ?? ''
  const photo = candidate?.profile_photo_path ?? null
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  async function handleStatusChange(newStatus: EmployerApplicant['status']) {
    if (newStatus === app.status) return
    setUpdating(true)
    onStatusChange(app.id, newStatus) // optimistic
    try {
      await api.put(`/api/employer/applicants/${app.id}/status`, { status: newStatus })
      showToast(`Status updated to ${STATUS_LABELS[newStatus]}.`, 'success')
    } catch {
      onStatusChange(app.id, app.status) // revert
      showToast('Failed to update status.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {photo ? (
            <img src={photo} alt={name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: '#033BB0' }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900">{name}</p>
              {email && <p className="text-xs text-gray-500 truncate">{email}</p>}
              <p className="text-xs text-gray-400 mt-0.5">Applied {timeAgo(app.applied_at)}</p>
            </div>

            {/* Right side: status badge + dropdown */}
            <div className="flex items-center gap-3 shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[app.status] ?? app.status}
              </span>

              <select
                value={app.status}
                onChange={(e) => handleStatusChange(e.target.value as EmployerApplicant['status'])}
                disabled={updating}
                className="text-xs rounded-lg border border-gray-300 bg-white px-2 py-1.5 focus:outline-none disabled:opacity-60 cursor-pointer"
              >
                {STATUS_STEPS.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>

              <button
                disabled
                title="Candidate public profiles coming soon"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-400 cursor-not-allowed"
              >
                View Profile
              </button>

              {app.candidate?.user?.id && (
                <button
                  onClick={() => router.push(`/employer/messages?compose=${app.candidate!.user!.id}`)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-blue-50"
                  style={{ color: '#033BB0', borderColor: '#033BB0' }}
                >
                  Message
                </button>
              )}
            </div>
          </div>

          {/* Cover letter */}
          {app.cover_letter && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs font-medium hover:underline"
                style={{ color: '#033BB0' }}
              >
                {expanded ? 'Hide' : 'Show'} cover letter
              </button>
              {expanded && (
                <p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                  {app.cover_letter}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ApplicantsContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const jobId = params.id as string
  const jobTitle = searchParams.get('title') ?? `Job #${jobId}`

  const [applicants, setApplicants] = useState<EmployerApplicant[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [jobSlug, setJobSlug] = useState<string | null>(null)

  useEffect(() => {
    api.get(`/api/employer/applicants?job_id=${jobId}`)
      .then((res: ApplicantsResponse) => {
        setApplicants(res.data)
        setTotal(res.total)
        if (res.data[0]?.job?.slug) setJobSlug(res.data[0].job.slug)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [jobId])

  function handleStatusChange(id: number, status: EmployerApplicant['status']) {
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }

  const counts = STATUS_STEPS.reduce((acc, s) => {
    acc[s] = applicants.filter((a) => a.status === s).length
    return acc
  }, {} as Record<string, number>)

  const filtered = filter === 'all' ? applicants : applicants.filter((a) => a.status === filter)

  const TABS: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: `All (${total})` },
    { key: 'applied', label: `Applied (${counts.applied ?? 0})` },
    { key: 'viewed', label: `Viewed (${counts.viewed ?? 0})` },
    { key: 'shortlisted', label: `Shortlisted (${counts.shortlisted ?? 0})` },
    { key: 'offer', label: `Offer (${counts.offer ?? 0})` },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/employer/jobs"
          className="text-xs font-medium text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-3"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          My Listings
        </Link>
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-gray-900 truncate">{jobTitle}</h1>
            <p className="text-sm text-gray-400 mt-1">Applicant Management</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: '#033BB0' }}
            >
              {total} applicant{total !== 1 ? 's' : ''}
            </span>
            {jobSlug && (
              <a
                href={`/jobs/${jobSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700"
              >
                View Listing ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Status pipeline summary */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {STATUS_STEPS.map((step, idx) => (
            <div key={step} className="relative">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-extrabold text-gray-900">{counts[step] ?? 0}</p>
                <p className={`text-xs font-medium mt-1 ${STATUS_STYLES[step]?.split(' ')[1] ?? 'text-gray-600'}`}>
                  {STATUS_LABELS[step]}
                </p>
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 z-10 text-gray-300 text-sm font-bold">→</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto mb-5 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'border-transparent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={filter === tab.key ? { borderColor: '#033BB0', color: '#033BB0' } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applicants list */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map((i) => <div key={i} className="h-24 bg-white rounded-xl border border-gray-200" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((app) => (
            <ApplicantCard key={app.id} app={app} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E6EDFF' }}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No applicants yet for this listing' : `No ${filter} applicants`}
          </h2>
          {filter === 'all' && (
            <>
              <p className="text-sm text-gray-500 mb-5">Share your job listing to attract candidates.</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {jobSlug && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/jobs/${jobSlug}`)
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:border-gray-300 text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </button>
                )}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/jobs/${jobSlug}` : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Share on LinkedIn
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function EmployerJobApplicantsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="grid grid-cols-4 gap-3">
            {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-white rounded-xl border border-gray-200" />)}
          </div>
        </div>
      }
    >
      <ApplicantsContent />
    </Suspense>
  )
}
