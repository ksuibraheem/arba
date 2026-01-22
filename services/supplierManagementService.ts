/**
 * Supplier Management Service
 * Handles supplier admin controls, employee management, services catalog, and CR verification
 */

// ============= Supplier Status Types =============
export type SupplierStatus = 'active' | 'suspended' | 'banned' | 'deleted';
export type CRStatus = 'valid' | 'expiring' | 'expired' | 'pending_review';

// ============= Employee Permission Types =============
export type EmployeePermission =
    | 'view_products'
    | 'add_products'
    | 'edit_products'
    | 'delete_products'
    | 'edit_prices'
    | 'view_orders'
    | 'respond_orders'
    | 'confirm_prices'
    | 'issue_invoices'
    | 'view_reports'
    | 'view_payments'
    | 'download_invoices'
    | 'edit_company'
    | 'manage_employees'
    | 'edit_terms';

export type EmployeeRole = 'admin' | 'products' | 'orders' | 'reports' | 'view_only' | 'custom';

export interface EmployeeRoleConfig {
    id: EmployeeRole;
    name: { ar: string; en: string };
    permissions: EmployeePermission[];
}

// ============= Supplier Employee =============
export interface SupplierEmployee {
    id: string;
    name: string;
    email: string;
    phone?: string;
    jobTitle?: string;
    role: EmployeeRole;
    permissions: EmployeePermission[];
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
    invitedAt?: string;
    lastLogin?: string;
    receiveOrderNotifications: boolean;
    receivePriceConfirmNotifications: boolean;
    receiveWeeklyReports: boolean;
}

// ============= Commercial Registration =============
export interface CommercialRegistration {
    number: string;
    expiryDate: string;
    status: CRStatus;
    documentUrl?: string;
    lastVerifiedAt?: string;
    renewalRequestedAt?: string;
    renewalDocumentUrl?: string;
}

// ============= Supplier Services Catalog =============
export type ServiceCategory =
    | 'delivery'
    | 'installation'
    | 'operators'
    | 'maintenance'
    | 'consulting'
    | 'training'
    | 'inspection'
    | 'emergency'
    | 'project_management';

// Delivery Services
export interface DeliveryService {
    id: string;
    type: 'standard' | 'express' | 'scheduled' | 'project' | 'international';
    enabled: boolean;
    price: number;
    duration: string; // e.g., "2-3 days"
    freeDeliveryDistance?: number; // km
    pricePerKm?: number;
    maxDistance?: number;
    operatingHours?: { start: string; end: string };
    workingDays?: string[];
    hasTracking?: boolean;
    notifyBeforeArrival?: boolean;
}

// Installation Services
export interface InstallationService {
    id: string;
    type: 'basic' | 'professional' | 'dismantle' | 'reinstall' | 'complex';
    enabled: boolean;
    price: number;
    duration: string;
    description?: string;
    technicianCount?: number;
    availableOnHolidays?: boolean;
    holidayPriceMultiplier?: number;
}

// Operator Services
export interface OperatorService {
    id: string;
    type: 'operator' | 'driver' | 'team' | 'supervisor';
    enabled: boolean;
    hourlyRate?: number;
    dailyRate: number;
    monthlyRate?: number;
    minimumHours?: number;
    overtimeMultiplier?: number;
    nightMultiplier?: number;
    holidayMultiplier?: number;
    includesMealsMonthly?: boolean;
    certifications?: string[];
}

// Maintenance Services
export interface MaintenanceService {
    id: string;
    type: 'periodic_monthly' | 'periodic_quarterly' | 'emergency' | 'annual_contract' | 'overhaul';
    enabled: boolean;
    price: number;
    responseTime?: string; // e.g., "4 hours"
    includes?: string[];
    sparePartsDiscount?: number;
    hasOriginalParts?: boolean;
    hasAlternativeParts?: boolean;
    partsDeliveryTime?: string;
}

// Consulting Services
export interface ConsultingService {
    id: string;
    type: 'technical' | 'site_visit' | 'design_simple' | 'design_detailed' | 'feasibility';
    enabled: boolean;
    price: number;
    duration?: string;
    freeMinutes?: number;
    includes?: string[];
}

// Training Services
export interface TrainingService {
    id: string;
    type: 'operation' | 'basic_maintenance' | 'advanced' | 'safety';
    enabled: boolean;
    priceIndividual: number;
    priceGroup?: number;
    groupSize?: number;
    duration: string;
    includesCertificate?: boolean;
    includesManual?: boolean;
    locations?: ('client_site' | 'supplier_site' | 'online')[];
    hasRecordedVideos?: boolean;
}

