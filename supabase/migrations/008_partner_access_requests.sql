create table if not exists public.partner_access_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  full_name text not null,
  whatsapp text not null,
  city text not null,
  state text not null,
  company text,
  area_of_work text not null,
  referral_plan text not null,
  already_works_with_beauty boolean not null default false,
  additional_message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_access_requests_status_created_idx
on public.partner_access_requests(status, created_at desc);

drop trigger if exists partner_access_requests_touch_updated_at on public.partner_access_requests;
create trigger partner_access_requests_touch_updated_at
before update on public.partner_access_requests
for each row execute function public.touch_updated_at();

alter table public.partner_access_requests enable row level security;
