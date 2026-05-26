import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // ── Empêche Next.js de scanner les dossiers parents (supprime le warning lockfile) ─
  outputFileTracingRoot: __dirname,

  // ── Compression gzip/brotli des assets ──────────────────────────────────
  compress: true,

  // ── Optimisation des imports de gros packages (tree-shaking amélioré) ───
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', '@supabase/ssr', 'zustand'],
  },

  // ── Images : domaines autorisés pour next/image ──────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
    // Formats modernes (WebP + AVIF) générés automatiquement par Next.js
    formats: ['image/avif', 'image/webp'],
    // Cache des images optimisées : 60 jours
    minimumCacheTTL: 60 * 60 * 24 * 60,
  },

  // ── Headers de sécurité et cache ─────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Cache long sur les assets statiques Next.js
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
