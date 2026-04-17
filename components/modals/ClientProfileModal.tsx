import { Language } from '../../types';
/**
 * ClientProfileModal — صفحة ملف العميل التفصيلية
 *
 * Features:
 *  - Tab 1: Basic info + Logo upload
 *  - Tab 2: Documents with upload/download/delete + expiry tracking
 *  - Tab 3: Employees (companies only) with permissions & seat limits
 *  - Tab 4: Linked projects
 */

import React, { useState, useRef } from 'react';
import {
    ArbaClient, ClientDocument, DocumentType, ClientType,
    DOCUMENT_LABELS, getDocumentStatus, generateId,
    EmployeePermission, EMPLOYEE_PERMISSION_LABELS,
    PLAN_EMPLOYEE_LIMITS, EXTRA_SEAT_PRICE_SAR, SubscriptionPlan,
} from '../../services/projectTypes';
import * as documentService from '../../services/documentService';
import * as clientService from '../../services/clientService';
import * as employeeService from '../../services/employeeService';
import { getCurrentPlan } from '../../services/subscriptionService';

// ─── Props ───────────────────────────────────────
interface ClientProfileModalProps {
    client: ArbaClient;
    language: Language;
    onClose: () => void;
    onClientUpdated: (updated: ArbaClient) => void;
}

// ─── Document templates per client type ──────────
const COMPANY_DOC_TYPES: DocumentType[] = [
    'commercial_registration', 'national_address', 'vat_certificate',
    'chamber_of_commerce', 'saudization', 'gosi', 'qiwa', 'muqeem',
    'municipal_license', 'momra_license', 'contractor_classification',
    'engineering_license', 'bank_certificate', 'zakat_certificate',
    'insurance_certificate',
];

const INDIVIDUAL_DOC_TYPES: DocumentType[] = [
    'national_id', 'freelance_certificate', 'engineering_license',
    'bank_certificate',
];

const CLIENT_TYPE_LABELS: Record<ClientType, { ar: string; en: string }> = {
    individual: { ar: 'فرد', en: 'Individual' },
    company: { ar: 'شركة', en: 'Company' },
    tender: { ar: 'مناقصة', en: 'Tender' },
    government: { ar: 'جهة حكومية', en: 'Government' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: { ar: string; en: string } }> = {
    valid: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: { ar: 'ساري', en: 'Valid' } },
    expiring_soon: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: { ar: 'قارب الانتهاء', en: 'Expiring Soon' } },
    expired: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: { ar: 'منتهي', en: 'Expired' } },
    no_expiry: { bg: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-400', label: { ar: 'بدون انتهاء', en: 'No Expiry' } },
};

