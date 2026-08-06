/*
# GameVault — Enterprise Schema Expansion

## Overview
Adds affiliate system, redeem codes, VIP memberships, enhanced reviews,
activity logs, promotions/banners, wishlists, notifications, and license
key activation tracking tables.

## New Tables
- affiliate_profiles: per-user affiliate code, commission rate, status
- referrals: tracks referrer -> referred user, commission, status
- commissions: per-referral commission records with withdrawal support
- affiliate_withdrawals: withdrawal requests
- redeem_codes: gift/promo/coupon codes with reward types and limits
- redeem_usage: tracks who redeemed what and when
- vip_memberships: per-user VIP tier, points, expiry
- review_votes: helpful votes on reviews
- review_replies: admin/author replies to reviews
- activity_logs: detailed audit trail with IP, device, user agent
- promotions: homepage banners, popup banners, announcement bars, flash sales
- wishlists: user product wishlists
- notifications: in-app notifications
- license_activations: machine binding, hardware ID, IP, activation count

## Security
- RLS enabled on every table.
- Owner-scoped for user data; admin-scoped for management tables.
- Public read for promotions (active only), reviews/votes (public).
*/

-- ============ AFFILIATE SYSTEM ============

CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text UNIQUE NOT NULL,
  commission_rate numeric(5,2) NOT NULL DEFAULT 10.00 CHECK (commission_rate BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','rejected')),
  total_earnings numeric(12,2) NOT NULL DEFAULT 0,
  pending_earnings numeric(12,2) NOT NULL DEFAULT 0,
  withdrawn_earnings numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_affiliate" ON public.affiliate_profiles;
CREATE POLICY "read_own_affiliate" ON public.affiliate_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "insert_own_affiliate" ON public.affiliate_profiles;
CREATE POLICY "insert_own_affiliate" ON public.affiliate_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_affiliate" ON public.affiliate_profiles;
CREATE POLICY "update_own_affiliate" ON public.affiliate_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator')) WITH CHECK (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  commission_earned numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_referrals" ON public.referrals;
CREATE POLICY "read_own_referrals" ON public.referrals FOR SELECT TO authenticated USING (referrer_id = auth.uid() OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "insert_referral" ON public.referrals;
CREATE POLICY "insert_referral" ON public.referrals FOR INSERT TO authenticated WITH CHECK (referrer_id = auth.uid() OR public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','cancelled','withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate ON public.commissions(affiliate_id);
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_commissions" ON public.commissions;
CREATE POLICY "read_own_commissions" ON public.commissions FOR SELECT TO authenticated USING (affiliate_id = auth.uid() OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "admin_write_commissions" ON public.commissions;
CREATE POLICY "admin_write_commissions" ON public.commissions FOR ALL TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.affiliate_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_affiliate ON public.affiliate_withdrawals(affiliate_id);
ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_withdrawals" ON public.affiliate_withdrawals;
CREATE POLICY "read_own_withdrawals" ON public.affiliate_withdrawals FOR SELECT TO authenticated USING (affiliate_id = auth.uid() OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "insert_own_withdrawal" ON public.affiliate_withdrawals;
CREATE POLICY "insert_own_withdrawal" ON public.affiliate_withdrawals FOR INSERT TO authenticated WITH CHECK (affiliate_id = auth.uid());
DROP POLICY IF EXISTS "admin_update_withdrawals" ON public.affiliate_withdrawals;
CREATE POLICY "admin_update_withdrawals" ON public.affiliate_withdrawals FOR UPDATE TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

-- ============ REDEEM CODE SYSTEM ============

CREATE TABLE IF NOT EXISTS public.redeem_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('wallet','vip','discount','free_product','free_key','xp','coin')),
  value numeric(10,2) NOT NULL DEFAULT 0,
  max_usage integer NOT NULL DEFAULT 1,
  per_user_limit integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  min_purchase numeric(10,2) DEFAULT 0,
  category_restriction text[],
  product_restriction uuid[],
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.redeem_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_redeem_codes" ON public.redeem_codes;
CREATE POLICY "read_redeem_codes" ON public.redeem_codes FOR SELECT TO anon, authenticated USING (active = true OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "admin_write_redeem_codes" ON public.redeem_codes;
CREATE POLICY "admin_write_redeem_codes" ON public.redeem_codes FOR ALL TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

CREATE TABLE IF NOT EXISTS public.redeem_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  redeem_code_id uuid NOT NULL REFERENCES public.redeem_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (redeem_code_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_redeem_usage_user ON public.redeem_usage(user_id);
ALTER TABLE public.redeem_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_redeem_usage" ON public.redeem_usage;
CREATE POLICY "read_own_redeem_usage" ON public.redeem_usage FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "insert_own_redeem_usage" ON public.redeem_usage;
CREATE POLICY "insert_own_redeem_usage" ON public.redeem_usage FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============ VIP MEMBERSHIP ============

CREATE TABLE IF NOT EXISTS public.vip_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free','bronze','silver','gold','diamond','lifetime')),
  points integer NOT NULL DEFAULT 0,
  discount_percent integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vip_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_vip" ON public.vip_memberships;
CREATE POLICY "read_own_vip" ON public.vip_memberships FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "insert_own_vip" ON public.vip_memberships;
CREATE POLICY "insert_own_vip" ON public.vip_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_vip" ON public.vip_memberships;
CREATE POLICY "update_own_vip" ON public.vip_memberships FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator')) WITH CHECK (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));

-- ============ ENHANCED REVIEWS ============

CREATE TABLE IF NOT EXISTS public.review_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_review_votes_review ON public.review_votes(review_id);
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_review_votes" ON public.review_votes;
CREATE POLICY "public_read_review_votes" ON public.review_votes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_review_vote" ON public.review_votes;
CREATE POLICY "insert_own_review_vote" ON public.review_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_review_vote" ON public.review_votes;
CREATE POLICY "delete_own_review_vote" ON public.review_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_official boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_review_replies_review ON public.review_replies(review_id);
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_review_replies" ON public.review_replies;
CREATE POLICY "public_read_review_replies" ON public.review_replies FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_review_reply" ON public.review_replies;
CREATE POLICY "insert_own_review_reply" ON public.review_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ ACTIVITY LOGS ============

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  category text NOT NULL DEFAULT 'user' CHECK (category IN ('user','admin','affiliate','security','system')),
  ip_address text,
  country text,
  device text,
  browser text,
  os text,
  user_agent text,
  session_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_activity" ON public.activity_logs;
CREATE POLICY "read_own_activity" ON public.activity_logs FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "insert_activity" ON public.activity_logs;
CREATE POLICY "insert_activity" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR public.current_app_role() IN ('admin','moderator'));

-- ============ PROMOTIONS / BANNERS ============

CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('homepage_banner','popup','announcement_bar','flash_sale','limited_offer','carousel')),
  content text,
  image_url text,
  link_url text,
  bg_color text,
  text_color text,
  start_at timestamptz,
  end_at timestamptz,
  countdown boolean NOT NULL DEFAULT false,
  target_country text[],
  target_membership text[],
  target_device text[],
  target_language text[],
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_promotions" ON public.promotions;
CREATE POLICY "public_read_promotions" ON public.promotions FOR SELECT TO anon, authenticated USING (active = true OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "admin_write_promotions" ON public.promotions;
CREATE POLICY "admin_write_promotions" ON public.promotions FOR ALL TO authenticated USING (public.current_app_role() IN ('admin','moderator')) WITH CHECK (public.current_app_role() IN ('admin','moderator'));

-- ============ WISHLISTS ============

CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_wishlist" ON public.wishlists;
CREATE POLICY "read_own_wishlist" ON public.wishlists FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_wishlist" ON public.wishlists;
CREATE POLICY "insert_own_wishlist" ON public.wishlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_wishlist" ON public.wishlists;
CREATE POLICY "delete_own_wishlist" ON public.wishlists FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ NOTIFICATIONS ============

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning','error','order','affiliate','vip','system')),
  read boolean NOT NULL DEFAULT false,
  link_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_notifications" ON public.notifications;
CREATE POLICY "read_own_notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON public.notifications;
CREATE POLICY "insert_own_notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.current_app_role() IN ('admin','moderator'));
DROP POLICY IF EXISTS "update_own_notifications" ON public.notifications;
CREATE POLICY "update_own_notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ LICENSE ACTIVATIONS ============

CREATE TABLE IF NOT EXISTS public.license_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key_id uuid NOT NULL REFERENCES public.license_keys(id) ON DELETE CASCADE,
  hardware_id text NOT NULL,
  ip_address text,
  machine_name text,
  activated_at timestamptz NOT NULL DEFAULT now(),
  deactivated_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','deactivated')),
  UNIQUE (license_key_id, hardware_id)
);
CREATE INDEX IF NOT EXISTS idx_license_activations_key ON public.license_activations(license_key_id);
ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_license_activations" ON public.license_activations;
CREATE POLICY "read_own_license_activations" ON public.license_activations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.license_keys lk JOIN public.orders o ON o.id = lk.order_id WHERE lk.id = license_activations.license_key_id AND o.user_id = auth.uid())
  OR public.current_app_role() IN ('admin','moderator')
);
DROP POLICY IF EXISTS "insert_license_activations" ON public.license_activations;
CREATE POLICY "insert_license_activations" ON public.license_activations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_license_activations" ON public.license_activations;
CREATE POLICY "update_license_activations" ON public.license_activations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ============ TRIGGER: auto-create VIP on signup ============

CREATE OR REPLACE FUNCTION public.handle_new_user_vip()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.vip_memberships (user_id, tier, points, discount_percent)
  VALUES (NEW.id, 'free', 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_vip ON auth.users;
CREATE TRIGGER on_auth_user_created_vip
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_vip();
