import type { Service } from '../../types';

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card">
      <img src={service.image} alt="" loading="lazy" />
      <div>
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <span>{service.price}</span>
      </div>
    </article>
  );
}
