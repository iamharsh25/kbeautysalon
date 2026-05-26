import type { Service, ServiceCategory } from '../../types';
import { ArrowRight } from 'lucide-react';
import { getServiceCategoryGroups, getServiceCategoryVisualMeta, type ServiceCategoryGroup } from '../../utils/serviceCatalog';

export function ServicesPreview({
  onViewAll,
  serviceCategories,
  services,
}: {
  onViewAll: () => void;
  serviceCategories: ServiceCategory[];
  services: Service[];
}) {
  const groupsByName = new Map(getServiceCategoryGroups(services, serviceCategories).map((group) => [group.name, group]));
  const categoryNames = serviceCategories.length
    ? mergeCategoryNames(serviceCategories.map((category) => category.name))
    : mergeCategoryNames(Array.from(groupsByName.keys()));
  const categoryGroups = (categoryNames.length
    ? categoryNames.map((name, index) => groupsByName.get(name) ?? createCategoryPreview(name, index))
    : Array.from(groupsByName.values())
  ).slice(0, 4);

  return (
    <section className="home-service-strip" id="services" aria-label="Service categories">
      <div className="section-heading service-strip-heading">
        <p>Our Services</p>
        <h2>Premium Services, Just For You</h2>
        <span className="heading-rule centered" />
      </div>
      <div className="service-category-grid">
        {categoryGroups.map((group) => (
          <article className={`service-category-card ${group.accent}`} key={group.name}>
            <div className="service-category-icon" style={{ backgroundColor: group.backgroundColor }}>
              <group.icon size={25} />
            </div>
            <h3>{group.name}</h3>
            <p>{getCategoryDescription(group.name)}</p>
            <button type="button" onClick={onViewAll}>
              View Services
              <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function mergeCategoryNames(names: string[]) {
  const defaultNames = ['Hair Style', 'Make Up', 'Nails', 'Beauty Treatments'];
  return Array.from(new Set([...names.filter(Boolean), ...defaultNames]));
}

function createCategoryPreview(name: string, index: number): ServiceCategoryGroup {
  return {
    ...getServiceCategoryVisualMeta(name, index),
    name,
    services: [],
    subCategories: [],
  };
}

function getCategoryDescription(categoryName: string) {
  const name = categoryName.toLowerCase();
  if (name.includes('hair')) return 'Cut, color, style & treatments';
  if (name.includes('make')) return 'From everyday looks to bridal glam';
  if (name.includes('nail')) return 'Manicure, pedicure & nail art';
  if (name.includes('beauty') || name.includes('treatment')) return 'Skin, body & advanced care';
  return 'Personalized beauty care';
}
