import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Brush, CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Copy, ExternalLink, Flower2, Gift, Globe2, GripVertical, Hand, Home, Image, ImagePlus, Info, LogOut, Mail, MoreVertical, Palette, Pencil, Plus, Save, Scissors, Search, Settings, Sparkles, Star, Tags, Trash2, UploadCloud, UserCheck, UsersRound, WandSparkles, X } from 'lucide-react';
import type { AdminSection, Booking, Customer, CustomerVoucher, GalleryAlbum, GalleryImage, HomePageImage, Review, Service, ServiceCategory, SiteSettings, StaffMember, Voucher } from '../types';
import { AdminField, AdminPanel } from '../components/admin/AdminPrimitives';
import { updateListItem } from '../utils/list';
import { formatCurrency, formatDisplayDate } from '../utils/format';
import { serviceCategoryIcons } from '../utils/serviceCatalog';

type ConfirmDialogState = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

const SERVICES_PER_PAGE = 10;

export function AdminDashboard({
  adminFullName,
  bookings,
  customers,
  galleryAlbums,
  homePageImages,
  reviews,
  services,
  serviceCategories,
  staffMembers,
  settings,
  vouchers,
  onBookingChange,
  onCustomerCreate,
  onCustomerUpdate,
  onCustomerVoucherAssign,
  onCustomerVoucherDelete,
  onCustomersChange,
  onGalleryAlbumsChange,
  onGalleryChange,
  onHomePageImageDelete,
  onHomePageImagesReorder,
  onHomePageImagesUpload,
  onLogoUpload,
  onLogout,
  onVisitWebsite,
  onReviewChange,
  onServiceChange,
  onServiceCreate,
  onServiceDelete,
  onServiceCategoryImageUpload,
  onServiceImageUpload,
  onServiceUpdate,
  onServiceCategoriesChange,
  onServiceCategoriesSave,
  onStaffChange,
  onSettingsChange,
  onVoucherChange,
}: {
  adminFullName: string;
  bookings: Booking[];
  customers: Customer[];
  galleryAlbums: GalleryAlbum[];
  homePageImages: HomePageImage[];
  reviews: Review[];
  services: Service[];
  serviceCategories: ServiceCategory[];
  staffMembers: StaffMember[];
  settings: SiteSettings;
  vouchers: Voucher[];
  onBookingChange: (bookings: Booking[]) => void;
  onCustomerCreate: (customer: Customer) => Customer | Promise<Customer>;
  onCustomerUpdate: (customer: Customer) => Customer | Promise<Customer>;
  onCustomerVoucherAssign: (customerId: string, voucher: CustomerVoucher) => CustomerVoucher | Promise<CustomerVoucher>;
  onCustomerVoucherDelete: (customerId: string, voucherCode: string, voucherIndex: number, voucherAssignmentId?: string) => void | Promise<void>;
  onCustomersChange: (customers: Customer[]) => void;
  onGalleryAlbumsChange: (albums: GalleryAlbum[]) => void;
  onGalleryChange: (galleryImages: GalleryImage[]) => void;
  onHomePageImageDelete: (image: HomePageImage) => void | Promise<void>;
  onHomePageImagesReorder: (images: HomePageImage[]) => void | Promise<void>;
  onHomePageImagesUpload: (files: File[]) => void | Promise<void>;
  onLogoUpload: (file: File) => string | Promise<string>;
  onLogout: () => void;
  onVisitWebsite: () => void;
  onReviewChange: (reviews: Review[]) => void;
  onServiceChange: (services: Service[]) => void;
  onServiceCreate: (service: Service) => Service | Promise<Service>;
  onServiceDelete: (service: Service, index: number) => void | Promise<void>;
  onServiceCategoryImageUpload: (file: File) => string | Promise<string>;
  onServiceImageUpload: (file: File) => string | Promise<string>;
  onServiceUpdate: (service: Service, index: number) => Service | Promise<Service>;
  onServiceCategoriesChange: (categories: ServiceCategory[]) => void;
  onServiceCategoriesSave: (categories: ServiceCategory[]) => ServiceCategory[] | Promise<ServiceCategory[]>;
  onStaffChange: (staffMembers: StaffMember[]) => void;
  onSettingsChange: (settings: SiteSettings) => void | Promise<void>;
  onVoucherChange: (vouchers: Voucher[]) => void;
}) {
  const [activeSection, setActiveSection] = useState<AdminSection>('home-page');
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [draggedGalleryImageUrl, setDraggedGalleryImageUrl] = useState<string | null>(null);
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
  const [galleryDraftAlbums, setGalleryDraftAlbums] = useState(galleryAlbums);
  const [selectedGalleryAlbumTitle, setSelectedGalleryAlbumTitle] = useState('');
  const [galleryAlbumSearch, setGalleryAlbumSearch] = useState('');
  const [galleryAlbumFilter, setGalleryAlbumFilter] = useState('All Albums');
  const [galleryImageSearch, setGalleryImageSearch] = useState('');
  const [galleryImageFilter, setGalleryImageFilter] = useState('All Images');
  const [galleryStatus, setGalleryStatus] = useState('');
  const [voucherToAssign, setVoucherToAssign] = useState(vouchers.find((voucher) => voucher.status === 'Active')?.code ?? vouchers[0]?.code ?? '');
  const [voucherStartDate, setVoucherStartDate] = useState('2026-05-21');
  const [voucherExpiryDate, setVoucherExpiryDate] = useState('2026-08-21');
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All Categories');
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [serviceDraft, setServiceDraft] = useState<Service | null>(null);
  const [serviceSaveStatus, setServiceSaveStatus] = useState('');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [servicePage, setServicePage] = useState(1);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryNames, setNewSubCategoryNames] = useState<Record<number, string>>({});
  const [categoryStatus, setCategoryStatus] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [categoryModalTab, setCategoryModalTab] = useState<'categories' | 'sub-categories'>('categories');
  const [categorySearch, setCategorySearch] = useState('');
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
  const normalizedCategorySearch = categorySearch.trim().toLowerCase();
  const filteredServiceCategories = serviceCategories
    .map((category, index) => ({ category, index }))
    .filter(({ category }) => {
      if (!normalizedCategorySearch) return true;
      return [category.name, ...category.subCategories.map((subCategory) => subCategory.name)]
        .join(' ')
        .toLowerCase()
        .includes(normalizedCategorySearch);
    });
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
  const selectedGalleryAlbum = selectedGalleryAlbumTitle
    ? galleryDraftAlbums.find((album) => album.title === selectedGalleryAlbumTitle)
    : undefined;
  const selectedGalleryAlbumIndex = selectedGalleryAlbum
    ? galleryDraftAlbums.findIndex((album) => album.title === selectedGalleryAlbum.title)
    : -1;
  const selectedGalleryHeadingUrls = selectedGalleryAlbum?.headingImageUrls?.length
    ? selectedGalleryAlbum.headingImageUrls
    : selectedGalleryAlbum?.photos.slice(0, 3).map((photo) => photo.url) ?? [];
  const filteredGalleryPhotos = selectedGalleryAlbum?.photos.filter((photo) => {
    const matchesSearch = !galleryImageSearch.trim()
      || [photo.title, photo.alt].join(' ').toLowerCase().includes(galleryImageSearch.trim().toLowerCase());
    const matchesFilter = galleryImageFilter === 'All Images'
      || (galleryImageFilter === 'Heading Images' && selectedGalleryHeadingUrls.includes(photo.url))
      || (galleryImageFilter === 'Thumbnail' && photo.url === selectedGalleryAlbum.cover);
    return matchesSearch && matchesFilter;
  }) ?? [];
  const filteredGalleryAlbums = galleryDraftAlbums.filter((album) => {
    const matchesSearch = !galleryAlbumSearch.trim()
      || [album.title, album.description].join(' ').toLowerCase().includes(galleryAlbumSearch.trim().toLowerCase());
    return galleryAlbumFilter === 'All Albums' && matchesSearch;
  });
  const totalGalleryImages = galleryDraftAlbums.reduce((total, album) => total + album.photos.length, 0);
  const totalGalleryHeadingImages = galleryDraftAlbums.reduce((total, album) => total + (album.headingImageUrls?.length ?? Math.min(album.photos.length, 3)), 0);

  useEffect(() => {
    if (!isEditingHomePage) {
      setHomeSettingsDraft(settings);
    }
  }, [isEditingHomePage, settings]);

  useEffect(() => {
    setServicePage(1);
  }, [serviceSearch, serviceCategoryFilter]);

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

  useEffect(() => {
    setGalleryDraftAlbums(galleryAlbums);
    setSelectedGalleryAlbumTitle((currentTitle) => galleryAlbums.some((album) => album.title === currentTitle) ? currentTitle : '');
  }, [galleryAlbums]);

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

  function updateSelectedGalleryAlbum(patch: Partial<GalleryAlbum>) {
    if (selectedGalleryAlbumIndex < 0) return;

    setGalleryDraftAlbums((currentAlbums) => currentAlbums.map((album, index) => index === selectedGalleryAlbumIndex ? {
      ...album,
      ...patch,
    } : album));

    if (patch.title) {
      setSelectedGalleryAlbumTitle(patch.title);
    }
  }

  function createGalleryPhoto(file: File): GalleryImage {
    const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Gallery image';
    return {
      title,
      alt: title,
      url: URL.createObjectURL(file),
    };
  }

  function addGalleryPhotos(files: File[], options: { headingOnly?: boolean } = {}) {
    if (!selectedGalleryAlbum) return;
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) return;

    const newPhotos = imageFiles.map(createGalleryPhoto);
    const nextPhotos = [...selectedGalleryAlbum.photos, ...newPhotos];
    const nextHeadingUrls = options.headingOnly
      ? [...selectedGalleryHeadingUrls, ...newPhotos.map((photo) => photo.url)].slice(0, 3)
      : selectedGalleryHeadingUrls;

    updateSelectedGalleryAlbum({
      photos: nextPhotos,
      headingImageUrls: nextHeadingUrls,
      cover: selectedGalleryAlbum.cover || newPhotos[0]?.url || '',
    });
    setGalleryStatus(options.headingOnly ? 'Heading image added. Click Save Changes to publish.' : 'Images added. Click Save Changes to publish.');
  }

  function handleGalleryUpload(event: ChangeEvent<HTMLInputElement>, options: { headingOnly?: boolean } = {}) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    addGalleryPhotos(files, options);
  }

  function handleGalleryDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    addGalleryPhotos(Array.from(event.dataTransfer.files));
  }

  function toggleGalleryHeadingImage(photo: GalleryImage) {
    const isSelected = selectedGalleryHeadingUrls.includes(photo.url);
    const nextHeadingUrls = isSelected
      ? selectedGalleryHeadingUrls.filter((url) => url !== photo.url)
      : [...selectedGalleryHeadingUrls, photo.url].slice(0, 3);

    updateSelectedGalleryAlbum({ headingImageUrls: nextHeadingUrls });
    setGalleryStatus(isSelected ? 'Heading image removed. Click Save Changes to publish.' : 'Heading image selected. Click Save Changes to publish.');
  }

  function removeGalleryHeadingImage(url: string) {
    updateSelectedGalleryAlbum({ headingImageUrls: selectedGalleryHeadingUrls.filter((headingUrl) => headingUrl !== url) });
    setGalleryStatus('Heading image removed. Click Save Changes to publish.');
  }

  function deleteGalleryPhoto(photo: GalleryImage) {
    if (!selectedGalleryAlbum) return;
    requestConfirmation({
      title: 'Delete image?',
      message: 'This image will be removed from the album. This action cannot be undone after saving.',
      confirmLabel: 'Delete Image',
      onConfirm: () => {
        const nextPhotos = selectedGalleryAlbum.photos.filter((item) => item.url !== photo.url);
        const nextCover = selectedGalleryAlbum.cover === photo.url ? nextPhotos[0]?.url ?? '' : selectedGalleryAlbum.cover;
        const nextHeadingUrls = selectedGalleryHeadingUrls.filter((url) => url !== photo.url);
        updateSelectedGalleryAlbum({
          cover: nextCover,
          headingImageUrls: nextHeadingUrls,
          photos: nextPhotos,
        });
        setGalleryStatus('Image deleted. Click Save Changes to publish.');
      },
    });
  }

  function handleGalleryPhotoDrop(event: DragEvent<HTMLDivElement>, targetUrl: string) {
    event.preventDefault();
    if (!selectedGalleryAlbum || !draggedGalleryImageUrl || draggedGalleryImageUrl === targetUrl) return;

    const draggedIndex = selectedGalleryAlbum.photos.findIndex((photo) => photo.url === draggedGalleryImageUrl);
    const targetIndex = selectedGalleryAlbum.photos.findIndex((photo) => photo.url === targetUrl);
    if (draggedIndex < 0 || targetIndex < 0) return;

    const reorderedPhotos = [...selectedGalleryAlbum.photos];
    const [draggedPhoto] = reorderedPhotos.splice(draggedIndex, 1);
    reorderedPhotos.splice(targetIndex, 0, draggedPhoto);
    updateSelectedGalleryAlbum({ photos: reorderedPhotos });
    setDraggedGalleryImageUrl(null);
    setGalleryStatus('Image order changed. Click Save Changes to publish.');
  }

  function handleGallerySave() {
    onGalleryAlbumsChange(galleryDraftAlbums);
    onGalleryChange(galleryDraftAlbums.flatMap((album) => album.photos));
    setGalleryStatus('Gallery changes saved.');
  }

  function handleGalleryCancel() {
    setGalleryDraftAlbums(galleryAlbums);
    setGalleryStatus('');
  }

  function handleAddGalleryAlbum() {
    const nextNumber = galleryDraftAlbums.length + 1;
    const newAlbum: GalleryAlbum = {
      title: `New Album ${nextNumber}`,
      description: 'Add a short description for this album.',
      cover: '',
      headingImageUrls: [],
      photos: [],
    };
    setGalleryDraftAlbums((currentAlbums) => [...currentAlbums, newAlbum]);
    setSelectedGalleryAlbumTitle(newAlbum.title);
    setGalleryStatus('New album created. Add images and click Save Changes.');
  }

  function handleDeleteGalleryAlbum(album: GalleryAlbum) {
    requestConfirmation({
      title: 'Delete album?',
      message: `This will remove "${album.title}" and its ${album.photos.length} image${album.photos.length === 1 ? '' : 's'} from the gallery.`,
      confirmLabel: 'Delete Album',
      onConfirm: () => {
        const nextAlbums = galleryDraftAlbums.filter((item) => item.title !== album.title);
        setGalleryDraftAlbums(nextAlbums);
        onGalleryAlbumsChange(nextAlbums);
        onGalleryChange(nextAlbums.flatMap((item) => item.photos));
        setSelectedGalleryAlbumTitle('');
        setGalleryStatus('Album deleted.');
      },
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
    const firstCategory = serviceCategories[0] ?? { name: 'General', subCategories: [] };
    const nextService = normalizeAdminService({
      title: 'New Service',
      description: 'Short service description.',
      price: '₹0',
      image: homePageImages[0]?.url ?? settings.heroImage,
      category: firstCategory.name,
      subCategory: firstCategory.subCategories[0]?.name ?? '',
      serviceType: 'Fixed Price',
      fixedPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      isActive: true,
      displayOrder: services.length + 1,
    }, services.length);
    setEditingServiceIndex(services.length);
    setServiceDraft(nextService);
    setServiceSaveStatus('');
    setIsServiceModalOpen(true);
  }

  function handleEditService(service: Service) {
    const index = findServiceIndex(services, service);
    setEditingServiceIndex(index >= 0 ? index : null);
    setServiceDraft({ ...service });
    setServiceSaveStatus('');
    setIsServiceModalOpen(true);
  }

  function updateServiceDraft(patch: Partial<Service>) {
    setServiceDraft((currentDraft) => currentDraft ? normalizeAdminService({ ...currentDraft, ...patch }, editingServiceIndex ?? services.length) : currentDraft);
  }

  function updateServicePriceDraft(field: 'fixedPrice' | 'minPrice' | 'maxPrice', value: string) {
    const numericValue = value === '' ? undefined : Number(value);
    setServiceDraft((currentDraft) => currentDraft ? {
      ...currentDraft,
      [field]: numericValue,
    } : currentDraft);
  }

  async function handleServiceImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setServiceSaveStatus('Uploading service image...');
    try {
      const imageUrl = await onServiceImageUpload(file);
      updateServiceDraft({ image: imageUrl });
      setServiceSaveStatus('Image uploaded. Save the service to publish it.');
    } catch (error) {
      setServiceSaveStatus(error instanceof Error ? error.message : 'Service image could not be uploaded.');
    }
  }

  async function handleServiceSave() {
    if (!serviceDraft) return;
    const selectedCategory = serviceCategories.find((category) => category.name === serviceDraft.category);
    const selectedSubCategory = serviceDraft.subCategory?.trim() ?? '';
    const isKnownSubCategory = !selectedSubCategory || selectedCategory?.subCategories.some((subCategory) => subCategory.name === selectedSubCategory);
    if (selectedSubCategory && !isKnownSubCategory) {
      setServiceSaveStatus('Please select a valid sub category before saving the service.');
      return;
    }

    const normalizedService = normalizeAdminService({
      ...serviceDraft,
      subCategory: selectedSubCategory,
    }, editingServiceIndex ?? services.length);
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
    setServiceSaveStatus('');
  }

  function handleServiceCancel() {
    setEditingServiceIndex(null);
    setServiceDraft(null);
    setServiceSaveStatus('');
    setIsServiceModalOpen(false);
  }

  function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name || serviceCategories.some((category) => category.name.toLowerCase() === name.toLowerCase())) return;
    const nextCategories = [
      ...serviceCategories,
      {
        name,
        iconKey: 'spa',
        backgroundColor: '#0b4b3a',
        subCategories: [],
      },
    ];
    onServiceCategoriesChange(nextCategories);
    setSelectedCategoryIndex(nextCategories.length - 1);
    setNewCategoryName('');
    setCategoryStatus('Category added. Click Save Categories to publish.');
  }

  function updateCategoryName(categoryIndex: number, nextName: string) {
    const previousName = serviceCategories[categoryIndex]?.name;
    onServiceCategoriesChange(serviceCategories.map((category, index) => index === categoryIndex ? { ...category, name: nextName } : category));
    if (!previousName || !nextName.trim()) return;
    const updatedServices = services.map((service) => service.category === previousName ? { ...service, category: nextName } : service);
    onServiceChange(updatedServices);
    updatedServices.forEach((service, index) => {
      if (service.category === nextName) void onServiceUpdate(service, index);
    });
  }

  function updateCategoryDetails(categoryIndex: number, patch: Partial<ServiceCategory>) {
    onServiceCategoriesChange(serviceCategories.map((category, index) => index === categoryIndex ? {
      ...category,
      ...patch,
    } : category));
    setCategoryStatus('Category updated. Click Save Categories to publish.');
  }

  async function handleCategoryImageUpload(categoryIndex: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setCategoryStatus('Uploading category image...');
    try {
      const imageUrl = await onServiceCategoryImageUpload(file);
      updateCategoryDetails(categoryIndex, { imageUrl });
      setCategoryStatus('Category image uploaded. Click Save Categories to publish.');
    } catch (error) {
      setCategoryStatus(error instanceof Error ? error.message : 'Category image could not be uploaded.');
    }
  }

  function addSubCategory(categoryIndex: number) {
    const name = (newSubCategoryNames[categoryIndex] ?? '').trim();
    const category = serviceCategories[categoryIndex];
    if (!name || !category || category.subCategories.some((subCategory) => subCategory.name.toLowerCase() === name.toLowerCase())) return;
    onServiceCategoriesChange(serviceCategories.map((item, index) => index === categoryIndex ? {
      ...item,
      subCategories: [...item.subCategories, { name }],
    } : item));
    setNewSubCategoryNames({ ...newSubCategoryNames, [categoryIndex]: '' });
    setCategoryStatus('Sub category added. Click Save Categories to publish.');
  }

  function updateSubCategory(categoryIndex: number, subCategoryIndex: number, name: string) {
    onServiceCategoriesChange(serviceCategories.map((category, index) => index === categoryIndex ? {
      ...category,
      subCategories: category.subCategories.map((subCategory, itemIndex) => itemIndex === subCategoryIndex ? { ...subCategory, name } : subCategory),
    } : category));
  }

  function deleteSubCategory(categoryIndex: number, subCategoryIndex: number) {
    const category = serviceCategories[categoryIndex];
    const subCategory = category?.subCategories[subCategoryIndex];
    if (!category || !subCategory) return;
    const linkedServices = services.filter((service) => service.category === category.name && service.subCategory === subCategory.name);

    requestConfirmation({
      title: 'Delete sub category?',
      message: linkedServices.length
        ? `Deleting "${subCategory.name}" will also delete ${linkedServices.length} linked service${linkedServices.length === 1 ? '' : 's'}.`
        : `This will delete "${subCategory.name}" from ${category.name}.`,
      confirmLabel: linkedServices.length ? 'Delete Sub Category and Services' : 'Delete Sub Category',
      onConfirm: () => {
        linkedServices.forEach((service) => {
          const serviceIndex = findServiceIndex(services, service);
          void onServiceDelete(service, serviceIndex);
        });
        onServiceChange(services.filter((service) => !(service.category === category.name && service.subCategory === subCategory.name)));
        onServiceCategoriesChange(serviceCategories.map((item, index) => index === categoryIndex ? {
          ...item,
          subCategories: item.subCategories.filter((_, itemIndex) => itemIndex !== subCategoryIndex),
        } : item));
        setCategoryStatus('Sub category deleted. Click Save Categories to publish.');
      },
    });
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
        const nextCategories = serviceCategories.filter((_, index) => index !== categoryIndex);
        onServiceCategoriesChange(nextCategories);
        setSelectedCategoryIndex(Math.max(0, Math.min(selectedCategoryIndex, nextCategories.length - 1)));
        if (serviceCategoryFilter === category.name) setServiceCategoryFilter('All Categories');
        setCategoryStatus('Category deleted. Click Save Categories to publish.');
      },
    });
  }

  function handleServiceCategoryChange(categoryName: string) {
    const category = serviceCategories.find((item) => item.name === categoryName);
    updateServiceDraft({
      category: categoryName,
      subCategory: category?.subCategories[0]?.name ?? '',
    });
  }

  async function handleSaveCategories() {
    setCategoryStatus('Saving categories...');
    try {
      const savedCategories = await onServiceCategoriesSave(serviceCategories);
      onServiceCategoriesChange(savedCategories);
      setCategoryStatus('Categories saved.');
    } catch (error) {
      setCategoryStatus(error instanceof Error ? error.message : 'Categories could not be saved.');
    }
  }

  function getCategoryIcon(categoryName: string, iconKey?: string) {
    if (iconKey && serviceCategoryIcons[iconKey]) {
      const Icon = serviceCategoryIcons[iconKey].icon;
      return <Icon size={20} />;
    }
    const name = categoryName.toLowerCase();
    if (name.includes('hair')) return <Scissors size={20} />;
    if (name.includes('make')) return <WandSparkles size={20} />;
    if (name.includes('nail')) return <Hand size={20} />;
    if (name.includes('beauty') || name.includes('treatment')) return <Flower2 size={20} />;
    return <Brush size={20} />;
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
        <button className="admin-logout-button" type="button" onClick={onVisitWebsite}>
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
                  <button className="small-admin-button" type="button" onClick={onVisitWebsite}>
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
          <div className="gallery-manager">
            {selectedGalleryAlbum ? (
              <>
                <button className="back-button admin-back-button" type="button" onClick={() => setSelectedGalleryAlbumTitle('')}>
                  <ArrowLeft size={16} />
                  Back to Gallery
                </button>
                <div className="gallery-manager-title">
                  <h1>{selectedGalleryAlbum.title}</h1>
                  <Pencil size={18} />
                  <span>Manage your album images and settings.</span>
                </div>
                <div className="gallery-manager-grid">
                  <section className="gallery-settings-panel">
                    <h2>Album Details</h2>
                    <AdminField label="Album Title">
                      <input value={selectedGalleryAlbum.title} onChange={(event) => updateSelectedGalleryAlbum({ title: event.target.value })} />
                    </AdminField>
                    <AdminField label="Album Description">
                      <textarea value={selectedGalleryAlbum.description} onChange={(event) => updateSelectedGalleryAlbum({ description: event.target.value })} />
                    </AdminField>
                    <div className="gallery-field-block">
                      <strong>Album Thumbnail</strong>
                      <span>Select only 1 thumbnail image for this album.</span>
                      <div className="gallery-thumbnail-row">
                        {selectedGalleryAlbum.cover ? (
                          <button className="gallery-thumbnail-card selected" type="button">
                            <img src={selectedGalleryAlbum.cover} alt="" />
                            <CheckCircle2 size={22} />
                          </button>
                        ) : null}
                        <label className="gallery-upload-tile">
                          <Image size={22} />
                          <strong>Select New</strong>
                          <span>JPG, PNG (Max. 2MB)</span>
                          <input accept="image/*" type="file" onChange={(event) => handleGalleryUpload(event)} />
                        </label>
                      </div>
                    </div>
                    <div className="gallery-field-block">
                      <strong>Album Heading Images</strong>
                      <span>Select up to 3 images to display as the album heading.</span>
                      <div className="gallery-heading-image-row">
                        {selectedGalleryHeadingUrls.map((url) => (
                          <div className="gallery-heading-card" key={url}>
                            <img src={url} alt="" />
                            <button type="button" aria-label="Remove heading image" onClick={() => removeGalleryHeadingImage(url)}>
                              <X size={15} />
                            </button>
                          </div>
                        ))}
                        {selectedGalleryHeadingUrls.length < 3 ? (
                          <label className="gallery-add-heading-card">
                            <Plus size={26} />
                            <strong>Add Image</strong>
                            <span>You can add up to 3 images</span>
                            <input accept="image/*" type="file" onChange={(event) => handleGalleryUpload(event, { headingOnly: true })} />
                          </label>
                        ) : null}
                      </div>
                    </div>
                    <div className="gallery-info-box">
                      <Info size={20} />
                      <div>
                        <strong>Info</strong>
                        <ul>
                          <li>Thumbnail image will be used as the album cover in listings.</li>
                          <li>Heading images appear at the top of the album page.</li>
                          <li>Drag album images on the right to change their display order.</li>
                        </ul>
                      </div>
                    </div>
                    <div className="gallery-save-actions">
                      <button className="outline-admin-button cancel-admin-button" type="button" onClick={handleGalleryCancel}>Cancel</button>
                      <button className="small-admin-button" type="button" onClick={handleGallerySave}>
                        <Save size={16} />
                        Save Changes
                      </button>
                    </div>
                    {galleryStatus ? <p className="admin-status-text">{galleryStatus}</p> : null}
                  </section>
                  <section className="gallery-images-panel">
                    <div className="gallery-panel-heading">
                      <h2>Album Images</h2>
                      <span>{selectedGalleryAlbum.photos.length} Images</span>
                    </div>
                    <div className="gallery-alert">
                      <Info size={18} />
                      Upload new images or manage existing images in this album.
                    </div>
                    <label className="gallery-dropzone" onDrop={handleGalleryDrop} onDragOver={(event) => event.preventDefault()}>
                      <UploadCloud size={22} />
                      <strong>Upload Images</strong>
                      <span>JPG, PNG (Max. 5MB each)</span>
                      <input accept="image/*" multiple type="file" onChange={(event) => handleGalleryUpload(event)} />
                    </label>
                    <div className="gallery-image-toolbar">
                      <select value={galleryImageFilter} onChange={(event) => setGalleryImageFilter(event.target.value)}>
                        <option>All Images</option>
                        <option>Heading Images</option>
                        <option>Thumbnail</option>
                      </select>
                      <label>
                        <Search size={16} />
                        <input value={galleryImageSearch} placeholder="Search images..." onChange={(event) => setGalleryImageSearch(event.target.value)} />
                      </label>
                    </div>
                    <div className="gallery-admin-grid">
                      {filteredGalleryPhotos.length ? filteredGalleryPhotos.map((photo) => {
                        const isCover = selectedGalleryAlbum.cover === photo.url;
                        const isHeading = selectedGalleryHeadingUrls.includes(photo.url);
                        return (
                          <div
                            className={isCover ? 'gallery-admin-photo selected' : 'gallery-admin-photo'}
                            draggable
                            key={photo.url}
                            onDragStart={() => setDraggedGalleryImageUrl(photo.url)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => handleGalleryPhotoDrop(event, photo.url)}
                          >
                            <button className="gallery-photo-select" type="button" onClick={() => updateSelectedGalleryAlbum({ cover: photo.url })} aria-label="Set as album thumbnail">
                              {isCover ? <CheckCircle2 size={24} /> : <Image size={18} />}
                            </button>
                            <img src={photo.url} alt={photo.alt} />
                            <button className="gallery-photo-heading" type="button" onClick={() => toggleGalleryHeadingImage(photo)}>
                              {isHeading ? 'Heading' : 'Use Heading'}
                            </button>
                            <button className="gallery-photo-delete" type="button" aria-label={`Delete ${photo.title}`} onClick={() => deleteGalleryPhoto(photo)}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        );
                      }) : (
                        <div className="empty-admin-state">
                          <strong>No images found</strong>
                          <span>Upload an image or clear the search field.</span>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </>
            ) : (
              <>
                <div className="gallery-overview-header">
                  <div>
                    <p>Gallery Management</p>
                    <h1>Manage Gallery</h1>
                    <span>Create and manage albums to showcase your salon's work.</span>
                  </div>
                  <button className="small-admin-button" type="button" onClick={handleAddGalleryAlbum}>
                    <Plus size={16} />
                    Add New Album
                  </button>
                </div>

                <div className="gallery-stat-grid">
                  <div className="gallery-stat-card">
                    <span><Tags size={24} /></span>
                    <div><small>Total Albums</small><strong>{galleryDraftAlbums.length}</strong><small>Albums created</small></div>
                  </div>
                  <div className="gallery-stat-card orange">
                    <span><Image size={24} /></span>
                    <div><small>Total Images</small><strong>{totalGalleryImages}</strong><small>Images uploaded</small></div>
                  </div>
                  <div className="gallery-stat-card">
                    <span><Copy size={24} /></span>
                    <div><small>Cover Images</small><strong>{galleryDraftAlbums.filter((album) => album.cover).length}</strong><small>Album thumbnails</small></div>
                  </div>
                  <div className="gallery-stat-card purple">
                    <span><Sparkles size={24} /></span>
                    <div><small>Heading Images</small><strong>{totalGalleryHeadingImages}</strong><small>3 per album</small></div>
                  </div>
                </div>

                <section className="gallery-albums-panel">
                  <div className="gallery-albums-heading">
                    <div>
                      <h2>Albums</h2>
                      <span>Manage and organize your gallery albums.</span>
                    </div>
                    <div className="gallery-image-toolbar">
                      <select value={galleryAlbumFilter} onChange={(event) => setGalleryAlbumFilter(event.target.value)}>
                        <option>All Albums</option>
                      </select>
                      <label>
                        <Search size={16} />
                        <input value={galleryAlbumSearch} placeholder="Search albums..." onChange={(event) => setGalleryAlbumSearch(event.target.value)} />
                      </label>
                    </div>
                  </div>

                  <div className="gallery-album-card-grid">
                    {filteredGalleryAlbums.map((album) => (
                      <article className="gallery-album-admin-card" key={album.title}>
                        <div className="gallery-album-cover">
                          {album.cover ? <img src={album.cover} alt="" /> : <Image size={32} />}
                          <span>{album.photos.length}</span>
                          <button type="button" aria-label="More album actions">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                        <div className="gallery-album-body">
                          <h3>{album.title}</h3>
                          <span>{album.photos.length} images</span>
                          <div className="gallery-album-strip">
                            {album.photos.slice(0, 3).map((photo) => (
                              <img key={photo.url} src={photo.url} alt="" />
                            ))}
                          </div>
                          <div className="gallery-album-actions">
                            <button type="button" onClick={() => setSelectedGalleryAlbumTitle(album.title)}>
                              <Settings size={15} />
                              Manage
                            </button>
                            <button className="danger" type="button" aria-label={`Delete ${album.title}`} onClick={() => handleDeleteGalleryAlbum(album)}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                    <button className="gallery-add-album-card" type="button" onClick={handleAddGalleryAlbum}>
                      <span><Plus size={28} /></span>
                      <strong>Add New Album</strong>
                      <small>Create a new album to organize your images</small>
                    </button>
                  </div>
                  <span className="gallery-result-count">Showing 1 to {filteredGalleryAlbums.length} of {galleryDraftAlbums.length} albums</span>
                </section>
                {galleryStatus ? <p className="admin-status-text">{galleryStatus}</p> : null}
              </>
            )}
          </div>
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
                      <th>Sub Category</th>
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
                                <small>{service.subCategory || 'No sub category'}</small>
                              </span>
                            </span>
                          </td>
                          <td>{service.category}</td>
                          <td>{service.subCategory || 'No sub category'}</td>
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
                      <tr><td colSpan={7}>No services match your filters.</td></tr>
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
            {serviceSaveStatus ? <p className="admin-status-text error">{serviceSaveStatus}</p> : null}
            <div className="service-editor-grid">
              <div className="service-editor-main">
                <AdminField label="Service Name">
                  <input value={serviceDraft.title} onChange={(event) => updateServiceDraft({ title: event.target.value })} />
                </AdminField>
                <div className="service-price-grid">
                  <AdminField label="Category">
                    <select value={serviceDraft.category} onChange={(event) => handleServiceCategoryChange(event.target.value)}>
                      {!serviceCategories.some((category) => category.name === serviceDraft.category) ? (
                        <option>{serviceDraft.category || 'Select category'}</option>
                      ) : null}
                      {serviceCategories.map((category) => (
                        <option key={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Sub Category">
                    <select value={serviceDraft.subCategory ?? ''} onChange={(event) => updateServiceDraft({ subCategory: event.target.value })}>
                      <option value="">No sub category</option>
                      {serviceDraft.subCategory && !selectedServiceSubCategories.some((subCategory) => subCategory.name === serviceDraft.subCategory) ? (
                        <option>{serviceDraft.subCategory}</option>
                      ) : null}
                      {selectedServiceSubCategories.map((subCategory) => (
                        <option key={subCategory.name}>{subCategory.name}</option>
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
                      <input min="0" type="number" value={serviceDraft.minPrice || ''} onChange={(event) => updateServicePriceDraft('minPrice', event.target.value)} />
                    </AdminField>
                    <AdminField label="Maximum Price (₹)">
                      <input min="0" type="number" value={serviceDraft.maxPrice || ''} onChange={(event) => updateServicePriceDraft('maxPrice', event.target.value)} />
                    </AdminField>
                  </div>
                ) : serviceDraft.serviceType === 'Fixed Price' ? (
                  <AdminField label="Price (₹)">
                    <input min="0" type="number" value={serviceDraft.fixedPrice || ''} onChange={(event) => updateServicePriceDraft('fixedPrice', event.target.value)} />
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
                <img src={serviceDraft.image} alt="" />
                <label className="service-image-upload">
                  <ImagePlus size={18} />
                  Upload image
                  <input accept="image/*" type="file" onChange={handleServiceImageUpload} />
                </label>
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
              <X size={20} />
            </button>
            <div className="category-modal-header">
              <p>Service Category</p>
              <h2>Manage Categories</h2>
              <span>Organize your salon services with categories and separate sub categories.</span>
            </div>
            <div className="category-modal-tabs" aria-label="Category modal sections">
              <button className={categoryModalTab === 'categories' ? 'active' : ''} type="button" onClick={() => setCategoryModalTab('categories')}>
                <Tags size={16} />
                Categories
              </button>
              <button
                className={categoryModalTab === 'sub-categories' ? 'active' : ''}
                type="button"
                onClick={() => {
                  setSelectedCategoryIndex(Math.min(selectedCategoryIndex, Math.max(serviceCategories.length - 1, 0)));
                  setCategoryModalTab('sub-categories');
                }}
              >
                <Sparkles size={16} />
                Sub Categories
              </button>
            </div>
            {categoryStatus ? <p className="admin-status-text">{categoryStatus}</p> : null}
            {categoryModalTab === 'categories' ? (
              <>
                <div className="category-modal-section">
                  <div>
                    <h3>Add New Category</h3>
                    <span>Create a main category for your services.</span>
                  </div>
                  <div className="category-create-row">
                    <input value={newCategoryName} placeholder="Enter category name" onChange={(event) => setNewCategoryName(event.target.value)} />
                    <button className="small-admin-button" type="button" onClick={handleAddCategory}>
                      <Plus size={16} />
                      Add Category
                    </button>
                  </div>
                </div>
                <div className="category-modal-section">
                  <div className="category-section-heading">
                    <div>
                      <h3>Existing Categories</h3>
                      <span>Edit category names or select one before opening sub categories.</span>
                    </div>
                    <label className="category-search-field">
                      <Search size={16} />
                      <input value={categorySearch} placeholder="Search categories..." onChange={(event) => setCategorySearch(event.target.value)} />
                    </label>
                  </div>
                  <div className="category-card-list">
                    {filteredServiceCategories.length ? filteredServiceCategories.map(({ category, index }) => (
                      <div
                        className={selectedCategoryIndex === index ? 'category-card-row active' : 'category-card-row'}
                        key={`${category.id ?? category.name}-${index}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCategoryIndex(index)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') setSelectedCategoryIndex(index);
                        }}
                      >
                        <GripVertical size={16} />
                        <span className="category-icon-tile" style={{ backgroundColor: category.backgroundColor || undefined }}>{getCategoryIcon(category.name, category.iconKey)}</span>
                        <span className="category-card-copy">
                          <input
                            aria-label={`${category.name || 'Category'} name`}
                            value={category.name}
                            onChange={(event) => updateCategoryName(index, event.target.value)}
                            onClick={(event) => event.stopPropagation()}
                          />
                          <small>{category.subCategories.length} sub categor{category.subCategories.length === 1 ? 'y' : 'ies'} configured</small>
                        </span>
                        <div className="category-style-controls" onClick={(event) => event.stopPropagation()}>
                          <label>
                            Icon
                            <select value={category.iconKey ?? ''} onChange={(event) => updateCategoryDetails(index, { iconKey: event.target.value })}>
                              <option value="">Auto</option>
                              {Object.entries(serviceCategoryIcons).map(([key, icon]) => (
                                <option key={key} value={key}>{icon.label}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Bg Color
                            <span className="category-color-control">
                              <input type="color" value={category.backgroundColor || '#0b4b3a'} onChange={(event) => updateCategoryDetails(index, { backgroundColor: event.target.value })} />
                              <ChevronDown size={14} />
                            </span>
                          </label>
                          <label>
                            Image
                            <span className="category-image-preview">
                              {category.imageUrl ? <img src={category.imageUrl} alt={`${category.name || 'Category'} preview`} /> : <Image size={20} />}
                              <span className="category-image-edit" aria-hidden="true">
                                <Pencil size={13} />
                              </span>
                              <input accept="image/*" type="file" onChange={(event) => void handleCategoryImageUpload(index, event)} />
                            </span>
                          </label>
                        </div>
                        <span className="category-sub-count">
                          <span>Sub Categories</span>
                          <strong>{category.subCategories.length}</strong>
                        </span>
                        <button
                          className="outline-admin-button category-manage-button"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedCategoryIndex(index);
                            setCategoryModalTab('sub-categories');
                          }}
                        >
                          <Settings size={14} />
                          Manage
                        </button>
                        <button
                          className="icon-admin-button danger"
                          type="button"
                          aria-label={`Delete ${category.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteCategory(index);
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )) : (
                      <div className="empty-admin-state">
                        <strong>{serviceCategories.length ? 'No matching categories' : 'No categories yet'}</strong>
                        <span>{serviceCategories.length ? 'Try another search term.' : 'Add your first category above, then create sub categories for it.'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="category-modal-section sub-category-workspace">
                <div className="category-section-heading">
                  <div>
                    <h3>Manage Sub Categories</h3>
                    <span>Pick one category, then add or edit its sub categories.</span>
                  </div>
                  <label className="category-search-field">
                    <Search size={16} />
                    <input value={categorySearch} placeholder="Search categories..." onChange={(event) => setCategorySearch(event.target.value)} />
                  </label>
                </div>
                <div className="sub-category-layout">
                  <div className="sub-category-category-list" aria-label="Categories">
                    {filteredServiceCategories.length ? filteredServiceCategories.map(({ category, index }) => (
                      <button
                        className={selectedCategoryIndex === index ? 'sub-category-category-card active' : 'sub-category-category-card'}
                        key={`${category.id ?? category.name}-sub-${index}`}
                        type="button"
                        onClick={() => setSelectedCategoryIndex(index)}
                      >
                        <span className="category-icon-tile" style={{ backgroundColor: category.backgroundColor || undefined }}>{getCategoryIcon(category.name, category.iconKey)}</span>
                        <span>
                          <strong>{category.name || 'Untitled Category'}</strong>
                          <small>{category.subCategories.length} sub categor{category.subCategories.length === 1 ? 'y' : 'ies'}</small>
                        </span>
                        <span className="category-count-badge">{category.subCategories.length}</span>
                      </button>
                    )) : (
                      <div className="empty-admin-state">
                        <strong>No categories found</strong>
                        <span>Add a category first or change your search.</span>
                      </div>
                    )}
                  </div>
                  {serviceCategories[selectedCategoryIndex] ? (
                    <div className="sub-category-detail-panel">
                      <div>
                        <h3>{serviceCategories[selectedCategoryIndex].name || 'Selected Category'}</h3>
                        <span>Add each sub category as its own item.</span>
                      </div>
                      <div className="sub-category-list">
                        {serviceCategories[selectedCategoryIndex].subCategories.length ? serviceCategories[selectedCategoryIndex].subCategories.map((subCategory, subCategoryIndex) => (
                          <div className="sub-category-row" key={`${serviceCategories[selectedCategoryIndex].name}-${subCategory.name}-${subCategoryIndex}`}>
                            <input value={subCategory.name} onChange={(event) => updateSubCategory(selectedCategoryIndex, subCategoryIndex, event.target.value)} />
                            <button className="icon-admin-button danger" type="button" aria-label={`Delete ${subCategory.name}`} onClick={() => deleteSubCategory(selectedCategoryIndex, subCategoryIndex)}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )) : <span className="muted-line">No sub categories yet.</span>}
                      </div>
                      <div className="sub-category-add-row">
                        <input
                          value={newSubCategoryNames[selectedCategoryIndex] ?? ''}
                          placeholder="Enter sub category name"
                          onChange={(event) => setNewSubCategoryNames({ ...newSubCategoryNames, [selectedCategoryIndex]: event.target.value })}
                        />
                        <button className="small-admin-button" type="button" onClick={() => addSubCategory(selectedCategoryIndex)}>
                          <Plus size={16} />
                          Add Sub Category
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="sub-category-detail-panel">
                      <div className="empty-admin-state">
                        <strong>No category selected</strong>
                        <span>Create or select a category to manage sub categories.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="category-tip-row">
              <Sparkles size={18} />
              <div>
                <strong>Tip</strong>
                <span>Save categories after changes so your website and service forms stay in sync with the database.</span>
              </div>
            </div>
            <div className="category-modal-actions">
              <button className="outline-admin-button cancel-admin-button" type="button" onClick={() => setIsCategoryModalOpen(false)}>Close</button>
              <button className="small-admin-button" type="button" onClick={handleSaveCategories}>
                <Save size={16} />
                Save Categories
              </button>
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
  { id: 'gallery', label: 'Manage Gallery', icon: <Image size={18} /> },
  { id: 'services', label: 'Manage Service', icon: <Sparkles size={18} /> },
  { id: 'vouchers', label: 'Voucher Management', icon: <Gift size={18} /> },
];

function findServiceIndex(services: Service[], serviceToFind: Service) {
  return services.findIndex((service) => {
    if (service.id && serviceToFind.id) return service.id === serviceToFind.id;
    return service.title === serviceToFind.title
      && service.category === serviceToFind.category
      && service.subCategory === serviceToFind.subCategory
      && service.image === serviceToFind.image;
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
