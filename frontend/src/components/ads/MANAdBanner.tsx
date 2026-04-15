'use client'

import { useEffect } from 'react'

const adConfig = {
  'leaderboard':   { key: 'db61a89ffa214858c2e9102633e15f2d', width: 728, height: 90 },
  'mobile-banner': { key: '5da772e096950ac945b62dcd00c35f1e', width: 320, height: 50 },
  'sidebar-wide':  { key: '3aaec945943b89c3bb72d07c12eb7221', width: 160, height: 600 },
  'rectangle':     { key: 'ebd2f090d0060710b08c920e1b1687d0', width: 300, height: 250 },
}

interface MANAdProps {
  size: 'leaderboard' | 'mobile-banner' | 'sidebar-wide' | 'rectangle'
  className?: string
}

// Module-level debounce shared across all MANAd instances.
// When multiple ad units mount in the same render cycle they all call
// scheduleAdScript(), each resetting the timer, so exactly ONE script
// tag is appended after all units have settled in the DOM.
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function scheduleAdScript() {
  if (debounceTimer !== null) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    const script = document.createElement('script')
    script.src = 'https://cdn77.aj2742.top/dcfc6ab7.js'
    script.async = true
    document.body.appendChild(script)
  }, 100)
}

export default function MANAd({ size, className }: MANAdProps) {
  const config = adConfig[size]

  useEffect(() => {
    scheduleAdScript()
  }, [])

  return (
    <div
      className={className}
      style={{ display: 'flex', justifyContent: 'center', minHeight: config.height }}
      dangerouslySetInnerHTML={{
        __html: `<ins class="bbbac5e5" data-key="${config.key}"></ins>`,
      }}
    />
  )
}
