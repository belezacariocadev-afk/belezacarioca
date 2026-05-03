do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'salons_plan_code_check'
      and conrelid = 'public.salons'::regclass
  ) then
    alter table public.salons
    drop constraint salons_plan_code_check;
  end if;

  alter table public.salons
  add constraint salons_plan_code_check
  check (
    plan_code is null
    or plan_code in ('basic', 'growth', 'premium', 'monthly', 'quarterly', 'annual')
  );
end;
$$;
