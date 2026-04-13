interface MANAdBannerProps {
  size?: 'banner' | 'sidebar' | 'inline'
}

export default function MANAdBanner({ size = 'banner' }: MANAdBannerProps) {
  const heightClass =
    size === 'banner' ? 'h-[70px] md:h-[100px]' :
    size === 'sidebar' ? 'h-[260px]' :
    'h-[90px]'

  return (
    <div
      className={`w-full ${heightClass} flex flex-col items-center justify-center rounded-xl gap-1`}
      style={{ backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB' }}
    >
      <p className="font-medium text-gray-500" style={{ fontSize: 13 }}>
        Muslim Ad Network — Reaching 2M+ Muslim Consumers
      </p>
      <p style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Advertisement
      </p>
    </div>
  )
}
