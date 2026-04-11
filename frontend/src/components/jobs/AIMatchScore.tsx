'use client'

import { useEffect, useState } from 'react'

interface Props {
  jobSlug: string
}

interface Dimensions {
  skills: number
  experience: number
  location: number
  category: number
  qualification: number
  completeness: number
}

interface MatchResult {
  status: string
  score: number
  reasons: string[]
  missing: string[]
  dimensions: Dimensions
}

const DIMENSION_LABELS: Record<keyof Dimensions, string> = {
  skills: 'Skills',
  experience: 'Experience',
  location: 'Location',
  category: 'Category',
  qualification: 'Qualification',
  completeness: 'Profile Completeness',
}

const DIMENSION_ORDER: (keyof Dimensions)[] = [
  'skills', 'experience', 'location', 'category', 'qualification', 'completeness',
]

function scoreColor(score: number): string {
  if (score >= 90) return '#15803d'
  if (score >= 75) return '#16a34a'
  if (score >= 60) return '#2563eb'
  if (score >= 40) return '#d97706'
  return '#dc2626'
}

function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent Match'
  if (score >= 75) return 'Strong Match'
  if (score >= 60) return 'Good Match'
  if (score >= 40) return 'Moderate Match'
  return 'Low Match'
}

export default function AIMatchScore({ jobSlug }: Props) {
  const [result, setResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('uj_token')
      : null
    if (!token) return
    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobSlug}/match-score`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.score != null) setResult(data)
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [jobSlug])

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-2 bg-gray-100 rounded w-full mb-2" />
        <div className="h-2 bg-gray-100 rounded w-2/3" />
      </div>
    )
  }

  if (!result) return null

  const score = result.score
  const color = scoreColor(score)
  const label = scoreLabel(score)

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Your Match Score</p>
            <p className="text-xs text-gray-400 mt-0.5">Based on your profile</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold" style={{ color }}>{score}%</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color }}>{label}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
        <p className="text-xs text-gray-400">Score updates every 24 hours</p>
      </div>

      {/* Reasons */}
      {result.reasons.length > 0 && (
        <div className="px-5 pt-4">
          <ul className="space-y-1.5">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <svg className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing / gaps */}
      {result.missing.length > 0 && (
        <div className="px-5 pt-3">
          <ul className="space-y-1.5">
            {result.missing.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Breakdown toggle */}
      <div className="px-5 pt-3 pb-4">
        <button
          onClick={() => setShowBreakdown((v) => !v)}
          className="text-xs font-medium hover:underline flex items-center gap-1"
          style={{ color: '#033BB0' }}
        >
          {showBreakdown ? 'Hide' : 'Show'} score breakdown
          <svg
            className={`w-3 h-3 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showBreakdown && result.dimensions && (
          <div className="mt-3 space-y-2.5">
            {DIMENSION_ORDER.map((dim) => {
              const val = result.dimensions[dim] ?? 0
              const pct = Math.round(val * 100)
              const dimColor = scoreColor(pct)
              return (
                <div key={dim}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{DIMENSION_LABELS[dim]}</span>
                    <span className="text-xs font-semibold" style={{ color: dimColor }}>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: dimColor }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
