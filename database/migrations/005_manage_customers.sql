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

alter table public.booking_details
add column if not exists customer_id uuid references public.customers(id),
add column if not exists amount_paid_cents integer,
add column if not exists payment_method text check (payment_method in ('cash', 'card', 'upi')),
add column if not exists discount_cents integer not null default 0 check (discount_cents >= 0),
add column if not exists client_voucher_id uuid;

alter table public.booking_details
alter column client_id drop not null;

alter table public.client_vouchers
add column if not exists customer_id uuid references public.customers(id) on delete cascade,
add column if not exists starts_at timestamptz,
add column if not exists expires_at timestamptz;

alter table public.client_vouchers
alter column client_id drop not null;

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

alter table public.customers enable row level security;
alter table public.customer_memberships enable row level security;

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
