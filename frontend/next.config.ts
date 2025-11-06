import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
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
        hostname: 'archivos.risvirgendecocharcas.gob.pe',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'archivos.risvirgendecocharcas.gob.pe',
        pathname: '/api/**',
      },
      // Permitir imágenes externas de cualquier dominio HTTPS
      {
        protocol: 'https',
        hostname: '**',
      },
      // Permitir imágenes externas de cualquier dominio HTTP (solo para desarrollo)
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Ignore canvas module for react-pdf compatibility
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
