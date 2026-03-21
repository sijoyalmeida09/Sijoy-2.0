-- Fix: profiles INSERT policy blocks handle_new_user trigger
-- The trigger runs with auth.uid() = NULL (no session context),
-- so the WITH CHECK (auth.uid() = id) policy denies the INSERT.
-- Profile creation is handled exclusively by the trigger — drop the policy.

drop policy if exists "Users can insert own profile" on profiles;

-- The trigger (handle_new_user) is SECURITY DEFINER as postgres,
-- which should bypass RLS, but auth.uid() still resolves to NULL in trigger context.
-- Profiles are auto-created on signup; upserts in artist registration use UPDATE path.
