import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Fetch configuration from backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const configResponse = await fetch(`${backendUrl}/api/configuration`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!configResponse.ok) {
      // Return default favicon from public folder
      const defaultResponse = await fetch(`${request.nextUrl.origin}/favicon.ico`);
      const buffer = await defaultResponse.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const data = await configResponse.json();
    const faviconUrl = data?.data?.faviconUrl;

    if (!faviconUrl) {
      // Return default favicon
      const defaultResponse = await fetch(`${request.nextUrl.origin}/favicon.ico`);
      const buffer = await defaultResponse.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Fetch the actual favicon image from backend
    const faviconResponse = await fetch(faviconUrl, {
      cache: 'no-store',
    });

    if (!faviconResponse.ok) {
      const defaultResponse = await fetch(`${request.nextUrl.origin}/favicon.ico`);
      const buffer = await defaultResponse.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const faviconBuffer = await faviconResponse.arrayBuffer();
    const contentType = faviconResponse.headers.get('content-type') || 'image/x-icon';

    // Return the dynamic favicon with short cache
    return new NextResponse(faviconBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=60, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching dynamic favicon:', error);
    
    // Fallback to default favicon
    try {
      const defaultResponse = await fetch(`${request.nextUrl.origin}/favicon.ico`);
      const buffer = await defaultResponse.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch {
      return new NextResponse(null, { status: 404 });
    }
  }
}
