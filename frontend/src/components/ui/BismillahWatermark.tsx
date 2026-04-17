interface Props {
  color?: string
}

export default function BismillahWatermark({ color = '#033BB0' }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        right: '24px',
        transform: 'translateY(-50%)',
        fontSize: '48px',
        fontFamily: 'serif',
        direction: 'rtl',
        color,
        opacity: 0.06,
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
    </div>
  )
}
