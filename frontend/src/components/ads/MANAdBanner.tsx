'use client'

import { useEffect, useRef } from 'react'

const adConfig = {
  'leaderboard': {
    key: 'db61a89ffa214858c2e9102633e15f2d',
    width: 728, height: 90,
  },
  'mobile-banner': {
    key: '5da772e096950ac945b62dcd00c35f1e',
    width: 320, height: 50,
  },
  'sidebar-wide': {
    key: '3aaec945943b89c3bb72d07c12eb7221',
    width: 160, height: 600,
  },
  'rectangle': {
    key: 'ebd2f090d0060710b08c920e1b1687d0',
    width: 300, height: 250,
  },
}

interface MANAdProps {
  size: 'leaderboard' | 'mobile-banner' | 'sidebar-wide' | 'rectangle'
  className?: string
}

export default function MANAd({ size, className }: MANAdProps) {
  const config = adConfig[size]
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear container and insert fresh ins tag
    containerRef.current.innerHTML =
      `<ins class="bbbac5e5" data-key="${config.key}"></ins>`

    // If the ad script is already loaded, trigger it manually on the new ins tag
    if (typeof window !== 'undefined') {
      const script = document.querySelector('script[src*="dcfc6ab7"]')
      if (script) {
        // Re-evaluate the script for new ins tags
        const newScript = document.createElement('script')
        newScript.src = 'https://cdn77.aj2742.top/dcfc6ab7.js'
        newScript.async = true
        document.body.appendChild(newScript)
      }
    }
  }, [config.key])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: config.height,
        overflow: 'hidden',
      }}
    />
  )
}
