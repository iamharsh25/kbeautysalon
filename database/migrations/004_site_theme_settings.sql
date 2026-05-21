alter table public.salon_settings
add column if not exists theme_primary_color text not null default '#2f5c50',
add column if not exists theme_accent_color text not null default '#cc9a53';

update public.salon_settings
set logo_url = coalesce(logo_url, '/homepage/logo-wo-bg.png'),
    theme_primary_color = coalesce(theme_primary_color, '#2f5c50'),
    theme_accent_color = coalesce(theme_accent_color, '#cc9a53');