// Inspection Services
export interface InspectionService {
    id: string;
    type: 'receiving' | 'periodic' | 'performance' | 'safety_certified' | 'technical_report';
    enabled: boolean;
    price: number; // 0 for free
    isFreeWithDelivery?: boolean;
    includes?: string[];
    certificationValidity?: string; // e.g., "1 year"
}

// Emergency Services
export interface EmergencyService {
    id: string;
    type: 'hotline_24_7' | 'emergency_response' | 'temporary_replacement' | 'remote_support';
    enabled: boolean;
    phone?: string;
    responseTimeInCity?: string;
    responseTimeOutCity?: string;
    emergencyFee?: number;
    replacementFreeHours?: number;
    replacementPriceAfter?: number;
    supportChannels?: ('whatsapp' | 'phone' | 'video')[];
    supportHours?: { start: string; end: string };
    videoCallPrice?: number;
}

// Project Management Services
export interface ProjectManagementService {
    id: string;
    type: 'jit_delivery' | 'project_manager' | 'temporary_storage' | 'extended_warranty';
    enabled: boolean;
    price?: number;
    perMonth?: boolean;
    freeForLargeContracts?: boolean;
    contractMinValue?: number;
    freeStorageDays?: number;
    storagePricePerDay?: number;
    additionalWarrantyMonths?: number;
}

// Combined Services Catalog
export interface SupplierServicesCatalog {
    delivery: DeliveryService[];
    installation: InstallationService[];
    operators: OperatorService[];
    maintenance: MaintenanceService[];
    consulting: ConsultingService[];
    training: TrainingService[];
    inspection: InspectionService[];
    emergency: EmergencyService[];
    project_management: ProjectManagementService[];
}

// ============= Price/Quantity Confirmation =============
export interface PriceConfirmationSettings {
    requiresPriceConfirmation: boolean;
    priceConfirmationReason?: 'fluctuating' | 'large_quantity' | 'special_offer' | 'other';
    requiresQuantityConfirmation: boolean;
    quantityConfirmationReason?: 'limited_stock' | 'made_to_order' | 'seasonal' | 'other';
    notificationEmail?: string;
    notificationInApp: boolean;
    notificationSMS: boolean;
    notificationPhone?: string;
    expectedResponseTime: number; // hours
    autoMessageToCustomer?: string;
}

// ============= Terms & Conditions (Admin Controlled) =============
export interface SupplierTerms {
    isEnabled: boolean; // Only admin can enable
    enabledAt?: string;
    enabledBy?: string; // Admin ID

    // Sales Terms
    salesTerms?: string[];

    // Payment Terms
    paymentDueDays?: number;
    latePaymentPenalty?: number; // percentage

    // Delivery Terms
    deliveryTerms?: string[];
    damageReportHours?: number;

    // Cancellation Terms
    cancellationTerms?: string[];
    cancellationFeeBeforeShipment?: number;
    cancellationFeeAfterShipment?: number;

    // Rental Terms (if applicable)
    rentalUsageTerms?: string[];
    rentalInsuranceTerms?: string[];
    rentalExtensionTerms?: string[];
    extensionNoticeHours?: number;
    earlyTerminationNoticeDays?: number;
    earlyTerminationFee?: number; // percentage

    // Liability Disclaimer
    disclaimers?: string[];

    // Contact for complaints
    complaintsPhone?: string;
    complaintsEmail?: string;
    complaintsHours?: { start: string; end: string };
}

// ============= Complete Supplier Profile =============
export interface SupplierProfile {
    id: string;
    companyName: { ar: string; en: string };
    email: string;
    phone: string;
    status: SupplierStatus;

    // Commercial Registration
    commercialRegistration: CommercialRegistration;

    // Ban/Suspend Info
    suspendedAt?: string;
    suspendReason?: string;
    bannedAt?: string;
    banReason?: string;

    // Employees
    employees: SupplierEmployee[];

    // Services Catalog
    services: SupplierServicesCatalog;

    // Terms (Admin controlled)
    terms: SupplierTerms;

    // Timestamps
    createdAt: string;
    lastActiveAt: string;
    lastLoginAt?: string;
}

// ============= Admin Actions =============
export interface SupplierAdminAction {
    id: string;
    supplierId: string;
    action: 'suspend' | 'unsuspend' | 'ban' | 'unban' | 'delete' | 'enable_terms' | 'disable_terms' | 'verify_cr';
    reason?: string;
    performedBy: string; // Admin ID
    performedAt: string;
    notes?: string;
}

// ============= CR Alert Settings =============
export interface CRAlertSettings {
    firstAlertDays: number; // Default: 60
    secondAlertDays: number; // Default: 30
    finalAlertDays: number; // Default: 7
    autoSuspendOnExpiry: boolean;
    notifyAdminOnExpiry: boolean;
    requireAdminReview: boolean;
}

