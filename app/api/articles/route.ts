import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * GET /api/articles
 * Fetch articles (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        limit,
        offset,
        total: count,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/articles
 * Create a new article (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin auth (basic check - implement proper auth)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createClient();

    // Validate required fields
    if (!body.title || !body.excerpt || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Slugify title
    const slug = body.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const { data, error } = await supabase
      .from('articles')
      .insert([
        {
          title: body.title,
          slug,
          excerpt: body.excerpt,
          content: body.content,
          category: body.category || 'Nouvelles',
          author: body.author || 'Admin',
          status: body.status || 'draft',
          meta_description: body.meta_description,
          meta_keywords: body.meta_keywords,
          image_url: body.image_url,
          published_at:
            body.status === 'published' ? new Date().toISOString() : null,
        },
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
