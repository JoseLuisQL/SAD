import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // Optimización para producción
  poweredByHeader: false,
  compress: true,
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Desarrollo local
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/api/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/api/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.18.21',
        port: '5001',
        pathname: '/api/**',
      },
      // Producción
      {
        protocol: 'http',
        hostname: 'archivos.risvirgendecocharcas.gob.pe',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'archivos.risvirgendecocharcas.gob.pe',
        pathname: '/api/**',
      },
      // Permitir imágenes externas HTTPS
      {
        protocol: 'https',
        hostname: '**',
      },
      // HTTP solo en desarrollo
      ...(process.env.NODE_ENV === 'development' ? [{
        protocol: 'http' as const,
        hostname: '**',
      }] : []),
    ],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  webpack: (config) => {
    // react-pdf compatibility
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
