import { initialSettings } from '../data/initialData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { SiteSettings } from '../types';
import { sanitizeStorageFileName } from '../utils/homepageImages';

type SalonSettingsRow = {
  id: string;
  salon_name: string;
  logo_url: string | null;
  hero_image_url: string | null;
  instagram_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  currency_code: string | null;
  gst_percent: number | string | null;
  theme_primary_color: string | null;
  theme_accent_color: string | null;
};

const SETTINGS_COLUMNS = 'id,salon_name,logo_url,hero_image_url,instagram_url,phone,email,address,currency_code,gst_percent,theme_primary_color,theme_accent_color';

function mapSalonSettings(row: SalonSettingsRow): SiteSettings {
  return {
    heroImage: row.hero_image_url || initialSettings.heroImage,
    logoUrl: row.logo_url || initialSettings.logoUrl,
    instagramUrl: row.instagram_url || initialSettings.instagramUrl,
    phone: row.phone || initialSettings.phone,
    email: row.email || initialSettings.email,
    address: row.address || initialSettings.address,
    currencyCode: row.currency_code || initialSettings.currencyCode,
    gstPercent: Number(row.gst_percent ?? initialSettings.gstPercent),
    themePrimaryColor: row.theme_primary_color || initialSettings.themePrimaryColor,
    themeAccentColor: row.theme_accent_color || initialSettings.themeAccentColor,
  };
}

export async function getSalonSettings() {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from('salon_settings')
    .select(SETTINGS_COLUMNS)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapSalonSettings(data as SalonSettingsRow) : null;
}

export async function updateSalonSettings(settings: SiteSettings) {
  if (!isSupabaseConfigured || !supabase) return;

  const { data: existingSettings, error: existingError } = await supabase
    .from('salon_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);

  const payload = {
    logo_url: settings.logoUrl,
    hero_image_url: settings.heroImage,
    instagram_url: settings.instagramUrl,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    currency_code: settings.currencyCode,
    gst_percent: settings.gstPercent,
    theme_primary_color: settings.themePrimaryColor,
    theme_accent_color: settings.themeAccentColor,
    updated_at: new Date().toISOString(),
  };

  const query = existingSettings?.id
    ? supabase.from('salon_settings').update(payload).eq('id', existingSettings.id)
    : supabase.from('salon_settings').insert({ salon_name: 'K Beauty Salon', ...payload });

  const { error } = await query;
  if (error) throw new Error(error.message);
}

export async function uploadSalonLogo(file: File) {
  if (!isSupabaseConfigured || !supabase) {
    return URL.createObjectURL(file);
  }

  const storagePath = `logos/${Date.now()}-${crypto.randomUUID()}-${sanitizeStorageFileName(file.name) || 'logo'}`;
  const { error: uploadError } = await supabase.storage
    .from('site-assets')
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('site-assets').getPublicUrl(storagePath);
  return data.publicUrl;
}
