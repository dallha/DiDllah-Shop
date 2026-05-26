import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  shop as defaultShop,
  products as defaultProducts,
  defaultSiteContent,
  defaultSiteImages,
  type Product,
  type ProductUniverse,
  type SiteContent,
  type SiteImages,
} from './data';

export type ShopSettings = {
  name: string;
  tagline: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  tiktok?: string;
  facebook?: string;
  /** Liens de navigation personnalisables (header) */
  navLinks?: { label: string; href: string }[];
};

// Ré-exporte le type pour les composants qui l'importent depuis shop-store
export type { ProductUniverse };

type ShopState = {
  /** Devient true une fois que Zustand a fini de lire le localStorage */
  _hydrated: boolean;
  brand: ShopSettings;
  products: Product[];
  siteContent: SiteContent;
  siteImages: SiteImages;
  /** Catégories personnalisées par univers (complètent les catégories prédéfinies) */
  customCategories: Record<string, string[]>;
  setBrand: (patch: Partial<ShopSettings>) => void;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setSiteContent: (patch: Partial<SiteContent>) => void;
  setSiteContentDeep: (updater: (current: SiteContent) => SiteContent) => void;
  resetSiteContent: () => void;
  setSiteImages: (patch: Partial<SiteImages>) => void;
  resetSiteImages: () => void;
  addCustomCategory: (univers: string, category: string) => void;
  removeCustomCategory: (univers: string, category: string) => void;
  reset: () => void;
};

const DEFAULT_BRAND: ShopSettings = {
  ...defaultShop,
  tiktok: '@didallah.shop',
  facebook: 'fb.com/didallah.shop',
};

const DEFAULT_CUSTOM_CATEGORIES: Record<string, string[]> = { beaute: [], mode: [] };

