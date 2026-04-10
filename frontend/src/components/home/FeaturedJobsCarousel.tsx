'use client'

import { useRef } from 'react'
import Link from 'next/link'
import type { Job } from '@/types'
import JobCard from '@/components/jobs/JobCard'

export default function FeaturedJobsCarousel({ jobs }: { jobs: Job[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
        <p className="text-gray-500 text-sm mb-2">No featured jobs yet.</p>
        <Link href="/packages" className="text-sm font-medium" style={{ color: '#033BB0' }}>
          Be the first to feature your listing → View packages
        </Link>
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Prev arrow */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow items-center justify-center hover:bg-gray-50 transition-opacity opacity-0 group-hover:opacity-100"
        aria-label="Scroll left"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} variant="carousel" />
        ))}
      </div>

      {/* Next arrow */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow items-center justify-center hover:bg-gray-50 transition-opacity opacity-0 group-hover:opacity-100"
        aria-label="Scroll right"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
