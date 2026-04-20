'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'

interface Props {
  children: React.ReactNode
  animation?: 'fade-up' | 'fade-left' | 'fade-right'
  delay?: number
  className?: string
}

export default function AnimatedSection({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
}: Props) {
  const ref = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`${animation} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
