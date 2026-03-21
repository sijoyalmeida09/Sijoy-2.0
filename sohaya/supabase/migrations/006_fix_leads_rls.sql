-- Fix missing RLS policies:
-- 1. Providers could not SELECT leads they've been assigned (blocking quote creation)
-- 2. Leads had no UPDATE policy (status updates from 'open' → 'matched'/'quoted' silently failed)

-- Allow providers to see leads assigned to them via lead_providers
create policy "Providers see assigned leads" on leads
  for select using (
    id in (
      select lead_id from lead_providers
      where provider_id in (
        select id from providers where profile_id = auth.uid()
      )
    )
  );

-- Allow anyone (client or provider in the flow) to update lead status
-- The leads route updates status when matching and quoting — needs UPDATE policy
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
