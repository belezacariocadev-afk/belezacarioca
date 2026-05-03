-- Beleza Carioca - alinhamento manual da persistencia do catalogo admin
-- Execute este arquivo no Supabase SQL Editor do banco remoto.
--
-- Ajuste desta versao:
-- - O banco real usa public.salons.id como uuid.
-- - Portanto, professionals.salon_id, services.salon_id, employees.salon_id e working_hours.salon_id
--   tambem precisam ser uuid para FKs e policies funcionarem.
--
-- Seguranca:
-- - Nao usa DROP TABLE.
-- - Nao apaga dados.
-- - Converte salon_id text para uuid somente quando todos os valores existentes forem UUID validos.
-- - Se encontrar salon_id text invalido, aborta com RAISE EXCEPTION mostrando exemplos a corrigir.
-- - Usa CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS.
-- - Usa DROP POLICY IF EXISTS apenas antes de recriar policies idempotentes.

begin;

-- 1) Extensao usada por ids uuid.
create extension if not exists pgcrypto;

-- 2) Funcao padrao de updated_at.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3) Coluna usada para marketplace/agendamento publico.
alter table public.salons
  add column if not exists is_public boolean not null default false;

-- 4) Funcoes RLS compativeis com o schema real: public.profiles + public.salons.
-- Nao dependem de tabelas antigas de vinculo por salao.
-- As funcoes abaixo descobrem colunas comuns em profiles:
-- - vinculo de usuario: user_id ou id
-- - vinculo de salao: salon_id
-- - papel: role, profile, type ou access_profile_id
-- - status: active ou status
-- Para dono do salao, tambem tentam salons.owner_id, salons.user_id, salons.owner_user_id e salons.owner_profile_id.
create or replace function public.current_salon_profile(target_salon_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  role_column text;
  identity_predicate text;
  active_predicate text := 'true';
  selected_profile text;
  owner_column text;
  has_profile_salon_id boolean := false;
begin
  if auth.uid() is null then
    return null;
  end if;

  if to_regclass('public.profiles') is not null then
    select column_name
    into role_column
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name in ('role', 'profile', 'type', 'access_profile_id')
    order by case column_name
      when 'role' then 1
      when 'profile' then 2
      when 'type' then 3
      when 'access_profile_id' then 4
      else 99
    end
    limit 1;

    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'salon_id'
    )
    into has_profile_salon_id;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'user_id'
    ) and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'id'
    ) then
      identity_predicate := '(p.user_id::text = auth.uid()::text or p.id::text = auth.uid()::text)';
    elsif exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'user_id'
    ) then
      identity_predicate := 'p.user_id::text = auth.uid()::text';
    elsif exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'id'
    ) then
      identity_predicate := 'p.id::text = auth.uid()::text';
    else
      identity_predicate := null;
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'active'
    ) then
      active_predicate := active_predicate || ' and coalesce(p.active, true) = true';
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'status'
    ) then
      active_predicate := active_predicate || ' and coalesce(lower(p.status::text), ''active'') not in (''inactive'', ''blocked'', ''disabled'', ''deleted'')';
    end if;

    if role_column is not null and identity_predicate is not null and has_profile_salon_id then
      execute format(
        'select %1$I::text
           from public.profiles p
          where p.salon_id::text = $1::text
            and %2$s
            and %3$s
          order by case regexp_replace(lower(coalesce(%1$I::text, '''')), ''[^a-z0-9]+'', '''', ''g'')
            when ''platformadmin'' then 1
            when ''superadmin'' then 1
            when ''salonadmin'' then 2
            when ''owner'' then 2
            when ''manager'' then 2
            when ''admin'' then 2
            when ''reception'' then 3
            when ''recepcao'' then 3
            when ''professional'' then 4
            when ''profissional'' then 4
            when ''client'' then 5
            when ''cliente'' then 5
            else 99
          end
          limit 1',
        role_column,
        identity_predicate,
        active_predicate
      )
      into selected_profile
      using target_salon_id;

      if selected_profile is not null then
        return selected_profile;
      end if;
    end if;

    if role_column is not null and identity_predicate is not null then
      execute format(
        'select %1$I::text
           from public.profiles p
          where %2$s
            and %3$s
            and regexp_replace(lower(coalesce(%1$I::text, '''')), ''[^a-z0-9]+'', '''', ''g'') in (''platformadmin'', ''superadmin'')
          limit 1',
        role_column,
        identity_predicate,
        active_predicate
      )
      into selected_profile;

      if selected_profile is not null then
        return selected_profile;
      end if;
    end if;
  end if;

  select column_name
  into owner_column
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'salons'
    and column_name in ('owner_id', 'user_id', 'owner_user_id', 'owner_profile_id')
  order by case column_name
    when 'owner_id' then 1
    when 'user_id' then 2
    when 'owner_user_id' then 3
    when 'owner_profile_id' then 4
    else 99
  end
  limit 1;

  if owner_column is not null then
    execute format(
      'select ''salonAdmin''
         from public.salons s
        where s.id::text = $1::text
          and s.%1$I::text = auth.uid()::text
        limit 1',
      owner_column
    )
    into selected_profile
    using target_salon_id;

    if selected_profile is not null then
      return selected_profile;
    end if;
  end if;

  return null;
end;
$$;

create or replace function public.can_access_salon(target_salon_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.current_salon_profile(target_salon_id) is not null
$$;

create or replace function public.is_salon_admin(target_salon_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select regexp_replace(lower(coalesce(public.current_salon_profile(target_salon_id), '')), '[^a-z0-9]+', '', 'g')
    in ('platformadmin', 'superadmin', 'salonadmin', 'owner', 'manager', 'admin')
$$;

create or replace function public.can_manage_module(target_salon_id uuid, module_name text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select case
    when regexp_replace(lower(coalesce(public.current_salon_profile(target_salon_id), '')), '[^a-z0-9]+', '', 'g')
      in ('platformadmin', 'superadmin', 'salonadmin', 'owner', 'manager', 'admin') then true
    when regexp_replace(lower(coalesce(public.current_salon_profile(target_salon_id), '')), '[^a-z0-9]+', '', 'g')
      in ('reception', 'recepcao')
      then module_name in ('agenda', 'clientes', 'servicos')
    else false
  end
$$;

-- 5) Cria tabelas quando ainda nao existem, ja com salon_id uuid.
-- Se alguma tabela ja existir com salon_id text, o bloco 6 converte com seguranca.
create table if not exists public.professionals (
  id text primary key,
  salon_id uuid not null references public.salons(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  profile_id text,
  access_profile_id text default 'professional',
  name text,
  email text,
  role text,
  "function" text,
  active boolean default true,
  status text default 'active',
  permissions text[] default array['ver_agenda_propria'],
  schedule jsonb default jsonb_build_object(
    'active', true,
    'weekdays', jsonb_build_array(1, 2, 3, 4, 5),
    'startTime', '09:00',
    'endTime', '18:00',
    'breakStartTime', '12:00',
    'breakEndTime', '13:00'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id text primary key,
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  category text not null default 'Geral',
  duration_minutes integer not null default 45,
  price_cents integer not null default 0,
  price numeric,
  active boolean not null default true,
  status text not null default 'active',
  professional_ids text[] not null default array[]::text[],
  notes text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  full_name text not null,
  phone text,
  specialty text,
  active boolean not null default true,
  status text not null default 'active',
  created_at timestamp default now(),
  updated_at timestamp default now(),
  role text not null default 'professional',
  commission_rate numeric not null default 0
);

create table if not exists public.working_hours (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 6) Remove policies afetadas antes de converter tipos.
-- Isso evita que policies antigas dependentes de salon_id text bloqueiem ALTER COLUMN TYPE.
drop policy if exists "professionals_select_by_membership" on public.professionals;
drop policy if exists "professionals_write_by_admin" on public.professionals;
drop policy if exists "services_select_by_membership" on public.services;
drop policy if exists "services_write_by_staff" on public.services;
drop policy if exists "services_public_select_active_public_salons" on public.services;
drop policy if exists "employees_select_by_membership" on public.employees;
drop policy if exists "employees_write_by_admin" on public.employees;
drop policy if exists "employees_public_select_active_public_salons" on public.employees;
drop policy if exists "working_hours_select_by_membership" on public.working_hours;
drop policy if exists "working_hours_write_by_admin" on public.working_hours;
drop policy if exists "working_hours_public_select_active_public_salons" on public.working_hours;

-- 7) Garante/ajusta salon_id uuid em tabelas existentes.
-- Se salon_id for text com valores UUID validos, converte para uuid.
-- Se houver valores invalidos, para a execucao para voce corrigir os registros indicados.
do $$
declare
  target_table text;
  current_udt text;
  invalid_count integer;
  invalid_examples text;
begin
  foreach target_table in array array['professionals', 'services', 'employees', 'working_hours']
  loop
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = target_table
        and column_name = 'salon_id'
    ) then
      execute format('alter table public.%I add column salon_id uuid', target_table);
    end if;

    select udt_name
    into current_udt
    from information_schema.columns
    where table_schema = 'public'
      and table_name = target_table
      and column_name = 'salon_id';

    if current_udt = 'uuid' then
      continue;
    elsif current_udt in ('text', 'varchar', 'bpchar') then
      execute format(
        'select count(*) from public.%I where salon_id is not null and salon_id !~* %L',
        target_table,
        '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      )
      into invalid_count;

      if invalid_count > 0 then
        execute format(
          'select string_agg(id::text || ''=>'' || salon_id::text, '', '') from (select id, salon_id from public.%I where salon_id is not null and salon_id !~* %L limit 10) invalid_rows',
          target_table,
          '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        )
        into invalid_examples;

        raise exception
          'Nao foi possivel converter public.%.salon_id para uuid. Existem % valores invalidos. Corrija estes registros antes de rodar novamente. Exemplos: %',
          target_table,
          invalid_count,
          coalesce(invalid_examples, 'sem exemplos');
      end if;

      execute format(
        'alter table public.%I alter column salon_id type uuid using salon_id::uuid',
        target_table
      );
    else
      raise exception
        'Tipo inesperado em public.%.salon_id: %. Ajuste manualmente para uuid antes de continuar.',
        target_table,
        current_udt;
    end if;
  end loop;
end;
$$;

-- 8) Garante colunas restantes em professionals.
alter table public.professionals
  add column if not exists user_id uuid,
  add column if not exists profile_id text,
  add column if not exists access_profile_id text default 'professional',
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists role text,
  add column if not exists "function" text,
  add column if not exists active boolean default true,
  add column if not exists status text default 'active',
  add column if not exists permissions text[] default array['ver_agenda_propria'],
  add column if not exists schedule jsonb default jsonb_build_object(
    'active', true,
    'weekdays', jsonb_build_array(1, 2, 3, 4, 5),
    'startTime', '09:00',
    'endTime', '18:00',
    'breakStartTime', '12:00',
    'breakEndTime', '13:00'
  ),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.professionals
set
  profile_id = coalesce(profile_id, 'profile-' || id::text),
  access_profile_id = coalesce(access_profile_id, 'professional'),
  name = coalesce(name, 'Profissional'),
  email = coalesce(email, id::text || '@belezacarioca.local'),
  role = coalesce(role, "function", 'Profissional'),
  "function" = coalesce("function", role, 'Profissional'),
  active = coalesce(active, status is distinct from 'inactive'),
  status = coalesce(status, case when active is false then 'inactive' else 'active' end),
  permissions = coalesce(permissions, array['ver_agenda_propria']),
  schedule = coalesce(
    schedule,
    jsonb_build_object(
      'active', true,
      'weekdays', jsonb_build_array(1, 2, 3, 4, 5),
      'startTime', '09:00',
      'endTime', '18:00',
      'breakStartTime', '12:00',
      'breakEndTime', '13:00'
    )
  );

-- 9) Garante colunas restantes em services.
alter table public.services
  add column if not exists name text,
  add column if not exists category text default 'Geral',
  add column if not exists duration_minutes integer default 45,
  add column if not exists price_cents integer default 0,
  add column if not exists price numeric,
  add column if not exists active boolean default true,
  add column if not exists status text default 'active',
  add column if not exists professional_ids text[] default array[]::text[],
  add column if not exists notes text,
  add column if not exists description text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.services
set
  name = coalesce(name, 'Servico'),
  category = coalesce(category, 'Geral'),
  duration_minutes = coalesce(duration_minutes, 45),
  price_cents = coalesce(price_cents, round(coalesce(price, 0) * 100)::integer, 0),
  price = coalesce(price, price_cents::numeric / 100),
  active = coalesce(active, status is distinct from 'inactive'),
  status = coalesce(status, case when active is false then 'inactive' else 'active' end),
  professional_ids = coalesce(professional_ids, array[]::text[]),
  notes = coalesce(notes, description),
  description = coalesce(description, notes, category);

-- 10) Garante colunas restantes em employees.
alter table public.employees
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists specialty text,
  add column if not exists active boolean default true,
  add column if not exists status text default 'active',
  add column if not exists created_at timestamp default now(),
  add column if not exists updated_at timestamp default now(),
  add column if not exists role text default 'professional',
  add column if not exists commission_rate numeric default 0;

update public.employees
set
  full_name = coalesce(full_name, 'Profissional'),
  active = coalesce(active, status is distinct from 'inactive'),
  status = coalesce(status, case when active is false then 'inactive' else 'active' end),
  role = coalesce(role, 'professional'),
  commission_rate = coalesce(commission_rate, 0);

-- 11) Garante colunas restantes em working_hours.
alter table public.working_hours
  add column if not exists employee_id uuid,
  add column if not exists weekday integer,
  add column if not exists start_time time,
  add column if not exists end_time time,
  add column if not exists active boolean default true,
  add column if not exists created_at timestamp default now(),
  add column if not exists updated_at timestamp default now();

update public.working_hours
set active = coalesce(active, true);

-- 12) Constraints/FKs seguras e compativeis com uuid.
-- Usa NOT VALID para nao bloquear por dados historicos ainda nao validados.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'professionals_salon_id_fkey' and conrelid = 'public.professionals'::regclass
  ) then
    alter table public.professionals
      add constraint professionals_salon_id_fkey foreign key (salon_id) references public.salons(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'professionals_user_id_fkey' and conrelid = 'public.professionals'::regclass
  ) then
    alter table public.professionals
      add constraint professionals_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'services_salon_id_fkey' and conrelid = 'public.services'::regclass
  ) then
    alter table public.services
      add constraint services_salon_id_fkey foreign key (salon_id) references public.salons(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'employees_salon_id_fkey' and conrelid = 'public.employees'::regclass
  ) then
    alter table public.employees
      add constraint employees_salon_id_fkey foreign key (salon_id) references public.salons(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'working_hours_salon_id_fkey' and conrelid = 'public.working_hours'::regclass
  ) then
    alter table public.working_hours
      add constraint working_hours_salon_id_fkey foreign key (salon_id) references public.salons(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'working_hours_employee_id_fkey' and conrelid = 'public.working_hours'::regclass
  ) then
    alter table public.working_hours
      add constraint working_hours_employee_id_fkey foreign key (employee_id) references public.employees(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'services_duration_minutes_positive' and conrelid = 'public.services'::regclass
  ) then
    alter table public.services
      add constraint services_duration_minutes_positive check (duration_minutes > 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'services_price_cents_non_negative' and conrelid = 'public.services'::regclass
  ) then
    alter table public.services
      add constraint services_price_cents_non_negative check (price_cents >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'working_hours_weekday_range' and conrelid = 'public.working_hours'::regclass
  ) then
    alter table public.working_hours
      add constraint working_hours_weekday_range check (weekday between 0 and 6) not valid;
  end if;
end;
$$;

-- 13) NOT NULL apenas quando for seguro para dados existentes.
do $$
begin
  if not exists (select 1 from public.professionals where salon_id is null) then
    alter table public.professionals alter column salon_id set not null;
  end if;
  if not exists (select 1 from public.professionals where profile_id is null) then
    alter table public.professionals alter column profile_id set not null;
  end if;
  if not exists (select 1 from public.professionals where access_profile_id is null) then
    alter table public.professionals alter column access_profile_id set not null;
  end if;
  if not exists (select 1 from public.professionals where name is null) then
    alter table public.professionals alter column name set not null;
  end if;
  if not exists (select 1 from public.professionals where email is null) then
    alter table public.professionals alter column email set not null;
  end if;
  if not exists (select 1 from public.professionals where role is null) then
    alter table public.professionals alter column role set not null;
  end if;
  if not exists (select 1 from public.professionals where active is null) then
    alter table public.professionals alter column active set not null;
  end if;
  if not exists (select 1 from public.professionals where permissions is null) then
    alter table public.professionals alter column permissions set not null;
  end if;
  if not exists (select 1 from public.professionals where schedule is null) then
    alter table public.professionals alter column schedule set not null;
  end if;

  if not exists (select 1 from public.services where salon_id is null) then
    alter table public.services alter column salon_id set not null;
  end if;
  if not exists (select 1 from public.services where name is null) then
    alter table public.services alter column name set not null;
  end if;
  if not exists (select 1 from public.services where category is null) then
    alter table public.services alter column category set not null;
  end if;
  if not exists (select 1 from public.services where duration_minutes is null) then
    alter table public.services alter column duration_minutes set not null;
  end if;
  if not exists (select 1 from public.services where price_cents is null) then
    alter table public.services alter column price_cents set not null;
  end if;
  if not exists (select 1 from public.services where active is null) then
    alter table public.services alter column active set not null;
  end if;
  if not exists (select 1 from public.services where professional_ids is null) then
    alter table public.services alter column professional_ids set not null;
  end if;

  if not exists (select 1 from public.employees where salon_id is null) then
    alter table public.employees alter column salon_id set not null;
  end if;
  if not exists (select 1 from public.employees where full_name is null) then
    alter table public.employees alter column full_name set not null;
  end if;
  if not exists (select 1 from public.employees where active is null) then
    alter table public.employees alter column active set not null;
  end if;

  if not exists (select 1 from public.working_hours where salon_id is null) then
    alter table public.working_hours alter column salon_id set not null;
  end if;
  if not exists (select 1 from public.working_hours where employee_id is null) then
    alter table public.working_hours alter column employee_id set not null;
  end if;
  if not exists (select 1 from public.working_hours where weekday is null) then
    alter table public.working_hours alter column weekday set not null;
  end if;
  if not exists (select 1 from public.working_hours where start_time is null) then
    alter table public.working_hours alter column start_time set not null;
  end if;
  if not exists (select 1 from public.working_hours where end_time is null) then
    alter table public.working_hours alter column end_time set not null;
  end if;
  if not exists (select 1 from public.working_hours where active is null) then
    alter table public.working_hours alter column active set not null;
  end if;
end;
$$;

-- 14) Indices.
create index if not exists professionals_salon_id_idx on public.professionals(salon_id);
create index if not exists professionals_salon_active_idx on public.professionals(salon_id, active);
create index if not exists services_salon_id_idx on public.services(salon_id);
create index if not exists services_salon_active_idx on public.services(salon_id, active);
create index if not exists employees_salon_active_idx on public.employees(salon_id, active);
create index if not exists working_hours_employee_day_idx
  on public.working_hours(salon_id, employee_id, weekday, active);

-- 15) Triggers updated_at.
do $$
declare
  target_table text;
