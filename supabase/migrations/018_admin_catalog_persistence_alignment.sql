create table if not exists public.professionals (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  profile_id text,
  access_profile_id text default 'professional',
  name text,
  email text,
  role text,
  active boolean default true,
  permissions text[] default array['ver_agenda_propria'],
  schedule jsonb default jsonb_build_object(
    'active', true,
    'weekdays', jsonb_build_array(1, 2, 3, 4, 5),
    'startTime', '09:00',
    'endTime', '18:00',
    'breakStartTime', '12:00',
    'breakEndTime', '13:00'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.professionals
  add column if not exists profile_id text,
  add column if not exists access_profile_id text default 'professional',
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists role text,
  add column if not exists active boolean default true,
  add column if not exists permissions text[] default array['ver_agenda_propria'],
  add column if not exists schedule jsonb default jsonb_build_object(
    'active', true,
    'weekdays', jsonb_build_array(1, 2, 3, 4, 5),
    'startTime', '09:00',
    'endTime', '18:00',
    'breakStartTime', '12:00',
    'breakEndTime', '13:00'
  ),
  add column if not exists updated_at timestamptz not null default now();

update public.professionals
set
  profile_id = coalesce(profile_id, 'profile-' || id::text),
  access_profile_id = coalesce(access_profile_id, 'professional'),
  name = coalesce(name, 'Profissional'),
  email = coalesce(email, id::text || '@belezacarioca.local'),
  role = coalesce(role, 'Profissional'),
  active = coalesce(active, true),
  permissions = coalesce(permissions, array['ver_agenda_propria']),
  schedule = coalesce(
    schedule,
    jsonb_build_object(
      'active', true,
      'weekdays', jsonb_build_array(1, 2, 3, 4, 5),
      'startTime', '09:00',
      'endTime', '18:00',
      'breakStartTime', '12:00',
      'breakEndTime', '13:00'
    )
  );

alter table public.professionals
  alter column profile_id set not null,
  alter column access_profile_id set not null,
  alter column name set not null,
  alter column email set not null,
  alter column role set not null,
  alter column active set not null,
  alter column permissions set not null,
  alter column schedule set not null;

create table if not exists public.services (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  name text not null,
  category text not null default 'Geral',
  duration_minutes integer not null default 45 check (duration_minutes > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  active boolean not null default true,
  professional_ids text[] not null default array[]::text[],
  notes text,
  description text,
  price numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services
  add column if not exists category text default 'Geral',
  add column if not exists duration_minutes integer default 45,
  add column if not exists price_cents integer default 0,
  add column if not exists active boolean default true,
  add column if not exists professional_ids text[] default array[]::text[],
  add column if not exists notes text,
  add column if not exists description text,
  add column if not exists price numeric,
  add column if not exists updated_at timestamptz not null default now();

update public.services
set
  category = coalesce(category, 'Geral'),
  duration_minutes = coalesce(duration_minutes, 45),
  price_cents = coalesce(price_cents, round(coalesce(price, 0) * 100)::integer, 0),
  active = coalesce(active, true),
  professional_ids = coalesce(professional_ids, array[]::text[]),
  notes = coalesce(notes, description);

alter table public.services
  alter column category set not null,
  alter column duration_minutes set not null,
  alter column price_cents set not null,
  alter column active set not null,
  alter column professional_ids set not null;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  salon_id text not null references public.salons(id) on delete cascade,
  full_name text not null,
  phone text,
  specialty text,
  active boolean not null default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  role text not null default 'professional',
  commission_rate numeric not null default 0
);

alter table public.employees
  add column if not exists updated_at timestamp default now();

create table if not exists public.working_hours (
  id uuid primary key default gen_random_uuid(),
  salon_id text not null references public.salons(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true
);

create index if not exists professionals_salon_active_idx
  on public.professionals (salon_id, active);

create index if not exists services_salon_active_idx
  on public.services (salon_id, active);

create index if not exists employees_salon_active_idx
  on public.employees (salon_id, active);

create index if not exists working_hours_employee_day_idx
  on public.working_hours (salon_id, employee_id, weekday, active);

alter table public.professionals enable row level security;
alter table public.services enable row level security;
alter table public.employees enable row level security;
alter table public.working_hours enable row level security;

drop policy if exists "employees_select_by_membership" on public.employees;
create policy "employees_select_by_membership"
on public.employees for select
to authenticated
using (public.can_access_salon(salon_id));

drop policy if exists "employees_write_by_admin" on public.employees;
create policy "employees_write_by_admin"
on public.employees for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));

drop policy if exists "working_hours_select_by_membership" on public.working_hours;
create policy "working_hours_select_by_membership"
on public.working_hours for select
to authenticated
using (public.can_access_salon(salon_id));

drop policy if exists "working_hours_write_by_admin" on public.working_hours;
create policy "working_hours_write_by_admin"
on public.working_hours for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));
