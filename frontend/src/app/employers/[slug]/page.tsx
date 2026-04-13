import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Employer, EmployerReview, Job, PaginatedResponse } from '@/types'
import JobCard from '@/components/jobs/JobCard'

const API = process.env.NEXT_PUBLIC_API_URL

async function getEmployer(slug: string): Promise<Employer | null> {
  try {
    const res = await fetch(`${API}/api/employers/${slug}`, { next: { revalidate: 300 } })
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getEmployerJobs(slug: string): Promise<Job[]> {
  try {
    const res = await fetch(`${API}/api/jobs?employer=${slug}&per_page=6`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data: PaginatedResponse<Job> = await res.json()
    return data.data ?? []
  } catch {
    return []
  }
}

async function getEmployerReviews(slug: string): Promise<EmployerReview[]> {
  try {
    const res = await fetch(`${API}/api/employers/${slug}/reviews`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    return res.json()
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
  const employer = await getEmployer(slug)
  if (!employer) return {}
  return {
    title: `${employer.company_name} | UmmahJobs`,
    description: employer.description?.slice(0, 155) ?? `Jobs at ${employer.company_name}`,
  }
}

export default async function EmployerProfilePage({ params }: PageProps) {
  const { slug } = await params
  const [employer, jobs, reviews] = await Promise.all([
    getEmployer(slug),
    getEmployerJobs(slug),
    getEmployerReviews(slug),
  ])

  if (!employer) notFound()

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null

  const socialIcons: Record<string, string> = {
    linkedin: 'in',
    twitter: 'X',
    facebook: 'f',
    instagram: 'ig',
    website: '🌐',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cover + Logo header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
        {/* Cover */}
        <div
          className="h-40 sm:h-52 w-full bg-gradient-to-r from-blue-600 to-blue-800 relative"
          style={employer.cover_photo_path ? { backgroundImage: `url(${employer.cover_photo_path})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        />

        {/* Profile info */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-5 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
              {employer.logo_path ? (
                <Image src={employer.logo_path} alt={employer.company_name} width={80} height={80} className="object-contain" />
              ) : (
                <span className="text-2xl font-bold" style={{ color: '#033BB0' }}>
                  {employer.company_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-gray-900">{employer.company_name}</h1>
                {employer.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border" style={{ backgroundColor: '#E6F9E6', color: '#0FBB0F', borderColor: '#0FBB0F' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={12} height={12}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Halal Verified
                  </span>
                )}
              </div>
              {employer.category && <p className="text-sm text-gray-500 mt-0.5">{employer.category}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {employer.address && (
              <span className="flex items-center gap-1">
                <span>📍</span> {employer.address}
              </span>
            )}
            {employer.email && (
              <a href={`mailto:${employer.email}`} className="flex items-center gap-1 hover:text-gray-700">
                <span>✉️</span> {employer.email}
              </a>
            )}
            {employer.phone && (
              <span className="flex items-center gap-1">
                <span>📞</span> {employer.phone}
              </span>
            )}
            {avgRating !== null && (
              <span className="flex items-center gap-1.5">
                <StarRating rating={avgRating} />
                <span className="text-xs">{avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
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
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 hover:border-gray-300 transition-colors"
                >
                  {socialIcons[s.network] ?? s.network.charAt(0).toUpperCase()}
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
                <Link href={`/jobs?employer=${employer.slug}`} className="text-sm font-medium hover:underline" style={{ color: '#033BB0' }}>
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
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {review.reviewer?.display_name ?? 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-gray-700 leading-relaxed">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-500 text-sm">No reviews yet. Be the first to leave one.</p>
              </div>
            )}
          </section>
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
                <dd className="font-semibold text-gray-900">{employer.views_count.toLocaleString()}</dd>
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
