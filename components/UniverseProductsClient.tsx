'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useShopStore, whatsappToHref } from '@/lib/shop-store';
import { type ProductUniverse, defaultSiteContent } from '@/lib/data';
import { useHydrated } from '@/lib/use-hydrated';
import ProductCard from '@/components/ProductCard';

export default function UniverseProductsClient({ universe }: { universe: ProductUniverse }) {
  const products = useShopStore((state) => state.products);
  const brand = useShopStore((state) => state.brand);
  const siteContent = useShopStore((state) => state.siteContent);
  const hydrated = useHydrated();

  const filteredProducts = useMemo(
    () => products.filter((product) => product.univers === universe && product.active !== false),
    [products, universe]
  );

  const page = hydrated ? siteContent[universe] : defaultSiteContent[universe];
  const subtitle = page.productsSubtitleTemplate.replace(
    '{count}',
    String(filteredProducts.length)
  );

  return (
    <>
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          {page.productsTitle}
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">{subtitle}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span>{page.catalogueCta}</span>
          <span>→</span>
        </Link>
      </div>

      <div className="mt-20 rounded-3xl bg-slate-950 py-16 px-10 text-center text-white">
        <h3 className="text-3xl font-bold mb-4">{page.contactBlock.title}</h3>
        <p className="mx-auto max-w-2xl text-slate-300 mb-8">{page.contactBlock.subtitle}</p>
        <Link
          href={whatsappToHref(brand.whatsapp)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          {page.contactBlock.cta}
        </Link>
      </div>
    </>
  );
}
