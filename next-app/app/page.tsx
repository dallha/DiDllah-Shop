'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useShopStore } from '@/lib/shop-store';
import {
  products as defaultProducts,
  shop as defaultShop,
  defaultSiteContent,
  whatsappToHref,
} from '@/lib/data';
import { useHydrated } from '@/lib/use-hydrated';
import ProductCard from '@/components/ProductCard';
import MarqueeBanner from '@/components/MarqueeBanner';
import ArtisansSection from '@/components/ArtisansSection';
import ReviewsSection from '@/components/ReviewsSection';
import ScrollReveal from '@/components/ScrollReveal';


export default function HomePage() {
  const brand = useShopStore((state) => state.brand);
  const storeProducts = useShopStore((state) => state.products);
  const siteContent = useShopStore((state) => state.siteContent);
  const siteImages = useShopStore((state) => state.siteImages);
  const hydrated = useHydrated();

  const effectiveBrand = hydrated ? brand : defaultShop;
  const home = hydrated ? siteContent.home : defaultSiteContent.home;
  const heroImg = hydrated ? siteImages.heroDataUrl : null;
  // Utilise les produits du store — exclut les produits désactivés
  const allProducts = hydrated ? storeProducts : defaultProducts;
  const products = allProducts.filter((p) => p.active !== false);
  const featuredProducts = products.slice(0, 6);
  const beautyProducts = products.filter((p) => p.univers === 'beaute').slice(0, 3);
  const fashionProducts = products.filter((p) => p.univers === 'mode').slice(0, 3);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
        {heroImg ? (
          <Image
            src={heroImg}
            alt="Image hero"
            fill
            className="object-cover opacity-20"
            priority
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
            suppressHydrationWarning
          />
        )}
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-100/80 px-4 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-brand-600"></span>
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">
                  {home.hero.badge}
                </span>
              </div>

              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl font-bold tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
                  {effectiveBrand.tagline}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  {home.hero.subtitle}
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/catalogue"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  <span>{home.hero.ctaPrimary}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="/catalogue"
                  className="inline-flex items-center justify-center rounded-full border-2 border-slate-200 bg-white/80 px-8 py-4 text-sm font-semibold text-slate-950 backdrop-blur-sm transition hover:border-slate-300 hover:bg-white"
                >
                  {home.hero.ctaSecondary}
                </Link>
              </div>
            </div>

            {/* Hero Stats — dynamique */}
            <div className="relative">
              <div className="grid gap-6 sm:grid-cols-2">
                {home.stats.map((stat, i) => {
                  let variantCode = 0;
                  if (stat.variant === 'sombre') variantCode = 0;
                  else if (stat.variant === 'clair') variantCode = 1;
                  else if (stat.variant === 'vert') variantCode = 2;
                  else if (stat.variant === 'clair-simple') variantCode = 3;
                  else variantCode = i % 4;

                  const colSpanClass = stat.size === 'large' ? 'sm:col-span-2' : '';

                  if (variantCode === 0) return (
                    <div key={i} className={`group rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl transition hover:scale-105 ${colSpanClass}`}>
                      <div className="flex items-center gap-2">
                        <p className="text-sm uppercase tracking-[0.32em] text-brand-200">{stat.eyebrow}</p>
                      </div>
                      <p className="mt-4 text-4xl font-bold">{stat.value}</p>
                      <p className="mt-2 text-sm text-slate-300">{stat.description}</p>
                    </div>
                  );
                  if (variantCode === 1) return (
                    <div key={i} className={`group rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-200/60 backdrop-blur-sm transition hover:scale-105 ${colSpanClass}`}>
                      <div className="flex items-center gap-2">
                        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{stat.eyebrow}</p>
                      </div>
                      <p className="mt-4 text-4xl font-bold text-slate-950">{stat.value}</p>
                      <p className="mt-2 text-sm text-slate-600">{stat.description}</p>
                    </div>
                  );
                  if (variantCode === 2) return (
                    <div key={i} className={`group rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-8 text-white shadow-xl transition hover:scale-105 ${colSpanClass}`}>
                      <div className="flex items-center gap-2">
                        <p className="text-sm uppercase tracking-[0.32em] text-brand-100">{stat.eyebrow}</p>
                      </div>
                      <p className="mt-4 text-4xl font-bold">{stat.value}</p>
                      <p className="mt-2 text-sm text-brand-100">{stat.description}</p>
                    </div>
                  );
                  return (
                    <div key={i} className={`group rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-200/60 backdrop-blur-sm transition hover:scale-105 ${colSpanClass}`}>
                      <div className="flex items-center gap-2">
                        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{stat.eyebrow}</p>
                      </div>
                      <p className="mt-4 text-4xl font-bold text-slate-950">{stat.value}</p>
                      <p className="mt-2 text-sm text-slate-600">{stat.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Banner — Promotions & Livraison */}
      <MarqueeBanner />

      {/* Featured Products */}
      <section className="bg-white py-24">

        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mb-16 text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-brand-700">
              {home.featured.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {home.featured.title}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
              {home.featured.subtitle}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span>{home.featured.ctaLabel}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {home.universes.title}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
              {home.universes.subtitle}
            </p>
          </div>

          {(() => {
            const getUniverseTheme = (
              universe: 'beaute' | 'mode',
              customVariant?: string,
              size?: 'compact' | 'medium' | 'large'
            ) => {
              let sizeClass = 'p-8 lg:p-12 min-h-[380px]'; // medium
              if (size === 'compact') {
                sizeClass = 'p-6 lg:p-8 min-h-[280px]';
              } else if (size === 'large') {
                sizeClass = 'p-10 lg:p-16 min-h-[480px]';
              }

              if (!customVariant || customVariant === 'auto') {
                return universe === 'beaute'
                  ? {
                      container: 'bg-gradient-to-br from-rose-100 to-pink-100 text-slate-950',
                      description: 'text-slate-700',
                      badgeBg: 'bg-white/60',
                      badgeText: 'text-slate-950',
                      badgeSub: 'text-slate-600',
                      sizeClass,
                    }
                  : {
                      container: 'bg-gradient-to-br from-amber-100 to-orange-100 text-slate-950',
                      description: 'text-slate-700',
                      badgeBg: 'bg-white/60',
                      badgeText: 'text-slate-950',
                      badgeSub: 'text-slate-600',
                      sizeClass,
                    };
              }
              if (customVariant === 'sombre') {
                return {
                  container: 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl',
                  description: 'text-slate-300',
                  badgeBg: 'bg-white/10 backdrop-blur-sm',
                  badgeText: 'text-white',
                  badgeSub: 'text-slate-300',
                  sizeClass,
                };
              }
              if (customVariant === 'vert') {
                return {
                  container: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-xl',
                  description: 'text-brand-100',
                  badgeBg: 'bg-white/10 backdrop-blur-sm',
                  badgeText: 'text-white',
                  badgeSub: 'text-brand-100',
                  sizeClass,
                };
              }
              if (customVariant === 'clair') {
                return {
                  container: 'bg-white/90 shadow-xl ring-1 ring-slate-200/60 backdrop-blur-sm text-slate-950',
                  description: 'text-slate-600',
                  badgeBg: 'bg-slate-50',
                  badgeText: 'text-slate-950',
                  badgeSub: 'text-slate-500',
                  sizeClass,
                };
              }
              if (customVariant === 'rose') {
                return {
                  container: 'bg-gradient-to-br from-rose-100 to-pink-100 text-slate-950',
                  description: 'text-slate-700',
                  badgeBg: 'bg-white/60',
                  badgeText: 'text-slate-950',
                  badgeSub: 'text-slate-600',
                  sizeClass,
                };
              }
              return {
                container: 'bg-gradient-to-br from-amber-100 to-orange-100 text-slate-950',
                description: 'text-slate-700',
                badgeBg: 'bg-white/60',
                badgeText: 'text-slate-950',
                badgeSub: 'text-slate-600',
                sizeClass,
              };
            };

            const bTheme = getUniverseTheme('beaute', home.universes.beaute.variant, home.universes.beaute.size);
            const mTheme = getUniverseTheme('mode', home.universes.mode.variant, home.universes.mode.size);

            return (
              <div className="grid gap-12 lg:grid-cols-2">
                {/* Beauté */}
                <div className="group">
                  <Link href="/beaute" className="block">
                    <div className={`relative overflow-hidden rounded-3xl transition hover:scale-[1.02] ${bTheme.container} ${bTheme.sizeClass}`}>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-3xl">✨</span>
                          <h3 className="text-2xl font-bold">
                            {home.universes.beaute.title}
                          </h3>
                        </div>
                        <p className={`mb-8 ${bTheme.description}`}>{home.universes.beaute.description}</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {beautyProducts.map((product) => (
                            <div key={product.id} className={`rounded-xl p-4 backdrop-blur-sm ${bTheme.badgeBg}`}>
                              <p className={`font-medium ${bTheme.badgeText}`}>{product.name}</p>
                              <p className={`text-sm ${bTheme.badgeSub}`}>{product.short}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="absolute -right-4 -top-4 text-6xl opacity-10">🌸</div>
                    </div>
                  </Link>
                </div>

                {/* Mode */}
                <div className="group">
                  <Link href="/mode" className="block">
                    <div className={`relative overflow-hidden rounded-3xl transition hover:scale-[1.02] ${mTheme.container} ${mTheme.sizeClass}`}>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-3xl">👗</span>
                          <h3 className="text-2xl font-bold">
                            {home.universes.mode.title}
                          </h3>
                        </div>
                        <p className={`mb-8 ${mTheme.description}`}>{home.universes.mode.description}</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {fashionProducts.map((product) => (
                            <div key={product.id} className={`rounded-xl p-4 backdrop-blur-sm ${mTheme.badgeBg}`}>
                              <p className={`font-medium ${mTheme.badgeText}`}>{product.name}</p>
                              <p className={`text-sm ${mTheme.badgeSub}`}>{product.short}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="absolute -right-4 -top-4 text-6xl opacity-10">🎨</div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Section Artisans */}
      <ArtisansSection />

      {/* Section Avis Clients */}
      <ReviewsSection />

      {/* CTA Section */}
      <section className="bg-slate-950 py-24 text-white">

        <div className="mx-auto max-w-4xl px-6 text-center sm:px-10">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {home.cta.title}
          </h2>
          <p className="mt-6 text-lg text-slate-300">{home.cta.subtitle}</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              <span>{home.cta.primary}</span>
              <span>🛍️</span>
            </Link>
            <Link
              href={whatsappToHref(effectiveBrand.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-transparent px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <span>{home.cta.secondary}</span>
              <span>💬</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
