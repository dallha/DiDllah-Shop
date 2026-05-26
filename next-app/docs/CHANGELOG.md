# CHANGELOG — DiDallah Shop

Toutes les modifications notables sont documentées ici.  
Format : `[vX.Y.Z] - AAAA-MM-JJ`  
Types : `Ajouté` · `Modifié` · `Corrigé` · `Supprimé` · `Sécurité`

---

## [1.0.6] — 2026-05-18

### Ajouté
- Bouton **Commander via WhatsApp** directement sur chaque carte produit (vert, avec icône)
- Modale de confirmation avant redirection WhatsApp depuis les cartes produits
- Icône panier à côté du bouton Commander sur les cartes produits

### Modifié
- `ProductCard.tsx` : deux boutons d'action (Commander WhatsApp + Ajouter au panier)

---

## [1.0.5] — 2026-05-18

### Ajouté
- Section **paiement marchandise** dans la gestion des fournisseurs :
  - Montant total de la marchandise (FCFA)
  - Type de paiement : Cash / Acompte / À crédit (sélection visuelle par chips)
  - Mode de paiement : Wave / Orange Money / Liquide
  - Montant déjà versé (visible uniquement si Acompte ou À crédit)
  - **Reste à payer** affiché en rouge en temps réel (Acompte/Crédit uniquement)
  - Date de réception de la marchandise
- Récapitulatif visuel du paiement dans le formulaire fournisseur
- Stat "Engagements totaux" dans le tableau de bord fournisseurs
- Export Excel mis à jour avec les nouvelles colonnes paiement

### Modifié
- Fournisseurs : champ "Téléphone" renommé "Contact principal"
- Fournisseurs : champ "Contact principal" remplacé par le bloc paiement

### Supprimé
- Champ Email dans la fiche fournisseur

### Migration Supabase requise
```sql
ALTER TABLE fournisseurs
  ADD COLUMN IF NOT EXISTS montant_verse  NUMERIC,
  ADD COLUMN IF NOT EXISTS date_reception DATE;
```

---

## [1.0.4] — 2026-05-18

### Corrigé
- Compression d'images non appliquée dans `/admin/products` : les fichiers > 700 Ko étaient rejetés avant même la compression Canvas
- Ajout de `compressImage()` dans la page produits avec spinner de compression
- Le texte "max 700 Ko" remplacé par "compression auto"

---

## [1.0.3] — 2026-05-18

### Ajouté
- Page `/admin/content` redessinée avec **onglets latéraux** (Médias · Accueil · Beauté · Mode · Catalogue · Contact)
- Confirmation modale avant redirection WhatsApp depuis le panier (`CartDrawer`)

### Modifié
- Remplacement de l'ancien layout accordéon par un éditeur deux panneaux (nav 176 px + contenu)
- `CartDrawer` : bouton "Commander via WhatsApp" déclenche maintenant une modale de confirmation avec récapitulatif de commande

---

## [1.0.2] — 2026-05-18

### Corrigé
- `SupabaseSync` ne dépend plus du flag `hydrated` — chargement immédiat au montage
- `LoginClient` migré vers sélecteur réactif Zustand (image mise à jour sans rechargement)
- `AdminDashboardClient` : suppression du `hydrated &&` bloquant l'image réactive

### Ajouté
- Avertissement lockfile Next.js supprimé via `outputFileTracingRoot` dans `next.config.mjs`

---

## [1.0.1] — 2026-05-18

### Corrigé
- Erreur TypeScript build : `Property 'then' does not exist on type 'void | Promise<void>'` dans `LoginClient.tsx`
- Migration de `rehydrate().then()` vers `async/await`
- `QuotaExceededError` localStorage : `partialize` dans Zustand exclut désormais toutes les data URLs de `siteImages`

### Ajouté
- Détection explicite du format HEIC/HEIF avec message d'erreur clair et instructions
- Compression Canvas robuste avec codes d'erreur spécifiques (`DECODE_FAILED`, `READ_FAILED`, `CANVAS_ERROR`)
- Images de fond admin personnalisables :
  - Tableau de bord admin (`adminHeroDataUrl`)
  - Page de connexion admin (`adminLoginDataUrl`)

### Modifié
- `lib/data.ts` : types `stats` et `items` changés de tuples fixes en tableaux variables
- `app/page.tsx` : rendu des stats avec `.map()` et styles cycliques

---

## [1.0.0] — 2026-04-01 (estimé)

### Ajouté
- Site public : Accueil, Beauté, Mode, Catalogue, Contact
- Fiches produits (`/catalogue/[id]`)
- Panier avec drawer latéral
- Commande via WhatsApp
- Interface admin complète :
  - Authentification (`/admin/login`)
  - Tableau de bord (`/admin`)
  - Gestion des produits (`/admin/products`)
  - Éditeur de contenu (`/admin/content`)
  - Paramètres (`/admin/settings`)
  - Commandes (`/admin/orders`)
  - Trésorerie (`/admin/payments`)
  - Clients (`/admin/customers`)
  - Fournisseurs (`/admin/suppliers`)
- Synchronisation Supabase (textes, images, produits)
- Compression automatique des images (Canvas API)
- Persistance Zustand avec localStorage
- Génération de factures (`/facture/[id]`)
- Protection des routes admin via middleware Next.js

---

*Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)*
