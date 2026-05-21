import { useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import { ArrowLeft, CalendarDays, ChevronDown, ExternalLink, Gift, Globe2, Home, Image, ImagePlus, LogOut, Mail, Palette, Plus, Settings, Sparkles, Star, Trash2, UploadCloud, UserCheck, UsersRound } from 'lucide-react';
import { galleryAlbums } from '../data/initialData';
import type { AdminSection, Booking, Customer, GalleryImage, HomePageImage, Review, Service, SiteSettings, StaffMember, Voucher } from '../types';
import { AdminField, AdminPanel } from '../components/admin/AdminPrimitives';
import { updateListItem } from '../utils/list';
import { formatCurrency } from '../utils/format';

export function AdminDashboard({
  adminFullName,
  bookings,
  customers,
  galleryImages,
  homePageImages,
  reviews,
  services,
  staffMembers,
  settings,
  vouchers,
  onBookingChange,
  onCustomersChange,
  onGalleryChange,
  onHomePageImageDelete,
  onHomePageImagesReorder,
  onHomePageImagesUpload,
  onLogout,
  onReviewChange,
  onServiceChange,
  onStaffChange,
  onSettingsChange,
  onVoucherChange,
}: {
  adminFullName: string;
  bookings: Booking[];
  customers: Customer[];
  galleryImages: GalleryImage[];
  homePageImages: HomePageImage[];
  reviews: Review[];
  services: Service[];
  staffMembers: StaffMember[];
  settings: SiteSettings;
  vouchers: Voucher[];
  onBookingChange: (bookings: Booking[]) => void;
  onCustomersChange: (customers: Customer[]) => void;
  onGalleryChange: (galleryImages: GalleryImage[]) => void;
  onHomePageImageDelete: (image: HomePageImage) => void | Promise<void>;
  onHomePageImagesReorder: (images: HomePageImage[]) => void | Promise<void>;
  onHomePageImagesUpload: (files: File[]) => void | Promise<void>;
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
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [voucherToAssign, setVoucherToAssign] = useState(vouchers.find((voucher) => voucher.status === 'Active')?.code ?? vouchers[0]?.code ?? '');
  const [voucherStartDate, setVoucherStartDate] = useState('2026-05-21');
  const [voucherExpiryDate, setVoucherExpiryDate] = useState('2026-08-21');
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);

  async function uploadHomeImages(files: File[]) {
    if (!files.length) return;

    try {
      setHomeImageStatus('Uploading images...');
      await onHomePageImagesUpload(files);
      setHomeImageStatus('Images uploaded.');
    } catch (error) {
      setHomeImageStatus(error instanceof Error ? error.message : 'Images could not be uploaded.');
    }
  }

  async function handleHomeImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(event.target.files ?? []);
    await uploadHomeImages(files);
    input.value = '';
  }

  function handleHomeImageFileDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void uploadHomeImages(Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith('image/')));
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onSettingsChange({ ...settings, logoUrl: URL.createObjectURL(file) });
      event.target.value = '';
    }
  }

  function handleLogoDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith('image/'));
    if (file) {
      onSettingsChange({ ...settings, logoUrl: URL.createObjectURL(file) });
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

  function handleCreateCustomer(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const mobile = String(formData.get('mobile') ?? '').trim();
    if (!fullName || (!email && !mobile)) return;

    const nextCustomer: Customer = {
      id: `customer-${crypto.randomUUID()}`,
      profilePictureUrl: '/homepage/logo-wo-bg.png',
      fullName,
      email,
      mobile,
      address: String(formData.get('address') ?? '').trim(),
      notes: 'New customer profile created by admin.',
      membership: {
        isMember: false,
        startDate: '',
        endDate: '',
        fee: 0,
        paidDate: '',
      },
      serviceHistory: [],
      vouchers: [],
    };

    onCustomersChange([nextCustomer, ...customers]);
    setSelectedCustomerId(nextCustomer.id);
    event.currentTarget.reset();
  }

  function handleAssignVoucher() {
    if (!selectedCustomer || !voucherToAssign || !voucherStartDate || !voucherExpiryDate) return;
    const voucher = vouchers.find((item) => item.code === voucherToAssign);
    if (!voucher) return;

    onCustomersChange(customers.map((customer) => {
      if (customer.id !== selectedCustomer.id) return customer;

      return {
        ...customer,
        vouchers: [
          {
            voucherCode: voucher.code,
            startDate: voucherStartDate,
            expiryDate: voucherExpiryDate,
            status: 'Voucher Not Used',
            discountType: voucher.discountType ?? (voucher.value.includes('%') ? 'Percentage Off' : 'Amount Off'),
            discountValue: voucher.discountValue ?? voucher.value,
          },
          ...customer.vouchers,
        ],
      };
    }));
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img className="brand-logo" src={settings.logoUrl} alt="" />
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
          <Globe2 size={18} />
          View Website
          <ExternalLink size={16} />
        </button>
      </aside>

      <section className="admin-content">
        <div className="admin-topbar">
          <div>
            <p>Client Admin</p>
            <h1>Welcome back! <span aria-hidden="true">👋</span></h1>
            <span>Here's what's happening with your salon website.</span>
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-user-menu">
              <button
                className="admin-user-button"
                type="button"
                aria-expanded={isAdminMenuOpen}
                onClick={() => setIsAdminMenuOpen((isOpen) => !isOpen)}
              >
                <img src={settings.logoUrl} alt="" />
                {adminFullName}
                <ChevronDown size={18} />
              </button>
              {isAdminMenuOpen ? (
                <div className="admin-user-dropdown">
                  <button type="button" onClick={onLogout}>
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {activeSection === 'home-page' ? (
          <div className="home-settings-grid">
            <AdminPanel icon={<Home size={20} />} title="Home page carousel">
              <label
                className="admin-dropzone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleHomeImageFileDrop}
              >
                <span>
                  <UploadCloud size={28} />
                </span>
                <strong>Drop homepage images here</strong>
                <small>or browse from your computer. You can drag slides below to change the order.</small>
                <b>
                  <ImagePlus size={16} />
                  Browse Images
                </b>
                <input aria-label="Upload homepage images" accept="image/*" multiple type="file" onChange={handleHomeImageUpload} />
              </label>

              {homeImageStatus ? <p className="admin-status-text">{homeImageStatus}</p> : null}

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
              <div className="admin-tip-row">
                <Sparkles size={16} />
                Tip: Drag and drop the slides to reorder them.
              </div>
              <div className="admin-website-card">
                <img src="/homepage/salon_2.jpg" alt="" />
                <div>
                  <strong>Your website is looking great!</strong>
                  <p>Keep your content updated to attract more clients and grow your business.</p>
                  <button className="small-admin-button" type="button" onClick={onLogout}>
                    View Website
                    <ExternalLink size={15} />
                  </button>
                </div>
              </div>
            </AdminPanel>

            <AdminPanel icon={<Palette size={20} />} title="Logo and theme">
              <div className="brand-settings-card">
                <div className="logo-preview-card">
                  <strong>Current logo</strong>
                  <img src={settings.logoUrl} alt="Current logo preview" />
                </div>
                <label
                  className="admin-dropzone compact"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleLogoDrop}
                >
                  <span>
                    <UploadCloud size={22} />
                  </span>
                  <strong>Drop logo here</strong>
                  <small>Transparent PNG works best.</small>
                  <b>
                    <ImagePlus size={16} />
                    Browse Logo
                  </b>
                  <input aria-label="Upload logo" accept="image/*" type="file" onChange={handleLogoUpload} />
                </label>
              </div>

              <div className="theme-control-grid">
                <AdminField label="Primary colour">
                  <div className="color-input-row">
                    <input
                      aria-label="Primary colour picker"
                      type="color"
                      value={settings.themePrimaryColor}
                      onChange={(event) => onSettingsChange({ ...settings, themePrimaryColor: event.target.value })}
                    />
                    <input
                      value={settings.themePrimaryColor}
                      onChange={(event) => onSettingsChange({ ...settings, themePrimaryColor: event.target.value })}
                    />
                  </div>
                </AdminField>
                <AdminField label="Accent colour">
                  <div className="color-input-row">
                    <input
                      aria-label="Accent colour picker"
                      type="color"
                      value={settings.themeAccentColor}
                      onChange={(event) => onSettingsChange({ ...settings, themeAccentColor: event.target.value })}
                    />
                    <input
                      value={settings.themeAccentColor}
                      onChange={(event) => onSettingsChange({ ...settings, themeAccentColor: event.target.value })}
                    />
                  </div>
                </AdminField>
              </div>
            </AdminPanel>

            <AdminPanel icon={<Settings size={20} />} title="Website details">
              <div className="website-details-grid">
                <AdminField label="Phone">
                  <input value={settings.phone} onChange={(event) => onSettingsChange({ ...settings, phone: event.target.value })} />
                </AdminField>
                <AdminField label="Email">
                  <input value={settings.email} onChange={(event) => onSettingsChange({ ...settings, email: event.target.value })} />
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
                <AdminField label="Address">
                  <textarea value={settings.address} onChange={(event) => onSettingsChange({ ...settings, address: event.target.value })} />
                </AdminField>
              </div>
            </AdminPanel>
          </div>
        ) : null}

        {activeSection === 'customers' ? (
          <div className="customers-workspace">
            <AdminPanel icon={<UsersRound size={20} />} title={selectedCustomer ? 'Customer profile' : 'Manage Customers'}>
              {selectedCustomer ? (
                <div className="customer-detail">
                  <button className="back-button admin-back-button" type="button" onClick={() => setSelectedCustomerId('')}>
                    <ArrowLeft size={16} />
                    Back to customers
                  </button>
                  <div className="customer-profile-card">
                    <img src={selectedCustomer.profilePictureUrl} alt="" />
                    <div>
                      <span>Customer Details</span>
                      <h2>{selectedCustomer.fullName}</h2>
                      <p>{selectedCustomer.email}</p>
                      <p>{selectedCustomer.mobile}</p>
                      <p>{selectedCustomer.address}</p>
                    </div>
                  </div>

                  <div className="customer-detail-grid">
                    <section className="customer-info-box">
                      <h3>Membership</h3>
                      <dl>
                        <div><dt>Salon Member</dt><dd>{selectedCustomer.membership.isMember ? 'Yes' : 'No'}</dd></div>
                        <div><dt>Start Date</dt><dd>{selectedCustomer.membership.startDate || 'Not started'}</dd></div>
                        <div><dt>End Date</dt><dd>{selectedCustomer.membership.endDate || 'Not set'}</dd></div>
                        <div><dt>Membership Fee</dt><dd>{formatCurrency(selectedCustomer.membership.fee)}</dd></div>
                        <div><dt>Paid Date</dt><dd>{selectedCustomer.membership.paidDate || 'Not paid'}</dd></div>
                      </dl>
                    </section>

                    <section className="customer-info-box">
                      <h3>Allocate Voucher</h3>
                      <AdminField label="Voucher">
                        <select value={voucherToAssign} onChange={(event) => setVoucherToAssign(event.target.value)}>
                          {vouchers.filter((voucher) => voucher.status === 'Active').map((voucher) => (
                            <option key={voucher.code} value={voucher.code}>{voucher.code} - {voucher.value}</option>
                          ))}
                        </select>
                      </AdminField>
                      <div className="customer-voucher-form">
                        <AdminField label="Start date">
                          <input type="date" value={voucherStartDate} onChange={(event) => setVoucherStartDate(event.target.value)} />
                        </AdminField>
                        <AdminField label="Expiry date">
                          <input type="date" value={voucherExpiryDate} onChange={(event) => setVoucherExpiryDate(event.target.value)} />
                        </AdminField>
                      </div>
                      <button className="small-admin-button" type="button" onClick={handleAssignVoucher}>
                        <Gift size={16} />
                        Allocate Voucher
                      </button>
                    </section>
                  </div>

                  <section className="customer-info-box">
                    <h3>Services History</h3>
                    <div className="customer-table-wrap">
                      <table className="customer-data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Service Name</th>
                            <th>Staff Name</th>
                            <th>Amount Paid</th>
                            <th>Payment</th>
                            <th>Discount</th>
                            <th>Voucher Used</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCustomer.serviceHistory.length ? selectedCustomer.serviceHistory.map((history) => (
                            <tr key={`${history.date}-${history.serviceName}`}>
                              <td>{history.date}</td>
                              <td>{history.time}</td>
                              <td>{history.serviceName}</td>
                              <td>{history.staffName}</td>
                              <td>{formatCurrency(history.amountPaid)}</td>
                              <td>{history.paymentMethod}</td>
                              <td>{formatCurrency(history.discountAmount)}</td>
                              <td>{history.voucherUsed}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={8}>No service history yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="customer-info-box">
                    <h3>Customer Vouchers</h3>
                    <div className="customer-table-wrap">
                      <table className="customer-data-table">
                        <thead>
                          <tr>
                            <th>Voucher Code</th>
                            <th>Start Date</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                            <th>Discount Type</th>
                            <th>Discount Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCustomer.vouchers.length ? selectedCustomer.vouchers.map((voucher, index) => (
                            <tr key={`${voucher.voucherCode}-${index}`}>
                              <td>{voucher.voucherCode}</td>
                              <td>{voucher.startDate}</td>
                              <td>{voucher.expiryDate}</td>
                              <td><span className={voucher.status === 'Voucher Used' ? 'status-pill used' : 'status-pill'}>{voucher.status}</span></td>
                              <td>{voucher.discountType}</td>
                              <td>{voucher.discountValue}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={6}>No vouchers assigned yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              ) : (
                <>
                  <form className="customer-create-form" onSubmit={handleCreateCustomer}>
                    <AdminField label="Full Name">
                      <input name="fullName" placeholder="Customer full name" />
                    </AdminField>
                    <AdminField label="Email">
                      <input name="email" placeholder="customer@example.com" type="email" />
                    </AdminField>
                    <AdminField label="Mobile Number">
                      <input name="mobile" placeholder="98765 43210" />
                    </AdminField>
                    <AdminField label="Address">
                      <input name="address" placeholder="Customer address" />
                    </AdminField>
                    <button className="small-admin-button" type="submit">
                      <Plus size={16} />
                      Create Customer
                    </button>
                  </form>

                  <div className="customer-table-wrap">
                    <table className="customer-data-table customer-list-table">
                      <thead>
                        <tr>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Mobile Number</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id} onClick={() => setSelectedCustomerId(customer.id)}>
                            <td>
                              <span className="customer-name-cell">
                                <img src={customer.profilePictureUrl} alt="" />
                                {customer.fullName}
                              </span>
                            </td>
                            <td>{customer.email}</td>
                            <td>{customer.mobile}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </AdminPanel>
          </div>
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
  { id: 'customers', label: 'Manage Customers', icon: <Mail size={18} /> },
  { id: 'bookings', label: 'Bookings', icon: <CalendarDays size={18} /> },
  { id: 'gallery', label: 'Manage Gallery', icon: <Image size={18} /> },
  { id: 'website-details', label: 'Manage Website Details', icon: <Settings size={18} /> },
  { id: 'services', label: 'Manage Service', icon: <Sparkles size={18} /> },
  { id: 'staff', label: 'Manage Staff', icon: <UserCheck size={18} /> },
  { id: 'reviews', label: 'Client Review', icon: <Star size={18} /> },
  { id: 'vouchers', label: 'Voucher Management', icon: <Gift size={18} /> },
];
