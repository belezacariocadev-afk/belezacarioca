alter table public.professionals
  add column if not exists status text not null default 'active';

alter table public.employees
  add column if not exists status text not null default 'active';

update public.professionals
set status = case
  when status is not null then status
  when active is false then 'inactive'
  else 'active'
end;

update public.employees
set status = case
  when status is not null then status
  when active is false then 'inactive'
  else 'active'
end;

do $$
declare
  duplicate_emails text;
  duplicate_empty_email_names text;
begin
  select string_agg(format('salon_id=%s email=%s total=%s ids=%s', salon_id, normalized_email, total, ids), ' | ')
  into duplicate_emails
  from (
    select
      salon_id,
      lower(btrim(email)) as normalized_email,
      count(*) as total,
      string_agg(id::text, ', ' order by created_at, id) as ids
    from public.professionals
    where nullif(btrim(coalesce(email, '')), '') is not null
      and coalesce(status, 'active') <> 'deleted'
    group by salon_id, lower(btrim(email))
    having count(*) > 1
    limit 20
  ) duplicates;

  if duplicate_emails is not null then
    raise exception
      'Existem profissionais duplicados por email antes de criar o indice unico. Corrija/remova/mescle esses registros e rode novamente. %',
      duplicate_emails;
  end if;

  select string_agg(format('salon_id=%s nome=%s funcao=%s total=%s ids=%s', salon_id, normalized_name, normalized_role, total, ids), ' | ')
  into duplicate_empty_email_names
  from (
    select
      salon_id,
      lower(btrim(name)) as normalized_name,
      lower(btrim(role)) as normalized_role,
      count(*) as total,
      string_agg(id::text, ', ' order by created_at, id) as ids
    from public.professionals
    where nullif(btrim(coalesce(email, '')), '') is null
      and nullif(btrim(coalesce(name, '')), '') is not null
      and nullif(btrim(coalesce(role, '')), '') is not null
      and coalesce(status, 'active') <> 'deleted'
    group by salon_id, lower(btrim(name)), lower(btrim(role))
    having count(*) > 1
    limit 20
  ) duplicates;

  if duplicate_empty_email_names is not null then
    raise exception
      'Existem profissionais sem email duplicados por nome e funcao antes de criar o indice unico. Corrija/remova/mescle esses registros e rode novamente. %',
      duplicate_empty_email_names;
  end if;
end;
$$;

create unique index if not exists professionals_unique_salon_email_not_deleted_idx
  on public.professionals (salon_id, lower(btrim(email)))
  where nullif(btrim(coalesce(email, '')), '') is not null
    and coalesce(status, 'active') <> 'deleted';

create unique index if not exists professionals_unique_salon_name_role_without_email_idx
  on public.professionals (salon_id, lower(btrim(name)), lower(btrim(role)))
  where nullif(btrim(coalesce(email, '')), '') is null
    and nullif(btrim(coalesce(name, '')), '') is not null
    and nullif(btrim(coalesce(role, '')), '') is not null
    and coalesce(status, 'active') <> 'deleted';
