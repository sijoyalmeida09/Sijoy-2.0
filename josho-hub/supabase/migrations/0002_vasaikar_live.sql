-- Vasaikar Live — music booking marketplace schema
-- Extends the unified identity core (0001).
-- Run after 0001_unified_identity_core.sql.

-- ───────────────────────────────────────────────
-- ENUMS
-- ───────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type public.booking_status as enum (
      'requested', 'accepted', 'confirmed', 'completed', 'cancelled', 'disputed'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'payout_status') then
    create type public.payout_status as enum ('pending', 'processing', 'settled', 'failed');
  end if;
end$$;

-- ───────────────────────────────────────────────
-- LOOKUP: genres & instruments
-- ───────────────────────────────────────────────

create table if not exists public.genres (
  id   serial primary key,
  slug text not null unique,
  name text not null
);

insert into public.genres (slug, name) values
  ('vasaikar',  'Vasaikar / Konkani Folk'),
  ('bollywood', 'Bollywood / Hindi Film'),
  ('sufi',      'Sufi / Qawwali'),
  ('western',   'Western / Pop / Rock'),
  ('classical', 'Indian Classical'),
  ('gospel',    'Gospel / Church'),
  ('marathi',   'Marathi'),
  ('edm',       'EDM / Electronic'),
  ('jazz',      'Jazz / Blues'),
  ('fusion',    'Fusion / Experimental')
on conflict (slug) do nothing;

create table if not exists public.instruments (
  id   serial primary key,
  slug text not null unique,
  name text not null
);

insert into public.instruments (slug, name) values
  ('vocals',    'Vocals'),
  ('guitar',    'Guitar'),
  ('keyboard',  'Keyboard / Synth'),
  ('drums',     'Drums / Percussion'),
  ('bass',      'Bass Guitar'),
  ('violin',    'Violin'),
  ('flute',     'Flute'),
  ('tabla',     'Tabla'),
  ('harmonium', 'Harmonium'),
  ('dholki',    'Dholki / Dholak'),
  ('sax',       'Saxophone'),
  ('trumpet',   'Trumpet'),
  ('ukulele',   'Ukulele'),
  ('dj',        'DJ / Turntables'),
  ('producer',  'Music Producer'),
  ('sound_eng', 'Sound Engineer')
on conflict (slug) do nothing;

-- ───────────────────────────────────────────────
-- ARTIST PROFILES (extends profiles)
-- ───────────────────────────────────────────────

create table if not exists public.artist_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references public.profiles (id) on delete cascade,
  stage_name      text not null,
  bio             text,
  hourly_rate     numeric(10,2),
  event_rate      numeric(10,2),
  city            text not null default 'Vasai-Virar',
  region          text not null default 'Palghar',
  available       boolean not null default true,
  commission_pct  numeric(4,2) not null default 10.00,
  profile_photo   text,
  cover_photo     text,
  youtube_url     text,
  instagram_url   text,
  phone_visible   boolean not null default false,
  search_rank     integer not null default 0,
  total_bookings  integer not null default 0,
  avg_rating      numeric(3,2) not null default 0.00,
  featured        boolean not null default false,
  onboarded_via   text,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.artist_genres (
  artist_id uuid not null references public.artist_profiles (id) on delete cascade,
  genre_id  integer not null references public.genres (id) on delete cascade,
  primary key (artist_id, genre_id)
);

create table if not exists public.artist_instruments (
  artist_id     uuid not null references public.artist_profiles (id) on delete cascade,
  instrument_id integer not null references public.instruments (id) on delete cascade,
  skill_level   text not null default 'proficient',
  primary key (artist_id, instrument_id)
);

-- ───────────────────────────────────────────────
-- ARTIST MEDIA (photos, videos, audio)
-- ───────────────────────────────────────────────

