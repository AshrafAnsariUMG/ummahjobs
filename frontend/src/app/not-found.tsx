export default function NotFound() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 24px',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Decorative crescent */}
      <div style={{ marginBottom: '16px', opacity: 0.12, color: '#033BB0' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} width={120} height={120} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>

      {/* 404 number */}
      <h1 style={{
        fontSize: '96px',
        fontWeight: '800',
        color: '#033BB0',
        margin: '0 0 8px',
        lineHeight: 1,
      }}>
        404
      </h1>

      {/* Arabic ayah */}
      <p style={{
        fontSize: '18px',
        color: '#6B7280',
        fontFamily: 'serif',
        margin: '0 0 8px',
        direction: 'rtl',
      }}>
        إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
      </p>

      {/* Translation */}
      <p style={{
        fontSize: '13px',
        color: '#9CA3AF',
        margin: '0 0 28px',
        fontStyle: 'italic',
      }}>
        &ldquo;Indeed, to Allah we belong and to Him we shall return.&rdquo;
      </p>

      {/* Heading */}
      <h2 style={{
        fontSize: '22px',
        fontWeight: '700',
        color: '#111827',
        margin: '0 0 12px',
      }}>
        This page seems to have gone on a journey
      </h2>

      <p style={{
        fontSize: '15px',
        color: '#6B7280',
        maxWidth: '400px',
        textAlign: 'center',
        lineHeight: '1.7',
        margin: '0 0 32px',
      }}>
        Like a traveler seeking the right path, sometimes we take a wrong turn.
        Let&apos;s get you back on track.
      </p>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/" style={{
          padding: '12px 24px',
          background: '#033BB0',
          color: 'white',
          borderRadius: '8px',
          fontWeight: '600',
          textDecoration: 'none',
          fontSize: '15px',
        }}>
          Back to Home
        </a>
        <a href="/jobs" style={{
          padding: '12px 24px',
          background: 'white',
          color: '#033BB0',
          border: '2px solid #033BB0',
          borderRadius: '8px',
          fontWeight: '600',
          textDecoration: 'none',
          fontSize: '15px',
        }}>
          Browse Jobs
        </a>
      </div>
    </div>
  )
}
