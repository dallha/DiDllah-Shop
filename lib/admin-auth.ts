import { cookies } from 'next/headers';

/**
 * Génère un token d'administration signé par HMAC-SHA256 en utilisant l'API standard Web Crypto.
 * Le token est structuré comme suit : `${nonce}.${signature}`
 * 
 * @param secret Le secret ADMIN_SECRET de l'application
 */
export async function generateToken(secret: string): Promise<string> {
  const nonce = crypto.randomUUID();

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(nonce);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  
  // Convertir la signature en hexadécimal
  const sigHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${nonce}.${sigHex}`;
}

/**
 * Valide un token signé HMAC-SHA256 de façon constante-temporelle avec l'API Web Crypto.
 * 
 * @param token Le token à vérifier
 * @param secret Le secret ADMIN_SECRET de l'application
 */
export async function verifyToken(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [nonce, sig] = parts;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(nonce);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convertir la signature hexadécimale en Uint8Array
    const sigBytes = new Uint8Array(
      sig.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );

    // La méthode crypto.subtle.verify est intrinsèquement protégée contre les attaques temporelles
    return await crypto.subtle.verify('HMAC', key, sigBytes, messageData);
  } catch (err) {
    console.error('[verifyToken] Error during Web Crypto verification:', err);
    return false;
  }
}

/**
 * Vérifie de façon synchrone ou asynchrone si la requête en cours est authentifiée.
 * Utilisable dans les Server Components, Route Handlers (APIs) et Server Actions.
 */
export async function checkAdminAuth(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return false;

    return await verifyToken(token, secret);
  } catch (err) {
    console.error('[admin-auth] Error reading cookies:', err);
    return false;
  }
}
