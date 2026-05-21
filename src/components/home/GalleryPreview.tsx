import type { GalleryAlbum } from '../../types';
import { SectionHeading } from './SectionHeading';

export function GalleryPreview({
  albums,
  instagramUrl,
  onAlbumOpen,
}: {
  albums: GalleryAlbum[];
  instagramUrl: string;
  onAlbumOpen: (album: GalleryAlbum) => void;
}) {
  return (
    <section className="section gallery-section" id="gallery">
      <SectionHeading eyebrow="Come On Our Journey" title="@kbeautyglamsalon" />
      <div className="album-grid">
        {albums.map((album) => (
          <button className="album-card" key={album.title} type="button" onClick={() => onAlbumOpen(album)}>
            <img src={album.cover} alt="" loading="lazy" />
            <span>{album.photos.length} photos</span>
            <h3>{album.title}</h3>
            <p>{album.description}</p>
            <strong>Open Album</strong>
          </button>
        ))}
      </div>
      <a className="outline-button" href={instagramUrl} target="_blank" rel="noreferrer">View Instagram</a>
    </section>
  );
}
