import { useState, useEffect } from 'react';
import {
  Briefcase, Plus, Search, Filter, Edit3, Trash2, CheckCircle2,
  ExternalLink, Eye, Image as ImageIcon, Sparkles, Building2,
  Factory, Wrench, ShieldCheck, Boxes, Coffee, Users, AlertTriangle,
  X, Check, ArrowUpDown, Layers, RefreshCw
} from 'lucide-react';
import { api } from '@mock/mockData';

interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  imageUrl?: string;
  iconName?: string;
  features: string[];
  displayOrder: number;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORIES = [
  'All Categories',
  'Facility Management',
  'Industrial & Support',
  'Corporate Support',
  'Engineering & Maintenance',
  'Security & Guarding',
  'Logistics & Warehousing',
  'Hospitality'
];

const PRESET_ICONS = [
  { name: 'Building2', icon: Building2, label: 'Building' },
  { name: 'Factory', icon: Factory, label: 'Industrial' },
  { name: 'Briefcase', icon: Briefcase, label: 'Corporate' },
  { name: 'Wrench', icon: Wrench, label: 'Technical' },
  { name: 'ShieldCheck', icon: ShieldCheck, label: 'Security' },
  { name: 'Boxes', icon: Boxes, label: 'Warehouse' },
  { name: 'Coffee', icon: Coffee, label: 'Hospitality' },
  { name: 'Users', icon: Users, label: 'Office' },
  { name: 'Layers', icon: Layers, label: 'General' },
];

const PRESET_IMAGES = [
  { label: 'Integrated Facilities', url: 'https://silverstarindia.net/wp-content/uploads/2024/09/1.jpg' },
  { label: 'Manufacturing Support', url: 'https://silverstarindia.net/wp-content/uploads/2024/09/2.jpg' },
  { label: 'Business Support', url: 'https://silverstarindia.net/wp-content/uploads/2024/09/4.jpg' },
  { label: 'Technical Services', url: 'https://silverstarindia.net/wp-content/uploads/2024/08/sr4.jpg' },
  { label: 'Security Services', url: 'https://silverstarindia.net/wp-content/uploads/2024/08/sr5.jpg' },
  { label: 'Warehouse Management', url: 'https://silverstarindia.net/wp-content/uploads/2024/08/sr6.jpg' },
  { label: 'Guest House Management', url: 'https://silverstarindia.net/wp-content/uploads/2024/09/7.jpg' },
  { label: 'Office Support', url: 'https://silverstarindia.net/wp-content/uploads/2024/09/8.jpg' },
];

