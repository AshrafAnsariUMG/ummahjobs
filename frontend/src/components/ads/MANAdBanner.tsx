'use client'

import { useEffect } from 'react'

const adConfig = {
  'leaderboard':   { key: 'db61a89ffa214858c2e9102633e15f2d', width: 728, height: 90  },
  'mobile-banner': { key: '5da772e096950ac945b62dcd00c35f1e', width: 320, height: 50  },
  'sidebar-wide':  { key: '3aaec945943b89c3bb72d07c12eb7221', width: 160, height: 600 },
  'rectangle':     { key: 'ebd2f090d0060710b08c920e1b1687d0', width: 300, height: 250 },
}

interface MANAdProps {
  size: 'leaderboard' | 'mobile-banner' | 'sidebar-wide' | 'rectangle'
  className?: string
}

export default function MANAd({ size, className }: MANAdProps) {
  const config = adConfig[size]

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn77.aj2742.top/dcfc6ab7.js'
    script.async = true
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div className={className} style={{ textAlign: 'center' }}>
      <ins
        className="bbbac5e5"
        data-key={config.key}
        style={{ display: 'inline-block', width: config.width, height: config.height }}
      />
      <div style={{ marginTop: '4px' }}>
        <a
          href="https://muslimadnetwork.com?utm_source=UmmahJobs"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '10px', color: '#9CA3AF', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}
        >
          Ads by Muslim Ad Network
        </a>
      </div>
    </div>
  )
}
