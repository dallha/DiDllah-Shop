-- =============================================================================
-- DiDallah Shop — Script d'initialisation de Base de Données Complet (Supabase)
-- Coller ce script dans : Supabase → SQL Editor → New query, puis cliquer sur RUN.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Table de configuration (contenu éditorial et images de marque)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table des Clients (utilisée pour le suivi CRM de l'administration)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  email        TEXT,
  city         TEXT,
  notes        TEXT, -- Stockage structuré: [Produits pris]: xxx \n [Quantité]: yyy
  total_orders INTEGER DEFAULT 0,
  total_spent  NUMERIC DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);

-- 3. Table de Trésorerie (suivi des paiements clients et règlements)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS paiements (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom                 TEXT NOT NULL,
  date_paiement       DATE NOT NULL DEFAULT current_date,
  montant_marchandise NUMERIC NOT NULL DEFAULT 0,
  paiement_comptant   NUMERIC NOT NULL DEFAULT 0,
  acompte             NUMERIC NOT NULL DEFAULT 0,
  mode_paiement       TEXT NOT NULL CHECK (mode_paiement IN ('Liquide', 'Wave', 'Orange Money')),
  credit              NUMERIC NOT NULL DEFAULT 0,
  notes               TEXT, -- Stockage structuré: [Marchandise]: xxx \n [Quantité]: yyy
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Table des Fournisseurs (suivi des achats en gros et engagements Hadara)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fournisseurs (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom               TEXT NOT NULL,
  contact_principal TEXT,
  ville             TEXT,
  pays              TEXT DEFAULT 'Sénégal',
  categorie         TEXT,
  montant_paiement  NUMERIC,
  montant_verse     NUMERIC,
  type_paiement     TEXT CHECK (type_paiement IN ('cash', 'acompte', 'credit')),
  mode_paiement     TEXT CHECK (mode_paiement IN ('wave', 'orange_money', 'liquide')),
  date_reception    DATE,
  notes             TEXT, -- Stockage structuré: [Produits fournis]: xxx
  actif             BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Table des Commandes (remplie à la création d'un panier d'achat public)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id), -- Liaison avec l'utilisateur authentifié ou invité
  client_name  TEXT NOT NULL,
  client_phone TEXT,
  products     TEXT, -- Descriptif en chaîne: "Robe × 1 \n Parfum × 2"
  total        NUMERIC DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'en_cours', 'livre', 'annule')),
  notes        TEXT,
  created_by_admin_id UUID REFERENCES auth.users(id), -- Conciergerie (Impersonation)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);

-- 6. Table de l'Inventaire Produits (source de vérité relationnelle)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY, -- Slug de l'identifiant (ex: 'parfum-femme-fleurs')
  name        TEXT NOT NULL,
  univers     TEXT NOT NULL CHECK (univers IN ('beaute', 'mode')),
  category    TEXT NOT NULL,
  price       NUMERIC NOT NULL DEFAULT 0,
  tag         TEXT,
  short       TEXT NOT NULL,
  long        TEXT NOT NULL,
  details     TEXT[] NOT NULL DEFAULT '{}', -- Caractéristiques clés
  image_url   TEXT, -- URL de l'image (CDNs ou Supabase storage)
  active      BOOLEAN DEFAULT true,
  embedding   vector(1536), -- Préparation IA
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

