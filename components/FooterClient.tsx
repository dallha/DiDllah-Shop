'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useShopStore } from '@/lib/shop-store';
import { useHydrated } from '@/lib/use-hydrated';

export default function FooterClient() {
  const hydrated = useHydrated();
  const brand = useShopStore((s) => s.brand);
  const siteContent = useShopStore((s) => s.siteContent);
  const [showCredits, setShowCredits] = useState(false);

  const links = hydrated ? siteContent.footerLinks : [
    { label: 'Boutique', href: '/catalogue' },
    { label: 'Contact', href: '/contact' },
    { label: 'Administration', href: '/admin' },
  ];

  const brandName = hydrated ? brand.name : 'DiDallah Shop';

  // Fermer la modale avec Échap
  useEffect(() => {
    if (!showCredits) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCredits(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCredits]);

  // Verrouiller le défilement du corps quand la modale est ouverte
  useEffect(() => {
    if (showCredits) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCredits]);

  return (
    <>
      <footer className="w-full bg-slate-100/50 dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="leading-relaxed">
            © {new Date().getFullYear()} {brandName}. Tous droits réservés.
            <span className="block sm:inline sm:ml-1">
              Design par{' '}
              <button
                type="button"
                onClick={() => setShowCredits(true)}
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline hover:text-brand-800 dark:hover:text-brand-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded px-1 transition"
                aria-haspopup="dialog"
                aria-expanded={showCredits}
              >
                El Hadji Abdoulaye Niass
              </button>
            </span>
          </p>
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-slate-900 dark:hover:text-slate-100 transition font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Modale Crédits de Conception Graphique ── */}
      {showCredits && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="designer-modal-title"
        >
          {/* Arrière-plan transparent flouté */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCredits(false)}
            aria-hidden="true"
          />

          {/* Conteneur de la modale */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl text-left text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* En-tête de la modale */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400">
                  Graphiste de la Hadara
                </p>
                <h2
                  id="designer-modal-title"
                  className="mt-1 text-2xl font-bold text-slate-950 dark:text-white"
                >
                  El Hadji Abdoulaye Niass
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Designer Graphique & Créateur Visuel · Dakar, Sénégal
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCredits(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100"
                aria-label="Fermer la modale"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Corps de la modale */}
            <div className="space-y-6 text-sm leading-relaxed">
              <p className="text-slate-600 dark:text-slate-300 italic text-base">
                "En tant que designer graphique, je combine une approche esthétique moderne avec la richesse de notre héritage culturel. Mon objectif est de créer des identités visuelles fortes et mémorables pour les entreprises, les institutions et les particuliers."
              </p>

              {/* Services & Packages */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Nos Services & Packages
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-5 space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      1. Identité Visuelle & Logo
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      La fondation de votre marque. Inclut la recherche & concepts (3 propositions), révisions illimitées (jusqu'à 3 cycles), et tous les fichiers finaux (PNG, JPG, SVG, PDF).
                    </p>
                    <p className="text-xs font-bold text-brand-700 dark:text-brand-400 pt-1">
                      Tarif : À partir de 60 000 FCFA
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-5 space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      2. Communication Visuelle
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Supports d'impact. Affiches, flyers ou bâches publicitaires grand format.
                    </p>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1">
                      <li>Flyer événementiel : 30 000 FCFA</li>
                      <li>Design business : 50 000 FCFA</li>
                      <li>Bâches & bannières : Dès 45 000 FCFA</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-5 space-y-2 sm:col-span-2">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      3. Packages "Booster"
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Des offres complètes pour propulser ou dynamiser votre communication :
                    </p>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1">
                      <li>
                        <strong>Starter Pack :</strong> Logo + Charte graphique simplifiée (couleurs, typographies) + Carte de visite
                      </li>
                      <li>
                        <strong>Event Pack :</strong> Affiche ou flyer + Conception de badge + Kakemono (bannière sur pied)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Processus de commande */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Processus de commande
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                    <p className="font-bold text-brand-600 dark:text-brand-400 mb-1">01</p>
                    <p className="font-semibold text-slate-900 dark:text-white">Contact & Brief</p>
                    <p className="mt-1 text-[10px] text-slate-400">Cadrer vos besoins</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                    <p className="font-bold text-brand-600 dark:text-brand-400 mb-1">02</p>
                    <p className="font-semibold text-slate-900 dark:text-white">Acompte 50%</p>
                    <p className="mt-1 text-[10px] text-slate-400">Validation du devis</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                    <p className="font-bold text-brand-600 dark:text-brand-400 mb-1">03</p>
                    <p className="font-semibold text-slate-900 dark:text-white">Création</p>
                    <p className="mt-1 text-[10px] text-slate-400">Soumissions & retours</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                    <p className="font-bold text-brand-600 dark:text-brand-400 mb-1">04</p>
                    <p className="font-semibold text-slate-900 dark:text-white">Fichiers finaux</p>
                    <p className="mt-1 text-[10px] text-slate-400">Après paiement du solde</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pied de la modale avec boutons de contact */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
              <a
                href="https://wa.me/221776232741?text=Bonjour%20El%20Hadji%20Abdoulaye%20Niass%2C%20je%20vous%20contacte%20depuis%20DiDallah%20Shop%20pour%20un%20projet%20de%20design%20graphique."
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 hover:scale-[1.02]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white shrink-0" aria-hidden="true">
                  <path d="M12.031 0C5.405 0 0 5.394 0 12.025c0 2.115.548 4.179 1.594 6.002L.038 24l6.113-1.603a12.015 12.015 0 0 0 5.88 1.543c6.626 0 12.03-5.394 12.03-12.025C24.062 5.394 18.657 0 12.031 0zm3.626 17.275c-.156.44-1.503.864-2.07.904-.568.04-1.282.176-3.882-.84-3.14-1.228-5.166-4.436-5.322-4.646-.156-.21-1.272-1.693-1.272-3.23 0-1.537.804-2.287 1.092-2.585.286-.298.623-.374.832-.374.208 0 .416.002.597.01.19.008.448-.076.702.54.26.634.884 2.158.962 2.316.078.158.13.344.026.554-.104.21-.156.342-.312.526-.156.184-.328.39-.468.514-.156.142-.316.298-.14.6.176.3.784 1.293 1.685 2.096 1.163 1.037 2.14 1.354 2.44 1.504.3.15.474.126.65-.07.176-.196.76-1.042.964-1.4.204-.358.408-.3.684-.196.276.104 1.743.82 2.042.97.298.15.498.224.572.35.074.126.074.726-.082 1.166z" />
                </svg>
                <span>WhatsApp (+221 77 623 27 41)</span>
              </a>
              <a
                href="https://www.behance.net/mrniasse"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-700/50 px-5 py-3 text-sm font-semibold transition hover:bg-slate-800 dark:hover:bg-slate-700 hover:scale-[1.02]"
              >
                <span>Voir son Portfolio Behance</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
