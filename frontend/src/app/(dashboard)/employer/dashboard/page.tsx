'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { CreditBalance, Employer, Job, PaginatedResponse } from '@/types'
import { CrescentIcon } from '@/components/ui/IslamicIcons'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

export default function EmployerDashboardPage() {
  const { user } = useAuth()
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [employer, setEmployer] = useState<Employer | null>(null)
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [totalJobs, setTotalJobs] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/employer/packages/balance'),
      api.get('/api/employer/profile'),
      api.get('/api/employer/jobs?per_page=5'),
      api.get('/api/employer/jobs?status=active&per_page=1'),
    ])
      .then(([bal, emp, jobs, active]: [CreditBalance, Employer, PaginatedResponse<Job>, PaginatedResponse<Job>]) => {
        setBalance(bal)
        setEmployer(emp)
        setRecentJobs(jobs.data ?? [])
        setTotalJobs(jobs.meta?.total ?? 0)
        setActiveCount(active.meta?.total ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <CrescentIcon />
            Assalamu Alaikum, {user?.display_name ?? 'there'}!
          </span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Manage your listings and find the right talent for your team.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Credits Remaining',
            value: loading ? '—' : String(balance?.total_credits ?? 0),
            sub: balance?.total_credits === 0 ? (
              <Link href="/employer/packages" className="text-xs font-medium hover:underline" style={{ color: '#033BB0' }}>
                Purchase more →
              </Link>
            ) : null,
            highlight: (balance?.total_credits ?? 0) > 0,
          },
          { label: 'Active Listings', value: loading ? '—' : String(activeCount) },
          { label: 'Total Applications', value: '0', sub: <span className="text-xs text-gray-400">Coming soon</span> },
          { label: 'Profile Views', value: loading ? '—' : String(employer?.views_count ?? 0) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-2xl font-bold text-gray-900" style={stat.highlight ? { color: '#033BB0' } : undefined}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            {stat.sub && <div className="mt-1">{stat.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Credit balance card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">Credit Balance</h2>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
            </div>
          ) : balance?.packages && balance.packages.length > 0 ? (
            <div className="space-y-3">
              {balance.packages.map((pkg) => {
                const total = (pkg.package?.post_count ?? 1)
                const used = total - pkg.credits_remaining
                const pct = Math.round((pkg.credits_remaining / total) * 100)
                return (
                  <div key={pkg.id} className="rounded-lg border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {pkg.package?.name ?? 'Package'}
                        </span>
                        {pkg.granted_by_admin && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                            Admin Grant
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#033BB0' }}>
                        {pkg.credits_remaining} / {total} credits
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: '#033BB0' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{pkg.duration_days} days per listing</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">No credits yet.</p>
              <Link
                href="/employer/packages"
                className="inline-block px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: '#033BB0' }}
              >
                Browse Packages
              </Link>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">Quick Actions</h2>
          <div className="space-y-2">
            {(balance?.total_credits ?? 0) > 0 ? (
              <Link
                href="/employer/post-job"
                className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#033BB0' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Post a New Job
              </Link>
            ) : (
              <Link
                href="/employer/packages"
                className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#033BB0' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Buy Credits
              </Link>
            )}
            <Link
              href="/employer/profile/edit"
              className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Company Profile
            </Link>
            {employer?.slug && (
              <a
                href={`/employers/${employer.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Public Profile
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Recent listings */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Recent Listings</h2>
          <Link href="/employer/jobs" className="text-xs font-medium hover:underline" style={{ color: '#033BB0' }}>
            View all ({totalJobs}) →
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
          </div>
        ) : recentJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Title</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Posted</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Views</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-xs">{job.title}</p>
                      {job.category && <p className="text-xs text-gray-400">{job.category.name}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-gray-500">
                      {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-gray-500">{job.views_count}</td>
                    <td className="px-5 py-3 text-right">
                      <a
                        href={`/jobs/${job.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium hover:underline"
                        style={{ color: '#033BB0' }}
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-gray-500 text-sm mb-3">You haven&apos;t posted any jobs yet.</p>
            <Link
              href="/employer/post-job"
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#033BB0' }}
            >
              Post your first job →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
