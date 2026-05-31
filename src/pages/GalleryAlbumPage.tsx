import { Image } from 'lucide-react';
import type { GalleryAlbum } from '../types';

export function GalleryAlbumPage({
  album,
  albums,
  onBack,
  onAlbumChange,
}: {
  album: GalleryAlbum;
  albums: GalleryAlbum[];
  onBack: () => void;
  onAlbumChange: (album: GalleryAlbum) => void;
}) {
  const headingImages = album.headingImageUrls?.length
    ? album.headingImageUrls.map((url) => album.photos.find((photo) => photo.url === url) ?? { title: album.title, alt: album.title, url })
    : album.photos.slice(0, 3);

  return (
    <main className="album-page">
      <section className="album-hero">
        <div>
          <button className="back-button" type="button" onClick={onBack}>
            ← Back to Home
          </button>
          <p>Gallery</p>
          <h1>{album.title}</h1>
          <span>{album.description}</span>
        </div>
        <div className="album-hero-stack" aria-hidden="true">
          {headingImages.slice(0, 3).map((photo) => (
            <img key={photo.url} src={photo.url} alt="" />
          ))}
        </div>
      </section>

      <section className="album-browser">
        <aside className="album-sidebar">
          <img src={album.cover} alt="" />
          <h2>{album.title}</h2>
          <p>{album.photos.length} photos</p>
          <nav aria-label="Gallery albums">
            {albums.map((item) => (
              <button
                className={(item.id && album.id ? item.id === album.id : item.title === album.title) ? 'active' : ''}
                key={item.id ?? item.title}
                type="button"
                onClick={() => onAlbumChange(item)}
              >
                <Image size={17} />
                {item.title}
              </button>
            ))}
          </nav>
        </aside>
        <div className="album-photo-area">
          <div className="album-toolbar">
            <h2>All Photos</h2>
            <div>
              <button type="button">All</button>
              <button type="button">Images</button>
            </div>
          </div>
          <div className="album-photo-grid">
            {album.photos.map((photo) => (
              <img key={photo.url} src={photo.url} alt={photo.alt} loading="lazy" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
