'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function AdminRealtimeToast() {
  const [newOrder, setNewOrder] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // S'abonne aux insertions sur la table orders
    const channel = supabase
      .channel('admin-orders-pulse')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Nouvelle commande détectée (Realtime) !', payload);
          setNewOrder(payload.new);
          
          // Petit son discret pour alerter l'équipe logistique
          try {
            const audio = new Audio('/ding.mp3'); // Assurez-vous d'avoir ce fichier dans public/
            audio.play();
          } catch(e) {
             // Ignorer les erreurs d'autoplay
          }
          
          // Fait disparaître le toast après 5 secondes
          setTimeout(() => setNewOrder(null), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!newOrder) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-4 rounded-xl shadow-soft flex items-start gap-4 animate-in slide-in-from-bottom-5">
      <div className="h-2 w-2 mt-1.5 bg-green-500 rounded-full animate-pulse"></div>
      <div>
        <h4 className="font-semibold text-sm">Nouvelle Commande</h4>
        <p className="text-xs text-slate-300">
          {newOrder.client_name} vient d'acheter pour {newOrder.total} FCFA
        </p>
      </div>
    </div>
  );
}
