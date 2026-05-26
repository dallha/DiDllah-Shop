'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useShopStore, whatsappToHref } from '@/lib/shop-store';
import { formatPrice } from '@/lib/data';

export default function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const totalAmount = useCartStore((state) => state.totalAmount());
  const closeCart = useCartStore((state) => state.closeCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const brandWhatsapp = useShopStore((state) => state.brand.whatsapp);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fermeture au clavier (Echap) + verrouillage du scroll body quand le drawer est ouvert
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, closeCart]);

  const whatsappUrl = useMemo(() => {
    if (items.length === 0) {
      return whatsappToHref(brandWhatsapp);
    }
    const message = `Bonjour DiDallah Shop, je souhaite commander :\n${items
      .map((item) => `• ${item.quantity}× ${item.product.name}`)
      .join('\n')}\nTotal : ${formatPrice(totalAmount)}.`;
    return whatsappToHref(brandWhatsapp, message);
  }, [items, totalAmount, brandWhatsapp]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Votre panier"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md transform flex-col bg-white shadow-2xl transition duration-300 ease-out sm:w-96 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Panier</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">Votre sélection</p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="btn-3d btn-3d-slate px-4 py-2 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Fermer le panier"
          >
            Fermer
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                Votre panier est vide.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{item.product.name}</p>
                      <p className="mt-2 text-sm text-slate-500">{formatPrice(item.product.price)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700 hover:text-brand-900"
                      aria-label={`Retirer ${item.product.name} du panier`}
                    >
                      Suppr.
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="inline-flex h-9 w-9 items-center justify-center btn-3d btn-3d-slate text-white focus:outline-none"
                      aria-label={`Diminuer la quantité de ${item.product.name}`}
                    >
                      −
                    </button>
                    <span
                      className="min-w-[2rem] text-center text-sm font-bold text-slate-900"
                      aria-live="polite"
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="inline-flex h-9 w-9 items-center justify-center btn-3d btn-3d-slate text-white focus:outline-none"
                      aria-label={`Augmenter la quantité de ${item.product.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between rounded-3xl bg-slate-100 px-5 py-4">
              <span className="text-sm text-slate-600">Total</span>
              <span className="text-lg font-semibold text-slate-950">{formatPrice(totalAmount)}</span>
            </div>
            {items.length === 0 ? (
              <button
                type="button"
                disabled
                className="block w-full rounded-full bg-slate-200 px-5 py-4 text-center text-sm font-semibold text-slate-400 cursor-not-allowed"
              >
                Commander via WhatsApp
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="block w-full btn-3d btn-3d-emerald px-5 py-4 text-center text-sm font-semibold text-white focus:outline-none"
              >
                Commander via WhatsApp
              </button>
            )}
            <Link
              href="/catalogue"
              onClick={closeCart}
              className="block text-center btn-3d btn-3d-slate px-5 py-4 text-sm font-semibold text-white w-full focus:outline-none"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </aside>
      {/* ── Modale de confirmation WhatsApp ── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
            aria-hidden="true"
          />

          {/* Carte */}
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
            {/* Icône WhatsApp */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-emerald-600" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>

            <h2 id="confirm-title" className="text-center text-xl font-bold text-slate-950">
              Finaliser via WhatsApp ?
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Vous allez être redirigé vers WhatsApp pour envoyer votre commande directement à DiDallah Shop.
            </p>

            {/* Récap commande */}
            {items.length > 0 && (
              <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>{item.quantity}× {item.product.name}</span>
                    <span className="font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-950">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowConfirm(false)}
                className="flex items-center justify-center gap-2 btn-3d btn-3d-emerald px-6 py-3.5 text-sm font-semibold text-white focus:outline-none"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Oui, envoyer sur WhatsApp
              </Link>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="btn-3d btn-3d-slate px-6 py-3.5 text-sm font-semibold text-white focus:outline-none"
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
