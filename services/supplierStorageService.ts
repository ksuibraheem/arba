/**
 * Supplier Storage Service — V10
 * إدارة مساحة تخزين المورد
 * 
 * - المورد يحصل على مساحة مجانية محدودة
 * - يستطيع شراء مساحة إضافية (29 ر.س / 100 MB)
 * - هامش ربح آربا 75%
 * - الحفظ عبر Firestore
 */

import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { accountingService } from './accountingService';
import { SupplierEmployee, SupplierServicesCatalog, createDefaultServicesCatalog } from './supplierManagementService';

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

export const SUPPLIER_STORAGE_CONFIG = {
    freeStorageMB: 50,
    freeProductLimit: 20,
    packages: [
        { id: 'pkg_100mb',  mb: 100,  price: 29,  arbaProfit: 21.75,  extraProducts: 50 },
        { id: 'pkg_500mb',  mb: 500,  price: 119, arbaProfit: 89.25,  extraProducts: 200 },
        { id: 'pkg_1000mb', mb: 1000, price: 199, arbaProfit: 149.25, extraProducts: 500 },
    ],
    billingType: 'monthly' as const,
    arbaProfitPercent: 75,
};

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface SupplierStorageSummary {
    supplierId: string;
    totalStorageMB: number;
    usedStorageMB: number;
    freeStorageMB: number;
    purchasedStorageMB: number;
    totalProducts: number;
    maxProducts: number;
    percentageUsed: number;
    purchases: StoragePurchase[];
}

export interface StoragePurchase {
    id: string;
    supplierId: string;
    packageId: string;
    storageMB: number;
    extraProducts: number;
    price: number;
    arbaProfit: number;
    purchasedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// Service
// ═══════════════════════════════════════════════════════════════

class SupplierStorageService {

    async getStorageSummary(supplierId: string): Promise<SupplierStorageSummary> {
        try {
            const supplierRef = doc(db, 'suppliers', supplierId);
            const snap = await getDoc(supplierRef);

            if (!snap.exists()) return this._defaultSummary(supplierId);

            const data = snap.data();
            const purchasedMB = data.purchasedStorageMB || 0;
            const totalMB = SUPPLIER_STORAGE_CONFIG.freeStorageMB + purchasedMB;
            const usedMB = data.usedStorageMB || 0;
            const extraProducts = data.purchasedExtraProducts || 0;

            return {
                supplierId,
                totalStorageMB: totalMB,
                usedStorageMB: usedMB,
                freeStorageMB: SUPPLIER_STORAGE_CONFIG.freeStorageMB,
                purchasedStorageMB: purchasedMB,
                totalProducts: data.totalProducts || 0,
                maxProducts: SUPPLIER_STORAGE_CONFIG.freeProductLimit + extraProducts,
                percentageUsed: totalMB > 0 ? Math.round((usedMB / totalMB) * 100) : 0,
                purchases: data.storagePurchases || [],
            };
        } catch (error) {
            console.error('❌ getStorageSummary error:', error);
            return this._defaultSummary(supplierId);
        }
    }

    async purchaseStorage(
        supplierId: string,
        packageIndex: number,
        supplierName: string = ''
    ): Promise<{ success: boolean; error?: string }> {
        const pkg = SUPPLIER_STORAGE_CONFIG.packages[packageIndex];
        if (!pkg) return { success: false, error: 'Invalid package' };

        try {
            const supplierRef = doc(db, 'suppliers', supplierId);
            const snap = await getDoc(supplierRef);
            const data = snap.exists() ? snap.data() : {};

            const currentPurchasedMB = data.purchasedStorageMB || 0;
            const currentExtraProducts = data.purchasedExtraProducts || 0;
            const purchases: StoragePurchase[] = data.storagePurchases || [];

            const purchase: StoragePurchase = {
                id: crypto.randomUUID(),
                supplierId,
                packageId: pkg.id,
                storageMB: pkg.mb,
                extraProducts: pkg.extraProducts,
                price: pkg.price,
                arbaProfit: pkg.arbaProfit,
                purchasedAt: new Date().toISOString(),
            };

            await updateDoc(supplierRef, {
                purchasedStorageMB: currentPurchasedMB + pkg.mb,
                purchasedExtraProducts: currentExtraProducts + pkg.extraProducts,
                storagePurchases: [...purchases, purchase],
                updatedAt: serverTimestamp(),
            });

            await addDoc(collection(db, 'supplierStoragePurchases'), {
                ...purchase,
                supplierName,
                timestamp: serverTimestamp(),
            });

            try {
                accountingService.addLedgerEntry({
                    description: `Storage purchase: ${pkg.mb}MB by supplier ${supplierName || supplierId}`,
                    type: 'credit',
                    amount: pkg.price,
                    reference: `storage_${purchase.id}`,
                    category: 'Supplier Storage',
                    createdBy: 'System',
                });
            } catch (accErr) {
                console.warn('⚠️ Accounting entry failed:', accErr);
            }

            return { success: true };
        } catch (error) {
            console.error('❌ purchaseStorage error:', error);
            return { success: false, error: 'Purchase failed' };
        }
    }

