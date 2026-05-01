'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const SCRIPT_SRC = 'https://cdn77.aj2742.top/dcfc6ab7.js'
type EpomWindow = Window & { EpomAdServer?: Record<string, unknown> }

export default function EpomRouteWatcher() {
  const pathname = usePathname()
  const isFirst = useRef(true)

  useEffect(() => {
    // Skip initial load — the global script in <head> handles first render
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    // Wait for the new page's <ins> elements to appear in the DOM, then
    // do a full EPOM script reload so it scans them fresh
    const t = setTimeout(() => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
      if (existing) existing.remove()
      delete (window as EpomWindow).EpomAdServer

      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      document.head.appendChild(script)
    }, 300)

    return () => clearTimeout(t)
  }, [pathname])

  return null
}
