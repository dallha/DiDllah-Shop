import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email';

const PAYTECH_API_KEY = process.env.PAYTECH_API_KEY || '';
const PAYTECH_API_SECRET = process.env.PAYTECH_API_SECRET || '';

// Instance Supabase Service Role pour outrepasser les règles RLS si nécessaire
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const textBody = await request.text(); // URL encoded from PayTech
    const params = new URLSearchParams(textBody);
    
    const client_phone = params.get('client_phone');
    const payment_method = params.get('payment_method');
    const item_price = params.get('item_price');
    const custom_field = params.get('custom_field');
    const api_key_sha256 = params.get('api_key_sha256');
    const api_secret_sha256 = params.get('api_secret_sha256');

    // 1. Validation de sécurité (Signature SHA256)
    if (PAYTECH_API_KEY && PAYTECH_API_SECRET) {
      const localKeyHash = crypto.createHash('sha256').update(PAYTECH_API_KEY).digest('hex');
      const localSecretHash = crypto.createHash('sha256').update(PAYTECH_API_SECRET).digest('hex');

      if (api_key_sha256 !== localKeyHash || api_secret_sha256 !== localSecretHash) {
        console.error("IPN: Signature invalide.");
        return NextResponse.json({ error: "Signature invalide" }, { status: 403 });
      }
    } else {
      console.warn("IPN: Mode simulation, bypass sécurité SHA256.");
    }

    // 2. Extraire les infos de transaction
    let transactionId = '';
    let clientEmail = '';
    if (custom_field) {
      try {
        const customData = JSON.parse(custom_field);
        transactionId = customData.transactionId;
        clientEmail = customData.clientEmail;
      } catch (e) {
        console.error("IPN: Erreur parsing custom_field");
      }
    }

    if (!transactionId) {
      return NextResponse.json({ error: "transactionId manquant" }, { status: 400 });
    }

    // 3. Récupérer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (orderError || !order) {
      console.error("IPN: Commande introuvable:", transactionId);
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // 4. Mettre à jour la commande
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paye',
        client_phone: client_phone || order.client_phone,
        // On peut stocker la méthode de paiement dans une colonne ou dans les logs
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error("IPN: Erreur de mise à jour:", updateError);
    }

    // 5. Envoyer les e-mails de confirmation
    if (clientEmail) {
      await sendOrderConfirmationEmail(clientEmail, {
        transactionId,
        amount: item_price,
        products: order.products
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@didallah-shop.com';
    await sendAdminNotificationEmail(adminEmail, {
      transactionId,
      amount: item_price,
      clientEmail: clientEmail || 'Inconnu',
      products: order.products
    });

    // 6. Répondre à PayTech
    return new NextResponse("IPN OK", { status: 200 });

  } catch (error: any) {
    console.error("Erreur traitement IPN :", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
