import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from './lib/admin-auth';

/**
 * Vérifie si l'utilisateur est authentifié via le cookie ADMIN_SECRET.
 * Fonctionne sans Supabase (fallback local).
 */
async function hasAdminCookie(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_token')?.value;
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;
  return await verifyToken(token, secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisser passer la page de login
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protéger toutes les autres routes /admin/*
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // 1) Vérifier le cookie ADMIN_SECRET (fallback local)
  if (await hasAdminCookie(request)) {
    return NextResponse.next();
  }

  // 2) Si Supabase est configuré, tenter l'auth Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 2.a) Vérifier que l'utilisateur a bien un rôle admin
      const role = user.app_metadata?.admin_role;
      if (!role) {
        return NextResponse.redirect(new URL('/', request.url)); // Redirige les clients normaux
      }

      // 2.b) Sécurité Asymétrique : Vérifier que le MFA est actif (AAL2)
      const { data: { authenticatorAssuranceLevel } } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (authenticatorAssuranceLevel?.currentLevel !== 'aal2') {
        const mfaUrl = new URL('/admin/mfa-setup', request.url);
        mfaUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(mfaUrl);
      }

      return response;
    }
  }

  // 3) Non authentifié → rediriger vers /admin/login
  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('redirectTo', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
