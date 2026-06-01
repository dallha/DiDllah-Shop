'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useShopStore } from '@/lib/shop-store';
import type { Product } from '@/lib/data';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const products = useShopStore((state) => state.products);

  // Raccourci clavier Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus input à l'ouverture
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Recherche instantanée
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase().trim();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short?.toLowerCase().includes(q) ||
        p.long?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.univers?.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 12));
    setSelectedIndex(0);
  }, [query, products]);

  // Navigation clavier
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        window.location.href = `/catalogue/${results[selectedIndex].id}`;
        setOpen(false);
      }
    },
    [results, selectedIndex]
  );

  // Fermer au clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      {/* Bouton déclencheur */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        aria-label="Rechercher (Cmd+K)"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      </button>

      {/* Overlay modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm">
          <div
            ref={overlayRef}
            className="w-full max-w-xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Barre de recherche */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-slate-400" aria-hidden="true">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher un produit, une catégorie..."
                className="flex-1 bg-transparent border-none outline-none text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span>ESC</span>
              </kbd>
            </div>

            {/* Résultats */}
            {results.length > 0 && (
              <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
                {results.map((product, index) => (
                  <li key={product.id} role="option" aria-selected={index === selectedIndex}>
                    <Link
                      href={`/catalogue/${product.id}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-4 rounded-xl px-4 py-3 transition ${
                        index === selectedIndex
                          ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      {/* Miniature */}
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg">
                            🛍️
                          </div>
                        )}
                      </div>
                      {/* Infos */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {product.category} · {product.univers}
                        </p>
                      </div>
                      {/* Prix */}
                      <p className="shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* État vide */}
            {query.trim() && results.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <span className="text-3xl">🔍</span>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Aucun résultat pour "{query}"
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Essayez avec d'autres termes
                </p>
              </div>
            )}

            {/* Pied de page */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-5 py-3">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {results.length > 0
                  ? `${results.length} résultat${results.length > 1 ? 's' : ''}`
                  : 'Tapez pour rechercher'}
              </p>
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                <span>↑↓ Naviguer</span>
                <span>↵ Ouvrir</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
