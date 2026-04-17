'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { JobApplication } from '@/types'
import { timeAgo } from '@/lib/timeAgo'
import IslamicEmptyState from '@/components/ui/IslamicEmptyState'
import { BriefcaseIcon } from '@/components/ui/IslamicIcons'

interface ApplicationsPage {
  total: number
  data: JobApplication[]
}

type StatusFilter = 'all' | 'applied' | 'viewed' | 'shortlisted' | 'offer'

const STATUS_STEPS = ['applied', 'viewed', 'shortlisted', 'offer'] as const

const STATUS_STYLES: Record<string, { pill: string; label: string }> = {
  applied:     { pill: 'bg-blue-100 text-blue-700',   label: 'Applied' },
  viewed:      { pill: 'bg-amber-100 text-amber-700',  label: 'Viewed' },
  shortlisted: { pill: 'bg-green-100 text-green-700',  label: 'Shortlisted' },
  offer:       { pill: 'bg-purple-100 text-purple-700', label: 'Offer' },
}

function LogoFallback({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: '#033BB0' }}
    >
      {initials}
    </div>
  )
}

function StatusPipeline({ status }: { status: JobApplication['status'] }) {
  const currentIdx = STATUS_STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx
        const isCurrent = idx === currentIdx
        return (
          <div key={step} className="flex items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                isCurrent
                  ? 'text-white border-transparent scale-110'
                  : isCompleted
                  ? 'text-white border-transparent'
                  : 'bg-gray-100 text-gray-400 border-gray-200'
              }`}
              style={isCurrent || isCompleted ? { backgroundColor: '#033BB0' } : undefined}
            >
              {isCompleted ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div
                className="w-8 h-0.5 mx-0.5"
                style={{ backgroundColor: isCompleted ? '#033BB0' : '#E5E7EB' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    api.get('/api/candidate/applications')
      .then((res: ApplicationsPage) => {
        setApplications(res.data)
        setTotal(res.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const TABS: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: `All (${total})` },
    { key: 'applied', label: 'Applied' },
    { key: 'viewed', label: 'Viewed' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'offer', label: 'Offers' },
  ]

  const filtered = filter === 'all'
    ? applications
    : applications.filter((a) => a.status === filter)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-400 mt-1">Track your job applications</p>
      </div>

      {/* Status pipeline legend */}
      {!loading && applications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Application Pipeline</p>
          <div className="flex items-center gap-4">
            {STATUS_STEPS.map((step, idx) => (
              <div key={step} className="flex items-center gap-1.5">
                {idx > 0 && <div className="w-4 h-0.5 bg-gray-200" />}
                <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${STATUS_STYLES[step].pill}`}>
                  {STATUS_STYLES[step].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={filter === tab.key ? { borderColor: '#033BB0', color: '#033BB0' } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map((i) => <div key={i} className="h-28 bg-white rounded-xl border border-gray-200" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((app) => {
            const job = app.job
            const style = STATUS_STYLES[app.status] ?? { pill: 'bg-gray-100 text-gray-600', label: app.status }
            const isExpanded = expanded.has(app.id)
            return (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  {/* Logo */}
                  <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 bg-gray-50">
                    {job?.employer?.logo_path ? (
                      <img src={job.employer.logo_path} alt={job.employer.company_name} className="w-full h-full object-contain" />
                    ) : (
                      <LogoFallback name={job?.employer?.company_name ?? 'J'} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        {job?.slug ? (
                          <Link
                            href={`/jobs/${job.slug}`}
                            className="font-semibold text-sm hover:underline"
                            style={{ color: '#033BB0' }}
                          >
                            {job.title}
                          </Link>
                        ) : (
                          <p className="font-semibold text-sm text-gray-900">{job?.title ?? 'Unknown Job'}</p>
                        )}
                        {job?.employer && (
                          <Link
                            href={`/employers/${job.employer.slug}`}
                            className="text-xs text-gray-500 hover:underline block mt-0.5"
                          >
                            {job.employer.company_name}
                          </Link>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${style.pill}`}>
                        {style.label}
                      </span>
                    </div>

                    {/* Pipeline + date row */}
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <StatusPipeline status={app.status} />
                      <span className="text-xs text-gray-400">Applied {timeAgo(app.applied_at)}</span>
                    </div>

                    {/* Cover letter */}
                    {app.cover_letter && (
                      <div className="mt-3">
                        <button
                          onClick={() => toggleExpand(app.id)}
                          className="text-xs font-medium hover:underline"
                          style={{ color: '#033BB0' }}
                        >
                          {isExpanded ? 'Hide' : 'Show'} cover letter
                        </button>
                        {isExpanded && (
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
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100">
          {filter === 'all' ? (
            <IslamicEmptyState
              icon={<BriefcaseIcon size={28} />}
              title="No applications yet"
              message="Every great journey begins with a single step. Submit your first application — tawakkul and effort go hand in hand."
              actionLabel="Find Jobs"
              actionHref="/jobs"
            />
          ) : (
            <IslamicEmptyState
              icon={<BriefcaseIcon size={28} />}
              title={`No ${filter} applications`}
              message="No applications with this status yet."
            />
          )}
        </div>
      )}
    </div>
  )
}
