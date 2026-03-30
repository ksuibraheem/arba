/**
 * CompanySettings — إعدادات الشركة المستفيدة
 * شعار + بيانات + إضافة موظفين + وثائق
 */

import React, { useState, useRef } from 'react';
import { ChevronLeft, Building2, Camera, Save, UserPlus, Users, Trash2, Edit3, FileText, Upload, CheckCircle, X, Mail, Phone, MapPin, Hash, Image } from 'lucide-react';

interface CompanySettingsProps {
    language: 'ar' | 'en';
    userId: string;
    onBack: () => void;
}

interface CompanyData {
    name: string;
    nameEn: string;
    logo: string;
    email: string;
    phone: string;
    address: string;
    cr: string;          // سجل تجاري
    vat: string;         // رقم ضريبي
    website: string;
}

interface CompanyEmployee {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: string;
    isActive: boolean;
}

const STORAGE_KEY = 'arba_company_settings';
const EMPLOYEES_KEY = 'arba_company_employees';

function loadCompany(): CompanyData {
    try {
        const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return {
            name: d.name || '', nameEn: d.nameEn || '', logo: d.logo || '',
            email: d.email || '', phone: d.phone || '', address: d.address || '',
            cr: d.cr || '', vat: d.vat || '', website: d.website || '',
        };
    } catch { return { name: '', nameEn: '', logo: '', email: '', phone: '', address: '', cr: '', vat: '', website: '' }; }
}
function saveCompany(data: CompanyData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function loadEmployees(): CompanyEmployee[] {
    try { return JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || '[]'); } catch { return []; }
}
function saveEmployees(list: CompanyEmployee[]) { localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(list)); }

