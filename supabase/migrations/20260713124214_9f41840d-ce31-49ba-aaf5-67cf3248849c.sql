
-- =========== ROLES ===========
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

DROP POLICY IF EXISTS user_roles_self_read ON public.user_roles;
DROP POLICY IF EXISTS user_roles_admin_write ON public.user_roles;
CREATE POLICY user_roles_self_read ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY user_roles_admin_write ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========== PROFILES ===========
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  affiliation text,
  member_type text DEFAULT '정회원',
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_self_read ON public.profiles;
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_self_read ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY profiles_admin_all ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- NOTE: The account 'shinkang88@daum.net' is auto-granted admin + approved on signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, affiliation, member_type, approved)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'affiliation', ''),
    COALESCE(NEW.raw_user_meta_data->>'member_type', '정회원'),
    CASE WHEN NEW.email = 'shinkang88@daum.net' THEN true ELSE false END
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;
  IF NEW.email = 'shinkang88@daum.net' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Backfill
INSERT INTO public.profiles (id, email, full_name, approved)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name',''),
  CASE WHEN u.email='shinkang88@daum.net' THEN true ELSE false END
FROM auth.users u ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'member' FROM auth.users ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email='shinkang88@daum.net' ON CONFLICT DO NOTHING;

-- =========== NOTICES ===========
ALTER TABLE public.notices
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '공지',
  ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text;

DROP POLICY IF EXISTS notices_public_read ON public.notices;
DROP POLICY IF EXISTS notices_auth_insert ON public.notices;
DROP POLICY IF EXISTS notices_owner_update ON public.notices;
DROP POLICY IF EXISTS notices_owner_delete ON public.notices;
DROP POLICY IF EXISTS notices_read ON public.notices;
DROP POLICY IF EXISTS notices_admin_all ON public.notices;
CREATE POLICY notices_read ON public.notices FOR SELECT TO anon, authenticated
  USING (published = true OR public.is_admin());
CREATE POLICY notices_admin_all ON public.notices FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========== RESOURCES ===========
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS views int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text;

DROP POLICY IF EXISTS resources_public_read ON public.resources;
DROP POLICY IF EXISTS resources_auth_insert ON public.resources;
DROP POLICY IF EXISTS resources_owner_update ON public.resources;
DROP POLICY IF EXISTS resources_owner_delete ON public.resources;
DROP POLICY IF EXISTS resources_read ON public.resources;
DROP POLICY IF EXISTS resources_admin_all ON public.resources;
CREATE POLICY resources_read ON public.resources FOR SELECT TO anon, authenticated
  USING (published = true OR public.is_admin());
CREATE POLICY resources_admin_all ON public.resources FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========== GALLERY ===========
CREATE TABLE IF NOT EXISTS public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT '학술대회',
  title text NOT NULL,
  content text,
  author_id uuid,
  author_name text NOT NULL DEFAULT '관리자',
  views int NOT NULL DEFAULT 0,
  pinned boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url text,
  event_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gallery_read ON public.gallery;
DROP POLICY IF EXISTS gallery_admin_all ON public.gallery;
CREATE POLICY gallery_read ON public.gallery FOR SELECT TO anon, authenticated
  USING (published = true OR public.is_admin());
CREATE POLICY gallery_admin_all ON public.gallery FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP TRIGGER IF EXISTS gallery_updated_at ON public.gallery;
CREATE TRIGGER gallery_updated_at BEFORE UPDATE ON public.gallery
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========== BANNERS ===========
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  cta_label text,
  cta_href text,
  image_url text,
  video_url text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS banners_read ON public.banners;
DROP POLICY IF EXISTS banners_admin_all ON public.banners;
CREATE POLICY banners_read ON public.banners FOR SELECT TO anon, authenticated
  USING (published = true OR public.is_admin());
CREATE POLICY banners_admin_all ON public.banners FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP TRIGGER IF EXISTS banners_updated_at ON public.banners;
CREATE TRIGGER banners_updated_at BEFORE UPDATE ON public.banners
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========== VIEWS RPC ===========
CREATE OR REPLACE FUNCTION public.increment_views(_table text, _id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _table = 'notices' THEN
    UPDATE public.notices SET views = views + 1 WHERE id = _id;
  ELSIF _table = 'resources' THEN
    UPDATE public.resources SET views = views + 1 WHERE id = _id;
  ELSIF _table = 'gallery' THEN
    UPDATE public.gallery SET views = views + 1 WHERE id = _id;
  ELSE RAISE EXCEPTION 'Invalid table: %', _table; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION public.increment_views(text, uuid) TO anon, authenticated;

-- =========== STORAGE POLICIES ===========
DROP POLICY IF EXISTS storage_public_read ON storage.objects;
DROP POLICY IF EXISTS storage_admin_write ON storage.objects;
DROP POLICY IF EXISTS storage_admin_update ON storage.objects;
DROP POLICY IF EXISTS storage_admin_delete ON storage.objects;
CREATE POLICY storage_public_read ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('attachments','gallery','banners'));
CREATE POLICY storage_admin_write ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('attachments','gallery','banners') AND public.is_admin());
CREATE POLICY storage_admin_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('attachments','gallery','banners') AND public.is_admin())
  WITH CHECK (bucket_id IN ('attachments','gallery','banners') AND public.is_admin());
CREATE POLICY storage_admin_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('attachments','gallery','banners') AND public.is_admin());
