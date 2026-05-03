alter table if exists public.salons
  add column if not exists subscription_status text default 'trial_active',
  add column if not exists current_period_end timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists selected_plan text,
  add column if not exists professional_range text,
  add column if not exists plan_label text,
  add column if not exists subscription_started_at timestamptz,
  add column if not exists subscription_canceled_at timestamptz,
  add column if not exists commercial_access jsonb default '{}'::jsonb;

update public.salons
set subscription_status = 'trial_active'
where subscription_status is null or subscription_status = 'none';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'subscription_intents_status_check'
  ) then
    alter table public.subscription_intents
    drop constraint subscription_intents_status_check;
  end if;
end $$;

alter table public.subscription_intents
  add constraint subscription_intents_status_check
  check (status in ('pendingContact', 'sentToCheckout', 'converted', 'paid', 'confirmed', 'cancelled'));

create index if not exists salons_commercial_status_idx
  on public.salons (subscription_status, current_period_end);

create index if not exists salons_trial_ends_at_idx
  on public.salons (trial_ends_at);
