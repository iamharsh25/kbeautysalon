import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  demoClientProfile,
  galleryAlbums,
  initialBookings,
  initialClientPhotos,
  initialGalleryImages,
  initialHomePageImages,
  initialLeads,
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
import type { GalleryAlbum, HomePageImage, HomePageImageRow } from './types';
import { mapHomePageImage, sanitizeStorageFileName } from './utils/homepageImages';

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
  const [leads, setLeads] = useState(initialLeads);
  const [reviews, setReviews] = useState(initialReviews);
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [staffMembers, setStaffMembers] = useState(initialStaff);
  const [clientPhotos, setClientPhotos] = useState(initialClientPhotos);
  const [homePageImages, setHomePageImages] = useState(initialHomePageImages);
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    async function loadHomePageImages() {
      if (!isSupabaseConfigured || !supabase) return;

      const { data, error } = await supabase
        .from('homepage_images')
        .select('id,title,image_url,storage_path,display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data?.length && isMounted) {
        setHomePageImages(data.map((row) => mapHomePageImage(row as HomePageImageRow)));
      }
    }

    void loadHomePageImages();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleHomePageImageUpload(files: File[]) {
    if (!files.length) return;

    if (!isSupabaseConfigured || !supabase) {
      const nextImages = files.map((file, index) => ({
        id: `${file.name}-${crypto.randomUUID()}`,
        title: file.name.replace(/\.[^.]+$/, ''),
        url: URL.createObjectURL(file),
        displayOrder: homePageImages.length + index,
      }));
      setHomePageImages((currentImages) => [...currentImages, ...nextImages]);
      return;
    }

    const uploadedImages: HomePageImage[] = [];

    for (const file of files) {
      const storagePath = `homepage/${Date.now()}-${crypto.randomUUID()}-${sanitizeStorageFileName(file.name) || 'image'}`;
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(storagePath, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage.from('site-assets').getPublicUrl(storagePath);
      const displayOrder = homePageImages.length + uploadedImages.length;
      const { data, error } = await supabase
        .from('homepage_images')
        .insert({
          title: file.name.replace(/\.[^.]+$/, ''),
          image_url: publicUrlData.publicUrl,
          storage_path: storagePath,
          display_order: displayOrder,
          is_active: true,
        })
        .select('id,title,image_url,storage_path,display_order')
        .single();

      if (error || !data) {
        await supabase.storage.from('site-assets').remove([storagePath]);
        throw new Error(error?.message ?? 'Image record could not be saved.');
      }

      uploadedImages.push(mapHomePageImage(data as HomePageImageRow));
    }

    setHomePageImages((currentImages) => [...currentImages, ...uploadedImages]);
  }

  async function handleHomePageImageDelete(image: HomePageImage) {
    if (homePageImages.length === 1) return;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('homepage_images').delete().eq('id', image.id);
      if (error) {
        throw new Error(error.message);
      }

      if (image.storagePath) {
        await supabase.storage.from('site-assets').remove([image.storagePath]);
      }
    }

    const nextImages = homePageImages
      .filter((item) => item.id !== image.id)
      .map((item, index) => ({ ...item, displayOrder: index }));

    setHomePageImages(nextImages);
    await handleHomePageImagesReorder(nextImages);
  }

  async function handleHomePageImagesReorder(images: HomePageImage[]) {
    const reorderedImages = images.map((image, index) => ({ ...image, displayOrder: index }));
    setHomePageImages(reorderedImages);

    if (!isSupabaseConfigured || !supabase) return;

    const updates = reorderedImages.map((image) =>
      supabase
        .from('homepage_images')
        .update({ display_order: image.displayOrder })
        .eq('id', image.id),
    );
    const results = await Promise.all(updates);
    const failedUpdate = results.find((result) => result.error);
    if (failedUpdate?.error) {
      throw new Error(failedUpdate.error.message);
    }
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
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        setLoginError('Account found, but no profile role is connected yet.');
        return;
      }

      navigate(profile.role === 'admin' || profile.role === 'staff' ? '/admin' : '/client');
      setIsLoginOpen(false);
      setLoginError('');
      return;
    }

    if (email.toLowerCase() === 'admin@kbeautysalon.com' && password === 'preview123') {
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

  return (
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
      <Route
        path="/admin"
        element={
          <AdminDashboard
            bookings={bookings}
            galleryImages={galleryImages}
            homePageImages={homePageImages}
            leads={leads}
            reviews={reviews}
            services={services}
            staffMembers={staffMembers}
            settings={settings}
            vouchers={vouchers}
            onBookingChange={setBookings}
            onGalleryChange={setGalleryImages}
            onHomePageImageDelete={handleHomePageImageDelete}
            onHomePageImagesReorder={handleHomePageImagesReorder}
            onHomePageImagesUpload={handleHomePageImageUpload}
            onLeadChange={setLeads}
            onLogout={goHome}
            onReviewChange={setReviews}
            onServiceChange={setServices}
            onStaffChange={setStaffMembers}
            onSettingsChange={setSettings}
            onVoucherChange={setVouchers}
          />
        }
      />
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
