import { Instagram } from 'lucide-react';
import type { SiteSettings } from '../../types';

export function ContactBand({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="contact-band" id="contact-us">
      <div>
        <h2>Contact us</h2>
        <p>Phone: {settings.phone}</p>
        <p>Email: {settings.email}</p>
      </div>
      <div>
        <h2>Where we are</h2>
        <p>{settings.address}</p>
      </div>
      <a className="instagram-link" href={settings.instagramUrl} target="_blank" rel="noreferrer">
        <Instagram size={20} />
        Instagram
      </a>
    </footer>
  );
}
