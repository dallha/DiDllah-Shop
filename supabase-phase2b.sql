-- Phase 2B: API Settings Table
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB,
  category VARCHAR(50) CHECK (category IN ('brand', 'content', 'theme', 'seo', 'general')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY site_settings_public_read ON site_settings
  FOR SELECT USING (category != 'seo' OR true);  -- Allow all reads for now

-- Admin write policy
CREATE POLICY site_settings_admin_write ON site_settings
  FOR ALL USING (true);  -- Replace with proper auth check

-- Sample default settings (insert after table creation)
INSERT INTO site_settings (key, value, category) VALUES
  ('brand_name', '"DiDallah Shop"', 'brand'),
  ('brand_tagline', '"Parfums & Soins Naturels Premium"', 'brand'),
  ('brand_whatsapp', '"+221771234567"', 'brand'),
  ('brand_email', '"contact@didallah.com"', 'brand'),
  ('theme_color', '"#c9a84c"', 'theme'),
  ('seo_title', '"DiDallah Shop - Parfums Naturels"', 'seo')
ON CONFLICT (key) DO NOTHING;
