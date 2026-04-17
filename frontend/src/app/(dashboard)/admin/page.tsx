'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { CrescentIcon } from '@/components/ui/IslamicIcons'
import IslamicPattern from '@/components/ui/IslamicPattern'

interface AdminStats {
  total_users: number
  total_jobs: number
  total_employers: number
  total_candidates: number
  total_applications: number
}

interface AuditEntry {
  id: number
  action: string
  notes: string | null
  created_at: string
  admin: { id: string; display_name: string; email: string } | null
  target_user: { id: string; display_name: string; email: string } | null
}

interface AuditResponse {
  data: AuditEntry[]
}

function StatCard({
  label,
  value,
  icon,
  color,
  placeholder,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  placeholder?: boolean
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 p-5 ${placeholder ? 'opacity-60' : ''}`}
      title={placeholder ? 'Coming soon' : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
          {placeholder && (
            <p className="text-xs text-gray-400 mt-1 italic">Coming soon</p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: color + '1A' }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingAudit, setLoadingAudit] = useState(true)

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  useEffect(() => {
    api.get('/api/admin/stats')
      .then((d: AdminStats) => setStats(d))
      .catch(() => {
        // Fall back to public jobs/stats
        api.get('/api/jobs/stats')
          .then((d: { total_jobs: number; total_employers: number; total_candidates: number; total_categories: number }) => {
            setStats({
              total_users: 0,
              total_jobs: d.total_jobs,
              total_employers: d.total_employers,
              total_candidates: d.total_candidates,
              total_applications: 0,
            })
          })
          .catch(() => {})
      })
      .finally(() => setLoadingStats(false))
  }, [])

  useEffect(() => {
    api.get('/api/admin/audit-log?per_page=10')
      .then((d: AuditResponse) => setAuditLog(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingAudit(false))
  }, [])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8" style={{ position: 'relative', overflow: 'hidden' }}>
        <IslamicPattern opacity={0.03} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="text-2xl font-extrabold text-gray-900">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <CrescentIcon />
              Assalamu Alaikum, {user?.display_name ?? 'Admin'}!
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here&apos;s an overview of the platform.</p>
        </div>
      </div>

      {/* Primary stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Total Users"
          value={loadingStats ? '…' : (stats?.total_users ?? 0).toLocaleString()}
          color="#033BB0"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          label="Active Jobs"
          value={loadingStats ? '…' : (stats?.total_jobs ?? 0).toLocaleString()}
          color="#059669"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Employers"
          value={loadingStats ? '…' : (stats?.total_employers ?? 0).toLocaleString()}
          color="#7c3aed"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          label="Candidates"
          value={loadingStats ? '…' : (stats?.total_candidates ?? 0).toLocaleString()}
          color="#d97706"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>

      {/* Secondary stats (placeholders) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Jobs Today" value="—" color="#6b7280" placeholder icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } />
        <StatCard label="Applications Today" value="—" color="#6b7280" placeholder icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        } />
        <StatCard label="Messages Today" value="—" color="#6b7280" placeholder icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        } />
        <StatCard label="Revenue (Month)" value="$0" color="#6b7280" placeholder icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#033BB0' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Blog Post
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            View All Users
          </Link>
          <Link
            href="/admin/audit-log"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View Audit Log
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
          <Link
            href="/admin/audit-log"
            className="text-xs font-medium hover:underline"
            style={{ color: '#033BB0' }}
          >
            View all →
          </Link>
        </div>

        {loadingAudit ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : auditLog.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No recent activity.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2 pr-4">Date</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2 pr-4">Admin</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2 pr-4">Action</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2 pr-4">Target</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {auditLog.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-gray-700 whitespace-nowrap">
                      {entry.admin?.display_name ?? '—'}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-gray-600 whitespace-nowrap">
                      {entry.target_user?.display_name ?? '—'}
                    </td>
                    <td className="py-2.5 text-xs text-gray-400 max-w-xs truncate">
                      {entry.notes ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
