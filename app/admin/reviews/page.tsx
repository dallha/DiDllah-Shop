'use client';

import { useState, useEffect } from 'react';
import { useShopStore } from '@/lib/shop-store';
import AdminSidebar from '@/components/AdminSidebar';

export default function ReviewsPage() {
  const reviews = useShopStore((state) => state.reviews);
  const products = useShopStore((state) => state.products);
  const updateReview = useShopStore((state) => state.updateReview);
  const deleteReview = useShopStore((state) => state.deleteReview);

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <AdminSidebar />
          
          <div className="space-y-6">
            <header>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                ⭐ Avis Clients
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Modérez les avis laissés par vos clients avant publication.
              </p>
            </header>

            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Client & Date</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Produit</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Avis</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Statut</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reviews.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          Aucun avis pour le moment.
                        </td>
                      </tr>
                    ) : (
                      reviews.map((review) => {
                        const product = products.find(p => p.id === review.productId);
                        return (
                          <tr key={review.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{review.clientName}</p>
                              <p className="text-xs text-slate-500">{new Date(review.date).toLocaleDateString('fr-FR')}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-block max-w-[150px] truncate font-medium text-slate-700" title={product?.name}>
                                {product?.name || 'Produit inconnu'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex text-amber-400 mb-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'fill-slate-200'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <p className="text-xs text-slate-600 max-w-xs whitespace-normal line-clamp-2" title={review.comment}>
                                {review.comment}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              {review.status === 'pending' ? (
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                  En attente
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                  Approuvé
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {review.status === 'pending' && (
                                <button
                                  onClick={() => updateReview(review.id, { status: 'approved' })}
                                  className="text-emerald-600 hover:text-emerald-800 font-medium text-xs px-3 py-1 rounded bg-emerald-50 hover:bg-emerald-100 transition"
                                >
                                  Approuver
                                </button>
                              )}
                              <button
                                onClick={() => deleteReview(review.id)}
                                className="text-rose-500 hover:text-rose-700 font-medium text-xs px-3 py-1 rounded bg-rose-50 hover:bg-rose-100 transition"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
