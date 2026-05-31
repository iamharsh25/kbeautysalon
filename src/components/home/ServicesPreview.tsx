import type { Service, ServiceCategory } from '../../types';
import { ArrowRight } from 'lucide-react';
import { getServiceCategoryGroups } from '../../utils/serviceCatalog';

export function ServicesPreview({
  onViewAll,
  serviceCategories,
  serviceLoadState,
  services,
}: {
  onViewAll: () => void;
  serviceCategories: ServiceCategory[];
  serviceLoadState: 'loading' | 'ready' | 'error';
  services: Service[];
}) {
  const categoryGroups = getServiceCategoryGroups(services, serviceCategories)
    .filter((group) => group.name.trim() && (group.services.length > 0 || group.subCategories.length > 0))
    .slice(0, 4);

  if (serviceLoadState === 'loading') {
    return (
      <section className="home-service-strip" id="services" aria-label="Service categories" data-scroll-reveal>
        <div className="section-heading service-strip-heading">
          <p>Our Services</p>
          <h2>Premium Services, Just For You</h2>
          <span className="heading-rule centered" />
        </div>
        <div className="service-category-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <article className="service-category-card skeleton-service-card" key={`service-skeleton-${index}`} data-scroll-reveal>
              <span />
              <strong />
              <p />
              <small />
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (serviceLoadState === 'error') {
    return (
      <section className="home-service-strip" id="services" aria-label="Service categories" data-scroll-reveal>
        <div className="service-load-message">
          <strong>Services could not load</strong>
          <span>Please refresh the page or try again shortly.</span>
        </div>
      </section>
    );
  }

  if (!categoryGroups.length) return null;

  return (
    <section className="home-service-strip" id="services" aria-label="Service categories" data-scroll-reveal>
      <div className="section-heading service-strip-heading">
        <p>Our Services</p>
        <h2>Premium Services, Just For You</h2>
        <span className="heading-rule centered" />
      </div>
      <div className="service-category-grid">
        {categoryGroups.map((group) => (
          <article className={`service-category-card ${group.accent}`} key={group.name} data-scroll-reveal>
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

function getCategoryDescription(categoryName: string) {
  const name = categoryName.toLowerCase();
  if (name.includes('hair')) return 'Cut, color, style & treatments';
  if (name.includes('make')) return 'From everyday looks to bridal glam';
  if (name.includes('nail')) return 'Manicure, pedicure & nail art';
  if (name.includes('beauty') || name.includes('treatment')) return 'Skin, body & advanced care';
  return 'Personalized beauty care';
}
