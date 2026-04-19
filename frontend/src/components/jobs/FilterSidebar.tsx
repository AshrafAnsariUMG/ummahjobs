'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import type { JobCategory, JobType } from '@/types'
import MANAd from '@/components/ads/MANAdBanner'

interface Props {
  categories: JobCategory[]
  jobTypes: JobType[]
}

const LOCATIONS = ['United Kingdom', 'United States', 'Canada', 'Australia', 'UAE', 'Saudi Arabia', 'Malaysia']
const EXPERIENCE = [
  { label: 'Entry Level', value: 'entry' },
  { label: 'Mid Level', value: 'mid' },
  { label: 'Senior', value: 'senior' },
  { label: 'Manager', value: 'manager' },
  { label: 'Executive', value: 'executive' },
]
const WORK_TYPES = [
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'On-site', value: 'on-site' },
]
const DATE_POSTED = [
  { label: 'Any time', value: '' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
]

export default function FilterSidebar({ categories, jobTypes }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [salaryMin, setSalaryMin] = useState(searchParams.get('salary_min') ?? '')
  const [salaryMax, setSalaryMax] = useState(searchParams.get('salary_max') ?? '')

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/jobs?${params.toString()}`)
    },
    [router, searchParams],
  )

  const active = useCallback((key: string, value: string) => searchParams.get(key) === value, [searchParams])

  function clearAll() {
    setSalaryMin('')
    setSalaryMax('')
    router.push('/jobs')
  }

  function applySalary() {
    const params = new URLSearchParams(searchParams.toString())
    if (salaryMin) params.set('salary_min', salaryMin)
    else params.delete('salary_min')
    if (salaryMax) params.set('salary_max', salaryMax)
    else params.delete('salary_max')
    params.delete('page')
    router.push(`/jobs?${params.toString()}`)
  }

  const FILTER_KEYS = ['category', 'job_type', 'location', 'experience_level', 'featured', 'work_type', 'date_posted', 'salary_min', 'salary_max']
  const hasFilters = FILTER_KEYS.some((k) => searchParams.has(k))

  const sectionLabel = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'
  const pillBtn = (isActive: boolean) =>
    `w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
      isActive ? 'font-medium text-white' : 'text-gray-700 hover:bg-gray-50'
    }`

  return (
    <aside className="w-full">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs font-medium hover:underline" style={{ color: '#033BB0' }}>
              Clear all
            </button>
          )}
        </div>

        {/* Featured */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={searchParams.get('featured') === '1'}
              onChange={(e) => update('featured', e.target.checked ? '1' : null)}
              className="w-4 h-4 rounded border-gray-300 accent-[#033BB0]"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">Featured jobs only</span>
          </label>
        </div>

        {/* Date Posted */}
        <div>
          <p className={sectionLabel}>Date Posted</p>
          <div className="space-y-2">
            {DATE_POSTED.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="date_posted"
                  checked={(searchParams.get('date_posted') ?? '') === opt.value}
                  onChange={() => update('date_posted', opt.value || null)}
                  className="w-4 h-4 accent-[#033BB0]"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Work Type */}
        <div>
          <p className={sectionLabel}>Work Type</p>
          <div className="space-y-2">
            {WORK_TYPES.map((wt) => (
              <label key={wt.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={searchParams.get('work_type') === wt.value}
                  onChange={(e) => update('work_type', e.target.checked ? wt.value : null)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#033BB0]"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{wt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <p className={sectionLabel}>Category</p>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => update('category', active('category', cat.slug) ? null : cat.slug)}
                className={pillBtn(active('category', cat.slug))}
                style={active('category', cat.slug) ? { backgroundColor: '#033BB0' } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Job Type */}
        <div>
          <p className={sectionLabel}>Job Type</p>
          <div className="space-y-1.5">
            {jobTypes.map((jt) => (
              <button
                key={jt.id}
                onClick={() => update('job_type', active('job_type', jt.slug) ? null : jt.slug)}
                className={pillBtn(active('job_type', jt.slug))}
                style={active('job_type', jt.slug) ? { backgroundColor: '#033BB0' } : undefined}
              >
                {jt.name}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <p className={sectionLabel}>Location</p>
          <div className="space-y-1.5">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => update('location', active('location', loc) ? null : loc)}
                className={pillBtn(active('location', loc))}
                style={active('location', loc) ? { backgroundColor: '#033BB0' } : undefined}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <p className={sectionLabel}>Experience</p>
          <div className="space-y-1.5">
            {EXPERIENCE.map((exp) => (
              <button
                key={exp.value}
                onClick={() => update('experience_level', active('experience_level', exp.value) ? null : exp.value)}
                className={pillBtn(active('experience_level', exp.value))}
                style={active('experience_level', exp.value) ? { backgroundColor: '#033BB0' } : undefined}
              >
                {exp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <p className={sectionLabel}>Salary Range (USD)</p>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              placeholder="Min $"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              min={0}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
            />
            <input
              type="number"
              placeholder="Max $"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              min={0}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
            />
          </div>
          <button
            onClick={applySalary}
            className="w-full text-sm font-medium py-1.5 rounded-lg border transition-colors hover:text-white"
            style={{ borderColor: '#033BB0', color: '#033BB0' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#033BB0'; (e.currentTarget as HTMLButtonElement).style.color = 'white' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''; (e.currentTarget as HTMLButtonElement).style.color = '#033BB0' }}
          >
            Apply Salary Filter
          </button>
        </div>

        {/* Decorative accent */}
        <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.08 }}>
          <svg viewBox="0 0 60 60" width={60} height={60} fill="none" stroke="#033BB0" strokeWidth="0.8">
            <polygon points="30,2 35,18 50,10 42,26 58,30 42,34 50,50 35,42 30,58 25,42 10,50 18,34 2,30 18,26 10,10 25,18" />
            <circle cx="30" cy="30" r="10" />
            <circle cx="30" cy="30" r="20" />
          </svg>
        </div>
      </div>

      {/* Sidebar ad */}
      <div className="hidden lg:block" style={{ marginTop: '24px' }}>
        <p style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'center', marginBottom: '4px' }}>Advertisement</p>
        <MANAd size="sidebar-wide" />
      </div>
    </aside>
  )
}
