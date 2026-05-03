create table if not exists public.professional_schedule_exceptions (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  professional_id text not null references public.professionals(id) on delete cascade,
  date date not null,
  type text not null check (type in ('dayOff', 'manualBlock', 'specialHours')),
  start_time text,
  end_time text,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_schedule_exceptions_time_range check (
    type = 'dayOff'
    or (start_time is not null and end_time is not null and start_time < end_time)
  )
);

create index if not exists professional_schedule_exceptions_salon_professional_date_idx
on public.professional_schedule_exceptions(salon_id, professional_id, date);

drop trigger if exists professional_schedule_exceptions_touch_updated_at on public.professional_schedule_exceptions;
create trigger professional_schedule_exceptions_touch_updated_at
before update on public.professional_schedule_exceptions
for each row execute function public.touch_updated_at();

alter table public.professional_schedule_exceptions enable row level security;

drop policy if exists "schedule_exceptions_select_by_membership" on public.professional_schedule_exceptions;
create policy "schedule_exceptions_select_by_membership"
on public.professional_schedule_exceptions for select
to authenticated
using (public.can_access_salon(salon_id));

drop policy if exists "schedule_exceptions_write_by_admin" on public.professional_schedule_exceptions;
create policy "schedule_exceptions_write_by_admin"
on public.professional_schedule_exceptions for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));
