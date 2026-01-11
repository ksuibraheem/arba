/**
 * خدمة طلبات التخفيضات
 * Discount Request Service - Allows Quantity Surveyor to request discounts for companies
 */

// ====================== أنواع البيانات ======================

// حالة طلب التخفيض
export type DiscountRequestStatus = 'pending' | 'approved' | 'rejected';

// نوع العميل المستهدف
export type DiscountTargetType = 'company' | 'individual';

// نوع الخصم
export type DiscountType = 'percentage' | 'fixed';

// طلب التخفيض
export interface DiscountRequest {
    id: string;
    targetType: DiscountTargetType;     // نوع العميل (شركة/فرد)
    targetId: string;                   // معرف الشركة/العميل
    targetName: string;                 // اسم الشركة/العميل
    discountType: DiscountType;         // نوع الخصم (نسبة/مبلغ ثابت)
    discountValue: number;              // قيمة الخصم
    startDate: string;                  // تاريخ بداية الخصم
    endDate: string;                    // تاريخ نهاية الخصم
    reason: string;                     // سبب طلب الخصم
    status: DiscountRequestStatus;      // حالة الطلب
    requestedBy: string;                // معرف مهندس الكميات
    requestedByName: string;            // اسم مهندس الكميات
    requestDate: string;                // تاريخ الطلب
    reviewedBy?: string;                // معرف المحاسب المراجع
    reviewedByName?: string;            // اسم المحاسب
    reviewDate?: string;                // تاريخ المراجعة
    rejectionReason?: string;           // سبب الرفض
    notes?: string;                     // ملاحظات إضافية
    isActive: boolean;                  // هل الخصم مفعل حالياً
    createdAt: string;
    updatedAt: string;
}

// ====================== الترجمات ======================

export const DISCOUNT_REQUEST_STATUS_TRANSLATIONS: Record<DiscountRequestStatus, { ar: string; en: string }> = {
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    approved: { ar: 'معتمد', en: 'Approved' },
    rejected: { ar: 'مرفوض', en: 'Rejected' }
};

export const DISCOUNT_TARGET_TYPE_TRANSLATIONS: Record<DiscountTargetType, { ar: string; en: string }> = {
    company: { ar: 'شركة', en: 'Company' },
    individual: { ar: 'فرد', en: 'Individual' }
};

export const DISCOUNT_TYPE_TRANSLATIONS: Record<DiscountType, { ar: string; en: string }> = {
    percentage: { ar: 'نسبة مئوية', en: 'Percentage' },
    fixed: { ar: 'مبلغ ثابت', en: 'Fixed Amount' }
};

// ====================== خدمة طلبات التخفيضات ======================

class DiscountRequestService {
    private storageKey = 'arba_discount_requests';

    // الحصول على جميع الطلبات
    getRequests(): DiscountRequest[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // حفظ الطلبات
    private saveRequests(requests: DiscountRequest[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(requests));
    }

    // الحصول على طلب بالمعرف
    getRequestById(id: string): DiscountRequest | null {
        return this.getRequests().find(r => r.id === id) || null;
    }

    // الحصول على الطلبات المعلقة
    getPendingRequests(): DiscountRequest[] {
        return this.getRequests().filter(r => r.status === 'pending');
    }

    // الحصول على الطلبات المعتمدة النشطة
    getActiveDiscounts(): DiscountRequest[] {
        const now = new Date().toISOString().split('T')[0];
        return this.getRequests().filter(r =>
            r.status === 'approved' &&
            r.isActive &&
            r.startDate <= now &&
            r.endDate >= now
        );
    }

    // الحصول على طلبات مقدمة من مهندس معين
    getRequestsByEngineer(engineerId: string): DiscountRequest[] {
        return this.getRequests().filter(r => r.requestedBy === engineerId);
    }

    // الحصول على الخصم النشط لعميل معين
    getActiveDiscountForTarget(targetId: string): DiscountRequest | null {
        const now = new Date().toISOString().split('T')[0];
        return this.getRequests().find(r =>
            r.targetId === targetId &&
            r.status === 'approved' &&
            r.isActive &&
            r.startDate <= now &&
            r.endDate >= now
        ) || null;
    }

    // إنشاء طلب تخفيض جديد
    createRequest(data: {
        targetType: DiscountTargetType;
        targetId: string;
        targetName: string;
        discountType: DiscountType;
        discountValue: number;
        startDate: string;
        endDate: string;
        reason: string;
        requestedBy: string;
        requestedByName: string;
        notes?: string;
    }): DiscountRequest {
        const requests = this.getRequests();
        const now = new Date().toISOString();

        // التحقق من عدم وجود طلب معلق للعميل نفسه
        const existingPending = requests.find(r =>
            r.targetId === data.targetId &&
            r.status === 'pending'
        );
        if (existingPending) {
            throw new Error('يوجد طلب معلق لهذا العميل بالفعل');
        }

        const newRequest: DiscountRequest = {
            id: crypto.randomUUID(),
            ...data,
            status: 'pending',
            requestDate: now,
            isActive: false,
            createdAt: now,
            updatedAt: now
        };

        requests.push(newRequest);
        this.saveRequests(requests);
        return newRequest;
    }

    // الموافقة على طلب التخفيض
    approveRequest(
        requestId: string,
        reviewedBy: string,
        reviewedByName: string
    ): DiscountRequest {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            throw new Error('الطلب غير موجود');
        }

        if (requests[index].status !== 'pending') {
            throw new Error('لا يمكن الموافقة على طلب تمت معالجته');
        }

        const now = new Date().toISOString();
        requests[index] = {
            ...requests[index],
            status: 'approved',
            reviewedBy,
            reviewedByName,
            reviewDate: now,
            isActive: true,
            updatedAt: now
        };

        this.saveRequests(requests);
        return requests[index];
    }

    // رفض طلب التخفيض
    rejectRequest(
        requestId: string,
        reviewedBy: string,
        reviewedByName: string,
        rejectionReason: string
    ): DiscountRequest {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            throw new Error('الطلب غير موجود');
        }

        if (requests[index].status !== 'pending') {
            throw new Error('لا يمكن رفض طلب تمت معالجته');
        }

        const now = new Date().toISOString();
        requests[index] = {
            ...requests[index],
            status: 'rejected',
            reviewedBy,
            reviewedByName,
            reviewDate: now,
            rejectionReason,
            updatedAt: now
        };

        this.saveRequests(requests);
        return requests[index];
    }

    // إلغاء تفعيل خصم
    deactivateDiscount(requestId: string): DiscountRequest | null {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) return null;

        requests[index] = {
            ...requests[index],
            isActive: false,
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);
        return requests[index];
    }

    // حساب قيمة الخصم
    calculateDiscount(amount: number, discount: DiscountRequest): number {
        if (discount.discountType === 'percentage') {
            return amount * (discount.discountValue / 100);
        }
        return Math.min(discount.discountValue, amount);
    }

    // الإحصائيات
    getStats(): {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        activeDiscounts: number;
    } {
        const requests = this.getRequests();
        const now = new Date().toISOString().split('T')[0];

        return {
            total: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            rejected: requests.filter(r => r.status === 'rejected').length,
            activeDiscounts: requests.filter(r =>
                r.status === 'approved' &&
                r.isActive &&
                r.startDate <= now &&
                r.endDate >= now
            ).length
        };
    }
}

export const discountRequestService = new DiscountRequestService();
