/**
 * Subscription Manager — Cloud Functions Helper
 * إدارة الاشتراكات التلقائية (تجديد / إنهاء / تخفيض)
 * 
 * V10.0: يعمل مع نظام الباقات الموحد (free/starter/professional/business/enterprise)
 */

import * as admin from 'firebase-admin';

const db = admin.firestore();

// =================== أنواع البيانات ===================

export interface SubscriptionDoc {
    userId: string;
    plan: string;
    status: 'active' | 'expired' | 'cancelled' | 'past_due';
    amount: number;
    currency: string;
    paymentId: string;
    expiresAt: admin.firestore.Timestamp;
    autoRenew?: boolean;
    savedCardToken?: string;
    billingCycle?: 'monthly' | 'annual';
    createdAt?: admin.firestore.Timestamp;
}

export interface RFQCommission {
    orderTotal: number;
    gatewayFee: number;      // 2.5%
    fixedFee: number;        // 10 SAR
    arbaProfit: number;      // 3.5%
    totalCommission: number; // المجموع
}

// =================== حساب عمولة RFQ ===================

/**
 * حساب عمولة RFQ بدقة
 * 2.5% بوابة + 10 ر.س ثابتة + 3.5% ربح آربا
 */
export function calculateRFQCommission(orderTotal: number): RFQCommission {
    const gatewayFee = Math.round(orderTotal * 0.025 * 100) / 100;
    const fixedFee = 10;
    const arbaProfit = Math.round(orderTotal * 0.035 * 100) / 100;
    const totalCommission = Math.round((gatewayFee + fixedFee + arbaProfit) * 100) / 100;
    
    return { orderTotal, gatewayFee, fixedFee, arbaProfit, totalCommission };
}

// =================== جلب الاشتراكات ===================

/**
 * جلب الاشتراكات التي ستنتهي خلال X ساعة
 */
export async function getExpiringSubscriptions(withinHours: number = 72): Promise<{id: string; data: SubscriptionDoc}[]> {
    const cutoff = new Date(Date.now() + withinHours * 60 * 60 * 1000);
    const now = new Date();
    
    const snapshot = await db.collection('subscriptions')
        .where('status', '==', 'active')
        .where('expiresAt', '<=', admin.firestore.Timestamp.fromDate(cutoff))
        .where('expiresAt', '>', admin.firestore.Timestamp.fromDate(now))
        .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() as SubscriptionDoc }));
}

/**
 * جلب الاشتراكات المنتهية فعلاً (expiresAt < now)
 */
export async function getExpiredSubscriptions(): Promise<{id: string; data: SubscriptionDoc}[]> {
    const now = new Date();
    
    const snapshot = await db.collection('subscriptions')
        .where('status', '==', 'active')
        .where('expiresAt', '<', admin.firestore.Timestamp.fromDate(now))
        .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() as SubscriptionDoc }));
}

// =================== إدارة الاشتراكات ===================

/**
 * تخفيض المستخدم لباقة مجانية عند انتهاء الاشتراك
 * - يحدث الاشتراك لـ expired
 * - يحدث بيانات المستخدم لـ plan: 'free'
 * - يسجل في upgradeHistory
 */
