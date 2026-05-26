# 04 — Guide d'ingénierie

> Version : 1.0 · Date : 2026-05-18 · Auteur : Elhadji Abdoulaye Niass

---

## 1. Stack technique complète

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | Next.js (App Router) | 15.x |
| UI | React | 19.x |
| Langage | TypeScript | 5.x |
| Style | Tailwind CSS | 3.x |
| État global | Zustand (persist) | 4.x |
| Base de données | Supabase (PostgreSQL) | — |
| Auth | Supabase Auth | — |
| Hébergement | Vercel | — |
| Versionnement | GitHub | — |
| Images | Next.js Image + canvas compression | — |

---

## 2. Structure du projet

```
next-app/
├── app/                    # Pages et layouts (App Router)
│   ├── admin/              # Interface administration
│   ├── beaute/             # Page univers Beauté
│   ├── catalogue/          # Catalogue + fiches produits
│   ├── contact/            # Page contact
│   ├── facture/[id]/       # Génération de factures
│   ├── mode/               # Page univers Mode
│   ├── globals.css         # Styles globaux
│   ├── layout.tsx          # Layout racine
│   └── page.tsx            # Page d'accueil
├── components/             # Composants partagés
├── docs/                   # Documentation du projet
├── lib/                    # Utilitaires & logique métier
│   ├── cart-store.ts       # Store panier Zustand
│   ├── data.ts             # Types, données par défaut
│   ├── invoice.ts          # Génération de factures
│   ├── shop-store.ts       # Store principal Zustand
│   ├── supabase.ts         # Client Supabase serveur
│   ├── supabase-client.ts  # Client Supabase navigateur
│   └── use-hydrated.ts     # Hook hydratation store
├── public/                 # Fichiers statiques
├── .env.local              # Variables d'environnement (gitignore)
├── middleware.ts            # Protection des routes admin
├── next.config.mjs         # Configuration Next.js
├── tailwind.config.ts      # Configuration Tailwind
└── tsconfig.json           # Configuration TypeScript
```

---

## 3. Workflow Git

### 3.1 Branches

| Branche | Usage |
|---------|-------|
| `main` | Production — déploiement automatique sur Vercel |
| `feat/xxx` | Nouvelle fonctionnalité |
| `fix/xxx` | Correction de bug |
| `hotfix/xxx` | Correction urgente en production |

### 3.2 Convention de commits

Format : `type(scope): description courte`

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Refactoring sans changement fonctionnel |
| `style` | Changements UI/CSS uniquement |
| `docs` | Documentation |
| `chore` | Maintenance (dépendances, config) |
| `perf` | Amélioration des performances |

**Exemples :**
```bash
git commit -m "feat: bouton Commander WhatsApp direct sur chaque carte produit"
git commit -m "fix: compression auto images produits (suppression du blocage pre-compress)"
git commit -m "docs: création de la documentation initiale"
```

### 3.3 Workflow standard

```bash
# 1. Développer et tester localement
npm run dev

# 2. Vérifier les types
npm run build   # aucune erreur TypeScript tolérée

# 3. Committer
git add -A && git commit -m "feat: ..."

# 4. Pousser
git push

# 5. Déployer en production
npx vercel --prod
```

---

## 4. Développement local

### 4.1 Prérequis

- Node.js ≥ 20
- npm ≥ 10
- Compte Supabase avec les variables d'environnement

### 4.2 Installation

```bash
git clone https://github.com/dallha/DiDllah-Shop.git
cd "DiDllah-Shop/next-app"
npm install
cp .env.example .env.local   # remplir avec les vraies valeurs
npm run dev
```

### 4.3 Scripts disponibles

```bash
npm run dev      # Serveur de développement (localhost:3000)
npm run build    # Build de production + vérification TypeScript
npm run start    # Démarrer le build de production localement
npm run lint     # ESLint
```

---

## 5. Base de données Supabase

### 5.1 Tables

