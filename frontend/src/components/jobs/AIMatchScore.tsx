'use client'

import { useEffect, useState } from 'react'

interface Props {
  jobSlug: string
  token: string | null
}

interface MatchResult {
  score: number
  summary: string
}

export default function AIMatchScore({ jobSlug, token }: Props) {
  const [result, setResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobSlug}/match-score`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setResult(data))
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [jobSlug, token])

  if (!token || (!loading && !result)) return null

  if (loading) {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 animate-pulse">
        <div className="h-3 bg-blue-200 rounded w-1/3 mb-2" />
        <div className="h-2 bg-blue-200 rounded w-full" />
      </div>
    )
  }

  if (!result) return null

  const pct = Math.min(100, Math.max(0, Math.round(result.score * 100)))
  const color = pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626'

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">AI Match Score</span>
        <span className="text-sm font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div className="w-full bg-blue-100 rounded-full h-1.5 mb-2">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {result.summary && (
        <p className="text-xs text-blue-700 leading-relaxed">{result.summary}</p>
      )}
    </div>
  )
}
