'use client'

import Link from 'next/link'
import type { JobCategory } from '@/types'
import CategoryIcon from '@/components/ui/CategoryIcon'

interface Props {
  categories: JobCategory[]
}

export default function CategoryGrid({ categories }: Props) {
  return (
    <>
      {categories.map((cat, idx) => {
        const isGreen = idx % 2 === 1
        const iconColor = isGreen ? '#0FBB0F' : '#033BB0'
        return (
          <Link
            key={cat.id}
            href={`/jobs?category=${cat.slug}`}
            className="flex flex-col items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center group"
            style={{ transition: 'background-color 0.15s, border-color 0.15s, transform 0.15s' }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.backgroundColor = isGreen ? '#E6F9E6' : '#E6EDFF'
              el.style.borderColor = iconColor
              el.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.backgroundColor = ''
              el.style.borderColor = ''
              el.style.transform = ''
            }}
          >
            <CategoryIcon
              slug={cat.slug}
              size={24}
              color={iconColor}
              className="opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-xs font-medium text-gray-700 leading-snug">
              {cat.name}
            </span>
          </Link>
        )
      })}
    </>
  )
}
