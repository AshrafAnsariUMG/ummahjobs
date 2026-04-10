import Link from 'next/link'
import type { Package } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL

async function getPackages(): Promise<Package[]> {
  try {
    const res = await fetch(`${API}/api/packages`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export const metadata = {
  title: 'Job Posting Packages | UmmahJobs',
  description: 'Choose the right package to reach Muslim professionals worldwide.',
}

const FAQS = [
  {
    q: 'How long does a job listing stay active?',
    a: 'Basic and Standard listings are active for 40 days. Extended listings stay active for 60 days.',
  },
  {
    q: 'Can I edit my job listing after posting?',
    a: 'Yes, you can edit your listing from your employer dashboard at any time.',
  },
  {
    q: 'What is a Featured listing?',
    a: 'Featured listings appear at the top of search results and in the homepage carousel, giving your job significantly more visibility.',
  },
  {
    q: 'Do unused credits expire?',
    a: 'Package credits do not expire. You can use them whenever you are ready to post.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Please contact us at mail@ummahjobs.com for refund requests.',
  },
]

function getPostTypeLabel(postType: string): string {
  switch (postType) {
    case 'standard': return 'Standard listing'
    case 'featured': return 'Featured listing'
    case 'urgent': return 'Urgent listing'
    default: return postType
  }
}

function getSupportLabel(pkg: Package): string {
  if (pkg.name.toLowerCase().includes('extended')) return 'Priority support'
  if (pkg.name.toLowerCase().includes('standard')) return 'Email support'
  return 'Community support'
}

function isRecommended(pkg: Package, all: Package[]): boolean {
  const maxPrice = Math.max(...all.map((p) => Number(p.price)))
  return pkg.name.toLowerCase().includes('extended') || Number(pkg.price) === maxPrice
}

export default async function PackagesPage() {
  const packages = await getPackages()

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-16 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
          Be the path to someone&apos;s <span style={{ color: '#033BB0' }}>Rizq</span>,
        </h1>
        <p className="text-2xl font-semibold text-gray-600 mb-4">Post your job today!</p>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Reach thousands of qualified Muslim professionals with our transparent,
          simple pricing.
        </p>
      </section>

      {/* Packages grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {packages.map((pkg) => {
              const recommended = isRecommended(pkg, packages)
              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-2xl border-2 p-8 relative transition-shadow hover:shadow-md ${
                    recommended ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  {recommended && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: '#033BB0' }}
                    >
                      Recommended
                    </div>
                  )}

                  <h2 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h2>

                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${Number(pkg.price).toFixed(0)}
                    </span>
                    <span className="text-gray-400 text-sm ml-1">one-time</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {pkg.post_count} job post{pkg.post_count !== 1 ? 's' : ''}
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Active for {pkg.duration_days} days
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {getPostTypeLabel(pkg.post_type)}
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {getSupportLabel(pkg)}
                    </li>
                    {pkg.includes_newsletter && (
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Newsletter inclusion
                      </li>
                    )}
                  </ul>

                  <Link
                    href="/register?role=employer"
                    className={`block w-full text-center px-5 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 ${
                      recommended ? 'text-white' : 'border-2'
                    }`}
                    style={
                      recommended
                        ? { backgroundColor: '#033BB0' }
                        : { color: '#033BB0', borderColor: '#033BB0' }
                    }
                  >
                    Get Started
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
            <p className="text-gray-500 text-sm">Packages coming soon.</p>
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-8">
          All prices in USD. Need a custom plan?{' '}
          <Link href="/contact" className="hover:underline" style={{ color: '#033BB0' }}>
            Contact us
          </Link>
          .
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
