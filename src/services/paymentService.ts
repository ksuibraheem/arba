/**
 * Payment Service
 * خدمة الدفع - جاهزة للربط مع بوابة الدفع لاحقاً
 * 
 * سيتم تفعيل هذه الخدمة عند الربط مع شركة الدفع المحلية
 */

import { createPaymentRecord, updatePaymentStatus, createSubscription } from './firestoreService';
import { Timestamp } from 'firebase/firestore';

// =================== أنواع البيانات ===================

export type PaymentGateway = 'moyasar' | 'tap' | 'hyperpay' | 'pending';

export interface PaymentRequest {
    userId: string;
    amount: number;
    currency: string;
    plan: 'professional';
    description?: string;
}

export interface PaymentResult {
    success: boolean;
    paymentId?: string;
    paymentUrl?: string;
    error?: string;
}

export interface PaymentVerification {
    success: boolean;
    transactionId?: string;
    status: 'completed' | 'failed' | 'pending';
    error?: string;
}

// =================== إعدادات بوابة الدفع ===================

// سيتم تفعيلها لاحقاً
const PAYMENT_CONFIG = {
    gateway: 'pending' as PaymentGateway,
    apiKey: import.meta.env.VITE_PAYMENT_API_KEY || '',
    secretKey: import.meta.env.VITE_PAYMENT_SECRET_KEY || '',
    callbackUrl: import.meta.env.VITE_APP_URL + '/payment/callback',
    isEnabled: false // سيتم تفعيله عند الربط
};

// =================== أسعار الباقات ===================

export const PLAN_PRICES = {
    free: 0,
    professional: 299 // ريال سعودي
} as const;

// =================== وظائف الدفع ===================

/**
 * بدء عملية الدفع
 * ملاحظة: حالياً تُنشئ سجل دفع فقط - سيتم الربط مع البوابة لاحقاً
 */
export async function initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    console.log('📤 بدء عملية الدفع:', request);

    // إنشاء سجل دفع مؤقت
    const paymentId = await createPaymentRecord({
        userId: request.userId,
        gateway: 'pending',
        amount: request.amount,
        currency: request.currency || 'SAR',
        status: 'pending'
    });

    if (!paymentId) {
        return {
            success: false,
            error: 'فشل في إنشاء سجل الدفع'
        };
    }

    // في الوقت الحالي - إرجاع نجاح وهمي
    // TODO: استبدال بالربط الفعلي مع بوابة الدفع
    if (!PAYMENT_CONFIG.isEnabled) {
        console.log('⚠️ بوابة الدفع غير مفعلة - سجل الدفع تم إنشاؤه بانتظار الربط');

        return {
            success: true,
            paymentId,
            paymentUrl: undefined // سيتم إضافة رابط الدفع لاحقاً
        };
    }

    // الكود التالي سيُفعّل عند ربط بوابة الدفع:
    /*
    try {
      const response = await fetch('https://api.moyasar.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(PAYMENT_CONFIG.apiKey + ':')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: request.amount * 100, // بالهللات
          currency: 'SAR',
          description: request.description || 'اشتراك ARBA',
          callback_url: PAYMENT_CONFIG.callbackUrl,
          source: { type: 'creditcard' }
        })
      });
  
      const data = await response.json();
  
      if (data.id) {
        return {
          success: true,
          paymentId,
          paymentUrl: data.source.transaction_url
        };
      }
    } catch (error) {
      console.error('خطأ في بوابة الدفع:', error);
    }
    */

    return {
        success: true,
        paymentId
    };
}

/**
 * التحقق من حالة الدفع
 * سيتم استخدامها في Callback من بوابة الدفع
 */
export async function verifyPayment(
    paymentId: string,
    gatewayTransactionId: string
): Promise<PaymentVerification> {
    console.log('🔍 التحقق من الدفع:', { paymentId, gatewayTransactionId });

    // TODO: استعلام بوابة الدفع عن حالة العملية

    // حالياً - تحديث السجل يدوياً (للاختبار)
    const updated = await updatePaymentStatus(paymentId, 'completed', gatewayTransactionId);

    if (updated) {
        return {
            success: true,
            transactionId: gatewayTransactionId,
            status: 'completed'
        };
    }

    return {
        success: false,
        status: 'failed',
        error: 'فشل في تحديث حالة الدفع'
    };
}

/**
 * تفعيل الاشتراك بعد الدفع الناجح
 */
export async function activateSubscription(
    userId: string,
    plan: 'professional',
    paymentId: string
): Promise<boolean> {
    console.log('🎉 تفعيل الاشتراك:', { userId, plan, paymentId });

    // حساب تاريخ انتهاء الاشتراك (سنة واحدة)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const subscriptionId = await createSubscription({
        userId,
        plan,
        amount: PLAN_PRICES[plan],
        currency: 'SAR',
        status: 'active',
        paymentId,
        expiresAt: Timestamp.fromDate(expiresAt)
    });

    return subscriptionId !== null;
}

/**
 * التحقق من تفعيل بوابة الدفع
 */
export function isPaymentEnabled(): boolean {
    return PAYMENT_CONFIG.isEnabled;
}

/**
 * الحصول على بوابة الدفع الحالية
 */
export function getCurrentGateway(): PaymentGateway {
    return PAYMENT_CONFIG.gateway;
}
