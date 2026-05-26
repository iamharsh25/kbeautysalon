import type { GalleryAlbum } from '../../types';
import { ArrowRight } from 'lucide-react';

export function GalleryPreview({
  albums,
  onAlbumOpen,
}: {
  albums: GalleryAlbum[];
  onAlbumOpen: (album: GalleryAlbum) => void;
}) {
  return (
    <section className="section gallery-section" id="gallery">
      <div className="section-heading">
        <p>Our Albums</p>
        <h2>Moments That Define Beauty</h2>
        <span className="heading-rule centered" />
      </div>
      <div className="album-grid">
        {albums.map((album) => (
          <button className="album-card" key={album.title} type="button" onClick={() => onAlbumOpen(album)}>
            <img src={album.cover} alt="" loading="lazy" />
            <h3>{album.title}</h3>
            <span>{album.photos.length} Photos</span>
          </button>
        ))}
      </div>
      <a className="outline-button" href="/#gallery">
        View All Albums
        <ArrowRight size={16} />
      </a>
    </section>
  );
}
