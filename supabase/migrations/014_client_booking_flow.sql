create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  salon_id text not null references public.salons(id) on delete cascade,
  full_name text not null,
  phone text,
  specialty text,
  active boolean not null default true,
  created_at timestamp default now(),
  role text not null default 'professional',
  commission_rate numeric not null default 0
);

create table if not exists public.working_hours (
  id uuid primary key default gen_random_uuid(),
  salon_id text not null references public.salons(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  salon_id text not null references public.salons(id) on delete cascade,
  name text not null,
  description text,
  price numeric,
  duration_minutes integer not null default 45,
  active boolean not null default true,
  created_at timestamp default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  salon_id text references public.salons(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  notes text,
  created_at timestamp default now(),
  avatar_url text
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  salon_id text references public.salons(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  employee_id uuid references public.employees(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  appointment_date date not null,
  appointment_time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes text,
  created_at timestamp default now(),
  reminder_offsets_minutes integer[] not null default array[1440, 120]
);

create index if not exists services_salon_active_idx
  on public.services (salon_id, active);

create index if not exists employees_salon_active_idx
  on public.employees (salon_id, active);

create index if not exists working_hours_employee_day_idx
  on public.working_hours (salon_id, employee_id, weekday, active);

create index if not exists appointments_employee_day_idx
  on public.appointments (salon_id, employee_id, appointment_date, appointment_time);

create unique index if not exists appointments_employee_slot_active_idx
  on public.appointments (employee_id, appointment_date, appointment_time)
  where status in ('pending', 'confirmed');
