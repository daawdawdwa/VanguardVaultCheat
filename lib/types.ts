export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SystemRequirements = {
  minimum?: { os?: string; processor?: string; memory?: string; graphics?: string; storage?: string };
  recommended?: { os?: string; processor?: string; memory?: string; graphics?: string; storage?: string };
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  game_version: string | null;
  thumbnail_url: string | null;
  gallery: string[];
  price: number;
  discount: number;
  stock: number;
  category_id: string | null;
  category?: { id: string; name: string; slug: string } | null;
  tags: string[];
  system_requirements: SystemRequirements;
  changelog: string | null;
  instructions: string | null;
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  popular: boolean;
  created_at: string;
};

export type Category = { id: string; name: string; slug: string; description: string | null; image_url: string | null; created_at: string };
export type Profile = { id: string; username: string; avatar_url: string | null; role: 'admin' | 'moderator' | 'customer'; created_at: string };
export type Order = { id: string; user_id: string; status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'completed'; subtotal: number; discount: number; tax: number; total: number; coupon_id: string | null; created_at: string };
export type OrderItem = { id: string; order_id: string; product_id: string; price: number; license_key_id: string | null; created_at: string; product?: { id: string; title: string; slug: string; thumbnail_url: string | null } | null; license_key?: { id: string; key: string } | null };
export type LicenseKey = { id: string; product_id: string; key: string; status: 'unused' | 'reserved' | 'sold' | 'expired' | 'disabled'; order_id: string | null; reserved_at: string | null; sold_at: string | null; created_at: string; product?: { title: string } | null };
export type Wallet = { id: string; user_id: string; balance: number; created_at: string; updated_at: string };
export type Transaction = { id: string; wallet_id: string | null; user_id: string; amount: number; type: 'topup' | 'purchase' | 'refund'; status: 'pending' | 'completed' | 'failed'; reference: string | null; created_at: string };
export type Coupon = { id: string; code: string; type: 'percent' | 'fixed'; value: number; active: boolean; expires_at: string | null; usage_limit: number | null; used_count: number; created_at: string };
export type Review = { id: string; product_id: string; user_id: string; rating: number; comment: string | null; created_at: string; profile?: { username: string } | null };
export type Ticket = { id: string; user_id: string; subject: string; status: 'open' | 'pending' | 'resolved' | 'closed'; priority: 'low' | 'normal' | 'high' | 'urgent'; created_at: string };
export type Announcement = { id: string; title: string; content: string; created_at: string };
export type TopupRequest = { id: string; user_id: string; amount: number; slip_url: string | null; status: 'pending' | 'approved' | 'rejected'; created_at: string };
export type Download = { id: string; user_id: string; order_item_id: string | null; file_id: string | null; downloaded_at: string; count: number };
export type ProductFile = { id: string; product_id: string; file_name: string; storage_path: string; file_size: number; version: string | null; created_at: string };

// Enterprise types
export type AffiliateProfile = { id: string; user_id: string; referral_code: string; commission_rate: number; status: 'active' | 'suspended' | 'rejected'; total_earnings: number; pending_earnings: number; withdrawn_earnings: number; created_at: string };
export type Referral = { id: string; referrer_id: string; referred_id: string; commission_earned: number; status: 'active' | 'cancelled'; created_at: string };
export type Commission = { id: string; affiliate_id: string; referral_id: string | null; order_id: string | null; amount: number; status: 'pending' | 'approved' | 'cancelled' | 'withdrawn'; created_at: string };
export type AffiliateWithdrawal = { id: string; affiliate_id: string; amount: number; status: 'pending' | 'approved' | 'rejected' | 'cancelled'; created_at: string };
export type RedeemCode = { id: string; code: string; type: 'wallet' | 'vip' | 'discount' | 'free_product' | 'free_key' | 'xp' | 'coin'; value: number; max_usage: number; per_user_limit: number; used_count: number; expires_at: string | null; min_purchase: number; category_restriction: string[]; product_restriction: string[]; active: boolean; created_at: string };
export type RedeemUsage = { id: string; redeem_code_id: string; user_id: string; created_at: string };
export type VipMembership = { id: string; user_id: string; tier: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'lifetime'; points: number; discount_percent: number; expires_at: string | null; created_at: string; updated_at: string };
export type ReviewVote = { id: string; review_id: string; user_id: string; is_helpful: boolean; created_at: string };
export type ReviewReply = { id: string; review_id: string; user_id: string; message: string; is_official: boolean; created_at: string };
export type ActivityLog = { id: string; user_id: string | null; action: string; category: 'user' | 'admin' | 'affiliate' | 'security' | 'system'; ip_address: string | null; country: string | null; device: string | null; browser: string | null; os: string | null; user_agent: string | null; session_id: string | null; details: Json; created_at: string };
export type Promotion = { id: string; title: string; type: 'homepage_banner' | 'popup' | 'announcement_bar' | 'flash_sale' | 'limited_offer' | 'carousel'; content: string | null; image_url: string | null; link_url: string | null; bg_color: string | null; text_color: string | null; start_at: string | null; end_at: string | null; countdown: boolean; target_country: string[]; target_membership: string[]; target_device: string[]; target_language: string[]; active: boolean; created_at: string };
export type Wishlist = { id: string; user_id: string; product_id: string; created_at: string; product?: Product | null };
export type Notification = { id: string; user_id: string; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'affiliate' | 'vip' | 'system'; read: boolean; link_url: string | null; created_at: string };
export type LicenseActivation = { id: string; license_key_id: string; hardware_id: string; ip_address: string | null; machine_name: string | null; activated_at: string; deactivated_at: string | null; status: 'active' | 'deactivated' };
