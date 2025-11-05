'use client';

import { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UrgentAlertProps {
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  onDismiss?: () => void;
}

export function UrgentAlert({
  title,
  message,
  actionUrl,
  actionLabel,
  onDismiss
}: UrgentAlertProps) {
  const router = useRouter();

  useEffect(() => {
    const id = toast.custom(
      (t) => (
        <div className="w-full bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-600 animate-pulse" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-red-900 dark:text-red-100">
                  🚨 {title}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => {
                    toast.dismiss(t);
                    onDismiss?.();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                {message}
              </p>
              
              {actionUrl && (
                <Button
                  size="sm"
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    toast.dismiss(t);
                    router.push(actionUrl);
                    onDismiss?.();
                  }}
                >
                  {actionLabel || 'Ver ahora'}
                </Button>
              )}
            </div>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: 'top-center'
      }
    );

    return () => {
      toast.dismiss(id);
    };
  }, [title, message, actionUrl, actionLabel, router, onDismiss]);

  return null;
}

export function showUrgentNotification(
  title: string,
  message: string,
  actionUrl?: string,
  actionLabel?: string
) {
  const notificationSound = new Audio('/notification-urgent.mp3');
  
  notificationSound.play().catch(() => {
    console.log('Audio playback not available');
  });

  toast.custom(
    (t) => (
      <div className="w-full bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-lg shadow-lg p-4 animate-in slide-in-from-top">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600 animate-pulse" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-bold text-red-900 dark:text-red-100">
                🚨 {title}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => toast.dismiss(t)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              {message}
            </p>
            
            {actionUrl && (
              <a href={actionUrl}>
                <Button
                  size="sm"
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => toast.dismiss(t)}
                >
                  {actionLabel || 'Ver ahora'}
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    ),
    {
      duration: 10000,
      position: 'top-center'
    }
  );
}

export default UrgentAlert;
