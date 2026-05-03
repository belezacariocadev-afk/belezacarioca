alter table if exists public.charges
  add column if not exists amount_cents integer,
  add column if not exists client_name text,
  add column if not exists service_name text,
  add column if not exists due_date timestamptz,
  add column if not exists origin text,
  add column if not exists provider text,
  add column if not exists paid_at timestamptz,
  add column if not exists payment_method text,
  add column if not exists provider_charge_id text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'charges'
      and column_name = 'valor'
  ) then
    execute 'update public.charges set amount_cents = round(valor * 100)::integer where amount_cents is null and valor is not null';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'charges'
      and column_name = 'amount'
  ) then
    execute 'update public.charges set amount_cents = round(amount * 100)::integer where amount_cents is null and amount is not null';
  end if;
end $$;

update public.charges
set amount_cents = 0
where amount_cents is null;

alter table if exists public.charges
  alter column amount_cents set default 0,
  alter column amount_cents set not null;

update public.charges
set origin = 'manual'
where origin is null;

update public.charges
set provider = 'manual'
where provider is null;

alter table if exists public.charges
  alter column origin set default 'manual',
  alter column provider set default 'manual';

create index if not exists charges_salon_created_at_idx
  on public.charges (salon_id, created_at desc);

create index if not exists charges_salon_due_date_idx
  on public.charges (salon_id, due_date);
