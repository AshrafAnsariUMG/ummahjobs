'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Job, JobAnalytics } from '@/types'

interface JobsListResponse {
  data: Job[]
  total: number
}

const STATUS_COLORS: Record<string, string> = {
  applied:     '#3B82F6', // blue-500
  viewed:      '#F59E0B', // amber-500
  shortlisted: '#22C55E', // green-500
  offer:       '#A855F7', // purple-500
}

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied', viewed: 'Viewed', shortlisted: 'Shortlisted', offer: 'Offer',
}

const STATUS_PILL: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700',
  viewed: 'bg-amber-100 text-amber-700',
  shortlisted: 'bg-green-100 text-green-700',
  offer: 'bg-purple-100 text-purple-700',
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

export default function EmployerAnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [analytics, setAnalytics] = useState<JobAnalytics | null>(null)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  // Fetch employer jobs on mount
  useEffect(() => {
    api.get('/api/employer/jobs?status=all&per_page=50')
      .then((res: JobsListResponse) => {
        const list = res.data ?? []
        setJobs(list)
        if (list.length > 0) setSelectedId(list[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingJobs(false))
  }, [])

  // Fetch analytics when selected job changes
  useEffect(() => {
    if (!selectedId) return
    setLoadingAnalytics(true)
    setAnalytics(null)
    api.get(`/api/employer/jobs/${selectedId}/analytics`)
      .then((data: JobAnalytics) => setAnalytics(data))
      .catch(() => {})
      .finally(() => setLoadingAnalytics(false))
  }, [selectedId])

  const conversionRate = analytics
    ? analytics.views > 0
      ? Math.round((analytics.applications_total / analytics.views) * 100 * 10) / 10
      : 0
    : 0

  const days = analytics ? daysUntil(analytics.expires_at) : null

  const daysColor = days === null
    ? 'text-gray-500'
    : days > 14 ? 'text-green-600'
    : days > 7  ? 'text-amber-600'
    : 'text-red-600'

  // Bar chart data
  const statusOrder = ['applied', 'viewed', 'shortlisted', 'offer'] as const
  const byStatus = analytics?.applications_by_status ?? {}
  const totalApps = analytics?.applications_total ?? 0

  // Performance insight
  function InsightCard() {
    if (!analytics) return null
    const views = analytics.views
    const rate = conversionRate

    let bg = 'bg-blue-50 border-blue-200'
    let textColor = 'text-blue-800'
    let subColor = 'text-blue-700'
    let heading = ''
    let body = ''
    let link: { href: string; label: string } | null = null

    if (views < 10) {
      heading = 'Your listing needs more visibility'
      body = 'Upgrade to a Featured listing for 3× more views and prime placement in search results and the homepage.'
      link = { href: '/employer/packages', label: 'View Packages →' }
    } else if (rate >= 5) {
      bg = 'bg-green-50 border-green-200'
      textColor = 'text-green-800'
      subColor = 'text-green-700'
      heading = 'Great performance!'
      body = 'Your listing is converting views to applications well. Keep it updated to maintain momentum.'
    } else if (rate >= 2) {
      bg = 'bg-amber-50 border-amber-200'
      textColor = 'text-amber-800'
      subColor = 'text-amber-700'
      heading = 'Decent performance'
      body = 'Consider featuring your listing to increase visibility and attract more qualified candidates.'
      link = { href: '/employer/packages', label: 'View Packages →' }
    } else {
      heading = 'Low conversion rate'
      body = 'Try updating your job description or salary range to better attract applicants. Featured listings also get 3× more views.'
    }

    return (
      <div className={`rounded-xl border p-5 ${bg}`}>
        <p className={`font-semibold text-sm mb-1 ${textColor}`}>{heading}</p>
        <p className={`text-xs ${subColor}`}>{body}</p>
        {link && (
          <Link href={link.href} className={`text-xs font-semibold underline mt-2 inline-block ${textColor}`}>
            {link.label}
          </Link>
        )}
      </div>
    )
  }

  if (loadingJobs) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-white rounded-xl border border-gray-200" />)}
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Listing Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Track performance of your job listings</p>
        </div>
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E6EDFF' }}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="font-semibold text-gray-900 mb-2">No listings yet</h2>
          <p className="text-sm text-gray-500 mb-6">Post a job to see analytics.</p>
          <Link
            href="/employer/post-job"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#033BB0' }}
          >
            Post a Job →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Listing Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Track performance of your job listings</p>
      </div>

      {/* Job selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Select Listing</label>
        <select
          value={selectedId ?? ''}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none font-medium text-gray-900"
        >
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} — {job.status}
            </option>
          ))}
        </select>
      </div>

      {loadingAnalytics ? (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-white rounded-xl border border-gray-200" />)}
          </div>
          <div className="h-24 bg-white rounded-xl border border-gray-200" />
        </div>
      ) : analytics ? (
        <>
          {/* 4 stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {/* Views */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs text-gray-500">Total Views</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{analytics.views}</p>
            </div>

            {/* Applications */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs text-gray-500">Total Applications</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{analytics.applications_total}</p>
            </div>

            {/* Conversion rate */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-xs text-gray-500">Conversion Rate</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{conversionRate}%</p>
              <p className="text-xs text-gray-400 mt-1">applications per 100 views</p>
            </div>

            {/* Days remaining */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-500">Days Remaining</span>
              </div>
              {days !== null ? (
                <p className={`text-3xl font-extrabold ${daysColor}`}>{days}</p>
              ) : (
                <p className="text-xl font-extrabold text-gray-400">No expiry</p>
              )}
              {days !== null && days <= 7 && (
                <p className="text-xs text-red-500 mt-1">Expiring soon!</p>
              )}
            </div>
          </div>

          {/* Application status breakdown bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="font-semibold text-gray-900 text-sm mb-4">Application Breakdown</h2>

            {totalApps > 0 ? (
              <>
                {/* Bar */}
                <div className="flex h-10 rounded-lg overflow-hidden mb-4">
                  {statusOrder.map((s) => {
                    const count = byStatus[s] ?? 0
                    if (count === 0) return null
                    const pct = (count / totalApps) * 100
                    return (
                      <div
                        key={s}
                        className="flex items-center justify-center text-white text-xs font-semibold transition-all"
                        style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[s] }}
                        title={`${STATUS_LABELS[s]}: ${count}`}
                      >
                        {pct >= 12 ? `${STATUS_LABELS[s]}: ${count}` : count}
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4">
                  {statusOrder.map((s) => {
                    const count = byStatus[s] ?? 0
                    return (
                      <div key={s} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS[s] }} />
                        <span className="text-xs text-gray-600">{STATUS_LABELS[s]}</span>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${STATUS_PILL[s]}`}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div>
                <div className="h-10 bg-gray-100 rounded-lg mb-3" />
                <p className="text-sm text-gray-400">No applications received yet.</p>
              </div>
            )}
          </div>

          {/* Performance insight */}
          <div className="mb-6">
            <InsightCard />
          </div>

          {/* Upsell card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Want more applicants?</p>
              <p className="text-sm text-gray-500">
                Featured listings get 3× more views and appear at the top of search results and in the homepage carousel.
              </p>
            </div>
            <Link
              href="/employer/packages"
              className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#033BB0' }}
            >
              View Packages →
            </Link>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-400">Failed to load analytics. Please try again.</p>
        </div>
      )}
    </div>
  )
}
