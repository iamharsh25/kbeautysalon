# Database Design

Recommended backend: Supabase. It gives you Postgres, Auth, Storage, and Row Level Security on the free tier.

## Product Model

This is not only a public website. It is a salon management platform with three experiences:

- Public website: home, services, gallery albums, contact, login.
- Client portal: My Gallery, My Vouchers, Previous Bookings, My Account.
- Admin portal: leads, bookings, staff, services, public gallery albums/images, vouchers, reviews, website details.

Bookings are created and managed by admin/staff. Clients only see their appointment history and activity.

## Tables

### auth.users

Supabase Auth owns login credentials. Do not store passwords in your own tables.

### profiles

One profile per auth user.

- `id uuid primary key references auth.users(id)`
- `full_name text`
- `email text`
- `phone text`
- `address_line1 text`
- `address_line2 text`
- `suburb text`
- `state text`
- `postcode text`
- `role text` values `client`, `staff`, `admin`
- `date_of_birth date`
- `marketing_opt_in boolean`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

### staff_profiles

Extra staff details managed by admin.

- `id uuid primary key`
- `profile_id uuid references profiles(id)`
- `display_name text`
- `job_title text`
- `bio text`
- `phone text`
- `email text`
- `specialties text[]`
- `is_active boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

### contact_info

Leads from public contact forms.

- `id uuid primary key`
- `name text`
- `email text`
- `phone text`
- `subject text`
- `message text`
- `status text` values `new`, `read`, `closed`
- `assigned_staff_id uuid references staff_profiles(id)`
- `created_at timestamptz`
- `updated_at timestamptz`

### service_menu

Salon services.

- `id uuid primary key`
- `name text`
- `slug text unique`
- `category text`
- `description text`
- `duration_minutes integer`
- `price_cents integer`
- `image_url text`
- `is_active boolean`
- `display_order integer`
- `created_at timestamptz`
- `updated_at timestamptz`

### booking_details

Admin/staff-created bookings.

- `id uuid primary key`
- `client_id uuid references profiles(id)`
- `staff_id uuid references staff_profiles(id)`
- `service_id uuid references service_menu(id)`
- `appointment_start timestamptz`
- `appointment_end timestamptz`
- `status text` values `draft`, `confirmed`, `cancelled`, `completed`, `no_show`
- `source text` values `admin`, `phone`, `instagram`, `walk_in`, `website_lead`
- `price_cents integer`
- `deposit_cents integer`
- `client_notes text`
- `staff_notes text`
- `created_by uuid references profiles(id)`
- `created_at timestamptz`
- `updated_at timestamptz`

### vouchers

Voucher templates created by admin.

- `id uuid primary key`
- `code text unique`
- `title text`
- `description text`
- `discount_type text` values `fixed`, `percentage`
- `discount_value integer`
- `starts_at timestamptz`
- `expires_at timestamptz`
- `max_uses integer`
- `is_active boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

### client_vouchers

Vouchers assigned to a specific client.

- `id uuid primary key`
- `voucher_id uuid references vouchers(id)`
- `client_id uuid references profiles(id)`
- `assigned_by uuid references profiles(id)`
- `status text` values `available`, `used`, `expired`, `cancelled`
- `used_booking_id uuid references booking_details(id)`
- `assigned_at timestamptz`
- `used_at timestamptz`

### gallery_albums

Public website gallery albums managed by admin.

- `id uuid primary key`
- `title text`
- `slug text unique`
- `description text`
- `cover_image_url text`
- `category text`
- `is_public boolean`
- `display_order integer`
- `created_at timestamptz`
- `updated_at timestamptz`

### gallery_images

Images uploaded into public gallery albums.

- `id uuid primary key`
- `album_id uuid references gallery_albums(id)`
- `title text`
- `alt_text text`
- `image_url text`
- `storage_path text`
- `caption text`
- `is_featured boolean`
- `display_order integer`
- `created_at timestamptz`
- `updated_at timestamptz`

### client_gallery

Private photos uploaded by clients for style memory.

