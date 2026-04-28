'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import FeedbackModal from '@/components/ui/FeedbackModal'

interface FeedbackItem {
  id: number
  type: 'bug' | 'feature' | 'general'
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  admin_notes: string | null
  created_at: string
}

const TYPE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  bug:     { bg: '#FEF2F2', color: '#EF4444', label: 'Bug Report' },
  feature: { bg: '#EFF6FF', color: '#033BB0', label: 'Feature Request' },
  general: { bg: '#F0FFF4', color: '#0FBB0F', label: 'General' },
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  open:        { bg: '#FEF2F2', color: '#EF4444', label: 'Open' },
  in_progress: { bg: '#FFFBEB', color: '#D97706', label: 'In Progress' },
  resolved:    { bg: '#F0FFF4', color: '#0FBB0F', label: 'Resolved' },
}

export default function EmployerFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  function load() {
    setLoading(true)
    api.get('/api/feedback')
      .then((d: { feedback: FeedbackItem[] }) => setItems(d.feedback))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Feedback</h1>
            <p className="text-sm text-gray-500 mt-1">Track your submitted feedback and requests</p>
          </div>
          <button
            onClick={() => setFeedbackOpen(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#033BB0' }}
          >
            + New Feedback
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-6 w-6" style={{ color: '#033BB0' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#F0F4FF' }}>
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No feedback submitted yet</h3>
            <p className="text-sm text-gray-500 mb-5">Have a suggestion or found a bug? We&apos;d love to hear from you.</p>
            <button
              onClick={() => setFeedbackOpen(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#033BB0' }}
            >
              Send Feedback
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const ts = TYPE_STYLES[item.type]
              const ss = STATUS_STYLES[item.status]
              const isExpanded = expandedId === item.id
              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0" style={{ backgroundColor: ts.bg, color: ts.color }}>
                      {ts.label}
                    </span>
                    <span className="flex-1 text-sm font-medium text-gray-900 text-left">{item.title}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0" style={{ backgroundColor: ss.bg, color: ss.color }}>
                      {ss.label}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{formatDate(item.created_at)}</span>
                    <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-4 border-t border-gray-100 pt-3 space-y-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>
                      {item.admin_notes && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: '#EFF6FF' }}>
                          <p className="text-xs font-semibold mb-1" style={{ color: '#033BB0' }}>Admin Notes</p>
                          <p className="text-sm" style={{ color: '#1E40AF' }}>{item.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => { setFeedbackOpen(false); load() }}
        userRole="employer"
      />
    </>
  )
}
