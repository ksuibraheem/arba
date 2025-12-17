import React, { useRef, useState } from 'react';
import { X, Printer, Building2, Phone, Mail, MapPin, FileText, FileSpreadsheet, Download, Eye, EyeOff, MessageSquare, Settings2 } from 'lucide-react';
import { AppState, CalculatedItem, Language } from '../types';
import { formatCurrency, formatNumber, numberToArabicWords } from '../utils/formatting';
import { COMPANY_INFO } from '../companyData';

interface PriceQuoteProps {
    state: AppState;
    calculatedItems: CalculatedItem[];
    totals: {
        totalDirect: number;
        totalOverhead: number;
        totalProfit: number;
        finalPrice: number;
    };
    language: Language;
    onClose: () => void;
}

const PriceQuote: React.FC<PriceQuoteProps> = ({
    state,
    calculatedItems,
    totals,
    language,
    onClose
}) => {
    const printRef = useRef<HTMLDivElement>(null);
    const isRtl = language === 'ar';

    // Display options
    const [showCompanyInfo, setShowCompanyInfo] = useState(true);
    const [showProfitDetails, setShowProfitDetails] = useState(true);
    const [showTerms, setShowTerms] = useState(true);
    const [showSuppliers, setShowSuppliers] = useState(true);
    const [notes, setNotes] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const t = {
        title: { ar: 'عرض سعر', en: 'Price Quotation' },
        quoteNumber: { ar: 'رقم العرض', en: 'Quote #' },
        date: { ar: 'التاريخ', en: 'Date' },
        validUntil: { ar: 'صالح حتى', en: 'Valid Until' },
        projectInfo: { ar: 'معلومات المشروع', en: 'Project Information' },
        projectType: { ar: 'نوع المشروع', en: 'Project Type' },
        plotArea: { ar: 'مساحة الأرض', en: 'Plot Area' },
        buildingArea: { ar: 'مساحة البناء', en: 'Building Area' },
        floors: { ar: 'عدد الطوابق', en: 'Floors' },
        pricingBreakdown: { ar: 'تفصيل التسعير', en: 'Pricing Breakdown' },
        item: { ar: 'البند', en: 'Item' },
        unit: { ar: 'الوحدة', en: 'Unit' },
        quantity: { ar: 'الكمية', en: 'Quantity' },
        unitPrice: { ar: 'سعر الوحدة', en: 'Unit Price' },
        total: { ar: 'الإجمالي', en: 'Total' },
        directCost: { ar: 'التكلفة المباشرة', en: 'Direct Cost' },
        overhead: { ar: 'المصاريف الإدارية', en: 'Overhead' },
        profit: { ar: 'الربح', en: 'Profit' },
        finalTotal: { ar: 'الإجمالي النهائي', en: 'Final Total' },
        amountInWords: { ar: 'المبلغ بالحروف', en: 'Amount in Words' },
        termsTitle: { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
        terms: {
            ar: [
                'الأسعار شاملة ضريبة القيمة المضافة',
                'العرض ساري لمدة 30 يوم من تاريخه',
                'يتم تحصيل 50% مقدم عند التعاقد',
                'مدة التنفيذ المتوقعة: حسب حجم المشروع',
                'الضمان: سنة واحدة على الأعمال المنفذة'
            ],
            en: [
                'Prices include VAT',
                'Quote valid for 30 days from date',
                '50% advance payment required upon contract',
                'Estimated completion: Based on project scope',
                'Warranty: 1 year on completed works'
            ]
        },
        preparedBy: { ar: 'أعد بواسطة', en: 'Prepared By' },
        clientSignature: { ar: 'توقيع العميل', en: 'Client Signature' },
        sqm: { ar: 'م²', en: 'm²' },
        print: { ar: 'طباعة PDF', en: 'Print PDF' },
        exportExcel: { ar: 'تصدير Excel', en: 'Export Excel' },
        close: { ar: 'إغلاق', en: 'Close' },
        notes: { ar: 'ملاحظات', en: 'Notes' },
        notesPlaceholder: { ar: 'أضف ملاحظاتك هنا...', en: 'Add your notes here...' },
        settings: { ar: 'إعدادات العرض', en: 'Display Settings' },
        showCompany: { ar: 'إظهار بيانات الشركة', en: 'Show Company Info' },
        showProfit: { ar: 'إظهار تفاصيل الأرباح', en: 'Show Profit Details' },
        showTerms: { ar: 'إظهار الشروط والأحكام', en: 'Show Terms' },
        showSuppliers: { ar: 'إظهار الموردين', en: 'Show Suppliers' },
        supplier: { ar: 'المورد', en: 'Supplier' },
        alternative: { ar: 'البديل الأرخص', en: 'Cheaper Alternative' },
        noItems: { ar: 'لا توجد بنود نشطة', en: 'No active items' },
        category: { ar: 'التصنيف', en: 'Category' }
    };

    const getLabel = (key: string) => t[key as keyof typeof t]?.[language] || key;

    const quoteNumber = `ARB-${Date.now().toString().slice(-8)}`;
    const today = new Date();
    const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const totalBuildArea = state.blueprint.floors.reduce((sum, f) => sum + f.area, 0);
    const plotArea = state.blueprint.plotLength * state.blueprint.plotWidth;

    // Get active items with qty > 0 (no isActive property, all items are active)
    const activeItems = calculatedItems.filter(item => item.qty > 0);

    const projectTypeLabels: Record<string, { ar: string; en: string }> = {
        villa: { ar: 'فيلا سكنية', en: 'Residential Villa' },
        building: { ar: 'عمارة سكنية', en: 'Residential Building' },
        commercial: { ar: 'مبنى تجاري', en: 'Commercial Building' },
        warehouse: { ar: 'مستودع', en: 'Warehouse' }
    };

    const categoryLabels: Record<string, { ar: string; en: string }> = {
        sitework: { ar: 'أعمال الموقع', en: 'Site Work' },
        structure: { ar: 'الهيكل الإنشائي', en: 'Structure' },
        finishing: { ar: 'التشطيبات', en: 'Finishing' },
        mep: { ar: 'الكهرباء والسباكة', en: 'MEP' },
        external: { ar: 'الأعمال الخارجية', en: 'External Works' },
        general: { ar: 'عام', en: 'General' }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        // Create CSV content
        const headers = ['#', getLabel('item'), getLabel('unit'), getLabel('quantity'), getLabel('unitPrice'), getLabel('total')];
        const rows = activeItems.map((item, index) => [
            index + 1,
            item.displayName,
            item.unit,
            item.qty.toFixed(2),
            item.finalUnitPrice.toFixed(2),
            item.totalLinePrice.toFixed(2)
        ]);

        // Add totals
        rows.push(['', '', '', '', getLabel('directCost'), totals.totalDirect.toFixed(2)]);
        if (showProfitDetails) {
            rows.push(['', '', '', '', getLabel('overhead'), totals.totalOverhead.toFixed(2)]);
            rows.push(['', '', '', '', getLabel('profit'), totals.totalProfit.toFixed(2)]);
        }
        rows.push(['', '', '', '', getLabel('finalTotal'), totals.finalPrice.toFixed(2)]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Add BOM for Arabic support
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `price_quote_${quoteNumber}.csv`;
        link.click();
    };

    // Group items by category
    const groupedItems = activeItems.reduce((acc, item) => {
        const cat = item.category || 'general';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, CalculatedItem[]>);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-auto">
                {/* Toolbar */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10 print:hidden">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-emerald-500" />
                        {getLabel('title')}
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* Settings Toggle */}
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${showSettings ? 'bg-slate-200' : 'bg-slate-100 hover:bg-slate-200'}`}
                        >
                            <Settings2 className="w-4 h-4" />
                            {getLabel('settings')}
                        </button>
                        {/* Export Excel */}
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            {getLabel('exportExcel')}
                        </button>
                        {/* Print PDF */}
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            {getLabel('print')}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="bg-slate-50 border-b border-slate-200 p-4 print:hidden">
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showCompanyInfo}
                                    onChange={(e) => setShowCompanyInfo(e.target.checked)}
                                    className="w-4 h-4 text-emerald-500 rounded"
                                />
                                <span className="text-sm">{getLabel('showCompany')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showProfitDetails}
                                    onChange={(e) => setShowProfitDetails(e.target.checked)}
                                    className="w-4 h-4 text-emerald-500 rounded"
                                />
                                <span className="text-sm">{getLabel('showProfit')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showTerms}
                                    onChange={(e) => setShowTerms(e.target.checked)}
                                    className="w-4 h-4 text-emerald-500 rounded"
                                />
                                <span className="text-sm">{getLabel('showTerms')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showSuppliers}
                                    onChange={(e) => setShowSuppliers(e.target.checked)}
                                    className="w-4 h-4 text-emerald-500 rounded"
                                />
                                <span className="text-sm">{getLabel('showSuppliers')}</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Printable Content */}
                <div ref={printRef} className="p-8 print:p-4" dir={isRtl ? 'rtl' : 'ltr'}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8 pb-6 border-b-4 border-emerald-500">
                        {showCompanyInfo && (
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-800">{COMPANY_INFO.name[language]}</h1>
                                    <p className="text-slate-500">{COMPANY_INFO.tagline[language]}</p>
                                </div>
                            </div>
                        )}
                        <div className={showCompanyInfo ? "text-end" : "w-full text-center"}>
                            <div className="text-3xl font-bold text-emerald-600 mb-2">{getLabel('title')}</div>
                            <div className="text-sm text-slate-500 space-y-1">
                                <div><span className="font-medium">{getLabel('quoteNumber')}:</span> {quoteNumber}</div>
                                <div><span className="font-medium">{getLabel('date')}:</span> {formatDate(today)}</div>
                                <div><span className="font-medium">{getLabel('validUntil')}:</span> {formatDate(validUntil)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Company Contact Info */}
                    {showCompanyInfo && (
                        <div className="grid grid-cols-3 gap-4 mb-8 text-sm bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-emerald-500" />
                                <span>{COMPANY_INFO.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-emerald-500" />
                                <span>{COMPANY_INFO.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <span>{COMPANY_INFO.location[language]}</span>
                            </div>
                        </div>
                    )}

                    {/* Project Information */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-emerald-500 rounded"></div>
                            {getLabel('projectInfo')}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 rounded-xl p-4">
                            <div>
                                <div className="text-xs text-slate-500 mb-1">{getLabel('projectType')}</div>
                                <div className="font-bold text-slate-800">
                                    {projectTypeLabels[state.projectType]?.[language] || state.projectType}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">{getLabel('plotArea')}</div>
                                <div className="font-bold text-slate-800">{formatNumber(plotArea, 0, language)} {getLabel('sqm')}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">{getLabel('buildingArea')}</div>
                                <div className="font-bold text-slate-800">{formatNumber(totalBuildArea, 0, language)} {getLabel('sqm')}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">{getLabel('floors')}</div>
                                <div className="font-bold text-slate-800">{formatNumber(state.blueprint.floors.length, 0, language)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Breakdown Table */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-emerald-500 rounded"></div>
                            {getLabel('pricingBreakdown')}
                            <span className="text-sm font-normal text-slate-500">({activeItems.length} {language === 'ar' ? 'بند' : 'items'})</span>
                        </h3>

                        {activeItems.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-xl text-slate-500">
                                {getLabel('noItems')}
                            </div>
                        ) : (
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-800 text-white">
                                        <th className="p-3 text-start w-12">#</th>
                                        <th className="p-3 text-start">{getLabel('item')}</th>
                                        <th className="p-3 text-center w-20">{getLabel('unit')}</th>
                                        <th className="p-3 text-center w-24">{getLabel('quantity')}</th>
                                        {showSuppliers && <th className="p-3 text-center w-40">{getLabel('supplier')}</th>}
                                        <th className="p-3 text-end w-32">{getLabel('unitPrice')}</th>
                                        <th className="p-3 text-end w-36">{getLabel('total')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(Object.entries(groupedItems) as [string, CalculatedItem[]][]).map(([category, items]) => (
                                        <React.Fragment key={category}>
                                            {/* Category Header */}
                                            <tr className="bg-slate-100">
                                                <td colSpan={showSuppliers ? 7 : 6} className="p-2 font-bold text-slate-700">
                                                    {categoryLabels[category]?.[language] || category}
                                                </td>
                                            </tr>
                                            {/* Items */}
                                            {items.map((item, index) => {
                                                // Find cheaper alternative supplier
                                                const cheaperSupplier = item.suppliers
                                                    ?.filter((s: any) => s.priceMultiplier < item.selectedSupplier?.priceMultiplier)
                                                    .sort((a: any, b: any) => a.priceMultiplier - b.priceMultiplier)[0];

                                                return (
                                                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                        <td className="p-3 border-b border-slate-200">{formatNumber(index + 1, 0, language)}</td>
                                                        <td className="p-3 border-b border-slate-200 font-medium">{item.displayName}</td>
                                                        <td className="p-3 border-b border-slate-200 text-center">{item.unit}</td>
                                                        <td className="p-3 border-b border-slate-200 text-center font-bold text-blue-600">{formatNumber(item.qty, 2, language)}</td>
                                                        {showSuppliers && (
                                                            <td className="p-3 border-b border-slate-200">
                                                                <div className="flex flex-col gap-1">
                                                                    {/* Selected Supplier */}
                                                                    <div className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                                        {item.selectedSupplier?.name?.[language] || '-'}
                                                                    </div>
                                                                    {/* Cheaper Alternative */}
                                                                    {cheaperSupplier && (
                                                                        <div className="text-xs text-amber-600 flex items-center gap-1">
                                                                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                                                            {getLabel('alternative')}: {cheaperSupplier.name?.[language]}
                                                                            <span className="text-green-600">(-{Math.round((1 - cheaperSupplier.priceMultiplier / item.selectedSupplier.priceMultiplier) * 100)}%)</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                        <td className="p-3 border-b border-slate-200 text-end">{formatCurrency(item.finalUnitPrice, language)}</td>
                                                        <td className="p-3 border-b border-slate-200 text-end font-bold">{formatCurrency(item.totalLinePrice, language)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Totals Section */}
                    <div className="mb-8">
                        <div className="flex justify-end">
                            <div className="w-96 space-y-2">
                                <div className="flex justify-between py-2 border-b border-slate-200">
                                    <span className="text-slate-600">{getLabel('directCost')}</span>
                                    <span className="font-bold">{formatCurrency(totals.totalDirect, language)}</span>
                                </div>
                                {showProfitDetails && (
                                    <>
                                        <div className="flex justify-between py-2 border-b border-slate-200">
                                            <span className="text-slate-600">{getLabel('overhead')} (10%)</span>
                                            <span className="font-bold">{formatCurrency(totals.totalOverhead, language)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-slate-200">
                                            <span className="text-slate-600">{getLabel('profit')} (15%)</span>
                                            <span className="font-bold">{formatCurrency(totals.totalProfit, language)}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between py-3 bg-emerald-500 text-white rounded-lg px-4">
                                    <span className="font-bold">{getLabel('finalTotal')}</span>
                                    <span className="font-bold text-lg">{formatCurrency(totals.finalPrice, language)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="text-sm text-amber-700 font-medium mb-1">{getLabel('amountInWords')}:</div>
                        <div className="text-lg font-bold text-amber-900">
                            {language === 'ar' ? numberToArabicWords(totals.finalPrice) : formatCurrency(totals.finalPrice, language)}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mb-8 print:hidden">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-emerald-500" />
                            {getLabel('notes')}
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={getLabel('notesPlaceholder')}
                            className="w-full h-32 p-4 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            dir={isRtl ? 'rtl' : 'ltr'}
                        />
                    </div>

                    {/* Notes Display for Print */}
                    {notes && (
                        <div className="mb-8 hidden print:block bg-slate-50 rounded-xl p-4">
                            <div className="text-sm font-bold text-slate-700 mb-2">{getLabel('notes')}:</div>
                            <div className="text-slate-600 whitespace-pre-wrap">{notes}</div>
                        </div>
                    )}

                    {/* Terms & Conditions */}
                    {showTerms && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-emerald-500 rounded"></div>
                                {getLabel('termsTitle')}
                            </h3>
                            <ul className="text-sm text-slate-600 space-y-2 bg-slate-50 rounded-xl p-4">
                                {t.terms[language].map((term, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {formatNumber(index + 1, 0, language)}
                                        </span>
                                        {term}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Signature Section */}
                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                        <div className="text-center">
                            <div className="text-sm text-slate-500 mb-16">{getLabel('preparedBy')}</div>
                            <div className="border-t border-slate-300 pt-2">
                                <div className="font-bold">{showCompanyInfo ? COMPANY_INFO.name[language] : '________________'}</div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-slate-500 mb-16">{getLabel('clientSignature')}</div>
                            <div className="border-t border-slate-300 pt-2">
                                <div className="text-slate-400">________________</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .hidden.print\\:block {
                        display: block !important;
                    }
                    #root {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                }
            `}</style>
        </div>
    );
};

export default PriceQuote;
