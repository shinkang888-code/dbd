-- KSAC demo admin bootstrap (run in Supabase SQL Editor)
-- Project: kffzajlutcszlrbjcrhw

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

UPDATE public.profiles SET approved = true WHERE email = 'demo@ksac.local';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'demo@ksac.local'
ON CONFLICT DO NOTHING;

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
