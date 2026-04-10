export default function JobDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1 min-w-0 space-y-6 animate-pulse">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="h-3 bg-gray-200 rounded w-48 mb-5" />
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              {[80, 100, 70, 90].map((w, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded-full" style={{ width: w }} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
            <div className="space-y-2">
              {[100, 80, 90, 70, 85, 60].map((w, i) => (
                <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </main>
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-32" />
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="space-y-3 pt-5 border-t border-gray-100">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
