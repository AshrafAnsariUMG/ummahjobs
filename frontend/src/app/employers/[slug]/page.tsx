import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Employer, EmployerReview, Job } from '@/types'
import CompanyLogoFallback from '@/components/ui/CompanyLogoFallback'
import JobCard from '@/components/jobs/JobCard'
import { getStorageUrl } from '@/lib/imageUtils'
import EmployerReviewsSection from '@/components/employers/EmployerReviewsSection'

const API = process.env.NEXT_PUBLIC_API_URL

interface EmployerData {
  employer: Employer
  jobs: Job[]
  jobsCount: number
}

async function getEmployerData(slug: string): Promise<EmployerData | null> {
  try {
    const res = await fetch(`${API}/api/employers/${slug}`, { next: { revalidate: 300 } })
    if (res.status === 404) return null
    if (!res.ok) return null
    const data = await res.json()
    const employer = data.employer ?? data
    if (!employer?.id) return null
    // Jobs embedded in the employer response omit the nested employer object
    // (redundant data). JobCard requires job.employer, so inject it here.
    const jobs: Job[] = (data.jobs ?? []).map((job: Job) => ({
      ...job,
      employer: job.employer ?? employer,
    }))
    return {
      employer,
      jobs,
      jobsCount: data.jobs_count ?? jobs.length,
    }
  } catch {
    return null
  }
}

async function getEmployerReviews(slug: string): Promise<EmployerReview[]> {
  try {
    const res = await fetch(`${API}/api/employers/${slug}/reviews`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.reviews ?? data.data ?? [])
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-4 h-4"
          fill={star <= Math.round(rating) ? '#f59e0b' : '#e5e7eb'}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const data = await getEmployerData(slug)
  if (!data) return {}
  return {
    title: `${data.employer.company_name} | UmmahJobs`,
    description: data.employer.description?.slice(0, 155) ?? `Jobs at ${data.employer.company_name}`,
  }
}

export default async function EmployerProfilePage({ params }: PageProps) {
  const { slug } = await params
  const [employerData, reviews] = await Promise.all([
    getEmployerData(slug),
    getEmployerReviews(slug),
  ])

  if (!employerData) notFound()

  const { employer, jobs } = employerData

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null

  const logoUrl = getStorageUrl(employer.logo_path)
  const coverUrl = getStorageUrl(employer.cover_photo_path)

  const socialIcons: Record<string, ReactNode> = {
    linkedin: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
    twitter: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    facebook: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    instagram: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    tiktok: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.54V6.78a4.84 4.84 0 01-1.07-.09z" />
      </svg>
    ),
    youtube: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.272 3.568z" />
      </svg>
    ),
    website: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3a14.4 14.4 0 010 18M12 3a14.4 14.4 0 000 18" />
      </svg>
    ),
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cover + overlapping logo header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
        {/* Outer wrapper: position relative, overflow visible so logo can hang below */}
        <div style={{ position: 'relative', marginBottom: '50px' }}>
          {/* Image container — overflow hidden for border-radius clipping */}
          <div style={{
            width: '100%',
            height: '200px',
            borderRadius: '12px 12px 0 0',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #033BB0, #0256CC)',
          }}>
            {coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt="Cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>

          {/* Logo — absolutely positioned, NOT inside the clipped container */}
          <div style={{
            position: 'absolute',
            bottom: '-40px',
            left: '32px',
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            background: 'white',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            zIndex: 10,
          }}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={employer.company_name ?? ''}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <CompanyLogoFallback size="lg" rounded="lg" />
            )}
          </div>
        </div>

        {/* Employer name + details */}
        <div style={{ paddingLeft: '32px', paddingRight: '24px', paddingBottom: '24px', paddingTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
              {employer.company_name}
            </h1>
          </div>
          <p style={{ color: '#6B7280', fontSize: '15px', margin: '4px 0 0' }}>
            {employer.category ?? 'Company'}
          </p>
          {employer.email && (
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '4px 0 0' }}>
              {employer.email}
            </p>
          )}

          {/* Contact row */}
          <div className="flex flex-wrap items-center gap-4 mt-3" style={{ fontSize: '14px', color: '#6B7280' }}>
            {employer.address && (
              <span className="flex items-center gap-1">
                <span>📍</span> {employer.address}
              </span>
            )}
            {employer.phone && (
              <span className="flex items-center gap-1">
                <span>📞</span> {employer.phone}
              </span>
            )}
            {avgRating !== null && (
              <span className="flex items-center gap-1.5">
                <StarRating rating={avgRating} />
                <span style={{ fontSize: '12px' }}>
                  {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </span>
            )}
          </div>

          {/* Socials */}
          {employer.socials && employer.socials.length > 0 && (
            <div className="flex gap-2 mt-4">
              {employer.socials.map((s) => (
                <a
                  key={s.network}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.network}
                  title={s.network}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
                >
                  {socialIcons[s.network.toLowerCase()] ?? (
                    <span className="text-xs font-semibold">{s.network.charAt(0).toUpperCase()}</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main */}
        <main className="flex-1 min-w-0 space-y-8">
          {/* About */}
          {employer.description && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About {employer.company_name}</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{employer.description}</p>
            </section>
          )}

          {/* Jobs */}
          {jobs.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Open Positions ({jobs.length})</h2>
                <Link href="/jobs" className="text-sm font-medium hover:underline" style={{ color: '#033BB0' }}>
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} variant="list" />
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <EmployerReviewsSection slug={slug} initialReviews={reviews} />
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Company Info</h3>
            <dl className="space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Open jobs</dt>
                <dd className="font-semibold text-gray-900">{jobs.length}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Profile views</dt>
                <dd className="font-semibold text-gray-900">{(employer.views_count ?? 0).toLocaleString()}</dd>
              </div>
              {avgRating !== null && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Rating</dt>
                  <dd className="font-semibold text-gray-900">{avgRating.toFixed(1)} / 5</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Map placeholder */}
          {employer.map_lat && employer.map_lng && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Location</h3>
              <div className="bg-gray-100 rounded-xl h-36 flex items-center justify-center text-gray-400 text-xs">
                📍 {employer.address ?? `${employer.map_lat}, ${employer.map_lng}`}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
