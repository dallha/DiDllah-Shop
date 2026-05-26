# 01 — Sécurité

> Version : 1.0 · Date : 2026-05-18 · Auteur : Elhadji Abdoulaye Niass

---

## 1. Périmètre

Ce document couvre la sécurité de l'ensemble de la plateforme DiDallah Shop :
- Application Next.js (frontend + API routes)
- Base de données Supabase
- Hébergement Vercel
- Comptes tiers (GitHub, WhatsApp Business)

---

## 2. Authentification administrateur

### 2.1 Accès à l'interface admin

- URL : `/admin/login`
- Mécanisme : Supabase Auth (`signInWithPassword`)
- Session : cookie sécurisé géré par `@supabase/ssr`
- Middleware : `middleware.ts` protège toutes les routes `/admin/*`
- Redirection automatique vers `/admin/login?redirectTo=...` si non authentifié

### 2.2 Règles de mot de passe

| Critère | Exigence |
|---------|----------|
| Longueur minimale | 12 caractères |
| Complexité | Majuscule + chiffre + caractère spécial |
| Renouvellement | Tous les 6 mois |
| Réutilisation | 5 derniers mots de passe interdits |

### 2.3 Procédure en cas de compromission

1. Aller dans **Supabase Dashboard → Authentication → Users**
2. Réinitialiser le mot de passe immédiatement
3. Révoquer toutes les sessions actives
4. Changer les clés API si nécessaire
5. Documenter l'incident dans `09_INCIDENTS.md`

---

## 3. Variables d'environnement

### 3.1 Variables requises

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...          # Clé publique (côté client)
SUPABASE_SERVICE_ROLE_KEY=eyJ...              # Clé secrète (serveur uniquement, jamais exposée)
```

### 3.2 Règles absolues

- ❌ **Ne jamais** committer `.env.local` sur GitHub
- ❌ **Ne jamais** exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
- ✅ Stocker toutes les secrets dans **Vercel → Project Settings → Environment Variables**
- ✅ `.env.local` est dans `.gitignore` — toujours vérifier avant chaque commit

### 3.3 Rotation des clés

En cas de fuite suspectée :
1. Régénérer la clé dans Supabase Dashboard
2. Mettre à jour la variable dans Vercel
3. Redéployer (`npx vercel --prod`)

---

## 4. Sécurité de la base de données (Supabase)

### 4.1 Row Level Security (RLS)

Toutes les tables doivent avoir RLS activé. Policies recommandées :

```sql
-- Exemple : table fournisseurs (lecture uniquement pour les utilisateurs authentifiés)
ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins seulement" ON fournisseurs
  FOR ALL USING (auth.role() = 'authenticated');
```

### 4.2 Tables sensibles

| Table | Données sensibles | RLS requis |
|-------|------------------|------------|
| `fournisseurs` | Contacts, montants | ✅ Oui |
| `site_settings` | Config du site | ✅ Oui |
| `orders` | Commandes clients | ✅ Oui |

### 4.3 Sauvegardes

- Supabase effectue des sauvegardes automatiques quotidiennes (plan Pro)
- Exporter manuellement les données critiques chaque semaine via **Supabase → Table Editor → Export CSV**

---

## 5. Sécurité du code

### 5.1 Dépendances

```bash
# Vérifier les vulnérabilités avant chaque déploiement majeur
npm audit
npm audit fix
```

### 5.2 Règles de développement

- Toujours valider et assainir les entrées utilisateur (côté serveur)
- Ne jamais faire confiance aux données envoyées par le client
- Utiliser les types TypeScript stricts (pas de `any`)
- Les Server Actions doivent vérifier l'authentification avant toute mutation

### 5.3 En-têtes de sécurité HTTP

Configurés dans `next.config.mjs` :

```javascript
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

---

## 6. Accès GitHub

- Dépôt : `github.com/dallha/DiDllah-Shop`
- Branche principale : `main` (déploiement automatique sur Vercel)
- **Ne jamais** pousser directement sur `main` pour des changements majeurs sans test local
- Activer l'authentification à deux facteurs (2FA) sur le compte GitHub

---

## 7. Checklist de sécurité avant déploiement

- [ ] Aucun secret dans le code source
- [ ] `npm audit` sans vulnérabilités critiques
- [ ] Variables d'environnement à jour dans Vercel
- [ ] RLS activé sur les nouvelles tables Supabase
- [ ] Test de connexion admin fonctionnel
- [ ] Pas de `console.log` exposant des données sensibles

---

*Revoir ce document après chaque incident de sécurité et tous les trimestres.*
