/**
 * Arba SaaS — Data Models
 * نماذج بيانات منصة أربا السحابية
 * 
 * Firestore Collections: projects, clients, quotes, userRoles, securityAlerts
 */

import { Timestamp } from 'firebase/firestore';
import { AppState } from '../types';

// =================== PROJECT ===================

export type ProjectStatus = 'draft' | 'active' | 'submitted' | 'approved' | 'archived';

export interface ArbaProject {
    id: string;
    ownerId: string;              // Firebase UID of creator
    assignedTo: string[];         // QS engineer UIDs allowed to access

    // Project Info
    name: string;
    clientId: string;             // → ArbaClient.id
    projectType: string;
    status: ProjectStatus;
    location?: string;

    // Financial
    estimatedValue: number;       // Final price from calculator
    currency: 'SAR';

    // Linked Data
    latestQuoteId?: string;       // → ArbaQuote.id
    quoteCount: number;

    // State Snapshot (full pricing session)
    stateSnapshot?: AppState;

    // Metadata
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
}

// =================== CLIENT DOCUMENT ===================

export type DocumentType =
    // Company documents
    | 'commercial_registration'  // السجل التجاري
    | 'national_address'         // العنوان الوطني
    | 'vat_certificate'          // شهادة ضريبة القيمة المضافة
    | 'chamber_of_commerce'      // شهادة الغرفة التجارية
    | 'saudization'              // شهادة السعودة (نطاقات)
    | 'gosi'                     // التأمينات الاجتماعية
    | 'qiwa'                     // شهادة قوى
    | 'muqeem'                   // شهادة مقيم
    | 'municipal_license'        // رخصة البلدية
    | 'momra_license'            // رخصة وزارة الشؤون البلدية
    | 'contractor_classification'// تصنيف المقاولين
    | 'engineering_license'      // ترخيص هيئة المهندسين
    | 'bank_certificate'         // شهادة بنكية / IBAN
    | 'zakat_certificate'        // شهادة الزكاة والدخل
    | 'insurance_certificate'    // شهادة التأمين
    // Individual documents
    | 'national_id'              // الهوية الوطنية / الإقامة
    | 'freelance_certificate'    // وثيقة العمل الحر
    // General
    | 'custom';                  // وثيقة مخصصة

export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired' | 'no_expiry';

export interface ClientDocument {
    id: string;
    type: DocumentType;
    customName?: string;          // Only for 'custom' type
    number?: string;              // Document number (e.g. CR number)
    fileUrl?: string;             // Firebase Storage download URL
    storagePath?: string;         // Firebase Storage path (for deletion)
    fileName?: string;            // Original file name
    fileSize?: number;            // Bytes
    issueDate?: string;           // yyyy-mm-dd
    expiryDate?: string;          // yyyy-mm-dd
    notes?: string;
    uploadedAt?: Timestamp | Date;
}

export const DOCUMENT_LABELS: Record<DocumentType, { ar: string; en: string }> = {
    commercial_registration:   { ar: 'السجل التجاري', en: 'Commercial Registration' },
    national_address:          { ar: 'العنوان الوطني', en: 'National Address' },
    vat_certificate:           { ar: 'شهادة ضريبة القيمة المضافة', en: 'VAT Certificate' },
    chamber_of_commerce:       { ar: 'شهادة الغرفة التجارية', en: 'Chamber of Commerce' },
    saudization:               { ar: 'شهادة السعودة (نطاقات)', en: 'Saudization (Nitaqat)' },
    gosi:                      { ar: 'التأمينات الاجتماعية', en: 'GOSI Certificate' },
    qiwa:                      { ar: 'شهادة قوى', en: 'Qiwa Certificate' },
    muqeem:                    { ar: 'شهادة مقيم', en: 'Muqeem Certificate' },
    municipal_license:         { ar: 'رخصة البلدية', en: 'Municipal License' },
    momra_license:             { ar: 'رخصة وزارة الشؤون البلدية', en: 'MOMRA License' },
    contractor_classification: { ar: 'تصنيف المقاولين', en: 'Contractor Classification' },
    engineering_license:       { ar: 'ترخيص هيئة المهندسين', en: 'Engineering License' },
    bank_certificate:          { ar: 'شهادة بنكية / IBAN', en: 'Bank Certificate / IBAN' },
    zakat_certificate:         { ar: 'شهادة الزكاة والدخل', en: 'Zakat Certificate' },
    insurance_certificate:     { ar: 'شهادة التأمين', en: 'Insurance Certificate' },
    national_id:               { ar: 'الهوية الوطنية / الإقامة', en: 'National ID / Iqama' },
    freelance_certificate:     { ar: 'وثيقة العمل الحر', en: 'Freelance Certificate' },
    custom:                    { ar: 'وثيقة مخصصة', en: 'Custom Document' },
};

