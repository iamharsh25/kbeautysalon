# Database Design

Recommended backend: Supabase. It gives you a free Postgres database, Auth, Storage, and security rules.

## Main tables

### users

Use Supabase Auth for email/password or magic-link login. Store public profile data in `profiles`.

### profiles

Stores customer profile details linked to Supabase Auth.

- `id uuid primary key references auth.users(id)`
- `full_name text`
- `phone text`
- `role text` with values `customer`, `staff`, `admin`
- `created_at timestamptz`

### contact_info

Stores messages sent from the Contact Us form.

- `id uuid primary key`
- `name text`
- `email text`
- `phone text`
- `subject text`
- `message text`
- `status text` with values `new`, `read`, `closed`
- `created_at timestamptz`

### service_menu

Stores salon services and prices.

- `id uuid primary key`
- `name text`
- `slug text unique`
- `category text`
- `description text`
- `duration_minutes integer`
- `price_cents integer`
- `is_active boolean`
- `display_order integer`
- `created_at timestamptz`

### booking_details

Stores appointments.

- `id uuid primary key`
- `customer_id uuid references profiles(id)`
- `service_id uuid references service_menu(id)`
- `appointment_start timestamptz`
- `appointment_end timestamptz`
- `status text` with values `pending`, `confirmed`, `cancelled`, `completed`, `no_show`
- `customer_notes text`
- `admin_notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

### vouchers

Stores gift vouchers or discount codes.

- `id uuid primary key`
- `code text unique`
- `description text`
- `discount_type text` with values `fixed`, `percentage`
- `discount_value integer`
- `expires_at timestamptz`
- `max_uses integer`
- `used_count integer`
- `is_active boolean`
- `created_at timestamptz`

### image_gallery

Stores gallery metadata. Actual files should live in Supabase Storage.

- `id uuid primary key`
- `title text`
- `alt_text text`
- `image_url text`
- `category text`
- `is_featured boolean`
- `display_order integer`
- `created_at timestamptz`

### salon_settings

Stores editable website settings controlled by the salon admin.

- `id uuid primary key`
- `salon_name text`
- `hero_image_url text`
- `instagram_url text`
- `phone text`
- `email text`
- `address text`
- `updated_at timestamptz`

### client_reviews

Stores public testimonials that admins can approve, hide, or edit.

- `id uuid primary key`
- `client_name text`
- `rating integer`
- `review_text text`
- `is_visible boolean`
- `display_order integer`
- `created_at timestamptz`

## Security plan

- Enable Row Level Security on every public table.
- Customers can read active services, salon settings, approved reviews, and featured gallery images.
- Customers can create contact messages.
- Customers can create bookings for their own user account.
- Customers can view, update, or cancel only their own bookings.
- Admin/staff users can manage services, gallery images, vouchers, all bookings, leads, reviews, and salon settings.
- Never store passwords yourself. Supabase Auth stores and protects credentials.
- Never put service-role keys in React. The website should only use the public anon key.

## Starter SQL

```sql
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

create table public.contact_info (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'closed')),
  created_at timestamptz not null default now()
);

create table public.service_menu (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.booking_details (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.service_menu(id),
  appointment_start timestamptz not null,
  appointment_end timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  customer_notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (appointment_end > appointment_start)
);

create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('fixed', 'percentage')),
  discount_value integer not null check (discount_value > 0),
  expires_at timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.image_gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  alt_text text not null,
  image_url text not null,
  category text,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.salon_settings (
  id uuid primary key default gen_random_uuid(),
  salon_name text not null default 'KBeauty Salon',
  hero_image_url text,
  instagram_url text,
  phone text,
  email text,
  address text,
  updated_at timestamptz not null default now()
);

create table public.client_reviews (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  review_text text not null,
  is_visible boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.contact_info enable row level security;
alter table public.service_menu enable row level security;
alter table public.booking_details enable row level security;
alter table public.vouchers enable row level security;
alter table public.image_gallery enable row level security;
alter table public.salon_settings enable row level security;
alter table public.client_reviews enable row level security;

create policy "Anyone can view active services"
on public.service_menu for select
using (is_active = true);

create policy "Anyone can view featured gallery images"
on public.image_gallery for select
using (is_featured = true);

create policy "Anyone can view salon settings"
on public.salon_settings for select
using (true);

create policy "Anyone can view visible client reviews"
on public.client_reviews for select
using (is_visible = true);

create policy "Anyone can create contact messages"
on public.contact_info for insert
with check (true);

create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Users can create own bookings"
on public.booking_details for insert
with check (auth.uid() = customer_id);

create policy "Users can view own bookings"
on public.booking_details for select
using (auth.uid() = customer_id);

create policy "Users can update own bookings"
on public.booking_details for update
using (auth.uid() = customer_id);
```

## Admin dashboard permissions

The dashboard must only be available to users whose `profiles.role` is `admin` or `staff`.

Admin/staff should be allowed to:

- update `salon_settings`
- create, update, and hide rows in `service_menu`
- view and update all rows in `booking_details`
- view and update all rows in `contact_info`
- create, update, and hide rows in `image_gallery`
- create, update, and hide rows in `client_reviews`
- create and update rows in `vouchers`

These admin policies should be added when Supabase is connected, because they depend on the real auth user IDs.
