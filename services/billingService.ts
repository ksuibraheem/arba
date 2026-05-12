/**
 * Billing Service — V2
 * خدمة الفوترة والاشتراكات
 * 
 * المسؤوليات:
 * - حساب الفاتورة الشهرية (اشتراك + إضافات)
 * - إدارة الترقية والتخفيض
 * - حالة الاشتراك
 * - حساب المبالغ النسبية (prorated)
 */

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    SUBSCRIPTION_PLANS,
    PLAN_TIER_ORDER,
    getPlanAnnualPrice,
    type SubscriptionPlan
} from '../companyData';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface InvoiceLineItem {
    description: string;
    descriptionAr: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    userId: string;
    planId: string;
    planName: string;
    billingCycle: 'monthly' | 'annual';
    period: { start: string; end: string };
    lineItems: InvoiceLineItem[];
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    currency: string;
    generatedAt: string;
}

export interface SubscriptionStatus {
    planId: string;
    planName: string;
    billingCycle: 'monthly' | 'annual';
    price: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
    daysRemaining: number;
    autoRenew: boolean;
}

export interface UpgradeQuote {
    currentPlan: string;
    targetPlan: string;
    proratedCredit: number;    // ائتمان من الخطة الحالية
    targetPrice: number;       // سعر الخطة الجديدة
    amountDue: number;         // المبلغ المستحق
    effectiveDate: string;
}

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const VAT_RATE = 0.15; // ضريبة القيمة المضافة 15%
const CURRENCY = 'SAR';

// ═══════════════════════════════════════════════════════════════
// Core Service
// ═══════════════════════════════════════════════════════════════

class BillingService {

    /**
     * Get current subscription status
     */
    async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return null;

            const data = userSnap.data();
            const planId = data.plan || 'free';
            const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
            if (!plan) return null;

            const billingCycle: 'monthly' | 'annual' = data.billingCycle || 'monthly';
            const startDate = data.subscriptionStart || new Date().toISOString();

            // Calculate end date
            const start = new Date(startDate);
            const end = new Date(start);
            if (billingCycle === 'annual') {
                end.setFullYear(end.getFullYear() + 1);
            } else {
                end.setMonth(end.getMonth() + 1);
            }

            const now = new Date();
            const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

            const price = billingCycle === 'annual'
                ? getPlanAnnualPrice(planId).annual
                : plan.price;

