import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { HomePageImage } from '../../types';

export function Hero({ images, onBookClick }: { images: HomePageImage[]; onBookClick: () => void }) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImage((currentImage) => (currentImage + 1) % images.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    if (activeImage >= images.length) {
      setActiveImage(0);
    }
  }, [activeImage, images.length]);

  return (
    <section className="hero" id="home">
      <div className="hero-carousel" aria-label="Salon image carousel">
        {images.map((image, index) => (
          <div
            className={activeImage === index ? 'hero-slide active' : 'hero-slide'}
            key={image.id}
            role="img"
            aria-label={image.title}
            style={{ backgroundImage: `linear-gradient(rgba(35, 51, 45, 0.4), rgba(35, 51, 45, 0.48)), url("${image.url}")` }}
          />
        ))}
      </div>
      <div className="hero-overlay">
        <p>Beauty Studio</p>
        <h1>K Beauty Salon</h1>
        <span>Hair . Beauty . Nails</span>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={onBookClick}>
            Book Appointment
            <ArrowRight size={18} />
          </button>
          <a className="secondary-link" href="#services">Services</a>
        </div>
        <div className="hero-dots" aria-label="Carousel slide controls">
          {images.map((image, index) => (
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
