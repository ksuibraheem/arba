import { Language } from '../../types';
/**
 * SupplierManager — إدارة الموردين وربطهم بالمشاريع
 * بطاقات منظمة + ملخص سريع + تواصل مباشر + بحث
 */

import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, Plus, Search, Truck, Calendar, Shield, Trash2,
    CheckCircle, XCircle, RefreshCw, MessageCircle, Camera,
    FileText, Package, AlertTriangle, X, Phone, Building2, Hash, Users
} from 'lucide-react';
import { projectSupplierService, ProjectSupplier, RenewalMode } from '../../services/projectSupplierService';

interface SupplierManagerProps {
    language: Language;
    userId: string;
    onBack: () => void;
    onOpenChat?: (channelId: string) => void;
}

const SupplierManager: React.FC<SupplierManagerProps> = ({ language, userId, onBack, onOpenChat }) => {
    const [suppliers, setSuppliers] = useState<ProjectSupplier[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Add form state
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newCompany, setNewCompany] = useState('');
    const [newProject, setNewProject] = useState('فيلا الرياض — حي النرجس');
    const [newProjectId, setNewProjectId] = useState('proj_1');
    const [newExpiry, setNewExpiry] = useState(() => {
        const d = new Date(); d.setFullYear(d.getFullYear() + 1);
        return d.toISOString().split('T')[0];
    });
    const [newRenewal, setNewRenewal] = useState<RenewalMode>('manual');
    const [permChat, setPermChat] = useState(true);
    const [permInvoice, setPermInvoice] = useState(true);
    const [permPhotos, setPermPhotos] = useState(true);
    const [permForms, setPermForms] = useState(true);

    const isRtl = language === 'ar';
    const t = (ar: string, en: string) => { const m: Record<string, string> = { ar, en, fr: en, zh: en }; return m[language] || en; };

    useEffect(() => {
        projectSupplierService.initSampleData();
        loadSuppliers();
    }, []);

    const loadSuppliers = () => {
        projectSupplierService.checkExpiry();
        setSuppliers(projectSupplierService.getProjectSuppliers());
    };

    const handleAdd = () => {
        if (!newName.trim()) return;
        projectSupplierService.assignSupplier({
            supplierId: `sup_${Date.now()}`, supplierName: newName,
            supplierPhone: newPhone, supplierCompany: newCompany || newName,
            projectId: newProjectId, projectName: newProject,
            expiryDate: new Date(newExpiry).toISOString(), renewalMode: newRenewal,
            permissions: { chat: permChat, uploadInvoices: permInvoice, uploadPhotos: permPhotos, deliveryForms: permForms },
        });
        resetForm(); setShowAdd(false); loadSuppliers();
    };

    const handleRemove = (ps: ProjectSupplier) => {
        projectSupplierService.removeSupplier(ps.projectId, ps.supplierId);
        loadSuppliers();
    };

    const handleToggleActive = (ps: ProjectSupplier) => {
        projectSupplierService.updateSupplier(ps.id, { isActive: !ps.isActive });
        loadSuppliers();
    };

    const handleChangeRenewal = (ps: ProjectSupplier, mode: RenewalMode) => {
        projectSupplierService.updateSupplier(ps.id, { renewalMode: mode });
        loadSuppliers();
    };

    const handleRenewManual = (ps: ProjectSupplier) => {
        const newExp = new Date(); newExp.setFullYear(newExp.getFullYear() + 1);
        projectSupplierService.updateSupplier(ps.id, { expiryDate: newExp.toISOString(), isActive: true });
        loadSuppliers();
    };

    const handleTogglePerm = (ps: ProjectSupplier, perm: keyof ProjectSupplier['permissions']) => {
        const updated = { ...ps.permissions, [perm]: !ps.permissions[perm] };
        projectSupplierService.updateSupplier(ps.id, { permissions: updated });
        loadSuppliers();
    };

    const resetForm = () => {
        setNewName(''); setNewPhone(''); setNewCompany('');
        const d = new Date(); d.setFullYear(d.getFullYear() + 1);
        setNewExpiry(d.toISOString().split('T')[0]);
        setNewRenewal('manual');
        setPermChat(true); setPermInvoice(true); setPermPhotos(true); setPermForms(true);
    };

    const filtered = searchQuery
        ? suppliers.filter(s =>
            s.supplierName.includes(searchQuery) || s.supplierCompany.includes(searchQuery) ||
            s.supplierPhone.includes(searchQuery) || s.supplierId.includes(searchQuery)
        ) : suppliers;

    const getExpiryInfo = (ps: ProjectSupplier) => {
        const days = projectSupplierService.getDaysUntilExpiry(ps);
        if (days < 0) return { label: t('منتهي', 'Expired'), color: 'bg-red-500/15 text-red-400 border-red-500/20', dot: 'bg-red-500' };
        if (days <= 30) return { label: `${days} ${t('يوم', 'days')}`, color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', dot: 'bg-amber-500' };
        return { label: `${days} ${t('يوم', 'days')}`, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' };
    };

    // Stats
    const activeCount = suppliers.filter(s => s.isActive).length;
    const expiringSoon = suppliers.filter(s => s.isActive && projectSupplierService.getDaysUntilExpiry(s) <= 30 && projectSupplierService.getDaysUntilExpiry(s) >= 0).length;
    const expiredCount = suppliers.filter(s => projectSupplierService.getDaysUntilExpiry(s) < 0).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* ═══ Header ═══ */}
            <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-white">{t('إدارة الموردين', 'Supplier Management')}</h1>
                            <p className="text-[10px] sm:text-xs text-slate-400">{t('ربط · صلاحيات · تواصل · تجديد', 'Link · Permissions · Chat · Renew')}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowAdd(true)}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all">
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('إضافة مورد', 'Add')}</span>
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
                {/* ═══ Stats Summary ═══ */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] text-slate-400">{t('نشط', 'Active')}</span>
                        </div>
                        <span className="text-xl font-bold text-emerald-400">{activeCount}</span>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span className="text-[10px] text-slate-400">{t('ينتهي قريباً', 'Expiring')}</span>
                        </div>
                        <span className="text-xl font-bold text-amber-400">{expiringSoon}</span>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-[10px] text-slate-400">{t('منتهي', 'Expired')}</span>
                        </div>
                        <span className="text-xl font-bold text-red-400">{expiredCount}</span>
                    </div>
                </div>

                {/* ═══ Search ═══ */}
                <div className="relative">
                    <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t('بحث بالاسم أو الرقم أو الجوال...', 'Search by name, ID, or phone...')}
                        className={`w-full bg-slate-800/50 border border-slate-700/50 rounded-xl ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50`} />
                </div>

                {/* ═══ Suppliers List ═══ */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">{t('لا يوجد موردين مرتبطين', 'No linked suppliers')}</p>
                        <p className="text-slate-600 text-xs mt-1">{t('أضف مورد وربطه بمشروع', 'Add a supplier and link to a project')}</p>
                    </div>
                ) : filtered.map(ps => {
                    const expiry = getExpiryInfo(ps);
                    const isExpanded = expandedId === ps.id;
                    const days = projectSupplierService.getDaysUntilExpiry(ps);

                    return (
                        <div key={ps.id}
                            className={`bg-slate-800/40 border rounded-2xl overflow-hidden transition-all ${
                                !ps.isActive ? 'opacity-50 border-slate-700/20' :
                                days < 0 ? 'border-red-500/20' :
                                days <= 30 ? 'border-amber-500/20' : 'border-slate-700/30'
                            }`}>
                            {/* ── Card Header ── */}
                            <div className="p-3 sm:p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : ps.id)}>
                                <div className="flex items-center gap-3">
                                    {/* Avatar/Icon */}
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center shrink-0 border border-orange-500/10">
                                        <Truck className="w-5 h-5 text-orange-400" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-bold text-white truncate">{ps.supplierName}</p>
                                            {!ps.isActive && (
                                                <span className="px-1.5 py-0.5 bg-red-500/15 text-red-400 text-[9px] rounded font-medium">{t('معلّق', 'Suspended')}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                                            <span className="flex items-center gap-0.5"><Building2 className="w-2.5 h-2.5" />{ps.supplierCompany}</span>
                                            <span className="text-slate-600">·</span>
                                            <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{ps.supplierPhone}</span>
                                            <span className="text-slate-600">·</span>
                                            <span className="flex items-center gap-0.5">📁 {ps.projectName}</span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${expiry.color}`}>
                                            {expiry.label}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                            ps.renewalMode === 'auto' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700/50 text-slate-500'
                                        }`}>
                                            {ps.renewalMode === 'auto' ? '🔄 ' + t('تلقائي', 'Auto') : '✋ ' + t('يدوي', 'Manual')}
                                        </span>
                                    </div>
                                </div>

                                {/* Permission Pills (always visible) */}
                                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                                    {[
                                        { active: ps.permissions.chat, icon: <MessageCircle className="w-2.5 h-2.5" />, label: t('شات', 'Chat'), color: 'blue' },
                                        { active: ps.permissions.uploadInvoices, icon: <FileText className="w-2.5 h-2.5" />, label: t('فواتير', 'Invoices'), color: 'green' },
                                        { active: ps.permissions.uploadPhotos, icon: <Camera className="w-2.5 h-2.5" />, label: t('صور', 'Photos'), color: 'purple' },
                                        { active: ps.permissions.deliveryForms, icon: <Package className="w-2.5 h-2.5" />, label: t('تسليم', 'Delivery'), color: 'amber' },
                                    ].map((p, i) => (
                                        <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                                            p.active
                                                ? `bg-${p.color}-500/10 text-${p.color}-400`
                                                : 'bg-slate-700/30 text-slate-600 line-through'
                                        }`}>
                                            {p.icon}{p.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* ── Expanded Actions ── */}
                            {isExpanded && (
                                <div className="border-t border-slate-700/30 bg-slate-800/20 p-3 space-y-3">
                                    {/* Quick Actions Row */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {/* Chat Button */}
                                        {onOpenChat && ps.permissions.chat && (
                                            <button onClick={() => onOpenChat(`ch_sup_${ps.projectId}_${ps.supplierId}`)}
                                                className="py-2.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all">
                                                <MessageCircle className="w-4 h-4" /> {t('فتح الشات', 'Open Chat')}
                                            </button>
                                        )}

                                        {/* Toggle Renewal */}
                                        <button onClick={() => handleChangeRenewal(ps, ps.renewalMode === 'auto' ? 'manual' : 'auto')}
                                            className="py-2.5 bg-slate-700/40 text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-600/20 hover:bg-slate-600/40 transition-all">
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            {ps.renewalMode === 'auto' ? t('تحويل يدوي', 'Set Manual') : t('تحويل تلقائي', 'Set Auto')}
                                        </button>

                                        {/* Renew (if expired or inactive) */}
                                        {(!ps.isActive || days < 0) && (
                                            <button onClick={() => handleRenewManual(ps)}
                                                className="py-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all">
                                                <RefreshCw className="w-3.5 h-3.5" /> {t('تجديد سنة', 'Renew 1 Year')}
                                            </button>
                                        )}

                                        {/* Suspend/Activate */}
                                        <button onClick={() => handleToggleActive(ps)}
                                            className={`py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                                                ps.isActive
                                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                            }`}>
                                            {ps.isActive
                                                ? <><XCircle className="w-3.5 h-3.5" />{t('تعليق', 'Suspend')}</>
                                                : <><CheckCircle className="w-3.5 h-3.5" />{t('تفعيل', 'Activate')}</>
                                            }
                                        </button>
                                    </div>

                                    {/* Permissions Toggle */}
                                    <div>
                                        <p className="text-[10px] text-slate-500 mb-1.5">{t('تعديل الصلاحيات:', 'Edit Permissions:')}</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                            {([
                                                { key: 'chat' as const, icon: <MessageCircle className="w-3 h-3" />, label: t('شات', 'Chat'), color: 'blue' },
                                                { key: 'uploadInvoices' as const, icon: <FileText className="w-3 h-3" />, label: t('فواتير', 'Invoices'), color: 'green' },
                                                { key: 'uploadPhotos' as const, icon: <Camera className="w-3 h-3" />, label: t('صور', 'Photos'), color: 'purple' },
                                                { key: 'deliveryForms' as const, icon: <Package className="w-3 h-3" />, label: t('تسليم', 'Delivery'), color: 'amber' },
                                            ]).map(p => (
                                                <button key={p.key} onClick={() => handleTogglePerm(ps, p.key)}
                                                    className={`py-1.5 px-2 rounded-lg border text-[10px] font-medium flex items-center gap-1.5 transition-colors ${
                                                        ps.permissions[p.key]
                                                            ? `bg-${p.color}-500/10 text-${p.color}-400 border-${p.color}-500/20`
                                                            : 'bg-slate-700/20 text-slate-600 border-slate-700/20'
                                                    }`}>
                                                    {p.icon} {p.label}
                                                    {ps.permissions[p.key] && <CheckCircle className="w-2.5 h-2.5 ms-auto" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Details Row */}
                                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/20">
                                        <div className="text-[10px] text-slate-500 flex items-center gap-3">
                                            <span><Calendar className="w-3 h-3 inline mr-0.5" />{t('تاريخ الإضافة:', 'Added:')} {new Date(ps.assignedAt).toLocaleDateString('ar-SA')}</span>
                                            <span><Calendar className="w-3 h-3 inline mr-0.5" />{t('ينتهي:', 'Expires:')} {new Date(ps.expiryDate).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                        <button onClick={() => handleRemove(ps)}
                                            className="px-2.5 py-1 text-[10px] bg-red-500/10 text-red-400 rounded-lg flex items-center gap-1 hover:bg-red-500/20 transition-colors font-medium">
                                            <Trash2 className="w-3 h-3" /> {t('حذف', 'Delete')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ═══ Add Modal ═══ */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowAdd(false)}>
                    <div className="bg-slate-800 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Truck className="w-5 h-5 text-orange-400" />
                                {t('إضافة مورد للمشروع', 'Add Supplier to Project')}
                            </h3>
                            <button onClick={() => setShowAdd(false)} className="p-1.5 text-slate-500 hover:text-white rounded-lg"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-3">
                            {/* Supplier Info */}
                            <div className="bg-slate-700/20 rounded-xl p-3 space-y-3">
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{t('بيانات المورد', 'Supplier Info')}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-400 mb-0.5 block flex items-center gap-1"><Users className="w-3 h-3" />{t('اسم المورد *', 'Name *')}</label>
                                        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t('الاسم الكامل', 'Full name')}
                                            className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 mb-0.5 block flex items-center gap-1"><Phone className="w-3 h-3" />{t('رقم الجوال', 'Phone')}</label>
                                        <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="05xxxxxxxx" dir="ltr"
                                            className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 mb-0.5 block flex items-center gap-1"><Building2 className="w-3 h-3" />{t('اسم المؤسسة/الشركة', 'Company')}</label>
                                    <input value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder={t('اسم المؤسسة', 'Company name')}
                                        className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" />
                                </div>
                            </div>

                            {/* Expiry & Renewal */}
                            <div className="bg-slate-700/20 rounded-xl p-3 space-y-3">
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{t('الصلاحية والتجديد', 'Expiry & Renewal')}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-400 mb-0.5 block flex items-center gap-1"><Calendar className="w-3 h-3" />{t('تاريخ الانتهاء', 'Expiry Date')}</label>
                                        <input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)}
                                            className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 mb-0.5 block">{t('نوع التجديد', 'Renewal Type')}</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setNewRenewal('manual')}
                                                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${newRenewal === 'manual' ? 'bg-slate-600 text-white border-slate-500' : 'bg-slate-700/30 text-slate-400 border-slate-600/20'}`}>
                                                ✋ {t('يدوي', 'Manual')}
                                            </button>
                                            <button onClick={() => setNewRenewal('auto')}
                                                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${newRenewal === 'auto' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-slate-700/30 text-slate-400 border-slate-600/20'}`}>
                                                🔄 {t('تلقائي', 'Auto')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="bg-slate-700/20 rounded-xl p-3">
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-2">{t('الصلاحيات', 'Permissions')}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'chat', val: permChat, set: setPermChat, icon: <MessageCircle className="w-3.5 h-3.5" />, label: t('شات ومحادثة', 'Chat'), color: 'blue' },
                                        { key: 'invoice', val: permInvoice, set: setPermInvoice, icon: <FileText className="w-3.5 h-3.5" />, label: t('فواتير ومستندات', 'Invoices'), color: 'green' },
                                        { key: 'photos', val: permPhotos, set: setPermPhotos, icon: <Camera className="w-3.5 h-3.5" />, label: t('صور الموقع', 'Site Photos'), color: 'purple' },
                                        { key: 'forms', val: permForms, set: setPermForms, icon: <Package className="w-3.5 h-3.5" />, label: t('نماذج التسليم', 'Delivery Forms'), color: 'amber' },
                                    ].map(p => (
                                        <button key={p.key} onClick={() => p.set(!p.val)}
                                            className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                                                p.val ? `bg-${p.color}-500/10 text-${p.color}-400 border-${p.color}-500/20` : 'bg-slate-700/20 text-slate-500 border-slate-600/15'
                                            }`}>
                                            {p.icon} {p.label}
                                            {p.val && <CheckCircle className="w-3 h-3 ms-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleAdd} disabled={!newName.trim()}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${
                                    newName.trim()
                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 active:scale-[0.98]'
                                        : 'bg-slate-700 text-slate-500'
                                }`}>
                                <Plus className="w-4 h-4" /> {t('إضافة المورد وربطه بالمشروع', 'Add & Link Supplier')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierManager;
