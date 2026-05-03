create table if not exists public.subscription_intents (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  actor_id text not null,
  profile_id text not null,
  email text not null,
  selected_plan text not null,
  reason text,
  source text not null default 'subscriptionPage',
  status text not null default 'pendingContact',
  commercial_access jsonb,
  partner_referral_code text,
  partner_referral_source jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscription_intents
  add column if not exists actor_id text,
  add column if not exists commercial_access jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists email text,
  add column if not exists partner_referral_code text,
  add column if not exists partner_referral_source jsonb,
  add column if not exists profile_id text,
  add column if not exists reason text,
  add column if not exists salon_id text,
  add column if not exists selected_plan text,
  add column if not exists source text default 'subscriptionPage',
  add column if not exists status text default 'pendingContact',
  add column if not exists updated_at timestamptz default now();

update public.subscription_intents
set
  source = coalesce(source, 'subscriptionPage'),
  status = coalesce(status, 'pendingContact'),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

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

  if exists (
    select 1
    from pg_constraint
    where conname = 'subscription_intents_source_check'
  ) then
    alter table public.subscription_intents
    drop constraint subscription_intents_source_check;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'subscription_intents_status_check'
  ) then
    alter table public.subscription_intents
    drop constraint subscription_intents_status_check;
  end if;
end $$;

alter table public.subscription_intents
  add constraint subscription_intents_selected_plan_check
  check (selected_plan in ('monthly', 'quarterly', 'annual')),
  add constraint subscription_intents_source_check
  check (source in ('subscriptionPage')),
  add constraint subscription_intents_status_check
  check (status in ('pendingContact', 'sentToCheckout', 'converted', 'cancelled'));

create index if not exists subscription_intents_salon_created_idx
on public.subscription_intents(salon_id, created_at desc);

create index if not exists subscription_intents_partner_referral_code_idx
on public.subscription_intents(partner_referral_code, created_at desc);

drop trigger if exists subscription_intents_touch_updated_at on public.subscription_intents;
create trigger subscription_intents_touch_updated_at
before update on public.subscription_intents
for each row execute function public.touch_updated_at();

alter table public.subscription_intents enable row level security;

drop policy if exists "subscription_intents_select_by_admin" on public.subscription_intents;
create policy "subscription_intents_select_by_admin"
on public.subscription_intents for select
to authenticated
using (public.is_salon_admin(salon_id));

drop policy if exists "subscription_intents_insert_by_establishment" on public.subscription_intents;
create policy "subscription_intents_insert_by_establishment"
on public.subscription_intents for insert
to authenticated
with check (
  public.current_salon_profile(salon_id) in ('platformAdmin', 'salonAdmin', 'reception', 'professional')
);

drop policy if exists "subscription_intents_update_by_admin" on public.subscription_intents;
create policy "subscription_intents_update_by_admin"
on public.subscription_intents for update
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));
