export default function JobCardSkeleton({ variant = 'list' }: { variant?: 'list' | 'carousel' }) {
  if (variant === 'carousel') {
    return (
      <div className="flex-shrink-0 w-72 bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3.5 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="h-5 bg-gray-200 rounded-full w-16 shrink-0" />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="h-5 bg-gray-200 rounded-full w-20" />
            <div className="h-5 bg-gray-200 rounded-full w-24" />
            <div className="h-5 bg-gray-200 rounded-full w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}
