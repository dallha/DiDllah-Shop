'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useShopStore } from '@/lib/shop-store';
import { makeOrderInvoice, fmtPrice } from '@/lib/invoice';

type Order = {
  id: string;
  client_name: string;
  client_phone?: string;
  products: string;
  total: number;
  status: string;
  notes?: string;
  created_at: string;
};

function invoiceNum(id: string): string {
  return 'FAC-' + id.replace(/-/g, '').slice(-8).toUpperCase();
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

const STATUS: Record<string, { label: string; icon: string; color: string }> = {
  en_attente: { label: 'En attente',  icon: '⏳', color: 'bg-amber-100 text-amber-700' },
  en_cours:   { label: 'En cours',    icon: '🚚', color: 'bg-blue-100 text-blue-700'   },
  livre:      { label: 'Livré',       icon: '✅', color: 'bg-emerald-100 text-emerald-700' },
  annule:     { label: 'Annulé',      icon: '❌', color: 'bg-rose-100 text-rose-700'   },
};

export default function FactureClient({ order }: { order: Order }) {
  const brand = useShopStore((state) => state.brand);
  const num   = invoiceNum(order.id);
  const date  = fmtDate(order.created_at);
  const cfg   = STATUS[order.status] ?? { label: order.status, icon: '📦', color: 'bg-slate-100 text-slate-700' };

  // Hydrate le store pour avoir les infos brand
  useEffect(() => {
    void useShopStore.persist.rehydrate();
  }, []);

  function handlePrint() {
    const html = makeOrderInvoice(order, brand);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('Autorisez les pop-ups pour imprimer.'); return; }
    win.document.write(html);
    win.document.close();
    win.addEventListener('load', () => setTimeout(() => win.print(), 300));
  }

  const lines = (order.products || '').split('\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* Barre d'actions */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/catalogue" className="text-sm font-medium text-slate-600 hover:text-slate-950">
            ← Retour au catalogue
          </Link>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              🖨️ Imprimer / Sauvegarder PDF
            </button>
          </div>
        </div>
      </div>

      {/* Corps de la facture */}
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
        <div className="rounded-3xl bg-white shadow-lg overflow-hidden">

          {/* En-tête */}
          <div className="flex items-start justify-between bg-slate-950 px-8 py-8 text-white">
            <div>
              <p className="text-2xl font-bold tracking-tight">{brand.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Beauté & Mode · Dakar</p>
              <div className="mt-4 text-sm text-slate-400 leading-6">
                {brand.address && <p>📍 {brand.address}</p>}
                {brand.whatsapp && <p>📱 {brand.whatsapp}</p>}
                {brand.email && <p>✉ {brand.email}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Facture</p>
              <p className="mt-1 text-lg font-bold font-mono">{num}</p>
              <p className="mt-1 text-sm text-slate-400">{date}</p>
            </div>
          </div>

          <div className="px-8 py-8 space-y-8">

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">Vendeur</p>
                <p className="font-semibold text-slate-950">{brand.name}</p>
                <p className="text-sm text-slate-500 mt-1">Dakar, Sénégal</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">Client</p>
                <p className="font-semibold text-slate-950">{order.client_name}</p>
                {order.client_phone && <p className="text-sm text-slate-500 mt-1">{order.client_phone}</p>}
              </div>
            </div>

            {/* Statut */}
            <div>
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </span>
            </div>

            {/* Produits */}
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-950">
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Désignation</th>
                    <th className="pb-3 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.length > 0 ? lines.map((line, i) => {
                    const priceMatch = line.match(/(\d[\d\s]*)\s*FCFA/i);
                    const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, ''), 10) : null;
                    const name  = line.replace(/[\d\s]*FCFA/gi, '').replace(/-/g, '').trim();
                    return (
                      <tr key={i}>
                        <td className="py-3 text-slate-700">{name || line}</td>
                        <td className="py-3 text-right font-semibold text-slate-950">
                          {price != null ? fmtPrice(price) : '—'}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td className="py-3 text-slate-600">{order.products || 'Commande DiDallah Shop'}</td>
                      <td className="py-3 text-right font-semibold text-slate-950">{fmtPrice(order.total)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-950">
                    <td className="pt-4 text-base font-bold text-slate-950">Total</td>
                    <td className="pt-4 text-right text-xl font-bold text-slate-950">{fmtPrice(order.total ?? 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-700 mb-1">Notes</p>
                <p className="text-sm text-amber-900">{order.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-slate-100 pt-6 text-center">
              <p className="text-sm font-semibold text-slate-950">{brand.name}</p>
              <p className="mt-1 text-xs text-slate-400">
                Merci pour votre confiance ! Ce document fait foi de votre commande.
              </p>
              {brand.whatsapp && (
                <p className="mt-2 text-xs text-slate-400">
                  Une question ? WhatsApp : {brand.whatsapp}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
