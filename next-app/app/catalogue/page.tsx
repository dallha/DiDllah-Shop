'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { categories, defaultSiteContent, type ProductUniverse } from '@/lib/data';
import { useShopStore, whatsappToHref } from '@/lib/shop-store';
import { useHydrated } from '@/lib/use-hydrated';
import ProductCard from '@/components/ProductCard';

const allCategories = Object.values(categories).flat();

export default function CataloguePage() {
  const products = useShopStore((state) => state.products);
  const brand = useShopStore((state) => state.brand);
  const siteContent = useShopStore((state) => state.siteContent);
  const hydrated = useHydrated();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUniverse, setSelectedUniverse] = useState<ProductUniverse | null>(null);

  const page = hydrated ? siteContent.catalogue : defaultSiteContent.catalogue;

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        if (selectedCategory && product.category !== selectedCategory) return false;
        if (selectedUniverse && product.univers !== selectedUniverse) return false;
        return true;
      }),
    [products, selectedCategory, selectedUniverse]
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm uppercase tracking-[0.32em] text-brand-700">
                  {page.eyebrow}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-sm text-slate-600">{filteredProducts.length} produits</span>
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                {page.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-600">{page.subtitle}</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-950"
            >
              <span>←</span>
              <span>{page.backLabel}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
        {/* Filtres */}
        <div className="mb-12 space-y-8">
          {/* Univers */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-slate-950">
              {page.filterUniverseLabel}
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedUniverse(null)}
                className={`rounded-full px-6 py-3 text-sm font-medium transition ${
                  selectedUniverse === null
                    ? 'bg-slate-950 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                Tous les univers
              </button>
              <button
                onClick={() => setSelectedUniverse('beaute')}
                className={`rounded-full px-6 py-3 text-sm font-medium transition ${
                  selectedUniverse === 'beaute'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                ✨ Beauté
              </button>
              <button
                onClick={() => setSelectedUniverse('mode')}
                className={`rounded-full px-6 py-3 text-sm font-medium transition ${
                  selectedUniverse === 'mode'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                👗 Mode
              </button>
            </div>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-slate-950">
              {page.filterCategoryLabel}
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] transition ${
                  selectedCategory === null
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Toutes les catégories
              </button>
              {allCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === category.id ? null : category.id)
                  }
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] transition ${
                    selectedCategory === category.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Produits */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-slate-950 mb-4">{page.emptyState.title}</h3>
            <p className="text-slate-600 mb-8">{page.emptyState.subtitle}</p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedUniverse(null);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {page.emptyState.cta}
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* CTA */}
        {filteredProducts.length > 0 && (
          <div className="mt-16 text-center">
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-12 text-white">
              <h3 className="text-2xl font-bold mb-4">{page.ctaBlock.title}</h3>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">{page.ctaBlock.subtitle}</p>
              <Link
                href={whatsappToHref(brand.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-slate-950 hover:bg-slate-100 transition"
              >
                <span>{page.ctaBlock.cta}</span>
                <span>💬</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
