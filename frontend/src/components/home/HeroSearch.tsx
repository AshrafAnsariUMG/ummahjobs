'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JobCategory } from '@/types'

const JOB_TYPES = ['Full Time', 'Part Time', 'Remote', 'Contract', 'Internship']

interface HeroSearchProps {
  categories: JobCategory[]
}

export default function HeroSearch({ categories }: HeroSearchProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (location) params.set('location', location)
    if (category) params.set('category', category)
    router.push(`/jobs${params.toString() ? '?' + params.toString() : ''}`)
  }

  function handleQuickFilter(jobType: string) {
    router.push(`/jobs?job_type=${encodeURIComponent(jobType)}`)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          {/* Search input */}
          <div className="flex items-center gap-2 flex-1 px-3">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Job title, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 py-3 text-sm outline-none bg-transparent placeholder-gray-400"
            />
          </div>

          <div className="hidden md:block w-px bg-gray-200 my-2" />

          {/* Location */}
          <div className="flex items-center gap-2 flex-1 px-3">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              placeholder="State or Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 py-3 text-sm outline-none bg-transparent placeholder-gray-400"
            />
          </div>

          <div className="hidden md:block w-px bg-gray-200 my-2" />

          {/* Category dropdown */}
          <div className="flex items-center gap-2 flex-1 px-3">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 py-3 text-sm outline-none bg-transparent text-gray-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="py-3 px-6 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
            style={{ backgroundColor: '#033BB0' }}
          >
            Find Jobs
          </button>
        </div>
      </form>

      {/* Quick filter pills */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-sm text-gray-500 self-center">Quick:</span>
        {JOB_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleQuickFilter(type)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 bg-white hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  )
}
