/**
 * صفحة مهندس الكميات والتسعيرات
 * Quantity Surveyor Page
 */

import React, { useState, useEffect } from 'react';
import {
    ClipboardCheck, Building2, Users, Percent, TrendingDown,
    Search, Filter, Eye, Check, X, Edit2, Clock, FileText,
    ArrowLeft, AlertCircle, CheckCircle, RefreshCw, Plus,
    Package, DollarSign, Calendar, MessageSquare, Send
} from 'lucide-react';
import { Employee, ROLE_TRANSLATIONS } from '../../../services/employeeService';
import { registrationService, RegistrationRequest, USER_TYPE_TRANSLATIONS } from '../../../services/registrationService';
import { supplierService, Supplier, SupplierProduct, SupplierBalance } from '../../../services/supplierService';
import {
    supplierReviewService,
    SupplierDataReview,
    REVIEW_STATUS_TRANSLATIONS,
    REVIEW_DATA_TYPE_TRANSLATIONS,
    maskEngineerName
} from '../../../services/supplierReviewService';
import {
    PRODUCT_CATEGORIES,
    APPROVAL_STATUS_TRANSLATIONS,
    PURCHASE_INVOICE_STATUS_TRANSLATIONS
} from '../../../services/supplierService';
import {
    discountRequestService,
    DiscountRequest,
    DISCOUNT_REQUEST_STATUS_TRANSLATIONS,
    DISCOUNT_TARGET_TYPE_TRANSLATIONS,
    DISCOUNT_TYPE_TRANSLATIONS
} from '../../../services/discountRequestService';
import {
    dataCorrectionService,
    DataCorrectionRequest,
    CORRECTION_STATUS_TRANSLATIONS,
    CORRECTION_DATA_TYPE_TRANSLATIONS,
    CORRECTION_PRIORITY_TRANSLATIONS,
    PRIORITY_COLORS,
    STATUS_COLORS
} from '../../../services/dataCorrectionService';
import {
    externalSupplierService,
    ExternalSupplier,
    ExternalPrice,
    EXTERNAL_LINK_TYPES,
    PRICE_SOURCES
} from '../../../services/externalSupplierService';
import { ITEMS_DATABASE } from '../../../constants';
import { ProjectType, BaseItem } from '../../../types';

// ====================== Props ======================
interface QuantitySurveyorPageProps {
    employee: Employee;
    language: 'ar' | 'en';
    onLogout: () => void;
}

// ====================== Tab Types ======================
type TabType = 'dashboard' | 'products' | 'suppliers' | 'companies' | 'individuals' | 'discounts' | 'corrections' | 'external_pricing' | 'items_management';

