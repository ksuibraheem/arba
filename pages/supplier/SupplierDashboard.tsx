import React, { useState, useEffect } from 'react';
import {
    Truck,
    Package,
    DollarSign,
    BarChart3,
    Bell,
    Settings,
    Plus,
    Edit3,
    Trash2,
    Eye,
    Search,
    Filter,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    Users,
    ShoppingCart,
    Percent,
    Tag,
    Calendar,
    Target,
    Megaphone,
    Gift,
    BarChart2,
    PieChart,
    Wrench,
    Building2
} from 'lucide-react';
import { COMPANY_INFO } from '../../companyData';
import {
    PRODUCT_CATEGORIES,
    PRODUCT_TYPE_TRANSLATIONS,
    RENTAL_PERIOD_TRANSLATIONS,
    ProductType,
    RentalPeriod,
    UnitType,
    ApprovalStatus
} from '../../services/supplierService';
import SupplierServicesCatalogComponent from '../../components/SupplierServicesCatalog';
import SupplierEmployeeManager from '../../components/SupplierEmployeeManager';
import {
    SupplierServicesCatalog as ServicesCatalogType,
    SupplierEmployee,
    createDefaultServicesCatalog
} from '../../services/supplierManagementService';
import {
    getSupplierEmployees,
    saveSupplierEmployees,
    getSupplierServices,
    saveSupplierServices,
    initializeSupplierData
} from '../../services/supplierStorageService';

interface SupplierDashboardProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
    onLogout: () => void;
    isTestMode?: boolean;
    supplierId?: string; // معرف المورد للتخزين
}

interface Product {
    id: string;
    name: { ar: string; en: string };
    category: string;
    productType: ProductType;           // بيع أو تأجير
    price: number;
    unitType: UnitType;                 // نوع الوحدة
    unit: string;
    stock: number;
    status: 'active' | 'inactive';
    approvalStatus: ApprovalStatus;     // حالة الموافقة
    // Analytics fields
    views: number;
    pricings: number;
    addedToQuotes: number;
    conversionRate: number;
    // حقول التأجير
    rentalPeriod?: RentalPeriod;
    minRentalDuration?: number;
    depositAmount?: number;
}

interface Promotion {
    id: string;
    productId: string;
    productName: { ar: string; en: string };
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    originalPrice: number;
    startDate: string;
    endDate: string;
    targetCustomers: 'all' | 'companies' | 'individuals';
    maxUses: number;
    currentUses: number;
    status: 'active' | 'scheduled' | 'expired';
}

interface QuoteRequest {
    id: string;
    customerName: string;
    date: string;
    items: number;
    status: 'pending' | 'responded' | 'accepted' | 'rejected';
    total: number;
}

