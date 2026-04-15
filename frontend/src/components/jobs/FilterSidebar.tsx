'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { JobCategory, JobType } from '@/types'
import MANAd from '@/components/ads/MANAdBanner'

interface Props {
  categories: JobCategory[]
  jobTypes: JobType[]
}

const LOCATIONS = ['Remote', 'United Kingdom', 'United States', 'Canada', 'Australia', 'UAE', 'Saudi Arabia', 'Malaysia']
const EXPERIENCE = [
  { label: 'Entry Level', value: 'entry' },
  { label: 'Mid Level', value: 'mid' },
  { label: 'Senior', value: 'senior' },
  { label: 'Manager', value: 'manager' },
  { label: 'Executive', value: 'executive' },
]

export default function FilterSidebar({ categories, jobTypes }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

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
    router.push('/jobs')
  }

  const hasFilters = ['category', 'job_type', 'location', 'experience_level', 'featured'].some(
    (k) => searchParams.has(k),
  )

  return (
    <aside className="w-full">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs font-medium hover:underline"
              style={{ color: '#033BB0' }}
            >
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

        {/* Category */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Category</p>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => update('category', active('category', cat.slug) ? null : cat.slug)}
                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  active('category', cat.slug)
                    ? 'font-medium text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={active('category', cat.slug) ? { backgroundColor: '#033BB0' } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Job Type */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Job Type</p>
          <div className="space-y-1.5">
            {jobTypes.map((jt) => (
              <button
                key={jt.id}
                onClick={() => update('job_type', active('job_type', jt.slug) ? null : jt.slug)}
                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  active('job_type', jt.slug)
                    ? 'font-medium text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={active('job_type', jt.slug) ? { backgroundColor: '#033BB0' } : undefined}
              >
                {jt.name}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Location</p>
          <div className="space-y-1.5">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => update('location', active('location', loc) ? null : loc)}
                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  active('location', loc)
                    ? 'font-medium text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={active('location', loc) ? { backgroundColor: '#033BB0' } : undefined}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Experience</p>
          <div className="space-y-1.5">
            {EXPERIENCE.map((exp) => (
              <button
                key={exp.value}
                onClick={() => update('experience_level', active('experience_level', exp.value) ? null : exp.value)}
                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  active('experience_level', exp.value)
                    ? 'font-medium text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={active('experience_level', exp.value) ? { backgroundColor: '#033BB0' } : undefined}
              >
                {exp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar-wide ad — desktop only */}
      <div className="hidden lg:block" style={{ marginTop: '24px' }}>
        <p style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'center', marginBottom: '4px' }}>Advertisement</p>
        <MANAd size="sidebar-wide" />
      </div>
    </aside>
  )
}
