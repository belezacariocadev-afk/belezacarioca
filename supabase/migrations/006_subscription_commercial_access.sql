alter table public.subscriptions
add column if not exists billing_cycle text;

alter table public.subscriptions
add column if not exists trial_started_at timestamptz;

alter table public.subscriptions
add column if not exists trial_ends_at timestamptz;

update public.subscriptions
set
  billing_cycle = coalesce(billing_cycle, 'monthly'),
  trial_started_at = case
    when status = 'trialing' then coalesce(trial_started_at, created_at)
    else trial_started_at
  end,
  trial_ends_at = case
    when status = 'trialing' then coalesce(trial_ends_at, current_period_end, created_at + interval '7 days')
    else trial_ends_at
  end;

alter table public.subscriptions
alter column billing_cycle set default 'monthly',
alter column billing_cycle set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_billing_cycle_check'
  ) then
    alter table public.subscriptions
    add constraint subscriptions_billing_cycle_check check (billing_cycle in ('monthly', 'annual'));
  end if;
end;
$$;
