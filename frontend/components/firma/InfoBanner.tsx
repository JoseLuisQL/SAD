import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface InfoBannerProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
}) => {
  const variantStyles = {
    info: {
      bg: 'bg-blue-50/50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      titleColor: 'text-blue-900 dark:text-blue-300',
      textColor: 'text-blue-700 dark:text-blue-300',
    },
    success: {
      bg: 'bg-green-50/50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
      titleColor: 'text-green-900 dark:text-green-300',
      textColor: 'text-green-700 dark:text-green-300',
    },
    warning: {
      bg: 'bg-amber-50/50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      titleColor: 'text-amber-900 dark:text-amber-300',
      textColor: 'text-amber-700 dark:text-amber-300',
    },
    error: {
      bg: 'bg-red-50/50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
      titleColor: 'text-red-900 dark:text-red-300',
      textColor: 'text-red-700 dark:text-red-300',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.bg} border ${styles.border} rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold text-sm ${styles.titleColor} mb-1`}>
              {title}
            </h4>
          )}
          <div className={`text-sm ${styles.textColor}`}>{children}</div>
        </div>
      </div>
    </div>
  );
};
