'use client'

import Link from 'next/link'

export default function CandidateMessagesPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Messages</h1>
      <p className="text-sm text-gray-400 mb-10">Private messaging with employers</p>

      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E6EDFF' }}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h2 className="font-semibold text-gray-900 mb-2">Private Messaging</h2>
        <p className="text-sm text-gray-500 mb-6">Private messaging with employers — coming soon.</p>
        <Link
          href="/candidate/dashboard"
          className="text-sm font-medium hover:underline"
          style={{ color: '#033BB0' }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
