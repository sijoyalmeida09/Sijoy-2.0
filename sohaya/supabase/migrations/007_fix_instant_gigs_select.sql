-- Fix: instant_gigs has no SELECT policy.
-- insert().select() returns null without SELECT, causing route to throw.
-- Clients see their own gigs; providers see broadcast gigs.

create policy "Clients see own instant gigs" on instant_gigs
  for select using (
    client_id in (select id from clients where profile_id = auth.uid())
  );

create policy "Providers see broadcast gigs" on instant_gigs
  for select using (
    status = 'broadcast'
    or accepted_by_id in (select id from providers where profile_id = auth.uid())
  );
