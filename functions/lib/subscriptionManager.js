"use strict";
/**
 * Subscription Manager — Cloud Functions Helper
 * إدارة الاشتراكات التلقائية (تجديد / إنهاء / تخفيض)
 *
 * V10.0: يعمل مع نظام الباقات الموحد (free/starter/professional/business/enterprise)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRFQCommission = calculateRFQCommission;
exports.getExpiringSubscriptions = getExpiringSubscriptions;
exports.getExpiredSubscriptions = getExpiredSubscriptions;
exports.downgradeToFree = downgradeToFree;
exports.extendSubscription = extendSubscription;
exports.sendExpiryWarning = sendExpiryWarning;
exports.recordRFQPayment = recordRFQPayment;
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// =================== حساب عمولة RFQ ===================
/**
 * حساب عمولة RFQ بدقة
 * 2.5% بوابة + 10 ر.س ثابتة + 3.5% ربح آربا
 */
function calculateRFQCommission(orderTotal) {
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
async function getExpiringSubscriptions(withinHours = 72) {
    const cutoff = new Date(Date.now() + withinHours * 60 * 60 * 1000);
    const now = new Date();
    const snapshot = await db.collection('subscriptions')
        .where('status', '==', 'active')
        .where('expiresAt', '<=', admin.firestore.Timestamp.fromDate(cutoff))
        .where('expiresAt', '>', admin.firestore.Timestamp.fromDate(now))
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
}
/**
 * جلب الاشتراكات المنتهية فعلاً (expiresAt < now)
 */
async function getExpiredSubscriptions() {
    const now = new Date();
    const snapshot = await db.collection('subscriptions')
        .where('status', '==', 'active')
        .where('expiresAt', '<', admin.firestore.Timestamp.fromDate(now))
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
}
// =================== إدارة الاشتراكات ===================
/**
 * تخفيض المستخدم لباقة مجانية عند انتهاء الاشتراك
 * - يحدث الاشتراك لـ expired
 * - يحدث بيانات المستخدم لـ plan: 'free'
 * - يسجل في upgradeHistory
 */
async function downgradeToFree(userId, subscriptionId) {
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
    }
    catch (error) {
        console.error(`❌ Failed to downgrade user ${userId}:`, error);
        return false;
    }
}
/**
 * تمديد الاشتراك بعد التجديد الناجح
 */
async function extendSubscription(userId, subscriptionId, billingCycle = 'monthly') {
    try {
        const newExpiry = new Date();
        if (billingCycle === 'annual') {
            newExpiry.setFullYear(newExpiry.getFullYear() + 1);
        }
        else {
            newExpiry.setMonth(newExpiry.getMonth() + 1);
        }
        await db.collection('subscriptions').doc(subscriptionId).update({
            expiresAt: admin.firestore.Timestamp.fromDate(newExpiry),
            status: 'active',
            renewedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ Extended subscription ${subscriptionId} for user ${userId} until ${newExpiry.toISOString()}`);
        return true;
    }
    catch (error) {
        console.error(`❌ Failed to extend subscription ${subscriptionId}:`, error);
        return false;
    }
}
/**
 * إرسال تنبيه قبل انتهاء الاشتراك
 */
async function sendExpiryWarning(userId, plan, daysLeft) {
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
async function recordRFQPayment(rfqId, supplierId, clientId, commission, tapChargeId) {
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
    }
    catch (error) {
        console.error(`❌ Failed to record RFQ payment for ${rfqId}:`, error);
        return false;
    }
}
//# sourceMappingURL=subscriptionManager.js.map