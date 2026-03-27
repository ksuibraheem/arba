/**
 * Payment Service — Tap Payments Integration
 * خدمة الدفع — تكامل مع بوابة Tap
 * 
 * مسارا الدفع:
 * 1. إلكتروني (Tap) → تلقائي فوري
 * 2. تحويل بنكي → مراجعة المحاسب
 */

import { createPaymentRecord, updatePaymentStatus, createSubscription } from './firestoreService';
import { Timestamp } from 'firebase/firestore';

// =================== إعدادات Tap ===================

const TAP_CONFIG = {
    secretKey: import.meta.env.VITE_TAP_SECRET_KEY || '',
    publicKey: import.meta.env.VITE_TAP_PUBLIC_KEY || '',
    apiUrl: 'https://api.tap.company/v2',
    redirectUrl: (import.meta.env.VITE_APP_URL || 'https://arba-sys.com') + '/login',
    currency: 'SAR',
    isEnabled: true
};

// =================== الأسعار ===================

export const PLAN_PRICES = {
    free: 0,
    professional: 299 // ريال سعودي / سنة
} as const;

// =================== أنواع البيانات ===================

export type PaymentGateway = 'tap' | 'bank_transfer';

export type PaymentStatus = 
    | 'pending'           // بانتظار الدفع
    | 'pending_review'    // تحويل بنكي — بانتظار مراجعة المحاسب
    | 'completed'         // تم الدفع والتفعيل
    | 'failed'            // فشل الدفع
    | 'rejected'          // رفض المحاسب
    | 'amount_mismatch';  // المبلغ غير مطابق

export interface PaymentRequest {
    userId: string;
    userEmail: string;
    userName: string;
    amount: number;
    plan: 'professional';
    gateway: PaymentGateway;
    receiptFile?: string;
    receiptFileName?: string;
}

export interface PaymentResult {
    success: boolean;
    paymentId?: string;
    paymentUrl?: string; // رابط صفحة Tap للدفع الإلكتروني
    error?: string;
}

export interface PaymentVerification {
    success: boolean;
    transactionId?: string;
    status: PaymentStatus;
    amountPaid?: number;
    error?: string;
}

// =================== رسائل المستخدم ===================

export const PAYMENT_MESSAGES = {
    electronic_success: {
        ar: '✅ تم الدفع وتفعيل حسابك بنجاح!',
        en: '✅ Payment successful! Your account has been activated.'
    },
    bank_submitted: {
        ar: '⏳ تم استلام إيصال الدفع. بانتظار مراجعة المحاسب.',
        en: '⏳ Receipt received. Awaiting accountant review.'
    },
    accountant_approved: {
        ar: '✅ تمت الموافقة على الدفع وتفعيل حسابك.',
        en: '✅ Payment approved. Your account is now active.'
    },
    accountant_rejected: {
        ar: '❌ تم رفض إيصال الدفع. يرجى التواصل مع الدعم.',
        en: '❌ Payment receipt rejected. Please contact support.'
    },
    payment_failed: {
        ar: '❌ فشلت عملية الدفع. يرجى المحاولة مرة أخرى.',
        en: '❌ Payment failed. Please try again.'
    },
    amount_mismatch: {
        ar: '⚠️ المبلغ المدفوع لا يتطابق مع المطلوب.',
        en: '⚠️ Paid amount does not match the required amount.'
    }
};

// =================== الدفع الإلكتروني (Tap) ===================

/**
 * إنشاء عملية دفع إلكتروني — يحوّل المستخدم لصفحة Tap
 */
export async function initiateElectronicPayment(request: PaymentRequest): Promise<PaymentResult> {
    console.log('💳 بدء الدفع الإلكتروني:', request.userEmail);

    // إنشاء سجل دفع في Firestore
    const paymentId = await createPaymentRecord({
        userId: request.userId,
        gateway: 'tap',
        amount: request.amount,
        currency: TAP_CONFIG.currency,
        status: 'pending',
        metadata: {
            userEmail: request.userEmail,
            userName: request.userName,
            plan: request.plan
        }
    });

    if (!paymentId) {
        return { success: false, error: 'فشل في إنشاء سجل الدفع' };
    }

    // إنشاء Charge في Tap
    try {
        const response = await fetch(`${TAP_CONFIG.apiUrl}/charges`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TAP_CONFIG.secretKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                amount: request.amount,
                currency: TAP_CONFIG.currency,
                customer_initiated: true,
                threeDSecure: true,
                save_card: false,
                description: `اشتراك Arba - الباقة الاحترافية`,
                metadata: {
                    arba_payment_id: paymentId,
                    arba_user_id: request.userId,
                    arba_plan: request.plan
                },
                receipt: {
                    email: true,
                    sms: false
                },
                customer: {
                    first_name: request.userName,
                    email: request.userEmail
                },
                source: { type: 'src_all' }, // يسمح لـ Tap بعرض كل خيارات الدفع
                redirect: {
                    url: `${TAP_CONFIG.redirectUrl}?tap_id={charge_id}&arba_pid=${paymentId}`
                }
            })
        });

        const data = await response.json();

        if (data.transaction && data.transaction.url) {
            return {
                success: true,
                paymentId,
                paymentUrl: data.transaction.url
            };
        }

        // إذا فيه خطأ
        console.error('Tap API error:', data);
        await updatePaymentStatus(paymentId, 'failed', undefined);
        return {
            success: false,
            paymentId,
            error: data.errors?.[0]?.description || 'خطأ في بوابة الدفع'
        };

    } catch (error: any) {
        console.error('Tap API call failed:', error);
        await updatePaymentStatus(paymentId, 'failed', undefined);
        return {
            success: false,
            paymentId,
            error: 'تعذر الاتصال ببوابة الدفع. يرجى المحاولة لاحقاً.'
        };
    }
}

