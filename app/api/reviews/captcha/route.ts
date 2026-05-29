import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function GET() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  // Générer des nombres aléatoires simples
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const answer = a + b;

  // Le jeton expire après 10 minutes pour éviter la réutilisation infinie
  const expiry = Date.now() + 10 * 60 * 1000;
  const dataToSign = `${answer}.${expiry}`;
  const sig = createHmac('sha256', secret).update(dataToSign).digest('hex');
  const token = `${expiry}.${sig}`;

  return NextResponse.json({
    question: `${a} + ${b} = ?`,
    token,
  });
}
export const dynamic = 'force-dynamic';