// Deep-merge utilitaire pour fusionner les valeurs persistées avec les
// nouveaux champs par défaut quand le schéma SiteContent évolue.
export function deepMerge<T>(base: T, patch: unknown): T {
  if (Array.isArray(base)) return base;
  if (typeof base !== 'object' || base === null) return base;
  if (typeof patch !== 'object' || patch === null) return base;
  const result = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(base as Record<string, unknown>)) {
    const baseValue = (base as Record<string, unknown>)[key];
    const patchValue = (patch as Record<string, unknown>)[key];
    if (patchValue === undefined) continue;
    if (
      typeof baseValue === 'object' &&
      baseValue !== null &&
      !Array.isArray(baseValue) &&
      typeof patchValue === 'object' &&
      patchValue !== null &&
      !Array.isArray(patchValue)
    ) {
      result[key] = deepMerge(baseValue, patchValue);
    } else {
      result[key] = patchValue;
    }
  }
  return result as T;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      _hydrated: false,
      brand: DEFAULT_BRAND,
      products: defaultProducts,
      siteContent: defaultSiteContent,
      siteImages: defaultSiteImages,
      customCategories: DEFAULT_CUSTOM_CATEGORIES,
      setBrand: (patch) =>
        set((state) => ({ brand: { ...state.brand, ...patch } })),
      setProducts: (products) => set({ products }),
      addProduct: (product) =>
        set((state) => ({ products: [product, ...state.products] })),
      updateProduct: (id, patch) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...patch } : product
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        })),
      setSiteContent: (patch) =>
        set((state) => ({ siteContent: deepMerge(state.siteContent, patch) })),
      setSiteContentDeep: (updater) =>
        set((state) => ({ siteContent: updater(state.siteContent) })),
      resetSiteContent: () => set({ siteContent: defaultSiteContent }),
      setSiteImages: (patch) =>
        set((state) => ({ siteImages: { ...state.siteImages, ...patch } })),
      resetSiteImages: () => set({ siteImages: defaultSiteImages }),
      addCustomCategory: (univers, category) =>
        set((state) => {
          const existing = state.customCategories[univers] ?? [];
          if (existing.includes(category)) return state;
          return {
            customCategories: {
              ...state.customCategories,
              [univers]: [...existing, category],
            },
          };
        }),
      removeCustomCategory: (univers, category) =>
        set((state) => ({
          customCategories: {
            ...state.customCategories,
            [univers]: (state.customCategories[univers] ?? []).filter((c) => c !== category),
          },
        })),
      reset: () =>
        set({
          brand: DEFAULT_BRAND,
          products: defaultProducts,
          siteContent: defaultSiteContent,
          siteImages: defaultSiteImages,
          customCategories: DEFAULT_CUSTOM_CATEGORIES,
        }),
    }),
    {
      name: 'didallah:shop-settings:v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage)
      ),
      skipHydration: true,
      // Exclure _hydrated de la persistance (runtime only).
      // Exclure aussi les imageUrl des produits : les images base64 peuvent
      // peser plusieurs Mo et saturer le quota localStorage (~5 Mo).
      // Les images sont persistées côté Supabase et rechargées au montage.
      partialize: (state) => {
        const { _hydrated: _, ...rest } = state;

        // Exclure les imageUrl des produits (base64 lourd → vient de Supabase)
        const productsWithoutImages = rest.products.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ imageUrl: _img, ...p }) => p
        );

        // Exclure les data URLs des images du site (logo, heros…) — même raison
        const siteImagesStripped = Object.fromEntries(
          Object.entries(rest.siteImages).map(([k, v]) => [
            k,
            typeof v === 'string' && v.startsWith('data:') ? null : v,
          ])
        ) as typeof rest.siteImages;

        return {
          ...rest,
          products: productsWithoutImages,
          siteImages: siteImagesStripped,
        } as Omit<ShopState, '_hydrated'>;
      },
      merge: (persistedState: unknown, currentState: ShopState): ShopState => {
        if (typeof persistedState !== 'object' || persistedState === null) {
          return currentState;
        }
        const pState = persistedState as Partial<ShopState>;

        // Fusion des images du site : préserver les base64 en mémoire si localStorage a du null
        const mergedImages = { ...currentState.siteImages };
        if (pState.siteImages) {
          for (const key of Object.keys(currentState.siteImages) as Array<keyof SiteImages>) {
            const persistedVal = pState.siteImages[key];
            const currentVal = currentState.siteImages[key];
            if ((persistedVal === null || persistedVal === undefined) && currentVal) {
              mergedImages[key] = currentVal;
            } else if (persistedVal !== undefined) {
              mergedImages[key] = persistedVal;
            }
          }
        }

        // Fusion des produits : préserver les imageUrl en mémoire
        let mergedProducts = currentState.products;
        if (pState.products && Array.isArray(pState.products)) {
          mergedProducts = pState.products.map((p: Product) => {
            const currentProd = currentState.products.find((cp) => cp.id === p.id);
            if (currentProd && currentProd.imageUrl && !p.imageUrl) {
              return { ...p, imageUrl: currentProd.imageUrl } as Product;
            }
            return p as Product;
          });
        }

        return {
          ...currentState,
          ...pState,
          siteImages: mergedImages,
          products: mergedProducts,
          _hydrated: true,
        };
      },
      onRehydrateStorage: () => () => {
        // Marquer le store comme hydraté de façon réactive
        useShopStore.setState({ _hydrated: true });
      },
      // Migrate gère les anciennes versions persistées sans siteContent
      migrate: (persistedState: unknown) => {
        if (typeof persistedState !== 'object' || persistedState === null) {
          return persistedState as Partial<ShopState>;
        }
        const state = persistedState as Partial<ShopState>;
        if (!state.siteContent) {
          return { ...state, siteContent: defaultSiteContent, siteImages: defaultSiteImages };
        }
        // Fusion profonde pour récupérer les nouveaux champs ajoutés au schéma
        return {
          ...state,
          siteContent: deepMerge(defaultSiteContent, state.siteContent),
          siteImages: state.siteImages
            ? { ...defaultSiteImages, ...state.siteImages }
            : defaultSiteImages,
        };
      },
      version: 2,
    }
  )
);

// Helper pour formater un numéro WhatsApp en E.164 (chiffres seuls)
export const whatsappToHref = (raw: string, text?: string) => {
  const digits = raw.replace(/\D/g, '');
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
};
