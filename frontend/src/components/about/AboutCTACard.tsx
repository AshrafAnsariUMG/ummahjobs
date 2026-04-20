'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function AboutCTACard() {
  const { user } = useAuth()

  return (
    <div style={{
      flexShrink: 0,
      width: '100%',
      maxWidth: '360px',
      background: 'linear-gradient(135deg, #033BB0, #0256CC)',
      borderRadius: '16px',
      padding: '32px',
      color: 'white',
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '8px',
        lineHeight: 1.3,
      }}>
        Ready to find your<br />halal career?
      </h3>

      <p style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 1.6,
        marginBottom: '24px',
      }}>
        Join thousands of Muslim professionals on UmmahJobs today.
        {!user && " It's free to register."}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Link
          href="/jobs"
          className="block text-center text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
          style={{
            padding: '12px 24px',
            background: 'white',
            color: '#033BB0',
            textDecoration: 'none',
          }}
        >
          Browse Jobs
        </Link>
        {!user && (
          <Link
            href="/register"
            className="block text-center text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
            style={{
              padding: '12px 24px',
              background: '#0FBB0F',
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Register Free
          </Link>
        )}
      </div>
    </div>
  )
}
