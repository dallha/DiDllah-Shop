import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
// On initialise Resend uniquement si la clé est présente.
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Remplacer par le nom de domaine vérifié dans Resend une fois en production
const DEFAULT_FROM_EMAIL = 'commandes@didallah-shop.com'; 

export async function sendOrderConfirmationEmail(toEmail: string, orderDetails: any) {
  if (!resend) {
    console.warn("RESEND_API_KEY non configurée. E-mail non envoyé.");
    return;
  }

  try {
    const data = await resend.emails.send({
      from: `DiDallah Shop <${DEFAULT_FROM_EMAIL}>`,
      to: [toEmail],
      subject: 'Confirmation de votre commande - DiDallah Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-w-xl mx-auto; color: #333;">
          <h1 style="color: #0f172a;">Merci pour votre commande !</h1>
          <p>Bonjour,</p>
          <p>Nous avons bien reçu votre paiement et votre commande <strong>#${orderDetails.transactionId}</strong> est confirmée.</p>
          
          <h3 style="margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Détails de la commande</h3>
          <p style="white-space: pre-wrap;">${orderDetails.products}</p>
          <p><strong>Total payé :</strong> ${orderDetails.amount} FCFA</p>

          <p style="margin-top: 32px;">Vous pouvez suivre l'état de votre commande depuis votre espace client.</p>
          <p>À très bientôt,<br/>L'équipe DiDallah Shop</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail:", error);
    return { success: false, error };
  }
}

export async function sendAdminNotificationEmail(adminEmail: string, orderDetails: any) {
  if (!resend) return;

  try {
    await resend.emails.send({
      from: `Notification DiDallah <${DEFAULT_FROM_EMAIL}>`,
      to: [adminEmail],
      subject: `🎉 Nouvelle commande payée (#${orderDetails.transactionId})`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Nouvelle commande reçue !</h2>
          <p><strong>Transaction :</strong> ${orderDetails.transactionId}</p>
          <p><strong>Montant :</strong> ${orderDetails.amount} FCFA</p>
          <p><strong>Client (Email) :</strong> ${orderDetails.clientEmail}</p>
          <p><strong>Produits :</strong><br/>
            <span style="white-space: pre-wrap;">${orderDetails.products}</span>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur notification admin:", error);
  }
}
