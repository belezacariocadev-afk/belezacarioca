alter table public.salons
  add column if not exists logo_url text,
  add column if not exists cover_url text,
  add column if not exists theme_mode text not null default 'light',
  add column if not exists primary_color text not null default '#7C3AED';

alter table public.professionals
  add column if not exists avatar_url text;

alter table public.employees
  add column if not exists avatar_url text;

create index if not exists salons_visual_identity_idx
  on public.salons (id, theme_mode, primary_color);

create index if not exists professionals_avatar_lookup_idx
  on public.professionals (salon_id, id)
  where avatar_url is not null;

create index if not exists employees_avatar_lookup_idx
  on public.employees (salon_id, id)
  where avatar_url is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'salons_theme_mode_check'
      and conrelid = 'public.salons'::regclass
  ) then
    alter table public.salons
      add constraint salons_theme_mode_check
      check (theme_mode in ('light', 'dark'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'salons_primary_color_check'
      and conrelid = 'public.salons'::regclass
  ) then
    alter table public.salons
      add constraint salons_primary_color_check
      check (primary_color ~ '^#[0-9A-Fa-f]{6}$');
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'salon-assets',
  'salon-assets',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "salon_assets_public_select" on storage.objects;
create policy "salon_assets_public_select"
on storage.objects for select
using (bucket_id = 'salon-assets');

drop policy if exists "salon_assets_admin_insert" on storage.objects;
create policy "salon_assets_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'salon-assets'
  and (
    (
      (storage.foldername(name))[1] = 'salons'
      and public.is_salon_admin((storage.foldername(name))[2])
    )
    or (
      (storage.foldername(name))[1] = 'professionals'
      and public.is_salon_admin((storage.foldername(name))[2])
    )
  )
);

drop policy if exists "salon_assets_admin_update" on storage.objects;
create policy "salon_assets_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'salon-assets'
  and (
    (
      (storage.foldername(name))[1] = 'salons'
      and public.is_salon_admin((storage.foldername(name))[2])
    )
    or (
      (storage.foldername(name))[1] = 'professionals'
      and public.is_salon_admin((storage.foldername(name))[2])
    )
  )
)
with check (
  bucket_id = 'salon-assets'
  and (
    (
      (storage.foldername(name))[1] = 'salons'
      and public.is_salon_admin((storage.foldername(name))[2])
    )
    or (
      (storage.foldername(name))[1] = 'professionals'
      and public.is_salon_admin((storage.foldername(name))[2])
    )
  )
);

drop policy if exists "salon_assets_admin_delete" on storage.objects;
create policy "salon_assets_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'salon-assets'
  and (
    (
      (storage.foldername(name))[1] = 'salons'
      and public.is_salon_admin((storage.foldername(name))[2])
    )
    or (
      (storage.foldername(name))[1] = 'professionals'
      and public.is_salon_admin((storage.foldername(name))[2])
    )
  )
);
