export default function ReportSkeleton() {
  return (
    <div 
      className="space-y-6" 
      role="status" 
      aria-label="Cargando reporte"
      aria-live="polite"
    >
      {/* Texto para lectores de pantalla */}
      <span className="sr-only">Cargando datos del reporte, por favor espere...</span>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-8 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div 
            key={i} 
            className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse"
          >
            <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
            <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse">
        <div className="h-5 w-36 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-1/4 bg-gray-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/4 bg-gray-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/4 bg-gray-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/4 bg-gray-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
