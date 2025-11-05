'use client';

import React from 'react';

interface ReportSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function ReportSection({ children, className = '', ...props }: ReportSectionProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-gray-200 dark:border-slate-700 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface ReportSectionHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function ReportSectionHeader({ title, description, icon, action }: ReportSectionHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-700 dark:text-slate-300">{icon}</div>}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      {description && (
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{description}</p>
      )}
    </div>
  );
}

interface ReportGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 4 | 6 | 8;
  className?: string;
}

export function ReportGrid({ children, columns = 4, gap = 6, className = '', ...props }: ReportGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`} {...props}>
      {children}
    </div>
  );
}

interface ReportContainerProps {
  children: React.ReactNode;
}

export function ReportContainer({ children }: ReportContainerProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {children}
      </div>
    </div>
  );
}

interface ReportCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function ReportCard({ children, className = '', padding = 'md' }: ReportCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-gray-200 dark:border-slate-700 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
