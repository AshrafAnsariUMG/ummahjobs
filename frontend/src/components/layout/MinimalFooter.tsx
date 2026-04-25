export default function MinimalFooter() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      borderTop: '1px solid #E5E7EB',
      padding: '16px 24px',
      textAlign: 'center',
      marginTop: 'auto',
    }}>
      <p style={{
        fontSize: '12px',
        color: '#9CA3AF',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '4px 12px',
      }}>
        <span>© {year} Ummah Media Group LLC</span>
        <span style={{ color: '#D1D5DB' }}>·</span>
        <a href="/privacy" style={{ color: '#6B7280', textDecoration: 'none' }}>Privacy</a>
        <span style={{ color: '#D1D5DB' }}>·</span>
        <a href="/terms" style={{ color: '#6B7280', textDecoration: 'none' }}>Terms</a>
        <span style={{ color: '#D1D5DB' }}>·</span>
        <a href="/contact" style={{ color: '#6B7280', textDecoration: 'none' }}>Contact</a>
        <span style={{ color: '#D1D5DB' }}>·</span>
        <a
          href="https://ummahmediagroup.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#6B7280', textDecoration: 'none' }}
        >
          Ummah Media Group
        </a>
      </p>
    </footer>
  )
}
