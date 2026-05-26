# 05 — Règles et standards du projet

> Version : 1.0 · Date : 2026-05-18 · Auteur : Elhadji Abdoulaye Niass

---

## 1. Objet

Ce document définit les règles non négociables qui régissent le développement, le design et l'exploitation de DiDallah Shop. Il sert de référence pour maintenir la cohérence et la qualité à long terme.

---

## 2. Règles de développement

### 2.1 Règles absolues (zéro exception)

| # | Règle |
|---|-------|
| R-01 | **Aucun secret** dans le code source (clés API, mots de passe) |
| R-02 | **Build sans erreur** TypeScript avant tout déploiement |
| R-03 | **RLS activé** sur toutes les tables Supabase |
| R-04 | **Pas de `any`** TypeScript — utiliser des types explicites |
| R-05 | **`.env.local` jamais commité** sur GitHub |
| R-06 | **Tester localement** (`npm run dev`) avant tout `git push` |

### 2.2 Règles de qualité du code

| # | Règle |
|---|-------|
| Q-01 | Un composant = une responsabilité unique |
| Q-02 | Les données du store ne doivent pas dépasser 5 Mo dans localStorage |
| Q-03 | Toute mutation de store passe par des setters typés |
| Q-04 | Les `useEffect` doivent avoir des dépendances exhaustives |
| Q-05 | Pas de `console.log` en production |
| Q-06 | Les images uploadées doivent toujours passer par `compressImage()` |
| Q-07 | Les messages d'erreur sont toujours en français, explicites et actionnables |

### 2.3 Règles de nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Composants | PascalCase | `ProductCard`, `CartDrawer` |
| Hooks | camelCase avec `use` | `useHydrated`, `useCartStore` |
| Fichiers composants | PascalCase.tsx | `AdminSidebar.tsx` |
| Fichiers utilitaires | kebab-case.ts | `shop-store.ts`, `use-hydrated.ts` |
| Variables | camelCase | `siteContent`, `brandWhatsapp` |
| Types | PascalCase | `Product`, `SiteImages`, `FormData` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_IMAGE_BYTES`, `DEFAULT_PAYS` |

---

## 3. Règles de design

### 3.1 Cohérence visuelle

| # | Règle |
|---|-------|
| D-01 | Respecter la palette de couleurs définie dans `02_BRAND_GUIDELINES.md` |
| D-02 | Les boutons sont toujours `rounded-full` |
| D-03 | Les cartes sont toujours `rounded-2xl` ou `rounded-3xl` |
| D-04 | Les inputs sont toujours `rounded-2xl` |
| D-05 | Le fond de page admin est toujours `bg-slate-50` |
| D-06 | Tout texte d'erreur est en `text-rose-600` ou `text-rose-700` |
| D-07 | Tout texte de succès est en `text-emerald-700` |
| D-08 | Les actions destructrices (supprimer) sont toujours en rouge avec confirmation |

### 3.2 Interactions

| # | Règle |
|---|-------|
| I-01 | Toute action irréversible doit afficher une confirmation |
| I-02 | Toute redirection externe (WhatsApp) doit afficher une confirmation |
| I-03 | Tout formulaire doit indiquer visuellement les champs obligatoires |
| I-04 | Les chargements doivent afficher un spinner ou un skeleton |
| I-05 | Les erreurs doivent être affichées près de l'action qui les a causées |

---

## 4. Règles de contenu

### 4.1 Produits

| # | Règle |
|---|-------|
| P-01 | Chaque produit doit avoir un nom, un prix et un univers définis |
| P-02 | La description courte (`short`) ne dépasse pas 150 caractères |
| P-03 | Les images produits sont au ratio 1:1 minimum |
| P-04 | Le prix est toujours en FCFA (XOF) |
| P-05 | Un produit sans image peut exister mais affiche "Photo à venir" |

### 4.2 Textes du site

| # | Règle |
|---|-------|
| T-01 | Les textes publics sont toujours en français |
| T-02 | Les titres ne contiennent pas de points finaux |
| T-03 | Les boutons CTA sont à l'impératif (`Commander`, `Voir`, `Découvrir`) |
| T-04 | Pas de fautes d'orthographe dans le contenu public (relecture obligatoire) |

---

## 5. Règles de données

### 5.1 Fournisseurs

| # | Règle |
|---|-------|
| F-01 | Le nom du fournisseur est obligatoire |
| F-02 | Le montant versé ne peut pas dépasser le montant total |
| F-03 | Le "Reste à payer" n'est affiché que pour les types Acompte et À crédit |
| F-04 | Un fournisseur inactif reste dans la base (pas de suppression définitive) |

### 5.2 Rétention des données

| Type de donnée | Durée de conservation |
|---------------|----------------------|
| Commandes | 5 ans |
| Fournisseurs | Durée de la relation + 3 ans |
| Logs d'erreurs | 90 jours |
| Images uploadées | Tant que le produit existe |

---

## 6. Règles de déploiement

| # | Règle |
|---|-------|
| Dep-01 | Jamais de déploiement le vendredi soir sans rollback plan |
| Dep-02 | Tester la page d'accueil et l'admin après chaque déploiement |
| Dep-03 | Vérifier que Supabase répond après chaque déploiement |
| Dep-04 | Documenter tout déploiement majeur dans `CHANGELOG.md` |
| Dep-05 | En cas d'erreur post-déploiement : rollback immédiat, diagnostic ensuite |

---

## 7. Règles de communication

| # | Règle |
|---|-------|
| C-01 | Les commits sont en français ou en anglais, toujours lisibles |
| C-02 | Les messages d'erreur utilisateur sont toujours en français |
| C-03 | La documentation technique (`docs/`) est en français |
| C-04 | Les commentaires dans le code sont en français |

---

*Ces règles font autorité. Toute dérogation doit être documentée et approuvée par le propriétaire.*
