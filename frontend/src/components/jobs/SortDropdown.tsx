'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { label: 'Most Recent', value: '' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Featured First', value: 'featured' },
]

export default function SortDropdown({ currentSort }: { currentSort: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('sort', e.target.value)
    } else {
      params.delete('sort')
    }
    params.delete('page')
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 whitespace-nowrap">Sort by:</label>
      <select
        value={currentSort}
        onChange={handleChange}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-700"
        style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
