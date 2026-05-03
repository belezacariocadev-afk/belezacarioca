do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'salons_booking_mode_check'
      and conrelid = 'public.salons'::regclass
  ) then
    alter table public.salons
    drop constraint salons_booking_mode_check;
  end if;

  alter table public.salons
  add constraint salons_booking_mode_check
  check (
    booking_mode is null
    or booking_mode in ('online', 'manual', 'request', 'automatic')
  );
end;
$$;
