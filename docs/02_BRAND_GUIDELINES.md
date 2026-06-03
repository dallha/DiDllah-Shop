# 02 — Charte graphique & identité de marque

> Version : 1.0 · Date : 2026-05-18 · Auteur : Elhadji Abdoulaye Niass  
> Graphiste : Elhadji Abdoulaye Mouhamed Lamine Niass — La Hadara

---

## 1. Identité de marque

### 1.1 Nom & positionnement

| Élément | Valeur |
|---------|--------|
| **Nom commercial** | DiDallah Shop |
| **Univers** | Mode africaine · Beauté · Accessoires |
| **Territoire** | Dakar, Sénégal → Afrique de l'Ouest |
| **Positionnement** | Haut de gamme accessible — authenticité africaine moderne |
| **Tagline** | *L'élégance africaine, au bout des doigts* |
| **Promise** | Livraison en 48 h · Qualité garantie · Service WhatsApp |

### 1.2 Personnalité de marque

- **Élégante** — jamais vulgaire, toujours raffinée
- **Authentique** — ancrée dans la culture sénégalaise et africaine
- **Moderne** — alliant tradition et innovation numérique
- **Accessible** — chaleureuse, proche du client
- **Fiable** — sérieuse, professionnelle, ponctuelle

---

## 2. Palette de couleurs

### 2.1 Couleurs principales

| Nom | Hex | Tailwind | Usage |
|-----|-----|---------|-------|
| **Brand 900** (Bleu Hadara) | `#1e3a5f` | `brand-900` | Fond sombre, CTA principal |
| **Brand 700** | `#2d5a8e` | `brand-700` | Accents, liens |
| **Brand 600** | `#3b6fad` | `brand-600` | Boutons secondaires |
| **Brand 100** | `#dde8f5` | `brand-100` | Fonds légers, badges |

### 2.2 Couleurs neutres

| Nom | Hex | Usage |
|-----|-----|-------|
| **Slate 950** | `#0a0f1e` | Texte principal |
| **Slate 900** | `#0f172a` | Titres, boutons noirs |
| **Slate 500** | `#64748b` | Texte secondaire |
| **Slate 200** | `#e2e8f0` | Bordures |
| **Slate 50** | `#f8fafc` | Fonds de page |
| **Blanc** | `#ffffff` | Cartes, modales |

### 2.3 Couleurs sémantiques

| État | Couleur | Hex |
|------|---------|-----|
| Succès | Emerald | `#059669` |
| Erreur | Rose / Red | `#e11d48` |
| Avertissement | Amber | `#d97706` |
| Info | Blue | `#2563eb` |
| WhatsApp | Vert WhatsApp | `#16a34a` |

### 2.4 Dégradés signature

```css
/* Hero principal */
background: linear-gradient(135deg, #0a0f1e 0%, #1e3a5f 50%, #2d5a8e 100%);

/* Bouton CTA */
background: linear-gradient(to right, #0f172a, #1e293b);

/* Badge brand */
background: linear-gradient(135deg, #1e3a5f, #3b6fad);
```

---

## 3. Typographie

### 3.1 Police principale

**Inter** (Google Fonts) — Sans-serif moderne et lisible

| Style | Grammage | Taille | Usage |
|-------|---------|--------|-------|
| Display | 800 (ExtraBold) | 48–72 px | Titres hero |
| H1 | 700 (Bold) | 32–40 px | Titres de page |
| H2 | 600 (SemiBold) | 24–28 px | Sous-titres |
| H3 | 600 (SemiBold) | 18–22 px | Titres de section |
| Body | 400 (Regular) | 14–16 px | Corps de texte |
| Caption | 500 (Medium) | 11–12 px | Étiquettes, badges |

### 3.2 Hiérarchie typographique

- Les **eyebrows** (petits textes au-dessus des titres) sont en `uppercase tracking-[0.32em] text-brand-700 text-xs font-semibold`
- Les **titres** sont `font-bold tracking-tight text-slate-950`
- Les **corps** sont `text-slate-500 leading-6`

---

## 4. Logo

### 4.1 Logo principal

- Lettre **D** stylisée dans un cercle
- Version sombre : cercle `bg-gradient-to-br from-brand-600 to-brand-700`, lettre blanche
- Version claire : cercle `bg-white/10 border border-white/20`, lettre blanche (sur fonds sombres)

### 4.2 Règles d'utilisation

| ✅ Autorisé | ❌ Interdit |
|------------|------------|
| Logo sur fond blanc ou sombre | Logo sur fond coloré non validé |
| Espacement minimum autour du logo (= hauteur du logo × 0.5) | Déformer ou étirer le logo |
| Versions vectorielles (SVG) | Logo pixélisé ou flou |
| Taille minimum : 32 px de haut | Logo en dessous de 24 px |

### 4.3 Fichiers logo

Stockés dans **Admin → Contenu → Médias & Images → Logo du site**

