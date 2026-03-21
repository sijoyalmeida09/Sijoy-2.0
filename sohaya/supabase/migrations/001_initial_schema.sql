-- Sohaya Entertainment Marketplace
-- Initial Database Schema

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis" schema extensions; -- for geo queries (optional)

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  phone text,
  role text not null default 'client' check (role in ('client', 'provider', 'admin')),
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROVIDERS
-- ============================================================
create table if not exists providers (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  entity_type text not null default 'individual' check (entity_type in ('individual', 'band', 'agency')),
  band_name text,
  display_name text not null,
  bio text,
  ai_generated_bio text,
  instruments text[] not null default '{}',
  categories text[] not null default '{}',
  state text not null default '',
  city text not null default '',
  languages text[] not null default '{}',
  base_rate_inr numeric not null default 0 check (base_rate_inr >= 0),
  hourly_rate_inr numeric check (hourly_rate_inr >= 0),
  travel_radius_km int not null default 50 check (travel_radius_km >= 0),
  avg_rating numeric not null default 0 check (avg_rating >= 0 and avg_rating <= 5),
  total_gigs int not null default 0 check (total_gigs >= 0),
  is_online boolean not null default false,
  live_location jsonb,  -- {lat: number, lng: number}
  is_founder boolean not null default false,
  commission_tier text not null default 'standard' check (commission_tier in ('founder', 'standard', 'premium')),
  band_promotion_tier text not null default 'basic' check (band_promotion_tier in ('standard_penalty', 'basic', 'featured', 'spotlight')),
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'basic', 'pro', 'enterprise')),
  response_rate int not null default 100 check (response_rate >= 0 and response_rate <= 100),
  profile_completeness int not null default 0 check (profile_completeness >= 0 and profile_completeness <= 100),
  status text not null default 'pending' check (status in ('pending', 'verified', 'suspended', 'rejected')),
  video_preview_url text,
  photo_urls text[] not null default '{}',
  audio_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_providers_status on providers(status);
create index if not exists idx_providers_city on providers(city);
create index if not exists idx_providers_is_online on providers(is_online);
create index if not exists idx_providers_is_founder on providers(is_founder);
create index if not exists idx_providers_avg_rating on providers(avg_rating desc);
create index if not exists idx_providers_base_rate on providers(base_rate_inr);
create index if not exists idx_providers_categories on providers using gin(categories);

-- ============================================================
-- CLIENTS
-- ============================================================
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  preferred_cities text[],
  saved_providers uuid[],
  created_at timestamptz not null default now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  slug text primary key,
  name text not null,
  name_hi text not null default '',
  parent_id text references categories(slug) on delete set null,
  icon text not null default '🎵',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PROVIDER CATEGORIES (junction)
-- ============================================================
create table if not exists provider_categories (
  provider_id uuid references providers(id) on delete cascade,
  category_slug text references categories(slug) on delete cascade,
  primary key (provider_id, category_slug)
);

-- ============================================================
-- LEADS
-- ============================================================
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  event_type text not null,
  event_date date,
  event_time time,
  duration_hours numeric,
  location_text text not null,
  location_lat numeric,
  location_lng numeric,
  budget_hint_inr numeric,
  notes text,
  status text not null default 'open' check (status in ('open', 'matched', 'quoted', 'booked', 'closed')),
  ai_parsed_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_client_id on leads(client_id);
create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_event_date on leads(event_date);

