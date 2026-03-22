-- Tier 1: Launch-blocking features
-- 1. verification_status on artist_profiles
-- 2. escrow_status on event_bookings
-- 3. deposit_amount on event_bookings
-- 4. razorpay_order_id, razorpay_payment_id on event_bookings
-- 5. booking state machine helper function

-- ───────────────────────────────────────────────
-- 1. Artist verification status
-- ───────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type public.verification_status as enum ('pending', 'verified', 'rejected');
  end if;
end$$;

alter table public.artist_profiles
  add column if not exists verification_status public.verification_status not null default 'pending';

alter table public.artist_profiles
  add column if not exists rejection_reason text;

create index if not exists idx_artist_profiles_verification
  on public.artist_profiles (verification_status)
  where verification_status = 'verified';

-- ───────────────────────────────────────────────
-- 2. Escrow fields on event_bookings
-- ───────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_type where typname = 'escrow_status') then
    create type public.escrow_status as enum (
      'awaiting_deposit', 'deposit_held', 'full_payment_held',
      'released', 'refunded', 'disputed'
    );
  end if;
end$$;

alter table public.event_bookings
  add column if not exists escrow_status public.escrow_status not null default 'awaiting_deposit';

alter table public.event_bookings
  add column if not exists deposit_amount numeric(12,2) not null default 0;

alter table public.event_bookings
  add column if not exists razorpay_order_id text;

alter table public.event_bookings
  add column if not exists razorpay_payment_id text;

-- ───────────────────────────────────────────────
-- 3. Booking state machine (valid transitions)
-- ───────────────────────────────────────────────

create or replace function public.validate_booking_transition()
returns trigger
language plpgsql
as $$
declare
  allowed text[];
begin
  if old.status = new.status then
    return new;
  end if;

  case old.status::text
    when 'requested' then allowed := array['accepted', 'cancelled'];
    when 'accepted'  then allowed := array['confirmed', 'cancelled'];
    when 'confirmed' then allowed := array['completed', 'cancelled', 'disputed'];
    when 'completed' then allowed := array['disputed'];
    when 'cancelled' then allowed := array[]::text[];
    when 'disputed'  then allowed := array['completed', 'cancelled'];
    else allowed := array[]::text[];
  end case;

  if not (new.status::text = any(allowed)) then
    raise exception 'Invalid booking transition: % -> %', old.status, new.status;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_booking_transition on public.event_bookings;
create trigger trg_validate_booking_transition
before update on public.event_bookings
for each row execute function public.validate_booking_transition();

-- ───────────────────────────────────────────────
-- 4. Protect financial fields from client updates
-- ───────────────────────────────────────────────

create or replace function public.protect_financial_fields()
returns trigger
language plpgsql
as $$
begin
  if current_setting('role') != 'service_role' then
    new.agreed_amount       := old.agreed_amount;
    new.platform_fee_pct    := old.platform_fee_pct;
    new.artist_payout       := old.artist_payout;
    new.platform_revenue    := old.platform_revenue;
    new.deposit_amount      := old.deposit_amount;
    new.escrow_status       := old.escrow_status;
    new.razorpay_order_id   := old.razorpay_order_id;
    new.razorpay_payment_id := old.razorpay_payment_id;
    new.payout_status       := old.payout_status;
    new.payout_settled_at   := old.payout_settled_at;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_financial_fields on public.event_bookings;
create trigger trg_protect_financial_fields
before update on public.event_bookings
for each row execute function public.protect_financial_fields();
