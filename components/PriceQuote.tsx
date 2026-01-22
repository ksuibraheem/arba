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
    const [showPrintMenu, setShowPrintMenu] = useState(false);

    // بيانات الشركة المسجلة (يتم جلبها من localStorage أو السياق)
    const getLoggedInCompany = () => {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                const user = JSON.parse(userData);
                return {
                    name: user.companyName || 'اسم الشركة',
                    phone: user.phone || '05xxxxxxxx',
                    email: user.email || 'info@company.com',
                    cr: user.commercialRegister || 'xxxxxxxxxx',
                    vat: user.vatNumber || 'xxxxxxxxxx',
                    address: user.address || 'المملكة العربية السعودية'
                };
            }
        } catch (e) { }
        return {
            name: 'شركة العميل',
            phone: '05xxxxxxxx',
            email: 'info@company.com',
            cr: '1010xxxxxx',
            vat: '3xxxxxxxxxx',
            address: 'المملكة العربية السعودية'
        };
    };

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
        category: { ar: 'التصنيف', en: 'Category' },
        printArba: { ar: 'طباعة (آربا للتسعير)', en: 'Print (Arba Pricing)' },
        printCompany: { ar: 'طباعة (بيانات الشركة)', en: 'Print (Company Info)' }
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

    const handlePrint = (printType: 'arba' | 'company') => {
        // تحديد بيانات الشركة بناءً على نوع الطباعة
        const companyData = printType === 'arba'
            ? {
                name: COMPANY_INFO.systemName[language],
                tagline: COMPANY_INFO.tagline[language],
                logo: 'أ',
                color: '#059669',
                phone: COMPANY_INFO.phone,
                email: COMPANY_INFO.email,
                cr: '',
                vat: ''
            }
            : (() => {
                const c = getLoggedInCompany();
                return {
                    name: c.name,
                    tagline: c.address,
                    logo: c.name.charAt(0),
                    color: '#1e40af',
                    phone: c.phone,
                    email: c.email,
                    cr: c.cr,
                    vat: c.vat
                };
            })();

        // إنشاء محتوى HTML للطباعة
        const printContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>عرض سعر - ${quoteNumber}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, sans-serif;
                    padding: 15mm;
                    background: white;
                    color: #1e293b;
                    direction: rtl;
                    font-size: 11pt;
                }
                .header { 
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 3px solid ${companyData.color};
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                .logo { 
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .logo-icon {
                    width: 50px;
                    height: 50px;
                    background: ${companyData.color};
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 20px;
                }
                .company-name { font-size: 20px; font-weight: bold; color: #1e293b; }
                .tagline { font-size: 11px; color: #64748b; }
                .company-details { font-size: 9px; color: #64748b; margin-top: 5px; }
                .quote-title { text-align: left; }
                .quote-title h1 { font-size: 24px; color: ${companyData.color}; margin-bottom: 5px; }
                .quote-info { font-size: 10px; color: #64748b; }
                
                .project-info {
                    background: #f8fafc;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                }
                .info-item label { font-size: 9px; color: #64748b; display: block; }
                .info-item span { font-weight: bold; color: #1e293b; }
                
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 20px;
                    font-size: 10pt;
                }
                th { 
                    background: #1e293b; 
                    color: white; 
                    padding: 8px 6px;
                    text-align: right;
                    font-size: 9pt;
                }
                td { 
                    padding: 6px;
                    border-bottom: 1px solid #e2e8f0;
                }
                tr:nth-child(even) { background: #f8fafc; }
                .category-row { background: #f1f5f9 !important; font-weight: bold; }
                .number { text-align: center; }
                .price { text-align: left; font-weight: 500; }
                
                .totals {
                    margin-top: 20px;
                    margin-right: auto;
                    width: 300px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #e2e8f0;
                }
                .final-total {
                    background: ${companyData.color};
                    color: white;
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 14pt;
                }
                
                .amount-words {
                    background: #fef3c7;
                    border: 1px solid #fcd34d;
                    padding: 12px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .amount-words label { font-size: 10px; color: #92400e; }
                .amount-words span { font-weight: bold; color: #78350f; font-size: 13pt; }
                
                .signatures {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 50px;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                }
                .signature { text-align: center; }
                .signature-label { font-size: 10px; color: #64748b; margin-bottom: 40px; }
                .signature-line { border-top: 1px solid #cbd5e1; padding-top: 5px; }
                
                @page { size: A4; margin: 10mm; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <!-- Header -->
            <div class="header">
                <div class="logo">
                    <div class="logo-icon">${companyData.logo}</div>
                    <div>
                        <div class="company-name">${companyData.name}</div>
                        <div class="tagline">${companyData.tagline}</div>
                        ${printType === 'company' ? `
                        <div class="company-details">
                            هاتف: ${companyData.phone} | البريد: ${companyData.email}<br>
                            ${companyData.cr ? `سجل تجاري: ${companyData.cr} | ` : ''}${companyData.vat ? `الرقم الضريبي: ${companyData.vat}` : ''}
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="quote-title">
                    <h1>${getLabel('title')}</h1>
                    <div class="quote-info">
                        <div>${getLabel('quoteNumber')}: ${quoteNumber}</div>
                        <div>${getLabel('date')}: ${formatDate(today)}</div>
                        <div>${getLabel('validUntil')}: ${formatDate(validUntil)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Project Info -->
            <div class="project-info">
                <div class="info-item">
                    <label>${getLabel('projectType')}</label>
                    <span>${projectTypeLabels[state.projectType]?.[language] || state.projectType}</span>
                </div>
                <div class="info-item">
                    <label>${getLabel('plotArea')}</label>
                    <span>${formatNumber(plotArea, 0, language)} ${getLabel('sqm')}</span>
                </div>
                <div class="info-item">
                    <label>${getLabel('buildingArea')}</label>
                    <span>${formatNumber(totalBuildArea, 0, language)} ${getLabel('sqm')}</span>
                </div>
                <div class="info-item">
                    <label>${getLabel('floors')}</label>
                    <span>${state.blueprint.floors.length}</span>
                </div>
            </div>
            
            <!-- Pricing Table -->
            <table>
                <thead>
                    <tr>
                        <th style="width:30px">م</th>
                        <th>البند</th>
                        <th style="width:100px">المورد</th>
                        <th style="width:50px">الوحدة</th>
                        <th style="width:60px" class="number">الكمية</th>
                        <th style="width:80px" class="price">سعر الوحدة</th>
                        <th style="width:90px" class="price">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${activeItems.map((item, index) => `
                        <tr>
                            <td class="number">${index + 1}</td>
                            <td>${item.displayName}</td>
                            <td>${item.selectedSupplier?.name?.[language] || '-'}</td>
                            <td class="number">${item.unit}</td>
                            <td class="number">${item.qty.toFixed(2)}</td>
                            <td class="price">${item.finalUnitPrice.toFixed(2)}</td>
                            <td class="price">${item.totalLinePrice.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Totals -->
            <div class="totals">
                <div class="total-row">
                    <span>${getLabel('directCost')}</span>
                    <span>${totals.totalDirect.toFixed(2)} ر.س</span>
                </div>
                ${showProfitDetails ? `
                <div class="total-row">
                    <span>${getLabel('overhead')} (10%)</span>
                    <span>${totals.totalOverhead.toFixed(2)} ر.س</span>
                </div>
                <div class="total-row">
                    <span>${getLabel('profit')} (15%)</span>
                    <span>${totals.totalProfit.toFixed(2)} ر.س</span>
                </div>
                ` : ''}
                <div class="total-row final-total">
                    <span>${getLabel('finalTotal')}</span>
                    <span>${totals.finalPrice.toFixed(2)} ر.س</span>
                </div>
            </div>
            
            <!-- Amount in Words -->
            <div class="amount-words">
                <label>${getLabel('amountInWords')}:</label><br>
                <span>${language === 'ar' ? numberToArabicWords(totals.finalPrice) : formatCurrency(totals.finalPrice, language)}</span>
            </div>
            
            <!-- Signatures -->
            <div class="signatures">
                <div class="signature">
                    <div class="signature-label">${getLabel('preparedBy')}</div>
                    <div class="signature-line">${companyData.name}</div>
                </div>
                <div class="signature">
                    <div class="signature-label">${getLabel('clientSignature')}</div>
                    <div class="signature-line">________________</div>
                </div>
            </div>
        </body>
        </html>
        `;

        // فتح نافذة جديدة للطباعة
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    const handleExportExcel = () => {
        // إنشاء وصف تفصيلي لكل بند
        const generateItemDescription = (item: CalculatedItem) => {
            const specs: string[] = [];
            if (item.activeParams?.excavationDepth) specs.push(`عمق الحفر: ${item.activeParams.excavationDepth} م`);
            if (item.activeParams?.subsidenceRatio) specs.push(`نسبة الهبوط: ${Math.round(item.activeParams.subsidenceRatio * 100)}%`);
            if (item.activeParams?.backfillDensity) specs.push(`كثافة الردم: ${item.activeParams.backfillDensity} كجم/م³`);
            if (item.activeParams?.compactionLayers) specs.push(`طبقات الدمك: ${item.activeParams.compactionLayers}`);
            if (item.activeParams?.thickness) specs.push(`السماكة: ${item.activeParams.thickness} سم`);
            if (item.activeParams?.steelRatio) specs.push(`نسبة الحديد: ${item.activeParams.steelRatio} كجم/م³`);
            if (item.activeParams?.depth) specs.push(`العمق: ${item.activeParams.depth} م`);
            if (item.activeParams?.cementContent) specs.push(`محتوى الأسمنت: ${item.activeParams.cementContent} كيس/م³`);
            if (item.category === 'site') specs.push('التطبيق ضمن حدود الموقع');
            if (item.category === 'structure') specs.push('وفق كود البناء السعودي');
            return specs.length > 0 ? specs.join(' | ') : '-';
        };

        // بناء جدول HTML
        let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8"></head>
        <body dir="rtl">
        <table border="1" style="border-collapse: collapse;">
            <tr><td colspan="10" style="font-weight:bold; background:#1e40af; color:white; font-size:16px; text-align:center;">عرض سعر - ${quoteNumber}</td></tr>
            <tr><td colspan="10"></td></tr>
            <tr><td style="font-weight:bold;">معلومات المشروع</td><td colspan="9"></td></tr>
            <tr><td>نوع المشروع</td><td>${projectTypeLabels[state.projectType]?.[language] || state.projectType}</td><td colspan="8"></td></tr>
            <tr><td>مساحة الأرض</td><td>${plotArea} م²</td><td colspan="8"></td></tr>
            <tr><td>مساحة البناء</td><td>${totalBuildArea} م²</td><td colspan="8"></td></tr>
            <tr><td>عدد الطوابق</td><td>${state.blueprint.floors.length}</td><td colspan="8"></td></tr>
            <tr><td>التاريخ</td><td>${formatDate(today)}</td><td colspan="8"></td></tr>
            <tr><td colspan="10"></td></tr>
            <tr style="background:#1e40af; color:white; font-weight:bold;">
                <td>م</td>
                <td>البند</td>
                <td>الوصف التفصيلي</td>
                <td>التصنيف</td>
                <td>كود SBC</td>
                <td>المورد</td>
                <td>الوحدة</td>
                <td>الكمية</td>
                <td>سعر الوحدة</td>
                <td>الإجمالي</td>
            </tr>`;

        // إضافة البنود
        activeItems.forEach((item, index) => {
            const categoryLabel = categoryLabels[item.category]?.[language] || item.category;
            const supplierName = item.selectedSupplier?.name?.[language] || '-';
            const specs = generateItemDescription(item);
            const bgColor = index % 2 === 0 ? '#ffffff' : '#f1f5f9';

            html += `
            <tr style="background:${bgColor};">
                <td>${index + 1}</td>
                <td>${item.displayName}</td>
                <td>${specs}</td>
                <td>${categoryLabel}</td>
                <td>${item.sbc || '-'}</td>
                <td>${supplierName}</td>
                <td>${item.unit}</td>
                <td>${item.qty.toFixed(2)}</td>
                <td>${item.finalUnitPrice.toFixed(2)}</td>
                <td>${item.totalLinePrice.toFixed(2)}</td>
            </tr>`;
        });

        // إضافة الإجماليات
        html += `
            <tr><td colspan="10"></td></tr>
            <tr><td colspan="8"></td><td style="font-weight:bold;">التكلفة المباشرة</td><td style="font-weight:bold;">${totals.totalDirect.toFixed(2)}</td></tr>
            <tr><td colspan="8"></td><td>المصاريف الإدارية (10%)</td><td>${totals.totalOverhead.toFixed(2)}</td></tr>
            <tr><td colspan="8"></td><td>الربح (15%)</td><td>${totals.totalProfit.toFixed(2)}</td></tr>
            <tr style="background:#059669; color:white;"><td colspan="8"></td><td style="font-weight:bold;">الإجمالي النهائي</td><td style="font-weight:bold; font-size:14px;">${totals.finalPrice.toFixed(2)}</td></tr>
        </table>
        </body>
        </html>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `عرض_سعر_${quoteNumber}.xls`;
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
                        {/* Print PDF - Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPrintMenu(!showPrintMenu)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                            >
                                <Printer className="w-4 h-4" />
                                {getLabel('print')}
                            </button>
                            {showPrintMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                                    <button
                                        onClick={() => { handlePrint('arba'); setShowPrintMenu(false); }}
                                        className="w-full text-right px-4 py-3 hover:bg-slate-100 flex items-center gap-2 border-b border-slate-100"
                                    >
                                        <Building2 className="w-4 h-4 text-emerald-500" />
                                        {getLabel('printArba')}
                                    </button>
                                    <button
                                        onClick={() => { handlePrint('company'); setShowPrintMenu(false); }}
                                        className="w-full text-right px-4 py-3 hover:bg-slate-100 flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        {getLabel('printCompany')}
                                    </button>
                                </div>
                            )}
                        </div>
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
                <div ref={printRef} className="p-8 print:p-4 print-content" dir={isRtl ? 'rtl' : 'ltr'}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8 pb-6 border-b-4 border-emerald-500">
                        {showCompanyInfo && (
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-800">{COMPANY_INFO.systemName[language]}</h1>
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
                                <div className="font-bold">{showCompanyInfo ? COMPANY_INFO.systemName[language] : '________________'}</div>
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
                    /* إخفاء Modal overlay والأزرار */
                    .fixed.inset-0.bg-black\\/50 {
                        background: white !important;
                        position: static !important;
                        padding: 0 !important;
                    }
                    
                    /* إخفاء Toolbar */
                    .sticky.top-0.bg-white.border-b {
                        display: none !important;
                    }
                    
                    /* إزالة max-height وoverflow من الحاوية */
                    .bg-white.rounded-2xl.shadow-2xl {
                        max-height: none !important;
                        overflow: visible !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                    
                    /* إخفاء العناصر غير المطلوبة */
                    .print\\:hidden,
                    button {
                        display: none !important;
                    }
                    
                    /* إظهار العناصر المخفية في الطباعة */
                    .hidden.print\\:block {
                        display: block !important;
                    }
                    
                    /* تنسيق المحتوى */
                    .print-content {
                        padding: 10mm !important;
                    }
                    
                    /* حجم الصفحة */
                    @page {
                        size: A4;
                        margin: 5mm;
                    }
                    
                    /* تنسيق الجداول */
                    table {
                        page-break-inside: auto;
                        font-size: 10pt;
                    }
                    tr {
                        page-break-inside: avoid;
                    }
                    thead {
                        display: table-header-group;
                    }
                }
            `}</style>
        </div>
    );
};

export default PriceQuote;