create table if not exists public.artist_media (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references public.artist_profiles (id) on delete cascade,
  media_type  text not null check (media_type in ('image', 'video', 'audio', 'youtube')),
  url         text not null,
  thumbnail   text,
  title       text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- No media limits. Platform is free for all artists.

-- ───────────────────────────────────────────────
-- EVENT BOOKINGS (v2 — replaces simple bookings)
-- ───────────────────────────────────────────────

create table if not exists public.event_bookings (
  id                  uuid primary key default gen_random_uuid(),
  organizer_id        uuid not null references public.profiles (id) on delete cascade,
  artist_id           uuid not null references public.artist_profiles (id) on delete cascade,
  event_name          text not null,
  event_type          text not null default 'private',
  event_date          timestamptz not null,
  event_end_date      timestamptz,
  venue               text,
  city                text not null default 'Vasai-Virar',
  description         text,
  agreed_amount       numeric(12,2) not null,
  platform_fee_pct    numeric(4,2) not null default 10.00,
  artist_payout       numeric(12,2) not null,
  platform_revenue    numeric(12,2) not null,
  status              public.booking_status not null default 'requested',
  payment_id          text,
  payout_status       public.payout_status not null default 'pending',
  payout_settled_at   timestamptz,
  referral_code       text,
  cancellation_reason text,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- REVIEWS (both directions)
-- ───────────────────────────────────────────────

create table if not exists public.booking_reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.event_bookings (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (booking_id, reviewer_id)
);

-- ───────────────────────────────────────────────
-- PERFECT MATCH RECOMMENDATIONS (rule-based v1)
-- ───────────────────────────────────────────────

create table if not exists public.artist_recommendations (
  id              uuid primary key default gen_random_uuid(),
  source_artist   uuid not null references public.artist_profiles (id) on delete cascade,
  recommended_id  uuid not null references public.artist_profiles (id) on delete cascade,
  reason          text not null,
  score           integer not null default 50,
  created_at      timestamptz not null default now(),
  unique (source_artist, recommended_id)
);

-- ───────────────────────────────────────────────
-- REFERRAL / SHARE LINKS
-- ───────────────────────────────────────────────

create table if not exists public.artist_share_links (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references public.artist_profiles (id) on delete cascade,
  code        text not null unique,
  clicks      integer not null default 0,
  bookings    integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- TRIGGERS
-- ───────────────────────────────────────────────

drop trigger if exists trg_artist_profiles_updated_at on public.artist_profiles;
create trigger trg_artist_profiles_updated_at
before update on public.artist_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_event_bookings_updated_at on public.event_bookings;
create trigger trg_event_bookings_updated_at
before update on public.event_bookings
for each row execute function public.set_updated_at();

-- Update artist stats after a review is inserted.
create or replace function public.update_artist_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_artist_id uuid;
  new_avg numeric(3,2);
  new_count integer;
begin
  select ap.id into target_artist_id
  from public.artist_profiles ap
  where ap.user_id = new.reviewee_id;

  if target_artist_id is null then return new; end if;

  select coalesce(avg(br.rating), 0), count(*)
  into new_avg, new_count
  from public.booking_reviews br
  join public.event_bookings eb on eb.id = br.booking_id
  where eb.artist_id = target_artist_id
    and br.reviewee_id = new.reviewee_id;

  update public.artist_profiles
  set avg_rating = new_avg
  where id = target_artist_id;

  return new;
end;
$$;

drop trigger if exists trg_update_artist_rating on public.booking_reviews;
create trigger trg_update_artist_rating
after insert on public.booking_reviews
for each row execute function public.update_artist_rating();

-- Increment total_bookings when a booking is completed.
create or replace function public.increment_artist_bookings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and (old.status is distinct from 'completed') then
    update public.artist_profiles
    set total_bookings = total_bookings + 1
    where id = new.artist_id;

    -- Award 50 JoSho Points on booking completion.
    perform public.increment_loyalty_points(
      (select user_id from public.artist_profiles where id = new.artist_id),
      50
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_increment_artist_bookings on public.event_bookings;
create trigger trg_increment_artist_bookings
after update on public.event_bookings
for each row execute function public.increment_artist_bookings();

-- ───────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────

alter table public.artist_profiles enable row level security;
alter table public.artist_genres enable row level security;
alter table public.artist_instruments enable row level security;
alter table public.artist_media enable row level security;
alter table public.event_bookings enable row level security;
alter table public.booking_reviews enable row level security;
alter table public.artist_recommendations enable row level security;
alter table public.artist_share_links enable row level security;

-- Artist profiles: public read, owner + admin write.
create policy "artist_profiles_public_read" on public.artist_profiles
  for select using (true);

create policy "artist_profiles_owner_or_admin_insert" on public.artist_profiles
  for insert with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "artist_profiles_owner_or_admin_update" on public.artist_profiles
  for update
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Artist genres/instruments: public read, owner + admin write.
create policy "artist_genres_public_read" on public.artist_genres for select using (true);
create policy "artist_genres_owner_or_admin_write" on public.artist_genres
  for insert with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );

create policy "artist_instruments_public_read" on public.artist_instruments for select using (true);
create policy "artist_instruments_owner_or_admin_write" on public.artist_instruments
  for insert with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );

-- Artist media: public read, owner + admin write.
create policy "artist_media_public_read" on public.artist_media for select using (true);
create policy "artist_media_owner_or_admin_insert" on public.artist_media
  for insert with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );
create policy "artist_media_owner_or_admin_delete" on public.artist_media
  for delete using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );

