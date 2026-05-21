import { type CSSProperties, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  demoClientProfile,
  galleryAlbums,
  initialBookings,
  initialClientPhotos,
  initialCustomers,
  initialGalleryImages,
  initialHomePageImages,
  initialReviews,
  initialServices,
  initialSettings,
  initialStaff,
  initialVouchers,
} from './data/initialData';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { AdminDashboard } from './pages/AdminDashboard';
import { BookingPage } from './pages/BookingPage';
import { ClientDashboard } from './pages/ClientDashboard';
import { GalleryAlbumPage } from './pages/GalleryAlbumPage';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { assignCustomerVoucher, createCustomer, deleteCustomerVoucher, getCustomers, updateCustomer } from './services/customerService';
import { deleteHomePageImage, getHomePageImages, reorderHomePageImages, uploadHomePageImages } from './services/homePageService';
import { getSalonSettings, updateSalonSettings } from './services/salonSettingsService';
import { createServiceMenuItem, deleteServiceMenuItem, getServiceMenu, updateServiceMenuItem } from './services/serviceMenuService';
import type { Customer, CustomerVoucher, GalleryAlbum, HomePageImage, Service, SiteSettings } from './types';

function albumSlug(album: GalleryAlbum) {
  return album.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [services, setServices] = useState(initialServices);
  const [galleryImages, setGalleryImages] = useState(initialGalleryImages);
  const [bookings, setBookings] = useState(initialBookings);
  const [customers, setCustomers] = useState(() => isSupabaseConfigured ? [] : initialCustomers);
  const [reviews, setReviews] = useState(initialReviews);
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [staffMembers, setStaffMembers] = useState(initialStaff);
  const [clientPhotos, setClientPhotos] = useState(initialClientPhotos);
  const [homePageImages, setHomePageImages] = useState(initialHomePageImages);
  const [settings, setSettings] = useState(initialSettings);
  const [currentUserFullName, setCurrentUserFullName] = useState('K Beauty Admin');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSupabaseData() {
      if (!isSupabaseConfigured || !supabase) return;

      try {
        const homepageImages = await getHomePageImages();
        if (homepageImages.length && isMounted) {
          setHomePageImages(homepageImages);
        }
      } catch (error) {
        console.error('Homepage images could not be loaded.', error);
      }

      try {
        const salonSettings = await getSalonSettings();
        if (salonSettings && isMounted) {
          setSettings(salonSettings);
        }
      } catch (error) {
        console.error('Salon settings could not be loaded.', error);
      }

      try {
        const databaseCustomers = await getCustomers();
        if (isMounted) {
          setCustomers(databaseCustomers);
        }
      } catch (error) {
        console.error('Customers could not be loaded.', error);
        if (isMounted) {
          setCustomers([]);
        }
      }

      try {
        const databaseServices = await getServiceMenu();
        if (databaseServices.length && isMounted) {
          setServices(databaseServices);
        }
      } catch (error) {
        console.error('Services could not be loaded.', error);
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || !isMounted) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userData.user.id)
        .single();

      if (profile?.full_name && isMounted) {
        setCurrentUserFullName(profile.full_name);
      }
    }

    void loadInitialSupabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleHomePageImageUpload(files: File[]) {
    if (!files.length) return;

    const uploadedImages = await uploadHomePageImages(files, homePageImages.length);
    setHomePageImages((currentImages) => [...currentImages, ...uploadedImages]);
  }

  async function handleHomePageImageDelete(image: HomePageImage) {
    if (homePageImages.length === 1) return;

    await deleteHomePageImage(image);

    const nextImages = homePageImages
      .filter((item) => item.id !== image.id)
      .map((item, index) => ({ ...item, displayOrder: index }));

    setHomePageImages(nextImages);
    await handleHomePageImagesReorder(nextImages);
  }

  async function handleHomePageImagesReorder(images: HomePageImage[]) {
    const reorderedImages = images.map((image, index) => ({ ...image, displayOrder: index }));
    setHomePageImages(reorderedImages);

    await reorderHomePageImages(reorderedImages);
  }

  async function handleSettingsChange(nextSettings: SiteSettings) {
    setSettings(nextSettings);
    await updateSalonSettings(nextSettings);
  }

  async function handleCustomerCreate(customer: Customer) {
    const createdCustomer = await createCustomer(customer);
    setCustomers((currentCustomers) => [createdCustomer, ...currentCustomers]);
    return createdCustomer;
  }

  async function handleCustomerUpdate(customer: Customer) {
    const updatedCustomer = await updateCustomer(customer);
    setCustomers((currentCustomers) => currentCustomers.map((item) => item.id === updatedCustomer.id ? updatedCustomer : item));
    return updatedCustomer;
  }

  async function handleCustomerVoucherAssign(customerId: string, voucher: CustomerVoucher) {
    const assignedVoucher = await assignCustomerVoucher(customerId, voucher);
    setCustomers((currentCustomers) => currentCustomers.map((customer) => {
      if (customer.id !== customerId) return customer;
      return {
        ...customer,
        vouchers: [assignedVoucher, ...customer.vouchers],
      };
    }));
    return assignedVoucher;
  }

  async function handleCustomerVoucherDelete(customerId: string, voucherCode: string, voucherIndex: number, voucherAssignmentId?: string) {
    await deleteCustomerVoucher(customerId, voucherCode, voucherAssignmentId);
    setCustomers((currentCustomers) => currentCustomers.map((customer) => {
      if (customer.id !== customerId) return customer;
      return {
        ...customer,
        vouchers: customer.vouchers.filter((_, index) => index !== voucherIndex),
      };
    }));
  }

  async function handleServiceCreate(service: Service) {
    const createdService = await createServiceMenuItem(service);
    setServices((currentServices) => [...currentServices, createdService]);
    return createdService;
  }

  async function handleServiceUpdate(service: Service, index: number) {
    const updatedService = await updateServiceMenuItem(service);
    setServices((currentServices) => currentServices.map((item, itemIndex) => itemIndex === index ? updatedService : item));
    return updatedService;
  }

  async function handleServiceDelete(service: Service, index: number) {
    await deleteServiceMenuItem(service);
    setServices((currentServices) => currentServices.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleLogin(email: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        setLoginError('Login failed. Please check your email and password.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role,full_name')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        setLoginError('Account found, but no profile role is connected yet.');
        return;
      }

      setCurrentUserFullName(profile.full_name || data.user.email || 'K Beauty Admin');
      navigate(profile.role === 'admin' || profile.role === 'staff' ? '/admin' : '/client');
      setIsLoginOpen(false);
      setLoginError('');
      return;
    }

    if (email.toLowerCase() === 'admin@kbeautysalon.com' && password === 'preview123') {
      setCurrentUserFullName('K Beauty Admin');
      navigate('/admin');
      setIsLoginOpen(false);
      setLoginError('');
      return;
    }

    navigate('/client');
    setIsLoginOpen(false);
    setLoginError('');
  }

  function goHome() {
    navigate('/');
  }

  const themeStyle = {
    '--green': settings.themePrimaryColor,
    '--green-dark': settings.themePrimaryColor,
    '--gold': settings.themeAccentColor,
  } as CSSProperties;

  return (
    <div style={themeStyle}>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              albums={galleryAlbums}
              homePageImages={homePageImages}
              isLoginOpen={isLoginOpen}
              loginError={loginError}
              services={services}
              settings={settings}
              onAlbumOpen={(album) => navigate(`/gallery/${albumSlug(album)}`)}
              onBookClick={() => navigate('/booking')}
              onCloseLogin={() => {
                setIsLoginOpen(false);
                setLoginError('');
              }}
              onLogin={handleLogin}
              onLoginClick={() => setIsLoginOpen(true)}
              onServicesClick={() => navigate('/services')}
            />
          }
        />
        <Route
          path="/services"
          element={
            <ServicesPage
              services={services}
              settings={settings}
              onBack={goHome}
              onBookClick={() => navigate('/booking')}
              onLoginClick={() => setIsLoginOpen(true)}
            />
          }
        />
        <Route path="/booking" element={<BookingPage settings={settings} onBack={goHome} />} />
        <Route
          path="/gallery/:album"
          element={
            <GalleryAlbumRoute
              onAlbumChange={(album) => navigate(`/gallery/${albumSlug(album)}`)}
              onBack={goHome}
            />
          }
        />
        {['/admin', '/admin/:adminSection', '/admin/:adminSection/:customerId'].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <AdminDashboard
                adminFullName={currentUserFullName}
                bookings={bookings}
                customers={customers}
                galleryImages={galleryImages}
                homePageImages={homePageImages}
                reviews={reviews}
                services={services}
                staffMembers={staffMembers}
                settings={settings}
                vouchers={vouchers}
                onBookingChange={setBookings}
                onCustomerCreate={handleCustomerCreate}
                onCustomerUpdate={handleCustomerUpdate}
                onCustomerVoucherAssign={handleCustomerVoucherAssign}
                onCustomerVoucherDelete={handleCustomerVoucherDelete}
                onCustomersChange={setCustomers}
                onGalleryChange={setGalleryImages}
                onHomePageImageDelete={handleHomePageImageDelete}
                onHomePageImagesReorder={handleHomePageImagesReorder}
                onHomePageImagesUpload={handleHomePageImageUpload}
                onLogout={goHome}
                onReviewChange={setReviews}
                onServiceChange={setServices}
                onServiceCreate={handleServiceCreate}
                onServiceDelete={handleServiceDelete}
                onServiceUpdate={handleServiceUpdate}
                onStaffChange={setStaffMembers}
                onSettingsChange={handleSettingsChange}
                onVoucherChange={setVouchers}
              />
            }
          />
        ))}
        <Route
          path="/client"
          element={
            <ClientDashboard
              bookings={bookings}
              photos={clientPhotos}
              profile={demoClientProfile}
              vouchers={vouchers.filter((voucher) => voucher.status === 'Active')}
              onLogout={goHome}
              onPhotoAdd={(photo) => setClientPhotos([photo, ...clientPhotos])}
            />
          }
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </div>
  );
}

function GalleryAlbumRoute({
  onAlbumChange,
  onBack,
}: {
  onAlbumChange: (album: GalleryAlbum) => void;
  onBack: () => void;
}) {
  const params = useParams();
  const album = galleryAlbums.find((item) => albumSlug(item) === params.album) ?? galleryAlbums[0];

  return (
    <GalleryAlbumPage
      album={album}
      albums={galleryAlbums}
      onAlbumChange={onAlbumChange}
      onBack={onBack}
    />
  );
}
