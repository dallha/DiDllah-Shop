/**
 * Blog & Article Management
 * Types and utilities for the blog system
 */

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url?: string;
  category: 'SEO' | 'Beauté' | 'Mode' | 'Tutoriels' | 'Nouvelles';
  author: string;
  status: 'draft' | 'published';
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

/**
 * Slugify: Convert title to URL-safe slug
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Format date to readable string (e.g., "1 juin 2026")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatter.format(date);
};

/**
 * Fetch all published articles with optional filtering (server-side)
 */
export async function fetchArticles(options?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<Article[]> {
  try {
    const query = new URLSearchParams();
    if (options?.category && options.category !== 'all') {
      query.append('category', options.category);
    }
    if (options?.limit) {
      query.append('limit', options.limit.toString());
    }
    if (options?.offset) {
      query.append('offset', options.offset.toString());
    }

    // Note: This assumes a server-side API endpoint
    // In a real app, this would be called from a server component
    // or via fetch from route handler
    return [];
  } catch (error) {
    console.error('Error in fetchArticles:', error);
    return [];
  }
}

/**
 * Fetch single article by slug (server-side)
 */
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  try {
    // This function is called from a Server Component (app/blog/[slug]/page.tsx)
    // It needs to be implemented as a server action or inline in the component
    return null;
  } catch (error) {
    console.error('Error in fetchArticleBySlug:', error);
    return null;
  }
}

/**
 * Get article categories for filtering
 */
export const ARTICLE_CATEGORIES = [
  'SEO',
  'Beauté',
  'Mode',
  'Tutoriels',
  'Nouvelles',
] as const;

/**
 * Fetch count of published articles
 */
export async function fetchArticleCount(): Promise<number> {
  try {
    // Server-side function - implement in API route or server action
    return 0;
  } catch (error) {
    console.error('Error in fetchArticleCount:', error);
    return 0;
  }
}
