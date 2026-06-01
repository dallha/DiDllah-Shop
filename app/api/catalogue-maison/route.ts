import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { exportToCsv } from '@/lib/catalogue';

/**
 * GET /api/catalogue-maison
 * Fetch public catalogue items
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const mode = searchParams.get('mode');

    const supabase = await createClient();

    if (mode === 'export') {
      // Export mode: return CSV
      const { data: items } = await supabase
        .from('catalogue_maison')
        .select('*')
        .eq('is_public', true);

      if (!items) {
        return NextResponse.json({ error: 'No items found' }, { status: 404 });
      }

      const csv = exportToCsv(items);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="catalogue-maison.csv"',
        },
      });
    }

    if (mode === 'template') {
      // Return empty template as JSON
      const template = [
        {
          name: 'Exemple Produit',
          type: 'parfum',
          olfactory_family: 'Floral',
          inspiration: 'Inspiré par...',
          price_range: '50-100 EUR',
          description: 'Description du produit',
          ingredients: 'rose, ambre, musc',
        },
      ];

      return NextResponse.json(template);
    }

    // Default: return items as JSON
    let query = supabase.from('catalogue_maison').select('*').eq('is_public', true);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: items, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: items || [],
      count: items?.length || 0,
    });
  } catch (error) {
    console.error('Error in GET /api/catalogue-maison:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
