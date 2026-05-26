'use client';

import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/lib/data';

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      aria-label={`Ajouter ${product.name} au panier`}
    >
      Ajouter au panier
    </button>
  );
}
