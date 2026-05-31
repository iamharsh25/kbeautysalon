import { type CSSProperties, useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
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
  initialServiceCategories,
  initialServices,
  initialSettings,
  initialStaff,
  initialVouchers,
} from './data/initialData';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { LoginModal } from './components/layout/LoginModal';
import { AdminDashboard } from './pages/AdminDashboard';
import { BookingPage } from './pages/BookingPage';
import { ClientDashboard } from './pages/ClientDashboard';
import { GalleryAlbumPage } from './pages/GalleryAlbumPage';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { assignCustomerVoucher, createCustomer, deleteCustomerVoucher, getCustomers, updateCustomer } from './services/customerService';
import { deleteGalleryAlbum, getGalleryAlbums, saveGalleryAlbums } from './services/galleryService';
import { deleteHomePageImage, getHomePageImages, reorderHomePageImages, uploadHomePageImages } from './services/homePageService';
import { getSalonSettings, updateSalonSettings, uploadSalonLogo } from './services/salonSettingsService';
import { getActiveAuthProfile, isLocalSessionWindowValid, signInWithEmail, signOut, verifyMfaCode, type AuthProfile, type MfaFlow } from './services/authService';
import { getServiceCategories, saveServiceCategories, uploadServiceCategoryImage } from './services/serviceCategoryService';
import { createServiceMenuItem, deleteServiceMenuItem, getServiceMenu, updateServiceMenuItem, uploadServiceImage } from './services/serviceMenuService';
import type { Customer, CustomerVoucher, GalleryAlbum, HomePageImage, Service, ServiceCategory, SiteSettings } from './types';

