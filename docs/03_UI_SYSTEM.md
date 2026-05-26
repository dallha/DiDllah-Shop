# 03 — Système UI

> Version : 1.0 · Date : 2026-05-18 · Auteur : Elhadji Abdoulaye Niass

---

## 1. Stack technique UI

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 15 (App Router) | Framework React SSR/SSG |
| React | 19 | Bibliothèque UI |
| Tailwind CSS | 3.x | Styles utilitaires |
| TypeScript | 5.x | Typage statique |
| Zustand | 4.x | État global (store) |

---

## 2. Architecture des composants

```
components/
├── AdminSidebar.tsx       # Navigation admin
├── CartDrawer.tsx         # Panier latéral
├── ContactPageClient.tsx  # Page contact (client)
├── Header.tsx             # En-tête du site
├── ProductCard.tsx        # Carte produit (catalogue)
├── StoreHydrator.tsx      # Hydratation Zustand
├── SupabaseSync.tsx       # Sync Supabase ↔ store
├── UniverseProductsClient.tsx # Produits par univers
└── ui/
    └── Badge.tsx          # Badge générique

app/
├── admin/
│   ├── content/page.tsx   # Éditeur de contenu (onglets)
│   ├── customers/page.tsx # Clients
│   ├── login/             # Page de connexion admin
│   ├── orders/page.tsx    # Commandes
│   ├── payments/page.tsx  # Trésorerie
│   ├── products/page.tsx  # Gestion produits
│   ├── settings/page.tsx  # Paramètres
│   └── suppliers/page.tsx # Fournisseurs
├── beaute/                # Page univers Beauté
├── catalogue/             # Catalogue + fiche produit
├── contact/               # Page contact
├── facture/[id]/          # Factures
├── mode/                  # Page univers Mode
└── page.tsx               # Accueil
```

---

## 3. Tokens de design (Tailwind)

### 3.1 Border radius

| Classe | Valeur | Usage |
|--------|--------|-------|
| `rounded-full` | 9999 px | Boutons, badges, tags |
| `rounded-3xl` | 24 px | Cartes admin, modales |
| `rounded-[2rem]` | 32 px | Cartes produits |
| `rounded-2xl` | 16 px | Inputs, sous-cartes |
| `rounded-xl` | 12 px | Filtres, éléments secondaires |

### 3.2 Ombres

| Classe | Usage |
|--------|-------|
| `shadow-soft` | Cartes produits (ombre légère) |
| `shadow-sm` | Cartes admin |
| `shadow-lg` | Headers admin |
| `shadow-xl` | Cartes au hover |
| `shadow-2xl` | Modales |

### 3.3 Espacement standard

| Contexte | Padding |
|---------|---------|
| Page principale | `px-6 py-8 sm:px-10` |
| Carte admin | `p-6` ou `p-8` |
| Bouton principal | `px-6 py-3` ou `px-5 py-2.5` |
| Input | `px-4 py-3` |
| Badge | `px-2.5 py-0.5` |

---

## 4. Composants réutilisables

### 4.1 Bouton principal

```tsx
<button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-slate-800 hover:to-slate-700">
  Action
</button>
```

### 4.2 Bouton secondaire (outline)

```tsx
<button className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
  Action
</button>
```

### 4.3 Bouton destructeur

```tsx
<button className="inline-flex items-center rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 transition">
  Supprimer
</button>
```

### 4.4 Bouton Commander (WhatsApp)

```tsx
<button className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
  <WhatsAppIcon /> Commander
</button>
```

### 4.5 Input texte

```tsx
<input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition" />
```

### 4.6 Badge

```tsx
// Variantes : 'brand' | 'success' | 'warning' | 'error'
<Badge variant="brand">Premium</Badge>
```

### 4.7 Eyebrow (texte au-dessus d'un titre)

```tsx
<p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-700">
  Sous-titre
</p>
```

### 4.8 Section card (admin)

```tsx
<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <p className="font-semibold text-slate-900 mb-5">Titre</p>
  {/* contenu */}
</div>
```

---

## 5. Store Zustand

### 5.1 Structure du store principal (`lib/shop-store.ts`)

```typescript
type ShopState = {
  // Contenu du site (textes)
  siteContent: SiteContent;
  setSiteContentDeep: (updater: (prev: SiteContent) => SiteContent) => void;
  resetSiteContent: () => void;

  // Images (data URLs)
  siteImages: SiteImages;
  setSiteImages: (patch: Partial<SiteImages>) => void;
  resetSiteImages: () => void;

  // Paramètres de la marque
  brand: ShopSettings;
  setBrand: (patch: Partial<ShopSettings>) => void;

  // Produits
  products: Product[];
  setProducts: (products: Product[]) => void;

  // Hydratation
  _hydrated: boolean;
};
```

### 5.2 Règles du store

- **`siteImages`** : les data URLs sont **stripées du localStorage** via `partialize` (trop volumineuses). Elles arrivent exclusivement depuis Supabase via `SupabaseSync`.
- **`products.imageUrl`** : même règle — stripée du localStorage, chargée depuis Supabase.
- **`_hydrated`** : flag mis à `true` par `onRehydrateStorage`. À vérifier avant de rendre du contenu dépendant du store.

### 5.3 Store panier (`lib/cart-store.ts`)

```typescript
type CartState = {
  isOpen: boolean;
  items: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  totalAmount: () => number;
};
```

---

## 6. Responsive design

| Breakpoint | Tailwind | Largeur |
|-----------|---------|---------|
| Mobile | (défaut) | < 640 px |
| Tablet | `sm:` | ≥ 640 px |
| Desktop | `md:` | ≥ 768 px |
| Large | `lg:` | ≥ 1024 px |
| XL | `xl:` | ≥ 1280 px |

Grille admin : `xl:grid-cols-[320px_1fr]` (sidebar 320 px + contenu)

---

## 7. Patterns UX récurrents

### 7.1 Modale de confirmation

Pattern utilisé pour : suppression, redirection WhatsApp, actions irréversibles

```
Overlay backdrop-blur-sm → Carte centrée max-w-sm rounded-3xl → Titre + Description + Boutons
```

### 7.2 Formulaire avec sauvegarde

Pattern des pages admin :

```
Header (titre + bouton Enregistrer) → [dirty ? amber : success badge] → Contenu éditable → Enregistrement via saveAllToSupabase()
```

### 7.3 Upload d'image

Flux : `<input type="file" hidden>` → détection HEIC → SVG direct → canvas compression → data URL → store → Supabase

### 7.4 Onglets latéraux (page Contenu)

```
div.flex → nav.w-44 (onglets) + div.flex-1 (contenu actif)
```

---

## 8. Accessibilité

- Tous les boutons ont un `aria-label` explicite
- Les modales ont `role="dialog" aria-modal="true"`
- Les images ont un `alt` descriptif
- Focus visible : `focus-visible:ring-2 focus-visible:ring-brand-500`
- Navigation clavier : Echap ferme les modales et le drawer

---

*Ce document est mis à jour à chaque ajout de composant ou pattern majeur.*
