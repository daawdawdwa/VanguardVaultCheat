/*
# GameVault — Seed Data

## Overview
Seeds 6 categories, 12 products with real Pexels imagery, gallery arrays,
system requirements, changelogs, and a demo coupon. All products are active;
some featured/popular for the home page sections.

## New Data
- Categories: action, rpg, strategy, racing, horror, sci-fi
- Products: 12 across categories with prices, discounts, stock, tags
- Coupon: WELCOME10 (10% percent)

## Notes
1. Idempotent via ON CONFLICT DO NOTHING on slugs/codes.
2. Uses fixed UUIDs for categories so products can reference them deterministically.
*/

INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Action', 'action', 'Fast-paced combat and adrenaline-fueled gameplay.', 'https://images.pexels.com/photos/7862659/pexels-photo-7862659.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('11111111-1111-1111-1111-111111111102', 'RPG', 'rpg', 'Deep narratives, character growth, and expansive worlds.', 'https://images.pexels.com/photos/27292136/pexels-photo-27292136.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('11111111-1111-1111-1111-111111111103', 'Strategy', 'strategy', 'Tactical decision-making and empire building.', 'https://images.pexels.com/photos/7150642/pexels-photo-7150642.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('11111111-1111-1111-1111-111111111104', 'Racing', 'racing', 'High-speed competition and precision driving.', 'https://images.pexels.com/photos/20196376/pexels-photo-20196376.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('11111111-1111-1111-1111-111111111105', 'Horror', 'horror', 'Atmospheric dread and survival terror.', 'https://images.pexels.com/photos/14648586/pexels-photo-14648586.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('11111111-1111-1111-1111-111111111106', 'Sci-Fi', 'sci-fi', 'Futuristic worlds and interstellar adventure.', 'https://images.pexels.com/photos/32862970/pexels-photo-32862970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (id, title, slug, description, game_version, thumbnail_url, gallery, price, discount, stock, category_id, tags, system_requirements, changelog, instructions, status, featured, popular) VALUES
  ('22222222-2222-2222-2222-222222222201', 'Neon Reckoning', 'neon-reckoning', 'A blistering cyberpunk brawler set in the rain-soaked streets of a neon megacity. Master fluid combat, hack corporate towers, and shape the fate of a digital underworld.', 'v2.4.1', 'https://images.pexels.com/photos/18545010/pexels-photo-18545010.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/18545010/pexels-photo-18545010.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/18545039/pexels-photo-18545039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/18545016/pexels-photo-18545016.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    39.99, 25, 100, '11111111-1111-1111-1111-111111111101', ARRAY['cyberpunk','combat','open-world','singleplayer'],
    '{"minimum": {"os": "Windows 10 64-bit", "processor": "Intel i5-8400", "memory": "8 GB RAM", "graphics": "GTX 1060 6GB", "storage": "50 GB"}, "recommended": {"os": "Windows 11 64-bit", "processor": "Intel i7-10700K", "memory": "16 GB RAM", "graphics": "RTX 3070", "storage": "70 GB SSD"}}'::jsonb,
    'v2.4.1 — New district: The Hollows; rebalanced parry windows; 40+ bug fixes.', 'Download the installer, run setup, and activate with the provided license key on first launch.', 'active', true, true),
  ('22222222-2222-2222-2222-222222222202', 'Dragonfall: Ascendant', 'dragonfall-ascendant', 'An open-world RPG where dragons return to a shattered kingdom. Forge alliances, master elemental magic, and decide who rules the ashes.', 'v1.8.0', 'https://images.pexels.com/photos/27292136/pexels-photo-27292136.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/27292136/pexels-photo-27292136.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/15552932/pexels-photo-15552932.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/33908858/pexels-photo-33908858.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    49.99, 0, 75, '11111111-1111-1111-1111-111111111102', ARRAY['rpg','open-world','magic','story-rich'],
    '{"minimum": {"os": "Windows 10", "processor": "Ryzen 5 2600", "memory": "12 GB RAM", "graphics": "RX 580 8GB", "storage": "80 GB"}, "recommended": {"os": "Windows 11", "processor": "Ryzen 7 5800X", "memory": "32 GB RAM", "graphics": "RTX 4070", "storage": "100 GB SSD"}}'::jsonb,
    'v1.8.0 — Added New Game+; companion quests for Seraphine and Korren; performance pass.', 'Install via the launcher, sign in or create an offline profile, and enter your key when prompted.', 'active', true, true),
  ('22222222-2222-2222-2222-222222222203', 'Stellar Dominion', 'stellar-dominion', 'Command a fleet across a living galaxy in this grand-strategy epic. Diplomacy, espionage, and total war collide among the stars.', 'v3.1.2', 'https://images.pexels.com/photos/32862970/pexels-photo-32862970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/32862970/pexels-photo-32862970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/36941390/pexels-photo-36941390.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/7662473/pexels-photo-7662473.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    44.99, 15, 60, '11111111-1111-1111-1111-111111111106', ARRAY['strategy','space','4x','multiplayer'],
    '{"minimum": {"os": "Windows 10", "processor": "Intel i3-8100", "memory": "8 GB RAM", "graphics": "GTX 1050 Ti", "storage": "25 GB"}, "recommended": {"os": "Windows 11", "processor": "Intel i5-10400", "memory": "16 GB RAM", "graphics": "GTX 1660 Super", "storage": "25 GB SSD"}}'::jsonb,
    'v3.1.2 — New espionage tree; multiplayer desync fixes; UI overhaul for fleet management.', 'Launch the game, create a profile, and redeem your key in the Account > License section.', 'active', false, true),
  ('22222222-2222-2222-2222-222222222204', 'Apex Velocity', 'apex-velocity', 'Track-focused racing reborn. Realistic physics, a deep career mode, and online ranked leagues with cross-play.', 'v6.0', 'https://images.pexels.com/photos/20196376/pexels-photo-20196376.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/20196376/pexels-photo-20196376.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/28680795/pexels-photo-28680795.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/33074675/pexels-photo-33074675.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    34.99, 30, 120, '11111111-1111-1111-1111-111111111104', ARRAY['racing','simulation','multiplayer','esports'],
    '{"minimum": {"os": "Windows 10", "processor": "Intel i5-7400", "memory": "8 GB RAM", "graphics": "GTX 970", "storage": "60 GB"}, "recommended": {"os": "Windows 11", "processor": "Ryzen 5 5600X", "memory": "16 GB RAM", "graphics": "RTX 3060", "storage": "90 GB SSD"}}'::jsonb,
    'v6.0 — Next-gen tire model; 12 new tracks; cross-play enabled.', 'Run the installer, log in to your racing profile, and activate your key online to unlock all content.', 'active', true, false),
  ('22222222-2222-2222-2222-222222222205', 'Hollow Pines', 'hollow-pines', 'A psychological horror descent into a fog-drowned forest town. Sanity bends reality; every choice costs something.', 'v1.2.0', 'https://images.pexels.com/photos/14648586/pexels-photo-14648586.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/14648586/pexels-photo-14648586.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/9970896/pexels-photo-9970896.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/289367/pexels-photo-289367.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    29.99, 0, 45, '11111111-1111-1111-1111-111111111105', ARRAY['horror','survival','atmospheric','singleplayer'],
    '{"minimum": {"os": "Windows 10", "processor": "Intel i5-6400", "memory": "8 GB RAM", "graphics": "GTX 960", "storage": "35 GB"}, "recommended": {"os": "Windows 11", "processor": "Intel i7-9700", "memory": "16 GB RAM", "graphics": "RTX 2060", "storage": "35 GB SSD"}}'::jsonb,
    'v1.2.0 — New chapter: The Cellar; improved ambient audio; 25+ fixes.', 'Install, launch, and enter your license key on the title screen to begin.', 'active', false, false),
  ('22222222-2222-2222-2222-222222222206', 'Iron Vanguard', 'iron-vanguard', 'A gritty tactical shooter where every bullet matters. Lead a squad through a collapsing warzone with permadeath and dynamic fronts.', 'v4.0.1', 'https://images.pexels.com/photos/7773751/pexels-photo-7773751.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/7773751/pexels-photo-7773751.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/7688760/pexels-photo-7688760.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/7688764/pexels-photo-7688764.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    42.99, 10, 90, '11111111-1111-1111-1111-111111111101', ARRAY['shooter','tactical','coop','military'],
    '{"minimum": {"os": "Windows 10", "processor": "Intel i5-8600", "memory": "8 GB RAM", "graphics": "GTX 1650", "storage": "70 GB"}, "recommended": {"os": "Windows 11", "processor": "Ryzen 7 5800X3D", "memory": "32 GB RAM", "graphics": "RTX 3080", "storage": "90 GB SSD"}}'::jsonb,
    'v4.0.1 — New co-op campaign; weapon balpass; anti-cheat improvements.', 'Run setup, sign in, and paste your key into the launcher to unlock the full game.', 'active', false, true),
  ('22222222-2222-2222-2222-222222222207', 'Aether Tactics', 'aether-tactics', 'A turn-based strategy gem set on floating islands. Master elemental synergies and outwit rival sky-barons.', 'v2.0', 'https://images.pexels.com/photos/7150642/pexels-photo-7150642.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/7150642/pexels-photo-7150642.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/10109585/pexels-photo-10109585.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    24.99, 0, 200, '11111111-1111-1111-1111-111111111103', ARRAY['strategy','turn-based','fantasy','singleplayer'],
    '{"minimum": {"os": "Windows 10", "processor": "Intel i3-7100", "memory": "6 GB RAM", "graphics": "Intel UHD 630", "storage": "12 GB"}, "recommended": {"os": "Windows 11", "processor": "Intel i5-9400", "memory": "8 GB RAM", "graphics": "GTX 1050", "storage": "12 GB SSD"}}'::jsonb,
    'v2.0 — Added map editor; 4 new island biomes; Steam Workshop support.', 'Install, launch, and enter your key in Settings > License.', 'active', false, false),
  ('22222222-2222-2222-2222-222222222208', 'Voidwalker Saga', 'voidwalker-saga', 'A story-driven sci-fi RPG across a dying star system. Explore derelicts, negotiate with alien factions, and uncover the truth of the Void.', 'v1.5.0', 'https://images.pexels.com/photos/36941390/pexels-photo-36941390.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/36941390/pexels-photo-36941390.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/7662618/pexels-photo-7662618.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/7662469/pexels-photo-7662469.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    54.99, 20, 50, '11111111-1111-1111-1111-111111111106', ARRAY['rpg','sci-fi','story-rich','space'],
    '{"minimum": {"os": "Windows 10", "processor": "Ryzen 5 3600", "memory": "16 GB RAM", "graphics": "GTX 1660", "storage": "100 GB"}, "recommended": {"os": "Windows 11", "processor": "Ryzen 7 5800X3D", "memory": "32 GB RAM", "graphics": "RTX 4070 Ti", "storage": "120 GB SSD"}}'::jsonb,
    'v1.5.0 — New faction questline; ship customization; 60+ fixes.', 'Download, install, and activate with your key on first run.', 'active', true, false),
  ('22222222-2222-2222-2222-222222222209', 'Crimson Ascent', 'crimson-ascent', 'A parkour action game across a vertical megacity. Wall-run, grapple, and chain combos to reach the sky.', 'v1.0.4', 'https://images.pexels.com/photos/18545039/pexels-photo-18545039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/18545039/pexels-photo-18545039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/18545011/pexels-photo-18545011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    27.99, 0, 150, '11111111-1111-1111-1111-111111111101', ARRAY['action','parkour','platformer','singleplayer'],
    '{"minimum": {"os": "Windows 10", "processor": "Intel i5-7600", "memory": "8 GB RAM", "graphics": "GTX 970", "storage": "40 GB"}, "recommended": {"os": "Windows 11", "processor": "Ryzen 5 5600", "memory": "16 GB RAM", "graphics": "RTX 2060", "storage": "40 GB SSD"}}'::jsonb,
    'v1.0.4 — Time Trial mode; new grapple physics; bug fixes.', 'Install, launch, and redeem your key in the main menu.', 'active', false, false),
  ('22222222-2222-2222-2222-222222222210', 'Mythic Realms', 'mythic-realms', 'A sandbox fantasy RPG with emergent world simulation. Build, craft, and survive in a land that remembers.', 'v0.9.8', 'https://images.pexels.com/photos/15552932/pexels-photo-15552932.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/15552932/pexels-photo-15552932.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/33908858/pexels-photo-33908858.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/37585680/pexels-photo-37585680.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    32.99, 0, 80, '11111111-1111-1111-1111-111111111102', ARRAY['rpg','sandbox','survival','crafting'],
    '{"minimum": {"os": "Windows 10", "processor": "Intel i5-8400", "memory": "12 GB RAM", "graphics": "GTX 1060", "storage": "55 GB"}, "recommended": {"os": "Windows 11", "processor": "Ryzen 7 5700X", "memory": "32 GB RAM", "graphics": "RTX 3060 Ti", "storage": "70 GB SSD"}}'::jsonb,
    'v0.9.8 — New biome: Ashen Wastes; crafting overhaul; performance improvements.', 'Install, create a character, and enter your key in the options menu.', 'active', false, true),
  ('22222222-2222-2222-2222-222222222211', 'Nightmare Frequency', 'nightmare-frequency', 'A co-op horror investigation game. Track anomalies, survive the night, and don''t trust the radio.', 'v2.2.0', 'https://images.pexels.com/photos/34169562/pexels-photo-34169562.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/34169562/pexels-photo-34169562.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/11516769/pexels-photo-11516769.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    22.99, 0, 65, '11111111-1111-1111-1111-111111111105', ARRAY['horror','co-op','investigation','multiplayer'],
    '{"minimum": {"os": "Windows 10", "processor": "Intel i5-7400", "memory": "8 GB RAM", "graphics": "GTX 950", "storage": "20 GB"}, "recommended": {"os": "Windows 11", "processor": "Ryzen 5 3600", "memory": "16 GB RAM", "graphics": "GTX 1660", "storage": "20 GB SSD"}}'::jsonb,
    'v2.2.0 — New anomaly types; voice chat overhaul; dedicated servers.', 'Install, launch, host or join a lobby, and enter your key once to unlock.', 'active', false, false),
  ('22222222-2222-2222-2222-222222222212', 'Grand Prix Legacy', 'grand-prix-legacy', 'Classic open-wheel racing across decades of motorsport history. Vintage cars, legendary circuits, and authentic handling.', 'v5.3', 'https://images.pexels.com/photos/28680795/pexels-photo-28680795.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    '["https://images.pexels.com/photos/28680795/pexels-photo-28680795.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/10373663/pexels-photo-10373663.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/971364/pexels-photo-971364.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    38.99, 0, 95, '11111111-1111-1111-1111-111111111104', ARRAY['racing','retro','simulation','career'],
    '{"minimum": {"os": "Windows 10", "processor": "Intel i5-6600", "memory": "8 GB RAM", "graphics": "GTX 970", "storage": "65 GB"}, "recommended": {"os": "Windows 11", "processor": "Ryzen 5 5600X", "memory": "16 GB RAM", "graphics": "RTX 2070", "storage": "80 GB SSD"}}'::jsonb,
    'v5.3 — Added 1970s era; 8 classic tracks; force-feedback improvements.', 'Run the installer, sign in, and activate your key to unlock all eras.', 'active', false, false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.coupons (code, type, value, active, usage_limit, used_count)
VALUES ('WELCOME10', 'percent', 10, true, 1000, 0)
ON CONFLICT (code) DO NOTHING;

-- Sample announcements
INSERT INTO public.announcements (title, content) VALUES
  ('GameVault Launch Sale — Up to 30% Off', 'To celebrate the launch of GameVault, we are running a sitewide sale with discounts up to 30% on featured titles. Use code WELCOME10 at checkout for an extra 10% off your first order.'),
  ('New: Manual Transfer Top-Ups', 'You can now top up your wallet via manual bank transfer and upload your payment slip for admin approval. Wallet balance updates automatically once approved.'),
  ('License Keys Now Instant Delivery', 'All purchases now deliver license keys instantly to your dashboard the moment payment is confirmed.')
ON CONFLICT DO NOTHING;
