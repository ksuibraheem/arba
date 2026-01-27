/**
 * خدمة طلبات تصحيح بيانات الموردين
 * Supplier Data Correction Request Service
 */

// نوع طلب التصحيح
export type CorrectionRequestStatus = 'pending' | 'acknowledged' | 'completed' | 'rejected';
export type CorrectionDataType = 'product' | 'service' | 'company_info' | 'pricing' | 'other';

// طلب تصحيح البيانات
export interface DataCorrectionRequest {
    id: string;
    supplierId: string;
    supplierName: string;

    // بيانات الطلب
    dataType: CorrectionDataType;
    dataId?: string;           // معرف المنتج/الخدمة إذا وجد
    dataName?: string;         // اسم المنتج/الخدمة
    currentValue?: string;     // القيمة الحالية
    issueDescription: string;  // وصف المشكلة
    suggestedCorrection?: string; // الاقتراح

    // بيانات مهندس الكميات
    requestedBy: string;
    requestedByName: string;
    requestedAt: string;

    // حالة الطلب
    status: CorrectionRequestStatus;
    supplierResponse?: string;
    respondedAt?: string;
    completedAt?: string;

    // الأولوية
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

// ترجمات حالة الطلب
export const CORRECTION_STATUS_TRANSLATIONS: Record<CorrectionRequestStatus, { ar: string; en: string }> = {
    pending: { ar: 'بانتظار الرد', en: 'Pending' },
    acknowledged: { ar: 'تم الاستلام', en: 'Acknowledged' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    rejected: { ar: 'مرفوض', en: 'Rejected' }
};

// ترجمات نوع البيانات
export const CORRECTION_DATA_TYPE_TRANSLATIONS: Record<CorrectionDataType, { ar: string; en: string }> = {
    product: { ar: 'منتج', en: 'Product' },
    service: { ar: 'خدمة', en: 'Service' },
    company_info: { ar: 'بيانات الشركة', en: 'Company Info' },
    pricing: { ar: 'تسعير', en: 'Pricing' },
    other: { ar: 'أخرى', en: 'Other' }
};

// ترجمات الأولوية
export const CORRECTION_PRIORITY_TRANSLATIONS: Record<DataCorrectionRequest['priority'], { ar: string; en: string }> = {
    low: { ar: 'منخفضة', en: 'Low' },
    medium: { ar: 'متوسطة', en: 'Medium' },
    high: { ar: 'عالية', en: 'High' },
    urgent: { ar: 'عاجلة', en: 'Urgent' }
};

// ألوان الأولوية
export const PRIORITY_COLORS: Record<DataCorrectionRequest['priority'], string> = {
    low: 'bg-slate-500/20 text-slate-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-orange-500/20 text-orange-400',
    urgent: 'bg-red-500/20 text-red-400'
};

// ألوان الحالة
export const STATUS_COLORS: Record<CorrectionRequestStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    acknowledged: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400'
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
    // إظهار أول اسمين فقط
    return `${names[0]} ${names[1]}`;
};

/**
 * الحصول على الاسم المناسب حسب نوع المستخدم
 * @param fullName الاسم الكامل
 * @param isForSupplier هل العرض للمورد
 */
export const getDisplayName = (fullName: string, isForSupplier: boolean = false): string => {
    return isForSupplier ? maskEngineerName(fullName) : fullName;
};

// خدمة طلبات التصحيح
class DataCorrectionService {
    private storageKey = 'arba_data_correction_requests';
    private notificationsKey = 'arba_supplier_notifications';

