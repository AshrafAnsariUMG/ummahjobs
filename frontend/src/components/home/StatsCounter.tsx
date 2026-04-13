'use client'

import { useEffect, useRef, useState } from 'react'

interface Stat {
  label: string
  value: number
  suffix?: string
}

function CountUp({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      }
    }
    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return <>{count.toLocaleString()}</>
}

export default function StatsCounter({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl p-6 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <p className="text-3xl font-bold mb-1 text-white">
            {visible ? <CountUp target={stat.value} /> : '0'}
            {stat.suffix}
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
