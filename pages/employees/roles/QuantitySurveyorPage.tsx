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
    REVIEW_DATA_TYPE_TRANSLATIONS
} from '../../../services/supplierReviewService';
import {
    discountRequestService,
    DiscountRequest,
    DISCOUNT_REQUEST_STATUS_TRANSLATIONS,
    DISCOUNT_TARGET_TYPE_TRANSLATIONS,
    DISCOUNT_TYPE_TRANSLATIONS
} from '../../../services/discountRequestService';

// ====================== Props ======================
interface QuantitySurveyorPageProps {
    employee: Employee;
    language: 'ar' | 'en';
    onLogout: () => void;
}

// ====================== Tab Types ======================
type TabType = 'dashboard' | 'suppliers' | 'companies' | 'individuals' | 'discounts';

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
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
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

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
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

    // Stats
    const stats = {
        pendingReviews: reviews.filter(r => r.status === 'pending').length,
        approvedReviews: reviews.filter(r => r.status === 'approved').length,
        pendingDiscounts: discountRequests.filter(d => d.status === 'pending').length,
        activeDiscounts: discountRequests.filter(d => d.status === 'approved' && d.isActive).length
    };

    // Tabs configuration
    const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
        { id: 'dashboard', label: t('لوحة القيادة', 'Dashboard'), icon: <ClipboardCheck className="w-5 h-5" /> },
        { id: 'suppliers', label: t('مراجعة الموردين', 'Supplier Review'), icon: <Package className="w-5 h-5" />, count: stats.pendingReviews },
        { id: 'companies', label: t('الشركات', 'Companies'), icon: <Building2 className="w-5 h-5" />, count: companies.length },
        { id: 'individuals', label: t('الأفراد', 'Individuals'), icon: <Users className="w-5 h-5" />, count: individuals.length },
        { id: 'discounts', label: t('طلبات التخفيض', 'Discount Requests'), icon: <Percent className="w-5 h-5" />, count: discountRequests.length }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-900/50 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <ClipboardCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">{t('مهندس الكميات والتسعيرات', 'Quantity Surveyor')}</h1>
                                <p className="text-slate-400 text-sm">{employee.name}</p>
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
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedReview && (
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
            )}

            {/* Discount Request Modal */}
            {showDiscountModal && (
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
            )}
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
