create table if not exists public.homepage_images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  storage_path text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_images enable row level security;

drop policy if exists "Public can view active homepage images" on public.homepage_images;
create policy "Public can view active homepage images"
on public.homepage_images for select
using (is_active = true or public.is_admin_or_staff());

drop policy if exists "Staff can manage homepage images" on public.homepage_images;
create policy "Staff can manage homepage images"
on public.homepage_images for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read site assets" on storage.objects;
create policy "Public can read site assets"
on storage.objects for select
using (bucket_id = 'site-assets');

drop policy if exists "Staff can upload site assets" on storage.objects;
create policy "Staff can upload site assets"
on storage.objects for insert
with check (bucket_id = 'site-assets' and public.is_admin_or_staff());

drop policy if exists "Staff can update site assets" on storage.objects;
create policy "Staff can update site assets"
on storage.objects for update
using (bucket_id = 'site-assets' and public.is_admin_or_staff())
with check (bucket_id = 'site-assets' and public.is_admin_or_staff());

drop policy if exists "Staff can delete site assets" on storage.objects;
create policy "Staff can delete site assets"
on storage.objects for delete
using (bucket_id = 'site-assets' and public.is_admin_or_staff());

insert into public.homepage_images (title, image_url, display_order, is_active)
select title, image_url, display_order, true
from (
  values
    ('Salon interior', '/homepage/salon.jpg', 0),
    ('Styling station', '/homepage/salon_1.jpg', 1),
    ('Salon detail', '/homepage/salon_2.jpg', 2),
    ('Beauty room', '/homepage/salon_3.jpg', 3)
) as default_images(title, image_url, display_order)
where not exists (select 1 from public.homepage_images);
