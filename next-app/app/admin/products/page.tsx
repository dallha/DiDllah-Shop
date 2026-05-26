'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { categories, type Product, type ProductUniverse } from '@/lib/data';
import { useShopStore } from '@/lib/shop-store';
import { saveAllToSupabase } from '@/components/SupabaseSync';

const MAX_IMG_BYTES = 700_000; // 700 Ko — cible après compression
const MAX_DIMENSION = 1400; // px

/** Compresse et redimensionne une image via Canvas. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('READ_FAILED'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return reject(new Error('READ_FAILED'));
      const img = new window.Image();
      img.onerror = () => {
        if (file.size <= MAX_IMG_BYTES) resolve(src);
        else reject(new Error('DECODE_FAILED'));
      };
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width >= height) { height = Math.round((height * MAX_DIMENSION) / width); width = MAX_DIMENSION; }
            else { width = Math.round((width * MAX_DIMENSION) / height); height = MAX_DIMENSION; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            if (file.size <= MAX_IMG_BYTES) return resolve(src);
            return reject(new Error('NO_CANVAS'));
          }
          ctx.drawImage(img, 0, 0, width, height);
          let quality = 0.85;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length * 0.75 > MAX_IMG_BYTES && quality > 0.2) {
            quality -= 0.05;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        } catch {
          if (file.size <= MAX_IMG_BYTES) resolve(src);
          else reject(new Error('CANVAS_ERROR'));
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

const universOptions: Array<{ id: ProductUniverse; label: string }> = [
  { id: 'beaute', label: 'Beauté' },
  { id: 'mode', label: 'Mode' },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminProductsPage() {
  const products      = useShopStore((state) => state.products);
  const siteContent   = useShopStore((state) => state.siteContent);
  const siteImages    = useShopStore((state) => state.siteImages);
  const brand         = useShopStore((state) => state.brand);
  const addProduct    = useShopStore((state) => state.addProduct);
  const updateProduct = useShopStore((state) => state.updateProduct);
  const deleteProduct = useShopStore((state) => state.deleteProduct);

  const customCategories    = useShopStore((state) => state.customCategories);
  const addCustomCategory   = useShopStore((state) => state.addCustomCategory);
  const removeCustomCategory = useShopStore((state) => state.removeCustomCategory);

  // Persister selectedId dans sessionStorage → survit aux rechargements mobiles
  const [selectedId, setSelectedIdRaw] = useState<string | null>(null);
  const setSelectedId = (id: string | null) => {
    setSelectedIdRaw(id);
    if (typeof window !== 'undefined') {
      if (id) sessionStorage.setItem('admin-sel-product', id);
      else sessionStorage.removeItem('admin-sel-product');
    }
  };

  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [imgCompressing, setImgCompressing] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const shortRef   = useRef<HTMLTextAreaElement>(null);
  const longRef    = useRef<HTMLTextAreaElement>(null);

  // Auto-resize d'un textarea selon son contenu
  function autoResize(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  // Re-ajuste les textareas quand on change de produit sélectionné
  useEffect(() => {
    autoResize(shortRef.current);
    autoResize(longRef.current);
  }, [selectedId]);

  // Nouvelle catégorie personnalisée
  const [newCatInput, setNewCatInput] = useState('');
  const [showCatInput, setShowCatInput] = useState(false);

  // Sauvegarde explicite
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Hydratation manuelle du store persisté côté client
    void useShopStore.persist.rehydrate();
    // Restaurer le produit sélectionné depuis sessionStorage (survit aux recharges mobiles)
    const saved = sessionStorage.getItem('admin-sel-product');
    if (saved) setSelectedIdRaw(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!selectedId && products.length > 0) {
      setSelectedId(products[0].id);
    }
  }, [mounted, selectedId, products]);

  // Restaurer les images en attente (cachées dans sessionStorage avant sauvegarde Supabase)
  useEffect(() => {
    if (!mounted || !selectedId) return;
    const product = products.find((p) => p.id === selectedId);
    if (product && !product.imageUrl) {
      const cached = sessionStorage.getItem(`pending-img-${selectedId}`);
      if (cached) {
        updateProduct(selectedId, { imageUrl: cached });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, selectedId]);

  const selectedProduct = products.find((product) => product.id === selectedId) ?? null;

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const query = search.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.id.toLowerCase().includes(query)
        );
      }),
    [products, search]
  );

  const createNew = () => {
    const id = `nouveau-produit-${Date.now()}`;
    const newProduct: Product = {
      id,
      name: 'Nouveau produit',
      univers: 'beaute',
      category: categories.beaute[0]?.id ?? 'Parfumerie',
      price: 0,
      short: '',
      long: '',
      details: [],
    };
    addProduct(newProduct);
    setSelectedId(id);
  };

  const duplicateSelected = () => {
    if (!selectedProduct) return;
    const id = `${slugify(selectedProduct.name)}-${Date.now()}`;
    addProduct({ ...selectedProduct, id, name: `${selectedProduct.name} (copie)` });
    setSelectedId(id);
    setDirty(true);
  };

  const deleteSelected = () => {
    if (!selectedProduct) return;
    if (window.confirm(`Supprimer le produit « ${selectedProduct.name} » ?`)) {
      deleteProduct(selectedProduct.id);
      setSelectedId(null);
      setDirty(true);
    }
  };

  const updateField = (patch: Partial<Product>) => {
    if (!selectedProduct) return;
    updateProduct(selectedProduct.id, patch);
    setDirty(true);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    const result = await saveAllToSupabase(siteContent, siteImages, brand, products);
    setSaving(false);
    if (result.ok) {
      setSaveStatus('success');
      setDirty(false);
      // Nettoyer le cache d'images temporaires après sauvegarde réussie
      products.forEach((p) => sessionStorage.removeItem(`pending-img-${p.id}`));
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  };

  function handleImageFile(file: File) {
    setImgError(null);
    setImgCompressing(true);

    // HEIC/HEIF : format iPhone non supporté
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
      || file.name.toLowerCase().endsWith('.heic')
      || file.name.toLowerCase().endsWith('.heif');
    if (isHeic) {
      setImgCompressing(false);
      setImgError("Format HEIC non supporté. Sur iPhone : Réglages → Appareil photo → Format → « Le plus compatible ».");
      return;
    }

    compressImage(file)
      .then((imgData) => {
        if (!selectedId) return;
        updateField({ imageUrl: imgData });
        try {
          sessionStorage.setItem(`pending-img-${selectedId}`, imgData);
        } catch { /* sessionStorage plein – pas critique */ }
      })
      .catch((err) => {
        const code = err instanceof Error ? err.message : '';
        if (code === 'DECODE_FAILED') {
          setImgError("Le navigateur ne peut pas décoder ce fichier (peut-être HEIC renommé). Sur iPhone : Réglages → Appareil photo → Format → « Le plus compatible ».");
        } else if (code === 'READ_FAILED') {
          setImgError("Impossible de lire le fichier. Vérifie qu'il n'est pas corrompu.");
        } else {
          setImgError("Erreur de compression. Essaie une image JPEG ou PNG plus petite.");
        }
      })
      .finally(() => setImgCompressing(false));
  }

  const currentUnivers = selectedProduct?.univers ?? 'beaute';
  const currentCategories = categories[currentUnivers] ?? [];
  const customCatsForUnivers = customCategories[currentUnivers] ?? [];

  const handleAddCustomCategory = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    addCustomCategory(currentUnivers, trimmed);
    // Sélectionner immédiatement la nouvelle catégorie
    updateField({ category: trimmed });
    setNewCatInput('');
    setShowCatInput(false);
    setDirty(true);
  };

  // Évite tout flash de mismatch avant que le store ne soit hydraté côté client
  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
          <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
            <AdminSidebar />
            <div className="rounded-3xl bg-white p-8 shadow-lg text-slate-500">
              Chargement de l’éditeur de produits…
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
          <AdminSidebar />

          <div className="space-y-8">
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm uppercase tracking-[0.32em] text-brand-700">Catalogue</span>
                    <span className="text-sm text-slate-600">Gérez les produits éditables</span>
                  </div>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Éditeur de produits</h1>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  {/* Bouton Enregistrer */}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !dirty}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition
                      ${saveStatus === 'success' ? 'bg-emerald-600 text-white' :
                        saveStatus === 'error'   ? 'bg-red-600 text-white' :
                        dirty ? 'bg-slate-900 text-white hover:bg-slate-800' :
                        'border border-slate-200 bg-white text-slate-400 cursor-not-allowed'}`}
                  >
                    {saving ? 'Enregistrement…' :
                     saveStatus === 'success' ? '✓ Enregistré' :
                     saveStatus === 'error'   ? '✗ Erreur' :
                     '💾 Enregistrer'}
                  </button>
                  {saveStatus === 'error' && (
                    <p className="text-xs text-red-600">Erreur de sauvegarde. Réessaie.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => { createNew(); setDirty(true); }}
                    className="inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800"
                  >
                    + Nouveau produit
                  </button>
                  <Link
                    href="/admin/settings"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    Paramètres
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_2fr]">
              <section className="rounded-3xl bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">Produits</h2>
                    <p className="text-sm text-slate-600">Rechercher, sélectionner, dupliquer ou supprimer.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {products.length} articles
                  </span>
                </div>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher par nom, catégorie ou ID"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <div className="mt-6 space-y-2 max-h-[560px] overflow-y-auto pb-2">
                  {filteredProducts.map((product) => {
                    const isActive = product.active !== false;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setSelectedId(product.id)}
                        className={`w-full rounded-3xl p-4 text-left transition ${
                          product.id === selectedId
                            ? 'border border-brand-600 bg-brand-50 text-slate-950'
                            : isActive
                            ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            : 'border border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-semibold truncate ${!isActive ? 'line-through' : ''}`}>
                                {product.name}
                              </p>
                              {!isActive && (
                                <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500">
                                  Masqué
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{product.category}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                            {product.univers}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-lg">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">Détails du produit</h2>
                    <p className="text-sm text-slate-600">Modifiez tous les champs visibles sur le site.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* Activer / Désactiver */}
                    {selectedProduct && (
                      <button
                        type="button"
                        onClick={() => updateField({ active: selectedProduct.active === false ? true : false })}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          selectedProduct.active === false
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {selectedProduct.active === false ? '👁 Activer' : '🙈 Désactiver'}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!selectedProduct}
                      onClick={duplicateSelected}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      📋 Dupliquer
                    </button>
                    <button
                      type="button"
                      disabled={!selectedProduct}
                      onClick={deleteSelected}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      🗑 Supprimer
                    </button>
                  </div>
                </div>

                {!selectedProduct ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
                    Sélectionnez un produit à modifier ou créez-en un nouveau.
                  </div>
                ) : (
                  <div className="space-y-6">

                    {/* ── Identité du produit (nom + image + descriptions) ── */}
                    <div className="rounded-3xl border-2 border-brand-100 bg-gradient-to-br from-brand-50/40 to-white p-5 space-y-5">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">
                        ✏️ Identité du produit
                      </p>

                      {/* Nom — grand et proéminent */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-500">Nom du produit</label>
                        <input
                          value={selectedProduct.name}
                          onChange={(e) => updateField({ name: e.target.value })}
                          placeholder="Ex. Eau de Parfum Rose Oud…"
                          className="w-full border-0 border-b-2 border-slate-200 bg-transparent pb-2 text-2xl font-bold text-slate-950 placeholder:text-slate-300 outline-none focus:border-brand-500 transition-colors"
                        />
                      </div>

                      {/* Image — zone de drop large + préview */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-500">Photo du produit</label>
                        <input
                          ref={imgInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageFile(file);
                            e.target.value = '';
                          }}
                        />
                        <div
                          className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition ${
                            selectedProduct.imageUrl
                              ? 'border-transparent'
                              : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/30'
                          }`}
                          onClick={() => imgInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file) handleImageFile(file);
                          }}
                        >
                          {selectedProduct.imageUrl ? (
                            <div className="relative h-44 w-full">
                              <Image
                                src={selectedProduct.imageUrl}
                                alt={selectedProduct.name}
                                fill
                                className="object-cover rounded-2xl"
                                unoptimized
                              />
                              {/* Overlay hover */}
                              <div className="absolute inset-0 flex items-center justify-center gap-3 rounded-2xl bg-slate-950/0 opacity-0 transition-all duration-200 group-hover:bg-slate-950/40 group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); imgInputRef.current?.click(); }}
                                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow hover:bg-slate-100"
                                >
                                  📁 Changer
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); updateField({ imageUrl: undefined }); setImgError(null); if (selectedId) sessionStorage.removeItem(`pending-img-${selectedId}`); }}
                                  className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-700"
                                >
                                  🗑 Supprimer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex h-32 flex-col items-center justify-center gap-2 text-slate-400">
                              {imgCompressing ? (
                                <>
                                  <svg className="h-6 w-6 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                  </svg>
                                  <p className="text-xs font-semibold text-brand-700">Compression en cours…</p>
                                </>
                              ) : (
                                <>
                                  <span className="text-3xl">🖼️</span>
                                  <p className="text-xs font-semibold">Cliquer ou glisser-déposer une image</p>
                                  <p className="text-xs text-slate-300">JPEG, PNG, WebP · compression auto</p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        {imgCompressing && <p className="mt-1.5 text-xs text-brand-600">⏳ Compression en cours…</p>}
                        {imgError && <p className="mt-1.5 text-xs font-medium text-rose-600">{imgError}</p>}
                      </div>

                      {/* Description courte */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-500">
                            Description courte{' '}
                            <span className="font-normal text-slate-400">(cartes produit)</span>
                          </label>
                          <span className={`text-xs font-mono tabular-nums ${
                            selectedProduct.short.length > 120 ? 'text-red-500 font-bold' : 'text-slate-400'
                          }`}>
                            {selectedProduct.short.length}/120
                          </span>
                        </div>
                        <textarea
                          ref={shortRef}
                          rows={2}
                          value={selectedProduct.short}
                          onChange={(e) => { updateField({ short: e.target.value }); autoResize(e.target); }}
                          placeholder="Une accroche courte et percutante…"
                          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition"
                        />
                        {selectedProduct.short.length > 120 && (
                          <p className="mt-1 text-xs text-red-500">⚠ Idéalement moins de 120 caractères.</p>
                        )}
                      </div>

                      {/* Description longue */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-500">
                            Description complète{' '}
                            <span className="font-normal text-slate-400">(fiche produit)</span>
                          </label>
                          <span className="text-xs font-mono tabular-nums text-slate-400">
                            {selectedProduct.long.length} car.
                          </span>
                        </div>
                        <textarea
                          ref={longRef}
                          rows={4}
                          value={selectedProduct.long}
                          onChange={(e) => { updateField({ long: e.target.value }); autoResize(e.target); }}
                          placeholder="Composition, utilisation, bienfaits, matière, taille…"
                          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Univers</span>
                        <select
                          value={selectedProduct.univers}
                          onChange={(e) => updateField({ univers: e.target.value as ProductUniverse })}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        >
                          {universOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      {/* ── Catégorie ────────────────────────────────── */}
                      <div className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Catégorie</span>
                        <select
                          value={selectedProduct.category}
                          onChange={(e) => updateField({ category: e.target.value })}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        >
                          {/* Catégories prédéfinies */}
                          <optgroup label="Catégories standard">
                            {currentCategories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.label}
                              </option>
                            ))}
                          </optgroup>
                          {/* Catégories personnalisées */}
                          {customCatsForUnivers.length > 0 && (
                            <optgroup label="Mes catégories">
                              {customCatsForUnivers.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>

                        {/* Tags des catégories perso + bouton ajout */}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {customCatsForUnivers.map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700"
                            >
                              {cat}
                              <button
                                type="button"
                                onClick={() => {
                                  removeCustomCategory(currentUnivers, cat);
                                  // Si c'était la catégorie sélectionnée, revenir à la première par défaut
                                  if (selectedProduct.category === cat) {
                                    updateField({ category: currentCategories[0]?.id ?? '' });
                                  }
                                  setDirty(true);
                                }}
                                className="ml-0.5 rounded-full text-brand-500 hover:text-red-500 transition"
                                aria-label={`Supprimer ${cat}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <button
                            type="button"
                            onClick={() => setShowCatInput((v) => !v)}
                            className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-500 hover:border-brand-400 hover:text-brand-600 transition"
                          >
                            + Nouvelle catégorie
                          </button>
                        </div>

                        {/* Champ d'ajout de catégorie */}
                        {showCatInput && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              autoFocus
                              value={newCatInput}
                              onChange={(e) => setNewCatInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCategory(); }
                                if (e.key === 'Escape') { setShowCatInput(false); setNewCatInput(''); }
                              }}
                              placeholder="Nom de la catégorie…"
                              className="flex-1 rounded-3xl border border-brand-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-100"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomCategory}
                              disabled={!newCatInput.trim()}
                              className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-40"
                            >
                              Ajouter
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowCatInput(false); setNewCatInput(''); }}
                              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Prix (F CFA)</span>
                        <input
                          type="number"
                          value={selectedProduct.price}
                          onChange={(e) => updateField({ price: Number(e.target.value) || 0 })}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Badge</span>
                        <input
                          value={selectedProduct.tag ?? ''}
                          onChange={(e) => updateField({ tag: e.target.value || undefined })}
                          placeholder="Ex. Bestseller"
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Identifiant URL</span>
                        <input
                          value={selectedProduct.id}
                          disabled
                          className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                        />
                      </label>
                    </div>


                    <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Détails produit</p>
                          <p className="text-sm text-slate-500">Chaque ligne apparaîtra dans la fiche produit.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateField({ details: [...selectedProduct.details, ''] })}
                          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          Ajouter une ligne
                        </button>
                      </div>
                      <div className="space-y-3">
                        {selectedProduct.details.map((detail, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              value={detail}
                              onChange={(e) =>
                                updateField({
                                  details: selectedProduct.details.map((item, itemIndex) =>
                                    itemIndex === index ? e.target.value : item
                                  ),
                                })
                              }
                              placeholder="Ex : 100 ml — Sans alcool"
                              className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateField({
                                  details: selectedProduct.details.filter((_, itemIndex) => itemIndex !== index),
                                })
                              }
                              className="rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                            >
                              Supprimer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
