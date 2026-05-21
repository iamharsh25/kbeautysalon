import { useState } from 'react';
import { Menu } from 'lucide-react';
import { navItems } from '../../data/initialData';

export function Header({ onBookClick, onLoginClick }: { onBookClick: () => void; onLoginClick: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="K Beauty Salon home">
        <img className="brand-logo" src="/homepage/logo-wo-bg.png" alt="" />
        <span>K Beauty Salon</span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`}>
            {item}
          </a>
        ))}
        <button className="nav-login-button" type="button" onClick={onBookClick}>Book Now</button>
        <button className="nav-login-button" type="button" onClick={onLoginClick}>Login</button>
      </nav>

      <button
        className="icon-button mobile-menu"
        type="button"
        aria-expanded={isMenuOpen}
        aria-label="Open navigation menu"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <Menu size={22} />
      </button>

      {isMenuOpen ? (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <button
            className="mobile-login-button"
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              onBookClick();
            }}
          >
            Book Now
          </button>
          <button
            className="mobile-login-button"
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              onLoginClick();
            }}
          >
            Login
          </button>
        </nav>
      ) : null}
    </header>
  );
}
