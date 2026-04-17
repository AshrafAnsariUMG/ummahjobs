'use client'

import { useState } from 'react'
import { DuaHandsIcon } from '@/components/ui/IslamicIcons'

interface Props {
  dark?: boolean
}

export default function NewsletterSignup({ dark = false }: Props) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, first_name: firstName }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.message ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Unable to subscribe. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium ${dark ? 'bg-white/15 text-white border border-white/25' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              JazakAllah Khayran! You&apos;re subscribed. May Allah bless your career journey.
              <DuaHandsIcon size={16} />
            </span>
        </div>
      </div>
    )
  }

  const inputClass = dark
    ? 'w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white/10 border-white/25 text-white placeholder-white/60'
    : 'w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Your first name (optional)"
        className={inputClass}
        style={{ '--tw-ring-color': dark ? '#0FBB0F' : '#033BB0' } as React.CSSProperties}
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent ${dark ? 'bg-white/10 border-white/25 text-white placeholder-white/60' : 'border-gray-300 bg-white'}`}
        style={{ '--tw-ring-color': dark ? '#0FBB0F' : '#033BB0' } as React.CSSProperties}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        style={{ backgroundColor: dark ? '#0FBB0F' : '#033BB0' }}
      >
        {isLoading ? 'Subscribing…' : 'Subscribe Free'}
      </button>
      {error && (
        <p className={`text-xs ${dark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
      )}
    </form>
  )
}
