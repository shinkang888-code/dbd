-- KSAC board tables on Neon (auth stays on Supabase)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES ('board_data_mode', 'dummy')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id TEXT,
  author_name TEXT NOT NULL DEFAULT '관리자',
  category TEXT NOT NULL DEFAULT '공지',
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  views INT NOT NULL DEFAULT 0,
  pinned BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  file_url TEXT,
  file_name TEXT,
  thumbnail_url TEXT,
  is_dummy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id TEXT,
  author_name TEXT NOT NULL DEFAULT '관리자',
  category TEXT NOT NULL DEFAULT '자료실',
  title TEXT NOT NULL,
  content TEXT,
  views INT NOT NULL DEFAULT 0,
  pinned BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  file_url TEXT,
  file_name TEXT,
  thumbnail_url TEXT,
  is_dummy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id TEXT,
  author_name TEXT NOT NULL DEFAULT '관리자',
  category TEXT NOT NULL DEFAULT '학술대회',
  title TEXT NOT NULL,
  content TEXT,
  views INT NOT NULL DEFAULT 0,
  pinned BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  event_date DATE,
  is_dummy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  cta_label TEXT,
  cta_href TEXT,
  cta_buttons JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  video_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  is_dummy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  content_html TEXT NOT NULL DEFAULT '',
  baseline_html TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notices_created_idx ON notices (pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS resources_created_idx ON resources (pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS gallery_created_idx ON gallery (pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS banners_sort_idx ON banners (sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages (slug);

CREATE TABLE IF NOT EXISTS member_profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  affiliation TEXT NOT NULL DEFAULT '',
  refund_account TEXT NOT NULL DEFAULT '',
  identity_file_url TEXT,
  identity_file_name TEXT,
  profile_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS member_profiles_email_idx ON member_profiles (email);