begin
  foreach target_table in array array['professionals', 'services', 'employees', 'working_hours']
  loop
    execute format('drop trigger if exists %I_touch_updated_at on public.%I', target_table, target_table);
    execute format(
      'create trigger %I_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',
      target_table,
      target_table
    );
  end loop;
end;
$$;

-- 16) RLS/policies por salon_id uuid.
alter table public.professionals enable row level security;
alter table public.services enable row level security;
alter table public.employees enable row level security;
alter table public.working_hours enable row level security;

drop policy if exists "professionals_select_by_membership" on public.professionals;
create policy "professionals_select_by_membership"
on public.professionals for select
to authenticated
using (public.can_access_salon(salon_id));

drop policy if exists "professionals_write_by_admin" on public.professionals;
create policy "professionals_write_by_admin"
on public.professionals for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));

drop policy if exists "services_select_by_membership" on public.services;
create policy "services_select_by_membership"
on public.services for select
to authenticated
using (public.can_access_salon(salon_id));

drop policy if exists "services_write_by_staff" on public.services;
create policy "services_write_by_staff"
on public.services for all
to authenticated
using (public.can_manage_module(salon_id, 'servicos'))
with check (public.can_manage_module(salon_id, 'servicos'));

drop policy if exists "employees_select_by_membership" on public.employees;
create policy "employees_select_by_membership"
on public.employees for select
to authenticated
using (public.can_access_salon(salon_id));

