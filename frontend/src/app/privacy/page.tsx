import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | UmmahJobs',
}

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly to us, such as your name, email address, employment history, CV, and profile details. We also automatically collect usage data, including IP addresses, browser type, pages visited, and the time and date of your visit.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to provide and improve the platform, match candidates with relevant job opportunities, send job alerts and newsletters (with your consent), communicate with you about your account, process payments, and comply with legal obligations.',
  },
  {
    title: '3. Information Sharing',
    body: 'We do not sell your personal information. We may share your information with employers when you apply to their listings, with service providers who assist in operating the platform (e.g., payment processors, email services), and when required by law. Employers receive only the information necessary to evaluate your application.',
  },
  {
    title: '4. Data Security',
    body: 'We implement industry-standard security measures to protect your information, including encryption in transit and at rest. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong password and keep your account credentials confidential.',
  },
  {
    title: '5. Cookies',
    body: 'We use cookies and similar technologies to maintain your session, remember preferences, and analyse site traffic. You can control cookie settings through your browser. Disabling cookies may affect certain features of the platform.',
  },
  {
    title: '6. Your Rights',
    body: 'Depending on your location, you may have the right to access, correct, or delete your personal information. You may also have the right to object to or restrict certain processing activities. To exercise these rights, please contact us at mail@ummahjobs.com. We will respond within 30 days.',
  },
  {
    title: '7. Contact Us',
    body: 'For questions, concerns, or requests related to your privacy, please contact us at: mail@ummahjobs.com or by post at Ummah Media Group LLC, 515 Madison Ave Suite 9111, Manhattan, New York 10022, United States.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-8">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Privacy Policy</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400">
          Last updated: April 2026 · Operated by Ummah Media Group LLC
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((sec) => (
          <section key={sec.title} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-2">{sec.title}</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{sec.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 text-center text-sm text-gray-400">
        Questions?{' '}
        <Link href="/contact" className="hover:underline" style={{ color: '#033BB0' }}>
          Contact us
        </Link>
      </div>
    </div>
  )
}
