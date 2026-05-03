alter table public.appointments
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists no_show_at timestamptz,
  add column if not exists started_at timestamptz,
  add column if not exists finished_at timestamptz,
  add column if not exists internal_notes text,
  add column if not exists client_visible_message text,
  add column if not exists cancellation_reason text,
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
      'inService',
      'completed',
      'rejected',
      'cancelled',
      'no_show',
      'noShow'
    ));
end;
$$;

create index if not exists appointments_salon_status_date_idx
  on public.appointments (salon_id, status, appointment_date, appointment_time);
