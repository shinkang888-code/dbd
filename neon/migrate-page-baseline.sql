-- filepath: neon/migrate-page-baseline.sql
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS baseline_html TEXT NOT NULL DEFAULT '';

-- baseline is the restore target ("현 사이트 상태" 스냅샷)
UPDATE pages SET baseline_html = content_html
WHERE (baseline_html IS NULL OR baseline_html = '')
  AND content_html IS NOT NULL
  AND length(trim(content_html)) > 0;
