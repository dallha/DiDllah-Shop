'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';
import { useShopStore } from '@/lib/shop-store';

const LOGIN_BG_FALLBACK = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80';

export default function LoginClient() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState('/admin');

  // Image de fond : réactive au store (mise à jour quand SupabaseSync charge les données)
  const adminLoginDataUrl = useShopStore((state) => state.siteImages.adminLoginDataUrl);
  const loginBg = adminLoginDataUrl || LOGIN_BG_FALLBACK;

  // Lire le paramètre redirectTo via l'API native (évite useSearchParams côté serveur)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectTo(params.get('redirectTo') ?? '/admin');
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1) Essayer Supabase d'abord
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!authError) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    // 2) Fallback : ADMIN_SECRET (connexion locale sans Supabase)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push(redirectTo);
        router.refresh();
        return;
      }
    } catch {
      // Ignorer si l'API n'existe pas
    }

    setError('Email ou mot de passe incorrect.');
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">

      {/* Panneau gauche — visuel */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden">
        <Image
          src={loginBg}
          alt="DiDallah — mode africaine"
          fill
          className="object-cover"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-brand-900/70" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white border border-white/20">
              <Image
                src="/logo.png"
                alt="Logo DiDallah"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="text-white font-bold text-lg">DiDallah Shop</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="text-white">
            <p className="text-2xl font-semibold leading-snug">
              &ldquo;L&rsquo;élégance africaine,<br />au bout des doigts.&rdquo;
            </p>
            <footer className="mt-4 text-sm text-white/60 uppercase tracking-widest">
              Beauté &amp; Mode — Dakar
            </footer>
          </blockquote>

          <div className="flex gap-6">
            {[
              { label: 'Produits', value: '25+' },
              { label: 'Univers', value: '2' },
              { label: 'Livraison', value: '48h' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/50 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 bg-slate-50">
        <div className="mx-auto w-full max-w-sm">

          {/* Logo mobile */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg border border-slate-100">
              <Image
                src="/logo.png"
                alt="Logo DiDallah"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="font-bold text-slate-950 text-lg">DiDallah Shop</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Espace admin
            </h1>
            <p className="mt-2 text-slate-500">
              Connectez-vous pour gérer votre boutique.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:from-slate-800 hover:to-slate-700 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Connexion…
                </span>
              ) : 'Se connecter →'}
            </button>
          </form>

          <p className="mt-8 text-xs text-center text-slate-400">
            Accès réservé aux administrateurs de DiDallah Shop.
          </p>
        </div>
      </div>
    </div>
  );
}
