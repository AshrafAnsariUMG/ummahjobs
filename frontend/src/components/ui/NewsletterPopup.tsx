'use client'

import { useState, useEffect } from 'react'

const POPUP_DELAY = 8000
const DISMISSED_KEY = 'uj_newsletter_dismissed'
const SUBSCRIBED_KEY = 'uj_newsletter_subscribed'

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    const subscribed = localStorage.getItem(SUBSCRIBED_KEY)
    if (dismissed || subscribed) return

    const timer = setTimeout(() => setVisible(true), POPUP_DELAY)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, 'true')
  }

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email,
            first_name: firstName || undefined,
          }),
        }
      )

      if (res.ok) {
        setSuccess(true)
        localStorage.setItem(SUBSCRIBED_KEY, 'true')
        setTimeout(() => setVisible(false), 3000)
      } else {
        const data = await res.json()
        setError(data.message || 'Something went wrong.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <>
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999,
          animation: 'fadeIn 0.3s ease',
        }}
      />

      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '360px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'slideUp 0.4s ease',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #022E8A, #033BB0)',
          padding: '24px',
          position: 'relative',
        }}>
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ×
          </button>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}>
            Stay Updated
          </p>
          <h3 style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: 800,
            margin: '0 0 6px',
            lineHeight: 1.3,
          }}>
            Get Halal Job Alerts
          </h3>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '13px',
            margin: 0,
            lineHeight: 1.5,
          }}>
            Weekly halal opportunities delivered to your inbox. Free, no spam.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤲</div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
                JazakAllah Khayran!
              </h4>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                You&apos;re subscribed! May Allah bless your job search. 🌙
              </p>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="First name (optional)"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '10px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#111827',
                }}
              />
              <input
                type="email"
                placeholder="your@email.com *"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${error ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '10px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#111827',
                }}
              />

              {error && (
                <p style={{ color: '#EF4444', fontSize: '12px', margin: '-4px 0 8px' }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: loading ? '#9CA3AF' : '#0FBB0F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '12px',
                }}
              >
                {loading ? 'Subscribing...' : 'Subscribe — Bismillah'}
              </button>

              <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', margin: 0 }}>
                No spam. Unsubscribe anytime. Halal only.
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) }
          to { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </>
  )
}
