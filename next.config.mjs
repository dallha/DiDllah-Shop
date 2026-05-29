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

  // ── Images : domaines autorisés pour next/image (Sécurisé - Faille #10 résolue) ──
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'flnbuynwkbeoknmvcjgo.supabase.co', // Restriction exacte
      },
    ],
    // Formats modernes (WebP + AVIF) générés automatiquement par Next.js
    formats: ['image/avif', 'image/webp'],
    // Cache des images optimisées : 60 jours
    minimumCacheTTL: 60 * 60 * 24 * 60,
  },

  // ── Headers de sécurité et cache (Sécurisé - Faille #6 résolue) ───────────────
  async headers() {
    const cspHeader = [
      "default-src 'self';",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline';", // 'unsafe-eval' pour le mode dev / hot reload Next.js
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
      "font-src 'self' https://fonts.gstatic.com;",
      "img-src 'self' data: https://flnbuynwkbeoknmvcjgo.supabase.co https://images.unsplash.com;",
      "connect-src 'self' https://flnbuynwkbeoknmvcjgo.supabase.co wss://flnbuynwkbeoknmvcjgo.supabase.co;",
      "frame-ancestors 'none';",
      "object-src 'none';"
    ].join(' ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
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
