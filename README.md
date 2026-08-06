# GameVault — Premium Digital Game Keys Store

A production-ready, luxury dark-themed web application for selling digital game files and license keys. Built with Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, and Supabase.

## Features

### Storefront
- **Home** — Hero, featured products, trending games, category grid, features, stats, testimonials, FAQ, CTA
- **Products** — Full catalog with search, category filter, and sort (newest, popular, price)
- **Categories** — Browse by genre with dedicated category pages
- **Product Detail** — Image gallery, pricing with discounts, system requirements table, changelog, instructions, related products
- **Search** — Realtime search across the catalog
- **Cart** — Slide-out drawer with quantity controls, persistent via localStorage
- **Checkout** — Wallet-based payment with coupon codes, tax calculation, and instant license key assignment

### Authentication
- Email + Password sign up / sign in / sign out
- Google and Discord OAuth login
- Forgot password with email reset link
- Protected routes (dashboard and admin)
- Role-based access (admin, moderator, customer)
- Auto profile + wallet creation on signup

### Customer Dashboard
- **Overview** — Wallet balance, order count, downloads, license keys, recent orders
- **Wallet** — Balance display, top-up requests with slip upload, transaction history
- **Orders** — Order list with status badges, detailed order view with assigned license keys
- **Downloads** — Purchased files with download tracking
- **License Keys** — All assigned keys with copy-to-clipboard
- **Profile** — Edit username, avatar, view role and security info
- **Settings** — Change password
- **Support** — Create support tickets with priority levels

### Admin Panel
- **Overview** — Revenue, orders, users, products, downloads, pending top-ups
- **Products** — Full CRUD with create/edit modal, featured & popular toggles
- **Orders** — All orders table with customer info
- **License Keys** — Quick generate keys, bulk import (TXT/CSV paste), delete
- **Users** — All users with wallet balances and roles
- **Wallets** — Wallet balances and top-up request approval/rejection
- **Coupons** — Create, activate/deactivate, delete discount codes
- **Tickets** — View all support tickets
- **Announcements** — Publish and manage news/announcements

### Database (Supabase / PostgreSQL)
17 tables with full Row Level Security:
- `profiles` — Extends auth.users with username, avatar, role
- `categories` — Product categories
- `products` — Game listings with gallery, requirements, changelog
- `product_files` — Downloadable files
- `license_keys` — Keys with status tracking (unused/reserved/sold/expired/disabled)
- `wallets` — Per-user balance
- `transactions` — Top-ups, purchases, refunds
- `orders` / `order_items` — Orders with coupon support
- `coupons` — Percent or fixed discount codes
- `reviews` — Product ratings
- `tickets` / `ticket_messages` — Support system
- `announcements` — News
- `downloads` — Download history
- `topup_requests` — Manual transfer approvals
- `logs` — Audit trail

### Security
- Row Level Security on every table
- Owner-scoped policies for private data
- Public read for storefront content
- Admin/moderator role checks via JWT `raw_app_meta_data`
- Server-side Supabase client for server components
- Client-side Supabase client for browser interactions

### Design
- Luxury dark theme (#09090B background, #EF4444 primary, #F43F5E accent)
- Glassmorphism effects
- Framer Motion animations and micro-interactions
- Fully responsive (mobile, tablet, desktop)
- Inter + Sora font pairing
- 16px rounded corners, 8px spacing system

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | TailwindCSS, shadcn/ui |
| Animation | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form, Zod |
| Backend | Next.js Server Actions, Route Handlers |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth (Email/Password, Google, Discord) |
| Storage | Supabase Storage |

## Getting Started

The Supabase project is pre-provisioned. Environment variables are already set in `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The database schema and seed data (6 categories, 12 products, 1 coupon, 3 announcements) are already applied.

### Development

The dev server runs automatically. To build for production:

```bash
npm run build
```

## Project Structure

```
app/
  (auth)/              — Login, register, forgot password (shared auth layout)
  admin/               — Admin panel (overview, products, orders, keys, users, wallets, coupons, tickets, announcements)
  categories/          — Category listing + [slug] detail
  checkout/            — Wallet-based checkout
  dashboard/           — Customer dashboard (overview, wallet, orders, downloads, keys, profile, settings, support)
  faq/                 — FAQ page
  news/                — Announcements page
  products/            — Product listing + [slug] detail
  search/              — Search results
  support/             — Support center
  layout.tsx           — Root layout with providers
  page.tsx             — Home page
components/
  admin/               — Admin shell
  cart/                — Cart drawer
  dashboard/           — Dashboard shell
  home/                — Home page sections (hero, categories, features, stats, testimonials, faq, cta)
  layout/              — Navbar, footer
  product/             — Product card, detail, filters
  ui/                  — shadcn/ui components
lib/
  auth-context.tsx     — Supabase auth provider
  cart-context.tsx     — Cart state provider
  helpers.ts           — Product queries, formatting
  supabase-server.ts   — Server-side Supabase client
  supabase.ts          — Client-side Supabase client
  types.ts             — Database types
```

## Deployment

### Vercel
1. Push the repository to GitHub
2. Import the project in Vercel
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

### Environment Variables
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |

## License Key Flow
1. Admin generates or imports keys for a product (status: `unused`)
2. Customer completes checkout (wallet payment)
3. System finds an `unused` key, marks it `sold`, links it to the order
4. Key appears in the customer's dashboard under Orders and License Keys
5. Keys are never duplicated (unique constraint on product_id + key)

## Wallet Flow
1. Customer creates a top-up request with amount and optional slip URL
2. Admin reviews in Admin > Wallets
3. Admin approves → wallet balance updates, transaction recorded
4. Customer uses wallet balance at checkout
