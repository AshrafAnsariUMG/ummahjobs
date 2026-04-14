'use client'

import { useState } from 'react'
import { getBlogImageUrl } from '@/lib/blogUtils'

interface Props {
  path: string | null | undefined
  alt: string
  className?: string
}

export default function BlogFeaturedImage({ path, alt, className }: Props) {
  const [failed, setFailed] = useState(false)

  const url = getBlogImageUrl(path)

  if (!url || failed) {
    return (
      <div
        className={className}
        style={{
          background: 'linear-gradient(135deg, #E6EDFF 0%, #c7d7ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg className="w-16 h-16 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}
