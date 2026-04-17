/**
 * خدمة الموردين الخارجيين
 * External Supplier Service - Manages pricing from external suppliers without accounts
 * 🔥 Synced with Firestore via firestoreDataService
 */

import { firestoreDataService } from './firestoreDataService';

// ====================== الأنواع ======================

// نوع ربط المورد
export type ExternalLinkType = 'manual' | 'api' | 'scraping';

// حالة المورد الخارجي
export type ExternalSupplierStatus = 'active' | 'inactive' | 'pending_verification';

// حالة السعر
export type ExternalPriceStatus = 'current' | 'outdated' | 'pending_review';

// المورد الخارجي
export interface ExternalSupplier {
    id: string;
    name: { ar: string; en: string };
    companyName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    website?: string;
    // نوع الربط
    linkType: ExternalLinkType;
    // إعدادات API (للربط التلقائي)
    apiConfig?: {
        endpoint: string;
        apiKey?: string;
        headers?: Record<string, string>;
        refreshInterval: number; // بالساعات
        lastSync?: string;
        syncStatus?: 'success' | 'failed' | 'pending';
    };
    // التصنيفات المتخصص فيها
    categories: string[];
    // ملاحظات
    notes?: string;
    status: ExternalSupplierStatus;
    // بيانات التدقيق
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// السعر الخارجي
export interface ExternalPrice {
    id: string;
    externalSupplierId: string;
    // ربط المنتج الداخلي (اختياري)
    internalProductId?: string;
    itemDatabaseId?: string; // ربط مع ITEMS_DATABASE
    // بيانات المنتج
    productName: { ar: string; en: string };
    productCode?: string;
    category: string;
    unit: string;
    // السعر
    price: number;
    currency: 'SAR' | 'USD' | 'EUR';
    // تفاصيل إضافية
    specifications?: string;
    minQuantity?: number;
    maxQuantity?: number;
    deliveryDays?: number;
    validUntil?: string;
    // مصدر السعر
    source: 'manual_entry' | 'api_fetch' | 'website_scrape' | 'quotation';
    sourceReference?: string; // رقم العرض أو الرابط
    // حالة المراجعة
    status: ExternalPriceStatus;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    // مقارنة
    internalPrice?: number; // السعر الداخلي للمقارنة
    priceDifference?: number; // الفرق بالنسبة المئوية
    // بيانات التدقيق
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// طلب تحديث أسعار
export interface PriceUpdateRequest {
    id: string;
    externalSupplierId: string;
    requestType: 'manual_update' | 'api_refresh' | 'bulk_import';
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    itemsCount: number;
    successCount?: number;
    failedCount?: number;
    errorMessage?: string;
    requestedBy: string;
    requestedAt: string;
    completedAt?: string;
}

// إحصائيات المورد الخارجي
export interface ExternalSupplierStats {
    supplierId: string;
    totalProducts: number;
    averagePriceDifference: number; // متوسط فرق السعر %
    lastUpdate: string;
    updateFrequency: number; // عدد التحديثات في الشهر
    reliability: 'high' | 'medium' | 'low';
}

// ====================== الثوابت ======================

export const EXTERNAL_LINK_TYPES: Record<ExternalLinkType, { ar: string; en: string; icon: string }> = {
    manual: { ar: 'ربط يدوي', en: 'Manual Entry', icon: '✏️' },
    api: { ar: 'ربط API', en: 'API Integration', icon: '🔗' },
    scraping: { ar: 'استخراج من الموقع', en: 'Web Scraping', icon: '🌐' }
};

export const PRICE_SOURCES: Record<string, { ar: string; en: string }> = {
    manual_entry: { ar: 'إدخال يدوي', en: 'Manual Entry' },
    api_fetch: { ar: 'جلب API', en: 'API Fetch' },
    website_scrape: { ar: 'استخراج من الموقع', en: 'Web Scrape' },
    quotation: { ar: 'عرض سعر', en: 'Quotation' }
};

// ====================== الخدمة ======================

class ExternalSupplierService {
    private readonly SUPPLIERS_KEY = 'external_suppliers';
    private readonly PRICES_KEY = 'external_prices';
    private readonly REQUESTS_KEY = 'price_update_requests';
    // Firestore collection names
    private readonly FS_SUPPLIERS = 'external_suppliers';
    private readonly FS_PRICES = 'external_prices';
    private _loadedFromFirestore = false;

