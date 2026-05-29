'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

type AdminRole = {
  user_id: string;
  role: 'super_admin' | 'logistician' | 'editor';
  created_at: string;
};

export default function TeamClient() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<'logistician' | 'editor'>('logistician');
  const [adding, setAdding] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from('admin_roles').select('*').order('created_at', { ascending: true });
    if (data) setRoles(data as AdminRole[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) return;
    setAdding(true);
    const supabase = createClient();
    
    // On doit associer ce rôle à l'ID de l'utilisateur qui l'a approuvé
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('admin_roles').insert({
      user_id: newUserId.trim(),
      role: newRole,
      approved_by: user?.id
    });

    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      setNewUserId('');
      fetchRoles();
    }
    setAdding(false);
  };

  const handleRemoveRole = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir révoquer cet accès ?")) return;
    const supabase = createClient();
    const { error } = await supabase.from('admin_roles').delete().eq('user_id', userId);
    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      fetchRoles();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/10 blur-2xl" />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">Sécurité & RBAC</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Équipe & Rôles</h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Gérez les accès de vos collaborateurs. Le rôle <strong>Logisticien</strong> a accès aux commandes (sans les prix des produits), tandis que l'<strong>Éditeur</strong> peut modifier le catalogue (sans voir les commandes).
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* ── Liste des membres ── */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-950">Membres de l'équipe</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">Chargement...</div>
            ) : roles.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">Aucun collaborateur trouvé.</div>
            ) : (
              roles.map((r) => (
                <div key={r.user_id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <span className="text-sm font-bold text-slate-600">
                      {r.role === 'super_admin' ? '👑' : r.role === 'logistician' ? '📦' : '✏️'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-950 font-mono truncate">{r.user_id}</p>
                    <p className="text-xs text-slate-500 capitalize">{r.role.replace('_', ' ')}</p>
                  </div>
                  {r.role !== 'super_admin' && (
                    <button
                      onClick={() => handleRemoveRole(r.user_id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                    >
                      Révoquer
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Formulaire d'ajout ── */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 h-fit">
          <h2 className="font-bold text-slate-950 mb-5">Ajouter un collaborateur</h2>
          <form onSubmit={handleAddRole} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">UUID de l'utilisateur</label>
              <input
                type="text"
                required
                placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono"
              />
              <p className="mt-1 text-[10px] text-slate-400">Le collaborateur doit d'abord se créer un compte client classique pour générer cet identifiant.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle à assigner</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="logistician">Logisticien (Accès commandes)</option>
                <option value="editor">Éditeur (Accès catalogue)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {adding ? 'Attribution...' : 'Autoriser l\'accès'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
