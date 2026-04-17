import React from 'react'
import Link from 'next/link'

interface Props {
  icon: React.ReactNode
  title: string
  message: string
  actionLabel?: string
  actionHref?: string
}

export default function IslamicEmptyState({ icon, title, message, actionLabel, actionHref }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6B7280' }}>
      <div style={{
        width: '64px',
        height: '64px',
        background: '#EFF6FF',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        color: '#033BB0',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 8px' }}>
        {title}
      </h3>
      <p style={{
        fontSize: '14px',
        color: '#6B7280',
        margin: '0 0 20px',
        maxWidth: '320px',
        marginLeft: 'auto',
        marginRight: 'auto',
        lineHeight: '1.6',
      }}>
        {message}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref} style={{
          display: 'inline-block',
          padding: '10px 20px',
          background: '#033BB0',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          textDecoration: 'none',
        }}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
