'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
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
  
  const allReviews = useShopStore((state) => state.reviews);
  const addReview = useShopStore((state) => state.addReview);
  
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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

  const productReviews = allReviews.filter(r => r.productId === p.id && r.status === 'approved');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    
    addReview({
      id: Math.random().toString(36).substring(2, 9),
      productId: p.id,
      clientName: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString(),
      status: 'pending', // Option 1: Validation requise
    });
    
    setReviewSubmitted(true);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
  };

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

        {/* Section Avis Clients */}
        <div className="mt-16 rounded-[2rem] bg-white p-10 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950 mb-8">Avis Clients</h2>
          
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Liste des avis */}
            <div>
              {productReviews.length === 0 ? (
                <p className="text-slate-500 italic">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
              ) : (
                <div className="space-y-6">
                  {productReviews.map(r => (
                    <div key={r.id} className="border-b border-slate-100 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">{r.clientName}</span>
                        <span className="text-xs text-slate-500">{new Date(r.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex text-amber-400 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-current' : 'fill-slate-200'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulaire */}
            <div className="rounded-3xl bg-slate-50 p-8 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Laissez votre avis</h3>
              {reviewSubmitted ? (
                <div className="rounded-xl bg-emerald-100 p-6 text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="font-semibold text-emerald-800">Merci pour votre avis !</p>
                  <p className="text-sm text-emerald-600 mt-1">Il sera publié après validation par notre équipe.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Votre Nom</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      placeholder="Ex: Amina D."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Note</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className={`focus:outline-none transition-transform hover:scale-110 ${star <= reviewRating ? 'text-amber-400' : 'text-slate-200'}`}
                        >
                          <svg className="h-8 w-8 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Commentaire</label>
                    <textarea
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
                      placeholder="Partagez votre expérience avec ce produit..."
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition">
                    Envoyer l'avis
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