-- 7. Table des Webhook Events (Idempotence des paiements)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_events (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_event_id TEXT UNIQUE NOT NULL,
  provider          TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'processed',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Table des Avis en attente (témoignages soumis par les visiteurs)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pending_reviews (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT,
  rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  product    TEXT NOT NULL,
  text       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Table des Rôles Administrateurs (RBAC Granulaire)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_roles (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('super_admin', 'logistician', 'editor')),
  approved_by  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger pour injecter le rôle dans le JWT (Custom Claims)
CREATE OR REPLACE FUNCTION public.update_user_jwt_role()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('admin_role', NEW.role)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_admin_role_change ON admin_roles;
CREATE TRIGGER on_admin_role_change
AFTER INSERT OR UPDATE ON admin_roles
FOR EACH ROW EXECUTE FUNCTION public.update_user_jwt_role();

-- Fonction de nettoyage des invités (Fantômes) via pg_cron
SELECT cron.schedule('purge-guests', '0 3 * * *', $$
  DELETE FROM auth.users 
  WHERE is_anonymous = true 
  AND created_at < now() - interval '30 days' 
  AND id NOT IN (SELECT user_id FROM public.orders WHERE status = 'PAID' AND user_id IS NOT NULL);
$$);

-- =============================================================================
-- 🔒 Activation du Row Level Security (RLS) sur toutes les tables
-- =============================================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Helper functions for RBAC via JWT Custom Claims
CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS boolean AS $$
BEGIN RETURN COALESCE((auth.jwt() -> 'app_metadata' ->> 'admin_role'), '') = 'super_admin'; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_logistician() RETURNS boolean AS $$
BEGIN RETURN COALESCE((auth.jwt() -> 'app_metadata' ->> 'admin_role'), '') IN ('super_admin', 'logistician'); END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_editor() RETURNS boolean AS $$
BEGIN RETURN COALESCE((auth.jwt() -> 'app_metadata' ->> 'admin_role'), '') IN ('super_admin', 'editor'); END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remplacement de is_admin() générique
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
BEGIN RETURN (auth.jwt() -> 'app_metadata' ->> 'admin_role') IS NOT NULL; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🛡️ Politiques d'accès Sécurisées (Sécurisé - Faille #8 résolue)
-- Seuls les administrateurs vérifiés (ayant le claim 'is_admin' à true dans leur JWT)
-- ont un accès total en écriture. Le storefront public a uniquement accès en lecture
-- aux configurations publiques et aux produits, et en insertion pour les commandes.

-- A. Table 'site_settings'
DROP POLICY IF EXISTS "Lecture publique site_settings" ON site_settings;
DROP POLICY IF EXISTS "Écriture admin site_settings" ON site_settings;

CREATE POLICY "Lecture publique site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Écriture admin site_settings" ON site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- B. Table 'customers' (100% administrative / CRM)
DROP POLICY IF EXISTS "Acces Admin Clients" ON customers;
CREATE POLICY "Acces Admin Clients" ON customers FOR ALL USING (public.is_logistician()) WITH CHECK (public.is_logistician());

-- C. Table 'paiements' (100% administrative)
DROP POLICY IF EXISTS "Acces Admin Tresorerie" ON paiements;
CREATE POLICY "Acces Admin Tresorerie" ON paiements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- D. Table 'fournisseurs' (100% administrative)
DROP POLICY IF EXISTS "Acces Admin Fournisseurs" ON fournisseurs;
CREATE POLICY "Acces Admin Fournisseurs" ON fournisseurs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- E. Table 'products' (Lecture publique, écriture admin)
DROP POLICY IF EXISTS "Lecture Publique Produits" ON products;
DROP POLICY IF EXISTS "Modif Admin Produits" ON products;

CREATE POLICY "Lecture Publique Produits" ON products FOR SELECT USING (true);
CREATE POLICY "Modif Admin Produits" ON products FOR ALL USING (public.is_editor()) WITH CHECK (public.is_editor());

-- F. Table 'orders' (Client voit ses commandes, Admin voit tout)
DROP POLICY IF EXISTS "Lecture Admin Commandes" ON orders;
DROP POLICY IF EXISTS "Insertion Publique Commandes" ON orders;
DROP POLICY IF EXISTS "Modification Admin Commandes" ON orders;
DROP POLICY IF EXISTS "Lecture Commandes" ON orders;
DROP POLICY IF EXISTS "Insertion Commandes" ON orders;
DROP POLICY IF EXISTS "Modification Commandes" ON orders;

CREATE POLICY "Lecture Commandes" ON orders FOR SELECT USING (auth.uid() = user_id OR public.is_logistician());
CREATE POLICY "Insertion Commandes" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_logistician());
CREATE POLICY "Modification Commandes" ON orders FOR UPDATE USING (public.is_logistician()) WITH CHECK (public.is_logistician());

-- G. Table 'pending_reviews' (Insertion libre publique, gestion totale admin)
DROP POLICY IF EXISTS "Insertion publique pending_reviews" ON pending_reviews;
DROP POLICY IF EXISTS "Lecture admin pending_reviews" ON pending_reviews;
DROP POLICY IF EXISTS "Modification admin pending_reviews" ON pending_reviews;
DROP POLICY IF EXISTS "Suppression admin pending_reviews" ON pending_reviews;

CREATE POLICY "Insertion publique pending_reviews" ON pending_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Lecture admin pending_reviews" ON pending_reviews FOR SELECT USING (public.is_editor());
CREATE POLICY "Modification admin pending_reviews" ON pending_reviews FOR UPDATE USING (public.is_editor()) WITH CHECK (public.is_editor());
CREATE POLICY "Suppression admin pending_reviews" ON pending_reviews FOR DELETE USING (public.is_super_admin());

-- H. Table 'webhook_events' (100% administrative / interne via service_role)
DROP POLICY IF EXISTS "Acces interne webhook_events" ON webhook_events;
CREATE POLICY "Acces interne webhook_events" ON webhook_events FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================================================
-- 📦 Configuration du Bucket de Stockage pour les images du site
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Lecture publique images" ON storage.objects;
CREATE POLICY "Lecture publique images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "Upload authentifie images" ON storage.objects;
CREATE POLICY "Upload authentifie images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-images' AND public.is_admin());

DROP POLICY IF EXISTS "Remplacement authentifie images" ON storage.objects;
CREATE POLICY "Remplacement authentifie images" ON storage.objects FOR UPDATE USING (bucket_id = 'site-images' AND public.is_admin());

DROP POLICY IF EXISTS "Suppression authentifie images" ON storage.objects;
CREATE POLICY "Suppression authentifie images" ON storage.objects FOR DELETE USING (bucket_id = 'site-images' AND public.is_admin());
