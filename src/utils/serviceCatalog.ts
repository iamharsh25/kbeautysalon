import { Flower2, Hand, Scissors, type LucideIcon, Paintbrush, Palette, Sparkles, SprayCan, Wand2 } from 'lucide-react';
import type { Service, ServiceCategory } from '../types';

export type ServiceCategoryGroup = {
  accent: 'green' | 'gold' | 'sage';
  backgroundColor?: string;
  icon: LucideIcon;
  iconKey: string;
  image: string;
  name: string;
  services: Service[];
  subCategories: Array<{
    name: string;
    services: Service[];
  }>;
};

export const serviceCategoryIcons: Record<string, { icon: LucideIcon; label: string }> = {
  scissors: { icon: Scissors, label: 'Scissors' },
  makeup: { icon: Palette, label: 'Makeup Palette' },
  nails: { icon: Wand2, label: 'Nail Wand' },
  lotus: { icon: Flower2, label: 'Lotus' },
  brush: { icon: Paintbrush, label: 'Brush' },
  spa: { icon: Sparkles, label: 'Sparkles' },
  spray: { icon: SprayCan, label: 'Spray' },
  hand: { icon: Hand, label: 'Hand Care' },
};

const categoryMeta: Record<string, { accent: ServiceCategoryGroup['accent']; iconKey: string; image: string; backgroundColor: string }> = {
  'Hair Style': {
    accent: 'green',
    iconKey: 'scissors',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85',
    backgroundColor: '#0b4b3a',
  },
  'Make Up': {
    accent: 'gold',
    iconKey: 'makeup',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=85',
    backgroundColor: '#e6b99f',
  },
  Nails: {
    accent: 'sage',
    iconKey: 'nails',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85',
    backgroundColor: '#a7b99b',
  },
  'Beauty Treatments': {
    accent: 'gold',
    iconKey: 'lotus',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85',
    backgroundColor: '#dca04a',
  },
};

export function getServiceCategoryVisualMeta(name: string, index = 0, category?: ServiceCategory) {
  const meta = categoryMeta[name] ?? {
    accent: index % 2 === 0 ? 'green' : 'gold',
    iconKey: 'spa',
    image: categoryMeta['Hair Style'].image,
    backgroundColor: index % 2 === 0 ? '#0b4b3a' : '#dca04a',
  };

  const iconKey = category?.iconKey || meta.iconKey;
  return {
    ...meta,
    backgroundColor: category?.backgroundColor || meta.backgroundColor,
    icon: serviceCategoryIcons[iconKey]?.icon ?? Sparkles,
    iconKey,
    image: category?.imageUrl || meta.image,
  };
}

function normalizeServiceForCatalog(service: Service, index: number): Service {
  const category = service.category || 'Other';
  return {
    ...service,
    category,
    subCategory: service.subCategory || 'Services',
    isActive: service.isActive ?? true,
    displayOrder: service.displayOrder ?? index,
  };
}

export function getServiceCategoryGroups(services: Service[], categories: ServiceCategory[] = []) {
  const categoriesByName = new Map(categories.map((category) => [category.name, category]));
  const activeServices = services
    .map(normalizeServiceForCatalog)
    .filter((service) => service.isActive)
    .sort((firstService, secondService) => (firstService.displayOrder ?? 0) - (secondService.displayOrder ?? 0));

  const categoryNames = Array.from(new Set([
    ...categories.map((category) => category.name),
    ...activeServices.map((service) => service.category || 'Other'),
  ]));

  return categoryNames.map((name, index) => {
    const categoryServices = activeServices.filter((service) => service.category === name);
    const category = categoriesByName.get(name);
    const meta = { ...getServiceCategoryVisualMeta(name, index, category), image: category?.imageUrl || categoryServices[0]?.image || getServiceCategoryVisualMeta(name, index).image };
    const subCategoryNames = Array.from(new Set([
      ...(category?.subCategories.map((subCategory) => subCategory.name) ?? []),
      ...categoryServices.map((service) => service.subCategory || 'Services'),
    ]));

    return {
      ...meta,
      name,
      services: categoryServices,
      subCategories: subCategoryNames.map((subCategoryName) => ({
        name: subCategoryName,
        services: categoryServices.filter((service) => (service.subCategory || 'Services') === subCategoryName),
      })),
    };
  });
}
