import Link from 'next/link'
import type { Job, JobCategory } from '@/types'
import JobCard from '@/components/jobs/JobCard'
import MANLeaderboard from '@/components/ads/MANLeaderboard'
import HeroSearch from '@/components/home/HeroSearch'
import FeaturedJobsCarousel from '@/components/home/FeaturedJobsCarousel'
import StatsCounter from '@/components/home/StatsCounter'
import NewsletterSignup from '@/components/home/NewsletterSignup'
import CategoryGrid from '@/components/home/CategoryGrid'

const API = process.env.NEXT_PUBLIC_API_URL

async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API}/api/settings`, { next: { revalidate: 60 } })
    if (!res.ok) return {}
    return res.json()
  } catch {
    return {}
  }
}

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


export default async function HomePage() {
  const [featuredJobs, latestJobs, categories, stats, settings] = await Promise.all([
    getFeaturedJobs(),
    getLatestJobs(),
    getCategories(),
    getStats(),
    getSiteSettings(),
  ])

  const heroLine1 = settings.hero_heading_line1 || 'Find Your Next'
  const heroLine2Raw = settings.hero_heading_line2 || 'Halal Opportunity'
  // Split line 2 so the first word is green, the rest is blue
  const [heroLine2Green, ...heroLine2BlueParts] = heroLine2Raw.trim().split(' ')
  const heroLine2Blue = heroLine2BlueParts.join(' ')
  const heroSub  = settings.hero_subheading || 'Connect with Muslim-friendly employers and build a career aligned with your values and faith.'
  const statJobs = settings.stat_jobs || '247'

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
        style={{
          background: 'linear-gradient(160deg, #F0F4FF 0%, #FFFFFF 50%, #F0FFF0 100%)',
          paddingTop: '64px',
          paddingBottom: 0,
          borderBottom: '1px solid #F3F4F6',
          overflow: 'hidden',
        }}
      >
        {/* Centered content */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#E6EDFF',
            border: '1px solid #C7D2FE',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '13px',
            color: '#033BB0',
            marginBottom: '20px',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} width={14} height={14}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            The #1 Halal Job Platform
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 58px)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '16px',
            color: '#111827',
          }}>
            {heroLine1}
            <br />
            <span style={{ color: '#0FBB0F' }}>{heroLine2Green}</span>
            {heroLine2Blue && (
              <> <span style={{ color: '#033BB0' }}>{heroLine2Blue}</span></>
            )}
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            lineHeight: 1.6,
            maxWidth: '560px',
            margin: '0 auto 32px',
          }}>
            {heroSub}
          </p>

          {/* Search bar + stats + popular pills */}
          <HeroSearch
            categories={categories}
            statCandidates={settings.stat_candidates}
            statEmployers={settings.stat_employers}
          />
        </div>

        {/* Full-width illustration — outside centered container */}
        <div style={{
          width: '100%',
          marginTop: '48px',
          position: 'relative',
          overflow: 'hidden',
          lineHeight: 0,
        }}>
          <img
            src="/images/illustration.webp"
            alt="Muslim professionals"
            style={{
              width: '100%',
              maxHeight: '220px',
              objectFit: 'contain',
              objectPosition: 'center center',
              display: 'block',
            }}
          />
          {/* Floating stat card */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            fontWeight: 500,
            color: '#111827',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#0FBB0F',
              flexShrink: 0,
            }} />
            {statJobs} New Jobs This Week
          </div>
        </div>
      </section>

      {/* ── MAN Leaderboard Ad ── */}
      <MANLeaderboard />

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
