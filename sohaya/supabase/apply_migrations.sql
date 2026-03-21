-- =============================================================
-- Sohaya: Apply all pending migrations (003-007)
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================

-- ── 003: Drop bad profiles INSERT policy ───────────────────
drop policy if exists "Users can insert own profile" on profiles;

-- ── 004: Clean up corrupted seed auth.users rows ───────────
delete from providers where profile_id in (
  select id from profiles where id::text like '11111111-1111-1111-1111-11111111%'
);
delete from profiles where id::text like '11111111-1111-1111-1111-11111111%';
delete from auth.users where id::text like '11111111-1111-1111-1111-11111111%';

-- ── 005: Fix handle_new_user trigger ───────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

alter function handle_new_user() owner to postgres;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

drop policy if exists "Allow profile creation" on profiles;
create policy "Allow profile creation" on profiles
  for insert with check (
    auth.uid() is null
    or auth.uid() = id
  );

-- ── 006: Fix leads RLS ─────────────────────────────────────
drop policy if exists "Providers see assigned leads" on leads;
create policy "Providers see assigned leads" on leads
  for select using (
    id in (
      select lead_id from lead_providers
      where provider_id in (
        select id from providers where profile_id = auth.uid()
      )
    )
  );

drop policy if exists "Lead participants can update lead" on leads;
create policy "Lead participants can update lead" on leads
  for update using (
    client_id in (select id from clients where profile_id = auth.uid())
    or id in (
      select lead_id from lead_providers
      where provider_id in (
        select id from providers where profile_id = auth.uid()
      )
    )
  );

-- ── 007: Fix instant_gigs SELECT RLS ──────────────────────
drop policy if exists "Clients see own instant gigs" on instant_gigs;
create policy "Clients see own instant gigs" on instant_gigs
  for select using (
    client_id in (select id from clients where profile_id = auth.uid())
  );

drop policy if exists "Providers see broadcast gigs" on instant_gigs;
create policy "Providers see broadcast gigs" on instant_gigs
  for select using (
    status = 'broadcast'
    or accepted_by_id in (select id from providers where profile_id = auth.uid())
  );

-- Done!
select 'All migrations applied successfully ✓' as result;
