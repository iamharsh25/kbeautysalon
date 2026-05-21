import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChevronDown, ExternalLink, Gift, Globe2, Home, Image, ImagePlus, LogOut, Mail, Palette, Plus, Save, Search, Settings, Sparkles, Star, Trash2, UploadCloud, UserCheck, UsersRound, X } from 'lucide-react';
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
  const [customerSearch, setCustomerSearch] = useState('');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerDraft, setCustomerDraft] = useState<Customer | null>(null);
  const [voucherToAssign, setVoucherToAssign] = useState(vouchers.find((voucher) => voucher.status === 'Active')?.code ?? vouchers[0]?.code ?? '');
  const [voucherStartDate, setVoucherStartDate] = useState('2026-05-21');
  const [voucherExpiryDate, setVoucherExpiryDate] = useState('2026-08-21');
  const navigate = useNavigate();
  const { adminSection, customerId } = useParams();
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);
  const visibleCustomer = isEditingCustomer && customerDraft ? customerDraft : selectedCustomer;
  const normalizedCustomerSearch = customerSearch.trim().toLowerCase();
  const filteredCustomers = customers.filter((customer) => {
    if (!normalizedCustomerSearch) return true;
    return [customer.fullName, customer.email, customer.mobile]
      .join(' ')
      .toLowerCase()
      .includes(normalizedCustomerSearch);
  });

  useEffect(() => {
    const isValidSection = adminMenuItems.some((item) => item.id === adminSection);
    const nextSection = isValidSection ? adminSection as AdminSection : 'home-page';
    setActiveSection(nextSection);

    if (nextSection === 'customers') {
      setSelectedCustomerId(customerId ?? '');
      setIsEditingCustomer(false);
      setCustomerDraft(null);
      return;
    }

    setSelectedCustomerId('');
    setIsEditingCustomer(false);
    setCustomerDraft(null);
  }, [adminSection, customerId]);

  function navigateToAdminSection(sectionId: AdminSection) {
    setActiveSection(sectionId);
    setIsEditingCustomer(false);
    setCustomerDraft(null);

    if (sectionId === 'home-page') {
      navigate('/admin');
      return;
    }

    if (sectionId === 'customers') {
      setSelectedCustomerId('');
      navigate('/admin/customers');
      return;
    }

    setSelectedCustomerId('');
    navigate(`/admin/${sectionId}`);
  }

  function openCustomerProfile(customer: Customer) {
    setSelectedCustomerId(customer.id);
    setIsEditingCustomer(false);
    setCustomerDraft(null);
    navigate(`/admin/customers/${customer.id}`);
  }

  function goToCustomerList() {
    setSelectedCustomerId('');
    setIsEditingCustomer(false);
    setCustomerDraft(null);
    navigate('/admin/customers');
  }

  function updateCustomerDraft(patch: Partial<Customer>) {
    setCustomerDraft((currentDraft) => currentDraft ? { ...currentDraft, ...patch } : currentDraft);
  }

  function updateCustomerMembershipDraft(patch: Partial<Customer['membership']>) {
    setCustomerDraft((currentDraft) => currentDraft ? {
      ...currentDraft,
      membership: {
        ...currentDraft.membership,
        ...patch,
      },
    } : currentDraft);
  }

  function handleCustomerEdit() {
    if (!selectedCustomer) return;
    setCustomerDraft(JSON.parse(JSON.stringify(selectedCustomer)) as Customer);
    setIsEditingCustomer(true);
  }

  function handleCustomerCancel() {
    setCustomerDraft(null);
    setIsEditingCustomer(false);
  }

  function handleCustomerSave() {
    if (!customerDraft) return;
    onCustomersChange(customers.map((customer) => customer.id === customerDraft.id ? customerDraft : customer));
    setSelectedCustomerId(customerDraft.id);
    setCustomerDraft(null);
    setIsEditingCustomer(false);
  }

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
    if (!window.confirm(`Delete "${image.title}" from the home page carousel? This cannot be undone.`)) return;
    setHomeImageStatus('Deleting image...');
    void Promise.resolve(onHomePageImageDelete(image))
      .then(() => setHomeImageStatus('Image deleted.'))
      .catch((error) => {
        setHomeImageStatus(error instanceof Error ? error.message : 'Image could not be deleted.');
      });
  }

  function handleCreateCustomer(event: FormEvent<HTMLFormElement>) {
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
    openCustomerProfile(nextCustomer);
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

  function handleDeleteCustomerVoucher(voucherIndex: number) {
    if (!selectedCustomer) return;
    const voucher = selectedCustomer.vouchers[voucherIndex];
    if (!voucher) return;
    if (!window.confirm(`Remove voucher "${voucher.voucherCode}" from ${selectedCustomer.fullName}? This cannot be undone.`)) return;

    const nextCustomers = customers.map((customer) => {
      if (customer.id !== selectedCustomer.id) return customer;
      return {
        ...customer,
        vouchers: customer.vouchers.filter((_, index) => index !== voucherIndex),
      };
    });

    onCustomersChange(nextCustomers);
    if (customerDraft?.id === selectedCustomer.id) {
      setCustomerDraft({
        ...customerDraft,
        vouchers: customerDraft.vouchers.filter((_, index) => index !== voucherIndex),
      });
    }
  }

  function handleDeleteService(index: number, service: Service) {
    if (!window.confirm(`Delete "${service.title}" from the service menu? This cannot be undone.`)) return;
    onServiceChange(services.filter((_, itemIndex) => itemIndex !== index));
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
              onClick={() => navigateToAdminSection(item.id)}
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
            <AdminPanel icon={<UsersRound size={20} />} title={visibleCustomer ? 'Customer profile' : 'Manage Customers'}>
              {visibleCustomer ? (
                <div className="customer-detail">
                  <div className="customer-detail-actions">
                    <button className="back-button admin-back-button" type="button" onClick={goToCustomerList}>
                      <ArrowLeft size={16} />
                      Back to customers
                    </button>
                    <div>
                      {isEditingCustomer ? (
                        <>
                          <button className="small-admin-button" type="button" onClick={handleCustomerSave}>
                            <Save size={16} />
                            Save
                          </button>
                          <button className="outline-admin-button cancel-admin-button" type="button" onClick={handleCustomerCancel}>
                            <X size={16} />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button className="small-admin-button" type="button" onClick={handleCustomerEdit}>
                          <Settings size={16} />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  {isEditingCustomer && customerDraft ? (
                    <div className="customer-edit-card">
                      <div className="customer-edit-avatar">
                        <img src={customerDraft.profilePictureUrl} alt="" />
                        <AdminField label="Profile Picture URL">
                          <input
                            value={customerDraft.profilePictureUrl}
                            onChange={(event) => updateCustomerDraft({ profilePictureUrl: event.target.value })}
                          />
                        </AdminField>
                      </div>
                      <div className="customer-edit-grid">
                        <AdminField label="Full Name">
                          <input value={customerDraft.fullName} onChange={(event) => updateCustomerDraft({ fullName: event.target.value })} />
                        </AdminField>
                        <AdminField label="Email">
                          <input type="email" value={customerDraft.email} onChange={(event) => updateCustomerDraft({ email: event.target.value })} />
                        </AdminField>
                        <AdminField label="Mobile Number">
                          <input value={customerDraft.mobile} onChange={(event) => updateCustomerDraft({ mobile: event.target.value })} />
                        </AdminField>
                        <AdminField label="Address">
                          <input value={customerDraft.address} onChange={(event) => updateCustomerDraft({ address: event.target.value })} />
                        </AdminField>
                        <AdminField label="Notes">
                          <textarea value={customerDraft.notes} onChange={(event) => updateCustomerDraft({ notes: event.target.value })} />
                        </AdminField>
                      </div>
                    </div>
                  ) : (
                    <div className="customer-profile-card">
                      <img src={visibleCustomer.profilePictureUrl} alt="" />
                      <div>
                        <span>Customer Details</span>
                        <h2>{visibleCustomer.fullName}</h2>
                        <p>{visibleCustomer.email}</p>
                        <p>{visibleCustomer.mobile}</p>
                        <p>{visibleCustomer.address}</p>
                        {visibleCustomer.notes ? <p>{visibleCustomer.notes}</p> : null}
                      </div>
                    </div>
                  )}

                  <div className="customer-detail-grid">
                    <section className="customer-info-box">
                      <h3>Membership</h3>
                      {isEditingCustomer && customerDraft ? (
                        <div className="membership-edit-grid">
                          <AdminField label="Salon Member">
                            <select
                              value={customerDraft.membership.isMember ? 'yes' : 'no'}
                              onChange={(event) => updateCustomerMembershipDraft({ isMember: event.target.value === 'yes' })}
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </AdminField>
                          <AdminField label="Start Date">
                            <input
                              type="date"
                              value={customerDraft.membership.startDate}
                              onChange={(event) => updateCustomerMembershipDraft({ startDate: event.target.value })}
                            />
                          </AdminField>
                          <AdminField label="End Date">
                            <input
                              type="date"
                              value={customerDraft.membership.endDate}
                              onChange={(event) => updateCustomerMembershipDraft({ endDate: event.target.value })}
                            />
                          </AdminField>
                          <AdminField label="Membership Fee">
                            <input
                              min="0"
                              type="number"
                              value={customerDraft.membership.fee}
                              onChange={(event) => updateCustomerMembershipDraft({ fee: Number(event.target.value) })}
                            />
                          </AdminField>
                          <AdminField label="Paid Date">
                            <input
                              type="date"
                              value={customerDraft.membership.paidDate}
                              onChange={(event) => updateCustomerMembershipDraft({ paidDate: event.target.value })}
                            />
                          </AdminField>
                        </div>
                      ) : (
                        <dl>
                          <div><dt>Salon Member</dt><dd>{visibleCustomer.membership.isMember ? 'Yes' : 'No'}</dd></div>
                          <div><dt>Start Date</dt><dd>{visibleCustomer.membership.startDate || 'Not started'}</dd></div>
                          <div><dt>End Date</dt><dd>{visibleCustomer.membership.endDate || 'Not set'}</dd></div>
                          <div><dt>Membership Fee</dt><dd>{formatCurrency(visibleCustomer.membership.fee)}</dd></div>
                          <div><dt>Paid Date</dt><dd>{visibleCustomer.membership.paidDate || 'Not paid'}</dd></div>
                        </dl>
                      )}
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
                          {visibleCustomer.serviceHistory.length ? visibleCustomer.serviceHistory.map((history) => (
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
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleCustomer.vouchers.length ? visibleCustomer.vouchers.map((voucher, index) => (
                            <tr key={`${voucher.voucherCode}-${index}`}>
                              <td>{voucher.voucherCode}</td>
                              <td>{voucher.startDate}</td>
                              <td>{voucher.expiryDate}</td>
                              <td><span className={voucher.status === 'Voucher Used' ? 'status-pill used' : 'status-pill'}>{voucher.status}</span></td>
                              <td>{voucher.discountType}</td>
                              <td>{voucher.discountValue}</td>
                              <td>
                                <button className="danger-admin-button compact-danger-button" type="button" onClick={() => handleDeleteCustomerVoucher(index)}>
                                  <Trash2 size={15} />
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={7}>No vouchers assigned yet.</td></tr>
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

                  <div className="customer-list-toolbar">
                    <label className="customer-search-field">
                      <Search size={18} />
                      <input
                        value={customerSearch}
                        placeholder="Search by name, email, or mobile"
                        onChange={(event) => setCustomerSearch(event.target.value)}
                      />
                    </label>
                    <span>{filteredCustomers.length} customer{filteredCustomers.length === 1 ? '' : 's'}</span>
                  </div>

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
                        {filteredCustomers.length ? filteredCustomers.map((customer) => (
                          <tr key={customer.id} onClick={() => openCustomerProfile(customer)}>
                            <td>
                              <span className="customer-name-cell">
                                <img src={customer.profilePictureUrl} alt="" />
                                {customer.fullName}
                              </span>
                            </td>
                            <td>{customer.email}</td>
                            <td>{customer.mobile}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={3}>No customers match your search.</td>
                          </tr>
                        )}
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
                <button className="danger-admin-button" type="button" onClick={() => handleDeleteService(index, service)}>
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
