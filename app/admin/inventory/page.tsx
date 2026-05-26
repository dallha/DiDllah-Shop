'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { useShopStore } from '@/lib/shop-store';
import { useHydrated } from '@/lib/use-hydrated';
import { formatPrice, type Product } from '@/lib/data';
import { createClient } from '@/lib/supabase-client';
import { isSupabaseConfigured } from '@/lib/supabase';

type SortKey = 'name' | 'price' | 'univers' | 'category';
type SortDir = 'asc' | 'desc';

type ImportPreviewRow = {
  rowNum: number;
  id: string;
  name: string;
  univers: string;
  category: string;
  price: number;
  tag: string;
  short: string;
  long: string;
  details: string;
  imageUrl: string;
  isUpdate: boolean; // true si le produit existe déjà
  error?: string;
};

type ImportResult = { inserted: number; errors: string[] };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().slice(0, 10); }

// ─── Modèle Excel ─────────────────────────────────────────────────────────────
async function downloadTemplate() {
  const XLSX = await import('xlsx');
  const cols = ['id','name','univers','category','price','tag','short','long','details','image_url'];
  const examples = [
    ['parfum-femme-rose','Eau de Parfum Rose','beaute','Parfumerie',38000,'Nouveau','Fragrance florale douce.','Description longue ici…','Notes de rose · Fond ambré',''],
    ['boubou-femme-bleu','Grand Boubou Bleu','mode','Boubous',65000,'Signature','Broderie main, tissu wax.','Description longue ici…','Broderie main · Wax premium',''],
  ];
  const ws = XLSX.utils.aoa_to_sheet([cols, ...examples]);
  ws['!cols'] = [{wch:28},{wch:36},{wch:10},{wch:18},{wch:12},{wch:12},{wch:40},{wch:60},{wch:50},{wch:40}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Produits');
  const guide = XLSX.utils.aoa_to_sheet([
    ['Colonne','Description','Exemple','Obligatoire'],
    ['id','Identifiant unique (slug)','parfum-rose','Oui'],
    ['name','Nom du produit','Eau de Parfum Rose','Oui'],
    ['univers','beaute ou mode','beaute','Oui'],
    ['category','Catégorie libre','Parfumerie','Oui'],
    ['price','Prix en FCFA (entier)','38000','Oui'],
    ['tag','Étiquette courte','Nouveau','Non'],
    ['short','Description courte (1-2 phrases)','Fragrance florale…','Oui'],
    ['long','Description longue (paragraphe)','Un parfum…','Oui'],
    ['details','Points forts séparés par ·','Note rose · Fond boisé','Non'],
    ['image_url','URL image (laisser vide sinon)','https://…','Non'],
  ]);
  guide['!cols'] = [{wch:14},{wch:44},{wch:28},{wch:12}];
  XLSX.utils.book_append_sheet(wb, guide, 'Guide');
  XLSX.writeFile(wb, 'DiDallah_Modele_Produits.xlsx');
}

// ─── Export Excel ─────────────────────────────────────────────────────────────
async function exportExcel(rows: Product[]) {
  const XLSX = await import('xlsx');
  const data = [
    ['id','name','univers','category','price','tag','short','long','details','image_url'],
    ...rows.map((r) => [r.id,r.name,r.univers,r.category,r.price,r.tag??'',r.short,r.long,r.details.join(' · '),r.imageUrl??'']),
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{wch:28},{wch:36},{wch:10},{wch:18},{wch:12},{wch:12},{wch:40},{wch:60},{wch:50},{wch:40}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Produits');
  XLSX.writeFile(wb, `DiDallah_Inventaire_${today()}.xlsx`);
}

// ─── Export PDF ───────────────────────────────────────────────────────────────
async function exportPdf(rows: Product[]) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFontSize(18); doc.setTextColor(15,23,42);
  doc.text('DiDallah Shop — Inventaire produits', 14, 18);
  doc.setFontSize(10); doc.setTextColor(100,116,139);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})} · ${rows.length} produit${rows.length>1?'s':''}`, 14, 26);
  autoTable(doc, {
    startY: 32,
    head: [['Nom','Univers','Catégorie','Prix','Tag','Description','Détails']],
    body: rows.map((r) => [r.name, r.univers==='beaute'?'Beauté':'Mode', r.category, formatPrice(r.price), r.tag??'—', r.short, r.details.slice(0,3).join(', ')]),
    styles: { fontSize:8, cellPadding:3 },
    headStyles: { fillColor:[15,23,42], textColor:255, fontStyle:'bold' },
    alternateRowStyles: { fillColor:[248,250,252] },
    columnStyles: {0:{cellWidth:42},1:{cellWidth:18},2:{cellWidth:22},3:{cellWidth:24,halign:'right'},4:{cellWidth:16},5:{cellWidth:55},6:{cellWidth:'auto'}},
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i=1;i<=pageCount;i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(148,163,184);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pw=(doc as any).internal.pageSize.width; const ph=(doc as any).internal.pageSize.height;
    doc.text(`Page ${i} / ${pageCount}`, pw-20, ph-8, {align:'right'});
    doc.text('DiDallah Shop — Dakar, Sénégal', 14, ph-8);
  }
  doc.save(`DiDallah_Inventaire_${today()}.pdf`);
}

// ─── Parsing Excel → aperçu ───────────────────────────────────────────────────
async function parseExcelPreview(file: File, existingIds: Set<string>): Promise<ImportPreviewRow[]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  return rows.map((row, i) => {
    const rowNum = i + 2;
    const id = String(row['id'] ?? '').trim();
    const name = String(row['name'] ?? '').trim();
    const univers = String(row['univers'] ?? '').trim().toLowerCase();
    const category = String(row['category'] ?? '').trim();
    const price = Number(row['price']);
    const errors: string[] = [];
    if (!id) errors.push('id manquant');
    if (!name) errors.push('name manquant');
    if (!['beaute','mode'].includes(univers)) errors.push(`univers "${univers}" invalide`);
    if (!category) errors.push('category manquant');
    if (!price || isNaN(price)) errors.push('price invalide');
    return {
      rowNum, id, name,
      univers,
      category,
      price: isNaN(price) ? 0 : price,
      tag: String(row['tag'] ?? '').trim(),
      short: String(row['short'] ?? '').trim(),
      long: String(row['long'] ?? '').trim(),
      details: String(row['details'] ?? '').trim(),
      imageUrl: String(row['image_url'] ?? '').trim(),
      isUpdate: existingIds.has(id),
      error: errors.length > 0 ? errors.join(', ') : undefined,
    };
  });
}

// ─── Import confirmé → Supabase ───────────────────────────────────────────────
async function confirmImport(rows: ImportPreviewRow[]): Promise<ImportResult> {
  const supabase = createClient();
  const result: ImportResult = { inserted: 0, errors: [] };
  const validRows = rows.filter((r) => !r.error);
  for (const row of validRows) {
    const details = row.details ? row.details.split(/[·|,]/).map((s) => s.trim()).filter(Boolean) : [];
    const { error } = await supabase.from('products').upsert({
      id: row.id, name: row.name, univers: row.univers, category: row.category,
      price: row.price, tag: row.tag || null, short: row.short, long: row.long || '',
      details, image_url: row.imageUrl || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) result.errors.push(`${row.id} : ${error.message}`);
    else result.inserted++;
  }
  return result;
}

// ─── Badge univers ─────────────────────────────────────────────────────────────
function UniversBadge({ univers }: { univers: string }) {
  return univers === 'beaute'
    ? <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">✨ Beauté</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">👗 Mode</span>;
}

// ─── Modal aperçu import ──────────────────────────────────────────────────────
function ImportPreviewModal({
  rows, onConfirm, onCancel, loading,
}: {
  rows: ImportPreviewRow[];
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const validCount = rows.filter((r) => !r.error).length;
  const errorCount = rows.filter((r) => !!r.error).length;
  const updateCount = rows.filter((r) => !r.error && r.isUpdate).length;
  const newCount = rows.filter((r) => !r.error && !r.isUpdate).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Aperçu avant import</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              <span className="text-emerald-700 font-semibold">{newCount} nouveau{newCount>1?'x':''}</span>
              {' · '}
              <span className="text-amber-700 font-semibold">{updateCount} mise{updateCount>1?'s':''} à jour</span>
              {errorCount > 0 && <>{' · '}<span className="text-rose-700 font-semibold">{errorCount} erreur{errorCount>1?'s':''} (ignorées)</span></>}
            </p>
          </div>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
        </div>

        {/* Tableau */}
        <div className="overflow-auto flex-1 px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Ligne</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Statut</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nom</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Univers</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Prix</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Erreur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => (
                <tr key={row.rowNum} className={row.error ? 'bg-rose-50/50' : ''}>
                  <td className="px-3 py-2 text-xs text-slate-400 font-mono">{row.rowNum}</td>
                  <td className="px-3 py-2">
                    {row.error ? (
                      <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">Erreur</span>
                    ) : row.isUpdate ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Mise à jour</span>
                    ) : (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Nouveau</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500 max-w-[120px] truncate">{row.id || '—'}</td>
                  <td className="px-3 py-2 font-medium text-slate-900 max-w-[160px] truncate">{row.name || '—'}</td>
                  <td className="px-3 py-2">{row.univers ? <UniversBadge univers={row.univers} /> : '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-900">{row.price ? formatPrice(row.price) : '—'}</td>
                  <td className="px-3 py-2 text-xs text-rose-600">{row.error ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-sm text-slate-500">
            {validCount === 0
              ? 'Aucun produit valide à importer.'
              : `${validCount} produit${validCount>1?'s':''} seront importés dans Supabase.`}
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} disabled={loading}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              Annuler
            </button>
            <button type="button" onClick={onConfirm} disabled={loading || validCount === 0}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {loading ? (
                <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Import…</>
              ) : `✓ Confirmer l'import (${validCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminInventoryPage() {
  const products = useShopStore((state) => state.products);
  const deleteProduct = useShopStore((state) => state.deleteProduct);
  const updateProduct = useShopStore((state) => state.updateProduct);
  const setProducts = useShopStore((state) => state.setProducts);
  const hydrated = useHydrated();

  const [search, setSearch] = useState('');
  const [filterUnivers, setFilterUnivers] = useState<'all' | 'beaute' | 'mode'>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState<'excel' | 'pdf' | 'template' | null>(null);

  // Import
  const importInputRef = useRef<HTMLInputElement>(null);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const filtered = useMemo(() => {
    if (!hydrated) return [];
    const q = search.toLowerCase();
    return products
      .filter((p) => {
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.short.toLowerCase().includes(q) || (p.tag ?? '').toLowerCase().includes(q);
        const matchUnivers = filterUnivers === 'all' || p.univers === filterUnivers;
        const isActive = p.active !== false;
        const matchActive = filterActive === 'all' || (filterActive === 'active' ? isActive : !isActive);
        return matchSearch && matchUnivers && matchActive;
      })
      .sort((a, b) => {
        const va = (a[sortKey] ?? '') as string | number;
        const vb = (b[sortKey] ?? '') as string | number;
        const na = typeof va === 'string' ? va.toLowerCase() : va;
        const nb = typeof vb === 'string' ? vb.toLowerCase() : vb;
        if (na < nb) return sortDir === 'asc' ? -1 : 1;
        if (na > nb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [hydrated, products, search, filterUnivers, filterActive, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  // ── Sélection multiple ────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  }

  function bulkDelete() {
    if (selected.size === 0) return;
    if (!window.confirm(`Supprimer ${selected.size} produit${selected.size > 1 ? 's' : ''} ? Cette action est irréversible.`)) return;
    selected.forEach((id) => deleteProduct(id));
    setSelected(new Set());
  }

  function bulkToggleActive(active: boolean) {
    selected.forEach((id) => updateProduct(id, { active }));
    setSelected(new Set());
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  async function handleExcelExport() {
    setExporting('excel');
    try { await exportExcel(filtered); } catch { alert('Erreur export Excel.'); } finally { setExporting(null); }
  }
  async function handlePdfExport() {
    setExporting('pdf');
    try { await exportPdf(filtered); } catch { alert('Erreur export PDF.'); } finally { setExporting(null); }
  }
  async function handleDownloadTemplate() {
    setExporting('template');
    try { await downloadTemplate(); } catch { alert('Erreur génération modèle.'); } finally { setExporting(null); }
  }

  // ── Import ──────────────────────────────────────────────────────────────────
  async function handleFileChange(file: File) {
    setImportResult(null);
    const existingIds = new Set(products.map((p) => p.id));
    const rows = await parseExcelPreview(file, existingIds);
    setPreviewRows(rows);
  }

  async function handleConfirmImport() {
    if (!previewRows) return;
    setImporting(true);
    const result = await confirmImport(previewRows);
    setImporting(false);
    setPreviewRows(null);
    setImportResult(result);

    // Si des produits ont été importés avec succès, recharger le store
    if (result.inserted > 0) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('products').select('*');
        if (data && !error) {
          const loadedProducts = data.map((row) => ({
            id: row.id,
            name: row.name,
            univers: row.univers,
            category: row.category,
            price: Number(row.price) || 0,
            tag: row.tag || undefined,
            short: row.short || '',
            long: row.long || '',
            details: Array.isArray(row.details) ? row.details : [],
            imageUrl: row.image_url || undefined,
            active: row.active !== false,
          })) as Product[];
          setProducts(loadedProducts);
        }
      } catch (e) {
        console.warn('Erreur lors du rafraîchissement des produits :', e);
      }
    }
  }

  const totalValeur = filtered.reduce((sum, p) => sum + p.price, 0);
  const activeCount = filtered.filter((p) => p.active !== false).length;
  const inactiveCount = filtered.filter((p) => p.active === false).length;

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="text-brand-600 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <>
      {/* Modal aperçu import */}
      {previewRows && (
        <ImportPreviewModal
          rows={previewRows}
          onConfirm={handleConfirmImport}
          onCancel={() => setPreviewRows(null)}
          loading={importing}
        />
      )}

      <main className="min-h-screen bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
            <AdminSidebar />

            <div className="space-y-6">
              {/* ── Header ── */}
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-brand-700">Stock</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight">Inventaire produits</h1>
                    <p className="mt-1 text-sm text-slate-500">{hydrated ? `${products.length} produits au total` : 'Chargement…'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={handleExcelExport} disabled={exporting !== null || !hydrated}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50">
                      {exporting === 'excel' ? '…' : '📊'} Excel
                    </button>
                    <button type="button" onClick={handlePdfExport} disabled={exporting !== null || !hydrated}
                      className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50">
                      {exporting === 'pdf' ? '…' : '📄'} PDF
                    </button>
                    <Link href="/admin/products"
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                      ✏️ Gérer
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── Import ── */}
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.32em] text-brand-700 mb-4">Import depuis Excel</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <p className="font-semibold text-slate-950 mb-1">① Télécharger le modèle</p>
                    <p className="text-sm text-slate-500 mb-4">Fichier Excel avec colonnes prêtes + guide intégré.</p>
                    <button type="button" onClick={handleDownloadTemplate} disabled={exporting === 'template'}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                      {exporting === 'template'
                        ? <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Génération…</>
                        : <>⬇️ DiDallah_Modele_Produits.xlsx</>}
                    </button>
                  </div>
                  <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/30 p-5">
                    <p className="font-semibold text-slate-950 mb-1">② Importer dans Supabase</p>
                    <p className="text-sm text-slate-500 mb-4">Un aperçu s&apos;affiche avant la confirmation.</p>
                    <input ref={importInputRef} type="file" accept=".xlsx,.xls" className="sr-only"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f); e.target.value = ''; }} />
                    <button type="button" onClick={() => importInputRef.current?.click()}
                      disabled={!isSupabaseConfigured}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow hover:from-brand-700 hover:to-brand-800 disabled:opacity-50">
                      ⬆️ Choisir un fichier Excel
                    </button>
                    {!isSupabaseConfigured && <p className="mt-2 text-xs text-amber-700">⚠ Supabase non configuré.</p>}
                  </div>
                </div>
                {importResult && (
                  <div className={`mt-4 rounded-2xl border p-4 ${importResult.errors.length === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                    <p className={`font-semibold text-sm ${importResult.errors.length === 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {importResult.errors.length === 0
                        ? `✓ ${importResult.inserted} produit${importResult.inserted>1?'s':''} importé${importResult.inserted>1?'s':''} avec succès.`
                        : `⚠ ${importResult.inserted} importés · ${importResult.errors.length} erreur${importResult.errors.length>1?'s':''}.`}
                    </p>
                    {importResult.errors.map((e, i) => <p key={i} className="text-xs text-amber-700 mt-1">• {e}</p>)}
                  </div>
                )}
              </div>

              {/* ── Stats ── */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Affichés', value: hydrated ? filtered.length : '—', icon: '📦' },
                  { label: 'Actifs', value: hydrated ? activeCount : '—', icon: '✅' },
                  { label: 'Masqués', value: hydrated ? inactiveCount : '—', icon: '🙈' },
                  { label: 'Valeur', value: hydrated ? formatPrice(totalValeur) : '—', icon: '💰' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2"><span className="text-xl">{s.icon}</span><p className="text-xs uppercase tracking-[0.28em] text-slate-500">{s.label}</p></div>
                    <p className="mt-2 text-xl font-bold tabular-nums">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* ── Filtres + actions groupées ── */}
              <div className="flex flex-wrap gap-3 items-center">
                <input type="search" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 min-w-[160px] rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none" />
                <div className="flex rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {(['all','beaute','mode'] as const).map((u) => (
                    <button key={u} type="button" onClick={() => setFilterUnivers(u)}
                      className={`px-3 py-2 text-xs font-medium transition ${filterUnivers===u?'bg-slate-900 text-white':'text-slate-600 hover:bg-slate-50'}`}>
                      {u==='all'?'Tous':u==='beaute'?'✨ Beauté':'👗 Mode'}
                    </button>
                  ))}
                </div>
                <div className="flex rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {(['all','active','inactive'] as const).map((a) => (
                    <button key={a} type="button" onClick={() => setFilterActive(a)}
                      className={`px-3 py-2 text-xs font-medium transition ${filterActive===a?'bg-slate-900 text-white':'text-slate-600 hover:bg-slate-50'}`}>
                      {a==='all'?'Tous statuts':a==='active'?'✅ Actifs':'🙈 Masqués'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Barre d'actions groupées ── */}
              {selected.size > 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
                  <span className="text-sm font-semibold text-brand-800">{selected.size} sélectionné{selected.size>1?'s':''}</span>
                  <div className="flex flex-wrap gap-2 ml-auto">
                    <button type="button" onClick={() => bulkToggleActive(true)}
                      className="rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                      ✅ Activer
                    </button>
                    <button type="button" onClick={() => bulkToggleActive(false)}
                      className="rounded-full border border-amber-200 bg-white px-4 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                      🙈 Désactiver
                    </button>
                    <button type="button" onClick={bulkDelete}
                      className="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                      🗑 Supprimer
                    </button>
                    <button type="button" onClick={() => setSelected(new Set())}
                      className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* ── Tableau ── */}
              <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                {!hydrated ? (
                  <div className="p-10 text-center text-slate-400">Chargement…</div>
                ) : filtered.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">Aucun produit trouvé.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          {/* Checkbox tout sélectionner */}
                          <th className="px-4 py-3 w-10">
                            <input type="checkbox"
                              checked={filtered.length > 0 && selected.size === filtered.length}
                              onChange={toggleSelectAll}
                              className="h-4 w-4 rounded border-slate-300 accent-slate-900 cursor-pointer" />
                          </th>
                          <th className="px-4 py-3 text-left">
                            <button type="button" onClick={() => toggleSort('name')}
                              className="flex items-center font-semibold uppercase tracking-[0.28em] text-xs text-slate-500 hover:text-slate-800">
                              Produit <SortIcon k="name" />
                            </button>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <button type="button" onClick={() => toggleSort('univers')}
                              className="flex items-center font-semibold uppercase tracking-[0.28em] text-xs text-slate-500 hover:text-slate-800">
                              Univers <SortIcon k="univers" />
                            </button>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <button type="button" onClick={() => toggleSort('category')}
                              className="flex items-center font-semibold uppercase tracking-[0.28em] text-xs text-slate-500 hover:text-slate-800">
                              Catégorie <SortIcon k="category" />
                            </button>
                          </th>
                          <th className="px-4 py-3 text-right">
                            <button type="button" onClick={() => toggleSort('price')}
                              className="flex items-center justify-end w-full font-semibold uppercase tracking-[0.28em] text-xs text-slate-500 hover:text-slate-800">
                              Prix <SortIcon k="price" />
                            </button>
                          </th>
                          <th className="px-4 py-3 text-center font-semibold uppercase tracking-[0.28em] text-xs text-slate-500">Statut</th>
                          <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.28em] text-xs text-slate-500">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filtered.map((product) => {
                          const isActive = product.active !== false;
                          return (
                            <tr key={product.id} className={`transition ${selected.has(product.id) ? 'bg-brand-50/40' : 'hover:bg-slate-50/60'} ${!isActive ? 'opacity-60' : ''}`}>
                              <td className="px-4 py-3">
                                <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleSelect(product.id)}
                                  className="h-4 w-4 rounded border-slate-300 accent-slate-900 cursor-pointer" />
                              </td>
                              <td className="px-4 py-3">
                                <p className={`font-semibold text-slate-950 ${!isActive ? 'line-through' : ''}`}>{product.name}</p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{product.id}</p>
                              </td>
                              <td className="px-4 py-3"><UniversBadge univers={product.univers} /></td>
                              <td className="px-4 py-3 text-slate-600">{product.category}</td>
                              <td className="px-4 py-3 text-right font-semibold text-slate-950 tabular-nums whitespace-nowrap">{formatPrice(product.price)}</td>
                              <td className="px-4 py-3 text-center">
                                <button type="button" onClick={() => updateProduct(product.id, { active: !isActive })}
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                  {isActive ? '✅ Actif' : '🙈 Masqué'}
                                </button>
                              </td>
                              <td className="px-4 py-3 max-w-[180px]">
                                <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{product.short}</p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <p className="text-xs text-center text-slate-400">
                {selected.size > 0
                  ? `${selected.size} produit${selected.size>1?'s':''} sélectionné${selected.size>1?'s':''} · utilisez la barre d'actions ci-dessus.`
                  : `${hydrated ? filtered.length : '—'} produits affichés.`}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