- `id uuid primary key`
- `client_id uuid references profiles(id)`
- `booking_id uuid references booking_details(id)`
- `category text` values `hair`, `nails`, `makeup`, `bridal`, `other`
- `title text`
- `notes text`
- `image_url text`
- `storage_path text`
- `phone_snapshot text`
- `is_visible_to_staff boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

### salon_settings

Editable website settings.

- `id uuid primary key`
- `salon_name text`
- `logo_url text`
- `hero_image_url text`
- `instagram_url text`
- `phone text`
- `email text`
- `address text`
- `updated_at timestamptz`

### client_reviews

Testimonials managed by admin.

- `id uuid primary key`
- `client_id uuid references profiles(id)`
- `client_name text`
- `rating integer`
- `review_text text`
- `is_visible boolean`
- `display_order integer`
- `created_at timestamptz`

## Starter SQL

```sql
create extension if not exists "pgcrypto";

create table public.profiles (
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

create table public.staff_profiles (
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

create table public.contact_info (
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

create table public.service_menu (
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

create table public.booking_details (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id),
  staff_id uuid references public.staff_profiles(id),
  service_id uuid references public.service_menu(id),
  appointment_start timestamptz not null,
  appointment_end timestamptz not null,
  status text not null default 'confirmed' check (status in ('draft', 'confirmed', 'cancelled', 'completed', 'no_show')),
  source text not null default 'admin' check (source in ('admin', 'phone', 'instagram', 'walk_in', 'website_lead')),
  price_cents integer,
  deposit_cents integer,
  client_notes text,
  staff_notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (appointment_end > appointment_start)
);

create table public.vouchers (
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

create table public.client_vouchers (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null references public.vouchers(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  status text not null default 'available' check (status in ('available', 'used', 'expired', 'cancelled')),
  used_booking_id uuid references public.booking_details(id),
  assigned_at timestamptz not null default now(),
  used_at timestamptz
);

create table public.gallery_albums (
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

create table public.gallery_images (
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

create table public.client_gallery (
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

create table public.salon_settings (
  id uuid primary key default gen_random_uuid(),
  salon_name text not null default 'K Beauty Salon',
  logo_url text,
  hero_image_url text,
  instagram_url text,
  phone text,
  email text,
  address text,
  updated_at timestamptz not null default now()
);

create table public.client_reviews (
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
alter table public.staff_profiles enable row level security;
alter table public.contact_info enable row level security;
alter table public.service_menu enable row level security;
alter table public.booking_details enable row level security;
alter table public.vouchers enable row level security;
alter table public.client_vouchers enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;
alter table public.client_gallery enable row level security;
alter table public.salon_settings enable row level security;
alter table public.client_reviews enable row level security;

create policy "Public can view active services"
on public.service_menu for select
using (is_active = true);

create policy "Public can view public albums"
on public.gallery_albums for select
using (is_public = true);

create policy "Public can view public album images"
on public.gallery_images for select
using (exists (
  select 1 from public.gallery_albums
  where gallery_albums.id = gallery_images.album_id
  and gallery_albums.is_public = true
));

create policy "Public can view salon settings"
on public.salon_settings for select
using (true);

create policy "Public can create leads"
on public.contact_info for insert
with check (true);

create policy "Clients can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Clients can view own bookings"
on public.booking_details for select
using (auth.uid() = client_id);

create policy "Clients can view own assigned vouchers"
on public.client_vouchers for select
using (auth.uid() = client_id);

create policy "Clients can manage own gallery"
on public.client_gallery for all
using (auth.uid() = client_id)
with check (auth.uid() = client_id);
```

## Admin And Staff Policies

Add helper functions before launch, then policies that allow `profiles.role in ('admin', 'staff')` to manage:

- `staff_profiles`
- `contact_info`
- `service_menu`
- `booking_details`
- `vouchers`
- `client_vouchers`
- `gallery_albums`
- `gallery_images`
- `client_gallery`
- `salon_settings`
- `client_reviews`

Admins should be able to manage all records. Staff can be limited later to their own bookings and assigned leads.

## Storage Buckets

Use Supabase Storage buckets:

- `public-gallery`: public album images uploaded by admin.
- `client-gallery`: private client uploads. Clients can upload their own files; staff/admin can view for service history.
- `site-assets`: logo, hero images, and website images.
