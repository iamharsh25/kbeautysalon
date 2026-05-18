import { FormEvent, ReactNode, useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Gift,
  Home,
  Image,
  Instagram,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserRound,
} from 'lucide-react';

type Service = {
  title: string;
  description: string;
  price: string;
  image: string;
};

type GalleryImage = {
  title: string;
  alt: string;
  url: string;
};

type Booking = {
  client: string;
  service: string;
  time: string;
  status: string;
};

type Lead = {
  name: string;
  email: string;
  message: string;
  status: string;
};

type Review = {
  name: string;
  rating: number;
  quote: string;
  isVisible: boolean;
};

type Voucher = {
  code: string;
  description: string;
  value: string;
  status: string;
};

type SiteSettings = {
  heroImage: string;
  instagramUrl: string;
  phone: string;
  email: string;
  address: string;
};

type AdminSection =
  | 'home-page'
  | 'new-leads'
  | 'bookings'
  | 'gallery'
  | 'website-details'
  | 'services'
  | 'reviews'
  | 'vouchers';

const navItems = ['Home', 'About Us', 'Services', 'Gallery', 'Contact Us'];

const initialServices: Service[] = [
  {
    title: 'Hair Styling',
    description: 'Cuts, blow waves, colour refreshes, and soft styling for everyday confidence.',
    price: 'From $45',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Beauty Treatments',
    description: 'Brows, lashes, facials, and skin-focused appointments in a relaxed setting.',
    price: 'From $35',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Nails',
    description: 'Clean manicures, gel polish, and detail-led nail care for polished hands.',
    price: 'From $30',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80',
  },
];

const initialGalleryImages: GalleryImage[] = [
  {
    title: 'Colour appointment',
    alt: 'Salon colour appointment',
    url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Fresh styling',
    alt: 'Fresh styled blonde hair',
    url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Nail care',
    alt: 'Nail polish treatment',
    url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Salon products',
    alt: 'Salon product shelf',
    url: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=700&q=80',
  },
];

const initialBookings: Booking[] = [
  { client: 'Priya Shah', service: 'Hair Styling', time: 'Tomorrow, 10:30 AM', status: 'Confirmed' },
  { client: 'Emma Wilson', service: 'Nails', time: 'Friday, 2:00 PM', status: 'Pending' },
  { client: 'Mia Chen', service: 'Beauty Treatments', time: 'Saturday, 11:00 AM', status: 'Confirmed' },
];

const initialLeads: Lead[] = [
  {
    name: 'Aisha Patel',
    email: 'aisha@example.com',
    message: 'I want to ask about bridal hair and makeup packages.',
    status: 'New',
  },
  {
    name: 'Sophie Martin',
    email: 'sophie@example.com',
    message: 'Can I book gel nails and brows together?',
    status: 'Read',
  },
];

const initialReviews: Review[] = [
  {
    name: 'Nina',
    rating: 5,
    quote: 'The salon feels calm and personal. My hair looked exactly how I wanted.',
    isVisible: true,
  },
  {
    name: 'Grace',
    rating: 5,
    quote: 'Beautiful nails, kind service, and a really easy booking experience.',
    isVisible: true,
  },
];

const initialVouchers: Voucher[] = [
  { code: 'WELCOME10', description: 'Introductory discount for new clients', value: '10%', status: 'Active' },
  { code: 'GIFT50', description: 'Gift voucher credit', value: '$50', status: 'Draft' },
];

const initialSettings: SiteSettings = {
  heroImage: '/homepage/salon.jpg',
  instagramUrl: 'https://www.instagram.com/',
  phone: '04XX XXX XXX',
  email: 'hello@kbeautysalon.com',
  address: 'Your salon address will go here once confirmed.',
};

