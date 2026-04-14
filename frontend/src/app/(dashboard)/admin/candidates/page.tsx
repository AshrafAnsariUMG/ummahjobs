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
  phone: string | null
  gender: string | null
  age_range: string | null
  experience_years: number | string | null
  qualification: string | null
  job_category: string | null
  salary_type: string | null
  languages: string[] | null
  skills: string[] | null
  socials: unknown
  profile_photo_path: string | null
  cv_path: string | null
  show_profile: boolean
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

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  function add() {
    const v = input.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setInput('')
  }

  return (
    <div className="border border-gray-200 rounded-lg p-2 min-h-[38px] flex flex-wrap gap-1">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="text-gray-400 hover:text-gray-700">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
        onBlur={add}
        placeholder={values.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] text-xs outline-none bg-transparent"
      />
    </div>
  )
}

function EditCandidateModal({
  candidate,
  onClose,
  onSaved,
}: {
  candidate: AdminCandidate
  onClose: () => void
  onSaved: (updated: AdminCandidate) => void
}) {
  const [tab, setTab] = useState<'profile' | 'files'>('profile')
  const [form, setForm] = useState({
    title: candidate.title ?? '',
    location: candidate.location ?? '',
    phone: candidate.phone ?? '',
    gender: candidate.gender ?? '',
    age_range: candidate.age_range ?? '',
    experience_years: String(candidate.experience_years ?? ''),
    qualification: candidate.qualification ?? '',
    job_category: candidate.job_category ?? '',
    salary_type: candidate.salary_type ?? '',
    show_profile: candidate.show_profile ?? false,
  })
  const [languages, setLanguages] = useState<string[]>(Array.isArray(candidate.languages) ? candidate.languages : [])
  const [skills, setSkills] = useState<string[]>(Array.isArray(candidate.skills) ? candidate.skills : [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // File state
  const photoInputRef = useRef<HTMLInputElement>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [fileSuccess, setFileSuccess] = useState<string | null>(null)

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent'
  const inputStyle = { '--tw-ring-color': '#033BB0' } as React.CSSProperties

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form, languages, skills }
      const updated = await api.put(`/api/admin/candidates/${candidate.id}/profile`, payload) as AdminCandidate
      onSaved(updated)
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadPhoto() {
    if (!photoFile) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('uj_token') : null
    if (!token) return
    setUploadingPhoto(true)
    setFileSuccess(null)
    try {
      const fd = new FormData()
      fd.append('photo', photoFile)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/candidates/${candidate.id}/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: fd,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json() as { profile_photo_path: string }
      setFileSuccess('Photo uploaded successfully.')
      setPhotoFile(null)
      setPhotoPreview(null)
      onSaved({ ...candidate, profile_photo_path: data.profile_photo_path })
    } catch {
      setError('Photo upload failed.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleUploadCv() {
    if (!cvFile) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('uj_token') : null
    if (!token) return
    setUploadingCv(true)
    setFileSuccess(null)
    try {
      const fd = new FormData()
      fd.append('cv', cvFile)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/candidates/${candidate.id}/cv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: fd,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json() as { cv_path: string }
      setFileSuccess('CV uploaded successfully.')
      setCvFile(null)
      onSaved({ ...candidate, cv_path: data.cv_path })
    } catch {
      setError('CV upload failed.')
    } finally {
      setUploadingCv(false)
    }
  }

  const name = candidate.user?.display_name ?? candidate.user?.email ?? `Candidate #${candidate.id}`
  const initials = name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: '#033BB0' }}>
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">Edit Candidate</h3>
              <p className="text-xs text-gray-500">{candidate.user?.email ?? '—'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 shrink-0">
          {(['profile', 'files'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setFileSuccess(null) }}
              className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize"
              style={tab === t
                ? { borderColor: '#033BB0', color: '#033BB0' }
                : { borderColor: 'transparent', color: '#6b7280' }}
            >
              {t === 'profile' ? 'Profile Info' : 'Files'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>
          )}
          {fileSuccess && (
            <div className="mb-4 p-3 rounded-lg text-sm text-green-700 bg-green-50 border border-green-200">{fileSuccess}</div>
          )}

          {tab === 'profile' && (
            <form id="candidate-profile-form" onSubmit={handleSaveProfile}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                    <input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. Software Engineer" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                    <input value={form.location} onChange={(e) => set('location', e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. London, UK" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                    <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                    <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={inputCls} style={inputStyle}>
                      <option value="">Not specified</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Age Range</label>
                    <select value={form.age_range} onChange={(e) => set('age_range', e.target.value)} className={inputCls} style={inputStyle}>
                      <option value="">Not specified</option>
                      <option value="18-24">18–24</option>
                      <option value="25-34">25–34</option>
                      <option value="35-44">35–44</option>
                      <option value="45-54">45–54</option>
                      <option value="55+">55+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Experience</label>
                    <input value={form.experience_years} onChange={(e) => set('experience_years', e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. 3 years" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Qualification</label>
                    <input value={form.qualification} onChange={(e) => set('qualification', e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. BSc Computer Science" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Job Category</label>
                    <input value={form.job_category} onChange={(e) => set('job_category', e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. Technology" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Salary Type</label>
                  <select value={form.salary_type} onChange={(e) => set('salary_type', e.target.value)} className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none`}>
                    <option value="">Not specified</option>
                    <option value="annual">Annual</option>
                    <option value="monthly">Monthly</option>
                    <option value="daily">Daily</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Languages</label>
                  <TagInput values={languages} onChange={setLanguages} placeholder="Type language + Enter" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Skills</label>
                  <TagInput values={skills} onChange={setSkills} placeholder="Type skill + Enter" />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="relative w-9 h-5 rounded-full transition-colors"
                      style={{ backgroundColor: form.show_profile ? '#033BB0' : '#D1D5DB' }}
                      onClick={() => set('show_profile', !form.show_profile)}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.show_profile ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Profile Visible to Employers</span>
                  </label>
                </div>
              </div>
            </form>
          )}

          {tab === 'files' && (
            <div className="space-y-6">
              {/* Profile photo */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Profile Photo</h4>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-gray-100">
                    {(photoPreview ?? candidate.profile_photo_path) ? (
                      <img src={photoPreview ?? candidate.profile_photo_path!} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold" style={{ color: '#033BB0' }}>{initials}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setPhotoFile(file)
                      setPhotoPreview(URL.createObjectURL(file))
                    }} />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 mb-2"
                    >
                      Choose Photo
                    </button>
                    {photoFile && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-600 truncate max-w-[180px]">{photoFile.name}</p>
                        <button
                          type="button"
                          onClick={handleUploadPhoto}
                          disabled={uploadingPhoto}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white disabled:opacity-60"
                          style={{ backgroundColor: '#033BB0' }}
                        >
                          {uploadingPhoto ? 'Uploading…' : 'Upload'}
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP · max 2MB</p>
                  </div>
                </div>
              </div>

              {/* CV */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">CV / Resume</h4>
                {candidate.cv_path && (
                  <div className="flex items-center gap-2 mb-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <a href={candidate.cv_path} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline truncate" style={{ color: '#033BB0' }}>
                      View Current CV ↗
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />
                  <button
                    type="button"
                    onClick={() => cvInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Choose CV
                  </button>
                  {cvFile && (
                    <>
                      <p className="text-xs text-gray-600 truncate max-w-[180px]">{cvFile.name}</p>
                      <button
                        type="button"
                        onClick={handleUploadCv}
                        disabled={uploadingCv}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white disabled:opacity-60"
                        style={{ backgroundColor: '#033BB0' }}
                      >
                        {uploadingCv ? 'Uploading…' : 'Upload'}
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC or DOCX · max 5MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Close
          </button>
          {tab === 'profile' && (
            <button
              type="submit"
              form="candidate-profile-form"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60"
              style={{ backgroundColor: '#033BB0' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionsMenu({
  candidate,
  onEditProfile,
}: {
  candidate: AdminCandidate
  onEditProfile: () => void
}) {
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
        <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
          <button
            onClick={() => { setOpen(false); onEditProfile() }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit Profile
          </button>
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
  const [editTarget, setEditTarget] = useState<AdminCandidate | null>(null)

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

  function handleCandidateSaved(updated: AdminCandidate) {
    setCandidates((prev) => prev.map((c) => c.id === updated.id ? { ...c, ...updated } : c))
    if (editTarget?.id === updated.id) setEditTarget((prev) => prev ? { ...prev, ...updated } : prev)
    showToast('Candidate profile updated.', 'success')
  }

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
    <>
    {editTarget && (
      <EditCandidateModal
        candidate={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={handleCandidateSaved}
      />
    )}
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Candidates</h1>
        <p className="text-sm text-gray-500 mt-1">Manage candidate profiles · {meta.total.toLocaleString()} total</p>
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
                    const cname = c.user?.display_name ?? 'Unknown'
                    const initials = cname.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
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
                              <p className="font-medium text-gray-900 truncate max-w-[160px]">{cname}</p>
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
                          <ActionsMenu candidate={c} onEditProfile={() => setEditTarget(c)} />
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
    </>
  )
}