export function getDocumentStatus(doc: ClientDocument): DocumentStatus {
    if (!doc.expiryDate) return 'no_expiry';
    const now = new Date();
    const expiry = new Date(doc.expiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 30) return 'expiring_soon';
    return 'valid';
}

// =================== COMPANY EMPLOYEE ===================

export type EmployeePermission =
    | 'pricing'          // تسجيل أسعار — إدخال وتعديل الأسعار في المُسعّر
    | 'print'            // طباعة — طباعة العروض والتقارير
    | 'download'         // تحميل ملفات — تحميل الوثائق والملفات
    | 'upload'           // رفع ملفات — رفع وثائق جديدة
    | 'view_docs'        // عرض الوثائق — الاطلاع على سجلات الشركة
    | 'edit_info'        // تعديل البيانات — تعديل بيانات العميل
    | 'manage_projects'; // إدارة المشاريع — إنشاء وتعديل المشاريع

export const EMPLOYEE_PERMISSION_LABELS: Record<EmployeePermission, { ar: string; en: string; icon: string }> = {
    pricing:          { ar: 'تسجيل أسعار',    en: 'Pricing',         icon: '🧮' },
    print:            { ar: 'طباعة',           en: 'Print',           icon: '🖨️' },
    download:         { ar: 'تحميل ملفات',     en: 'Download Files',  icon: '📥' },
    upload:           { ar: 'رفع ملفات',       en: 'Upload Files',    icon: '📤' },
    view_docs:        { ar: 'عرض الوثائق',     en: 'View Documents',  icon: '👁️' },
    edit_info:        { ar: 'تعديل البيانات',   en: 'Edit Info',       icon: '✏️' },
    manage_projects:  { ar: 'إدارة المشاريع',  en: 'Manage Projects', icon: '📁' },
};

export interface CompanyEmployee {
    id: string;
    name: string;
    username: string;
    passwordHash: string;         // Stored hashed (bcrypt or SHA-256)
    permissions: EmployeePermission[];
    isActive: boolean;
    lastLogin?: Timestamp | Date;
    createdAt: Timestamp | Date;
}

// =================== PLAN LIMITS & PRICING ===================

export interface PlanLimits {
    maxEmployees: number;         // Included free seats (including owner)
    storageMB: number;            // Base storage in MB
    maxProjects: number;          // Max active projects
    price: number;                // Monthly price SAR
}

/** Seat pricing and storage pricing — V2 */
export const PLAN_EMPLOYEE_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
    free:         { maxEmployees: 1,  storageMB: 25,     maxProjects: 1,   price: 0 },
    starter:      { maxEmployees: 1,  storageMB: 200,    maxProjects: 5,   price: 149 },
    basic:        { maxEmployees: 2,  storageMB: 200,    maxProjects: 5,   price: 149 },  // legacy alias
    pro:          { maxEmployees: 4,  storageMB: 2048,   maxProjects: 15,  price: 399 },  // legacy alias
    professional: { maxEmployees: 4,  storageMB: 2048,   maxProjects: 15,  price: 399 },
    business:     { maxEmployees: 11, storageMB: 10240,  maxProjects: 50,  price: 999 },
    enterprise:   { maxEmployees: 26, storageMB: 51200,  maxProjects: -1,  price: 1999 },
};

// Extra seats beyond plan limit (6+ users)
export const EXTRA_SEAT_PRICE_SAR = 59; // per additional user/month (standardized)

// Extra storage: cloud cost + 60% markup
// Firebase Storage ≈ 0.10 SAR/GB/month → with 60% markup = 0.16 SAR/GB
// Rounded up to package pricing for UX:
export const EXTRA_STORAGE_PACKAGES = [
    { gb: 5,  priceSAR: 19 },    // ~3.80 SAR/GB  (cloud cost ~0.50 + huge margin)
    { gb: 20, priceSAR: 59 },    // ~2.95 SAR/GB
    { gb: 50, priceSAR: 129 },   // ~2.58 SAR/GB
];

