/**
 * QSSmartImporter — مستورد ذكي لملفات Excel/CSV
 * Smart Importer with drag-drop, column mapping, preview — Upload ONLY (no download)
 * Zero-Leak: No export button at all
 */
import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, Check, AlertCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BaseItem } from '../types';

interface QSSmartImporterProps {
    language: 'ar' | 'en';
    onImport: (items: Partial<BaseItem>[]) => void;
    onClose: () => void;
    onActionLog?: (action: string, target: string, metadata?: any) => void;
}

interface ColumnMapping {
    sourceColumn: string;
    targetField: string;
}

const SYSTEM_FIELDS: { key: string; label: { ar: string; en: string }; required: boolean }[] = [
    { key: 'name_ar', label: { ar: 'الاسم (عربي)', en: 'Name (Arabic)' }, required: true },
    { key: 'name_en', label: { ar: 'الاسم (إنجليزي)', en: 'Name (English)' }, required: false },
    { key: 'unit', label: { ar: 'الوحدة', en: 'Unit' }, required: true },
    { key: 'qty', label: { ar: 'الكمية', en: 'Quantity' }, required: true },
    { key: 'baseMaterial', label: { ar: 'سعر المواد', en: 'Material Price' }, required: true },
    { key: 'baseLabor', label: { ar: 'سعر العمالة', en: 'Labor Price' }, required: false },
    { key: 'waste', label: { ar: 'نسبة الهالك %', en: 'Waste %' }, required: false },
    { key: 'category', label: { ar: 'التصنيف', en: 'Category' }, required: false },
    { key: 'sbc', label: { ar: 'SBC', en: 'SBC' }, required: false },
];

