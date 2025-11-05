export default function ReportSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-full bg-gray-100 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