// ============= Default Role Permissions =============
export const ROLE_PERMISSIONS: Record<EmployeeRole, EmployeePermission[]> = {
    admin: [
        'view_products', 'add_products', 'edit_products', 'delete_products', 'edit_prices',
        'view_orders', 'respond_orders', 'confirm_prices', 'issue_invoices',
        'view_reports', 'view_payments', 'download_invoices',
        'edit_company', 'manage_employees', 'edit_terms'
    ],
    products: [
        'view_products', 'add_products', 'edit_products',
        'view_orders'
    ],
    orders: [
        'view_products', 'view_orders', 'respond_orders', 'confirm_prices', 'issue_invoices'
    ],
    reports: [
        'view_products', 'view_orders', 'view_reports', 'view_payments', 'download_invoices'
    ],
    view_only: [
        'view_products', 'view_orders'
    ],
    custom: []
};

// ============= Translations =============
export const SUPPLIER_STATUS_TRANSLATIONS: Record<SupplierStatus, { ar: string; en: string }> = {
    active: { ar: 'نشط', en: 'Active' },
    suspended: { ar: 'موقوف', en: 'Suspended' },
    banned: { ar: 'محظور', en: 'Banned' },
    deleted: { ar: 'محذوف', en: 'Deleted' }
};

export const CR_STATUS_TRANSLATIONS: Record<CRStatus, { ar: string; en: string }> = {
    valid: { ar: 'ساري', en: 'Valid' },
    expiring: { ar: 'قارب على الانتهاء', en: 'Expiring Soon' },
    expired: { ar: 'منتهي', en: 'Expired' },
    pending_review: { ar: 'قيد المراجعة', en: 'Pending Review' }
};

export const EMPLOYEE_ROLE_TRANSLATIONS: Record<EmployeeRole, { ar: string; en: string }> = {
    admin: { ar: 'مدير كامل', en: 'Full Admin' },
    products: { ar: 'إدارة المنتجات', en: 'Products Manager' },
    orders: { ar: 'إدارة الطلبات', en: 'Orders Manager' },
    reports: { ar: 'التقارير', en: 'Reports Only' },
    view_only: { ar: 'عرض فقط', en: 'View Only' },
    custom: { ar: 'صلاحيات مخصصة', en: 'Custom Permissions' }
};

export const PERMISSION_TRANSLATIONS: Record<EmployeePermission, { ar: string; en: string }> = {
    view_products: { ar: 'عرض المنتجات', en: 'View Products' },
    add_products: { ar: 'إضافة منتجات', en: 'Add Products' },
    edit_products: { ar: 'تعديل المنتجات', en: 'Edit Products' },
    delete_products: { ar: 'حذف المنتجات', en: 'Delete Products' },
    edit_prices: { ar: 'تعديل الأسعار', en: 'Edit Prices' },
    view_orders: { ar: 'عرض الطلبات', en: 'View Orders' },
    respond_orders: { ar: 'الرد على الطلبات', en: 'Respond to Orders' },
    confirm_prices: { ar: 'تأكيد الأسعار', en: 'Confirm Prices' },
    issue_invoices: { ar: 'إصدار الفواتير', en: 'Issue Invoices' },
    view_reports: { ar: 'عرض التقارير', en: 'View Reports' },
    view_payments: { ar: 'عرض المدفوعات', en: 'View Payments' },
    download_invoices: { ar: 'تحميل الفواتير', en: 'Download Invoices' },
    edit_company: { ar: 'تعديل بيانات الشركة', en: 'Edit Company Info' },
    manage_employees: { ar: 'إدارة الموظفين', en: 'Manage Employees' },
    edit_terms: { ar: 'تعديل الشروط', en: 'Edit Terms' }
};

export const SERVICE_CATEGORY_TRANSLATIONS: Record<ServiceCategory, { ar: string; en: string; icon: string }> = {
    delivery: { ar: 'النقل والتوصيل', en: 'Delivery', icon: '🚚' },
    installation: { ar: 'التركيب والتفكيك', en: 'Installation', icon: '🔧' },
    operators: { ar: 'المشغلين والسائقين', en: 'Operators', icon: '👷' },
    maintenance: { ar: 'الصيانة والإصلاح', en: 'Maintenance', icon: '🔧' },
    consulting: { ar: 'الاستشارات والتصميم', en: 'Consulting', icon: '📋' },
    training: { ar: 'التدريب', en: 'Training', icon: '🎓' },
    inspection: { ar: 'الفحص والاختبار', en: 'Inspection', icon: '🔬' },
    emergency: { ar: 'الطوارئ والدعم', en: 'Emergency', icon: '🆘' },
    project_management: { ar: 'إدارة المشاريع', en: 'Project Mgmt', icon: '📦' }
};

