import { NextResponse, type NextRequest } from 'next/server';

/**
 * API route pour le login admin fallback (sans Supabase).
 * Vérifie le mot de passe ADMIN_SECRET et définit un cookie.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET;

  // Si ADMIN_SECRET n'est pas défini, refuser
  if (!secret) {
    return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body;

  if (!password || password !== secret) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }

  // Définir un cookie admin_token valable 24h
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 heures
  });

  return response;
}
