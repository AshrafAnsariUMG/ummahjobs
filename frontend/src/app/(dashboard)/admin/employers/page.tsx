'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface AdminEmployer {
  id: number
  company_name: string
  slug: string
  category: string | null
  logo_path: string | null
  is_verified: boolean
  show_profile: boolean
  views_count: number
  created_at: string
  user: { id: string; email: string; is_active: boolean } | null
}

interface EmployersResponse {
  data: AdminEmployer[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

type VerifiedFilter = 'all' | 'verified' | 'unverified'

function ActionsMenu({
  employer,
  onVerifyToggle,
  onProfileToggle,
}: {
  employer: AdminEmployer
  onVerifyToggle: () => void
  onProfileToggle: () => void
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
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
          <a
            href={`/employers/${employer.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            View Profile ↗
          </a>
          <button
            onClick={() => { setOpen(false); onVerifyToggle() }}
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${employer.is_verified ? 'text-red-600' : 'text-green-700'}`}
          >
            {employer.is_verified ? 'Remove Verified' : 'Grant Halal Verified'}
          </button>
          <button
            onClick={() => { setOpen(false); onProfileToggle() }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {employer.show_profile ? 'Hide Profile' : 'Show Profile'}
          </button>
        </div>
      )}
    </div>
  )
}

const VERIFIED_TABS: { key: VerifiedFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'verified', label: 'Verified' },
  { key: 'unverified', label: 'Unverified' },
]

export default function AdminEmployersPage() {
  const { showToast } = useToast()
  const [employers, setEmployers] = useState<AdminEmployer[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, verifiedFilter])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (verifiedFilter === 'verified') params.set('is_verified', '1')
    if (verifiedFilter === 'unverified') params.set('is_verified', '0')

    api.get(`/api/admin/employers?${params}`)
      .then((d: EmployersResponse) => { setEmployers(d.data); setMeta(d.meta) })
      .catch(() => showToast('Failed to load employers.', 'error'))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, verifiedFilter])

  async function handleVerifyToggle(employer: AdminEmployer) {
    const newVal = !employer.is_verified
    setEmployers((prev) => prev.map((e) => e.id === employer.id ? { ...e, is_verified: newVal } : e))
    try {
      await api.put(`/api/admin/employers/${employer.id}`, { is_verified: newVal })
      showToast(newVal ? 'Halal Verified granted.' : 'Verified status removed.', 'success')
    } catch {
      setEmployers((prev) => prev.map((e) => e.id === employer.id ? { ...e, is_verified: !newVal } : e))
      showToast('Failed to update employer.', 'error')
    }
  }

  async function handleProfileToggle(employer: AdminEmployer) {
    const newVal = !employer.show_profile
    setEmployers((prev) => prev.map((e) => e.id === employer.id ? { ...e, show_profile: newVal } : e))
    try {
      await api.put(`/api/admin/employers/${employer.id}`, { show_profile: newVal })
      showToast(newVal ? 'Profile is now visible.' : 'Profile hidden.', 'success')
    } catch {
      setEmployers((prev) => prev.map((e) => e.id === employer.id ? { ...e, show_profile: !newVal } : e))
      showToast('Failed to update employer.', 'error')
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Employers</h1>
        <p className="text-sm text-gray-500 mt-1">Manage employer accounts and Halal Verified status · {meta.total.toLocaleString()} total</p>
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
              placeholder="Search company name..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
            />
          </div>
        </div>
        <div className="flex gap-1 mt-3 border-b border-gray-100">
          {VERIFIED_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setVerifiedFilter(tab.key)}
              className="px-3 py-2 text-sm font-medium border-b-2 transition-colors"
              style={verifiedFilter === tab.key
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
        ) : employers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400">No employers found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Company</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Category</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Halal Verified</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Profile</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Joined</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employers.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      {/* Company */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {emp.logo_path ? (
                            <img src={emp.logo_path} alt={emp.company_name} className="w-8 h-8 rounded-lg object-contain border border-gray-100 shrink-0 bg-gray-50" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#033BB0' }}>
                              {emp.company_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[180px]">{emp.company_name}</p>
                            <p className="text-xs text-gray-400 truncate">{emp.user?.email ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        {emp.category ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{emp.category}</span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      {/* Halal Verified */}
                      <td className="px-4 py-3">
                        {emp.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border" style={{ backgroundColor: '#E6F9E6', color: '#0FBB0F', borderColor: '#0FBB0F' }}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Halal Verified
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Unverified</span>
                        )}
                      </td>
                      {/* Profile visibility */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.show_profile ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                          {emp.show_profile ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      {/* Joined */}
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(emp.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ActionsMenu
                          employer={emp}
                          onVerifyToggle={() => handleVerifyToggle(emp)}
                          onProfileToggle={() => handleProfileToggle(emp)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta.last_page > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {meta.current_page} of {meta.last_page} · {meta.total.toLocaleString()} employers</p>
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
  )
}
