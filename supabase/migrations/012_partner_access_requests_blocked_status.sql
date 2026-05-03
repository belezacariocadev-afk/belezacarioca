do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'partner_access_requests_status_check'
  ) then
    alter table public.partner_access_requests
    drop constraint partner_access_requests_status_check;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'partner_access_requests_status_check'
  ) then
    alter table public.partner_access_requests
    add constraint partner_access_requests_status_check
    check (status in ('pending', 'approved', 'rejected', 'blocked'));
  end if;
end;
$$;

