-- Storage buckets (public) for attachments / gallery / banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('attachments', 'attachments', true, 52428800, NULL),
  ('gallery', 'gallery', true, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif']::text[]),
  ('banners', 'banners', true, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4']::text[])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Demo admin + existing founder admin on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_privileged boolean;
BEGIN
  is_privileged := NEW.email IN ('shinkang88@daum.net', 'demo@ksac.local');

  INSERT INTO public.profiles (id, email, full_name, affiliation, member_type, approved)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', CASE WHEN NEW.email = 'demo@ksac.local' THEN '데모 관리자' ELSE '' END),
    COALESCE(NEW.raw_user_meta_data->>'affiliation', CASE WHEN NEW.email = 'demo@ksac.local' THEN 'KSAC' ELSE '' END),
    COALESCE(NEW.raw_user_meta_data->>'member_type', '정회원'),
    is_privileged
  ) ON CONFLICT (id) DO UPDATE SET
    approved = EXCLUDED.approved OR public.profiles.approved,
    full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name);

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;

  IF is_privileged THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

-- Backfill demo admin if account already exists
UPDATE public.profiles SET approved = true
WHERE email = 'demo@ksac.local';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'demo@ksac.local'
ON CONFLICT DO NOTHING;

-- Seed banners (no author FK) if empty
INSERT INTO public.banners (title, subtitle, cta_label, cta_href, image_url, sort_order, published)
SELECT * FROM (VALUES
  (
    '학문을 연결하고, 미래 사회의 해법을 함께 만듭니다',
    '대한학술융합학회는 인문사회·과학기술·보건의료·정책·문화예술을 잇는 개방형 융합학술 공동체입니다.',
    '학회 소개 보기',
    '/about',
    '/media/hero-conference.jpg',
    0,
    true
  ),
  (
    'AI 융합 연구와 함께 당신의 가치를 확장하십시오',
    '연구논문·리뷰논문·사례연구·정책실무논문 등 학문 간 융합적 가치를 지닌 원고를 기다립니다.',
    '논문투고 안내',
    '/submission',
    '/media/conference-ceremony.jpg',
    1,
    true
  ),
  (
    '국내외 연구자가 함께하는 개방형 융합 플랫폼',
    '학문과 산업, 기술과 정책, 연구와 현장을 연결하는 실질적 융합 연구 생태계를 만들어갑니다.',
    '학회소식 보기',
    '/news',
    '/media/conference-networking.jpg',
    2,
    true
  )
) AS v(title, subtitle, cta_label, cta_href, image_url, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM public.banners LIMIT 1);

-- Demo bootstrap RPC (callable by authenticated demo user)
CREATE OR REPLACE FUNCTION public.ensure_demo_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  em text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT email INTO em FROM auth.users WHERE id = auth.uid();
  IF em IS DISTINCT FROM 'demo@ksac.local' THEN
    RAISE EXCEPTION 'Not demo account';
  END IF;
  UPDATE public.profiles
    SET approved = true,
        full_name = COALESCE(NULLIF(full_name, ''), '데모 관리자')
  WHERE id = auth.uid();
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT DO NOTHING;
END;
$$;
GRANT EXECUTE ON FUNCTION public.ensure_demo_admin() TO authenticated;
