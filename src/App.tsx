import { ArrowRight, CalendarDays, Clock, Instagram, Menu, ShieldCheck, Sparkles, UserRound } from 'lucide-react';

type Service = {
  title: string;
  description: string;
  price: string;
  image: string;
};

type GalleryImage = {
  alt: string;
  url: string;
};

const navItems = ['Home', 'About Us', 'Services', 'Gallery', 'Contact Us'];

const services: Service[] = [
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

const galleryImages: GalleryImage[] = [
  {
    alt: 'Salon colour appointment',
    url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=700&q=80',
  },
  {
    alt: 'Fresh styled blonde hair',
    url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=700&q=80',
  },
  {
    alt: 'Nail polish treatment',
    url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=700&q=80',
  },
  {
    alt: 'Salon product shelf',
    url: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=700&q=80',
  },
];

function Header() {
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
        <a href="#login">Login</a>
      </nav>

      <button className="icon-button mobile-menu" aria-label="Open navigation menu">
        <Menu size={22} />
      </button>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-lines hero-lines-left" aria-hidden="true" />
      <div className="hero-lines hero-lines-right" aria-hidden="true" />
      <div className="hero-media">
        <div className="hero-image" role="img" aria-label="A calm salon appointment in progress" />
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

function ServicesPreview() {
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

function GalleryPreview() {
  return (
    <section className="section gallery-section" id="gallery">
      <SectionHeading eyebrow="Come On Our Journey" title="@kbeautysalon" />
      <div className="gallery-grid">
        {galleryImages.map((image) => (
          <img key={image.alt} src={image.url} alt={image.alt} loading="lazy" />
        ))}
      </div>
      <a className="outline-button" href="#gallery">View Gallery</a>
    </section>
  );
}

function ContactBand() {
  return (
    <footer className="contact-band" id="contact-us">
      <div>
        <h2>Contact us</h2>
        <p>Phone: 04XX XXX XXX</p>
        <p>Email: hello@kbeautysalon.com</p>
      </div>
      <div>
        <h2>Where we are</h2>
        <p>Your salon address will go here once confirmed.</p>
      </div>
      <a className="instagram-link" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
        <Instagram size={20} />
        Instagram
      </a>
    </footer>
  );
}

export function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServicesPreview />
        <FounderStory />
        <BookingPreview />
        <GalleryPreview />
      </main>
      <ContactBand />
    </>
  );
}
