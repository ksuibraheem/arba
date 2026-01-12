/**
 * صفحة كتالوج الموردين
 * Supplier Catalog Page - Browse & Download Supplier Products
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowRight,
    ArrowLeft,
    Search,
    Filter,
    Download,
    Package,
    Building2,
    Star,
    CheckCircle,
    Clock,
    Tag,
    Grid,
    List,
    ShoppingCart,
    Truck,
    FileSpreadsheet,
    FileText,
    X,
    ChevronDown,
    Phone,
    Mail,
    BadgeCheck
} from 'lucide-react';
import {
    supplierService,
    Supplier,
    SupplierProduct,
    PRODUCT_CATEGORIES,
    PRODUCT_TYPE_TRANSLATIONS,
    RENTAL_PERIOD_TRANSLATIONS,
    UNIT_TYPE_TRANSLATIONS,
    APPROVAL_STATUS_TRANSLATIONS
} from '../services/supplierService';

interface SupplierCatalogProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
}

const SupplierCatalog: React.FC<SupplierCatalogProps> = ({ language, onNavigate }) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowRight : ArrowLeft;

    // States
    const [products, setProducts] = useState<SupplierProduct[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<'all' | 'sale' | 'rental'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<SupplierProduct | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Load data
    useEffect(() => {
        supplierService.initializeSampleData();
        // Get active products (both approved and pending for demo purposes)
        const allProducts = supplierService.getProducts();
        const activeProducts = allProducts.filter(p => p.status === 'active');
        setProducts(activeProducts);
        setSuppliers(supplierService.getSuppliers());
    }, []);

    // Get supplier by ID
    const getSupplier = (supplierId: string): Supplier | undefined => {
        return suppliers.find(s => s.id === supplierId);
    };

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Search filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = searchQuery === '' ||
                product.name.ar.includes(searchQuery) ||
                product.name.en.toLowerCase().includes(searchLower) ||
                product.category.toLowerCase().includes(searchLower);

            // Category filter
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

            // Type filter
            const matchesType = selectedType === 'all' || product.productType === selectedType;

            return matchesSearch && matchesCategory && matchesType;
        });
    }, [products, searchQuery, selectedCategory, selectedType]);

    // Get unique categories from products
    const availableCategories = useMemo(() => {
        const categories = new Set(products.map(p => p.category));
        return Array.from(categories);
    }, [products]);

    // Export to Excel (CSV)
    const exportToExcel = () => {
        setIsExporting(true);
        try {
            const headers = ['اسم المنتج', 'Product Name', 'الفئة', 'النوع', 'السعر', 'الوحدة', 'المورد', 'الحالة'];
            const rows = filteredProducts.map(p => {
                const supplier = getSupplier(p.supplierId);
                return [
                    p.name.ar,
                    p.name.en,
                    PRODUCT_CATEGORIES[p.category]?.ar || p.category,
                    PRODUCT_TYPE_TRANSLATIONS[p.productType]?.ar || p.productType,
                    p.price.toString(),
                    UNIT_TYPE_TRANSLATIONS[p.unitType]?.ar || p.unitType || '-',
                    supplier?.companyName || '-',
                    APPROVAL_STATUS_TRANSLATIONS[p.approvalStatus]?.ar || p.approvalStatus || '-'
                ];
            });

            const csvContent = '\ufeff' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `supplier_catalog_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } finally {
            setIsExporting(false);
        }
    };

    // Translations
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onNavigate('home')}
                                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                            >
                                <Arrow className="w-5 h-5 text-slate-300" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Package className="w-7 h-7 text-emerald-400" />
                                    {t('كتالوج الموردين', 'Supplier Catalog')}
                                </h1>
                                <p className="text-slate-400 text-sm">
                                    {t('تصفح منتجات الموردين المعتمدين', 'Browse verified supplier products')}
                                </p>
                            </div>
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            {isExporting ? t('جاري التصدير...', 'Exporting...') : t('تصدير Excel', 'Export Excel')}
                        </button>
                    </div>
                </div>
            </header>

            {/* Search & Filters */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} w-5 h-5 text-slate-400`} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('ابحث عن منتج...', 'Search products...')}
                                className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="appearance-none px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-w-[180px]"
                            >
                                <option value="all">{t('جميع الفئات', 'All Categories')}</option>
                                {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {PRODUCT_CATEGORIES[cat]?.[language] || cat}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'} w-4 h-4 text-slate-400 pointer-events-none`} />
                        </div>

                        {/* Type Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedType('all')}
                                className={`px-4 py-2 rounded-lg transition-colors ${selectedType === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}
                            >
                                {t('الكل', 'All')}
                            </button>
                            <button
                                onClick={() => setSelectedType('sale')}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedType === 'sale' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                {t('بيع', 'Sale')}
                            </button>
                            <button
                                onClick={() => setSelectedType('rental')}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedType === 'rental' ? 'bg-orange-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}
                            >
                                <Truck className="w-4 h-4" />
                                {t('تأجير', 'Rental')}
                            </button>
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
                    <span>{t('إجمالي المنتجات:', 'Total Products:')} <strong className="text-white">{filteredProducts.length}</strong></span>
                    <span>•</span>
                    <span>{t('للبيع:', 'For Sale:')} <strong className="text-blue-400">{filteredProducts.filter(p => p.productType === 'sale').length}</strong></span>
                    <span>•</span>
                    <span>{t('للتأجير:', 'For Rent:')} <strong className="text-orange-400">{filteredProducts.filter(p => p.productType === 'rental').length}</strong></span>
                </div>

                {/* Products Grid/List */}
                {filteredProducts.length === 0 ? (
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center">
                        <Package className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {t('لا توجد منتجات', 'No Products Found')}
                        </h3>
                        <p className="text-slate-400">
                            {t('جرب تغيير معايير البحث أو الفلترة', 'Try changing search or filter criteria')}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => {
                            const supplier = getSupplier(product.supplierId);
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer group"
                                >
                                    {/* Product Type Badge */}
                                    <div className="relative h-32 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                                        <Package className="w-12 h-12 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                        <span className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} px-2 py-1 rounded-full text-xs font-medium ${product.productType === 'sale' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                            {product.productType === 'sale' ? <ShoppingCart className="w-3 h-3 inline mr-1" /> : <Truck className="w-3 h-3 inline mr-1" />}
                                            {PRODUCT_TYPE_TRANSLATIONS[product.productType]?.[language] || product.productType}
                                        </span>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-white mb-1 line-clamp-1">
                                            {product.name[language]}
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-2">
                                            {PRODUCT_CATEGORIES[product.category]?.[language] || product.category}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-emerald-400 font-bold">
                                                {product.price.toLocaleString()} {t('ر.س', 'SAR')}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                / {UNIT_TYPE_TRANSLATIONS[product.unitType]?.symbol || product.unitType || '-'}
                                            </span>
                                        </div>
                                        {supplier && (
                                            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-slate-500" />
                                                <span className="text-xs text-slate-400 truncate">{supplier.companyName}</span>
                                                {supplier.verificationStatus === 'verified' && (
                                                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">{t('المنتج', 'Product')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">{t('الفئة', 'Category')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">{t('النوع', 'Type')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">{t('السعر', 'Price')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">{t('المورد', 'Supplier')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredProducts.map(product => {
                                    const supplier = getSupplier(product.supplierId);
                                    return (
                                        <tr
                                            key={product.id}
                                            onClick={() => setSelectedProduct(product)}
                                            className="hover:bg-slate-700/30 cursor-pointer transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-white">{product.name[language]}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">
                                                {PRODUCT_CATEGORIES[product.category]?.[language] || product.category}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${product.productType === 'sale' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                    {PRODUCT_TYPE_TRANSLATIONS[product.productType]?.[language] || product.productType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-emerald-400 font-medium">
                                                {product.price.toLocaleString()} {t('ر.س', 'SAR')}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">
                                                {supplier?.companyName || '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
                    <div
                        className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {selectedProduct.name[language]}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm ${selectedProduct.productType === 'sale' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                            {PRODUCT_TYPE_TRANSLATIONS[selectedProduct.productType]?.[language] || selectedProduct.productType}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-sm bg-emerald-500/20 text-emerald-400">
                                            {APPROVAL_STATUS_TRANSLATIONS[selectedProduct.approvalStatus]?.[language] || selectedProduct.approvalStatus || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            {/* Product Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm mb-1">{t('السعر', 'Price')}</p>
                                    <p className="text-2xl font-bold text-emerald-400">
                                        {selectedProduct.price.toLocaleString()} {t('ر.س', 'SAR')}
                                        <span className="text-sm text-slate-400 font-normal"> / {UNIT_TYPE_TRANSLATIONS[selectedProduct.unitType]?.[language] || selectedProduct.unitType || '-'}</span>
                                    </p>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm mb-1">{t('الفئة', 'Category')}</p>
                                    <p className="text-lg font-semibold text-white">
                                        {PRODUCT_CATEGORIES[selectedProduct.category]?.[language] || selectedProduct.category}
                                    </p>
                                </div>
                                {selectedProduct.productType === 'rental' && selectedProduct.rentalPeriod && (
                                    <>
                                        <div className="bg-slate-700/30 rounded-xl p-4">
                                            <p className="text-slate-400 text-sm mb-1">{t('فترة التأجير', 'Rental Period')}</p>
                                            <p className="text-lg font-semibold text-white">
                                                {RENTAL_PERIOD_TRANSLATIONS[selectedProduct.rentalPeriod]?.[language] || selectedProduct.rentalPeriod || '-'}
                                            </p>
                                        </div>
                                        {selectedProduct.depositAmount && (
                                            <div className="bg-slate-700/30 rounded-xl p-4">
                                                <p className="text-slate-400 text-sm mb-1">{t('مبلغ التأمين', 'Deposit')}</p>
                                                <p className="text-lg font-semibold text-white">
                                                    {selectedProduct.depositAmount.toLocaleString()} {t('ر.س', 'SAR')}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Description */}
                            {selectedProduct.description && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-2">{t('الوصف', 'Description')}</h3>
                                    <p className="text-slate-400">{selectedProduct.description[language]}</p>
                                </div>
                            )}

                            {/* Specifications */}
                            {selectedProduct.specifications && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-2">{t('المواصفات', 'Specifications')}</h3>
                                    <p className="text-slate-400">{selectedProduct.specifications}</p>
                                </div>
                            )}

                            {/* Supplier Info */}
                            {(() => {
                                const supplier = getSupplier(selectedProduct.supplierId);
                                if (!supplier) return null;
                                return (
                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-emerald-400" />
                                            {t('معلومات المورد', 'Supplier Info')}
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">{supplier.companyName}</span>
                                                {supplier.verificationStatus === 'verified' && (
                                                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Phone className="w-4 h-4" />
                                                {supplier.phone}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Mail className="w-4 h-4" />
                                                {supplier.email}
                                            </div>
                                            {supplier.rating && (
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star
                                                            key={star}
                                                            className={`w-4 h-4 ${star <= supplier.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                                                        />
                                                    ))}
                                                    <span className="text-slate-400 text-sm ml-2">({supplier.rating}/5)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierCatalog;
