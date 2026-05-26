'use client';
/**
 * useHydrated — retourne true quand le store Zustand a fini de lire
 * le localStorage. Utilise le champ _hydrated du store lui-même,
 * mis à jour dans onRehydrateStorage de façon réactive.
 */
import { useShopStore } from './shop-store';

export function useHydrated(): boolean {
  return useShopStore((state) => state._hydrated);
}
