import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | UmmahJobs',
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using UmmahJobs, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the platform.',
  },
  {
    title: '2. Use of the Platform',
    body: 'You agree to use UmmahJobs only for lawful purposes and in a manner that does not infringe the rights of others. You must not post false, misleading, or fraudulent content. We reserve the right to remove content or suspend accounts that violate these terms at our sole discretion.',
  },
  {
    title: '3. Employer Responsibilities',
    body: 'Employers are responsible for ensuring that all job listings are accurate, legal, and compliant with applicable employment laws. Employers must not discriminate based on race, religion, gender, or other protected characteristics except where permitted by law.',
  },
  {
    title: '4. Candidate Responsibilities',
    body: 'Candidates are responsible for providing accurate and truthful information in their profiles and applications. Misrepresentation of qualifications or experience may result in account suspension.',
  },
  {
    title: '5. Package Purchases and Refunds',
    body: 'All package purchases are final unless otherwise agreed in writing. Unused credits do not expire. Refund requests will be considered on a case-by-case basis. Please contact mail@ummahjobs.com for any refund inquiries.',
  },
  {
    title: '6. Intellectual Property',
    body: 'All content on UmmahJobs, including logos, copy, and design, is the property of Ummah Media Group LLC or its licensors. You may not reproduce, distribute, or create derivative works without written permission.',
  },
  {
    title: '7. Privacy',
    body: 'Your use of the platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'UmmahJobs and Ummah Media Group LLC are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. We do not guarantee employment outcomes or the accuracy of third-party listings.',
  },
  {
    title: '9. Changes to Terms',
    body: 'We may update these Terms of Service from time to time. Continued use of the platform after changes are posted constitutes acceptance of the updated terms. We will notify users of material changes via email or a notice on the platform.',
  },
  {
    title: '10. Contact Us',
    body: 'For questions about these terms, please contact us at mail@ummahjobs.com or by post at: Ummah Media Group LLC, 515 Madison Ave Suite 9111, Manhattan, New York 10022, United States.',
  },
]

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-8">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Terms of Service</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400">
          Last updated: April 2026 · Operated by Ummah Media Group LLC
        </p>
      </div>

      <div className="space-y-8">
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
