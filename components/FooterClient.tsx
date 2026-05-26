'use client';

import Link from 'next/link';
import { useShopStore } from '@/lib/shop-store';
import { useHydrated } from '@/lib/use-hydrated';

export default function FooterClient() {
  const hydrated = useHydrated();
  const brand = useShopStore((s) => s.brand);
  const siteContent = useShopStore((s) => s.siteContent);

  const links = hydrated ? siteContent.footerLinks : [
    { label: 'Boutique', href: '/catalogue' },
    { label: 'Contact', href: '/contact' },
    { label: 'Administration', href: '/admin' },
  ];

  const brandName = hydrated ? brand.name : 'DiDallah Shop';

  return (
    <footer className="w-full bg-slate-100/50 border-t border-slate-200/60 py-6 text-center text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} {brandName}. Tous droits réservés.</p>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-slate-900 transition font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
