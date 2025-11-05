import { NextRequest, NextResponse } from 'next/server';

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

// In-memory storage for demo (in production, send to proper analytics service)
const metricsStore: WebVitalsPayload[] = [];
const MAX_STORED_METRICS = 1000;

export async function POST(request: NextRequest) {
  try {
    const payload: WebVitalsPayload = await request.json();

    // Validate payload
    if (!payload.name || typeof payload.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Store metric (keep only last MAX_STORED_METRICS)
    metricsStore.push(payload);
    if (metricsStore.length > MAX_STORED_METRICS) {
      metricsStore.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals API]', {
        metric: payload.name,
        value: payload.value.toFixed(2),
        rating: payload.rating,
        page: new URL(payload.href).pathname,
      });
    }

    // TODO: Send to proper analytics service (Google Analytics, Datadog, etc.)
    // Example:
    // await analyticsClient.track({
    //   event: 'web_vitals',
    //   properties: payload,
    // });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Web Vitals API] Error processing metric:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve metrics (for debugging/monitoring)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metricName = searchParams.get('metric');
    const page = searchParams.get('page');
    const limit = parseInt(searchParams.get('limit') || '100');

    let filteredMetrics = metricsStore;

    // Filter by metric name
    if (metricName) {
      filteredMetrics = filteredMetrics.filter((m) => m.name === metricName);
    }

    // Filter by page
    if (page) {
      filteredMetrics = filteredMetrics.filter((m) => {
        const metricPath = new URL(m.href).pathname;
        return metricPath === page;
      });
    }

    // Limit results
    const results = filteredMetrics.slice(-limit);

    // Calculate averages
    const averages = calculateAverages(results);

    return NextResponse.json({
      total: results.length,
      metrics: results,
      averages,
    });
  } catch (error) {
    console.error('[Web Vitals API] Error retrieving metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateAverages(metrics: WebVitalsPayload[]) {
  const grouped = metrics.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = [];
    }
    acc[metric.name].push(metric.value);
    return acc;
  }, {} as Record<string, number[]>);

  const averages: Record<string, { avg: number; p75: number; p95: number }> = {};

  Object.entries(grouped).forEach(([name, values]) => {
    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const p75 = sorted[Math.floor(values.length * 0.75)] || 0;
    const p95 = sorted[Math.floor(values.length * 0.95)] || 0;

    averages[name] = { avg, p75, p95 };
  });

  return averages;
}
