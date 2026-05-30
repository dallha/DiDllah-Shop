import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import Header from '@/components/Header';
import TrustBar from '@/components/TrustBar';
import CartDrawer from '@/components/CartDrawer';
import StoreHydrator from '@/components/StoreHydrator';
import SupabaseSync from '@/components/SupabaseSync';
import ThemeProvider from '@/components/ThemeProvider';
import FooterClient from '@/components/FooterClient';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { ViewTransitions } from 'next-view-transitions';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import MarketingAnalytics from '@/components/MarketingAnalytics';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://didallah.sn'),
  title: {
    default: 'DiDallah Shop — Beauté & élégance de Dakar',
    template: '%s · DiDallah Shop',
  },
  description:
    'Plateforme e-commerce premium pour la beauté et la mode sénégalaise : parfumerie, huiles précieuses, bazin et wax authentique. Livraison Dakar, régions et diaspora.',
  applicationName: 'DiDallah Shop',
  authors: [{ name: 'DiDallah' }],
  keywords: [
    'DiDallah',
    'boutique Dakar',
    'parfum',
    'bazin',
    'wax',
    'beauté sénégalaise',
    'mode africaine',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    title: 'DiDallah Shop — Beauté & élégance de Dakar',
    description:
      'Beauté, mode et tissus d’exception — une sélection rare livrée à votre porte depuis Dakar.',
    siteName: 'DiDallah Shop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DiDallah Shop — Beauté & élégance de Dakar',
    description: 'Beauté, mode et tissus d’exception, depuis Dakar.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d2b3f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="fr">
        <head>
          <Script src="https://paytech.sn/cdn/paytech.min.js" strategy="lazyOnload" />
        </head>
        <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <MarketingAnalytics />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Aller au contenu principal
        </a>
        <StoreHydrator />
        <SupabaseSync />
        <ThemeProvider />
        <div className="relative min-h-screen flex flex-col justify-between">
          <div className="flex-1">
            <Header />
            <TrustBar />
            <div id="main-content">{children}</div>
          </div>
          <FooterClient />
          <CartDrawer />
          <WhatsAppFloat />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
    </ViewTransitions>
  );
}
