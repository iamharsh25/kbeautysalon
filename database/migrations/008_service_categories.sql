create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_sub_categories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, name)
);

alter table public.service_categories enable row level security;
alter table public.service_sub_categories enable row level security;

drop policy if exists "Public can view service categories" on public.service_categories;
create policy "Public can view service categories"
on public.service_categories for select
using (true);

drop policy if exists "Public can view service sub categories" on public.service_sub_categories;
create policy "Public can view service sub categories"
on public.service_sub_categories for select
using (true);

drop policy if exists "Staff can manage service categories" on public.service_categories;
create policy "Staff can manage service categories"
on public.service_categories for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists "Staff can manage service sub categories" on public.service_sub_categories;
create policy "Staff can manage service sub categories"
on public.service_sub_categories for all
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());
