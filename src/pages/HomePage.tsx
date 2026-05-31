import { useEffect } from 'react';
import { ContactBand } from '../components/layout/ContactBand';
import { Header } from '../components/layout/Header';
import { FounderStory } from '../components/home/FounderStory';
import { GalleryPreview } from '../components/home/GalleryPreview';
import { Hero } from '../components/home/Hero';
import { ServicesPreview } from '../components/home/ServicesPreview';
import type { GalleryAlbum, HomePageImage, Service, ServiceCategory, SiteSettings } from '../types';

type HomePageProps = {
  albums: GalleryAlbum[];
  currentUserFullName?: string;
  homePageImages: HomePageImage[];
  isSignedIn: boolean;
  serviceCategories: ServiceCategory[];
  serviceLoadState: 'loading' | 'ready' | 'error';
  services: Service[];
  settings: SiteSettings;
  onAlbumOpen: (album: GalleryAlbum) => void;
  onAccountClick: () => void;
  onLogout: () => void;
  onServicesClick: () => void;
};

export function HomePage({
  albums,
  currentUserFullName,
  homePageImages,
  isSignedIn,
  onAlbumOpen,
  onAccountClick,
  onLogout,
  onServicesClick,
  serviceCategories,
  serviceLoadState,
  services,
  settings,
}: HomePageProps) {
  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-reveal]'));
    if (!revealElements.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.18,
    });

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [serviceLoadState, serviceCategories.length, services.length, albums.length]);

  return (
    <>
      <Header
        currentUserFullName={currentUserFullName}
        isSignedIn={isSignedIn}
        logoUrl={settings.logoUrl}
        onAccountClick={onAccountClick}
        onLogout={onLogout}
        onServicesClick={onServicesClick}
      />
      <main>
        <Hero images={homePageImages} onGalleryClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })} onServicesClick={onServicesClick} />
        <ServicesPreview serviceCategories={serviceCategories} serviceLoadState={serviceLoadState} services={services} onViewAll={onServicesClick} />
        <FounderStory instagramUrl={settings.instagramUrl} />
        <GalleryPreview albums={albums} onAlbumOpen={onAlbumOpen} />
      </main>
      <ContactBand settings={settings} />
    </>
  );
}
