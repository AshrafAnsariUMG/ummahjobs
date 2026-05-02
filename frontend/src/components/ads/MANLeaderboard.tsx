'use client'

import { useEffect, useState } from 'react'
import MANAd from './MANAdBanner'

export default function MANLeaderboard() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '8px 0',
      background: '#f9fafb',
      borderBottom: '1px solid #f3f4f6',
    }}>
      {isMobile
        ? <MANAd size="mobile-banner" />
        : <MANAd size="leaderboard" />
      }
    </div>
  )
}