| Table | Description | Colonnes clés |
|-------|-------------|---------------|
| `site_settings` | Paramètres du site (clé/valeur JSON) | `key`, `value`, `updated_at` |
| `fournisseurs` | Fournisseurs | `nom`, `contact_principal`, `montant_paiement`, `type_paiement`, `mode_paiement`, `date_reception`, `montant_verse` |

### 5.2 Structure `site_settings`

```sql
CREATE TABLE site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Clés utilisées :
- `site_content` — textes du site
- `site_images` — images (data URLs)
- `brand` — paramètres de marque
- `products` — catalogue de produits

### 5.3 Structure `fournisseurs`

```sql
CREATE TABLE fournisseurs (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom               TEXT NOT NULL,
  contact_principal TEXT,
  ville             TEXT,
  pays              TEXT DEFAULT 'Sénégal',
  categorie         TEXT,
  montant_paiement  NUMERIC,
  montant_verse     NUMERIC,
  type_paiement     TEXT,   -- 'cash' | 'acompte' | 'credit'
  mode_paiement     TEXT,   -- 'wave' | 'orange_money' | 'liquide'
  date_reception    DATE,
  notes             TEXT,
  actif             BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);
```

### 5.4 Migrations importantes

```sql
-- Ajout colonnes fournisseurs (v1.1)
ALTER TABLE fournisseurs
  ADD COLUMN IF NOT EXISTS montant_verse  NUMERIC,
  ADD COLUMN IF NOT EXISTS date_reception DATE;
```

---

## 6. Supabase Sync — Architecture

```
┌─────────────────────┐
│  localStorage       │ ← Zustand persist (images stripées)
└────────┬────────────┘
         │ rehydrate() au montage
         ▼
┌─────────────────────┐
│  Zustand Store      │ ← Source de vérité côté client
└────────┬────────────┘
         │ SupabaseSync écrase au montage
         ▼
┌─────────────────────┐
│  Supabase           │ ← Source de vérité globale
└─────────────────────┘
```

Règles :
- **Lecture** : automatique au montage via `SupabaseSync`
- **Écriture** : explicite via `saveAllToSupabase()` (bouton Enregistrer)
- **Images** : jamais dans localStorage → toujours depuis Supabase

---

## 7. Compression d'images

Pipeline dans `compressImage(file)` :

```
File → FileReader → img.onload → Canvas → toDataURL(jpeg, 0.85)
       ↓                                   ↓
  HEIC détecté                    Boucle qualité -= 0.05
  → erreur HEIC                   jusqu'à < 700 Ko
       ↓
  SVG → readAsDataURL direct
```

Constantes :
- `MAX_IMAGE_BYTES = 700_000` (~700 Ko)
- `MAX_DIMENSION = 1400` px

---

## 8. Performance

### 8.1 Images

- `next/image` avec `unoptimized` pour les data URLs
- Compression canvas avant stockage
- `priority` sur les images above-the-fold

### 8.2 Store

- `partialize` dans Zustand pour exclure les data URLs du localStorage
- `sessionStorage` pour les images produits en attente (survit aux rechargements iOS)

### 8.3 Build

```bash
npm run build
# Vérifier :
# - Taille des chunks JS
# - Erreurs TypeScript (zéro tolérance)
# - Warnings Next.js
```

---

## 9. Déploiement

### 9.1 Vercel

```bash
# Première fois
npx vercel login
npx vercel --prod

# Déploiements suivants
npx vercel --prod
```

### 9.2 Variables d'environnement Vercel

Configurer dans **Vercel Dashboard → Project → Settings → Environment Variables** :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (si utilisé côté serveur)

### 9.3 Domaine

- Production : `didallah-shop.vercel.app`
- Domaine personnalisé : configurable dans Vercel → Domains

---

## 10. Règles TypeScript

- **Pas de `any`** — utiliser `unknown` + type narrowing
- Types centralisés dans `lib/data.ts`
- Types du store dans `lib/shop-store.ts`
- Toujours typer les props des composants
- `strict: true` dans `tsconfig.json`

---

*Ce document est mis à jour à chaque changement technique majeur.*
