'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { useShopStore } from '@/lib/shop-store';
import { makePaymentReceipt, openInvoicePrint } from '@/lib/invoice';

// ── Types ──────────────────────────────────────────────────────────────────────
type ModePaiement = 'Liquide' | 'Wave' | 'Orange Money';

type Paiement = {
  id: string;
  nom: string;
  date_paiement: string;
  montant_marchandise: number;
  paiement_comptant: number;  // règlement total immédiat
  acompte: number;            // versement partiel initial
  mode_paiement: ModePaiement;
  credit: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

type FormData = {
  nom: string;
  date_paiement: string;
  montant_marchandise: string;
  paiement_comptant: string;
  acompte: string;
  mode_paiement: ModePaiement;
  credit: string;
  notes: string;
  notes_products: string;
  notes_qty: string;
};

const today = () => new Date().toISOString().split('T')[0];

const emptyForm: FormData = {
  nom: '',
  date_paiement: today(),
  montant_marchandise: '',
  paiement_comptant: '',
  acompte: '',
  mode_paiement: 'Liquide',
  credit: '',
  notes: '',
  notes_products: '',
  notes_qty: '',
};

const MODES: ModePaiement[] = ['Liquide', 'Wave', 'Orange Money'];

const MODE_STYLE: Record<ModePaiement, string> = {
  'Liquide':      'bg-slate-100 text-slate-700',
  'Wave':         'bg-blue-100 text-blue-700',
  'Orange Money': 'bg-orange-100 text-orange-700',
};

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const fmt = (n: number) => n.toLocaleString('fr-FR');

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminPaymentsPage() {
  const brand = useShopStore((state) => state.brand);
  const [rows, setRows] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterMode, setFilterMode] = useState<ModePaiement | 'all'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Paiement | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ── Chargement ──────────────────────────────────────────────────────────────
  const loadRows = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('paiements')
        .select('*')
        .order('date_paiement', { ascending: false });
      if (error) throw error;
      setRows(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRows(); }, [loadRows]);

  // ── Filtres ─────────────────────────────────────────────────────────────────
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.nom.toLowerCase().includes(q) || (r.notes ?? '').toLowerCase().includes(q);
    const matchMonth  = filterMonth ? r.date_paiement.startsWith(filterMonth) : true;
    const matchMode   = filterMode === 'all' || r.mode_paiement === filterMode;
    return matchSearch && matchMonth && matchMode;
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalMarchandise = filtered.reduce((s, r) => s + (r.montant_marchandise ?? 0), 0);
  const totalPaiementComptant = filtered.reduce((s, r) => s + (r.paiement_comptant ?? 0), 0);
  const totalAcompte     = filtered.reduce((s, r) => s + (r.acompte ?? 0), 0);
  const totalCredit      = filtered.reduce((s, r) => s + (r.credit ?? 0), 0);
  const totalRecu        = totalPaiementComptant + totalAcompte;
  const solde            = totalRecu - totalMarchandise;

  const months = Array.from(new Set(rows.map((r) => r.date_paiement.slice(0, 7)))).sort().reverse();

  // ── Sélection ───────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };

  // ── Modal ────────────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditing(null); setForm({ ...emptyForm, date_paiement: today() });
    setSaveError(null); setModalOpen(true);
  };
  const openEdit = (r: Paiement) => {
    setEditing(r);
    const notesText = r.notes ?? '';
    const cleanNotes = notesText
      .replace(/\[Marchandise\]:\s*[^\n]+/i, '')
      .replace(/\[Quantité\]:\s*[^\n]+/i, '')
      .trim();

    const productsMatch = notesText.match(/\[Marchandise\]:\s*([^\n]+)/i);
    const qtyMatch = notesText.match(/\[Quantité\]:\s*([^\n]+)/i);

    const productsVal = productsMatch ? productsMatch[1].trim() : '';
    const qtyVal = qtyMatch ? qtyMatch[1].trim() : '';

    setForm({
      nom: r.nom,
      date_paiement: r.date_paiement,
      montant_marchandise: r.montant_marchandise ? String(r.montant_marchandise) : '',
      paiement_comptant: r.paiement_comptant ? String(r.paiement_comptant) : '',
      acompte: r.acompte ? String(r.acompte) : '',
      mode_paiement: r.mode_paiement ?? 'Liquide',
      credit: r.credit ? String(r.credit) : '',
      notes: cleanNotes,
      notes_products: productsVal,
      notes_qty: qtyVal,
    });
    setSaveError(null); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); setSaveError(null); };

  // ── Sauvegarder ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.nom.trim()) { setSaveError('Le nom est obligatoire.'); return; }
    setSaving(true); setSaveError(null);
    try {
      const supabase = createClient();
      // Construire le champ notes complet de manière structurée
      let finalNotes = (form.notes || '').trim();
      if (form.notes_products.trim()) {
        finalNotes = finalNotes ? `${finalNotes}\n[Marchandise]: ${form.notes_products.trim()}` : `[Marchandise]: ${form.notes_products.trim()}`;
      }
      if (form.notes_qty.trim()) {
        finalNotes = finalNotes ? `${finalNotes}\n[Quantité]: ${form.notes_qty.trim()}` : `[Quantité]: ${form.notes_qty.trim()}`;
      }

      const payload = {
        nom: form.nom.trim(),
        date_paiement: form.date_paiement || today(),
        montant_marchandise: parseFloat(form.montant_marchandise) || 0,
        paiement_comptant: parseFloat(form.paiement_comptant) || 0,
        acompte: parseFloat(form.acompte) || 0,
        mode_paiement: form.mode_paiement,
        credit: parseFloat(form.credit) || 0,
        notes: finalNotes || null,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase.from('paiements').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('paiements').insert(payload);
        if (error) throw error;
      }
      closeModal();
      await loadRows();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
    } finally { setSaving(false); }
  };

  // ── Supprimer ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('paiements').delete().eq('id', id);
      if (error) throw error;
      setDeleteConfirm(null); await loadRows();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Erreur suppression'); }
  };

  const handleBulkDelete = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('paiements').delete().in('id', Array.from(selected));
      if (error) throw error;
      setSelected(new Set()); setBulkDeleteConfirm(false); await loadRows();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Erreur suppression'); }
  };

  // ── Export Excel ─────────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const xlsx = await import('xlsx');
      const data = [
        ['Nom', 'Date', 'Marchandise prise', 'Quantité', 'Montant marchandise (FCFA)', 'Paiement comptant (FCFA)', 'Acompte (FCFA)', 'Mode paiement', 'Crédit (FCFA)', 'Notes'],
        ...filtered.map((r) => {
          const notesText = r.notes ?? '';
          const cleanNotes = notesText
            .replace(/\[Marchandise\]:\s*[^\n]+/i, '')
            .replace(/\[Quantité\]:\s*[^\n]+/i, '')
            .trim();
          const productsMatch = notesText.match(/\[Marchandise\]:\s*([^\n]+)/i);
          const qtyMatch = notesText.match(/\[Quantité\]:\s*([^\n]+)/i);
          const productsVal = productsMatch ? productsMatch[1].trim() : '';
          const qtyVal = qtyMatch ? qtyMatch[1].trim() : '';

          return [
            r.nom,
            r.date_paiement,
            productsVal,
            qtyVal,
            r.montant_marchandise ?? 0,
            r.paiement_comptant ?? 0,
            r.acompte ?? 0,
            r.mode_paiement ?? 'Liquide',
            r.credit ?? 0,
            cleanNotes,
          ];
        }),
        [],
        ['TOTAL', '', '', '', totalMarchandise, totalPaiementComptant, totalAcompte, '', totalCredit, ''],
      ];
      const ws = xlsx.utils.aoa_to_sheet(data);
      ws['!cols'] = [
        { wch: 22 }, { wch: 14 }, { wch: 26 }, { wch: 16 }, { wch: 26 },
        { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 30 }
      ];
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Trésorerie');
      const month = filterMonth || today().slice(0, 7);
      xlsx.writeFile(wb, `tresorerie-${month}.xlsx`);
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
            <p className="text-sm uppercase tracking-[0.32em] text-brand-700">Administration</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Suivi de trésorerie</h1>
            <p className="mt-1 text-slate-500 text-sm">{rows.length} entrée{rows.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              ← Tableau de bord
            </Link>
            <button onClick={handleExportExcel} disabled={exporting || filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
              {exporting ? 'Export…' : '↓ Excel'}
            </button>
            <button onClick={openNew}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              + Ajouter
            </button>
          </div>
        </div>

        {/* Stats */}
        {!loading && rows.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total marchandise', value: fmt(totalMarchandise), color: 'text-slate-900', suffix: ' FCFA' },
              { label: 'Total reçu', value: fmt(totalRecu), color: 'text-emerald-700', suffix: ' FCFA' },
              { label: 'Crédit dû',         value: fmt(totalCredit),      color: 'text-rose-600',    suffix: ' FCFA' },
              { label: 'Solde',             value: (solde >= 0 ? '+' : '') + fmt(solde), color: solde >= 0 ? 'text-emerald-700' : 'text-rose-600', suffix: ' FCFA' },
            ].map(({ label, value, color, suffix }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className={`mt-2 text-xl font-bold ${color}`}>{value}<span className="text-xs font-normal text-slate-400">{suffix}</span></p>
              </div>
            ))}
          </div>
        )}

        {/* Filtres */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input type="search" placeholder="Rechercher par nom…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-40 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900" />
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
            <option value="">Tous les mois</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filterMode} onChange={(e) => setFilterMode(e.target.value as ModePaiement | 'all')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
            <option value="all">Tous les modes</option>
            {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {selected.size > 0 && (
            <button onClick={() => setBulkDeleteConfirm(true)}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
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
                {search || filterMonth || filterMode !== 'all' ? 'Aucune entrée pour ce filtre.' : 'Aucune entrée. Commence par en ajouter une !'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Nom</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600 hidden sm:table-cell">Date</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Montant marchandise</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Paiement comptant</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600 hidden lg:table-cell">Acompte</th>
                      <th className="px-4 py-3 text-center font-medium text-slate-600 hidden md:table-cell">Mode</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Crédit</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((r) => (
                      <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${selected.has(r.id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded" />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <div>{r.nom}</div>
                          {(() => {
                            const notesText = r.notes ?? '';
                            const cleanNotes = notesText
                              .replace(/\[Marchandise\]:\s*[^\n]+/i, '')
                              .replace(/\[Quantité\]:\s*[^\n]+/i, '')
                              .trim();
                            const productsMatch = notesText.match(/\[Marchandise\]:\s*([^\n]+)/i);
                            const qtyMatch = notesText.match(/\[Quantité\]:\s*([^\n]+)/i);
                            const productsVal = productsMatch ? productsMatch[1].trim() : '';
                            const qtyVal = qtyMatch ? qtyMatch[1].trim() : '';

                            return (
                              <div className="mt-1 flex flex-wrap gap-1 items-center text-xs font-normal">
                                {productsVal && (
                                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[10px] font-semibold border border-slate-200">
                                    🛍️ {productsVal}
                                  </span>
                                )}
                                {qtyVal && (
                                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 text-amber-700 px-1.5 py-0.5 text-[10px] font-semibold border border-amber-100">
                                    📦 {qtyVal}
                                  </span>
                                )}
                                {cleanNotes && (
                                  <span className="text-slate-400 truncate max-w-[150px] inline-block" title={cleanNotes}>
                                    💬 {cleanNotes}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                          {new Date(r.date_paiement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">{fmt(r.montant_marchandise ?? 0)}</td>
                        <td className="px-4 py-3 text-right text-emerald-700 font-medium">{fmt(r.paiement_comptant ?? 0)}</td>
                        <td className="px-4 py-3 text-right text-emerald-600 hidden lg:table-cell">{fmt(r.acompte ?? 0)}</td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${MODE_STYLE[r.mode_paiement ?? 'Liquide']}`}>
                            {r.mode_paiement ?? 'Liquide'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <span className={r.credit > 0 ? 'text-rose-600' : 'text-slate-400'}>{fmt(r.credit ?? 0)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openInvoicePrint(makePaymentReceipt(r, brand))}
                              className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                              title="Générer le reçu PDF"
                            >
                              📄 Reçu
                            </button>
                            <button onClick={() => openEdit(r)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                              Modifier
                            </button>
                            {deleteConfirm === r.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(r.id)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">Confirmer</button>
                                <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">Annuler</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(r.id)} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">×</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-bold text-slate-700">TOTAL ({filtered.length})</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">{fmt(totalMarchandise)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">{fmt(totalPaiementComptant)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600 hidden lg:table-cell">{fmt(totalAcompte)}</td>
                      <td className="hidden md:table-cell" />
                      <td className="px-4 py-3 text-right text-sm font-bold text-rose-600">{fmt(totalCredit)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto">
            
            {/* Header modal */}
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-white px-8 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-brand-700 font-semibold">
                  {editing ? 'Modification' : 'Nouveau'}
                </p>
                <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                  {editing ? 'Modifier l\'entrée' : 'Nouvelle entrée de trésorerie'}
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

            {/* Formulaire compact en grille */}
            <div className="px-8 py-6 space-y-4">
              
              {/* Infos générales : Nom et Date (2 colonnes) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Nom / Client / Fournisseur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    placeholder="Ex: Client ou Fournisseur"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-slate-50/50 hover:bg-slate-50/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Date du paiement
                  </label>
                  <input
                    type="date"
                    value={form.date_paiement}
                    onChange={(e) => setForm({ ...form, date_paiement: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-slate-50/50 hover:bg-slate-50/20"
                  />
                </div>
              </div>

              {/* Marchandise prise et Quantité (2 colonnes) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Marchandise prise
                  </label>
                  <input
                    type="text"
                    value={form.notes_products}
                    onChange={(e) => setForm({ ...form, notes_products: e.target.value })}
                    placeholder="Ex: Robe en soie, Parfums..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-slate-50/50 hover:bg-slate-50/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Quantité de marchandise
                  </label>
                  <input
                    type="text"
                    value={form.notes_qty}
                    onChange={(e) => setForm({ ...form, notes_qty: e.target.value })}
                    placeholder="Ex: 5 pièces, 2 packs..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-slate-50/50 hover:bg-slate-50/20"
                  />
                </div>
              </div>

              {/* Montants et Mode de paiement (2 colonnes) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Montant Marchandise
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={form.montant_marchandise}
                      onChange={(e) => setForm({ ...form, montant_marchandise: e.target.value })}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-slate-50/50 hover:bg-slate-50/20"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">FCFA</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Mode de paiement
                  </label>
                  <div className="flex gap-1.5 h-[38px]">
                    {MODES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setForm({ ...form, mode_paiement: m })}
                        className={`flex-1 rounded-xl border text-xs font-bold tracking-tight transition ${
                          form.mode_paiement === m
                            ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {m === 'Orange Money' ? 'OM' : m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Règlements : Paiement comptant, Acompte et Crédit (3 colonnes) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Paiement comptant
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={form.paiement_comptant}
                      onChange={(e) => setForm({ ...form, paiement_comptant: e.target.value })}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-slate-50/50 hover:bg-slate-50/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">FCFA</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Acompte
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={form.acompte}
                      onChange={(e) => setForm({ ...form, acompte: e.target.value })}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-slate-50/50 hover:bg-slate-50/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">FCFA</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Crédit dû
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={form.credit}
                      onChange={(e) => setForm({ ...form, credit: e.target.value })}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-slate-50/50 hover:bg-slate-50/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">FCFA</span>
                  </div>
                </div>
              </div>

              {/* Notes et remarques */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Notes & Remarques
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Remarque ou détails additionnels…"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-slate-50/50 hover:bg-slate-50/20"
                />
              </div>

              {saveError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-700 font-medium">
                  {saveError}
                </div>
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
                {saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Ajouter l\'entrée'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk delete confirm ──────────────────────────────────────────────── */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl text-center">
            <p className="text-lg font-bold text-slate-900 mb-2">Supprimer {selected.size} entrée{selected.size > 1 ? 's' : ''} ?</p>
            <p className="text-sm text-slate-500 mb-6">Cette action est irréversible.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setBulkDeleteConfirm(false)} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Annuler</button>
              <button onClick={handleBulkDelete} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