const QSSmartImporter: React.FC<QSSmartImporterProps> = ({ language, onImport, onClose, onActionLog }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    // Steps: 1=upload, 2=mapping, 3=preview, 4=done
    const [step, setStep] = useState(1);
    const [fileName, setFileName] = useState('');
    const [rawData, setRawData] = useState<any[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mappings, setMappings] = useState<ColumnMapping[]>([]);
    const [parsedItems, setParsedItems] = useState<Partial<BaseItem>[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Read file using xlsx
    const processFile = useCallback((file: File) => {
        setFileName(file.name);
        onActionLog?.('import_data', `file:${file.name}`, { size: file.size, type: file.type });

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

                if (jsonData.length < 2) {
                    setErrors([t('الملف لا يحتوي على بيانات كافية', 'File does not have enough data')]);
                    return;
                }

                const fileHeaders = (jsonData[0] as string[]).map(h => String(h || '').trim());
                const rows = jsonData.slice(1).filter((row: any[]) => row.some(cell => cell != null && cell !== ''));

                setHeaders(fileHeaders);
                setRawData(rows);

                // Auto-map columns by name similarity
                const autoMappings: ColumnMapping[] = fileHeaders.map(header => {
                    const headerLower = header.toLowerCase();
                    let matched = '';
                    if (headerLower.includes('اسم') || headerLower.includes('name') || headerLower.includes('بند')) matched = 'name_ar';
                    else if (headerLower.includes('english') || headerLower.includes('en name')) matched = 'name_en';
                    else if (headerLower.includes('وحدة') || headerLower.includes('unit')) matched = 'unit';
                    else if (headerLower.includes('كمية') || headerLower.includes('qty') || headerLower.includes('quantity')) matched = 'qty';
                    else if (headerLower.includes('مواد') || headerLower.includes('material') || headerLower.includes('سعر')) matched = 'baseMaterial';
                    else if (headerLower.includes('عمالة') || headerLower.includes('labor')) matched = 'baseLabor';
                    else if (headerLower.includes('هالك') || headerLower.includes('waste')) matched = 'waste';
                    else if (headerLower.includes('تصنيف') || headerLower.includes('category') || headerLower.includes('فئة')) matched = 'category';
                    else if (headerLower.includes('sbc')) matched = 'sbc';
                    return { sourceColumn: header, targetField: matched };
                });

                setMappings(autoMappings);
                setStep(2);
            } catch (err) {
                setErrors([t('خطأ في قراءة الملف', 'Error reading file')]);
            }
        };
        reader.readAsArrayBuffer(file);
    }, [onActionLog, t]);

    // Drag & Drop handlers
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    // Handle mapping change
    const updateMapping = (sourceCol: string, targetField: string) => {
        setMappings(prev => prev.map(m =>
            m.sourceColumn === sourceCol ? { ...m, targetField } : m
        ));
    };

    // Parse data based on mappings
    const parseData = () => {
        const items: Partial<BaseItem>[] = [];
        const parseErrors: string[] = [];

        rawData.forEach((row, rowIdx) => {
            const item: any = {
                id: `imported_${Date.now()}_${rowIdx}`,
                isCustom: true,
                type: 'all' as any,
                soilFactor: false,
                suppliers: [],
            };
            const nameObj: { ar: string; en: string } = { ar: '', en: '' };

            mappings.forEach(mapping => {
                if (!mapping.targetField) return;
                const colIdx = headers.indexOf(mapping.sourceColumn);
                if (colIdx === -1) return;
                const cellValue = row[colIdx];
                if (cellValue == null) return;

                switch (mapping.targetField) {
                    case 'name_ar': nameObj.ar = String(cellValue).trim(); break;
                    case 'name_en': nameObj.en = String(cellValue).trim(); break;
                    case 'unit': item.unit = String(cellValue).trim(); break;
                    case 'qty': item.qty = parseFloat(cellValue) || 0; break;
                    case 'baseMaterial': item.baseMaterial = parseFloat(cellValue) || 0; break;
                    case 'baseLabor': item.baseLabor = parseFloat(cellValue) || 0; break;
                    case 'waste': {
                        const w = parseFloat(cellValue) || 0;
                        item.waste = w > 1 ? w / 100 : w; // Convert % to decimal
                        break;
                    }
                    case 'category': item.category = String(cellValue).trim().toLowerCase(); break;
                    case 'sbc': item.sbc = String(cellValue).trim(); break;
                }
            });

            item.name = nameObj;
            if (!nameObj.ar && !nameObj.en) {
                parseErrors.push(`${t('صف', 'Row')} ${rowIdx + 2}: ${t('الاسم مطلوب', 'Name is required')}`);
                return;
            }
            if (!nameObj.ar && nameObj.en) nameObj.ar = nameObj.en;
            if (!nameObj.en && nameObj.ar) nameObj.en = nameObj.ar;
            if (!item.unit) item.unit = 'm²';
            if (!item.qty) item.qty = 1;
            if (!item.baseMaterial) item.baseMaterial = 0;
            if (!item.baseLabor) item.baseLabor = 0;
            if (!item.waste) item.waste = 0;
            if (!item.category) item.category = 'custom';
            if (!item.sbc) item.sbc = 'N/A';

            items.push(item as Partial<BaseItem>);
        });

        setParsedItems(items);
        setErrors(parseErrors);
        setStep(3);
    };

    // Final import
    const handleImport = () => {
        onImport(parsedItems);
        onActionLog?.('import_data', 'confirm_import', { count: parsedItems.length, fileName });
        setStep(4);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="w-full max-w-3xl bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <FileSpreadsheet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{t('استيراد بيانات', 'Import Data')}</h2>
                            <p className="text-xs text-slate-400">{t('رفع ملف Excel أو CSV', 'Upload Excel or CSV file')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Steps Indicator */}
                <div className="px-6 py-3 border-b border-slate-700/30 flex items-center gap-2">
                    {[
                        { num: 1, label: t('رفع الملف', 'Upload') },
                        { num: 2, label: t('مطابقة الأعمدة', 'Map Columns') },
                        { num: 3, label: t('معاينة', 'Preview') },
                        { num: 4, label: t('تم', 'Done') },
                    ].map((s, i) => (
                        <React.Fragment key={s.num}>
                            <div className={`flex items-center gap-2 ${step >= s.num ? 'text-cyan-400' : 'text-slate-600'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${step >= s.num ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'border-slate-700 text-slate-600'}`}>
                                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                                </div>
                                <span className="text-xs hidden md:inline">{s.label}</span>
                            </div>
                            {i < 3 && <ArrowRight className={`w-4 h-4 ${step > s.num ? 'text-cyan-500' : 'text-slate-700'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <div
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${isDragging
                                ? 'border-cyan-400 bg-cyan-500/10'
                                : 'border-slate-700 hover:border-slate-500'
                                }`}
                        >
                            <Upload className={`w-14 h-14 mx-auto mb-4 ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`} />
                            <p className="text-lg font-semibold text-white mb-2">{t('اسحب وأفلت الملف هنا', 'Drag and drop file here')}</p>
                            <p className="text-sm text-slate-400 mb-4">{t('أو اختر ملف من جهازك', 'Or choose a file from your device')}</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition"
                            >
                                {t('اختر ملف', 'Choose File')}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
                            />
                            <p className="text-xs text-slate-600 mt-4">{t('يدعم: .xlsx, .xls, .csv', 'Supported: .xlsx, .xls, .csv')}</p>
                        </div>
                    )}

                    {/* Step 2: Column Mapping */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-400 mb-4">
                                {t(`تم قراءة ${rawData.length} صف من "${fileName}". قم بمطابقة الأعمدة:`,
                                    `Read ${rawData.length} rows from "${fileName}". Map the columns:`)}
                            </p>
                            <div className="space-y-3">
                                {mappings.map(mapping => (
                                    <div key={mapping.sourceColumn} className="flex items-center gap-4 bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                                        <div className="flex-1">
                                            <span className="text-sm text-white font-medium">{mapping.sourceColumn}</span>
                                            <span className="text-xs text-slate-500 mr-2"> ({t('عمود الملف', 'File column')})</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-600" />
                                        <select
                                            value={mapping.targetField}
                                            onChange={e => updateMapping(mapping.sourceColumn, e.target.value)}
                                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                                        >
                                            <option value="">{t('— تخطي —', '— Skip —')}</option>
                                            {SYSTEM_FIELDS.map(f => (
                                                <option key={f.key} value={f.key}>
                                                    {f.label[language]} {f.required ? '*' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-2 bg-green-500/15 text-green-400 px-3 py-1.5 rounded-lg text-sm border border-green-500/30">
                                    <Check className="w-4 h-4" /> {parsedItems.length} {t('بند جاهز', 'items ready')}
                                </div>
                                {errors.length > 0 && (
                                    <div className="flex items-center gap-2 bg-red-500/15 text-red-400 px-3 py-1.5 rounded-lg text-sm border border-red-500/30">
                                        <AlertCircle className="w-4 h-4" /> {errors.length} {t('خطأ', 'errors')}
                                    </div>
                                )}
                            </div>

                            {/* Errors */}
                            {errors.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 max-h-24 overflow-y-auto">
                                    {errors.map((err, i) => (
                                        <p key={i} className="text-xs text-red-400">{err}</p>
                                    ))}
                                </div>
                            )}

                            {/* Preview Table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-700/50">
                                        <tr>
                                            <th className="px-3 py-2 text-right text-slate-300">#</th>
                                            <th className="px-3 py-2 text-right text-slate-300">{t('الاسم', 'Name')}</th>
                                            <th className="px-3 py-2 text-center text-slate-300">{t('الوحدة', 'Unit')}</th>
                                            <th className="px-3 py-2 text-center text-slate-300">{t('الكمية', 'Qty')}</th>
                                            <th className="px-3 py-2 text-center text-slate-300">{t('مواد', 'Material')}</th>
                                            <th className="px-3 py-2 text-center text-slate-300">{t('عمالة', 'Labor')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {parsedItems.slice(0, 20).map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-700/20">
                                                <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                                                <td className="px-3 py-2 text-white">{item.name?.ar || item.name?.en}</td>
                                                <td className="px-3 py-2 text-center text-slate-300">{item.unit}</td>
                                                <td className="px-3 py-2 text-center text-white">{item.qty}</td>
                                                <td className="px-3 py-2 text-center text-cyan-400">{item.baseMaterial?.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-center text-green-400">{item.baseLabor?.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {parsedItems.length > 20 && (
                                    <p className="text-center text-xs text-slate-500 py-2">
                                        {t(`+ ${parsedItems.length - 20} بند آخر`, `+ ${parsedItems.length - 20} more items`)}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Done */}
                    {step === 4 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('تم الاستيراد بنجاح!', 'Import Successful!')}</h3>
                            <p className="text-slate-400">{t(`تم استيراد ${parsedItems.length} بند`, `${parsedItems.length} items imported`)}</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
                    <button
                        onClick={() => step > 1 && step < 4 ? setStep(step - 1) : onClose()}
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition text-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {step === 1 || step === 4 ? t('إغلاق', 'Close') : t('رجوع', 'Back')}
                    </button>

                    {step === 2 && (
                        <button
                            onClick={parseData}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition text-sm"
                        >
                            {t('معاينة البيانات', 'Preview Data')}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}

                    {step === 3 && (
                        <button
                            onClick={handleImport}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/20 transition text-sm"
                        >
                            {t(`استيراد ${parsedItems.length} بند`, `Import ${parsedItems.length} Items`)}
                            <Check className="w-4 h-4" />
                        </button>
                    )}

                    {step === 4 && (
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition text-sm"
                        >
                            {t('إغلاق', 'Close')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QSSmartImporter;
