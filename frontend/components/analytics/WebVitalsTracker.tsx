'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Web Vitals Tracker Component
 * Initializes performance tracking on mount and route changes
 */
export function WebVitalsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Dynamically import web-vitals to avoid SSR issues
    import('@/lib/web-vitals')
      .then(({ initWebVitals }) => {
        initWebVitals();
      })
      .catch((error) => {
        console.error('[WebVitalsTracker] Failed to load web-vitals:', error);
      });
  }, [pathname]); // Re-initialize on route change

  return null; // This component doesn't render anything
}
