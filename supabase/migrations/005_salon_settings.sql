alter table public.salons
add column if not exists settings jsonb;

update public.salons
set settings = coalesce(settings, '{"clientCancellationLeadHours":4}'::jsonb);

alter table public.salons
alter column settings set default '{"clientCancellationLeadHours":4}'::jsonb,
alter column settings set not null;
