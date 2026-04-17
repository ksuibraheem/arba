import { Language } from '../types';
/**
 * Arba Universal Intelligence Parser — UI Component
 * مكون المحلل الذكي الموحد
 * 
 * 6-Step Premium Wizard:
 * 1. Upload (drag-drop: xlsx/csv/pdf)
 * 2. Pre-Flight Security Alert 🛡️
 * 3. Sanitization Report (The Purge preview)
 * 4. Smart Column Mapping (drag-drop style)
 * 5. Arba-Branded Preview
 * 6. Confirmation
 * 
 * All heavy processing happens on Cloud Functions.
 * This component only handles UI and API calls.
 */
import React, { useState, useRef, useCallback } from 'react';
import {
    Upload, FileSpreadsheet, FileText, X, Check, AlertCircle, ArrowRight,
    ChevronLeft, ChevronRight, Shield, ShieldAlert, ShieldCheck, Trash2,
    Eye, RefreshCw, Loader2, Zap, CheckCircle2, AlertTriangle, Info,
    Columns, FileWarning, BadgeCheck
} from 'lucide-react';
import {
    uploadAndScan,
    confirmAndProcess,
    autoProcess,
    ScanResult,
    ProcessResult,
    DetectedCompany,
    TargetFieldInfo,
    OcrDetectionResult,
    AutoProcessResult,
    PipelineStage,
} from '../services/universalImporterApi';

// =================== Props ===================

interface UniversalImporterProps {
    language: Language;
    onImport: (items: any[]) => void;
    onClose: () => void;
    onActionLog?: (action: string, target: string, metadata?: any) => void;
    overheadConfig?: {
        overheadMultiplier?: number;
        profitMargin?: number;
        contingency?: number;
    };
}

// =================== Step Config ===================

const STEPS = [
    { num: 1, key: 'upload', iconAr: '📁', iconEn: '📁' },
    { num: 2, key: 'security', iconAr: '🛡️', iconEn: '🛡️' },
    { num: 3, key: 'sanitize', iconAr: '🧹', iconEn: '🧹' },
    { num: 4, key: 'mapping', iconAr: '🔗', iconEn: '🔗' },
    { num: 5, key: 'preview', iconAr: '👁️', iconEn: '👁️' },
    { num: 6, key: 'done', iconAr: '✅', iconEn: '✅' },
];

// =================== Component ===================

