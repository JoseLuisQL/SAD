/**
 * Web Vitals tracking for performance monitoring
 * Tracks Core Web Vitals: LCP, FID/INP, CLS, TTFB, FCP
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalsPayload {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
  href: string;
  userAgent: string;
  timestamp: number;
}

// Send Web Vitals to analytics endpoint
function sendToAnalytics(metric: any) {
  const payload: WebVitalsPayload = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType || 'navigate',
    href: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };

  // Use sendBeacon if available, fallback to fetch
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics/web-vitals', blob);
  } else {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((error) => {
      console.error('[Web Vitals] Error sending metrics:', error);
    });
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }
}

// Initialize Web Vitals tracking
export function initWebVitals() {
  try {
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics); // INP replaces FID in web-vitals v3+
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    
    console.log('[Web Vitals] Tracking initialized');
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize:', error);
  }
}

// Export individual metric trackers for component-level tracking
export { onCLS, onINP, onFCP, onLCP, onTTFB };