drop policy if exists "employees_write_by_admin" on public.employees;
create policy "employees_write_by_admin"
on public.employees for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));

drop policy if exists "working_hours_select_by_membership" on public.working_hours;
create policy "working_hours_select_by_membership"
on public.working_hours for select
to authenticated
using (public.can_access_salon(salon_id));

drop policy if exists "working_hours_write_by_admin" on public.working_hours;
create policy "working_hours_write_by_admin"
on public.working_hours for all
to authenticated
using (public.is_salon_admin(salon_id))
with check (public.is_salon_admin(salon_id));

-- 17) Leitura publica restrita para marketplace/agendamento.
-- As APIs atuais usam service role no backend; estas policies so liberam leitura anonima segura
-- para registros ativos de saloes publicos.
drop policy if exists "services_public_select_active_public_salons" on public.services;
create policy "services_public_select_active_public_salons"
on public.services for select
to anon
using (
  active = true
  and exists (
    select 1
    from public.salons s
    where s.id = services.salon_id
      and s.is_public = true
  )
);

drop policy if exists "employees_public_select_active_public_salons" on public.employees;
create policy "employees_public_select_active_public_salons"
on public.employees for select
to anon
using (
  active = true
  and exists (
    select 1
    from public.salons s
    where s.id = employees.salon_id
      and s.is_public = true
  )
);

drop policy if exists "working_hours_public_select_active_public_salons" on public.working_hours;
create policy "working_hours_public_select_active_public_salons"
on public.working_hours for select
to anon
using (
  active = true
  and exists (
    select 1
    from public.salons s
    where s.id = working_hours.salon_id
      and s.is_public = true
  )
);

commit;

-- Como testar depois no localhost:
-- 1. Confirme no .env.local: NEXT_PUBLIC_PLATFORM_DATA_SOURCE=supabase.
-- 2. Rode: npm.cmd run dev
-- 3. Acesse /admin/profissionais, cadastre um profissional e recarregue a pagina.
-- 4. Confirme no Supabase:
--    select id, salon_id, name, email, role, active from public.professionals order by created_at desc;
-- 5. Acesse /admin/servicos, cadastre um servico e recarregue a pagina.
-- 6. Confirme no Supabase:
--    select id, salon_id, name, category, price_cents, duration_minutes, active, professional_ids from public.services order by created_at desc;
-- 7. Para marketplace/agendamento publico, confirme se o salao esta com salons.is_public = true
--    e se existem employees/working_hours ativos para o mesmo salon_id uuid.
