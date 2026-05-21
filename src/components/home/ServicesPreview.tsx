import type { Service } from '../../types';
import { SectionHeading } from './SectionHeading';
import { ArrowRight } from 'lucide-react';
import { getServiceCategoryGroups } from '../../utils/serviceCatalog';

export function ServicesPreview({ onViewAll, services }: { onViewAll: () => void; services: Service[] }) {
  const categoryGroups = getServiceCategoryGroups(services).slice(0, 4);

  return (
    <section className="section" id="services">
      <SectionHeading eyebrow="What We Do" title="Simple care, beautifully done" />
      <div className="service-category-grid">
        {categoryGroups.map((group) => (
          <article className={`service-category-card ${group.accent}`} key={group.name}>
            <header>
              <group.icon size={25} />
              <h3>{group.name}</h3>
            </header>
            <img src={group.image} alt="" loading="lazy" />
            <div className="service-category-list">
              {group.subCategories.slice(0, 2).map((subCategory) => (
                <div key={`${group.name}-${subCategory.name}`}>
                  {subCategory.name !== 'Services' ? <h4>{subCategory.name}</h4> : null}
                  {subCategory.services.slice(0, 4).map((service) => (
                    <div className="service-price-row" key={service.title}>
                      <span>
                        <strong>{service.title}</strong>
                        {service.serviceType === 'Price Range' ? <small>Price Range</small> : null}
                      </span>
                      <b>{service.price}</b>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button type="button" onClick={onViewAll}>
              View All {group.name} Services
              <ArrowRight size={18} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
