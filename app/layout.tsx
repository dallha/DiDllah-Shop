import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import StoreHydrator from '@/components/StoreHydrator';
import SupabaseSync from '@/components/SupabaseSync';

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
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Aller au contenu principal
        </a>
        <StoreHydrator />
        <SupabaseSync />
        <div className="relative min-h-screen flex flex-col justify-between">
          <div className="flex-1">
            <Header />
            <div id="main-content">{children}</div>
          </div>
          <footer className="w-full bg-slate-100/50 border-t border-slate-200/60 py-6 text-center text-xs text-slate-500">
            <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} DiDallah Shop. Tous droits réservés.</p>
              <div className="flex items-center gap-6">
                <Link href="/catalogue" className="hover:text-slate-900 transition font-medium">Boutique</Link>
                <Link href="/contact" className="hover:text-slate-900 transition font-medium">Contact</Link>
                <Link href="/admin" className="hover:text-slate-900 transition font-medium opacity-25 hover:opacity-100">Administration</Link>
              </div>
            </div>
          </footer>
          <CartDrawer />
        </div>
      </body>
    </html>
  );
}
