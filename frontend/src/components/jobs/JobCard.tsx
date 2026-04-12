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

function LogoFallback({ name, size }: { name: string; size: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  const dim = size === 'sm' ? 'w-10 h-10 text-xs' : 'w-14 h-14 text-sm'
  return (
    <div
      className={`${dim} rounded-lg flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: '#033BB0' }}
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

export default function JobCard({ job, variant = 'list', matchScore }: JobCardProps) {
  if (variant === 'carousel') {
    return (
      <Link
        href={`/jobs/${job.slug}`}
        className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all w-72 shrink-0"
      >
        <div className="flex items-start gap-3 mb-3">
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

        <p className="text-xs text-gray-500 mb-3">{job.employer.company_name}</p>

        <div className="flex flex-wrap gap-1.5">
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
      className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
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

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{job.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {job.employer.company_name}
              {job.category && (
                <span className="text-gray-400"> · {job.category.name}</span>
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
