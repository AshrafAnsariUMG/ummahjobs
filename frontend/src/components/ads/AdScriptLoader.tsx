'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function AdScriptLoader() {
  const pathname = usePathname()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn77.aj2742.top/dcfc6ab7.js'
    script.async = true
    document.body.appendChild(script)
  }, [pathname])

  return null
}
