import { NextRequest, NextResponse } from 'next/server';

// Système de prompt pour le conseiller virtuel
const SYSTEM_PROMPT = `Tu es un conseiller virtuel expert et chaleureux pour DiDallah Shop, une boutique premium de mode et beauté africaine.

Règles strictes :
1. Réponds toujours en français, avec un ton chaleureux, professionnel et bienveillant.
2. Tu connais parfaitement les produits africains : wax, bazin, boubous, parfums, huiles naturelles (karité, coco, ricin, nigelle), savon noir, etc.
3. Tu peux donner des conseils mode (associations de couleurs, occasions) et beauté (routine capillaire, soin de la peau).
4. Si on te demande un produit spécifique que tu ne connais pas, suggère de contacter la boutique via WhatsApp.
5. Ne donne jamais de conseils médicaux. Pour les allergies, recommande de consulter un professionnel de santé.
6. Reste concis : 2-3 phrases maximum par réponse, sauf si on te demande plus de détails.
7. Utilise occasionnellement des émojis pour rendre la conversation chaleureuse (🌿✨💫👗🧴).
8. Ne divulgue jamais d'informations personnelles ou techniques sur la boutique.
9. Si la question est inappropriée ou hors sujet, répond poliment que tu es là uniquement pour parler des produits DiDallah Shop.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Vérifier si la clé API Gemini est configurée
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Mode dégradé : réponses pré-définies
      return NextResponse.json({
        reply: getFallbackReply(message),
      });
    }

    // Appel à l'API Gemini
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: SYSTEM_PROMPT }],
            },
            {
              role: 'model',
              parts: [{ text: 'Compris. Je suis le conseiller virtuel de DiDallah Shop. Comment puis-je vous aider ?' }],
            },
            {
              role: 'user',
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
            topP: 0.9,
            topK: 40,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errorText);
      return NextResponse.json({
        reply: getFallbackReply(message),
      });
    }

    const geminiData = await geminiRes.json();
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return NextResponse.json({
        reply: getFallbackReply(message),
      });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Conseiller API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Réponses de secours quand Gemini n'est pas disponible
function getFallbackReply(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello')) {
    return '👋 Bonjour et bienvenue chez DiDallah Shop ! Je suis votre conseiller virtuel. Comment puis-je vous aider aujourd\'hui ? Que ce soit pour la mode, la beauté ou les traditions africaines, je suis là pour vous !';
  }

  if (msg.includes('parfum') || msg.includes('parfumerie')) {
    return '🌿 Nous avons une magnifique collection de parfums ! Notre "Jardin de Liberté" pour femme (38 000 FCFA) et notre "Oud Royal" pour homme (42 000 FCFA) sont nos best-sellers. Souhaitez-vous plus de détails sur l\'un d\'eux ?';
  }

  if (msg.includes('karité') || msg.includes('beurre')) {
    return '🧴 Le beurre de karité est un trésor de la nature ! Il hydrate, nourrit et répare la peau et les cheveux en profondeur. Notre beurre de karité brut (7 500 FCFA) est 100% pur, idéal pour toute la famille.';
  }

  if (msg.includes('boubou') || msg.includes('wax') || msg.includes('bazin') || msg.includes('mode')) {
    return '👗 Notre collection mode allie tradition et modernité ! Du boubou femme brodé (65 000 FCFA) à la robe wax tendance (45 000 FCFA), chaque pièce est unique. Pour l\'entretien, je recommande un lavage à la main à l\'eau froide pour préserver les couleurs.';
  }

  if (msg.includes('cheveux') || msg.includes('capillaire')) {
    return '💇🏾‍♀️ Pour les cheveux secs, je recommande notre huile de ricin (6 500 FCFA) pour la croissance et notre brume capillaire à la rose (8 500 FCFA) pour l\'hydratation quotidienne. L\'huile de coco bio (5 500 FCFA) est aussi excellente en masque avant-shampooing !';
  }

  if (msg.includes('prix') || msg.includes('tarif') || msg.includes('coûte') || msg.includes('combien')) {
    return '💰 Nos produits sont proposés à des prix accessibles, allant de 3 500 FCFA à 85 000 FCFA. Vous pouvez consulter notre catalogue complet sur didallah.shop/catalogue. Y a-t-il un produit spécifique qui vous intéresse ?';
  }

  if (msg.includes('livraison') || msg.includes('livrer')) {
    return '🚚 Nous livrons dans toute la région ! Les délais de livraison sont généralement de 24 à 72 heures. Pour plus de détails, contactez-nous directement sur WhatsApp.';
  }

  // Réponse générique
  return 'Merci pour votre question ! 🌟 Pour vous donner la meilleure réponse, je vous invite à consulter notre catalogue en ligne ou à nous contacter directement via WhatsApp. Nous sommes là pour vous aider à trouver le produit parfait !';
}
