alter table public.appointments
  add column if not exists salon_response_message text,
  add column if not exists rejected_reason text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists rejected_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  alter table public.appointments
    drop constraint if exists appointments_status_check;

  alter table public.appointments
    add constraint appointments_status_check
    check (status in (
      'pending',
      'requested',
      'scheduled',
      'confirmed',
      'rejected',
      'checkedIn',
      'inService',
      'cancelled',
      'completed',
      'no_show',
      'noShow'
    ));
end;
$$;

create index if not exists appointments_customer_status_idx
  on public.appointments (customer_id, status, appointment_date, appointment_time);
