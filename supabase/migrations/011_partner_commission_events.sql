create table if not exists public.partner_commission_events (
  id uuid primary key default gen_random_uuid(),
  commission_id uuid not null references public.partner_commissions(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'generated',
      'manual_review_required',
      'approved',
      'paid',
      'canceled',
      'financial_alert',
      'manual_paid'
    )
  ),
  previous_status text check (previous_status in ('pending', 'approved', 'paid', 'canceled')),
  next_status text check (next_status in ('pending', 'approved', 'paid', 'canceled')),
  source_event_id text,
  notes text,
  actor_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  unique (commission_id, event_type, source_event_id)
);

create index if not exists partner_commission_events_commission_created_idx
on public.partner_commission_events(commission_id, created_at desc);

create index if not exists charges_provider_charge_id_idx
on public.charges(provider_charge_id);

create or replace function public.is_partner_commission_owner(target_commission_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.partner_commissions pc
    where pc.id = target_commission_id
      and public.is_partner_owner(pc.partner_id)
  )
$$;

alter table public.partner_commission_events enable row level security;

drop policy if exists "partner_commission_events_select_self" on public.partner_commission_events;
create policy "partner_commission_events_select_self"
on public.partner_commission_events for select
to authenticated
using (public.is_partner_commission_owner(commission_id));