export async function downgradeToFree(userId: string, subscriptionId: string): Promise<boolean> {
    const batch = db.batch();
    
    try {
        // 1. تحديث الاشتراك
        const subRef = db.collection('subscriptions').doc(subscriptionId);
        batch.update(subRef, {
            status: 'expired',
            expiredAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // 2. تحديث بيانات المستخدم
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const previousPlan = userDoc.data()?.plan || 'starter';
        
        batch.update(userRef, {
            plan: 'free',
            'subscription.plan': 'free',
            'subscription.status': 'expired',
        });
        
        // 3. تسجيل في upgradeHistory
        const historyRef = db.collection('upgradeHistory').doc();
        batch.set(historyRef, {
            userId,
            previousPlan,
            newPlan: 'free',
            reason: 'subscription_expired',
            subscriptionId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // 4. إرسال إشعار
        const notifRef = db.collection('notifications').doc();
        batch.set(notifRef, {
            userId,
            type: 'subscription_expired',
            title: 'انتهى اشتراكك',
            message: `انتهت صلاحية باقة ${previousPlan}. تم تحويلك للباقة المجانية. يمكنك الترقية في أي وقت.`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        await batch.commit();
        console.log(`✅ Downgraded user ${userId} from ${previousPlan} to free (sub: ${subscriptionId})`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to downgrade user ${userId}:`, error);
        return false;
    }
}

/**
 * تمديد الاشتراك بعد التجديد الناجح
 */
export async function extendSubscription(
    userId: string, 
    subscriptionId: string, 
    billingCycle: 'monthly' | 'annual' = 'monthly'
): Promise<boolean> {
    try {
        const newExpiry = new Date();
        if (billingCycle === 'annual') {
            newExpiry.setFullYear(newExpiry.getFullYear() + 1);
        } else {
            newExpiry.setMonth(newExpiry.getMonth() + 1);
        }
        
        await db.collection('subscriptions').doc(subscriptionId).update({
            expiresAt: admin.firestore.Timestamp.fromDate(newExpiry),
            status: 'active',
            renewedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`✅ Extended subscription ${subscriptionId} for user ${userId} until ${newExpiry.toISOString()}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to extend subscription ${subscriptionId}:`, error);
        return false;
    }
}

/**
 * إرسال تنبيه قبل انتهاء الاشتراك
 */
export async function sendExpiryWarning(userId: string, plan: string, daysLeft: number): Promise<void> {
    await db.collection('notifications').add({
        userId,
        type: 'subscription_expiring',
        title: 'اشتراكك على وشك الانتهاء',
        message: `ستنتهي باقة ${plan} خلال ${daysLeft} أيام. جدد الآن لتجنب فقدان المزايا.`,
        read: false,
        actionUrl: '/pricing',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}

// =================== RFQ Payment Processing ===================

/**
 * معالجة دفع عمولة RFQ
 * يُسجل العملية في accounting_ledger بـ 3 سطور
 */
export async function recordRFQPayment(
    rfqId: string,
    supplierId: string,
    clientId: string,
    commission: RFQCommission,
    tapChargeId: string,
): Promise<boolean> {
    const batch = db.batch();
    
    try {
        // 1. فتح بيانات العميل في الطلب
        const rfqRef = db.collection('supplierRFQs').doc(rfqId);
        batch.update(rfqRef, {
            clientDataLocked: false,
            commissionPaid: true,
            commissionAmount: commission.totalCommission,
            commissionPaidAt: admin.firestore.FieldValue.serverTimestamp(),
            tapChargeId,
            status: 'paid',
        });
        
        // 2. تسجيل في المحاسبة — رسوم البوابة
        const ledger1 = db.collection('ledger_entries').doc();
        batch.set(ledger1, {
            type: 'rfq_gateway_fee',
            amount: commission.gatewayFee,
            currency: 'SAR',
            description: `رسوم بوابة دفع - طلب ${rfqId}`,
            rfqId,
            supplierId,
            clientId,
            direction: 'expense',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // 3. تسجيل — رسوم ثابتة
        const ledger2 = db.collection('ledger_entries').doc();
        batch.set(ledger2, {
            type: 'rfq_fixed_fee',
            amount: commission.fixedFee,
            currency: 'SAR',
            description: `رسوم ثابتة - طلب ${rfqId}`,
            rfqId,
            supplierId,
            clientId,
            direction: 'revenue',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // 4. تسجيل — ربح آربا
        const ledger3 = db.collection('ledger_entries').doc();
        batch.set(ledger3, {
            type: 'rfq_arba_profit',
            amount: commission.arbaProfit,
            currency: 'SAR',
            description: `ربح آربا - طلب ${rfqId}`,
            rfqId,
            supplierId,
            clientId,
            direction: 'revenue',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        await batch.commit();
        console.log(`✅ RFQ ${rfqId} commission recorded: ${commission.totalCommission} SAR`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to record RFQ payment for ${rfqId}:`, error);
        return false;
    }
}
