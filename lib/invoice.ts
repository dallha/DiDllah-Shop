/**
 * invoice.ts — Générateur de factures / reçus DiDallah Shop (Version Sécurisée)
 *
 * Usage :
 *   openInvoicePrint(makeOrderInvoice(order, brand))
 *   openInvoicePrint(makePaymentReceipt(payment, brand))
 */

export type InvoiceBrand = {
  name: string;
  whatsapp?: string;
  email?: string;
  address?: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Échappe les caractères HTML spéciaux pour prévenir les failles XSS.
 */
function escHtml(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function fmtPrice(n: number): string {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function invoiceNumber(id: string): string {
  // Prend les 8 derniers chars de l'ID pour un numéro court
  const short = id.replace(/-/g, '').slice(-8).toUpperCase();
  return `FAC-${short}`;
}

// ── Template de base HTML (partagé) ──────────────────────────────────────────

function baseStyles(): string {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Outfit', sans-serif; color:#1e293b; background:#f8fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

      .page {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
        min-height: 260mm;
        padding: 15mm 20mm 12mm;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      }

      /* Header */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 1px solid #e2e8f0;
        position: relative;
      }
      .header::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 80px;
        height: 3px;
        background: #c5a880;
      }

      .shop-name  { font-family: 'Playfair Display', Georgia, serif; font-size:32px; font-weight:700; color:#0f172a; letter-spacing:-0.02em; line-height: 1.1; }
      .shop-sub   { font-size:9.5px; color:#c5a880; text-transform:uppercase; letter-spacing:0.25em; margin-top:6px; font-weight: 600; }
      .shop-meta  { font-size:11px; color:#475569; margin-top:12px; line-height:1.6; }

      .doc-info   { text-align:right; }
      .doc-title  { font-family: 'Playfair Display', Georgia, serif; font-size:28px; font-weight:700; color:#0f172a; text-transform:uppercase; letter-spacing:0.04em; }
      .doc-num    { font-size:12px; color:#475569; margin-top:6px; font-family: monospace; font-weight: 600; }
      .doc-date   { font-size:11px; color:#64748b; margin-top:4px; }

      /* Parties */
      .parties { display:grid; grid-template-columns:1fr 1fr; gap:28px; margin-bottom:32px; }
      .party-box { background:#faf9f6; border-left: 3px solid #c5a880; border-radius: 0 8px 8px 0; padding:16px 18px; border-top: 1px solid #f1ece1; border-right: 1px solid #f1ece1; border-bottom: 1px solid #f1ece1; }
      .party-label { font-size:9px; text-transform:uppercase; letter-spacing:0.2em; color:#8a7a65; font-weight:700; margin-bottom:6px; }
      .party-name  { font-size:16px; font-weight:700; color:#0f172a; }
      .party-sub   { font-size:11.5px; color:#475569; margin-top:4px; line-height:1.5; }

      /* Table */
      table { width:100%; border-collapse:collapse; margin-bottom:28px; }
      thead th { padding:12px 14px; text-align:left; font-size:9.5px; text-transform:uppercase; letter-spacing:0.15em; color:#8a7a65; font-weight:700; border-bottom: 2px solid #c5a880; }
      thead th:last-child { text-align:right; }
      tbody tr { border-bottom:1px solid #f1f5f9; }
      tbody tr:last-child { border-bottom:none; }
      tbody td { padding:12px 14px; font-size:13.5px; color:#334155; }
      tbody td:last-child { text-align:right; font-weight:600; color:#0f172a; }
      tbody tr:hover { background:#faf9f6; }

      /* Totaux */
      .totals { display:flex; justify-content:flex-end; margin-bottom:32px; }
      .totals-box { width:260px; }
      .t-row { display:flex; justify-content:space-between; padding:8px 0; font-size:12.5px; color:#475569; border-bottom:1px solid #f1f5f9; }
      .t-row.grand { font-size:18px; font-weight:800; color:#0f172a; border-bottom:none; border-top:2px solid #0f172a; padding-top:12px; margin-top:8px; }
      .t-row.credit { color:#b45309; font-weight:700; background: #fffbeb; border-radius: 4px; padding: 6px 8px; margin: 4px 0; border: 1px solid #fef3c7; }

      /* Mode paiement */
      .mode-badge {
        display:inline-flex; align-items:center; gap:6px;
        border-radius:6px; padding:6px 14px;
        font-size:11px; font-weight:700;
        margin-bottom:24px;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      .mode-liquide      { background:#f1f5f9; color:#334155; border: 1px solid #cbd5e1; }
      .mode-wave         { background:#eff6ff; color:#1d4ed8; border: 1px solid #bfdbfe; }
      .mode-orange-money { background:#fff7ed; color:#c2410c; border: 1px solid #ffedd5; }

      /* Statut commande */
      .status-badge {
        display:inline-flex; align-items:center; gap:6px;
        border-radius:6px; padding:6px 14px;
        font-size:11px; font-weight:700;
        margin-bottom:24px;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      .status-livre      { background:#ecfdf5; color:#047857; border: 1px solid #a7f3d0; }
      .status-en_attente { background:#fffbeb; color:#b45309; border: 1px solid #fef3c7; }
      .status-en_cours   { background:#eff6ff; color:#1d4ed8; border: 1px solid #bfdbfe; }
      .status-annule     { background:#fef2f2; color:#b91c1c; border: 1px solid #fee2e2; }

      /* Notes */
      .notes-box { background:#faf9f6; border-left: 3px solid #c5a880; border-top: 1px solid #f1ece1; border-right: 1px solid #f1ece1; border-bottom: 1px solid #f1ece1; border-radius: 0 8px 8px 0; padding:14px 18px; font-size:12.5px; color:#4b453d; margin-bottom:28px; line-height: 1.5; }
      .notes-box strong { display:block; margin-bottom:6px; font-size:9.5px; text-transform:uppercase; letter-spacing:0.15em; color:#8a7a65; }

      /* Footer */
      .footer {
        margin-top:auto;
        padding-top:20px;
        border-top:1px solid #e2e8f0;
        text-align:center;
        font-size:11.5px;
        color:#475569;
        line-height:1.8;
      }
      .footer strong { color:#0f172a; font-weight: 700; }

      /* Boutons (masqués à l'impression) */
      .actions {
        position:fixed; top:20px; right:20px;
        display:flex; gap:10px; z-index:100;
      }
      .btn {
        padding:12px 24px; border-radius:50px;
        font-size:13px; font-weight:700;
        cursor:pointer; border:none;
        transition:all 0.2s; box-shadow:0 4px 12px rgba(0,0,0,0.1);
        font-family: 'Outfit', sans-serif;
      }
      .btn-print { background:#0f172a; color:#fff; }
      .btn-print:hover { background:#1e293b; transform: translateY(-1px); }
      .btn-close { background:#fff; color:#475569; border:1px solid #e2e8f0; }
      .btn-close:hover { background:#f8fafc; transform: translateY(-1px); }

      @media print {
        body { background:white; }
        .page { padding:8mm 12mm 6mm; box-shadow: none; min-height: 0; }
        .actions { display:none !important; }
      }
    </style>
  `;
}

function wrapInPage(body: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  ${baseStyles()}
</head>
<body>
  <div class="actions">
    <button class="btn btn-close" onclick="window.close()">← Fermer</button>
    <button class="btn btn-print" onclick="window.print()">🖨 Imprimer / PDF</button>
  </div>
  <div class="page">
    ${body}
  </div>
</body>
</html>`;
}

// ── Facture Commande ──────────────────────────────────────────────────────────

type OrderForInvoice = {
  id: string;
  client_name: string;
  client_phone?: string;
  products: string;
  total: number;
  status: string;
  notes?: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; icon: string }> = {
  en_attente: { label: 'En attente',  icon: '⏳' },
  en_cours:   { label: 'En cours',    icon: '🚚' },
  livre:      { label: 'Livré',       icon: '✅' },
  annule:     { label: 'Annulé',      icon: '❌' },
};

export function makeOrderInvoice(order: OrderForInvoice, brand: InvoiceBrand): string {
  const num   = escHtml(invoiceNumber(order.id));
  const date  = escHtml(fmtDate(order.created_at));
  const cfg   = STATUS_LABELS[order.status] ?? { label: order.status, icon: '📦' };
  const cls   = `status-${order.status}`;

  // Construit les lignes du tableau à partir du texte produits
  const lines = (order.products || '').split('\n').filter(Boolean);

  const rows = lines.map((line) => {
    // Essaie de détecter "Produit × quantité" ou "Produit - xxx FCFA"
    const priceMatch = line.match(/(\d[\d\s]*)\s*FCFA/i);
    const qtyMatch   = line.match(/×\s*(\d+)/i);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, ''), 10) : null;
    const qty   = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
    const name  = line.replace(/×\s*\d+/i, '').replace(/[\d\s]*FCFA/i, '').replace(/-/g, '').trim();

    return `<tr>
      <td>${escHtml(name || line)}</td>
      <td style="text-align:center">${qty}</td>
      <td>${price != null ? fmtPrice(price) : '—'}</td>
    </tr>`;
  }).join('');

  const statusBadge = `<span class="status-badge ${cls}">${escHtml(cfg.icon)} ${escHtml(cfg.label)}</span>`;

  const notesHtml = order.notes?.trim()
    ? `<div class="notes-box"><strong>Notes</strong>${escHtml(order.notes).replace(/\n/g, '<br>')}</div>`
    : '';

  const body = `
    <!-- Header -->
    <div class="header">
      <div>
        <div class="shop-name">${escHtml(brand.name)}</div>
        <div class="shop-sub">Beauté &amp; Mode · Dakar</div>
        <div class="shop-meta">
          ${brand.address ? `📍 ${escHtml(brand.address)}<br>` : ''}
          ${brand.whatsapp ? `📱 ${escHtml(brand.whatsapp)}<br>` : ''}
          ${brand.email ? `✉ ${escHtml(brand.email)}` : ''}
        </div>
      </div>
      <div class="doc-info">
        <div class="doc-title">Facture</div>
        <div class="doc-num">${num}</div>
        <div class="doc-date">Dakar, le ${date}</div>
      </div>
    </div>

    <!-- Parties -->
    <div class="parties">
      <div class="party-box">
        <div class="party-label">Vendeur</div>
        <div class="party-name">${escHtml(brand.name)}</div>
        <div class="party-sub">Dakar, Sénégal</div>
      </div>
      <div class="party-box">
        <div class="party-label">Client</div>
        <div class="party-name">${escHtml(order.client_name)}</div>
        ${order.client_phone ? `<div class="party-sub">${escHtml(order.client_phone)}</div>` : ''}
      </div>
    </div>

    ${statusBadge}

    <!-- Produits -->
    <table>
      <thead>
        <tr>
          <th style="width:60%">Désignation</th>
          <th style="width:10%;text-align:center">Qté</th>
          <th style="width:30%;text-align:right">Montant</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <!-- Total -->
    <div class="totals">
      <div class="totals-box">
        <div class="t-row grand">
          <span>Total</span>
          <span>${fmtPrice(order.total ?? 0)}</span>
        </div>
      </div>
    </div>

    ${notesHtml}

    <!-- Footer -->
    <div class="footer">
      <strong>${escHtml(brand.name)}</strong> · Merci pour votre confiance !<br>
      ${brand.whatsapp ? `WhatsApp : ${escHtml(brand.whatsapp)} · ` : ''}
      ${brand.email ? `${escHtml(brand.email)}` : ''}
    </div>
  `;

  return wrapInPage(body, `Facture ${num} — ${escHtml(brand.name)}`);
}

// ── Reçu Trésorerie ───────────────────────────────────────────────────────────

type PaymentForReceipt = {
  id: string;
  nom: string;
  date_paiement: string;
  montant_marchandise: number;
  paiement_comptant: number;
  acompte: number;
  mode_paiement: string;
  credit: number;
  notes?: string;
};

export function makePaymentReceipt(payment: PaymentForReceipt, brand: InvoiceBrand): string {
  const num  = escHtml(invoiceNumber(payment.id));
  const date = escHtml(fmtDate(payment.date_paiement || new Date().toISOString()));

  const notesText = payment.notes ?? '';
  const cleanNotes = notesText
    .replace(/\[Marchandise\]:\s*[^\n]+/i, '')
    .replace(/\[Quantité\]:\s*[^\n]+/i, '')
    .trim();

  const productsMatch = notesText.match(/\[Marchandise\]:\s*([^\n]+)/i);
  const qtyMatch = notesText.match(/\[Quantité\]:\s*([^\n]+)/i);

  const productsVal = productsMatch ? productsMatch[1].trim() : '';
  const qtyVal = qtyMatch ? qtyMatch[1].trim() : '';

  const modeClass =
    payment.mode_paiement === 'Wave'
      ? 'mode-wave'
      : payment.mode_paiement === 'Orange Money'
      ? 'mode-orange-money'
      : 'mode-liquide';

  const modeBadge = `<span class="mode-badge ${modeClass}">💳 ${escHtml(payment.mode_paiement)}</span>`;

  const creditHtml = payment.credit > 0
    ? `<div class="t-row credit"><span>⚠ Crédit restant</span><span>${fmtPrice(payment.credit)}</span></div>`
    : '';

  const notesHtml = cleanNotes
    ? `<div class="notes-box"><strong>Notes</strong>${escHtml(cleanNotes).replace(/\n/g, '<br>')}</div>`
    : '';

  const totalRecu = payment.paiement_comptant + payment.acompte;

  let rowsHtml = '';
  if (productsVal) {
    rowsHtml += `
      <tr>
        <td>
          <div style="font-weight:600;color:#0f172a;">${escHtml(productsVal)}</div>
          ${qtyVal ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">📦 Quantité : <strong>${escHtml(qtyVal)}</strong></div>` : ''}
        </td>
        <td style="text-align:right;vertical-align:middle;">${fmtPrice(payment.montant_marchandise)}</td>
      </tr>
    `;
  } else {
    rowsHtml += `
      <tr>
        <td>
          <div style="font-weight:600;color:#0f172a;">Achat Marchandise</div>
          ${qtyVal ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">📦 Quantité : <strong>${escHtml(qtyVal)}</strong></div>` : ''}
        </td>
        <td style="text-align:right;vertical-align:middle;">${fmtPrice(payment.montant_marchandise)}</td>
      </tr>
    `;
  }

  if (payment.paiement_comptant > 0) {
    rowsHtml += `
      <tr>
        <td style="color:#047857;font-weight:500;">✓ Paiement comptant</td>
        <td style="text-align:right;color:#047857;font-weight:600;">${fmtPrice(payment.paiement_comptant)}</td>
      </tr>
    `;
  }
  if (payment.acompte > 0) {
    rowsHtml += `
      <tr>
        <td style="color:#b45309;font-weight:500;">↳ Acompte versé</td>
        <td style="text-align:right;color:#b45309;font-weight:600;">${fmtPrice(payment.acompte)}</td>
      </tr>
    `;
  }

  const body = `
    <!-- Header -->
    <div class="header">
      <div>
        <div class="shop-name">${escHtml(brand.name)}</div>
        <div class="shop-sub">Beauté &amp; Mode · Dakar</div>
        <div class="shop-meta">
          ${brand.address ? `📍 ${escHtml(brand.address)}<br>` : ''}
          ${brand.whatsapp ? `📱 ${escHtml(brand.whatsapp)}<br>` : ''}
          ${brand.email ? `✉ ${escHtml(brand.email)}` : ''}
        </div>
      </div>
      <div class="doc-info">
        <div class="doc-title">Reçu</div>
        <div class="doc-num">${num}</div>
        <div class="doc-date">Dakar, le ${date}</div>
      </div>
    </div>

    <!-- Parties -->
    <div class="parties">
      <div class="party-box">
        <div class="party-label">Émetteur</div>
        <div class="party-name">${escHtml(brand.name)}</div>
        <div class="party-sub">Dakar, Sénégal</div>
      </div>
      <div class="party-box">
        <div class="party-label">Client / Fournisseur</div>
        <div class="party-name">${escHtml(payment.nom)}</div>
        <div class="party-sub">Date : ${date}</div>
      </div>
    </div>

    ${modeBadge}

    <!-- Détail paiement -->
    <table>
      <thead>
        <tr>
          <th>Désignation</th>
          <th style="text-align:right">Montant</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <!-- Totaux -->
    <div class="totals">
      <div class="totals-box">
        <div class="t-row">
          <span>Montant total</span>
          <span>${fmtPrice(payment.montant_marchandise)}</span>
        </div>
        <div class="t-row">
          <span>Total reçu</span>
          <span>${fmtPrice(totalRecu)}</span>
        </div>
        ${creditHtml}
        <div class="t-row grand">
          <span>Solde</span>
          <span>${fmtPrice(payment.montant_marchandise - totalRecu)}</span>
        </div>
      </div>
    </div>

    ${notesHtml}

    <!-- Signatures -->
    <div style="display:flex;justify-content:space-between;margin-top:50px;margin-bottom:30px;">
      <div style="width:40%;border-top:1px solid #94a3b8;padding-top:8px;font-size:11px;color:#334155;text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">
        Signature client
      </div>
      <div style="width:40%;border-top:1px solid #94a3b8;padding-top:8px;font-size:11px;color:#334155;text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">
        Cachet &amp; signature vendeur
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <strong>${escHtml(brand.name)}</strong> · Ce reçu fait foi de paiement.<br>
      ${brand.whatsapp ? `WhatsApp : ${escHtml(brand.whatsapp)}` : ''}
    </div>
  `;

  return wrapInPage(body, `Reçu ${num} — ${escHtml(brand.name)}`);
}

// ── Ouverture fenêtre impression ─────────────────────────────────────────────

export function openInvoicePrint(html: string): void {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Autorisez les pop-ups pour imprimer la facture.');
    return;
  }
  win.document.write(html);
  win.document.close();
  // Déclenche l'impression après chargement
  win.addEventListener('load', () => {
    setTimeout(() => win.print(), 300);
  });
}
