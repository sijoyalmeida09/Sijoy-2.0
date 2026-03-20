-- ══════════════════════════════════════════════════════════════════════════
-- JOSHO MUSIC — COMPLETE FRESH DATABASE SETUP
-- music.joshoit.com · Supabase project: vgpnoomxetfyfqjbrfcz
--
-- HOW TO RUN:
--   1. Go to https://supabase.com/dashboard/project/vgpnoomxetfyfqjbrfcz/sql/new
--   2. Paste this entire file
--   3. Click "Run"
--   4. Done — all tables, RLS, triggers, seed data ready.
--
-- ⚠️  THIS DROPS AND RECREATES EVERYTHING. All existing data will be lost.
-- ══════════════════════════════════════════════════════════════════════════


-- ──────────────────────────────────────────────────────────────────────────
-- PART 0 · DROP EVERYTHING (clean slate)
-- Triggers on our custom tables are dropped automatically by CASCADE.
-- We only explicitly drop the auth.users trigger (that table always exists).
-- ──────────────────────────────────────────────────────────────────────────

-- Drop auth trigger (auth.users always exists so this is safe)
drop trigger if exists on_auth_user_created on auth.users;

-- Drop functions with CASCADE (removes any dependent triggers automatically)
drop function if exists public.protect_financial_fields()              cascade;
drop function if exists public.validate_booking_transition()           cascade;
drop function if exists public.increment_artist_bookings()             cascade;
drop function if exists public.update_artist_rating()                  cascade;
drop function if exists public.increment_loyalty_points(uuid, integer) cascade;
drop function if exists public.handle_new_user()                       cascade;
drop function if exists public.is_admin(uuid)                          cascade;
drop function if exists public.set_updated_at()                        cascade;

-- Drop ALL tables and views in public schema intelligently.
-- Queries information_schema so it drops each object as the correct type.
do $$
declare
  r record;
begin
  for r in (
    select table_name, table_type
    from information_schema.tables
    where table_schema = 'public'
    order by table_type  -- views before tables (avoids dependency issues)
  ) loop
    if r.table_type = 'VIEW' then
      execute 'drop view if exists public.' || quote_ident(r.table_name) || ' cascade';
    else
      execute 'drop table if exists public.' || quote_ident(r.table_name) || ' cascade';
    end if;
  end loop;
end $$;

drop type if exists public.escrow_status       cascade;
drop type if exists public.verification_status cascade;
drop type if exists public.payout_status       cascade;
drop type if exists public.booking_status      cascade;
drop type if exists public.app_role            cascade;


-- ──────────────────────────────────────────────────────────────────────────
-- PART 1 · EXTENSIONS + ENUMS
-- ──────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'musician', 'client', 'user');

create type public.booking_status as enum (
  'requested', 'accepted', 'confirmed', 'completed', 'cancelled', 'disputed'
);

create type public.payout_status as enum ('pending', 'processing', 'settled', 'failed');

create type public.verification_status as enum ('pending', 'verified', 'rejected');

create type public.escrow_status as enum (
  'awaiting_deposit', 'deposit_held', 'full_payment_held',
  'released', 'refunded', 'disputed'
);


-- ──────────────────────────────────────────────────────────────────────────
-- PART 2 · CORE IDENTITY
-- ──────────────────────────────────────────────────────────────────────────

create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text,
  email          text not null unique,
  role           public.app_role not null default 'user',
  loyalty_points integer not null default 0,
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.loyalty_point_transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  points_delta  integer not null,
  reason        text not null,
  source_domain text,
  reference_id  text,
  created_at    timestamptz not null default now()
);

-- Legacy bookings table (kept for admin dashboard revenue entries)
create table public.bookings (
  id                        uuid primary key default gen_random_uuid(),
  musician_id               uuid not null references public.profiles (id) on delete cascade,
  event_name                text not null,
  event_date                timestamptz not null,
  status                    text not null default 'pending',
  payment_forwarding_status text not null default 'pending',
  metadata                  jsonb not null default '{}'::jsonb,
  created_at                timestamptz not null default now()
);

