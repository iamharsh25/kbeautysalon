import { useState } from 'react';
import { LogOut, Menu, UserRound } from 'lucide-react';
import { navItems } from '../../data/initialData';

export function Header({
  activeItem = 'Home',
  currentUserFullName,
  isSignedIn,
  logoUrl,
  onAccountClick,
  onGalleryClick,
  onLogout,
  onServicesClick,
}: {
  activeItem?: string;
  currentUserFullName?: string;
  isSignedIn: boolean;
  logoUrl: string;
  onAccountClick: () => void;
  onGalleryClick?: () => void;
  onLogout: () => void;
  onServicesClick?: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  function getSectionHref(item: string) {
    return `/#${item.toLowerCase().replaceAll(' ', '-')}`;
  }

  return (
    <header className="site-header">
      <a className="brand" href="/#home" aria-label="K Beauty Salon home">
        <img className="brand-logo" src={logoUrl} alt="" />
        <span>
          <strong>K Beauty Salon</strong>
        </span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          item === 'Services' && onServicesClick ? (
            <button className={activeItem === item ? 'active' : ''} key={item} type="button" onClick={onServicesClick}>{item}</button>
          ) : item === 'Gallery' && onGalleryClick ? (
            <button className={activeItem === item ? 'active' : ''} key={item} type="button" onClick={onGalleryClick}>{item}</button>
          ) : (
            <a className={activeItem === item ? 'active' : ''} key={item} href={getSectionHref(item)}>
              {item}
            </a>
          )
        ))}
        {isSignedIn ? (
          <div className="public-account-menu">
            <button className="public-account-button" type="button" onClick={() => setIsAccountOpen((isOpen) => !isOpen)}>
              <UserRound size={18} />
              {currentUserFullName || 'Account'}
            </button>
            {isAccountOpen ? (
              <div className="public-account-dropdown">
                <button type="button" onClick={onAccountClick}>
                  <UserRound size={16} />
                  Account
                </button>
                <button type="button" onClick={onLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
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
            ) : item === 'Gallery' && onGalleryClick ? (
              <button
                className="mobile-nav-link"
                key={item}
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onGalleryClick();
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
          {isSignedIn ? (
            <>
              <button
                className="mobile-login-button"
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onAccountClick();
                }}
              >
                Account
              </button>
              <button
                className="mobile-login-button"
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
