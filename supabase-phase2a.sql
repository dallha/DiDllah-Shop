-- Phase 2A: Blog & Catalogue Maison Tables
-- Run this in Supabase SQL editor to create the new tables

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  image_url VARCHAR(500),
  category VARCHAR(50) NOT NULL DEFAULT 'Nouvelles',
  author VARCHAR(100) NOT NULL DEFAULT 'Admin',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  meta_description VARCHAR(160),
  meta_keywords VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public read policy (published articles only)
CREATE POLICY articles_public_read ON articles
  FOR SELECT USING (status = 'published');

-- Admin read/write policy (implement with auth)
CREATE POLICY articles_admin_full ON articles
  FOR ALL USING (true);  -- Replace with proper auth check


-- Catalogue Maison Table
CREATE TABLE IF NOT EXISTS catalogue_maison (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('parfum', 'extrait', 'soin')),
  description TEXT,
  olfactory_family VARCHAR(100),
  inspiration VARCHAR(255),
  image_url VARCHAR(500),
  price_range VARCHAR(50),
  ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
  supplier_id UUID,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_catalogue_is_public ON catalogue_maison(is_public);
CREATE INDEX IF NOT EXISTS idx_catalogue_slug ON catalogue_maison(slug);
CREATE INDEX IF NOT EXISTS idx_catalogue_type ON catalogue_maison(type);

-- Enable RLS
ALTER TABLE catalogue_maison ENABLE ROW LEVEL SECURITY;

-- Public read policy (public items only)
CREATE POLICY catalogue_public_read ON catalogue_maison
  FOR SELECT USING (is_public = true);

-- Admin full access policy
CREATE POLICY catalogue_admin_full ON catalogue_maison
  FOR ALL USING (true);


-- Catalogue Merges Log Table (for audit trail)
CREATE TABLE IF NOT EXISTS catalogue_merges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_id UUID NOT NULL REFERENCES catalogue_maison(id) ON DELETE SET NULL,
  secondary_id UUID NOT NULL REFERENCES catalogue_maison(id) ON DELETE SET NULL,
  merged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_catalogue_merges_primary ON catalogue_merges(primary_id);

-- Enable RLS
ALTER TABLE catalogue_merges ENABLE ROW LEVEL SECURITY;

-- Admin read only
CREATE POLICY catalogue_merges_admin_read ON catalogue_merges
  FOR SELECT USING (true);


-- Optional: Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_update_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER catalogue_maison_update_updated_at
BEFORE UPDATE ON catalogue_maison
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
