'use client'

import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%',
          background: 'linear-gradient(160deg, #022E8A 0%, #033BB0 40%, #0256CC 100%)',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <a href="/">
          <img
            src="/images/logo.png"
            alt="UmmahJobs"
            style={{ height: '36px', width: 'auto', filter: 'brightness(0) invert(1)' }}
          />
        </a>

        {/* Middle content */}
        <div>
          <h2 style={{
            color: 'white',
            fontSize: '30px',
            fontWeight: '700',
            lineHeight: '1.3',
            marginBottom: '12px',
          }}>
            Your Next Halal<br />
            Career Starts Here
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '15px',
            marginBottom: '28px',
            lineHeight: '1.6',
          }}>
            Join thousands of Muslim professionals finding meaningful, halal employment worldwide.
          </p>

          {[
            'AI-powered job matching',
            '100+ Muslim-friendly employers',
            'Free to register as a candidate',
          ].map((point, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#0FBB0F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} width={11} height={11}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>{point}</span>
            </div>
          ))}

          <img
            src="/images/illustration.webp"
            alt="Muslim professionals"
            style={{ width: '100%', marginTop: '28px', borderRadius: '12px', opacity: 0.85 }}
          />
        </div>

        {/* Copyright */}
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
          © 2026 Ummah Media Group LLC
        </div>

        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '-60px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: 'rgba(15,187,15,0.07)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 40px',
        background: 'white',
        overflowY: 'auto',
      }}>
        {/* Mobile logo */}
        <div className="lg:hidden" style={{ marginBottom: '32px' }}>
          <a href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: '#6B7280',
            textDecoration: 'none',
            marginBottom: '16px',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Home
          </a>
          <a href="/">
            <img src="/images/logo.png" alt="UmmahJobs" style={{ height: '32px', display: 'block' }} />
          </a>
        </div>

        {/* Form container */}
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <a href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: '#6B7280',
            textDecoration: 'none',
            marginBottom: '24px',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Home
          </a>
          {children}
        </div>
      </div>

    </div>
  )
}
