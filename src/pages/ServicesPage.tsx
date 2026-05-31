import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Grid2X2, Headphones, Heart, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { Header } from '../components/layout/Header';
import type { Service, ServiceCategory, SiteSettings } from '../types';
import { getServiceCategoryGroups } from '../utils/serviceCatalog';

function serviceSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function ServicesPage({
  currentUserFullName,
  isSignedIn,
  onAccountClick,
  onGalleryClick,
  onLogout,
  serviceCategories,
  serviceLoadState,
  services,
  settings,
}: {
  currentUserFullName?: string;
  isSignedIn: boolean;
  onAccountClick: () => void;
  onGalleryClick: () => void;
  onLogout: () => void;
  serviceCategories: ServiceCategory[];
  serviceLoadState: 'loading' | 'ready' | 'error';
  services: Service[];
  settings: SiteSettings;
}) {
  const serviceGroups = getServiceCategoryGroups(services, serviceCategories);
  const firstCategoryId = serviceGroups[0] ? serviceSlug(serviceGroups[0].name) : '';
  const [activeCategoryId, setActiveCategoryId] = useState(firstCategoryId);
  const [activeSubCategoryId, setActiveSubCategoryId] = useState('');

  const categoryIds = useMemo(() => serviceGroups.map((group) => serviceSlug(group.name)), [serviceGroups]);

  useEffect(() => {
    if (!activeCategoryId && firstCategoryId) {
      setActiveCategoryId(firstCategoryId);
      return;
    }

    if (activeCategoryId && !categoryIds.includes(activeCategoryId)) {
      setActiveCategoryId(firstCategoryId);
      setActiveSubCategoryId('');
    }
  }, [activeCategoryId, categoryIds, firstCategoryId]);

  function handleFilterSelect(categoryId: string, subCategoryId = '') {
    setActiveCategoryId(categoryId);
    setActiveSubCategoryId(subCategoryId);

    window.requestAnimationFrame(() => {
      const target = document.getElementById(subCategoryId || categoryId);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <>
      <Header
        activeItem="Services"
        currentUserFullName={currentUserFullName}
        isSignedIn={isSignedIn}
        logoUrl={settings.logoUrl}
        onAccountClick={onAccountClick}
        onGalleryClick={onGalleryClick}
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
          {serviceLoadState === 'loading' ? (
            <div className="services-loading-panel">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="service-page-skeleton" key={`services-page-skeleton-${index}`}>
                  <span />
                  <strong />
                  <p />
                </div>
              ))}
            </div>
          ) : serviceLoadState === 'error' ? (
            <div className="services-error-panel">
              <strong>Services could not load</strong>
              <span>Please refresh the page or try again shortly.</span>
            </div>
          ) : (
            <>
              <aside className="services-sidebar">
            <button
              className={!activeSubCategoryId && activeCategoryId === firstCategoryId ? 'services-all-filter active' : 'services-all-filter'}
              type="button"
              onClick={() => handleFilterSelect(firstCategoryId)}
            >
              <Grid2X2 size={17} />
              All Categories
            </button>
            {serviceGroups.map((group) => (
              <div className={activeCategoryId === serviceSlug(group.name) ? 'services-filter-group active' : 'services-filter-group'} key={group.name}>
                <button
                  className="services-filter-category"
                  type="button"
                  onClick={() => handleFilterSelect(serviceSlug(group.name))}
                >
                  <span><group.icon size={17} /> {group.name}</span>
                  <ChevronDown size={16} />
                </button>
                {group.subCategories.map((subCategory) => (
                  <button
                    className={activeSubCategoryId === `${serviceSlug(group.name)}-${serviceSlug(subCategory.name)}` ? 'active' : ''}
                    key={`${group.name}-${subCategory.name}`}
                    type="button"
                    onClick={() => handleFilterSelect(serviceSlug(group.name), `${serviceSlug(group.name)}-${serviceSlug(subCategory.name)}`)}
                  >
                    {subCategory.name}
                  </button>
                ))}
              </div>
            ))}
            <div className="services-book-card">
              <h2>Need help choosing?</h2>
              <p>Explore each category and sub category, then contact the salon for the best recommendation.</p>
              <Headphones size={28} />
            </div>
              </aside>

              <div className="services-list-panel">
            {serviceGroups.map((group) => (
              <article
                className={activeCategoryId === serviceSlug(group.name) ? 'service-list-category active' : 'service-list-category'}
                id={serviceSlug(group.name)}
                key={group.name}
              >
                <div>
                  <header>
                    <h2><span><group.icon size={24} /></span> {group.name}</h2>
                    <button type="button" aria-label={`Collapse ${group.name}`}>
                      <ChevronDown size={18} />
                    </button>
                  </header>
                  <div>
                    {group.subCategories.map((subCategory) => (
                      <div
                        className={activeSubCategoryId === `${serviceSlug(group.name)}-${serviceSlug(subCategory.name)}` ? 'service-subcategory-group active' : 'service-subcategory-group'}
                        id={`${serviceSlug(group.name)}-${serviceSlug(subCategory.name)}`}
                        key={`${group.name}-${subCategory.name}`}
                      >
                        <h3>{subCategory.name}</h3>
                        {subCategory.services.length ? (
                          <div className="service-subcategory-items">
                            {subCategory.services.map((service) => (
                              <div className="service-list-row" key={`${service.id ?? service.title}-${service.subCategory ?? ''}`}>
                                <strong>{service.title}</strong>
                                <span>{service.price}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No services added yet.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
