'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Job } from '@/types'
import { timeAgo } from '@/lib/timeAgo'

interface JobCardProps {
  job: Job
  variant?: 'list' | 'carousel'
  matchScore?: number | null
}

function EmployerLogo({ name, logoPath }: { name: string; logoPath: string | null }) {
  if (logoPath) {
    return (
      <img
        src={logoPath}
        alt={name}
        className="object-contain"
        onError={(e) => {
          const target = e.currentTarget
          target.style.display = 'none'
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'flex'
          }
        }}
      />
    )
  }
  return null
}

const FALLBACK_PALETTES: { bg: string; color: string }[] = [
  { bg: '#EEF2FF', color: '#3730A3' }, // A–F
  { bg: '#F0FFF0', color: '#166534' }, // G–L
  { bg: '#FFF7ED', color: '#9A3412' }, // M–R
  { bg: '#FDF4FF', color: '#7E22CE' }, // S–Z
]

function LogoFallback({ name, size }: { name: string; size: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  const dim = size === 'sm' ? 'w-10 h-10 text-xs' : 'w-14 h-14 text-sm'
  const firstChar = name[0]?.toUpperCase() ?? 'A'
  const paletteIdx =
    firstChar <= 'F' ? 0 :
    firstChar <= 'L' ? 1 :
    firstChar <= 'R' ? 2 : 3
  const { bg, color } = FALLBACK_PALETTES[paletteIdx]
  return (
    <div
      className={`${dim} rounded-lg flex items-center justify-center font-bold shrink-0`}
      style={{ backgroundColor: bg, color }}
    >
      {initials}
    </div>
  )
}

function MatchBadge({ score }: { score: number }) {
  const { bg, color } =
    score >= 75 ? { bg: '#DCFCE7', color: '#166534' } :
    score >= 60 ? { bg: '#DBEAFE', color: '#1E40AF' } :
    score >= 40 ? { bg: '#FEF9C3', color: '#854D0E' } :
                  { bg: '#FEE2E2', color: '#991B1B' }
  return (
    <span
      style={{
        backgroundColor: bg,
        color,
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 20,
        whiteSpace: 'nowrap',
      }}
    >
      {score}% match
    </span>
  )
}

function GeometricAccent({ hovered }: { hovered: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '-10px',
        right: '-10px',
        opacity: hovered ? 0.08 : 0.04,
        pointerEvents: 'none',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        transform: hovered ? 'rotate(15deg) scale(1.1)' : 'rotate(0deg) scale(1)',
      }}
    >
      <svg viewBox="0 0 80 80" width={80} height={80} fill="none" stroke="#033BB0" strokeWidth="1">
        <polygon points="40,5 47,25 67,15 57,35 75,40 57,45 67,65 47,55 40,75 33,55 13,65 23,45 5,40 23,35 13,15 33,25" />
        <polygon points="40,15 45,30 60,22 52,37 67,40 52,43 60,58 45,50 40,65 35,50 20,58 28,43 13,40 28,37 20,22 35,30" />
        <circle cx="40" cy="40" r="12" fill="none" />
      </svg>
    </div>
  )
}

export default function JobCard({ job, variant = 'list', matchScore }: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (variant === 'carousel') {
    return (
      <Link
        href={`/jobs/${job.slug}`}
        className="block bg-white rounded-xl border border-gray-200 p-5 w-72 shrink-0"
        style={{
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.08)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <GeometricAccent hovered={isHovered} />
        <div className="flex items-start gap-3 mb-3" style={{ position: 'relative', zIndex: 1 }}>
          <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 relative">
            {job.employer.logo_path ? (
              <img
                src={job.employer.logo_path}
                alt={job.employer.company_name}
                className="w-full h-full object-contain"
              />
            ) : (
              <LogoFallback name={job.employer.company_name} size="md" />
            )}
          </div>
          <div className="min-w-0">
            {job.is_featured && (
              <span
                className="inline-block text-xs font-medium px-2 py-0.5 rounded-full text-white mb-1"
                style={{ backgroundColor: '#033BB0' }}
              >
                Featured
              </span>
            )}
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
              {job.title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5" style={{ position: 'relative', zIndex: 1 }}>
          {job.employer.company_name}
          {job.employer.is_verified && (
            <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#0FBB0F' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0FBB0F', display: 'inline-block', flexShrink: 0 }} />
              Halal Verified
            </span>
          )}
        </p>

        <div className="flex flex-wrap gap-1.5" style={{ position: 'relative', zIndex: 1 }}>
          {job.location && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </span>
          )}
          {job.job_type && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {job.job_type}
            </span>
          )}
          {matchScore != null && <MatchBadge score={matchScore} />}
        </div>
      </Link>
    )
  }

  // List variant
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4"
      style={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <GeometricAccent hovered={isHovered} />

      <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center shrink-0" style={{ position: 'relative', zIndex: 1 }}>
        {job.employer.logo_path ? (
          <img
            src={job.employer.logo_path}
            alt={job.employer.company_name}
            className="w-full h-full object-contain"
          />
        ) : (
          <LogoFallback name={job.employer.company_name} size="sm" />
        )}
      </div>

      <div className="flex-1 min-w-0" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{job.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>
                {job.employer.company_name}
                {job.category && (
                  <span className="text-gray-400"> · {job.category.name}</span>
                )}
              </span>
              {job.employer.is_verified && (
                <span className="inline-flex items-center gap-1 font-medium" style={{ color: '#0FBB0F' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0FBB0F', display: 'inline-block', flexShrink: 0 }} />
                  Halal Verified
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {matchScore != null && <MatchBadge score={matchScore} />}
            {job.is_featured && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: '#033BB0' }}
              >
                Featured
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {job.location && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </span>
          )}
          {job.job_type && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {job.job_type}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">{timeAgo(job.created_at)}</span>
        </div>
      </div>
    </Link>
  )
}
