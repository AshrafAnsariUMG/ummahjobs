'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const SCRIPT_SRC = 'https://cdn77.aj2742.top/dcfc6ab7.js'
type EpomWindow = Window & { EpomAdServer?: Record<string, unknown> }

function reloadEpom() {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
  if (existing) existing.remove()
  delete (window as EpomWindow).EpomAdServer

  const script = document.createElement('script')
  script.src = SCRIPT_SRC
  script.async = true
  document.head.appendChild(script)
}

export default function EpomRouteWatcher() {
  const pathname = usePathname()
  const isFirst = useRef(true)

  useEffect(() => {
    // Skip initial load — the global script in <head> handles first render
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    // Fire twice: once early for fast/static pages, once later for slow dynamic
    // pages (like /jobs) that make several API calls before streaming HTML.
    // The second fire is a no-op if EPOM already filled slots from the first.
    const t1 = setTimeout(reloadEpom, 400)
    const t2 = setTimeout(reloadEpom, 1200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [pathname])

  return null
}
