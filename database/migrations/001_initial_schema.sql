create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  suburb text,
  state text,
  postcode text,
  role text not null default 'client' check (role in ('client', 'staff', 'admin')),
  date_of_birth date,
  marketing_opt_in boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  profile_picture_url text,
  full_name text not null,
  email text,
  mobile text,
  address_line1 text,
  address_line2 text,
  suburb text,
  state text,
  postcode text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_memberships (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customers(id) on delete cascade,
  is_member boolean not null default false,
  start_date date,
  end_date date,
  fee_cents integer not null default 0 check (fee_cents >= 0),
  paid_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  job_title text not null,
  bio text,
  phone text,
  email text,
  specialties text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_info (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'closed')),
  assigned_staff_id uuid references public.staff_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_menu (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  image_url text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_details (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  client_id uuid references public.profiles(id),
  staff_id uuid references public.staff_profiles(id),
  service_id uuid references public.service_menu(id),
  appointment_start timestamptz not null,
  appointment_end timestamptz not null,
  status text not null default 'confirmed' check (status in ('draft', 'confirmed', 'cancelled', 'completed', 'no_show')),
  source text not null default 'admin' check (source in ('admin', 'phone', 'instagram', 'walk_in', 'website_lead')),
  price_cents integer,
  deposit_cents integer,
  amount_paid_cents integer,
  payment_method text check (payment_method in ('cash', 'card', 'upi')),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  client_voucher_id uuid,
  client_notes text,
  staff_notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (appointment_end > appointment_start)
);

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  discount_type text not null check (discount_type in ('fixed', 'percentage')),
  discount_value integer not null check (discount_value > 0),
  starts_at timestamptz,
  expires_at timestamptz,
  max_uses integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_vouchers (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null references public.vouchers(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  client_id uuid references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  status text not null default 'available' check (status in ('available', 'used', 'expired', 'cancelled')),
  used_booking_id uuid references public.booking_details(id),
  starts_at timestamptz,
  expires_at timestamptz,
  assigned_at timestamptz not null default now(),
  used_at timestamptz
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'booking_details_client_voucher_id_fkey'
  ) then
    alter table public.booking_details
    add constraint booking_details_client_voucher_id_fkey
    foreign key (client_voucher_id) references public.client_vouchers(id);
  end if;
end $$;

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  category text,
  is_public boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  title text not null,
  alt_text text,
  image_url text not null,
  storage_path text,
  caption text,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.client_gallery (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid references public.booking_details(id) on delete set null,
  category text not null default 'other' check (category in ('hair', 'nails', 'makeup', 'bridal', 'other')),
  title text not null,
  notes text,
  image_url text not null,
  storage_path text,
  phone_snapshot text,
  is_visible_to_staff boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.salon_settings (
  id uuid primary key default gen_random_uuid(),
  salon_name text not null default 'K Beauty Salon',
  logo_url text,
  hero_image_url text,
  instagram_url text,
  phone text,
  email text,
  address text,
  currency_code text not null default 'INR',
  gst_percent numeric(5,2) not null default 18.00,
  theme_primary_color text not null default '#2f5c50',
  theme_accent_color text not null default '#cc9a53',
  updated_at timestamptz not null default now()
);

create table if not exists public.client_reviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  client_name text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  review_text text not null,
  is_visible boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.customer_memberships enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.contact_info enable row level security;
alter table public.service_menu enable row level security;
alter table public.booking_details enable row level security;
alter table public.vouchers enable row level security;
alter table public.client_vouchers enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;
alter table public.homepage_images enable row level security;
alter table public.client_gallery enable row level security;
alter table public.salon_settings enable row level security;
alter table public.client_reviews enable row level security;

create or replace function public.current_profile_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin_or_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_profile_role() in ('admin', 'staff'), false)
$$;

drop policy if exists "Public can view active services" on public.service_menu;
create policy "Public can view active services"
on public.service_menu for select
using (is_active = true or public.is_admin_or_staff());

drop policy if exists "Public can view public albums" on public.gallery_albums;
create policy "Public can view public albums"
on public.gallery_albums for select
using (is_public = true or public.is_admin_or_staff());

drop policy if exists "Public can view public album images" on public.gallery_images;
create policy "Public can view public album images"
on public.gallery_images for select
using (exists (
  select 1 from public.gallery_albums
  where gallery_albums.id = gallery_images.album_id
  and gallery_albums.is_public = true
) or public.is_admin_or_staff());

drop policy if exists "Public can view active homepage images" on public.homepage_images;
create policy "Public can view active homepage images"
on public.homepage_images for select
using (is_active = true or public.is_admin_or_staff());

drop policy if exists "Public can view salon settings" on public.salon_settings;
create policy "Public can view salon settings"
on public.salon_settings for select
using (true);

drop policy if exists "Public can create leads" on public.contact_info;
create policy "Public can create leads"
on public.contact_info for insert
with check (true);

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id or public.is_admin_or_staff());

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Staff can manage customers" on public.customers;
create policy "Staff can manage customers"
on public.customers for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Linked users can view customer profile" on public.customers;
create policy "Linked users can view customer profile"
on public.customers for select
using (auth.uid() = profile_id or public.is_admin_or_staff());

drop policy if exists "Staff can manage customer memberships" on public.customer_memberships;
create policy "Staff can manage customer memberships"
on public.customer_memberships for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Linked users can view customer memberships" on public.customer_memberships;
create policy "Linked users can view customer memberships"
on public.customer_memberships for select
using (exists (
  select 1 from public.customers
  where customers.id = customer_memberships.customer_id
  and customers.profile_id = auth.uid()
) or public.is_admin_or_staff());

drop policy if exists "Clients can view own bookings" on public.booking_details;
create policy "Clients can view own bookings"
on public.booking_details for select
using (
  auth.uid() = client_id
  or exists (
    select 1 from public.customers
    where customers.id = booking_details.customer_id
    and customers.profile_id = auth.uid()
  )
  or public.is_admin_or_staff()
);

drop policy if exists "Staff can manage bookings" on public.booking_details;
create policy "Staff can manage bookings"
on public.booking_details for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Clients can view own assigned vouchers" on public.client_vouchers;
create policy "Clients can view own assigned vouchers"
on public.client_vouchers for select
using (
  auth.uid() = client_id
  or exists (
    select 1 from public.customers
    where customers.id = client_vouchers.customer_id
    and customers.profile_id = auth.uid()
  )
  or public.is_admin_or_staff()
);

drop policy if exists "Staff can assign vouchers" on public.client_vouchers;
create policy "Staff can assign vouchers"
on public.client_vouchers for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Clients can manage own gallery" on public.client_gallery;
create policy "Clients can manage own gallery"
on public.client_gallery for all
using (auth.uid() = client_id or public.is_admin_or_staff())
with check (auth.uid() = client_id or public.is_admin_or_staff());

drop policy if exists "Staff can manage staff profiles" on public.staff_profiles;
create policy "Staff can manage staff profiles"
on public.staff_profiles for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Staff can manage leads" on public.contact_info;
create policy "Staff can manage leads"
on public.contact_info for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Staff can manage services" on public.service_menu;
create policy "Staff can manage services"
on public.service_menu for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Staff can manage vouchers" on public.vouchers;
create policy "Staff can manage vouchers"
on public.vouchers for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Staff can manage albums" on public.gallery_albums;
create policy "Staff can manage albums"
on public.gallery_albums for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Staff can manage album images" on public.gallery_images;
create policy "Staff can manage album images"
on public.gallery_images for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Staff can manage homepage images" on public.homepage_images;
create policy "Staff can manage homepage images"
on public.homepage_images for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Staff can manage settings" on public.salon_settings;
create policy "Staff can manage settings"
on public.salon_settings for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Public can view visible reviews" on public.client_reviews;
create policy "Public can view visible reviews"
on public.client_reviews for select
using (is_visible = true or public.is_admin_or_staff());

drop policy if exists "Staff can manage reviews" on public.client_reviews;
create policy "Staff can manage reviews"
on public.client_reviews for all
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

insert into public.salon_settings (salon_name, logo_url, instagram_url, phone, email, address, currency_code, gst_percent, theme_primary_color, theme_accent_color)
select 'K Beauty Salon', '/homepage/logo-wo-bg.png', 'https://www.instagram.com/kbeautyglamsalon/', '04XX XXX XXX', 'hello@kbeautysalon.com', 'Your salon address will go here once confirmed.', 'INR', 18.00, '#2f5c50', '#cc9a53'
where not exists (select 1 from public.salon_settings);

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