create table public.revenue_entries (
  id            uuid primary key default gen_random_uuid(),
  amount        numeric(12,2) not null default 0,
  business_line text not null default 'general',
  source_domain text,
  created_at    timestamptz not null default now()
);

create table public.it_tickets (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  priority   text not null default 'medium',
  status     text not null default 'open',
  created_at timestamptz not null default now()
);


-- ──────────────────────────────────────────────────────────────────────────
-- PART 3 · LOOKUP TABLES (genres + instruments)
-- ──────────────────────────────────────────────────────────────────────────

create table public.genres (
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

create table public.instruments (
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


-- ──────────────────────────────────────────────────────────────────────────
-- PART 4 · ARTIST PROFILES
-- ──────────────────────────────────────────────────────────────────────────

create table public.artist_profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references public.profiles (id) on delete cascade,
  stage_name          text not null,
  bio                 text,
  hourly_rate         numeric(10,2),
  event_rate          numeric(10,2),
  city                text not null default 'Vasai-Virar',
  region              text not null default 'Palghar',
  available           boolean not null default true,
  commission_pct      numeric(4,2) not null default 10.00,
  profile_photo       text,
  cover_photo         text,
  youtube_url         text,
  instagram_url       text,
  phone_visible       boolean not null default false,
  search_rank         integer not null default 0,
  total_bookings      integer not null default 0,
  avg_rating          numeric(3,2) not null default 0.00,
  featured            boolean not null default false,
  verification_status public.verification_status not null default 'pending',
  rejection_reason    text,
  onboarded_via       text,
  -- Live Gig Engine (Uber mode)
  is_online           boolean not null default false,
  went_online_at      timestamptz,
  online_city         text,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.artist_genres (
  artist_id uuid not null references public.artist_profiles (id) on delete cascade,
  genre_id  integer not null references public.genres (id) on delete cascade,
  primary key (artist_id, genre_id)
);

create table public.artist_instruments (
  artist_id     uuid not null references public.artist_profiles (id) on delete cascade,
  instrument_id integer not null references public.instruments (id) on delete cascade,
  skill_level   text not null default 'proficient',
  primary key (artist_id, instrument_id)
);

create table public.artist_media (
  id         uuid primary key default gen_random_uuid(),
  artist_id  uuid not null references public.artist_profiles (id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video', 'audio', 'youtube')),
  url        text not null,
  thumbnail  text,
  title      text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.artist_recommendations (
  id             uuid primary key default gen_random_uuid(),
  source_artist  uuid not null references public.artist_profiles (id) on delete cascade,
  recommended_id uuid not null references public.artist_profiles (id) on delete cascade,
  reason         text not null,
  score          integer not null default 50,
  created_at     timestamptz not null default now(),
  unique (source_artist, recommended_id)
);

create table public.artist_share_links (
  id         uuid primary key default gen_random_uuid(),
  artist_id  uuid not null references public.artist_profiles (id) on delete cascade,
  code       text not null unique,
  clicks     integer not null default 0,
  bookings   integer not null default 0,
  created_at timestamptz not null default now()
);


-- ──────────────────────────────────────────────────────────────────────────
-- PART 5 · EVENT BOOKINGS
-- artist_id is NULLABLE to support instant/broadcast gigs where
-- no artist is pre-selected — first to accept claims the gig.
-- ──────────────────────────────────────────────────────────────────────────

create table public.event_bookings (
  id                  uuid primary key default gen_random_uuid(),
  organizer_id        uuid not null references public.profiles (id) on delete cascade,
  artist_id           uuid references public.artist_profiles (id) on delete set null,  -- nullable for instant gigs
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
  escrow_status       public.escrow_status not null default 'awaiting_deposit',
  deposit_amount      numeric(12,2) not null default 0,
  payment_id          text,
  razorpay_order_id   text,
  razorpay_payment_id text,
  payout_status       public.payout_status not null default 'pending',
  payout_settled_at   timestamptz,
  referral_code       text,
  cancellation_reason text,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.booking_reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.event_bookings (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (booking_id, reviewer_id)
);

create table public.schedule_change_requests (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null references public.event_bookings (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  request_type text not null,
  reason       text not null,
  status       text not null default 'pending',
  created_at   timestamptz not null default now()
);


-- ──────────────────────────────────────────────────────────────────────────
-- PART 6 · ARTIST WALLET + LEDGER
-- ──────────────────────────────────────────────────────────────────────────

create table public.artist_wallets (
  id                  uuid primary key default gen_random_uuid(),
  provider_id         uuid not null unique references public.artist_profiles (id) on delete cascade,
  balance_inr         numeric(12,2) not null default 0,
  total_earned_inr    numeric(12,2) not null default 0,
  total_fees_paid_inr numeric(12,2) not null default 0,
  total_tips_inr      numeric(12,2) not null default 0,
  last_transaction_at timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.wallet_transactions (
  id            uuid primary key default gen_random_uuid(),
  wallet_id     uuid not null references public.artist_wallets (id) on delete cascade,
  tx_type       text not null check (tx_type in (
                  'booking_earning', 'platform_fee', 'tip_credit',
                  'payout', 'bonus', 'refund', 'adjustment')),
  amount_inr    numeric(12,2) not null,  -- positive = credit, negative = debit
  balance_after numeric(12,2) not null,
  note          text,
  reference_id  uuid,                    -- booking id or payout id
  created_at    timestamptz not null default now()
);


-- ──────────────────────────────────────────────────────────────────────────
-- PART 7 · GEAR RENTAL
-- ──────────────────────────────────────────────────────────────────────────

create table public.gear_listings (
  id              uuid primary key default gen_random_uuid(),
  musician_id     uuid not null references public.artist_profiles (id) on delete cascade,
  gear_type       text not null check (gear_type in ('sound_system', 'instrument', 'lighting', 'other')),
  name            text not null,
  description     text,
  rate_per_day    numeric(10,2) not null check (rate_per_day >= 100),
  city            text not null,
  available       boolean not null default true,
  verified        boolean not null default false,
  photo           text,
  available_dates jsonb,                 -- array of ISO date strings when available
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ──────────────────────────────────────────────────────────────────────────
-- PART 8 · FUNCTIONS
-- ──────────────────────────────────────────────────────────────────────────

-- Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Admin check helper
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

-- Add/remove loyalty points
create or replace function public.increment_loyalty_points(target_user_id uuid, delta integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
  set loyalty_points = greatest(0, loyalty_points + delta)
  where id = target_user_id;
end;
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role, metadata)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    'user',
    '{}'::jsonb
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- Update artist avg_rating when a review is added
create or replace function public.update_artist_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_artist_id uuid;
  new_avg numeric(3,2);
begin
  select ap.id into target_artist_id
  from public.artist_profiles ap where ap.user_id = new.reviewee_id;

  if target_artist_id is null then return new; end if;

  select coalesce(avg(br.rating), 0) into new_avg
  from public.booking_reviews br
  join public.event_bookings eb on eb.id = br.booking_id
  where eb.artist_id = target_artist_id and br.reviewee_id = new.reviewee_id;

  update public.artist_profiles set avg_rating = new_avg where id = target_artist_id;
  return new;
end;
$$;

-- Increment total_bookings + award loyalty points when booking completes
create or replace function public.increment_artist_bookings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'completed' and (old.status is distinct from 'completed') then
    update public.artist_profiles set total_bookings = total_bookings + 1 where id = new.artist_id;
    perform public.increment_loyalty_points(
      (select user_id from public.artist_profiles where id = new.artist_id), 50
    );
  end if;
  return new;
end;
$$;

-- Booking state machine — only valid transitions allowed
create or replace function public.validate_booking_transition()
returns trigger language plpgsql as $$
declare
  allowed text[];
begin
  if old.status = new.status then return new; end if;

  case old.status::text
    when 'requested' then allowed := array['accepted', 'cancelled'];
    when 'accepted'  then allowed := array['confirmed', 'cancelled'];
    when 'confirmed' then allowed := array['completed', 'cancelled', 'disputed'];
    when 'completed' then allowed := array['disputed'];
    when 'cancelled' then allowed := array[]::text[];
    when 'disputed'  then allowed := array['completed', 'cancelled'];
    else allowed := array[]::text[];
  end case;

  if not (new.status::text = any(allowed)) then
    raise exception 'Invalid booking transition: % → %', old.status, new.status;
  end if;

  return new;
end;
$$;

-- Protect financial fields — only service_role can change money fields
create or replace function public.protect_financial_fields()
returns trigger language plpgsql as $$
begin
  if current_setting('role') != 'service_role' then
    new.agreed_amount       := old.agreed_amount;
    new.platform_fee_pct    := old.platform_fee_pct;
    new.artist_payout       := old.artist_payout;
    new.platform_revenue    := old.platform_revenue;
    new.deposit_amount      := old.deposit_amount;
    new.escrow_status       := old.escrow_status;
    new.razorpay_order_id   := old.razorpay_order_id;
    new.razorpay_payment_id := old.razorpay_payment_id;
    new.payout_status       := old.payout_status;
    new.payout_settled_at   := old.payout_settled_at;
  end if;
  return new;
end;
$$;


-- ──────────────────────────────────────────────────────────────────────────
-- PART 9 · TRIGGERS
-- ──────────────────────────────────────────────────────────────────────────

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_artist_profiles_updated_at
  before update on public.artist_profiles
  for each row execute function public.set_updated_at();

create trigger trg_event_bookings_updated_at
  before update on public.event_bookings
  for each row execute function public.set_updated_at();

create trigger trg_artist_wallets_updated_at
  before update on public.artist_wallets
  for each row execute function public.set_updated_at();

create trigger trg_gear_listings_updated_at
  before update on public.gear_listings
  for each row execute function public.set_updated_at();

create trigger trg_update_artist_rating
  after insert on public.booking_reviews
  for each row execute function public.update_artist_rating();

create trigger trg_increment_artist_bookings
  after update on public.event_bookings
  for each row execute function public.increment_artist_bookings();

create trigger trg_validate_booking_transition
  before update on public.event_bookings
  for each row execute function public.validate_booking_transition();

create trigger trg_protect_financial_fields
  before update on public.event_bookings
  for each row execute function public.protect_financial_fields();


-- ──────────────────────────────────────────────────────────────────────────
-- PART 10 · ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────────────────

alter table public.profiles                   enable row level security;
alter table public.loyalty_point_transactions enable row level security;
alter table public.bookings                   enable row level security;
alter table public.revenue_entries            enable row level security;
alter table public.it_tickets                 enable row level security;
alter table public.genres                     enable row level security;
alter table public.instruments                enable row level security;
alter table public.artist_profiles            enable row level security;
alter table public.artist_genres              enable row level security;
alter table public.artist_instruments         enable row level security;
alter table public.artist_media               enable row level security;
alter table public.artist_recommendations     enable row level security;
alter table public.artist_share_links         enable row level security;
alter table public.event_bookings             enable row level security;
alter table public.booking_reviews            enable row level security;
alter table public.schedule_change_requests   enable row level security;
alter table public.artist_wallets             enable row level security;
alter table public.wallet_transactions        enable row level security;
alter table public.gear_listings              enable row level security;

-- Profiles
create policy "profiles_select_self_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles_insert_self_or_admin" on public.profiles
  for insert with check (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles_update_self_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

-- Loyalty
create policy "loyalty_select_self_or_admin" on public.loyalty_point_transactions
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "loyalty_insert_admin_only" on public.loyalty_point_transactions
  for insert with check (public.is_admin(auth.uid()));

-- Genres + Instruments (public lookup)
create policy "genres_public_read" on public.genres for select using (true);
create policy "instruments_public_read" on public.instruments for select using (true);

-- Artist profiles (public read, owner + admin write)
create policy "artist_profiles_public_read" on public.artist_profiles
  for select using (true);
create policy "artist_profiles_owner_or_admin_insert" on public.artist_profiles
  for insert with check (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "artist_profiles_owner_or_admin_update" on public.artist_profiles
  for update using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Artist genres/instruments
create policy "artist_genres_public_read" on public.artist_genres for select using (true);
create policy "artist_genres_owner_or_admin_write" on public.artist_genres
  for insert with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );
create policy "artist_genres_owner_delete" on public.artist_genres
  for delete using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );

create policy "artist_instruments_public_read" on public.artist_instruments for select using (true);
create policy "artist_instruments_owner_or_admin_write" on public.artist_instruments
  for insert with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );

-- Artist media
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

-- Recommendations + Share links
create policy "recommendations_public_read" on public.artist_recommendations for select using (true);
create policy "recommendations_admin_write" on public.artist_recommendations
  for insert with check (public.is_admin(auth.uid()));

create policy "share_links_public_read" on public.artist_share_links for select using (true);
create policy "share_links_owner_or_admin_write" on public.artist_share_links
  for insert with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );

-- Event bookings (organizer + artist + admin)
create policy "event_bookings_select" on public.event_bookings
  for select using (
    public.is_admin(auth.uid())
    or organizer_id = auth.uid()
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );
create policy "event_bookings_insert" on public.event_bookings
  for insert with check (public.is_admin(auth.uid()) or organizer_id = auth.uid());
create policy "event_bookings_update" on public.event_bookings
  for update using (
    public.is_admin(auth.uid())
    or organizer_id = auth.uid()
    or exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid())
  );

-- Reviews
create policy "booking_reviews_public_read" on public.booking_reviews for select using (true);
create policy "booking_reviews_insert" on public.booking_reviews
  for insert with check (reviewer_id = auth.uid());

-- Schedule changes
create policy "schedule_changes_select" on public.schedule_change_requests
  for select using (
    public.is_admin(auth.uid())
    or requester_id = auth.uid()
    or exists (
      select 1 from public.event_bookings eb
      join public.artist_profiles ap on ap.id = eb.artist_id
      where eb.id = booking_id and ap.user_id = auth.uid()
    )
  );
create policy "schedule_changes_insert" on public.schedule_change_requests
  for insert with check (requester_id = auth.uid() or public.is_admin(auth.uid()));
create policy "schedule_changes_update_admin" on public.schedule_change_requests
  for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Wallets (artist sees own, admin sees all)
create policy "wallets_select_owner_or_admin" on public.artist_wallets
  for select using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = provider_id and ap.user_id = auth.uid())
  );
create policy "wallets_insert_owner_or_admin" on public.artist_wallets
  for insert with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = provider_id and ap.user_id = auth.uid())
  );
create policy "wallets_update_owner_or_admin" on public.artist_wallets
  for update using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = provider_id and ap.user_id = auth.uid())
  );

