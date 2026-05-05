'use client'

const adConfig = {
  'leaderboard':   { width: 728, height: 90,  file: '/ads/leaderboard.html'   },
  'mobile-banner': { width: 320, height: 50,  file: '/ads/mobile-banner.html' },
  'rectangle':     { width: 300, height: 250, file: '/ads/rectangle.html'     },
}

interface MANAdProps {
  size: keyof typeof adConfig
}

export default function MANAd({ size }: MANAdProps) {
  const { width, height, file } = adConfig[size]

  return (
    <div>
      <iframe
        src={file}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        title="Advertisement"
        style={{ border: 'none', display: 'block', margin: '0 auto', background: 'transparent' }}
      />
      <div style={{ textAlign: 'center', marginTop: '4px' }}>
        <a
          href="https://muslimadnetwork.com?utm_source=ummahjobs"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '10px', color: '#9CA3AF', textDecoration: 'none' }}
        >
          Ads by Muslim Ad Network
        </a>
      </div>
    </div>
  )
}
