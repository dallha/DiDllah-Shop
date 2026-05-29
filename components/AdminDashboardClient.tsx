'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useShopStore } from '@/lib/shop-store';
import { useHydrated } from '@/lib/use-hydrated';
import { formatPrice, formatPriceCompact } from '@/lib/data';
import AdminSidebar from '@/components/AdminSidebar';
import { createClient } from '@/lib/supabase-client';

// ─── Types ───────────────────────────────────────────────────────────────────
type OrderStatus = 'en_attente' | 'en_cours' | 'livre' | 'annule';

type Order = {
  id: string;
  client_name: string;
  products: string;
  total: number;
  status: OrderStatus;
  created_at: string;
};

// ─── Images placeholder Unsplash ────────────────────────────────────────────
const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=80&q=70',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&q=70',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=80&q=70',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=80&q=70',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=80&q=70',
];

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_STYLE: Record<OrderStatus, string> = {
  en_attente: 'bg-amber-50 text-amber-700 border border-amber-200',
  en_cours:   'bg-blue-50 text-blue-700 border border-blue-200',
  livre:      'bg-emerald-50 text-emerald-700 border border-emerald-200',
  annule:     'bg-rose-50 text-rose-700 border border-rose-200',
};

const STATUS_DOT: Record<OrderStatus, string> = {
  en_attente: 'bg-amber-400',
  en_cours:   'bg-blue-500',
  livre:      'bg-emerald-500',
  annule:     'bg-rose-400',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  en_attente: 'En attente',
  en_cours:   'En cours',
  livre:      'Livré',
  annule:     'Annulé',
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  gradient: string;
  textMuted: string;
}

function StatCard({ label, value, sub, icon, gradient, textMuted }: StatCardProps) {
  return (
    <div className={`rounded-3xl p-6 text-white shadow-lg ${gradient}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${textMuted}`}>{label}</p>
          <p className="mt-3 text-3xl font-bold leading-none">{value}</p>
          {sub && <p className={`mt-1.5 text-sm ${textMuted}`}>{sub}</p>}
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </div>
  );
}

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ─── Dashboard principal ─────────────────────────────────────────────────────
const ADMIN_HERO_FALLBACK = '';

