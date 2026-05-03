do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_billing_cycle_check'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions
    drop constraint subscriptions_billing_cycle_check;
  end if;
end $$;

alter table public.subscriptions
add constraint subscriptions_billing_cycle_check
check (billing_cycle in ('monthly', 'quarterly', 'annual'));
