'use client';

import { useEffect } from 'react';
import { useShopStore } from '@/lib/shop-store';

/**
 * Déclenche la réhydratation du store Zustand persisté au chargement,
 * et synchronise les changements entre onglets via l'événement "storage".
 *
 * Ainsi : une modification faite dans /admin/content s'affiche
 * immédiatement dans l'onglet de la page d'accueil, sans rechargement.
 */
export default function StoreHydrator() {
  useEffect(() => {
    void useShopStore.persist.rehydrate();

    // Sync cross-onglets : si un autre onglet modifie le localStorage,
    // on rehydrate ici pour récupérer les nouvelles valeurs.
    function handleStorage(event: StorageEvent) {
      if (event.key === 'didallah:shop-settings:v1') {
        void useShopStore.persist.rehydrate();
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return null;
}
