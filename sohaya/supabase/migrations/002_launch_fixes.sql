-- ============================================================
-- 002_launch_fixes.sql
-- Sohaya — Critical launch bug fixes
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- FIX 1: bookings status CHECK — add pending_verification
-- ============================================================
alter table bookings
  drop constraint if exists bookings_status_check;

alter table bookings
  add constraint bookings_status_check
  check (status in ('pending', 'pending_verification', 'confirmed', 'completed', 'cancelled', 'disputed'));

-- ============================================================
-- FIX 2: Add utr_number column to bookings
-- (stop reusing razorpay_payment_id for UTR storage)
-- ============================================================
alter table bookings
  add column if not exists utr_number text;

-- ============================================================
-- FIX 3: RLS — add missing INSERT policy on bookings
-- (clients and system can create bookings)
-- ============================================================
create policy "Clients can create bookings"
  on bookings for insert
  with check (
    client_id in (
      select id from clients where profile_id = auth.uid()
    )
  );

-- ============================================================
-- FIX 4: RLS — add missing UPDATE policy on bookings
-- (providers and clients can update status of their own bookings)
-- ============================================================
create policy "Parties can update own bookings"
  on bookings for update
  using (
    provider_id in (select id from providers where profile_id = auth.uid())
    or
    client_id in (select id from clients where profile_id = auth.uid())
  );

-- ============================================================
-- FIX 5: RLS — add missing INSERT policy on instant_gigs
-- (clients can broadcast instant gigs)
-- ============================================================
create policy "Clients can create instant gigs"
  on instant_gigs for insert
  with check (
    client_id in (
      select id from clients where profile_id = auth.uid()
    )
  );

-- ============================================================
-- FIX 6: RLS — add missing UPDATE policy on instant_gigs
-- (providers accept gigs via API — row already exists, provider updates status)
-- ============================================================
create policy "Providers can accept instant gigs"
  on instant_gigs for update
  using (status = 'broadcast');

-- ============================================================
-- FIX 7: RLS — add missing INSERT policy on lead_providers
-- (system inserts when matching leads to providers)
-- Server-side API routes handle authorization logic
-- ============================================================
create policy "Service inserts lead providers"
  on lead_providers for insert
  with check (true);

-- ============================================================
-- FIX 8: Add profile INSERT policy
-- (needed for handle_new_user trigger + manual upsert in API)
-- ============================================================
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- VERIFICATION QUERIES (run to confirm all is applied)
-- ============================================================
-- select conname, consrc from pg_constraint where conname = 'bookings_status_check';
-- select policyname from pg_policies where tablename = 'bookings';
-- select policyname from pg_policies where tablename = 'instant_gigs';
-- select policyname from pg_policies where tablename = 'lead_providers';
