import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Employer, EmployerReview, Job, PaginatedResponse } from '@/types'
import JobCard from '@/components/jobs/JobCard'

const API = process.env.NEXT_PUBLIC_API_URL

function getImageUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  if (path.startsWith('/storage/')) return (API ?? '') + path
  return (API ?? '') + '/storage/' + path
}

async function getEmployer(slug: string): Promise<Employer | null> {
  try {
    const res = await fetch(`${API}/api/employers/${slug}`, { next: { revalidate: 300 } })
    if (res.status === 404) return null
    if (!res.ok) return null
    const data = await res.json()
    return data.employer ?? data
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

  const logoUrl = getImageUrl(employer.logo_path)
  const coverUrl = getImageUrl(employer.cover_photo_path)

  const socialIcons: Record<string, string> = {
    linkedin: 'in',
    twitter: 'X',
    facebook: 'f',
    instagram: 'ig',
    website: '🌐',
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
              <span style={{ fontSize: '28px', fontWeight: '700', color: '#033BB0' }}>
                {employer.company_name?.charAt(0)?.toUpperCase() ?? 'E'}
              </span>
            )}
          </div>
        </div>

        {/* Employer name + details */}
        <div style={{ paddingLeft: '32px', paddingRight: '24px', paddingBottom: '24px', paddingTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
              {employer.company_name}
            </h1>
            {employer.is_verified && (
              <span style={{
                background: '#DCFCE7',
                color: '#166534',
                border: '1px solid #BBF7D0',
                borderRadius: '20px',
                padding: '2px 10px',
                fontSize: '12px',
                fontWeight: '500',
              }}>
                ✓ Halal Verified
              </span>
            )}
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