const CompanySettings: React.FC<CompanySettingsProps> = ({ language, userId, onBack }) => {
    const [tab, setTab] = useState<'info' | 'employees' | 'docs'>('info');
    const [company, setCompany] = useState<CompanyData>(loadCompany());
    const [employees, setEmployees] = useState<CompanyEmployee[]>(loadEmployees());
    const [saved, setSaved] = useState(false);
    const [showAddEmp, setShowAddEmp] = useState(false);
    const [newEmp, setNewEmp] = useState({ name: '', phone: '', email: '', role: 'موظف' });
    const logoRef = useRef<HTMLInputElement>(null);

    const isRtl = language === 'ar';
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const handleSaveCompany = () => {
        saveCompany(company);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            setCompany(prev => ({ ...prev, logo: dataUrl }));
        };
        reader.readAsDataURL(file);
    };

    const handleAddEmployee = () => {
        if (!newEmp.name.trim()) return;
        const emp: CompanyEmployee = {
            id: `cemp_${Date.now()}`, name: newEmp.name, phone: newEmp.phone,
            email: newEmp.email, role: newEmp.role, isActive: true,
        };
        const updated = [...employees, emp];
        setEmployees(updated);
        saveEmployees(updated);
        setNewEmp({ name: '', phone: '', email: '', role: 'موظف' });
        setShowAddEmp(false);
    };

    const handleDeleteEmployee = (id: string) => {
        const updated = employees.filter(e => e.id !== id);
        setEmployees(updated);
        saveEmployees(updated);
    };

    const tabs = [
        { id: 'info' as const, label: t('بيانات الشركة', 'Company Info'), icon: <Building2 className="w-4 h-4" /> },
        { id: 'employees' as const, label: t('الموظفين', 'Employees'), icon: <Users className="w-4 h-4" /> },
        { id: 'docs' as const, label: t('الوثائق', 'Documents'), icon: <FileText className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-white">{t('إعدادات الشركة', 'Company Settings')}</h1>
                            <p className="text-[10px] sm:text-xs text-slate-400">{t('شعار · بيانات · موظفين · وثائق', 'Logo · Info · Employees · Docs')}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-4xl mx-auto px-3 sm:px-6 pb-2 flex gap-1.5">
                    {tabs.map(tb => (
                        <button key={tb.id} onClick={() => setTab(tb.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                tab === tb.id
                                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
                                    : 'bg-slate-800/50 text-slate-400 border-slate-700/30 hover:bg-slate-700/50'
                            }`}>
                            {tb.icon} {tb.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4">
                {/* ═══ Tab: Company Info ═══ */}
                {tab === 'info' && (
                    <div className="space-y-4">
                        {/* Logo */}
                        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 flex items-center gap-4">
                            <div className="relative shrink-0">
                                {company.logo ? (
                                    <img src={company.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover border-2 border-slate-600" />
                                ) : (
                                    <div className="w-20 h-20 rounded-xl bg-slate-700/50 border-2 border-dashed border-slate-600 flex items-center justify-center">
                                        <Image className="w-8 h-8 text-slate-500" />
                                    </div>
                                )}
                                <button onClick={() => logoRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors">
                                    <Camera className="w-3.5 h-3.5 text-white" />
                                </button>
                                <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{t('شعار الشركة', 'Company Logo')}</p>
                                <p className="text-[10px] text-slate-500">{t('يظهر في الرسائل والفواتير والتقارير', 'Shown in messages, invoices & reports')}</p>
                            </div>
                        </div>

                        {/* Company Details Form */}
                        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-white mb-2">{t('البيانات الأساسية', 'Basic Info')}</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-slate-400 mb-1 block flex items-center gap-1"><Building2 className="w-3 h-3" />{t('اسم الشركة (عربي)', 'Company Name (AR)')}</label>
                                    <input value={company.name} onChange={e => setCompany(p => ({ ...p, name: e.target.value }))}
                                        className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 mb-1 block flex items-center gap-1"><Building2 className="w-3 h-3" />{t('اسم الشركة (انجليزي)', 'Company Name (EN)')}</label>
                                    <input value={company.nameEn} onChange={e => setCompany(p => ({ ...p, nameEn: e.target.value }))} dir="ltr"
                                        className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-slate-400 mb-1 block flex items-center gap-1"><Mail className="w-3 h-3" />{t('البريد الإلكتروني', 'Email')}</label>
                                    <input value={company.email} onChange={e => setCompany(p => ({ ...p, email: e.target.value }))} dir="ltr"
                                        className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 mb-1 block flex items-center gap-1"><Phone className="w-3 h-3" />{t('رقم الجوال', 'Phone')}</label>
                                    <input value={company.phone} onChange={e => setCompany(p => ({ ...p, phone: e.target.value }))} dir="ltr"
                                        className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-slate-400 mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3" />{t('العنوان', 'Address')}</label>
                                <input value={company.address} onChange={e => setCompany(p => ({ ...p, address: e.target.value }))}
                                    className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-slate-400 mb-1 block flex items-center gap-1"><Hash className="w-3 h-3" />{t('رقم السجل التجاري', 'CR Number')}</label>
                                    <input value={company.cr} onChange={e => setCompany(p => ({ ...p, cr: e.target.value }))} dir="ltr"
                                        className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 mb-1 block flex items-center gap-1"><Hash className="w-3 h-3" />{t('الرقم الضريبي', 'VAT Number')}</label>
                                    <input value={company.vat} onChange={e => setCompany(p => ({ ...p, vat: e.target.value }))} dir="ltr"
                                        className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                                </div>
                            </div>

                            <button onClick={handleSaveCompany}
                                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all">
                                {saved ? <><CheckCircle className="w-4 h-4" />{t('تم الحفظ ✓', 'Saved ✓')}</> : <><Save className="w-4 h-4" />{t('حفظ البيانات', 'Save')}</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ Tab: Employees ═══ */}
                {tab === 'employees' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-300">{employees.length} {t('موظف', 'employees')}</p>
                            <button onClick={() => setShowAddEmp(true)}
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all">
                                <UserPlus className="w-3.5 h-3.5" /> {t('إضافة موظف', 'Add Employee')}
                            </button>
                        </div>

                        {employees.length === 0 ? (
                            <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700/20">
                                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm">{t('لم يتم إضافة موظفين بعد', 'No employees added yet')}</p>
                                <p className="text-slate-600 text-xs mt-1">{t('أضف الموظفين ليقدروا يدخلون على المشاريع والشات', 'Add employees to give them project & chat access')}</p>
                            </div>
                        ) : employees.map(emp => (
                            <div key={emp.id} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{emp.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{emp.role}</span>
                                            {emp.phone && <span className="text-[10px] text-slate-500">{emp.phone}</span>}
                                            {emp.email && <span className="text-[10px] text-slate-500">{emp.email}</span>}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteEmployee(emp.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}

                        {/* Add Employee Modal */}
                        {showAddEmp && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowAddEmp(false)}>
                                <div className="bg-slate-800 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <UserPlus className="w-5 h-5 text-emerald-400" />
                                            {t('إضافة موظف', 'Add Employee')}
                                        </h3>
                                        <button onClick={() => setShowAddEmp(false)} className="p-1.5 text-slate-500 hover:text-white rounded-lg"><X className="w-4 h-4" /></button>
                                    </div>
                                    <div className="space-y-3">
                                        <input value={newEmp.name} onChange={e => setNewEmp(p => ({ ...p, name: e.target.value }))} placeholder={t('اسم الموظف', 'Employee Name')}
                                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input value={newEmp.phone} onChange={e => setNewEmp(p => ({ ...p, phone: e.target.value }))} placeholder={t('الجوال', 'Phone')}
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" />
                                            <input value={newEmp.email} onChange={e => setNewEmp(p => ({ ...p, email: e.target.value }))} placeholder={t('البريد', 'Email')} dir="ltr"
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" />
                                        </div>
                                        <select value={newEmp.role} onChange={e => setNewEmp(p => ({ ...p, role: e.target.value }))}
                                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                                            <option value="مدير مشروع">{t('مدير مشروع', 'Project Manager')}</option>
                                            <option value="مهندس موقع">{t('مهندس موقع', 'Site Engineer')}</option>
                                            <option value="محاسب">{t('محاسب', 'Accountant')}</option>
                                            <option value="مشرف موقع">{t('مشرف موقع', 'Site Supervisor')}</option>
                                            <option value="مسؤول سلامة">{t('مسؤول سلامة', 'Safety Officer')}</option>
                                            <option value="مساح كميات">{t('مساح كميات', 'QS')}</option>
                                            <option value="موظف">{t('موظف', 'Employee')}</option>
                                        </select>
                                        <button onClick={handleAddEmployee} disabled={!newEmp.name.trim()}
                                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                                newEmp.name.trim() ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg active:scale-[0.98]' : 'bg-slate-700 text-slate-500'
                                            }`}>
                                            <UserPlus className="w-4 h-4" /> {t('إضافة', 'Add')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ Tab: Documents ═══ */}
                {tab === 'docs' && (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-300 mb-2">{t('وثائق الشركة الرسمية', 'Official Company Documents')}</p>
                        {[
                            { label: t('السجل التجاري', 'Commercial Registration'), icon: '📋', value: company.cr },
                            { label: t('شهادة ضريبة القيمة المضافة', 'VAT Certificate'), icon: '🧾', value: company.vat },
                            { label: t('شهادة الغرفة التجارية', 'Chamber of Commerce'), icon: '🏛️' },
                            { label: t('شهادة السعودة (نطاقات)', 'Saudization (Nitaqat)'), icon: '🇸🇦' },
                            { label: t('التأمينات الاجتماعية', 'GOSI Certificate'), icon: '🛡️' },
                            { label: t('رخصة البلدية', 'Municipal License'), icon: '🏢' },
                            { label: t('تصنيف المقاولين', 'Contractor Classification'), icon: '⭐' },
                            { label: t('شهادة بنكية / IBAN', 'Bank Certificate / IBAN'), icon: '🏦' },
                        ].map((doc, i) => (
                            <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{doc.icon}</span>
                                    <div>
                                        <p className="text-sm text-white">{doc.label}</p>
                                        {doc.value && <p className="text-[10px] text-emerald-400">#{doc.value}</p>}
                                    </div>
                                </div>
                                <button className="px-2.5 py-1.5 bg-slate-700/50 text-slate-400 rounded-lg text-[10px] font-medium flex items-center gap-1 hover:bg-slate-600/50 transition-colors">
                                    <Upload className="w-3 h-3" /> {t('رفع', 'Upload')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanySettings;
