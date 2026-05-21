import { Scissors, type LucideIcon, Palette, Sparkles, Wand2 } from 'lucide-react';
import type { Service } from '../types';

export type ServiceCategoryGroup = {
  accent: 'green' | 'gold' | 'sage';
  icon: LucideIcon;
  image: string;
  name: string;
  services: Service[];
  subCategories: Array<{
    name: string;
    services: Service[];
  }>;
};

const categoryMeta: Record<string, { accent: ServiceCategoryGroup['accent']; icon: LucideIcon; image: string }> = {
  'Hair Style': {
    accent: 'green',
    icon: Scissors,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85',
  },
  'Make Up': {
    accent: 'gold',
    icon: Palette,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=85',
  },
  Nails: {
    accent: 'sage',
    icon: Wand2,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85',
  },
  'Beauty Treatments': {
    accent: 'gold',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85',
  },
};

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

export function getServiceCategoryGroups(services: Service[]) {
  const activeServices = services
    .map(normalizeServiceForCatalog)
    .filter((service) => service.isActive)
    .sort((firstService, secondService) => (firstService.displayOrder ?? 0) - (secondService.displayOrder ?? 0));

  const categoryNames = Array.from(new Set(activeServices.map((service) => service.category || 'Other')));

  return categoryNames.map((name, index) => {
    const categoryServices = activeServices.filter((service) => service.category === name);
    const meta = categoryMeta[name] ?? {
      accent: index % 2 === 0 ? 'green' : 'gold',
      icon: Sparkles,
      image: categoryServices[0]?.image || categoryMeta['Hair Style'].image,
    };
    const subCategoryNames = Array.from(new Set(categoryServices.map((service) => service.subCategory || 'Services')));

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
