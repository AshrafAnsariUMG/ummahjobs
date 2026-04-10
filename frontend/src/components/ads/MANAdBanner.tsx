interface MANAdBannerProps {
  size?: 'banner' | 'sidebar' | 'inline'
}

export default function MANAdBanner({ size = 'banner' }: MANAdBannerProps) {
  const heightClass =
    size === 'banner' ? 'h-[60px] md:h-[90px]' :
    size === 'sidebar' ? 'h-[250px]' :
    'h-[90px]'

  return (
    <div
      className={`w-full ${heightClass} flex items-center justify-center rounded-lg text-sm text-gray-400`}
      style={{ backgroundColor: '#f0f0f0', border: '1px dashed #ccc' }}
    >
      Ads by Muslim Ad Network
    </div>
  )
}
