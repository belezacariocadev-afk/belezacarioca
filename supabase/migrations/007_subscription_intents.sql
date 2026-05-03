create table if not exists public.subscription_intents (
  id text primary key,
  salon_id text not null references public.salons(id) on delete cascade,
  actor_id text not null,
  profile_id text not null,
  email text not null,
  selected_plan text not null check (selected_plan in ('monthly', 'annual')),
  reason text,
  source text not null default 'subscriptionPage' check (source in ('subscriptionPage')),
  status text not null default 'pendingContact' check (status in ('pendingContact', 'sentToCheckout', 'converted', 'cancelled')),
  commercial_access jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscription_intents_salon_created_idx
on public.subscription_intents(salon_id, created_at desc);

drop trigger if exists subscription_intents_touch_updated_at on public.subscription_intents;
create trigger subscription_intents_touch_updated_at
before update on public.subscription_intents
for each row execute function public.touch_updated_at();

alter table public.subscription_intents enable row level security;

drop policy if exists "subscription_intents_select_by_admin" on public.subscription_intents;
create policy "subscription_intents_select_by_admin"
on public.subscription_intents for select
to authenticated
using (public.is_salon_admin(salon_id));

drop policy if exists "subscription_intents_insert_by_establishment" on public.subscription_intents;
create policy "subscription_intents_insert_by_establishment"
on public.subscription_intents for insert
to authenticated
with check (
  public.current_salon_profile(salon_id) in ('platformAdmin', 'salonAdmin', 'reception', 'professional')
);

drop policy if exists "subscription_intents_update_by_admin" on public.subscription_intents;
create policy "subscription_intents_update_by_admin"
on public.subscription_intents for update
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));
