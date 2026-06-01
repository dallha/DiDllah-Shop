# 10 — Sauvegarde et restauration Supabase

> Version : 1.0 · Date : 2026-06-01

Ce document décrit le flux pour récupérer les données admin depuis la base Supabase de production vers le dépôt local.

## 1. Ce que couvre la sauvegarde

Le script `scripts/supabase-backup.mjs` exporte les tables utilisées par l'administration :

- `site_settings`
- `products`
- `orders`
- `customers`
- `stock`
- `fournisseurs`
- `paiements`
- `pending_reviews`
- `admin_roles`

Il exporte aussi le bucket Storage :

- `site-images`

## 2. Prérequis

Variables d'environnement requises :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Notes :

- Le script lit automatiquement `.env.local` si le fichier existe.
- La clé `SUPABASE_SERVICE_ROLE_KEY` doit rester locale et ne jamais être committée.
- Les fichiers d'export sont stockés dans `data/supabase-backups/`, dossier ignoré par Git.

## 3. Export depuis Supabase

Commande :

```bash
npm run supabase:export
```

Résultat :

- un dossier horodaté est créé dans `data/supabase-backups/`
- chaque table est exportée dans un fichier JSON
- les fichiers du bucket `site-images` sont copiés dans `storage/site-images/`
- un `manifest.json` est généré avec les noms de fichiers, les clés de conflit et les buckets exportés

Option utile :

```bash
node scripts/supabase-backup.mjs export --out data/supabase-backups/latest
```

## 4. Import vers Supabase

Commande :

```bash
npm run supabase:import -- --in data/supabase-backups/latest
```

Mode sans écriture :

```bash
node scripts/supabase-backup.mjs import --in data/supabase-backups/latest --dry-run
```

Le script utilise un `upsert` par table avec la clé de conflit appropriée.
Il restaure aussi les fichiers présents sous `storage/site-images/`.

## 5. Limites

- Si une table n'existe pas dans le projet Supabase courant, elle est ignorée avec un avertissement.
- Si le bucket `site-images` est vide, aucun média n'est exporté.

## 6. Usage recommandé

1. Exporter la prod avant toute manipulation.
2. Vérifier les JSON exportés.
3. Importer dans un environnement local de test si nécessaire.
4. Ne faire l'import en production qu'après validation.

## 7. Automatisation hebdomadaire

Le wrapper `scripts/weekly-supabase-backup.sh` lance un export complet et écrit les logs dans :

```bash
data/supabase-backups/weekly-backup.log
```

### Option cron

```cron
0 3 * * 1 /bin/sh /Users/mac/Documents/Mes\ Docs/code/DiDallah\ Shop/scripts/weekly-supabase-backup.sh
```

### Option launchd sur macOS

Crée un `plist` qui exécute :

```bash
/bin/sh /Users/mac/Documents/Mes\ Docs/code/DiDallah\ Shop/scripts/weekly-supabase-backup.sh
```

Puis charge-le avec `launchctl`.

### Import local ou staging

Pour importer un backup dans un environnement local ou staging qui pointe vers sa propre base Supabase :

```bash
npm run supabase:import -- --in data/supabase-backups/2026-06-01_02-21-18Z
```

Fais d'abord un test en `--dry-run` :

```bash
node scripts/supabase-backup.mjs import --in data/supabase-backups/2026-06-01_02-21-18Z --dry-run
```