const UniversalImporter: React.FC<UniversalImporterProps> = ({
    language, onImport, onClose, onActionLog, overheadConfig
}) => {
    const t = (ar: string, en: string) => { const m: Record<string, string> = { ar, en, fr: en, zh: en }; return m[language] || en; };
    const isRtl = language === 'ar';

    // ===== State =====
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scan state
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [purgeConfirmed, setPurgeConfirmed] = useState(true);
    const [selectedSheet, setSelectedSheet] = useState(0);

    // Mapping state
    const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});

    // Result state
    const [processResult, setProcessResult] = useState<ProcessResult | null>(null);

    // ⚡ Auto-Process state
    const [autoMode, setAutoMode] = useState(false);
    const [autoResult, setAutoResult] = useState<AutoProcessResult | null>(null);
    const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);

    // ===== Step Labels =====
    const stepLabels: Record<string, { ar: string; en: string }> = {
        upload: { ar: 'رفع الملف', en: 'Upload File' },
        security: { ar: 'فحص أمني', en: 'Security Scan' },
        sanitize: { ar: 'تقرير التطهير', en: 'Sanitization' },
        mapping: { ar: 'مطابقة الأعمدة', en: 'Map Columns' },
        preview: { ar: 'المعاينة', en: 'Preview' },
        done: { ar: 'تم', en: 'Done' },
    };

    // =================== Step 1: Upload ===================

    const handleFileUpload = useCallback(async (file: File) => {
        // Validate file type
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['xlsx', 'xls', 'csv', 'pdf'].includes(ext || '')) {
            setError(t('نوع الملف غير مدعوم', 'Unsupported file type'));
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError(t('حجم الملف يتجاوز 10 ميجابايت', 'File size exceeds 10MB'));
            return;
        }

        setLoading(true);
        setError(null);
        onActionLog?.('universal_import_upload', file.name, { size: file.size, type: file.type });

        try {
            const result = await uploadAndScan(file);
            setScanResult(result);
            setColumnMappings(result.autoMappings);

            // Skip to step 2 (security alert) or step 4 (mapping) if clean
            if (result.securityAlert.isClean) {
                setStep(4); // Skip security & sanitization steps
            } else {
                setStep(2); // Show Pre-Flight Security Alert
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || t('فشل في رفع الملف', 'Failed to upload file'));
        } finally {
            setLoading(false);
        }
    }, [onActionLog, t]);

    // ⚡ Auto-Process handler
    const handleAutoProcess = useCallback(async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['xlsx', 'xls', 'csv', 'pdf'].includes(ext || '')) {
            setError(t('نوع الملف غير مدعوم', 'Unsupported file type'));
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError(t('حجم الملف يتجاوز 10 ميجابايت', 'File size exceeds 10MB'));
            return;
        }

        setLoading(true);
        setError(null);
        setPipelineStages([]);

        try {
            onActionLog?.('auto_process_start', file.name, { size: file.size, autoMode: true });

            const result = await autoProcess(file, {
                overheadConfig,
                injectMarketRates: true,
                marketRegion: 'riyadh',
            });

            setAutoResult(result);
            setPipelineStages(result.pipeline);

            if (result.mode === 'auto_complete' && result.items) {
                setProcessResult({
                    success: true,
                    items: result.items as any,
                    totalItems: result.itemCount || result.items.length,
                    totalValue: result.totalValue || 0,
                    sanitizationSummary: result.sanitizationSummary || { purgeApplied: false, itemsRemoved: 0, removedSamples: [] },
                    branding: { stamp: 'Arba Pricing', whiteLabelApplied: true },
                });
                setStep(6);
            } else if (result.mode === 'paused_for_review') {
                if (result.columnMapping) {
                    setScanResult({
                        scanId: result.sessionId || '',
                        fileName: file.name,
                        fileType: 'excel',
                        sheetNames: [],
                        rowCounts: [],
                        headers: result.columnMapping.headers,
                        columnTypes: {},
                        autoMappings: result.columnMapping.mappings,
                        targetFields: result.columnMapping.targetFields as any,
                        securityAlert: {
                            isClean: false,
                            totalMatches: result.securityReport.totalMatches,
                            criticalCount: result.securityReport.criticalCount,
                            warningCount: result.securityReport.warningCount,
                            infoCount: 0,
                            detectedCompanies: result.securityReport.detectedCompanies as any,
                            metadataFlags: [],
                            securityAlertLevel: result.securityReport.alertLevel,
                        },
                        fileMetadata: {},
                    } as any);
                }
                setStep(2);
            }

            onActionLog?.('auto_process_complete', file.name, {
                mode: result.mode,
                alertLevel: result.securityReport.alertLevel,
                durationMs: result.totalDurationMs,
            });
        } catch (err: any) {
            setError(err.message || t('فشل في المعالجة التلقائية', 'Auto-processing failed'));
        } finally {
            setLoading(false);
        }
    }, [language, overheadConfig, onActionLog]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            if (autoMode) {
                handleAutoProcess(file);
            } else {
                handleFileUpload(file);
            }
        }
    }, [handleFileUpload, handleAutoProcess, autoMode]);

    // =================== Step 4: Mapping Change ===================

    const updateMapping = (sourceCol: string, targetField: string) => {
        setColumnMappings(prev => ({
            ...prev,
            [sourceCol]: targetField,
        }));
    };

    // =================== Step 5: Process & Preview ===================

    const handleProcess = async () => {
        if (!scanResult) return;

        setLoading(true);
        setError(null);

        try {
            const result = await confirmAndProcess(
                scanResult.scanId,
                columnMappings,
                purgeConfirmed,
                selectedSheet,
                overheadConfig
            );
            setProcessResult(result);
            setStep(5);
        } catch (err: any) {
            console.error('Process error:', err);
            setError(err.message || t('فشل في معالجة البيانات', 'Failed to process data'));
        } finally {
            setLoading(false);
        }
    };

    // =================== Step 6: Confirm Import ===================

    const handleFinalImport = () => {
        if (!processResult) return;
        onImport(processResult.items);
        onActionLog?.('universal_import_confirm', processResult.importId, {
            count: processResult.itemCount,
            totalValue: processResult.totalValue,
        });
        setStep(6);
    };

    // =================== Render Functions ===================

    const renderSeverityBadge = (severity: 'critical' | 'warning' | 'info') => {
        const config = {
            critical: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', label: t('حرج', 'Critical') },
            warning: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', label: t('تحذير', 'Warning') },
            info: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', label: t('معلومة', 'Info') },
        }[severity];

        return (
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${config.bg} ${config.border} ${config.text} uppercase`}>
                {config.label}
            </span>
        );
    };

    const getFileIcon = () => {
        if (!scanResult) return <Upload className="w-6 h-6" />;
        return scanResult.fileType === 'pdf'
            ? <FileText className="w-6 h-6 text-red-400" />
            : <FileSpreadsheet className="w-6 h-6 text-green-400" />;
    };

    // =================== Main Render ===================

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
            <div
                className="w-full max-w-4xl bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl shadow-black/50 max-h-[92vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
                dir={isRtl ? 'rtl' : 'ltr'}
            >
                {/* ===== Header ===== */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                {t('محلل Arba الذكي', 'Arba Intelligence Parser')}
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full">
                                    UNIVERSAL
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                                    🛡️ SECURITY SHIELD
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                {t('تحليل وتطهير آمن لملفات Excel و CSV و PDF', 'Secure parsing & sanitization for Excel, CSV & PDF')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded-xl transition-all duration-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ===== Step Indicator ===== */}
                <div className="px-6 py-3 border-b border-slate-700/30 bg-slate-800/40">
                    <div className="flex items-center gap-1 justify-between">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s.num}>
                                <div className={`flex items-center gap-1.5 transition-all duration-300 ${step >= s.num ? 'opacity-100' : 'opacity-40'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${step > s.num
                                        ? 'bg-green-500/20 border-green-500 text-green-400 shadow-md shadow-green-500/10'
                                        : step === s.num
                                            ? 'bg-violet-500/20 border-violet-500 text-violet-300 shadow-md shadow-violet-500/20 animate-pulse'
                                            : 'border-slate-700 text-slate-600'
                                        }`}>
                                        {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                                    </div>
                                    <span className="text-[11px] hidden lg:inline font-medium">
                                        {stepLabels[s.key]?.[language]}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-500 ${step > s.num ? 'bg-green-500/50' : 'bg-slate-700/50'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* ===== Content ===== */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                    {/* Error Display */}
                    {error && (
                        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-in slide-in-from-top">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-500/20 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Loading Overlay with Pipeline Progress */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {autoMode ? <Zap className="w-6 h-6 text-amber-400" /> : <Shield className="w-6 h-6 text-violet-400" />}
                                </div>
                            </div>
                            <p className="text-slate-300 font-medium animate-pulse">
                                {autoMode
                                    ? t('⚡ معالجة تلقائية عبر API Gateway...', '⚡ Auto-processing via API Gateway...')
                                    : step === 1
                                        ? t('جاري التحليل والفحص الأمني...', 'Parsing & security scanning...')
                                        : t('جاري المعالجة والتطهير...', 'Processing & sanitizing...')
                                }
                            </p>
                            {autoMode && pipelineStages.length === 0 && (
                                <div className="w-full max-w-md space-y-2 mt-2">
                                    {['parse', 'scan', 'ocr', 'purge', 'map', 'calculate', 'save'].map((stage, i) => (
                                        <div key={stage} className="flex items-center gap-2 text-xs">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${i === 0 ? 'bg-violet-500/30 border border-violet-500/50' : 'bg-slate-700/50 border border-slate-600/30'
                                                }`}>
                                                {i === 0 ? <Loader2 className="w-3 h-3 text-violet-400 animate-spin" /> : <span className="text-slate-500">{i + 1}</span>}
                                            </div>
                                            <span className={i === 0 ? 'text-violet-300 font-medium' : 'text-slate-500'}>
                                                {stage === 'parse' ? t('تحليل الملف', 'Parse File') :
                                                    stage === 'scan' ? t('فحص أمني', 'Security Scan') :
                                                        stage === 'ocr' ? t('فحص بصري OCR', 'OCR Visual Scan') :
                                                            stage === 'purge' ? t('تطهير', 'Purge') :
                                                                stage === 'map' ? t('مطابقة الأعمدة', 'Map Columns') :
                                                                    stage === 'calculate' ? t('حساب التكاليف', 'Calculate') :
                                                                        t('حفظ النتائج', 'Save Results')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-slate-500">
                                {t('المعالجة تتم على السيرفر الآمن', 'Processing on secure backend')}
                            </p>
                        </div>
                    )}

                    {/* ========== STEP 1: Upload ========== */}
                    {step === 1 && !loading && (
                        <div>
                            {/* ⚡ Auto-Process Toggle */}
                            <div className="mb-4 flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${autoMode ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-slate-700/50 border border-slate-600/30'
                                        }`}>
                                        <Zap className={`w-5 h-5 transition-colors ${autoMode ? 'text-amber-400' : 'text-slate-500'}`} />
                                    </div>
                                    <div>
                                        <span className={`text-sm font-semibold transition-colors ${autoMode ? 'text-amber-300' : 'text-slate-300'}`}>
                                            {t('⚡ معالجة تلقائية', '⚡ Auto-Process')}
                                        </span>
                                        <p className="text-[10px] text-slate-500">
                                            {t('يشغل البايبلاين الكامل تلقائياً', 'Triggers full pipeline automatically')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setAutoMode(!autoMode)}
                                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${autoMode ? 'bg-amber-500' : 'bg-slate-600'}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${autoMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {autoMode && (
                                <div className="mb-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                                        <span className="text-amber-300 font-medium">{t('وضع البايبلاين التلقائي', 'Auto Pipeline Mode')}</span>
                                    </div>
                                    <p className="text-[10px] text-amber-400/60 mt-1">
                                        {t(
                                            'Parse → Scan → OCR → Purge → Map → Calculate → Save — الكل تلقائي. BLOCKED يتوقف للمراجعة.',
                                            'Parse → Scan → OCR → Purge → Map → Calculate → Save — All automatic. BLOCKED pauses for review.'
                                        )}
                                    </p>
                                </div>
                            )}

                            <div
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${isDragging
                                    ? autoMode ? 'border-amber-400 bg-amber-500/10 scale-[1.02]' : 'border-violet-400 bg-violet-500/10 scale-[1.02]'
                                    : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
                                    }`}
                            >
                                <div className="flex justify-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center transition-transform duration-300 ${isDragging ? 'scale-110 -rotate-6' : ''}`}>
                                        <FileSpreadsheet className="w-7 h-7 text-green-400" />
                                    </div>
                                    <div className={`w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center transition-transform duration-300 ${isDragging ? 'scale-110 rotate-6' : ''}`}>
                                        <FileText className="w-7 h-7 text-red-400" />
                                    </div>
                                </div>
                                <p className="text-lg font-semibold text-white mb-2">
                                    {autoMode
                                        ? t('⚡ اسحب الملف للمعالجة التلقائية', '⚡ Drop file for auto-processing')
                                        : t('اسحب وأفلت الملف هنا', 'Drag and drop your file here')
                                    }
                                </p>
                                <p className="text-sm text-slate-400 mb-6">
                                    {t('أو اختر ملف من جهازك للتحليل الآمن', 'Or choose a file for secure backend processing')}
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`px-8 py-3 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 ${autoMode
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-amber-500/20'
                                        : 'bg-gradient-to-r from-violet-500 to-indigo-600 hover:shadow-violet-500/20'
                                        }`}
                                >
                                    {autoMode ? t('⚡ اختر ملف للمعالجة', '⚡ Choose File to Process') : t('اختر ملف', 'Choose File')}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv,.pdf"
                                    className="hidden"
                                    onChange={e => {
                                        if (e.target.files?.[0]) {
                                            if (autoMode) {
                                                handleAutoProcess(e.target.files[0]);
                                            } else {
                                                handleFileUpload(e.target.files[0]);
                                            }
                                        }
                                    }}
                                />
                                <div className="flex items-center justify-center gap-3 mt-6">
                                    <span className="px-3 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">.xlsx</span>
                                    <span className="px-3 py-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">.csv</span>
                                    <span className="px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">.pdf</span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-4 flex items-center justify-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    {t('الملف يُعالج على السيرفر الآمن فقط — لا يُحفظ محلياً', 'File processed on secure server only — never stored locally')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ========== STEP 2: Pre-Flight Security Alert ========== */}
                    {step === 2 && !loading && scanResult && (
                        <div className="space-y-4">
                            {/* Security Alert Level Banner */}
                            {scanResult.securityAlert.securityAlertLevel === 'BLOCKED' ? (
                                <div className="relative overflow-hidden flex items-center gap-3 p-4 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-500/20 via-red-500/10 to-red-500/20">
                                    <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                                    <div className="relative flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/20 border-2 border-red-500/60 flex items-center justify-center animate-pulse">
                                            <ShieldAlert className="w-7 h-7 text-red-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white font-bold text-base">
                                                    {t('🚨 تم الحظر — بصمة شركة منافسة', '🚨 BLOCKED — Competitor Signature Detected')}
                                                </h3>
                                                <span className="px-2 py-0.5 text-[10px] font-black bg-red-500/30 text-red-300 border border-red-500/50 rounded-full uppercase tracking-wider animate-pulse">
                                                    BLOCKED
                                                </span>
                                            </div>
                                            <p className="text-sm text-red-200/80">
                                                {t(
                                                    `تم اكتشاف ${scanResult.securityAlert.criticalCount} بصمة حرجة — يجب التطهير قبل المتابعة`,
                                                    `${scanResult.securityAlert.criticalCount} critical signatures found — Purge required before proceeding`
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`flex items-center gap-3 p-4 rounded-xl border ${scanResult.securityAlert.securityAlertLevel === 'WARNING'
                                    ? 'bg-amber-500/10 border-amber-500/30'
                                    : 'bg-green-500/10 border-green-500/30'
                                    }`}>
                                    {scanResult.securityAlert.securityAlertLevel === 'WARNING'
                                        ? <ShieldAlert className="w-8 h-8 text-amber-400 flex-shrink-0" />
                                        : <ShieldCheck className="w-8 h-8 text-green-400 flex-shrink-0" />
                                    }
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-white font-bold text-base">
                                                {t('⚠️ تنبيه أمني — فحص ما قبل الاستيراد', '⚠️ Pre-Flight Security Alert')}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-full uppercase ${scanResult.securityAlert.securityAlertLevel === 'WARNING'
                                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                                : 'bg-green-500/20 text-green-300 border-green-500/40'
                                                }`}>
                                                {scanResult.securityAlert.securityAlertLevel}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300">
                                            {t(
                                                `تم اكتشاف ${scanResult.securityAlert.totalMatches} بصمة لشركات في الملف`,
                                                `Detected ${scanResult.securityAlert.totalMatches} competitor fingerprints in file`
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-red-400">{scanResult.securityAlert.criticalCount}</div>
                                    <div className="text-xs text-red-400/70">{t('حرج', 'Critical')}</div>
                                </div>
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-amber-400">{scanResult.securityAlert.warningCount}</div>
                                    <div className="text-xs text-amber-400/70">{t('تحذير', 'Warning')}</div>
                                </div>
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-400">{scanResult.securityAlert.infoCount}</div>
                                    <div className="text-xs text-blue-400/70">{t('معلومة', 'Info')}</div>
                                </div>
                            </div>

                            {/* Detected Companies List */}
                            <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/50">
                                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-violet-400" />
                                        {t('البصمات المكتشفة', 'Detected Fingerprints')}
                                    </h4>
                                </div>
                                <div className="max-h-52 overflow-y-auto divide-y divide-slate-700/30">
                                    {scanResult.securityAlert.detectedCompanies.map((company: DetectedCompany, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/40 transition-colors">
                                            {company.severity === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" /> :
                                                company.severity === 'warning' ? <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" /> :
                                                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                            }
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-white font-medium">{company.name}</span>
                                                    {renderSeverityBadge(company.severity)}
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{company.location}</p>
                                            </div>
                                            <Trash2 className="w-4 h-4 text-slate-600" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* OCR Visual Branding Results */}
                            {scanResult.securityAlert.ocrResults && scanResult.securityAlert.ocrResults.hasVisualBranding && (
                                <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl overflow-hidden">
                                    <div className="px-4 py-2.5 bg-orange-500/10 border-b border-orange-500/20">
                                        <h5 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            {t('شعارات وعلامات مائية مكتشفة (OCR)', 'Detected Logos & Watermarks (OCR)')}
                                        </h5>
                                        <p className="text-[10px] text-orange-400/60 mt-0.5">
                                            {t(
                                                `تم فحص ${scanResult.securityAlert.ocrResults.scannedImages} من ${scanResult.securityAlert.ocrResults.totalImages} صورة`,
                                                `Scanned ${scanResult.securityAlert.ocrResults.scannedImages} of ${scanResult.securityAlert.ocrResults.totalImages} images`
                                            )}
                                        </p>
                                    </div>
                                    <div className="divide-y divide-orange-500/10">
                                        {scanResult.securityAlert.ocrResults.detections.map((det: OcrDetectionResult, i: number) => (
                                            <div key={i} className="flex items-center gap-3 px-4 py-2 hover:bg-orange-500/5 transition-colors">
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${det.type === 'logo' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                    det.type === 'watermark' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                    }`}>
                                                    {det.type === 'logo' ? '🖼️' : det.type === 'watermark' ? '💧' : '📝'}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-sm text-white font-medium">{det.matchedCompany}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {renderSeverityBadge(det.severity)}
                                                        <span className="text-[10px] text-slate-500">
                                                            {t(`ثقة: ${Math.round(det.confidence * 100)}%`, `Confidence: ${Math.round(det.confidence * 100)}%`)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Metadata Flags */}
                            {scanResult.securityAlert.metadataFlags.length > 0 && (
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                                    <h5 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1">
                                        <FileWarning className="w-3.5 h-3.5" />
                                        {t('بيانات وصفية مشبوهة', 'Suspicious Metadata')}
                                    </h5>
                                    {scanResult.securityAlert.metadataFlags.map((flag: string, i: number) => (
                                        <p key={i} className="text-xs text-amber-300/70 font-mono">{flag}</p>
                                    ))}
                                </div>
                            )}

                            {/* Purge & Re-brand Confirmation */}
                            <div className={`rounded-xl p-4 border transition-all duration-300 ${scanResult.securityAlert.securityAlertLevel === 'BLOCKED'
                                ? 'bg-red-500/5 border-red-500/30'
                                : 'bg-slate-800/60 border-slate-700/50'
                                }`}>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={purgeConfirmed}
                                            onChange={e => setPurgeConfirmed(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${purgeConfirmed
                                            ? scanResult.securityAlert.securityAlertLevel === 'BLOCKED'
                                                ? 'bg-red-500 border-red-500'
                                                : 'bg-violet-500 border-violet-500'
                                            : 'border-slate-600 group-hover:border-slate-500'
                                            }`}>
                                            {purgeConfirmed && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`text-sm font-medium ${scanResult.securityAlert.securityAlertLevel === 'BLOCKED' ? 'text-red-300' : 'text-white'
                                            }`}>
                                            {scanResult.securityAlert.securityAlertLevel === 'BLOCKED'
                                                ? t('✅ تأكيد: تطهير وإعادة تجهيز', '✅ Confirm: Purge & Re-brand')
                                                : t('تأكيد تنفيذ عملية التطهير التلقائي', 'Confirm automated purge & re-branding')
                                            }
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {t(
                                                'سيتم إزالة جميع أسماء الشركات والشعارات والعلامات التجارية المكتشفة واستبدالها بهوية Arba Pricing',
                                                'All detected company names, logos & trademarks will be stripped and replaced with Arba Pricing identity'
                                            )}
                                        </p>
                                        {scanResult.securityAlert.securityAlertLevel === 'BLOCKED' && !purgeConfirmed && (
                                            <p className="text-xs text-red-400 mt-1 font-medium animate-pulse">
                                                {t('⚠️ يجب تأكيد التطهير للمتابعة', '⚠️ Purge confirmation required to proceed')}
                                            </p>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* ========== STEP 3: Sanitization Report ========== */}
                    {step === 3 && !loading && scanResult && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                                <RefreshCw className="w-6 h-6 text-violet-400" />
                                <div>
                                    <h3 className="text-white font-bold">{t('تقرير التطهير — The Purge', 'Sanitization Report — The Purge')}</h3>
                                    <p className="text-xs text-slate-400">
                                        {purgeConfirmed
                                            ? t('سيتم تنفيذ عملية التطهير الآلي', 'Automated purge will be applied')
                                            : t('تم اختيار عدم التطهير — البيانات ستُستورد كما هي', 'Purge skipped — data will be imported as-is')
                                        }
                                    </p>
                                </div>
                            </div>

                            {purgeConfirmed && (
                                <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-white">{t('ما سيتم تنظيفه:', 'What will be cleaned:')}</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                            <span className="text-slate-300">{t('أسماء الشركات المنافسة', 'Competitor company names')}</span>
                                            <span className="ml-auto text-xs text-red-400">{scanResult?.securityAlert.totalMatches || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Trash2 className="w-4 h-4 text-amber-400" />
                                            <span className="text-slate-300">{t('البيانات الوصفية (المؤلف، الشركة)', 'File metadata (author, company)')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Trash2 className="w-4 h-4 text-amber-400" />
                                            <span className="text-slate-300">{t('رؤوس وتذييلات الملف', 'Headers & footers')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <BadgeCheck className="w-4 h-4 text-violet-400" />
                                            <span className="text-slate-300">{t('ختم Arba Pricing', 'Arba Pricing stamp')}</span>
                                            <span className="ml-auto text-xs text-violet-400">✓</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sheet Selection (if multi-sheet) */}
                            {scanResult && scanResult.sheetNames.length > 1 && (
                                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                                    <label className="text-sm text-white font-medium mb-2 block">
                                        {t('اختر الورقة:', 'Select sheet:')}
                                    </label>
                                    <select
                                        value={selectedSheet}
                                        onChange={e => setSelectedSheet(Number(e.target.value))}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                                    >
                                        {scanResult.sheetNames.map((name: string, idx: number) => (
                                            <option key={idx} value={idx}>
                                                {name} ({scanResult.rowCounts[idx]} {t('صف', 'rows')})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========== STEP 4: Column Mapping ========== */}
                    {step === 4 && !loading && scanResult && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Columns className="w-5 h-5 text-violet-400" />
                                <h3 className="text-white font-bold">{t('مطابقة الأعمدة الذكية', 'Smart Column Mapping')}</h3>
                            </div>
                            <p className="text-sm text-slate-400">
                                {t(
                                    `${scanResult.rowCounts[selectedSheet] || 0} صف جاهز. طابق أعمدة الملف مع حقول Arba:`,
                                    `${scanResult.rowCounts[selectedSheet] || 0} rows ready. Map file columns to Arba fields:`
                                )}
                            </p>

                            <div className="space-y-2.5">
                                {scanResult.headers.map((header: string) => (
                                    <div
                                        key={header}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${columnMappings[header]
                                            ? 'bg-violet-500/5 border-violet-500/30'
                                            : 'bg-slate-900/50 border-slate-700/50'
                                            }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm text-white font-medium truncate block">{header}</span>
                                            <span className="text-[10px] text-slate-500">
                                                {scanResult.columnTypes[header] || 'text'}
                                            </span>
                                        </div>
                                        <ArrowRight className={`w-4 h-4 flex-shrink-0 ${columnMappings[header] ? 'text-violet-400' : 'text-slate-600'
                                            }`} />
                                        <select
                                            value={columnMappings[header] || ''}
                                            onChange={e => updateMapping(header, e.target.value)}
                                            className={`flex-1 bg-slate-800 border rounded-lg px-3 py-2 text-sm transition-colors ${columnMappings[header]
                                                ? 'border-violet-500/50 text-white'
                                                : 'border-slate-700 text-slate-400'
                                                }`}
                                        >
                                            <option value="">{t('— تخطي —', '— Skip —')}</option>
                                            {scanResult.targetFields.map((f: TargetFieldInfo) => (
                                                <option key={f.key} value={f.key}>
                                                    {f.labels[language]} {f.required ? '*' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            {/* Required fields warning */}
                            {(() => {
                                const mappedFields = Object.values(columnMappings);
                                const missingRequired = scanResult.targetFields
                                    .filter((f: TargetFieldInfo) => f.required && !mappedFields.includes(f.key));

                                if (missingRequired.length > 0) {
                                    return (
                                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-amber-300 font-medium">
                                                    {t('حقول مطلوبة غير مطابقة:', 'Required fields not mapped:')}
                                                </p>
                                                <p className="text-xs text-amber-400/70 mt-1">
                                                    {missingRequired.map((f: TargetFieldInfo) => f.labels[language]).join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    )}

                    {/* ========== STEP 5: Preview ========== */}
                    {step === 5 && !loading && processResult && (
                        <div className="space-y-4">
                            {/* Arba Branding Banner */}
                            <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/30 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <BadgeCheck className="w-6 h-6 text-violet-400" />
                                        <div>
                                            <h3 className="text-white font-bold">{t('بيانات Arba Pricing', 'Arba Pricing Data')}</h3>
                                            <p className="text-xs text-violet-300/70">
                                                {t('تم تطهير البيانات وتطبيق هوية Arba', 'Data sanitized & Arba identity applied')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-white">
                                            {processResult.itemCount}
                                        </div>
                                        <div className="text-xs text-slate-400">{t('بند', 'items')}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Sanitization Summary */}
                            {processResult.sanitizationSummary.purgeApplied && (
                                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    {t(
                                        `تم إزالة ${processResult.sanitizationSummary.itemsRemoved} عنصر خارجي`,
                                        `${processResult.sanitizationSummary.itemsRemoved} external items purged`
                                    )}
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
                                    <div className="text-lg font-bold text-cyan-400">{processResult.itemCount}</div>
                                    <div className="text-[10px] text-slate-400">{t('إجمالي البنود', 'Total Items')}</div>
                                </div>
                                <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
                                    <div className="text-lg font-bold text-green-400">
                                        {processResult.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-[10px] text-slate-400">{t('إجمالي القيمة', 'Total Value')}</div>
                                </div>
                                <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
                                    <div className="text-lg font-bold text-violet-400">
                                        <ShieldCheck className="w-5 h-5 mx-auto" />
                                    </div>
                                    <div className="text-[10px] text-slate-400">{t('آمن', 'Secured')}</div>
                                </div>
                            </div>

                            {/* Preview Table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-700/50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2.5 text-slate-300 font-semibold text-xs">#</th>
                                            <th className="px-3 py-2.5 text-slate-300 font-semibold text-xs text-right">{t('الاسم', 'Name')}</th>
                                            <th className="px-3 py-2.5 text-slate-300 font-semibold text-xs text-center">{t('الوحدة', 'Unit')}</th>
                                            <th className="px-3 py-2.5 text-slate-300 font-semibold text-xs text-center">{t('الكمية', 'Qty')}</th>
                                            <th className="px-3 py-2.5 text-slate-300 font-semibold text-xs text-center">{t('سعر الوحدة', 'Unit Cost')}</th>
                                            <th className="px-3 py-2.5 text-slate-300 font-semibold text-xs text-center">{t('الإجمالي', 'Total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {processResult.items.slice(0, 25).map((item, i) => (
                                            <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="px-3 py-2 text-slate-500 text-xs">{i + 1}</td>
                                                <td className="px-3 py-2 text-white text-right">{item.name?.ar || item.name?.en}</td>
                                                <td className="px-3 py-2 text-center text-slate-300">{item.unit}</td>
                                                <td className="px-3 py-2 text-center text-white">{item.qty}</td>
                                                <td className="px-3 py-2 text-center text-cyan-400">
                                                    {item.totalUnitCost?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-center text-green-400 font-medium">
                                                    {item.totalLinePrice?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {processResult.items.length > 25 && (
                                    <p className="text-center text-xs text-slate-500 py-2 bg-slate-800/40">
                                        + {processResult.items.length - 25} {t('بند آخر', 'more items')}
                                    </p>
                                )}
                            </div>

                            {/* Arba Stamp */}
                            <div className="flex items-center justify-center gap-2 py-2 text-[11px] text-violet-400/60">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                Powered by Arba Pricing — White-Label Applied
                            </div>
                        </div>
                    )}

                    {/* ========== STEP 6: Done ========== */}
                    {step === 6 && (
                        <div className="text-center py-12">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/20">
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">
                                {t('تم الاستيراد بنجاح! 🎉', 'Import Successful! 🎉')}
                            </h3>
                            <p className="text-slate-400 mb-6">
                                {t(
                                    `تم استيراد ${processResult?.itemCount || 0} بند بقيمة إجمالية ${processResult?.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0} ر.س`,
                                    `${processResult?.itemCount || 0} items imported — Total value: ${processResult?.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0} SAR`
                                )}
                            </p>
                            <div className="flex items-center justify-center gap-4 text-xs">
                                {processResult?.sanitizationSummary.purgeApplied && (
                                    <span className="flex items-center gap-1 text-green-400">
                                        <ShieldCheck className="w-3.5 h-3.5" /> {t('تم التطهير', 'Purged')}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-violet-400">
                                    <BadgeCheck className="w-3.5 h-3.5" /> Arba Branded
                                </span>
                                <span className="flex items-center gap-1 text-cyan-400">
                                    <Shield className="w-3.5 h-3.5" /> {t('معالج آمن', 'Securely Processed')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== Footer Actions ===== */}
                <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/40 flex items-center justify-between">
                    <button
                        onClick={() => {
                            if (step <= 1 || step === 6) {
                                onClose();
                            } else if (step === 4 && scanResult?.securityAlert.isClean) {
                                setStep(1);
                            } else {
                                setStep(step - 1);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/50 transition-all text-sm"
                        disabled={loading}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {step <= 1 || step === 6 ? t('إغلاق', 'Close') : t('رجوع', 'Back')}
                    </button>

                    {/* Step 2 → Step 3 */}
                    {step === 2 && (
                        <button
                            onClick={() => setStep(3)}
                            disabled={scanResult?.securityAlert.securityAlertLevel === 'BLOCKED' && !purgeConfirmed}
                            className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-semibold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${scanResult?.securityAlert.securityAlertLevel === 'BLOCKED'
                                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/20'
                                : 'bg-gradient-to-r from-violet-500 to-indigo-600 hover:shadow-lg hover:shadow-violet-500/20'
                                }`}
                        >
                            {scanResult?.securityAlert.securityAlertLevel === 'BLOCKED'
                                ? (purgeConfirmed ? t('🛡️ تطهير ومتابعة', '🛡️ Purge & Continue') : t('⛔ يجب التأكيد أولاً', '⛔ Confirm Purge First'))
                                : (purgeConfirmed ? t('المتابعة مع التطهير', 'Continue with Purge') : t('تخطي التطهير', 'Skip Purge'))
                            }
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}

                    {/* Step 3 → Step 4 */}
                    {step === 3 && (
                        <button
                            onClick={() => setStep(4)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/20 transition-all text-sm"
                        >
                            {t('مطابقة الأعمدة', 'Map Columns')}
                            <Columns className="w-4 h-4" />
                        </button>
                    )}

                    {/* Step 4 → Process & Preview */}
                    {step === 4 && (
                        <button
                            onClick={handleProcess}
                            disabled={loading || !Object.values(columnMappings).some(v => v)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('معالجة ومعاينة', 'Process & Preview')}
                            <Zap className="w-4 h-4" />
                        </button>
                    )}

                    {/* Step 5 → Final Import */}
                    {step === 5 && (
                        <button
                            onClick={handleFinalImport}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/20 transition-all text-sm"
                        >
                            {t(`استيراد ${processResult?.itemCount || 0} بند`, `Import ${processResult?.itemCount || 0} Items`)}
                            <Check className="w-4 h-4" />
                        </button>
                    )}

                    {/* Step 6: Close */}
                    {step === 6 && (
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all text-sm"
                        >
                            {t('إغلاق', 'Close')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UniversalImporter;
