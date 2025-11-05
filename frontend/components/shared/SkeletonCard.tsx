'use client';

import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  variant?: 'default' | 'metric' | 'chart' | 'list';
}

export function SkeletonCard({ className, variant = 'default' }: SkeletonCardProps) {
  if (variant === 'metric') {
    return (
      <div className={cn('bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-pulse', className)}>
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={cn('bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-pulse', className)}>
        <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="flex justify-center gap-4">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-pulse', className)}>
        <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-pulse', className)}>
      <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}