const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ language, onNavigate, onLogout, isTestMode = false, supplierId = 'demo_supplier' }) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowRight : ArrowLeft;
    const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'products' | 'sales' | 'rentals' | 'quotes' | 'analytics' | 'promotions' | 'services' | 'employees' | 'settings'>('overview');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCreatePromotion, setShowCreatePromotion] = useState(false);
    const [selectedProductForPromo, setSelectedProductForPromo] = useState<Product | null>(null);

    // Services Catalog State
    const [servicesCatalog, setServicesCatalog] = useState<ServicesCatalogType>(createDefaultServicesCatalog());

    // Employees State
    const [employees, setEmployees] = useState<SupplierEmployee[]>([]);

    // تحميل بيانات المورد عند فتح الصفحة
    useEffect(() => {
        if (supplierId && !isTestMode) {
            // تهيئة بيانات المورد إذا لم تكن موجودة
            initializeSupplierData(supplierId);

            // تحميل الموظفين
            const loadedEmployees = getSupplierEmployees(supplierId);
            setEmployees(loadedEmployees);

            // تحميل الخدمات
            const loadedServices = getSupplierServices(supplierId);
            setServicesCatalog(loadedServices);

            console.log(`✅ تم تحميل بيانات المورد: ${supplierId}`);
        }
    }, [supplierId, isTestMode]);

    // حفظ الموظفين عند التغيير
    useEffect(() => {
        if (supplierId && !isTestMode && employees.length >= 0) {
            saveSupplierEmployees(supplierId, employees);
        }
    }, [employees, supplierId, isTestMode]);

    // حفظ الخدمات عند التغيير
    useEffect(() => {
        if (supplierId && !isTestMode) {
            saveSupplierServices(supplierId, servicesCatalog);
        }
    }, [servicesCatalog, supplierId, isTestMode]);

    // Product Categories
    const productCategories = [
        { id: 'structure', icon: '🏗️', name: { ar: 'الهيكل الإنشائي', en: 'Structure' }, count: 12, color: 'from-blue-500 to-blue-600' },
        { id: 'concrete', icon: '🧱', name: { ar: 'الخرسانة والأسمنت', en: 'Concrete & Cement' }, count: 8, color: 'from-gray-500 to-gray-600' },
        { id: 'steel', icon: '🔩', name: { ar: 'الحديد والصلب', en: 'Steel & Iron' }, count: 15, color: 'from-slate-500 to-slate-600' },
        { id: 'wood', icon: '🪵', name: { ar: 'الأخشاب', en: 'Wood & Timber' }, count: 10, color: 'from-amber-600 to-amber-700' },
        { id: 'electrical', icon: '⚡', name: { ar: 'الكهرباء', en: 'Electrical' }, count: 25, color: 'from-yellow-500 to-yellow-600' },
        { id: 'plumbing', icon: '🚿', name: { ar: 'السباكة', en: 'Plumbing' }, count: 18, color: 'from-cyan-500 to-cyan-600' },
        { id: 'hvac', icon: '❄️', name: { ar: 'التكييف والتبريد', en: 'HVAC' }, count: 14, color: 'from-sky-500 to-sky-600' },
        { id: 'tiles', icon: '🔲', name: { ar: 'البلاط والسيراميك', en: 'Tiles & Ceramics' }, count: 22, color: 'from-indigo-500 to-indigo-600' },
        { id: 'paint', icon: '🎨', name: { ar: 'الدهانات', en: 'Paints & Coatings' }, count: 16, color: 'from-purple-500 to-purple-600' },
        { id: 'insulation', icon: '🧊', name: { ar: 'العزل', en: 'Insulation' }, count: 9, color: 'from-teal-500 to-teal-600' },
        { id: 'doors', icon: '🚪', name: { ar: 'الأبواب والنوافذ', en: 'Doors & Windows' }, count: 20, color: 'from-orange-500 to-orange-600' },
        { id: 'lighting', icon: '💡', name: { ar: 'الإضاءة', en: 'Lighting' }, count: 30, color: 'from-amber-400 to-amber-500' },
        { id: 'flooring', icon: '🪨', name: { ar: 'الأرضيات', en: 'Flooring' }, count: 11, color: 'from-stone-500 to-stone-600' },
        { id: 'kitchen', icon: '🍳', name: { ar: 'المطابخ', en: 'Kitchen' }, count: 18, color: 'from-red-500 to-red-600' },
        { id: 'bathroom', icon: '🛁', name: { ar: 'الحمامات', en: 'Bathroom' }, count: 24, color: 'from-blue-400 to-blue-500' },
        { id: 'glass', icon: '🪟', name: { ar: 'الزجاج', en: 'Glass' }, count: 7, color: 'from-cyan-400 to-cyan-500' },
        { id: 'safety', icon: '🦺', name: { ar: 'السلامة', en: 'Safety Equipment' }, count: 13, color: 'from-green-500 to-green-600' },
        { id: 'tools', icon: '🔧', name: { ar: 'الأدوات', en: 'Tools & Equipment' }, count: 35, color: 'from-zinc-500 to-zinc-600' },
        { id: 'landscaping', icon: '🌳', name: { ar: 'تنسيق الحدائق', en: 'Landscaping' }, count: 8, color: 'from-emerald-500 to-emerald-600' },
        { id: 'waterproofing', icon: '💧', name: { ar: 'العزل المائي', en: 'Waterproofing' }, count: 6, color: 'from-blue-600 to-blue-700' },
    ];

    // Sample data
    const stats = {
        totalProducts: 45,
        activeProducts: 38,
        pendingQuotes: 12,
        monthlyViews: 1250,
        monthlyOrders: 28,
        revenue: 45600
    };

    const products: Product[] = [
        // منتجات البيع
        { id: '1', name: { ar: 'حديد تسليح 12مم', en: 'Rebar 12mm' }, category: 'steel', productType: 'sale', price: 3200, unitType: 'ton', unit: 'طن', stock: 150, status: 'active', approvalStatus: 'approved', views: 1250, pricings: 85, addedToQuotes: 42, conversionRate: 49.4 },
        { id: '2', name: { ar: 'اسمنت بورتلاندي', en: 'Portland Cement' }, category: 'cement', productType: 'sale', price: 18, unitType: 'bag', unit: 'كيس', stock: 5000, status: 'active', approvalStatus: 'approved', views: 980, pricings: 156, addedToQuotes: 89, conversionRate: 57.1 },
        { id: '3', name: { ar: 'بلاط سيراميك 60×60', en: 'Ceramic Tiles 60x60' }, category: 'tiles', productType: 'sale', price: 45, unitType: 'sqm', unit: 'م²', stock: 800, status: 'active', approvalStatus: 'pending', views: 654, pricings: 45, addedToQuotes: 23, conversionRate: 51.1 },
        { id: '4', name: { ar: 'دهان زيتي أبيض', en: 'White Oil Paint' }, category: 'paints', productType: 'sale', price: 85, unitType: 'liter', unit: 'جالون', stock: 0, status: 'inactive', approvalStatus: 'rejected', views: 120, pricings: 8, addedToQuotes: 2, conversionRate: 25.0 },
        // منتجات التأجير
        { id: '5', name: { ar: 'سقالات معدنية', en: 'Metal Scaffolding' }, category: 'scaffolding', productType: 'rental', price: 50, unitType: 'meter', unit: 'متر/يوم', stock: 500, status: 'active', approvalStatus: 'approved', views: 890, pricings: 65, addedToQuotes: 35, conversionRate: 53.8, rentalPeriod: 'daily', minRentalDuration: 7, depositAmount: 1000 },
        { id: '6', name: { ar: 'رافعة برجية 40 متر', en: 'Tower Crane 40m' }, category: 'cranes', productType: 'rental', price: 5000, unitType: 'piece', unit: 'وحدة/شهر', stock: 3, status: 'active', approvalStatus: 'approved', views: 450, pricings: 28, addedToQuotes: 12, conversionRate: 42.9, rentalPeriod: 'monthly', minRentalDuration: 3, depositAmount: 50000 },
        { id: '7', name: { ar: 'مولد كهربائي 100 كيلو واط', en: 'Generator 100KW' }, category: 'generators', productType: 'rental', price: 500, unitType: 'piece', unit: 'وحدة/يوم', stock: 10, status: 'active', approvalStatus: 'pending', views: 720, pricings: 92, addedToQuotes: 58, conversionRate: 63.0, rentalPeriod: 'daily', minRentalDuration: 1, depositAmount: 5000 },
        { id: '8', name: { ar: 'خلاطة خرسانة', en: 'Concrete Mixer' }, category: 'concrete_mixers', productType: 'rental', price: 300, unitType: 'piece', unit: 'وحدة/يوم', stock: 8, status: 'active', approvalStatus: 'approved', views: 560, pricings: 45, addedToQuotes: 28, conversionRate: 62.2, rentalPeriod: 'daily', minRentalDuration: 1 },
        { id: '9', name: { ar: 'رافعة شوكية 3 طن', en: 'Forklift 3 Ton' }, category: 'forklifts', productType: 'rental', price: 400, unitType: 'piece', unit: 'وحدة/يوم', stock: 5, status: 'active', approvalStatus: 'revision_required', views: 380, pricings: 35, addedToQuotes: 20, conversionRate: 57.1, rentalPeriod: 'daily', minRentalDuration: 1, depositAmount: 8000 },
    ];

    const promotions: Promotion[] = [
        { id: 'P001', productId: '1', productName: { ar: 'حديد تسليح 12مم', en: 'Rebar 12mm' }, discountType: 'percentage', discountValue: 10, originalPrice: 3200, startDate: '2026-01-01', endDate: '2026-01-31', targetCustomers: 'companies', maxUses: 50, currentUses: 23, status: 'active' },
        { id: 'P002', productId: '2', productName: { ar: 'اسمنت بورتلاندي', en: 'Portland Cement' }, discountType: 'fixed', discountValue: 2, originalPrice: 18, startDate: '2026-01-05', endDate: '2026-01-20', targetCustomers: 'all', maxUses: 100, currentUses: 67, status: 'active' },
        { id: 'P003', productId: '3', productName: { ar: 'بلاط سيراميك 60×60', en: 'Ceramic Tiles 60x60' }, discountType: 'percentage', discountValue: 15, originalPrice: 45, startDate: '2025-12-01', endDate: '2025-12-31', targetCustomers: 'individuals', maxUses: 30, currentUses: 30, status: 'expired' },
    ];

    const quoteRequests: QuoteRequest[] = [
        { id: 'Q001', customerName: 'شركة البناء الحديث', date: '2024-12-15', items: 5, status: 'pending', total: 25000 },
        { id: 'Q002', customerName: 'مؤسسة التعمير', date: '2024-12-14', items: 3, status: 'responded', total: 18500 },
        { id: 'Q003', customerName: 'مقاولات الرياض', date: '2024-12-13', items: 8, status: 'accepted', total: 42000 },
        { id: 'Q004', customerName: 'شركة الإنشاءات المتحدة', date: '2024-12-12', items: 2, status: 'rejected', total: 8000 },
    ];

    const t = {
        dashboard: { ar: 'لوحة تحكم المورد', en: 'Supplier Dashboard' },
        overview: { ar: 'نظرة عامة', en: 'Overview' },
        categories: { ar: 'أنواع المنتجات', en: 'Product Categories' },
        products: { ar: 'المنتجات', en: 'Products' },
        quotes: { ar: 'طلبات التسعير', en: 'Quote Requests' },
        settings: { ar: 'الإعدادات', en: 'Settings' },
        totalProducts: { ar: 'إجمالي المنتجات', en: 'Total Products' },
        activeProducts: { ar: 'المنتجات النشطة', en: 'Active Products' },
        pendingQuotes: { ar: 'طلبات معلقة', en: 'Pending Quotes' },
        monthlyViews: { ar: 'المشاهدات الشهرية', en: 'Monthly Views' },
        monthlyOrders: { ar: 'الطلبات الشهرية', en: 'Monthly Orders' },
        revenue: { ar: 'الإيرادات', en: 'Revenue' },
        addProduct: { ar: 'إضافة منتج', en: 'Add Product' },
        productName: { ar: 'اسم المنتج', en: 'Product Name' },
        category: { ar: 'التصنيف', en: 'Category' },
        price: { ar: 'السعر', en: 'Price' },
        unit: { ar: 'الوحدة', en: 'Unit' },
        stock: { ar: 'المخزون', en: 'Stock' },
        status: { ar: 'الحالة', en: 'Status' },
        actions: { ar: 'إجراءات', en: 'Actions' },
        active: { ar: 'نشط', en: 'Active' },
        inactive: { ar: 'غير نشط', en: 'Inactive' },
        pending: { ar: 'معلق', en: 'Pending' },
        responded: { ar: 'تم الرد', en: 'Responded' },
        accepted: { ar: 'مقبول', en: 'Accepted' },
        rejected: { ar: 'مرفوض', en: 'Rejected' },
        customer: { ar: 'العميل', en: 'Customer' },
        date: { ar: 'التاريخ', en: 'Date' },
        items: { ar: 'البنود', en: 'Items' },
        total: { ar: 'الإجمالي', en: 'Total' },
        sar: { ar: 'ريال', en: 'SAR' },
        logout: { ar: 'تسجيل الخروج', en: 'Logout' },
        backHome: { ar: 'العودة للرئيسية', en: 'Back to Home' },
        freeAccount: { ar: 'حساب مجاني', en: 'Free Account' },
        noFees: { ar: 'بدون رسوم اشتراك', en: 'No subscription fees' },
        analytics: { ar: 'التحليلات', en: 'Analytics' },
        promotions: { ar: 'العروض والتسويق', en: 'Promotions' },
        views: { ar: 'المشاهدات', en: 'Views' },
        pricings: { ar: 'التسعيرات', en: 'Pricings' },
        conversionRate: { ar: 'نسبة التحويل', en: 'Conversion Rate' },
        createPromotion: { ar: 'إنشاء عرض', en: 'Create Promotion' },
        discountType: { ar: 'نوع الخصم', en: 'Discount Type' },
        percentage: { ar: 'نسبة مئوية', en: 'Percentage' },
        fixed: { ar: 'مبلغ ثابت', en: 'Fixed Amount' },
        targetCustomers: { ar: 'الفئة المستهدفة', en: 'Target Customers' },
        all: { ar: 'الجميع', en: 'All' },
        companies: { ar: 'الشركات', en: 'Companies' },
        individuals: { ar: 'الأفراد', en: 'Individuals' },
        startDate: { ar: 'تاريخ البداية', en: 'Start Date' },
        endDate: { ar: 'تاريخ النهاية', en: 'End Date' },
        maxUses: { ar: 'الحد الأقصى للاستخدام', en: 'Max Uses' },
        scheduled: { ar: 'مجدول', en: 'Scheduled' },
        expired: { ar: 'منتهي', en: 'Expired' },
        topProducts: { ar: 'أفضل المنتجات أداءً', en: 'Top Performing Products' },
        productPerformance: { ar: 'أداء المنتجات', en: 'Product Performance' },
        sales: { ar: 'المبيعات', en: 'Sales' },
        rentals: { ar: 'التأجير', en: 'Rentals' },
        productType: { ar: 'النوع', en: 'Type' },
        sale: { ar: 'بيع', en: 'Sale' },
        rental: { ar: 'تأجير', en: 'Rental' },
        rentalPeriod: { ar: 'فترة التأجير', en: 'Rental Period' },
        deposit: { ar: 'التأمين', en: 'Deposit' },
        minDuration: { ar: 'أقل مدة', en: 'Min Duration' },
        availableForRent: { ar: 'متاح للتأجير', en: 'Available' },
        services: { ar: 'الخدمات', en: 'Services' },
        employees: { ar: 'الموظفين', en: 'Employees' }
    };

    const getLabel = (key: keyof typeof t) => t[key][language];

    const getStatusIcon = (status: QuoteRequest['status']) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-amber-400" />;
            case 'responded': return <CheckCircle className="w-4 h-4 text-blue-400" />;
            case 'accepted': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
        }
    };

    const getStatusColor = (status: QuoteRequest['status']) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'responded': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'accepted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Fixed Test Mode Banner - doesn't affect page layout */}
            {isTestMode && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-none">
                    <div className="pointer-events-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-3 animate-pulse">
                        <span className="text-lg">🧪</span>
                        <span className="font-bold text-sm">
                            {language === 'ar' ? 'وضع الاختبار - شبكة الموردين' : 'Test Mode - Supplier Network'}
                        </span>
                        <button
                            onClick={() => onNavigate('manager')}
                            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                        >
                            {language === 'ar' ? 'إنهاء' : 'End'}
                        </button>
                    </div>
                </div>
            )}
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onNavigate(isTestMode ? 'manager' : 'landing')}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <Arrow className="w-5 h-5" />
                                <span className="hidden sm:inline">{isTestMode ? (language === 'ar' ? 'إنهاء الاختبار' : 'End Test') : getLabel('backHome')}</span>
                            </button>
                            <div className="h-6 w-px bg-slate-600"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">{getLabel('dashboard')}</h1>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                                            {getLabel('freeAccount')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 end-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors text-sm"
                            >
                                {getLabel('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {(['overview', 'categories', 'sales', 'rentals', 'products', 'quotes', 'services', 'employees', 'analytics', 'promotions', 'settings'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {tab === 'sales' && <ShoppingCart className="w-4 h-4" />}
                            {tab === 'rentals' && <Wrench className="w-4 h-4" />}
                            {tab === 'services' && <Truck className="w-4 h-4" />}
                            {tab === 'employees' && <Users className="w-4 h-4" />}
                            {tab === 'analytics' && <BarChart2 className="w-4 h-4" />}
                            {tab === 'promotions' && <Megaphone className="w-4 h-4" />}
                            {getLabel(tab)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <Package className="w-5 h-5 text-blue-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('totalProducts')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.totalProducts}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('activeProducts')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.activeProducts}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-5 h-5 text-amber-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('pendingQuotes')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.pendingQuotes}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <Eye className="w-5 h-5 text-purple-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('monthlyViews')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.monthlyViews.toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShoppingCart className="w-5 h-5 text-teal-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('monthlyOrders')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.monthlyOrders}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-green-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('revenue')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.revenue.toLocaleString()} <span className="text-sm font-normal">{getLabel('sar')}</span></div>
                            </div>
                        </div>

                        {/* Recent Quote Requests */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">{getLabel('quotes')}</h3>
                                <button
                                    onClick={() => setActiveTab('quotes')}
                                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                                >
                                    {language === 'ar' ? 'عرض الكل' : 'View All'}
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('customer')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('date')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('items')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('status')}</th>
                                            <th className="px-4 py-3 text-end text-sm text-slate-400">{getLabel('total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quoteRequests.slice(0, 3).map((quote) => (
                                            <tr key={quote.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3 text-white">{quote.customerName}</td>
                                                <td className="px-4 py-3 text-center text-slate-400">{quote.date}</td>
                                                <td className="px-4 py-3 text-center text-slate-400">{quote.items}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(quote.status)}`}>
                                                        {getStatusIcon(quote.status)}
                                                        {getLabel(quote.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-end text-white font-medium">{quote.total.toLocaleString()} {getLabel('sar')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {language === 'ar' ? 'أنواع المنتجات' : 'Product Categories'}
                            </h2>
                            <div className="text-slate-400">
                                {language === 'ar'
                                    ? `${productCategories.length} تصنيف • ${productCategories.reduce((sum, c) => sum + c.count, 0)} منتج`
                                    : `${productCategories.length} categories • ${productCategories.reduce((sum, c) => sum + c.count, 0)} products`
                                }
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {productCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setSelectedCategory(category.id);
                                        setActiveTab('products');
                                    }}
                                    className={`group relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105 hover:shadow-xl`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                                    <div className="text-4xl mb-3">{category.icon}</div>
                                    <div className="font-bold text-white mb-1">{category.name[language]}</div>
                                    <div className="text-sm text-slate-400">
                                        {category.count} {language === 'ar' ? 'منتج' : 'products'}
                                    </div>
                                    <div className={`absolute top-3 end-3 w-2 h-2 rounded-full bg-gradient-to-br ${category.color}`}></div>
                                </button>
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h3 className="text-lg font-bold text-white mb-4">
                                {language === 'ar' ? 'ملخص التصنيفات' : 'Categories Summary'}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-white">{productCategories.length}</div>
                                    <div className="text-sm text-slate-400">{language === 'ar' ? 'تصنيف' : 'Categories'}</div>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-emerald-400">{productCategories.reduce((sum, c) => sum + c.count, 0)}</div>
                                    <div className="text-sm text-slate-400">{language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}</div>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-blue-400">{Math.max(...productCategories.map(c => c.count))}</div>
                                    <div className="text-sm text-slate-400">{language === 'ar' ? 'أكبر تصنيف' : 'Largest Category'}</div>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-amber-400">{Math.round(productCategories.reduce((sum, c) => sum + c.count, 0) / productCategories.length)}</div>
                                    <div className="text-sm text-slate-400">{language === 'ar' ? 'متوسط المنتجات' : 'Avg. Products'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sales Tab */}
                {activeTab === 'sales' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{getLabel('sales')}</h2>
                                    <p className="text-slate-400 text-sm">{language === 'ar' ? 'منتجات البيع المباشر' : 'Direct sale products'}</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-colors">
                                <Plus className="w-5 h-5" />
                                {language === 'ar' ? 'إضافة منتج للبيع' : 'Add Sale Product'}
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-blue-500/30">
                                <div className="text-blue-400 text-sm mb-1">{language === 'ar' ? 'منتجات البيع' : 'Sale Products'}</div>
                                <div className="text-2xl font-bold text-white">{products.filter(p => p.productType === 'sale').length}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-emerald-500/30">
                                <div className="text-emerald-400 text-sm mb-1">{language === 'ar' ? 'نشط' : 'Active'}</div>
                                <div className="text-2xl font-bold text-white">{products.filter(p => p.productType === 'sale' && p.status === 'active').length}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-500/30">
                                <div className="text-slate-400 text-sm mb-1">{language === 'ar' ? 'إجمالي المشاهدات' : 'Total Views'}</div>
                                <div className="text-2xl font-bold text-white">{products.filter(p => p.productType === 'sale').reduce((sum, p) => sum + p.views, 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/30">
                                <div className="text-amber-400 text-sm mb-1">{language === 'ar' ? 'نسبة التحويل' : 'Conversion'}</div>
                                <div className="text-2xl font-bold text-white">
                                    {(products.filter(p => p.productType === 'sale').reduce((sum, p) => sum + p.conversionRate, 0) / Math.max(1, products.filter(p => p.productType === 'sale').length)).toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('productName')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('category')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('price')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('stock')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('status')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.filter(p => p.productType === 'sale').map((product) => (
                                            <tr key={product.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3 text-white font-medium">{product.name[language]}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs">
                                                        {PRODUCT_CATEGORIES[product.category]?.[language] || product.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-white">{product.price} / {product.unit}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-slate-500/10 text-slate-400'
                                                        }`}>
                                                        {getLabel(product.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-slate-400 hover:text-red-400 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rentals Tab */}
                {activeTab === 'rentals' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                    <Wrench className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{getLabel('rentals')}</h2>
                                    <p className="text-slate-400 text-sm">{language === 'ar' ? 'المعدات والأدوات للتأجير' : 'Equipment & tools for rent'}</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl transition-colors">
                                <Plus className="w-5 h-5" />
                                {language === 'ar' ? 'إضافة منتج للتأجير' : 'Add Rental Product'}
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-orange-500/30">
                                <div className="text-orange-400 text-sm mb-1">{language === 'ar' ? 'منتجات التأجير' : 'Rental Products'}</div>
                                <div className="text-2xl font-bold text-white">{products.filter(p => p.productType === 'rental').length}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-emerald-500/30">
                                <div className="text-emerald-400 text-sm mb-1">{language === 'ar' ? 'متاح للتأجير' : 'Available'}</div>
                                <div className="text-2xl font-bold text-white">{products.filter(p => p.productType === 'rental' && p.status === 'active').length}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-500/30">
                                <div className="text-slate-400 text-sm mb-1">{language === 'ar' ? 'إجمالي التسعيرات' : 'Total Pricings'}</div>
                                <div className="text-2xl font-bold text-white">{products.filter(p => p.productType === 'rental').reduce((sum, p) => sum + p.pricings, 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/30">
                                <div className="text-amber-400 text-sm mb-1">{language === 'ar' ? 'نسبة التحويل' : 'Conversion'}</div>
                                <div className="text-2xl font-bold text-white">
                                    {(products.filter(p => p.productType === 'rental').reduce((sum, p) => sum + p.conversionRate, 0) / Math.max(1, products.filter(p => p.productType === 'rental').length)).toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        {/* Rental Categories */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h3 className="text-lg font-bold text-white mb-4">{language === 'ar' ? 'تصنيفات التأجير' : 'Rental Categories'}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {Object.entries(PRODUCT_CATEGORIES).filter(([_, cat]) => cat.type === 'rental').map(([key, cat]) => (
                                    <div key={key} className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-orange-500/50 transition-all cursor-pointer">
                                        <div className="text-white font-medium text-sm">{cat[language]}</div>
                                        <div className="text-slate-400 text-xs mt-1">
                                            {products.filter(p => p.category === key).length} {language === 'ar' ? 'منتج' : 'items'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('productName')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('category')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('rentalPeriod')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('price')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('deposit')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('availableForRent')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.filter(p => p.productType === 'rental').map((product) => (
                                            <tr key={product.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3 text-white font-medium">{product.name[language]}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-xs">
                                                        {PRODUCT_CATEGORIES[product.category]?.[language] || product.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-slate-300">
                                                        {product.rentalPeriod && RENTAL_PERIOD_TRANSLATIONS[product.rentalPeriod]?.[language]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-emerald-400 font-bold">{product.price} {getLabel('sar')}</td>
                                                <td className="px-4 py-3 text-center text-amber-400">
                                                    {product.depositAmount ? `${product.depositAmount.toLocaleString()} ${getLabel('sar')}` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-slate-400 hover:text-red-400 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder={language === 'ar' ? 'بحث عن منتج...' : 'Search products...'}
                                        className="bg-slate-800/50 border border-slate-700 rounded-xl py-2 ps-10 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
                                    />
                                </div>
                                <button className="p-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-colors">
                                <Plus className="w-5 h-5" />
                                {getLabel('addProduct')}
                            </button>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('productName')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('category')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('price')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('stock')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('status')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3 text-white font-medium">{product.name[language]}</td>
                                                <td className="px-4 py-3 text-center text-slate-400">{product.category}</td>
                                                <td className="px-4 py-3 text-center text-white">{product.price} / {product.unit}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-slate-500/10 text-slate-400'
                                                        }`}>
                                                        {getLabel(product.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-slate-400 hover:text-red-400 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quotes Tab */}
                {activeTab === 'quotes' && (
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-700/30">
                                        <th className="px-4 py-3 text-start text-sm text-slate-400">#</th>
                                        <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('customer')}</th>
                                        <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('date')}</th>
                                        <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('items')}</th>
                                        <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('status')}</th>
                                        <th className="px-4 py-3 text-end text-sm text-slate-400">{getLabel('total')}</th>
                                        <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quoteRequests.map((quote) => (
                                        <tr key={quote.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                            <td className="px-4 py-3 text-slate-400">{quote.id}</td>
                                            <td className="px-4 py-3 text-white font-medium">{quote.customerName}</td>
                                            <td className="px-4 py-3 text-center text-slate-400">{quote.date}</td>
                                            <td className="px-4 py-3 text-center text-slate-400">{quote.items}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(quote.status)}`}>
                                                    {getStatusIcon(quote.status)}
                                                    {getLabel(quote.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-end text-white font-medium">{quote.total.toLocaleString()} {getLabel('sar')}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button className="px-3 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-sm transition-colors">
                                                    {language === 'ar' ? 'عرض' : 'View'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <Eye className="w-5 h-5 text-blue-400" />
                                    <span className="text-slate-400 text-sm">{language === 'ar' ? 'إجمالي المشاهدات' : 'Total Views'}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{products.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-emerald-400" />
                                    <span className="text-slate-400 text-sm">{language === 'ar' ? 'إجمالي التسعيرات' : 'Total Pricings'}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{products.reduce((sum, p) => sum + p.pricings, 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShoppingCart className="w-5 h-5 text-purple-400" />
                                    <span className="text-slate-400 text-sm">{language === 'ar' ? 'أُضيف للعروض' : 'Added to Quotes'}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{products.reduce((sum, p) => sum + p.addedToQuotes, 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="w-5 h-5 text-amber-400" />
                                    <span className="text-slate-400 text-sm">{language === 'ar' ? 'متوسط التحويل' : 'Avg. Conversion'}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{(products.reduce((sum, p) => sum + p.conversionRate, 0) / products.length).toFixed(1)}%</div>
                            </div>
                        </div>

                        {/* Product Performance Table */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="p-4 border-b border-slate-700/50">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-emerald-400" />
                                    {getLabel('productPerformance')}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('productName')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('views')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('pricings')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'أُضيف للعروض' : 'Quotes'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('conversionRate')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'الأداء' : 'Performance'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.sort((a, b) => b.pricings - a.pricings).map((product) => (
                                            <tr key={product.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3 text-white font-medium">{product.name[language]}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-blue-400 font-medium">{product.views.toLocaleString()}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-emerald-400 font-medium">{product.pricings}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-purple-400 font-medium">{product.addedToQuotes}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-medium ${product.conversionRate > 50 ? 'text-emerald-400' : product.conversionRate > 30 ? 'text-amber-400' : 'text-red-400'}`}>
                                                        {product.conversionRate}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${product.conversionRate > 50 ? 'bg-emerald-500' : product.conversionRate > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${product.conversionRate}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Promotions Tab */}
                {activeTab === 'promotions' && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Megaphone className="w-6 h-6 text-emerald-400" />
                                {getLabel('promotions')}
                            </h2>
                            <button
                                onClick={() => setShowCreatePromotion(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                {getLabel('createPromotion')}
                            </button>
                        </div>

                        {/* Promotions Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-emerald-500/30">
                                <div className="text-emerald-400 text-sm mb-1">{language === 'ar' ? 'العروض النشطة' : 'Active Promotions'}</div>
                                <div className="text-2xl font-bold text-white">{promotions.filter(p => p.status === 'active').length}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/30">
                                <div className="text-amber-400 text-sm mb-1">{language === 'ar' ? 'إجمالي الاستخدامات' : 'Total Uses'}</div>
                                <div className="text-2xl font-bold text-white">{promotions.reduce((sum, p) => sum + p.currentUses, 0)}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-500/30">
                                <div className="text-slate-400 text-sm mb-1">{language === 'ar' ? 'العروض المنتهية' : 'Expired'}</div>
                                <div className="text-2xl font-bold text-white">{promotions.filter(p => p.status === 'expired').length}</div>
                            </div>
                        </div>

                        {/* Promotions List */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('productName')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('discountType')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'الخصم' : 'Discount'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('targetCustomers')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'الفترة' : 'Period'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'الاستخدام' : 'Usage'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {promotions.map((promo) => (
                                            <tr key={promo.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Gift className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-white font-medium">{promo.productName[language]}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="flex items-center justify-center gap-1 text-slate-300">
                                                        {promo.discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                                                        {getLabel(promo.discountType)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-emerald-400 font-bold">
                                                        {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `${promo.discountValue} ${getLabel('sar')}`}
                                                    </span>
                                                    <div className="text-xs text-slate-500">
                                                        {language === 'ar' ? 'من' : 'from'} {promo.originalPrice} {getLabel('sar')}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${promo.targetCustomers === 'all' ? 'bg-blue-500/10 text-blue-400' :
                                                        promo.targetCustomers === 'companies' ? 'bg-purple-500/10 text-purple-400' :
                                                            'bg-teal-500/10 text-teal-400'
                                                        }`}>
                                                        {getLabel(promo.targetCustomers)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-400 text-sm">
                                                    <div>{promo.startDate}</div>
                                                    <div className="text-slate-500">{language === 'ar' ? 'إلى' : 'to'}</div>
                                                    <div>{promo.endDate}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="text-white font-medium">{promo.currentUses} / {promo.maxUses}</div>
                                                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-1">
                                                        <div
                                                            className="h-1.5 rounded-full bg-emerald-500"
                                                            style={{ width: `${(promo.currentUses / promo.maxUses) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${promo.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                                        promo.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                                                            'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                                                        }`}>
                                                        {getLabel(promo.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Quick Create Promotion Button for Products */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h3 className="text-lg font-bold text-white mb-4">{language === 'ar' ? 'إنشاء عرض سريع' : 'Quick Create Promotion'}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {products.filter(p => p.status === 'active').map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => {
                                            setSelectedProductForPromo(product);
                                            setShowCreatePromotion(true);
                                        }}
                                        className="p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-emerald-500/50 transition-all text-start"
                                    >
                                        <div className="text-white font-medium text-sm">{product.name[language]}</div>
                                        <div className="text-slate-400 text-xs mt-1">{product.price} {getLabel('sar')} / {product.unit}</div>
                                        <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
                                            <Plus className="w-3 h-3" />
                                            {language === 'ar' ? 'إنشاء عرض' : 'Create Offer'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl space-y-6">
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-emerald-400" />
                                {language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {language === 'ar' ? 'اسم المنشأة' : 'Business Name'}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                        defaultValue={language === 'ar' ? 'شركة التوريدات المتحدة' : 'United Supplies Co.'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                        defaultValue="supplier@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {language === 'ar' ? 'رقم الجوال' : 'Phone'}
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                        defaultValue="+966501234567"
                                    />
                                </div>
                                <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-colors">
                                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <SupplierServicesCatalogComponent
                        language={language}
                        services={servicesCatalog}
                        onUpdate={setServicesCatalog}
                        readOnly={isTestMode}
                    />
                )}

                {/* Employees Tab */}
                {activeTab === 'employees' && (
                    <SupplierEmployeeManager
                        language={language}
                        employees={employees}
                        onUpdate={setEmployees}
                        readOnly={isTestMode}
                    />
                )}
            </div>
        </div>
    );
};

export default SupplierDashboard;
