import Link from 'next/link'

export const metadata = {
  title: 'About Us | UmmahJobs',
  description: 'UmmahJobs is a halal employment platform connecting Muslim job seekers with employers worldwide.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-8">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        <span className="text-gray-600">About</span>
      </nav>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-12">About UmmahJobs</h1>

      {/* Mission */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span style={{ color: '#033BB0' }}>01.</span> Our Mission
        </h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <p className="text-gray-700 leading-relaxed">
            UmmahJobs.com is a halal employment platform dedicated to connecting Muslim job seekers
            with employers who offer Muslim-friendly, ethical work environments. We believe every
            Muslim deserves the opportunity to earn halal rizq in a workplace that respects their
            values and faith.
          </p>
        </div>
      </section>

      {/* What We Offer */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span style={{ color: '#033BB0' }}>02.</span> What We Offer
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-3">For Candidates</h3>
            <ul className="space-y-2">
              {[
                'Access to hundreds of halal job listings',
                'AI-powered job matching',
                'CV review and career tools',
                'Job alerts delivered to your inbox',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register?role=candidate"
              className="inline-block mt-5 text-sm font-medium hover:underline"
              style={{ color: '#033BB0' }}
            >
              Create a candidate profile →
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-3">For Employers</h3>
            <ul className="space-y-2">
              {[
                'Reach a targeted Muslim professional audience',
                'Featured listings for maximum visibility',
                'Simple, transparent pricing',
                'Newsletter inclusion with Extended packages',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/packages"
              className="inline-block mt-5 text-sm font-medium hover:underline"
              style={{ color: '#033BB0' }}
            >
              View posting packages →
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span style={{ color: '#033BB0' }}>03.</span> Our Story
        </h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <p className="text-gray-700 leading-relaxed mb-6">
            UmmahJobs is operated by Ummah Media Group LLC, a New York-based company dedicated to
            building digital platforms that serve the global Muslim community.
          </p>
          <div className="border-t border-gray-100 pt-6">
            <address className="not-italic text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">Ummah Media Group LLC</p>
              <p>515 Madison Ave Suite 9111</p>
              <p>Manhattan, New York 10022</p>
              <p>United States</p>
              <p className="mt-3">
                Phone:{' '}
                <a href="tel:+18668870844" className="hover:underline" style={{ color: '#033BB0' }}>
                  +1 866-887-0844
                </a>
              </p>
              <p>
                Email:{' '}
                <a href="mailto:mail@ummahjobs.com" className="hover:underline" style={{ color: '#033BB0' }}>
                  mail@ummahjobs.com
                </a>
              </p>
            </address>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/jobs"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#033BB0' }}
        >
          Browse Jobs
        </Link>
        <Link
          href="/contact"
          className="px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
          style={{ color: '#033BB0', borderColor: '#033BB0' }}
        >
          Contact Us
        </Link>
      </div>
    </div>
  )
}
