/**
 * خدمة تسجيل الأفراد الشاملة
 * Individual Registration Service with Verification & Approval
 */

// ====================== أنواع البيانات ======================

// حالة التسجيل
export type RegistrationStatus =
    | 'email_verification'    // بانتظار تأكيد الإيميل
    | 'phone_verification'    // بانتظار تأكيد الجوال
    | 'pending_cr_verification' // بانتظار تأكيد السجل التجاري (للشركات والموردين)
    | 'pending_payment'       // بانتظار الدفع (للاشتراكات المدفوعة)
    | 'payment_under_review'  // الدفع تحت المراجعة
    | 'pending_approval'      // بانتظار موافقة المدير/المحاسب
    | 'approved'              // تم الموافقة
    | 'rejected';             // مرفوض

// نوع المستخدم
export type UserType = 'individual' | 'company' | 'supplier';

// حالة التحقق من الدفع
export type PaymentVerificationStatus =
    | 'not_required'          // غير مطلوب (اشتراك مجاني)
    | 'pending'               // بانتظار الدفع
    | 'receipt_uploaded'      // تم رفع الإيصال
    | 'under_review'          // تحت المراجعة
    | 'verified'              // تم التأكيد
    | 'rejected'              // مرفوض
    | 'request_new';          // طلب إيصال جديد

// طريقة الدفع
export type PaymentMethod = 'bank_transfer' | 'mada' | 'credit_card' | 'stc_pay' | 'apple_pay';

// نوع الخطة
export type PlanType = 'free' | 'professional';

// طلب التسجيل
export interface RegistrationRequest {
    id: string;

    // بيانات المستخدم
    userType: UserType;
    name: string;
    email: string;
    phone: string;
    password: string;

    // بيانات الشركة/المورد (اختياري)
    companyName?: string;
    commercialRegister?: string;
    businessType?: string;

    // التحقق من السجل التجاري (للشركات والموردين)
    crVerified: boolean;
    crVerifiedBy?: string;
    crVerifiedAt?: string;
    crRejectionReason?: string;

    // الاشتراك
    plan: PlanType;
    amount: number;

    // التحقق من الإيميل
    emailCode: string;
    emailCodeExpiry: string;
    emailVerified: boolean;
    emailVerifiedAt?: string;

    // التحقق من الجوال
    phoneCode: string;
    phoneCodeExpiry: string;
    phoneVerified: boolean;
    phoneVerifiedAt?: string;

    // الدفع (للخطط المدفوعة)
    paymentMethod?: PaymentMethod;
    paymentReceipt?: string;          // base64 image
    paymentReceiptName?: string;
    paymentStatus: PaymentVerificationStatus;
    paymentNotes?: string;
    paymentVerifiedBy?: string;
    paymentVerifiedAt?: string;

    // الموافقة
    status: RegistrationStatus;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;

    // الطوابع الزمنية
    createdAt: string;
    updatedAt: string;
}

// إشعار
export interface Notification {
    id: string;
    type: 'email' | 'sms';
    to: string;
    subject?: string;
    message: string;
    sentAt: string;
    relatedRequestId?: string;
}

// ====================== الترجمات ======================

export const REGISTRATION_STATUS_TRANSLATIONS: Record<RegistrationStatus, { ar: string; en: string }> = {
    email_verification: { ar: 'بانتظار تأكيد الإيميل', en: 'Email Verification Pending' },
    phone_verification: { ar: 'بانتظار تأكيد الجوال', en: 'Phone Verification Pending' },
    pending_cr_verification: { ar: 'بانتظار تأكيد السجل التجاري', en: 'Commercial Register Verification Pending' },
    pending_payment: { ar: 'بانتظار الدفع', en: 'Payment Pending' },
    payment_under_review: { ar: 'الدفع تحت المراجعة', en: 'Payment Under Review' },
    pending_approval: { ar: 'بانتظار الموافقة', en: 'Pending Approval' },
    approved: { ar: 'تم الموافقة', en: 'Approved' },
    rejected: { ar: 'مرفوض', en: 'Rejected' }
};

