/**
 * خدمة طلبات تعديل الفواتير
 * Invoice Edit Request Service
 */

import { Invoice } from './accountingService';

// ====================== أنواع البيانات ======================

// حالة طلب التعديل
export type EditRequestStatus = 'pending' | 'approved' | 'rejected';

// طلب تعديل فاتورة
export interface InvoiceEditRequest {
    id: string;
    invoiceId: string;
    invoiceNumber: string;
    requestedBy: string;           // معرف المحاسب
    requestedByName: string;       // اسم المحاسب
    requestReason: string;         // سبب طلب التعديل
    requestDate: string;
    status: EditRequestStatus;
    approvedBy?: string;           // معرف المدير الموافق
    approvedByName?: string;       // اسم المدير
    approvalDate?: string;
    rejectionReason?: string;      // سبب الرفض
    expiresAt?: string;            // تاريخ انتهاء الصلاحية (3 أيام بعد الموافقة)
    isEdited: boolean;             // هل تم التعديل؟
    editedAt?: string;             // تاريخ التعديل
}

// نسخة الفاتورة (للحفاظ على النسخة الأصلية)
export interface InvoiceVersion {
    id: string;
    invoiceId: string;
    version: number;
    data: Partial<Invoice>;        // بيانات الفاتورة في هذه النسخة
    createdAt: string;
    createdBy: string;
    changeNote?: string;           // ملاحظة التغيير
}

// ====================== الترجمات ======================

export const EDIT_REQUEST_STATUS_TRANSLATIONS: Record<EditRequestStatus, { ar: string; en: string }> = {
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    approved: { ar: 'موافق عليه', en: 'Approved' },
    rejected: { ar: 'مرفوض', en: 'Rejected' }
};

// ====================== خدمة طلبات التعديل ======================

class InvoiceEditRequestService {
    private requestsKey = 'arba_invoice_edit_requests';
    private versionsKey = 'arba_invoice_versions';

    // =================== طلبات التعديل ===================

    getRequests(): InvoiceEditRequest[] {
        const data = localStorage.getItem(this.requestsKey);
        return data ? JSON.parse(data) : [];
    }

    private saveRequests(requests: InvoiceEditRequest[]): void {
        localStorage.setItem(this.requestsKey, JSON.stringify(requests));
    }

    getRequestById(id: string): InvoiceEditRequest | null {
        return this.getRequests().find(r => r.id === id) || null;
    }

    getRequestByInvoiceId(invoiceId: string): InvoiceEditRequest | null {
        return this.getRequests().find(r => r.invoiceId === invoiceId && r.status === 'pending') || null;
    }

    getPendingRequests(): InvoiceEditRequest[] {
        return this.getRequests().filter(r => r.status === 'pending');
    }

    getApprovedRequests(): InvoiceEditRequest[] {
        return this.getRequests().filter(r => r.status === 'approved' && !r.isEdited);
    }

    /**
     * إنشاء طلب تعديل فاتورة
     */
    createRequest(
        invoiceId: string,
        invoiceNumber: string,
        requestedBy: string,
        requestedByName: string,
        requestReason: string
    ): InvoiceEditRequest {
        const requests = this.getRequests();

        // التحقق من عدم وجود طلب سابق قيد الانتظار
        const existingPending = requests.find(
            r => r.invoiceId === invoiceId && r.status === 'pending'
        );
        if (existingPending) {
            throw new Error('يوجد طلب تعديل قيد الانتظار لهذه الفاتورة');
        }

        const newRequest: InvoiceEditRequest = {
            id: crypto.randomUUID(),
            invoiceId,
            invoiceNumber,
            requestedBy,
            requestedByName,
            requestReason,
            requestDate: new Date().toISOString(),
            status: 'pending',
            isEdited: false
        };

        requests.push(newRequest);
        this.saveRequests(requests);
        return newRequest;
    }

    /**
     * الموافقة على طلب التعديل
     */
    approveRequest(
        requestId: string,
        approvedBy: string,
        approvedByName: string
    ): InvoiceEditRequest {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            throw new Error('طلب التعديل غير موجود');
        }

        const request = requests[index];
        if (request.status !== 'pending') {
            throw new Error('هذا الطلب تمت معالجته مسبقاً');
        }

        // تحديد تاريخ انتهاء الصلاحية (3 أيام)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 3);

        requests[index] = {
            ...request,
            status: 'approved',
            approvedBy,
            approvedByName,
            approvalDate: new Date().toISOString(),
            expiresAt: expiresAt.toISOString()
        };

