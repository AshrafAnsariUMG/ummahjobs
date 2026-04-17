interface Props {
  color?: string
  opacity?: number
  size?: number
}

// 8-pointed star tile
const STAR = 'M 15 5 L 16.5 11.3 L 22.1 7.9 L 18.7 13.5 L 25 15 L 18.7 16.5 L 22.1 22.1 L 16.5 18.7 L 15 25 L 13.5 18.7 L 7.9 22.1 L 11.3 16.5 L 5 15 L 11.3 13.5 L 7.9 7.9 L 13.5 11.3 Z'

export default function IslamicPattern({ color = '#033BB0', opacity = 0.04, size = 30 }: Props) {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="islamic-star" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <path d={STAR} fill={color} opacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-star)" />
    </svg>
  )
}