            return {
                planId,
                planName: plan.name['ar'] || plan.id,
                billingCycle,
                price,
                isActive: planId !== 'free' && daysRemaining > 0,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                daysRemaining,
                autoRenew: true
            };
        } catch (error) {
            console.error('❌ getSubscriptionStatus error:', error);
            return null;
        }
    }

    /**
     * Calculate upgrade quote (prorated amount)
     */
    calculateUpgradeQuote(
        currentPlanId: string,
        targetPlanId: string,
        daysRemainingInCycle: number,
        totalDaysInCycle: number = 30,
        billingCycle: 'monthly' | 'annual' = 'monthly'
    ): UpgradeQuote | null {
        const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === currentPlanId);
        const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === targetPlanId);
        if (!currentPlan || !targetPlan) return null;

        // Can't downgrade through this method
        const currentTier = PLAN_TIER_ORDER[currentPlanId] ?? 0;
        const targetTier = PLAN_TIER_ORDER[targetPlanId] ?? 0;
        if (targetTier <= currentTier) return null;

        // Calculate prorated credit from remaining days on current plan
        const currentPrice = billingCycle === 'annual'
            ? getPlanAnnualPrice(currentPlanId).annual / 12
            : currentPlan.price;
        const proratedCredit = Math.round((currentPrice / totalDaysInCycle) * daysRemainingInCycle * 100) / 100;

        // Target price (first month)
        const targetPrice = billingCycle === 'annual'
            ? getPlanAnnualPrice(targetPlanId).annual / 12
            : targetPlan.price;

        const amountDue = Math.max(0, Math.round((targetPrice - proratedCredit) * 100) / 100);

        return {
            currentPlan: currentPlanId,
            targetPlan: targetPlanId,
            proratedCredit,
            targetPrice,
            amountDue,
            effectiveDate: new Date().toISOString()
        };
    }

    /**
     * Generate monthly invoice including overage charges
     */
    async generateInvoice(userId: string): Promise<Invoice | null> {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return null;

            const data = userSnap.data();
            const planId = data.plan || 'free';
            const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
            if (!plan) return null;

            const billingCycle: 'monthly' | 'annual' = data.billingCycle || 'monthly';
            const lineItems: InvoiceLineItem[] = [];

            // 1. Base subscription
            const basePrice = billingCycle === 'annual'
                ? Math.round(getPlanAnnualPrice(planId).annual / 12)
                : plan.price;

            if (basePrice > 0) {
                lineItems.push({
                    description: `${plan.name['en']} Plan (${billingCycle})`,
                    descriptionAr: `اشتراك ${plan.name['ar']} (${billingCycle === 'annual' ? 'سنوي' : 'شهري'})`,
                    quantity: 1,
                    unitPrice: basePrice,
                    total: basePrice
                });
            }

            // 2. Overage charges
            const used = {
                projects: data.usedProjects || 0,
                ai: data.usedAIItems || 0,
                boq: data.usedBOQUploads || 0,
                api: data.usedAPICalls || 0,
                tender: data.usedTenderReports || 0,
            };

            // Extra projects
            if (plan.projectsIncluded !== -1 && used.projects > plan.projectsIncluded && plan.extraProjectPrice > 0) {
                const extra = used.projects - plan.projectsIncluded;
                lineItems.push({
                    description: `Extra projects (×${extra})`,
                    descriptionAr: `مشاريع إضافية (×${extra})`,
                    quantity: extra,
                    unitPrice: plan.extraProjectPrice,
                    total: extra * plan.extraProjectPrice
                });
            }

            // Extra AI items
            if (plan.aiBudgetItems !== -1 && plan.aiBudgetItems > 0 && used.ai > plan.aiBudgetItems && plan.extraAIPrice > 0) {
                const extra = used.ai - plan.aiBudgetItems;
                lineItems.push({
                    description: `Extra AI items (×${extra})`,
                    descriptionAr: `بنود AI إضافية (×${extra})`,
                    quantity: extra,
                    unitPrice: plan.extraAIPrice,
                    total: Math.round(extra * plan.extraAIPrice * 100) / 100
                });
            }

            // Extra BOQ uploads
            if (plan.boqUploads !== -1 && plan.boqUploads > 0 && used.boq > plan.boqUploads && plan.extraBOQPrice > 0) {
                const extra = used.boq - plan.boqUploads;
                lineItems.push({
                    description: `Extra BOQ uploads (×${extra})`,
                    descriptionAr: `رفع BOQ إضافي (×${extra})`,
                    quantity: extra,
                    unitPrice: plan.extraBOQPrice,
                    total: extra * plan.extraBOQPrice
                });
            }

            // Extra API calls
            if (plan.apiAccess && plan.apiCallsIncluded !== -1 && used.api > plan.apiCallsIncluded && plan.extraAPICallPrice > 0) {
                const extra = used.api - plan.apiCallsIncluded;
                lineItems.push({
                    description: `Extra API calls (×${extra})`,
                    descriptionAr: `طلبات API إضافية (×${extra})`,
                    quantity: extra,
                    unitPrice: plan.extraAPICallPrice,
                    total: Math.round(extra * plan.extraAPICallPrice * 100) / 100
                });
            }

            // Extra tender reports
            if (plan.tenderReports !== -1 && plan.tenderReports > 0 && used.tender > plan.tenderReports && plan.extraTenderPrice > 0) {
                const extra = used.tender - plan.tenderReports;
                lineItems.push({
                    description: `Extra tender reports (×${extra})`,
                    descriptionAr: `تقارير مناقصات إضافية (×${extra})`,
                    quantity: extra,
                    unitPrice: plan.extraTenderPrice,
                    total: extra * plan.extraTenderPrice
                });
            }

            // Calculate totals
            const subtotal = Math.round(lineItems.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
            const vatAmount = Math.round(subtotal * VAT_RATE * 100) / 100;

            const now = new Date();
            const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            return {
                userId,
                planId,
                planName: plan.name['ar'] || plan.id,
                billingCycle,
                period: {
                    start: periodStart.toISOString(),
                    end: periodEnd.toISOString()
                },
                lineItems,
                subtotal,
                vatRate: VAT_RATE,
                vatAmount,
                total: Math.round((subtotal + vatAmount) * 100) / 100,
                currency: CURRENCY,
                generatedAt: now.toISOString()
            };
        } catch (error) {
            console.error('❌ generateInvoice error:', error);
            return null;
        }
    }

    /**
     * Update user's subscription plan in Firestore
     */
    async updateSubscription(
        userId: string,
        newPlanId: string,
        billingCycle: 'monthly' | 'annual' = 'monthly'
    ): Promise<boolean> {
        try {
            const plan = SUBSCRIPTION_PLANS.find(p => p.id === newPlanId);
            if (!plan) return false;

            const now = new Date();
            const end = new Date(now);
            if (billingCycle === 'annual') {
                end.setFullYear(end.getFullYear() + 1);
            } else {
                end.setMonth(end.getMonth() + 1);
            }

            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                plan: newPlanId,
                billingCycle,
                subscriptionStart: now.toISOString(),
                subscriptionEnd: end.toISOString(),
                // Reset usage on plan change
                usedProjects: 0,
                usedAIItems: 0,
                usedBOQUploads: 0,
                usedAPICalls: 0,
                usedTenderReports: 0,
                lastUsageReset: now.toISOString(),
                updatedAt: serverTimestamp()
            });

            // Also update userRoles document
            const roleRef = doc(db, 'userRoles', userId);
            await updateDoc(roleRef, {
                plan: newPlanId,
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('❌ updateSubscription error:', error);
            return false;
        }
    }

    /**
     * Cancel subscription (downgrade to free)
     */
    async cancelSubscription(userId: string): Promise<boolean> {
        return this.updateSubscription(userId, 'free', 'monthly');
    }

    /**
     * Get price summary for display
     */
    getPriceSummary(planId: string, billingCycle: 'monthly' | 'annual' = 'monthly'): {
        displayPrice: number;
        period: string;
        periodAr: string;
        saved?: number;
        vatAmount: number;
        totalWithVAT: number;
    } | null {
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan) return null;

        if (billingCycle === 'annual') {
            const annual = getPlanAnnualPrice(planId);
            const monthlyEquiv = Math.round(annual.annual / 12);
            const vatAmount = Math.round(monthlyEquiv * VAT_RATE * 100) / 100;
            return {
                displayPrice: monthlyEquiv,
                period: '/mo (billed annually)',
                periodAr: '/شهر (يُدفع سنوياً)',
                saved: annual.saved,
                vatAmount,
                totalWithVAT: Math.round((monthlyEquiv + vatAmount) * 100) / 100
            };
        }

        const vatAmount = Math.round(plan.price * VAT_RATE * 100) / 100;
        return {
            displayPrice: plan.price,
            period: '/month',
            periodAr: '/شهر',
            vatAmount,
            totalWithVAT: Math.round((plan.price + vatAmount) * 100) / 100
        };
    }
}

// Singleton export
export const billingService = new BillingService();