    // الحصول على جميع الطلبات
    getRequests(): DataCorrectionRequest[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // حفظ الطلبات
    private saveRequests(requests: DataCorrectionRequest[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(requests));
    }

    // إنشاء طلب جديد
    createRequest(data: Omit<DataCorrectionRequest, 'id' | 'status' | 'requestedAt'>): DataCorrectionRequest {
        const requests = this.getRequests();

        const newRequest: DataCorrectionRequest = {
            ...data,
            id: crypto.randomUUID(),
            status: 'pending',
            requestedAt: new Date().toISOString()
        };

        requests.unshift(newRequest);
        this.saveRequests(requests);

        // إرسال إشعار للمورد
        this.notifySupplier(newRequest);

        return newRequest;
    }

    // الحصول على طلبات مهندس معين
    getRequestsByEngineer(engineerId: string): DataCorrectionRequest[] {
        return this.getRequests().filter(r => r.requestedBy === engineerId);
    }

    // الحصول على طلبات مورد معين
    getRequestsBySupplier(supplierId: string): DataCorrectionRequest[] {
        return this.getRequests().filter(r => r.supplierId === supplierId);
    }

    // الحصول على الطلبات المعلقة لمورد
    getPendingRequestsForSupplier(supplierId: string): DataCorrectionRequest[] {
        return this.getRequests().filter(r =>
            r.supplierId === supplierId &&
            (r.status === 'pending' || r.status === 'acknowledged')
        );
    }

    // تحديث حالة الطلب من المورد
    acknowledgeRequest(requestId: string, response?: string): DataCorrectionRequest | null {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) return null;

        requests[index] = {
            ...requests[index],
            status: 'acknowledged',
            supplierResponse: response,
            respondedAt: new Date().toISOString()
        };

        this.saveRequests(requests);
        return requests[index];
    }

    // إكمال الطلب (بعد تصحيح البيانات)
    completeRequest(requestId: string, response?: string): DataCorrectionRequest | null {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) return null;

        requests[index] = {
            ...requests[index],
            status: 'completed',
            supplierResponse: response || requests[index].supplierResponse,
            completedAt: new Date().toISOString()
        };

        this.saveRequests(requests);
        return requests[index];
    }

    // رفض الطلب
    rejectRequest(requestId: string, reason: string): DataCorrectionRequest | null {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) return null;

        requests[index] = {
            ...requests[index],
            status: 'rejected',
            supplierResponse: reason,
            respondedAt: new Date().toISOString()
        };

        this.saveRequests(requests);
        return requests[index];
    }

    // إرسال إشعار للمورد
    private notifySupplier(request: DataCorrectionRequest): void {
        const notifications = this.getSupplierNotifications();

        notifications.unshift({
            id: crypto.randomUUID(),
            supplierId: request.supplierId,
            type: 'correction_request',
            title: 'طلب تصحيح بيانات',
            message: `طلب تصحيح من مهندس الكميات: ${request.issueDescription}`,
            relatedId: request.id,
            isRead: false,
            createdAt: new Date().toISOString()
        });

        localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
    }

    // الحصول على إشعارات المورد
    getSupplierNotifications(): SupplierNotification[] {
        const data = localStorage.getItem(this.notificationsKey);
        return data ? JSON.parse(data) : [];
    }

    // الحصول على إشعارات مورد معين
    getNotificationsForSupplier(supplierId: string): SupplierNotification[] {
        return this.getSupplierNotifications().filter(n => n.supplierId === supplierId);
    }

    // تحديد الإشعار كمقروء
    markNotificationAsRead(notificationId: string): void {
        const notifications = this.getSupplierNotifications();
        const index = notifications.findIndex(n => n.id === notificationId);

        if (index !== -1) {
            notifications[index].isRead = true;
            localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
        }
    }

    // عدد الإشعارات غير المقروءة
    getUnreadCountForSupplier(supplierId: string): number {
        return this.getNotificationsForSupplier(supplierId).filter(n => !n.isRead).length;
    }

    // إحصائيات
    getStats(engineerId?: string): {
        total: number;
        pending: number;
        acknowledged: number;
        completed: number;
        rejected: number;
    } {
        const requests = engineerId
            ? this.getRequestsByEngineer(engineerId)
            : this.getRequests();

        return {
            total: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            acknowledged: requests.filter(r => r.status === 'acknowledged').length,
            completed: requests.filter(r => r.status === 'completed').length,
            rejected: requests.filter(r => r.status === 'rejected').length
        };
    }
}

// إشعار المورد
export interface SupplierNotification {
    id: string;
    supplierId: string;
    type: 'correction_request' | 'review_result' | 'message' | 'system';
    title: string;
    message: string;
    relatedId?: string;
    isRead: boolean;
    createdAt: string;
}

export const dataCorrectionService = new DataCorrectionService();
