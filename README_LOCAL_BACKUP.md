# Backup local Supabase

Ce document résume la sauvegarde et la restauration locales du projet DiDallah Shop.

## 1. Exporter la prod

Le backup se lance depuis la racine du projet :

```bash
npm run supabase:export
```

Résultat :

- les tables Supabase sont exportées dans `data/supabase-backups/<date>/`
- le bucket `site-images` est inclus si des fichiers existent
- un `manifest.json` est généré
- un log hebdomadaire est écrit dans `data/supabase-backups/weekly-backup.log`

## 2. Restaurer vers une base locale ou staging

Prépare d'abord un environnement cible avec ses variables Supabase, puis lance :

```bash
npm run supabase:import -- --in data/supabase-backups/<date>
```

Test sans écrire :

```bash
node scripts/supabase-backup.mjs import --in data/supabase-backups/<date> --dry-run
```

## 3. Lancer le backup hebdomadaire

```bash
npm run supabase:backup:weekly
```

Ce wrapper appelle `npm run supabase:export` et ajoute les entrées dans le log.

## 4. Fichiers utiles

- [scripts/supabase-backup.mjs](scripts/supabase-backup.mjs)
- [scripts/weekly-supabase-backup.sh](scripts/weekly-supabase-backup.sh)
- [docs/10_SUPABASE_BACKUP.md](docs/10_SUPABASE_BACKUP.md)

## 5. Rappel important

- Ne jamais committer `.env.local`
- Utiliser `SUPABASE_SERVICE_ROLE_KEY` uniquement en local ou sur un serveur de confiance
- Vérifier le `--dry-run` avant tout import réel
