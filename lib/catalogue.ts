/**
 * Catalogue Maison — Parfums & Soins Naturels
 * Types and utilities (database operations in API routes)
 */

export interface CatalogueItem {
  id: string;
  name: string;
  slug: string;
  type: 'parfum' | 'extrait' | 'soin';
  description?: string;
  olfactory_family?: string;
  inspiration?: string;
  image_url?: string;
  price_range?: string;
  ingredients?: string[];
  supplier_id?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImportResult {
  success: number;
  skipped: number;
  errors: Array<{
    row: number;
    reason: string;
  }>;
  items: CatalogueItem[];
}

/**
 * Parse CSV content
 */
export async function parseCSV(content: string): Promise<any[]> {
  const lines = content.split('\n').filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const items = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    if (values.length === 1 && !values[0]) continue;

    const item: any = {};
    headers.forEach((header, idx) => {
      item[header] = values[idx] || '';
    });
    items.push(item);
  }

  return items;
}

/**
 * Generate XLSX template
 */
export function generateXLSXTemplate(): string {
  return JSON.stringify(
    [
      {
        name: 'Rose Absolue',
        type: 'parfum',
        olfactory_family: 'Floral',
        inspiration: 'Inspiré par les roses du Sahara',
        price_range: '80-120 EUR',
        description: 'Composition florale délicate',
        ingredients: 'rose, ambre, musc',
      },
    ],
    null,
    2
  );
}

/**
 * Normalize item for database
 */
export function normalizeItem(item: any): Omit<CatalogueItem, 'id' | 'created_at' | 'updated_at'> {
  const name = item.name || item.nom || '';
  const slug = slugify(name);
  const type = (item.type || item.type_produit || 'parfum').toLowerCase();

  let ingredients: string[] = [];
  if (typeof item.ingredients === 'string') {
    ingredients = item.ingredients.split(',').map((i: string) => i.trim());
  } else if (Array.isArray(item.ingredients)) {
    ingredients = item.ingredients;
  }

  return {
    name,
    slug,
    type: type as 'parfum' | 'extrait' | 'soin',
    description: item.description || '',
    olfactory_family: item.olfactory_family || item.famille_olfactive || '',
    inspiration: item.inspiration || '',
    image_url: item.image_url || item.image || '',
    price_range: item.price_range || item.prix || '',
    ingredients,
    supplier_id: item.supplier_id || '',
    is_public: item.is_public === true || item.is_public === 'true',
  };
}

/**
 * Slugify name to URL-safe string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Detect duplicates by fuzzy name matching
 */
export function findDuplicates(items: any[]): Array<{ indices: number[]; name: string }> {
  const duplicates: Array<{ indices: number[]; name: string }> = [];
  const seen: Map<string, number[]> = new Map();

  items.forEach((item, idx) => {
    const name = (item.name || item.nom || '').toLowerCase().trim();
    const normalized = name.replace(/\s+/g, '');

    if (seen.has(normalized)) {
      seen.get(normalized)!.push(idx);
    } else {
      seen.set(normalized, [idx]);
    }
  });

  seen.forEach((indices, name) => {
    if (indices.length > 1) {
      duplicates.push({
        indices,
        name: items[indices[0]].name || items[indices[0]].nom || 'Unknown',
      });
    }
  });

  return duplicates;
}

/**
 * Export catalogue items to CSV
 */
export function exportToCsv(items: CatalogueItem[]): string {
  const headers = ['Name', 'Type', 'Olfactory Family', 'Inspiration', 'Price Range', 'Description'];
  const rows = items.map((item) => [
    item.name,
    item.type,
    item.olfactory_family || '',
    item.inspiration || '',
    item.price_range || '',
    item.description || '',
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');
  return csv;
}