// Storage markup multiplier (cloud cost × 1.6)
export const STORAGE_MARKUP = 1.60;

// =================== CLIENT ===================

export type ClientType = 'individual' | 'company' | 'tender' | 'government';

export interface ArbaClient {
    id: string;
    ownerId: string;
    clientType: ClientType;
    name: string;
    phone: string;
    email: string;
    company?: string;
    cr?: string;                  // Commercial Register number
    vat?: string;
    nationalId?: string;          // National ID / Iqama number
    address?: string;
    city?: string;
    notes?: string;
    logoUrl?: string;             // Firebase Storage URL
    logoStoragePath?: string;     // Firebase Storage path
    documents: ClientDocument[];  // All uploaded documents
    employees: CompanyEmployee[]; // Company employees with credentials
    storageUsedBytes: number;     // Current storage usage in bytes
    projectIds: string[];
    totalValue: number;           // Sum of linked project values
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
}

// =================== QUOTE (PDF) ===================

export interface ArbaQuote {
    id: string;
    projectId: string;
    version: number;
    quoteNumber: string;          // ARB-XXXXX format

    // PDF Storage
    pdfUrl: string;               // Download URL
    pdfStoragePath: string;       // Firebase Storage path
    fileSize: number;             // Bytes

    // Snapshot
    totalItems: number;
    finalPrice: number;

    // Metadata
    generatedBy: string;          // UID
    generatedByName: string;
    generatedAt: Timestamp | Date;
}

// =================== ARBA-Ops v4.1 — Immutable Quote Snapshots ===================

/** A frozen, immutable snapshot of a quote at the time of issuance.
 *  Price updates in the Master Data will NOT affect this unless manually synced. */
export interface QuoteSnapshot {
    id: string;
    projectId: string;
    quoteId: string;                      // → ArbaQuote.id
    version: number;

    // 🔒 FROZEN STATE — Immutable after creation
    frozenState: AppState;                // Full state at issuance time
    frozenMasterDataVersion: string;      // e.g., "v2.3" — tracks which constants were used
    frozenSupplierPrices: Record<string, number>; // Supplier prices used at issuance

    // Financial Summary (frozen)
    totalDirect: number;
    totalOverhead: number;
    totalProfit: number;
    finalPrice: number;
    totalItems: number;

    // Issuance Metadata
    issuedBy: string;
    issuedByName: string;
    issuedAt: Timestamp | Date;

    // Sync Control
    isSynced: boolean;                    // Has this been synced to latest prices?
    lastSyncedAt?: Timestamp | Date;
    syncDiff?: SyncDiffReport;            // Diff report from last sync attempt
}

/** Report generated when a QS engineer syncs an old quote with current prices */
export interface SyncDiffReport {
    snapshotId: string;
    itemsChanged: SyncDiffItem[];
    totalPriceImpact: number;             // +/- SAR
    totalPriceImpactPercent: number;       // +/- %
    generatedAt: Timestamp | Date;
    generatedBy: string;
    approved: boolean;
    approvedAt?: Timestamp | Date;
}

export interface SyncDiffItem {
    itemId: string;
    itemName: string;
    field: 'baseMaterial' | 'baseLabor' | 'waste' | 'supplierPrice';
    oldValue: number;
    newValue: number;
    changePercent: number;
}

// =================== USER ROLE (RBAC) ===================

export type UserRole = 'admin' | 'superadmin' | 'qs_engineer' | 'arba_qs_specialist' | 'client' | 'viewer';
export type ZoneType = 'A' | 'B';  // A = Employee Workspace, B = Client Portal

// =================== SUBSCRIPTION ===================

export type SubscriptionStatus = 'active' | 'trial' | 'pending_approval' | 'expired' | 'grace_period' | 'suspended';
export type SubscriptionPlan = 'free' | 'starter' | 'basic' | 'pro' | 'professional' | 'business' | 'enterprise';