function albumSlug(album: GalleryAlbum) {
  if (album.slug) return album.slug;

  return album.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getAccountPath(role: string) {
  return role === 'admin' || role === 'staff' ? '/admin' : '/client';
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [services, setServices] = useState(() => isSupabaseConfigured ? [] : initialServices);
  const [serviceCategories, setServiceCategories] = useState(() => isSupabaseConfigured ? [] : initialServiceCategories);
  const [serviceLoadState, setServiceLoadState] = useState<'loading' | 'ready' | 'error'>(() => isSupabaseConfigured ? 'loading' : 'ready');
  const [albums, setAlbums] = useState(() => isSupabaseConfigured ? [] : galleryAlbums);
  const [, setGalleryImages] = useState(() => isSupabaseConfigured ? [] : initialGalleryImages);
  const [bookings, setBookings] = useState(initialBookings);
  const [customers, setCustomers] = useState(() => isSupabaseConfigured ? [] : initialCustomers);
  const [reviews, setReviews] = useState(initialReviews);
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [staffMembers, setStaffMembers] = useState(initialStaff);
  const [clientPhotos, setClientPhotos] = useState(initialClientPhotos);
  const [homePageImages, setHomePageImages] = useState(initialHomePageImages);
  const [settings, setSettings] = useState(initialSettings);
  const [currentUserFullName, setCurrentUserFullName] = useState('K Beauty Admin');
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [pendingAuthProfile, setPendingAuthProfile] = useState<AuthProfile | null>(null);
  const [mfaFlow, setMfaFlow] = useState<MfaFlow | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSupabaseData() {
      if (!isSupabaseConfigured || !supabase) return;

      const [
        homepageImagesResult,
        salonSettingsResult,
        customersResult,
        servicesResult,
        serviceCategoriesResult,
        galleryAlbumsResult,
        profileResult,
      ] = await Promise.allSettled([
        getHomePageImages(),
        getSalonSettings(),
        getCustomers(),
        getServiceMenu(),
        getServiceCategories(),
        getGalleryAlbums(),
        getActiveAuthProfile(),
      ]);

      if (!isMounted) return;

      if (homepageImagesResult.status === 'fulfilled' && homepageImagesResult.value.length) {
        setHomePageImages(homepageImagesResult.value);
      } else if (homepageImagesResult.status === 'rejected') {
        console.error('Homepage images could not be loaded.', homepageImagesResult.reason);
      }

      if (salonSettingsResult.status === 'fulfilled' && salonSettingsResult.value) {
        setSettings(salonSettingsResult.value);
      } else if (salonSettingsResult.status === 'rejected') {
        console.error('Salon settings could not be loaded.', salonSettingsResult.reason);
      }

      if (customersResult.status === 'fulfilled') {
        setCustomers(customersResult.value);
      } else {
        console.error('Customers could not be loaded.', customersResult.reason);
        setCustomers([]);
      }

      if (servicesResult.status === 'fulfilled' && serviceCategoriesResult.status === 'fulfilled') {
        setServices(servicesResult.value);
        setServiceCategories(serviceCategoriesResult.value);
        setServiceLoadState('ready');
      } else {
        if (servicesResult.status === 'rejected') console.error('Services could not be loaded.', servicesResult.reason);
        if (serviceCategoriesResult.status === 'rejected') console.error('Service categories could not be loaded.', serviceCategoriesResult.reason);
        setServices([]);
        setServiceCategories([]);
        setServiceLoadState('error');
      }

      if (galleryAlbumsResult.status === 'fulfilled') {
        setAlbums(galleryAlbumsResult.value);
        setGalleryImages(galleryAlbumsResult.value.flatMap((album) => album.photos));
      } else {
        console.error('Gallery albums could not be loaded.', galleryAlbumsResult.reason);
        setAlbums([]);
        setGalleryImages([]);
      }

      if (profileResult.status === 'fulfilled' && profileResult.value) {
        setCurrentUserFullName(profileResult.value.fullName);
        setCurrentUserRole(profileResult.value.role);
      } else if (profileResult.status === 'rejected') {
        console.error('Active session could not be loaded.', profileResult.reason);
      }
    }

    void loadInitialSupabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/client')) return;
    if (isLocalSessionWindowValid()) return;

    void signOut().finally(() => {
      setCurrentUserFullName('K Beauty Admin');
      setCurrentUserRole('');
      if (location.pathname.startsWith('/client')) {
        navigate('/');
      }
    });
  }, [location.pathname, navigate]);

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

  async function handleLogoUpload(file: File) {
    return uploadSalonLogo(file);
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
    setServices((currentServices) => currentServices.map((item, itemIndex) => {
      if (service.id && item.id) return item.id === service.id ? updatedService : item;
      return itemIndex === index ? updatedService : item;
    }));
    return updatedService;
  }

  async function handleServiceDelete(service: Service, index: number) {
    await deleteServiceMenuItem(service);
    setServices((currentServices) => currentServices.filter((item, itemIndex) => {
      if (service.id && item.id) return item.id !== service.id;
      return itemIndex !== index;
    }));
  }

  async function handleServiceImageUpload(file: File) {
    return uploadServiceImage(file);
  }

  async function handleServiceCategoryImageUpload(file: File) {
    return uploadServiceCategoryImage(file);
  }

  async function handleServiceCategoriesSave(categories: ServiceCategory[]) {
    const savedCategories = await saveServiceCategories(categories);
    setServiceCategories(savedCategories);
    return savedCategories;
  }

  async function handleGalleryAlbumsSave(nextAlbums: GalleryAlbum[]) {
    const savedAlbums = await saveGalleryAlbums(nextAlbums);
    setAlbums(savedAlbums);
    setGalleryImages(savedAlbums.flatMap((album) => album.photos));
    return savedAlbums;
  }

  async function handleGalleryAlbumDelete(album: GalleryAlbum) {
    await deleteGalleryAlbum(album);
    const nextAlbums = albums.filter((item) => {
      if (album.id && item.id) return item.id !== album.id;
      return item.title !== album.title;
    });
    setAlbums(nextAlbums);
    setGalleryImages(nextAlbums.flatMap((item) => item.photos));
  }

  async function handleLogin(email: string, password: string) {
    try {
      const { profile, mfa } = await signInWithEmail(email, password);
      setCurrentUserFullName(profile.fullName);
      setCurrentUserRole(profile.role);
      if (mfa) {
        setPendingAuthProfile(profile);
        setMfaFlow(mfa);
        setLoginError('');
        return;
      }
      navigate(getAccountPath(profile.role));
      setIsLoginOpen(false);
      setLoginError('');
      return;
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    }
  }

  async function handleMfaVerify(code: string) {
    if (!mfaFlow || !pendingAuthProfile) return;

    try {
      await verifyMfaCode(mfaFlow, code);
      setCurrentUserFullName(pendingAuthProfile.fullName);
      setCurrentUserRole(pendingAuthProfile.role);
      navigate(getAccountPath(pendingAuthProfile.role));
      setPendingAuthProfile(null);
      setMfaFlow(null);
      setIsLoginOpen(false);
      setLoginError('');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Two-factor verification failed.');
    }
  }

  function goHome() {
    navigate('/');
  }

  function goToAccount() {
    navigate(getAccountPath(currentUserRole));
  }

  async function handleLogout() {
    await signOut();
    setCurrentUserFullName('K Beauty Admin');
    setCurrentUserRole('');
    setPendingAuthProfile(null);
    setMfaFlow(null);
    goHome();
  }

  const themeStyle = {
    '--green': settings.themePrimaryColor,
    '--green-dark': settings.themePrimaryColor,
    '--gold': settings.themeAccentColor,
  } as CSSProperties;
  const isSignedIn = isLocalSessionWindowValid() && Boolean(currentUserRole);

  return (
    <div style={themeStyle}>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              albums={albums}
              currentUserFullName={currentUserFullName}
              homePageImages={homePageImages}
              isSignedIn={isSignedIn}
              serviceCategories={serviceCategories}
              serviceLoadState={serviceLoadState}
              services={services}
              settings={settings}
              onAlbumOpen={(album) => navigate(`/gallery/${albumSlug(album)}`)}
              onAccountClick={goToAccount}
              onLogout={handleLogout}
              onServicesClick={() => navigate('/services')}
            />
          }
        />
        <Route
          path="/services"
          element={
            <ServicesPage
              currentUserFullName={currentUserFullName}
              isSignedIn={isSignedIn}
              onAccountClick={goToAccount}
              serviceCategories={serviceCategories}
              serviceLoadState={serviceLoadState}
              services={services}
              settings={settings}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/booking" element={<BookingPage settings={settings} onBack={goHome} />} />
        <Route
          path="/gallery/:album"
          element={
            <GalleryAlbumRoute
              albums={albums}
              onAlbumChange={(album) => navigate(`/gallery/${albumSlug(album)}`)}
              onBack={goHome}
            />
          }
        />
        {['/admin', '/admin/:adminSection', '/admin/:adminSection/:customerId'].map((path) => (
          <Route
            key={path}
            path={path}
            element={isSignedIn ? (
              <AdminDashboard
                adminFullName={currentUserFullName}
                bookings={bookings}
                customers={customers}
                galleryAlbums={albums}
                homePageImages={homePageImages}
                reviews={reviews}
                services={services}
                serviceCategories={serviceCategories}
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
                onGalleryAlbumsChange={handleGalleryAlbumsSave}
                onGalleryAlbumDelete={handleGalleryAlbumDelete}
                onHomePageImageDelete={handleHomePageImageDelete}
                onHomePageImagesReorder={handleHomePageImagesReorder}
                onHomePageImagesUpload={handleHomePageImageUpload}
                onLogoUpload={handleLogoUpload}
                onLogout={handleLogout}
                onVisitWebsite={goHome}
                onReviewChange={setReviews}
                onServiceChange={setServices}
                onServiceCreate={handleServiceCreate}
                onServiceDelete={handleServiceDelete}
                onServiceImageUpload={handleServiceImageUpload}
                onServiceUpdate={handleServiceUpdate}
                onServiceCategoriesChange={setServiceCategories}
                onServiceCategoryImageUpload={handleServiceCategoryImageUpload}
                onServiceCategoriesSave={handleServiceCategoriesSave}
                onStaffChange={setStaffMembers}
                onSettingsChange={handleSettingsChange}
                onVoucherChange={setVouchers}
              />
            ) : (
              <AdminLoginGate
                logoUrl={settings.logoUrl}
                onBackHome={goHome}
                onLoginClick={() => setIsLoginOpen(true)}
              />
            )}
          />
        ))}
        <Route
          path="/client"
          element={isSignedIn ? (
            <ClientDashboard
              bookings={bookings}
              photos={clientPhotos}
              profile={demoClientProfile}
              vouchers={vouchers.filter((voucher) => voucher.status === 'Active')}
              onLogout={handleLogout}
              onPhotoAdd={(photo) => setClientPhotos([photo, ...clientPhotos])}
            />
          ) : <Navigate replace to="/" />}
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
      {isLoginOpen ? (
        <LoginModal
          error={loginError}
          onClose={() => {
            setIsLoginOpen(false);
            setLoginError('');
            setMfaFlow(null);
            setPendingAuthProfile(null);
          }}
          onLogin={handleLogin}
          mfaFlow={mfaFlow}
          onMfaVerify={handleMfaVerify}
        />
      ) : null}
    </div>
  );
}

