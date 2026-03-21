-- Fix handle_new_user trigger to properly bypass RLS.
-- In Supabase, SECURITY DEFINER triggers need to be owned by postgres
-- and the profiles table needs a policy that allows insertion when
-- auth.uid() is null (trigger context has no JWT).

-- Recreate trigger function explicitly owned by postgres with proper settings
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

-- Grant ownership to postgres so BYPASSRLS applies
alter function handle_new_user() owner to postgres;

-- The trigger for auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Add INSERT policy that permits the trigger (auth.uid() is null in trigger context)
-- and also permits users inserting their own profile (for edge cases)
drop policy if exists "Allow profile creation" on profiles;
create policy "Allow profile creation" on profiles
  for insert with check (
    auth.uid() is null  -- called from trigger (no JWT context)
    or auth.uid() = id  -- called from authenticated API
  );
