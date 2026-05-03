alter table public.salons
  add column if not exists is_public boolean not null default false,
  add column if not exists featured boolean not null default false,
  add column if not exists slug text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists neighborhood text,
  add column if not exists category text,
  add column if not exists logo_url text,
  add column if not exists subscription_status text,
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists current_period_end timestamptz;

create unique index if not exists salons_slug_unique_idx
  on public.salons (slug)
  where slug is not null;

create index if not exists salons_public_featured_idx
  on public.salons (is_public, featured, name);

drop policy if exists "salons_public_showcase_select" on public.salons;
create policy "salons_public_showcase_select"
on public.salons for select
using (is_public = true);
