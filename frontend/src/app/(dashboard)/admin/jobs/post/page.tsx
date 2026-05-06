'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

interface ExternalEmployerResult {
  id: number
  name: string
  website: string | null
  email: string | null
  logo_path: string | null
  logo_url: string | null
}

interface Category {
  id: number
  name: string
}

interface JobType {
  id: number
  name: string
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

export default function AdminPostJobPage() {
  const router = useRouter()
  const { showToast } = useToast()

  // Employer type toggle
  const [employerType, setEmployerType] = useState<'existing' | 'external'>('existing')

  // Existing employer search
  const [employerQuery, setEmployerQuery] = useState('')
  const [employerResults, setEmployerResults] = useState<EmployerResult[]>([])
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerResult | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // External employer fields + autocomplete
  const [externalName, setExternalName] = useState('')
  const [externalWebsite, setExternalWebsite] = useState('')
  const [externalEmail, setExternalEmail] = useState('')
  const [selectedExternalEmployerId, setSelectedExternalEmployerId] = useState<number | null>(null)
  const [extSearchResults, setExtSearchResults] = useState<ExternalEmployerResult[]>([])
  const [extSearchOpen, setExtSearchOpen] = useState(false)
  const extSearchRef = useRef<HTMLDivElement>(null)
  const [externalLogoFile, setExternalLogoFile] = useState<File | null>(null)
  const [externalLogoPreview, setExternalLogoPreview] = useState<string | null>(null)

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
  const [status, setStatus] = useState<'active' | 'draft'>('active')
  const [expiresAt, setExpiresAt] = useState('')

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load categories + job types
  useEffect(() => {
    api.get('/api/categories').then((d: unknown) => setCategories(d as Category[])).catch(() => {})
    api.get('/api/job-types').then((d: unknown) => setJobTypes(d as JobType[])).catch(() => {})
  }, [])

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

  // External employer name autocomplete
  useEffect(() => {
    if (!externalName || externalName.length < 2) {
      setExtSearchResults([])
      setExtSearchOpen(false)
      return
    }
    const t = setTimeout(() => {
      api.get(`/api/admin/external-employers?q=${encodeURIComponent(externalName)}`)
        .then((d: unknown) => {
          const res = (d as { employers: ExternalEmployerResult[] }).employers
          setExtSearchResults(res)
          setExtSearchOpen(res.length > 0)
        })
        .catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [externalName])

  // Close external dropdown on outside click
  useEffect(() => {
    function h(e: MouseEvent) {
      if (extSearchRef.current && !extSearchRef.current.contains(e.target as Node)) setExtSearchOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function handleExternalLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setExternalLogoFile(file)
    setExternalLogoPreview(URL.createObjectURL(file))
  }

  function selectExternalEmployer(emp: ExternalEmployerResult) {
    setExternalName(emp.name)
    setExternalWebsite(emp.website ?? '')
    setExternalEmail(emp.email ?? '')
    setSelectedExternalEmployerId(emp.id)
    setExternalLogoPreview(emp.logo_url ?? null)
    setExtSearchOpen(false)
  }

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
        // Find or create external employer record
        let extId = selectedExternalEmployerId
        if (!extId) {
          const extData = await api.post('/api/admin/external-employers', {
            name: externalName.trim(),
            website: externalWebsite.trim() || undefined,
            email: externalEmail.trim() || undefined,
          }) as ExternalEmployerResult
          extId = extData.id
        }
        // Upload logo if selected
        if (externalLogoFile && extId) {
          const fd = new FormData()
          fd.append('logo', externalLogoFile)
          await api.upload(`/api/admin/external-employers/${extId}/logo`, fd)
        }
        body.external_employer_id = extId
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

      await api.post('/api/admin/jobs', body)
      showToast('JazakAllah Khayran! Job posted.', 'success')
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
      showToast(e.message ?? 'Failed to post job.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent'
  const ringStyle = { '--tw-ring-color': '#033BB0' } as React.CSSProperties
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  function FieldError({ field }: { field: string }) {
    if (!errors[field]) return null
    return <p className="text-xs text-red-600 mt-1">{errors[field]}</p>
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/jobs" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
          ← Admin Jobs
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Post a Job</h1>
        <p className="text-sm text-gray-500 mt-1">Post a job on behalf of any employer</p>
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
              <div ref={extSearchRef} className="relative">
                <label className={labelClass}>Company Name *</label>
                <input
                  type="text"
                  value={externalName}
                  onChange={(e) => { setExternalName(e.target.value); setSelectedExternalEmployerId(null) }}
                  className={inputClass}
                  style={ringStyle}
                  placeholder="e.g. Islamic Relief Worldwide"
                  required={employerType === 'external'}
                  autoComplete="off"
                />
                {extSearchOpen && extSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                    {extSearchResults.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => selectExternalEmployer(emp)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"
                      >
                        {emp.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={emp.logo_url} alt={emp.name} className="w-7 h-7 rounded object-contain border border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white shrink-0 bg-gray-400">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-900">{emp.name}</p>
                          {emp.website && <p className="text-xs text-gray-400">{emp.website}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <FieldError field="external_employer_name" />
              </div>

              {/* Logo upload */}
              <div>
                <label className={labelClass}>Company Logo</label>
                <div className="flex items-center gap-4">
                  {externalLogoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={externalLogoPreview} alt="Logo preview" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'contain', border: '1px solid #E5E7EB' }} />
                  ) : (
                    <div style={{ width: 60, height: 60, background: '#F3F4F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#9CA3AF' }}>
                      🏢
                    </div>
                  )}
                  <div>
                    <input type="file" accept="image/*" onChange={handleExternalLogoSelect} className="text-xs text-gray-600" />
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG — max 2MB. Shown on job cards.</p>
                  </div>
                </div>
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
                {(['active', 'draft'] as const).map((s) => (
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

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || (employerType === 'existing' && !selectedEmployer) || (employerType === 'external' && !externalName.trim())}
          className="w-full py-3 text-sm font-semibold rounded-xl text-white disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#033BB0' }}
        >
          {saving ? 'Posting…' : 'Post Job'}
        </button>
      </form>
    </div>
  )
}
