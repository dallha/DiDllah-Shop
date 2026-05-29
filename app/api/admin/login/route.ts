import { NextResponse, type NextRequest } from 'next/server';
import { generateToken } from '@/lib/admin-auth';

// Simple in-memory rate limiter
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const record = loginAttempts.get(ip);
  if (!record) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (now > record.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  record.count += 1;
  return record.count > maxAttempts;
}

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

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';

  if (checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body;

  if (!password || password !== secret) {
    // Add artificial delay for failed attempts to slow down brute force
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }

  // Clear attempts on successful login
  loginAttempts.delete(ip);

  // Définir un cookie admin_token valable 24h
  const token = await generateToken(secret);
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 heures
  });

  return response;
}
