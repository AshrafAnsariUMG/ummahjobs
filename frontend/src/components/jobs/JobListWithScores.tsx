'use client'

import { useEffect, useState } from 'react'
import JobCard from '@/components/jobs/JobCard'
import type { Job } from '@/types'

interface ScoreEntry {
  score: number
  label: string
}

interface Props {
  jobs: Job[]
}

export default function JobListWithScores({ jobs }: Props) {
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({})
  const [loadingScores, setLoadingScores] = useState(false)

  useEffect(() => {
    if (jobs.length === 0) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('uj_token') : null
    if (!token) return

    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('uj_user') : null
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser)
        if (user?.role !== 'candidate') return
      } catch {
        return
      }
    } else {
      return
    }

    const slugs = jobs.map((j) => j.slug)
    setLoadingScores(true)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/batch-match-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slugs }),
    })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Record<string, ScoreEntry>) => setScores(data))
      .catch(() => {})
      .finally(() => setLoadingScores(false))
  }, [jobs])

  return (
    <>
      {/* Scores loading indicator */}
      {loadingScores && (
        <div
          className="flex items-center gap-2 px-3 mb-3 rounded-lg text-xs font-medium"
          style={{ height: 32, backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
        >
          <svg
            className="animate-spin h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Calculating your halal match…
        </div>
      )}

      {/* Job cards */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            variant="list"
            matchScore={scores[job.slug]?.score ?? null}
          />
        ))}
      </div>
    </>
  )
}