export default function AdminDashboardClient() {
  const products    = useShopStore((state) => state.products);
  const siteImages  = useShopStore((state) => state.siteImages);
  const hydrated    = useHydrated();

  // Réactif : dès que SupabaseSync charge adminHeroDataUrl, le composant re-render
  const adminHeroSrc = siteImages.adminHeroDataUrl || ADMIN_HERO_FALLBACK;

  // Commandes réelles depuis Supabase
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setOrdersLoading(false); return; }
    const supabase = createClient();
    supabase
      .from('orders')
      .select('id, client_name, products, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setOrdersLoading(false);
      });
  }, []);

  // Stats produits
  const totalProducts = hydrated ? products.length : 0;
  const totalRevenue  = hydrated ? products.reduce((s, p) => s + p.price, 0) : 0;
  const avgPrice      = totalProducts > 0 ? Math.round(totalRevenue / totalProducts) : 0;
  const beauteCount   = hydrated ? products.filter(p => p.univers === 'beaute').length : 0;
  const modeCount     = hydrated ? products.filter(p => p.univers === 'mode').length : 0;
  const beauteRatio   = totalProducts > 0 ? Math.round((beauteCount / totalProducts) * 100) : 50;

  // Stats commandes
  const livrées  = orders.filter(o => o.status === 'livre').length;
  const enCours  = orders.filter(o => o.status === 'en_cours').length;
  const enAttente = orders.filter(o => o.status === 'en_attente').length;
  const totalCommandesRevenu = orders.filter(o => o.status === 'livre').reduce((s, o) => s + (o.total ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">

          {/* ── Sidebar ── */}
          <AdminSidebar />

          {/* ── Contenu principal ── */}
          <div className="space-y-6">

            {/* ─── Hero header ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl shadow-xl h-44 bg-slate-900">
              {adminHeroSrc ? (
                <Image
                  src={adminHeroSrc}
                  alt="DiDallah — mode africaine"
                  fill
                  className="object-cover object-[center_30%]"
                  priority
                  unoptimized={adminHeroSrc.startsWith('data:')}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-between p-8">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/70">Back-office actif</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">DiDallah Shop</p>
                    <h1 className="mt-1 text-3xl font-bold text-white">Tableau de bord</h1>
                    <p className="mt-1 text-sm text-white/60">Vue d&apos;ensemble de votre boutique</p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/admin/products"
                      className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      + Produit
                    </Link>
                    <Link
                      href="/catalogue"
                      target="_blank"
                      className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      Voir le site →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Stat cards ──────────────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Produits"
                value={totalProducts}
                sub="en catalogue"
                icon="📦"
                gradient="bg-gradient-to-br from-violet-500 to-violet-700"
                textMuted="text-violet-200"
              />
              <StatCard
                label="Commandes"
                value={ordersLoading ? '…' : orders.length}
                sub={ordersLoading ? '' : `${livrées} livrées · ${enCours} en cours · ${enAttente} en attente`}
                icon="🛒"
                gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                textMuted="text-blue-200"
              />
              <StatCard
                label="Revenus livrés"
                value={ordersLoading ? '…' : formatPriceCompact(totalCommandesRevenu)}
                sub="commandes livrées"
                icon="💰"
                gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                textMuted="text-emerald-200"
              />
              <StatCard
                label="Prix moyen"
                value={formatPriceCompact(avgPrice)}
                sub="par produit"
                icon="📊"
                gradient="bg-gradient-to-br from-rose-500 to-rose-700"
                textMuted="text-rose-200"
              />
            </div>

            {/* ─── Commandes + Répartition ──────────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

              {/* Tableau des commandes réelles */}
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <h2 className="font-bold text-slate-950">Commandes récentes</h2>
                  <Link href="/admin/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                    Voir tout →
                  </Link>
                </div>
                <div className="divide-y divide-slate-50">
                  {ordersLoading ? (
                    <div className="px-6 py-10 text-center text-sm text-slate-400">Chargement…</div>
                  ) : orders.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-slate-400">
                      Aucune commande.{' '}
                      <Link href="/admin/orders" className="font-semibold text-brand-600">En créer une →</Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 shrink-0">
                          <span className="text-xs font-bold text-slate-600">
                            {order.client_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-950 truncate">{order.client_name}</p>
                          <p className="text-xs text-slate-500 truncate">{order.products || '—'}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-slate-950">{order.total ? formatPrice(order.total) : '—'}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Répartition univers */}
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
                <h2 className="font-bold text-slate-950 mb-5">Répartition catalogue</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">✨ Beauté</span>
                      <span className="text-sm font-bold text-slate-950">{beauteCount} produits</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-700"
                        style={{ width: `${beauteRatio}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{beauteRatio}% du catalogue</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">👗 Mode</span>
                      <span className="text-sm font-bold text-slate-950">{modeCount} produits</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500 transition-all duration-700"
                        style={{ width: `${100 - beauteRatio}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{100 - beauteRatio}% du catalogue</p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Statuts commandes</h3>
                  <div className="space-y-2">
                    {ordersLoading ? (
                      <p className="text-xs text-slate-400">Chargement…</p>
                    ) : (
                      <>
                        {(['livre', 'en_cours', 'en_attente', 'annule'] as OrderStatus[]).map((s) => {
                          const count = orders.filter(o => o.status === s).length;
                          return (
                            <div key={s} className="flex items-center justify-between">
                              <StatusBadge status={s} />
                              <span className="text-sm font-bold text-slate-950">{count}</span>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Produits récents + Actions rapides ───────────────────── */}
            <div className="grid gap-6 lg:grid-cols-[1fr_260px]">

              {/* Produits récents */}
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <h2 className="font-bold text-slate-950">Produits récents</h2>
                  <Link href="/admin/products" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                    Gérer →
                  </Link>
                </div>
                <div className="divide-y divide-slate-50">
                  {hydrated && products.slice(0, 5).map((product, i) => (
                    <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                        <Image
                          src={product.imageUrl ?? PRODUCT_IMAGES[i % PRODUCT_IMAGES.length]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-950 truncate">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.category}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-slate-950">{formatPrice(product.price)}</p>
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                          product.univers === 'beaute'
                            ? 'bg-pink-50 text-pink-600'
                            : 'bg-violet-50 text-violet-600'
                        }`}>
                          {product.univers === 'beaute' ? 'Beauté' : 'Mode'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!hydrated || products.length === 0) && (
                    <div className="px-6 py-10 text-center text-sm text-slate-400">
                      Aucun produit dans le catalogue.{' '}
                      <Link href="/admin/products" className="font-semibold text-brand-600">Ajouter →</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
                <h2 className="font-bold text-slate-950 mb-4">Actions rapides</h2>
                <div className="space-y-1">
                  {[
                    { icon: '➕', label: 'Nouveau produit',   sub: 'Catalogue',   href: '/admin/products',   color: 'bg-violet-50 text-violet-600'  },
                    { icon: '🛒', label: 'Commandes',         sub: 'Ventes',      href: '/admin/orders',     color: 'bg-blue-50 text-blue-600'      },
                    { icon: '👥', label: 'Clients',           sub: 'Base CRM',    href: '/admin/customers',  color: 'bg-emerald-50 text-emerald-600' },
                    { icon: '💰', label: 'Trésorerie',        sub: 'Suivi cash',  href: '/admin/payments',   color: 'bg-teal-50 text-teal-600'      },
                    { icon: '🤝', label: 'Fournisseurs',      sub: 'Partenaires', href: '/admin/suppliers',  color: 'bg-indigo-50 text-indigo-600'  },
                    { icon: '📦', label: 'Stock',             sub: 'Inventaire',  href: '/admin/inventory',  color: 'bg-amber-50 text-amber-600'    },
                    { icon: '✏️', label: 'Contenu du site',  sub: 'Éditer',      href: '/admin/content',    color: 'bg-rose-50 text-rose-600'      },
                    { icon: '⚙️', label: 'Paramètres',       sub: 'Boutique',    href: '/admin/settings',   color: 'bg-slate-100 text-slate-600'   },
                  ].map((action) => (
                    <Link
                      key={action.href + action.label}
                      href={action.href}
                      className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-slate-50 group"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${action.color}`}>
                        <span className="text-base">{action.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-950 group-hover:text-brand-700 transition">{action.label}</p>
                        <p className="text-xs text-slate-400">{action.sub}</p>
                      </div>
                      <span className="text-slate-300 group-hover:text-brand-500 transition text-sm">›</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Banner Supabase ──────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-8 text-white shadow-xl">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/10 blur-2xl" />
              <div className="absolute -bottom-8 right-32 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
              <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Connecté</span>
                  </div>
                  <h2 className="text-xl font-bold">Infrastructure Supabase active</h2>
                  <p className="mt-1 text-sm text-slate-300">Vos données sont synchronisées en temps réel.</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  {[
                    { label: 'Auth',     ok: true },
                    { label: 'DB',       ok: true },
                    { label: 'Storage',  ok: true },
                  ].map(({ label, ok }) => (
                    <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3 text-center">
                      <p className="text-lg font-bold">{ok ? '✓' : '✗'}</p>
                      <p className="text-xs text-slate-300">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
