-- Point schedule_change_requests at event_bookings (single source of truth for bookings).
-- Run after 0001 and 0002. Drops old table that referenced bookings(id) and recreates for event_bookings.

drop policy if exists "schedule_changes_select_related_or_admin" on public.schedule_change_requests;
drop policy if exists "schedule_changes_insert_requester_or_admin" on public.schedule_change_requests;
drop policy if exists "schedule_changes_update_admin_only" on public.schedule_change_requests;
drop table if exists public.schedule_change_requests;

create table public.schedule_change_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.event_bookings (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  request_type text not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.schedule_change_requests enable row level security;

create policy "schedule_changes_select_related_or_admin"
on public.schedule_change_requests for select
using (
  public.is_admin(auth.uid())
  or requester_id = auth.uid()
  or exists (
    select 1 from public.event_bookings eb
    join public.artist_profiles ap on ap.id = eb.artist_id
    where eb.id = booking_id and ap.user_id = auth.uid()
  )
);

create policy "schedule_changes_insert_requester_or_admin"
on public.schedule_change_requests for insert
with check (requester_id = auth.uid() or public.is_admin(auth.uid()));

create policy "schedule_changes_update_admin_only"
on public.schedule_change_requests for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