create policy "wallet_tx_select_owner_or_admin" on public.wallet_transactions
  for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.artist_wallets aw
      join public.artist_profiles ap on ap.id = aw.provider_id
      where aw.id = wallet_id and ap.user_id = auth.uid()
    )
  );
create policy "wallet_tx_insert_owner_or_admin" on public.wallet_transactions
  for insert with check (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.artist_wallets aw
      join public.artist_profiles ap on ap.id = aw.provider_id
      where aw.id = wallet_id and ap.user_id = auth.uid()
    )
  );

-- Gear listings
create policy "gear_listings_public_read" on public.gear_listings for select using (true);
create policy "gear_listings_owner_insert" on public.gear_listings
  for insert with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = musician_id and ap.user_id = auth.uid())
  );
create policy "gear_listings_owner_update" on public.gear_listings
  for update using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = musician_id and ap.user_id = auth.uid())
  );
create policy "gear_listings_owner_delete" on public.gear_listings
  for delete using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.artist_profiles ap where ap.id = musician_id and ap.user_id = auth.uid())
  );

-- Revenue + IT tickets: admin only
create policy "revenue_admin_only" on public.revenue_entries
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "it_tickets_admin_only" on public.it_tickets
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "bookings_owner_or_admin" on public.bookings
  for all using (auth.uid() = musician_id or public.is_admin(auth.uid()))
  with check (auth.uid() = musician_id or public.is_admin(auth.uid()));


