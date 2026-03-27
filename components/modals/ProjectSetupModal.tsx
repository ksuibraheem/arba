/**
 * ProjectSetupModal — نافذة إعداد المشروع وبيانات العميل
 *
 * Collects project & client information before opening the pricing engine.
 * Features:
 *  - Client type: Individual / Company / Tender / Government
 *  - Multiple clients per project
 *  - Skip option — user can go directly to pricer and fill data later
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, User, Building2, FileText, Landmark, ChevronRight, ArrowLeft } from 'lucide-react';
import PhoneInput, { PhoneValue } from '../ui/PhoneInput';

// ─── Types ───────────────────────────────────────

export type ClientType = 'individual' | 'company' | 'tender' | 'government';

export interface ClientEntry {
    id: string;
    type: ClientType;
    name: string;
    phone: string;
    email: string;
    crNumber?: string;       // رقم السجل التجاري
    tenderNumber?: string;   // رقم المناقصة
    notes?: string;
}

export interface ProjectSetupData {
    projectName: string;
    location: string;
    clients: ClientEntry[];
    skipped: boolean;
}

interface ProjectSetupModalProps {
    language: 'ar' | 'en';
    onConfirm: (data: ProjectSetupData) => void;
    onClose: () => void;
}

// ─── Client type config ────────────────────────

const CLIENT_TYPES: { id: ClientType; icon: React.FC<any>; label: { ar: string; en: string }; color: string }[] = [
    { id: 'individual', icon: User, label: { ar: 'فرد', en: 'Individual' }, color: 'emerald' },
    { id: 'company',    icon: Building2, label: { ar: 'شركة', en: 'Company' }, color: 'blue' },
    { id: 'tender',     icon: FileText, label: { ar: 'مناقصة', en: 'Tender' }, color: 'violet' },
    { id: 'government', icon: Landmark, label: { ar: 'جهة حكومية', en: 'Government' }, color: 'amber' },
];

const colorMap: Record<string, { bg: string; border: string; text: string; ring: string }> = {
    emerald : { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
    blue    : { bg: 'bg-blue-500/10',    border: 'border-blue-500/40',    text: 'text-blue-400',    ring: 'ring-blue-500/30' },
    violet  : { bg: 'bg-violet-500/10',  border: 'border-violet-500/40',  text: 'text-violet-400',  ring: 'ring-violet-500/30' },
    amber   : { bg: 'bg-amber-500/10',   border: 'border-amber-500/40',   text: 'text-amber-400',   ring: 'ring-amber-500/30' },
};

// ─── Helpers ─────────────────────────────────────

const makeClient = (): ClientEntry & { phoneValue: PhoneValue } => ({
    id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: 'individual',
    name: '', phone: '', email: '',
    phoneValue: { dial: '+966', subscriber: '', full: '', valid: null },
});

// ─── Component ───────────────────────────────────

const ProjectSetupModal: React.FC<ProjectSetupModalProps> = ({ language, onConfirm, onClose }) => {
    const isAr = language === 'ar';
    const t = (ar: string, en: string) => isAr ? ar : en;

    const [projectName, setProjectName] = useState('');
    const [location, setLocation] = useState('');
    const [clients, setClients] = useState<(ClientEntry & { phoneValue: PhoneValue })[]>([makeClient()]);

    // ── Client helpers ──────────────────────────

    const updateClient = (id: string, field: keyof ClientEntry | 'phoneValue', value: any) => {
        setClients(prev => prev.map(c => {
            if (c.id !== id) return c;
            if (field === 'phoneValue') {
                return { ...c, phoneValue: value, phone: (value as PhoneValue).full };
            }
            return { ...c, [field]: value };
        }));
    };

    const addClient = () => setClients(prev => [...prev, makeClient()]);

    const removeClient = (id: string) => {
        setClients(prev => prev.length > 1 ? prev.filter(c => c.id !== id) : prev);
    };

    // ── Submit ──────────────────────────────────

    const handleConfirm = (skip: boolean) => {
        onConfirm({
            projectName: projectName.trim() || t('مشروع جديد', 'New Project'),
            location: location.trim(),
            clients: skip ? [] : clients,
            skipped: skip,
        });
    };

    // ── Render ──────────────────────────────────

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div
                className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                dir={isAr ? 'rtl' : 'ltr'}
            >
                {/* ── Header ── */}
                <div className="px-7 pt-7 pb-5 border-b border-slate-800 flex items-start justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                            {t('إعداد المشروع', 'Project Setup')}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            {t('أدخل بيانات المشروع والعميل قبل فتح المُسعّر', 'Enter project & client info before opening the pricer')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="overflow-y-auto flex-1 px-7 py-6 space-y-6" style={{ scrollbarWidth: 'none' }}>

                    {/* ─ Project Info ─ */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1 h-4 bg-emerald-500 rounded-full inline-block" />
                            {t('معلومات المشروع', 'Project Info')}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">{t('اسم المشروع', 'Project Name')}</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={e => setProjectName(e.target.value)}
                                    placeholder={t('مشروع جديد', 'New Project')}
                                    className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">{t('الموقع / المدينة', 'Location / City')}</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    placeholder={t('الرياض', 'Riyadh')}
                                    className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ─ Clients ─ */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
                                {t('بيانات العميل', 'Client Info')}
                                {clients.length > 1 && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-bold">
                                        {clients.length} {t('عملاء', 'clients')}
                                    </span>
                                )}
                            </h3>
                            <button
                                onClick={addClient}
                                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                {t('إضافة عميل آخر', 'Add client')}
                            </button>
                        </div>

                        {clients.map((client, idx) => {
                            const typeConfig = CLIENT_TYPES.find(ct => ct.id === client.type)!;
                            const colors = colorMap[typeConfig.color];

                            return (
                                <div key={client.id} className="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5 space-y-4">
                                    {/* Client header */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 font-medium">
                                            {t(`العميل ${idx + 1}`, `Client ${idx + 1}`)}
                                        </span>
                                        {clients.length > 1 && (
                                            <button
                                                onClick={() => removeClient(client.id)}
                                                className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Client type selector */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {CLIENT_TYPES.map(ct => {
                                            const isSelected = client.type === ct.id;
                                            const c = colorMap[ct.color];
                                            const Icon = ct.icon;
                                            return (
                                                <button
                                                    key={ct.id}
                                                    onClick={() => updateClient(client.id, 'type', ct.id)}
                                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all ${
                                                        isSelected
                                                            ? `${c.bg} ${c.border} ${c.text} ring-1 ${c.ring}`
                                                            : 'bg-slate-800/50 border-slate-700/40 text-slate-400 hover:border-slate-600'
                                                    }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {ct.label[language]}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Fields */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-xs text-slate-400 mb-1">
                                                {t('اسم العميل / الجهة', 'Client / Entity Name')}
                                            </label>
                                            <input
                                                type="text"
                                                value={client.name}
                                                onChange={e => updateClient(client.id, 'name', e.target.value)}
                                                placeholder={
                                                    client.type === 'individual' ? t('محمد العلي', 'Mohammed Al-Ali') :
                                                    client.type === 'company'    ? t('شركة التطوير العمراني', 'Urban Development Co.') :
                                                    client.type === 'tender'     ? t('مناقصة رقم ...', 'Tender No. ...') :
                                                    t('وزارة الإسكان', 'Ministry of Housing')
                                                }
                                                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-slate-500 transition-all"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs text-slate-400 mb-1">
                                                {t('رقم التواصل', 'Phone')}
                                                <span className="ms-1 text-slate-600 font-normal">{t('(اختياري)', '(optional)')}</span>
                                            </label>
                                            <PhoneInput
                                                language={language}
                                                value={(client as any).phoneValue}
                                                onChange={v => updateClient(client.id, 'phoneValue', v)}
                                                optional
                                            />
                                            {(client as any).phoneValue?.valid === false && (
                                                <p className="text-red-400 text-[10px] mt-1">
                                                    {t('صيغة الرقم غير صحيحة لهذا البلد', 'Invalid number format for this country')}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">{t('البريد الإلكتروني', 'Email')}</label>
                                            <input
                                                type="email"
                                                value={client.email}
                                                onChange={e => updateClient(client.id, 'email', e.target.value)}
                                                placeholder="example@email.com"
                                                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-slate-500 transition-all"
                                            />
                                        </div>

                                        {/* Conditional extra fields */}
                                        {(client.type === 'company') && (
                                            <div className="col-span-2">
                                                <label className="block text-xs text-slate-400 mb-1">{t('رقم السجل التجاري', 'CR Number')}</label>
                                                <input
                                                    type="text"
                                                    value={client.crNumber || ''}
                                                    onChange={e => updateClient(client.id, 'crNumber', e.target.value)}
                                                    placeholder="1010xxxxxxx"
                                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-slate-500 transition-all"
                                                />
                                            </div>
                                        )}
                                        {(client.type === 'tender') && (
                                            <div className="col-span-2">
                                                <label className="block text-xs text-slate-400 mb-1">{t('رقم المناقصة', 'Tender Number')}</label>
                                                <input
                                                    type="text"
                                                    value={client.tenderNumber || ''}
                                                    onChange={e => updateClient(client.id, 'tenderNumber', e.target.value)}
                                                    placeholder={t('MRN-2026-XXXX', 'MRN-2026-XXXX')}
                                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-slate-500 transition-all"
                                                />
                                            </div>
                                        )}
                                        <div className="col-span-2">
                                            <label className="block text-xs text-slate-400 mb-1">{t('ملاحظات إضافية', 'Notes')}</label>
                                            <textarea
                                                value={client.notes || ''}
                                                onChange={e => updateClient(client.id, 'notes', e.target.value)}
                                                rows={2}
                                                placeholder={t('أي ملاحظات أو اشتراطات خاصة...', 'Any special requirements or notes...')}
                                                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-slate-500 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                </div>

                {/* ── Footer ── */}
                <div className="px-7 py-5 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/80 backdrop-blur-sm">
                    {/* Skip */}
                    <button
                        onClick={() => handleConfirm(true)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors font-medium"
                    >
                        <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                        {t('تخطي وفتح المُسعّر', 'Skip & Open Pricer')}
                    </button>

                    {/* Confirm */}
                    <button
                        onClick={() => handleConfirm(false)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        {t('حفظ وفتح المُسعّر', 'Save & Open Pricer')}
                        <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectSetupModal;
