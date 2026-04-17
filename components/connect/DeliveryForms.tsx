import { Language } from '../../types';
/**
 * DeliveryForms — نماذج التسليم والاستلام (محسّن)
 * إضافة/حذف/تعديل مواد + وحدات شاملة + توقيع إلكتروني
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Plus, FileText, CheckCircle, Clock, XCircle, Edit3, Save, Send, Trash2, PenTool, Eye, Filter, X, ChevronDown } from 'lucide-react';
import { connectService, DeliveryForm, FormSignature, FORM_TEMPLATES, formatChatTime } from '../../services/connectService';
import type { FormType, FormStatus } from '../../services/connectService';

interface DeliveryFormsProps {
    language: Language;
    userId: string;
    userName: string;
    companyName?: string;
    onBack: () => void;
}

// ═══ وحدات القياس الشاملة ═══
const UNITS: { id: string; ar: string; en: string; category: string }[] = [
    // الطول
    { id: 'mm', ar: 'مم', en: 'mm', category: 'length' },
    { id: 'cm', ar: 'سم', en: 'cm', category: 'length' },
    { id: 'm', ar: 'متر', en: 'm', category: 'length' },
    { id: 'km', ar: 'كم', en: 'km', category: 'length' },
    { id: 'in', ar: 'بوصة', en: 'in', category: 'length' },
    { id: 'ft', ar: 'قدم', en: 'ft', category: 'length' },
    // المساحة
    { id: 'm2', ar: 'م²', en: 'm²', category: 'area' },
    { id: 'km2', ar: 'كم²', en: 'km²', category: 'area' },
    { id: 'ft2', ar: 'قدم²', en: 'ft²', category: 'area' },
    { id: 'hectare', ar: 'هكتار', en: 'hectare', category: 'area' },
    // الحجم
    { id: 'm3', ar: 'م³', en: 'm³', category: 'volume' },
    { id: 'liter', ar: 'لتر', en: 'L', category: 'volume' },
    { id: 'gallon', ar: 'جالون', en: 'gal', category: 'volume' },
    // الوزن
    { id: 'g', ar: 'جرام', en: 'g', category: 'weight' },
    { id: 'kg', ar: 'كجم', en: 'kg', category: 'weight' },
    { id: 'ton', ar: 'طن', en: 'ton', category: 'weight' },
    { id: 'lb', ar: 'رطل', en: 'lb', category: 'weight' },
    // العدد
    { id: 'pcs', ar: 'حبة', en: 'pcs', category: 'count' },
    { id: 'set', ar: 'طقم', en: 'set', category: 'count' },
    { id: 'box', ar: 'صندوق', en: 'box', category: 'count' },
    { id: 'bag', ar: 'كيس', en: 'bag', category: 'count' },
    { id: 'roll', ar: 'لفة', en: 'roll', category: 'count' },
    { id: 'sheet', ar: 'لوح', en: 'sheet', category: 'count' },
    { id: 'bundle', ar: 'ربطة', en: 'bundle', category: 'count' },
    { id: 'pallet', ar: 'طبلية', en: 'pallet', category: 'count' },
    { id: 'truck', ar: 'شاحنة', en: 'truck', category: 'count' },
    { id: 'trip', ar: 'رحلة', en: 'trip', category: 'count' },
    // الزمن
    { id: 'hr', ar: 'ساعة', en: 'hr', category: 'time' },
    { id: 'day', ar: 'يوم', en: 'day', category: 'time' },
    { id: 'week', ar: 'أسبوع', en: 'week', category: 'time' },
    { id: 'month', ar: 'شهر', en: 'month', category: 'time' },
    // أخرى
    { id: 'ls', ar: 'مقطوعية', en: 'L.S', category: 'other' },
    { id: 'percent', ar: '%', en: '%', category: 'other' },
];

const UNIT_CATEGORIES: { id: string; ar: string; en: string }[] = [
    { id: 'weight', ar: 'الوزن', en: 'Weight' },
    { id: 'length', ar: 'الطول', en: 'Length' },
    { id: 'area', ar: 'المساحة', en: 'Area' },
    { id: 'volume', ar: 'الحجم', en: 'Volume' },
    { id: 'count', ar: 'العدد', en: 'Count' },
    { id: 'time', ar: 'الزمن', en: 'Time' },
    { id: 'other', ar: 'أخرى', en: 'Other' },
];

const CONDITIONS = [
    { id: 'excellent', ar: 'ممتاز', en: 'Excellent', color: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'good', ar: 'جيد', en: 'Good', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'acceptable', ar: 'مقبول', en: 'Acceptable', color: 'bg-amber-500/20 text-amber-400' },
    { id: 'damaged', ar: 'تالف', en: 'Damaged', color: 'bg-red-500/20 text-red-400' },
    { id: 'rejected', ar: 'مرفوض', en: 'Rejected', color: 'bg-red-600/30 text-red-300' },
];

const STATUS_CONFIG: Record<FormStatus, { label: { ar: string; en: string }; color: string; icon: React.ReactNode }> = {
    draft: { label: { ar: 'مسودة', en: 'Draft' }, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: <Edit3 className="w-3 h-3" /> },
    pending: { label: { ar: 'بانتظار الاعتماد', en: 'Pending' }, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <Clock className="w-3 h-3" /> },
    approved: { label: { ar: 'معتمد', en: 'Approved' }, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <CheckCircle className="w-3 h-3" /> },
    rejected: { label: { ar: 'مرفوض', en: 'Rejected' }, color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle className="w-3 h-3" /> },
};

interface MaterialRow {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    total: string;
    condition: string;
    notes: string;
}

const emptyMaterial = (): MaterialRow => ({
    id: `mat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: '', quantity: '', unit: 'ton', unitPrice: '', total: '', condition: 'excellent', notes: ''
});

const DeliveryForms: React.FC<DeliveryFormsProps> = ({ language, userId, userName, companyName, onBack }) => {
    const [forms, setForms] = useState<DeliveryForm[]>([]);
    const [view, setView] = useState<'list' | 'create' | 'detail' | 'edit'>('list');
    const [selectedForm, setSelectedForm] = useState<DeliveryForm | null>(null);
    const [filterStatus, setFilterStatus] = useState<FormStatus | 'all'>('all');

    // Create/Edit form state
    const [formType, setFormType] = useState<FormType>('material_receipt');
    const [formTitle, setFormTitle] = useState('');
    const [formSupplier, setFormSupplier] = useState('');
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
    const [formLocation, setFormLocation] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formMaterials, setFormMaterials] = useState<MaterialRow[]>([emptyMaterial()]);
    const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);

    // Signature
    const [showSignPad, setShowSignPad] = useState(false);
    const [signingRole, setSigningRole] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const isRtl = language === 'ar';
    const t = (ar: string, en: string) => { const m: Record<string, string> = { ar, en, fr: en, zh: en }; return m[language] || en; };
    const getUnit = (id: string) => UNITS.find(u => u.id === id);

    useEffect(() => { loadForms(); }, []);
    const loadForms = () => setForms(connectService.getForms());

    // ═══ Material CRUD ═══
    const addMaterial = () => setFormMaterials(prev => [...prev, emptyMaterial()]);

    const updateMaterial = (id: string, field: keyof MaterialRow, value: string) => {
        setFormMaterials(prev => prev.map(m => {
            if (m.id !== id) return m;
            const updated = { ...m, [field]: value };
            if (field === 'quantity' || field === 'unitPrice') {
                const qty = parseFloat(updated.quantity) || 0;
                const price = parseFloat(updated.unitPrice) || 0;
                updated.total = (qty * price).toFixed(2);
            }
            return updated;
        }));
    };

    const deleteMaterial = (id: string) => {
        if (formMaterials.length <= 1) return;
        setFormMaterials(prev => prev.filter(m => m.id !== id));
    };

    const duplicateMaterial = (id: string) => {
        const mat = formMaterials.find(m => m.id === id);
        if (mat) setFormMaterials(prev => [...prev, { ...mat, id: `mat_${Date.now()}`, name: mat.name + ' (نسخة)' }]);
    };

    const materialsTotal = formMaterials.reduce((sum, m) => sum + (parseFloat(m.total) || 0), 0);

    // ═══ Form Actions ═══
    const resetForm = () => {
        setFormTitle(''); setFormSupplier(''); setFormNotes(''); setFormLocation('');
        setFormDate(new Date().toISOString().split('T')[0]);
        setFormMaterials([emptyMaterial()]);
    };

    const handleSaveForm = () => {
        const data: Record<string, any> = {
            supplier: formSupplier, date: formDate, location: formLocation, notes: formNotes,
            materials: formMaterials.filter(m => m.name.trim()).map(m => ({
                name: m.name, quantity: m.quantity, unit: m.unit,
                unitPrice: m.unitPrice, total: m.total, condition: m.condition, notes: m.notes,
            })),
            materialsTotal,
        };

        if (view === 'edit' && selectedForm) {
            connectService.updateForm(selectedForm.id!, { title: formTitle || FORM_TEMPLATES[formType].name[language], data });
        } else {
            connectService.createForm({
                type: formType, title: formTitle || FORM_TEMPLATES[formType].name[language],
                status: 'draft', createdBy: { id: userId, name: userName, role: 'contractor', company: companyName },
                projectName: companyName || '', data, photos: [],
                signatures: [
                    { role: t('المنشئ', 'Creator'), name: userName, status: 'signed', signedAt: new Date() as any },
                    { role: t('المدير', 'Manager'), name: '', status: 'pending' },
                ],
                linkedItemCodes: [],
            });
        }
        resetForm(); setView('list'); loadForms();
    };

    const handleDeleteForm = (id: string) => {
        connectService.deleteForm(id);
        loadForms(); if (selectedForm?.id === id) { setSelectedForm(null); setView('list'); }
    };

    const handleEditForm = (form: DeliveryForm) => {
        setFormType(form.type); setFormTitle(form.title);
        setFormSupplier(form.data.supplier || ''); setFormNotes(form.data.notes || '');
        setFormLocation(form.data.location || ''); setFormDate(form.data.date || new Date().toISOString().split('T')[0]);
        if (form.data.materials?.length > 0) {
            setFormMaterials(form.data.materials.map((m: any, i: number) => ({
                id: `mat_${i}_${Date.now()}`, name: m.name || '', quantity: m.quantity || '',
                unit: m.unit || 'ton', unitPrice: m.unitPrice || '', total: m.total || '',
                condition: m.condition || 'excellent', notes: m.notes || '',
            })));
        } else { setFormMaterials([emptyMaterial()]); }
        setSelectedForm(form); setView('edit');
    };

    // Signature
    const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        setIsDrawing(true);
        const r = c.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - r.left : e.clientX - r.left;
        const y = 'touches' in e ? e.touches[0].clientY - r.top : e.clientY - r.top;
        ctx.beginPath(); ctx.moveTo(x, y);
    }, []);
    const drawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const r = c.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - r.left : e.clientX - r.left;
        const y = 'touches' in e ? e.touches[0].clientY - r.top : e.clientY - r.top;
        ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#10b981';
        ctx.lineTo(x, y); ctx.stroke();
    }, [isDrawing]);
    const stopDraw = useCallback(() => setIsDrawing(false), []);
    const saveSignature = () => {
        const c = canvasRef.current; if (!c || !selectedForm) return;
        connectService.signForm(selectedForm.id!, { role: signingRole, name: userName, signatureDataUrl: c.toDataURL('image/png'), status: 'signed' });
        setShowSignPad(false); loadForms();
        const u = connectService.getForms().find(f => f.id === selectedForm.id); if (u) setSelectedForm(u);
    };

    const filteredForms = forms.filter(f => filterStatus === 'all' || f.status === filterStatus);

    // ═══════════════════════════════════════
    // CREATE / EDIT VIEW
    // ═══════════════════════════════════════
    if (view === 'create' || view === 'edit') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
                <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => { resetForm(); setView('list'); }} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                                <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                            </button>
                            <h1 className="text-lg font-bold text-white">{view === 'edit' ? t('تعديل النموذج', 'Edit Form') : t('نموذج جديد', 'New Form')}</h1>
                        </div>
                        <button onClick={handleSaveForm}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                            <Save className="w-4 h-4" /> {t('حفظ', 'Save')}
                        </button>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4 pb-20">
                    {/* نوع النموذج */}
                    <div>
                        <label className="text-xs text-slate-400 mb-2 block font-medium">{t('نوع النموذج', 'Form Type')}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(Object.keys(FORM_TEMPLATES) as FormType[]).map(type => (
                                <button key={type} onClick={() => setFormType(type)}
                                    className={`p-3 rounded-xl border text-center transition-all ${formType === type ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-800/50 border-slate-700/30 text-slate-400 hover:bg-slate-700/50'}`}>
                                    <span className="text-2xl block mb-1">{FORM_TEMPLATES[type].icon}</span>
                                    <span className="text-xs font-medium">{FORM_TEMPLATES[type].name[language]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* العنوان + التاريخ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">{t('عنوان النموذج', 'Title')}</label>
                            <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder={FORM_TEMPLATES[formType].name[language]}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">{t('التاريخ', 'Date')}</label>
                            <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                        </div>
                    </div>

                    {/* المورد + الموقع */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">{t('المورد / الجهة', 'Supplier')}</label>
                            <input value={formSupplier} onChange={e => setFormSupplier(e.target.value)} placeholder={t('اسم المورد أو المقاول', 'Supplier or contractor name')}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">{t('الموقع', 'Location')}</label>
                            <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder={t('موقع الاستلام', 'Delivery location')}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
                        </div>
                    </div>

                    {/* ═══ جدول المواد ═══ */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-slate-400 font-medium">{t('المواد / البنود', 'Materials / Items')}</label>
                            <button onClick={addMaterial}
                                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-500/10 transition-colors">
                                <Plus className="w-3 h-3" /> {t('إضافة بند', 'Add Item')}
                            </button>
                        </div>

                        <div className="space-y-2">
                            {formMaterials.map((mat, idx) => (
                                <div key={mat.id} className={`bg-slate-800/40 border rounded-xl p-3 transition-all ${editingMaterialId === mat.id ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-700/30'}`}>
                                    {/* Row number + delete */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] text-slate-500 font-bold">#{idx + 1}</span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => duplicateMaterial(mat.id)} className="p-1 text-slate-500 hover:text-blue-400 rounded transition-colors" title={t('نسخ', 'Copy')}>
                                                <Plus className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => setEditingMaterialId(editingMaterialId === mat.id ? null : mat.id)} className="p-1 text-slate-500 hover:text-amber-400 rounded transition-colors">
                                                <Edit3 className="w-3 h-3" />
                                            </button>
                                            {formMaterials.length > 1 && (
                                                <button onClick={() => deleteMaterial(mat.id)} className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* الصف الأول: اسم المادة */}
                                    <input value={mat.name} onChange={e => updateMaterial(mat.id, 'name', e.target.value)}
                                        placeholder={t('اسم المادة أو البند', 'Material / Item name')}
                                        className="w-full bg-slate-700/30 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40 mb-2" />

                                    {/* الصف الثاني: الكمية + الوحدة + سعر الوحدة + الإجمالي */}
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        <div>
                                            <label className="text-[9px] text-slate-500 mb-0.5 block">{t('الكمية', 'Qty')}</label>
                                            <input type="number" value={mat.quantity} onChange={e => updateMaterial(mat.id, 'quantity', e.target.value)}
                                                placeholder="0" className="w-full bg-slate-700/30 border border-slate-600/30 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none text-center" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-slate-500 mb-0.5 block">{t('الوحدة', 'Unit')}</label>
                                            <select value={mat.unit} onChange={e => updateMaterial(mat.id, 'unit', e.target.value)}
                                                className="w-full bg-slate-700/30 border border-slate-600/30 rounded-lg px-1 py-1.5 text-xs text-white focus:outline-none appearance-none text-center">
                                                {UNIT_CATEGORIES.map(cat => (
                                                    <optgroup key={cat.id} label={cat[language]}>
                                                        {UNITS.filter(u => u.category === cat.id).map(u => (
                                                            <option key={u.id} value={u.id}>{u[language]}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-slate-500 mb-0.5 block">{t('سعر الوحدة', 'Price')}</label>
                                            <input type="number" value={mat.unitPrice} onChange={e => updateMaterial(mat.id, 'unitPrice', e.target.value)}
                                                placeholder="0.00" className="w-full bg-slate-700/30 border border-slate-600/30 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none text-center" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-slate-500 mb-0.5 block">{t('الإجمالي', 'Total')}</label>
                                            <div className="w-full bg-slate-600/20 border border-slate-600/30 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-bold text-center">
                                                {mat.total || '0.00'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* الصف الثالث: الحالة */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[9px] text-slate-500">{t('الحالة:', 'Status:')}</span>
                                        {CONDITIONS.map(c => (
                                            <button key={c.id} onClick={() => updateMaterial(mat.id, 'condition', c.id)}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${mat.condition === c.id ? c.color : 'bg-slate-700/30 text-slate-500'}`}>
                                                {c[language]}
                                            </button>
                                        ))}
                                    </div>

                                    {/* ملاحظات البند (اختياري) */}
                                    {editingMaterialId === mat.id && (
                                        <input value={mat.notes} onChange={e => updateMaterial(mat.id, 'notes', e.target.value)}
                                            placeholder={t('ملاحظات على البند (اختياري)', 'Item notes (optional)')}
                                            className="w-full bg-slate-700/30 border border-slate-600/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none mt-2" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* الإجمالي الكلي */}
                        {materialsTotal > 0 && (
                            <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
                                <span className="text-xs text-emerald-400 font-medium">{t('الإجمالي الكلي', 'Grand Total')}</span>
                                <span className="text-lg font-bold text-emerald-400">{materialsTotal.toLocaleString('en', { minimumFractionDigits: 2 })} {t('ر.س', 'SAR')}</span>
                            </div>
                        )}
                    </div>

                    {/* الملاحظات */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">{t('ملاحظات عامة', 'General Notes')}</label>
                        <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
                            placeholder={t('ملاحظات إضافية...', 'Additional notes...')} />
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // DETAIL VIEW
    // ═══════════════════════════════════════
    if (view === 'detail' && selectedForm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
                <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setView('list'); setSelectedForm(null); }} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                                <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                            </button>
                            <div>
                                <h1 className="text-base sm:text-lg font-bold text-white">{selectedForm.title}</h1>
                                <p className="text-[10px] text-slate-400">{selectedForm.formNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedForm.status === 'draft' && (
                                <button onClick={() => handleEditForm(selectedForm)} className="p-2 hover:bg-slate-700/50 rounded-xl text-blue-400 transition-colors">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${STATUS_CONFIG[selectedForm.status].color}`}>
                                {STATUS_CONFIG[selectedForm.status].icon} {STATUS_CONFIG[selectedForm.status].label[language]}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4 pb-20">
                    {/* معلومات النموذج */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div><span className="text-[10px] text-slate-500 block">{t('النوع', 'Type')}</span><p className="text-white text-xs font-medium">{FORM_TEMPLATES[selectedForm.type].icon} {FORM_TEMPLATES[selectedForm.type].name[language]}</p></div>
                            <div><span className="text-[10px] text-slate-500 block">{t('التاريخ', 'Date')}</span><p className="text-white text-xs font-medium">{selectedForm.data.date || new Date(selectedForm.createdAt as any).toLocaleDateString('ar-SA')}</p></div>
                            <div><span className="text-[10px] text-slate-500 block">{t('المنشئ', 'By')}</span><p className="text-white text-xs font-medium">{selectedForm.createdBy.name}</p></div>
                            {selectedForm.data.supplier && <div><span className="text-[10px] text-slate-500 block">{t('المورد', 'Supplier')}</span><p className="text-white text-xs font-medium">{selectedForm.data.supplier}</p></div>}
                        </div>
                    </div>

                    {/* جدول المواد */}
                    {selectedForm.data.materials?.length > 0 && (
                        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
                            <div className="px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
                                <span className="text-xs font-semibold text-white">{t('المواد', 'Materials')} ({selectedForm.data.materials.length})</span>
                                {selectedForm.data.materialsTotal > 0 && <span className="text-xs font-bold text-emerald-400">{Number(selectedForm.data.materialsTotal).toLocaleString()} {t('ر.س', 'SAR')}</span>}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead><tr className="border-b border-slate-700/50 text-slate-400">
                                        <th className="py-2 px-3 text-right">#</th>
                                        <th className="py-2 px-3 text-right">{t('المادة', 'Item')}</th>
                                        <th className="py-2 px-3 text-center">{t('الكمية', 'Qty')}</th>
                                        <th className="py-2 px-3 text-center">{t('الوحدة', 'Unit')}</th>
                                        <th className="py-2 px-3 text-center">{t('السعر', 'Price')}</th>
                                        <th className="py-2 px-3 text-center">{t('الإجمالي', 'Total')}</th>
                                        <th className="py-2 px-3 text-center">{t('الحالة', 'Status')}</th>
                                    </tr></thead>
                                    <tbody>
                                        {selectedForm.data.materials.map((m: any, i: number) => {
                                            const cond = CONDITIONS.find(c => c.id === m.condition) || CONDITIONS[0];
                                            const unit = getUnit(m.unit);
                                            return (
                                                <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-700/10">
                                                    <td className="py-2 px-3 text-slate-500">{i + 1}</td>
                                                    <td className="py-2 px-3 text-white font-medium">{m.name}{m.notes && <span className="text-[9px] text-slate-500 block">{m.notes}</span>}</td>
                                                    <td className="py-2 px-3 text-center text-slate-300">{m.quantity}</td>
                                                    <td className="py-2 px-3 text-center text-slate-400">{unit ? unit[language] : m.unit}</td>
                                                    <td className="py-2 px-3 text-center text-slate-300">{m.unitPrice || '-'}</td>
                                                    <td className="py-2 px-3 text-center text-emerald-400 font-bold">{m.total || '-'}</td>
                                                    <td className="py-2 px-3 text-center"><span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${cond.color}`}>{cond[language]}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {selectedForm.data.notes && (
                        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
                            <span className="text-[10px] text-slate-500">{t('ملاحظات', 'Notes')}</span>
                            <p className="text-sm text-slate-300 mt-1">{selectedForm.data.notes}</p>
                        </div>
                    )}

                    {/* التوقيعات */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><PenTool className="w-4 h-4 text-emerald-400" />{t('التوقيعات', 'Signatures')}</h4>
                        <div className="space-y-2">
                            {selectedForm.signatures.map((sig, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-800/40 rounded-lg p-3">
                                    <div><p className="text-xs font-medium text-white">{sig.role}</p><p className="text-[10px] text-slate-400">{sig.name || t('بانتظار', 'Awaiting')}</p></div>
                                    {sig.status === 'signed'
                                        ? <div className="flex items-center gap-1.5">{sig.signatureDataUrl && <img src={sig.signatureDataUrl} alt="" className="h-6" />}<CheckCircle className="w-5 h-5 text-emerald-400" /></div>
                                        : <button onClick={() => { setSigningRole(sig.role); setShowSignPad(true); }} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium flex items-center gap-1"><PenTool className="w-3 h-3" />{t('توقيع', 'Sign')}</button>
                                    }
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex gap-2">
                        {selectedForm.status === 'draft' && (
                            <>
                                <button onClick={() => { connectService.updateForm(selectedForm.id!, { status: 'pending' }); loadForms(); setSelectedForm({ ...selectedForm, status: 'pending' }); }}
                                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                                    <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t('إرسال للاعتماد', 'Submit')}
                                </button>
                                <button onClick={() => handleDeleteForm(selectedForm.id!)}
                                    className="py-3 px-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold flex items-center gap-1 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                        {selectedForm.status === 'pending' && (
                            <>
                                <button onClick={() => { connectService.updateForm(selectedForm.id!, { status: 'approved' }); loadForms(); setSelectedForm({ ...selectedForm, status: 'approved' }); }}
                                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98]">
                                    <CheckCircle className="w-4 h-4" /> {t('اعتماد', 'Approve')}
                                </button>
                                <button onClick={() => { connectService.updateForm(selectedForm.id!, { status: 'rejected' }); loadForms(); setSelectedForm({ ...selectedForm, status: 'rejected' }); }}
                                    className="py-3 px-6 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold flex items-center gap-2">
                                    <XCircle className="w-4 h-4" /> {t('رفض', 'Reject')}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Signature Pad */}
                {showSignPad && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 max-w-sm w-full">
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><PenTool className="w-4 h-4 text-emerald-400" />{t('التوقيع', 'Signature')} — {signingRole}</h3>
                            <canvas ref={canvasRef} width={300} height={150} className="w-full bg-slate-900 rounded-xl border border-slate-600 cursor-crosshair touch-none"
                                onMouseDown={startDraw} onMouseMove={drawing} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                                onTouchStart={startDraw} onTouchMove={drawing} onTouchEnd={stopDraw} />
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => setShowSignPad(false)} className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-xl text-sm">{t('إلغاء', 'Cancel')}</button>
                                <button onClick={() => { const c = canvasRef.current; if (c) c.getContext('2d')?.clearRect(0, 0, c.width, c.height); }} className="py-2 px-4 bg-slate-700 text-slate-300 rounded-xl text-sm">{t('مسح', 'Clear')}</button>
                                <button onClick={saveSignature} className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-bold">{t('حفظ', 'Save')}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ═══════════════════════════════════════
    // LIST VIEW
    // ═══════════════════════════════════════
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><span className="text-lg">📋</span></div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-white">{t('نماذج التسليم', 'Delivery Forms')}</h1>
                            <p className="text-[10px] sm:text-xs text-slate-400">{forms.length} {t('نموذج', 'forms')}</p>
                        </div>
                    </div>
                    <button onClick={() => { resetForm(); setView('create'); }}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all">
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('نموذج جديد', 'New')}</span>
                    </button>
                </div>
                <div className="max-w-4xl mx-auto px-3 sm:px-6 pb-2 flex gap-2 overflow-x-auto">
                    {(Object.keys(STATUS_CONFIG) as FormStatus[]).map(s => (
                        <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border whitespace-nowrap flex items-center gap-1 transition-colors ${filterStatus === s ? STATUS_CONFIG[s].color : 'bg-slate-800 text-slate-500 border-transparent hover:bg-slate-700'}`}>
                            {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label[language]}
                        </button>
                    ))}
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-2">
                {filteredForms.length === 0 ? (
                    <div className="text-center py-16"><FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400 text-sm">{t('لا توجد نماذج', 'No forms')}</p></div>
                ) : (
                    filteredForms.map(form => (
                        <div key={form.id} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 sm:p-4 hover:bg-slate-700/40 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 cursor-pointer flex-1" onClick={() => { setSelectedForm(form); setView('detail'); }}>
                                    <span className="text-2xl">{FORM_TEMPLATES[form.type].icon}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{form.title}</p>
                                        <p className="text-[10px] text-slate-400">{form.formNumber} · {form.createdBy.name} · {formatChatTime(form.createdAt)}</p>
                                        {form.data.materialsTotal > 0 && <p className="text-[10px] text-emerald-400 font-bold mt-0.5">{Number(form.data.materialsTotal).toLocaleString()} {t('ر.س', 'SAR')}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border flex items-center gap-1 ${STATUS_CONFIG[form.status].color}`}>
                                        {STATUS_CONFIG[form.status].icon} {STATUS_CONFIG[form.status].label[language]}
                                    </span>
                                    {form.status === 'draft' && (
                                        <>
                                            <button onClick={() => handleEditForm(form)} className="p-1.5 text-slate-500 hover:text-blue-400 rounded-lg hover:bg-slate-700/50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDeleteForm(form.id!)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-700/50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                {form.signatures.map((sig, i) => (
                                    <div key={i} className="flex items-center gap-1 text-[10px]">
                                        {sig.status === 'signed' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-slate-500" />}
                                        <span className={sig.status === 'signed' ? 'text-emerald-400' : 'text-slate-500'}>{sig.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeliveryForms;
