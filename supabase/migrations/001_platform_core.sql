create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.salons (
  id text primary key,
  name text not null,
  slug text not null unique,
  owner_profile_id text not null,
  subscription_id text,
  status text not null default 'active' check (status in ('draft', 'active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  plan text not null default 'starter' check (plan in ('starter', 'growth', 'premium')),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'pastDue', 'cancelled')),
  current_period_end timestamptz,
  asaas_customer_id text,
  asaas_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professionals (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  profile_id text not null,
  access_profile_id text not null default 'professional',
  name text not null,
  email text not null,
  role text not null,
  active boolean not null default true,
  permissions text[] not null default array['ver_agenda_propria'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  name text not null,
  category text not null default 'Geral',
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  active boolean not null default true,
  professional_ids text[] not null default array[]::text[],
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  client_id text not null references public.customers(id) on delete restrict,
  professional_id text not null references public.professionals(id) on delete restrict,
  service_id text not null references public.services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('requested', 'scheduled', 'confirmed', 'checkedIn', 'inService', 'completed', 'cancelled', 'noShow')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_valid_range check (ends_at > starts_at)
);

create table if not exists public.attendance_records (
  id text primary key,
  appointment_id text not null references public.appointments(id) on delete cascade,
  salon_id text not null references public.salons(id) on delete cascade,
  professional_id text not null references public.professionals(id) on delete restrict,
  status text not null default 'notStarted' check (status in ('notStarted', 'inProgress', 'finished', 'reopened')),
  started_at timestamptz,
  finished_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_closures (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  appointment_id text not null references public.appointments(id) on delete cascade,
  client_id text not null references public.customers(id) on delete restrict,
  professional_id text not null references public.professionals(id) on delete restrict,
  service_id text not null references public.services(id) on delete restrict,
  base_amount_cents integer not null default 0 check (base_amount_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  addition_cents integer not null default 0 check (addition_cents >= 0),
  final_amount_cents integer not null default 0 check (final_amount_cents >= 0),
  status text not null default 'open' check (status in ('open', 'review', 'closed', 'paid', 'cancelled')),
  notes text,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.charges (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  appointment_id text references public.appointments(id) on delete set null,
  account_closure_id text references public.account_closures(id) on delete set null,
  client_id text references public.customers(id) on delete set null,
  subscription_id text references public.subscriptions(id) on delete set null,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  status text not null default 'draft' check (status in ('draft', 'pending', 'paid', 'overdue', 'refunded', 'cancelled')),
  origin text not null default 'appointment' check (origin in ('appointment', 'subscription', 'manual')),
  provider text not null default 'manual' check (provider in ('asaas', 'manual')),
  payment_method text check (payment_method in ('cash', 'pix', 'card', 'manualPending')),
  provider_charge_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  appointment_id text not null references public.appointments(id) on delete cascade,
  account_closure_id text not null references public.account_closures(id) on delete cascade,
  charge_id text references public.charges(id) on delete set null,
  client_id text not null references public.customers(id) on delete restrict,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  method text not null check (method in ('cash', 'pix', 'card', 'manualPending')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.salon_users (
  id uuid primary key default gen_random_uuid(),
  salon_id text not null references public.salons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile text not null check (profile in ('salonAdmin', 'reception', 'professional', 'client', 'platformAdmin')),
  professional_id text references public.professionals(id) on delete set null,
  customer_id text references public.customers(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (salon_id, user_id, profile)
);

create index if not exists customers_salon_id_idx on public.customers(salon_id);
create index if not exists professionals_salon_id_idx on public.professionals(salon_id);
create index if not exists services_salon_id_idx on public.services(salon_id);
create index if not exists appointments_salon_professional_time_idx on public.appointments(salon_id, professional_id, starts_at, ends_at);
create index if not exists appointments_salon_customer_idx on public.appointments(salon_id, client_id);
create index if not exists charges_salon_status_idx on public.charges(salon_id, status);
create index if not exists payments_salon_status_idx on public.payments(salon_id, status);
create index if not exists salon_users_user_idx on public.salon_users(user_id, salon_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'salons',
    'subscriptions',
    'customers',
    'professionals',
    'services',
    'appointments',
    'attendance_records',
    'account_closures',
    'charges',
    'payments',
    'salon_users'
  ]
  loop
    execute format('drop trigger if exists %I_touch_updated_at on public.%I', table_name, table_name);
    execute format('create trigger %I_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()', table_name, table_name);
  end loop;
end;
$$;

create or replace function public.current_salon_profile(target_salon_id text)
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select su.profile
  from public.salon_users su
  where su.salon_id = target_salon_id
    and su.user_id = auth.uid()
    and su.active = true
  order by case su.profile
    when 'platformAdmin' then 1
    when 'salonAdmin' then 2
    when 'reception' then 3
    when 'professional' then 4
    when 'client' then 5
    else 99
  end
  limit 1
$$;

create or replace function public.can_access_salon(target_salon_id text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.current_salon_profile(target_salon_id) is not null
$$;

create or replace function public.is_salon_admin(target_salon_id text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.current_salon_profile(target_salon_id) in ('platformAdmin', 'salonAdmin')
$$;

create or replace function public.can_manage_module(target_salon_id text, module_name text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select case
    when public.current_salon_profile(target_salon_id) in ('platformAdmin', 'salonAdmin') then true
    when public.current_salon_profile(target_salon_id) = 'reception'
      then module_name in ('agenda', 'clientes', 'servicos')
    else false
  end
$$;

create or replace function public.is_professional_actor(target_salon_id text, target_professional_id text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.salon_users su
    where su.salon_id = target_salon_id
      and su.user_id = auth.uid()
      and su.active = true
      and su.profile = 'professional'
      and su.professional_id = target_professional_id
  )
$$;

create or replace function public.is_customer_actor(target_salon_id text, target_customer_id text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.salon_users su
    where su.salon_id = target_salon_id
      and su.user_id = auth.uid()
      and su.active = true
      and su.profile = 'client'
      and su.customer_id = target_customer_id
  )
  or exists (
    select 1
    from public.customers c
    where c.id = target_customer_id
      and c.salon_id = target_salon_id
      and c.user_id = auth.uid()
  )
$$;

alter table public.salons enable row level security;
alter table public.subscriptions enable row level security;
alter table public.customers enable row level security;
alter table public.professionals enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.attendance_records enable row level security;
alter table public.account_closures enable row level security;
alter table public.charges enable row level security;
alter table public.payments enable row level security;
alter table public.salon_users enable row level security;

drop policy if exists "salons_select_by_membership" on public.salons;
create policy "salons_select_by_membership"
on public.salons for select
to authenticated
using (public.can_access_salon(id));

drop policy if exists "salons_update_by_admin" on public.salons;
create policy "salons_update_by_admin"
on public.salons for update
to authenticated
using (public.is_salon_admin(id))
with check (public.is_salon_admin(id));

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

drop policy if exists "salon_users_select_by_self_or_admin" on public.salon_users;
create policy "salon_users_select_by_self_or_admin"
on public.salon_users for select
to authenticated
using (user_id = auth.uid() or public.is_salon_admin(salon_id));

drop policy if exists "salon_users_write_by_admin" on public.salon_users;
create policy "salon_users_write_by_admin"
on public.salon_users for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));

drop policy if exists "customers_select_by_role" on public.customers;
create policy "customers_select_by_role"
on public.customers for select
to authenticated
using (
  public.can_manage_module(salon_id, 'clientes')
  or public.is_customer_actor(salon_id, id)
);

drop policy if exists "customers_write_by_staff" on public.customers;
create policy "customers_write_by_staff"
on public.customers for all
to authenticated
using (public.can_manage_module(salon_id, 'clientes'))
with check (public.can_manage_module(salon_id, 'clientes'));

drop policy if exists "professionals_select_by_membership" on public.professionals;
create policy "professionals_select_by_membership"
on public.professionals for select
to authenticated
using (public.can_access_salon(salon_id));

drop policy if exists "professionals_write_by_admin" on public.professionals;
create policy "professionals_write_by_admin"
on public.professionals for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));

drop policy if exists "services_select_by_membership" on public.services;
create policy "services_select_by_membership"
on public.services for select
to authenticated
using (public.can_access_salon(salon_id));

drop policy if exists "services_write_by_staff" on public.services;
create policy "services_write_by_staff"
on public.services for all
to authenticated
using (public.can_manage_module(salon_id, 'servicos'))
with check (public.can_manage_module(salon_id, 'servicos'));

drop policy if exists "appointments_select_by_role" on public.appointments;
create policy "appointments_select_by_role"
on public.appointments for select
to authenticated
using (
  public.can_manage_module(salon_id, 'agenda')
  or public.is_professional_actor(salon_id, professional_id)
  or public.is_customer_actor(salon_id, client_id)
);

drop policy if exists "appointments_insert_by_role" on public.appointments;
create policy "appointments_insert_by_role"
on public.appointments for insert
to authenticated
with check (
  public.can_manage_module(salon_id, 'agenda')
  or public.is_customer_actor(salon_id, client_id)
);

drop policy if exists "appointments_update_by_role" on public.appointments;
create policy "appointments_update_by_role"
on public.appointments for update
to authenticated
using (
  public.can_manage_module(salon_id, 'agenda')
  or public.is_professional_actor(salon_id, professional_id)
  or public.is_customer_actor(salon_id, client_id)
)
with check (
  public.can_manage_module(salon_id, 'agenda')
  or public.is_professional_actor(salon_id, professional_id)
  or public.is_customer_actor(salon_id, client_id)
);

drop policy if exists "appointments_delete_by_admin" on public.appointments;
create policy "appointments_delete_by_admin"
on public.appointments for delete
to authenticated
using (public.is_salon_admin(salon_id));

drop policy if exists "attendance_select_by_role" on public.attendance_records;
create policy "attendance_select_by_role"
on public.attendance_records for select
to authenticated
using (
  public.can_manage_module(salon_id, 'agenda')
  or public.is_professional_actor(salon_id, professional_id)
);

drop policy if exists "attendance_write_by_role" on public.attendance_records;
create policy "attendance_write_by_role"
on public.attendance_records for all
to authenticated
using (
  public.can_manage_module(salon_id, 'agenda')
  or public.is_professional_actor(salon_id, professional_id)
)
with check (
  public.can_manage_module(salon_id, 'agenda')
  or public.is_professional_actor(salon_id, professional_id)
);

drop policy if exists "account_closures_select_by_role" on public.account_closures;
create policy "account_closures_select_by_role"
on public.account_closures for select
to authenticated
using (
  public.is_salon_admin(salon_id)
  or public.is_professional_actor(salon_id, professional_id)
  or public.is_customer_actor(salon_id, client_id)
);

drop policy if exists "account_closures_write_by_admin" on public.account_closures;
create policy "account_closures_write_by_admin"
on public.account_closures for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));

drop policy if exists "charges_select_by_role" on public.charges;
create policy "charges_select_by_role"
on public.charges for select
to authenticated
using (
  public.is_salon_admin(salon_id)
  or (client_id is not null and public.is_customer_actor(salon_id, client_id))
);

drop policy if exists "charges_write_by_admin" on public.charges;
create policy "charges_write_by_admin"
on public.charges for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));

drop policy if exists "payments_select_by_role" on public.payments;
create policy "payments_select_by_role"
on public.payments for select
to authenticated
using (
  public.is_salon_admin(salon_id)
  or public.is_customer_actor(salon_id, client_id)
);

drop policy if exists "payments_write_by_admin" on public.payments;
create policy "payments_write_by_admin"
on public.payments for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));
