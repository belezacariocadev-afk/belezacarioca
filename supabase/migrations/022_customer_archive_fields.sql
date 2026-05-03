alter table public.customers
  add column if not exists archived_at timestamptz,
  add column if not exists deleted_at timestamptz;

create index if not exists customers_salon_archived_idx
  on public.customers (salon_id, archived_at, deleted_at);
