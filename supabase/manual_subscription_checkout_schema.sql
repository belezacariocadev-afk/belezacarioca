-- Execute este SQL no Supabase SQL Editor do projeto conectado ao .env.local.
-- Ele completa as tabelas/colunas usadas pelo checkout de assinatura.
-- Nao desativa RLS e pode ser rodado mais de uma vez.

create table if not exists public.subscriptions (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  plan text not null default 'growth',
  status text not null default 'trialing',
  billing_cycle text not null default 'monthly',
  current_period_end timestamptz,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  asaas_customer_id text,
  asaas_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions
  add column if not exists plan text default 'growth',
  add column if not exists status text default 'trialing',
  add column if not exists billing_cycle text default 'monthly',
  add column if not exists current_period_end timestamptz,
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists asaas_customer_id text,
  add column if not exists asaas_subscription_id text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.subscriptions
set
  plan = coalesce(plan, 'growth'),
  status = coalesce(status, 'trialing'),
  billing_cycle = coalesce(billing_cycle, 'monthly'),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

alter table public.subscriptions
  alter column plan set not null,
  alter column status set not null,
  alter column billing_cycle set not null,
  alter column created_at set not null,
  alter column updated_at set not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_plan_check'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions drop constraint subscriptions_plan_check;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_status_check'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions drop constraint subscriptions_status_check;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_billing_cycle_check'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions drop constraint subscriptions_billing_cycle_check;
  end if;
end $$;

alter table public.subscriptions
  add constraint subscriptions_plan_check check (plan in ('starter', 'growth', 'premium')),
  add constraint subscriptions_status_check check (status in ('trialing', 'active', 'pastDue', 'cancelled')),
  add constraint subscriptions_billing_cycle_check check (billing_cycle in ('monthly', 'quarterly', 'annual'));

alter table if exists public.charges
  add column if not exists subscription_id text references public.subscriptions(id) on delete set null,
  add column if not exists amount_cents integer default 0,
  add column if not exists status text default 'draft',
  add column if not exists origin text default 'manual',
  add column if not exists provider text default 'manual',
  add column if not exists payment_method text,
  add column if not exists provider_charge_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists due_date timestamptz,
  add column if not exists client_name text,
  add column if not exists service_name text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create index if not exists subscriptions_salon_updated_idx
  on public.subscriptions (salon_id, updated_at desc);

create index if not exists subscriptions_asaas_subscription_idx
  on public.subscriptions (asaas_subscription_id);

create index if not exists charges_provider_charge_id_idx
  on public.charges (provider_charge_id);

create index if not exists charges_salon_created_at_idx
  on public.charges (salon_id, created_at desc);

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
before update on public.subscriptions
for each row execute function public.touch_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_by_membership" on public.subscriptions;
create policy "subscriptions_select_by_membership"
on public.subscriptions for select
to authenticated
using (public.can_access_salon(salon_id));

drop policy if exists "subscriptions_write_by_admin" on public.subscriptions;
create policy "subscriptions_write_by_admin"
on public.subscriptions for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));
