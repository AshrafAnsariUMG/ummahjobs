import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Job } from '@/types'
import BookmarkButton from '@/components/jobs/BookmarkButton'
import ShareButtons from '@/components/jobs/ShareButtons'
import AIMatchScore from '@/components/jobs/AIMatchScore'
import MessageEmployerButton from '@/components/jobs/MessageEmployerButton'
import { categoryIcons, defaultIcon } from '@/lib/categoryIcons'

const API = process.env.NEXT_PUBLIC_API_URL
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ummahjobs.com'

async function getJob(slug: string): Promise<Job | null> {
  try {
    const res = await fetch(`${API}/api/jobs/${slug}`, { next: { revalidate: 300 } })
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

function formatSalary(job: Job): string | null {
  if (!job.salary_min && !job.salary_max) return null
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: job.salary_currency ?? 'GBP', maximumFractionDigits: 0 }).format(n)
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}`
  if (job.salary_min) return `From ${fmt(job.salary_min)}`
  return `Up to ${fmt(job.salary_max!)}`
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const job = await getJob(slug)
  if (!job) return {}
  return {
    title: `${job.title} at ${job.employer.company_name ?? 'UmmahJobs'} | UmmahJobs`,
    description: job.description?.slice(0, 155) ?? '',
  }
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params
  const job = await getJob(slug)
  if (!job) notFound()

  const salary = formatSalary(job)
  const logoSrc = job.employer.logo_path
  const jobUrl = `${SITE}/jobs/${job.slug}`

  const badges: { label: string }[] = [
    ...(job.job_type ? [{ label: job.job_type }] : []),
    ...(job.location ? [{ label: job.location }] : []),
    ...(job.experience_level ? [{ label: job.experience_level }] : []),
    ...(job.career_level ? [{ label: job.career_level }] : []),
    ...(salary ? [{ label: salary }] : []),
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {/* Breadcrumb */}
            <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
              <Link href="/jobs" className="hover:text-gray-600">Jobs</Link>
              <span>/</span>
              {job.category && (
                <>
                  <Link href={`/jobs?category=${job.category.slug}`} className="hover:text-gray-600">
                    {job.category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-gray-600 truncate">{job.title}</span>
            </nav>

            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 rounded-xl border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center bg-gray-50">
                {logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoSrc} alt={job.employer.company_name ?? ''} width={64} height={64} className="object-contain" />
                ) : (
                  <span className="text-xl font-bold" style={{ color: '#033BB0' }}>
                    {job.employer.company_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">{job.title}</h1>
                    <Link
                      href={`/employers/${job.employer.slug}`}
                      className="text-sm font-medium hover:underline mt-0.5 block"
                      style={{ color: '#033BB0' }}
                    >
                      {job.employer.company_name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <BookmarkButton jobId={job.id} />
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {job.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#033BB0' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width={12} height={12}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    Featured
                  </span>
                )}
                {job.is_urgent && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    <svg viewBox="0 0 24 24" fill="currentColor" width={12} height={12}><path d="M13 2L3 14h9l-1 8 10-12h-9z" /></svg>
                    Urgent
                  </span>
                )}
                {badges.map((b) => (
                  <span key={b.label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {b.label}
                  </span>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <ShareButtons title={`${job.title} at ${job.employer.company_name}`} url={jobUrl} />
            </div>
          </div>

          {/* AI Match Score (client, token-aware) */}
          <AIMatchScore jobSlug={job.slug} />

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          {/* Apply card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Apply for this role</h3>

            {job.apply_type === 'external' && job.apply_url ? (
              <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-5 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#033BB0' }}
              >
                Apply Now →
              </a>
            ) : (
              <Link
                href={`/jobs/${job.slug}/apply`}
                className="block w-full text-center px-5 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#033BB0' }}
              >
                Apply Now →
              </Link>
            )}

            <MessageEmployerButton employerUserId={job.employer.user_id} />

            {job.expires_at && (
              <p className="text-xs text-gray-400 text-center mt-3">
                Closes {new Date(job.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}

            {/* Job details list */}
            <dl className="mt-5 space-y-3 border-t border-gray-100 pt-5">
              {job.category && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Category</dt>
                  <dd className="text-gray-900 font-medium flex items-center gap-1">
                    <span>{categoryIcons[job.category.slug] ?? defaultIcon}</span>
                    {job.category.name}
                  </dd>
                </div>
              )}
              {job.job_type && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="text-gray-900 font-medium">{job.job_type}</dd>
                </div>
              )}
              {job.location && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Location</dt>
                  <dd className="text-gray-900 font-medium">{job.location}</dd>
                </div>
              )}
              {salary && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Salary</dt>
                  <dd className="text-gray-900 font-medium">{salary}</dd>
                </div>
              )}
              {job.experience_level && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Experience</dt>
                  <dd className="text-gray-900 font-medium capitalize">{job.experience_level}</dd>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Posted</dt>
                <dd className="text-gray-900 font-medium">
                  {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Employer mini-card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">About the employer</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center bg-gray-50 shrink-0">
                {logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoSrc} alt={job.employer.company_name ?? ''} width={40} height={40} className="object-contain" />
                ) : (
                  <span className="text-sm font-bold" style={{ color: '#033BB0' }}>
                    {job.employer.company_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{job.employer.company_name}</p>
                {job.employer.category && <p className="text-xs text-gray-500">{job.employer.category}</p>}
              </div>
            </div>
            {job.employer.description && (
              <p className="text-xs text-gray-600 line-clamp-3 mb-3">{job.employer.description}</p>
            )}
            <Link
              href={`/employers/${job.employer.slug}`}
              className="text-xs font-medium hover:underline"
              style={{ color: '#033BB0' }}
            >
              View company profile →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
