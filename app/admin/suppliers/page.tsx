'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';

// ── Types ──────────────────────────────────────────────────────────────────────
type TypePaiement = 'cash' | 'acompte' | 'credit' | '';
type ModePaiement = 'wave' | 'orange_money' | 'liquide' | '';

type Fournisseur = {
  id: string;
  nom: string;
  contact_principal?: string; // numéro / nom du contact
  ville?: string;
  pays?: string;
  categorie?: string;
  montant_paiement?: number | null;  // montant total de la marchandise
  montant_verse?: number | null;     // ce qui a déjà été payé
  type_paiement?: TypePaiement;
  mode_paiement?: ModePaiement;
  date_reception?: string | null;    // date de réception de la marchandise
  notes?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
};

type FormData = Omit<Fournisseur, 'id' | 'created_at' | 'updated_at'> & {
  notes_products: string;
  notes_qty: string;
  notes_invoices: string;
};

const emptyForm: FormData = {
  nom: '',
  contact_principal: '',
  ville: '',
  pays: 'Sénégal',
  categorie: '',
  montant_paiement: null,
  montant_verse: null,
  type_paiement: '',
  mode_paiement: '',
  date_reception: null,
  notes: '',
  notes_products: '',
  notes_qty: '',
  notes_invoices: '',
  actif: true,
};

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ── Helpers ────────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  cash:    { label: 'Cash',     color: 'bg-emerald-100 text-emerald-700' },
  acompte: { label: 'Acompte',  color: 'bg-amber-100 text-amber-700' },
  credit:  { label: 'À crédit', color: 'bg-blue-100 text-blue-700' },
};

const MODE_LABELS: Record<string, { label: string; icon: string }> = {
  wave:         { label: 'Wave',         icon: '🌊' },
  orange_money: { label: 'Orange Money', icon: '🟠' },
  liquide:      { label: 'Liquide',      icon: '💵' },
};

function formatMontant(n?: number | null) {
  if (!n && n !== 0) return null;
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
}

function formatDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterActif, setFilterActif] = useState<'all' | 'actif' | 'inactif'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fournisseur | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ── Chargement ──────────────────────────────────────────────────────────────
  const loadSuppliers = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('fournisseurs')
        .select('*')
        .order('nom', { ascending: true });
      if (error) throw error;
      setSuppliers(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSuppliers(); }, [loadSuppliers]);

  // ── Filtres ─────────────────────────────────────────────────────────────────
  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.nom.toLowerCase().includes(q) ||
      (s.contact_principal ?? '').toLowerCase().includes(q) ||
      (s.categorie ?? '').toLowerCase().includes(q) ||
      (s.ville ?? '').toLowerCase().includes(q);
    const matchActif =
      filterActif === 'all' ||
      (filterActif === 'actif' && s.actif !== false) ||
      (filterActif === 'inactif' && s.actif === false);
    return matchSearch && matchActif;
  });

  const totalActifs = suppliers.filter((s) => s.actif !== false).length;
  const totalMontant = suppliers.reduce((sum, s) => sum + (s.montant_paiement ?? 0), 0);

  // ── Sélection ───────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.id)));
  };

  // ── Modal ────────────────────────────────────────────────────────────────────
  const openNew = () => { setEditing(null); setForm(emptyForm); setSaveError(null); setModalOpen(true); };
  const openEdit = (s: Fournisseur) => {
    setEditing(s);
    
    // Extraire les produits fournis, la quantité et les factures du champ notes
    const notesText = s.notes ?? '';
    const productsMatch = notesText.match(/\[Produits fournis\]:\s*([^\n]+)/i);
    const qtyMatch = notesText.match(/\[Quantité\]:\s*([^\n]+)/i);
    const invoicesMatch = notesText.match(/\[Factures\]:\s*([^\n]+)/i);
    
    const productsVal = productsMatch ? productsMatch[1].trim() : '';
    const qtyVal = qtyMatch ? qtyMatch[1].trim() : '';
    const invoicesVal = invoicesMatch ? invoicesMatch[1].trim() : '';
    
    // Nettoyer les notes générales
    const generalNotes = notesText
      .replace(/\[Produits fournis\]:\s*[^\n]+\n?/i, '')
      .replace(/\[Quantité\]:\s*[^\n]+\n?/i, '')
      .replace(/\[Factures\]:\s*[^\n]+\n?/i, '')
      .trim();

    setForm({
      nom: s.nom,
      contact_principal: s.contact_principal ?? '',
      ville: s.ville ?? '',
      pays: s.pays ?? 'Sénégal',
      categorie: s.categorie ?? '',
      montant_paiement: s.montant_paiement ?? null,
      montant_verse: s.montant_verse ?? null,
      type_paiement: s.type_paiement ?? '',
      mode_paiement: s.mode_paiement ?? '',
      date_reception: s.date_reception ?? null,
      notes: generalNotes,
      notes_products: productsVal,
      notes_qty: qtyVal,
      notes_invoices: invoicesVal,
      actif: s.actif !== false,
    });
    setSaveError(null); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); setSaveError(null); };

  // ── Toggle actif ─────────────────────────────────────────────────────────────
  const toggleActif = async (s: Fournisseur) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('fournisseurs').update({ actif: !s.actif }).eq('id', s.id);
      if (error) throw error;
      setSuppliers((prev) => prev.map((f) => f.id === s.id ? { ...f, actif: !s.actif } : f));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur');
    }
  };

  // ── Sauvegarder ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.nom.trim()) { setSaveError('Le nom est obligatoire.'); return; }
    setSaving(true); setSaveError(null);
    try {
      const supabase = createClient();
      
      // Construire le champ notes complet de manière structurée
      let finalNotes = (form.notes || '').trim();
      if (form.notes_products.trim()) {
        finalNotes = finalNotes ? `${finalNotes}\n[Produits fournis]: ${form.notes_products.trim()}` : `[Produits fournis]: ${form.notes_products.trim()}`;
      }
      if (form.notes_qty.trim()) {
        finalNotes = finalNotes ? `${finalNotes}\n[Quantité]: ${form.notes_qty.trim()}` : `[Quantité]: ${form.notes_qty.trim()}`;
      }
      if (form.notes_invoices.trim()) {
        finalNotes = finalNotes ? `${finalNotes}\n[Factures]: ${form.notes_invoices.trim()}` : `[Factures]: ${form.notes_invoices.trim()}`;
      }

      const payload = {
        nom: form.nom.trim(),
        contact_principal: form.contact_principal?.trim() || null,
        ville: form.ville?.trim() || null,
        pays: form.pays?.trim() || 'Sénégal',
        categorie: form.categorie?.trim() || null,
        montant_paiement: form.montant_paiement ?? null,
        montant_verse: form.type_paiement === 'cash' ? null : (form.montant_verse ?? null),
        type_paiement: form.type_paiement || null,
        mode_paiement: form.mode_paiement || null,
        date_reception: form.date_reception || null,
        notes: finalNotes || null,
        actif: form.actif,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase.from('fournisseurs').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('fournisseurs').insert(payload);
        if (error) throw error;
      }
      closeModal(); await loadSuppliers();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
    } finally { setSaving(false); }
  };

  // ── Supprimer ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('fournisseurs').delete().eq('id', id);
      if (error) throw error;
      setDeleteConfirm(null); await loadSuppliers();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Erreur suppression'); }
  };

  const handleBulkDelete = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('fournisseurs').delete().in('id', Array.from(selected));
      if (error) throw error;
      setSelected(new Set()); setBulkDeleteConfirm(false); await loadSuppliers();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Erreur suppression'); }
  };

  // ── Export Excel ─────────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const xlsx = await import('xlsx');
      const data = [
        ['Nom', 'Contact principal', 'Ville', 'Pays', 'Catégorie', 'Produits fournis', 'Quantité', 'Factures', 'Montant total (FCFA)', 'Montant versé (FCFA)', 'Reste à payer (FCFA)', 'Type paiement', 'Mode paiement', 'Date réception', 'Statut', 'Notes'],
        ...filtered.map((s) => {
          const notesText = s.notes ?? '';
          const cleanNotes = notesText
            .replace(/\[Produits fournis\]:\s*[^\n]+/i, '')
            .replace(/\[Quantité\]:\s*[^\n]+/i, '')
            .replace(/\[Factures\]:\s*[^\n]+/i, '')
            .trim();
          const productsMatch = notesText.match(/\[Produits fournis\]:\s*([^\n]+)/i);
          const qtyMatch = notesText.match(/\[Quantité\]:\s*([^\n]+)/i);
          const invoicesMatch = notesText.match(/\[Factures\]:\s*([^\n]+)/i);
          const productsVal = productsMatch ? productsMatch[1].trim() : '';
          const qtyVal = qtyMatch ? qtyMatch[1].trim() : '';
          const invoicesVal = invoicesMatch ? invoicesMatch[1].trim() : '';

          const reste = (s.type_paiement && s.type_paiement !== 'cash' && s.montant_paiement != null)
            ? (s.montant_paiement - (s.montant_verse ?? 0))
            : '';
          return [
            s.nom,
            s.contact_principal ?? '',
            s.ville ?? '',
            s.pays ?? '',
            s.categorie ?? '',
            productsVal,
            qtyVal,
            invoicesVal,
            s.montant_paiement ?? '',
            s.montant_verse ?? '',
            reste,
            s.type_paiement ? TYPE_LABELS[s.type_paiement]?.label ?? s.type_paiement : '',
            s.mode_paiement ? MODE_LABELS[s.mode_paiement]?.label ?? s.mode_paiement : '',
            s.date_reception ? formatDate(s.date_reception) : '',
            s.actif !== false ? 'Actif' : 'Inactif',
            cleanNotes,
          ];
        }),
      ];
      const ws = xlsx.utils.aoa_to_sheet(data);
      ws['!cols'] = [
        { wch: 22 }, { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 16 },
        { wch: 26 }, { wch: 16 }, { wch: 20 },
        { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 16 },
        { wch: 14 }, { wch: 10 }, { wch: 30 },
      ];
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Fournisseurs');
      const date = new Date().toISOString().split('T')[0];
      xlsx.writeFile(wb, `fournisseurs-${date}.xlsx`);
    } catch (e) {
      alert('Erreur export Excel'); console.error(e);
    } finally { setExporting(false); }
  };

  // ── Rendu ───────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10">

        {/* En-tête */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-brand-700 font-semibold">Administration</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Fournisseurs</h1>
            <p className="mt-1 text-slate-500 text-sm">
              {suppliers.length} fournisseur{suppliers.length !== 1 ? 's' : ''} · {totalActifs} actif{totalActifs !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
              ← Tableau de bord
            </Link>
            <button onClick={handleExportExcel} disabled={exporting || filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition">
              {exporting ? 'Export…' : '↓ Excel'}
            </button>
            <button onClick={openNew}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition">
              + Nouveau fournisseur
            </button>
          </div>
        </div>

        {/* Stats */}
        {!loading && suppliers.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total fournisseurs', value: suppliers.length, color: 'text-slate-900' },
              { label: 'Actifs',             value: totalActifs, color: 'text-emerald-700' },
              { label: 'Inactifs',           value: suppliers.length - totalActifs, color: 'text-slate-500' },
              { label: 'Engagements totaux', value: formatMontant(totalMontant) ?? '—', color: 'text-brand-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtres */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input type="search" placeholder="Rechercher par nom, contact, catégorie, ville…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
          <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden">
            {(['all', 'actif', 'inactif'] as const).map((f) => (
              <button key={f} onClick={() => setFilterActif(f)}
                className={`px-4 py-2.5 text-sm font-medium transition ${filterActif === f ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                {f === 'all' ? 'Tous' : f === 'actif' ? 'Actifs' : 'Inactifs'}
              </button>
            ))}
          </div>
          {selected.size > 0 && (
            <button onClick={() => setBulkDeleteConfirm(true)}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition">
              Supprimer ({selected.size})
            </button>
          )}
        </div>

        {!isSupabaseConfigured && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="text-amber-800 font-medium">Supabase non configuré.</p>
          </div>
        )}
        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

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
                {search || filterActif !== 'all' ? 'Aucun fournisseur pour ce filtre.' : 'Aucun fournisseur. Commence par en ajouter un !'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                          onChange={toggleAll} className="rounded" />
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Fournisseur</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden sm:table-cell">Contact principal</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden md:table-cell">Catégorie</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden lg:table-cell">Paiement</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-600">Statut</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((s) => {
                      const typeMeta = s.type_paiement ? TYPE_LABELS[s.type_paiement] : null;
                      const modeMeta = s.mode_paiement ? MODE_LABELS[s.mode_paiement] : null;
                      return (
                        <tr key={s.id}
                          className={`hover:bg-slate-50 transition-colors ${selected.has(s.id) ? 'bg-blue-50' : ''} ${s.actif === false ? 'opacity-60' : ''}`}>
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} className="rounded" />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{s.nom}</p>
                            <div className="flex flex-col gap-0.5">
                              {s.ville && <p className="text-xs text-slate-400">{[s.ville, s.pays].filter(Boolean).join(', ')}</p>}
                              {(() => {
                                const notesText = s.notes ?? '';
                                const productsMatch = notesText.match(/\[Produits fournis\]:\s*([^\n]+)/i);
                                const qtyMatch = notesText.match(/\[Quantité\]:\s*([^\n]+)/i);
                                const invoicesMatch = notesText.match(/\[Factures\]:\s*([^\n]+)/i);
                                const productsVal = productsMatch ? productsMatch[1].trim() : '';
                                const qtyVal = qtyMatch ? qtyMatch[1].trim() : '';
                                const invoicesVal = invoicesMatch ? invoicesMatch[1].trim() : '';
                                const generalNotes = notesText
                                  .replace(/\[Produits fournis\]:\s*[^\n]+\n?/i, '')
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
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            {s.contact_principal ? (
                              <a href={`https://wa.me/${s.contact_principal.replace(/\D/g, '')}`}
                                target="_blank" rel="noreferrer"
                                className="text-emerald-700 hover:underline font-medium">
                                {s.contact_principal}
                              </a>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {s.categorie ? (
                              <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">{s.categorie}</span>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="space-y-1">
                              {s.montant_paiement != null && (
                                <p className="font-semibold text-slate-900">{formatMontant(s.montant_paiement)}</p>
                              )}
                              {/* Reste à payer — uniquement si acompte ou crédit */}
                              {s.type_paiement && s.type_paiement !== 'cash' && s.montant_paiement != null && (
                                <p className="text-xs font-semibold text-rose-600">
                                  Reste : {formatMontant(s.montant_paiement - (s.montant_verse ?? 0))}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {typeMeta && (
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${typeMeta.color}`}>
                                    {typeMeta.label}
                                  </span>
                                )}
                                {modeMeta && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                    {modeMeta.icon} {modeMeta.label}
                                  </span>
                                )}
                              </div>
                              {s.date_reception && (
                                <p className="text-xs text-slate-400">Reçu le {formatDate(s.date_reception)}</p>
                              )}
                              {!s.montant_paiement && !typeMeta && !modeMeta && !s.date_reception && (
                                <span className="text-slate-300">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => toggleActif(s)}
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${
                                s.actif !== false ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}>
                              {s.actif !== false ? 'Actif' : 'Inactif'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEdit(s)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                                Modifier
                              </button>
                              {deleteConfirm === s.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDelete(s.id)}
                                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition">Confirmer</button>
                                  <button onClick={() => setDeleteConfirm(null)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition">Annuler</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(s.id)}
                                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">×</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto">

            {/* Header modal */}
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-white px-8 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-brand-700 font-semibold">
                  {editing ? 'Modification' : 'Nouveau'}
                </p>
                <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                  {editing ? editing.nom : 'Nouveau fournisseur'}
                </h2>
              </div>
              <button onClick={closeModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Fermer">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-8 py-6 space-y-6">

              {/* ── Identité ── */}
              <section>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Identité</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Nom du fournisseur <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      placeholder="Ex : Tissus Dakar SARL"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Catégorie</label>
                      <input type="text" value={form.categorie ?? ''}
                        onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                        placeholder="Tissus, Bijoux, Cosmétiques…"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ville</label>
                      <input type="text" value={form.ville ?? ''}
                        onChange={(e) => setForm({ ...form, ville: e.target.value })}
                        placeholder="Dakar"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
                    </div>
                  </div>
                </div>
              </section>

              <div className="border-t border-slate-100" />

              {/* ── Contact principal ── */}
              <section>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Contact principal</p>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone / WhatsApp</label>
                  <input type="tel" value={form.contact_principal ?? ''}
                    onChange={(e) => setForm({ ...form, contact_principal: e.target.value })}
                    placeholder="+221 77 000 00 00"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
                </div>
              </section>

              <div className="border-t border-slate-100" />

              {/* ── Paiement ── */}
              <section>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Paiement marchandise</p>
                <div className="space-y-5">

                  {/* Montant total */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Montant total de la marchandise (FCFA)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={form.montant_paiement ?? ''}
                        onChange={(e) => setForm({ ...form, montant_paiement: e.target.value ? Number(e.target.value) : null })}
                        placeholder="0"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">FCFA</span>
                    </div>
                    {form.montant_paiement != null && form.montant_paiement > 0 && (
                      <p className="mt-1 text-xs text-slate-500">{formatMontant(form.montant_paiement)}</p>
                    )}
                  </div>

                  {/* Type de paiement */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type de paiement</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'cash',    label: 'Cash',     icon: '💵', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
                        { value: 'acompte', label: 'Acompte',  icon: '📋', color: 'border-amber-300 bg-amber-50 text-amber-800' },
                        { value: 'credit',  label: 'À crédit', icon: '🤝', color: 'border-blue-300 bg-blue-50 text-blue-800' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm({ ...form, type_paiement: form.type_paiement === opt.value ? '' : opt.value as TypePaiement })}
                          className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition
                            ${form.type_paiement === opt.value
                              ? opt.color + ' ring-2 ring-offset-1 ring-slate-400'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          <span>{opt.icon}</span> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode de paiement */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mode de paiement</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'wave',         label: 'Wave',         icon: '🌊', color: 'border-sky-300 bg-sky-50 text-sky-800' },
                        { value: 'orange_money', label: 'Orange Money', icon: '🟠', color: 'border-orange-300 bg-orange-50 text-orange-800' },
                        { value: 'liquide',      label: 'Liquide',      icon: '💵', color: 'border-slate-400 bg-slate-100 text-slate-800' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm({ ...form, mode_paiement: form.mode_paiement === opt.value ? '' : opt.value as ModePaiement })}
                          className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition
                            ${form.mode_paiement === opt.value
                              ? opt.color + ' ring-2 ring-offset-1 ring-slate-400'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          <span>{opt.icon}</span> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Montant versé — uniquement si acompte ou crédit */}
                  {(form.type_paiement === 'acompte' || form.type_paiement === 'credit') && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Montant déjà versé (FCFA)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={form.montant_verse ?? ''}
                          onChange={(e) => setForm({ ...form, montant_verse: e.target.value ? Number(e.target.value) : null })}
                          placeholder="0"
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">FCFA</span>
                      </div>
                      {/* Reste à payer en temps réel */}
                      {form.montant_paiement != null && form.montant_paiement > 0 && (
                        <div className="mt-2 flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 px-4 py-2">
                          <span className="text-sm text-rose-700 font-medium">Reste à payer</span>
                          <span className="text-sm font-bold text-rose-700">
                            {formatMontant(form.montant_paiement - (form.montant_verse ?? 0))}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date de réception */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date de réception de la marchandise</label>
                    <input
                      type="date"
                      value={form.date_reception ?? ''}
                      onChange={(e) => setForm({ ...form, date_reception: e.target.value || null })}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                    />
                  </div>

                  {/* Récap visuel */}
                  {(form.montant_paiement || form.type_paiement || form.mode_paiement || form.date_reception) && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm space-y-2">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Récapitulatif</p>
                      {form.montant_paiement != null && form.montant_paiement > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Montant total</span>
                          <span className="font-bold text-slate-900">{formatMontant(form.montant_paiement)}</span>
                        </div>
                      )}
                      {(form.type_paiement === 'acompte' || form.type_paiement === 'credit') && form.montant_verse != null && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Versé</span>
                          <span className="font-semibold text-emerald-700">{formatMontant(form.montant_verse)}</span>
                        </div>
                      )}
                      {(form.type_paiement === 'acompte' || form.type_paiement === 'credit') && form.montant_paiement != null && (
                        <div className="flex justify-between border-t border-rose-200 pt-2">
                          <span className="font-semibold text-rose-700">Reste à payer</span>
                          <span className="font-bold text-rose-700">{formatMontant(form.montant_paiement - (form.montant_verse ?? 0))}</span>
                        </div>
                      )}
                      {form.type_paiement && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Type</span>
                          <span className={`font-semibold rounded-full px-2 py-0.5 text-xs ${TYPE_LABELS[form.type_paiement]?.color ?? ''}`}>
                            {TYPE_LABELS[form.type_paiement]?.label}
                          </span>
                        </div>
                      )}
                      {form.mode_paiement && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mode</span>
                          <span className="font-medium text-slate-700">
                            {MODE_LABELS[form.mode_paiement]?.icon} {MODE_LABELS[form.mode_paiement]?.label}
                          </span>
                        </div>
                      )}
                      {form.date_reception && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Réception</span>
                          <span className="font-medium text-slate-700">{formatDate(form.date_reception)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              <div className="border-t border-slate-100" />

              {/* ── Notes & Statut ── */}
              <section>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Détails & Notes</p>
                <div className="space-y-4">
                  {/* Produits, Quantité et Factures (3 colonnes) */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Produits fournis</label>
                      <input type="text" value={form.notes_products}
                        onChange={(e) => setForm({ ...form, notes_products: e.target.value })}
                        placeholder="Tissus, etc."
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantité</label>
                      <input type="text" value={form.notes_qty}
                        onChange={(e) => setForm({ ...form, notes_qty: e.target.value })}
                        placeholder="Ex: 50 rouleaux"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Factures</label>
                      <input type="text" value={form.notes_invoices}
                        onChange={(e) => setForm({ ...form, notes_invoices: e.target.value })}
                        placeholder="N° Facture"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes internes</label>
                    <textarea value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2} placeholder="Informations supplémentaires, conditions spéciales…"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none transition" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setForm({ ...form, actif: !form.actif })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.actif ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.actif ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-medium text-slate-700">{form.actif ? 'Fournisseur actif' : 'Fournisseur inactif'}</span>
                  </div>
                </div>
              </section>

              {saveError && (
                <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{saveError}</div>
              )}
            </div>

            {/* Footer modal */}
            <div className="sticky bottom-0 rounded-b-3xl border-t border-slate-100 bg-white px-8 py-5 flex justify-end gap-3">
              <button onClick={closeModal} disabled={saving}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition">
                {saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Ajouter le fournisseur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk delete confirm ──────────────────────────────────────────────── */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl text-center">
            <p className="text-lg font-bold text-slate-900 mb-2">Supprimer {selected.size} fournisseur{selected.size > 1 ? 's' : ''} ?</p>
            <p className="text-sm text-slate-500 mb-6">Cette action est irréversible.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setBulkDeleteConfirm(false)}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Annuler</button>
              <button onClick={handleBulkDelete}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
