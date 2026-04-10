'use client'

import Link from 'next/link'

export default function EmployerApplicantsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Applicants</h1>
      <p className="text-sm text-gray-400 mb-10">Manage applications from candidates</p>

      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E6EDFF' }}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="font-semibold text-gray-900 mb-2">Applicant Management</h2>
        <p className="text-sm text-gray-500 mb-1">Manage job applications — coming in the next update.</p>
        <p className="text-xs text-gray-400 mb-6">You&apos;ll be able to view, filter, and respond to candidate applications here.</p>
        <Link
          href="/employer/dashboard"
          className="text-sm font-medium hover:underline"
          style={{ color: '#033BB0' }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
