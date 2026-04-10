'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'

export default function BookmarkButton({ jobId }: { jobId: number }) {
  const [saved, setSaved] = useState(false)
  const { showToast } = useToast()

  function toggle() {
    setSaved((prev) => {
      const next = !prev
      showToast(next ? 'Job saved to bookmarks' : 'Bookmark removed', next ? 'success' : 'info')
      return next
    })
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'Remove bookmark' : 'Save job'}
      className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
      style={saved ? { backgroundColor: '#E6EDFF', borderColor: '#033BB0' } : undefined}
    >
      <svg
        className="w-5 h-5"
        fill={saved ? '#033BB0' : 'none'}
        viewBox="0 0 24 24"
        stroke={saved ? '#033BB0' : 'currentColor'}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  )
}