// ============= Default Services Catalog =============
export const createDefaultServicesCatalog = (): SupplierServicesCatalog => ({
    delivery: [
        { id: 'd1', type: 'standard', enabled: false, price: 150, duration: '2-3 أيام عمل' },
        { id: 'd2', type: 'express', enabled: false, price: 350, duration: 'نفس اليوم' },
        { id: 'd3', type: 'scheduled', enabled: false, price: 200, duration: 'يختار العميل' },
        { id: 'd4', type: 'project', enabled: false, price: 0, duration: 'حسب المشروع' },
        { id: 'd5', type: 'international', enabled: false, price: 0, duration: 'حسب الوجهة' }
    ],
    installation: [
        { id: 'i1', type: 'basic', enabled: false, price: 300, duration: '2-4 ساعات', description: 'تركيب المنتج وتشغيله' },
        { id: 'i2', type: 'professional', enabled: false, price: 800, duration: '1 يوم', description: 'تركيب + معايرة + اختبار' },
        { id: 'i3', type: 'dismantle', enabled: false, price: 500, duration: '4-6 ساعات', description: 'تفكيك آمن + نقل' },
        { id: 'i4', type: 'reinstall', enabled: false, price: 400, duration: '2-4 ساعات', description: 'إعادة التركيب بعد النقل' }
    ],
    operators: [
        { id: 'o1', type: 'operator', enabled: false, dailyRate: 500, hourlyRate: 80, monthlyRate: 8000 },
        { id: 'o2', type: 'driver', enabled: false, dailyRate: 400, hourlyRate: 60 },
        { id: 'o3', type: 'team', enabled: false, dailyRate: 1200 },
        { id: 'o4', type: 'supervisor', enabled: false, dailyRate: 600 }
    ],
    maintenance: [
        { id: 'm1', type: 'periodic_monthly', enabled: false, price: 500, includes: ['فحص', 'تنظيف', 'تشحيم'] },
        { id: 'm2', type: 'periodic_quarterly', enabled: false, price: 400 },
        { id: 'm3', type: 'emergency', enabled: false, price: 150, responseTime: '4 ساعات' },
        { id: 'm4', type: 'annual_contract', enabled: false, price: 4000 },
        { id: 'm5', type: 'overhaul', enabled: false, price: 0 }
    ],
    consulting: [
        { id: 'c1', type: 'technical', enabled: false, price: 200, freeMinutes: 30 },
        { id: 'c2', type: 'site_visit', enabled: false, price: 300 },
        { id: 'c3', type: 'design_simple', enabled: false, price: 1000 },
        { id: 'c4', type: 'design_detailed', enabled: false, price: 3000 },
        { id: 'c5', type: 'feasibility', enabled: false, price: 2500 }
    ],
    training: [
        { id: 't1', type: 'operation', enabled: false, priceIndividual: 300, priceGroup: 1000, duration: '2-3 ساعات' },
        { id: 't2', type: 'basic_maintenance', enabled: false, priceIndividual: 500, duration: '4 ساعات' },
        { id: 't3', type: 'advanced', enabled: false, priceIndividual: 2000, duration: 'يومين' },
        { id: 't4', type: 'safety', enabled: false, priceIndividual: 400, duration: '3 ساعات' }
    ],
    inspection: [
        { id: 'in1', type: 'receiving', enabled: false, price: 0, isFreeWithDelivery: true },
        { id: 'in2', type: 'periodic', enabled: false, price: 250 },
        { id: 'in3', type: 'performance', enabled: false, price: 500 },
        { id: 'in4', type: 'safety_certified', enabled: false, price: 800, certificationValidity: 'سنة' },
        { id: 'in5', type: 'technical_report', enabled: false, price: 400 }
    ],
    emergency: [
        { id: 'e1', type: 'hotline_24_7', enabled: false },
        { id: 'e2', type: 'emergency_response', enabled: false, responseTimeInCity: '2 ساعة', emergencyFee: 300 },
        { id: 'e3', type: 'temporary_replacement', enabled: false, replacementFreeHours: 48 },
        { id: 'e4', type: 'remote_support', enabled: false, supportChannels: ['whatsapp', 'phone'] }
    ],
    project_management: [
        { id: 'p1', type: 'jit_delivery', enabled: false, freeForLargeContracts: true },
        { id: 'p2', type: 'project_manager', enabled: false, price: 5000, perMonth: true },
        { id: 'p3', type: 'temporary_storage', enabled: false, freeStorageDays: 7, storagePricePerDay: 100 },
        { id: 'p4', type: 'extended_warranty', enabled: false, additionalWarrantyMonths: 6, contractMinValue: 100000 }
    ]
});

// ============= Helper Functions =============
export const calculateCRStatus = (expiryDate: string): CRStatus => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'valid';
};

export const getDaysUntilExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
