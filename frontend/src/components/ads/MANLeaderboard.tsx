'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import MANAd from './MANAd'

export default function MANLeaderboard() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Render nothing until client-side detection is complete
  if (isMobile === null) return null

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
        ? <MANAd key={`mob-${pathname}`} size="mobile-banner" />
        : <MANAd key={`desk-${pathname}`} size="leaderboard" />
      }
    </div>
  )
}