Format recommandé : SVG transparent ou PNG sur fond transparent

Fichiers recommandés :
- `logo.svg` : symbole principal pour les usages carrés et l’icône de navigation.
- `logo-horizontal.svg` : version étendue pour les entêtes, bannières et supports marketing.

---

## 5. Iconographie

- Style : **Heroicons** (outline, strokeWidth 1.5–2)
- Taille standard en UI : 16–20 px (`h-4 w-4` à `h-5 w-5`)
- Icône WhatsApp : SVG fill personnalisé (voir composants)
- Pas d'icônes emoji dans les interfaces principales (sauf panneaux admin internes)

---

## 6. Images produits

| Critère | Standard |
|---------|---------|
| **Format** | JPEG ou WebP |
| **Résolution** | Minimum 800 × 800 px |
| **Ratio** | 1:1 (carré) pour les cartes produits |
| **Fond** | Neutre (blanc, gris clair, ou texture naturelle) |
| **Qualité** | Bien éclairé, net, professionnel |
| **Poids** | ≤ 700 Ko après compression automatique |

---

## 7. Ton éditorial

### 7.1 Voix de la marque

- **Proche et respectueux** — on tutoie sans être familier
- **Valorisant** — le client est roi, on célèbre son choix
- **Concis** — phrases courtes, directes, sans jargon
- **Inspirant** — évoque la beauté, l'identité, la fierté africaine

### 7.2 À éviter

- Termes trop formels ou froids (`ledit produit`, `susmentionné`)
- Anglicismes excessifs
- Promesses invérifiables (`meilleur du monde`, `unique au monde`)
- Langage agressif ou pressant (`Achetez MAINTENANT ou c'est trop tard !`)

### 7.3 Exemples de formulations

| ❌ Non | ✅ Oui |
|--------|--------|
| "Procédez à l'achat" | "Commander" |
| "Veuillez patienter" | "Chargement…" |
| "Erreur système" | "Un problème est survenu. Réessaie." |
| "Produit épuisé" | "Bientôt disponible" |

---

## 8. Applications

### 8.1 Site web

- Fond général : `bg-slate-50`
- Cartes : `bg-white rounded-[2rem] shadow-soft`
- Boutons principaux : fond `brand-900` ou dégradé sombre, texte blanc, `rounded-full`
- Boutons secondaires : `border border-slate-200 bg-white text-slate-700 rounded-full`

### 8.2 Communications WhatsApp

- Toujours commencer par une salutation (`Bonjour DiDallah Shop,`)
- Inclure le nom du produit, la quantité et le prix
- Format structuré et lisible (une ligne par article)

---

*Toute dérogation à cette charte doit être validée par le propriétaire.*

---

## 9. Le Concepteur Graphique & Services

Toute l'identité de marque, le logo et les éléments de communication visuelle de **DiDallah Shop** sont protégés par le droit d'auteur et ont été créés par :

**El Hadji Abdoulaye Niass (Graphiste de la Hadara)**

En tant que designer graphique, il combine une approche esthétique moderne avec la richesse de notre héritage culturel pour créer des identités visuelles fortes et mémorables pour les entreprises, les institutions et les particuliers.

### 9.1 Services & Packages Professionnels

1. **Identité Visuelle & Logo** (La fondation de votre marque) :
   - Recherche & Concepts : 3 propositions de logo initiales.
   - Révisions : Jusqu'à 3 cycles de modifications pour affiner le design.
   - Fichiers finaux : Livraison du logo en différents formats (PNG, JPG, SVG, PDF).
   - *Tarif* : À partir de 60 000 FCFA.

2. **Communication Visuelle** (Pour faire passer votre message avec impact) :
   - Affiches & Flyers : Création de designs pour vos événements ou campagnes.
     - *Tarif événementiel* : 30 000 FCFA (flyer ou affiche simple).
     - *Tarif business* : 50 000 FCFA (design complexe orienté marketing).
   - Bâches & Bannières : Conception de supports publicitaires grand format.
     - *Tarif* : À partir de 45 000 FCFA.

3. **Packages "Booster"** (Offres complètes de lancement) :
   - *Starter Pack* : Logo + Charte graphique simple (couleurs, typographies) + Carte de visite.
   - *Event Pack* : Affiche ou flyer + Badge + Kakemono.

### 9.2 Processus de commande
- **Contact & Briefing** : Discussion autour du projet et des besoins.
- **Devis & Acompte** : Envoi du devis détaillé. Un acompte de 50 % est requis avant de commencer.
- **Création & Révisions** : Travail et soumission des propositions.
- **Validation & Livraison** : Règlement du solde restant et envoi des fichiers finaux.

### 9.3 Contacts & Réalisations
- **WhatsApp / Appel** : +221 77 623 27 41 | +221 76 375 63 63
- **Portfolio Behance** : [behance.net/mrniasse](https://www.behance.net/mrniasse)
- **Localisation** : Dakar, Sénégal

