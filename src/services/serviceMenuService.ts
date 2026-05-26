import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Service } from '../types';
import { sanitizeStorageFileName } from '../utils/homepageImages';

type ServiceMenuRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  sub_category?: string | null;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  service_type?: 'fixed' | 'range' | 'contact' | null;
  min_price_cents?: number | null;
  max_price_cents?: number | null;
};

const SERVICE_COLUMNS = 'id,name,slug,category,sub_category,description,duration_minutes,price_cents,image_url,is_active,display_order,service_type,min_price_cents,max_price_cents';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `service-${crypto.randomUUID()}`;
}

function formatServicePrice(service: Pick<Service, 'serviceType' | 'fixedPrice' | 'minPrice' | 'maxPrice' | 'price'>) {
  if (service.serviceType === 'Contact for Price') return 'Contact Us';
  if (service.serviceType === 'Price Range') {
    const minPrice = service.minPrice ?? 0;
    const maxPrice = service.maxPrice ?? minPrice;
    return `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`;
  }
  if (typeof service.fixedPrice === 'number') return `₹${service.fixedPrice.toLocaleString('en-IN')}`;
  return service.price;
}

function mapService(row: ServiceMenuRow): Service {
  const fixedPrice = Math.round(row.price_cents / 100);
  const minPrice = Math.round((row.min_price_cents ?? row.price_cents) / 100);
  const maxPrice = Math.round((row.max_price_cents ?? row.price_cents) / 100);
  const serviceType = row.service_type === 'contact' ? 'Contact for Price' : row.service_type === 'range' ? 'Price Range' : 'Fixed Price';
  return {
    id: row.id,
    title: row.name,
    description: row.description ?? '',
    price: formatServicePrice({ serviceType, fixedPrice, minPrice, maxPrice, price: '' }),
    image: row.image_url || '/homepage/salon.jpg',
    category: row.category,
    subCategory: row.sub_category || '',
    serviceType,
    fixedPrice,
    minPrice,
    maxPrice,
    isActive: row.is_active,
    displayOrder: row.display_order,
  };
}

function toPayload(service: Service) {
  const serviceType = service.serviceType ?? 'Fixed Price';
  const parsedPrice = Number(service.price.replace(/[^0-9]/g, '')) || 0;
  const fixedPrice = serviceType === 'Contact for Price'
    ? 0
    : serviceType === 'Price Range'
      ? service.minPrice ?? 0
      : service.fixedPrice ?? parsedPrice;

  return {
    name: service.title,
    slug: slugify([service.title, service.category, service.subCategory].filter(Boolean).join('-')),
    category: service.category || 'Hair Style',
    sub_category: service.subCategory || null,
    description: service.description,
    duration_minutes: 60,
    price_cents: Math.round(fixedPrice * 100),
    service_type: serviceType === 'Contact for Price' ? 'contact' : serviceType === 'Price Range' ? 'range' : 'fixed',
    min_price_cents: serviceType === 'Price Range' ? Math.round((service.minPrice ?? 0) * 100) : Math.round(fixedPrice * 100),
    max_price_cents: serviceType === 'Price Range' ? Math.round((service.maxPrice ?? service.minPrice ?? 0) * 100) : Math.round(fixedPrice * 100),
    image_url: service.image,
    is_active: service.isActive ?? true,
    display_order: service.displayOrder ?? 0,
    updated_at: new Date().toISOString(),
  };
}

export async function uploadServiceImage(file: File) {
  if (!isSupabaseConfigured || !supabase) return URL.createObjectURL(file);

  const storagePath = `services/${Date.now()}-${crypto.randomUUID()}-${sanitizeStorageFileName(file.name) || 'service'}`;
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

export function normalizeService(service: Service, fallbackOrder = 0): Service {
  const serviceType = service.serviceType ?? (service.price.toLowerCase().includes('contact') ? 'Contact for Price' : 'Fixed Price');
  const parsedPrice = Number(service.price.replace(/[^0-9]/g, '')) || 0;
  const fixedPrice = service.fixedPrice ?? parsedPrice;
  const normalizedService = {
    ...service,
    category: service.category || 'Hair Style',
    subCategory: service.subCategory || '',
    serviceType,
    fixedPrice,
    minPrice: service.minPrice ?? fixedPrice,
    maxPrice: service.maxPrice ?? fixedPrice,
    isActive: service.isActive ?? true,
    displayOrder: service.displayOrder ?? fallbackOrder,
  };

  return {
    ...normalizedService,
    price: formatServicePrice(normalizedService),
  };
}

export async function getServiceMenu() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('service_menu')
    .select(SERVICE_COLUMNS)
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ServiceMenuRow[]).map(mapService);
}

export async function createServiceMenuItem(service: Service) {
  if (!isSupabaseConfigured || !supabase) return normalizeService(service);

  const payload = toPayload(service);
  const { data, error } = await supabase
    .from('service_menu')
    .insert(payload)
    .select(SERVICE_COLUMNS)
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Service could not be created.');
  return {
    ...normalizeService(service),
    ...mapService(data as ServiceMenuRow),
    price: formatServicePrice(service),
    serviceType: service.serviceType,
    fixedPrice: service.fixedPrice,
    minPrice: service.minPrice,
    maxPrice: service.maxPrice,
  };
}

export async function updateServiceMenuItem(service: Service) {
  if (!isSupabaseConfigured || !supabase || !service.id) return normalizeService(service);

  const { error } = await supabase
    .from('service_menu')
    .update(toPayload(service))
    .eq('id', service.id);

  if (error) throw new Error(error.message);
  return normalizeService(service);
}

export async function deleteServiceMenuItem(service: Service) {
  if (!isSupabaseConfigured || !supabase || !service.id) return;

  const { error } = await supabase
    .from('service_menu')
    .delete()
    .eq('id', service.id);

  if (error) throw new Error(error.message);
}
