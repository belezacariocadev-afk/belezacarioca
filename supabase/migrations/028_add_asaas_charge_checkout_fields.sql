alter table if exists public.charges
  add column if not exists asaas_payment_id text,
  add column if not exists asaas_subscription_id text,
  add column if not exists checkout_url text,
  add column if not exists subscription_intent_id text;

update public.charges
set asaas_payment_id = provider_charge_id
where provider = 'asaas'
  and asaas_payment_id is null
  and provider_charge_id is not null;

create index if not exists charges_asaas_payment_id_idx
  on public.charges (asaas_payment_id)
  where asaas_payment_id is not null;

create index if not exists charges_asaas_subscription_id_idx
  on public.charges (asaas_subscription_id)
  where asaas_subscription_id is not null;

create index if not exists charges_subscription_intent_id_idx
  on public.charges (subscription_intent_id)
  where subscription_intent_id is not null;
