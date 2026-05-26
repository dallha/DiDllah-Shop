'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useShopStore, whatsappToHref } from '@/lib/shop-store';
import { Product, formatPrice } from '@/lib/data';
import Badge from '@/components/ui/Badge';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const brandWhatsapp = useShopStore((state) => state.brand.whatsapp);
  const [showConfirm, setShowConfirm] = useState(false);

  const waMessage = `Bonjour DiDallah Shop, je souhaite commander :\n• ${product.name}\nPrix : ${formatPrice(product.price)}`;
  const waUrl = whatsappToHref(brandWhatsapp, waMessage);

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
        <Link href={`/catalogue/${product.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label={`Voir ${product.name}`}>
          <div className="bg-brand-100/10 p-8 text-brand-900">
            <div className="relative mb-6 h-56 overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_top_left,_rgba(79,126,162,0.18),_transparent_40%)]">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-end justify-end p-4">
                  <span className="text-xs uppercase tracking-[0.3em] text-brand-700/40">
                    Photo à venir
                  </span>
                </div>
              )}
              {/* Overlay gradient au hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="brand">{product.tag ?? 'Premium'}</Badge>
                <span className="text-xs uppercase tracking-[0.28em] text-slate-400">{product.category}</span>
              </div>
              <h3 className="text-2xl font-semibold leading-tight text-slate-950 group-hover:text-brand-700 transition-colors duration-300">{product.name}</h3>
              <p className="text-sm leading-6 text-slate-500">{product.short}</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-8 py-5">
            <span className="text-lg font-semibold text-slate-900">{formatPrice(product.price)}</span>
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 group-hover:tracking-[0.35em] transition-all duration-300">Voir →</span>
          </div>
        </Link>

        {/* Boutons d'action */}
        <div className="flex items-center gap-3 p-6 pt-0">
          {/* Commander via WhatsApp — bouton principal 3D */}
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="flex flex-1 items-center justify-center gap-2 btn-3d btn-3d-emerald px-5 py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all duration-200 hover:scale-[1.02]"
            aria-label={`Commander ${product.name} via WhatsApp`}
          >
            {/* Icône WhatsApp */}
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white shrink-0" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Commander
          </button>

          {/* Ajouter au panier — icône 3D */}
          <button
            type="button"
            onClick={() => addItem(product)}
            className="flex h-12 w-12 shrink-0 items-center justify-center btn-3d btn-3d-slate focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-all duration-200 hover:scale-110"
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </button>
        </div>
      </article>


      {/* ── Modale de confirmation WhatsApp ── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl">

            {/* Icône */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-emerald-600" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>

            <h2 className="text-center text-lg font-bold text-slate-950">Commander via WhatsApp ?</h2>
            <p className="mt-1 text-center text-sm text-slate-500">
              Vous allez être redirigé vers WhatsApp pour finaliser votre commande.
            </p>

            {/* Récap produit */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
              <p className="mt-0.5 text-sm font-bold text-emerald-700">{formatPrice(product.price)}</p>
            </div>

            {/* Boutons */}
            <div className="mt-5 flex flex-col gap-2.5">
              <Link
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowConfirm(false)}
                className="flex items-center justify-center gap-2 btn-3d btn-3d-emerald px-6 py-3.5 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Oui, commander sur WhatsApp
              </Link>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="btn-3d btn-3d-slate px-6 py-3.5 text-sm font-semibold focus:outline-none"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
