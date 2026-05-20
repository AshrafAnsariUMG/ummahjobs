type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Record<Size, { box: string; icon: number }> = {
  xs: { box: 'w-8 h-8',   icon: 16 },
  sm: { box: 'w-10 h-10', icon: 20 },
  md: { box: 'w-14 h-14', icon: 28 },
  lg: { box: 'w-16 h-16', icon: 32 },
  xl: { box: 'w-20 h-20', icon: 40 },
}

/**
 * Briefcase silhouette shown in place of an employer logo when none is uploaded.
 * Used for job cards, job detail, employer profile, candidate dashboard tiles, etc.
 */
export default function CompanyLogoFallback({
  size = 'md',
  rounded = 'lg',
}: {
  size?: Size
  rounded?: 'lg' | 'xl' | 'full'
}) {
  const { box, icon } = SIZES[size]
  const radius = rounded === 'full' ? 'rounded-full' : rounded === 'xl' ? 'rounded-xl' : 'rounded-lg'

  return (
    <div
      className={`${box} ${radius} flex items-center justify-center shrink-0`}
      style={{ backgroundColor: '#EEF2FF', color: '#6366F1' }}
      aria-label="Company logo placeholder"
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </svg>
    </div>
  )
}
