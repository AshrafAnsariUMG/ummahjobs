import type { Metadata } from 'next'
import Link from 'next/link'
import type { Job, JobCategory } from '@/types'

export const metadata: Metadata = {
  alternates: { canonical: 'https://ummahjobs.com' },
  openGraph: {
    url: 'https://ummahjobs.com',
    siteName: 'UmmahJobs',
    type: 'website',
    images: [{ url: 'https://ummahjobs.com/images/logo.png', width: 1200, height: 630, alt: 'UmmahJobs' }],
  },
  twitter: { card: 'summary_large_image' },
}
import JobCard from '@/components/jobs/JobCard'
import NewsletterPopup from '@/components/ui/NewsletterPopup'
import SectionHeading from '@/components/ui/SectionHeading'
import MANLeaderboard from '@/components/ads/MANLeaderboard'
import HeroSearch from '@/components/home/HeroSearch'
import FeaturedJobsCarousel from '@/components/home/FeaturedJobsCarousel'
import CategoryGrid from '@/components/home/CategoryGrid'
import AnimatedSection from '@/components/ui/AnimatedSection'

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

const STAT_CARDS = [
  {
    icon: (
      <svg width={28} height={28} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    value: '100+',
    label: 'Trusted Employers',
    sub: 'Muslim-friendly companies',
  },
  {
    icon: (
      <svg width={28} height={28} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    value: '26',
    label: 'Job Categories',
    sub: 'From tech to Islamic studies',
  },
  {
    icon: (
      <svg width={28} height={28} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    value: 'Global',
    label: 'Worldwide Reach',
    sub: 'Jobs across 50+ countries',
  },
  {
    icon: (
      <svg width={28} height={28} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    value: 'Free',
    label: 'Free to Register',
    sub: 'No cost for job seekers',
  },
]

export default async function HomePage() {
  const [featuredJobs, latestJobs, categories, settings] = await Promise.all([
    getFeaturedJobs(),
    getLatestJobs(),
    getCategories(),
    getSiteSettings(),
  ])

  const heroLine1 = settings.hero_heading_line1 || 'Find Your Next'
  const heroLine2Raw = settings.hero_heading_line2 || 'Halal Opportunity'
  const heroSub = settings.hero_subheading || 'Connect with Muslim-friendly employers and build a career aligned with your values and faith.'
  const heroFontDesktop    = settings.hero_font_size_desktop ?? '56'
  const heroFontMobile     = settings.hero_font_size_mobile  ?? '36'
  const illustrationHeight = settings.illustration_height    ?? '260'

  const visibleCategories = categories.slice(0, 12)

  return (
    <div>
      {/* ── Hero ── */}
      <section
        style={{
          background: 'linear-gradient(160deg, #F0F4FF 0%, #FFFFFF 50%, #F0FFF0 100%)',
          paddingBottom: 0,
          borderBottom: '1px solid #F3F4F6',
          overflow: 'hidden',
        }}
      >
        {/* Illustration — responsive on mobile, admin-controlled height on desktop */}
        <style>{`
          .hero-illustration { width: 100%; height: auto; max-height: 160px; object-fit: contain; display: block; }
          @media (min-width: 640px) { .hero-illustration { width: auto; height: ${illustrationHeight}px; max-height: none; } }
        `}</style>
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden',
          marginTop: '32px',
        }}>
          <img
            src="/images/illustration.webp"
            alt="Muslim professionals"
            className="hero-illustration"
          />
        </div>

        {/* Centered content */}
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 64px', textAlign: 'center' }}>

          {/* Heading */}
          <AnimatedSection animation="fade-up">
            <h1 style={{
              fontSize: `clamp(${heroFontMobile}px, 5vw, ${heroFontDesktop}px)`,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '16px',
              color: '#111827',
            }}>
              {heroLine1}
              <br />
              {heroLine2Raw.trim().split(' ').map((word, i) => (
                <span
                  key={i}
                  style={{ color: word.toLowerCase() === 'halal' ? '#0FBB0F' : '#033BB0' }}
                >
                  {word}{' '}
                </span>
              ))}
            </h1>

            <p style={{
              fontSize: '18px',
              color: '#6B7280',
              lineHeight: 1.6,
              maxWidth: '560px',
              margin: '0 auto 32px',
            }}>
              {heroSub}
            </p>
          </AnimatedSection>

          {/* Search bar */}
          <AnimatedSection animation="fade-up" delay={150}>
            <HeroSearch
              categories={categories}
              statEmployers={settings.stat_employers}
            />
          </AnimatedSection>
        </div>
      </section>

      {/* ── MAN Leaderboard Ad ── */}
      <MANLeaderboard />

      {/* ── Featured Jobs ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatedSection animation="fade-up">
          <SectionHeading
            title="Featured Jobs"
            subtitle="Hand-picked opportunities from top Muslim-friendly employers"
            action={{ label: 'View all →', href: '/jobs?featured=1' }}
            size="lg"
          />
        </AnimatedSection>
        <AnimatedSection animation="fade-up" delay={100}>
          <FeaturedJobsCarousel jobs={featuredJobs} />
        </AnimatedSection>
      </section>

      {/* ── Latest Jobs ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatedSection animation="fade-right">
          <SectionHeading
            title="Latest Jobs"
            subtitle="Fresh opportunities added daily"
            action={{ label: 'Browse all jobs →', href: '/jobs' }}
            size="lg"
          />
        </AnimatedSection>

        {latestJobs.length > 0 ? (
          <>
            <div className="space-y-3">
              {latestJobs.map((job, index) => (
                <AnimatedSection key={job.id} animation="fade-up" delay={index * 80}>
                  <JobCard job={job} variant="list" />
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection animation="fade-up" delay={200}>
              <div className="text-center mt-8">
                <Link
                  href="/jobs"
                  className="inline-block px-8 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
                  style={{ color: '#033BB0', borderColor: '#033BB0' }}
                >
                  Load More Jobs
                </Link>
              </div>
            </AnimatedSection>
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
          <AnimatedSection animation="fade-left">
            <SectionHeading
              title="Browse by Category"
              subtitle="Explore opportunities across all fields"
              action={{ label: 'View all →', href: '/jobs' }}
              size="lg"
              className="mb-8"
            />
          </AnimatedSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {visibleCategories.map((cat, index) => (
              <AnimatedSection key={cat.id} animation="fade-up" delay={index * 60}>
                <CategoryGrid categories={[cat]} />
              </AnimatedSection>
            ))}
          </div>

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
      <section style={{ background: 'linear-gradient(135deg, #033BB0 0%, #0256CC 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STAT_CARDS.map((stat, i) => (
              <AnimatedSection key={i} animation="fade-up" delay={i * 100}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    {stat.icon}
                  </div>
                  <p style={{ color: 'white', fontSize: '36px', fontWeight: 800, lineHeight: 1, marginBottom: '6px' }}>
                    {stat.value}
                  </p>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
                    {stat.label}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    {stat.sub}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Employer CTA ── */}
      <AnimatedSection animation="fade-up">
        <section style={{
          background: 'linear-gradient(135deg, #022a8a 0%, #033BB0 100%)',
          padding: '80px 24px',
          textAlign: 'center',
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            For Employers
          </p>
          <h2 style={{
            color: 'white',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            margin: '0 0 16px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Hire Muslim Talent Today
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '17px',
            maxWidth: '500px',
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}>
            Post your job and reach thousands of qualified Muslim professionals
            worldwide. Halal-conscious hiring starts here.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/employers/why-post"
              style={{
                padding: '14px 32px',
                background: '#0FBB0F',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Post a Job
            </a>
            <a
              href="/employers/why-post#pricing"
              style={{
                padding: '14px 32px',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              View Packages
            </a>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '24px' }}>
            Trusted by 100+ employers • No hidden fees • Cancel anytime
          </p>
        </section>
      </AnimatedSection>
      <NewsletterPopup />
    </div>
  )
}
