# 07 — Politique des données

> Version : 1.0 · Date : 2026-05-18 · Auteur : Elhadji Abdoulaye Niass

---

## 1. Préambule

DiDallah Shop s'engage à protéger les données de ses clients, partenaires et fournisseurs. Cette politique décrit quelles données sont collectées, comment elles sont utilisées, stockées et protégées.

---

## 2. Données collectées

### 2.1 Données des visiteurs

| Donnée | Source | Usage |
|--------|--------|-------|
| Panier (produits, quantités) | localStorage navigateur | Session d'achat uniquement |
| Préférences store (contenu, images) | localStorage + Supabase | Affichage du site |

> DiDallah Shop **ne collecte pas** de données personnelles identifiables des visiteurs (pas de formulaire d'inscription, pas de tracking individuel).

### 2.2 Données des clients (commandes WhatsApp)

Les commandes transitent via WhatsApp. Les données suivantes peuvent être visibles dans WhatsApp Business :
- Nom affiché WhatsApp
- Numéro de téléphone
- Contenu du message (produits commandés)

Ces données sont gérées par WhatsApp (Meta) selon leurs propres conditions d'utilisation.

### 2.3 Données stockées dans Supabase

| Table | Données | Accès |
|-------|---------|-------|
| `site_settings` | Textes, images, config | Admin uniquement |
| `fournisseurs` | Nom, contact, montants | Admin uniquement |

---

## 3. Stockage et sécurité

### 3.1 Architecture de stockage

```
Navigateur (localStorage)
├── Textes du site (siteContent)
├── Paramètres de marque (brand)
└── ❌ Pas d'images (stripées — trop lourdes)

Supabase (PostgreSQL — hébergé par Supabase Inc., USA)
├── site_settings (textes + images + config)
└── fournisseurs (données fournisseurs)

sessionStorage (temporaire, effacé à fermeture onglet)
└── Images produits en attente (upload iOS)
```

### 3.2 Chiffrement

- Toutes les communications avec Supabase sont chiffrées via **HTTPS/TLS**
- Les mots de passe sont hachés par Supabase Auth (bcrypt)
- Les variables d'environnement sont chiffrées dans Vercel

### 3.3 Accès aux données

| Qui | Accès |
|-----|-------|
| Propriétaire (admin authentifié) | Lecture + écriture complète |
| Visiteurs du site | Lecture du contenu public uniquement |
| Développeur | Accès en développement uniquement, pas en production directe |

---

## 4. Conservation des données

| Catégorie | Durée de conservation |
|-----------|----------------------|
| Données de configuration du site | Indéfiniment (tant que le site existe) |
| Données fournisseurs | Durée de la relation commerciale + 3 ans |
| Logs Vercel | 30 jours (politique Vercel) |
| Sauvegardes Supabase | 7 jours (plan gratuit) / 30 jours (plan Pro) |

---

## 5. Cookies et localStorage

### 5.1 Cookies utilisés

| Cookie | Finalité | Durée |
|--------|----------|-------|
| `sb-xxx-auth-token` | Session admin Supabase | Selon config Supabase |

### 5.2 localStorage utilisé

| Clé | Contenu | Durée |
|-----|---------|-------|
| `didallah:shop-settings:v1` | Textes, config (sans images) | Persistant |
| `didallah:cart:v1` | Panier de l'utilisateur | Persistant |

> Il n'y a **pas de cookies publicitaires** ni de trackers tiers sur DiDallah Shop.

---

## 6. Sous-traitants (third parties)

| Sous-traitant | Rôle | Données transmises | Pays |
|--------------|------|--------------------|------|
| **Vercel Inc.** | Hébergement | Logs de requêtes | USA |
| **Supabase Inc.** | Base de données | Données de configuration | USA |
| **GitHub Inc.** | Versionnement code | Code source uniquement | USA |
| **Meta (WhatsApp)** | Canal de vente | Commandes clients | USA |

---

## 7. Droits des personnes concernées

Dans le cadre du RGPD et des lois sénégalaises sur la protection des données (Loi n° 2008-12) :

| Droit | Comment l'exercer |
|-------|------------------|
| Accès | Contacter mr.niass@gmail.com |
| Rectification | Contacter mr.niass@gmail.com |
| Suppression | Contacter mr.niass@gmail.com |
| Portabilité | Export CSV disponible sur demande |

Délai de réponse : **30 jours maximum**

---

## 8. Incidents de données

En cas de violation ou fuite de données :
1. Identifier et contenir la fuite (voir `09_INCIDENTS.md`)
2. Évaluer les données compromises
3. Notifier les personnes concernées dans les **72 heures**
4. Documenter l'incident
5. Mettre en place les mesures correctives

---

## 9. Révisions de cette politique

Cette politique est révisée :
- Annuellement
- Après tout incident de sécurité
- Après tout changement technique majeur affectant les données

---

*Dernière révision : 2026-05-18*
