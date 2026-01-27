/**
 * خدمة مراجعة بيانات الموردين
 * Supplier Review Service - Allows Quantity Surveyor to review and approve supplier data
 */

// ====================== أنواع البيانات ======================

// حالة المراجعة
export type ReviewStatus = 'pending' | 'approved' | 'revision_requested' | 'rejected';

// نوع البيانات المراد مراجعتها
export type ReviewDataType = 'product' | 'price' | 'general' | 'category';

// مراجعة بيانات المورد
export interface SupplierDataReview {
    id: string;
    supplierId: string;                 // معرف المورد
    supplierName: string;               // اسم المورد
    dataType: ReviewDataType;           // نوع البيانات
    dataId?: string;                    // معرف البيانات المحددة (مثل معرف المنتج)
    dataName?: string;                  // اسم البيانات (مثل اسم المنتج)
    dataBefore?: any;                   // البيانات قبل التعديل
    dataAfter?: any;                    // البيانات بعد التعديل
    status: ReviewStatus;               // حالة المراجعة
    reviewedBy?: string;                // معرف المراجع (مهندس الكميات)
    reviewedByName?: string;            // اسم المراجع
    reviewDate?: string;                // تاريخ المراجعة
    revisionNotes?: string;             // ملاحظات طلب التعديل
    rejectionReason?: string;           // سبب الرفض
    supplierResponse?: string;          // رد المورد
    createdAt: string;
    updatedAt: string;
}

// ملخص مراجعات المورد
export interface SupplierReviewSummary {
    supplierId: string;
    supplierName: string;
    totalReviews: number;
    pending: number;
    approved: number;
    revisionRequested: number;
    rejected: number;
    lastReviewDate?: string;
}

// ====================== الترجمات ======================

export const REVIEW_STATUS_TRANSLATIONS: Record<ReviewStatus, { ar: string; en: string }> = {
    pending: { ar: 'قيد المراجعة', en: 'Pending Review' },
    approved: { ar: 'معتمد', en: 'Approved' },
    revision_requested: { ar: 'يحتاج تعديل', en: 'Revision Requested' },
    rejected: { ar: 'مرفوض', en: 'Rejected' }
};

export const REVIEW_DATA_TYPE_TRANSLATIONS: Record<ReviewDataType, { ar: string; en: string }> = {
    product: { ar: 'منتج', en: 'Product' },
    price: { ar: 'تسعير', en: 'Pricing' },
    general: { ar: 'بيانات عامة', en: 'General Info' },
    category: { ar: 'تصنيف', en: 'Category' }
};

/**
 * إخفاء اسم المهندس للخصوصية - يظهر أول اسمين فقط
 * Mask engineer name for privacy - shows only first two names
 * @param fullName الاسم الكامل
 * @returns أول اسمين فقط
 */
export const maskEngineerName = (fullName: string): string => {
    if (!fullName) return '';
    const names = fullName.trim().split(/\s+/);
    if (names.length <= 2) {
        return fullName;
    }
    return `${names[0]} ${names[1]}`;
};

// ====================== خدمة مراجعة الموردين ======================

class SupplierReviewService {
    private storageKey = 'arba_supplier_reviews';

