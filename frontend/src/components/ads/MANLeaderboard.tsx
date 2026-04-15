'use client'

import MANAd from './MANAdBanner'

export default function MANLeaderboard() {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '8px 0',
      background: '#f9fafb',
      borderBottom: '1px solid #f3f4f6',
    }}>
      {/* Desktop: 728x90 */}
      <div className="hidden sm:block">
        <MANAd size="leaderboard" />
      </div>
      {/* Mobile: 320x50 */}
      <div className="block sm:hidden">
        <MANAd size="mobile-banner" />
      </div>
    </div>
  )
}
