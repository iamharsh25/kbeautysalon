import { Instagram } from 'lucide-react';

export function FounderStory({ instagramUrl }: { instagramUrl: string }) {
  return (
    <section className="story-section" id="about-us">
      <div className="story-copy">
        <p className="section-eyebrow">About Us</p>
        <h2>Simple care, beautifully done</h2>
        <span className="heading-rule" />
        <p>
          At K Beauty Salon, we believe beauty is more than just a look - it's a feeling. Our mission
          is to help you look and feel your best with services that are tailored to you.
        </p>
        <p>
          From the moment you walk in, you'll experience warmth, relaxation, and exceptional care.
        </p>
        <a className="primary-button story-button" href={instagramUrl} target="_blank" rel="noreferrer">
          <Instagram size={18} />
          Visit our Instagram
        </a>
      </div>
      <div className="story-visual">
        <img src="/homepage/salon_1.jpg" alt="" loading="lazy" />
      </div>
    </section>
  );
}
