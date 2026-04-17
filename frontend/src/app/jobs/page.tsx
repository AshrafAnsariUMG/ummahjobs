import { Suspense } from 'react'
import Link from 'next/link'
import type { Job, JobCategory, JobType, PaginatedResponse } from '@/types'
import FilterSidebar from '@/components/jobs/FilterSidebar'
import JobListWithScores from '@/components/jobs/JobListWithScores'
import MANLeaderboard from '@/components/ads/MANLeaderboard'
import IslamicEmptyState from '@/components/ui/IslamicEmptyState'
import { SearchIcon } from '@/components/ui/IslamicIcons'

const API = process.env.NEXT_PUBLIC_API_URL

async function getJobs(params: Record<string, string>): Promise<PaginatedResponse<Job>> {
  const qs = new URLSearchParams(params).toString()
  try {
    const res = await fetch(`${API}/api/jobs?${qs}`, { cache: 'no-store' })
    if (!res.ok) return { data: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } }
    return res.json()
  } catch {
    return { data: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } }
  }
}

async function getCategories(): Promise<JobCategory[]> {
  try {
    const res = await fetch(`${API}/api/categories`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getJobTypes(): Promise<JobType[]> {
  try {
    const res = await fetch(`${API}/api/job-types`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

function FilterSidebarWrapper({ categories, jobTypes }: { categories: JobCategory[]; jobTypes: JobType[] }) {
  return (
    <Suspense fallback={<div className="w-full bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-96" />}>
      <FilterSidebar categories={categories} jobTypes={jobTypes} />
    </Suspense>
  )
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ?? '1'

  const [jobsData, categories, jobTypes] = await Promise.all([
    getJobs({ ...params, per_page: '15' }),
    getCategories(),
    getJobTypes(),
  ])

  const { data: jobs, meta } = jobsData

  const buildPageUrl = (p: number) => {
    const next = new URLSearchParams({ ...params, page: String(p) })
    return `/jobs?${next.toString()}`
  }

  const currentCategory = categories.find((c) => c.slug === params.category)
  const currentJobType = jobTypes.find((jt) => jt.slug === params.job_type)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* MAN Leaderboard Ad */}
      <div className="mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <MANLeaderboard />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
          {currentCategory ? `${currentCategory.name} Jobs` : 'All Jobs'}
        </h1>
        <p className="text-gray-500 text-sm">
          {meta.total} {meta.total === 1 ? 'job' : 'jobs'} found
          {currentCategory && ` in ${currentCategory.name}`}
          {currentJobType && ` · ${currentJobType.name}`}
          {params.location && ` · ${params.location}`}
          {params.search && ` · "${params.search}"`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <FilterSidebarWrapper categories={categories} jobTypes={jobTypes} />
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {jobs.length > 0 ? (
            <>
              <JobListWithScores jobs={jobs} />

              {/* Pagination */}
              {meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {meta.current_page > 1 && (
                    <Link
                      href={buildPageUrl(meta.current_page - 1)}
                      className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      ← Previous
                    </Link>
                  )}

                  {Array.from({ length: Math.min(meta.last_page, 7) }, (_, i) => {
                    const p = i + 1
                    const isCurrent = p === meta.current_page
                    return (
                      <Link
                        key={p}
                        href={buildPageUrl(p)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          isCurrent
                            ? 'text-white border-transparent'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                        style={isCurrent ? { backgroundColor: '#033BB0', borderColor: '#033BB0' } : undefined}
                      >
                        {p}
                      </Link>
                    )
                  })}

                  {meta.current_page < meta.last_page && (
                    <Link
                      href={buildPageUrl(meta.current_page + 1)}
                      className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100">
              <IslamicEmptyState
                icon={<SearchIcon size={28} />}
                title="No jobs found"
                message="No jobs match your search — but Allah's rizq is not limited to one door. Try adjusting your filters or check back soon."
                actionLabel="Clear Filters"
                actionHref="/jobs"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
