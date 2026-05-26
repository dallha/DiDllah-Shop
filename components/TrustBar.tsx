'use client';

import { useShopStore } from '@/lib/shop-store';
import { useHydrated } from '@/lib/use-hydrated';

export default function TrustBar() {
  const hydrated = useHydrated();
  const siteContent = useShopStore((s) => s.siteContent);

  const items = hydrated ? siteContent.trustBar : [
    { icon: '🔒', label: 'Achats sécurisés' },
    { icon: '🚚', label: 'Livraison 24-48h Dakar' },
    { icon: '💳', label: 'Paiement Orange Money · Wave · Carte' },
    { icon: '✅', label: 'Produits authentiques' },
  ];

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-3 text-xs font-medium tracking-wide sm:px-10">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
