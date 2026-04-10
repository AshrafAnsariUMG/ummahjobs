export default function BlogPostLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-48 mb-6" />
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 min-w-0">
          <div className="w-full h-72 sm:h-96 bg-gray-200 rounded-2xl mb-7" />
          <div className="flex gap-3 mb-4">
            <div className="h-5 bg-gray-200 rounded-full w-20" />
            <div className="h-5 bg-gray-200 rounded w-28" />
          </div>
          <div className="h-9 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-9 bg-gray-200 rounded w-1/2 mb-6" />
          <div className="space-y-2">
            {[100, 95, 88, 92, 80, 96, 70, 85].map((w, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 h-32 animate-pulse" />
          <div className="bg-white rounded-xl border border-gray-200 p-5 h-48 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
