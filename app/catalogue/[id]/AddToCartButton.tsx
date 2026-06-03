'use client';

import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/lib/data';
import { triggerStarBurst } from '@/lib/starburst';

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  return (
    <button
      type="button"
      onClick={(e) => {
        addItem(product);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX || (rect.left + rect.width / 2);
        const y = e.clientY || (rect.top + rect.height / 2);
        triggerStarBurst(x, y);
      }}
      className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      aria-label={`Ajouter ${product.name} au panier`}
    >
      Ajouter au panier
    </button>
  );
}