    /**
     * تحميل من Firestore مرة واحدة عند أول استخدام
     */
    async loadFromFirestore(): Promise<void> {
        if (this._loadedFromFirestore) return;
        try {
            const [suppliers, prices] = await Promise.all([
                firestoreDataService.getCollection<ExternalSupplier>(this.FS_SUPPLIERS, undefined, { localCacheKey: this.SUPPLIERS_KEY }),
                firestoreDataService.getCollection<ExternalPrice>(this.FS_PRICES, undefined, { localCacheKey: this.PRICES_KEY }),
            ]);
            if (suppliers.length > 0) localStorage.setItem(this.SUPPLIERS_KEY, JSON.stringify(suppliers));
            if (prices.length > 0) localStorage.setItem(this.PRICES_KEY, JSON.stringify(prices));
            this._loadedFromFirestore = true;
        } catch {
            this._loadedFromFirestore = true;
        }
    }

    // =================== إدارة الموردين ===================

    getSuppliers(): ExternalSupplier[] {
        const data = localStorage.getItem(this.SUPPLIERS_KEY);
        return data ? JSON.parse(data) : [];
    }

    private saveSuppliers(suppliers: ExternalSupplier[]): void {
        localStorage.setItem(this.SUPPLIERS_KEY, JSON.stringify(suppliers));
        // 🔥 Sync to Firestore
        const items = suppliers.map(s => ({ id: s.id, data: { ...s } }));
        firestoreDataService.batchWrite(this.FS_SUPPLIERS, items).catch(() => {});
    }

    addSupplier(supplier: Omit<ExternalSupplier, 'id' | 'createdAt' | 'updatedAt'>): ExternalSupplier {
        const suppliers = this.getSuppliers();
        const now = new Date().toISOString();

        const newSupplier: ExternalSupplier = {
            ...supplier,
            id: `ext-sup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            updatedAt: now
        };

        suppliers.push(newSupplier);
        this.saveSuppliers(suppliers);
        return newSupplier;
    }

    updateSupplier(id: string, updates: Partial<ExternalSupplier>): ExternalSupplier | null {
        const suppliers = this.getSuppliers();
        const index = suppliers.findIndex(s => s.id === id);

        if (index === -1) return null;

        suppliers[index] = {
            ...suppliers[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveSuppliers(suppliers);
        return suppliers[index];
    }

    deleteSupplier(id: string): boolean {
        const suppliers = this.getSuppliers();
        const filtered = suppliers.filter(s => s.id !== id);

        if (filtered.length === suppliers.length) return false;

        this.saveSuppliers(filtered);
        // حذف الأسعار المرتبطة
        this.deletePricesBySupplier(id);
        return true;
    }

    getSupplierById(id: string): ExternalSupplier | undefined {
        return this.getSuppliers().find(s => s.id === id);
    }

    // =================== إدارة الأسعار ===================

    getPrices(): ExternalPrice[] {
        const data = localStorage.getItem(this.PRICES_KEY);
        return data ? JSON.parse(data) : [];
    }

    private savePrices(prices: ExternalPrice[]): void {
        localStorage.setItem(this.PRICES_KEY, JSON.stringify(prices));
        // 🔥 Sync to Firestore
        const items = prices.map(p => ({ id: p.id, data: { ...p } }));
        firestoreDataService.batchWrite(this.FS_PRICES, items).catch(() => {});
    }

    addPrice(price: Omit<ExternalPrice, 'id' | 'createdAt' | 'updatedAt'>): ExternalPrice {
        const prices = this.getPrices();
        const now = new Date().toISOString();

        const newPrice: ExternalPrice = {
            ...price,
            id: `ext-price-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            updatedAt: now
        };

        prices.push(newPrice);
        this.savePrices(prices);
        return newPrice;
    }

