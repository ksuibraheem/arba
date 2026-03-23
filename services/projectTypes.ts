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

// =================== CLIENT ===================

export interface ArbaClient {
    id: string;
    ownerId: string;
    name: string;
    phone: string;
    email: string;
    company?: string;
    cr?: string;                  // Commercial Register
    vat?: string;
    address?: string;
    city?: string;
    notes?: string;
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

// =================== USER ROLE (RBAC) ===================

export type UserRole = 'admin' | 'superadmin' | 'qs_engineer' | 'client' | 'viewer';
export type ZoneType = 'A' | 'B';  // A = Employee Workspace, B = Client Portal

// =================== SUBSCRIPTION ===================

export type SubscriptionStatus = 'active' | 'trial' | 'pending_approval' | 'expired' | 'grace_period' | 'suspended';
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

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
    ],
    client: [
        PERMISSIONS.PROJECTS_VIEW_OWN,
        PERMISSIONS.PORTAL_ACCESS,
        PERMISSIONS.PDF_EXPORT,
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
