import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * GET /api/settings
 * Fetch all site settings
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from('site_settings').select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert to key-value object
    const settings: Record<string, any> = {};
    data?.forEach((setting) => {
      settings[setting.key] = setting.value;
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Update site settings (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Check admin auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createClient();

    // Get current user for audit trail
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Update or insert each setting
    const updates = [];
    for (const [key, value] of Object.entries(body)) {
      updates.push(
        supabase.from('site_settings').upsert(
          {
            key,
            value,
            category: categorizeKey(key),
            updated_at: new Date().toISOString(),
            updated_by: user?.id,
          },
          { onConflict: 'key' }
        )
      );
    }

    const results = await Promise.all(updates);

    // Check for errors
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0].error?.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Categorize setting key
 */
function categorizeKey(key: string): string {
  if (key.startsWith('brand_')) return 'brand';
  if (key.startsWith('content_')) return 'content';
  if (key.startsWith('theme_')) return 'theme';
  if (key.startsWith('seo_')) return 'seo';
  return 'general';
}
