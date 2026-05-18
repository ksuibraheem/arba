/**
 * RFQ Payment Service — خدمة دفع عمولة طلبات التوريد
 * V10.0: ربط Tap Payments مع نظام RFQ
 * 
 * Flow:
 * 1. المورد يستلم طلب RFQ
 * 2. يضغط "دفع العمولة" → يُحسب المبلغ (6% + 10 ر.س)
 * 3. يُحوّل لصفحة Tap للدفع
 * 4. بعد الدفع → تُفتح بيانات العميل
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/config';

// =================== Commission Calculator ===================

export interface RFQCommission {
    orderTotal: number;
    gatewayFee: number;      // 2.5%
    fixedFee: number;        // 10 SAR
    arbaProfit: number;      // 3.5%
    totalCommission: number;
}

/**
 * حساب عمولة RFQ — نسخة العميل (للعرض فقط)
 * النسخة الرسمية على السيرفر في subscriptionManager.ts
 */
export function calculateRFQCommission(orderTotal: number): RFQCommission {
    const gatewayFee = Math.round(orderTotal * 0.025 * 100) / 100;
    const fixedFee = 10;
    const arbaProfit = Math.round(orderTotal * 0.035 * 100) / 100;
    const totalCommission = Math.round((gatewayFee + fixedFee + arbaProfit) * 100) / 100;
    
    return { orderTotal, gatewayFee, fixedFee, arbaProfit, totalCommission };
}

// =================== Commission Details ===================

export const COMMISSION_BREAKDOWN = {
    gatewayRate: 0.025,      // 2.5%
    fixedFee: 10,            // 10 SAR
    arbaProfitRate: 0.035,   // 3.5%
    totalRate: 0.06,         // 6% total
    currency: 'SAR',
};

// =================== Payment Functions ===================

export interface RFQPaymentResult {
    success: boolean;
    paymentUrl?: string;
    chargeId?: string;
    commission?: RFQCommission;
    error?: string;
}

/**
 * بدء عملية دفع عمولة RFQ
 * يستدعي Cloud Function `processRFQCommission`
 * يعيد رابط صفحة الدفع
 */
export async function initiateRFQPayment(
    rfqId: string, 
    orderTotal: number
): Promise<RFQPaymentResult> {
    try {
        const functions = getFunctions(app, 'us-central1');
        const processCommission = httpsCallable(functions, 'processRFQCommission');
        
        const result = await processCommission({ rfqId, orderTotal });
        const data = result.data as any;
        
        if (data.success && data.paymentUrl) {
            return {
                success: true,
                paymentUrl: data.paymentUrl,
                chargeId: data.chargeId,
                commission: data.commission,
            };
        }
        
        return {
            success: false,
            error: data.error || 'فشل إنشاء عملية الدفع',
            commission: data.commission,
        };
    } catch (error: any) {
        console.error('RFQ payment initiation failed:', error);
        
        // Fallback: إذا Cloud Functions غير متاحة، استخدم حساب العمولة المحلي
        const commission = calculateRFQCommission(orderTotal);
        
        return {
            success: false,
            error: error.message || 'تعذر الاتصال بخادم الدفع',
            commission,
        };
    }
}

/**
 * التحقق من دفع العمولة بعد العودة من Tap
 * يستدعي Cloud Function `verifyRFQCommission`
 */
export async function verifyRFQPayment(
    rfqId: string, 
    tapChargeId: string
): Promise<{ success: boolean; message?: string; commission?: RFQCommission }> {
    try {
        const functions = getFunctions(app, 'us-central1');
        const verifyCommission = httpsCallable(functions, 'verifyRFQCommission');
        
        const result = await verifyCommission({ rfqId, tapChargeId });
        const data = result.data as any;
        
        return {
            success: data.success,
            message: data.message,
            commission: data.commission,
        };
    } catch (error: any) {
        console.error('RFQ payment verification failed:', error);
        return {
            success: false,
            message: error.message || 'فشل التحقق من الدفع',
        };
    }
}

// =================== Display Helpers ===================

/**
 * تنسيق مبلغ العمولة للعرض
 */
export function formatCommission(commission: RFQCommission, language: 'ar' | 'en' = 'ar'): string[] {
    const sar = language === 'ar' ? 'ر.س' : 'SAR';
    return [
        `${language === 'ar' ? 'رسوم بوابة الدفع' : 'Payment Gateway'} (2.5%): ${commission.gatewayFee} ${sar}`,
        `${language === 'ar' ? 'رسوم ثابتة' : 'Fixed Fee'}: ${commission.fixedFee} ${sar}`,
        `${language === 'ar' ? 'هامش ربح آربا' : 'Arba Margin'} (3.5%): ${commission.arbaProfit} ${sar}`,
        `──────────────────`,
        `${language === 'ar' ? 'الإجمالي' : 'Total'}: ${commission.totalCommission} ${sar}`,
    ];
}

/**
 * رسائل حالة الدفع
 */
export const RFQ_PAYMENT_MESSAGES = {
    pending: {
        ar: '⏳ بانتظار دفع العمولة',
        en: '⏳ Awaiting commission payment',
    },
    paid: {
        ar: '✅ تم دفع العمولة — بيانات العميل متاحة',
        en: '✅ Commission paid — Client data available',
    },
    failed: {
        ar: '❌ فشل الدفع — حاول مرة أخرى',
        en: '❌ Payment failed — Try again',
    },
    locked: {
        ar: '🔒 بيانات العميل مقفلة حتى يتم الدفع',
        en: '🔒 Client data locked until payment',
    },
};