        this.saveRequests(requests);
        return requests[index];
    }

    /**
     * رفض طلب التعديل
     */
    rejectRequest(
        requestId: string,
        rejectedBy: string,
        rejectedByName: string,
        rejectionReason: string
    ): InvoiceEditRequest {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            throw new Error('طلب التعديل غير موجود');
        }

        const request = requests[index];
        if (request.status !== 'pending') {
            throw new Error('هذا الطلب تمت معالجته مسبقاً');
        }

        requests[index] = {
            ...request,
            status: 'rejected',
            approvedBy: rejectedBy,
            approvedByName: rejectedByName,
            approvalDate: new Date().toISOString(),
            rejectionReason
        };

        this.saveRequests(requests);
        return requests[index];
    }

    /**
     * التحقق من إمكانية تعديل الفاتورة
     */
    canEditInvoice(invoiceId: string): { canEdit: boolean; reason?: string; expiresAt?: string } {
        const requests = this.getRequests();
        const approvedRequest = requests.find(
            r => r.invoiceId === invoiceId &&
                r.status === 'approved' &&
                !r.isEdited
        );

        if (!approvedRequest) {
            return { canEdit: false, reason: 'لا يوجد طلب تعديل موافق عليه' };
        }

        // التحقق من انتهاء الصلاحية
        if (approvedRequest.expiresAt) {
            const expiresAt = new Date(approvedRequest.expiresAt);
            if (new Date() > expiresAt) {
                return { canEdit: false, reason: 'انتهت صلاحية التعديل (3 أيام)' };
            }
        }

        return {
            canEdit: true,
            expiresAt: approvedRequest.expiresAt
        };
    }

    /**
     * تسجيل اكتمال التعديل
     */
    markAsEdited(invoiceId: string): void {
        const requests = this.getRequests();
        const index = requests.findIndex(
            r => r.invoiceId === invoiceId &&
                r.status === 'approved' &&
                !r.isEdited
        );

        if (index !== -1) {
            requests[index] = {
                ...requests[index],
                isEdited: true,
                editedAt: new Date().toISOString()
            };
            this.saveRequests(requests);
        }
    }

    // =================== سجل النسخ (Version History) ===================

    getVersions(invoiceId: string): InvoiceVersion[] {
        const data = localStorage.getItem(this.versionsKey);
        const allVersions: InvoiceVersion[] = data ? JSON.parse(data) : [];
        return allVersions
            .filter(v => v.invoiceId === invoiceId)
            .sort((a, b) => b.version - a.version);
    }

    private saveVersions(versions: InvoiceVersion[]): void {
        localStorage.setItem(this.versionsKey, JSON.stringify(versions));
    }

    /**
     * حفظ نسخة من الفاتورة قبل التعديل
     */
    saveVersion(
        invoiceId: string,
        invoiceData: Partial<Invoice>,
        createdBy: string,
        changeNote?: string
    ): InvoiceVersion {
        const data = localStorage.getItem(this.versionsKey);
        const allVersions: InvoiceVersion[] = data ? JSON.parse(data) : [];

        // حساب رقم النسخة
        const existingVersions = allVersions.filter(v => v.invoiceId === invoiceId);
        const maxVersion = existingVersions.length > 0
            ? Math.max(...existingVersions.map(v => v.version))
            : 0;

        const newVersion: InvoiceVersion = {
            id: crypto.randomUUID(),
            invoiceId,
            version: maxVersion + 1,
            data: invoiceData,
            createdAt: new Date().toISOString(),
            createdBy,
            changeNote
        };

        allVersions.push(newVersion);
        this.saveVersions(allVersions);
        return newVersion;
    }

    /**
     * الحصول على النسخة الأصلية (أول نسخة)
     */
    getOriginalVersion(invoiceId: string): InvoiceVersion | null {
        const versions = this.getVersions(invoiceId);
        return versions.length > 0
            ? versions[versions.length - 1]  // آخر عنصر هو أقدم نسخة
            : null;
    }

    /**
     * التحقق من وجود تعديلات على الفاتورة
     */
    hasEdits(invoiceId: string): boolean {
        return this.getVersions(invoiceId).length > 0;
    }

    /**
     * الحصول على عدد التعديلات
     */
    getEditCount(invoiceId: string): number {
        return this.getVersions(invoiceId).length;
    }
}

export const invoiceEditRequestService = new InvoiceEditRequestService();
