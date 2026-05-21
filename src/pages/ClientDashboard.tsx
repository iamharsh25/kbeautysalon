import { useState, type ChangeEvent, type ReactNode } from 'react';
import { CalendarDays, Camera, Ticket, UserRound } from 'lucide-react';
import type { Booking, ClientPhoto, ClientProfile, ClientSection, Voucher } from '../types';
import { AdminField, AdminPanel } from '../components/admin/AdminPrimitives';

export function ClientDashboard({
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

const clientMenuItems: { id: ClientSection; label: string; icon: ReactNode }[] = [
  { id: 'gallery', label: 'My Gallery', icon: <Camera size={18} /> },
  { id: 'vouchers', label: 'My Vouchers', icon: <Ticket size={18} /> },
  { id: 'bookings', label: 'Previous Bookings', icon: <CalendarDays size={18} /> },
  { id: 'account', label: 'My Account', icon: <UserRound size={18} /> },
];
