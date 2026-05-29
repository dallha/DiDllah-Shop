'use client';

import { useState, useRef, useEffect } from 'react';
import { useShopStore } from '@/lib/shop-store';
import { useHydrated } from '@/lib/use-hydrated';
import { defaultSiteContent } from '@/lib/data';
import { createClient } from '@/lib/supabase-client';
import { isSupabaseConfigured } from '@/lib/supabase';

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

// ─── Formulaire d'avis public ──────────────────────────────────────────────────

function ReviewForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [product, setProduct] = useState('');
  const [text, setText] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaUserAnswer, setCaptchaUserAnswer] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Charger le captcha cryptographique depuis le serveur
  async function loadCaptcha() {
    try {
      const res = await fetch('/api/reviews/captcha');
      if (res.ok) {
        const data = await res.json();
        setCaptchaQuestion(data.question);
        setCaptchaToken(data.token);
      }
    } catch (err) {
      console.error('Erreur chargement captcha:', err);
    }
  }

  useEffect(() => {
    loadCaptcha();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !text.trim() || !product.trim() || !captchaUserAnswer) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          rating,
          product: product.trim(),
          text: text.trim(),
          captchaAnswer: captchaUserAnswer,
          captchaToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la soumission de l\'avis.');
      }

      setSuccess(true);
      onSubmitted();
    } catch (err: any) {
      console.error('[ReviewsSection] Erreur soumission:', err);
      setError(err.message || "Une erreur est survenue. Veuillez réessayer plus tard.");
      // Recharger un captcha et vider la réponse en cas d'erreur
      loadCaptcha();
      setCaptchaUserAnswer('');
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-semibold text-emerald-800">Merci pour votre avis !</p>
        <p className="text-sm text-emerald-600 mt-1">
          Il sera publié après validation par notre équipe.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 mb-1.5">
            Nom * 
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Votre nom"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com (optionnel)"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 mb-1.5">
          Note *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 transition hover:scale-110"
            >
              <svg
                className={`w-8 h-8 ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 mb-1.5">
          Produit concerné *
        </label>
        <input
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          required
          placeholder="Ex: Beurre de Karité Brut"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 mb-1.5">
          Votre avis *
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={4}
          placeholder="Partagez votre expérience avec ce produit..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 min-h-[100px] resize-y leading-6"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 mb-1.5">
          Anti-spam : {captchaQuestion}
        </label>
        <input
          type="text"
          value={captchaUserAnswer}
          onChange={(e) => setCaptchaUserAnswer(e.target.value)}
          required
          placeholder="Réponse"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 max-w-[120px]"
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-rose-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {sending ? 'Envoi en cours…' : 'Envoyer mon avis'}
      </button>
    </form>
  );
}

// ─── Composant Principal ────────────────────────────────────────────────────────

export default function ReviewsSection() {
  const siteContent = useShopStore((state) => state.siteContent);
  const hydrated = useHydrated();
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const reviews = hydrated ? siteContent.reviews : defaultSiteContent.reviews;
  const items = reviews.items;

  if (items.length === 0) return null;

  const displayed = showAll ? items : items.slice(0, 3);
  const avgRating = (items.reduce((s, r) => s + r.rating, 0) / items.length).toFixed(1);

  function scrollToForm() {
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

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

        {/* Boutons d'action */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {items.length > 3 && (
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
          )}
          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
          >
            <span>✏️ Laisser un avis</span>
          </button>
        </div>

        {/* Formulaire d'avis public */}
        {showForm && (
          <div ref={formRef} className="mt-12 max-w-2xl mx-auto">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Partagez votre expérience</h3>
              <p className="text-sm text-slate-500 mb-6">
                Votre avis sera publié après validation par notre équipe.
              </p>
              <ReviewForm onSubmitted={() => {
                setTimeout(() => setShowForm(false), 3000);
              }} />
            </div>
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
