alter table public.service_categories
add column if not exists image_url text,
add column if not exists icon_key text,
add column if not exists background_color text;