export default function ServicesManagement() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<ServiceItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewService, setPreviewService] = useState<ServiceItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('Facility Management');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIconName, setFormIconName] = useState('Building2');
  const [formFeatures, setFormFeatures] = useState<string[]>(['']);
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await api.getServices({ status: 'all' });
      setServices(data || []);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory('Facility Management');
    setFormShortDesc('');
    setFormDesc('');
    setFormImageUrl(PRESET_IMAGES[0].url);
    setFormIconName('Building2');
    setFormFeatures([
      'Statutory & Regulatory Compliance',
      'Trained & Verified Dedicated Crew',
      'Daily Digital Quality Reporting'
    ]);
    setFormDisplayOrder(services.length + 1);
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (s: ServiceItem) => {
    setEditingService(s);
    setFormTitle(s.title);
    setFormSlug(s.slug);
    setFormCategory(s.category);
    setFormShortDesc(s.shortDescription);
    setFormDesc(s.description);
    setFormImageUrl(s.imageUrl || '');
    setFormIconName(s.iconName || 'Building2');
    setFormFeatures(s.features && s.features.length > 0 ? s.features : ['']);
    setFormDisplayOrder(s.displayOrder || 1);
    setFormStatus(s.status || 'Active');
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingService) {
      setFormSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleAddFeatureField = () => {
    setFormFeatures([...formFeatures, '']);
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...formFeatures];
    updated[index] = val;
    setFormFeatures(updated);
  };

  const handleRemoveFeatureField = (index: number) => {
    const updated = formFeatures.filter((_, i) => i !== index);
    setFormFeatures(updated.length > 0 ? updated : ['']);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formShortDesc.trim()) {
      alert('Please provide at least a service title and short description.');
      return;
    }

    setSaving(true);
    const cleanedFeatures = formFeatures.map(f => f.trim()).filter(Boolean);

    try {
      if (editingService) {
        await api.updateService(editingService.id, {
          title: formTitle.trim(),
          slug: formSlug.trim(),
          category: formCategory,
          shortDescription: formShortDesc.trim(),
          description: formDesc.trim() || formShortDesc.trim(),
          imageUrl: formImageUrl.trim(),
          iconName: formIconName,
          features: cleanedFeatures,
          displayOrder: Number(formDisplayOrder),
          status: formStatus,
        });
        showToast(`Service "${formTitle}" updated successfully!`);
      } else {
        await api.createService({
          title: formTitle.trim(),
          slug: formSlug.trim(),
          category: formCategory,
          shortDescription: formShortDesc.trim(),
          description: formDesc.trim() || formShortDesc.trim(),
          imageUrl: formImageUrl.trim(),
          iconName: formIconName,
          features: cleanedFeatures,
          displayOrder: Number(formDisplayOrder),
          status: formStatus,
        });
        showToast(`New service "${formTitle}" added to database!`);
      }

      setIsModalOpen(false);
      await fetchServices();
    } catch (err: any) {
      console.error('Save service failed:', err);
      alert(`Error saving service: ${err.message || 'Server error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async () => {
    if (!isDeleting) return;
    try {
      await api.deleteService(isDeleting.id);
      showToast(`Service "${isDeleting.title}" deleted.`);
      setIsDeleting(null);
      await fetchServices();
    } catch (err: any) {
      console.error('Delete service error:', err);
      alert(`Could not delete service: ${err.message}`);
    }
  };

  // Filtered Services
  const filteredServices = services.filter((s) => {
    const matchesQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || s.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'all' || s.status === statusFilter;

    return matchesQuery && matchesCategory && matchesStatus;
  });

  const getServiceIcon = (iconName?: string) => {
    const found = PRESET_ICONS.find(p => p.name === iconName);
    const Comp = found ? found.icon : Building2;
    return <Comp size={18} className="text-[#202B75]" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#202B75] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20 animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-[#26BCEE]" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#202B75] via-[#161f56] to-[#0d143c] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-[#26BCEE]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#26BCEE] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Sparkles size={13} />
            <span>Corporate Website & Public Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Services Management</h1>
          <p className="text-white/80 text-sm max-w-2xl leading-relaxed">
            Manage public facility management offerings, descriptions, deliverables, and live website showcase. All changes reflect in real-time on the public corporate portal.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <a
            href="http://localhost:5172/services-offered"
            target="_blank"
            rel="noreferrer"
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-white/20"
          >
            <ExternalLink size={15} />
            <span>View Live Website</span>
          </a>

          <button
            onClick={openAddModal}
            className="bg-[#26BCEE] hover:bg-[#1fa8d6] active:scale-[0.98] text-[#202B75] font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#26BCEE]/25 transition-all"
          >
            <Plus size={16} strokeWidth={3} />
            <span>+ Add New Service</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#202B75] flex items-center justify-center font-black">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Services</p>
            <p className="text-xl font-black text-slate-900">{services.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Active Offerings</p>
            <p className="text-xl font-black text-emerald-700">
              {services.filter(s => s.status === 'Active').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Service Sectors</p>
            <p className="text-xl font-black text-slate-900">
              {Array.from(new Set(services.map(s => s.category))).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
            <ArrowUpDown size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Database Sync</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Connected (5432)
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service title, deliverables, category..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <Filter size={14} className="text-slate-400" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#202B75]"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#202B75]"
          >
            <option value="all">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          <button
            onClick={fetchServices}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Services"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#202B75]/20 border-t-[#202B75] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading services from PostgreSQL...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-sm space-y-3">
          <Briefcase size={36} className="text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Services Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All Categories'
              ? 'No services match your active filters. Try clearing the search query.'
              : 'No services exist in the database yet. Click "+ Add New Service" to create one.'}
          </p>
          {(searchQuery || selectedCategory !== 'All Categories') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All Categories'); }}
              className="text-xs font-bold text-[#202B75] underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Image & Category Header */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={service.imageUrl || 'https://silverstarindia.net/wp-content/uploads/2024/09/1.jpg'}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://silverstarindia.net/wp-content/uploads/2024/09/1.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#202B75]/90 text-white backdrop-blur-sm shadow-sm">
                    {service.category}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                      service.status === 'Active'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-500 text-white'
                    }`}
                  >
                    {service.status}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-sm flex items-center justify-center shrink-0 shadow">
                    {getServiceIcon(service.iconName)}
                  </div>
                  <h3 className="text-white text-sm font-bold truncate tracking-wide">
                    {service.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {service.shortDescription}
                </p>

                {/* Deliverables tags */}
                {service.features && service.features.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Deliverables
                    </p>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {service.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                          <CheckCircle2 size={13} className="text-[#26BCEE] shrink-0 mt-0.5" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-[10px] text-slate-400 italic">
                          +{service.features.length - 3} additional deliverables
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Order: #{service.displayOrder}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewService(service)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#202B75] hover:bg-slate-100 transition-colors"
                      title="Quick Preview"
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      onClick={() => openEditModal(service)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Service"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      onClick={() => setIsDeleting(service)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD / EDIT MODAL */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#202B75] flex items-center justify-center">
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingService ? `Edit Service: ${editingService.title}` : 'Add New Corporate Service'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure title, category, deliverables, and public showcase image
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Integrated Facilities Management"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. integrated-facilities-management"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  >
                    {CATEGORIES.filter(c => c !== 'All Categories').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    min={1}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  >
                    <option value="Active">Active (Live on Website)</option>
                    <option value="Inactive">Inactive (Draft / Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Card Short Summary * (1-2 sentences for catalog)
                </label>
                <textarea
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="One-stop solution for all facility management needs..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Detailed Scope & Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Comprehensive description of the service scope, operational methodologies, compliance guarantees..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                />
              </div>

              {/* Image Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <ImageIcon size={13} className="text-[#202B75]" />
                    <span>Showcase Image URL</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Choose preset or enter custom URL</span>
                </div>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75] mb-2"
                />

                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[10px]">
                  <span className="text-slate-400 shrink-0 font-bold">Presets:</span>
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormImageUrl(preset.url)}
                      className={`px-2.5 py-1 rounded-lg border shrink-0 transition-all font-semibold ${
                        formImageUrl === preset.url
                          ? 'bg-[#202B75] text-white border-[#202B75]'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Service Category Icon
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {PRESET_ICONS.map((p) => {
                    const IconComp = p.icon;
                    const isSelected = formIconName === p.name;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setFormIconName(p.name)}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                          isSelected
                            ? 'bg-[#202B75] text-white border-[#202B75] shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp size={15} />
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deliverables / Features */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Key Features & Deliverables Checklist
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeatureField}
                    className="text-[11px] font-bold text-[#202B75] hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Add Deliverable</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 w-5 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder="e.g. Mechanized Housekeeping & Floor Care"
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                      />
                      {formFeatures.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeatureField(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#202B75] hover:bg-[#161f56] text-white text-xs font-bold shadow-md shadow-[#202B75]/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingService ? 'Save Changes' : 'Create Service'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Delete Service</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-bold text-slate-800">"{isDeleting.title}"</span>? This will unpublish the offering from the public corporate website.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setIsDeleting(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Keep Service
              </button>
              <button
                onClick={handleDeleteService}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PREVIEW MODAL */}
      {/* ======================================================== */}
      {previewService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <button
              onClick={() => setPreviewService(null)}
              className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full"
            >
              <X size={16} />
            </button>

            <div className="relative h-56">
              <img
                src={previewService.imageUrl || 'https://silverstarindia.net/wp-content/uploads/2024/09/1.jpg'}
                alt={previewService.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#26BCEE] text-[#202B75] mb-1.5 inline-block">
                  {previewService.category}
                </span>
                <h3 className="text-lg font-black">{previewService.title}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Scope of Service
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {previewService.description || previewService.shortDescription}
                </p>
              </div>

              {previewService.features && previewService.features.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Deliverables & Standards
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewService.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Slug: /{previewService.slug}
                </span>
                <button
                  onClick={() => {
                    setPreviewService(null);
                    openEditModal(previewService);
                  }}
                  className="px-4 py-2 bg-[#202B75] text-white rounded-xl text-xs font-bold hover:bg-[#161f56]"
                >
                  Edit This Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
