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
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../../firebase/config';

// =================== إعدادات Tap ===================

const TAP_CONFIG = {
    secretKey: import.meta.env.VITE_TAP_SECRET_KEY || '',
    publicKey: import.meta.env.VITE_TAP_PUBLIC_KEY || '',
    merchantId: import.meta.env.VITE_TAP_MERCHANT_ID || '599424',
    // Use proxy in dev to bypass CORS, direct URL in production
    apiUrl: import.meta.env.DEV ? '/api/tap' : 'https://api.tap.company/v2',
    // Use current origin for dev/prod compatibility
    get redirectUrl() {
        const base = typeof window !== 'undefined' ? window.location.origin : 'https://arba-sys.com';
        return base + '/?payment_callback=true';
    },
    currency: 'SAR',
    isEnabled: true
};

// =================== الأسعار ===================

export const PLAN_PRICES: Record<string, number> = {
    free: 0,
    starter: 149,
    professional: 399,
    business: 999,
    enterprise: 1999
} as const;

// Annual prices (20% discount)
export const PLAN_ANNUAL_PRICES: Record<string, number> = {
    free: 0,
    starter: 1430,      // 149 × 12 × 0.8
    professional: 3830,  // 399 × 12 × 0.8
    business: 9590,      // 999 × 12 × 0.8
    enterprise: 19190    // 1999 × 12 × 0.8
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
    plan: string;  // V2: any plan ID
    billingCycle?: 'monthly' | 'annual';
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
 * يحاول Cloud Functions أولاً (إنتاج)، إذا فشلت يستخدم API مباشر (تجريبي)
 */
export async function initiateElectronicPayment(request: PaymentRequest): Promise<PaymentResult> {
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

    const redirectUrl = `${TAP_CONFIG.redirectUrl}&arba_pid=${paymentId}`;

    // === Try 1: Cloud Functions (production - secure) ===
    try {
        const functions = getFunctions(app, 'us-central1');
        const createCharge = httpsCallable(functions, 'createTapCharge');
        
        const result = await createCharge({
            amount: request.amount,
            currency: TAP_CONFIG.currency,
            userName: request.userName,
            userEmail: request.userEmail,
            paymentId,
            redirectUrl
        });

        const data = result.data as any;

        if (data.success && data.paymentUrl) {
            return { success: true, paymentId, paymentUrl: data.paymentUrl };
        }

        // Cloud Function returned error — don't fallback, show error
        if (data.error) {
            await updatePaymentStatus(paymentId, 'failed', undefined);
            return { success: false, paymentId, error: data.error };
        }
    } catch (cfError: any) {
        // Cloud Functions not deployed — fallback to direct API
        console.warn('Cloud Functions unavailable, using direct Tap API:', cfError.code);
    }

    // === Fallback: Direct Tap API (for testing / dev) ===
    if (!TAP_CONFIG.secretKey) {
        await updatePaymentStatus(paymentId, 'failed', undefined);
        return { success: false, paymentId, error: 'مفتاح Tap غير مُعد. راجع ملف .env' };
    }

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
                description: 'Arba Pricing - Professional Plan Subscription',
                metadata: {
                    arba_payment_id: paymentId,
                    arba_user_id: request.userId,
                    arba_plan: request.plan
                },
                receipt: { email: true, sms: false },
                customer: {
                    first_name: request.userName?.split(' ')[0] || 'Arba',
                    last_name: request.userName?.split(' ').slice(1).join(' ') || 'User',
                    email: request.userEmail || 'user@arba-sys.com'
                },
                merchant: { id: TAP_CONFIG.merchantId },
                source: { id: 'src_all' },
                redirect: { url: redirectUrl },
                post: { url: redirectUrl }
            })
        });

        const data = await response.json();

        if (data.transaction && data.transaction.url) {
            return { success: true, paymentId, paymentUrl: data.transaction.url };
        }

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
 * يحاول Cloud Functions أولاً، ثم API مباشر كـ fallback
 */
export async function verifyTapPayment(
    tapChargeId: string,
    arbaPaymentId: string,
    expectedAmount: number
): Promise<PaymentVerification> {
    // === Try 1: Cloud Functions ===
    try {
        const functions = getFunctions(app, 'us-central1');
        const verifyCharge = httpsCallable(functions, 'verifyTapCharge');
        
        const result = await verifyCharge({ tapChargeId, expectedAmount });
        const data = result.data as any;

        if (data.success) {
            if (!data.amountMatches) {
                await updatePaymentStatus(arbaPaymentId, 'failed', tapChargeId);
                return { success: false, status: 'amount_mismatch', amountPaid: data.amount, error: `المبلغ المدفوع (${data.amount}) لا يتطابق مع المطلوب (${expectedAmount})` };
            }
            await updatePaymentStatus(arbaPaymentId, 'completed', tapChargeId);
            return { success: true, transactionId: tapChargeId, status: 'completed', amountPaid: data.amount };
        }

        await updatePaymentStatus(arbaPaymentId, 'failed', tapChargeId);
        return { success: false, status: 'failed', error: `حالة العملية: ${data.status}` };
    } catch (cfError: any) {
        console.warn('Cloud Functions unavailable for verify, using direct API:', cfError.code);
    }

    // === Fallback: Direct Tap API ===
    try {
        const response = await fetch(`${TAP_CONFIG.apiUrl}/charges/${tapChargeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TAP_CONFIG.secretKey}`,
                'Accept': 'application/json'
            }
        });

        const charge = await response.json();

        if (charge.status === 'CAPTURED') {
            if (charge.amount !== expectedAmount) {
                await updatePaymentStatus(arbaPaymentId, 'failed', tapChargeId);
                return { success: false, status: 'amount_mismatch', amountPaid: charge.amount, error: `المبلغ المدفوع (${charge.amount}) لا يتطابق مع المطلوب (${expectedAmount})` };
            }
            await updatePaymentStatus(arbaPaymentId, 'completed', tapChargeId);
            return { success: true, transactionId: tapChargeId, status: 'completed', amountPaid: charge.amount };
        }

        await updatePaymentStatus(arbaPaymentId, 'failed', tapChargeId);
        return { success: false, status: 'failed', error: `حالة العملية: ${charge.status}` };
    } catch (error: any) {
        console.error('Tap verification failed:', error);
        return { success: false, status: 'failed', error: 'تعذر التحقق من العملية' };
    }
}

// =================== التحويل البنكي ===================

/**
 * رفع إيصال تحويل بنكي — يحتاج مراجعة المحاسب
 */
export async function submitBankTransfer(request: PaymentRequest): Promise<PaymentResult> {
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
export async function approvePayment(paymentId: string, userId: string, plan: string): Promise<boolean> {
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
    return await updatePaymentStatus(paymentId, 'rejected', undefined);
}

// =================== تفعيل الاشتراك ===================

/**
 * تفعيل الاشتراك بعد الدفع الناجح (يُستدعى تلقائياً للدفع الإلكتروني)
 */
export async function activateSubscription(
    userId: string,
    plan: string,
    paymentId: string,
    billingCycle: 'monthly' | 'annual' = 'monthly'
): Promise<boolean> {
    const expiresAt = new Date();
    if (billingCycle === 'annual') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const price = billingCycle === 'annual'
        ? (PLAN_ANNUAL_PRICES[plan] || 0)
        : (PLAN_PRICES[plan] || 0);

    const subscriptionId = await createSubscription({
        userId,
        plan,
        amount: price,
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
