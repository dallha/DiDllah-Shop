# 09 — Gestion des incidents

> Version : 1.0 · Date : 2026-05-18 · Auteur : Elhadji Abdoulaye Niass

---

## 1. Classification des incidents

| Niveau | Nom | Description | Exemples |
|--------|-----|-------------|---------|
| P0 | **Critique** | Site totalement inaccessible | Panne Vercel, erreur 500 générale |
| P1 | **Majeur** | Fonctionnalité clé dégradée | Paiement WhatsApp cassé, admin inaccessible |
| P2 | **Mineur** | Fonctionnalité secondaire dégradée | Image qui ne charge pas, filtre cassé |
| P3 | **Cosmétique** | Bug visuel sans impact fonctionnel | Mauvais alignement, couleur incorrecte |

---

## 2. Temps de réponse cibles

| Niveau | Détection | Première action | Résolution cible |
|--------|-----------|----------------|-----------------|
| P0 | < 5 min | < 15 min | < 2 h |
| P1 | < 30 min | < 1 h | < 4 h |
| P2 | < 2 h | < 4 h | < 24 h |
| P3 | < 1 jour | < 3 jours | Prochain sprint |

---

## 3. Procédure de réponse aux incidents

### Étape 1 — Détection & évaluation

```
1. Identifier le symptôme (message d'erreur, comportement anormal)
2. Évaluer l'impact (quelles pages ? quels utilisateurs ? depuis quand ?)
3. Classifier le niveau (P0 à P3)
4. Créer un enregistrement dans le journal ci-dessous
```

### Étape 2 — Diagnostic

```bash
# Vérifier les logs Vercel
# Aller dans : vercel.com → Projet → Deployments → Logs

# Vérifier le statut Supabase
# Aller dans : status.supabase.com

# Vérifier le dernier déploiement
git log --oneline -5

# Reproduire localement
npm run dev
```

### Étape 3 — Correction

**Option A — Rollback rapide (P0/P1)**
```bash
# Dans Vercel Dashboard → Deployments → choisir le dernier bon déploiement → "Redeploy"
# OU
git revert HEAD
git push
npx vercel --prod
```

**Option B — Hotfix (P0/P1)**
```bash
# Créer une branche hotfix
git checkout -b hotfix/description-du-probleme

# Corriger le bug
# Tester localement
npm run build

# Déployer
git add -A && git commit -m "hotfix: description du correctif"
git push
npx vercel --prod
```

**Option C — Fix standard (P2/P3)**
```bash
# Développer sur la branche courante ou une branche feat/
# Suivre le workflow Git standard
```

### Étape 4 — Vérification post-correction

