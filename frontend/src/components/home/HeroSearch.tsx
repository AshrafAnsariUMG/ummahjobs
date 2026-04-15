'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JobCategory } from '@/types'

const POPULAR_SEARCHES: { term: string; icon: React.ReactNode }[] = [
  {
    term: 'Remote Jobs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    term: 'IT & Tech',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    term: 'Healthcare',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    term: 'Islamic Studies',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
  },
  {
    term: 'Nonprofit',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
]

interface HeroSearchProps {
  categories: JobCategory[]
  statCandidates?: string
  statEmployers?: string
}

export default function HeroSearch({ categories, statCandidates = '2,000+', statEmployers = '100+' }: HeroSearchProps) {
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
        <span>{statCandidates} Candidates</span>
        <span style={{ color: '#D1D5DB' }}>•</span>
        <span>{statEmployers} Employers</span>
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
        {POPULAR_SEARCHES.map(({ term, icon }) => (
          <a
            key={term}
            href={`/jobs?search=${encodeURIComponent(term)}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '13px',
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              color: '#374151',
              background: 'white',
              textDecoration: 'none',
              transition: 'all 0.15s',
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
            {icon}
            {term}
          </a>
        ))}
      </div>
    </div>
  )
}
