-- filepath: neon/migrate-cms.sql
-- Banner multi-CTA + CMS pages

ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS cta_buttons JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Migrate legacy single CTA into cta_buttons
UPDATE banners
SET cta_buttons = jsonb_build_array(
  jsonb_build_object('label', cta_label, 'href', COALESCE(cta_href, '/about'))
)
WHERE (cta_buttons IS NULL OR cta_buttons = '[]'::jsonb)
  AND cta_label IS NOT NULL
  AND length(trim(cta_label)) > 0;

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  content_html TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages (slug);

INSERT INTO pages (slug, title, content_html, published) VALUES
  ('home', '포털 홈 (배너 아래)', '', true),
  ('about', '학회소개', '', true),
  ('submission', '논문투고', '', true),
  ('members', '회원마당', '', true),
  ('journal-intro', '학술지 안내', '', true),
  ('conference-intro', '학술대회 안내', '', true)
ON CONFLICT (slug) DO NOTHING;
