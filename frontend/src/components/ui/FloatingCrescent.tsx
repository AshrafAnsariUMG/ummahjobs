import type { CSSProperties } from 'react'

interface FloatingCrescentProps {
  position?: 'top-right' | 'bottom-left' | 'top-left' | 'bottom-right'
  size?: number
  opacity?: number
}

export default function FloatingCrescent({
  position = 'top-right',
  size = 200,
  opacity = 0.08,
}: FloatingCrescentProps) {
  const posStyle: CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 0,
  }

  if (position === 'top-right') {
    posStyle.top = '-40px'
    posStyle.right = '-40px'
  } else if (position === 'bottom-left') {
    posStyle.bottom = '-40px'
    posStyle.left = '-40px'
  } else if (position === 'top-left') {
    posStyle.top = '-40px'
    posStyle.left = '-40px'
  } else {
    posStyle.bottom = '-40px'
    posStyle.right = '-40px'
  }

  return (
    <div style={posStyle}>
      <svg viewBox="0 0 200 200" width={size} height={size} fill="none">
        <path
          d="M100 10A90 90 0 1 0 190 100 70 70 0 1 1 100 10z"
          fill="#033BB0"
          opacity={opacity}
        />
      </svg>
    </div>
  )
}
