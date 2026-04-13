'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface AdminCandidate {
  id: number
  user_id: string
  title: string | null
  location: string | null
  experience_years: number | string | null
  cv_path: string | null
  profile_complete_pct: number | string
  created_at: string
  user: {
    id: string
    email: string
    display_name: string
    is_active: boolean
    created_at: string
  } | null
}

interface CandidatesResponse {
  data: AdminCandidate[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
  stats: {
    total: number
    with_cv: number
    avg_completion: number
    fully_complete: number
  }
}

type CvFilter = 'all' | 'with_cv' | 'without_cv'
type CompletionFilter = 'all' | '80plus' | '50to79' | 'under50'

function CompletionBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 max-w-[80px]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{pct}%</span>
    </div>
  )
}

function ActionsMenu({ candidate }: { candidate: AdminCandidate }) {
  const router = useRouter()
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
          <button
            onClick={() => {
              setOpen(false)
              router.push(`/admin/users?search=${encodeURIComponent(candidate.user?.email ?? '')}`)
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            View User Account →
          </button>
        </div>
      )}
    </div>
  )
}

const CV_TABS: { key: CvFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'with_cv', label: 'With CV' },
  { key: 'without_cv', label: 'Without CV' },
]

const COMPLETION_OPTIONS: { key: CompletionFilter; label: string }[] = [
  { key: 'all', label: 'All completion' },
  { key: '80plus', label: '80%+ complete' },
  { key: '50to79', label: '50–79%' },
  { key: 'under50', label: 'Under 50%' },
]

export default function AdminCandidatesPage() {
  const { showToast } = useToast()
  const [candidates, setCandidates] = useState<AdminCandidate[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [stats, setStats] = useState({ total: 0, with_cv: 0, avg_completion: 0, fully_complete: 0 })
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [cvFilter, setCvFilter] = useState<CvFilter>('all')
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, cvFilter, completionFilter])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (cvFilter === 'with_cv') params.set('has_cv', '1')
    if (cvFilter === 'without_cv') params.set('has_cv', '0')
    if (completionFilter === '80plus') params.set('min_completion', '80')
    if (completionFilter === '50to79') params.set('min_completion', '50')
    if (completionFilter === 'under50') {
      // backend doesn't have max_completion — we filter client-side from results
    }

    api.get(`/api/admin/candidates?${params}`)
      .then((d: CandidatesResponse) => {
        let data = d.data
        if (completionFilter === 'under50') {
          data = data.filter((c) => Number(c.profile_complete_pct) < 50)
        } else if (completionFilter === '50to79') {
          data = data.filter((c) => {
            const p = Number(c.profile_complete_pct)
            return p >= 50 && p < 80
          })
        }
        setCandidates(data)
        setMeta(d.meta)
        setStats(d.stats)
      })
      .catch(() => showToast('Failed to load candidates.', 'error'))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, cvFilter, completionFilter])

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const statCards = [
    { label: 'Total Candidates', value: stats.total.toLocaleString(), color: '#033BB0' },
    { label: 'With CV', value: stats.with_cv.toLocaleString(), color: '#7c3aed' },
    { label: 'Avg Completion', value: `${stats.avg_completion}%`, color: '#d97706' },
    { label: '80%+ Complete', value: stats.fully_complete.toLocaleString(), color: '#16a34a' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Candidates</h1>
        <p className="text-sm text-gray-500 mt-1">Read-only analytics view · {meta.total.toLocaleString()} total</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
            <p className="text-xl font-extrabold mt-1" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
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
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
            />
          </div>
          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value as CompletionFilter)}
            className="text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none bg-white"
          >
            {COMPLETION_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
        {/* CV tabs */}
        <div className="flex gap-1 mt-3 border-b border-gray-100">
          {CV_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCvFilter(tab.key)}
              className="px-3 py-2 text-sm font-medium border-b-2 transition-colors"
              style={cvFilter === tab.key
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
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400">No candidates found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Candidate</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Completion</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Experience</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Location</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">CV</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Joined</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {candidates.map((c) => {
                    const name = c.user?.display_name ?? 'Unknown'
                    const initials = name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
                    const pct = Math.round(Number(c.profile_complete_pct))
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        {/* Candidate */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#033BB0' }}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate max-w-[160px]">{name}</p>
                              <p className="text-xs text-gray-400 truncate">{c.user?.email ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        {/* Completion */}
                        <td className="px-4 py-3">
                          <CompletionBar pct={pct} />
                        </td>
                        {/* Experience */}
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {c.experience_years ? `${c.experience_years} yrs` : '—'}
                        </td>
                        {/* Location */}
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap max-w-[120px] truncate">
                          {c.location ?? '—'}
                        </td>
                        {/* CV */}
                        <td className="px-4 py-3">
                          {c.cv_path ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Yes
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        {/* Joined */}
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {c.user?.created_at ? formatDate(c.user.created_at) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ActionsMenu candidate={c} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {meta.last_page > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {meta.current_page} of {meta.last_page} · {meta.total.toLocaleString()} candidates</p>
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
