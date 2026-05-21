alter table public.service_menu
add column if not exists service_type text not null default 'fixed' check (service_type in ('fixed', 'range', 'contact')),
add column if not exists min_price_cents integer,
add column if not exists max_price_cents integer;
