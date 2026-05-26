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


-- 3. Table des avis en attente de validation
-- ──────────────────────────────────────────────────────
create table if not exists pending_reviews (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  email      text,
  rating     integer     not null check (rating >= 1 and rating <= 5),
  product    text        not null,
  text       text        not null,
  status     text        not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table pending_reviews enable row level security;

-- Tout le monde peut insérer un avis (le formulaire public)
create policy "Insertion publique pending_reviews"
  on pending_reviews for insert
  with check (true);

-- Seuls les admins authentifiés peuvent lire/modifier/supprimer
create policy "Lecture admin pending_reviews"
  on pending_reviews for select
  using (auth.role() = 'authenticated');

create policy "Modification admin pending_reviews"
  on pending_reviews for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Suppression admin pending_reviews"
  on pending_reviews for delete
  using (auth.role() = 'authenticated');


-- 4. Vérifier que toutes les tables ont le RLS activé
-- ──────────────────────────────────────────────────────
-- Coller cette requête séparément pour contrôler :
--
-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public';
--
-- Toutes les lignes doivent avoir rowsecurity = true.


-- 5. (Optionnel) Pré-remplir les lignes de contenu
-- ──────────────────────────────────────────────────────
-- Le code le fait automatiquement au premier enregistrement,
-- mais vous pouvez le faire manuellement ici si besoin :
--
-- insert into site_settings (key, value)
-- values ('site_content', '{}'), ('site_images', '{}')
-- on conflict (key) do nothing;
