'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';

const items = [
  { label: '🏠 Tableau de bord', href: '/admin' },
  { label: '📦 Produits',        href: '/admin/products' },
  { label: '✏️ Contenu du site', href: '/admin/content' },
  { label: '⚙️ Paramètres',      href: '/admin/settings' },
  { label: '🛒 Commandes',       href: '/admin/orders' },
  { label: '👥 Clients',         href: '/admin/customers' },
  { label: '💰 Trésorerie',       href: '/admin/payments' },
  { label: '🤝 Fournisseurs',    href: '/admin/suppliers' },
  { label: '📊 Stock',           href: '/admin/inventory' },
  { label: '🛡️ Équipe & Rôles', href: '/admin/team' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex flex-col rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* En-tête */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white border border-white/20">
            <Image
              src="/logo.png"
              alt="Logo DiDallah"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="font-bold text-white text-sm">DiDallah Shop</p>
            <p className="text-xs text-white/50 uppercase tracking-wider">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Pied — liens rapides + déconnexion */}
      <div className="border-t border-slate-100 p-4 space-y-1">
        <Link
          href="/catalogue"
          target="_blank"
          className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-950 transition"
        >
          🌐 Voir le site public →
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 transition text-left"
        >
          🚪 Se déconnecter
        </button>
      </div>
    </aside>
  );
}