function AdminLoginGate({
  logoUrl,
  onBackHome,
  onLoginClick,
}: {
  logoUrl: string;
  onBackHome: () => void;
  onLoginClick: () => void;
}) {
  return (
    <main className="admin-login-gate">
      <section className="admin-login-card">
        <img src={logoUrl} alt="" />
        <span><LockKeyhole size={18} /> Admin Access</span>
        <h1>K Beauty Salon Admin</h1>
        <p>Login to manage customers, services, gallery, vouchers, and website settings.</p>
        <div>
          <button className="primary-button" type="button" onClick={onLoginClick}>Login</button>
          <button className="outline-button" type="button" onClick={onBackHome}>View Website</button>
        </div>
      </section>
    </main>
  );
}

function GalleryAlbumRoute({
  albums,
  onAlbumChange,
  onBack,
}: {
  albums: GalleryAlbum[];
  onAlbumChange: (album: GalleryAlbum) => void;
  onBack: () => void;
}) {
  const params = useParams();
  const album = albums.find((item) => albumSlug(item) === params.album) ?? albums[0];

  if (!album) {
    return <Navigate replace to="/" />;
  }

  return (
    <GalleryAlbumPage
      album={album}
      albums={albums}
      onAlbumChange={onAlbumChange}
      onBack={onBack}
    />
  );
}
