export type Service = {
  id?: string;
  title: string;
  description: string;
  price: string;
  image: string;
  category?: string;
  subCategory?: string;
  serviceType?: 'Fixed Price' | 'Price Range' | 'Contact for Price';
  fixedPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  displayOrder?: number;
};

export type ServiceCategory = {
  id?: string;
  name: string;
  subCategories: Array<{
    id?: string;
    name: string;
  }>;
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
  discountType?: 'Amount Off' | 'Percentage Off';
  discountValue?: string;
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

export type CustomerServiceHistory = {
  date: string;
  time: string;
  serviceName: string;
  staffName: string;
  amountPaid: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
  discountAmount: number;
  voucherUsed: string;
};

export type CustomerVoucher = {
  id?: string;
  voucherCode: string;
  startDate: string;
  expiryDate: string;
  status: 'Voucher Used' | 'Voucher Not Used';
  discountType: 'Amount Off' | 'Percentage Off';
  discountValue: string;
};

export type CustomerMembership = {
  isMember: boolean;
  startDate: string;
  endDate: string;
  fee: number;
  paidDate: string;
};

export type Customer = {
  id: string;
  profilePictureUrl: string;
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  notes: string;
  membership: CustomerMembership;
  serviceHistory: CustomerServiceHistory[];
  vouchers: CustomerVoucher[];
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
  logoUrl: string;
  instagramUrl: string;
  phone: string;
  email: string;
  address: string;
  currencyCode: string;
  gstPercent: number;
  themePrimaryColor: string;
  themeAccentColor: string;
};

export type AdminSection =
  | 'home-page'
  | 'customers'
  | 'bookings'
  | 'gallery'
  | 'website-details'
  | 'services'
  | 'reviews'
  | 'vouchers'
  | 'staff';

export type ClientSection = 'gallery' | 'vouchers' | 'bookings' | 'account';
