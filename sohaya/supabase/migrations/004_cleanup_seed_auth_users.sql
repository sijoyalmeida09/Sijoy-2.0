-- Clean up directly-inserted seed auth.users rows that bypass GoTrue's format.
-- These rows (11111111-...) break new user creation because GoTrue's
-- internal constraints reject the old SQL-inserted format.
-- Profiles and providers for these seeds are also cleaned up.

-- Step 1: delete provider records linked to seed profiles
delete from providers where profile_id in (
  select id from profiles where id::text like '11111111-1111-1111-1111-11111111%'
);

-- Step 2: delete seed profiles
delete from profiles where id::text like '11111111-1111-1111-1111-11111111%';

-- Step 3: delete seed auth.users rows
delete from auth.users where id::text like '11111111-1111-1111-1111-11111111%';
