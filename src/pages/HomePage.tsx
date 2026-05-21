import { ContactBand } from '../components/layout/ContactBand';
import { Header } from '../components/layout/Header';
import { LoginModal } from '../components/layout/LoginModal';
import { FounderStory } from '../components/home/FounderStory';
import { GalleryPreview } from '../components/home/GalleryPreview';
import { Hero } from '../components/home/Hero';
import { ServicesPreview } from '../components/home/ServicesPreview';
import type { GalleryAlbum, HomePageImage, Service, SiteSettings } from '../types';

type HomePageProps = {
  albums: GalleryAlbum[];
  homePageImages: HomePageImage[];
  isLoginOpen: boolean;
  loginError: string;
  services: Service[];
  settings: SiteSettings;
  onAlbumOpen: (album: GalleryAlbum) => void;
  onBookClick: () => void;
  onCloseLogin: () => void;
  onLogin: (email: string, password: string) => void | Promise<void>;
  onLoginClick: () => void;
};

export function HomePage({
  albums,
  homePageImages,
  isLoginOpen,
  loginError,
  onAlbumOpen,
  onBookClick,
  onCloseLogin,
  onLogin,
  onLoginClick,
  services,
  settings,
}: HomePageProps) {
  return (
    <>
      <Header onBookClick={onBookClick} onLoginClick={onLoginClick} />
      <main>
        <Hero images={homePageImages} onBookClick={onBookClick} />
        <ServicesPreview services={services} />
        <FounderStory />
        <GalleryPreview albums={albums} instagramUrl={settings.instagramUrl} onAlbumOpen={onAlbumOpen} />
      </main>
      <ContactBand settings={settings} />
      {isLoginOpen ? (
        <LoginModal error={loginError} onClose={onCloseLogin} onLogin={onLogin} />
      ) : null}
    </>
  );
}
