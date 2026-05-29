-- =============================================================================
-- DiDallah Shop — Script d'initialisation de Base de Données Complet (Supabase)
-- Coller ce script dans : Supabase → SQL Editor → New query, puis cliquer sur RUN.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

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
  client_name  TEXT NOT NULL,
  client_phone TEXT,
  products     TEXT, -- Descriptif en chaîne: "Robe × 1 \n Parfum × 2"
  total        NUMERIC DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'en_cours', 'livre', 'annule')),
  notes        TEXT,
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

-- Helper function to check if the user is a verified administrator via JWT custom claim
-- Placed in public schema to avoid auth schema permission restrictions in Supabase Editor
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND
    COALESCE((auth.jwt() ->> 'is_admin')::boolean, false) = true
  );
END;
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

-- B. Table 'customers' (100% administrative)
DROP POLICY IF EXISTS "Acces Admin Clients" ON customers;
CREATE POLICY "Acces Admin Clients" ON customers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

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
CREATE POLICY "Modif Admin Produits" ON products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- F. Table 'orders' (Lecture admin, écriture libre pour le panier d'achat client)
DROP POLICY IF EXISTS "Lecture Admin Commandes" ON orders;
DROP POLICY IF EXISTS "Insertion Publique Commandes" ON orders;
DROP POLICY IF EXISTS "Modification Admin Commandes" ON orders;

CREATE POLICY "Lecture Admin Commandes" ON orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Insertion Publique Commandes" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Modification Admin Commandes" ON orders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- G. Table 'pending_reviews' (Insertion libre publique, gestion totale admin)
DROP POLICY IF EXISTS "Insertion publique pending_reviews" ON pending_reviews;
DROP POLICY IF EXISTS "Lecture admin pending_reviews" ON pending_reviews;
DROP POLICY IF EXISTS "Modification admin pending_reviews" ON pending_reviews;
DROP POLICY IF EXISTS "Suppression admin pending_reviews" ON pending_reviews;

CREATE POLICY "Insertion publique pending_reviews" ON pending_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Lecture admin pending_reviews" ON pending_reviews FOR SELECT USING (public.is_admin());
CREATE POLICY "Modification admin pending_reviews" ON pending_reviews FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Suppression admin pending_reviews" ON pending_reviews FOR DELETE USING (public.is_admin());

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
