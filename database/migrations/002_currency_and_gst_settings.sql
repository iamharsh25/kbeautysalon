alter table public.salon_settings
add column if not exists currency_code text not null default 'INR';

alter table public.salon_settings
add column if not exists gst_percent numeric(5,2) not null default 18.00;

update public.salon_settings
set currency_code = coalesce(nullif(currency_code, ''), 'INR'),
    gst_percent = coalesce(gst_percent, 18.00);
