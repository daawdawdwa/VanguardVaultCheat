/*
# GameVault — Core Schema

## Overview
Full schema for a digital game + license-key store.

## New Tables
- profiles, categories, products, product_files, coupons, orders, order_items,
  license_keys, wallets, transactions, reviews, tickets, ticket_messages,
  announcements, downloads, topup_requests, logs.

## Security
- RLS on every table. Public read for storefront content; owner-scoped for private data.
- Admin/moderator scoped via raw_app_meta_data role helper.
- Trigger auto-creates profile + wallet on signup.

## Notes
1. Role stored in auth.users raw_app_meta_data (user-immutable), mirrored to profiles.role.
2. Owner columns default to auth.uid().
3. Ordering: coupons before orders; orders before license_keys/order_items.
*/

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((auth.jwt() -> 'raw_app_meta_data' ->> 'role')::text, 'customer');
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin','moderator','customer')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_profiles" ON public.profiles;
CREATE POLICY "public_read_profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
CREATE POLICY "admin_all_profiles" ON public.profiles FOR ALL TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_categories" ON public.categories;
CREATE POLICY "admin_write_categories" ON public.categories FOR ALL TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  game_version text,
  thumbnail_url text,
  gallery jsonb DEFAULT '[]'::jsonb,
  price numeric(10,2) NOT NULL DEFAULT 0,
  discount integer NOT NULL DEFAULT 0 CHECK (discount BETWEEN 0 AND 100),
  stock integer NOT NULL DEFAULT 0,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  system_requirements jsonb DEFAULT '{}'::jsonb,
  changelog text,
  instructions text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft','archived')),
  featured boolean NOT NULL DEFAULT false,
  popular boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_popular ON public.products(popular);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products" ON public.products FOR SELECT TO anon, authenticated USING (status = 'active' OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "admin_write_products" ON public.products;
CREATE POLICY "admin_write_products" ON public.products FOR ALL TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.product_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size bigint DEFAULT 0,
  version text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_files_product ON public.product_files(product_id);
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_product_files" ON public.product_files;
CREATE POLICY "read_product_files" ON public.product_files FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_product_files" ON public.product_files;
CREATE POLICY "admin_write_product_files" ON public.product_files FOR ALL TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('percent','fixed')),
  value numeric(10,2) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_coupons" ON public.coupons;
CREATE POLICY "read_coupons" ON public.coupons FOR SELECT TO anon, authenticated USING (active = true OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "admin_write_coupons" ON public.coupons;
CREATE POLICY "admin_write_coupons" ON public.coupons FOR ALL TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled','refunded','completed')),
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  tax numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_orders" ON public.orders;
CREATE POLICY "read_own_orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "insert_own_orders" ON public.orders;
CREATE POLICY "insert_own_orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_orders" ON public.orders;
CREATE POLICY "update_own_orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator')) WITH CHECK (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.license_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  key text NOT NULL,
  status text NOT NULL DEFAULT 'unused' CHECK (status IN ('unused','reserved','sold','expired','disabled')),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  reserved_at timestamptz,
  sold_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, key)
);
CREATE INDEX IF NOT EXISTS idx_keys_product ON public.license_keys(product_id);
CREATE INDEX IF NOT EXISTS idx_keys_status ON public.license_keys(status);
CREATE INDEX IF NOT EXISTS idx_keys_order ON public.license_keys(order_id);
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_keys" ON public.license_keys;
CREATE POLICY "read_own_keys" ON public.license_keys FOR SELECT TO authenticated USING (
  (order_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = license_keys.order_id AND o.user_id = auth.uid()))
  OR public.current_app_role() IN ('admin','moderator')
);
DROP POLICY IF EXISTS "admin_write_keys" ON public.license_keys;
CREATE POLICY "admin_write_keys" ON public.license_keys FOR ALL TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  price numeric(10,2) NOT NULL DEFAULT 0,
  license_key_id uuid REFERENCES public.license_keys(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_order_items" ON public.order_items;
CREATE POLICY "read_own_order_items" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  OR public.current_app_role() IN ('admin','moderator')
);
DROP POLICY IF EXISTS "insert_own_order_items" ON public.order_items;
CREATE POLICY "insert_own_order_items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_wallet" ON public.wallets;
CREATE POLICY "read_own_wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_all_wallets" ON public.wallets;
CREATE POLICY "admin_all_wallets" ON public.wallets FOR SELECT TO authenticated USING (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('topup','purchase','refund')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tx_user ON public.transactions(user_id);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_tx" ON public.transactions;
CREATE POLICY "read_own_tx" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_all_tx" ON public.transactions;
CREATE POLICY "admin_all_tx" ON public.transactions FOR ALL TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON public.reviews;
CREATE POLICY "public_read_reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_review" ON public.reviews;
CREATE POLICY "insert_own_review" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_review" ON public.reviews;
CREATE POLICY "delete_own_review" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.tickets(user_id);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_tickets" ON public.tickets;
CREATE POLICY "read_own_tickets" ON public.tickets FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "insert_own_tickets" ON public.tickets;
CREATE POLICY "insert_own_tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_tickets" ON public.tickets;
CREATE POLICY "update_own_tickets" ON public.tickets FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator')) WITH CHECK (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ticket_msgs_ticket ON public.ticket_messages(ticket_id);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_ticket_msgs" ON public.ticket_messages;
CREATE POLICY "read_own_ticket_msgs" ON public.ticket_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  OR public.current_app_role() IN ('admin','moderator')
);
DROP POLICY IF EXISTS "insert_own_ticket_msgs" ON public.ticket_messages;
CREATE POLICY "insert_own_ticket_msgs" ON public.ticket_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  OR public.current_app_role() IN ('admin','moderator')
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_announcements" ON public.announcements;
CREATE POLICY "public_read_announcements" ON public.announcements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_announcements" ON public.announcements;
CREATE POLICY "admin_write_announcements" ON public.announcements FOR ALL TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE SET NULL,
  file_id uuid REFERENCES public.product_files(id) ON DELETE SET NULL,
  downloaded_at timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON public.downloads(user_id);
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_downloads" ON public.downloads;
CREATE POLICY "read_own_downloads" ON public.downloads FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_downloads" ON public.downloads;
CREATE POLICY "insert_own_downloads" ON public.downloads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.topup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  slip_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_topup_user ON public.topup_requests(user_id);
ALTER TABLE public.topup_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_topups" ON public.topup_requests;
CREATE POLICY "read_own_topups" ON public.topup_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "insert_own_topups" ON public.topup_requests;
CREATE POLICY "insert_own_topups" ON public.topup_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_update_topups" ON public.topup_requests;
CREATE POLICY "admin_update_topups" ON public.topup_requests FOR UPDATE TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_logs_user ON public.logs(user_id);
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_logs" ON public.logs;
CREATE POLICY "read_own_logs" ON public.logs FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "insert_own_logs" ON public.logs;
CREATE POLICY "insert_own_logs" ON public.logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)),
    COALESCE(NEW.raw_app_meta_data ->> 'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