- [ ] Tester la fonctionnalité affectée
- [ ] Tester les fonctionnalités adjacentes
- [ ] Vérifier les logs Vercel (pas d'erreur)
- [ ] Vérifier la connexion Supabase
- [ ] Tester sur mobile

### Étape 5 — Documentation

- Compléter le journal des incidents ci-dessous
- Mettre à jour `CHANGELOG.md`
- Si P0/P1 : rédiger un post-mortem dans `docs/archive/postmortems/`

---

## 4. Incidents connus et résolus

### INC-001 — QuotaExceededError localStorage
- **Date** : 2026-05-18
- **Niveau** : P1
- **Symptôme** : `QuotaExceededError: The quota has been exceeded` dans la console
- **Cause** : Les images (data URLs ~4 Mo) dépassaient la limite localStorage de 5 Mo
- **Résolution** : Implémentation de `partialize` dans Zustand — toutes les data URLs sont exclues du localStorage et chargées depuis Supabase uniquement
- **Fichiers modifiés** : `lib/shop-store.ts`

### INC-002 — Images admin non réactives après changement
- **Date** : 2026-05-18
- **Niveau** : P2
- **Symptôme** : Images de fond admin (dashboard + login) ne changeaient pas sans rechargement forcé
- **Cause** : `SupabaseSync` attendait le flag `hydrated`, `LoginClient` ne réagissait pas au store
- **Résolution** : 
  - `SupabaseSync` : suppression de la dépendance `hydrated`
  - `LoginClient` : migration vers sélecteur réactif Zustand
  - `AdminDashboardClient` : suppression du `hydrated &&` bloquant
- **Fichiers modifiés** : `SupabaseSync.tsx`, `LoginClient.tsx`, `AdminDashboardClient.tsx`

### INC-003 — Erreur TypeScript `then` sur `rehydrate()`
- **Date** : 2026-05-18
- **Niveau** : P1
- **Symptôme** : Build Vercel en erreur — `Property 'then' does not exist on type 'void | Promise<void>'`
- **Cause** : `useShopStore.persist.rehydrate()` retourne `void | Promise<void>`, chaînage `.then()` invalide
- **Résolution** : Migration vers `async/await` dans `LoginClient.tsx`
- **Fichiers modifiés** : `app/admin/login/LoginClient.tsx`

### INC-004 — Images iPhone HEIC rejetées avec erreur cryptique
- **Date** : 2026-05-18
- **Niveau** : P2
- **Symptôme** : "Impossible de lire l'image" pour des photos prises avec iPhone
- **Cause** : Format HEIC non supporté par le Canvas API des navigateurs
- **Résolution** : Détection explicite HEIC/HEIF avant compression + messages d'erreur spécifiques
- **Fichiers modifiés** : `app/admin/products/page.tsx`, `app/admin/content/page.tsx`

### INC-005 — Déploiement Vercel périmé (stale)
- **Date** : 2026-05-18
- **Niveau** : P1
- **Symptôme** : Vercel affichait l'ancien build malgré un commit GitHub
- **Cause** : Vercel nécessite un redéploiement manuel (`npx vercel --prod`) après reconnexion
- **Résolution** : Exécuter `npx vercel --prod` explicitement

### INC-006 — Compression images non appliquée dans /admin/products
- **Date** : 2026-05-18
- **Niveau** : P2
- **Symptôme** : "Image trop lourde (2721 Ko). Max 700 Ko." — rejet avant compression
- **Cause** : La page Produits bloquait les fichiers > 700 Ko avant même de tenter la compression Canvas
- **Résolution** : Remplacement du blocage par un appel à `compressImage()` + spinner de compression
- **Fichiers modifiés** : `app/admin/products/page.tsx`

---

## 5. Journal des incidents (à compléter)

| ID | Date | Niveau | Description | Statut | Résolu par |
|----|------|--------|-------------|--------|-----------|
| INC-001 | 2026-05-18 | P1 | QuotaExceededError localStorage | ✅ Résolu | shop-store.ts |
| INC-002 | 2026-05-18 | P2 | Images admin non réactives | ✅ Résolu | SupabaseSync + LoginClient |
| INC-003 | 2026-05-18 | P1 | Erreur TypeScript `then` rehydrate | ✅ Résolu | LoginClient.tsx |
| INC-004 | 2026-05-18 | P2 | HEIC non supporté | ✅ Résolu | products + content page |
| INC-005 | 2026-05-18 | P1 | Déploiement Vercel périmé | ✅ Résolu | `npx vercel --prod` |
| INC-006 | 2026-05-18 | P2 | Pas de compression dans /products | ✅ Résolu | products/page.tsx |

---

## 6. Contacts d'urgence

| Service | Contact | Usage |
|---------|---------|-------|
| Vercel Support | vercel.com/support | Panne hébergement |
| Supabase Support | supabase.com/support | Panne base de données |
| GitHub Support | support.github.com | Problème dépôt |
| Propriétaire | mr.niass@gmail.com | Décision de crise |

---

## 7. Checklist post-incident (P0/P1)

- [ ] Service rétabli et confirmé
- [ ] Cause racine identifiée
- [ ] Correctif déployé et testé
- [ ] Incident documenté dans ce fichier
- [ ] `CHANGELOG.md` mis à jour
- [ ] Mesures préventives identifiées
- [ ] Post-mortem rédigé si P0

---

*Ce document est mis à jour après chaque incident.*