    async canAddProduct(supplierId: string): Promise<{ allowed: boolean; reason?: string }> {
        const summary = await this.getStorageSummary(supplierId);
        if (summary.totalProducts >= summary.maxProducts) {
            return { allowed: false, reason: `وصلت للحد الأقصى (${summary.maxProducts} منتج). اشترِ مساحة إضافية.` };
        }
        if (summary.percentageUsed >= 100) {
            return { allowed: false, reason: 'المساحة ممتلئة. اشترِ مساحة إضافية.' };
        }
        return { allowed: true };
    }

    async canUploadFile(supplierId: string, fileSizeMB: number): Promise<{ allowed: boolean; reason?: string }> {
        const summary = await this.getStorageSummary(supplierId);
        if (summary.usedStorageMB + fileSizeMB > summary.totalStorageMB) {
            return { allowed: false, reason: `مساحة التخزين غير كافية. متاح: ${(summary.totalStorageMB - summary.usedStorageMB).toFixed(1)} MB` };
        }
        return { allowed: true };
    }

    private _defaultSummary(supplierId: string): SupplierStorageSummary {
        return {
            supplierId,
            totalStorageMB: SUPPLIER_STORAGE_CONFIG.freeStorageMB,
            usedStorageMB: 0,
            freeStorageMB: SUPPLIER_STORAGE_CONFIG.freeStorageMB,
            purchasedStorageMB: 0,
            totalProducts: 0,
            maxProducts: SUPPLIER_STORAGE_CONFIG.freeProductLimit,
            percentageUsed: 0,
            purchases: [],
        };
    }
}

export const supplierStorageService = new SupplierStorageService();

// ═══════════════════════════════════════════════════════════════
// Legacy Compatibility — localStorage-based functions
// Used by SupplierDashboard for employees/services (V8 pattern)
// ═══════════════════════════════════════════════════════════════

const SUPPLIER_DATA_KEY = 'arba_supplier_data';

function _getAll(): Record<string, any> {
    try {
        return JSON.parse(localStorage.getItem(SUPPLIER_DATA_KEY) || '{}');
    } catch { return {}; }
}

export function initializeSupplierData(supplierId: string): void {
    const all = _getAll();
    if (!all[supplierId]) {
        all[supplierId] = {
            supplierId,
            employees: [],
            services: createDefaultServicesCatalog(),
            lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(SUPPLIER_DATA_KEY, JSON.stringify(all));
    }
}

export function getSupplierEmployees(supplierId: string): SupplierEmployee[] {
    const all = _getAll();
    return all[supplierId]?.employees || [];
}

export function saveSupplierEmployees(supplierId: string, employees: SupplierEmployee[]): void {
    const all = _getAll();
    if (!all[supplierId]) all[supplierId] = {};
    all[supplierId].employees = employees;
    all[supplierId].lastUpdated = new Date().toISOString();
    localStorage.setItem(SUPPLIER_DATA_KEY, JSON.stringify(all));
}

export function getSupplierServices(supplierId: string): SupplierServicesCatalog {
    const all = _getAll();
    return all[supplierId]?.services || createDefaultServicesCatalog();
}

export function saveSupplierServices(supplierId: string, services: SupplierServicesCatalog): void {
    const all = _getAll();
    if (!all[supplierId]) all[supplierId] = {};
    all[supplierId].services = services;
    all[supplierId].lastUpdated = new Date().toISOString();
    localStorage.setItem(SUPPLIER_DATA_KEY, JSON.stringify(all));
}
