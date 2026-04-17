'use client'

import { getDailyQuote } from '@/lib/islamicQuotes'

export default function DailyQuoteWidget() {
  const quote = getDailyQuote()

  return (
    <div style={{
      background: 'linear-gradient(135deg, #033BB0 0%, #0256CC 100%)',
      borderRadius: '12px',
      padding: '28px 32px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '24px',
    }}>
      {/* Decorative crescent watermark */}
      <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.08 }}>
        <svg viewBox="0 0 120 120" width={120} height={120} fill="white">
          <path d="M60 10A50 50 0 1 0 110 60 40 40 0 1 1 60 10z" />
        </svg>
      </div>

      {/* Type badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '20px',
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '16px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {quote.type === 'ayah' ? 'Quranic Ayah' : 'Hadith'}
      </div>

      {/* Arabic text */}
      <p style={{
        fontSize: '20px',
        fontFamily: 'serif',
        direction: 'rtl',
        textAlign: 'right',
        margin: '0 0 16px',
        lineHeight: '1.8',
        color: 'rgba(255,255,255,0.95)',
      }}>
        {quote.arabic}
      </p>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', margin: '16px 0' }} />

      {/* Translation */}
      <p style={{
        fontSize: '15px',
        lineHeight: '1.7',
        margin: '0 0 12px',
        color: 'rgba(255,255,255,0.9)',
        fontStyle: 'italic',
      }}>
        &ldquo;{quote.translation}&rdquo;
      </p>

      {/* Source */}
      <p style={{
        fontSize: '13px',
        color: 'rgba(255,255,255,0.65)',
        margin: '0',
        fontWeight: '500',
      }}>
        — {quote.source}
      </p>
    </div>
  )
}
