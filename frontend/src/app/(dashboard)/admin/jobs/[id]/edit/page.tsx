'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import { getStorageUrl } from '@/lib/imageUtils'
import RichTextEditor from '@/components/ui/RichTextEditor'

interface EmployerResult {
  id: number
  company_name: string
  slug: string
  logo_path: string | null
}

interface Category {
  id: number
  name: string
}

interface JobType {
  id: number
  name: string
}

interface JobDetail {
  id: number
  title: string
  slug: string
  description: string
  status: 'active' | 'draft' | 'expired'
  is_featured: boolean
  is_urgent: boolean
  employer_id: number | null
  employer: EmployerResult | null
  external_employer_name: string | null
  external_employer_website: string | null
  external_employer_email: string | null
  category_id: number | null
  category: { id: number; name: string } | null
  job_type: string | null
  location: string | null
  country: string | null
  experience_level: string | null
  career_level: string | null
  apply_type: 'external' | 'platform'
  apply_url: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  salary_type: string | null
  expires_at: string | null
  created_at: string
}

const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive']
const CAREER_LEVELS = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Manager', 'Director', 'C-Level']
const SALARY_TYPES = ['per_year', 'per_month', 'per_hour', 'fixed']
const SALARY_CURRENCIES = ['USD', 'GBP', 'EUR', 'AED', 'SAR', 'PKR', 'BDT', 'MYR']

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${checked ? 'bg-green-500' : 'bg-gray-200'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      <span className="sr-only">{label}</span>
    </button>
  )
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  body: string
  confirmLabel: string
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
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminEditJobPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<JobDetail | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Employer type toggle
  const [employerType, setEmployerType] = useState<'existing' | 'external'>('existing')

  // Existing employer search
  const [employerQuery, setEmployerQuery] = useState('')
  const [employerResults, setEmployerResults] = useState<EmployerResult[]>([])
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerResult | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // External employer fields
  const [externalName, setExternalName] = useState('')
  const [externalWebsite, setExternalWebsite] = useState('')
  const [externalEmail, setExternalEmail] = useState('')

  // Categories / job types
  const [categories, setCategories] = useState<Category[]>([])
  const [jobTypes, setJobTypes] = useState<JobType[]>([])

  // Form fields
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [jobType, setJobType] = useState('')
  const [location, setLocation] = useState('')
  const [country, setCountry] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [careerLevel, setCareerLevel] = useState('')
  const [description, setDescription] = useState('')
  const [applyType, setApplyType] = useState<'external' | 'platform'>('external')
  const [applyUrl, setApplyUrl] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [salaryCurrency, setSalaryCurrency] = useState('USD')
  const [salaryType, setSalaryType] = useState('per_year')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [status, setStatus] = useState<'active' | 'draft' | 'expired'>('active')
  const [expiresAt, setExpiresAt] = useState('')

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load job + categories + job types
  useEffect(() => {
    Promise.all([
      api.get(`/api/admin/jobs/${id}`),
      api.get('/api/categories'),
      api.get('/api/job-types'),
    ]).then(([jobData, cats, types]) => {
      const j = jobData as JobDetail
      setJob(j)
      setCategories(cats as Category[])
      setJobTypes(types as JobType[])

      // Pre-fill form
      setTitle(j.title)
      setDescription(j.description)
      setCategoryId(j.category_id ? String(j.category_id) : '')
      setJobType(j.job_type ?? '')
      setLocation(j.location ?? '')
      setCountry(j.country ?? '')
      setExperienceLevel(j.experience_level ?? '')
      setCareerLevel(j.career_level ?? '')
      setApplyType(j.apply_type)
      setApplyUrl(j.apply_url ?? '')
      setSalaryMin(j.salary_min != null ? String(j.salary_min) : '')
      setSalaryMax(j.salary_max != null ? String(j.salary_max) : '')
      setSalaryCurrency(j.salary_currency ?? 'USD')
      setSalaryType(j.salary_type ?? 'per_year')
      setIsFeatured(j.is_featured)
      setIsUrgent(j.is_urgent)
      setStatus(j.status)
      setExpiresAt(j.expires_at ? j.expires_at.split('T')[0] : '')

      if (j.employer) {
        setEmployerType('existing')
        setSelectedEmployer(j.employer)
      } else {
        setEmployerType('external')
        setExternalName(j.external_employer_name ?? '')
        setExternalWebsite(j.external_employer_website ?? '')
        setExternalEmail(j.external_employer_email ?? '')
      }
    }).catch(() => {
      showToast('Failed to load job.', 'error')
    }).finally(() => setLoading(false))
  }, [id])

  // Employer search debounce
  useEffect(() => {
    if (!employerQuery || employerQuery.length < 2) {
      setEmployerResults([])
      setSearchOpen(false)
      return
    }
    const t = setTimeout(() => {
      api.get(`/api/admin/employers/search?q=${encodeURIComponent(employerQuery)}`)
        .then((d: unknown) => {
          const res = (d as { employers: EmployerResult[] }).employers
          setEmployerResults(res)
          setSearchOpen(res.length > 0)
        })
        .catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [employerQuery])

  // Close dropdown on outside click
  useEffect(() => {
    function h(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (employerType === 'existing' && !selectedEmployer) {
      showToast('Please select an employer.', 'error')
      return
    }
    if (employerType === 'external' && !externalName.trim()) {
      showToast('Please enter the external employer name.', 'error')
      return
    }
    setSaving(true)
    setErrors({})
    try {
      const effectiveApplyType = employerType === 'external' ? 'external' : applyType
      const body: Record<string, unknown> = {
        employer_type: employerType,
        title,
        description,
        apply_type: effectiveApplyType,
        status,
        is_featured: isFeatured,
        is_urgent: isUrgent,
      }
      if (employerType === 'existing') {
        body.employer_id = selectedEmployer!.id
      } else {
        body.external_employer_name = externalName.trim()
        if (externalWebsite.trim()) body.external_employer_website = externalWebsite.trim()
        if (externalEmail.trim()) body.external_employer_email = externalEmail.trim()
        if (applyUrl.trim()) body.apply_url = applyUrl.trim()
      }
      if (categoryId) body.category_id = parseInt(categoryId)
      if (jobType) body.job_type = jobType
      if (location) body.location = location
      if (country) body.country = country
      if (experienceLevel) body.experience_level = experienceLevel
      if (careerLevel) body.career_level = careerLevel
      if (effectiveApplyType === 'external' && applyUrl && employerType !== 'external') body.apply_url = applyUrl
      if (salaryMin) body.salary_min = parseInt(salaryMin)
      if (salaryMax) body.salary_max = parseInt(salaryMax)
      if (salaryCurrency) body.salary_currency = salaryCurrency
      if (salaryType) body.salary_type = salaryType
      if (expiresAt) body.expires_at = expiresAt

      await api.put(`/api/admin/jobs/${id}`, body)
      showToast('Job updated successfully.', 'success')
      setTimeout(() => router.push('/admin/jobs'), 1500)
    } catch (err: unknown) {
      const e = err as { message?: string; errors?: Record<string, string[]> }
      if (e.errors) {
        const flat: Record<string, string> = {}
        for (const [k, v] of Object.entries(e.errors)) {
          flat[k] = Array.isArray(v) ? v[0] : v
        }
        setErrors(flat)
      }
      showToast(e.message ?? 'Failed to update job.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.delete(`/api/admin/jobs/${id}`)
      showToast('Job deleted.', 'success')
      router.push('/admin/jobs')
    } catch {
      showToast('Failed to delete job.', 'error')
      setDeleting(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent'
  const ringStyle = { '--tw-ring-color': '#033BB0' } as React.CSSProperties
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  function FieldError({ field }: { field: string }) {
    if (!errors[field]) return null
    return <p className="text-xs text-red-600 mt-1">{errors[field]}</p>
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-48" />
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-sm text-gray-500">Job not found.</p>
        <Link href="/admin/jobs" className="text-sm text-blue-600 hover:underline mt-2 inline-block">← Back to jobs</Link>
      </div>
    )
  }

  return (
    <>
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Job Listing"
          body={`Delete "${job.title}"? This cannot be undone.`}
          confirmLabel={deleting ? 'Deleting…' : 'Delete'}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link href="/admin/jobs" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
              ← Admin Jobs
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900">Edit Job</h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{job.slug}</span>
              <span className="mx-2 text-gray-300">·</span>
              Posted {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <a
            href={`/jobs/${job.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 whitespace-nowrap"
          >
            View Listing
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Employer selector */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-1">Employer</h2>
            <p className="text-sm text-gray-500 mb-4">Choose an existing employer or enter an external company</p>

            {/* Type toggle */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {(['existing', 'external'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setEmployerType(t); setSelectedEmployer(null); setEmployerQuery('') }}
                  className="p-3 rounded-xl border text-left transition-all"
                  style={employerType === t ? { borderColor: '#033BB0', backgroundColor: '#EFF6FF' } : { borderColor: '#E5E7EB' }}
                >
                  <p className="text-sm font-semibold capitalize" style={{ color: employerType === t ? '#033BB0' : '#374151' }}>
                    {t === 'existing' ? 'Existing Employer' : 'External Employer'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t === 'existing' ? 'Registered on UmmahJobs' : 'Not registered — external company'}
                  </p>
                </button>
              ))}
            </div>

            {employerType === 'existing' ? (
              selectedEmployer ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getStorageUrl(selectedEmployer.logo_path) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getStorageUrl(selectedEmployer.logo_path)!} alt={selectedEmployer.company_name} className="w-10 h-10 rounded-lg object-contain border border-gray-100 bg-white" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: '#033BB0' }}>
                        {selectedEmployer.company_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{selectedEmployer.company_name}</p>
                      <p className="text-xs text-gray-400">/{selectedEmployer.slug}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedEmployer(null); setEmployerQuery('') }}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg border border-gray-200 hover:bg-white"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div ref={searchRef} className="relative">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={employerQuery}
                      onChange={(e) => setEmployerQuery(e.target.value)}
                      placeholder="Search employers..."
                      className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={ringStyle}
                    />
                  </div>
                  {searchOpen && employerResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                      {employerResults.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => { setSelectedEmployer(emp); setSearchOpen(false); setEmployerQuery('') }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"
                        >
                          {getStorageUrl(emp.logo_path) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getStorageUrl(emp.logo_path)!} alt={emp.company_name} className="w-7 h-7 rounded object-contain border border-gray-100 shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#033BB0' }}>
                              {emp.company_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-gray-900">{emp.company_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Company Name *</label>
                  <input
                    type="text"
                    value={externalName}
                    onChange={(e) => setExternalName(e.target.value)}
                    className={inputClass}
                    style={ringStyle}
                    placeholder="e.g. Islamic Relief Worldwide"
                    required={employerType === 'external'}
                  />
                  <FieldError field="external_employer_name" />
                </div>
                <div>
                  <label className={labelClass}>Company Website</label>
                  <input
                    type="url"
                    value={externalWebsite}
                    onChange={(e) => setExternalWebsite(e.target.value)}
                    className={inputClass}
                    style={ringStyle}
                    placeholder="https://..."
                  />
                  <FieldError field="external_employer_website" />
                </div>
                <div>
                  <label className={labelClass}>Contact Email</label>
                  <input
                    type="email"
                    value={externalEmail}
                    onChange={(e) => setExternalEmail(e.target.value)}
                    className={inputClass}
                    style={ringStyle}
                    placeholder="jobs@company.com"
                  />
                  <FieldError field="external_employer_email" />
                </div>
                <div>
                  <label className={labelClass}>Application URL</label>
                  <input
                    type="url"
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                    className={inputClass}
                    style={ringStyle}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Link where candidates apply. External employer jobs always redirect externally.</p>
                  <FieldError field="apply_url" />
                </div>
              </div>
            )}
          </div>

          {/* Section 1 — Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Job Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={ringStyle} required />
                <FieldError field="title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass} style={ringStyle}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Job Type</label>
                  <select value={jobType} onChange={(e) => setJobType(e.target.value)} className={inputClass} style={ringStyle}>
                    <option value="">Select type</option>
                    {jobTypes.map((jt) => <option key={jt.id} value={jt.name}>{jt.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} style={ringStyle} placeholder="e.g. London, Remote" />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} style={ringStyle} placeholder="e.g. United Kingdom" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Experience Level</label>
                  <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className={inputClass} style={ringStyle}>
                    <option value="">Select level</option>
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Career Level</label>
                  <select value={careerLevel} onChange={(e) => setCareerLevel(e.target.value)} className={inputClass} style={ringStyle}>
                    <option value="">Select level</option>
                    {CAREER_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Description */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Description</h2>
            <div>
              <label className={labelClass}>Job Description *</label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe the role, responsibilities, requirements..."
                minHeight="300px"
              />
              <FieldError field="description" />
            </div>
          </div>

          {/* Section 3 — Application (only shown for existing employer jobs) */}
          {employerType === 'existing' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Application</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Apply Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['external', 'platform'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setApplyType(t)}
                        className="p-3 rounded-xl border text-left transition-all"
                        style={applyType === t ? { borderColor: '#033BB0', backgroundColor: '#EFF6FF' } : { borderColor: '#E5E7EB' }}
                      >
                        <p className="text-sm font-semibold capitalize" style={{ color: applyType === t ? '#033BB0' : '#374151' }}>{t}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {t === 'external' ? 'Redirect to external URL' : 'Apply via UmmahJobs platform'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                {applyType === 'external' && (
                  <div>
                    <label className={labelClass}>Application URL *</label>
                    <input
                      type="url"
                      value={applyUrl}
                      onChange={(e) => setApplyUrl(e.target.value)}
                      className={inputClass}
                      style={ringStyle}
                      placeholder="https://..."
                      required={applyType === 'external'}
                    />
                    <FieldError field="apply_url" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4 — Salary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Salary <span className="text-sm font-normal text-gray-400">(optional)</span></h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Min Salary</label>
                  <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className={inputClass} style={ringStyle} min="0" placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Max Salary</label>
                  <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className={inputClass} style={ringStyle} min="0" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Currency</label>
                  <select value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)} className={inputClass} style={ringStyle}>
                    {SALARY_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Salary Type</label>
                  <select value={salaryType} onChange={(e) => setSalaryType(e.target.value)} className={inputClass} style={ringStyle}>
                    {SALARY_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5 — Listing Options */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Listing Options</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">Featured Listing</p>
                  <p className="text-xs text-gray-400">Appears in featured carousel</p>
                </div>
                <ToggleSwitch checked={isFeatured} onChange={setIsFeatured} label="Featured" />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">Urgent Hiring</p>
                  <p className="text-xs text-gray-400">Shows urgent badge on listing</p>
                </div>
                <ToggleSwitch checked={isUrgent} onChange={setIsUrgent} label="Urgent" />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-700">Status</p>
                <div className="flex gap-2">
                  {(['active', 'draft', 'expired'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className="px-3 py-1 text-xs font-medium rounded-lg border transition-all capitalize"
                      style={status === s
                        ? { borderColor: '#033BB0', backgroundColor: '#EFF6FF', color: '#033BB0' }
                        : { borderColor: '#E5E7EB', color: '#6B7280' }
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Expires At</p>
                  <p className="text-xs text-gray-400">Leave blank for no expiry</p>
                </div>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={ringStyle}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || (employerType === 'existing' && !selectedEmployer) || (employerType === 'external' && !externalName.trim())}
              className="flex-1 py-3 text-sm font-semibold rounded-xl text-white disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#033BB0' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-3 text-sm font-semibold rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
