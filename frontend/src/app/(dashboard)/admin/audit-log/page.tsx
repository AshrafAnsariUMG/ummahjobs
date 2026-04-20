'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface AuditEntry {
  id: number
  action: string
  admin_name: string
  target_user_id: string | null
  target_name: string | null
  notes: string | null
  created_at: string
}

interface AuditMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const ACTION_LABELS: Record<string, string> = {
  grant_credits:      'Credits Granted',
  verify_employer:    'Employer Verified',
  unverify_employer:  'Verification Removed',
  delete_job:         'Job Deleted',
  update_package:     'Package Updated',
  delete_user:        'User Deleted',
  change_role:        'Role Changed',
  update_status:      'Status Changed',
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action
}

type BadgeVariant = 'green' | 'blue' | 'red' | 'amber' | 'gray'

function actionBadgeVariant(action: string): BadgeVariant {
  if (action === 'grant_credits') return 'green'
  if (action.startsWith('verify')) return 'blue'
  if (action.startsWith('delete')) return 'red'
  if (action.startsWith('update') || action.startsWith('change')) return 'amber'
  return 'gray'
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-700',
  blue:  'bg-blue-100 text-blue-700',
  red:   'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  gray:  'bg-gray-100 text-gray-600',
}

function ActionBadge({ action }: { action: string }) {
  const variant = actionBadgeVariant(action)
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${BADGE_CLASSES[variant]}`}>
      {actionLabel(action)}
    </span>
  )
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const ACTIONS = [
  'all',
  'grant_credits',
  'verify_employer',
  'unverify_employer',
  'delete_job',
  'update_package',
  'delete_user',
  'change_role',
  'update_status',
]

export default function AdminAuditLogPage() {
  const { showToast } = useToast()

  const [entries, setEntries]   = useState<AuditEntry[]>([])
  const [meta, setMeta]         = useState<AuditMeta | null>(null)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [action, setAction]     = useState('all')
  const [days, setDays]         = useState<'' | '7' | '30'>('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (action !== 'all') params.set('action', action)
    if (days) params.set('days', days)

    api.get(`/api/admin/audit-log?${params}`)
      .then((d: { data: AuditEntry[]; meta: AuditMeta }) => {
        setEntries(d.data)
        setMeta(d.meta)
      })
      .catch(() => showToast('Failed to load audit log.', 'error'))
      .finally(() => setLoading(false))
  }, [page, action, days])

  // Client-side search filter
  const filtered = search.trim()
    ? entries.filter((e) => {
        const q = search.toLowerCase()
        return (
          e.action.toLowerCase().includes(q) ||
          actionLabel(e.action).toLowerCase().includes(q) ||
          e.admin_name.toLowerCase().includes(q) ||
          (e.notes ?? '').toLowerCase().includes(q) ||
          (e.target_name ?? '').toLowerCase().includes(q)
        )
      })
    : entries

  function handleActionChange(val: string) {
    setAction(val)
    setPage(1)
  }

  function handleDaysChange(val: '' | '7' | '30') {
    setDays(val)
    setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">
          All admin actions on the platform
          {meta && <span className="ml-1">· {meta.total.toLocaleString()} entries</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions or notes..."
            className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
          />
        </div>

        {/* Action filter */}
        <select
          value={action}
          onChange={(e) => handleActionChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
          style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
        >
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a === 'all' ? 'All Actions' : actionLabel(a)}
            </option>
          ))}
        </select>

        {/* Date range */}
        <select
          value={days}
          onChange={(e) => handleDaysChange(e.target.value as '' | '7' | '30')}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
          style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
        >
          <option value="">All time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400">No audit log entries yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3 whitespace-nowrap">Date / Time</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Admin</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Action</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Target</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {formatDateTime(entry.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{entry.admin_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={entry.action} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {entry.target_name ?? (entry.target_user_id ? <span className="font-mono text-gray-400">{entry.target_user_id.slice(0, 8)}…</span> : <span className="text-gray-300">—</span>)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">
                      {entry.notes ?? <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {meta.current_page} of {meta.last_page}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={meta.current_page <= 1 || loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={meta.current_page >= meta.last_page || loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
