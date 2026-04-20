'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { EmployerApplicant, Job, PaginatedResponse } from '@/types'
import { timeAgo } from '@/lib/timeAgo'
import IslamicEmptyState from '@/components/ui/IslamicEmptyState'
import { UsersIcon } from '@/components/ui/IslamicIcons'
import { getStorageUrl } from '@/lib/imageUtils'

interface ApplicantsResponse {
  data: EmployerApplicant[]
  total: number
}

const STATUS_STYLES: Record<string, string> = {
  applied:     'bg-blue-100 text-blue-700',
  viewed:      'bg-amber-100 text-amber-700',
  shortlisted: 'bg-green-100 text-green-700',
  offer:       'bg-purple-100 text-purple-700',
}

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied', viewed: 'Viewed', shortlisted: 'Shortlisted', offer: 'Offer',
}

const STATUS_STEPS = ['applied', 'viewed', 'shortlisted', 'offer'] as const

interface JobGroup {
  job: Job
  applicants: EmployerApplicant[]
}

function ApplicantCard({
  app,
  onStatusChange,
}: {
  app: EmployerApplicant
  onStatusChange: (id: number, status: EmployerApplicant['status']) => void
}) {
  const { showToast } = useToast()
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const candidate = app.candidate
  const name = candidate?.user?.display_name ?? 'Unknown Candidate'
  const email = candidate?.user?.email ?? ''
  const photo = getStorageUrl(candidate?.profile_photo_path ?? null)
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  async function handleStatusChange(newStatus: EmployerApplicant['status']) {
    if (newStatus === app.status) return
    setUpdating(true)
    onStatusChange(app.id, newStatus)
    try {
      await api.put(`/api/employer/applicants/${app.id}/status`, { status: newStatus })
      showToast(`Status updated to ${STATUS_LABELS[newStatus]}.`, 'success')
    } catch {
      onStatusChange(app.id, app.status)
      showToast('Failed to update status.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          {photo ? (
            <img src={photo} alt={name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: '#033BB0' }}
            >
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900">{name}</p>
              {email && <p className="text-xs text-gray-500 truncate">{email}</p>}
              <p className="text-xs text-gray-400 mt-0.5">Applied {timeAgo(app.applied_at)}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[app.status] ?? app.status}
              </span>

              <select
                value={app.status}
                onChange={(e) => handleStatusChange(e.target.value as EmployerApplicant['status'])}
                disabled={updating}
                className="text-xs rounded-lg border border-gray-300 bg-white px-2 py-1.5 focus:outline-none disabled:opacity-60 cursor-pointer"
              >
                {STATUS_STEPS.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>

              <button
                disabled
                title="Candidate public profiles coming soon"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-400 cursor-not-allowed"
              >
                View Profile
              </button>

              {app.candidate?.user?.id && (
                <button
                  onClick={() => router.push(`/employer/messages?compose=${app.candidate!.user!.id}`)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-blue-50"
                  style={{ color: '#033BB0', borderColor: '#033BB0' }}
                >
                  Message
                </button>
              )}
            </div>
          </div>

          {app.cover_letter && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs font-medium hover:underline"
                style={{ color: '#033BB0' }}
              >
                {expanded ? 'Hide' : 'Show'} cover letter
              </button>
              {expanded && (
                <p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                  {app.cover_letter}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EmployerApplicantsPage() {
  const { showToast } = useToast()
  const [groups, setGroups] = useState<JobGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [totalApplicants, setTotalApplicants] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const jobsRes = await api.get('/api/employer/jobs?per_page=100') as PaginatedResponse<Job>
        const allJobs = jobsRes.data ?? []
        const jobsWithApps = allJobs.filter((j) => (j.applications_count ?? 0) > 0)

        if (jobsWithApps.length === 0) {
          setGroups([])
          setLoading(false)
          return
        }

        const results = await Promise.all(
          jobsWithApps.map((job) =>
            api.get(`/api/employer/applicants?job_id=${job.id}`)
              .then((res: ApplicantsResponse) => ({ job, applicants: res.data }))
              .catch(() => ({ job, applicants: [] }))
          )
        )

        const filled = results.filter((g) => g.applicants.length > 0)
        setGroups(filled)
        setTotalApplicants(filled.reduce((sum, g) => sum + g.applicants.length, 0))
      } catch {
        showToast('Failed to load applicants.', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleStatusChange(jobId: number, appId: number, status: EmployerApplicant['status']) {
    setGroups((prev) =>
      prev.map((g) =>
        g.job.id === jobId
          ? { ...g, applicants: g.applicants.map((a) => (a.id === appId ? { ...a, status } : a)) }
          : g
      )
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">All Applicants</h1>
        <p className="text-sm text-gray-400 mt-1">Manage applications across all your listings</p>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-64" />
              {[1, 2].map((j) => <div key={j} className="h-24 bg-white rounded-xl border border-gray-200" />)}
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <IslamicEmptyState
            icon={<UsersIcon size={28} />}
            title="No applicants yet"
            message="In sha Allah the right candidates are on their way."
          />
        </div>
      ) : (
        <>
          <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#E6EDFF' }}>
            <span className="text-lg font-bold" style={{ color: '#033BB0' }}>{totalApplicants}</span>
            <span className="text-sm font-medium text-blue-700">total applicant{totalApplicants !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-8">
            {groups.map(({ job, applicants }) => (
              <div key={job.id}>
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    {job.category && <p className="text-xs text-gray-400">{job.category.name}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                      style={{ backgroundColor: '#033BB0' }}
                    >
                      {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
                    </span>
                    <a
                      href={`/employer/jobs/${job.id}/applicants?title=${encodeURIComponent(job.title)}`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: '#033BB0' }}
                    >
                      Full view →
                    </a>
                  </div>
                </div>
                <div className="space-y-3">
                  {applicants.map((app) => (
                    <ApplicantCard
                      key={app.id}
                      app={app}
                      onStatusChange={(id, status) => handleStatusChange(job.id, id, status)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
