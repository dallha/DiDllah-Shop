# 06 — Procédures administratives

> Version : 1.0 · Date : 2026-05-18 · Auteur : Elhadji Abdoulaye Niass

---

## 1. Accès à l'administration

### 1.1 Connexion

1. Aller sur `didallah-shop.vercel.app/admin/login`
2. Saisir l'email et le mot de passe admin
3. Cliquer sur **Se connecter →**
4. Vous êtes redirigé vers le tableau de bord `/admin`

### 1.2 Déconnexion

- Toujours se déconnecter après chaque session sur un appareil partagé
- La session expire automatiquement (durée configurée dans Supabase Auth)

---

## 2. Gestion des produits (`/admin/products`)

### 2.1 Ajouter un produit

1. Cliquer sur **+ Nouveau produit**
2. Remplir les champs :
   - **Nom** *(obligatoire)* — nom commercial du produit
   - **Univers** — Beauté ou Mode
   - **Catégorie** — choisir dans la liste ou créer une nouvelle
   - **Prix (FCFA)** *(obligatoire)* — prix de vente au client
   - **Tag** — ex : Nouveau, Promo, Best-seller
   - **Description courte** — max 150 caractères, visible sur la carte
   - **Description longue** — détails, matières, dimensions
   - **Image** — JPEG/PNG/WebP, compression automatique
3. Cliquer sur **💾 Enregistrer**

### 2.2 Modifier un produit

1. Sélectionner le produit dans la liste de gauche
2. Modifier les champs souhaités à droite
3. Pour l'image : cliquer sur **📁 Changer** ou glisser-déposer
4. Cliquer sur **💾 Enregistrer**

### 2.3 Archiver un produit

- Décocher **Produit actif** dans le formulaire → le produit n'apparaît plus sur le site
- Ne jamais supprimer définitivement un produit ayant des commandes historiques

### 2.4 Formats d'image acceptés

| Format | Support |
|--------|---------|
| JPEG / JPG | ✅ Recommandé |
| PNG | ✅ OK |
| WebP | ✅ OK |
| SVG | ✅ Logo uniquement |
| HEIC / HEIF | ❌ Non supporté |

> **iPhone** : Réglages → Appareil photo → Format → **« Le plus compatible »** pour obtenir du JPEG.

---

## 3. Gestion du contenu (`/admin/content`)

L'éditeur de contenu est organisé en **6 onglets** :

### 3.1 🖼️ Médias & Images

| Champ | Description |
|-------|-------------|
| Logo du site | PNG ou SVG transparent, hauteur 40 px |
| Hero Accueil | 1920 × 1080 px recommandé |
| Hero Beauté | 1920 × 600 px recommandé |
| Hero Mode | 1920 × 600 px recommandé |
| Hero Dashboard admin | 1920 × 500 px recommandé |
| Image Connexion admin | 1200 × 1800 px recommandé (portrait) |

### 3.2 🏠 Accueil

- Hero : badge, sous-titre, boutons CTA
- Cartes statistiques : ajouter/supprimer/modifier (minimum 1)
- Section "Produits phares" : eyebrow, titre, CTA
- Section "Nos univers" : titre + blocs Beauté et Mode
- Bannière CTA finale : titre, sous-titre, 2 boutons

### 3.3 ✨ Beauté & 👗 Mode

Pour chaque univers :
- Hero : badge, titre, sous-titre, bouton
- Valeurs/engagements : ajouter/supprimer (emoji, titre, description)
- Bloc produits : titre, sous-titre, CTA catalogue
- Bandeau contact bas de page

### 3.4 📦 Catalogue

- En-tête : eyebrow, titre, sous-titre, libellé bouton retour
- Filtres : libellés Univers et Catégories
- État vide : texte affiché quand aucun produit trouvé
- Bannière CTA bas de page

### 3.5 📞 Contact

