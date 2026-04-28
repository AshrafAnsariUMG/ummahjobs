'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

type FeedbackType = 'bug' | 'feature' | 'general'

interface Props {
  isOpen: boolean
  onClose: () => void
  userRole: 'candidate' | 'employer'
}

export default function FeedbackModal({ isOpen, onClose }: Props) {
  const [type, setType] = useState<FeedbackType>('general')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const titlePlaceholder =
    type === 'bug' ? "What's not working?" :
    type === 'feature' ? 'What feature would you like?' :
    "What's on your mind?"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/feedback', { type, title, description })
      setSubmitted(true)
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setSubmitted(false)
    setType('general')
    setTitle('')
    setDescription('')
    setError(null)
    onClose()
  }

  const typeOptions: { value: FeedbackType; label: string; sub: string; selectedBg: string; selectedBorder: string; iconColor: string; icon: React.ReactNode }[] = [
    {
      value: 'bug',
      label: 'Bug Report',
      sub: "Something isn't working",
      selectedBg: '#FEF2F2',
      selectedBorder: '#EF4444',
      iconColor: '#EF4444',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      value: 'feature',
      label: 'Feature Request',
      sub: 'I have an idea',
      selectedBg: '#EFF6FF',
      selectedBorder: '#033BB0',
      iconColor: '#033BB0',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      ),
    },
    {
      value: 'general',
      label: 'General',
      sub: 'Something else',
      selectedBg: '#F0FFF4',
      selectedBorder: '#0FBB0F',
      iconColor: '#0FBB0F',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Send Feedback</h2>
            <p className="text-sm text-gray-500 mt-0.5">Help us improve UmmahJobs</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#F0FFF4' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#0FBB0F" strokeWidth={2} className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 4.5h3" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">JazakAllah Khayran!</h3>
              <p className="text-sm text-gray-500 mb-6">Your feedback has been submitted. We&apos;ll review it shortly.</p>
              <button
                onClick={handleClose}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#033BB0' }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type selector */}
              <div className="grid grid-cols-3 gap-2">
                {typeOptions.map((opt) => {
                  const isSelected = type === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all"
                      style={{
                        backgroundColor: isSelected ? opt.selectedBg : 'white',
                        borderColor: isSelected ? opt.selectedBorder : '#E5E7EB',
                      }}
                    >
                      <span style={{ color: opt.iconColor }}>{opt.icon}</span>
                      <span className="text-xs font-semibold text-gray-900">{opt.label}</span>
                      <span className="text-xs text-gray-500 leading-tight">{opt.sub}</span>
                    </button>
                  )
                })}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={titlePlaceholder}
                  maxLength={255}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide as much detail as possible..."
                  maxLength={2000}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/2000</p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                style={{ backgroundColor: '#033BB0' }}
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