-- ============================================================
-- LEAD PROVIDERS (junction)
-- ============================================================
create table if not exists lead_providers (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references leads(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  sent_at timestamptz not null default now(),
  viewed_at timestamptz,
  unique(lead_id, provider_id)
);

create index if not exists idx_lead_providers_provider_id on lead_providers(provider_id);

-- ============================================================
-- QUOTES
-- ============================================================
create table if not exists quotes (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references leads(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  quoted_amount_inr numeric not null check (quoted_amount_inr > 0),
  event_type text not null,
  commission_rate numeric not null default 0.12,  -- INTERNAL ONLY, never exposed to clients/providers
  client_display_amount_inr numeric not null,     -- What client actually sees and pays
  services_description text not null,
  valid_until timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  created_at timestamptz not null default now()
);

create index if not exists idx_quotes_lead_id on quotes(lead_id);
create index if not exists idx_quotes_provider_id on quotes(provider_id);

-- RLS: Never expose commission_rate
create or replace view public.quotes_safe as
  select id, lead_id, provider_id, event_type, client_display_amount_inr,
         services_description, valid_until, status, created_at
  from quotes;

-- ============================================================
-- BOOKINGS
-- ============================================================
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) on delete set null,
  quote_id uuid references quotes(id) on delete set null,
  provider_id uuid not null references providers(id) on delete restrict,
  client_id uuid not null references clients(id) on delete restrict,
  event_type text not null,
  event_date date not null,
  event_time time,
  duration_hours numeric,
  location text not null,
  total_amount_inr numeric not null check (total_amount_inr > 0),
  provider_payout_inr numeric not null check (provider_payout_inr >= 0),
  platform_commission_inr numeric not null default 0,
  razorpay_payment_id text,
  razorpay_order_id text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'disputed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_provider_id on bookings(provider_id);
create index if not exists idx_bookings_client_id on bookings(client_id);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_bookings_event_date on bookings(event_date);

-- ============================================================
-- INSTANT GIGS
-- ============================================================
create table if not exists instant_gigs (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  category_ids text[] not null default '{}',
  location_lat numeric not null,
  location_lng numeric not null,
  location_text text not null,
  start_time timestamptz not null,
  duration_hours numeric not null,
  budget_inr numeric not null,          -- Client budget (internal)
  provider_payout_inr numeric not null, -- What provider earns
  status text not null default 'broadcast' check (status in ('broadcast', 'accepted', 'expired', 'cancelled')),
  accepted_by_id uuid references providers(id),
  client_id uuid not null references clients(id) on delete cascade,
  broadcast_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_instant_gigs_status on instant_gigs(status);

-- ============================================================
-- MESSAGES
-- ============================================================
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references leads(id) on delete cascade,
  sender_profile_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  attachment_urls text[],
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_lead_id on messages(lead_id);

-- ============================================================
-- REVIEWS
-- ============================================================
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  rating numeric not null check (rating >= 1 and rating <= 5),
  title text,
  body text not null,
  photo_urls text[],
  is_verified boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_provider_id on reviews(provider_id);

-- ============================================================
-- CALENDAR EVENTS
-- ============================================================
create table if not exists calendar_events (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references providers(id) on delete cascade,
  title text not null,
  event_type text not null default 'blocked',
  start_at timestamptz not null,
  end_at timestamptz not null,
  booking_id uuid references bookings(id) on delete set null,
  source text not null default 'manual' check (source in ('manual', 'booking', 'google', 'ical')),
  blocks_leads boolean not null default true,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_calendar_events_provider_id on calendar_events(provider_id);

-- ============================================================
-- CANCELLATION POLICIES
-- ============================================================
create table if not exists cancellation_policies (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references providers(id) on delete cascade,
  name text not null,
  deposit_refundable boolean not null default false,
  balance_refundable boolean not null default true,
  cancellation_window_days int not null default 7,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- EVENT COMMISSIONS
-- ============================================================
create table if not exists event_commissions (
  event_type text primary key,
  base_commission_percentage numeric not null check (base_commission_percentage >= 0 and base_commission_percentage <= 100),
  created_at timestamptz not null default now()
);

-- ============================================================
-- PALETTES (AI-assembled packages)
-- ============================================================
create table if not exists palettes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  event_type text not null,
  region text not null default 'all',
  provider_ids uuid[] not null default '{}',
  package_fee_percentage numeric not null default 0 check (package_fee_percentage >= 0 and package_fee_percentage <= 30),
  is_active boolean not null default true,
  description text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- DISPUTES
-- ============================================================
create table if not exists disputes (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete cascade,
  reporter_id uuid not null references profiles(id) on delete cascade,
  reason text not null,
  evidence_urls text[],
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'closed')),
  resolution_type text,
  resolved_by uuid references profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger update_providers_updated_at before update on providers
  for each row execute function update_updated_at_column();

create or replace trigger update_bookings_updated_at before update on bookings
  for each row execute function update_updated_at_column();

create or replace trigger update_leads_updated_at before update on leads
  for each row execute function update_updated_at_column();

-- Recalculate avg_rating after review changes
create or replace function recalculate_provider_rating()
returns trigger as $$
declare
  v_provider_id uuid;
  v_avg_rating numeric;
  v_total_gigs int;
begin
  -- Get provider_id from the affected row
  if (tg_op = 'DELETE') then
    v_provider_id := old.provider_id;
  else
    v_provider_id := new.provider_id;
  end if;

  -- Calculate new average
  select
    coalesce(round(avg(rating)::numeric, 2), 0),
    count(*)::int
  into v_avg_rating, v_total_gigs
  from reviews
  where provider_id = v_provider_id;

  -- Update provider
  update providers
  set avg_rating = v_avg_rating,
      total_gigs = v_total_gigs
  where id = v_provider_id;

  return null;
end;
$$ language plpgsql;

create or replace trigger reviews_after_insert after insert on reviews
  for each row execute function recalculate_provider_rating();

create or replace trigger reviews_after_update after update on reviews
  for each row execute function recalculate_provider_rating();

create or replace trigger reviews_after_delete after delete on reviews
  for each row execute function recalculate_provider_rating();

-- Auto-create profile on auth.users insert
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table providers enable row level security;
alter table clients enable row level security;
alter table leads enable row level security;
alter table lead_providers enable row level security;
alter table quotes enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table messages enable row level security;
alter table instant_gigs enable row level security;
alter table calendar_events enable row level security;
alter table disputes enable row level security;

-- Profiles: users can see their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Providers: verified providers are public; owners can edit
create policy "Verified providers are public" on providers
  for select using (status = 'verified' or profile_id = auth.uid());

create policy "Providers can update own profile" on providers
  for update using (profile_id = auth.uid());

create policy "Authenticated users can create provider" on providers
  for insert with check (profile_id = auth.uid());

-- Clients: own records only
create policy "Clients can view own record" on clients
  for select using (profile_id = auth.uid());

create policy "Clients can insert own record" on clients
  for insert with check (profile_id = auth.uid());

-- Leads: clients see own leads; providers see leads sent to them
create policy "Clients see own leads" on leads
  for select using (
    client_id in (select id from clients where profile_id = auth.uid())
  );

create policy "Clients can create leads" on leads
  for insert with check (
    client_id in (select id from clients where profile_id = auth.uid())
  );

-- Lead providers: providers can see their own lead assignments
create policy "Providers see own lead assignments" on lead_providers
  for select using (
    provider_id in (select id from providers where profile_id = auth.uid())
  );

create policy "Providers can update own lead assignments" on lead_providers
  for update using (
    provider_id in (select id from providers where profile_id = auth.uid())
  );

-- Quotes: providers see own quotes; clients see quotes for their leads (but not commission_rate)
create policy "Providers manage own quotes" on quotes
  for all using (
    provider_id in (select id from providers where profile_id = auth.uid())
  );

create policy "Clients see quotes for own leads" on quotes
  for select using (
    lead_id in (
      select l.id from leads l
      join clients c on c.id = l.client_id
      where c.profile_id = auth.uid()
    )
  );

-- Bookings: providers and clients see own bookings
create policy "Providers see own bookings" on bookings
  for select using (
    provider_id in (select id from providers where profile_id = auth.uid())
  );

create policy "Clients see own bookings" on bookings
  for select using (
    client_id in (select id from clients where profile_id = auth.uid())
  );

-- Reviews: public
create policy "Reviews are public" on reviews
  for select using (true);

create policy "Clients can create reviews" on reviews
  for insert with check (
    client_id in (select id from clients where profile_id = auth.uid())
  );

-- Messages: lead participants only
create policy "Lead participants see messages" on messages
  for select using (sender_profile_id = auth.uid());

create policy "Authenticated can send messages" on messages
  for insert with check (sender_profile_id = auth.uid());

-- Calendar: providers manage own calendars; public events visible
create policy "Public calendar events visible" on calendar_events
  for select using (is_public = true or provider_id in (select id from providers where profile_id = auth.uid()));

create policy "Providers manage own calendar" on calendar_events
  for all using (provider_id in (select id from providers where profile_id = auth.uid()));

-- ============================================================
-- SEED DATA: Event Commissions
-- ============================================================
insert into event_commissions (event_type, base_commission_percentage) values
  ('restaurant_live', 5),
  ('restaurant', 5),
  ('small_party', 10),
  ('birthday', 10),
  ('corporate', 15),
  ('anniversary', 12),
  ('engagement', 15),
  ('wedding', 20),
  ('sangeet', 18),
  ('reception', 18)
on conflict (event_type) do nothing;

-- ============================================================
-- SEED DATA: Categories
-- ============================================================
insert into categories (slug, name, name_hi, parent_id, icon, sort_order) values
  -- Top level
  ('musical-act', 'Musical Act', 'संगीत कार्यक्रम', null, '🎵', 1),
  ('entertainer', 'Entertainer', 'मनोरंजनकर्ता', null, '🎭', 2),
  ('speakers', 'Speakers', 'वक्ता', null, '🎤', 3),
  ('event-services', 'Event Services', 'इवेंट सेवाएं', null, '🎪', 4),
  -- Musical Act subcategories
  ('bollywood-band', 'Bollywood Band', 'बॉलीवुड बैंड', 'musical-act', '🎸', 1),
  ('dj', 'DJ', 'डीजे', 'musical-act', '🎧', 2),
  ('ghazal', 'Ghazal Singer', 'ग़ज़ल गायक', 'musical-act', '🎙️', 3),
  ('classical', 'Classical Music', 'शास्त्रीय संगीत', 'musical-act', '🎻', 4),
  ('folk', 'Folk Music', 'लोक संगीत', 'musical-act', '🪗', 5),
  ('wedding-specialist', 'Wedding Specialist', 'विवाह विशेषज्ञ', 'musical-act', '💍', 6),
  -- Entertainer subcategories
  ('dancer', 'Dancer', 'नर्तक', 'entertainer', '💃', 1),
  ('comedian', 'Comedian', 'हास्य कलाकार', 'entertainer', '😄', 2),
  ('dhol', 'Dhol Player', 'ढोल वादक', 'entertainer', '🥁', 3),
  ('fire-performer', 'Fire Performer', 'अग्नि कलाकार', 'entertainer', '🔥', 4),
  ('childrens-act', 'Children''s Act', 'बच्चों का मनोरंजन', 'entertainer', '🎪', 5),
  -- Speakers subcategories
  ('corporate-speaker', 'Corporate Speaker', 'कॉर्पोरेट वक्ता', 'speakers', '💼', 1),
  ('motivational', 'Motivational Speaker', 'प्रेरणादायक वक्ता', 'speakers', '💪', 2),
  ('emcee', 'Emcee / Host', 'एंकर', 'speakers', '🎙️', 3),
  ('wedding-host', 'Wedding Host', 'विवाह एंकर', 'speakers', '🥂', 4),
  ('standup', 'Stand-Up Comedy', 'स्टैंड-अप कॉमेडी', 'speakers', '🎭', 5),
  -- Event Services subcategories
  ('sound-light', 'Sound & Light', 'साउंड और लाइट', 'event-services', '💡', 1),
  ('decor', 'Decor', 'सजावट', 'event-services', '🌸', 2),
  ('photographer', 'Photographer', 'फोटोग्राफर', 'event-services', '📸', 3),
  ('catering', 'Catering', 'केटरिंग', 'event-services', '🍽️', 4),
  ('photo-booth', 'Photo Booth', 'फोटो बूथ', 'event-services', '📷', 5)
on conflict (slug) do nothing;
