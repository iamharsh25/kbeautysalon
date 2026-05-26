import { Heart, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { Header } from '../components/layout/Header';
import type { Service, ServiceCategory, SiteSettings } from '../types';
import { getServiceCategoryGroups } from '../utils/serviceCatalog';

export function ServicesPage({
  currentUserFullName,
  isSignedIn,
  onAccountClick,
  onBack,
  onLoginClick,
  onLogout,
  serviceCategories,
  services,
  settings,
}: {
  currentUserFullName?: string;
  isSignedIn: boolean;
  onAccountClick: () => void;
  onBack: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
  serviceCategories: ServiceCategory[];
  services: Service[];
  settings: SiteSettings;
}) {
  const serviceGroups = getServiceCategoryGroups(services, serviceCategories);

  return (
    <>
      <Header
        currentUserFullName={currentUserFullName}
        isSignedIn={isSignedIn}
        logoUrl={settings.logoUrl}
        onAccountClick={onAccountClick}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onServicesClick={() => undefined}
      />
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
              <h2>Need help choosing?</h2>
              <p>Explore each category and sub category, then contact the salon for the best recommendation.</p>
            </div>
          </aside>

          <div className="services-list-panel">
            {serviceGroups.map((group) => (
              <article className="service-list-category" id={group.name.toLowerCase().replaceAll(' ', '-')} key={group.name}>
                <img src={group.image} alt="" />
                <div>
                  <header>
                    <h2><group.icon size={24} /> {group.name}</h2>
                  </header>
                  <div>
                    {group.subCategories.map((subCategory) => (
                      <div className="service-subcategory-group" key={`${group.name}-${subCategory.name}`}>
                        <h3>{subCategory.name}</h3>
                        {subCategory.services.length ? subCategory.services.map((service) => (
                          <div className="service-list-row" key={`${service.id ?? service.title}-${service.subCategory ?? ''}`}>
                            <strong>{service.title}</strong>
                            <span>{service.price}</span>
                          </div>
                        )) : (
                          <p>No services added yet.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <button className="services-back-button" type="button" onClick={onBack}>Back to Home</button>
      </main>
    </>
  );
}
