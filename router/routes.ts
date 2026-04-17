/**
 * Route Constants
 * ثوابت المسارات
 */

export const ROUTES = {
    // Public routes
    LANDING: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ABOUT: '/about',
    COMPANY: '/company',
    PASSWORD_RESET: '/password-reset',
    SUPPORT_CENTER: '/support-center',
    SUPPLIER_CATALOG: '/supplier-catalog',
    VERIFICATION: '/verify',
    UNDER_REVIEW: '/under-review',
    PAYMENT: '/payment',
    PAYMENT_UPLOAD: '/payment-upload',

    // Authenticated routes
    DASHBOARD: '/dashboard',
    PRICING: '/pricing',
    CLOUD_SYNC: '/cloud-sync',
    CLIENT_PORTAL: '/client-portal',
    PRIVATE: '/private',

    // Admin routes
    ADMIN: '/admin',
    ADMIN_SUPPLIERS: '/admin/suppliers',

    // Employee routes
    MANAGER: '/employees/manager',
    EMPLOYEE: '/employees',
    HR: '/employees/hr',
    ACCOUNTANT: '/employees/accountant',
    QS: '/employees/qs',
    SUPPORT: '/employees/support',

    // Supplier route
    SUPPLIER: '/supplier',

    // Security
    SECURITY_403: '/403',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