/**
 * التحقق من الدفع بعد العودة من Tap — مع مطابقة المبلغ
 */
export async function verifyTapPayment(
    tapChargeId: string,
    arbaPaymentId: string,
    expectedAmount: number
): Promise<PaymentVerification> {
    console.log('🔍 التحقق من الدفع:', { tapChargeId, arbaPaymentId });

    try {
        const response = await fetch(`${TAP_CONFIG.apiUrl}/charges/${tapChargeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TAP_CONFIG.secretKey}`,
                'Accept': 'application/json'
            }
        });

        const charge = await response.json();

        // التحقق من حالة العملية
        if (charge.status !== 'CAPTURED') {
            await updatePaymentStatus(arbaPaymentId, 'failed', tapChargeId);
            return {
                success: false,
                status: 'failed',
                error: `حالة العملية: ${charge.status}`
            };
        }

        // مطابقة المبلغ
        if (charge.amount !== expectedAmount) {
            await updatePaymentStatus(arbaPaymentId, 'failed', tapChargeId);
            return {
                success: false,
                status: 'amount_mismatch',
                amountPaid: charge.amount,
                error: `المبلغ المدفوع (${charge.amount}) لا يتطابق مع المطلوب (${expectedAmount})`
            };
        }

        // ✅ الدفع ناجح — تحديث السجل
        await updatePaymentStatus(arbaPaymentId, 'completed', tapChargeId);

        return {
            success: true,
            transactionId: tapChargeId,
            status: 'completed',
            amountPaid: charge.amount
        };

    } catch (error: any) {
        console.error('Tap verification failed:', error);
        return {
            success: false,
            status: 'failed',
            error: 'تعذر التحقق من العملية'
        };
    }
}

// =================== التحويل البنكي ===================

/**
 * رفع إيصال تحويل بنكي — يحتاج مراجعة المحاسب
 */
export async function submitBankTransfer(request: PaymentRequest): Promise<PaymentResult> {
    console.log('🏦 تسجيل تحويل بنكي:', request.userEmail);

    const paymentId = await createPaymentRecord({
        userId: request.userId,
        gateway: 'bank_transfer',
        amount: request.amount,
        currency: TAP_CONFIG.currency,
        status: 'pending_review',
        metadata: {
            userEmail: request.userEmail,
            userName: request.userName,
            plan: request.plan,
            receiptFile: request.receiptFile || '',
            receiptFileName: request.receiptFileName || ''
        }
    });

    if (!paymentId) {
        return { success: false, error: 'فشل في تسجيل طلب الدفع' };
    }

    return { success: true, paymentId };
}

/**
 * المحاسب يوافق على التحويل البنكي → تفعيل الاشتراك تلقائياً
 */
export async function approvePayment(paymentId: string, userId: string, plan: 'professional'): Promise<boolean> {
    console.log('✅ المحاسب وافق على الدفع:', paymentId);

    // تحديث حالة الدفع
    const updated = await updatePaymentStatus(paymentId, 'completed', undefined);
    if (!updated) return false;

    // تفعيل الاشتراك
    return await activateSubscription(userId, plan, paymentId);
}

/**
 * المحاسب يرفض التحويل البنكي
 */
export async function rejectPayment(paymentId: string, reason?: string): Promise<boolean> {
    console.log('❌ المحاسب رفض الدفع:', paymentId, reason);
    return await updatePaymentStatus(paymentId, 'rejected', undefined);
}

// =================== تفعيل الاشتراك ===================

/**
 * تفعيل الاشتراك بعد الدفع الناجح (يُستدعى تلقائياً للدفع الإلكتروني)
 */
export async function activateSubscription(
    userId: string,
    plan: 'professional',
    paymentId: string
): Promise<boolean> {
    console.log('🎉 تفعيل الاشتراك:', { userId, plan, paymentId });

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const subscriptionId = await createSubscription({
        userId,
        plan,
        amount: PLAN_PRICES[plan],
        currency: TAP_CONFIG.currency,
        status: 'active',
        paymentId,
        expiresAt: Timestamp.fromDate(expiresAt)
    });

    return subscriptionId !== null;
}

// =================== أدوات مساعدة ===================

export function isPaymentEnabled(): boolean {
    return TAP_CONFIG.isEnabled;
}

export function getTapPublicKey(): string {
    return TAP_CONFIG.publicKey;
}
