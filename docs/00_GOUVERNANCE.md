# 00 — Gouvernance du projet DiDallah Shop

> Version : 1.0 · Date : 2026-05-18 · Auteur : Elhadji Abdoulaye Niass

---

## 1. Vision & Mission

**DiDallah Shop** est une boutique e-commerce sénégalaise spécialisée dans la beauté et la mode africaine, basée à Dakar. Elle allie tradition et modernité pour proposer des produits authentiques livrés en 48 h.

| Pilier | Énoncé |
|--------|--------|
| **Vision** | Devenir la référence de la mode et de la beauté africaine en ligne au Sénégal et en Afrique de l'Ouest |
| **Mission** | Rendre l'élégance africaine accessible au bout des doigts, avec une expérience d'achat fluide et digne de confiance |
| **Valeurs** | Authenticité · Qualité · Proximité · Innovation |

---

## 2. Structure organisationnelle

```
DiDallah Shop
└── Propriétaire & Directeur général : Elhadji Abdoulaye Niass
    ├── Développement & Design (interne)
    ├── Gestion des produits & stocks
    ├── Relation clients (WhatsApp)
    └── Logistique & livraison (partenaires)
```

---

## 3. Rôles et responsabilités

### 3.1 Propriétaire (Admin principal)

- Accès complet à l'interface admin (`/admin`)
- Validation de toutes les décisions produit et marketing
- Gestion des clés Supabase et des variables d'environnement Vercel
- Approbation finale de tout déploiement en production

### 3.2 Développeur (rôle technique)

- Développement des fonctionnalités (Next.js 15, Tailwind, Supabase)
- Maintenance du code source sur GitHub (`dallha/DiDllah-Shop`)
- Déploiements via Vercel (`npx vercel --prod`)
- Rédaction et mise à jour de cette documentation

### 3.3 Gestionnaire de contenu

- Mise à jour des textes, images et produits via `/admin/content` et `/admin/products`
- Gestion des fournisseurs via `/admin/suppliers`
- Suivi des commandes WhatsApp

---

## 4. Prises de décision

| Type de décision | Autorité | Délai |
|-----------------|----------|-------|
| Nouveau produit | Propriétaire | Immédiat |
| Changement de prix | Propriétaire | Immédiat |
| Nouvelle fonctionnalité majeure | Propriétaire + Dev | 48 h de validation |
| Déploiement urgent (hotfix) | Dev (notification propriétaire) | Immédiat |
| Changement de fournisseur | Propriétaire | 72 h de validation |
| Modification de la politique de données | Propriétaire | 7 jours |

---

## 5. Outils & stack décisionnelle

| Outil | Usage |
|-------|-------|
| **GitHub** (`dallha/DiDllah-Shop`) | Versionnement du code, historique |
| **Vercel** | Hébergement production (`didallah-shop.vercel.app`) |
| **Supabase** | Base de données, authentification, stockage |
| **WhatsApp** | Canal de vente et support client |
| **Canva / Figma** | Design graphique et maquettes |

---

## 6. Revues périodiques

| Fréquence | Revue |
|-----------|-------|
| Hebdomadaire | Commandes, stock, chiffre d'affaires |
| Mensuelle | Fournisseurs, marges, roadmap |
| Trimestrielle | Audit sécurité, mise à jour des dépendances |
| Annuelle | Révision complète de la gouvernance |

---

## 7. Gestion des conflits

En cas de désaccord technique ou stratégique :

1. Discussion directe entre les parties concernées
2. Rédaction d'un document de décision (ADR — Architecture Decision Record) dans `docs/archive/`
3. Décision finale revenant au propriétaire

---

## 8. Contacts

| Rôle | Contact |
|------|---------|
| Propriétaire | mr.niass@gmail.com |
| Site web | mrniass.pro |
| WhatsApp professionnel | Configuré dans `/admin/settings` |

---

*Ce document est révisé à chaque changement organisationnel majeur.*