    updatePrice(id: string, updates: Partial<ExternalPrice>): ExternalPrice | null {
        const prices = this.getPrices();
        const index = prices.findIndex(p => p.id === id);

        if (index === -1) return null;

        prices[index] = {
            ...prices[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.savePrices(prices);
        return prices[index];
    }

    deletePrice(id: string): boolean {
        const prices = this.getPrices();
        const filtered = prices.filter(p => p.id !== id);

        if (filtered.length === prices.length) return false;

        this.savePrices(filtered);
        return true;
    }

    getPricesBySupplier(supplierId: string): ExternalPrice[] {
        return this.getPrices().filter(p => p.externalSupplierId === supplierId);
    }

    deletePricesBySupplier(supplierId: string): void {
        const prices = this.getPrices().filter(p => p.externalSupplierId !== supplierId);
        this.savePrices(prices);
    }

    // =================== مقارنة الأسعار ===================

    /**
     * مقارنة سعر خارجي مع السعر الداخلي
     */
    comparePrices(externalPrice: number, internalPrice: number): { difference: number; cheaper: 'external' | 'internal' | 'equal' } {
        if (internalPrice === 0) {
            return { difference: 0, cheaper: 'equal' };
        }

        const difference = ((externalPrice - internalPrice) / internalPrice) * 100;

        return {
            difference: Math.round(difference * 100) / 100,
            cheaper: difference < -1 ? 'external' : difference > 1 ? 'internal' : 'equal'
        };
    }

    /**
     * جلب الأسعار مع المقارنة
     */
    getPricesWithComparison(): (ExternalPrice & { comparison?: ReturnType<typeof this.comparePrices> })[] {
        return this.getPrices().map(price => {
            if (price.internalPrice) {
                return {
                    ...price,
                    comparison: this.comparePrices(price.price, price.internalPrice)
                };
            }
            return price;
        });
    }

    // =================== ربط API ===================

    /**
     * جلب الأسعار من API المورد
     * ملاحظة: هذه دالة نموذجية - يجب تخصيصها حسب API كل مورد
     */
    async fetchPricesFromAPI(supplierId: string): Promise<{ success: boolean; count: number; error?: string }> {
        const supplier = this.getSupplierById(supplierId);

        if (!supplier || !supplier.apiConfig) {
            return { success: false, count: 0, error: 'المورد غير موجود أو لا يوجد إعدادات API' };
        }

        try {
            // محاكاة جلب البيانات من API
            // في الواقع، سيتم استبدال هذا بـ fetch حقيقي
            const mockApiResponse = this.simulateAPIResponse(supplier);

            // تحديث الأسعار
            for (const item of mockApiResponse) {
                const existingPrice = this.getPrices().find(
                    p => p.externalSupplierId === supplierId && p.productCode === item.code
                );

                if (existingPrice) {
                    this.updatePrice(existingPrice.id, {
                        price: item.price,
                        source: 'api_fetch',
                        status: 'current'
                    });
                } else {
                    this.addPrice({
                        externalSupplierId: supplierId,
                        productName: { ar: item.name, en: item.name },
                        productCode: item.code,
                        category: item.category || 'other',
                        unit: item.unit || 'قطعة',
                        price: item.price,
                        currency: 'SAR',
                        source: 'api_fetch',
                        status: 'pending_review',
                        createdBy: 'system'
                    });
                }
            }

            // تحديث تاريخ المزامنة
            this.updateSupplier(supplierId, {
                apiConfig: {
                    ...supplier.apiConfig,
                    lastSync: new Date().toISOString(),
                    syncStatus: 'success'
                }
            });

            return { success: true, count: mockApiResponse.length };

        } catch (error) {
            this.updateSupplier(supplierId, {
                apiConfig: {
                    ...supplier.apiConfig!,
                    syncStatus: 'failed'
                }
            });

            return {
                success: false,
                count: 0,
                error: error instanceof Error ? error.message : 'خطأ غير معروف'
            };
        }
    }

    /**
     * محاكاة استجابة API (للتطوير)
     */
    private simulateAPIResponse(supplier: ExternalSupplier): Array<{ code: string; name: string; price: number; category?: string; unit?: string }> {
        // بيانات تجريبية تحاكي استجابة API
        const categories = supplier.categories;
        const mockProducts: Array<{ code: string; name: string; price: number; category: string; unit: string }> = [];

        if (categories.includes('steel') || categories.includes('building_materials')) {
            mockProducts.push(
                { code: 'STL-001', name: 'حديد تسليح 12مم', price: 3200 + Math.random() * 200, category: 'steel', unit: 'طن' },
                { code: 'STL-002', name: 'حديد تسليح 16مم', price: 3300 + Math.random() * 200, category: 'steel', unit: 'طن' },
                { code: 'STL-003', name: 'حديد تسليح 20مم', price: 3400 + Math.random() * 200, category: 'steel', unit: 'طن' }
            );
        }

        if (categories.includes('cement')) {
            mockProducts.push(
                { code: 'CMT-001', name: 'إسمنت عادي', price: 18 + Math.random() * 3, category: 'cement', unit: 'كيس' },
                { code: 'CMT-002', name: 'إسمنت مقاوم', price: 22 + Math.random() * 3, category: 'cement', unit: 'كيس' }
            );
        }

        if (categories.includes('electrical')) {
            mockProducts.push(
                { code: 'ELC-001', name: 'كيبل 2.5مم', price: 180 + Math.random() * 30, category: 'electrical', unit: 'لفة' },
                { code: 'ELC-002', name: 'كيبل 4مم', price: 250 + Math.random() * 40, category: 'electrical', unit: 'لفة' }
            );
        }

        return mockProducts;
    }

    // =================== الإحصائيات ===================

    getSupplierStats(supplierId: string): ExternalSupplierStats | null {
        const supplier = this.getSupplierById(supplierId);
        if (!supplier) return null;

        const prices = this.getPricesBySupplier(supplierId);
        const pricesWithInternal = prices.filter(p => p.internalPrice);

        let totalDifference = 0;
        for (const p of pricesWithInternal) {
            if (p.internalPrice) {
                totalDifference += ((p.price - p.internalPrice) / p.internalPrice) * 100;
            }
        }

        const avgDifference = pricesWithInternal.length > 0
            ? totalDifference / pricesWithInternal.length
            : 0;

        return {
            supplierId,
            totalProducts: prices.length,
            averagePriceDifference: Math.round(avgDifference * 100) / 100,
            lastUpdate: supplier.updatedAt,
            updateFrequency: 0, // يمكن حسابها من سجل التحديثات
            reliability: avgDifference < -5 ? 'high' : avgDifference < 5 ? 'medium' : 'low'
        };
    }

    // =================== استيراد مجمع ===================

    /**
     * استيراد أسعار من ملف CSV/Excel
     */
    importPricesFromCSV(supplierId: string, data: Array<{ productName: string; productCode?: string; unit: string; price: number; category?: string }>, createdBy: string): { success: number; failed: number } {
        let success = 0;
        let failed = 0;

        for (const row of data) {
            try {
                this.addPrice({
                    externalSupplierId: supplierId,
                    productName: { ar: row.productName, en: row.productName },
                    productCode: row.productCode,
                    category: row.category || 'other',
                    unit: row.unit,
                    price: row.price,
                    currency: 'SAR',
                    source: 'manual_entry',
                    status: 'pending_review',
                    createdBy
                });
                success++;
            } catch {
                failed++;
            }
        }

        return { success, failed };
    }

    // =================== بيانات تجريبية ===================

    initializeSampleData(): void {
        if (this.getSuppliers().length === 0) {
            // إضافة موردين تجريبيين
            const sampleSuppliers: Omit<ExternalSupplier, 'id' | 'createdAt' | 'updatedAt'>[] = [
                {
                    name: { ar: 'مصانع الراجحي للحديد', en: 'Rajhi Steel Mills' },
                    companyName: 'مصانع الراجحي للحديد والصلب',
                    contactPerson: 'أحمد العتيبي',
                    phone: '0501234567',
                    email: 'sales@rajhisteel.com',
                    website: 'https://rajhisteel.com',
                    linkType: 'api',
                    apiConfig: {
                        endpoint: 'https://api.rajhisteel.com/v1/prices',
                        refreshInterval: 24,
                        syncStatus: 'pending'
                    },
                    categories: ['steel', 'building_materials'],
                    status: 'active',
                    createdBy: 'system'
                },
                {
                    name: { ar: 'مصانع إسمنت اليمامة', en: 'Yamama Cement' },
                    companyName: 'شركة أسمنت اليمامة',
                    contactPerson: 'محمد الشمري',
                    phone: '0559876543',
                    email: 'info@yamamacement.com',
                    website: 'https://yamamacement.com',
                    linkType: 'manual',
                    categories: ['cement', 'building_materials'],
                    status: 'active',
                    createdBy: 'system'
                },
                {
                    name: { ar: 'الفنار للمعدات الكهربائية', en: 'Al-Fanar Electric' },
                    companyName: 'مجموعة الفنار',
                    phone: '0558887777',
                    email: 'orders@alfanar.com',
                    website: 'https://alfanar.com',
                    linkType: 'api',
                    apiConfig: {
                        endpoint: 'https://api.alfanar.com/products',
                        refreshInterval: 12,
                        syncStatus: 'pending'
                    },
                    categories: ['electrical'],
                    notes: 'وكيل معتمد لشنايدر وليجراند',
                    status: 'active',
                    createdBy: 'system'
                }
            ];

            for (const sup of sampleSuppliers) {
                const added = this.addSupplier(sup);

                // إضافة أسعار تجريبية
                if (added.name.ar.includes('حديد')) {
                    this.addPrice({
                        externalSupplierId: added.id,
                        productName: { ar: 'حديد تسليح 10مم', en: 'Rebar 10mm' },
                        productCode: 'STL-10',
                        category: 'steel',
                        unit: 'طن',
                        price: 3150,
                        currency: 'SAR',
                        source: 'quotation',
                        sourceReference: 'Q-2024-001',
                        status: 'current',
                        internalPrice: 3200,
                        priceDifference: -1.56,
                        createdBy: 'system'
                    });
                    this.addPrice({
                        externalSupplierId: added.id,
                        productName: { ar: 'حديد تسليح 12مم', en: 'Rebar 12mm' },
                        productCode: 'STL-12',
                        category: 'steel',
                        unit: 'طن',
                        price: 3280,
                        currency: 'SAR',
                        source: 'quotation',
                        sourceReference: 'Q-2024-001',
                        status: 'current',
                        internalPrice: 3350,
                        priceDifference: -2.09,
                        createdBy: 'system'
                    });
                }

                if (added.name.ar.includes('إسمنت')) {
                    this.addPrice({
                        externalSupplierId: added.id,
                        productName: { ar: 'إسمنت بورتلاندي عادي', en: 'Ordinary Portland Cement' },
                        productCode: 'OPC-50',
                        category: 'cement',
                        unit: 'كيس 50 كجم',
                        price: 17.5,
                        currency: 'SAR',
                        source: 'manual_entry',
                        status: 'current',
                        internalPrice: 18,
                        priceDifference: -2.78,
                        createdBy: 'system'
                    });
                }
            }
        }
    }
}

export const externalSupplierService = new ExternalSupplierService();
