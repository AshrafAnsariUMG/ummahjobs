'use client'

import { useEffect, useState } from 'react'
import FilterSidebar from './FilterSidebar'
import type { JobCategory, JobType } from '@/types'

/**
 * MobileFilterDrawer — slide-up drawer wrapping FilterSidebar for mobile.
 *
 * Tafjeera flagged May 1 2026: filters were not visible on mobile because the
 * desktop sidebar lives in `<AnimatedSection className="hidden lg:block">`.
 * On screens < lg (1024px) there was no way to filter results.
 *
 * Fix: this component renders a "Filters" button on mobile that opens a
 * full-height slide-over panel containing the same FilterSidebar.
 */
export default function MobileFilterDrawer({
  categories,
  jobTypes,
}: {
  categories: JobCategory[]
  jobTypes: JobType[]
}) {
  const [open, setOpen] = useState(false)

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    const original = document.body.style.overflow
    document.body.style.overflow = open ? 'hidden' : original
    return () => { document.body.style.overflow = original }
  }, [open])

  // Close on ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300 active:scale-[0.98] transition-all"
        aria-label="Open filters"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm3 5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
        Filters
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          />

          {/* Drawer */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter jobs"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl transition-transform"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="px-4 pb-4 pt-3">
              <FilterSidebar categories={categories} jobTypes={jobTypes} />
            </div>
            <div className="sticky bottom-0 border-t border-gray-100 bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-800 active:scale-[0.99]"
                style={{ backgroundColor: '#033BB0' }}
              >
                See results
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
