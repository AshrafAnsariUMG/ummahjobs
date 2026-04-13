import Link from 'next/link'
import type { Job, JobCategory } from '@/types'
import JobCard from '@/components/jobs/JobCard'
import MANAdBanner from '@/components/ads/MANAdBanner'
import HeroSearch from '@/components/home/HeroSearch'
import FeaturedJobsCarousel from '@/components/home/FeaturedJobsCarousel'
import StatsCounter from '@/components/home/StatsCounter'
import NewsletterSignup from '@/components/home/NewsletterSignup'
import CategoryGrid from '@/components/home/CategoryGrid'

const API = process.env.NEXT_PUBLIC_API_URL

async function getFeaturedJobs(): Promise<Job[]> {
  try {
    const res = await fetch(`${API}/api/jobs/featured`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getLatestJobs(): Promise<Job[]> {
  try {
    const res = await fetch(`${API}/api/jobs?per_page=10`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data ?? []
  } catch {
    return []
  }
}

async function getCategories(): Promise<JobCategory[]> {
  try {
    const res = await fetch(`${API}/api/categories`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getStats(): Promise<{
  total_jobs: number
  total_employers: number
  total_candidates: number
  total_categories: number
} | null> {
  try {
    const res = await fetch(`${API}/api/jobs/stats`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function HomePage() {
  const [featuredJobs, latestJobs, categories, stats] = await Promise.all([
    getFeaturedJobs(),
    getLatestJobs(),
    getCategories(),
    getStats(),
  ])

  const visibleCategories = categories.slice(0, 12)

  const statItems = stats
    ? [
        { label: 'Active Jobs', value: stats.total_jobs },
        { label: 'Employers', value: stats.total_employers },
        { label: 'Candidates', value: stats.total_candidates },
        { label: 'Categories', value: stats.total_categories },
      ]
    : []

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-white border-b border-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Find Your Next<br />
            <span style={{ color: '#033BB0' }}>Halal</span> Opportunity
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            Your trusted platform for Muslim-friendly job listings and career growth
          </p>
          <HeroSearch categories={categories} />
        </div>
      </section>

      {/* ── MAN Ad Banner ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <MANAdBanner size="banner" />
      </div>

      {/* ── Featured Jobs ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Jobs</h2>
          <Link href="/jobs?featured=1" className="text-sm font-medium" style={{ color: '#033BB0' }}>
            View all →
          </Link>
        </div>
        <FeaturedJobsCarousel jobs={featuredJobs} />
      </section>

      {/* ── Latest Jobs ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Latest Jobs</h2>
          <Link href="/jobs" className="text-sm font-medium" style={{ color: '#033BB0' }}>
            View all →
          </Link>
        </div>

        {latestJobs.length > 0 ? (
          <>
            <div className="space-y-3">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} variant="list" />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/jobs"
                className="inline-block px-8 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
                style={{ color: '#033BB0', borderColor: '#033BB0' }}
              >
                Load More Jobs
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-500 text-sm">No jobs posted yet.</p>
            <Link href="/packages" className="text-sm font-medium mt-2 block" style={{ color: '#033BB0' }}>
              Post the first job →
            </Link>
          </div>
        )}
      </section>

      {/* ── Categories Grid ── */}
      <section className="bg-white border-t border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            <Link href="/jobs" className="text-sm font-medium" style={{ color: '#033BB0' }}>
              View all →
            </Link>
          </div>

          <CategoryGrid categories={visibleCategories} />

          {categories.length > 12 && (
            <div className="text-center mt-6">
              <Link
                href="/jobs"
                className="text-sm font-medium"
                style={{ color: '#033BB0' }}
              >
                View all {categories.length} categories →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats ── */}
      {statItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Trusted by the Muslim Professional Community
          </h2>
          <StatsCounter stats={statItems} />
        </section>
      )}

      {/* ── Newsletter ── */}
      <section className="bg-white border-t border-gray-100 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Stay Updated with Halal Opportunities
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Get the latest job listings delivered to your inbox every week.
          </p>
          <NewsletterSignup />
        </div>
      </section>
    </div>
  )
}
