'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface AdminJob {
  id: number
  title: string
  slug: string
  status: 'active' | 'expired'
  is_featured: boolean
  is_urgent: boolean
  views_count: number
  created_at: string
  employer: { id: number; company_name: string; slug: string } | null
  category: { id: number; name: string } | null
}

interface JobsResponse {
  data: AdminJob[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

type StatusFilter = 'all' | 'active' | 'expired'

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
}: {
  title: string
  body: string
  confirmLabel: string
  confirmClass: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-5">{body}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium rounded-lg text-white ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionsMenu({
  job,
  onFeatureToggle,
  onExpire,
  onDelete,
}: {
  job: AdminJob
  onFeatureToggle: () => void
  onExpire: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
          <a
            href={`/jobs/${job.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            View Listing ↗
          </a>
          <button
            onClick={() => { setOpen(false); onFeatureToggle() }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {job.is_featured ? 'Unfeature' : 'Feature'}
          </button>
          {job.status === 'active' && (
            <button
              onClick={() => { setOpen(false); onExpire() }}
              className="block w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
            >
              Mark Expired
            </button>
          )}
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); onDelete() }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expired', label: 'Expired' },
]

export default function AdminJobsPage() {
  const { showToast } = useToast()
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [page, setPage] = useState(1)

  const [expireTarget, setExpireTarget] = useState<AdminJob | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminJob | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, statusFilter, featuredOnly])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (featuredOnly) params.set('is_featured', '1')

    api.get(`/api/admin/jobs?${params}`)
      .then((d: JobsResponse) => { setJobs(d.data); setMeta(d.meta) })
      .catch(() => showToast('Failed to load jobs.', 'error'))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, statusFilter, featuredOnly])

  async function handleFeatureToggle(job: AdminJob) {
    const newVal = !job.is_featured
    setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, is_featured: newVal } : j))
    try {
      await api.put(`/api/admin/jobs/${job.id}`, { is_featured: newVal })
      showToast(newVal ? 'Job featured.' : 'Job unfeatured.', 'success')
    } catch {
      setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, is_featured: !newVal } : j))
      showToast('Failed to update job.', 'error')
    }
  }

  async function handleExpire(job: AdminJob) {
    setExpireTarget(null)
    setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: 'expired' } : j))
    try {
      await api.put(`/api/admin/jobs/${job.id}`, { status: 'expired' })
      showToast('Job marked as expired.', 'success')
    } catch {
      setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: 'active' } : j))
      showToast('Failed to update job.', 'error')
    }
  }

  async function handleDelete(job: AdminJob) {
    setDeleteTarget(null)
    setJobs((prev) => prev.filter((j) => j.id !== job.id))
    setMeta((m) => ({ ...m, total: m.total - 1 }))
    try {
      await api.delete(`/api/admin/jobs/${job.id}`)
      showToast('Job deleted.', 'success')
    } catch {
      showToast('Failed to delete job.', 'error')
      setPage((p) => p) // refetch
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      {expireTarget && (
        <ConfirmDialog
          title="Mark as Expired"
          body={`Mark "${expireTarget.title}" as expired? It will be hidden from job listings.`}
          confirmLabel="Mark Expired"
          confirmClass="bg-amber-600 hover:bg-amber-700"
          onConfirm={() => handleExpire(expireTarget)}
          onCancel={() => setExpireTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Job Listing"
          body={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Jobs</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all job listings · {meta.total.toLocaleString()} total</p>
          </div>
          <button
            onClick={() => setPage((p) => p)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job titles..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              Featured only
            </label>
          </div>
          {/* Status tabs */}
          <div className="flex gap-1 mt-3 border-b border-gray-100">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className="px-3 py-2 text-sm font-medium border-b-2 transition-colors"
                style={statusFilter === tab.key
                  ? { borderColor: '#033BB0', color: '#033BB0' }
                  : { borderColor: 'transparent', color: '#6b7280' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-400">No job listings found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Job</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Category</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Badges</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Posted</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Views</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900 truncate max-w-[220px]">{job.title}</p>
                          <p className="text-xs text-gray-400 truncate">{job.employer?.company_name ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          {job.category ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              {job.category.name}
                            </span>
                          ) : <span className="text-xs text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                            {job.status === 'active' ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {job.is_featured && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                                <svg viewBox="0 0 24 24" fill="currentColor" width={11} height={11}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                Featured
                              </span>
                            )}
                            {job.is_urgent && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                <svg viewBox="0 0 24 24" fill="currentColor" width={11} height={11}><path d="M13 2L3 14h9l-1 8 10-12h-9z" /></svg>
                                Urgent
                              </span>
                            )}
                            {!job.is_featured && !job.is_urgent && (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(job.created_at)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                          {job.views_count.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ActionsMenu
                            job={job}
                            onFeatureToggle={() => handleFeatureToggle(job)}
                            onExpire={() => setExpireTarget(job)}
                            onDelete={() => setDeleteTarget(job)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {meta.last_page > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Page {meta.current_page} of {meta.last_page} · {meta.total.toLocaleString()} jobs</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                    <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
