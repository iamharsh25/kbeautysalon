import { useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import { CalendarDays, Camera, Gift, Home, Image, Mail, MessageSquare, Plus, Settings, Sparkles, Star, Trash2, UserCheck } from 'lucide-react';
import { galleryAlbums } from '../data/initialData';
import type { AdminSection, Booking, GalleryImage, HomePageImage, Lead, Review, Service, SiteSettings, StaffMember, Voucher } from '../types';
import { AdminField, AdminPanel } from '../components/admin/AdminPrimitives';
import { updateListItem } from '../utils/list';

export function AdminDashboard({
  bookings,
  galleryImages,
  homePageImages,
  leads,
  reviews,
  services,
  staffMembers,
  settings,
  vouchers,
  onBookingChange,
  onGalleryChange,
  onHomePageImageDelete,
  onHomePageImagesReorder,
  onHomePageImagesUpload,
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
  homePageImages: HomePageImage[];
  leads: Lead[];
  reviews: Review[];
  services: Service[];
  staffMembers: StaffMember[];
  settings: SiteSettings;
  vouchers: Voucher[];
  onBookingChange: (bookings: Booking[]) => void;
  onGalleryChange: (galleryImages: GalleryImage[]) => void;
  onHomePageImageDelete: (image: HomePageImage) => void | Promise<void>;
  onHomePageImagesReorder: (images: HomePageImage[]) => void | Promise<void>;
  onHomePageImagesUpload: (files: File[]) => void | Promise<void>;
  onLeadChange: (leads: Lead[]) => void;
  onLogout: () => void;
  onReviewChange: (reviews: Review[]) => void;
  onServiceChange: (services: Service[]) => void;
  onStaffChange: (staffMembers: StaffMember[]) => void;
  onSettingsChange: (settings: SiteSettings) => void;
  onVoucherChange: (vouchers: Voucher[]) => void;
}) {
  const [activeSection, setActiveSection] = useState<AdminSection>('home-page');
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [homeImageStatus, setHomeImageStatus] = useState('');
  const activeLabel = adminMenuItems.find((item) => item.id === activeSection)?.label ?? 'Admin';

  async function handleHomeImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    try {
      setHomeImageStatus('Uploading images...');
      await onHomePageImagesUpload(files);
      setHomeImageStatus('Images uploaded.');
    } catch (error) {
      setHomeImageStatus(error instanceof Error ? error.message : 'Images could not be uploaded.');
    } finally {
      input.value = '';
    }
  }

  function handleHomeImageDrop(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();
    if (!draggedImageId || draggedImageId === targetId) return;

    const draggedIndex = homePageImages.findIndex((image) => image.id === draggedImageId);
    const targetIndex = homePageImages.findIndex((image) => image.id === targetId);
    if (draggedIndex < 0 || targetIndex < 0) return;

    const reorderedImages = [...homePageImages];
    const [draggedImage] = reorderedImages.splice(draggedIndex, 1);
    reorderedImages.splice(targetIndex, 0, draggedImage);
    setDraggedImageId(null);
    setHomeImageStatus('Saving image order...');
    void Promise.resolve(onHomePageImagesReorder(reorderedImages))
      .then(() => setHomeImageStatus('Image order saved.'))
      .catch((error) => {
        setHomeImageStatus(error instanceof Error ? error.message : 'Image order could not be saved.');
      });
  }

  function handleHomeImageDelete(image: HomePageImage) {
    setHomeImageStatus('Deleting image...');
    void Promise.resolve(onHomePageImageDelete(image))
      .then(() => setHomeImageStatus('Image deleted.'))
      .catch((error) => {
        setHomeImageStatus(error instanceof Error ? error.message : 'Image could not be deleted.');
      });
  }

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
            <AdminPanel icon={<Home size={20} />} title="Home page carousel">
              <div className="client-upload-panel">
                <div>
                  <strong>Manage homepage images</strong>
                  <p>Upload images from your computer, drag them to change the carousel order, or delete old images.</p>
                </div>
                <label className="small-admin-button">
                  <Camera size={16} />
                  Upload Images
                  <input accept="image/*" multiple type="file" onChange={handleHomeImageUpload} />
                </label>
              </div>

              <div className="home-image-manager">
                {homePageImages.map((image, index) => (
                  <div
                    className="home-image-row"
                    draggable
                    key={image.id}
                    onDragStart={() => setDraggedImageId(image.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleHomeImageDrop(event, image.id)}
                  >
                    <span className="drag-handle">::</span>
                    <img src={image.url} alt={image.title} />
                    <div>
                      <strong>{image.title}</strong>
                      <small>Slide {index + 1}</small>
                    </div>
                    <button
                      className="danger-admin-button"
                      disabled={homePageImages.length === 1}
                      type="button"
                      onClick={() => handleHomeImageDelete(image)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              {homeImageStatus ? <p className="admin-status-text">{homeImageStatus}</p> : null}
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
            <AdminField label="Currency code">
              <input
                value={settings.currencyCode}
                onChange={(event) => onSettingsChange({ ...settings, currencyCode: event.target.value.toUpperCase() })}
              />
            </AdminField>
            <AdminField label="GST percentage">
              <input
                min="0"
                step="0.01"
                type="number"
                value={settings.gstPercent}
                onChange={(event) => onSettingsChange({ ...settings, gstPercent: Number(event.target.value) })}
              />
            </AdminField>
          </AdminPanel>
        ) : null}

        {activeSection === 'services' ? (
          <AdminPanel icon={<Sparkles size={20} />} title="Manage services">
            <button
              className="small-admin-button"
              type="button"
              onClick={() => onServiceChange([...services, { title: 'New Service', description: 'Service description', price: 'From ₹0', image: homePageImages[0]?.url ?? settings.heroImage }])}
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