- En-tête : eyebrow, titre
- Bloc "Nous écrire" : titre, sous-titre
- Expédition : libellé et valeur affichée, bouton retour accueil

### 3.6 Enregistrement

> ⚠️ **Toujours cliquer sur 💾 Enregistrer** après chaque modification.  
> Les changements non enregistrés sont perdus à la fermeture de l'onglet.

---

## 4. Gestion des fournisseurs (`/admin/suppliers`)

### 4.1 Ajouter un fournisseur

1. Cliquer sur **+ Nouveau fournisseur**
2. Remplir :
   - **Nom** *(obligatoire)*
   - **Catégorie** (Tissus, Bijoux, Cosmétiques…)
   - **Ville**
   - **Contact principal** (numéro WhatsApp/téléphone)
3. Section **Paiement marchandise** :
   - **Montant total** en FCFA
   - **Type** : Cash / Acompte / À crédit
   - **Mode** : Wave / Orange Money / Liquide
   - Si Acompte ou À crédit : saisir le **Montant déjà versé** → le reste à payer s'affiche automatiquement
   - **Date de réception** de la marchandise
4. Cliquer sur **Ajouter le fournisseur**

### 4.2 Archiver un fournisseur

- Désactiver le toggle **Fournisseur actif** → le fournisseur passe en "Inactif"
- Les fournisseurs inactifs restent visibles avec le filtre "Inactifs"

### 4.3 Export Excel

- Bouton **↓ Excel** en haut à droite
- Exporte tous les fournisseurs filtrés (nom, contact, paiement, reste à payer, etc.)
- Format : `.xlsx` avec colonnes formatées

---

## 5. Paramètres (`/admin/settings`)

| Paramètre | Description |
|-----------|-------------|
| Nom de la boutique | Affiché dans le titre et les métadonnées |
| Tagline | Slogan affiché sur la page d'accueil |
| Numéro WhatsApp | Utilisé pour tous les boutons "Commander" |
| Email | Affiché sur la page contact |
| Adresse | Adresse physique de la boutique |
| Horaires | Horaires d'ouverture |

---

## 6. Commandes (`/admin/orders`)

### 6.1 Flux de commande

```
Client → [Commander via WhatsApp] → Confirmation modale → WhatsApp → Échange direct
```

Les commandes arrivent par WhatsApp. Le suivi se fait dans l'admin :

| Statut | Description |
|--------|-------------|
| **Nouveau** | Commande reçue, non traitée |
| **En préparation** | Produit préparé pour expédition |
| **Expédié** | En cours de livraison |
| **Livré** | Reçu par le client |
| **Annulé** | Commande annulée |

---

## 7. Trésorerie (`/admin/payments`)

- Vue des encaissements et dépenses
- Suivi du chiffre d'affaires
- Export Excel disponible

---

## 8. Procédures de sauvegarde

### 8.1 Sauvegarde manuelle des données

```bash
# Supabase → Table Editor → Chaque table → Export CSV
# Fréquence recommandée : hebdomadaire
```

### 8.2 Sauvegarde du code

- Le code est versionné sur GitHub : `github.com/dallha/DiDllah-Shop`
- Chaque `git push` crée un point de restauration

---

## 9. Checklist quotidienne (recommandée)

- [ ] Vérifier les nouvelles commandes WhatsApp
- [ ] Mettre à jour le statut des commandes en cours
- [ ] Vérifier les stocks bas et alerter les fournisseurs concernés
- [ ] Répondre aux clients en attente (délai max : 2 heures)

---

## 10. Checklist hebdomadaire

- [ ] Export Excel des fournisseurs
- [ ] Vérifier le reste à payer pour chaque fournisseur
- [ ] Mettre à jour les images et textes produits si nécessaire
- [ ] Vérifier les performances du site (Vercel Analytics)
- [ ] Sauvegarder les données Supabase (export CSV)

---

*Ce document est mis à jour à chaque nouvelle fonctionnalité admin.*
