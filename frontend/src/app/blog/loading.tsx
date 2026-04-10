export default function BlogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-32 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64" />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {/* Category tabs skeleton */}
          <div className="flex gap-2 animate-pulse">
            {[80, 90, 70, 100, 85, 60, 65].map((w, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-full" style={{ width: w }} />
            ))}
          </div>
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-5 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded-full w-16" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-full" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full mt-1" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-20 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 h-20 animate-pulse" />
          <div className="bg-white rounded-xl border border-gray-200 p-5 h-40 animate-pulse" />
          <div className="bg-white rounded-xl border border-gray-200 p-5 h-48 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
