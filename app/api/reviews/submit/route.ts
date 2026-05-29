import { NextResponse, type NextRequest } from 'next/server';
import { createHmac } from 'crypto';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, rating, product, text, captchaAnswer, captchaToken } = body;

    // 1) Validation de base des champs
    if (!name?.trim() || !product?.trim() || !text?.trim() || !rating) {
      return NextResponse.json({ error: 'Veuillez remplir tous les champs obligatoires.' }, { status: 400 });
    }

    if (name.length > 100 || product.length > 100 || text.length > 2000) {
      return NextResponse.json({ error: 'Longueur de champ dépassée.' }, { status: 400 });
    }

    // 2) Validation du Captcha côté serveur
    if (!captchaAnswer || !captchaToken) {
      return NextResponse.json({ error: 'Captcha ou jeton manquant.' }, { status: 400 });
    }

    const parts = captchaToken.split('.');
    if (parts.length !== 2) {
      return NextResponse.json({ error: 'Jeton captcha invalide.' }, { status: 400 });
    }

    const [expiryStr, sig] = parts;
    const expiry = parseInt(expiryStr, 10);

    if (isNaN(expiry) || Date.now() > expiry) {
      return NextResponse.json({ error: 'Le captcha a expiré. Veuillez en générer un nouveau.' }, { status: 400 });
    }

    // Re-calculer la signature HMAC attendue
    const expectedData = `${parseInt(captchaAnswer, 10)}.${expiry}`;
    const expectedSig = createHmac('sha256', secret).update(expectedData).digest('hex');

    if (sig !== expectedSig) {
      return NextResponse.json({ error: 'Réponse au captcha incorrecte.' }, { status: 400 });
    }

    // 3) Insertion dans Supabase via le client serveur sécurisé
    const supabase = await createClient();
    const { error: insertError } = await supabase.from('pending_reviews').insert({
      name: name.trim(),
      email: email.trim() || null,
      rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
      product: product.trim(),
      text: text.trim(),
    });

    if (insertError) {
      console.error('[ReviewsSubmit] Supabase error:', insertError.message);
      return NextResponse.json({ error: 'Erreur technique lors de la soumission de l\'avis.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ReviewsSubmit] Unexpected error:', err);
    return NextResponse.json({ error: 'Une erreur inattendue est survenue.' }, { status: 500 });
  }
}
