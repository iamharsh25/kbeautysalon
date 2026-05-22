import { useState } from 'react';
import { Menu } from 'lucide-react';
import { navItems } from '../../data/initialData';

export function Header({
  logoUrl,
  onBookClick,
  onLoginClick,
  onServicesClick,
}: {
  logoUrl: string;
  onBookClick: () => void;
  onLoginClick: () => void;
  onServicesClick?: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function getSectionHref(item: string) {
    return `/#${item.toLowerCase().replaceAll(' ', '-')}`;
  }

  return (
    <header className="site-header">
      <a className="brand" href="/#home" aria-label="K Beauty Salon home">
        <img className="brand-logo" src={logoUrl} alt="" />
        <span>K Beauty Salon</span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          item === 'Services' && onServicesClick ? (
            <button key={item} type="button" onClick={onServicesClick}>{item}</button>
          ) : (
            <a key={item} href={getSectionHref(item)}>
              {item}
            </a>
          )
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
            item === 'Services' && onServicesClick ? (
              <button
                className="mobile-nav-link"
                key={item}
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onServicesClick();
                }}
              >
                {item}
              </button>
            ) : (
              <a
                key={item}
                href={getSectionHref(item)}
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            )
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