    // الحصول على جميع المراجعات
    getReviews(): SupplierDataReview[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // حفظ المراجعات
    private saveReviews(reviews: SupplierDataReview[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(reviews));
    }

    // الحصول على مراجعة بالمعرف
    getReviewById(id: string): SupplierDataReview | null {
        return this.getReviews().find(r => r.id === id) || null;
    }

    // الحصول على مراجعات مورد معين
    getReviewsBySupplierId(supplierId: string): SupplierDataReview[] {
        return this.getReviews().filter(r => r.supplierId === supplierId);
    }

    // الحصول على المراجعات المعلقة
    getPendingReviews(): SupplierDataReview[] {
        return this.getReviews().filter(r => r.status === 'pending');
    }

    // الحصول على طلبات التعديل المعلقة (للمورد)
    getPendingRevisions(supplierId: string): SupplierDataReview[] {
        return this.getReviews().filter(r =>
            r.supplierId === supplierId &&
            r.status === 'revision_requested'
        );
    }

    // إنشاء طلب مراجعة جديد (يُستخدم تلقائياً عند إضافة/تعديل بيانات من المورد)
    createReview(data: {
        supplierId: string;
        supplierName: string;
        dataType: ReviewDataType;
        dataId?: string;
        dataName?: string;
        dataBefore?: any;
        dataAfter?: any;
    }): SupplierDataReview {
        const reviews = this.getReviews();
        const now = new Date().toISOString();

        const newReview: SupplierDataReview = {
            id: crypto.randomUUID(),
            ...data,
            status: 'pending',
            createdAt: now,
            updatedAt: now
        };

        reviews.push(newReview);
        this.saveReviews(reviews);
        return newReview;
    }

    // الموافقة على البيانات
    approveReview(
        reviewId: string,
        reviewedBy: string,
        reviewedByName: string
    ): SupplierDataReview {
        const reviews = this.getReviews();
        const index = reviews.findIndex(r => r.id === reviewId);

        if (index === -1) {
            throw new Error('المراجعة غير موجودة');
        }

        const now = new Date().toISOString();
        reviews[index] = {
            ...reviews[index],
            status: 'approved',
            reviewedBy,
            reviewedByName,
            reviewDate: now,
            updatedAt: now
        };

        this.saveReviews(reviews);
        return reviews[index];
    }

    // طلب تعديل
    requestRevision(
        reviewId: string,
        reviewedBy: string,
        reviewedByName: string,
        revisionNotes: string
    ): SupplierDataReview {
        const reviews = this.getReviews();
        const index = reviews.findIndex(r => r.id === reviewId);

        if (index === -1) {
            throw new Error('المراجعة غير موجودة');
        }

        const now = new Date().toISOString();
        reviews[index] = {
            ...reviews[index],
            status: 'revision_requested',
            reviewedBy,
            reviewedByName,
            reviewDate: now,
            revisionNotes,
            updatedAt: now
        };

        this.saveReviews(reviews);
        return reviews[index];
    }

    // رفض البيانات
    rejectReview(
        reviewId: string,
        reviewedBy: string,
        reviewedByName: string,
        rejectionReason: string
    ): SupplierDataReview {
        const reviews = this.getReviews();
        const index = reviews.findIndex(r => r.id === reviewId);

        if (index === -1) {
            throw new Error('المراجعة غير موجودة');
        }

        const now = new Date().toISOString();
        reviews[index] = {
            ...reviews[index],
            status: 'rejected',
            reviewedBy,
            reviewedByName,
            reviewDate: now,
            rejectionReason,
            updatedAt: now
        };

        this.saveReviews(reviews);
        return reviews[index];
    }

    // رد المورد على طلب التعديل
    supplierRespond(
        reviewId: string,
        response: string,
        dataAfter?: any
    ): SupplierDataReview {
        const reviews = this.getReviews();
        const index = reviews.findIndex(r => r.id === reviewId);

        if (index === -1) {
            throw new Error('المراجعة غير موجودة');
        }

        const now = new Date().toISOString();
        reviews[index] = {
            ...reviews[index],
            status: 'pending', // إعادة للمراجعة
            supplierResponse: response,
            dataAfter: dataAfter || reviews[index].dataAfter,
            updatedAt: now
        };

        this.saveReviews(reviews);
        return reviews[index];
    }

    // الحصول على ملخص مراجعات مورد
    getSupplierSummary(supplierId: string, supplierName: string): SupplierReviewSummary {
        const reviews = this.getReviewsBySupplierId(supplierId);

        const lastReview = reviews.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];

        return {
            supplierId,
            supplierName,
            totalReviews: reviews.length,
            pending: reviews.filter(r => r.status === 'pending').length,
            approved: reviews.filter(r => r.status === 'approved').length,
            revisionRequested: reviews.filter(r => r.status === 'revision_requested').length,
            rejected: reviews.filter(r => r.status === 'rejected').length,
            lastReviewDate: lastReview?.updatedAt
        };
    }

    // الإحصائيات العامة
    getStats(): {
        total: number;
        pending: number;
        approved: number;
        revisionRequested: number;
        rejected: number;
        byType: Record<ReviewDataType, number>;
    } {
        const reviews = this.getReviews();
        const byType: Record<ReviewDataType, number> = {
            product: 0,
            price: 0,
            general: 0,
            category: 0
        };

        reviews.forEach(r => {
            byType[r.dataType]++;
        });

        return {
            total: reviews.length,
            pending: reviews.filter(r => r.status === 'pending').length,
            approved: reviews.filter(r => r.status === 'approved').length,
            revisionRequested: reviews.filter(r => r.status === 'revision_requested').length,
            rejected: reviews.filter(r => r.status === 'rejected').length,
            byType
        };
    }

    // تهيئة بيانات تجريبية
    initializeSampleData(suppliers: { id: string; name: string }[]): void {
        if (this.getReviews().length > 0) return;

        const sampleReviews: SupplierDataReview[] = [];
        const now = new Date();

        suppliers.forEach((supplier, i) => {
            // إضافة بعض المراجعات التجريبية
            sampleReviews.push({
                id: crypto.randomUUID(),
                supplierId: supplier.id,
                supplierName: supplier.name,
                dataType: 'product',
                dataName: 'منتج جديد - تجريبي',
                dataAfter: { name: 'منتج تجريبي', price: 1000 },
                status: 'pending',
                createdAt: new Date(now.getTime() - i * 86400000).toISOString(),
                updatedAt: new Date(now.getTime() - i * 86400000).toISOString()
            });
        });

        this.saveReviews(sampleReviews);
    }
}

export const supplierReviewService = new SupplierReviewService();
