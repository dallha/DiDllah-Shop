'use client';

import { useState } from 'react';
import { useShopStore } from '@/lib/shop-store';
import { useHydrated } from '@/lib/use-hydrated';
import { defaultSiteContent } from '@/lib/data';

// ─── Composant Étoiles ──────────────────────────────────────────────────────────

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Carte Avis ─────────────────────────────────────────────────────────────────

function ReviewCard({ review, featured }: { review: { initials: string; name: string; role: string; product: string; rating: number; text: string; tags: string[]; result?: string; period?: string }; featured?: boolean }) {
  return (
    <div
      className={`group relative bg-white rounded-2xl border border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        featured ? 'ring-2 ring-brand-500/20 shadow-md' : 'shadow-sm'
      }`}
    >
      {/* Badge "Avis vérifié" */}
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Vérifié
        </span>
      </div>

      <div className="p-5">
        {/* En-tête : Avatar + Nom */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {review.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{review.name}</p>
            <p className="text-[11px] text-slate-400">{review.role}</p>
          </div>
        </div>

        {/* Étoiles */}
        <Stars rating={review.rating} />

        {/* Texte */}
        <p className="mt-2 text-sm text-slate-600 leading-relaxed italic">
          &ldquo;{review.text}&rdquo;
        </p>

        {/* Résultat + Période */}
        {(review.result || review.period) && (
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            {review.result && (
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {review.result}
              </span>
            )}
            {review.period && (
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {review.period}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {review.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {review.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Produit */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full truncate max-w-[160px]">
            {review.product}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Composant Principal ────────────────────────────────────────────────────────

export default function ReviewsSection() {
  const siteContent = useShopStore((state) => state.siteContent);
  const hydrated = useHydrated();
  const [showAll, setShowAll] = useState(false);

  const reviews = hydrated ? siteContent.reviews : defaultSiteContent.reviews;
  const items = reviews.items;

  if (items.length === 0) return null;

  const displayed = showAll ? items : items.slice(0, 3);
  const avgRating = (items.reduce((s, r) => s + r.rating, 0) / items.length).toFixed(1);

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-700">
                Avis Clients
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
              {reviews.title}
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg">
              {reviews.subtitle}
            </p>
          </div>

          {/* Note globale */}
          <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-950">{avgRating}</p>
              <Stars rating={5} size="md" />
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{items.length} avis</p>
              <p className="text-xs text-slate-400">100% vérifiés</p>
            </div>
          </div>
        </div>

        {/* Grille d'avis */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {displayed.map((review, i) => (
            <div
              key={review.initials + review.name}
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out"
              style={{
                animation: `none`,
                opacity: undefined as unknown as string,
                transform: undefined as unknown as string,
              }}
              onLoad={(e) => {
                const el = e.currentTarget;
                requestAnimationFrame(() => {
                  el.style.opacity = '1';
                  el.style.transform = 'translateY(0)';
                });
              }}
              ref={(el) => {
                if (el && !el.dataset.animated) {
                  el.dataset.animated = 'true';
                  const observer = new IntersectionObserver(
                    (entries) => {
                      entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                          entry.target.classList.remove('opacity-0', 'translate-y-6');
                          observer.unobserve(entry.target);
                        }
                      });
                    },
                    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
                  );
                  observer.observe(el);
                }
              }}
            >
              <ReviewCard review={review} featured={i === 0} />
            </div>
          ))}
        </div>

        {/* Bouton Voir plus */}
        {items.length > 3 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="group inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 transition-all hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md"
            >
              <span>{showAll ? 'Voir moins' : `Voir les ${items.length} avis`}</span>
              <svg
                className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Trust bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Achats sécurisés</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Livraison 24-48h Dakar</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Paiement Orange Money</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Produits authentiques</span>
          </div>
        </div>
      </div>
    </section>
  );
}
