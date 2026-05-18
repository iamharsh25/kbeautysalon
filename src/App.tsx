import { FormEvent, ReactNode, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Image,
  Instagram,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
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

type SiteSettings = {
  heroImage: string;
  instagramUrl: string;
  phone: string;
  email: string;
  address: string;
};

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

const initialSettings: SiteSettings = {
  heroImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1500&q=85',
  instagramUrl: 'https://www.instagram.com/',
  phone: '04XX XXX XXX',
  email: 'hello@kbeautysalon.com',
  address: 'Your salon address will go here once confirmed.',
};

function Header() {
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
        <a href="#admin">Admin Login</a>
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
          {[...navItems, 'Book Now', 'Admin Login'].map((item) => (
            <a
              key={item}
              href={item === 'Book Now' ? '#booking' : item === 'Admin Login' ? '#admin' : `#${item.toLowerCase().replaceAll(' ', '-')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function Hero({ heroImage }: { heroImage: string }) {
  return (
    <section className="hero" id="home">
      <div className="hero-lines hero-lines-left" aria-hidden="true" />
      <div className="hero-lines hero-lines-right" aria-hidden="true" />
      <div className="hero-media">
        <div
          className="hero-image"
          role="img"
          aria-label="A calm salon appointment in progress"
          style={{ backgroundImage: `linear-gradient(rgba(38, 52, 47, 0.38), rgba(38, 52, 47, 0.42)), url("${heroImage}")` }}
        />
        <div className="hero-overlay">
          <p>Beauty Studio</p>
          <h1>KBeauty Salon</h1>
          <span>Hair . Beauty . Nails</span>
        </div>
      </div>
      <div className="hero-actions">
        <a className="primary-button" href="#booking">
          Book Appointment
          <ArrowRight size={18} />
        </a>
        <a className="secondary-link" href="#services">View Services</a>
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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [services, setServices] = useState(initialServices);
  const [galleryImages, setGalleryImages] = useState(initialGalleryImages);
  const [bookings, setBookings] = useState(initialBookings);
  const [leads, setLeads] = useState(initialLeads);
  const [reviews, setReviews] = useState(initialReviews);
  const [settings, setSettings] = useState(initialSettings);

  return (
    <>
      <Header />
      <main>
        <Hero heroImage={settings.heroImage} />
        <ServicesPreview services={services} />
        <FounderStory />
        <BookingPreview />
        <ReviewsPreview reviews={reviews} />
        <GalleryPreview galleryImages={galleryImages} instagramUrl={settings.instagramUrl} />
        <AdminPortal
          bookings={bookings}
          galleryImages={galleryImages}
          isLoggedIn={isAdminLoggedIn}
          leads={leads}
          reviews={reviews}
          services={services}
          settings={settings}
          onBookingChange={setBookings}
          onGalleryChange={setGalleryImages}
          onLeadChange={setLeads}
          onLogin={() => setIsAdminLoggedIn(true)}
          onLogout={() => setIsAdminLoggedIn(false)}
          onReviewChange={setReviews}
          onServiceChange={setServices}
          onSettingsChange={setSettings}
        />
      </main>
      <ContactBand settings={settings} />
    </>
  );
}

function AdminPortal({
  bookings,
  galleryImages,
  isLoggedIn,
  leads,
  reviews,
  services,
  settings,
  onBookingChange,
  onGalleryChange,
  onLeadChange,
  onLogin,
  onLogout,
  onReviewChange,
  onServiceChange,
  onSettingsChange,
}: {
  bookings: Booking[];
  galleryImages: GalleryImage[];
  isLoggedIn: boolean;
  leads: Lead[];
  reviews: Review[];
  services: Service[];
  settings: SiteSettings;
  onBookingChange: (bookings: Booking[]) => void;
  onGalleryChange: (galleryImages: GalleryImage[]) => void;
  onLeadChange: (leads: Lead[]) => void;
  onLogin: () => void;
  onLogout: () => void;
  onReviewChange: (reviews: Review[]) => void;
  onServiceChange: (services: Service[]) => void;
  onSettingsChange: (settings: SiteSettings) => void;
}) {
  if (!isLoggedIn) {
    return <AdminLogin onLogin={onLogin} />;
  }

  return (
    <section className="admin-shell" id="admin">
      <div className="admin-header">
        <div>
          <p>Client Admin</p>
          <h2>Salon content dashboard</h2>
        </div>
        <button className="outline-admin-button" type="button" onClick={onLogout}>
          Log out
        </button>
      </div>

      <div className="admin-stats">
        <AdminStat icon={<CalendarDays size={20} />} label="Bookings" value={bookings.length.toString()} />
        <AdminStat icon={<Mail size={20} />} label="Leads" value={leads.length.toString()} />
        <AdminStat icon={<Star size={20} />} label="Reviews" value={reviews.length.toString()} />
        <AdminStat icon={<Image size={20} />} label="Gallery" value={galleryImages.length.toString()} />
      </div>

      <div className="admin-grid">
        <AdminPanel icon={<Image size={20} />} title="Home page photo">
          <AdminField label="Hero image URL">
            <input
              value={settings.heroImage}
              onChange={(event) => onSettingsChange({ ...settings, heroImage: event.target.value })}
            />
          </AdminField>
          <img className="admin-image-preview" src={settings.heroImage} alt="Current home page preview" />
        </AdminPanel>

        <AdminPanel icon={<Phone size={20} />} title="Salon contact details">
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

        <AdminPanel icon={<Sparkles size={20} />} title="Edit services">
          {services.map((service, index) => (
            <div className="admin-item" key={service.title}>
              <AdminField label="Service name">
                <input
                  value={service.title}
                  onChange={(event) => updateListItem(services, index, { ...service, title: event.target.value }, onServiceChange)}
                />
              </AdminField>
              <AdminField label="Price">
                <input
                  value={service.price}
                  onChange={(event) => updateListItem(services, index, { ...service, price: event.target.value }, onServiceChange)}
                />
              </AdminField>
            </div>
          ))}
        </AdminPanel>

        <AdminPanel icon={<CalendarDays size={20} />} title="Manage bookings">
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

        <AdminPanel icon={<MessageSquare size={20} />} title="Leads">
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

        <AdminPanel icon={<Image size={20} />} title="Manage gallery">
          {galleryImages.slice(0, 3).map((image, index) => (
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

        <AdminPanel icon={<Star size={20} />} title="Client reviews">
          {reviews.map((review, index) => (
            <div className="admin-item" key={review.name}>
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
      </div>
    </section>
  );
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin();
  }

  return (
    <section className="admin-login-section" id="admin">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <LayoutDashboard size={34} />
        <p>Client Admin</p>
        <h2>Login to manage salon content</h2>
        <label>
          Email
          <input defaultValue="admin@kbeautysalon.com" type="email" />
        </label>
        <label>
          Password
          <input defaultValue="preview123" type="password" />
        </label>
        <button className="primary-button full-width" type="submit">
          Login Preview
        </button>
        <span>Preview only. Supabase Auth will secure this before launch.</span>
      </form>
    </section>
  );
}

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

function AdminStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="admin-stat">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function updateListItem<T>(items: T[], index: number, nextItem: T, onChange: (items: T[]) => void) {
  onChange(items.map((item, itemIndex) => (itemIndex === index ? nextItem : item)));
}
