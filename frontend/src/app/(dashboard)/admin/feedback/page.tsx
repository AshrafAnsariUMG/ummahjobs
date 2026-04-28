'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface FeedbackUser {
  id: string
  display_name: string
  email: string
  role: string
}

interface FeedbackItem {
  id: number
  type: 'bug' | 'feature' | 'general'
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  admin_notes: string | null
  user: FeedbackUser
  created_at: string
}

interface Stats {
  total: number
  open: number
  in_progress: number
  resolved: number
  bugs: number
  features: number
}

const TYPE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  bug:     { bg: '#FEF2F2', color: '#EF4444', label: 'Bug Report' },
  feature: { bg: '#EFF6FF', color: '#033BB0', label: 'Feature Request' },
  general: { bg: '#F0FFF4', color: '#0FBB0F', label: 'General' },
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  open:        { bg: '#FEF2F2', color: '#EF4444', label: 'Open' },
  in_progress: { bg: '#FFFBEB', color: '#D97706', label: 'In Progress' },
  resolved:    { bg: '#F0FFF4', color: '#0FBB0F', label: 'Resolved' },
}

export default function AdminFeedbackPage() {
  const { showToast } = useToast()
  const [stats, setStats] = useState<Stats | null>(null)
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editNotes, setEditNotes] = useState<Record<number, string>>({})
  const [editStatus, setEditStatus] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<number | null>(null)

  useEffect(() => {
    api.get('/api/admin/feedback/stats')
      .then((d: Stats) => setStats(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (statusFilter) params.set('status', statusFilter)
    if (typeFilter) params.set('type', typeFilter)
    api.get(`/api/admin/feedback?${params}`)
      .then((d: { data: FeedbackItem[]; last_page: number }) => {
        setItems(d.data)
        setLastPage(d.last_page)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, statusFilter, typeFilter])

  function toggleExpand(id: number, item: FeedbackItem) {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      setEditNotes((prev) => ({ ...prev, [id]: item.admin_notes ?? '' }))
      setEditStatus((prev) => ({ ...prev, [id]: item.status }))
    }
  }

  async function saveUpdate(id: number) {
    setSaving(id)
    try {
      const updated = await api.put(`/api/admin/feedback/${id}`, {
        status: editStatus[id],
        admin_notes: editNotes[id] || null,
      }) as FeedbackItem
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)))
      showToast('JazakAllah Khayran! Status updated.', 'success')
      setExpandedId(null)
      // refresh stats
      api.get('/api/admin/feedback/stats').then((d: Stats) => setStats(d)).catch(() => {})
    } catch {
      showToast('Failed to update feedback.', 'error')
    } finally {
      setSaving(null)
    }
  }

  async function quickUpdate(id: number, status: string) {
    try {
      const updated = await api.put(`/api/admin/feedback/${id}`, { status }) as FeedbackItem
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)))
      showToast('JazakAllah Khayran! Status updated.', 'success')
      api.get('/api/admin/feedback/stats').then((d: Stats) => setStats(d)).catch(() => {})
    } catch {
      showToast('Failed to update feedback.', 'error')
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Feedback &amp; Support</h1>
        <p className="text-sm text-gray-500 mt-1">Manage user feedback and feature requests</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: '#033BB0', bg: '#EFF6FF' },
            { label: 'Open', value: stats.open, color: '#EF4444', bg: '#FEF2F2' },
            { label: 'In Progress', value: stats.in_progress, color: '#D97706', bg: '#FFFBEB' },
            { label: 'Resolved', value: stats.resolved, color: '#0FBB0F', bg: '#F0FFF4' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-6 w-6" style={{ color: '#033BB0' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-400 text-sm">No feedback submitted yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const ts = TYPE_STYLES[item.type]
                const ss = STATUS_STYLES[item.status]
                const isExpanded = expandedId === item.id
                return (
                  <>
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900 text-xs">{item.user?.display_name}</p>
                        <p className="text-gray-400 text-xs">{item.user?.email}</p>
                        <span className="inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: item.user?.role === 'employer' ? '#033BB0' : '#0FBB0F' }}>
                          {item.user?.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: ts.bg, color: ts.color }}>
                          {ts.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 max-w-xs">
                        <button
                          onClick={() => toggleExpand(item.id, item)}
                          className="text-left font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {item.title}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: ss.bg, color: ss.color }}>
                          {ss.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(item.created_at)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {item.status === 'open' && (
                            <button
                              onClick={() => quickUpdate(item.id, 'in_progress')}
                              className="text-xs px-2 py-1 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors whitespace-nowrap"
                            >
                              In Progress
                            </button>
                          )}
                          {item.status !== 'resolved' && (
                            <button
                              onClick={() => quickUpdate(item.id, 'resolved')}
                              className="text-xs px-2 py-1 rounded-lg border text-white transition-colors whitespace-nowrap"
                              style={{ backgroundColor: '#0FBB0F', borderColor: '#0FBB0F' }}
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`expand-${item.id}`} className="bg-blue-50 border-b border-gray-100">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="space-y-3 max-w-2xl">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Admin Notes</label>
                              <textarea
                                rows={3}
                                value={editNotes[item.id] ?? ''}
                                onChange={(e) => setEditNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                placeholder="Add internal notes..."
                                maxLength={1000}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none resize-none"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <select
                                value={editStatus[item.id] ?? item.status}
                                onChange={(e) => setEditStatus((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                              >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                              </select>
                              <button
                                onClick={() => saveUpdate(item.id)}
                                disabled={saving === item.id}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-70 transition-opacity hover:opacity-90"
                                style={{ backgroundColor: '#033BB0' }}
                              >
                                {saving === item.id ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={() => setExpandedId(null)}
                                className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
              style={p === page ? { backgroundColor: '#033BB0', color: 'white' } : { backgroundColor: 'white', color: '#374151', border: '1px solid #E5E7EB' }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
