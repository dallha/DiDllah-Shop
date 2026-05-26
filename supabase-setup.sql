-- ============================================================
-- DiDallah Shop — Setup Supabase
-- Coller ce script dans : Supabase → SQL Editor → New query
-- ============================================================

-- 1. Table de configuration (contenu du site + images)
-- ──────────────────────────────────────────────────────
create table if not exists site_settings (
  key        text        primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

-- Activer la sécurité niveau ligne (RLS)
alter table site_settings enable row level security;

-- Politique lecture publique (les visiteurs voient le contenu)
create policy "Lecture publique site_settings"
  on site_settings for select
  using (true);

-- ✅ CORRIGÉ (audit #3) — Écriture réservée aux utilisateurs authentifiés
-- Seul un admin connecté (via /admin/login) peut modifier le contenu.
drop policy if exists "Écriture authentifiée site_settings" on site_settings;

create policy "Écriture admin site_settings"
  on site_settings for all
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- 2. Bucket Supabase Storage pour les images du site
-- ──────────────────────────────────────────────────────
-- Créer le bucket dans Storage → New Bucket :
--   Nom : site-images
--   Public : oui (cocher "Public bucket")
--
-- Puis exécuter ces politiques :

-- Lecture publique sur le bucket (visiteurs peuvent voir les images)
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

create policy "Lecture publique images"
  on storage.objects for select
  using (bucket_id = 'site-images');

-- ✅ CORRIGÉ (audit #4) — Upload/modif/suppression réservés aux utilisateurs authentifiés
drop policy if exists "Upload authentifié images"       on storage.objects;
drop policy if exists "Remplacement authentifié images" on storage.objects;
drop policy if exists "Suppression authentifiée images" on storage.objects;

create policy "Upload authentifié images"
  on storage.objects for insert
  with check (
    bucket_id = 'site-images'
    and auth.role() = 'authenticated'
  );

create policy "Remplacement authentifié images"
  on storage.objects for update
  using (
    bucket_id = 'site-images'
    and auth.role() = 'authenticated'
  );

create policy "Suppression authentifiée images"
  on storage.objects for delete
  using (
    bucket_id = 'site-images'
    and auth.role() = 'authenticated'
  );


-- 3. Vérifier que toutes les tables ont le RLS activé
-- ──────────────────────────────────────────────────────
-- Coller cette requête séparément pour contrôler :
--
-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public';
--
-- Toutes les lignes doivent avoir rowsecurity = true.


-- 4. (Optionnel) Pré-remplir les lignes de contenu
-- ──────────────────────────────────────────────────────
-- Le code le fait automatiquement au premier enregistrement,
-- mais vous pouvez le faire manuellement ici si besoin :
--
-- insert into site_settings (key, value)
-- values ('site_content', '{}'), ('site_images', '{}')
-- on conflict (key) do nothing;
