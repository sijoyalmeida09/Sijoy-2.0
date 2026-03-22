-- JoSho Music Seed Data
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/vgpnoomxetfyfqjbrfcz/sql/new

-- 1. Create test users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, instance_id, aud, role)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@joshoit.com', crypt('JoShoAdmin2026!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Sijoy Admin"}'::jsonb, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000001', 'artist@joshoit.com', crypt('JoShoArtist2026!', gen_salt('bf')), now(), now(), now(), '{"full_name":"DJ TestBeats"}'::jsonb, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('c0000000-0000-0000-0000-000000000001', 'client@joshoit.com', crypt('JoShoClient2026!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Test Client"}'::jsonb, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
ON CONFLICT DO NOTHING;

-- 2. Update profiles
UPDATE public.profiles SET role = 'admin', full_name = 'Sijoy Admin' WHERE email = 'admin@joshoit.com';
UPDATE public.profiles SET role = 'musician', full_name = 'DJ TestBeats' WHERE email = 'artist@joshoit.com';
UPDATE public.profiles SET role = 'client', full_name = 'Test Client' WHERE email = 'client@joshoit.com';

-- 3. Create artist profiles
INSERT INTO public.artist_profiles (id, user_id, stage_name, bio, event_rate, city, available, verification_status, featured, search_rank, total_bookings, avg_rating)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'DJ TestBeats', 'Professional DJ for weddings and parties. 5+ years experience.', 5000, 'Vasai', true, 'verified', true, 100, 42, 4.7),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Priya Vocals', 'Classical and Bollywood vocalist.', 3500, 'Virar', true, 'verified', true, 90, 89, 4.9),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Vishal Drums', 'Professional drummer.', 3000, 'Vasai', true, 'verified', true, 85, 156, 4.8),
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Sanjay Keys', 'Keyboard player.', 2500, 'Nalasopara', true, 'verified', false, 75, 203, 4.6),
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'Amit Guitar', 'Lead guitarist.', 2000, 'Vasai', true, 'verified', false, 70, 67, 4.5)
ON CONFLICT (id) DO NOTHING;

-- 4. Link genres
INSERT INTO public.artist_genres (artist_id, genre_id)
SELECT 'd0000000-0000-0000-0000-000000000001', id FROM public.genres WHERE slug = 'bollywood';
INSERT INTO public.artist_genres (artist_id, genre_id)
SELECT 'd0000000-0000-0000-0000-000000000001', id FROM public.genres WHERE slug = 'edm';
INSERT INTO public.artist_genres (artist_id, genre_id)
SELECT 'd0000000-0000-0000-0000-000000000002', id FROM public.genres WHERE slug = 'bollywood';
INSERT INTO public.artist_genres (artist_id, genre_id)
SELECT 'd0000000-0000-0000-0000-000000000003', id FROM public.genres WHERE slug = 'bollywood';
INSERT INTO public.artist_genres (artist_id, genre_id)
SELECT 'd0000000-0000-0000-0000-000000000004', id FROM public.genres WHERE slug = 'bollywood';
INSERT INTO public.artist_genres (artist_id, genre_id)
SELECT 'd0000000-0000-0000-0000-000000000005', id FROM public.genres WHERE slug = 'western';

-- 5. Link instruments
INSERT INTO public.artist_instruments (artist_id, instrument_id)
SELECT 'd0000000-0000-0000-0000-000000000001', id FROM public.instruments WHERE slug = 'dj';
INSERT INTO public.artist_instruments (artist_id, instrument_id)
SELECT 'd0000000-0000-0000-0000-000000000001', id FROM public.instruments WHERE slug = 'keyboard';
INSERT INTO public.artist_instruments (artist_id, instrument_id)
SELECT 'd0000000-0000-0000-0000-000000000002', id FROM public.instruments WHERE slug = 'vocals';
INSERT INTO public.artist_instruments (artist_id, instrument_id)
SELECT 'd0000000-0000-0000-0000-000000000003', id FROM public.instruments WHERE slug = 'drums';
INSERT INTO public.artist_instruments (artist_id, instrument_id)
SELECT 'd0000000-0000-0000-0000-000000000004', id FROM public.instruments WHERE slug = 'keyboard';
INSERT INTO public.artist_instruments (artist_id, instrument_id)
SELECT 'd0000000-0000-0000-0000-000000000005', id FROM public.instruments WHERE slug = 'guitar';

-- Test credentials:
-- admin@joshoit.com / JoShoAdmin2026!
-- artist@joshoit.com / JoShoArtist2026!
-- client@joshoit.com / JoShoClient2026!
