import type { Booking, ClientPhoto, ClientProfile, Customer, GalleryAlbum, GalleryImage, HomePageImage, Lead, Review, Service, SiteSettings, StaffMember, Voucher } from '../types';

export const navItems = ['Home', 'About Us', 'Services', 'Gallery', 'Contact Us'];

export const initialServices: Service[] = [
  {
    title: 'Hair Styling',
    description: 'Cuts, blow waves, colour refreshes, and soft styling for everyday confidence.',
    price: 'From ₹1,500',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Beauty Treatments',
    description: 'Brows, lashes, facials, and skin-focused appointments in a relaxed setting.',
    price: 'From ₹1,200',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Nails',
    description: 'Clean manicures, gel polish, and detail-led nail care for polished hands.',
    price: 'From ₹900',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80',
  },
];

export const bookingServices = [
  {
    title: 'Hair Styling',
    duration: '60 min',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=240&q=80',
  },
  {
    title: 'Hair Coloring',
    duration: '90 min',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=240&q=80',
  },
  {
    title: 'Balayage',
    duration: '120 min',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=240&q=80',
  },
  {
    title: 'Makeup',
    duration: '75 min',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=240&q=80',
  },
  {
    title: 'Nails',
    duration: '45 min',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=240&q=80',
  },
];

export const bookingTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

export const initialGalleryImages: GalleryImage[] = [
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

export const galleryAlbums: GalleryAlbum[] = [
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

export const initialHomePageImages: HomePageImage[] = [
  { id: 'hero-1', title: 'Salon interior', url: '/homepage/salon.jpg', displayOrder: 0 },
  { id: 'hero-2', title: 'Styling station', url: '/homepage/salon_1.jpg', displayOrder: 1 },
  { id: 'hero-3', title: 'Salon detail', url: '/homepage/salon_2.jpg', displayOrder: 2 },
  { id: 'hero-4', title: 'Beauty room', url: '/homepage/salon_3.jpg', displayOrder: 3 },
];

export const initialBookings: Booking[] = [
  { client: 'Priya Shah', service: 'Hair Styling', time: 'Tomorrow, 10:30 AM', status: 'Confirmed' },
  { client: 'Emma Wilson', service: 'Nails', time: 'Friday, 2:00 PM', status: 'Pending' },
  { client: 'Mia Chen', service: 'Beauty Treatments', time: 'Saturday, 11:00 AM', status: 'Confirmed' },
];

export const initialLeads: Lead[] = [
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

export const initialReviews: Review[] = [
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

export const initialVouchers: Voucher[] = [
  { code: 'WELCOME10', description: 'Introductory discount for new clients', value: '10%', status: 'Active', discountType: 'Percentage Off', discountValue: '10%' },
  { code: 'GIFT500', description: 'Gift voucher credit', value: '₹500', status: 'Active', discountType: 'Amount Off', discountValue: '₹500' },
];

export const initialCustomers: Customer[] = [
  {
    id: 'customer-1',
    profilePictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
    fullName: 'Aisha Patel',
    email: 'aisha@example.com',
    mobile: '98765 43210',
    address: '12 Garden Street, Ahmedabad, Gujarat',
    notes: 'Prefers soft glam makeup and weekend appointments.',
    membership: {
      isMember: true,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      fee: 5000,
      paidDate: '2026-01-01',
    },
    serviceHistory: [
      {
        date: '2026-05-10',
        time: '11:00 AM',
        serviceName: 'Hair Styling',
        staffName: 'Kavya Patel',
        amountPaid: 1500,
        paymentMethod: 'UPI',
        discountAmount: 150,
        voucherUsed: 'WELCOME10',
      },
      {
        date: '2026-04-18',
        time: '4:30 PM',
        serviceName: 'Makeup',
        staffName: 'Mia Chen',
        amountPaid: 2500,
        paymentMethod: 'Card',
        discountAmount: 0,
        voucherUsed: 'None',
      },
    ],
    vouchers: [
      {
        voucherCode: 'WELCOME10',
        startDate: '2026-05-01',
        expiryDate: '2026-06-30',
        status: 'Voucher Used',
        discountType: 'Percentage Off',
        discountValue: '10%',
      },
      {
        voucherCode: 'GIFT500',
        startDate: '2026-05-21',
        expiryDate: '2026-08-21',
        status: 'Voucher Not Used',
        discountType: 'Amount Off',
        discountValue: '₹500',
      },
    ],
  },
  {
    id: 'customer-2',
    profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    fullName: 'Sophie Martin',
    email: 'sophie@example.com',
    mobile: '99887 77665',
    address: '45 Lake Road, Surat, Gujarat',
    notes: 'Likes gel nails and natural brow shaping.',
    membership: {
      isMember: false,
      startDate: '',
      endDate: '',
      fee: 0,
      paidDate: '',
    },
    serviceHistory: [
      {
        date: '2026-05-05',
        time: '2:00 PM',
        serviceName: 'Nails',
        staffName: 'Mia Chen',
        amountPaid: 1200,
        paymentMethod: 'Cash',
        discountAmount: 0,
        voucherUsed: 'None',
      },
    ],
    vouchers: [],
  },
];

export const initialStaff: StaffMember[] = [
  { name: 'Kavya Patel', role: 'Senior Stylist', phone: '04XX 111 222', email: 'kavya@kbeautysalon.com', status: 'Active' },
  { name: 'Mia Chen', role: 'Makeup Artist', phone: '04XX 333 444', email: 'mia@kbeautysalon.com', status: 'Active' },
];

export const demoClientProfile: ClientProfile = {
  name: 'Aisha Patel',
  phone: '04XX 555 777',
  address: '12 Garden Street, Melbourne VIC',
  email: 'client@kbeautysalon.com',
};

export const initialClientPhotos: ClientPhoto[] = [
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

export const initialSettings: SiteSettings = {
  heroImage: '/homepage/salon.jpg',
  logoUrl: '/homepage/logo-wo-bg.png',
  instagramUrl: 'https://www.instagram.com/kbeautyglamsalon/',
  phone: '04XX XXX XXX',
  email: 'hello@kbeautysalon.com',
  address: 'Your salon address will go here once confirmed.',
  currencyCode: 'INR',
  gstPercent: 18,
  themePrimaryColor: '#2f5c50',
  themeAccentColor: '#cc9a53',
};
