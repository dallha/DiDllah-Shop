'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useShopStore } from '@/lib/shop-store';
import { defaultSiteContent } from '@/lib/data';
import { useHydrated } from '@/lib/use-hydrated';
import UniverseProductsClient from '@/components/UniverseProductsClient';

export default function BeautePageClient() {
  const siteContent = useShopStore((state) => state.siteContent);
  const siteImages = useShopStore((state) => state.siteImages);
  const hydrated = useHydrated();

  const page = hydrated ? siteContent.beaute : defaultSiteContent.beaute;
  const heroImg = hydrated ? siteImages.beauteHeroDataUrl : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50/30 via-white to-pink-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-rose-100 to-pink-100">
        {heroImg ? (
          <Image
            src={heroImg}
            alt="Image beauté"
            fill
            className="object-cover opacity-20"
            priority
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
            suppressHydrationWarning
          />
        )}
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-200/80 px-4 py-2 backdrop-blur-sm mb-6">
              <span className="text-2xl">✨</span>
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-700">
                {page.hero.badge}
              </span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl mb-6">
              {page.hero.title}
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-8">
              {page.hero.subtitle}
            </p>

            <Link
              href="#produits"
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-8 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-700 hover:scale-105"
            >
              <span>{page.hero.cta}</span>
              <span>↓</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Produits */}
      <section id="produits" className="py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <UniverseProductsClient universe="beaute" />
        </div>
      </section>

      {/* Valeurs */}
      <section className="bg-rose-50 py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {page.values.title}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {page.values.items.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">{value.emoji}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-950 mb-4">{value.title}</h3>
                <p className="text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