-- Event bookings: organizer sees own, artist sees own, admin sees all.
create policy "event_bookings_select" on public.event_bookings
  for select using (
    public.is_admin(auth.uid())
    or organizer_id = auth.uid()
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );

create policy "event_bookings_insert" on public.event_bookings
  for insert with check (
    public.is_admin(auth.uid())
    or organizer_id = auth.uid()
  );

create policy "event_bookings_update" on public.event_bookings
  for update using (
    public.is_admin(auth.uid())
    or organizer_id = auth.uid()
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );

-- Reviews: public read, only reviewer can insert.
create policy "booking_reviews_public_read" on public.booking_reviews for select using (true);
create policy "booking_reviews_insert" on public.booking_reviews
  for insert with check (reviewer_id = auth.uid());

-- Recommendations: public read, admin write.
create policy "recommendations_public_read" on public.artist_recommendations for select using (true);
create policy "recommendations_admin_write" on public.artist_recommendations
  for insert with check (public.is_admin(auth.uid()));

-- Share links: public read (for click tracking), owner + admin write.
create policy "share_links_public_read" on public.artist_share_links for select using (true);
create policy "share_links_owner_or_admin_write" on public.artist_share_links
  for insert with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );

-- Genres and instruments are public lookup tables.
alter table public.genres enable row level security;
create policy "genres_public_read" on public.genres for select using (true);

alter table public.instruments enable row level security;
create policy "instruments_public_read" on public.instruments for select using (true);

-- ───────────────────────────────────────────────
-- INDEXES
-- ───────────────────────────────────────────────

create index if not exists idx_artist_profiles_city on public.artist_profiles (city);

create index if not exists idx_artist_profiles_available on public.artist_profiles (available) where available = true;
create index if not exists idx_artist_profiles_featured on public.artist_profiles (featured) where featured = true;
create index if not exists idx_artist_profiles_search_rank on public.artist_profiles (search_rank desc);
create index if not exists idx_event_bookings_artist on public.event_bookings (artist_id);
create index if not exists idx_event_bookings_organizer on public.event_bookings (organizer_id);
create index if not exists idx_event_bookings_status on public.event_bookings (status);
create index if not exists idx_event_bookings_date on public.event_bookings (event_date);
create index if not exists idx_artist_media_artist on public.artist_media (artist_id);
create index if not exists idx_booking_reviews_booking on public.booking_reviews (booking_id);
