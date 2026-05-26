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
import { type Product, type SiteContent, type SiteImages } from '@/lib/data';
import { type ShopSettings } from '@/lib/shop-store';

export default function SupabaseSync() {
  const initialSyncDone = useRef(false);

  const setSiteContentDeep = useShopStore((state) => state.setSiteContentDeep);
  const setSiteImages      = useShopStore((state) => state.setSiteImages);
  const setBrand           = useShopStore((state) => state.setBrand);
  const setProducts        = useShopStore((state) => state.setProducts);

  // ── Lecture initiale depuis Supabase dès le montage ───────────────────────
  // On n'attend plus hydrated : Supabase est la source de vérité.
  // Les données arrivent en 2 temps : d'abord localStorage (instantané),
  // puis Supabase écrase avec les valeurs les plus récentes.
  useEffect(() => {
    if (!isSupabaseConfigured || initialSyncDone.current) return;
    initialSyncDone.current = true;

    async function pullFromSupabase() {
      try {
        const supabaseClient = createClient();
        const [remoteContent, remoteImages, remoteBrand, remoteProductsResult] = await Promise.all([
          getSettingValue<SiteContent>('site_content'),
          getSettingValue<SiteImages>('site_images'),
          getSettingValue<ShopSettings>('brand'),
          supabaseClient.from('products').select('*'),
        ]);

        if (remoteContent)  setSiteContentDeep(() => remoteContent);
        if (remoteImages)   setSiteImages(remoteImages);
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
          // Migration transparente : Si la table SQL 'products' est vide, 
          // charger les produits depuis l'ancien format JSON dans 'site_settings'
          const fallbackProducts = await getSettingValue<Product[]>('products');
          if (fallbackProducts && Array.isArray(fallbackProducts)) {
            console.log('[SupabaseSync] Migration : Chargement des produits depuis le fallback JSON site_settings');
            setProducts(fallbackProducts);
          }
        }
      } catch (err) {
        console.warn('[SupabaseSync] Sync initial échoué :', err);
      }
    }

    void pullFromSupabase();
  }, [setSiteContentDeep, setSiteImages, setBrand, setProducts]);

  return null;
}

// ── Sauvegarde explicite vers Supabase ────────────────────────────────────────
export async function saveAllToSupabase(
  siteContent: SiteContent,
  siteImages: SiteImages,
  brand: ShopSettings,
  products?: Product[],
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  try {
    const supabase = createClient();
    const entries: { key: string; value: unknown }[] = [
      { key: 'site_content', value: siteContent },
      { key: 'site_images',  value: siteImages  },
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
