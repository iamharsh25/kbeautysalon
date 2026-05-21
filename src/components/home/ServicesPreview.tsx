import type { Service } from '../../types';
import { SectionHeading } from './SectionHeading';
import { ServiceCard } from './ServiceCard';

export function ServicesPreview({ services }: { services: Service[] }) {
  return (
    <section className="section" id="services">
      <SectionHeading eyebrow="What We Do" title="Simple care, beautifully done" />
      <div className="service-grid">
        {services.map((service) => (
          <ServiceCard key={service.title} service={service} />
        ))}
      </div>
    </section>
  );
}
