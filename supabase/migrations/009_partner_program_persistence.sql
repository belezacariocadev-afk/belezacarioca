create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  code text not null unique,
  full_name text,
  email text not null unique check (email = lower(email)),
  phone text,
  company_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partners_user_id_idx on public.partners(user_id);
create index if not exists partners_status_created_idx on public.partners(status, created_at desc);

drop trigger if exists partners_touch_updated_at on public.partners;
create trigger partners_touch_updated_at
before update on public.partners
for each row execute function public.touch_updated_at();

create table if not exists public.partner_referrals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  referral_code text not null,
  referred_account_type text check (referred_account_type in ('customer', 'establishment')),
  landing_path text,
  raw_ref text,
  visitor_key text,
  referral_source text not null default 'queryParam' check (referral_source in ('queryParam', 'manual', 'unknown')),
  created_at timestamptz not null default now()
);

create index if not exists partner_referrals_partner_created_idx
on public.partner_referrals(partner_id, created_at desc);

create index if not exists partner_referrals_referral_code_idx
on public.partner_referrals(referral_code, created_at desc);

create index if not exists partner_referrals_visitor_key_idx
on public.partner_referrals(visitor_key);

create table if not exists public.partner_conversions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  salon_id text not null references public.salons(id) on delete cascade,
  referral_id uuid references public.partner_referrals(id) on delete set null,
  conversion_status text not null default 'registered' check (conversion_status in ('clicked', 'registered', 'qualified', 'subscribed', 'paid', 'canceled')),
  subscription_status text check (subscription_status in ('none', 'trialing', 'active', 'pastDue', 'cancelled')),
  payment_status text check (payment_status in ('pending', 'confirmed', 'failed', 'canceled', 'refunded')),
  first_paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, salon_id)
);

create index if not exists partner_conversions_partner_status_idx
on public.partner_conversions(partner_id, conversion_status, created_at desc);

create index if not exists partner_conversions_salon_idx
on public.partner_conversions(salon_id);

drop trigger if exists partner_conversions_touch_updated_at on public.partner_conversions;
create trigger partner_conversions_touch_updated_at
before update on public.partner_conversions
for each row execute function public.touch_updated_at();

create table if not exists public.partner_commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  salon_id text not null references public.salons(id) on delete cascade,
  conversion_id uuid unique references public.partner_conversions(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'canceled')),
  amount numeric(10,2) check (amount is null or amount >= 0),
  currency text not null default 'BRL',
  rule_snapshot jsonb,
  generated_at timestamptz,
  paid_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_commissions_partner_status_idx
on public.partner_commissions(partner_id, status, created_at desc);

create index if not exists partner_commissions_salon_idx
on public.partner_commissions(salon_id);

drop trigger if exists partner_commissions_touch_updated_at on public.partner_commissions;
create trigger partner_commissions_touch_updated_at
before update on public.partner_commissions
for each row execute function public.touch_updated_at();

alter table public.subscription_intents
add column if not exists partner_referral_code text;

alter table public.subscription_intents
add column if not exists partner_referral_source jsonb;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'subscription_intents_selected_plan_check'
  ) then
    alter table public.subscription_intents
    drop constraint subscription_intents_selected_plan_check;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscription_intents_selected_plan_check'
  ) then
    alter table public.subscription_intents
    add constraint subscription_intents_selected_plan_check
    check (selected_plan in ('monthly', 'quarterly', 'annual'));
  end if;
end;
$$;

create index if not exists subscription_intents_partner_referral_code_idx
on public.subscription_intents(partner_referral_code, created_at desc);

create or replace function public.current_partner_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select p.id
  from public.partners p
  where p.user_id = auth.uid()
  order by p.created_at desc
  limit 1
$$;

create or replace function public.is_partner_owner(target_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.current_partner_id() = target_partner_id
$$;

alter table public.partners enable row level security;
alter table public.partner_referrals enable row level security;
alter table public.partner_conversions enable row level security;
alter table public.partner_commissions enable row level security;

drop policy if exists "partners_select_self" on public.partners;
create policy "partners_select_self"
on public.partners for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "partner_referrals_select_self" on public.partner_referrals;
create policy "partner_referrals_select_self"
on public.partner_referrals for select
to authenticated
using (public.is_partner_owner(partner_id));

drop policy if exists "partner_conversions_select_self" on public.partner_conversions;
create policy "partner_conversions_select_self"
on public.partner_conversions for select
to authenticated
using (public.is_partner_owner(partner_id));

drop policy if exists "partner_commissions_select_self" on public.partner_commissions;
create policy "partner_commissions_select_self"
on public.partner_commissions for select
to authenticated
using (public.is_partner_owner(partner_id));
