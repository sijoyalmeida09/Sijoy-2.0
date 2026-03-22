-- JoSho Empire Central Hub foundation schema
-- Run in Supabase SQL editor or via migration tooling.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'musician', 'client', 'user');
  end if;
end$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null unique,
  role public.app_role not null default 'user',
  loyalty_points integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  points_delta integer not null,
  reason text not null,
  source_domain text,
  reference_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  musician_id uuid not null references public.profiles (id) on delete cascade,
  event_name text not null,
  event_date timestamptz not null,
  status text not null default 'pending',
  payment_forwarding_status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.schedule_change_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  request_type text not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Optional cross-domain metrics tables used by admin dashboard.
create table if not exists public.revenue_entries (
  id uuid primary key default gen_random_uuid(),
  amount numeric(12,2) not null default 0,
  business_line text not null default 'general',
  source_domain text,
  created_at timestamptz not null default now()
);

create table if not exists public.it_tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  priority text not null default 'medium',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role = 'admin'
  );
$$;

create or replace function public.increment_loyalty_points(target_user_id uuid, delta integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set loyalty_points = greatest(0, loyalty_points + delta)
  where id = target_user_id;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, metadata)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    'user',
    '{}'::jsonb
  )
  on conflict (id) do update set
    email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.loyalty_point_transactions enable row level security;
alter table public.bookings enable row level security;
alter table public.schedule_change_requests enable row level security;
alter table public.revenue_entries enable row level security;
alter table public.it_tickets enable row level security;

-- Profiles: self read/write, admin read/write all.
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_insert_self_or_admin" on public.profiles;
create policy "profiles_insert_self_or_admin"
on public.profiles
for insert
with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
using (auth.uid() = id or public.is_admin(auth.uid()))
with check (auth.uid() = id or public.is_admin(auth.uid()));

-- Loyalty transactions: user sees own, admin sees all.
drop policy if exists "loyalty_select_self_or_admin" on public.loyalty_point_transactions;
create policy "loyalty_select_self_or_admin"
on public.loyalty_point_transactions
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "loyalty_insert_admin_only" on public.loyalty_point_transactions;
create policy "loyalty_insert_admin_only"
on public.loyalty_point_transactions
for insert
with check (public.is_admin(auth.uid()));

-- Bookings: musician sees own, admin sees all; admin can mutate.
drop policy if exists "bookings_select_owner_or_admin" on public.bookings;
create policy "bookings_select_owner_or_admin"
on public.bookings
for select
using (auth.uid() = musician_id or public.is_admin(auth.uid()));

drop policy if exists "bookings_insert_owner_or_admin" on public.bookings;
create policy "bookings_insert_owner_or_admin"
on public.bookings
for insert
with check (auth.uid() = musician_id or public.is_admin(auth.uid()));

drop policy if exists "bookings_update_owner_or_admin" on public.bookings;
create policy "bookings_update_owner_or_admin"
on public.bookings
for update
using (auth.uid() = musician_id or public.is_admin(auth.uid()))
with check (auth.uid() = musician_id or public.is_admin(auth.uid()));

-- Schedule change requests.
drop policy if exists "schedule_changes_select_related_or_admin" on public.schedule_change_requests;
create policy "schedule_changes_select_related_or_admin"
on public.schedule_change_requests
for select
using (
  public.is_admin(auth.uid())
  or requester_id = auth.uid()
  or exists (
    select 1 from public.bookings b
    where b.id = booking_id
      and b.musician_id = auth.uid()
  )
);

drop policy if exists "schedule_changes_insert_requester_or_admin" on public.schedule_change_requests;
create policy "schedule_changes_insert_requester_or_admin"
on public.schedule_change_requests
for insert
with check (requester_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "schedule_changes_update_admin_only" on public.schedule_change_requests;
create policy "schedule_changes_update_admin_only"
on public.schedule_change_requests
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Revenue and IT tickets: admin-only visibility by default.
drop policy if exists "revenue_admin_only" on public.revenue_entries;
create policy "revenue_admin_only"
on public.revenue_entries
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "it_tickets_admin_only" on public.it_tickets;
create policy "it_tickets_admin_only"
on public.it_tickets
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
