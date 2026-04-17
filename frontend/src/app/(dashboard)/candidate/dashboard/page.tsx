'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Candidate, JobApplication, SavedJob } from '@/types'
import { timeAgo } from '@/lib/timeAgo'
import { CrescentIcon } from '@/components/ui/IslamicIcons'
import DailyQuoteWidget from '@/components/ui/DailyQuoteWidget'
import IslamicPattern from '@/components/ui/IslamicPattern'
import BismillahWatermark from '@/components/ui/BismillahWatermark'
import SectionHeading from '@/components/ui/SectionHeading'

interface ApplicationsPage {
  total: number
  data: JobApplication[]
}

interface SavedJobsPage {
  total: number
  data: SavedJob[]
}

const STATUS_STYLES: Record<string, string> = {
  applied:     'bg-blue-100 text-blue-700',
  viewed:      'bg-amber-100 text-amber-700',
  shortlisted: 'bg-green-100 text-green-700',
  offer:       'bg-purple-100 text-purple-700',
}

function LogoFallback({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#033BB0' }}>
      {initials}
    </div>
  )
}

export default function CandidateDashboardPage() {
  const { user } = useAuth()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [applications, setApplications] = useState<ApplicationsPage | null>(null)
  const [savedJobs, setSavedJobs] = useState<SavedJobsPage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/candidate/profile'),
      api.get('/api/candidate/applications'),
      api.get('/api/candidate/saved-jobs'),
    ])
      .then(([profile, apps, saved]: [Candidate, ApplicationsPage, SavedJobsPage]) => {
        setCandidate(profile)
        setApplications(apps)
        setSavedJobs(saved)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const completionPct = candidate ? Math.round(Number(candidate.profile_complete_pct)) : 0
  const recentApps = applications?.data.slice(0, 5) ?? []
  const previewSaved = savedJobs?.data.slice(0, 4) ?? []

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome header */}
      <div className="mb-6" style={{ position: 'relative', overflow: 'hidden', minHeight: '120px' }}>
        <IslamicPattern opacity={0.06} />
        <BismillahWatermark />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="text-2xl font-extrabold text-gray-900">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <CrescentIcon />
              Assalamu Alaikum, {user?.display_name ?? 'there'}!
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Here&apos;s what&apos;s happening with your job search today.</p>
        </div>
      </div>

      <DailyQuoteWidget />

      {/* Profile completion banner */}
      {!loading && candidate && completionPct < 80 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-blue-900 mb-1">
            Your profile is {completionPct}% complete
          </p>
          <p className="text-xs text-blue-700 mb-3">
            Complete your profile to get better job matches and be discovered by employers.
          </p>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${completionPct}%`, backgroundColor: '#033BB0' }}
            />
          </div>
          {(!candidate.skills || candidate.skills.length === 0) && (
            <p className="text-xs text-blue-700 mb-2">
              <Link
                href="/candidate/profile/edit"
                className="font-semibold underline"
                style={{ color: '#033BB0' }}
              >
                Add your skills to get better job matches →
              </Link>
            </p>
          )}
          <Link
            href="/candidate/profile/edit"
            className="text-xs font-semibold underline"
            style={{ color: '#033BB0' }}
          >
            Complete Profile →
          </Link>
        </div>
      )}

      {/* Stats row */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-7 bg-gray-100 rounded w-12 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Applications Sent', value: applications?.total ?? 0 },
            { label: 'Saved Jobs', value: savedJobs?.total ?? 0 },
            { label: 'Profile Views', value: candidate?.views_count ?? 0 },
            { label: 'Profile Complete', value: `${completionPct}%` },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Applications */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <SectionHeading
          title="Recent Applications"
          action={{ label: 'View all →', href: '/candidate/applications' }}
        />

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
          </div>
        ) : recentApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left py-2 font-medium">Job</th>
                  <th className="text-left py-2 font-medium hidden sm:table-cell">Company</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium hidden sm:table-cell">Applied</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => (
                  <tr key={app.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-medium text-gray-900 max-w-[160px] truncate pr-3">
                      {app.job?.title ?? '—'}
                    </td>
                    <td className="py-3 text-gray-500 hidden sm:table-cell">
                      {app.job?.employer?.company_name ?? '—'}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs hidden sm:table-cell">{timeAgo(app.applied_at)}</td>
                    <td className="py-3 text-right">
                      {app.job?.slug && (
                        <Link href={`/jobs/${app.job.slug}`} className="text-xs font-medium hover:underline" style={{ color: '#033BB0' }}>
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-3">You haven&apos;t applied to any jobs yet.</p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: '#033BB0' }}
            >
              Browse Jobs
            </Link>
          </div>
        )}
      </section>

      {/* Saved Jobs preview */}
      {!loading && previewSaved.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <SectionHeading
            title="Saved Jobs"
            action={{ label: 'View all saved →', href: '/candidate/saved-jobs' }}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            {previewSaved.map((saved) => {
              const job = saved.job
              if (!job) return null
              return (
                <Link
                  key={saved.id}
                  href={`/jobs/${job.slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 bg-gray-50">
                    {job.employer?.logo_path ? (
                      <img src={job.employer.logo_path} alt={job.employer.company_name} className="w-full h-full object-contain" />
                    ) : (
                      <LogoFallback name={job.employer?.company_name ?? 'J'} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 truncate">{job.employer?.company_name}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          {
            href: '/jobs', label: 'Browse All Jobs', desc: 'Find your next opportunity',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={22} height={22} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
          },
          {
            href: '/candidate/alerts', label: 'Set Job Alert', desc: 'Get notified of new matches',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={22} height={22} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
          },
          {
            href: '/candidate/profile/edit', label: 'Update Your CV', desc: 'Upload or replace your CV',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={22} height={22} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="mb-2" style={{ color: '#033BB0' }}>{item.icon}</div>
            <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
