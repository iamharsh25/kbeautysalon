import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
  Scissors,
  Settings,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  UserCheck,
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

type GalleryAlbum = {
  title: string;
  description: string;
  cover: string;
  photos: GalleryImage[];
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

type StaffMember = {
  name: string;
  role: string;
  phone: string;
  email: string;
  status: string;
};

type ClientProfile = {
  name: string;
  phone: string;
  address: string;
  email: string;
};

type ClientPhoto = {
  title: string;
  category: string;
  image: string;
  notes: string;
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
  | 'vouchers'
  | 'staff';

type ClientSection = 'gallery' | 'vouchers' | 'bookings' | 'account';

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

const bookingServices = [
  {
    title: 'Hair Styling',
    duration: '60 min',
    price: 65,
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=240&q=80',
  },
  {
    title: 'Hair Coloring',
    duration: '90 min',
    price: 120,
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=240&q=80',
  },
  {
    title: 'Balayage',
    duration: '120 min',
    price: 150,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=240&q=80',
  },
  {
    title: 'Makeup',
    duration: '75 min',
    price: 85,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=240&q=80',
  },
  {
    title: 'Nails',
    duration: '45 min',
    price: 55,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=240&q=80',
  },
];

const bookingTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

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

const galleryAlbums: GalleryAlbum[] = [
  {
    title: 'Hair style',
    description: 'Cuts, styling, blow waves, and soft glam hair moments.',
    cover: '/homepage/salon_1.jpg',
    photos: [
      initialGalleryImages[0],
      initialGalleryImages[1],
      {
        title: 'Salon styling',
        alt: 'A salon hair styling chair',
        url: '/homepage/salon.jpg',
      },
      {
        title: 'Hair finish',
        alt: 'A polished hair styling finish',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
  {
    title: 'Nails',
    description: 'Clean manicures, gel polish, and detail-led nail care.',
    cover: initialGalleryImages[2].url,
    photos: [
      initialGalleryImages[2],
      {
        title: 'Nail detail',
        alt: 'Detailed nail art',
        url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Polished hands',
        alt: 'Fresh manicure',
        url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
  {
    title: 'Makeup',
    description: 'Fresh beauty makeup for events, evenings, and everyday polish.',
    cover: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
    photos: [
      {
        title: 'Soft glam',
        alt: 'Soft makeup look',
        url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Makeup brushes',
        alt: 'Makeup brushes and products',
        url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Beauty detail',
        alt: 'A close-up beauty makeup look',
        url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
  {
    title: 'Bridal Make up',
    description: 'Calm, elegant bridal beauty for ceremony days and celebrations.',
    cover: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=900&q=80',
    photos: [
      {
        title: 'Bridal glow',
        alt: 'Bridal makeup preparation',
        url: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Wedding detail',
        alt: 'Wedding beauty detail',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Bridal styling',
        alt: 'Bridal hair and makeup styling',
        url: 'https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
  {
    title: 'Professional Shoot',
    description: 'Camera-ready hair and makeup for portraits, shoots, and campaigns.',
    cover: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=900&q=80',
    photos: [
      {
        title: 'Portrait ready',
        alt: 'Professional portrait styling',
        url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Studio look',
        alt: 'Studio beauty styling',
        url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Campaign glam',
        alt: 'Glam makeup for photography',
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
      },
    ],
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

const initialStaff: StaffMember[] = [
  { name: 'Kavya Patel', role: 'Senior Stylist', phone: '04XX 111 222', email: 'kavya@kbeautysalon.com', status: 'Active' },
  { name: 'Mia Chen', role: 'Makeup Artist', phone: '04XX 333 444', email: 'mia@kbeautysalon.com', status: 'Active' },
];

const demoClientProfile: ClientProfile = {
  name: 'Aisha Patel',
  phone: '04XX 555 777',
  address: '12 Garden Street, Melbourne VIC',
  email: 'client@kbeautysalon.com',
};

const initialClientPhotos: ClientPhoto[] = [
  {
    title: 'Soft glam reference',
    category: 'Makeup',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=700&q=80',
    notes: 'Loved this soft finish for evening events.',
  },
  {
    title: 'Nail colour memory',
    category: 'Nails',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=700&q=80',
    notes: 'Ask for this shape and red polish again.',
  },
];

const initialSettings: SiteSettings = {
  heroImage: '/homepage/salon.jpg',
  instagramUrl: 'https://www.instagram.com/kbeautyglamsalon/',
  phone: '04XX XXX XXX',
  email: 'hello@kbeautysalon.com',
  address: 'Your salon address will go here once confirmed.',
};

function Header({ onBookClick, onLoginClick }: { onBookClick: () => void; onLoginClick: () => void }) {
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

function Hero({ heroImage, onBookClick }: { heroImage: string; onBookClick: () => void }) {
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
          K Beauty Salon began with a simple promise: every client should feel listened to before a
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

function GalleryPreview({
  albums,
  instagramUrl,
  onAlbumOpen,
}: {
  albums: GalleryAlbum[];
  instagramUrl: string;
  onAlbumOpen: (album: GalleryAlbum) => void;
}) {
  return (
    <section className="section gallery-section" id="gallery">
      <SectionHeading eyebrow="Come On Our Journey" title="@kbeautyglamsalon" />
      <div className="album-grid">
        {albums.map((album) => (
          <button className="album-card" key={album.title} type="button" onClick={() => onAlbumOpen(album)}>
            <img src={album.cover} alt="" loading="lazy" />
            <span>{album.photos.length} photos</span>
            <h3>{album.title}</h3>
            <p>{album.description}</p>
            <strong>Open Album</strong>
          </button>
        ))}
      </div>
      <a className="outline-button" href={instagramUrl} target="_blank" rel="noreferrer">View Instagram</a>
    </section>
  );
}

function GalleryAlbumPage({
  album,
  albums,
  onBack,
  onAlbumChange,
}: {
  album: GalleryAlbum;
  albums: GalleryAlbum[];
  onBack: () => void;
  onAlbumChange: (album: GalleryAlbum) => void;
}) {
  return (
    <main className="album-page">
      <section className="album-hero">
        <div>
          <button className="back-button" type="button" onClick={onBack}>
            ← Back to Home
          </button>
          <p>Gallery</p>
          <h1>{album.title}</h1>
          <span>{album.description}</span>
        </div>
        <div className="album-hero-stack" aria-hidden="true">
          {album.photos.slice(0, 3).map((photo) => (
            <img key={photo.url} src={photo.url} alt="" />
          ))}
        </div>
      </section>

      <section className="album-browser">
        <aside className="album-sidebar">
          <img src={album.cover} alt="" />
          <h2>{album.title}</h2>
          <p>{album.photos.length} photos</p>
          <nav aria-label="Gallery albums">
            {albums.map((item) => (
              <button
                className={item.title === album.title ? 'active' : ''}
                key={item.title}
                type="button"
                onClick={() => onAlbumChange(item)}
              >
                <Image size={17} />
                {item.title}
              </button>
            ))}
          </nav>
        </aside>
        <div className="album-photo-area">
          <div className="album-toolbar">
            <h2>All Photos</h2>
            <div>
              <button type="button">All</button>
              <button type="button">Images</button>
            </div>
          </div>
          <div className="album-photo-grid">
            {album.photos.map((photo) => (
              <img key={photo.url} src={photo.url} alt={photo.alt} loading="lazy" />
            ))}
          </div>
        </div>
      </section>
    </main>
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

function BookingPage({ onBack }: { onBack: () => void }) {
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(20);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const selectedService = bookingServices[selectedServiceIndex];
  const calendarDays = [
    { day: 26, muted: true },
    { day: 27, muted: true },
    { day: 28, muted: true },
    { day: 29, muted: true },
    { day: 30, muted: true },
    ...Array.from({ length: 31 }, (_, index) => ({ day: index + 1, muted: false })),
  ];

  return (
    <main className="booking-page">
      <nav className="booking-nav" aria-label="Booking page navigation">
        <button className="booking-brand" type="button" onClick={onBack}>
          <img className="brand-logo" src="/homepage/logo-wo-bg.png" alt="" />
          <span>K Beauty Salon</span>
        </button>
        <div>
          <button type="button" onClick={onBack}>Home</button>
          <button type="button">Services</button>
          <button type="button">Gallery</button>
          <button type="button">Contact</button>
        </div>
        <a href="tel:+61400000000">04XX XXX XXX</a>
      </nav>

      <section className="booking-title">
        <p><Sparkles size={15} /> Book Appointment</p>
        <h1>Book Your Perfect Time</h1>
        <span>Choose your service, pick a date, and select a time that works best for you.</span>
      </section>

      <section className="booking-workspace">
        <article className="booking-column">
          <BookingColumnTitle icon={<Scissors size={22} />} title="Select Service" text="Choose your desired service" />
          <div className="booking-service-list">
            {bookingServices.map((service, index) => (
              <button
                className={selectedServiceIndex === index ? 'booking-service-card selected' : 'booking-service-card'}
                key={service.title}
                type="button"
                onClick={() => setSelectedServiceIndex(index)}
              >
                <img src={service.image} alt="" />
                <span>
                  <strong>{service.title}</strong>
                  <small>{service.duration}</small>
                </span>
                <b>${service.price}</b>
                {selectedServiceIndex === index ? <CheckCircle2 size={22} /> : null}
              </button>
            ))}
          </div>
        </article>

        <article className="booking-column">
          <BookingColumnTitle icon={<CalendarDays size={22} />} title="Select Date" text="Pick a date that works for you" />
          <div className="booking-calendar">
            <div className="booking-calendar-header">
              <button type="button" aria-label="Previous month"><ChevronLeft size={18} /></button>
              <strong>May 2026</strong>
              <button type="button" aria-label="Next month"><ChevronRight size={18} /></button>
            </div>
            <div className="booking-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="booking-days">
              {calendarDays.map((date, index) => (
                <button
                  className={`${date.muted ? 'muted' : ''} ${selectedDate === date.day && !date.muted ? 'selected' : ''}`}
                  key={`${date.day}-${index}`}
                  type="button"
                  onClick={() => !date.muted && setSelectedDate(date.day)}
                >
                  {date.day}
                </button>
              ))}
            </div>
          </div>
          <div className="selected-date-card">
            <Sparkles size={22} />
            <span>
              <strong>May {selectedDate}, 2026</strong>
              <small>Wednesday</small>
            </span>
          </div>
        </article>

        <article className="booking-column">
          <BookingColumnTitle icon={<Clock size={22} />} title="Select Time" text="Choose an available time slot" />
          <div className="booking-time-heading">
            <span>Available times for</span>
            <strong>May {selectedDate}, 2026</strong>
          </div>
          <div className="booking-time-grid">
            {bookingTimes.map((time) => (
              <button
                className={selectedTime === time ? 'selected' : ''}
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
          <div className="booking-summary">
            <h2>Booking Summary</h2>
            <div className="booking-summary-service">
              <img src={selectedService.image} alt="" />
              <span>
                <strong>{selectedService.title}</strong>
                <small>{selectedService.duration}</small>
              </span>
              <b>${selectedService.price}</b>
            </div>
            <dl>
              <div><dt>Date</dt><dd>May {selectedDate}, 2026</dd></div>
              <div><dt>Time</dt><dd>{selectedTime}</dd></div>
              <div><dt>Total</dt><dd>${selectedService.price}.00</dd></div>
            </dl>
            <button className="confirm-booking-button" type="button">
              Confirm Booking
              <ArrowRight size={18} />
            </button>
          </div>
        </article>
      </section>

      <section className="booking-benefits">
        <span><CheckCircle2 size={22} /> Easy Booking <small>Book in just a few clicks</small></span>
        <span><CalendarDays size={22} /> 24/7 Availability <small>Book anytime, anywhere</small></span>
        <span><UserCheck size={22} /> Expert Stylists <small>Get styled by professionals</small></span>
      </section>
    </main>
  );
}

function BookingColumnTitle({ icon, text, title }: { icon: ReactNode; text: string; title: string }) {
  return (
    <div className="booking-column-title">
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}

export function App() {
  const [view, setView] = useState<'public' | 'admin' | 'album' | 'booking' | 'client'>('public');
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum>(galleryAlbums[0]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [services, setServices] = useState(initialServices);
  const [galleryImages, setGalleryImages] = useState(initialGalleryImages);
  const [bookings, setBookings] = useState(initialBookings);
  const [leads, setLeads] = useState(initialLeads);
  const [reviews, setReviews] = useState(initialReviews);
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [staffMembers, setStaffMembers] = useState(initialStaff);
  const [clientPhotos, setClientPhotos] = useState(initialClientPhotos);
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view, selectedAlbum.title]);

  function handleLogin(email: string, password: string) {
    if (email.toLowerCase() === 'admin@kbeautysalon.com' && password === 'preview123') {
      setView('admin');
      setIsLoginOpen(false);
      setLoginError('');
      return;
    }

    setView('client');
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
        staffMembers={staffMembers}
        settings={settings}
        vouchers={vouchers}
        onBookingChange={setBookings}
        onGalleryChange={setGalleryImages}
        onLeadChange={setLeads}
        onLogout={() => setView('public')}
        onReviewChange={setReviews}
        onServiceChange={setServices}
        onStaffChange={setStaffMembers}
        onSettingsChange={setSettings}
        onVoucherChange={setVouchers}
      />
    );
  }

  if (view === 'client') {
    return (
      <ClientDashboard
        bookings={bookings}
        photos={clientPhotos}
        profile={demoClientProfile}
        vouchers={vouchers.filter((voucher) => voucher.status === 'Active')}
        onLogout={() => setView('public')}
        onPhotoAdd={(photo) => setClientPhotos([photo, ...clientPhotos])}
      />
    );
  }

  if (view === 'album') {
    return (
      <GalleryAlbumPage
        album={selectedAlbum}
        albums={galleryAlbums}
        onAlbumChange={setSelectedAlbum}
        onBack={() => setView('public')}
      />
    );
  }

  if (view === 'booking') {
    return <BookingPage onBack={() => setView('public')} />;
  }

  return (
    <>
      <Header onBookClick={() => setView('booking')} onLoginClick={() => setIsLoginOpen(true)} />
      <main>
        <Hero heroImage={settings.heroImage} onBookClick={() => setView('booking')} />
        <ServicesPreview services={services} />
        <FounderStory />
        <GalleryPreview
          albums={galleryAlbums}
          instagramUrl={settings.instagramUrl}
          onAlbumOpen={(album) => {
            setSelectedAlbum(album);
            setView('album');
          }}
        />
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
        <span>Admin demo: admin@kbeautysalon.com / preview123. Client demo: use any other email.</span>
      </form>
    </div>
  );
}

function ClientDashboard({
  bookings,
  onLogout,
  onPhotoAdd,
  photos,
  profile,
  vouchers,
}: {
  bookings: Booking[];
  onLogout: () => void;
  onPhotoAdd: (photo: ClientPhoto) => void;
  photos: ClientPhoto[];
  profile: ClientProfile;
  vouchers: Voucher[];
}) {
  const [activeSection, setActiveSection] = useState<ClientSection>('gallery');
  const activeLabel = clientMenuItems.find((item) => item.id === activeSection)?.label ?? 'My Gallery';

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    onPhotoAdd({
      title: file.name.replace(/\.[^.]+$/, ''),
      category: 'Uploaded',
      image: URL.createObjectURL(file),
      notes: 'Saved as a client reference for the next appointment.',
    });
    event.target.value = '';
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img className="brand-logo" src="/homepage/logo-wo-bg.png" alt="" />
          <div>
            <strong>K Beauty Salon</strong>
            <span>Client Portal</span>
          </div>
        </div>
        <nav aria-label="Client navigation">
          {clientMenuItems.map((item) => (
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
            <p>Client Dashboard</p>
            <h1>{activeLabel}</h1>
          </div>
          <button className="outline-admin-button" type="button" onClick={onLogout}>
            Log out
          </button>
        </div>

        {activeSection === 'gallery' ? (
          <AdminPanel icon={<Camera size={20} />} title="My Gallery">
            <div className="client-upload-panel">
              <div>
                <strong>Upload your style memory</strong>
                <p>Add hair, makeup, or nail photos so the salon can remember what you liked last time.</p>
              </div>
              <label className="small-admin-button">
                <Camera size={16} />
                Upload Photo
                <input accept="image/*" type="file" onChange={handleUpload} />
              </label>
            </div>
            <div className="client-photo-grid">
              {photos.map((photo) => (
                <article className="client-photo-card" key={`${photo.title}-${photo.image}`}>
                  <img src={photo.image} alt={photo.title} />
                  <span>{photo.category}</span>
                  <h3>{photo.title}</h3>
                  <p>{photo.notes}</p>
                </article>
              ))}
            </div>
          </AdminPanel>
        ) : null}

        {activeSection === 'vouchers' ? (
          <AdminPanel icon={<Ticket size={20} />} title="My Vouchers">
            {vouchers.map((voucher) => (
              <div className="voucher-card" key={voucher.code}>
                <span>{voucher.code}</span>
                <strong>{voucher.value}</strong>
                <p>{voucher.description}</p>
              </div>
            ))}
          </AdminPanel>
        ) : null}

        {activeSection === 'bookings' ? (
          <AdminPanel icon={<CalendarDays size={20} />} title="Previous Bookings">
            {bookings.map((booking) => (
              <div className="admin-row" key={`${booking.client}-${booking.time}`}>
                <div>
                  <strong>{booking.service}</strong>
                  <span>{booking.time}</span>
                </div>
                <span>{booking.status}</span>
              </div>
            ))}
          </AdminPanel>
        ) : null}

        {activeSection === 'account' ? (
          <AdminPanel icon={<UserRound size={20} />} title="My Account">
            <div className="readonly-profile-grid">
              <AdminField label="Name"><input readOnly value={profile.name} /></AdminField>
              <AdminField label="Number"><input readOnly value={profile.phone} /></AdminField>
              <AdminField label="Email"><input readOnly value={profile.email} /></AdminField>
              <AdminField label="Address"><textarea readOnly value={profile.address} /></AdminField>
            </div>
          </AdminPanel>
        ) : null}
      </section>
    </div>
  );
}

function AdminDashboard({
  bookings,
  galleryImages,
  leads,
  reviews,
  services,
  staffMembers,
  settings,
  vouchers,
  onBookingChange,
  onGalleryChange,
  onLeadChange,
  onLogout,
  onReviewChange,
  onServiceChange,
  onStaffChange,
  onSettingsChange,
  onVoucherChange,
}: {
  bookings: Booking[];
  galleryImages: GalleryImage[];
  leads: Lead[];
  reviews: Review[];
  services: Service[];
  staffMembers: StaffMember[];
  settings: SiteSettings;
  vouchers: Voucher[];
  onBookingChange: (bookings: Booking[]) => void;
  onGalleryChange: (galleryImages: GalleryImage[]) => void;
  onLeadChange: (leads: Lead[]) => void;
  onLogout: () => void;
  onReviewChange: (reviews: Review[]) => void;
  onServiceChange: (services: Service[]) => void;
  onStaffChange: (staffMembers: StaffMember[]) => void;
  onSettingsChange: (settings: SiteSettings) => void;
  onVoucherChange: (vouchers: Voucher[]) => void;
}) {
  const [activeSection, setActiveSection] = useState<AdminSection>('home-page');
  const activeLabel = adminMenuItems.find((item) => item.id === activeSection)?.label ?? 'Admin';

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img className="brand-logo" src="/homepage/logo-wo-bg.png" alt="" />
          <div>
            <strong>K Beauty Salon</strong>
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
          <AdminPanel icon={<Image size={20} />} title="Manage gallery albums and images">
            <div className="admin-grid">
              {galleryAlbums.map((album) => (
                <div className="admin-item" key={album.title}>
                  <img className="admin-image-preview" src={album.cover} alt="" />
                  <AdminField label="Album name"><input readOnly value={album.title} /></AdminField>
                  <AdminField label="Album description"><textarea readOnly value={album.description} /></AdminField>
                  <button className="small-admin-button" type="button"><Plus size={16} /> Upload Image</button>
                </div>
              ))}
            </div>
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

        {activeSection === 'staff' ? (
          <AdminPanel icon={<UserCheck size={20} />} title="Manage staff">
            <button
              className="small-admin-button"
              type="button"
              onClick={() => onStaffChange([...staffMembers, { name: 'New Staff', role: 'Stylist', phone: '04XX XXX XXX', email: 'staff@kbeautysalon.com', status: 'Active' }])}
            >
              <Plus size={16} />
              Add Staff
            </button>
            {staffMembers.map((staff, index) => (
              <div className="admin-item" key={`${staff.email}-${index}`}>
                <AdminField label="Staff name">
                  <input value={staff.name} onChange={(event) => updateListItem(staffMembers, index, { ...staff, name: event.target.value }, onStaffChange)} />
                </AdminField>
                <AdminField label="Role">
                  <input value={staff.role} onChange={(event) => updateListItem(staffMembers, index, { ...staff, role: event.target.value }, onStaffChange)} />
                </AdminField>
                <AdminField label="Phone">
                  <input value={staff.phone} onChange={(event) => updateListItem(staffMembers, index, { ...staff, phone: event.target.value }, onStaffChange)} />
                </AdminField>
                <AdminField label="Email">
                  <input value={staff.email} onChange={(event) => updateListItem(staffMembers, index, { ...staff, email: event.target.value }, onStaffChange)} />
                </AdminField>
                <AdminField label="Status">
                  <select value={staff.status} onChange={(event) => updateListItem(staffMembers, index, { ...staff, status: event.target.value }, onStaffChange)}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
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
  { id: 'staff', label: 'Manage Staff', icon: <UserCheck size={18} /> },
  { id: 'reviews', label: 'Client Review', icon: <Star size={18} /> },
  { id: 'vouchers', label: 'Voucher Management', icon: <Gift size={18} /> },
];

const clientMenuItems: { id: ClientSection; label: string; icon: ReactNode }[] = [
  { id: 'gallery', label: 'My Gallery', icon: <Camera size={18} /> },
  { id: 'vouchers', label: 'My Vouchers', icon: <Ticket size={18} /> },
  { id: 'bookings', label: 'Previous Bookings', icon: <CalendarDays size={18} /> },
  { id: 'account', label: 'My Account', icon: <UserRound size={18} /> },
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
