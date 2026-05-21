import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Gift, Globe2, Home, Image, ImagePlus, LogOut, Mail, Palette, Pencil, Plus, Save, Search, Settings, Sparkles, Star, Tags, Trash2, UploadCloud, UserCheck, UsersRound, X } from 'lucide-react';
import { galleryAlbums } from '../data/initialData';
import type { AdminSection, Booking, Customer, CustomerVoucher, GalleryImage, HomePageImage, Review, Service, SiteSettings, StaffMember, Voucher } from '../types';
import { AdminField, AdminPanel } from '../components/admin/AdminPrimitives';
import { updateListItem } from '../utils/list';
import { formatCurrency, formatDisplayDate } from '../utils/format';

type ConfirmDialogState = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

type ServiceCategory = {
  name: string;
  subCategories: string[];
};

const SERVICES_PER_PAGE = 10;
const defaultServiceCategories: ServiceCategory[] = [
  { name: 'Hair Style', subCategories: ['Hair Cut', 'Hair Wash', 'Hair Smoothing'] },
  { name: 'Make Up', subCategories: ['Occasion', 'Bridal', 'Party'] },
  { name: 'Nails', subCategories: ['Manicure', 'Gel Nails', 'Nail Art'] },
  { name: 'Beauty Treatments', subCategories: ['Facial', 'Brows', 'Korean Treatment'] },
  { name: 'Professional Shoot', subCategories: ['Makeup', 'Hair Styling'] },
];

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
  onCustomerCreate,
  onCustomerUpdate,
  onCustomerVoucherAssign,
  onCustomerVoucherDelete,
  onCustomersChange,
  onGalleryChange,
  onHomePageImageDelete,
  onHomePageImagesReorder,
  onHomePageImagesUpload,
  onLogoUpload,
  onLogout,
  onReviewChange,
  onServiceChange,
  onServiceCreate,
  onServiceDelete,
  onServiceUpdate,
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
  onCustomerCreate: (customer: Customer) => Customer | Promise<Customer>;
  onCustomerUpdate: (customer: Customer) => Customer | Promise<Customer>;
  onCustomerVoucherAssign: (customerId: string, voucher: CustomerVoucher) => CustomerVoucher | Promise<CustomerVoucher>;
  onCustomerVoucherDelete: (customerId: string, voucherCode: string, voucherIndex: number, voucherAssignmentId?: string) => void | Promise<void>;
  onCustomersChange: (customers: Customer[]) => void;
  onGalleryChange: (galleryImages: GalleryImage[]) => void;
  onHomePageImageDelete: (image: HomePageImage) => void | Promise<void>;
  onHomePageImagesReorder: (images: HomePageImage[]) => void | Promise<void>;
  onHomePageImagesUpload: (files: File[]) => void | Promise<void>;
  onLogoUpload: (file: File) => string | Promise<string>;
  onLogout: () => void;
  onReviewChange: (reviews: Review[]) => void;
  onServiceChange: (services: Service[]) => void;
  onServiceCreate: (service: Service) => Service | Promise<Service>;
  onServiceDelete: (service: Service, index: number) => void | Promise<void>;
  onServiceUpdate: (service: Service, index: number) => Service | Promise<Service>;
  onStaffChange: (staffMembers: StaffMember[]) => void;
  onSettingsChange: (settings: SiteSettings) => void | Promise<void>;
  onVoucherChange: (vouchers: Voucher[]) => void;
}) {
  const [activeSection, setActiveSection] = useState<AdminSection>('home-page');
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [homeImageStatus, setHomeImageStatus] = useState('');
  const [isEditingHomePage, setIsEditingHomePage] = useState(false);
  const [homeSettingsDraft, setHomeSettingsDraft] = useState(settings);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerDraft, setCustomerDraft] = useState<Customer | null>(null);
  const [isCustomerCreateOpen, setIsCustomerCreateOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [voucherToAssign, setVoucherToAssign] = useState(vouchers.find((voucher) => voucher.status === 'Active')?.code ?? vouchers[0]?.code ?? '');
  const [voucherStartDate, setVoucherStartDate] = useState('2026-05-21');
  const [voucherExpiryDate, setVoucherExpiryDate] = useState('2026-08-21');
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All Categories');
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [serviceDraft, setServiceDraft] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [servicePage, setServicePage] = useState(1);
  const [serviceCategories, setServiceCategories] = useState(defaultServiceCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySubCategories, setNewCategorySubCategories] = useState('');
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
  const serviceCategoryOptions = ['All Categories', ...serviceCategories.map((category) => category.name)];
  const normalizedServiceSearch = serviceSearch.trim().toLowerCase();
  const normalizedServices = services
    .map((service, index) => normalizeAdminService(service, index))
    .sort((firstService, secondService) => (firstService.displayOrder ?? 0) - (secondService.displayOrder ?? 0));
  const filteredServices = normalizedServices.filter((service) => {
    const matchesCategory = serviceCategoryFilter === 'All Categories' || service.category === serviceCategoryFilter;
    const matchesSearch = !normalizedServiceSearch
      || [service.title, service.category, service.subCategory, service.description].join(' ').toLowerCase().includes(normalizedServiceSearch);
    return matchesCategory && matchesSearch;
  });
  const totalServicePages = Math.max(1, Math.ceil(filteredServices.length / SERVICES_PER_PAGE));
  const currentServicePage = Math.min(servicePage, totalServicePages);
  const paginatedServices = filteredServices.slice((currentServicePage - 1) * SERVICES_PER_PAGE, currentServicePage * SERVICES_PER_PAGE);
  const activeServiceCount = normalizedServices.filter((service) => service.isActive).length;
  const rangeServiceCount = normalizedServices.filter((service) => service.serviceType === 'Price Range').length;
  const contactServiceCount = normalizedServices.filter((service) => service.serviceType === 'Contact for Price').length;
  const homeSettings = isEditingHomePage ? homeSettingsDraft : settings;
  const selectedServiceCategory = serviceCategories.find((category) => category.name === serviceDraft?.category);
  const selectedServiceSubCategories = selectedServiceCategory?.subCategories ?? [];

  useEffect(() => {
    if (!isEditingHomePage) {
      setHomeSettingsDraft(settings);
    }
  }, [isEditingHomePage, settings]);

  useEffect(() => {
    setServicePage(1);
  }, [serviceSearch, serviceCategoryFilter]);

  useEffect(() => {
    setServiceCategories((currentCategories) => {
      const nextCategories = [...currentCategories];
      for (const service of services) {
        const categoryName = service.category || 'Hair Style';
        const subCategoryName = service.subCategory || '';
        const category = nextCategories.find((item) => item.name === categoryName);
        if (!category) {
          nextCategories.push({ name: categoryName, subCategories: subCategoryName ? [subCategoryName] : [] });
        } else if (subCategoryName && !category.subCategories.includes(subCategoryName)) {
          category.subCategories = [...category.subCategories, subCategoryName];
        }
      }
      return nextCategories;
    });
  }, [services]);

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
    setIsEditingHomePage(false);
    setHomeSettingsDraft(settings);
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

    if (sectionId === 'services') {
      setIsServiceModalOpen(false);
      setIsCategoryModalOpen(false);
      setEditingServiceIndex(null);
      setServiceDraft(null);
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

  async function handleCustomerSave() {
    if (!customerDraft) return;
    const updatedCustomer = await onCustomerUpdate(customerDraft);
    onCustomersChange(customers.map((customer) => customer.id === updatedCustomer.id ? updatedCustomer : customer));
    setSelectedCustomerId(updatedCustomer.id);
    setCustomerDraft(null);
    setIsEditingCustomer(false);
  }

  function requestConfirmation(dialog: ConfirmDialogState) {
    setConfirmDialog(dialog);
  }

  function closeConfirmation() {
    setConfirmDialog(null);
  }

  function confirmAction() {
    const action = confirmDialog?.onConfirm;
    setConfirmDialog(null);
    action?.();
  }

  function handleHomePageEdit() {
    setHomeSettingsDraft(settings);
    setIsEditingHomePage(true);
  }

  function handleHomePageCancel() {
    setHomeSettingsDraft(settings);
    setHomeImageStatus('');
    setIsEditingHomePage(false);
  }

  async function handleHomePageSave() {
    setHomeImageStatus('Saving home page settings...');
    try {
      await onSettingsChange(homeSettingsDraft);
      setHomeImageStatus('Home page settings saved.');
      setIsEditingHomePage(false);
    } catch (error) {
      setHomeImageStatus(error instanceof Error ? error.message : 'Home page settings could not be saved.');
    }
  }

  function updateHomeSettingsDraft(patch: Partial<SiteSettings>) {
    setHomeSettingsDraft((currentSettings) => ({ ...currentSettings, ...patch }));
  }

  async function uploadHomeImages(files: File[]) {
    if (!isEditingHomePage) return;
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

  async function uploadLogoFile(file: File) {
    if (!isEditingHomePage) return;
    try {
      setHomeImageStatus('Uploading logo...');
      const logoUrl = await onLogoUpload(file);
      updateHomeSettingsDraft({ logoUrl });
      setHomeImageStatus('Logo uploaded. Click Save to publish it.');
    } catch (error) {
      setHomeImageStatus(error instanceof Error ? error.message : 'Logo could not be uploaded.');
    }
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    if (!isEditingHomePage) return;
    const file = event.target.files?.[0];
    if (file) {
      void uploadLogoFile(file);
      event.target.value = '';
    }
  }

  function handleLogoDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (!isEditingHomePage) return;
    const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith('image/'));
    if (file) {
      void uploadLogoFile(file);
    }
  }

  function handleHomeImageDrop(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();
    if (!isEditingHomePage) return;
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
    if (!isEditingHomePage) return;
    requestConfirmation({
      title: 'Delete home page image?',
      message: `This will remove "${image.title}" from the home page carousel.`,
      confirmLabel: 'Delete Image',
      onConfirm: () => {
        setHomeImageStatus('Deleting image...');
        void Promise.resolve(onHomePageImageDelete(image))
          .then(() => setHomeImageStatus('Image deleted.'))
          .catch((error) => {
            setHomeImageStatus(error instanceof Error ? error.message : 'Image could not be deleted.');
          });
      },
    });
  }

  async function handleCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const fullName = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const mobile = String(formData.get('mobile') ?? '').trim();
    const voucherCode = String(formData.get('voucherCode') ?? '').trim();
    const voucher = vouchers.find((item) => item.code === voucherCode);
    if (!fullName || (!email && !mobile)) return;

    const assignedVoucher: CustomerVoucher[] = voucher ? [{
      voucherCode: voucher.code,
      startDate: String(formData.get('voucherStartDate') ?? '').trim(),
      expiryDate: String(formData.get('voucherExpiryDate') ?? '').trim(),
      status: 'Voucher Not Used',
      discountType: voucher.discountType ?? (voucher.value.includes('%') ? 'Percentage Off' : 'Amount Off'),
      discountValue: voucher.discountValue ?? voucher.value,
    }] : [];

    const nextCustomer: Customer = {
      id: `customer-${crypto.randomUUID()}`,
      profilePictureUrl: '/homepage/logo-wo-bg.png',
      fullName,
      email,
      mobile,
      address: String(formData.get('address') ?? '').trim(),
      notes: String(formData.get('notes') ?? '').trim(),
      membership: {
        isMember: String(formData.get('isMember') ?? 'no') === 'yes',
        startDate: String(formData.get('membershipStartDate') ?? '').trim(),
        endDate: String(formData.get('membershipEndDate') ?? '').trim(),
        fee: Number(formData.get('membershipFee') ?? 0),
        paidDate: String(formData.get('membershipPaidDate') ?? '').trim(),
      },
      serviceHistory: [],
      vouchers: assignedVoucher,
    };

    const createdCustomer = await onCustomerCreate(nextCustomer);
    onCustomersChange([createdCustomer, ...customers]);
    setIsCustomerCreateOpen(false);
    openCustomerProfile(createdCustomer);
    form.reset();
  }

  async function handleAssignVoucher() {
    if (!selectedCustomer || !voucherToAssign || !voucherStartDate || !voucherExpiryDate) return;
    const voucher = vouchers.find((item) => item.code === voucherToAssign);
    if (!voucher) return;

    const customerVoucher: CustomerVoucher = {
      voucherCode: voucher.code,
      startDate: voucherStartDate,
      expiryDate: voucherExpiryDate,
      status: 'Voucher Not Used',
      discountType: voucher.discountType ?? (voucher.value.includes('%') ? 'Percentage Off' : 'Amount Off'),
      discountValue: voucher.discountValue ?? voucher.value,
    };

    const assignedVoucher = await onCustomerVoucherAssign(selectedCustomer.id, customerVoucher);
    onCustomersChange(customers.map((customer) => {
      if (customer.id !== selectedCustomer.id) return customer;

      return {
        ...customer,
        vouchers: [
          assignedVoucher,
          ...customer.vouchers,
        ],
      };
    }));
  }

  function handleDeleteCustomerVoucher(voucherIndex: number) {
    if (!selectedCustomer) return;
    const voucher = selectedCustomer.vouchers[voucherIndex];
    if (!voucher) return;

    requestConfirmation({
      title: 'Remove customer voucher?',
      message: `This will remove voucher "${voucher.voucherCode}" from ${selectedCustomer.fullName}.`,
      confirmLabel: 'Remove Voucher',
      onConfirm: () => {
        void onCustomerVoucherDelete(selectedCustomer.id, voucher.voucherCode, voucherIndex, voucher.id);
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
      },
    });
  }

  function handleDeleteService(index: number, service: Service) {
    requestConfirmation({
      title: 'Delete service?',
      message: `This will remove "${service.title}" from the service menu.`,
      confirmLabel: 'Delete Service',
      onConfirm: () => {
        void onServiceDelete(service, index);
        onServiceChange(services.filter((_, itemIndex) => itemIndex !== index));
        if (editingServiceIndex === index) {
          setEditingServiceIndex(null);
          setServiceDraft(null);
        }
      },
    });
  }

  function handleAddService() {
    const firstCategory = serviceCategories[0] ?? defaultServiceCategories[0];
    const nextService = normalizeAdminService({
      title: 'New Service',
      description: 'Short service description.',
      price: '₹0',
      image: homePageImages[0]?.url ?? settings.heroImage,
      category: firstCategory.name,
      subCategory: firstCategory.subCategories[0] ?? '',
      serviceType: 'Fixed Price',
      fixedPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      isActive: true,
      displayOrder: services.length + 1,
    }, services.length);
    setEditingServiceIndex(services.length);
    setServiceDraft(nextService);
    setIsServiceModalOpen(true);
  }

  function handleEditService(service: Service) {
    const index = findServiceIndex(services, service);
    setEditingServiceIndex(index >= 0 ? index : null);
    setServiceDraft({ ...service });
    setIsServiceModalOpen(true);
  }

  function updateServiceDraft(patch: Partial<Service>) {
    setServiceDraft((currentDraft) => currentDraft ? normalizeAdminService({ ...currentDraft, ...patch }, editingServiceIndex ?? services.length) : currentDraft);
  }

  async function handleServiceSave() {
    if (!serviceDraft) return;
    const normalizedService = normalizeAdminService(serviceDraft, editingServiceIndex ?? services.length);
    if (editingServiceIndex === services.length || editingServiceIndex === null || !services[editingServiceIndex]) {
      const createdService = await onServiceCreate(normalizedService);
      onServiceChange([...services, createdService]);
    } else {
      const updatedService = await onServiceUpdate(normalizedService, editingServiceIndex);
      onServiceChange(services.map((service, index) => index === editingServiceIndex ? updatedService : service));
    }
    setEditingServiceIndex(null);
    setServiceDraft(null);
    setIsServiceModalOpen(false);
  }

  function handleServiceCancel() {
    setEditingServiceIndex(null);
    setServiceDraft(null);
    setIsServiceModalOpen(false);
  }

  function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name || serviceCategories.some((category) => category.name.toLowerCase() === name.toLowerCase())) return;
    setServiceCategories([
      ...serviceCategories,
      {
        name,
        subCategories: parseSubCategories(newCategorySubCategories),
      },
    ]);
    setNewCategoryName('');
    setNewCategorySubCategories('');
  }

  function updateCategoryName(categoryIndex: number, nextName: string) {
    const previousName = serviceCategories[categoryIndex]?.name;
    setServiceCategories(serviceCategories.map((category, index) => index === categoryIndex ? { ...category, name: nextName } : category));
    if (!previousName || !nextName.trim()) return;
    const updatedServices = services.map((service) => service.category === previousName ? { ...service, category: nextName } : service);
    onServiceChange(updatedServices);
    updatedServices.forEach((service, index) => {
      if (service.category === nextName) void onServiceUpdate(service, index);
    });
  }

  function updateCategorySubCategories(categoryIndex: number, value: string) {
    setServiceCategories(serviceCategories.map((category, index) => index === categoryIndex ? {
      ...category,
      subCategories: parseSubCategories(value),
    } : category));
  }

  function handleDeleteCategory(categoryIndex: number) {
    const category = serviceCategories[categoryIndex];
    if (!category) return;
    const linkedServices = services
      .map((service, index) => ({ service, index }))
      .filter(({ service }) => service.category === category.name);

    requestConfirmation({
      title: 'Delete category?',
      message: linkedServices.length
        ? `Deleting "${category.name}" will also delete ${linkedServices.length} linked service${linkedServices.length === 1 ? '' : 's'}.`
        : `This will delete "${category.name}" from your category list.`,
      confirmLabel: linkedServices.length ? 'Delete Category and Services' : 'Delete Category',
      onConfirm: () => {
        linkedServices.forEach(({ service, index }) => {
          void onServiceDelete(service, index);
        });
        onServiceChange(services.filter((service) => service.category !== category.name));
        setServiceCategories(serviceCategories.filter((_, index) => index !== categoryIndex));
        if (serviceCategoryFilter === category.name) setServiceCategoryFilter('All Categories');
      },
    });
  }

  function handleServiceCategoryChange(categoryName: string) {
    const category = serviceCategories.find((item) => item.name === categoryName);
    updateServiceDraft({
      category: categoryName,
      subCategory: category?.subCategories[0] ?? '',
    });
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
          <div className={isEditingHomePage ? 'home-settings-grid editing' : 'home-settings-grid'}>
            <div className="home-page-actions">
              {isEditingHomePage ? (
                <>
                  <button className="small-admin-button" type="button" onClick={handleHomePageSave}>
                    <Save size={16} />
                    Save
                  </button>
                  <button className="outline-admin-button cancel-admin-button" type="button" onClick={handleHomePageCancel}>
                    <X size={16} />
                    Cancel
                  </button>
                </>
              ) : (
                <button className="small-admin-button" type="button" onClick={handleHomePageEdit}>
                  <Settings size={16} />
                  Edit Home Page
                </button>
              )}
            </div>
            <AdminPanel icon={<Home size={20} />} title="Home page carousel">
              <label
                className={isEditingHomePage ? 'admin-dropzone' : 'admin-dropzone disabled'}
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
                <input aria-label="Upload homepage images" accept="image/*" disabled={!isEditingHomePage} multiple type="file" onChange={handleHomeImageUpload} />
              </label>

              {homeImageStatus ? <p className="admin-status-text">{homeImageStatus}</p> : null}

              <div className="home-image-manager">
                {homePageImages.map((image, index) => (
                  <div
                    className="home-image-row"
                    draggable={isEditingHomePage}
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
                      disabled={!isEditingHomePage || homePageImages.length === 1}
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
                  <img src={homeSettings.logoUrl} alt="Current logo preview" />
                </div>
                <label
                  className={isEditingHomePage ? 'admin-dropzone compact' : 'admin-dropzone compact disabled'}
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
                  <input aria-label="Upload logo" accept="image/*" disabled={!isEditingHomePage} type="file" onChange={handleLogoUpload} />
                </label>
              </div>

              <div className="theme-control-grid">
                <AdminField label="Primary colour">
                  <div className="color-input-row">
                    <input
                      aria-label="Primary colour picker"
                      disabled={!isEditingHomePage}
                      type="color"
                      value={homeSettings.themePrimaryColor}
                      onChange={(event) => updateHomeSettingsDraft({ themePrimaryColor: event.target.value })}
                    />
                    <input
                      readOnly={!isEditingHomePage}
                      value={homeSettings.themePrimaryColor}
                      onChange={(event) => updateHomeSettingsDraft({ themePrimaryColor: event.target.value })}
                    />
                  </div>
                </AdminField>
                <AdminField label="Accent colour">
                  <div className="color-input-row">
                    <input
                      aria-label="Accent colour picker"
                      disabled={!isEditingHomePage}
                      type="color"
                      value={homeSettings.themeAccentColor}
                      onChange={(event) => updateHomeSettingsDraft({ themeAccentColor: event.target.value })}
                    />
                    <input
                      readOnly={!isEditingHomePage}
                      value={homeSettings.themeAccentColor}
                      onChange={(event) => updateHomeSettingsDraft({ themeAccentColor: event.target.value })}
                    />
                  </div>
                </AdminField>
              </div>
            </AdminPanel>

            <AdminPanel icon={<Settings size={20} />} title="Website details">
              <div className="website-details-grid">
                <AdminField label="Phone">
                  <input readOnly={!isEditingHomePage} value={homeSettings.phone} onChange={(event) => updateHomeSettingsDraft({ phone: event.target.value })} />
                </AdminField>
                <AdminField label="Email">
                  <input readOnly={!isEditingHomePage} value={homeSettings.email} onChange={(event) => updateHomeSettingsDraft({ email: event.target.value })} />
                </AdminField>
                <AdminField label="Instagram profile">
                  <input
                    readOnly={!isEditingHomePage}
                    value={homeSettings.instagramUrl}
                    onChange={(event) => updateHomeSettingsDraft({ instagramUrl: event.target.value })}
                  />
                </AdminField>
                <AdminField label="Currency code">
                  <input
                    readOnly={!isEditingHomePage}
                    value={homeSettings.currencyCode}
                    onChange={(event) => updateHomeSettingsDraft({ currencyCode: event.target.value.toUpperCase() })}
                  />
                </AdminField>
                <AdminField label="GST percentage">
                  <input
                    min="0"
                    readOnly={!isEditingHomePage}
                    step="0.01"
                    type="number"
                    value={homeSettings.gstPercent}
                    onChange={(event) => updateHomeSettingsDraft({ gstPercent: Number(event.target.value) })}
                  />
                </AdminField>
                <AdminField label="Address">
                  <textarea readOnly={!isEditingHomePage} value={homeSettings.address} onChange={(event) => updateHomeSettingsDraft({ address: event.target.value })} />
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
                          <div><dt>Start Date</dt><dd>{visibleCustomer.membership.startDate ? formatDisplayDate(visibleCustomer.membership.startDate) : 'Not started'}</dd></div>
                          <div><dt>End Date</dt><dd>{visibleCustomer.membership.endDate ? formatDisplayDate(visibleCustomer.membership.endDate) : 'Not set'}</dd></div>
                          <div><dt>Membership Fee</dt><dd>{formatCurrency(visibleCustomer.membership.fee)}</dd></div>
                          <div><dt>Paid Date</dt><dd>{visibleCustomer.membership.paidDate ? formatDisplayDate(visibleCustomer.membership.paidDate) : 'Not paid'}</dd></div>
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
                              <td>{formatDisplayDate(history.date)}</td>
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
                              <td>{formatDisplayDate(voucher.startDate)}</td>
                              <td>{formatDisplayDate(voucher.expiryDate)}</td>
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
                  <div className="customer-list-actions">
                    <button className="small-admin-button" type="button" onClick={() => setIsCustomerCreateOpen(true)}>
                      <Plus size={16} />
                      Create Customer
                    </button>
                  </div>

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
          <div className="services-admin-workspace">
            <div className="services-admin-header">
              <div>
                <h2>Services</h2>
                <span>Dashboard / Services</span>
              </div>
              <div>
                <button className="outline-admin-button service-category-button" type="button" onClick={() => setIsCategoryModalOpen(true)}>
                  <Tags size={16} />
                  Manage Categories
                </button>
                <button className="small-admin-button" type="button" onClick={handleAddService}>
                  <Plus size={16} />
                  Add Service
                </button>
              </div>
            </div>

            <div className="service-stats-grid">
              <div><span>Total Services</span><strong>{normalizedServices.length}</strong><small>All services added</small></div>
              <div><span>Active Services</span><strong>{activeServiceCount}</strong><small>Currently visible</small></div>
              <div><span>Price Range Services</span><strong>{rangeServiceCount}</strong><small>Have price range</small></div>
              <div><span>Contact for Price</span><strong>{contactServiceCount}</strong><small>Require contact</small></div>
            </div>

            <AdminPanel icon={<Sparkles size={20} />} title="Services List">
              <div className="service-table-toolbar">
                <span>Manage your salon services and pricing.</span>
                <div>
                  <select value={serviceCategoryFilter} onChange={(event) => setServiceCategoryFilter(event.target.value)}>
                    {serviceCategoryOptions.map((category) => <option key={category}>{category}</option>)}
                  </select>
                  <label className="service-search-field">
                    <Search size={18} />
                    <input value={serviceSearch} placeholder="Search services..." onChange={(event) => setServiceSearch(event.target.value)} />
                  </label>
                </div>
              </div>
              <div className="customer-table-wrap">
                <table className="customer-data-table service-data-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedServices.length ? paginatedServices.map((service) => {
                      const serviceIndex = findServiceIndex(services, service);
                      return (
                        <tr key={`${service.title}-${service.id ?? serviceIndex}`}>
                          <td>
                            <span className="service-name-cell">
                              <img src={service.image} alt="" />
                              <span>
                                <strong>{service.title}</strong>
                                <small>{service.category}</small>
                              </span>
                            </span>
                          </td>
                          <td>{service.category}</td>
                          <td>{service.price}</td>
                          <td>{service.serviceType}</td>
                          <td><span className={service.isActive ? 'status-pill' : 'status-pill used'}>{service.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td>
                            <div className="service-action-buttons">
                              <button className="icon-admin-button" type="button" aria-label={`Edit ${service.title}`} onClick={() => handleEditService(service)}>
                                <Pencil size={16} />
                              </button>
                              <button className="icon-admin-button danger" type="button" aria-label={`Delete ${service.title}`} onClick={() => handleDeleteService(serviceIndex, service)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={6}>No services match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="service-pagination">
                <span>
                  Showing {filteredServices.length ? (currentServicePage - 1) * SERVICES_PER_PAGE + 1 : 0} to {Math.min(currentServicePage * SERVICES_PER_PAGE, filteredServices.length)} of {filteredServices.length} services
                </span>
                <div>
                  <button disabled={currentServicePage === 1} type="button" onClick={() => setServicePage((page) => Math.max(1, page - 1))}>
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalServicePages }, (_, index) => index + 1).map((page) => (
                    <button className={page === currentServicePage ? 'active' : ''} key={page} type="button" onClick={() => setServicePage(page)}>
                      {page}
                    </button>
                  ))}
                  <button disabled={currentServicePage === totalServicePages} type="button" onClick={() => setServicePage((page) => Math.min(totalServicePages, page + 1))}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </AdminPanel>
          </div>
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

      {isServiceModalOpen && serviceDraft ? (
        <div className="modal-backdrop admin-modal-backdrop" role="presentation">
          <div className="admin-modal service-admin-modal" role="dialog" aria-modal="true" aria-label={editingServiceIndex === services.length ? 'Add Service' : 'Edit Service'}>
            <button className="modal-close" type="button" onClick={handleServiceCancel} aria-label="Close service modal">
              x
            </button>
            <p>Service Management</p>
            <h2>{editingServiceIndex === services.length ? 'Add Service' : 'Edit Service'}</h2>
            <div className="service-editor-grid">
              <div className="service-editor-main">
                <AdminField label="Service Name">
                  <input value={serviceDraft.title} onChange={(event) => updateServiceDraft({ title: event.target.value })} />
                </AdminField>
                <div className="service-price-grid">
                  <AdminField label="Category">
                    <select value={serviceDraft.category} onChange={(event) => handleServiceCategoryChange(event.target.value)}>
                      {serviceCategories.map((category) => (
                        <option key={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Sub Category">
                    <select value={serviceDraft.subCategory ?? ''} onChange={(event) => updateServiceDraft({ subCategory: event.target.value })}>
                      <option value="">No sub category</option>
                      {selectedServiceSubCategories.map((subCategory) => (
                        <option key={subCategory}>{subCategory}</option>
                      ))}
                    </select>
                  </AdminField>
                </div>
                <div className="service-type-group">
                  <span>Service Type</span>
                  {(['Fixed Price', 'Price Range', 'Contact for Price'] as Service['serviceType'][]).map((serviceType) => (
                    <label key={serviceType}>
                      <input
                        checked={serviceDraft.serviceType === serviceType}
                        name="serviceType"
                        type="radio"
                        onChange={() => updateServiceDraft({ serviceType })}
                      />
                      {serviceType}
                    </label>
                  ))}
                </div>
                {serviceDraft.serviceType === 'Price Range' ? (
                  <div className="service-price-grid">
                    <AdminField label="Minimum Price (₹)">
                      <input min="0" type="number" value={serviceDraft.minPrice ?? 0} onChange={(event) => updateServiceDraft({ minPrice: Number(event.target.value) })} />
                    </AdminField>
                    <AdminField label="Maximum Price (₹)">
                      <input min="0" type="number" value={serviceDraft.maxPrice ?? 0} onChange={(event) => updateServiceDraft({ maxPrice: Number(event.target.value) })} />
                    </AdminField>
                  </div>
                ) : serviceDraft.serviceType === 'Fixed Price' ? (
                  <AdminField label="Price (₹)">
                    <input min="0" type="number" value={serviceDraft.fixedPrice ?? 0} onChange={(event) => updateServiceDraft({ fixedPrice: Number(event.target.value) })} />
                  </AdminField>
                ) : null}
                <AdminField label="Short Description">
                  <textarea value={serviceDraft.description} onChange={(event) => updateServiceDraft({ description: event.target.value })} />
                </AdminField>
                <label className="toggle-row">
                  <input checked={serviceDraft.isActive} type="checkbox" onChange={(event) => updateServiceDraft({ isActive: event.target.checked })} />
                  Active
                </label>
              </div>
              <div className="service-editor-side">
                <AdminField label="Service Image URL">
                  <input value={serviceDraft.image} onChange={(event) => updateServiceDraft({ image: event.target.value })} />
                </AdminField>
                <img src={serviceDraft.image} alt="" />
                <AdminField label="Display Order">
                  <input min="0" type="number" value={serviceDraft.displayOrder ?? 0} onChange={(event) => updateServiceDraft({ displayOrder: Number(event.target.value) })} />
                </AdminField>
                <small>Lower numbers appear first.</small>
              </div>
            </div>
            <div className="service-editor-actions">
              <button className="outline-admin-button cancel-admin-button" type="button" onClick={handleServiceCancel}>Cancel</button>
              <button className="small-admin-button" type="button" onClick={handleServiceSave}>
                <Save size={16} />
                {editingServiceIndex === services.length ? 'Create Service' : 'Update Service'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isCategoryModalOpen ? (
        <div className="modal-backdrop admin-modal-backdrop" role="presentation">
          <div className="admin-modal category-admin-modal" role="dialog" aria-modal="true" aria-label="Manage service categories">
            <button className="modal-close" type="button" onClick={() => setIsCategoryModalOpen(false)} aria-label="Close categories modal">
              x
            </button>
            <p>Service Management</p>
            <h2>Manage Categories</h2>
            <div className="category-create-row">
              <AdminField label="Category Name">
                <input value={newCategoryName} placeholder="Category name" onChange={(event) => setNewCategoryName(event.target.value)} />
              </AdminField>
              <AdminField label="Sub Categories">
                <input value={newCategorySubCategories} placeholder="Cut, Colour, Styling" onChange={(event) => setNewCategorySubCategories(event.target.value)} />
              </AdminField>
              <button className="small-admin-button" type="button" onClick={handleAddCategory}>
                <Plus size={16} />
                Add Category
              </button>
            </div>
            <div className="category-list">
              {serviceCategories.map((category, index) => (
                <div className="category-row" key={`${category.name}-${index}`}>
                  <AdminField label="Category">
                    <input value={category.name} onChange={(event) => updateCategoryName(index, event.target.value)} />
                  </AdminField>
                  <AdminField label="Sub Categories">
                    <input
                      value={category.subCategories.join(', ')}
                      placeholder="Sub categories separated by comma"
                      onChange={(event) => updateCategorySubCategories(index, event.target.value)}
                    />
                  </AdminField>
                  <button className="danger-admin-button" type="button" onClick={() => handleDeleteCategory(index)}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isCustomerCreateOpen ? (
        <div className="modal-backdrop admin-modal-backdrop" role="presentation">
          <form className="admin-modal customer-create-modal" onSubmit={handleCreateCustomer} aria-label="Create customer form">
            <button className="modal-close" type="button" onClick={() => setIsCustomerCreateOpen(false)} aria-label="Close create customer modal">
              x
            </button>
            <p>Manage Customers</p>
            <h2>Create Customer</h2>
            <div className="admin-modal-section">
              <h3>Customer Information</h3>
              <div className="admin-modal-grid">
                <AdminField label="Full Name">
                  <input name="fullName" placeholder="Customer full name" required />
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
                <AdminField label="Notes">
                  <textarea name="notes" placeholder="Preferences, allergies, appointment notes..." />
                </AdminField>
              </div>
            </div>

            <div className="admin-modal-section">
              <h3>Membership Information</h3>
              <div className="admin-modal-grid">
                <AdminField label="Salon Member">
                  <select name="isMember" defaultValue="no">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </AdminField>
                <AdminField label="Membership Start Date">
                  <input name="membershipStartDate" type="date" />
                </AdminField>
                <AdminField label="Membership End Date">
                  <input name="membershipEndDate" type="date" />
                </AdminField>
                <AdminField label="Membership Fee">
                  <input min="0" name="membershipFee" placeholder="0" type="number" />
                </AdminField>
                <AdminField label="Membership Paid Date">
                  <input name="membershipPaidDate" type="date" />
                </AdminField>
              </div>
            </div>

            <div className="admin-modal-section">
              <h3>Voucher</h3>
              <div className="admin-modal-grid">
                <AdminField label="Allocate Voucher">
                  <select name="voucherCode" defaultValue="">
                    <option value="">No voucher now</option>
                    {vouchers.filter((voucher) => voucher.status === 'Active').map((voucher) => (
                      <option key={voucher.code} value={voucher.code}>{voucher.code} - {voucher.value}</option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Voucher Start Date">
                  <input name="voucherStartDate" type="date" defaultValue={voucherStartDate} />
                </AdminField>
                <AdminField label="Voucher Expiry Date">
                  <input name="voucherExpiryDate" type="date" defaultValue={voucherExpiryDate} />
                </AdminField>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button className="outline-admin-button cancel-admin-button" type="button" onClick={() => setIsCustomerCreateOpen(false)}>
                Cancel
              </button>
              <button className="small-admin-button" type="submit">
                <Plus size={16} />
                Create Customer
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {confirmDialog ? (
        <div className="modal-backdrop admin-modal-backdrop" role="presentation">
          <div className="admin-modal confirm-modal" role="dialog" aria-modal="true" aria-label={confirmDialog.title}>
            <button className="modal-close" type="button" onClick={closeConfirmation} aria-label="Close confirmation modal">
              x
            </button>
            <p>Confirm Action</p>
            <h2>{confirmDialog.title}</h2>
            <span>{confirmDialog.message}</span>
            <strong>This action cannot be undone.</strong>
            <div className="admin-modal-actions">
              <button className="outline-admin-button cancel-admin-button" type="button" onClick={closeConfirmation}>
                Cancel
              </button>
              <button className="danger-admin-button" type="button" onClick={confirmAction}>
                <Trash2 size={16} />
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
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

function findServiceIndex(services: Service[], serviceToFind: Service) {
  return services.findIndex((service) => {
    if (service.id && serviceToFind.id) return service.id === serviceToFind.id;
    return service.title === serviceToFind.title && service.image === serviceToFind.image;
  });
}

function normalizeAdminService(service: Service, fallbackOrder = 0): Service {
  const serviceType = service.serviceType ?? (service.price.toLowerCase().includes('contact') ? 'Contact for Price' : 'Fixed Price');
  const parsedPrice = Number(service.price.replace(/[^0-9]/g, '')) || 0;
  const fixedPrice = service.fixedPrice ?? parsedPrice;
  const minPrice = service.minPrice ?? fixedPrice;
  const maxPrice = service.maxPrice ?? fixedPrice;
  const price = serviceType === 'Contact for Price'
    ? 'Contact Us'
    : serviceType === 'Price Range'
      ? `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`
      : `₹${fixedPrice.toLocaleString('en-IN')}`;

  return {
    ...service,
    category: service.category || 'Hair Style',
    subCategory: service.subCategory || '',
    serviceType,
    fixedPrice,
    minPrice,
    maxPrice,
    price,
    isActive: service.isActive ?? true,
    displayOrder: service.displayOrder ?? fallbackOrder,
  };
}

function parseSubCategories(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
