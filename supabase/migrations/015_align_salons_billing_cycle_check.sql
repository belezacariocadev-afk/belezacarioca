do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'salons_billing_cycle_check'
      and conrelid = 'public.salons'::regclass
  ) then
    alter table public.salons
    drop constraint salons_billing_cycle_check;
  end if;

  alter table public.salons
  add constraint salons_billing_cycle_check
  check (
    billing_cycle is null
    or billing_cycle in ('monthly', 'quarterly', 'annual', 'mensal', 'trimestral', 'anual')
  );
end;
$$;
