'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useShopStore, whatsappToHref } from '@/lib/shop-store';
import { useHydrated } from '@/lib/use-hydrated';

const DEFAULT_NAV_LINKS = [
  { href: '/catalogue', label: 'Boutique' },
  { href: '/beaute', label: 'Beauté' },
  { href: '/mode', label: 'Mode' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const toggleCart = useCartStore((state) => state.toggleCart);
  const totalItems = useCartStore((state) => state.totalItems());
  const brand = useShopStore((state) => state.brand);
  const siteImages = useShopStore((state) => state.siteImages);
  const hydrated = useHydrated();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const logoDataUrl = hydrated ? siteImages.logoDataUrl : null;

  // Liens de navigation dynamiques : brand.navLinks si défini, sinon défaut
  const NAV_LINKS = hydrated && brand.navLinks && brand.navLinks.length > 0
    ? brand.navLinks
    : DEFAULT_NAV_LINKS;

  // Ferme le menu mobile à chaque changement de route
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3" aria-label={`${brand.name}, retour à l’accueil`}>
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-600 to-brand-700 shadow-lg">
            {logoDataUrl ? (
              <Image
                src={logoDataUrl}
                alt={`Logo ${brand.name}`}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <Image
                src="/logo.png"
                alt={`Logo ${brand.name}`}
                fill
                className="object-cover bg-white"
                unoptimized
              />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-slate-950">{brand.name}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Premium</p>
          </div>
        </Link>

        {/* Navigation principale (desktop) */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`group relative text-sm font-medium transition ${
                  active ? 'text-slate-950' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <span>{link.label}</span>
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-brand-600 transition-all ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {pathname?.startsWith('/admin') ? (
            <Link
              href="/admin/settings"
              className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 lg:inline-flex"
            >
              <span aria-hidden="true">⚙️</span>
              <span className="ml-2">Paramètres</span>
            </Link>
          ) : (
            <Link
              href={whatsappToHref(brand.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 lg:inline-flex"
            >
              <span aria-hidden="true">💬</span>
              <span className="ml-2">WhatsApp</span>
            </Link>
          )}
          <button
            type="button"
            onClick={toggleCart}
            className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label={`Ouvrir le panier (${totalItems} article${totalItems > 1 ? 's' : ''})`}
          >
            <span className="text-lg" aria-hidden="true">🛒</span>
            {totalItems > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-1.5 text-[11px] font-bold text-white shadow-md">
                {totalItems}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
          >
            <span className="text-lg" aria-hidden="true">{mobileOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Navigation mobile"
          className="border-t border-slate-200 bg-white lg:hidden"
        >
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4 sm:px-10">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-2">
              <Link
                href={whatsappToHref(brand.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                💬 WhatsApp
              </Link>
            </li>
            {pathname?.startsWith('/admin') ? (
              <li>
                <Link
                  href="/admin/settings"
                  className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
                >
                  ⚙️ Paramètres
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