function Header({ onLoginClick }: { onLoginClick: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="KBeauty Salon home">
        <span className="brand-mark">KB</span>
        <span>KBeauty Salon</span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`}>
            {item}
          </a>
        ))}
        <a href="#booking">Book Now</a>
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
          {[...navItems, 'Book Now'].map((item) => (
            <a
              key={item}
              href={item === 'Book Now' ? '#booking' : `#${item.toLowerCase().replaceAll(' ', '-')}`}
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

function Hero({ heroImage }: { heroImage: string }) {
  const carouselImages = [
    heroImage,
    '/homepage/salon_1.jpg',
    '/homepage/salon_2.jpg',
    '/homepage/salon_3.jpg',
  ];
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImage((currentImage) => (currentImage + 1) % carouselImages.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [carouselImages.length]);

  return (
    <section className="hero" id="home">
      <div className="hero-carousel" aria-label="Salon image carousel">
        {carouselImages.map((image, index) => (
          <div
            className={activeImage === index ? 'hero-slide active' : 'hero-slide'}
            key={image}
            role="img"
            aria-label="A calm salon appointment in progress"
            style={{ backgroundImage: `linear-gradient(rgba(35, 51, 45, 0.4), rgba(35, 51, 45, 0.48)), url("${image}")` }}
          />
        ))}
      </div>
      <div className="hero-overlay">
        <p>Beauty Studio</p>
        <h1>KBeauty Salon</h1>
        <span>Hair . Beauty . Nails</span>
        <div className="hero-actions">
          <a className="primary-button" href="#booking">
            Book Appointment
            <ArrowRight size={18} />
          </a>
          <a className="secondary-link" href="#services">Services</a>
        </div>
        <div className="hero-dots" aria-label="Carousel slide controls">
          {carouselImages.map((image, index) => (
            <button
              aria-label={`Show slide ${index + 1}`}
              className={activeImage === index ? 'active' : ''}
              key={`${image}-dot`}
              type="button"
              onClick={() => setActiveImage(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="section-heading">
      {eyebrow ? <p>{eyebrow}</p> : null}
      <h2>{title}</h2>
      {text ? <span>{text}</span> : null}
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card">
      <img src={service.image} alt="" loading="lazy" />
      <div>
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <span>{service.price}</span>
      </div>
    </article>
  );
}

function ServicesPreview({ services }: { services: Service[] }) {
  return (
    <section className="section" id="services">
      <SectionHeading eyebrow="What We Do" title="Simple care, beautifully done" />
      <div className="service-grid">
        {services.map((service) => (
          <ServiceCard key={service.title} service={service} />
        ))}
      </div>
    </section>
  );
}

function FounderStory() {
  return (
    <section className="story-section" id="about-us">
      <div className="story-copy">
        <SectionHeading eyebrow="Founder Story" title="Built from care, skill, and family" />
        <p>
          KBeauty Salon began with a simple promise: every client should feel listened to before a
          service begins and genuinely cared for after they leave. The founder grew up around women
          who made beauty feel practical, warm, and personal, and that feeling became the heart of
          the salon.
        </p>
        <p>
          What started as helping friends and family prepare for special days has grown into a calm,
          welcoming studio for hair, beauty, and nail services. The salon is modern in technique but
          personal in spirit, designed for clients who want honest advice, tidy results, and a place
          they can trust.
        </p>
      </div>
      <div className="belief-panel">
        <Sparkles size={28} />
        <h3>What We Believe</h3>
        <p>Beauty feels best when it is thoughtful, comfortable, and made for real life.</p>
      </div>
    </section>
  );
}

function BookingPreview() {
  return (
    <section className="booking-section" id="booking">
      <div>
        <SectionHeading eyebrow="Book Online" title="Ready for mobile-first booking" />
        <p>
          The booking page will let clients choose a service, pick a date and time, log in or sign
          up, and manage upcoming appointments from their phone.
        </p>
        <div className="trust-row">
          <span><ShieldCheck size={18} /> Secure login</span>
          <span><Clock size={18} /> Time slots</span>
          <span><UserRound size={18} /> Client profile</span>
        </div>
      </div>
      <form className="booking-card" aria-label="Booking preview form">
        <label>
          Service
          <select defaultValue="Hair Styling">
            <option>Hair Styling</option>
            <option>Beauty Treatments</option>
            <option>Nails</option>
          </select>
        </label>
        <label>
          Preferred date
          <input type="date" />
        </label>
        <label>
          Preferred time
          <input type="time" />
        </label>
        <button type="button" className="primary-button full-width">
          <CalendarDays size={18} />
          Start Booking
        </button>
      </form>
    </section>
  );
}

function ReviewsPreview({ reviews }: { reviews: Review[] }) {
  const visibleReviews = reviews.filter((review) => review.isVisible);

  return (
    <section className="section reviews-section">
      <SectionHeading eyebrow="Client Reviews" title="Kind words from our clients" />
      <div className="review-grid">
        {visibleReviews.map((review) => (
          <article className="review-card" key={review.name}>
            <div className="star-row" aria-label={`${review.rating} star review`}>
              {Array.from({ length: review.rating }).map((_, index) => (
                <Star key={`${review.name}-${index}`} size={17} fill="currentColor" />
              ))}
            </div>
            <p>{review.quote}</p>
            <span>{review.name}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function GalleryPreview({ galleryImages, instagramUrl }: { galleryImages: GalleryImage[]; instagramUrl: string }) {
  return (
    <section className="section gallery-section" id="gallery">
      <SectionHeading eyebrow="Come On Our Journey" title="@kbeautysalon" />
      <div className="gallery-grid">
        {galleryImages.map((image) => (
          <img key={image.alt} src={image.url} alt={image.alt} loading="lazy" />
        ))}
      </div>
      <a className="outline-button" href={instagramUrl} target="_blank" rel="noreferrer">View Instagram</a>
    </section>
  );
}

function ContactBand({ settings }: { settings: SiteSettings }) {
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

export function App() {
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [services, setServices] = useState(initialServices);
  const [galleryImages, setGalleryImages] = useState(initialGalleryImages);
  const [bookings, setBookings] = useState(initialBookings);
  const [leads, setLeads] = useState(initialLeads);
  const [reviews, setReviews] = useState(initialReviews);
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [settings, setSettings] = useState(initialSettings);

  function handleLogin(email: string, password: string) {
    if (email.toLowerCase() === 'admin@kbeautysalon.com' && password === 'preview123') {
      setView('admin');
      setIsLoginOpen(false);
      setLoginError('');
      return;
    }

    setView('public');
    setIsLoginOpen(false);
    setLoginError('');
  }

  if (view === 'admin') {
    return (
      <AdminDashboard
        bookings={bookings}
        galleryImages={galleryImages}
        leads={leads}
        reviews={reviews}
        services={services}
        settings={settings}
        vouchers={vouchers}
        onBookingChange={setBookings}
        onGalleryChange={setGalleryImages}
        onLeadChange={setLeads}
        onLogout={() => setView('public')}
        onReviewChange={setReviews}
        onServiceChange={setServices}
        onSettingsChange={setSettings}
        onVoucherChange={setVouchers}
      />
    );
  }

  return (
    <>
      <Header onLoginClick={() => setIsLoginOpen(true)} />
      <main>
        <Hero heroImage={settings.heroImage} />
        <ServicesPreview services={services} />
        <FounderStory />
        <BookingPreview />
        <ReviewsPreview reviews={reviews} />
        <GalleryPreview galleryImages={galleryImages} instagramUrl={settings.instagramUrl} />
      </main>
      <ContactBand settings={settings} />
      {isLoginOpen ? (
        <LoginModal
          error={loginError}
          onClose={() => {
            setIsLoginOpen(false);
            setLoginError('');
          }}
          onLogin={handleLogin}
        />
      ) : null}
    </>
  );
}

function LoginModal({
  error,
  onClose,
  onLogin,
}: {
  error: string;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onLogin(String(formData.get('email')), String(formData.get('password')));
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="login-modal" onSubmit={handleSubmit} aria-label="Login form">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close login modal">
          ×
        </button>
        <LayoutDashboard size={34} />
        <p>Login</p>
        <h2>Welcome back</h2>
        <label>
          Email
          <input name="email" defaultValue="admin@kbeautysalon.com" type="email" />
        </label>
        <label>
          Password
          <input name="password" defaultValue="preview123" type="password" />
        </label>
        {error ? <span className="login-error">{error}</span> : null}
        <button className="primary-button full-width" type="submit">
          Login
        </button>
        <span>Preview admin: admin@kbeautysalon.com / preview123</span>
      </form>
    </div>
  );
}

function AdminDashboard({
  bookings,
  galleryImages,
  leads,
  reviews,
  services,
  settings,
  vouchers,
  onBookingChange,
  onGalleryChange,
  onLeadChange,
  onLogout,
  onReviewChange,
  onServiceChange,
  onSettingsChange,
  onVoucherChange,
}: {
  bookings: Booking[];
  galleryImages: GalleryImage[];
  leads: Lead[];
  reviews: Review[];
  services: Service[];
  settings: SiteSettings;
  vouchers: Voucher[];
  onBookingChange: (bookings: Booking[]) => void;
  onGalleryChange: (galleryImages: GalleryImage[]) => void;
  onLeadChange: (leads: Lead[]) => void;
  onLogout: () => void;
  onReviewChange: (reviews: Review[]) => void;
  onServiceChange: (services: Service[]) => void;
  onSettingsChange: (settings: SiteSettings) => void;
  onVoucherChange: (vouchers: Voucher[]) => void;
}) {
  const [activeSection, setActiveSection] = useState<AdminSection>('home-page');
  const activeLabel = adminMenuItems.find((item) => item.id === activeSection)?.label ?? 'Admin';

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="brand-mark">KB</span>
          <div>
            <strong>KBeauty Salon</strong>
            <span>Admin Panel</span>
          </div>
        </div>
        <nav aria-label="Admin navigation">
          {adminMenuItems.map((item) => (
            <button
              className={activeSection === item.id ? 'active' : ''}
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <button className="admin-logout-button" type="button" onClick={onLogout}>
          View Website
        </button>
      </aside>

      <section className="admin-content">
        <div className="admin-topbar">
          <div>
            <p>Client Admin</p>
            <h1>{activeLabel}</h1>
          </div>
          <button className="outline-admin-button" type="button" onClick={onLogout}>
            Log out
          </button>
        </div>

        {activeSection === 'home-page' ? (
          <div className="admin-grid single">
            <AdminPanel icon={<Home size={20} />} title="Home page">
              <AdminField label="Hero image URL">
                <input
                  value={settings.heroImage}
                  onChange={(event) => onSettingsChange({ ...settings, heroImage: event.target.value })}
                />
              </AdminField>
              <img className="admin-image-preview" src={settings.heroImage} alt="Current home page preview" />
            </AdminPanel>
          </div>
        ) : null}

        {activeSection === 'new-leads' ? (
          <AdminPanel icon={<MessageSquare size={20} />} title="New leads">
            {leads.map((lead, index) => (
              <div className="admin-row admin-row-stack" key={lead.email}>
                <div>
                  <strong>{lead.name}</strong>
                  <span>{lead.email}</span>
                  <p>{lead.message}</p>
                </div>
                <select
                  value={lead.status}
                  onChange={(event) => updateListItem(leads, index, { ...lead, status: event.target.value }, onLeadChange)}
                >
                  <option>New</option>
                  <option>Read</option>
                  <option>Closed</option>
                </select>
              </div>
            ))}
          </AdminPanel>
        ) : null}

        {activeSection === 'bookings' ? (
          <AdminPanel icon={<CalendarDays size={20} />} title="Bookings">
            {bookings.map((booking, index) => (
              <div className="admin-row" key={`${booking.client}-${booking.time}`}>
                <div>
                  <strong>{booking.client}</strong>
                  <span>{booking.service} . {booking.time}</span>
                </div>
                <select
                  value={booking.status}
                  onChange={(event) => updateListItem(bookings, index, { ...booking, status: event.target.value }, onBookingChange)}
                >
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            ))}
          </AdminPanel>
        ) : null}

        {activeSection === 'gallery' ? (
          <AdminPanel icon={<Image size={20} />} title="Manage gallery">
            {galleryImages.map((image, index) => (
              <div className="admin-item" key={image.alt}>
                <AdminField label="Image title">
                  <input
                    value={image.title}
                    onChange={(event) => updateListItem(galleryImages, index, { ...image, title: event.target.value }, onGalleryChange)}
                  />
                </AdminField>
                <AdminField label="Image URL">
                  <input
                    value={image.url}
                    onChange={(event) => updateListItem(galleryImages, index, { ...image, url: event.target.value }, onGalleryChange)}
                  />
                </AdminField>
              </div>
            ))}
          </AdminPanel>
        ) : null}

        {activeSection === 'website-details' ? (
          <AdminPanel icon={<Settings size={20} />} title="Manage website details">
            <AdminField label="Phone">
              <input value={settings.phone} onChange={(event) => onSettingsChange({ ...settings, phone: event.target.value })} />
            </AdminField>
            <AdminField label="Email">
              <input value={settings.email} onChange={(event) => onSettingsChange({ ...settings, email: event.target.value })} />
            </AdminField>
            <AdminField label="Address">
              <textarea value={settings.address} onChange={(event) => onSettingsChange({ ...settings, address: event.target.value })} />
            </AdminField>
            <AdminField label="Instagram profile">
              <input
                value={settings.instagramUrl}
                onChange={(event) => onSettingsChange({ ...settings, instagramUrl: event.target.value })}
              />
            </AdminField>
          </AdminPanel>
        ) : null}

        {activeSection === 'services' ? (
          <AdminPanel icon={<Sparkles size={20} />} title="Manage services">
            <button
              className="small-admin-button"
              type="button"
              onClick={() => onServiceChange([...services, { title: 'New Service', description: 'Service description', price: 'From $0', image: settings.heroImage }])}
            >
              <Plus size={16} />
              Add Service
            </button>
            {services.map((service, index) => (
              <div className="admin-item" key={`${service.title}-${index}`}>
                <AdminField label="Service name">
                  <input
                    value={service.title}
                    onChange={(event) => updateListItem(services, index, { ...service, title: event.target.value }, onServiceChange)}
                  />
                </AdminField>
                <AdminField label="Description">
                  <textarea
                    value={service.description}
                    onChange={(event) => updateListItem(services, index, { ...service, description: event.target.value }, onServiceChange)}
                  />
                </AdminField>
                <AdminField label="Price">
                  <input
                    value={service.price}
                    onChange={(event) => updateListItem(services, index, { ...service, price: event.target.value }, onServiceChange)}
                  />
                </AdminField>
                <button className="danger-admin-button" type="button" onClick={() => onServiceChange(services.filter((_, itemIndex) => itemIndex !== index))}>
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            ))}
          </AdminPanel>
        ) : null}

        {activeSection === 'reviews' ? (
          <AdminPanel icon={<Star size={20} />} title="Client reviews">
            {reviews.map((review, index) => (
              <div className="admin-item" key={`${review.name}-${index}`}>
                <AdminField label="Client name">
                  <input
                    value={review.name}
                    onChange={(event) => updateListItem(reviews, index, { ...review, name: event.target.value }, onReviewChange)}
                  />
                </AdminField>
                <AdminField label="Review">
                  <textarea
                    value={review.quote}
                    onChange={(event) => updateListItem(reviews, index, { ...review, quote: event.target.value }, onReviewChange)}
                  />
                </AdminField>
                <label className="toggle-row">
                  <input
                    checked={review.isVisible}
                    type="checkbox"
                    onChange={(event) => updateListItem(reviews, index, { ...review, isVisible: event.target.checked }, onReviewChange)}
                  />
                  Show on website
                </label>
              </div>
            ))}
          </AdminPanel>
        ) : null}

        {activeSection === 'vouchers' ? (
          <AdminPanel icon={<Gift size={20} />} title="Voucher management">
            <button
              className="small-admin-button"
              type="button"
              onClick={() => onVoucherChange([...vouchers, { code: 'NEWCODE', description: 'New voucher', value: '10%', status: 'Draft' }])}
            >
              <Plus size={16} />
              Add Voucher
            </button>
            {vouchers.map((voucher, index) => (
              <div className="admin-row" key={`${voucher.code}-${index}`}>
                <div>
                  <strong>{voucher.code}</strong>
                  <span>{voucher.description} . {voucher.value}</span>
                </div>
                <select
                  value={voucher.status}
                  onChange={(event) => updateListItem(vouchers, index, { ...voucher, status: event.target.value }, onVoucherChange)}
                >
                  <option>Active</option>
                  <option>Draft</option>
                  <option>Expired</option>
                </select>
              </div>
            ))}
          </AdminPanel>
        ) : null}
      </section>
    </div>
  );
}

const adminMenuItems: { id: AdminSection; label: string; icon: ReactNode }[] = [
  { id: 'home-page', label: 'Home page', icon: <Home size={18} /> },
  { id: 'new-leads', label: 'New Leads', icon: <Mail size={18} /> },
  { id: 'bookings', label: 'Bookings', icon: <CalendarDays size={18} /> },
  { id: 'gallery', label: 'Manage Gallery', icon: <Image size={18} /> },
  { id: 'website-details', label: 'Manage Website Details', icon: <Settings size={18} /> },
  { id: 'services', label: 'Manage Service', icon: <Sparkles size={18} /> },
  { id: 'reviews', label: 'Client Review', icon: <Star size={18} /> },
  { id: 'vouchers', label: 'Voucher Management', icon: <Gift size={18} /> },
];

function AdminPanel({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <article className="admin-panel">
      <h3>{icon}{title}</h3>
      {children}
    </article>
  );
}

function AdminField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="admin-field">
      {label}
      {children}
    </label>
  );
}

function updateListItem<T>(items: T[], index: number, nextItem: T, onChange: (items: T[]) => void) {
  onChange(items.map((item, itemIndex) => (itemIndex === index ? nextItem : item)));
}
