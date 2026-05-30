'use client';

import { useState, useEffect } from 'react';
import { useShopStore } from '@/lib/shop-store';
import { PromoCode } from '@/lib/data';
import AdminSidebar from '@/components/AdminSidebar';

export default function PromoPage() {
  const promoCodes = useShopStore((state) => state.promoCodes);
  const addPromoCode = useShopStore((state) => state.addPromoCode);
  const updatePromoCode = useShopStore((state) => state.updatePromoCode);
  const deletePromoCode = useShopStore((state) => state.deletePromoCode);

  const [mounted, setMounted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newValue, setNewValue] = useState(10);

  useEffect(() => setMounted(true), []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || newValue <= 0) return;
    
    addPromoCode({
      id: Math.random().toString(36).substring(2, 9),
      code: newCode.trim().toUpperCase(),
      discountType: newType,
      discountValue: newValue,
      active: true,
    });
    
    setNewCode('');
    setNewValue(10);
    setIsAdding(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <AdminSidebar />
          
          <div className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  🎟️ Codes Promo
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Créez des réductions pour vos clients.
                </p>
              </div>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                {isAdding ? 'Annuler' : '+ Nouveau Code'}
              </button>
            </header>

            {isAdding && (
              <form onSubmit={handleAdd} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Créer un code promo</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      required
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      placeholder="Ex: EID2025"
                      className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus:border-brand-500 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus:border-brand-500 focus:ring-brand-500"
                    >
                      <option value="percentage">Pourcentage (%)</option>
                      <option value="fixed">Montant fixe (FCFA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Valeur
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newValue}
                      onChange={(e) => setNewValue(Number(e.target.value))}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus:border-brand-500 focus:ring-brand-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="rounded-xl bg-brand-900 px-5 py-2 text-sm font-bold text-white hover:bg-brand-800 transition">
                    Créer le code
                  </button>
                </div>
              </form>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Code</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Réduction</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Statut</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {promoCodes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          Aucun code promo créé.
                        </td>
                      </tr>
                    ) : (
                      promoCodes.map((promo) => (
                        <tr key={promo.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-bold text-slate-900 font-mono tracking-wider">
                            {promo.code}
                          </td>
                          <td className="px-6 py-4 font-medium text-brand-600">
                            {promo.discountType === 'percentage' ? `-${promo.discountValue}%` : `-${promo.discountValue.toLocaleString('fr-FR')} FCFA`}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => updatePromoCode(promo.id, { active: !promo.active })}
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                                promo.active
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {promo.active ? 'Actif' : 'Inactif'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deletePromoCode(promo.id)}
                              className="text-rose-500 hover:text-rose-700 font-medium text-xs px-3 py-1 rounded bg-rose-50 hover:bg-rose-100 transition"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
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
