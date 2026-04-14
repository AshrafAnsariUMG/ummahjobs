'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JobCategory } from '@/types'

const POPULAR_SEARCHES = [
  'Remote Jobs',
  'IT & Tech',
  'Healthcare',
  'Islamic Studies',
  'Nonprofit',
]

interface HeroSearchProps {
  categories: JobCategory[]
}

export default function HeroSearch({ categories }: HeroSearchProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')

  function handleSearch() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (location) params.set('location', location)
    if (category) params.set('category', category)
    router.push(`/jobs${params.toString() ? '?' + params.toString() : ''}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Unified search bar */}
      <div
        className="flex flex-col sm:flex-row sm:items-center"
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          border: '1px solid #E5E7EB',
          padding: '8px',
          maxWidth: '780px',
          margin: '0 auto',
          width: '100%',
          gap: '4px',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-2 px-3 py-3 sm:py-0 sm:border-r border-gray-200"
          style={{ flex: 2 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Job title, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              width: '100%',
              color: '#111827',
              background: 'transparent',
            }}
          />
        </div>

        {/* Location input */}
        <div
          className="flex items-center gap-2 px-3 py-3 sm:py-0 sm:border-r border-gray-200"
          style={{ flex: 1.5 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              width: '100%',
              color: '#111827',
              background: 'transparent',
            }}
          />
        </div>

        {/* Category select */}
        <div
          className="flex items-center px-3 py-3 sm:py-0"
          style={{ flex: 1.5 }}
        >
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              width: '100%',
              color: '#6B7280',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Find Jobs button — inside the bar */}
        <button
          onClick={handleSearch}
          className="w-full sm:w-auto shrink-0"
          style={{
            background: '#033BB0',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 28px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Find Jobs
        </button>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        marginTop: '16px',
        fontSize: '14px',
        color: '#6B7280',
        flexWrap: 'wrap',
      }}>
        <span>2,000+ Candidates</span>
        <span style={{ color: '#D1D5DB' }}>•</span>
        <span>100+ Employers</span>
        <span style={{ color: '#D1D5DB' }}>•</span>
        <span>Free to Register</span>
      </div>

      {/* Popular searches */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '12px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Popular:</span>
        {POPULAR_SEARCHES.map((term) => (
          <a
            key={term}
            href={`/jobs?search=${encodeURIComponent(term)}`}
            style={{
              fontSize: '13px',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              color: '#374151',
              background: 'white',
              textDecoration: 'none',
              transition: '0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#033BB0'
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.borderColor = '#033BB0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.color = '#374151'
              e.currentTarget.style.borderColor = '#E5E7EB'
            }}
          >
            {term}
          </a>
        ))}
      </div>
    </div>
  )
}
