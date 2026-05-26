import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ─── Client Supabase ──────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True si les variables d'environnement sont présentes (Supabase configuré) */
export const isSupabaseConfigured =
  supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20;

/**
 * Client Supabase — null si non configuré.
 * Toujours vérifier isSupabaseConfigured avant d'utiliser ce client.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── Tables ───────────────────────────────────────────────────────────────────

export const supabaseTables = {
  siteSettings: 'site_settings',
  products: 'products',
  orders: 'orders',
  customers: 'customers',
  stock: 'stock',
};

// ─── Helpers contenu & images ─────────────────────────────────────────────────

/**
 * Lit une valeur JSON depuis la table site_settings.
 * Retourne null si la ligne n'existe pas ou si Supabase n'est pas configuré.
 */
export async function getSettingValue<T>(key: string): Promise<T | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from(supabaseTables.siteSettings)
    .select('value')
    .eq('key', key)
    .single();
  if (error || !data) return null;
  return data.value as T;
}

/**
 * Ecrit (upsert) une valeur JSON dans site_settings.
 */
export async function setSettingValue(key: string, value: unknown): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from(supabaseTables.siteSettings).upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  );
  return !error;
}

/**
 * Upload un fichier image dans Supabase Storage (bucket "site-images")
 * et retourne son URL publique.
 */
export async function uploadSiteImage(
  file: File,
  fileName: string
): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { error } = await supabase.storage
    .from('site-images')
    .upload(fileName, file, { upsert: true, cacheControl: '3600' });

  if (error) {
    console.error('[Supabase] upload error:', error.message);
    return null;
  }

  const { data } = supabase.storage.from('site-images').getPublicUrl(fileName);
  return data.publicUrl ?? null;
}

/**
 * Supprime un fichier image du bucket "site-images".
 */
export async function deleteSiteImage(fileName: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.storage.from('site-images').remove([fileName]);
  return !error;
}
