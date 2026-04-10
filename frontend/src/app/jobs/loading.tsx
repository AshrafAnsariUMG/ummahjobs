import JobCardSkeleton from '@/components/ui/JobCardSkeleton'

export default function JobsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
      <div className="flex gap-8">
        <div className="hidden lg:block w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 h-96 animate-pulse" />
        </div>
        <div className="flex-1 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} variant="list" />
          ))}
        </div>
      </div>
    </div>
  )
}