export interface ArbaSubscription {
    id: string;
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    expiryDate: Date | null;
    gracePeriodHours: number;        // Default: 48
    lastPaymentId?: string;
    autoRenew: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ArbaUserRole {
    uid: string;
    role: UserRole;
    companyId: string;
    displayName: string;
    email: string;
    assignedProjectIds: string[];
    permissions: string[];
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
}

// Permission constants
export const PERMISSIONS = {
    PROJECTS_CREATE: 'projects.create',
    PROJECTS_EDIT: 'projects.edit',
    PROJECTS_DELETE: 'projects.delete',
    PROJECTS_VIEW_ALL: 'projects.view_all',
    PROJECTS_VIEW_OWN: 'projects.view_own',
    CLIENTS_CREATE: 'clients.create',
    CLIENTS_EDIT: 'clients.edit',
    CLIENTS_DELETE: 'clients.delete',
    CLIENTS_VIEW_PRIVATE: 'clients.view_private',    // 🔒 Zero-Knowledge: Private client data
    SECURITY_VIEW: 'security.view',
    SECURITY_RESOLVE: 'security.resolve',
    SECURITY_LOGS: 'security.logs',
    RATES_EDIT: 'rates.edit',
    USERS_MANAGE: 'users.manage',
    PDF_EXPORT: 'pdf.export',
    PDF_UPLOAD: 'pdf.upload',
    // Zone-specific
    WORKSPACE_ACCESS: 'workspace.access',
    PORTAL_ACCESS: 'portal.access',
    FORMULA_VIEW: 'formula.view',           // 🔒 Zero-Knowledge: SuperAdmin BLOCKED
    CALCULATIONS_VIEW: 'calculations.view', // 🔒 Zero-Knowledge: SuperAdmin BLOCKED
    UPLOAD_FILES: 'upload.files',
    // Subscription management
    SUBSCRIPTIONS_MANAGE: 'subscriptions.manage',
    BILLING_APPROVE: 'billing.approve',
    // === v8.5 Brain & AI Permissions ===
    BRAIN_ALERTS_VIEW: 'brain.alerts_view',       // تنبيهات الدماغ الداخلي (للعميل - مجاني)
    BRAIN_DEEP_ANALYSIS: 'brain.deep_analysis',   // تحليل عميق بالذكاء الخارجي (مدفوع)
    BRAIN_FULL_REPORT: 'brain.full_report',       // تقرير كامل بالتوصيات (مدفوع)
    QS_REVIEW_SUBMIT: 'qs.review_submit',         // مراجعة وتقديم الكميات (موظفي آربا فقط)
} as const;

// Role → Permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    admin: Object.values(PERMISSIONS),
    // 🔒 ZERO-KNOWLEDGE: SuperAdmin has management access but CANNOT see:
    //    - Formula details (FORMULA_VIEW)
    //    - Calculation data (CALCULATIONS_VIEW)
    //    - Private client data (CLIENTS_VIEW_PRIVATE)
    superadmin: [
        PERMISSIONS.PROJECTS_VIEW_ALL,
        PERMISSIONS.SECURITY_VIEW,
        PERMISSIONS.SECURITY_RESOLVE,
        PERMISSIONS.SECURITY_LOGS,
        PERMISSIONS.USERS_MANAGE,
        PERMISSIONS.SUBSCRIPTIONS_MANAGE,
        PERMISSIONS.BILLING_APPROVE,
        PERMISSIONS.WORKSPACE_ACCESS,
        // EXPLICITLY EXCLUDED: FORMULA_VIEW, CALCULATIONS_VIEW, CLIENTS_VIEW_PRIVATE
    ],
    qs_engineer: [
        PERMISSIONS.PROJECTS_CREATE,
        PERMISSIONS.PROJECTS_EDIT,
        PERMISSIONS.PROJECTS_VIEW_ALL,
        PERMISSIONS.CLIENTS_CREATE,
        PERMISSIONS.CLIENTS_EDIT,
        PERMISSIONS.CLIENTS_VIEW_PRIVATE,
        PERMISSIONS.PDF_EXPORT,
        PERMISSIONS.PDF_UPLOAD,
        PERMISSIONS.WORKSPACE_ACCESS,
        PERMISSIONS.FORMULA_VIEW,
        PERMISSIONS.CALCULATIONS_VIEW,
        PERMISSIONS.UPLOAD_FILES,
        PERMISSIONS.SECURITY_VIEW,
        PERMISSIONS.SECURITY_LOGS,
        PERMISSIONS.BRAIN_ALERTS_VIEW,     // v8.5: تنبيهات الدماغ الداخلي (مجاني)
    ],
    // === v8.5: مختص كميات آربا — موظف داخلي يراجع ويقدم الكميات ===
    // يملك كل صلاحيات المهندس + الذكاء الاصطناعي الخارجي + مراجعة وتقديم الكميات
    arba_qs_specialist: [
        PERMISSIONS.PROJECTS_CREATE,
        PERMISSIONS.PROJECTS_EDIT,
        PERMISSIONS.PROJECTS_VIEW_ALL,
        PERMISSIONS.CLIENTS_CREATE,
        PERMISSIONS.CLIENTS_EDIT,
        PERMISSIONS.CLIENTS_VIEW_PRIVATE,
        PERMISSIONS.PDF_EXPORT,
        PERMISSIONS.PDF_UPLOAD,
        PERMISSIONS.WORKSPACE_ACCESS,
        PERMISSIONS.FORMULA_VIEW,
        PERMISSIONS.CALCULATIONS_VIEW,
        PERMISSIONS.UPLOAD_FILES,
        PERMISSIONS.SECURITY_VIEW,
        PERMISSIONS.SECURITY_LOGS,
        PERMISSIONS.BRAIN_ALERTS_VIEW,       // تنبيهات الدماغ الداخلي
        PERMISSIONS.BRAIN_DEEP_ANALYSIS,     // تحليل عميق بالذكاء الخارجي
        PERMISSIONS.BRAIN_FULL_REPORT,       // تقرير كامل بالتوصيات
        PERMISSIONS.QS_REVIEW_SUBMIT,        // مراجعة وتقديم الكميات
    ],
    client: [
        PERMISSIONS.PROJECTS_VIEW_OWN,
        PERMISSIONS.PORTAL_ACCESS,
        PERMISSIONS.PDF_EXPORT,
        PERMISSIONS.BRAIN_ALERTS_VIEW,       // v8.5: يرى التنبيهات الأساسية فقط (🔴🟠🟢)
    ],
    viewer: [
        PERMISSIONS.PORTAL_ACCESS,
    ],
};

