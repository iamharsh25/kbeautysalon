import type { GalleryAlbum } from '../../types';
import { ArrowRight } from 'lucide-react';

export function GalleryPreview({
  albums,
  galleryLoadState,
  onAlbumOpen,
  onViewAll,
}: {
  albums: GalleryAlbum[];
  galleryLoadState: 'loading' | 'ready' | 'error';
  onAlbumOpen: (album: GalleryAlbum) => void;
  onViewAll: () => void;
}) {
  return (
    <section className="section gallery-section" id="gallery">
      <div className="section-heading" data-scroll-reveal>
        <p>Our Albums</p>
        <h2>Moments That Define Beauty</h2>
        <span className="heading-rule centered" />
      </div>
      <div className="album-grid">
        {galleryLoadState === 'loading' ? Array.from({ length: 4 }).map((_, index) => (
          <div className="album-card album-card-skeleton" key={`album-skeleton-${index}`} data-scroll-reveal>
            <span />
            <strong />
            <small />
          </div>
        )) : albums.map((album) => (
          <button className="album-card" key={album.id ?? album.title} type="button" onClick={() => onAlbumOpen(album)} data-scroll-reveal>
            <img src={album.cover} alt="" loading="lazy" />
            <h3>{album.title}</h3>
            <span>{album.photos.length} Photos</span>
          </button>
        ))}
      </div>
      {galleryLoadState === 'error' ? <p className="gallery-preview-status">Gallery could not load right now.</p> : null}
      <button className="outline-button" type="button" onClick={onViewAll}>
        View All Albums
        <ArrowRight size={16} />
      </button>
    </section>
  );
}
