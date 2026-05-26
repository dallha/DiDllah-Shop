# 🛍️ DiDallah Shop — Next.js SaaS E-Commerce

Bienvenue sur le dépôt de **DiDallah Shop**, une plateforme e-commerce moderne et mobile-first, conçue pour offrir une expérience d'achat fluide et élégante, spécialisée dans les univers de la **Beauté** et de la **Mode**.

Ce projet propose une architecture moderne et performante basée sur **Next.js 15**, **Tailwind CSS**, **Zustand** et **Supabase**.

---

## ✨ Fonctionnalités Publiques & Expérience Utilisateur

### 🌐 Boutique E-Commerce Fluide
*   **Vitrine dynamique & responsive** : Interface conçue avec une approche mobile-first et un design soigné (effets de flou, animations subtiles, transitions fluides).
*   **Navigation par Univers** : Sections dédiées aux univers **Beauté** (cosmétiques, soins) et **Mode** (vêtements, accessoires) avec filtrage dynamique des catégories.
*   **Panier d'achat réactif** : Gestion du panier d'achat en temps réel via un Drawer latéral avec calcul automatique des totaux.
*   **Achat WhatsApp Express** : Commande simplifiée en un clic depuis les fiches produits ou le panier, avec affichage d'une modale de confirmation reprenant le détail des articles et génération automatique du message WhatsApp prérempli.

### 🛡️ Console d'Administration & Gestion du Contenu
*   **Gestion des Produits** : Interface sécurisée pour l'ajout, la modification et la suppression des fiches produits, des catégories et du suivi des stocks.
*   **Compression Client Canvas** : Optimisation automatique de la taille des images lors de l'upload grâce à la Canvas API (avec gestion robuste des formats d'images mobiles HEIC/HEIF).
*   **Éditeur de Contenu (CMS)** : Panneau d'édition intuitif structuré pour mettre à jour en temps réel les logos, bannières, badges et textes promotionnels du site.

### 📄 Générateur de Factures
*   **Factures de Commande** : Génération de fiches récapitulatives de commandes prêtes pour l'impression ou l'export PDF (avec styles d'impression CSS spécifiques).

---

## 🛠️ Architecture Technique Simplifiée

Le projet respecte une structure modulaire, propre et évolutive :

*   `app/` : L'ossature de l'application utilisant le **App Router** de Next.js (pages publiques, console d'administration sécurisée, fiches produits et espace facturation).
*   `components/` : Composants UI hautement réutilisables (`ProductCard`, `CartDrawer`, `Header`...).
*   `lib/` : Logique métier, types, hooks de rendu et clients de connexion.
    *   `data.ts` : Structures de données initiales et helpers d'URL.
    *   `invoice.ts` : Générateur de fiches récapitulatives de commandes.
    *   `shop-store.ts` : Gestion d'état global réactive avec Zustand (gestion du panier, persistance locale et prévention de saturation du stockage).
    *   `supabase-client.ts` / `supabase-server.ts` : Initialisation des clients de base de données.

---

## 🚀 Démarrage Rapide

### 📋 Prérequis

*   **Node.js** v18+ installé.
*   Un projet **Supabase** configuré.

### 🔌 Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet `next-app` (basé sur le fichier `.env.local.example`) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votresubdomain.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
```

### ⚡ Installation et Lancement

1.  **Installer les dépendances** :
    ```bash
    npm install
    ```

2.  **Initialiser la Base de Données** :
    Exécutez le script d'initialisation de schéma `supabase-setup.sql` dans votre console afin de configurer les tables et les politiques d'accès de base.

3.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```
    L'application sera accessible sur `http://localhost:3000`.

---

## 🔒 Bonnes Pratiques Appliquées

*   **Optimisation du Stockage Local** : Les données lourdes d'images sont exclues du cache local pour éviter toute saturation de mémoire du navigateur.
*   **Sécurité des Données** : Utilisation des politiques d'accès sécurisées au niveau de la base de données. Seuls les comptes d'administration authentifiés ont l'autorisation de modifier les produits et configurations du site.
*   **Hydratation Sécurisée** : Rendu asynchrone sécurisé pour éliminer tout clignotement ou erreur de chargement lors de la synchronisation des données stockées.
