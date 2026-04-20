'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { CreditBalance, JobCategory } from '@/types'
import { DuaHandsIcon } from '@/components/ui/IslamicIcons'

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship', 'Temporary', 'Volunteer']
const EXPERIENCE_LEVELS = ['Fresh', '1 Year', '2 Year', '3 Year', '4 Year', '5+ Year']
const CAREER_LEVELS = ['Student', 'Officer', 'Manager', 'Executive', 'Others']
const SALARY_TYPES = ['Monthly', 'Yearly', 'Hourly']
const CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'AED', 'SAR', 'MYR']

interface FormState {
  title: string
  category_id: string
  job_type: string
  location: string
  country: string
  experience_level: string
  career_level: string
  description: string
  apply_type: 'external' | 'platform'
  apply_url: string
  salary_min: string
  salary_max: string
  salary_currency: string
  salary_type: string
  is_urgent: boolean
}

const initialForm: FormState = {
  title: '',
  category_id: '',
  job_type: '',
  location: '',
  country: '',
  experience_level: '',
  career_level: '',
  description: '',
  apply_type: 'external',
  apply_url: '',
  salary_min: '',
  salary_max: '',
  salary_currency: 'USD',
  salary_type: 'Monthly',
  is_urgent: false,
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {[1, 2, 3].map((s, i) => (
        <div key={s} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s <= current ? 'text-white' : 'bg-gray-200 text-gray-500'
              }`}
              style={s <= current ? { backgroundColor: '#033BB0' } : undefined}
            >
              {s < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
              {s === 1 ? 'Basics' : s === 2 ? 'Details' : 'Review'}
            </span>
          </div>
          {i < 2 && <div className={`flex-1 h-0.5 w-12 ${s < current ? '' : 'bg-gray-200'}`} style={s < current ? { backgroundColor: '#033BB0' } : undefined} />}
        </div>
      ))}
    </div>
  )
}

export default function PostJobPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(initialForm)
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [responsibilities, setResponsibilities] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Restore draft if returning from packages page
    const draft = localStorage.getItem('uj_draft_job')
    if (draft) {
      try {
        const data = JSON.parse(draft) as FormState
        setForm(data)
        setStep(3)
        localStorage.removeItem('uj_draft_job')
        showToast('Your draft job has been restored!', 'success')
      } catch {
        localStorage.removeItem('uj_draft_job')
      }
    }

    Promise.all([
      api.get('/api/categories'),
      api.get('/api/employer/packages/balance'),
    ]).then(([cats, bal]: [JobCategory[], CreditBalance]) => {
      setCategories(cats)
      setBalance(bal)
    }).catch(() => {})
  }, [])

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function validateStep1() {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Job title is required.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep2() {
    const errs: Record<string, string> = {}
    if (form.description.trim().length < 100) errs.description = 'Description must be at least 100 characters.'
    if (form.apply_type === 'external' && !form.apply_url.trim()) errs.apply_url = 'External URL is required.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function generateDescription() {
    if (!responsibilities.trim()) {
      showToast('Enter some key responsibilities first.', 'error')
      return
    }
    setGenerating(true)
    try {
      const categoryName = categories.find((c) => String(c.id) === form.category_id)?.name ?? ''
      const payload = {
        title: form.title,
        job_type: form.job_type || null,
        location: form.location || null,
        experience_level: form.experience_level || null,
        career_level: form.career_level || null,
        category: categoryName || null,
        responsibilities,
        requirements: null,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        salary_currency: form.salary_currency || null,
        salary_type: form.salary_type || null,
        is_urgent: form.is_urgent,
      }
      const res = await api.post('/api/employer/jobs/generate-description', payload) as { description: string }
      set('description', res.description)
      showToast('Description generated! Review and edit as needed.', 'success')
    } catch {
      showToast('Failed to generate description. Please try again.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await api.post('/api/employer/jobs', {
        ...form,
        category_id: form.category_id || null,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
      })
      // Bust the homepage cache so the new job appears immediately
      fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATION_SECRET}`, {
        method: 'POST',
      }).catch(() => {})
      showToast('JazakAllah Khayran! Your job is live.', 'success')
      setTimeout(() => router.push('/employer/jobs'), 1500)
    } catch (err: unknown) {
      const e = err as { error?: string; message?: string }
      if (e?.error === 'no_credits') {
        showToast('No credits available. Please purchase a package.', 'error')
      } else {
        showToast(e?.message ?? 'Failed to post job. Please try again.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const activePackage = balance?.packages?.find((p) => p.credits_remaining > 0) ?? null
  const hasCredits = (balance?.total_credits ?? 0) > 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Post a Job</h1>
        <p className="text-sm text-gray-400 mt-1">Fill in the details to post your listing</p>
      </div>

      <StepIndicator current={step} />

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-900 mb-4">Job Basics</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ borderColor: errors.title ? '#ef4444' : '#d1d5db', '--tw-ring-color': '#033BB0' } as React.CSSProperties}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => set('category_id', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  value={form.job_type}
                  onChange={(e) => set('job_type', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                >
                  <option value="">Select type</option>
                  {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="e.g. London or Remote"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => set('country', e.target.value)}
                  placeholder="e.g. United Kingdom"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  value={form.experience_level}
                  onChange={(e) => set('experience_level', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                >
                  <option value="">Select level</option>
                  {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Career Level</label>
                <select
                  value={form.career_level}
                  onChange={(e) => set('career_level', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                >
                  <option value="">Select level</option>
                  {CAREER_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => { if (validateStep1()) setStep(2) }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#033BB0' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-900 mb-4">Job Details</h2>

            {/* Key Responsibilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Responsibilities
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Enter main responsibilities, one per line or comma-separated. These will shape the job description.
              </p>
              <textarea
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                rows={4}
                placeholder={"e.g. Manage a team of developers,\nReview and merge pull requests,\nCoordinate with product team..."}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
              />
            </div>

            {/* Generate Description button */}
            <div>
              <button
                type="button"
                onClick={generateDescription}
                disabled={generating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-60"
                style={{ borderColor: '#033BB0', color: '#033BB0' }}
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15} className="shrink-0">
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                    Generate Description
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Edit the generated description or write your own.
              </p>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={8}
                placeholder="Describe the role, responsibilities, requirements, and benefits…"
                className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                style={{ borderColor: errors.description ? '#ef4444' : '#d1d5db', '--tw-ring-color': '#033BB0' } as React.CSSProperties}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description
                  ? <p className="text-xs text-red-500">{errors.description}</p>
                  : <span />}
                <span className={`text-xs ${form.description.length < 100 ? 'text-gray-400' : 'text-green-600'}`}>
                  {form.description.length} chars {form.description.length < 100 ? `(need ${100 - form.description.length} more)` : '✓'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application Method</label>
              <div className="flex gap-4">
                {(['external', 'platform'] as const).map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={form.apply_type === type}
                      onChange={() => set('apply_type', type)}
                      className="accent-[#033BB0]"
                    />
                    <span className="text-sm text-gray-700">
                      {type === 'external' ? 'External URL' : 'On Platform'}
                    </span>
                  </label>
                ))}
              </div>
              {form.apply_type === 'external' ? (
                <div className="mt-3">
                  <input
                    type="url"
                    value={form.apply_url}
                    onChange={(e) => set('apply_url', e.target.value)}
                    placeholder="https://yourcompany.com/apply"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ borderColor: errors.apply_url ? '#ef4444' : '#d1d5db', '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                  />
                  {errors.apply_url && <p className="text-xs text-red-500 mt-1">{errors.apply_url}</p>}
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2">
                  Candidates will apply directly through UmmahJobs.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary (optional)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  type="number"
                  value={form.salary_min}
                  onChange={(e) => set('salary_min', e.target.value)}
                  placeholder="Min"
                  min={0}
                  className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                />
                <input
                  type="number"
                  value={form.salary_max}
                  onChange={(e) => set('salary_max', e.target.value)}
                  placeholder="Max"
                  min={0}
                  className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                />
                <select
                  value={form.salary_currency}
                  onChange={(e) => set('salary_currency', e.target.value)}
                  className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={form.salary_type}
                  onChange={(e) => set('salary_type', e.target.value)}
                  className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                >
                  {SALARY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_urgent}
                  onChange={(e) => set('is_urgent', e.target.checked)}
                  className="w-4 h-4 rounded accent-[#033BB0]"
                />
                <span className="text-sm font-medium text-gray-700">Mark as Urgent</span>
              </label>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => { if (validateStep2()) setStep(3) }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#033BB0' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-900 mb-4">Review & Submit</h2>

            {/* Preview card */}
            <div className="rounded-xl border border-gray-200 p-5 bg-gray-50">
              <div className="flex flex-wrap gap-2 mb-3">
                {form.is_urgent && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    <svg viewBox="0 0 24 24" fill="currentColor" width={12} height={12}><path d="M13 2L3 14h9l-1 8 10-12h-9z" /></svg>
                    Urgent
                  </span>
                )}
                {form.job_type && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{form.job_type}</span>
                )}
                {form.category_id && categories.find((c) => String(c.id) === form.category_id) && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                    {categories.find((c) => String(c.id) === form.category_id)?.name}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{form.title}</h3>
              {form.location && <p className="text-sm text-gray-500 mb-3">📍 {form.location}{form.country ? `, ${form.country}` : ''}</p>}
              <p className="text-sm text-gray-700 leading-relaxed">
                {form.description.slice(0, 300)}{form.description.length > 300 ? '…' : ''}
              </p>
              {(form.salary_min || form.salary_max) && (
                <p className="text-sm font-medium mt-3" style={{ color: '#033BB0' }}>
                  {form.salary_currency} {form.salary_min || '?'} – {form.salary_max || '?'} {form.salary_type}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-3">
                Application: {form.apply_type === 'external' ? form.apply_url : 'On Platform'}
              </p>
            </div>

            {/* Credit notice */}
            {hasCredits && activePackage ? (
              <div className="rounded-xl p-4" style={{ backgroundColor: '#E6EDFF' }}>
                <p className="text-sm text-blue-800">
                  Posting this job will use <strong>1 credit</strong> from your{' '}
                  <strong>{activePackage.package?.name}</strong> package.
                  You will have <strong>{activePackage.credits_remaining - 1}</strong> credits remaining
                  after this post.
                </p>
              </div>
            ) : (
              <div className="rounded-xl p-4 bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 mb-2">
                  You have no active credits. Please purchase a package to post this job.
                </p>
                <button
                  onClick={() => {
                    localStorage.setItem('uj_draft_job', JSON.stringify(form))
                    router.push('/employer/packages?success_redirect=/employer/post-job')
                  }}
                  className="text-sm font-medium underline text-red-700 cursor-pointer bg-transparent border-0 p-0"
                >
                  Buy a package →
                </button>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Edit
              </button>
              <button
                onClick={() => {
                  if (!hasCredits) {
                    localStorage.setItem('uj_draft_job', JSON.stringify(form))
                    router.push('/employer/packages?success_redirect=/employer/post-job')
                    return
                  }
                  handleSubmit()
                }}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#033BB0' }}
              >
                {submitting ? 'Posting…' : !hasCredits ? 'Buy Credits to Post' : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Post Job <DuaHandsIcon size={16} />
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
