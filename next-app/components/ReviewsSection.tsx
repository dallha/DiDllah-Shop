'use client';

import { useState } from 'react';
import { useHydrated } from '@/lib/use-hydrated';

// ─── Types ──────────────────────────────────────────────────────────────────────

type Review = {
  id: string;
  name: string;
  initials: string;
  location: string;
  rating: number;
  text: string;
  productName: string;
  productCategory: string;
  beforeAfter?: { before: string; after: string };
  date: string;
};

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Aminata Diallo',
    initials: 'AD',
    location: 'Dakar',
    rating: 5,
    text: "Le lait corporel au karité est une révélation ! Ma peau n'a jamais été aussi douce. Livraison rapide et produit authentique.",
    productName: 'Lait Corporel au Karité Pur',
    productCategory: 'Soins corporels',
    date: '2026-05-20',
  },
  {
    id: 'r2',
    name: 'Mamadou Ndiaye',
    initials: 'MN',
    location: 'Thiès',
    rating: 5,
    text: "J'ai commandé le Boubou brodé pour le mariage de ma sœur. La qualité du bazin est exceptionnelle, les broderies sont faites à la main. Un véritable chef-d'œuvre.",
    productName: "Boubou Femme Brodé — Soirée d'Or",
    productCategory: 'Tenues traditionnelles',
    date: '2026-05-18',
  },
  {
    id: 'r3',
    name: 'Fatou Sy',
    initials: 'FS',
    location: 'Paris (Diaspora)',
    rating: 4,
    text: "L'Eau de Parfum Jardin de Liberté a un sillage magnifique. Je reçois des compliments à chaque fois. Seul bémol : j'aurais aimé un format voyage.",
    productName: 'Eau de Parfum — Jardin de Liberté',
    productCategory: 'Parfumerie',
    date: '2026-05-15',
  },
  {
    id: 'r4',
    name: 'Ousmane Ba',
    initials: 'OB',
    location: 'Saint-Louis',
    rating: 5,
    text: "Le tissu wax est magnifique, couleurs vibrantes et tissu épais de qualité. Ma femme va se faire une magnifique robe. Merci DiDallah !",
    productName: 'Tissu Wax — 6 yards',
    productCategory: 'Tissus',
    date: '2026-05-12',
  },
  {
    id: 'r5',
    name: 'Marième Fall',
    initials: 'MF',
    location: 'Dakar',
    rating: 5,
    text: "Le sérum 7 huiles a transformé mes cheveux. Après 3 semaines d'utilisation, ils sont plus brillants et moins cassants. Produit 100% naturel, ça change tout !",
    productName: 'Sérum Capillaire — 7 Huiles Précieuses',
    productCategory: 'Huiles & cheveux',
    date: '2026-05-10',
  },
  {
    id: 'r6',
    name: 'Khady Diop',
    initials: 'KD',
    location: 'Touba',
    rating: 5,
    text: "Le beurre de karité brut est exactement ce que je cherchais. Pur, sans additifs, sent bon le naturel. Ma peau sèche dit merci !",
    productName: 'Beurre de Karité Brut — Pot Artisanal',
    productCategory: 'Soins corporels',
    date: '2026-05-08',
  },
];

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

function ReviewCard({ review, featured }: { review: Review; featured?: boolean }) {
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
            <p className="text-[11px] text-slate-400">{review.location}</p>
          </div>
        </div>

        {/* Étoiles */}
        <Stars rating={review.rating} />

        {/* Texte */}
        <p className="mt-2 text-sm text-slate-600 leading-relaxed italic">
          &ldquo;{review.text}&rdquo;
        </p>

        {/* Produit + Date */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full truncate max-w-[160px]">
            {review.productName}
          </span>
          <span className="text-[10px] text-slate-400 flex-shrink-0">
            {new Date(review.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Composant Principal ────────────────────────────────────────────────────────

export default function ReviewsSection() {
  const hydrated = useHydrated();
  const [showAll, setShowAll] = useState(false);

  // Animation au scroll
  if (typeof window !== 'undefined') {
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

    // Utiliser requestAnimationFrame pour éviter les conflits React
    requestAnimationFrame(() => {
      document.querySelectorAll('.review-animate').forEach((el) => observer.observe(el));
    });
  }

  const displayed = showAll ? MOCK_REVIEWS : MOCK_REVIEWS.slice(0, 3);
  const avgRating = (MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1);

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
              Ce qu'ils disent
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg">
              Des clients satisfaits, des produits qui font la différence. Découvrez leurs témoignages.
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
              <p className="text-sm font-semibold text-slate-900">{MOCK_REVIEWS.length} avis</p>
              <p className="text-xs text-slate-400">100% vérifiés</p>
            </div>
          </div>
        </div>

        {/* Grille d'avis */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {displayed.map((review, i) => (
            <div
              key={review.id}
              className={`review-animate opacity-0 translate-y-6 transition-all duration-700 ease-out`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <ReviewCard review={review} featured={i === 0} />
            </div>
          ))}
        </div>

        {/* Bouton Voir plus */}
        {MOCK_REVIEWS.length > 3 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="group inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 transition-all hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md"
            >
              <span>{showAll ? 'Voir moins' : `Voir les ${MOCK_REVIEWS.length} avis`}</span>
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
