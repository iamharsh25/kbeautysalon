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
  services: Service[];
  settings: SiteSettings;
  onAlbumOpen: (album: GalleryAlbum) => void;
  onAccountClick: () => void;
  onLoginClick: () => void;
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
  onLoginClick,
  onLogout,
  onServicesClick,
  serviceCategories,
  services,
  settings,
}: HomePageProps) {
  return (
    <>
      <Header
        currentUserFullName={currentUserFullName}
        isSignedIn={isSignedIn}
        logoUrl={settings.logoUrl}
        onAccountClick={onAccountClick}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onServicesClick={onServicesClick}
      />
      <main>
        <Hero images={homePageImages} onGalleryClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })} onServicesClick={onServicesClick} />
        <ServicesPreview serviceCategories={serviceCategories} services={services} onViewAll={onServicesClick} />
        <FounderStory instagramUrl={settings.instagramUrl} />
        <GalleryPreview albums={albums} onAlbumOpen={onAlbumOpen} />
      </main>
      <ContactBand settings={settings} />
    </>
  );
}