-- ──────────────────────────────────────────────────────────────────────────
-- PART 11 · INDEXES
-- ──────────────────────────────────────────────────────────────────────────

create index idx_artist_profiles_city           on public.artist_profiles (city);
create index idx_artist_profiles_available      on public.artist_profiles (available) where available = true;
create index idx_artist_profiles_featured       on public.artist_profiles (featured) where featured = true;
create index idx_artist_profiles_search_rank    on public.artist_profiles (search_rank desc);
create index idx_artist_profiles_verification   on public.artist_profiles (verification_status) where verification_status = 'verified';
create index idx_artist_profiles_online_city    on public.artist_profiles (online_city) where is_online = true;
create index idx_event_bookings_artist          on public.event_bookings (artist_id);
create index idx_event_bookings_organizer       on public.event_bookings (organizer_id);
create index idx_event_bookings_status          on public.event_bookings (status);
create index idx_event_bookings_date            on public.event_bookings (event_date);
create index idx_artist_media_artist            on public.artist_media (artist_id);
create index idx_booking_reviews_booking        on public.booking_reviews (booking_id);
create index idx_wallet_transactions_wallet     on public.wallet_transactions (wallet_id);
create index idx_gear_listings_city             on public.gear_listings (city);
create index idx_gear_listings_type             on public.gear_listings (gear_type);