// Role → Zone mapping
export const ROLE_ZONE: Record<UserRole, ZoneType> = {
    admin: 'A',
    superadmin: 'A',
    qs_engineer: 'A',
    arba_qs_specialist: 'A',  // v8.5: موظف آربا — منطقة العمل
    client: 'B',
    viewer: 'B',
};

// =================== SECURITY ALERT ===================

export type AlertType = 'ocr_block' | 'regex_block' | 'purge_complete' | 'unauthorized_access' | 'suspicious_export';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface SecurityAlert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    projectId?: string;
    projectName?: string;
    userId?: string;
    userName?: string;
    description: string;
    details?: Record<string, any>;
    resolved: boolean;
    resolvedBy?: string;
    resolvedAt?: Timestamp | Date;
    createdAt: Timestamp | Date;
}

// =================== DASHBOARD STATS ===================

export interface DashboardStats {
    totalEstimatedValue: number;
    activeProjects: number;
    totalProjects: number;
    securityPurges: number;
    totalClients: number;
    recentProjects: ArbaProject[];
    recentAlerts: SecurityAlert[];
}

// =================== HELPERS ===================

export function generateQuoteNumber(): string {
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `ARB-${rand}`;
}

/**
 * Generate a UUID v4 identifier
 * Migrated from timestamp-based IDs to UUID v4 for:
 * - Global uniqueness across distributed systems
 * - Non-sequential IDs (prevents enumeration attacks)
 * - Firestore-compatible document IDs
 */
export function generateId(_prefix?: string): string {
    // Use native crypto.randomUUID() (available in modern Node.js and browsers)
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback: manual UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Check if the current subscription is within grace period
 */
export function isWithinGracePeriod(subscription: ArbaSubscription): boolean {
    if (!subscription.expiryDate) return false;
    const now = new Date();
    const expiry = new Date(subscription.expiryDate);
    const graceEnd = new Date(expiry.getTime() + subscription.gracePeriodHours * 60 * 60 * 1000);
    return now > expiry && now <= graceEnd;
}

/**
 * Check if a subscription is currently active (including grace period)
 */
export function isSubscriptionActive(subscription: ArbaSubscription): boolean {
    if (subscription.status === 'active') return true;
    if (subscription.status === 'grace_period') return isWithinGracePeriod(subscription);
    return false;
}
