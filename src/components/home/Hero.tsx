import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { HomePageImage } from '../../types';

export function Hero({
  images,
  onGalleryClick,
  onServicesClick,
}: {
  images: HomePageImage[];
  onGalleryClick: () => void;
  onServicesClick: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const heroImages = images.length ? images : [{ id: 'fallback-hero', title: 'Salon interior', url: '/homepage/salon_1.jpg', displayOrder: 0 }];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImage((currentImage) => (currentImage + 1) % heroImages.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    if (activeImage >= heroImages.length) {
      setActiveImage(0);
    }
  }, [activeImage, heroImages.length]);

  return (
    <section className="hero" id="home">
      <div className="hero-carousel" aria-label="Salon image carousel">
        {heroImages.map((image, index) => (
          <div
            className={activeImage === index ? 'hero-slide active' : 'hero-slide'}
            key={image.id}
            role="img"
            aria-label={image.title}
            style={{ backgroundImage: `linear-gradient(90deg, rgba(3, 38, 30, 0.94) 0%, rgba(3, 38, 30, 0.72) 38%, rgba(3, 38, 30, 0.14) 72%), url("${image.url}")` }}
          />
        ))}
      </div>
      <div className="hero-overlay">
        <p>Beauty Studio</p>
        <h1>Enhancing Beauty. Elevating <em>You.</em></h1>
        <span>Experience premium hair, beauty & nail services crafted with care and perfection.</span>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={onServicesClick}>
            Explore Our Services
            <ArrowRight size={18} />
          </button>
          <button className="secondary-link" type="button" onClick={onGalleryClick}>
            View Gallery
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="hero-dots" aria-label="Carousel slide controls">
          {heroImages.map((image, index) => (
            <button
              aria-label={`Show slide ${index + 1}`}
              className={activeImage === index ? 'active' : ''}
              key={`${image.id}-dot`}
              type="button"
              onClick={() => setActiveImage(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
