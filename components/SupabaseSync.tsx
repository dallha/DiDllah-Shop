'use client';
/**
 * SupabaseSync — synchronise le store Zustand avec Supabase.
 *
 * Comportement :
 * 1. Au montage, lit site_content, site_images, brand et products depuis
 *    Supabase et écrase les valeurs localStorage si Supabase a des données.
 * 2. La sauvegarde est EXPLICITE (bouton "Enregistrer" dans l'admin).
 *    Utiliser saveAllToSupabase() exportée ci-dessous depuis les pages admin.
 *
 * Ce composant ne rend rien — il s'inscrit dans le RootLayout après StoreHydrator.
 * Si NEXT_PUBLIC_SUPABASE_URL n'est pas défini, il est complètement inactif.
 */
import { useEffect, useRef } from 'react';
import { useShopStore } from '@/lib/shop-store';
import {
  isSupabaseConfigured,
  getSettingValue,
} from '@/lib/supabase';
import { createClient } from '@/lib/supabase-client';
import { type Product, type SiteContent, type SiteImages, type SiteTheme, defaultSiteContent, defaultSiteTheme } from '@/lib/data';
import { type ShopSettings, deepMerge } from '@/lib/shop-store';

export default function SupabaseSync() {
  const initialSyncDone = useRef(false);

  const setSiteContentDeep = useShopStore((state) => state.setSiteContentDeep);
  const setSiteImages      = useShopStore((state) => state.setSiteImages);
  const setSiteTheme       = useShopStore((state) => state.setSiteTheme);
  const setBrand           = useShopStore((state) => state.setBrand);
  const setProducts        = useShopStore((state) => state.setProducts);

  // ── Lecture initiale depuis Supabase ou fichier local ────────────────────
  useEffect(() => {
    if (initialSyncDone.current) return;
    initialSyncDone.current = true;

    async function pullInitialData() {
      // 1) Si Supabase est configuré, charger depuis Supabase
      if (isSupabaseConfigured) {
        try {
          const supabaseClient = createClient();
          const [remoteContent, remoteImages, remoteTheme, remoteBrand, remoteProductsResult] = await Promise.all([
            getSettingValue<SiteContent>('site_content'),
            getSettingValue<SiteImages>('site_images'),
            getSettingValue<SiteTheme>('site_theme'),
            getSettingValue<ShopSettings>('brand'),
            supabaseClient.from('products').select('*'),
          ]);

          if (remoteContent)  setSiteContentDeep(() => deepMerge(defaultSiteContent, remoteContent));
          if (remoteImages)   setSiteImages(remoteImages);
          if (remoteTheme)    setSiteTheme({ ...defaultSiteTheme, ...remoteTheme });
          if (remoteBrand)    setBrand(remoteBrand);
          
          const remoteProductsData = remoteProductsResult.data;
          if (remoteProductsData && Array.isArray(remoteProductsData) && remoteProductsData.length > 0) {
            const remoteProducts = remoteProductsData.map((row) => ({
              id: row.id,
              name: row.name,
              univers: row.univers,
              category: row.category,
              price: Number(row.price) || 0,
              tag: row.tag || undefined,
              short: row.short || '',
              long: row.long || '',
              details: Array.isArray(row.details) ? row.details : [],
              imageUrl: row.image_url || undefined,
              active: row.active !== false,
            })) as Product[];
            setProducts(remoteProducts);
          } else {
            const fallbackProducts = await getSettingValue<Product[]>('products');
            if (fallbackProducts && Array.isArray(fallbackProducts)) {
              console.log('[SupabaseSync] Migration : Chargement des produits depuis le fallback JSON site_settings');
              setProducts(fallbackProducts);
            }
          }
          return; // Succès → on ne charge pas le fichier local
        } catch (err) {
          console.warn('[SupabaseSync] Sync Supabase échoué, fallback fichier local :', err);
        }
      }

      // 2) Fallback : charger depuis le fichier JSON local
      try {
        const res = await fetch('/api/admin/data');
        if (res.ok) {
          const localData = await res.json();
          if (localData.siteContent) setSiteContentDeep(() => deepMerge(defaultSiteContent, localData.siteContent));
          if (localData.siteImages)  setSiteImages(localData.siteImages);
          if (localData.siteTheme)   setSiteTheme({ ...defaultSiteTheme, ...localData.siteTheme });
          if (localData.brand)       setBrand(localData.brand);
          if (localData.products)    setProducts(localData.products);
          console.log('[SupabaseSync] Données chargées depuis le fichier local');
        }
      } catch (err) {
        console.warn('[SupabaseSync] Aucune donnée locale trouvée :', err);
      }
    }

    void pullInitialData();
  }, [setSiteContentDeep, setSiteImages, setSiteTheme, setBrand, setProducts]);


  return null;
}

// ── Sauvegarde explicite vers fichier local (fallback sans Supabase) ──────────
export async function saveAllToLocal(
  siteContent: SiteContent,
  siteImages: SiteImages,
  siteTheme: SiteTheme,
  brand: ShopSettings,
  products?: Product[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteContent, siteImages, siteTheme, brand, products }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      return { ok: false, error: err.error || 'Erreur lors de la sauvegarde locale' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ── Sauvegarde explicite vers Supabase ────────────────────────────────────────
export async function saveAllToSupabase(
  siteContent: SiteContent,
  siteImages: SiteImages,
  siteTheme: SiteTheme,
  brand: ShopSettings,
  products?: Product[],
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  try {
    const supabase = createClient();
    const entries: { key: string; value: unknown }[] = [
      { key: 'site_content', value: siteContent },
      { key: 'site_images',  value: siteImages  },
      { key: 'site_theme',   value: siteTheme   },
      { key: 'brand',        value: brand        },
    ];
    
    // 1. Sauvegarder les configurations éditoriales de marque
    const results = await Promise.all(
      entries.map(({ key, value }) =>
        supabase
          .from('site_settings')
          .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
          .then(({ error }) => !error)
      )
    );

    // 2. Si les produits sont fournis, les synchroniser de manière relationnelle
    if (products !== undefined) {
      // Effectuer un upsert de tous les produits dans la table relationnelle
      const { error: upsertError } = await supabase.from('products').upsert(
        products.map((p) => ({
          id: p.id,
          name: p.name,
          univers: p.univers,
          category: p.category,
          price: Number(p.price) || 0,
          tag: p.tag || null,
          short: p.short,
          long: p.long || '',
          details: p.details || [],
          image_url: p.imageUrl || null,
          active: p.active !== false,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'id' }
      );

      if (upsertError) {
        console.error('[SupabaseSync] Erreur d\'upsert des produits :', upsertError);
        return { ok: false, error: "Erreur de sauvegarde des produits : " + upsertError.message };
      }

      // Purger de la base de données les produits supprimés localement
      const activeIds = products.map((p) => p.id);
      if (activeIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .not('id', 'in', activeIds);
        if (deleteError) {
          console.warn('[SupabaseSync] Avertissement lors de la purge des produits :', deleteError);
        }
      } else {
        await supabase.from('products').delete().neq('id', '');
      }
    }

    if (results.every(Boolean)) return { ok: true };
    return { ok: false, error: "Une ou plusieurs configurations n'ont pas pu être sauvegardées." };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
