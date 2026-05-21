export type Service = {
  title: string;
  description: string;
  price: string;
  image: string;
};

export type GalleryImage = {
  title: string;
  alt: string;
  url: string;
};

export type GalleryAlbum = {
  title: string;
  description: string;
  cover: string;
  photos: GalleryImage[];
};

export type Booking = {
  client: string;
  service: string;
  time: string;
  status: string;
};

export type Lead = {
  name: string;
  email: string;
  message: string;
  status: string;
};

export type Review = {
  name: string;
  rating: number;
  quote: string;
  isVisible: boolean;
};

export type Voucher = {
  code: string;
  description: string;
  value: string;
  status: string;
};

export type StaffMember = {
  name: string;
  role: string;
  phone: string;
  email: string;
  status: string;
};

export type ClientProfile = {
  name: string;
  phone: string;
  address: string;
  email: string;
};

export type ClientPhoto = {
  title: string;
  category: string;
  image: string;
  notes: string;
};

export type HomePageImage = {
  id: string;
  title: string;
  url: string;
  storagePath?: string | null;
  displayOrder: number;
};

export type HomePageImageRow = {
  id: string;
  title: string;
  image_url: string;
  storage_path: string | null;
  display_order: number;
};

export type SiteSettings = {
  heroImage: string;
  instagramUrl: string;
  phone: string;
  email: string;
  address: string;
  currencyCode: string;
  gstPercent: number;
};

export type AdminSection =
  | 'home-page'
  | 'new-leads'
  | 'bookings'
  | 'gallery'
  | 'website-details'
  | 'services'
  | 'reviews'
  | 'vouchers'
  | 'staff';

export type ClientSection = 'gallery' | 'vouchers' | 'bookings' | 'account';
