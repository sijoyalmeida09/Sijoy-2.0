-- ══════════════════════════════════════════════════════════════════
-- 0005 · Live Gig Engine
-- Adds ONLINE/OFFLINE toggle fields to artist_profiles so musicians
-- can go live like Uber drivers and receive instant gig broadcasts.
-- ══════════════════════════════════════════════════════════════════

-- ── Online presence columns ────────────────────────────────────────
ALTER TABLE artist_profiles
  ADD COLUMN IF NOT EXISTS is_online       boolean       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS went_online_at  timestamptz,
  ADD COLUMN IF NOT EXISTS online_city     text;

-- ── Index: fast lookup of online artists per city (tonight page) ───
CREATE INDEX IF NOT EXISTS idx_artist_profiles_online_city
  ON artist_profiles (online_city)
  WHERE is_online = true;

-- ── Auto-offline: mark artist offline if last heartbeat > 2 hours ──
-- (Run as a cron job via pg_cron or Supabase Edge Function)
-- CREATE OR REPLACE FUNCTION auto_offline_stale_artists()
-- RETURNS void LANGUAGE sql AS $$
--   UPDATE artist_profiles
--   SET is_online = false, online_city = null
--   WHERE is_online = true
--     AND went_online_at < now() - interval '2 hours';
-- $$;
