import { useEffect, useMemo, useState } from 'react';
import { Armchair, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Grid2X2, Image as ImageIcon, List, Maximize2, Scissors, Search, Share2, Sparkles, X } from 'lucide-react';
import { ContactBand } from '../components/layout/ContactBand';
import { Header } from '../components/layout/Header';
import type { GalleryAlbum, GalleryImage, SiteSettings } from '../types';

type GalleryPhoto = GalleryImage & {
  albumId?: string;
  albumSlug?: string;
  albumTitle: string;
  globalIndex: number;
};

const albumIconMap = [
  { match: 'hair', icon: <Scissors size={18} /> },
  { match: 'nail', icon: <Sparkles size={18} /> },
  { match: 'make', icon: <ImageIcon size={18} /> },
  { match: 'salon', icon: <Armchair size={18} /> },
  { match: 'event', icon: <CalendarDays size={18} /> },
];

function getAlbumIcon(title: string) {
  const key = title.toLowerCase();
  return albumIconMap.find((item) => key.includes(item.match))?.icon ?? <ImageIcon size={18} />;
}

export function GalleryPage({
  albums,
  currentUserFullName,
  galleryLoadState,
  initialAlbumSlug,
  isSignedIn,
  onAccountClick,
  onLogout,
  onServicesClick,
  settings,
}: {
  albums: GalleryAlbum[];
  currentUserFullName?: string;
  galleryLoadState: 'loading' | 'ready' | 'error';
  initialAlbumSlug?: string;
  isSignedIn: boolean;
  onAccountClick: () => void;
  onLogout: () => void;
  onServicesClick: () => void;
  settings: SiteSettings;
}) {
  const [selectedAlbumSlug, setSelectedAlbumSlug] = useState(initialAlbumSlug ?? 'all');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [galleryView, setGalleryView] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(12);

  const photos = useMemo<GalleryPhoto[]>(() => albums.flatMap((album) =>
    album.photos.map((photo) => ({
      ...photo,
      albumId: album.id,
      albumSlug: album.slug,
      albumTitle: album.title,
      globalIndex: 0,
    })),
  ).map((photo, index) => ({ ...photo, globalIndex: index })), [albums]);

  const filteredPhotos = selectedAlbumSlug === 'all'
    ? photos
    : photos.filter((photo) => photo.albumSlug === selectedAlbumSlug || photo.albumId === selectedAlbumSlug || photo.albumTitle === selectedAlbumSlug);
  const displayedPhotos = filteredPhotos.slice(0, visibleCount);

  const activePhoto = activePhotoIndex === null ? null : photos[activePhotoIndex];
  const visibleAlbums = albums.filter((album) => album.photos.length);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedAlbumSlug]);

  function openPhoto(photo: GalleryPhoto) {
    setActivePhotoIndex(photo.globalIndex);
  }

  function movePhoto(direction: -1 | 1) {
    if (activePhotoIndex === null || !photos.length) return;
    setActivePhotoIndex((activePhotoIndex + direction + photos.length) % photos.length);
  }

  async function sharePhoto() {
    if (!activePhoto) return;
    if (navigator.share) {
      await navigator.share({ title: activePhoto.title, url: activePhoto.url });
      return;
    }
    await navigator.clipboard.writeText(activePhoto.url);
  }

  return (
    <>
      <Header
        activeItem="Gallery"
        currentUserFullName={currentUserFullName}
        isSignedIn={isSignedIn}
        logoUrl={settings.logoUrl}
        onAccountClick={onAccountClick}
        onGalleryClick={() => setSelectedAlbumSlug('all')}
        onLogout={onLogout}
        onServicesClick={onServicesClick}
      />
      <main className="public-gallery-page">
        <section className="public-gallery-hero">
          <p>Home &gt; Gallery</p>
          <h1>Our Gallery</h1>
          <span>Explore our work and see the beauty, care, and creativity we bring to every service.</span>
        </section>

        <section className="public-gallery-layout">
          <aside className="public-gallery-sidebar">
            <button className={selectedAlbumSlug === 'all' ? 'active' : ''} type="button" onClick={() => setSelectedAlbumSlug('all')}>
              <span><Grid2X2 size={17} /> All Photos</span>
              <small>{photos.length}</small>
            </button>
            {visibleAlbums.map((album) => {
              const albumKey = album.slug ?? album.id ?? album.title;
              return (
                <button className={selectedAlbumSlug === albumKey ? 'active' : ''} key={albumKey} type="button" onClick={() => setSelectedAlbumSlug(albumKey)}>
                  <span>{getAlbumIcon(album.title)} {album.title}</span>
                  <small>{album.photos.length}</small>
                </button>
              );
            })}
          </aside>

          <div className="public-gallery-content">
            <div className="gallery-filter-row">
              <div className="gallery-filter-pills">
                <button className={selectedAlbumSlug === 'all' ? 'active' : ''} type="button" onClick={() => setSelectedAlbumSlug('all')}>All</button>
                {visibleAlbums.slice(0, 6).map((album) => {
                  const albumKey = album.slug ?? album.id ?? album.title;
                  return (
                    <button className={selectedAlbumSlug === albumKey ? 'active' : ''} key={albumKey} type="button" onClick={() => setSelectedAlbumSlug(albumKey)}>
                      {album.title}
                    </button>
                  );
                })}
              </div>
              <div className="gallery-view-actions">
                <button className={galleryView === 'grid' ? 'active' : ''} type="button" onClick={() => setGalleryView('grid')} aria-label="Grid view"><Grid2X2 size={17} /></button>
                <button className={galleryView === 'list' ? 'active' : ''} type="button" onClick={() => setGalleryView('list')} aria-label="List view"><List size={18} /></button>
              </div>
            </div>

            {galleryLoadState === 'loading' ? (
              <div className={galleryView === 'list' ? 'public-gallery-grid list-view' : 'public-gallery-grid'}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div className="gallery-photo-skeleton" key={`gallery-skeleton-${index}`}>
                    <span />
                    <strong />
                    <small />
                  </div>
                ))}
              </div>
            ) : filteredPhotos.length ? (
              <div className={galleryView === 'list' ? 'public-gallery-grid list-view' : 'public-gallery-grid'}>
                {displayedPhotos.map((photo) => (
                  <button key={`${photo.albumTitle}-${photo.url}`} type="button" onClick={() => openPhoto(photo)}>
                    <img src={photo.url} alt={photo.alt} loading="lazy" />
                    {galleryView === 'list' ? (
                      <span>
                        <strong>{photo.title}</strong>
                        <small>{photo.albumTitle}</small>
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-admin-state gallery-empty-state">
                <Search size={24} />
                <strong>No gallery photos yet</strong>
                <span>Add images in Admin &gt; Manage Gallery, then save the album.</span>
              </div>
            )}

            {filteredPhotos.length > visibleCount ? (
              <button className="gallery-load-more" type="button" onClick={() => setVisibleCount((count) => count + 12)}>
                Load More
                <ChevronDown size={15} />
              </button>
            ) : null}
          </div>
        </section>
      </main>

      {activePhoto ? (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${activePhoto.title} preview`}>
          <button className="lightbox-side previous" type="button" onClick={() => movePhoto(-1)} aria-label="Previous image">
            <ChevronLeft size={26} />
          </button>
          <div className="lightbox-panel">
            <div className="lightbox-topbar">
              <strong>{activePhoto.globalIndex + 1} / {photos.length}</strong>
              <span>{activePhoto.albumTitle}</span>
              <div>
                <button type="button" aria-label="Zoom image"><Search size={21} /></button>
                <button type="button" aria-label="View fullscreen"><Maximize2 size={20} /></button>
                <button type="button" onClick={sharePhoto} aria-label="Share image"><Share2 size={20} /></button>
                <button type="button" onClick={() => setActivePhotoIndex(null)} aria-label="Close image preview"><X size={25} /></button>
              </div>
            </div>
            <img className="lightbox-image" src={activePhoto.url} alt={activePhoto.alt} />
            <div className="lightbox-thumbnails">
              {photos.slice(0, 10).map((photo) => (
                <button className={photo.globalIndex === activePhoto.globalIndex ? 'active' : ''} key={`${photo.albumTitle}-${photo.url}`} type="button" onClick={() => openPhoto(photo)}>
                  <img src={photo.url} alt="" />
                </button>
              ))}
            </div>
          </div>
          <button className="lightbox-side next" type="button" onClick={() => movePhoto(1)} aria-label="Next image">
            <ChevronRight size={26} />
          </button>
        </div>
      ) : null}

      <ContactBand settings={settings} />
    </>
  );
}
