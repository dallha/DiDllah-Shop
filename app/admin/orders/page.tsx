'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { createClient } from '@/lib/supabase-client';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatPrice } from '@/lib/data';
import { useShopStore } from '@/lib/shop-store';
import { makeOrderInvoice, openInvoicePrint } from '@/lib/invoice';

type OrderStatus = 'en_attente' | 'en_cours' | 'livre' | 'annule';

type Order = {
  id: string;
  client_name: string;
  client_phone: string;
  products: string;
  total: number;
  status: OrderStatus;
  notes: string;
  created_at: string;
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  en_attente: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: '⏳' },
  en_cours:   { label: 'En cours',   color: 'bg-blue-100 text-blue-700',   icon: '🚚' },
  livre:      { label: 'Livré',      color: 'bg-emerald-100 text-emerald-700', icon: '✅' },
  annule:     { label: 'Annulé',     color: 'bg-rose-100 text-rose-700',   icon: '❌' },
};

const EMPTY_ORDER: Omit<Order, 'id' | 'created_at'> = {
  client_name: '', client_phone: '', products: '', total: 0, status: 'en_attente', notes: '',
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function AdminOrdersPage() {
  const brand = useShopStore((state) => state.brand);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [form, setForm] = useState(EMPTY_ORDER);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  async function loadOrders() {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { void loadOrders(); }, []);

  function openNew() {
    setEditOrder(null);
    setForm(EMPTY_ORDER);
    setShowForm(true);
    setError(null);
  }

  function openEdit(order: Order) {
    setEditOrder(order);
    setForm({ client_name: order.client_name, client_phone: order.client_phone, products: order.products, total: order.total, status: order.status, notes: order.notes });
    setShowForm(true);
    setError(null);
  }

  async function handleSave() {
    if (!form.client_name.trim()) { setError('Le nom du client est requis.'); return; }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    if (editOrder) {
      const { error: err } = await supabase.from('orders').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editOrder.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('orders').insert({ ...form });
      if (err) { setError(err.message); setSaving(false); return; }
    }
    setSaving(false);
    setShowForm(false);
    void loadOrders();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Supprimer cette commande ?')) return;
    const supabase = createClient();
    await supabase.from('orders').delete().eq('id', id);
    void loadOrders();
  }

  async function handleExportExcel() {
    setExporting(true);
    try {
      const xlsx = await import('xlsx');
      const data = [
        ['Date', 'Client', 'Téléphone', 'Produits', 'Total (FCFA)', 'Statut', 'Notes'],
        ...filtered.map((o) => [
          new Date(o.created_at).toLocaleDateString('fr-FR'),
          o.client_name,
          o.client_phone ?? '',
          o.products ?? '',
          o.total ?? 0,
          STATUS_CONFIG[o.status].label,
          o.notes ?? '',
        ]),
        [],
        ['', '', '', 'TOTAL LIVRÉ', totalRevenu, '', ''],
      ];
      const ws = xlsx.utils.aoa_to_sheet(data);
      ws['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 28 }];
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Commandes');
      const date = new Date().toISOString().split('T')[0];
      xlsx.writeFile(wb, `commandes-${date}.xlsx`);
    } catch (e) {
      alert('Erreur lors de l\'export Excel');
      console.error(e);
    } finally { setExporting(false); }
  }

  async function handleStatusChange(id: string, status: OrderStatus) {
    const supabase = createClient();
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  }

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || o.client_name.toLowerCase().includes(q) || o.client_phone.includes(q) || o.products.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    all: orders.length,
    en_attente: orders.filter((o) => o.status === 'en_attente').length,
    en_cours: orders.filter((o) => o.status === 'en_cours').length,
    livre: orders.filter((o) => o.status === 'livre').length,
    annule: orders.filter((o) => o.status === 'annule').length,
  };

  const totalRevenu = orders.filter((o) => o.status === 'livre').reduce((s, o) => s + (o.total || 0), 0);

  const fieldClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

  return (
    <>
      {/* ── Modal formulaire ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-950">{editOrder ? 'Modifier la commande' : 'Nouvelle commande'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-2xl leading-none text-slate-400 hover:text-slate-700">×</button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nom client *</span>
                  <input type="text" value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} className={`mt-1.5 ${fieldClass}`} placeholder="Fatou Diallo" />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Téléphone</span>
                  <input type="tel" value={form.client_phone} onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value }))} className={`mt-1.5 ${fieldClass}`} placeholder="+221 77 000 00 00" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Produits commandés</span>
                <textarea value={form.products} onChange={(e) => setForm((f) => ({ ...f, products: e.target.value }))} rows={2} className={`mt-1.5 ${fieldClass} resize-none`} placeholder="Eau de Parfum Rose × 2, Boubou Bleu × 1" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total (FCFA)</span>
                  <input type="number" value={form.total || ''} onChange={(e) => setForm((f) => ({ ...f, total: Number(e.target.value) }))} className={`mt-1.5 ${fieldClass}`} placeholder="38000" />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Statut</span>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OrderStatus }))} className={`mt-1.5 ${fieldClass}`}>
                    {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes internes</span>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className={`mt-1.5 ${fieldClass} resize-none`} placeholder="Livraison à domicile, appeler avant…" />
              </label>
              {error && <p className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-sm text-rose-700">{error}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Annuler</button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                {saving ? <>…</> : editOrder ? '💾 Enregistrer' : '+ Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
            <AdminSidebar />
            <div className="space-y-6">

              {/* Header */}
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-brand-700">Ventes</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight">Commandes</h1>
                    <p className="mt-1 text-sm text-slate-500">{orders.length} commande{orders.length > 1 ? 's' : ''} au total</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={handleExportExcel} disabled={exporting || filtered.length === 0}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
                      {exporting ? 'Export…' : '↓ Excel'}
                    </button>
                    <button type="button" onClick={openNew} disabled={!isSupabaseConfigured}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                      + Nouvelle commande
                    </button>
                  </div>
                </div>
                {!isSupabaseConfigured && (
                  <p className="mt-3 text-xs text-amber-700">⚠ Supabase non configuré — les commandes ne peuvent pas être sauvegardées.</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'En attente', value: counts.en_attente, color: 'text-amber-700', icon: '⏳' },
                  { label: 'En cours', value: counts.en_cours, color: 'text-blue-700', icon: '🚚' },
                  { label: 'Livrées', value: counts.livre, color: 'text-emerald-700', icon: '✅' },
                  { label: 'Revenu livré', value: formatPrice(totalRevenu), color: 'text-slate-950', icon: '💰' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2"><span className="text-xl">{s.icon}</span><p className="text-xs uppercase tracking-[0.28em] text-slate-500">{s.label}</p></div>
                    <p className={`mt-2 text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Filtres */}
              <div className="flex flex-wrap gap-3">
                <input type="search" placeholder="Rechercher client, produit…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 min-w-[200px] rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none" />
                <div className="flex rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {(['all', 'en_attente', 'en_cours', 'livre', 'annule'] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setFilterStatus(s)}
                      className={`px-3 py-2 text-xs font-medium transition ${filterStatus === s ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {s === 'all' ? `Toutes (${counts.all})` : `${STATUS_CONFIG[s].icon} ${counts[s]}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tableau */}
              <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-10 text-center text-slate-400">Chargement…</div>
                ) : !isSupabaseConfigured ? (
                  <div className="p-10 text-center">
                    <p className="text-slate-500 font-semibold">Supabase non configuré</p>
                    <p className="mt-2 text-sm text-slate-400">Ajoutez les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY, puis créez la table <code className="bg-slate-100 px-1 rounded">orders</code>.</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">Aucune commande trouvée.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          {['Date', 'Client', 'Produits', 'Total', 'Statut', 'Actions'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filtered.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50/60 transition">
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-950">{order.client_name}</p>
                              {order.client_phone && <p className="text-xs text-slate-400">{order.client_phone}</p>}
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              <p className="text-slate-600 text-xs line-clamp-2">{order.products || '—'}</p>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-950 tabular-nums whitespace-nowrap">
                              {order.total ? formatPrice(order.total) : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <select value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 focus:outline-none">
                                {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
                                  <option key={s} value={s}>{STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => openInvoicePrint(makeOrderInvoice(order, brand))}
                                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                                  title="Générer la facture PDF"
                                >
                                  📄 Facture
                                </button>
                                <button type="button" onClick={() => openEdit(order)}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                                  ✏️
                                </button>
                                <button type="button" onClick={() => handleDelete(order.id)}
                                  className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