-- ──────────────────────────────────────────────────────────────────────────
-- PART 12 · SEED DATA (test accounts + demo artists)
-- ──────────────────────────────────────────────────────────────────────────

-- Test users — 3 main accounts + 4 extra artist accounts (one user per artist profile)
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, instance_id, aud, role)
values
  ('a0000000-0000-0000-0000-000000000001', 'admin@joshoit.com',   crypt('JoShoAdmin2026!',  gen_salt('bf')), now(), now(), now(), '{"full_name":"Sijoy Admin"}'::jsonb,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000001', 'artist1@joshoit.com', crypt('JoShoArtist2026!', gen_salt('bf')), now(), now(), now(), '{"full_name":"DJ TestBeats"}'::jsonb,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000002', 'artist2@joshoit.com', crypt('JoShoArtist2026!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Priya Vocals"}'::jsonb,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000003', 'artist3@joshoit.com', crypt('JoShoArtist2026!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Vishal Drums"}'::jsonb,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000004', 'artist4@joshoit.com', crypt('JoShoArtist2026!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Sanjay Keys"}'::jsonb,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000005', 'artist5@joshoit.com', crypt('JoShoArtist2026!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Amit Guitar"}'::jsonb,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('c0000000-0000-0000-0000-000000000001', 'client@joshoit.com',  crypt('JoShoClient2026!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Test Client"}'::jsonb,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict do nothing;

-- Set roles
update public.profiles set role = 'admin',    full_name = 'Sijoy Admin'  where email = 'admin@joshoit.com';
update public.profiles set role = 'musician', full_name = 'DJ TestBeats' where email = 'artist1@joshoit.com';
update public.profiles set role = 'musician', full_name = 'Priya Vocals' where email = 'artist2@joshoit.com';
update public.profiles set role = 'musician', full_name = 'Vishal Drums' where email = 'artist3@joshoit.com';
update public.profiles set role = 'musician', full_name = 'Sanjay Keys'  where email = 'artist4@joshoit.com';
update public.profiles set role = 'musician', full_name = 'Amit Guitar'  where email = 'artist5@joshoit.com';
update public.profiles set role = 'client',   full_name = 'Test Client'  where email = 'client@joshoit.com';

-- Demo artist profiles — each has its own unique user account
insert into public.artist_profiles
  (id, user_id, stage_name, bio, event_rate, city, available, verification_status, featured, search_rank, total_bookings, avg_rating)
values
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'DJ TestBeats', 'Professional DJ for weddings and parties. 5+ years experience in Vasai-Virar.', 5000, 'Vasai',      true, 'verified', true,  100, 42,  4.7),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Priya Vocals', 'Classical and Bollywood vocalist. Trained under Pandit Ramesh Sharma.',           3500, 'Virar',      true, 'verified', true,  90,  89,  4.9),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Vishal Drums', 'Professional drummer, 10+ years. Corporate events and band gigs.',                3000, 'Vasai',      true, 'verified', true,  85,  156, 4.8),
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Sanjay Keys',  'Keyboard and synth player. Jazz, Bollywood, fusion.',                              2500, 'Nalasopara', true, 'verified', false, 75,  203, 4.6),
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Amit Guitar',  'Lead guitarist. 15 years experience. Rock, blues, and film music.',                2000, 'Vasai',      true, 'verified', false, 70,  67,  4.5)
on conflict (id) do nothing;

-- Genres for demo artists
insert into public.artist_genres (artist_id, genre_id)
select 'd0000000-0000-0000-0000-000000000001'::uuid, id from public.genres where slug in ('bollywood', 'edm')
union all
select 'd0000000-0000-0000-0000-000000000002'::uuid, id from public.genres where slug in ('bollywood', 'classical')
union all
select 'd0000000-0000-0000-0000-000000000003'::uuid, id from public.genres where slug = 'bollywood'
union all
select 'd0000000-0000-0000-0000-000000000004'::uuid, id from public.genres where slug in ('bollywood', 'jazz')
union all
select 'd0000000-0000-0000-0000-000000000005'::uuid, id from public.genres where slug in ('western', 'jazz')
on conflict do nothing;

-- Instruments for demo artists
insert into public.artist_instruments (artist_id, instrument_id)
select 'd0000000-0000-0000-0000-000000000001'::uuid, id from public.instruments where slug in ('dj', 'keyboard')
union all
select 'd0000000-0000-0000-0000-000000000002'::uuid, id from public.instruments where slug = 'vocals'
union all
select 'd0000000-0000-0000-0000-000000000003'::uuid, id from public.instruments where slug in ('drums', 'tabla')
union all
select 'd0000000-0000-0000-0000-000000000004'::uuid, id from public.instruments where slug in ('keyboard', 'producer')
union all
select 'd0000000-0000-0000-0000-000000000005'::uuid, id from public.instruments where slug = 'guitar'
on conflict do nothing;


-- ══════════════════════════════════════════════════════════════════════════
-- SETUP COMPLETE ✓
--
-- Test accounts:
--   admin@joshoit.com    / JoShoAdmin2026!   → role: admin
--   artist1@joshoit.com  / JoShoArtist2026!  → role: musician (DJ TestBeats, verified)
--   artist2@joshoit.com  / JoShoArtist2026!  → role: musician (Priya Vocals, verified)
--   artist3@joshoit.com  / JoShoArtist2026!  → role: musician (Vishal Drums, verified)
--   artist4@joshoit.com  / JoShoArtist2026!  → role: musician (Sanjay Keys, verified)
--   artist5@joshoit.com  / JoShoArtist2026!  → role: musician (Amit Guitar, verified)
--   client@joshoit.com   / JoShoClient2026!  → role: client
--
-- After running:
--   1. Go to Supabase → Authentication → Providers → Google → set redirect URL
--   2. Go to Supabase → Database → Replication → enable Realtime on:
--        artist_profiles, event_bookings
--   3. Start the app:  cd C:/Sijoy_2.0/josho-hub && npm run dev
-- ══════════════════════════════════════════════════════════════════════════
