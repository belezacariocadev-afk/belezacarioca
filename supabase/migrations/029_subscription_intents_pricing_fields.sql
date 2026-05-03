alter table if exists public.subscription_intents
  add column if not exists amount_cents integer,
  add column if not exists professional_range text,
  add column if not exists plan_label text;

create index if not exists subscription_intents_pricing_idx
  on public.subscription_intents (selected_plan, professional_range, created_at desc);