// ─── Component ───────────────────────────────────
const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
    client: initialClient, language, onClose, onClientUpdated
}) => {
    const isAr = language === 'ar';
    const [client, setClient] = useState<ArbaClient>({ ...initialClient, documents: initialClient.documents || [], employees: initialClient.employees || [] });
    const [tab, setTab] = useState<'info' | 'docs' | 'employees' | 'projects'>('info');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Employee State ────────────────────────
    const [showEmpForm, setShowEmpForm] = useState(false);
    const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
    const [empForm, setEmpForm] = useState({ name: '', username: '', password: '', permissions: [] as EmployeePermission[] });
    const [empSaving, setEmpSaving] = useState(false);
    const [empError, setEmpError] = useState('');
    const currentPlan: SubscriptionPlan = getCurrentPlan();
    const [activeDocUpload, setActiveDocUpload] = useState<string | null>(null);

    // ─── Info Form ──────────────────────────────
    const [form, setForm] = useState({
        name: client.name,
        clientType: client.clientType || 'individual' as ClientType,
        phone: client.phone,
        email: client.email,
        company: client.company || '',
        cr: client.cr || '',
        vat: client.vat || '',
        nationalId: client.nationalId || '',
        address: client.address || '',
        city: client.city || '',
        notes: client.notes || '',
    });

    const handleSaveInfo = async () => {
        setSaving(true);
        try {
            await clientService.updateClient(client.id, {
                ...form,
                clientType: form.clientType,
            });
            const updated = { ...client, ...form };
            setClient(updated);
            onClientUpdated(updated);
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    // ─── Logo ───────────────────────────────────
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading('logo');
        try {
            const result = await documentService.updateClientLogo(client.id, file, client.logoStoragePath);
            const updated = { ...client, logoUrl: result.logoUrl, logoStoragePath: result.logoStoragePath };
            setClient(updated);
            onClientUpdated(updated);
        } catch (err) {
            console.error('Logo upload error:', err);
        } finally {
            setUploading(null);
        }
    };

    const handleRemoveLogo = async () => {
        if (!client.logoStoragePath) return;
        setUploading('logo');
        try {
            await documentService.removeClientLogo(client.id, client.logoStoragePath);
            const updated = { ...client, logoUrl: undefined, logoStoragePath: undefined };
            setClient(updated);
            onClientUpdated(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(null);
        }
    };

    // ─── Documents ──────────────────────────────
    const docTypes = (form.clientType === 'company' || form.clientType === 'tender' || form.clientType === 'government')
        ? COMPANY_DOC_TYPES
        : INDIVIDUAL_DOC_TYPES;

    const getDoc = (type: DocumentType) => client.documents.find(d => d.type === type);

    const handleDocFileUpload = async (type: DocumentType, file: File) => {
        const existingDoc = getDoc(type);
        const docId = existingDoc?.id || generateId();

        setUploading(docId);
        try {
            // Delete old file if replacing
            if (existingDoc?.storagePath) {
                await documentService.deleteFile(existingDoc.storagePath);
            }

            const uploadResult = await documentService.uploadClientFile(client.id, file, type, docId);

            const newDoc: ClientDocument = {
                ...(existingDoc || { id: docId, type }),
                fileUrl: uploadResult.fileUrl,
                storagePath: uploadResult.storagePath,
                fileName: uploadResult.fileName,
                fileSize: uploadResult.fileSize,
            };

            const updatedDocs = await documentService.saveClientDocument(client.id, client.documents, newDoc);
            const updated = { ...client, documents: updatedDocs };
            setClient(updated);
            onClientUpdated(updated);
        } catch (err) {
            console.error('Doc upload error:', err);
        } finally {
            setUploading(null);
            setActiveDocUpload(null);
        }
    };

    const handleDocMetaUpdate = async (type: DocumentType, field: string, value: string) => {
        const existingDoc = getDoc(type);
        const docId = existingDoc?.id || generateId();
        const newDoc: ClientDocument = {
            ...(existingDoc || { id: docId, type }),
            [field]: value,
        };
        const updatedDocs = await documentService.saveClientDocument(client.id, client.documents, newDoc);
        const updated = { ...client, documents: updatedDocs };
        setClient(updated);
        onClientUpdated(updated);
    };

    const handleDeleteDoc = async (docId: string) => {
        if (!confirm(isAr ? 'حذف هذه الوثيقة؟' : 'Delete this document?')) return;
        try {
            const updatedDocs = await documentService.removeClientDocument(client.id, client.documents, docId);
            const updated = { ...client, documents: updatedDocs };
            setClient(updated);
            onClientUpdated(updated);
        } catch (err) {
            console.error(err);
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const expiredCount = client.documents.filter(d => getDocumentStatus(d) === 'expired').length;
    const expiringCount = client.documents.filter(d => getDocumentStatus(d) === 'expiring_soon').length;

    // ─── Employee Handlers ──────────────────────
    const isCompanyType = form.clientType === 'company' || form.clientType === 'tender' || form.clientType === 'government';
    const seatsInfo = employeeService.getSeatsInfo(client, currentPlan);
    const ALL_PERMS: EmployeePermission[] = ['pricing', 'print', 'download', 'upload', 'view_docs', 'edit_info', 'manage_projects'];

    const togglePerm = (p: EmployeePermission) => {
        setEmpForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(p)
                ? prev.permissions.filter(x => x !== p)
                : [...prev.permissions, p],
        }));
    };

    const handleAddEmployee = async () => {
        if (!empForm.name || !empForm.username || (!editingEmpId && !empForm.password)) return;
        setEmpSaving(true);
        setEmpError('');
        try {
            let updatedEmployees;
            if (editingEmpId) {
                updatedEmployees = await employeeService.updateEmployee(
                    client.id, client.employees, editingEmpId,
                    { name: empForm.name, permissions: empForm.permissions, newPassword: empForm.password || undefined }
                );
            } else {
                const check = employeeService.canAddEmployee(client.employees, currentPlan);
                if (!check.allowed) {
                    setEmpError(check.reason?.[language] || '');
                    setEmpSaving(false);
                    return;
                }
                updatedEmployees = await employeeService.addEmployee(
                    client.id, client.employees,
                    { name: empForm.name, username: empForm.username, password: empForm.password, permissions: empForm.permissions }
                );
            }
            const updated = { ...client, employees: updatedEmployees };
            setClient(updated);
            onClientUpdated(updated);
            setShowEmpForm(false);
            setEditingEmpId(null);
            setEmpForm({ name: '', username: '', password: '', permissions: [] });
        } catch (err: any) {
            setEmpError(err.message === 'USERNAME_EXISTS' ? (isAr ? 'اسم المستخدم موجود مسبقاً' : 'Username already exists') : (isAr ? 'حدث خطأ' : 'An error occurred'));
        } finally {
            setEmpSaving(false);
        }
    };

    const handleEditEmployee = (emp: any) => {
        setEditingEmpId(emp.id);
        setEmpForm({ name: emp.name, username: emp.username, password: '', permissions: [...emp.permissions] });
        setShowEmpForm(true);
        setEmpError('');
    };

    const handleDeleteEmployee = async (empId: string) => {
        if (!confirm(isAr ? 'حذف هذا الموظف؟' : 'Remove this employee?')) return;
        try {
            const updatedEmployees = await employeeService.removeEmployee(client.id, client.employees, empId);
            const updated = { ...client, employees: updatedEmployees };
            setClient(updated);
            onClientUpdated(updated);
        } catch (err) { console.error(err); }
    };

    const handleToggleActive = async (empId: string, isActive: boolean) => {
        try {
            const updatedEmployees = await employeeService.updateEmployee(client.id, client.employees, empId, { isActive });
            const updated = { ...client, employees: updatedEmployees };
            setClient(updated);
            onClientUpdated(updated);
        } catch (err) { console.error(err); }
    };

    // ═══════════════════════════════ RENDER ═══════════════════════════════
    const TABS = [
        { id: 'info' as const, icon: '📋', label: { ar: 'البيانات', en: 'Info' } },
        { id: 'docs' as const, icon: '📄', label: { ar: 'الوثائق', en: 'Documents' }, badge: expiredCount + expiringCount },
        ...(isCompanyType ? [{ id: 'employees' as const, icon: '👔', label: { ar: 'الموظفين', en: 'Employees' }, badge: seatsInfo.activeCount }] : []),
        { id: 'projects' as const, icon: '📁', label: { ar: 'المشاريع', en: 'Projects' }, badge: (client.projectIds || []).length },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">

                {/* ─── Header ─── */}
                <div className="flex items-center gap-4 p-5 border-b border-white/5 flex-shrink-0">
                    {/* Logo */}
                    <div
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-all overflow-hidden flex-shrink-0 group relative"
                        onClick={() => logoInputRef.current?.click()}
                    >
                        {uploading === 'logo' ? (
                            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        ) : client.logoUrl ? (
                            <img src={client.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl text-slate-500 group-hover:text-emerald-400 transition-colors">📷</span>
                        )}
                        {client.logoUrl && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveLogo(); }}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >✕</button>
                        )}
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />

                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-white truncate">{client.name || (isAr ? 'عميل جديد' : 'New Client')}</h2>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${form.clientType === 'company' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                form.clientType === 'government' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                                    form.clientType === 'tender' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                        'bg-teal-500/10 text-teal-400 border-teal-500/30'
                                }`}>
                                {CLIENT_TYPE_LABELS[form.clientType]?.[language]}
                            </span>
                            {expiredCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                                    {expiredCount} {isAr ? 'منتهي' : 'expired'}
                                </span>
                            )}
                            {expiringCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                    {expiringCount} {isAr ? 'قارب الانتهاء' : 'expiring'}
                                </span>
                            )}
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xl flex-shrink-0">✕</button>
                </div>

                {/* ─── Tabs ─── */}
                <div className="flex border-b border-white/5 px-5 flex-shrink-0">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${tab === t.id ? 'text-white border-emerald-400' : 'text-slate-500 border-transparent hover:text-slate-300'
                                }`}
                        >
                            <span>{t.icon}</span>
                            <span>{t.label[language]}</span>
                            {(t.badge ?? 0) > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${t.id === 'docs' && expiredCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
                                    }`}>{t.badge}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ─── Content ─── */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">

                    {/* ═══ TAB: INFO ═══ */}
                    {tab === 'info' && (
                        <div className="space-y-4">
                            {/* Client Type */}
                            <div>
                                <label className="text-xs text-slate-400 mb-2 block font-medium">{isAr ? 'نوع العميل' : 'Client Type'}</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {(Object.keys(CLIENT_TYPE_LABELS) as ClientType[]).map(ct => (
                                        <button
                                            key={ct}
                                            onClick={() => setForm(f => ({ ...f, clientType: ct }))}
                                            className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.clientType === ct
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                                                : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:border-slate-500'
                                                }`}
                                        >
                                            {CLIENT_TYPE_LABELS[ct][language]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { key: 'name', label: isAr ? 'الاسم *' : 'Name *', type: 'text' },
                                    { key: 'phone', label: isAr ? 'الجوال' : 'Phone', type: 'tel' },
                                    { key: 'email', label: isAr ? 'البريد' : 'Email', type: 'email' },
                                    { key: 'company', label: isAr ? 'اسم الشركة' : 'Company', type: 'text', show: form.clientType !== 'individual' },
                                    { key: 'cr', label: isAr ? 'رقم السجل التجاري' : 'CR Number', type: 'text', show: form.clientType !== 'individual' },
                                    { key: 'vat', label: isAr ? 'الرقم الضريبي' : 'VAT Number', type: 'text' },
                                    { key: 'nationalId', label: isAr ? 'رقم الهوية / الإقامة' : 'National ID / Iqama', type: 'text', show: form.clientType === 'individual' },
                                    { key: 'city', label: isAr ? 'المدينة' : 'City', type: 'text' },
                                    { key: 'address', label: isAr ? 'العنوان' : 'Address', type: 'text' },
                                ].filter(f => f.show !== false).map(field => (
                                    <div key={field.key}>
                                        <label className="text-xs text-slate-400 mb-1 block">{field.label}</label>
                                        <input
                                            type={field.type}
                                            value={(form as any)[field.key]}
                                            onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            dir={field.type === 'tel' ? 'ltr' : isAr ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">{isAr ? 'ملاحظات' : 'Notes'}</label>
                                <textarea
                                    value={form.notes}
                                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500/50 h-20 resize-none transition-colors"
                                    dir={isAr ? 'rtl' : 'ltr'}
                                />
                            </div>

                            <button
                                onClick={handleSaveInfo}
                                disabled={saving || !form.name}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium text-sm disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                            >
                                {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? '💾 حفظ البيانات' : '💾 Save Info')}
                            </button>
                        </div>
                    )}

                    {/* ═══ TAB: DOCUMENTS ═══ */}
                    {tab === 'docs' && (
                        <div className="space-y-3">
                            <p className="text-slate-400 text-xs mb-2">
                                {isAr ? 'ارفع الوثائق وحدد تواريخ البداية والانتهاء لتتبع التجديد' : 'Upload documents and set issue/expiry dates to track renewals'}
                            </p>

                            {docTypes.map(type => {
                                const docData = getDoc(type);
                                const status = docData ? getDocumentStatus(docData) : null;
                                const statusStyle = status ? STATUS_STYLES[status] : null;

                                return (
                                    <div key={type} className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-4 hover:border-slate-600 transition-all">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="text-lg">📄</span>
                                                <div className="min-w-0">
                                                    <h4 className="text-white font-medium text-sm truncate">{DOCUMENT_LABELS[type][language]}</h4>
                                                    {docData?.fileName && (
                                                        <p className="text-slate-500 text-[11px] truncate">{docData.fileName} • {formatFileSize(docData.fileSize)}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {statusStyle && (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle.bg} ${statusStyle.text}`}>
                                                        {statusStyle.label[language]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dates + Number row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                                            <div>
                                                <label className="text-[10px] text-slate-500 block mb-0.5">{isAr ? 'رقم الوثيقة' : 'Doc Number'}</label>
                                                <input
                                                    type="text"
                                                    value={docData?.number || ''}
                                                    onChange={e => handleDocMetaUpdate(type, 'number', e.target.value)}
                                                    placeholder="---"
                                                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white text-xs focus:outline-none focus:border-slate-500"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-500 block mb-0.5">{isAr ? 'تاريخ الإصدار' : 'Issue Date'}</label>
                                                <input
                                                    type="date"
                                                    value={docData?.issueDate || ''}
                                                    onChange={e => handleDocMetaUpdate(type, 'issueDate', e.target.value)}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white text-xs focus:outline-none focus:border-slate-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-500 block mb-0.5">{isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
                                                <input
                                                    type="date"
                                                    value={docData?.expiryDate || ''}
                                                    onChange={e => handleDocMetaUpdate(type, 'expiryDate', e.target.value)}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white text-xs focus:outline-none focus:border-slate-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Upload */}
                                            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer transition-all">
                                                {uploading === (docData?.id || type) ? (
                                                    <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <span>📤</span>
                                                )}
                                                <span>{docData?.fileUrl ? (isAr ? 'استبدال' : 'Replace') : (isAr ? 'رفع ملف' : 'Upload')}</span>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    className="hidden"
                                                    onChange={e => {
                                                        const f = e.target.files?.[0];
                                                        if (f) handleDocFileUpload(type, f);
                                                    }}
                                                />
                                            </label>

                                            {/* Download */}
                                            {docData?.fileUrl && (
                                                <a
                                                    href={docData.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20 hover:border-blue-500/40 transition-all"
                                                >
                                                    <span>📥</span>
                                                    <span>{isAr ? 'تحميل' : 'Download'}</span>
                                                </a>
                                            )}

                                            {/* Delete */}
                                            {docData && (
                                                <button
                                                    onClick={() => handleDeleteDoc(docData.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20 hover:border-red-500/40 transition-all"
                                                >
                                                    <span>🗑</span>
                                                    <span>{isAr ? 'حذف' : 'Delete'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Custom document slot */}
                            <div className="rounded-xl border-2 border-dashed border-slate-700/60 p-4 text-center hover:border-emerald-500/30 transition-all">
                                <label className="cursor-pointer">
                                    <span className="text-2xl block mb-1">➕</span>
                                    <span className="text-slate-400 text-sm font-medium">{isAr ? 'إضافة وثيقة مخصصة' : 'Add Custom Document'}</span>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        className="hidden"
                                        onChange={e => {
                                            const f = e.target.files?.[0];
                                            if (f) handleDocFileUpload('custom', f);
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* ═══ TAB: EMPLOYEES ═══ */}
                    {tab === 'employees' && isCompanyType && (
                        <div className="space-y-4">
                            {/* Seat Counter */}
                            <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-4 flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <p className="text-white text-sm font-bold">
                                        {isAr ? '👔 المقاعد' : '👔 Seats'}: {seatsInfo.activeCount} / {seatsInfo.freeSeats}
                                    </p>
                                    <p className="text-slate-400 text-xs">
                                        {isAr
                                            ? `الباقة الحالية تشمل ${seatsInfo.maxFree} مستخدمين`
                                            : `Current plan includes ${seatsInfo.maxFree} users`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {seatsInfo.extraSeats > 0 && (
                                        <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                            +{seatsInfo.extraSeats} {isAr ? 'إضافي' : 'extra'} = {seatsInfo.extraCost} {isAr ? 'ر.س/شهر' : 'SAR/mo'}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => { setShowEmpForm(true); setEditingEmpId(null); setEmpForm({ name: '', username: '', password: '', permissions: [] }); setEmpError(''); }}
                                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-medium hover:shadow-lg transition-all"
                                    >
                                        {isAr ? '+ موظف جديد' : '+ New Employee'}
                                    </button>
                                </div>
                            </div>

                            {/* Plan info */}
                            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3 text-xs text-blue-300">
                                <p className="font-bold mb-1">💡 {isAr ? 'باقات الموظفين' : 'Employee Plans'}:</p>
                                <ul className="space-y-0.5 text-blue-300/80">
                                    <li>{isAr ? '• الأساسية: 1 موظف إضافي (ضمن الاشتراك)' : '• Basic: 1 extra employee (included)'}</li>
                                    <li>{isAr ? '• المتقدمة: حتى 4 مستخدمين بـ 299 ر.س/شهر' : '• Pro: up to 4 users for 299 SAR/mo'}</li>
                                    <li>{isAr ? '• المؤسسات: حتى 10 مستخدمين بـ 599 ر.س/شهر' : '• Enterprise: up to 10 users for 599 SAR/mo'}</li>
                                    <li>{isAr ? `• كل موظف إضافي: ${EXTRA_SEAT_PRICE_SAR} ر.س/شهر` : `• Extra seat: ${EXTRA_SEAT_PRICE_SAR} SAR/mo each`}</li>
                                </ul>
                            </div>

                            {/* Add/Edit Form */}
                            {showEmpForm && (
                                <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-5 space-y-4">
                                    <h4 className="text-white font-bold text-sm">
                                        {editingEmpId ? (isAr ? '✏️ تعديل موظف' : '✏️ Edit Employee') : (isAr ? '👔 إضافة موظف' : '👔 Add Employee')}
                                    </h4>

                                    {empError && (
                                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-xs">{empError}</div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[10px] text-slate-500 block mb-1">{isAr ? 'اسم الموظف *' : 'Employee Name *'}</label>
                                            <input
                                                type="text" value={empForm.name}
                                                onChange={e => setEmpForm(p => ({ ...p, name: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 block mb-1">{isAr ? 'اسم المستخدم *' : 'Username *'}</label>
                                            <input
                                                type="text" value={empForm.username} dir="ltr"
                                                onChange={e => setEmpForm(p => ({ ...p, username: e.target.value.replace(/\s/g, '') }))}
                                                disabled={!!editingEmpId}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 block mb-1">
                                                {editingEmpId ? (isAr ? 'كلمة مرور جديدة (اختياري)' : 'New Password (optional)') : (isAr ? 'كلمة المرور *' : 'Password *')}
                                            </label>
                                            <input
                                                type="password" value={empForm.password} dir="ltr"
                                                onChange={e => setEmpForm(p => ({ ...p, password: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Permissions */}
                                    <div>
                                        <label className="text-[10px] text-slate-500 block mb-2">{isAr ? 'الصلاحيات' : 'Permissions'}</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {ALL_PERMS.map(p => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => togglePerm(p)}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${empForm.permissions.includes(p)
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                                                        : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:border-slate-500'
                                                        }`}
                                                >
                                                    <span>{EMPLOYEE_PERMISSION_LABELS[p].icon}</span>
                                                    <span>{EMPLOYEE_PERMISSION_LABELS[p][language]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddEmployee}
                                            disabled={empSaving || !empForm.name || !empForm.username || (!editingEmpId && !empForm.password)}
                                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all"
                                        >
                                            {empSaving ? '...' : editingEmpId ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'إضافة' : 'Add')}
                                        </button>
                                        <button
                                            onClick={() => { setShowEmpForm(false); setEditingEmpId(null); setEmpError(''); }}
                                            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-sm hover:text-white transition-colors"
                                        >
                                            {isAr ? 'إلغاء' : 'Cancel'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Employee List */}
                            {client.employees.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <div className="text-4xl mb-3">👔</div>
                                    <p className="font-medium">{isAr ? 'لا يوجد موظفين مسجلين' : 'No employees added'}</p>
                                    <p className="text-xs mt-1">{isAr ? 'أضف موظفين وحدد صلاحياتهم' : 'Add employees and set their permissions'}</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {client.employees.map(emp => (
                                        <div key={emp.id}
                                            className={`rounded-xl border p-4 flex items-center justify-between gap-3 transition-all ${emp.isActive
                                                ? 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                                                : 'bg-slate-800/20 border-slate-700/30 opacity-60'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${emp.isActive ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' : 'bg-slate-700 text-slate-400'
                                                    }`}>
                                                    {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white text-sm font-medium truncate">{emp.name}</p>
                                                    <p className="text-slate-500 text-xs" dir="ltr">@{emp.username}</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {emp.permissions.map(p => (
                                                            <span key={p} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-700/50 text-slate-400">
                                                                {EMPLOYEE_PERMISSION_LABELS[p]?.icon} {EMPLOYEE_PERMISSION_LABELS[p]?.[language]}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button onClick={() => handleToggleActive(emp.id, !emp.isActive)}
                                                    className={`p-1.5 rounded-lg text-xs ${emp.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-500'}`}
                                                    title={emp.isActive ? (isAr ? 'تعطيل' : 'Deactivate') : (isAr ? 'تفعيل' : 'Activate')}
                                                >{emp.isActive ? '✅' : '⏸️'}</button>
                                                <button onClick={() => handleEditEmployee(emp)}
                                                    className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs">✏️</button>
                                                <button onClick={() => handleDeleteEmployee(emp.id)}
                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs">🗑</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ TAB: PROJECTS ═══ */}
                    {tab === 'projects' && (
                        <div className="space-y-3">
                            {(client.projectIds || []).length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <div className="text-4xl mb-3">📁</div>
                                    <p className="font-medium">{isAr ? 'لا توجد مشاريع مرتبطة' : 'No linked projects'}</p>
                                    <p className="text-xs mt-1">{isAr ? 'أنشئ مشروعاً جديداً وربطه بهذا العميل' : 'Create a project and link it to this client'}</p>
                                </div>
                            ) : (
                                (client.projectIds || []).map(pid => (
                                    <div key={pid} className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-4 flex items-center gap-3">
                                        <span className="text-lg">📁</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{pid}</p>
                                            <p className="text-slate-500 text-xs">{isAr ? 'معرف المشروع' : 'Project ID'}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientProfileModal;
