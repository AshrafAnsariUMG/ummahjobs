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
    const res = await fetch(`${API}/api/jobs/featured`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getLatestJobs(): Promise<Job[]> {
  try {
    const res = await fetch(`${API}/api/jobs?per_page=10`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.data ?? []
  } catch {
    return []
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

async function getStats(): Promise<{
  total_jobs: number
  total_employers: number
  total_candidates: number
  total_categories: number
} | null> {
  try {
    const res = await fetch(`${API}/api/jobs/stats`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

const POPULAR_SEARCHES = [
  { label: 'Remote Jobs', query: 'remote' },
  { label: 'IT & Tech', query: 'IT' },
  { label: 'Healthcare', query: 'healthcare' },
  { label: 'Islamic Studies', query: 'islamic studies' },
  { label: 'Nonprofit', query: 'nonprofit' },
]

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
      <section
        className="border-b border-gray-100 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #F0F4FF 0%, #FFFFFF 60%, #F0FFF0 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Left column — text + search */}
            <div className="flex-1 lg:w-[55%] w-full">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border text-xs font-semibold"
                style={{ backgroundColor: '#E6EDFF', color: '#033BB0', borderColor: '#C7D2FE' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} width={14} height={14}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                The #1 Halal Job Platform
              </div>

              {/* Heading */}
              <h1 className="font-bold leading-tight mb-5"
                style={{ fontSize: 'clamp(34px, 5vw, 52px)', lineHeight: 1.15 }}>
                <span className="text-gray-900">Find Your Next</span>
                <br />
                <span style={{ color: '#0FBB0F' }}>Halal </span>
                <span style={{ color: '#033BB0' }}>Opportunity</span>
              </h1>

              {/* Subheading */}
              <p className="mb-8 max-w-[480px]"
                style={{ color: '#6B7280', fontSize: 18 }}>
                Connect with Muslim-friendly employers and build a career aligned with your values and faith.
              </p>

              {/* Search bar */}
              <div className="mb-5">
                <HeroSearch categories={categories} />
              </div>

              {/* Quick stats */}
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                2,000+ Candidates&nbsp;&nbsp;·&nbsp;&nbsp;100+ Employers&nbsp;&nbsp;·&nbsp;&nbsp;Free to Register
              </p>

              {/* Popular search pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Popular:</span>
                {POPULAR_SEARCHES.map((s) => (
                  <Link
                    key={s.label}
                    href={`/jobs?search=${encodeURIComponent(s.query)}`}
                    className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: '#374151' }}
                    onMouseEnter={undefined}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right column — illustration */}
            <div className="hidden lg:flex lg:w-[45%] justify-center items-end relative">
              <div className="relative w-full max-w-[480px]">
                <img
                  src="/images/illustration.webp"
                  alt="Muslim professionals"
                  className="w-full h-auto"
                  style={{ maxHeight: 480, objectFit: 'contain', objectPosition: 'bottom' }}
                />
                {/* Floating stat card */}
                <div
                  className="absolute bottom-4 left-0 flex items-center gap-2.5 rounded-xl shadow-lg px-4 py-2.5"
                  style={{ backgroundColor: '#fff', border: '1px solid #F3F4F6' }}
                >
                  <span
                    className="rounded-full shrink-0"
                    style={{ width: 8, height: 8, backgroundColor: '#0FBB0F', display: 'inline-block' }}
                  />
                  <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">247 New Jobs This Week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAN Ad Banner ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <MANAdBanner size="banner" />
      </div>

      {/* ── Featured Jobs ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg viewBox="0 0 24 24" fill="#0FBB0F" width={20} height={20}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Featured Jobs</h2>
            </div>
            <p className="text-sm text-gray-500">Hand-picked opportunities from top Muslim-friendly employers</p>
          </div>
          <Link href="/jobs?featured=1" className="text-sm font-medium whitespace-nowrap" style={{ color: '#033BB0' }}>
            View all →
          </Link>
        </div>
        <FeaturedJobsCarousel jobs={featuredJobs} />
      </section>

      {/* ── Latest Jobs ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Latest Jobs</h2>
            <p className="text-sm text-gray-500">Fresh opportunities added daily</p>
          </div>
          <Link href="/jobs" className="text-sm font-medium whitespace-nowrap" style={{ color: '#033BB0' }}>
            Browse all jobs →
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
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Browse by Category</h2>
              <p className="text-sm text-gray-500">Explore opportunities across all fields</p>
            </div>
            <Link href="/jobs" className="text-sm font-medium whitespace-nowrap" style={{ color: '#033BB0' }}>
              View all →
            </Link>
          </div>

          <CategoryGrid categories={visibleCategories} />

          {categories.length > 12 && (
            <div className="text-center mt-6">
              <Link href="/jobs" className="text-sm font-medium" style={{ color: '#033BB0' }}>
                View all {categories.length} categories →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats ── */}
      {statItems.length > 0 && (
        <section style={{ background: 'linear-gradient(135deg, #033BB0 0%, #0256CC 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Trusted by the Muslim Professional Community
            </h2>
            <StatsCounter stats={statItems} />
          </div>
        </section>
      )}

      {/* ── Newsletter ── */}
      <section style={{ backgroundColor: '#033BB0' }} className="py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Stay Updated with Halal Opportunities
          </h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
            Join 2,000+ Muslim professionals getting weekly job alerts.
          </p>
          <NewsletterSignup dark />
        </div>
      </section>
    </div>
  )
}
