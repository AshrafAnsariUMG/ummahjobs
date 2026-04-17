import Link from 'next/link'
import { CrescentIcon } from '@/components/ui/IslamicIcons'

interface Props {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
  size?: 'sm' | 'lg'
  className?: string
}

export default function SectionHeading({ title, subtitle, action, size = 'sm', className = '' }: Props) {
  const isLg = size === 'lg'
  return (
    <div className={`flex ${subtitle ? 'items-end' : 'items-center'} justify-between ${isLg ? 'mb-6' : 'mb-4'} ${className}`}>
      <div>
        <div className={`flex items-center gap-2 ${subtitle ? 'mb-1' : ''}`}>
          <span style={{ color: '#0FBB0F' }}>
            <CrescentIcon size={isLg ? 20 : 13} />
          </span>
          {isLg ? (
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          ) : (
            <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
          )}
        </div>
        {subtitle && (
          <p className={isLg ? 'text-sm text-gray-500' : 'text-xs text-gray-500'}>{subtitle}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={`${isLg ? 'text-sm' : 'text-xs'} font-medium hover:underline whitespace-nowrap`}
          style={{ color: '#033BB0' }}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