// ====================== Main Component ======================
const QuantitySurveyorPage: React.FC<QuantitySurveyorPageProps> = ({
    employee, language, onLogout
}) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    // State
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [supplierBalances, setSupplierBalances] = useState<SupplierBalance[]>([]);
    const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
    const [reviews, setReviews] = useState<SupplierDataReview[]>([]);
    const [discountRequests, setDiscountRequests] = useState<DiscountRequest[]>([]);
    const [companies, setCompanies] = useState<RegistrationRequest[]>([]);
    const [individuals, setIndividuals] = useState<RegistrationRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [productFilterRole, setProductFilterRole] = useState<'all' | 'system' | 'supplier'>('all');
    const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<SupplierProduct | null>(null); // For QS Notes modal
    const [qsNoteText, setQsNoteText] = useState(''); // Text for QS note
    const [showQsNoteModal, setShowQsNoteModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState<SupplierDataReview | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [discountForm, setDiscountForm] = useState({
        targetType: 'company' as 'company' | 'individual',
        targetId: '',
        targetName: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: '',
        notes: ''
    });

    // Correction requests state
    const [correctionRequests, setCorrectionRequests] = useState<DataCorrectionRequest[]>([]);
    const [showCorrectionModal, setShowCorrectionModal] = useState(false);
    const [correctionForm, setCorrectionForm] = useState({
        supplierId: '',
        supplierName: '',
        dataType: 'product' as 'product' | 'service' | 'company_info' | 'pricing' | 'other',
        dataId: '',
        dataName: '',
        currentValue: '',
        issueDescription: '',
        suggestedCorrection: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
    });

    // External Suppliers state
    const [externalSuppliers, setExternalSuppliers] = useState<ExternalSupplier[]>([]);
    const [externalPrices, setExternalPrices] = useState<ExternalPrice[]>([]);
    const [showExternalSupplierModal, setShowExternalSupplierModal] = useState(false);
    const [showExternalPriceModal, setShowExternalPriceModal] = useState(false);
    const [selectedExternalSupplier, setSelectedExternalSupplier] = useState<ExternalSupplier | null>(null);
    const [externalSupplierForm, setExternalSupplierForm] = useState({
        name: { ar: '', en: '' },
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        website: '',
        linkType: 'manual' as 'manual' | 'api' | 'scraping',
        categories: [] as string[],
        apiEndpoint: '',
        apiKey: '',
        refreshInterval: 24
    });
    const [externalPriceForm, setExternalPriceForm] = useState({
        externalSupplierId: '',
        productName: { ar: '', en: '' },
        productCode: '',
        category: '',
        unit: '',
        price: 0,
        source: 'manual_entry' as 'manual_entry' | 'api_fetch' | 'website_scrape' | 'quotation',
        sourceReference: ''
    });

    // Items Management State
    const [selectedProjectType, setSelectedProjectType] = useState<'all' | ProjectType | 'villa' | 'tower' | 'rest_house' | 'factory' | 'farm' | 'school' | 'hospital'>('all');
    const [itemsSearchQuery, setItemsSearchQuery] = useState('');
    const [selectedItemCategory, setSelectedItemCategory] = useState<string>('all');
    const [editingItem, setEditingItem] = useState<BaseItem | null>(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [customItems, setCustomItems] = useState<BaseItem[]>([]);

    // Project Types for filtering
    const PROJECT_TYPES: { id: string; ar: string; en: string }[] = [
        { id: 'all', ar: 'جميع الأنواع', en: 'All Types' },
        { id: 'villa', ar: 'فيلا', en: 'Villa' },
        { id: 'tower', ar: 'برج', en: 'Tower' },
        { id: 'rest_house', ar: 'استراحة', en: 'Rest House' },
        { id: 'factory', ar: 'مصنع', en: 'Factory' },
        { id: 'farm', ar: 'مزرعة', en: 'Farm' },
        { id: 'school', ar: 'مدرسة', en: 'School' },
        { id: 'hospital', ar: 'مستشفى', en: 'Hospital' },
        { id: 'mosque', ar: 'مسجد', en: 'Mosque' },
        { id: 'hotel', ar: 'فندق', en: 'Hotel' },
        { id: 'residential_building', ar: 'عمارة سكنية', en: 'Residential Building' }
    ];

    // Item Categories
    const ITEM_CATEGORIES: { id: string; ar: string; en: string }[] = [
        { id: 'all', ar: 'جميع التصنيفات', en: 'All Categories' },
        { id: 'site', ar: 'أعمال الموقع', en: 'Site Work' },
        { id: 'structure', ar: 'الهيكل الإنشائي', en: 'Structure' },
        { id: 'architecture', ar: 'التشطيبات', en: 'Architecture' },
        { id: 'mep_elec', ar: 'الكهرباء', en: 'Electrical' },
        { id: 'mep_plumb', ar: 'السباكة', en: 'Plumbing' },
        { id: 'mep_hvac', ar: 'التكييف', en: 'HVAC' },
        { id: 'insulation', ar: 'العزل', en: 'Insulation' },
        { id: 'safety', ar: 'السلامة', en: 'Safety' },
        { id: 'gov_fees', ar: 'الرسوم الحكومية', en: 'Government Fees' }
    ];

    // Load data
    useEffect(() => {
        loadData();

        // Listen for storage changes (to sync across tabs)
        const handleStorageChange = () => {
            loadData();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [activeTab]);

    const loadData = () => {
        // تهيئة البيانات التجريبية أولاً
        registrationService.initializeSampleData();
        supplierService.initializeSampleData();

        // Suppliers
        const suppliersList = supplierService.getSuppliers();
        setSuppliers(suppliersList);
        setSupplierBalances(supplierService.getAllSupplierBalances());
        setSupplierProducts(supplierService.getProducts());

        // Reviews
        setReviews(supplierReviewService.getReviews());

        // Discount requests
        setDiscountRequests(discountRequestService.getRequestsByEngineer(employee.id));

        // Companies and Individuals
        const requests = registrationService.getRequests().filter(r => r.status === 'approved');
        setCompanies(requests.filter(r => r.userType === 'company'));
        setIndividuals(requests.filter(r => r.userType === 'individual'));

        // Initialize sample review data
        if (suppliersList.length > 0 && supplierReviewService.getReviews().length === 0) {
            supplierReviewService.initializeSampleData(
                suppliersList.map(s => ({ id: s.id, name: s.companyName }))
            );
            setReviews(supplierReviewService.getReviews());
        }

        // Correction requests
        setCorrectionRequests(dataCorrectionService.getRequestsByEngineer(employee.id));

        // External Suppliers
        externalSupplierService.initializeSampleData();
        setExternalSuppliers(externalSupplierService.getSuppliers());
        setExternalPrices(externalSupplierService.getPrices());
    };

    // Handle review actions
    const handleApproveReview = (reviewId: string) => {
        try {
            supplierReviewService.approveReview(reviewId, employee.id, employee.name);
            loadData();
            setShowReviewModal(false);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleRequestRevision = (reviewId: string, notes: string) => {
        if (!notes.trim()) {
            alert(t('يرجى إدخال ملاحظات التعديل', 'Please enter revision notes'));
            return;
        }
        try {
            supplierReviewService.requestRevision(reviewId, employee.id, employee.name, notes);
            loadData();
            setShowReviewModal(false);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleRejectReview = (reviewId: string, reason: string) => {
        if (!reason.trim()) {
            alert(t('يرجى إدخال سبب الرفض', 'Please enter rejection reason'));
            return;
        }
        try {
            supplierReviewService.rejectReview(reviewId, employee.id, employee.name, reason);
            loadData();
            setShowReviewModal(false);
        } catch (e: any) {
            alert(e.message);
        }
    };

    // Handle discount request
    const handleCreateDiscountRequest = () => {
        if (!discountForm.targetId || !discountForm.reason.trim() || discountForm.discountValue <= 0) {
            alert(t('يرجى ملء جميع الحقول المطلوبة', 'Please fill all required fields'));
            return;
        }
        try {
            discountRequestService.createRequest({
                ...discountForm,
                requestedBy: employee.id,
                requestedByName: employee.name
            });
            loadData();
            setShowDiscountModal(false);
            setDiscountForm({
                targetType: 'company',
                targetId: '',
                targetName: '',
                discountType: 'percentage',
                discountValue: 0,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                reason: '',
                notes: ''
            });
        } catch (e: any) {
            alert(e.message);
        }
    };

    // Handle correction request
    const handleCreateCorrectionRequest = () => {
        if (!correctionForm.supplierId || !correctionForm.issueDescription.trim()) {
            alert(t('يرجى ملء جميع الحقول المطلوبة', 'Please fill all required fields'));
            return;
        }
        try {
            dataCorrectionService.createRequest({
                ...correctionForm,
                requestedBy: employee.id,
                requestedByName: employee.name
            });
            loadData();
            setShowCorrectionModal(false);
            setCorrectionForm({
                supplierId: '',
                supplierName: '',
                dataType: 'product',
                dataId: '',
                dataName: '',
                currentValue: '',
                issueDescription: '',
                suggestedCorrection: '',
                priority: 'medium'
            });
            alert(t('تم إرسال طلب التصحيح بنجاح', 'Correction request sent successfully'));
        } catch (e: any) {
            alert(e.message);
        }
    };

    // Stats
    const stats = {
        pendingReviews: reviews.filter(r => r.status === 'pending').length,
        approvedReviews: reviews.filter(r => r.status === 'approved').length,
        pendingDiscounts: discountRequests.filter(d => d.status === 'pending').length,
        activeDiscounts: discountRequests.filter(d => d.status === 'approved' && d.isActive).length,
        pendingCorrections: correctionRequests.filter(c => c.status === 'pending').length,
        completedCorrections: correctionRequests.filter(c => c.status === 'completed').length
    };

    // Handle QS Notes
    const handleOpenQsNoteModal = (product: SupplierProduct) => {
        setSelectedProduct(product);
        setQsNoteText(product.qsDescription || '');
        setShowQsNoteModal(true);
    };

    const handleSaveQsNote = () => {
        if (!selectedProduct) return;

        supplierService.updateProduct(selectedProduct.id, {
            qsDescription: qsNoteText,
            qsDescriptionUpdatedAt: new Date().toISOString()
        });

        loadData();
        setShowQsNoteModal(false);
    };

    // Render Products Tab
    const renderProductsTab = () => {
        // Filter products
        const filteredProducts = supplierProducts.filter(p => {
            const matchesSearch = p.name.ar.includes(searchQuery) ||
                p.name.en.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = productFilterRole === 'all' ||
                (productFilterRole === 'system' && p.source === 'system') ||
                (productFilterRole === 'supplier' && p.source !== 'system');
            const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;

            return matchesSearch && matchesRole && matchesCategory;
        });

        return (
            <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex-1 relative">
                        <Search className="absolute top-3 right-3 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('بحث عن منتج...', 'Search specific product...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 pr-10 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <select
                        value={productFilterRole}
                        onChange={(e) => setProductFilterRole(e.target.value as any)}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                        <option value="all">{t('جميع المصادر', 'All Sources')}</option>
                        <option value="system">{t('النظام', 'System')}</option>
                        <option value="supplier">{t('الموردين', 'Suppliers')}</option>
                    </select>

                    <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                        <option value="all">{t('جميع التصنيفات', 'All Categories')}</option>
                        {Object.entries(PRODUCT_CATEGORIES).map(([key, cat]) => (
                            <option key={key} value={key}>{language === 'ar' ? cat.ar : cat.en}</option>
                        ))}
                    </select>

                    <button
                        onClick={loadData}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
                        title={t('تحديث', 'Refresh')}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition group">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        {/* Source Badge */}
                                        {product.source === 'system' ? (
                                            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-500/30 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                {t('النظام', 'System')}
                                            </span>
                                        ) : (
                                            <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full border border-orange-500/30 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {t('مورد', 'Supplier')}
                                            </span>
                                        )}
                                        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                                            {language === 'ar' ? PRODUCT_CATEGORIES[product.category]?.ar : PRODUCT_CATEGORIES[product.category]?.en}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${product.approvalStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                                        product.approvalStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {APPROVAL_STATUS_TRANSLATIONS[product.approvalStatus][language]}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2">{language === 'ar' ? product.name.ar : product.name.en}</h3>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-2xl font-bold text-cyan-400">
                                        {product.price.toLocaleString()} <span className="text-sm text-slate-400">{t('ر.س', 'SAR')}</span>
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        {product.stock} {product.unit}
                                    </div>
                                </div>

                                {/* QS Description Section */}
                                <div className="bg-slate-900/50 rounded-lg p-3 mb-4 min-h-[80px] border border-slate-700/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            {t('شرح مهندس الكميات', 'QS Description')}
                                        </p>
                                        <button
                                            onClick={() => handleOpenQsNoteModal(product)}
                                            className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            {product.qsDescription ? t('تعديل', 'Edit') : t('إضافة', 'Add')}
                                        </button>
                                    </div>
                                    {product.qsDescription ? (
                                        <p className="text-sm text-slate-300 line-clamp-3">{product.qsDescription}</p>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">{t('لا يوجد شرح إضافي', 'No additional description')}</p>
                                    )}
                                </div>

                                {product.source !== 'system' && (
                                    <div className="text-xs text-slate-500 mt-2 border-t border-slate-700/50 pt-2">
                                        {suppliers.find(s => s.id === product.supplierId)?.companyName ? (
                                            <> {t('مورد:', 'Supplier:')} {suppliers.find(s => s.id === product.supplierId)?.companyName} </>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Tabs definition
    const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
        { id: 'dashboard', label: t('لوحة المعلومات', 'Dashboard'), icon: <TrendingDown className="w-5 h-5" /> },
        { id: 'products', label: t('دليل المنتجات', 'Products Catalog'), icon: <Package className="w-5 h-5" /> },
        { id: 'suppliers', label: t('الموردين', 'Suppliers'), icon: <Building2 className="w-5 h-5" /> },
        { id: 'companies', label: t('الشركات', 'Companies'), icon: <Building2 className="w-5 h-5" /> },
        { id: 'individuals', label: t('الأفراد', 'Individuals'), icon: <Users className="w-5 h-5" /> },
        { id: 'discounts', label: t('طلبات التخفيض', 'Discount Requests'), icon: <Percent className="w-5 h-5" />, count: discountRequests.filter(r => r.status === 'pending').length },
        { id: 'corrections', label: t('طلبات التصحيح', 'Correction Requests'), icon: <MessageSquare className="w-5 h-5" />, count: correctionRequests.filter(r => r.status === 'pending').length },
        { id: 'external_pricing', label: t('تسعير الموردين الخارجيين', 'External Pricing'), icon: <DollarSign className="w-5 h-5" />, count: externalPrices.length },
        { id: 'items_management', label: t('إدارة البنود', 'Items Management'), icon: <ClipboardCheck className="w-5 h-5" />, count: ITEMS_DATABASE.length },
    ];

    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">
                                {employee.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">{t('مهندس الكميات', 'Quantity Surveyor')}</h1>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {employee.name} | {employee.employeeNumber}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('تسجيل الخروج', 'Logout')}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${activeTab === tab.id
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-cyan-500/20 text-cyan-400'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {activeTab === 'products' && renderProductsTab()}

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Clock className="w-5 h-5 text-yellow-400" />
                                        <span className="text-slate-300 text-sm">{t('مراجعات معلقة', 'Pending Reviews')}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{stats.pendingReviews}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <span className="text-slate-300 text-sm">{t('تمت الموافقة', 'Approved')}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{stats.approvedReviews}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Building2 className="w-5 h-5 text-blue-400" />
                                        <span className="text-slate-300 text-sm">{t('الشركات', 'Companies')}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{companies.length}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users className="w-5 h-5 text-purple-400" />
                                        <span className="text-slate-300 text-sm">{t('الأفراد', 'Individuals')}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{individuals.length}</p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white mb-4">{t('الإجراءات السريعة', 'Quick Actions')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setActiveTab('suppliers')}
                                        className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/20 transition"
                                    >
                                        <Package className="w-8 h-8 text-yellow-400" />
                                        <div className="text-start">
                                            <p className="text-white font-medium">{t('مراجعة المنتجات', 'Review Products')}</p>
                                            <p className="text-slate-400 text-sm">{stats.pendingReviews} {t('معلقة', 'pending')}</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setShowDiscountModal(true)}
                                        className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 transition"
                                    >
                                        <Percent className="w-8 h-8 text-green-400" />
                                        <div className="text-start">
                                            <p className="text-white font-medium">{t('طلب تخفيض', 'Request Discount')}</p>
                                            <p className="text-slate-400 text-sm">{t('لشركة أو فرد', 'For company or individual')}</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('companies')}
                                        className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition"
                                    >
                                        <Building2 className="w-8 h-8 text-blue-400" />
                                        <div className="text-start">
                                            <p className="text-white font-medium">{t('عرض الشركات', 'View Companies')}</p>
                                            <p className="text-slate-400 text-sm">{companies.length} {t('شركة', 'companies')}</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Recent Reviews */}
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white mb-4">{t('آخر المراجعات', 'Recent Reviews')}</h3>
                                {reviews.slice(0, 5).map(review => (
                                    <div key={review.id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${review.status === 'pending' ? 'bg-yellow-400' :
                                                review.status === 'approved' ? 'bg-green-400' :
                                                    review.status === 'rejected' ? 'bg-red-400' : 'bg-orange-400'
                                                }`} />
                                            <div>
                                                <p className="text-white">{review.supplierName}</p>
                                                <p className="text-slate-400 text-sm">
                                                    {REVIEW_DATA_TYPE_TRANSLATIONS[review.dataType][language]}
                                                    {review.dataName && ` - ${review.dataName}`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${review.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                            review.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                review.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                            {REVIEW_STATUS_TRANSLATIONS[review.status][language]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suppliers Review Tab */}
                    {activeTab === 'suppliers' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">{t('مراجعة بيانات الموردين', 'Supplier Data Review')}</h3>
                                <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                                    <RefreshCw className="w-4 h-4" />
                                    {t('تحديث', 'Refresh')}
                                </button>
                            </div>

                            {/* Suppliers List */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {suppliers.map(supplier => {
                                    const balance = supplierBalances.find(b => b.supplierId === supplier.id);
                                    const pendingReviews = reviews.filter(r => r.supplierId === supplier.id && r.status === 'pending').length;

                                    return (
                                        <div key={supplier.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{supplier.companyName}</p>
                                                        <p className="text-slate-400 text-sm">{supplier.phone}</p>
                                                    </div>
                                                </div>
                                                {pendingReviews > 0 && (
                                                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                                                        {pendingReviews} {t('معلق', 'pending')}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                                <div className="bg-slate-700/30 rounded-lg p-2">
                                                    <p className="text-slate-400">{t('المشتريات', 'Purchases')}</p>
                                                    <p className="text-white font-bold">{(balance?.totalPurchases || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="bg-slate-700/30 rounded-lg p-2">
                                                    <p className="text-slate-400">{t('المدفوعات', 'Payments')}</p>
                                                    <p className="text-green-400 font-bold">{(balance?.totalPayments || 0).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedSupplier(supplier);
                                                    // Show pending reviews for this supplier
                                                    const supplierReviews = reviews.filter(r => r.supplierId === supplier.id && r.status === 'pending');
                                                    if (supplierReviews.length > 0) {
                                                        setSelectedReview(supplierReviews[0]);
                                                        setShowReviewModal(true);
                                                    } else {
                                                        alert(t('لا توجد مراجعات معلقة لهذا المورد', 'No pending reviews for this supplier'));
                                                    }
                                                }}
                                                className="w-full py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition"
                                            >
                                                {t('مراجعة البيانات', 'Review Data')}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {suppliers.length === 0 && (
                                <div className="text-center py-12 text-slate-400 bg-slate-800/50 rounded-xl">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>{t('لا يوجد موردين مسجلين', 'No registered suppliers')}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Corrections Tab */}
                    {activeTab === 'corrections' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">{t('طلبات تصحيح البيانات', 'Data Correction Requests')}</h3>
                                <button
                                    onClick={() => setShowCorrectionModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                                >
                                    <Plus className="w-4 h-4" />
                                    {t('طلب تصحيح جديد', 'New Correction Request')}
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                                    <p className="text-slate-400 text-sm">{t('إجمالي الطلبات', 'Total Requests')}</p>
                                    <p className="text-2xl font-bold text-white">{correctionRequests.length}</p>
                                </div>
                                <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                                    <p className="text-slate-400 text-sm">{t('قيد الانتظار', 'Pending')}</p>
                                    <p className="text-2xl font-bold text-yellow-400">{stats.pendingCorrections}</p>
                                </div>
                                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                                    <p className="text-slate-400 text-sm">{t('تم الاستلام', 'Acknowledged')}</p>
                                    <p className="text-2xl font-bold text-blue-400">{correctionRequests.filter(c => c.status === 'acknowledged').length}</p>
                                </div>
                                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                                    <p className="text-slate-400 text-sm">{t('مكتملة', 'Completed')}</p>
                                    <p className="text-2xl font-bold text-green-400">{stats.completedCorrections}</p>
                                </div>
                            </div>

                            {/* Requests List */}
                            <div className="space-y-4">
                                {correctionRequests.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 bg-slate-800/50 rounded-xl">
                                        <Edit2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>{t('لا توجد طلبات تصحيح', 'No correction requests')}</p>
                                        <button
                                            onClick={() => setShowCorrectionModal(true)}
                                            className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                                        >
                                            {t('إنشاء طلب جديد', 'Create New Request')}
                                        </button>
                                    </div>
                                ) : (
                                    correctionRequests.map(request => (
                                        <div key={request.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-white font-medium">{request.supplierName}</p>
                                                        <span className={`px-2 py-0.5 rounded text-xs ${PRIORITY_COLORS[request.priority]}`}>
                                                            {CORRECTION_PRIORITY_TRANSLATIONS[request.priority][language]}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-400 text-sm">
                                                        {CORRECTION_DATA_TYPE_TRANSLATIONS[request.dataType][language]}
                                                        {request.dataName && ` - ${request.dataName}`}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[request.status]}`}>
                                                    {CORRECTION_STATUS_TRANSLATIONS[request.status][language]}
                                                </span>
                                            </div>

                                            <div className="bg-slate-700/30 rounded-lg p-3 mb-3">
                                                <p className="text-slate-400 text-sm mb-1">{t('وصف المشكلة:', 'Issue Description:')}</p>
                                                <p className="text-white text-sm">{request.issueDescription}</p>
                                            </div>

                                            {request.currentValue && (
                                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                                    <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/30">
                                                        <p className="text-slate-400 text-xs mb-1">{t('القيمة الحالية', 'Current Value')}</p>
                                                        <p className="text-red-400">{request.currentValue}</p>
                                                    </div>
                                                    {request.suggestedCorrection && (
                                                        <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/30">
                                                            <p className="text-slate-400 text-xs mb-1">{t('التصحيح المقترح', 'Suggested')}</p>
                                                            <p className="text-green-400">{request.suggestedCorrection}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {request.supplierResponse && (
                                                <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/30 text-sm">
                                                    <p className="text-slate-400 mb-1">{t('رد المورد:', 'Supplier Response:')}</p>
                                                    <p className="text-blue-400">{request.supplierResponse}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
                                                <span>{t('تاريخ الطلب:', 'Requested:')} {new Date(request.requestedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                                {request.completedAt && (
                                                    <span className="text-green-400">{t('اكتمل:', 'Completed:')} {new Date(request.completedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Companies Tab */}
                    {activeTab === 'companies' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">{t('الشركات المسجلة', 'Registered Companies')}</h3>
                                <div className="relative">
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('بحث...', 'Search...')}
                                        className="bg-slate-800 border border-slate-700 rounded-lg ps-10 pe-4 py-2 text-white w-64"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-700/50">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-sm text-slate-300">{t('اسم الشركة', 'Company Name')}</th>
                                            <th className="px-4 py-3 text-right text-sm text-slate-300">{t('البريد', 'Email')}</th>
                                            <th className="px-4 py-3 text-right text-sm text-slate-300">{t('الجوال', 'Phone')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-300">{t('السجل التجاري', 'CR')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الإجراءات', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {companies
                                            .filter(c => c.name.includes(searchQuery) || c.companyName?.includes(searchQuery) || c.email.includes(searchQuery))
                                            .map(company => (
                                                <tr key={company.id} className="hover:bg-slate-700/30">
                                                    <td className="px-4 py-3">
                                                        <p className="text-white font-medium">{company.companyName || company.name}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">{company.email}</td>
                                                    <td className="px-4 py-3 text-slate-300" dir="ltr">{company.phone}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2 py-1 rounded text-xs ${company.crVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                            {company.commercialRegister || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => {
                                                                setDiscountForm(prev => ({
                                                                    ...prev,
                                                                    targetType: 'company',
                                                                    targetId: company.id,
                                                                    targetName: company.companyName || company.name
                                                                }));
                                                                setShowDiscountModal(true);
                                                            }}
                                                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-sm"
                                                        >
                                                            {t('طلب تخفيض', 'Request Discount')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Individuals Tab */}
                    {activeTab === 'individuals' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">{t('الأفراد المسجلين', 'Registered Individuals')}</h3>
                                <div className="relative">
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('بحث...', 'Search...')}
                                        className="bg-slate-800 border border-slate-700 rounded-lg ps-10 pe-4 py-2 text-white w-64"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-700/50">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-sm text-slate-300">{t('الاسم', 'Name')}</th>
                                            <th className="px-4 py-3 text-right text-sm text-slate-300">{t('البريد', 'Email')}</th>
                                            <th className="px-4 py-3 text-right text-sm text-slate-300">{t('الجوال', 'Phone')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-300">{t('تاريخ التسجيل', 'Registration Date')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الإجراءات', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {individuals
                                            .filter(i => i.name.includes(searchQuery) || i.email.includes(searchQuery))
                                            .map(individual => (
                                                <tr key={individual.id} className="hover:bg-slate-700/30">
                                                    <td className="px-4 py-3 text-white font-medium">{individual.name}</td>
                                                    <td className="px-4 py-3 text-slate-300">{individual.email}</td>
                                                    <td className="px-4 py-3 text-slate-300" dir="ltr">{individual.phone}</td>
                                                    <td className="px-4 py-3 text-center text-slate-400 text-sm">
                                                        {new Date(individual.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => {
                                                                setDiscountForm(prev => ({
                                                                    ...prev,
                                                                    targetType: 'individual',
                                                                    targetId: individual.id,
                                                                    targetName: individual.name
                                                                }));
                                                                setShowDiscountModal(true);
                                                            }}
                                                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-sm"
                                                        >
                                                            {t('طلب تخفيض', 'Request Discount')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Discounts Tab */}
                    {activeTab === 'discounts' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">{t('طلبات التخفيض', 'Discount Requests')}</h3>
                                <button
                                    onClick={() => setShowDiscountModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                    <Plus className="w-4 h-4" />
                                    {t('طلب جديد', 'New Request')}
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                                    <p className="text-slate-400 text-sm">{t('إجمالي الطلبات', 'Total Requests')}</p>
                                    <p className="text-2xl font-bold text-white">{discountRequests.length}</p>
                                </div>
                                <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                                    <p className="text-slate-400 text-sm">{t('قيد الانتظار', 'Pending')}</p>
                                    <p className="text-2xl font-bold text-yellow-400">{stats.pendingDiscounts}</p>
                                </div>
                                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                                    <p className="text-slate-400 text-sm">{t('معتمدة', 'Approved')}</p>
                                    <p className="text-2xl font-bold text-green-400">{discountRequests.filter(d => d.status === 'approved').length}</p>
                                </div>
                                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                                    <p className="text-slate-400 text-sm">{t('مرفوضة', 'Rejected')}</p>
                                    <p className="text-2xl font-bold text-red-400">{discountRequests.filter(d => d.status === 'rejected').length}</p>
                                </div>
                            </div>

                            {/* Requests List */}
                            <div className="space-y-4">
                                {discountRequests.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 bg-slate-800/50 rounded-xl">
                                        <Percent className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>{t('لا توجد طلبات تخفيض', 'No discount requests')}</p>
                                    </div>
                                ) : (
                                    discountRequests.map(request => (
                                        <div key={request.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="text-white font-medium">{request.targetName}</p>
                                                    <p className="text-slate-400 text-sm">
                                                        {DISCOUNT_TARGET_TYPE_TRANSLATIONS[request.targetType][language]}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm ${request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    request.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {DISCOUNT_REQUEST_STATUS_TRANSLATIONS[request.status][language]}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                                <div>
                                                    <p className="text-slate-400">{t('نوع الخصم', 'Discount Type')}</p>
                                                    <p className="text-white">{DISCOUNT_TYPE_TRANSLATIONS[request.discountType][language]}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">{t('القيمة', 'Value')}</p>
                                                    <p className="text-green-400 font-bold">
                                                        {request.discountType === 'percentage' ? `${request.discountValue}%` : `${request.discountValue} ${t('ر.س', 'SAR')}`}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">{t('من', 'From')}</p>
                                                    <p className="text-white">{new Date(request.startDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">{t('إلى', 'To')}</p>
                                                    <p className="text-white">{new Date(request.endDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                                                </div>
                                            </div>

                                            <p className="text-slate-300 text-sm bg-slate-700/30 rounded-lg p-2">
                                                <span className="text-slate-400">{t('السبب:', 'Reason:')}</span> {request.reason}
                                            </p>

                                            {request.rejectionReason && (
                                                <p className="text-red-400 text-sm mt-2 bg-red-500/10 rounded-lg p-2">
                                                    <span className="font-medium">{t('سبب الرفض:', 'Rejection reason:')}</span> {request.rejectionReason}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* External Pricing Tab */}
                    {activeTab === 'external_pricing' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">{t('تسعير الموردين الخارجيين', 'External Supplier Pricing')}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowExternalSupplierModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t('مورد جديد', 'New Supplier')}
                                    </button>
                                    <button
                                        onClick={() => setShowExternalPriceModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t('سعر جديد', 'New Price')}
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                                    <p className="text-slate-400 text-sm">{t('الموردين الخارجيين', 'External Suppliers')}</p>
                                    <p className="text-2xl font-bold text-white">{externalSuppliers.length}</p>
                                </div>
                                <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/30">
                                    <p className="text-slate-400 text-sm">{t('إجمالي الأسعار', 'Total Prices')}</p>
                                    <p className="text-2xl font-bold text-cyan-400">{externalPrices.length}</p>
                                </div>
                                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                                    <p className="text-slate-400 text-sm">{t('ربط API', 'API Connected')}</p>
                                    <p className="text-2xl font-bold text-green-400">
                                        {externalSuppliers.filter(s => s.linkType === 'api').length}
                                    </p>
                                </div>
                                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                                    <p className="text-slate-400 text-sm">{t('ربط يدوي', 'Manual Entry')}</p>
                                    <p className="text-2xl font-bold text-purple-400">
                                        {externalSuppliers.filter(s => s.linkType === 'manual').length}
                                    </p>
                                </div>
                            </div>

                            {/* Suppliers List */}
                            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                                <div className="px-4 py-3 bg-slate-700/50 border-b border-slate-600/50">
                                    <h4 className="text-white font-medium">{t('الموردين الخارجيين', 'External Suppliers')}</h4>
                                </div>
                                {externalSuppliers.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>{t('لا يوجد موردين خارجيين', 'No external suppliers')}</p>
                                        <p className="text-sm mt-2">{t('أضف مورداً خارجياً لبدء مقارنة الأسعار', 'Add an external supplier to start comparing prices')}</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-slate-700/30">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-sm text-slate-300">{t('المورد', 'Supplier')}</th>
                                                <th className="px-4 py-3 text-right text-sm text-slate-300">{t('نوع الربط', 'Link Type')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('المنتجات', 'Products')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('آخر تحديث', 'Last Update')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الإجراءات', 'Actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {externalSuppliers.map(supplier => {
                                                const supplierPrices = externalPrices.filter(p => p.externalSupplierId === supplier.id);
                                                return (
                                                    <tr key={supplier.id} className="hover:bg-slate-700/30">
                                                        <td className="px-4 py-3">
                                                            <p className="text-white font-medium">{supplier.name[language]}</p>
                                                            <p className="text-slate-400 text-sm">{supplier.companyName}</p>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded text-xs ${supplier.linkType === 'api' ? 'bg-green-500/20 text-green-400' :
                                                                supplier.linkType === 'manual' ? 'bg-blue-500/20 text-blue-400' :
                                                                    'bg-purple-500/20 text-purple-400'
                                                                }`}>
                                                                {EXTERNAL_LINK_TYPES[supplier.linkType]?.icon} {EXTERNAL_LINK_TYPES[supplier.linkType]?.[language]}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-white">{supplierPrices.length}</td>
                                                        <td className="px-4 py-3 text-center text-slate-400 text-sm">
                                                            {new Date(supplier.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex justify-center gap-2">
                                                                {supplier.linkType === 'api' && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            const result = await externalSupplierService.fetchPricesFromAPI(supplier.id);
                                                                            if (result.success) {
                                                                                loadData();
                                                                                alert(t(`تم جلب ${result.count} سعر`, `Fetched ${result.count} prices`));
                                                                            } else {
                                                                                alert(result.error);
                                                                            }
                                                                        }}
                                                                        className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                                                                        title={t('تحديث الأسعار', 'Refresh Prices')}
                                                                    >
                                                                        <RefreshCw className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => setSelectedExternalSupplier(supplier)}
                                                                    className="p-2 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30"
                                                                    title={t('عرض', 'View')}
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Prices List */}
                            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                                <div className="px-4 py-3 bg-slate-700/50 border-b border-slate-600/50">
                                    <h4 className="text-white font-medium">{t('جدول الأسعار', 'Prices Table')}</h4>
                                </div>
                                {externalPrices.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>{t('لا توجد أسعار مسجلة', 'No prices registered')}</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-slate-700/30">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-sm text-slate-300">{t('المنتج', 'Product')}</th>
                                                <th className="px-4 py-3 text-right text-sm text-slate-300">{t('المورد', 'Supplier')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('السعر', 'Price')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('السعر الداخلي', 'Internal Price')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الفرق', 'Difference')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('المصدر', 'Source')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {externalPrices.slice(0, 20).map(price => {
                                                const supplier = externalSuppliers.find(s => s.id === price.externalSupplierId);
                                                const diff = price.priceDifference || 0;
                                                return (
                                                    <tr key={price.id} className="hover:bg-slate-700/30">
                                                        <td className="px-4 py-3">
                                                            <p className="text-white">{price.productName[language]}</p>
                                                            <p className="text-slate-400 text-xs">{price.productCode} • {price.unit}</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-300">{supplier?.name[language] || '-'}</td>
                                                        <td className="px-4 py-3 text-center text-white font-medium">
                                                            {price.price.toLocaleString()} {price.currency}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-slate-400">
                                                            {price.internalPrice ? `${price.internalPrice.toLocaleString()} SAR` : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {price.internalPrice ? (
                                                                <span className={`px-2 py-1 rounded text-xs ${diff < -1 ? 'bg-green-500/20 text-green-400' :
                                                                    diff > 1 ? 'bg-red-500/20 text-red-400' :
                                                                        'bg-slate-500/20 text-slate-400'
                                                                    }`}>
                                                                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="text-slate-400 text-xs">
                                                                {PRICE_SOURCES[price.source]?.[language] || price.source}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items Management Tab */}
                    {activeTab === 'items_management' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">{t('إدارة البنود حسب نوع المشروع', 'Items Management by Project Type')}</h3>
                                <button
                                    onClick={() => setShowItemModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                                >
                                    <Plus className="w-4 h-4" />
                                    {t('بند جديد', 'New Item')}
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder={t('بحث عن بند...', 'Search items...')}
                                        value={itemsSearchQuery}
                                        onChange={(e) => setItemsSearchQuery(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pr-10 pl-4 py-2 text-white placeholder:text-slate-500"
                                    />
                                </div>

                                {/* Project Type Filter */}
                                <select
                                    value={selectedProjectType}
                                    onChange={(e) => setSelectedProjectType(e.target.value as any)}
                                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white"
                                >
                                    {PROJECT_TYPES.map(type => (
                                        <option key={type.id} value={type.id}>{type[language]}</option>
                                    ))}
                                </select>

                                {/* Category Filter */}
                                <select
                                    value={selectedItemCategory}
                                    onChange={(e) => setSelectedItemCategory(e.target.value)}
                                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white"
                                >
                                    {ITEM_CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat[language]}</option>
                                    ))}
                                </select>

                                {/* Count */}
                                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-center">
                                    <span className="text-slate-400">{t('إجمالي البنود:', 'Total Items:')}</span>
                                    <span className="text-cyan-400 font-bold mr-2">{ITEMS_DATABASE.length}</span>
                                </div>
                            </div>

                            {/* Project Type Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {PROJECT_TYPES.filter(pt => pt.id !== 'all').slice(0, 5).map(projectType => {
                                    const itemsCount = ITEMS_DATABASE.filter(item =>
                                        item.type === 'all' || item.type === projectType.id
                                    ).length;
                                    return (
                                        <button
                                            key={projectType.id}
                                            onClick={() => setSelectedProjectType(projectType.id as any)}
                                            className={`p-4 rounded-xl border transition ${selectedProjectType === projectType.id
                                                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                                    : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <p className="font-medium">{projectType[language]}</p>
                                            <p className="text-2xl font-bold mt-1">{itemsCount}</p>
                                            <p className="text-xs text-slate-400">{t('بند', 'items')}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Items Table */}
                            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                                <div className="px-4 py-3 bg-slate-700/50 border-b border-slate-600/50">
                                    <h4 className="text-white font-medium">
                                        {t('جدول البنود', 'Items Table')} -
                                        <span className="text-cyan-400 mr-2">
                                            {PROJECT_TYPES.find(pt => pt.id === selectedProjectType)?.[language] || t('جميع الأنواع', 'All Types')}
                                        </span>
                                    </h4>
                                </div>
                                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-700/30 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-sm text-slate-300">{t('الكود', 'Code')}</th>
                                                <th className="px-4 py-3 text-right text-sm text-slate-300">{t('البند', 'Item')}</th>
                                                <th className="px-4 py-3 text-right text-sm text-slate-300">{t('التصنيف', 'Category')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الوحدة', 'Unit')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('تكلفة المواد', 'Material')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('تكلفة العمالة', 'Labor')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الهدر %', 'Waste %')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الإجمالي', 'Total')}</th>
                                                <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الإجراءات', 'Actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {ITEMS_DATABASE
                                                .filter(item => {
                                                    // Filter by project type
                                                    if (selectedProjectType !== 'all' && item.type !== 'all' && item.type !== selectedProjectType) {
                                                        return false;
                                                    }
                                                    // Filter by category
                                                    if (selectedItemCategory !== 'all' && item.category !== selectedItemCategory) {
                                                        return false;
                                                    }
                                                    // Filter by search
                                                    if (itemsSearchQuery) {
                                                        const searchLower = itemsSearchQuery.toLowerCase();
                                                        return (
                                                            item.name.ar.includes(itemsSearchQuery) ||
                                                            item.name.en.toLowerCase().includes(searchLower) ||
                                                            item.id.toLowerCase().includes(searchLower)
                                                        );
                                                    }
                                                    return true;
                                                })
                                                .slice(0, 50)
                                                .map(item => {
                                                    const total = (item.baseMaterial + item.baseLabor) * (1 + item.waste);
                                                    const categoryInfo = ITEM_CATEGORIES.find(c => c.id === item.category);
                                                    return (
                                                        <tr key={item.id} className="hover:bg-slate-700/30">
                                                            <td className="px-4 py-3 text-cyan-400 font-mono text-sm">{item.id}</td>
                                                            <td className="px-4 py-3">
                                                                <p className="text-white">{item.name[language]}</p>
                                                                <p className="text-slate-400 text-xs">{item.sbc}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-300 text-sm">
                                                                {categoryInfo?.[language] || item.category}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-slate-300">{item.unit}</td>
                                                            <td className="px-4 py-3 text-center text-green-400">
                                                                {item.baseMaterial.toLocaleString()} <span className="text-xs text-slate-400">ر.س</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-blue-400">
                                                                {item.baseLabor.toLocaleString()} <span className="text-xs text-slate-400">ر.س</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-orange-400">
                                                                {(item.waste * 100).toFixed(0)}%
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-white font-medium">
                                                                {total.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs text-slate-400">ر.س</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="flex justify-center gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingItem(item);
                                                                            setShowItemModal(true);
                                                                        }}
                                                                        className="p-2 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30"
                                                                        title={t('تعديل', 'Edit')}
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingItem(item)}
                                                                        className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                                                                        title={t('عرض التفاصيل', 'View Details')}
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                                {ITEMS_DATABASE.length > 50 && (
                                    <div className="px-4 py-3 bg-slate-700/30 text-center text-slate-400 text-sm">
                                        {t('يُعرض أول 50 بند. استخدم البحث أو الفلاتر لعرض المزيد.', 'Showing first 50 items. Use search or filters to view more.')}
                                    </div>
                                )}
                            </div>

                            {/* Selected Item Details */}
                            {editingItem && !showItemModal && (
                                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-white">{editingItem.name[language]}</h4>
                                        <button
                                            onClick={() => setEditingItem(null)}
                                            className="p-2 text-slate-400 hover:text-white"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-slate-700/30 rounded-lg p-3">
                                            <p className="text-slate-400 text-sm">{t('الكود', 'Code')}</p>
                                            <p className="text-white font-mono">{editingItem.id}</p>
                                        </div>
                                        <div className="bg-slate-700/30 rounded-lg p-3">
                                            <p className="text-slate-400 text-sm">{t('كود SBC', 'SBC Code')}</p>
                                            <p className="text-white">{editingItem.sbc}</p>
                                        </div>
                                        <div className="bg-slate-700/30 rounded-lg p-3">
                                            <p className="text-slate-400 text-sm">{t('نوع المشروع', 'Project Type')}</p>
                                            <p className="text-white">{editingItem.type === 'all' ? t('الكل', 'All') : editingItem.type}</p>
                                        </div>
                                        <div className="bg-slate-700/30 rounded-lg p-3">
                                            <p className="text-slate-400 text-sm">{t('الكمية الافتراضية', 'Default Qty')}</p>
                                            <p className="text-white">{editingItem.qty} {editingItem.unit}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                                            <p className="text-slate-400 text-sm">{t('تكلفة المواد', 'Material Cost')}</p>
                                            <p className="text-green-400 text-xl font-bold">{editingItem.baseMaterial.toLocaleString()} ر.س</p>
                                        </div>
                                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                                            <p className="text-slate-400 text-sm">{t('تكلفة العمالة', 'Labor Cost')}</p>
                                            <p className="text-blue-400 text-xl font-bold">{editingItem.baseLabor.toLocaleString()} ر.س</p>
                                        </div>
                                        <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
                                            <p className="text-slate-400 text-sm">{t('نسبة الهدر', 'Waste Ratio')}</p>
                                            <p className="text-orange-400 text-xl font-bold">{(editingItem.waste * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {
                showReviewModal && selectedReview && (
                    <ReviewModal
                        review={selectedReview}
                        language={language}
                        onClose={() => {
                            setShowReviewModal(false);
                            setSelectedReview(null);
                        }}
                        onApprove={() => handleApproveReview(selectedReview.id)}
                        onRequestRevision={(notes) => handleRequestRevision(selectedReview.id, notes)}
                        onReject={(reason) => handleRejectReview(selectedReview.id, reason)}
                    />
                )
            }

            {/* Discount Request Modal */}
            {
                showDiscountModal && (
                    <DiscountModal
                        form={discountForm}
                        language={language}
                        companies={companies}
                        individuals={individuals}
                        onFormChange={setDiscountForm}
                        onClose={() => {
                            setShowDiscountModal(false);
                            setDiscountForm({
                                targetType: 'company',
                                targetId: '',
                                targetName: '',
                                discountType: 'percentage',
                                discountValue: 0,
                                startDate: new Date().toISOString().split('T')[0],
                                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                reason: '',
                                notes: ''
                            });
                        }}
                        onSubmit={handleCreateDiscountRequest}
                    />
                )
            }

            {/* Correction Request Modal */}
            {
                showCorrectionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">{t('طلب تصحيح بيانات', 'Data Correction Request')}</h3>
                                <button onClick={() => setShowCorrectionModal(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Supplier Selection */}
                                <div>
                                    <label className="block text-slate-300 mb-2">{t('المورد *', 'Supplier *')}</label>
                                    <select
                                        value={correctionForm.supplierId}
                                        onChange={(e) => {
                                            const supplier = suppliers.find(s => s.id === e.target.value);
                                            setCorrectionForm(prev => ({
                                                ...prev,
                                                supplierId: e.target.value,
                                                supplierName: supplier?.companyName || ''
                                            }));
                                        }}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white"
                                    >
                                        <option value="">{t('اختر المورد', 'Select Supplier')}</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.companyName}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Data Type */}
                                <div>
                                    <label className="block text-slate-300 mb-2">{t('نوع البيانات *', 'Data Type *')}</label>
                                    <select
                                        value={correctionForm.dataType}
                                        onChange={(e) => setCorrectionForm(prev => ({ ...prev, dataType: e.target.value as any }))}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white"
                                    >
                                        <option value="product">{t('منتج', 'Product')}</option>
                                        <option value="service">{t('خدمة', 'Service')}</option>
                                        <option value="pricing">{t('تسعير', 'Pricing')}</option>
                                        <option value="company_info">{t('بيانات الشركة', 'Company Info')}</option>
                                        <option value="other">{t('أخرى', 'Other')}</option>
                                    </select>
                                </div>

                                {/* Data Name */}
                                <div>
                                    <label className="block text-slate-300 mb-2">{t('اسم المنتج/الخدمة', 'Product/Service Name')}</label>
                                    <input
                                        type="text"
                                        value={correctionForm.dataName}
                                        onChange={(e) => setCorrectionForm(prev => ({ ...prev, dataName: e.target.value }))}
                                        placeholder={t('اسم العنصر المراد تصحيحه', 'Name of item to correct')}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white"
                                    />
                                </div>

                                {/* Current Value */}
                                <div>
                                    <label className="block text-slate-300 mb-2">{t('القيمة الحالية', 'Current Value')}</label>
                                    <input
                                        type="text"
                                        value={correctionForm.currentValue}
                                        onChange={(e) => setCorrectionForm(prev => ({ ...prev, currentValue: e.target.value }))}
                                        placeholder={t('القيمة الخاطئة الحالية', 'Current incorrect value')}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white"
                                    />
                                </div>

                                {/* Issue Description */}
                                <div>
                                    <label className="block text-slate-300 mb-2">{t('وصف المشكلة *', 'Issue Description *')}</label>
                                    <textarea
                                        value={correctionForm.issueDescription}
                                        onChange={(e) => setCorrectionForm(prev => ({ ...prev, issueDescription: e.target.value }))}
                                        placeholder={t('اشرح المشكلة بالتفصيل...', 'Describe the issue in detail...')}
                                        rows={3}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white resize-none"
                                    />
                                </div>

                                {/* Suggested Correction */}
                                <div>
                                    <label className="block text-slate-300 mb-2">{t('التصحيح المقترح', 'Suggested Correction')}</label>
                                    <textarea
                                        value={correctionForm.suggestedCorrection}
                                        onChange={(e) => setCorrectionForm(prev => ({ ...prev, suggestedCorrection: e.target.value }))}
                                        placeholder={t('اقتراحك للتصحيح...', 'Your suggestion for correction...')}
                                        rows={2}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white resize-none"
                                    />
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="block text-slate-300 mb-2">{t('الأولوية', 'Priority')}</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setCorrectionForm(prev => ({ ...prev, priority: p }))}
                                                className={`py-2 rounded-lg text-sm transition ${correctionForm.priority === p
                                                    ? PRIORITY_COLORS[p].replace('/20', '')
                                                    : 'bg-slate-700/50 text-slate-400'}`}
                                            >
                                                {CORRECTION_PRIORITY_TRANSLATIONS[p][language]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCorrectionModal(false)}
                                    className="flex-1 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                                >
                                    {t('إلغاء', 'Cancel')}
                                </button>
                                <button
                                    onClick={handleCreateCorrectionRequest}
                                    className="flex-1 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    {t('إرسال الطلب', 'Send Request')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* QS Note Modal */}
            {
                showQsNoteModal && selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-cyan-400" />
                                    {t('شرح مهندس الكميات', 'QS Technical Description')}
                                </h3>
                                <button onClick={() => setShowQsNoteModal(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-slate-400 mb-1">{t('المنتج', 'Product')}</p>
                                <p className="text-white font-medium">{language === 'ar' ? selectedProduct.name.ar : selectedProduct.name.en}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-slate-300 text-sm mb-2">{t('الشرح / الملاحظات الفنية', 'Description / Technical Notes')}</label>
                                <textarea
                                    value={qsNoteText}
                                    onChange={(e) => setQsNoteText(e.target.value)}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white h-32 resize-none focus:outline-none focus:border-cyan-500"
                                    placeholder={t('أضف شرحاً مفصلاً للمنتج...', 'Add detailed product description...')}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowQsNoteModal(false)}
                                    className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                                >
                                    {t('إلغاء', 'Cancel')}
                                </button>
                                <button
                                    onClick={handleSaveQsNote}
                                    className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    {t('حفظ الشرح', 'Save Description')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

// ====================== Review Modal ======================
interface ReviewModalProps {
    review: SupplierDataReview;
    language: 'ar' | 'en';
    onClose: () => void;
    onApprove: () => void;
    onRequestRevision: (notes: string) => void;
    onReject: (reason: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ review, language, onClose, onApprove, onRequestRevision, onReject }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;
    const [action, setAction] = useState<'approve' | 'revision' | 'reject' | null>(null);
    const [notes, setNotes] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">{t('مراجعة البيانات', 'Review Data')}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-slate-700/30 rounded-lg p-4">
                        <p className="text-slate-400 text-sm mb-1">{t('المورد', 'Supplier')}</p>
                        <p className="text-white font-medium">{review.supplierName}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                        <p className="text-slate-400 text-sm mb-1">{t('نوع البيانات', 'Data Type')}</p>
                        <p className="text-white">{REVIEW_DATA_TYPE_TRANSLATIONS[review.dataType][language]}</p>
                    </div>
                    {review.dataName && (
                        <div className="bg-slate-700/30 rounded-lg p-4">
                            <p className="text-slate-400 text-sm mb-1">{t('اسم البند', 'Item Name')}</p>
                            <p className="text-white">{review.dataName}</p>
                        </div>
                    )}
                    {review.dataAfter && (
                        <div className="bg-slate-700/30 rounded-lg p-4">
                            <p className="text-slate-400 text-sm mb-2">{t('البيانات المُقدمة', 'Submitted Data')}</p>
                            <pre className="text-cyan-400 text-sm bg-slate-800 p-2 rounded overflow-auto max-h-32">
                                {JSON.stringify(review.dataAfter, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {!action && (
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => onApprove()}
                            className="py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            {t('موافقة', 'Approve')}
                        </button>
                        <button
                            onClick={() => setAction('revision')}
                            className="py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            {t('تعديل', 'Revision')}
                        </button>
                        <button
                            onClick={() => setAction('reject')}
                            className="py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            {t('رفض', 'Reject')}
                        </button>
                    </div>
                )}

                {action && (
                    <div className="space-y-4">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={action === 'revision' ? t('ملاحظات التعديل المطلوب...', 'Required revision notes...') : t('سبب الرفض...', 'Rejection reason...')}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-4 text-white h-24 resize-none"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAction(null)}
                                className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                            >
                                {t('رجوع', 'Back')}
                            </button>
                            <button
                                onClick={() => action === 'revision' ? onRequestRevision(notes) : onReject(notes)}
                                className={`flex-1 py-2 text-white rounded-lg ${action === 'revision' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'}`}
                            >
                                {action === 'revision' ? t('إرسال طلب التعديل', 'Send Revision Request') : t('تأكيد الرفض', 'Confirm Rejection')}
                            </button>
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
};

// ====================== Discount Modal ======================
interface DiscountModalProps {
    form: {
        targetType: 'company' | 'individual';
        targetId: string;
        targetName: string;
        discountType: 'percentage' | 'fixed';
        discountValue: number;
        startDate: string;
        endDate: string;
        reason: string;
        notes?: string;
    };
    language: 'ar' | 'en';
    companies: RegistrationRequest[];
    individuals: RegistrationRequest[];
    onFormChange: (form: any) => void;
    onClose: () => void;
    onSubmit: () => void;
}

const DiscountModal: React.FC<DiscountModalProps> = ({ form, language, companies, individuals, onFormChange, onClose, onSubmit }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;
    const targets = form.targetType === 'company' ? companies : individuals;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Percent className="w-6 h-6 text-green-400" />
                        {t('طلب تخفيض جديد', 'New Discount Request')}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Target Type */}
                    <div>
                        <label className="block text-slate-300 text-sm mb-2">{t('نوع العميل', 'Customer Type')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['company', 'individual'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => onFormChange({ ...form, targetType: type, targetId: '', targetName: '' })}
                                    className={`py-2 rounded-lg transition ${form.targetType === type
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {DISCOUNT_TARGET_TYPE_TRANSLATIONS[type][language]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Selection */}
                    <div>
                        <label className="block text-slate-300 text-sm mb-2">{t('اختر العميل', 'Select Customer')} *</label>
                        <select
                            value={form.targetId}
                            onChange={(e) => {
                                const target = targets.find(t => t.id === e.target.value);
                                onFormChange({
                                    ...form,
                                    targetId: e.target.value,
                                    targetName: target?.companyName || target?.name || ''
                                });
                            }}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-4 text-white"
                        >
                            <option value="">{t('-- اختر --', '-- Select --')}</option>
                            {targets.map(target => (
                                <option key={target.id} value={target.id}>
                                    {target.companyName || target.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Discount Type */}
                    <div>
                        <label className="block text-slate-300 text-sm mb-2">{t('نوع الخصم', 'Discount Type')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['percentage', 'fixed'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => onFormChange({ ...form, discountType: type })}
                                    className={`py-2 rounded-lg transition ${form.discountType === type
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {DISCOUNT_TYPE_TRANSLATIONS[type][language]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Discount Value */}
                    <div>
                        <label className="block text-slate-300 text-sm mb-2">
                            {t('قيمة الخصم', 'Discount Value')} {form.discountType === 'percentage' ? '(%)' : t('(ر.س)', '(SAR)')} *
                        </label>
                        <input
                            type="number"
                            value={form.discountValue || ''}
                            onChange={(e) => onFormChange({ ...form, discountValue: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-4 text-white"
                            min="0"
                            max={form.discountType === 'percentage' ? 100 : undefined}
                        />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-300 text-sm mb-2">{t('من تاريخ', 'Start Date')}</label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => onFormChange({ ...form, startDate: e.target.value })}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-4 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-300 text-sm mb-2">{t('إلى تاريخ', 'End Date')}</label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => onFormChange({ ...form, endDate: e.target.value })}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-4 text-white"
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-slate-300 text-sm mb-2">{t('سبب الطلب', 'Request Reason')} *</label>
                        <textarea
                            value={form.reason}
                            onChange={(e) => onFormChange({ ...form, reason: e.target.value })}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-4 text-white h-24 resize-none"
                            placeholder={t('اشرح سبب طلب التخفيض...', 'Explain the reason for the discount request...')}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                        >
                            {t('إلغاء', 'Cancel')}
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={!form.targetId || !form.reason.trim() || form.discountValue <= 0}
                            className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            {t('إرسال الطلب', 'Submit Request')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuantitySurveyorPage;
