# 08 — Roadmap produit

> Version : 1.0 · Date : 2026-05-18 · Auteur : Elhadji Abdoulaye Niass

---

## 1. Vision produit

DiDallah Shop évolue vers une plateforme e-commerce complète, fluide sur mobile, intégrant la vente directe WhatsApp, la gestion de stock en temps réel et une expérience client premium ancrée dans la culture sénégalaise.

---

## 2. État actuel — v1.0 (Mai 2026)

### ✅ Fonctionnalités en production

| Fonctionnalité | Statut |
|---------------|--------|
| Site public (accueil, beauté, mode, catalogue, contact) | ✅ Live |
| Fiche produit détaillée | ✅ Live |
| Panier avec drawer latéral | ✅ Live |
| Commande directe WhatsApp (carte + panier) | ✅ Live |
| Confirmation modale avant WhatsApp | ✅ Live |
| Admin — Gestion des produits | ✅ Live |
| Admin — Éditeur de contenu (onglets) | ✅ Live |
| Admin — Paramètres de marque | ✅ Live |
| Admin — Fournisseurs + paiement | ✅ Live |
| Admin — Commandes | ✅ Live |
| Admin — Trésorerie | ✅ Live |
| Admin — Clients | ✅ Live |
| Compression auto des images | ✅ Live |
| Sync Supabase (textes + images) | ✅ Live |
| Authentification admin sécurisée | ✅ Live |
| Images de fond personnalisables (admin) | ✅ Live |
| Export Excel fournisseurs | ✅ Live |
| Factures (`/facture/[id]`) | ✅ Live |

---

## 3. Roadmap — v1.1 (Juin–Juillet 2026)

### 🔄 En cours / Priorité haute

| Fonctionnalité | Description | Impact |
|---------------|-------------|--------|
| **Page Facture améliorée** | Accès depuis l'admin, génération PDF | ⭐⭐⭐ |
| **Suivi des stocks** | Quantité en stock par produit, alertes stock bas | ⭐⭐⭐ |
| **Historique des commandes** | Base de données des commandes WhatsApp | ⭐⭐⭐ |
| **Notifications WhatsApp** | Alerte automatique quand stock faible | ⭐⭐ |

### 📋 Planifié

| Fonctionnalité | Description | Impact |
|---------------|-------------|--------|
| **Variantes produits** | Tailles, couleurs par produit | ⭐⭐⭐ |
| **Promotions / Remises** | Prix barré, badge "Promo" | ⭐⭐ |
| **Mise en avant "Nouveau"** | Badge automatique sur nouveaux produits | ⭐⭐ |
| **Recherche avancée** | Filtres par prix, catégorie, univers | ⭐⭐ |
| **SEO amélioré** | Métadonnées dynamiques par produit | ⭐⭐ |

---

## 4. Roadmap — v1.2 (Août–Octobre 2026)

| Fonctionnalité | Description | Impact |
|---------------|-------------|--------|
| **Dashboard analytics** | CA, nombre de commandes, produits populaires | ⭐⭐⭐ |
| **Gestion des retours** | Suivi des retours et remboursements | ⭐⭐ |
| **Programme fidélité** | Points de fidélité pour clients réguliers | ⭐⭐ |
| **Catalogue PDF** | Génération d'un catalogue produit PDF | ⭐⭐ |
| **Multi-images par produit** | Galerie de photos par produit | ⭐⭐⭐ |
| **Domaine personnalisé** | didallahshop.sn ou didallah.shop | ⭐⭐ |

---

## 5. Vision long terme — v2.0 (2027)

| Fonctionnalité | Description |
|---------------|-------------|
| **Paiement en ligne** | Intégration Wave, Orange Money, carte bancaire |
| **Livraison tracking** | Suivi de livraison en temps réel |
| **App mobile** | Application iOS/Android dédiée |
| **Marketplace** | Permettre à d'autres vendeurs de référencer leurs produits |
| **IA recommandations** | Recommandations produits personnalisées |
| **Multi-langues** | Français + Wolof + Anglais |

---

## 6. Critères de priorisation

Les fonctionnalités sont priorisées selon :

| Critère | Poids |
|---------|-------|
| Impact sur les ventes | 40% |
| Faisabilité technique | 25% |
| Demande client | 20% |
| Valeur stratégique | 15% |

---

## 7. Processus de validation d'une nouvelle fonctionnalité

1. **Idée** → Documenter dans `docs/archive/ideas/`
2. **Évaluation** → Impact, effort, priorité
3. **Décision** → Propriétaire
4. **Développement** → Branche `feat/xxx`
5. **Test** → Développement local
6. **Déploiement** → `npx vercel --prod`
7. **Documentation** → Mettre à jour `CHANGELOG.md` et cette roadmap

---

## 8. Fonctionnalités écartées

| Fonctionnalité | Raison |
|---------------|--------|
| Avis clients publics | Risque de faux avis, complexité modération |
| Chatbot automatique | WhatsApp humain plus efficace pour DiDallah |
| Abonnement mensuel | Hors du modèle commercial actuel |

---

*Cette roadmap est révisée mensuellement selon les priorités business.*