export const USER_TYPE_TRANSLATIONS: Record<UserType, { ar: string; en: string }> = {
    individual: { ar: 'فرد', en: 'Individual' },
    company: { ar: 'شركة', en: 'Company' },
    supplier: { ar: 'مورد', en: 'Supplier' }
};

// رابط التحقق من السجل التجاري
export const CR_VERIFICATION_URL = 'https://mc.gov.sa/ar/eservices/Pages/Commercial-data.aspx';

export const PAYMENT_STATUS_TRANSLATIONS: Record<PaymentVerificationStatus, { ar: string; en: string }> = {
    not_required: { ar: 'غير مطلوب', en: 'Not Required' },
    pending: { ar: 'بانتظار الدفع', en: 'Pending Payment' },
    receipt_uploaded: { ar: 'تم رفع الإيصال', en: 'Receipt Uploaded' },
    under_review: { ar: 'تحت المراجعة', en: 'Under Review' },
    verified: { ar: 'تم التأكيد', en: 'Verified' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
    request_new: { ar: 'طلب إيصال جديد', en: 'New Receipt Required' }
};

export const PLAN_PRICES: Record<PlanType, number> = {
    free: 0,
    professional: 299
};

// ====================== خدمة التسجيل ======================

class RegistrationService {
    private storageKey = 'arba_registration_requests';
    private notificationsKey = 'arba_notifications';
    private CODE_EXPIRY_MINUTES = 5; // 5 دقائق

    // =================== تهيئة بيانات تجريبية ===================

    initializeSampleData(): void {
        const existing = this.getRequests();
        // إضافة بيانات تجريبية إذا لم تكن موجودة
        if (!existing.some(r => r.email === 'sample@company.com')) {
            const now = new Date();
            const sampleRequests: RegistrationRequest[] = [
                // شركة بانتظار تأكيد السجل التجاري
                {
                    id: 'sample-1',
                    userType: 'company',
                    name: 'أحمد محمد الشركة',
                    email: 'sample@company.com',
                    phone: '0551234567',
                    password: 'Test123456',
                    companyName: 'شركة النجاح للتقنية',
                    commercialRegister: '7012345678',
                    businessType: 'تقنية معلومات',
                    crVerified: false,
                    plan: 'professional',
                    amount: 299,
                    emailCode: '1234',
                    emailCodeExpiry: now.toISOString(),
                    emailVerified: true,
                    emailVerifiedAt: now.toISOString(),
                    phoneCode: '5678',
                    phoneCodeExpiry: now.toISOString(),
                    phoneVerified: true,
                    phoneVerifiedAt: now.toISOString(),
                    paymentStatus: 'pending',
                    status: 'pending_cr_verification',
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString()
                },
                // مورد بانتظار تأكيد السجل التجاري
                {
                    id: 'sample-2',
                    userType: 'supplier',
                    name: 'فهد العتيبي',
                    email: 'supplier@example.com',
                    phone: '0559876543',
                    password: 'Test123456',
                    companyName: 'مؤسسة التوريد الذهبي',
                    commercialRegister: '7098765432',
                    businessType: 'توريدات',
                    crVerified: false,
                    plan: 'professional',
                    amount: 299,
                    emailCode: '1111',
                    emailCodeExpiry: now.toISOString(),
                    emailVerified: true,
                    emailVerifiedAt: now.toISOString(),
                    phoneCode: '2222',
                    phoneCodeExpiry: now.toISOString(),
                    phoneVerified: true,
                    phoneVerifiedAt: now.toISOString(),
                    paymentStatus: 'pending',
                    status: 'pending_cr_verification',
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString()
                },
                // فرد بانتظار الموافقة (مجاني)
                {
                    id: 'sample-3',
                    userType: 'individual',
                    name: 'سارة العمري',
                    email: 'sara@example.com',
                    phone: '0561112233',
                    password: 'Test123456',
                    crVerified: true,
                    plan: 'free',
                    amount: 0,
                    emailCode: '3333',
                    emailCodeExpiry: now.toISOString(),
                    emailVerified: true,
                    emailVerifiedAt: now.toISOString(),
                    phoneCode: '4444',
                    phoneCodeExpiry: now.toISOString(),
                    phoneVerified: true,
                    phoneVerifiedAt: now.toISOString(),
                    paymentStatus: 'not_required',
                    status: 'pending_approval',
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString()
                }
            ];

            const allRequests = [...existing, ...sampleRequests];
            this.saveRequests(allRequests);
            console.log('✅ تم إضافة بيانات التسجيل التجريبية');
        }
    }

    // =================== طلبات التسجيل ===================

    getRequests(): RegistrationRequest[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    private saveRequests(requests: RegistrationRequest[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(requests));
    }

    getRequestById(id: string): RegistrationRequest | null {
        return this.getRequests().find(r => r.id === id) || null;
    }

    getRequestByEmail(email: string): RegistrationRequest | null {
        return this.getRequests().find(r => r.email.toLowerCase() === email.toLowerCase()) || null;
    }

    // =================== إنشاء طلب تسجيل (أفراد) ===================

    createRegistrationRequest(data: {
        name: string;
        email: string;
        phone: string;
        password: string;
        plan: PlanType;
    }): { success: boolean; request?: RegistrationRequest; error?: string } {
        // التحقق من عدم تكرار الإيميل
        const existingRequest = this.getRequestByEmail(data.email);
        if (existingRequest) {
            // إذا كان الطلب مرفوض، السماح بإعادة التسجيل
            if (existingRequest.status !== 'rejected') {
                return {
                    success: false,
                    error: 'البريد الإلكتروني مسجل مسبقاً'
                };
            }
            // حذف الطلب المرفوض القديم
            this.deleteRequest(existingRequest.id);
        }

        const now = new Date();
        const emailCode = this.generateCode();
        const phoneCode = this.generateCode();
        const expiryTime = new Date(now.getTime() + this.CODE_EXPIRY_MINUTES * 60 * 1000);

        const request: RegistrationRequest = {
            id: crypto.randomUUID(),
            userType: 'individual',
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,

            crVerified: true, // لا يحتاج تحقق لأنه فرد

            plan: data.plan,
            amount: PLAN_PRICES[data.plan],

            emailCode,
            emailCodeExpiry: expiryTime.toISOString(),
            emailVerified: false,

            phoneCode,
            phoneCodeExpiry: expiryTime.toISOString(),
            phoneVerified: false,

            paymentStatus: data.plan === 'free' ? 'not_required' : 'pending',
            status: 'email_verification',

            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        };

        const requests = this.getRequests();
        requests.push(request);
        this.saveRequests(requests);

        // إرسال رمز التحقق للإيميل
        this.sendEmailVerification(request.email, emailCode, request.id);

        return { success: true, request };
    }

    // =================== إنشاء طلب تسجيل (شركات/موردين) ===================

    createCompanyRegistrationRequest(data: {
        userType: 'company' | 'supplier';
        name: string;
        email: string;
        phone: string;
        password: string;
        companyName: string;
        commercialRegister: string;
        businessType?: string;
        plan: PlanType;
    }): { success: boolean; request?: RegistrationRequest; error?: string } {
        // التحقق من أن السجل التجاري يبدأ بـ 7
        if (!data.commercialRegister.startsWith('7')) {
            return {
                success: false,
                error: 'رقم السجل التجاري يجب أن يبدأ بالرقم 7'
            };
        }

        // التحقق من طول السجل التجاري (عادة 10 أرقام)
        if (!/^\d{10}$/.test(data.commercialRegister)) {
            return {
                success: false,
                error: 'رقم السجل التجاري يجب أن يكون 10 أرقام'
            };
        }

        // التحقق من عدم تكرار الإيميل
        const existingRequest = this.getRequestByEmail(data.email);
        if (existingRequest) {
            if (existingRequest.status !== 'rejected') {
                return {
                    success: false,
                    error: 'البريد الإلكتروني مسجل مسبقاً'
                };
            }
            this.deleteRequest(existingRequest.id);
        }

        // التحقق من عدم تكرار السجل التجاري
        const existingCR = this.getRequests().find(
            r => r.commercialRegister === data.commercialRegister && r.status !== 'rejected'
        );
        if (existingCR) {
            return {
                success: false,
                error: 'رقم السجل التجاري مسجل مسبقاً'
            };
        }

        const now = new Date();
        const emailCode = this.generateCode();
        const phoneCode = this.generateCode();
        const expiryTime = new Date(now.getTime() + this.CODE_EXPIRY_MINUTES * 60 * 1000);

        const request: RegistrationRequest = {
            id: crypto.randomUUID(),
            userType: data.userType,
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,

            companyName: data.companyName,
            commercialRegister: data.commercialRegister,
            businessType: data.businessType,

            crVerified: false, // يحتاج تحقق من المحاسب/المدير

            plan: data.plan,
            amount: PLAN_PRICES[data.plan],

            emailCode,
            emailCodeExpiry: expiryTime.toISOString(),
            emailVerified: false,

            phoneCode,
            phoneCodeExpiry: expiryTime.toISOString(),
            phoneVerified: false,

            paymentStatus: data.plan === 'free' ? 'not_required' : 'pending',
            status: 'email_verification',

            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        };

        const requests = this.getRequests();
        requests.push(request);
        this.saveRequests(requests);

        // إرسال رمز التحقق للإيميل
        this.sendEmailVerification(request.email, emailCode, request.id);

        return { success: true, request };
    }

    // =================== توليد رمز التحقق ===================

    private generateCode(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    // =================== التحقق من الرموز ===================

    verifyEmailCode(requestId: string, code: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        const request = requests[index];

        // التحقق من انتهاء الصلاحية
        if (new Date() > new Date(request.emailCodeExpiry)) {
            return { success: false, error: 'انتهت صلاحية الرمز. يرجى طلب رمز جديد.' };
        }

        if (request.emailCode !== code) {
            return { success: false, error: 'الرمز غير صحيح' };
        }

        // تحديث الطلب
        requests[index] = {
            ...request,
            emailVerified: true,
            emailVerifiedAt: new Date().toISOString(),
            status: 'phone_verification',
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);

        // إرسال رمز التحقق للجوال
        this.sendSMSVerification(request.phone, request.phoneCode, request.id);

        return { success: true };
    }

    verifyPhoneCode(requestId: string, code: string): { success: boolean; error?: string; nextStep?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        const request = requests[index];

        // التحقق من انتهاء الصلاحية
        if (new Date() > new Date(request.phoneCodeExpiry)) {
            return { success: false, error: 'انتهت صلاحية الرمز. يرجى طلب رمز جديد.' };
        }

        if (request.phoneCode !== code) {
            return { success: false, error: 'الرمز غير صحيح' };
        }

        // تحديد الخطوة التالية بناءً على نوع المستخدم ونوع الخطة
        let nextStatus: RegistrationStatus;
        let nextStep: string;

        // للشركات والموردين: يجب تأكيد السجل التجاري أولاً
        if (request.userType === 'company' || request.userType === 'supplier') {
            nextStatus = 'pending_cr_verification';
            nextStep = 'under_review';
        } else if (request.plan === 'free') {
            nextStatus = 'pending_approval';
            nextStep = 'under_review';
        } else {
            nextStatus = 'pending_payment';
            nextStep = 'payment';
        }

        // تحديث الطلب
        requests[index] = {
            ...request,
            phoneVerified: true,
            phoneVerifiedAt: new Date().toISOString(),
            status: nextStatus,
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);

        // إرسال إشعار "تحت الدراسة" للخطة المجانية
        if (request.plan === 'free') {
            this.sendUnderReviewNotification(request.email, request.id);
        }

        return { success: true, nextStep };
    }

    // =================== إعادة إرسال الرمز ===================

    resendEmailCode(requestId: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        const request = requests[index];
        const newCode = this.generateCode();
        const expiryTime = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000);

        requests[index] = {
            ...request,
            emailCode: newCode,
            emailCodeExpiry: expiryTime.toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);
        this.sendEmailVerification(request.email, newCode, request.id);

        return { success: true };
    }

    resendPhoneCode(requestId: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        const request = requests[index];
        const newCode = this.generateCode();
        const expiryTime = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000);

        requests[index] = {
            ...request,
            phoneCode: newCode,
            phoneCodeExpiry: expiryTime.toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);
        this.sendSMSVerification(request.phone, newCode, request.id);

        return { success: true };
    }

    // =================== الدفع ===================

    selectPaymentMethod(requestId: string, method: PaymentMethod): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        requests[index] = {
            ...requests[index],
            paymentMethod: method,
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);
        return { success: true };
    }

    uploadPaymentReceipt(requestId: string, receiptBase64: string, fileName: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        requests[index] = {
            ...requests[index],
            paymentReceipt: receiptBase64,
            paymentReceiptName: fileName,
            paymentStatus: 'receipt_uploaded',
            status: 'payment_under_review',
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);

        // إرسال إشعار
        this.sendUnderReviewNotification(requests[index].email, requestId);

        return { success: true };
    }

    submitOnlinePayment(requestId: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        requests[index] = {
            ...requests[index],
            paymentStatus: 'under_review',
            status: 'payment_under_review',
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);

        // إرسال إشعار
        this.sendUnderReviewNotification(requests[index].email, requestId);

        return { success: true };
    }

    // =================== إجراءات المحاسب/المدير ===================

    getPendingRegistrations(): RegistrationRequest[] {
        return this.getRequests().filter(r =>
            r.status === 'pending_approval' ||
            r.status === 'payment_under_review' ||
            r.status === 'pending_cr_verification'
        );
    }

    getPendingCRVerifications(): RegistrationRequest[] {
        return this.getRequests().filter(r =>
            r.status === 'pending_cr_verification' && !r.crVerified
        );
    }

    getPendingPaymentVerifications(): RegistrationRequest[] {
        return this.getRequests().filter(r =>
            r.status === 'payment_under_review' &&
            (r.paymentStatus === 'receipt_uploaded' || r.paymentStatus === 'under_review')
        );
    }

    // =================== تأكيد السجل التجاري ===================

    verifyCommercialRegister(requestId: string, verifiedBy: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        const request = requests[index];

        // تحديد الخطوة التالية بعد تأكيد السجل التجاري
        let nextStatus: RegistrationStatus;
        if (request.plan === 'free') {
            nextStatus = 'pending_approval';
        } else {
            nextStatus = 'pending_payment';
        }

        requests[index] = {
            ...request,
            crVerified: true,
            crVerifiedBy: verifiedBy,
            crVerifiedAt: new Date().toISOString(),
            status: nextStatus,
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);

        // إرسال إشعار بتأكيد السجل التجاري
        this.sendCRVerificationNotification(request.email, true, requestId);

        return { success: true };
    }

    rejectCommercialRegister(requestId: string, rejectedBy: string, reason: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        requests[index] = {
            ...requests[index],
            crVerified: false,
            crVerifiedBy: rejectedBy,
            crRejectionReason: reason,
            status: 'rejected',
            rejectionReason: `رفض السجل التجاري: ${reason}`,
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);

        // إرسال إشعار برفض السجل التجاري
        this.sendCRVerificationNotification(requests[index].email, false, requestId, reason);

        return { success: true };
    }

    verifyPayment(requestId: string, verifiedBy: string, notes?: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        requests[index] = {
            ...requests[index],
            paymentStatus: 'verified',
            paymentVerifiedBy: verifiedBy,
            paymentVerifiedAt: new Date().toISOString(),
            paymentNotes: notes,
            status: 'pending_approval', // الانتقال لمرحلة الموافقة النهائية
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);
        return { success: true };
    }

    rejectPayment(requestId: string, rejectedBy: string, reason: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        requests[index] = {
            ...requests[index],
            paymentStatus: 'rejected',
            paymentVerifiedBy: rejectedBy,
            paymentNotes: reason,
            status: 'pending_payment', // العودة لمرحلة الدفع
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);

        // إرسال إشعار
        this.sendPaymentRejectionNotification(requests[index].email, reason, requestId);

        return { success: true };
    }

    requestNewPaymentReceipt(requestId: string, requestedBy: string, reason: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        requests[index] = {
            ...requests[index],
            paymentStatus: 'request_new',
            paymentReceipt: undefined,
            paymentReceiptName: undefined,
            paymentNotes: reason,
            status: 'pending_payment',
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);

        // إرسال إشعار
        this.sendNewReceiptRequestNotification(requests[index].email, reason, requestId);

        return { success: true };
    }

    approveRegistration(requestId: string, approvedBy: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        const request = requests[index];

        // التحقق من تأكيد الدفع للخطط المدفوعة
        if (request.plan !== 'free' && request.paymentStatus !== 'verified') {
            return { success: false, error: 'يجب تأكيد الدفع أولاً' };
        }

        requests[index] = {
            ...request,
            status: 'approved',
            approvedBy,
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);

        // إرسال إشعار الموافقة
        this.sendApprovalNotification(request.email, requestId);

        return { success: true };
    }

    rejectRegistration(requestId: string, rejectedBy: string, reason: string): { success: boolean; error?: string } {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        requests[index] = {
            ...requests[index],
            status: 'rejected',
            approvedBy: rejectedBy,
            rejectionReason: reason,
            updatedAt: new Date().toISOString()
        };

        this.saveRequests(requests);

        // إرسال إشعار الرفض
        this.sendRejectionNotification(requests[index].email, reason, requestId);

        return { success: true };
    }

    // =================== حذف الطلب ===================

    deleteRequest(id: string): boolean {
        const requests = this.getRequests();
        const filtered = requests.filter(r => r.id !== id);
        if (filtered.length === requests.length) return false;
        this.saveRequests(filtered);
        return true;
    }

    // =================== الإشعارات (محاكاة) ===================

    private getNotifications(): Notification[] {
        const data = localStorage.getItem(this.notificationsKey);
        return data ? JSON.parse(data) : [];
    }

    private saveNotification(notification: Notification): void {
        const notifications = this.getNotifications();
        notifications.push(notification);
        localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
    }

    getNotificationsByRequest(requestId: string): Notification[] {
        return this.getNotifications().filter(n => n.relatedRequestId === requestId);
    }

    private sendEmailVerification(email: string, code: string, requestId: string): void {
        const notification: Notification = {
            id: crypto.randomUUID(),
            type: 'email',
            to: email,
            subject: 'رمز التحقق - نظام أربا',
            message: `رمز التحقق الخاص بك هو: ${code}\nصالح لمدة 5 دقائق.`,
            sentAt: new Date().toISOString(),
            relatedRequestId: requestId
        };
        this.saveNotification(notification);
        console.log(`📧 [EMAIL] To: ${email} | Code: ${code}`);
    }

    private sendSMSVerification(phone: string, code: string, requestId: string): void {
        const notification: Notification = {
            id: crypto.randomUUID(),
            type: 'sms',
            to: phone,
            message: `رمز التحقق الخاص بك هو: ${code}\nصالح لمدة 5 دقائق.`,
            sentAt: new Date().toISOString(),
            relatedRequestId: requestId
        };
        this.saveNotification(notification);
        console.log(`📱 [SMS] To: ${phone} | Code: ${code}`);
    }

    private sendUnderReviewNotification(email: string, requestId: string): void {
        const notification: Notification = {
            id: crypto.randomUUID(),
            type: 'email',
            to: email,
            subject: 'طلبك تحت الدراسة - نظام أربا',
            message: 'تم استلام طلب التسجيل الخاص بك وهو الآن تحت الدراسة من قبل فريق الدعم. سيتم إبلاغكم بتفعيل الحساب في أقرب وقت ممكن.',
            sentAt: new Date().toISOString(),
            relatedRequestId: requestId
        };
        this.saveNotification(notification);
        console.log(`📧 [EMAIL] To: ${email} | Subject: Under Review`);
    }

    private sendApprovalNotification(email: string, requestId: string): void {
        const notification: Notification = {
            id: crypto.randomUUID(),
            type: 'email',
            to: email,
            subject: 'تم تفعيل حسابك - نظام أربا',
            message: 'تهانينا! تم الموافقة على طلب التسجيل الخاص بك وتفعيل حسابك. يمكنك الآن تسجيل الدخول واستخدام النظام.',
            sentAt: new Date().toISOString(),
            relatedRequestId: requestId
        };
        this.saveNotification(notification);
        console.log(`📧 [EMAIL] To: ${email} | Subject: Account Approved`);
    }

    private sendRejectionNotification(email: string, reason: string, requestId: string): void {
        const notification: Notification = {
            id: crypto.randomUUID(),
            type: 'email',
            to: email,
            subject: 'تم رفض طلب التسجيل - نظام أربا',
            message: `نأسف لإبلاغك بأنه تم رفض طلب التسجيل الخاص بك.\nالسبب: ${reason}`,
            sentAt: new Date().toISOString(),
            relatedRequestId: requestId
        };
        this.saveNotification(notification);
        console.log(`📧 [EMAIL] To: ${email} | Subject: Registration Rejected`);
    }

    private sendCRVerificationNotification(email: string, approved: boolean, requestId: string, reason?: string): void {
        const notification: Notification = {
            id: crypto.randomUUID(),
            type: 'email',
            to: email,
            subject: approved ? 'تم تأكيد السجل التجاري - نظام أربا' : 'تم رفض السجل التجاري - نظام أربا',
            message: approved
                ? 'تم التحقق من السجل التجاري الخاص بك بنجاح. سيتم مراجعة طلب التسجيل قريباً.'
                : `نأسف لإبلاغك بأنه تم رفض السجل التجاري الخاص بك.\nالسبب: ${reason}`,
            sentAt: new Date().toISOString(),
            relatedRequestId: requestId
        };
        this.saveNotification(notification);
        console.log(`📧 [EMAIL] To: ${email} | Subject: CR ${approved ? 'Verified' : 'Rejected'}`);
    }

    private sendPaymentRejectionNotification(email: string, reason: string, requestId: string): void {
        const notification: Notification = {
            id: crypto.randomUUID(),
            type: 'email',
            to: email,
            subject: 'تم رفض إيصال الدفع - نظام أربا',
            message: `تم رفض إيصال الدفع الخاص بك.\nالسبب: ${reason}\nيرجى رفع إيصال جديد.`,
            sentAt: new Date().toISOString(),
            relatedRequestId: requestId
        };
        this.saveNotification(notification);
        console.log(`📧 [EMAIL] To: ${email} | Subject: Payment Rejected`);
    }

    private sendNewReceiptRequestNotification(email: string, reason: string, requestId: string): void {
        const notification: Notification = {
            id: crypto.randomUUID(),
            type: 'email',
            to: email,
            subject: 'مطلوب إيصال دفع جديد - نظام أربا',
            message: `يرجى رفع إيصال دفع جديد.\nالسبب: ${reason}`,
            sentAt: new Date().toISOString(),
            relatedRequestId: requestId
        };
        this.saveNotification(notification);
        console.log(`📧 [EMAIL] To: ${email} | Subject: New Receipt Required`);
    }

    // =================== إحصائيات ===================

    getStats(): {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        pendingPayment: number;
    } {
        const requests = this.getRequests();
        return {
            total: requests.length,
            pending: requests.filter(r => r.status === 'pending_approval' || r.status === 'payment_under_review').length,
            approved: requests.filter(r => r.status === 'approved').length,
            rejected: requests.filter(r => r.status === 'rejected').length,
            pendingPayment: requests.filter(r => r.status === 'pending_payment' || r.paymentStatus === 'request_new').length
        };
    }
}

export const registrationService = new RegistrationService();
export default registrationService;
