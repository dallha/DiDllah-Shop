# 🛍️ DiDallah Shop

**E-commerce Sénégalais — Beauté & Mode**

DiDallah Shop est une plateforme e-commerce moderne dédiée aux produits de beauté et de mode, avec un ancrage fort dans l'artisanat sénégalais. Bazin, Wax, huiles naturelles, parfums — chaque produit raconte une histoire.

---

## ✨ Fonctionnalités

### 🌙 Mode Sombre Natif
- **Sélecteur Lune/Soleil** : Bascule instantanée entre mode Jour et Nuit
- **Palettes inversées** : Chaque couleur de marque (Nuit, Océan, Émeraude, Rubis, Or) dispose d'une version sombre optimisée
- **Persistance intelligente** : Le choix est sauvegardé dans le localStorage et respecte les préférences système
- **Styles complets** : Plus de 200 lignes CSS dédiées (fonds, textes, bordures, ombres, inputs, scrollbar)

### 🤖 Conseiller Virtuel IA
- **Assistant intelligent** : Chatbot flottant avec réponses contextuelles sur les produits
- **Mode dégradé** : Fonctionne sans clé API Gemini avec des réponses pré-définies pertinentes
- **Suggestions rapides** : Questions pré-écrites pour démarrer la conversation
- **Intégration Gemini 2.0 Flash** : Activation optionnelle via `GEMINI_API_KEY`

### 🔍 Recherche Instantanée (Cmd+K)
- **Raccourci clavier** : `Cmd+K` ou `Ctrl+K` pour ouvrir la recherche depuis n'importe quelle page
- **Filtrage temps réel** : Recherche par nom, description, catégorie ou univers
- **Navigation clavier** : Flèches ↑↓ pour naviguer, ↵ pour ouvrir
- **Miniatures produits** : Aperçu visuel avec prix et catégorie

### 🛒 Expérience d'Achat
- **Navigation par Univers** : Sections Beauté & Mode avec filtrage dynamique
- **Panier réactif** : Drawer latéral avec calcul automatique des totaux
- **Achat WhatsApp Express** : Commande en 1 clic avec message prérempli
- **Fiches produits détaillées** : Galerie, description, prix, disponibilité

### 👩‍🌾 Artisans & Communauté
- **Mise en avant des producteurs** : Coopératives de femmes, ateliers locaux
- **Avis clients vérifiés** : Témoignages authentiques avec photos avant/après
- **Barre de confiance** : Paiements sécurisés, livraison, retours

### 🛡️ Administration
- **Gestion des produits** : Ajout, modification, stocks
- **CMS intégré** : Bannières, logos, textes promotionnels
- **Compression d'images** : Optimisation automatique à l'upload
- **Générateur de factures** : Export PDF prêt à imprimer
- **Sauvegarde Supabase** : export/import des tables admin via `npm run supabase:export`
- **Backup local** : voir [README_LOCAL_BACKUP.md](README_LOCAL_BACKUP.md)

---

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

---

## 🛠️ Stack Technique

| Technologie | Utilisation |
|------------|-------------|
| Next.js 15 | Framework React (App Router) |
| Tailwind CSS | Design system & animations |
| Zustand | Gestion d'état (panier) |
| Supabase | Base de données & auth |
| TypeScript | Typage strict |

---

## 📦 Structure du Projet

```
app/          → Pages (catalogue, admin, factures)
components/   → Composants UI réutilisables
docs/         → Documentation technique
lib/          → Logique métier & stores
public/       → Images & assets statiques
site/         → Version statique du site
```

---

## 📄 Licence

Projet privé — Tous droits réservés © DiDallah Shop
