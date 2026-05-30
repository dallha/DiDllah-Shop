'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { formatPrice } from '@/lib/data';

type Order = {
  id: string;
  created_at: string;
  total: number;
  status: string;
  products: string;
};

export default function ComptePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.is_anonymous) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      const { data: userOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      setOrders(userOrders || []);
      setLoading(false);
    }
    
    loadData();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Chargement de l'espace client...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header Espace Client */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mon Compte</h1>
            <p className="mt-1 text-slate-500">Connecté en tant que <span className="font-semibold text-slate-900">{user?.email}</span></p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition shadow-sm"
          >
            Se déconnecter
          </button>
        </div>

        {/* Historique des Commandes */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Historique des commandes</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-4xl mb-4">🛒</p>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Aucune commande</h3>
              <p className="text-slate-500">Vous n'avez pas encore passé de commande.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <p className="text-sm text-slate-500">Commande passée le</p>
                      <p className="font-semibold text-slate-900">{new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm text-slate-500">Statut</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        order.status === 'en_attente' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'expediée' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status === 'en_attente' ? 'En attente' : order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Produits :</p>
                    <pre className="text-sm text-slate-600 font-sans whitespace-pre-wrap">{order.products}</pre>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="font-semibold text-slate-900">Total payé</span>
                    <span className="text-xl font-bold text-brand-600">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
