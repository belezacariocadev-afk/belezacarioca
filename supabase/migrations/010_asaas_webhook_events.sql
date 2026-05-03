create table if not exists public.asaas_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  event_name text not null,
  payment_id text,
  subscription_external_id text,
  processing_status text not null default 'processing' check (processing_status in ('processing', 'processed', 'ignored', 'error')),
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists asaas_webhook_events_received_idx
on public.asaas_webhook_events(received_at desc);

create index if not exists asaas_webhook_events_payment_idx
on public.asaas_webhook_events(payment_id, created_at desc);

create index if not exists asaas_webhook_events_subscription_idx
on public.asaas_webhook_events(subscription_external_id, created_at desc);

drop trigger if exists asaas_webhook_events_touch_updated_at on public.asaas_webhook_events;
create trigger asaas_webhook_events_touch_updated_at
before update on public.asaas_webhook_events
for each row execute function public.touch_updated_at();

alter table public.asaas_webhook_events enable row level security;
