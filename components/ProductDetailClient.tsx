'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { useShopStore } from '@/lib/shop-store';
import { useHydrated } from '@/lib/use-hydrated';
import { formatPrice, type Product } from '@/lib/data';
import AddToCartButton from '@/app/catalogue/[id]/AddToCartButton';

export default function ProductDetailClient({
  id,
  fallbackProduct,
}: {
  id: string;
  fallbackProduct: Product | null;
}) {
  const storeProducts = useShopStore((state) => state.products);
  const hydrated = useHydrated();

  const product: Product | null = useMemo(() => {
    // 1. Cherche en priorité dans le store (produits admin / Supabase)
    const fromStore = storeProducts.find((item) => item.id === id);
    if (fromStore) return fromStore;
    // 2. Fallback sur le produit statique (data.ts) si disponible
    return fallbackProduct;
  }, [id, storeProducts, fallbackProduct]);

  // ── Chargement (store pas encore hydraté et pas de fallback statique) ──────
  if (!hydrated && !fallbackProduct) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 text-center text-slate-500">
          Chargement du produit…
        </div>
      </div>
    );
  }

  // ── 404 (store hydraté et produit introuvable partout) ────────────────────
  if (hydrated && !product) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-4xl px-6 py-32 sm:px-10 text-center">
          <p className="text-6xl mb-6">🔍</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 mb-4">
            Produit introuvable
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            Ce produit n&apos;existe pas ou a été supprimé.
          </p>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            ← Voir le catalogue
          </Link>
        </div>
      </div>
    );
  }

  // ── Pendant l'hydratation si pas de fallback : affiche un squelette ────────
  const p = product ?? fallbackProduct;
  if (!p) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-brand-700">{p.category}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{p.name}</h1>
          </div>
          <Link href="/catalogue" className="text-sm font-medium text-slate-700 hover:text-slate-950">
            ← Retour
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-white p-10 shadow-soft">
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-brand-100/20">
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-end justify-end p-6">
                  <span className="text-xs uppercase tracking-[0.3em] text-brand-700/40">
                    Photo à venir
                  </span>
                </div>
              )}
            </div>

            <div className="mt-10 space-y-6">
              <p className="text-lg leading-8 text-slate-600">{p.long}</p>
              {p.details.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {p.details.map((detail) => (
                    <li
                      key={detail}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Prix</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{formatPrice(p.price)}</p>
                </div>
                {p.tag && (
                  <div className="rounded-3xl border border-slate-200 p-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Badge</p>
                    <p className="mt-3 text-xl font-semibold text-brand-700">{p.tag}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6 rounded-[2rem] bg-white p-8 shadow-soft">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Disponibilité</p>
              <p className="mt-3 text-xl font-semibold text-slate-950">En stock</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Estimation livraison</p>
              <p className="mt-3 text-base text-slate-700">
                Livraison en 24-48h à Dakar, 3-5 jours régions.
              </p>
            </div>
            <AddToCartButton product={p} />
          </aside>
        </div>
      </div>
    </div>
  );
}
