'use client'

import { useEffect, useState } from 'react'

interface Settings {
  announcement_enabled: string
  announcement_text: string
  announcement_url?: string
  announcement_color?: string
}

const API = process.env.NEXT_PUBLIC_API_URL

export default function AnnouncementBar() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then((r) => r.json())
      .then((data: Settings) => {
        if (data.announcement_enabled !== '1' && data.announcement_enabled !== 'true') return
        // Key dismiss state by the text content so new announcements always show
        const key = `announcement_dismissed_${btoa(data.announcement_text ?? '')}`
        if (localStorage.getItem(key) === '1') {
          setDismissed(true)
        }
        setSettings(data)
      })
      .catch(() => {/* silently fail */})
  }, [])

  function handleDismiss() {
    if (!settings?.announcement_text) return
    const key = `announcement_dismissed_${btoa(settings.announcement_text)}`
    localStorage.setItem(key, '1')
    setDismissed(true)
  }

  if (!settings || settings.announcement_enabled !== '1' || dismissed) return null
  if (!settings.announcement_text) return null

  const bg = settings.announcement_color || '#033BB0'

  const content = (
    <span style={{ fontSize: '14px', fontWeight: 500, color: 'white' }}>
      {settings.announcement_text}
    </span>
  )

  return (
    <div
      style={{
        background: bg,
        padding: '10px 48px 10px 16px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {settings.announcement_url ? (
        <a
          href={settings.announcement_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          {content}
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginLeft: '6px' }}>→</span>
        </a>
      ) : (
        content
      )}

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.7)',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
          <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
          <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
