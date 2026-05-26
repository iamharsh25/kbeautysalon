import { Instagram } from 'lucide-react';
import type { SiteSettings } from '../../types';

export function ContactBand({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="contact-band" id="contact-us">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="brand footer-logo">
            <img className="brand-logo" src={settings.logoUrl} alt="" />
            <span>
              <strong>K Beauty Salon</strong>
            </span>
          </div>
          <p>We're passionate about making you look and feel beautiful every day.</p>
          <div className="footer-socials">
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
          </div>
        </div>
        <nav aria-label="Footer quick links">
          <h2>Quick Links</h2>
          <a href="/#home">Home</a>
          <a href="/#about-us">About Us</a>
          <a href="/services">Services</a>
          <a href="/#gallery">Gallery</a>
        </nav>
        <nav aria-label="Footer services">
          <h2>Our Services</h2>
          <a href="/services">Hair Style</a>
          <a href="/services">Make-Up</a>
          <a href="/services">Nails</a>
          <a href="/services">Beauty Treatments</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© 2026 K Beauty Salon. All Rights Reserved.</span>
        <span>Privacy Policy | Terms & Conditions</span>
      </div>
    </footer>
  );
}
