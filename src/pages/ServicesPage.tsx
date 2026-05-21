import { ArrowRight, CalendarDays, CheckCircle2, Heart, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { Header } from '../components/layout/Header';
import type { Service, SiteSettings } from '../types';
import { getServiceCategoryGroups } from '../utils/serviceCatalog';

export function ServicesPage({
  onBack,
  onBookClick,
  onLoginClick,
  services,
  settings,
}: {
  onBack: () => void;
  onBookClick: () => void;
  onLoginClick: () => void;
  services: Service[];
  settings: SiteSettings;
}) {
  const serviceGroups = getServiceCategoryGroups(services);

  return (
    <>
      <Header logoUrl={settings.logoUrl} onBookClick={onBookClick} onLoginClick={onLoginClick} onServicesClick={() => undefined} />
      <main className="services-page">
        <section className="services-hero">
          <div>
            <span>Home / Services</span>
            <h1>All Services</h1>
            <p>Explore our complete range of premium salon services designed to bring out your best look.</p>
          </div>
          <img src="/homepage/salon_1.jpg" alt="" />
        </section>

        <section className="service-benefit-row" aria-label="Service benefits">
          <span><Sparkles size={24} /> Premium Products <small>We use quality, skin-friendly products.</small></span>
          <span><UserCheck size={24} /> Expert Professionals <small>Certified experts for each service.</small></span>
          <span><ShieldCheck size={24} /> Hygiene & Safety <small>Clean, sanitized, safe environment.</small></span>
          <span><Heart size={24} /> Personalized Care <small>Services tailored to your needs.</small></span>
        </section>

        <section className="services-browser">
          <aside className="services-sidebar">
            <strong>All Categories</strong>
            {serviceGroups.map((group) => (
              <div key={group.name}>
                <b>{group.name}</b>
                {group.subCategories.map((subCategory) => (
                  <a href={`#${group.name.toLowerCase().replaceAll(' ', '-')}`} key={`${group.name}-${subCategory.name}`}>
                    {subCategory.name}
                  </a>
                ))}
              </div>
            ))}
            <div className="services-book-card">
              <h2>Ready for a Makeover?</h2>
              <p>Book your appointment today and let our experts bring out the best in you.</p>
              <button type="button" onClick={onBookClick}>
                <CalendarDays size={17} />
                Book Appointment
              </button>
            </div>
          </aside>

          <div className="services-list-panel">
            {serviceGroups.map((group) => (
              <article className="service-list-category" id={group.name.toLowerCase().replaceAll(' ', '-')} key={group.name}>
                <img src={group.image} alt="" />
                <div>
                  <header>
                    <h2><group.icon size={24} /> {group.name}</h2>
                    <button type="button" onClick={onBookClick}>View All <ArrowRight size={16} /></button>
                  </header>
                  <div>
                    {group.services.slice(0, 8).map((service) => (
                      <div className="service-list-row" key={service.title}>
                        <strong>{service.title}</strong>
                        <span>{service.price}</span>
                        <button type="button" onClick={onBookClick}>Book</button>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="services-cta">
          <div>
            <CheckCircle2 size={36} />
            <span>
              <strong>Let's Pamper You!</strong>
              <small>Book your appointment today and experience the best care.</small>
            </span>
          </div>
          <button type="button" onClick={onBookClick}>Book Appointment <ArrowRight size={18} /></button>
        </section>

        <button className="services-back-button" type="button" onClick={onBack}>Back to Home</button>
      </main>
    </>
  );
}
