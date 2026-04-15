'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface MANAdProps {
  size: 'leaderboard' | 'mobile-banner' | 'sidebar-wide' | 'rectangle'
  className?: string
}

const adConfig = {
  'leaderboard':    { key: 'db61a89ffa214858c2e9102633e15f2d', width: 728, height: 90 },
  'mobile-banner':  { key: '5da772e096950ac945b62dcd00c35f1e', width: 320, height: 50 },
  'sidebar-wide':   { key: '3aaec945943b89c3bb72d07c12eb7221', width: 160, height: 600 },
  'rectangle':      { key: 'ebd2f090d0060710b08c920e1b1687d0', width: 300, height: 250 },
}

export default function MANAd({ size, className }: MANAdProps) {
  const config = adConfig[size]
  const pathname = usePathname()
  const [adKey, setAdKey] = useState(0)

  useEffect(() => {
    setAdKey((prev) => prev + 1)
  }, [pathname])

  return (
    <div
      key={adKey}
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: config.height,
        overflow: 'hidden',
      }}
      dangerouslySetInnerHTML={{
        __html: `<ins class="bbbac5e5" data-key="${config.key}"></ins>`,
      }}
    />
  )
}
