'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';

// ── Types ──────────────────────────────────────────────────────────────────────
type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  notes?: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
};

type FormData = Omit<Customer, 'id' | 'created_at' | 'updated_at'> & {
  notes_products: string;
  notes_qty: string;
  notes_invoices: string;
};

const emptyForm: FormData = {
  name: '',
  phone: '',
  email: '',
  city: '',
  notes: '',
  notes_products: '',
  notes_qty: '',
  notes_invoices: '',
  total_orders: 0,
  total_spent: 0,
};

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ── Composant principal ────────────────────────────────────────────────────────
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recherche & filtres
  const [search, setSearch] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Export
  const [exporting, setExporting] = useState(false);

  // Sélection multiple
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // ── Chargement ──────────────────────────────────────────────────────────────
  const loadCustomers = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCustomers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCustomers(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // ── Filtres ─────────────────────────────────────────────────────────────────
  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.city ?? '').toLowerCase().includes(q)
    );
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalSpent = customers.reduce((s, c) => s + (c.total_spent ?? 0), 0);
  const totalOrders = customers.reduce((s, c) => s + (c.total_orders ?? 0), 0);
  const avgSpent = customers.length ? Math.round(totalSpent / customers.length) : 0;

  // ── Sélection ───────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setSaveError(null);
    setModalOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    
    // Extraire les produits pris, la quantité et les factures du champ notes
    const notesText = c.notes ?? '';
    const productsMatch = notesText.match(/\[Produits pris\]:\s*([^\n]+)/i);
    const qtyMatch = notesText.match(/\[Quantité\]:\s*([^\n]+)/i);
    const invoicesMatch = notesText.match(/\[Factures\]:\s*([^\n]+)/i);
    
    const productsVal = productsMatch ? productsMatch[1].trim() : '';
    const qtyVal = qtyMatch ? qtyMatch[1].trim() : '';
    const invoicesVal = invoicesMatch ? invoicesMatch[1].trim() : '';
    
    // Nettoyer les notes générales
    const generalNotes = notesText
      .replace(/\[Produits pris\]:\s*[^\n]+\n?/i, '')
      .replace(/\[Quantité\]:\s*[^\n]+\n?/i, '')
      .replace(/\[Factures\]:\s*[^\n]+\n?/i, '')
      .trim();

    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email ?? '',
      city: c.city ?? '',
      notes: generalNotes,
      notes_products: productsVal,
      notes_qty: qtyVal,
      notes_invoices: invoicesVal,
      total_orders: c.total_orders,
      total_spent: c.total_spent,
    });
    setSaveError(null);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setSaveError(null);
  };

  // ── Sauvegarder ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setSaveError('Le nom et le téléphone sont obligatoires.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const supabase = createClient();
      
      // Construire le champ notes complet de manière structurée
      let finalNotes = (form.notes || '').trim();
      if (form.notes_products.trim()) {
        finalNotes = finalNotes ? `${finalNotes}\n[Produits pris]: ${form.notes_products.trim()}` : `[Produits pris]: ${form.notes_products.trim()}`;
      }
      if (form.notes_qty.trim()) {
        finalNotes = finalNotes ? `${finalNotes}\n[Quantité]: ${form.notes_qty.trim()}` : `[Quantité]: ${form.notes_qty.trim()}`;
      }
      if (form.notes_invoices.trim()) {
        finalNotes = finalNotes ? `${finalNotes}\n[Factures]: ${form.notes_invoices.trim()}` : `[Factures]: ${form.notes_invoices.trim()}`;
      }

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || null,
        city: form.city?.trim() || null,
        notes: finalNotes || null,
        total_orders: Number(form.total_orders) || 0,
        total_spent: Number(form.total_spent) || 0,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase
          .from('customers')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('customers').insert(payload);
        if (error) throw error;
      }
      closeModal();
      await loadCustomers();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // ── Supprimer ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      setDeleteConfirm(null);
      await loadCustomers();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const xlsx = await import('xlsx');
      const data = [
        ['Nom', 'Téléphone', 'Email', 'Ville', 'Produits pris', 'Quantité', 'Factures', 'Commandes', 'Total dépensé (FCFA)', 'Notes'],
        ...filtered.map((c) => {
          const notesText = c.notes ?? '';
          const cleanNotes = notesText
            .replace(/\[Produits pris\]:\s*[^\n]+/i, '')
            .replace(/\[Quantité\]:\s*[^\n]+/i, '')
            .replace(/\[Factures\]:\s*[^\n]+/i, '')
            .trim();
          const productsMatch = notesText.match(/\[Produits pris\]:\s*([^\n]+)/i);
          const qtyMatch = notesText.match(/\[Quantité\]:\s*([^\n]+)/i);
          const invoicesMatch = notesText.match(/\[Factures\]:\s*([^\n]+)/i);
          const productsVal = productsMatch ? productsMatch[1].trim() : '';
          const qtyVal = qtyMatch ? qtyMatch[1].trim() : '';
          const invoicesVal = invoicesMatch ? invoicesMatch[1].trim() : '';

          return [
            c.name,
            c.phone,
            c.email ?? '',
            c.city ?? '',
            productsVal,
            qtyVal,
            invoicesVal,
            c.total_orders ?? 0,
            c.total_spent ?? 0,
            cleanNotes,
          ];
        }),
        [],
        ['TOTAL', '', '', '', '', '', '', totalOrders, totalSpent, ''],
      ];
      const ws = xlsx.utils.aoa_to_sheet(data);
      ws['!cols'] = [
        { wch: 22 }, { wch: 18 }, { wch: 26 }, { wch: 16 }, { wch: 26 },
        { wch: 16 }, { wch: 20 }, { wch: 12 }, { wch: 22 }, { wch: 28 }
      ];
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Clients');
      const date = new Date().toISOString().split('T')[0];
      xlsx.writeFile(wb, `clients-${date}.xlsx`);
    } catch (e) {
      alert('Erreur lors de l\'export Excel');
      console.error(e);
    } finally { setExporting(false); }
  };

  const handleBulkDelete = async () => {
    try {
      const supabase = createClient();
      const ids = Array.from(selected);
      const { error } = await supabase.from('customers').delete().in('id', ids);
      if (error) throw error;
      setSelected(new Set());
      setBulkDeleteConfirm(false);
      await loadCustomers();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    }
  };

  // ── Rendu ───────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10">

        {/* En-tête */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-brand-700">Administration</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Clients</h1>
            <p className="mt-1 text-slate-500 text-sm">
              {customers.length} client{customers.length !== 1 ? 's' : ''} enregistré{customers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ← Tableau de bord
            </Link>
            <button
              onClick={handleExportExcel}
              disabled={exporting || filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
            >
              {exporting ? 'Export…' : '↓ Excel'}
            </button>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              + Nouveau client
            </button>
          </div>
        </div>

        {/* Stats */}
        {!loading && customers.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total clients', value: customers.length, suffix: '' },
              { label: 'Commandes passées', value: totalOrders, suffix: '' },
              { label: 'CA total', value: totalSpent.toLocaleString('fr-FR'), suffix: ' FCFA' },
              { label: 'Panier moyen', value: avgSpent.toLocaleString('fr-FR'), suffix: ' FCFA' },
            ].map(({ label, value, suffix }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{value}{suffix}</p>
              </div>
            ))}
          </div>
        )}

        {/* Barre de recherche + actions bulk */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Rechercher par nom, téléphone, email, ville…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {selected.size > 0 && (
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Supprimer ({selected.size})
            </button>
          )}
        </div>

        {/* Pas de Supabase */}
        {!isSupabaseConfigured && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="text-amber-800 font-medium">Supabase non configuré.</p>
            <p className="mt-1 text-sm text-amber-700">Ajoute les variables d'environnement pour activer cette page.</p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Chargement */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>
        )}

        {/* Tableau */}
        {!loading && isSupabaseConfigured && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                {search ? 'Aucun client trouvé pour cette recherche.' : 'Aucun client enregistré. Commence par en ajouter un !'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left w-10">
                        <input
                          type="checkbox"
                          checked={selected.size === filtered.length && filtered.length > 0}
                          onChange={toggleAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Nom</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Téléphone</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600 hidden md:table-cell">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600 hidden lg:table-cell">Ville</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Commandes</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Total dépensé</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-50 transition-colors ${selected.has(c.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(c.id)}
                            onChange={() => toggleSelect(c.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          {(() => {
                            const notesText = c.notes ?? '';
                            const productsMatch = notesText.match(/\[Produits pris\]:\s*([^\n]+)/i);
                            const qtyMatch = notesText.match(/\[Quantité\]:\s*([^\n]+)/i);
                            const invoicesMatch = notesText.match(/\[Factures\]:\s*([^\n]+)/i);
                            const productsVal = productsMatch ? productsMatch[1].trim() : '';
                            const qtyVal = qtyMatch ? qtyMatch[1].trim() : '';
                            const invoicesVal = invoicesMatch ? invoicesMatch[1].trim() : '';
                            const generalNotes = notesText
                              .replace(/\[Produits pris\]:\s*[^\n]+\n?/i, '')
                              .replace(/\[Quantité\]:\s*[^\n]+\n?/i, '')
                              .replace(/\[Factures\]:\s*[^\n]+\n?/i, '')
                              .trim();

                            return (
                              <>
                                {(productsVal || qtyVal || invoicesVal) && (
                                  <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                                    {productsVal && (
                                      <span className="inline-flex rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700 border border-amber-100">
                                        🛍️ {productsVal}
                                      </span>
                                    )}
                                    {qtyVal && (
                                      <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700 border border-emerald-100">
                                        📦 {qtyVal}
                                      </span>
                                    )}
                                    {invoicesVal && (
                                      <span className="inline-flex rounded bg-sky-50 px-1.5 py-0.5 font-medium text-sky-700 border border-sky-100">
                                        📄 {invoicesVal}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {generalNotes && (
                                  <p className="mt-0.5 text-xs text-slate-400 font-normal truncate max-w-[200px]" title={generalNotes}>
                                    {generalNotes}
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-700 hover:underline"
                          >
                            {c.phone}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                          {c.email ? (
                            <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                          {c.city || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">{c.total_orders}</td>
                        <td className="px-4 py-3 text-right text-slate-700 font-medium">
                          {(c.total_spent ?? 0).toLocaleString('fr-FR')} <span className="text-xs text-slate-400">FCFA</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(c)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Modifier
                            </button>
                            {deleteConfirm === c.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(c.id)}
                                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                                >
                                  Confirmer
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                                >
                                  Annuler
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(c.id)}
                                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Supprimer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Modal Nouveau / Modifier ─────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editing ? 'Modifier le client' : 'Nouveau client'}
            </h2>

            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Mamadou Diallo"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Ex: +221 77 123 45 67"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Email + Ville (2 colonnes) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="client@exemple.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Ex: Dakar"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Commandes + Total dépensé */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nb. commandes</label>
                  <input
                    type="number"
                    min={0}
                    value={form.total_orders}
                    onChange={(e) => setForm({ ...form, total_orders: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total dépensé (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.total_spent}
                    onChange={(e) => setForm({ ...form, total_spent: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Produits pris + Quantité + Factures (3 colonnes) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Produits pris</label>
                  <input
                    type="text"
                    value={form.notes_products}
                    onChange={(e) => setForm({ ...form, notes_products: e.target.value })}
                    placeholder="Ex: Robes"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantité</label>
                  <input
                    type="text"
                    value={form.notes_qty}
                    onChange={(e) => setForm({ ...form, notes_qty: e.target.value })}
                    placeholder="Ex: 5"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Factures</label>
                  <input
                    type="text"
                    value={form.notes_invoices}
                    onChange={(e) => setForm({ ...form, notes_invoices: e.target.value })}
                    placeholder="N° Facture"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes générales</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Informations supplémentaires…"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>

              {/* Erreur */}
              {saveError && (
                <p className="text-sm text-red-600">{saveError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Ajouter le client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation suppression bulk ───────────────────────────────────── */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl text-center">
            <p className="text-lg font-bold text-slate-900 mb-2">Supprimer {selected.size} client{selected.size > 1 ? 's' : ''} ?</p>
            <p className="text-sm text-slate-500 mb-6">Cette action est irréversible.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleBulkDelete}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
