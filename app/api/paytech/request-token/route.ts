import { NextResponse } from 'next/server';

const PAYTECH_API_KEY = process.env.PAYTECH_API_KEY;
const PAYTECH_API_SECRET = process.env.PAYTECH_API_SECRET;
const PAYTECH_ENDPOINT = 'https://paytech.sn/api/payment/request-token';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, amount, itemName, clientEmail } = body;

    if (!PAYTECH_API_KEY || !PAYTECH_API_SECRET) {
      console.warn("Clés API PayTech manquantes. Mode simulation activé.");
      // Mode simulation si les clés ne sont pas configurées
      return NextResponse.json({
        success: 1,
        token: 'token_simule_' + transactionId,
        redirect_url: `/admin/mfa-setup?simulated_payment=true&token=${transactionId}` // Faux lien de redirection
      });
    }

    const payload = {
      item_name: itemName || "Commande DiDallah Shop",
      item_price: amount,
      ref_command: transactionId,
      command_name: `Paiement transaction ${transactionId}`,
      env: process.env.NODE_ENV === 'production' ? 'prod' : 'test',
      currency: "XOF",
      ipn_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/paytech/ipn`,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/compte?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/panier?payment=cancel`,
      custom_field: JSON.stringify({ transactionId, clientEmail }),
    };

    const res = await fetch(PAYTECH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'API_KEY': PAYTECH_API_KEY,
        'API_SECRET': PAYTECH_API_SECRET
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    if (data.success === 1) {
      return NextResponse.json({
        success: 1,
        token: data.token,
        redirect_url: data.redirect_url
      });
    } else {
      return NextResponse.json(
        { success: 0, message: "Erreur de l'API PayTech", details: data },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Erreur PayTech request-token:", error);
    return NextResponse.json(
      { success: 0, message: "Erreur interne", error: error.message },
      { status: 500 }
    );
  }
}
