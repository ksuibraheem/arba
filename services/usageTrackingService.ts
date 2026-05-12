/**
 * Usage Tracking Service — V2
 * خدمة تتبع استخدام الباقة (مستقلة عن منطق التسعير)
 * 
 * Architecture: Decoupled from pricing logic (companyData.ts)
 * This allows changing business rules without touching the core pricing engine.
 * 
 * يقرأ حدود الباقة من companyData.ts
 * يحفظ/يستعيد الاستخدام من Firestore
 * يُصدر تنبيهات Soft Nudge عند الاقتراب من الحد
 */

import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    SUBSCRIPTION_PLANS,
    canAccessFeature,
    getNextUpgradePlan,
    type SubscriptionPlan
} from '../companyData';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface UsageSummary {
    planId: string;
    planName: string;
    projects: { used: number; limit: number; percentage: number };
    storage: { usedMB: number; limitMB: number; percentage: number };
    aiItems: { used: number; limit: number; percentage: number };
    boqUploads: { used: number; limit: number; percentage: number };
    employees: { used: number; limit: number; percentage: number };
    apiCalls: { used: number; limit: number; percentage: number };
    tenderReports: { used: number; limit: number; percentage: number };
    alerts: UsageAlert[];
}

export interface UsageAlert {
    feature: string;
    level: 'info' | 'warning' | 'critical';
    messageEn: string;
    messageAr: string;
    upgradeTarget?: string;
}

export interface TrackResult {
    success: boolean;
    allowed: boolean;
    remaining?: number;
    alert?: UsageAlert;
    error?: string;
}

// ═══════════════════════════════════════════════════════════════
// Helper: calculate percentage safely
// ═══════════════════════════════════════════════════════════════
const calcPercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0;    // Unlimited
    if (limit === 0) return 100;   // Not available
    return Math.min(100, Math.round((used / limit) * 100));
};

// ═══════════════════════════════════════════════════════════════
// Core Service
// ═══════════════════════════════════════════════════════════════

class UsageTrackingService {
    /**
     * Get full usage summary for a user
     */
    async getUsageSummary(userId: string): Promise<UsageSummary | null> {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return null;

            const data = userSnap.data();
            const planId = data.plan || 'free';
            const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
            if (!plan) return null;

            const used = {
                projects: data.usedProjects || 0,
                storage: data.usedStorageMB || 0,
                ai: data.usedAIItems || 0,
                boq: data.usedBOQUploads || 0,
                employees: data.usedEmployees || 0,
                api: data.usedAPICalls || 0,
                tender: data.usedTenderReports || 0,
            };

            // Generate alerts
            const alerts: UsageAlert[] = [];
            const nextPlan = getNextUpgradePlan(planId);

            // Check each feature for 80%+ usage
            const checks = [
                { feature: 'projects', used: used.projects, limit: plan.projectsIncluded, nameEn: 'projects', nameAr: 'مشاريع' },
                { feature: 'ai', used: used.ai, limit: plan.aiBudgetItems, nameEn: 'AI items', nameAr: 'بنود AI' },
                { feature: 'boq', used: used.boq, limit: plan.boqUploads, nameEn: 'BOQ uploads', nameAr: 'رفع BOQ' },
                { feature: 'api', used: used.api, limit: plan.apiCallsIncluded, nameEn: 'API calls', nameAr: 'طلبات API' },
                { feature: 'tender', used: used.tender, limit: plan.tenderReports, nameEn: 'tender reports', nameAr: 'تقارير مناقصات' },
            ];

            for (const check of checks) {
                if (check.limit === -1 || check.limit === 0) continue;
                const pct = calcPercentage(check.used, check.limit);
                const remaining = check.limit - check.used;

                if (remaining <= 0) {
                    alerts.push({
                        feature: check.feature,
                        level: 'critical',
                        messageEn: `You've used all ${check.limit} ${check.nameEn}. Upgrade or purchase extras.`,
                        messageAr: `استنفدت كامل ${check.limit} ${check.nameAr}. ترقّ أو اشترِ إضافات.`,
                        upgradeTarget: nextPlan?.id
                    });
                } else if (pct >= 80) {
                    alerts.push({
                        feature: check.feature,
                        level: 'warning',
                        messageEn: `${remaining} ${check.nameEn} remaining (${pct}% used)`,
                        messageAr: `متبقي ${remaining} ${check.nameAr} (${pct}% مستخدم)`,
                        upgradeTarget: nextPlan?.id
                    });
                }
            }

            // Storage alert
            const storagePct = calcPercentage(used.storage, plan.storageMB);
            if (storagePct >= 90) {
                alerts.push({
                    feature: 'storage',
                    level: storagePct >= 100 ? 'critical' : 'warning',
                    messageEn: `Storage ${storagePct}% full`,
                    messageAr: `التخزين ممتلئ ${storagePct}%`,
                    upgradeTarget: nextPlan?.id
                });
            }

            return {
                planId,
                planName: plan.name['ar'] || plan.id,
                projects: { used: used.projects, limit: plan.projectsIncluded, percentage: calcPercentage(used.projects, plan.projectsIncluded) },
                storage: { usedMB: used.storage, limitMB: plan.storageMB, percentage: storagePct },
                aiItems: { used: used.ai, limit: plan.aiBudgetItems, percentage: calcPercentage(used.ai, plan.aiBudgetItems) },
                boqUploads: { used: used.boq, limit: plan.boqUploads, percentage: calcPercentage(used.boq, plan.boqUploads) },
                employees: { used: used.employees, limit: plan.employeesIncluded, percentage: calcPercentage(used.employees, plan.employeesIncluded) },
                apiCalls: { used: used.api, limit: plan.apiCallsIncluded, percentage: calcPercentage(used.api, plan.apiCallsIncluded) },
                tenderReports: { used: used.tender, limit: plan.tenderReports, percentage: calcPercentage(used.tender, plan.tenderReports) },
                alerts
            };
        } catch (error) {
            console.error('❌ getUsageSummary error:', error);
            return null;
        }
    }

    /**
     * Track project creation
     */
    async trackProjectCreation(userId: string, planId: string): Promise<TrackResult> {
        return this._trackUsage(userId, planId, 'projects', 'usedProjects');
    }

    /**
     * Track AI item classification
     */
    async trackAIClassification(userId: string, planId: string, itemCount: number = 1): Promise<TrackResult> {
        return this._trackUsage(userId, planId, 'ai', 'usedAIItems', itemCount);
    }

    /**
     * Track BOQ upload
     */
    async trackBOQUpload(userId: string, planId: string): Promise<TrackResult> {
        return this._trackUsage(userId, planId, 'boq', 'usedBOQUploads');
    }

    /**
     * Track API call
     */
    async trackAPICall(userId: string, planId: string): Promise<TrackResult> {
        return this._trackUsage(userId, planId, 'api', 'usedAPICalls');
    }

    /**
     * Track tender report generation
     */
    async trackTenderReport(userId: string, planId: string): Promise<TrackResult> {
        return this._trackUsage(userId, planId, 'tender_reports', 'usedTenderReports');
    }

    /**
     * Check if a feature is accessible (without tracking)
     */
    checkAccess(planId: string, feature: string, currentUsed?: number): TrackResult {
        const access = canAccessFeature(planId, feature, currentUsed);
        let alert: UsageAlert | undefined;

        if (!access.allowed) {
            alert = {
                feature,
                level: 'critical',
                messageEn: access.nudge || `Feature not available in your plan`,
                messageAr: access.nudgeAr || `الميزة غير متاحة في باقتك`,
                upgradeTarget: access.upgradeTarget
            };
        } else if (access.nudge) {
            alert = {
                feature,
                level: 'warning',
                messageEn: access.nudge,
                messageAr: access.nudgeAr || access.nudge,
                upgradeTarget: access.upgradeTarget
            };
        }

        return {
            success: true,
            allowed: access.allowed,
            remaining: access.remaining,
            alert
        };
    }

    /**
     * Reset monthly usage counters (call at start of billing cycle)
     */
    async resetMonthlyUsage(userId: string): Promise<boolean> {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                usedProjects: 0,
                usedAIItems: 0,
                usedBOQUploads: 0,
                usedAPICalls: 0,
                usedTenderReports: 0,
                lastUsageReset: new Date().toISOString(),
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('❌ resetMonthlyUsage error:', error);
            return false;
        }
    }

    /**
     * Check if monthly usage needs reset (new billing cycle)
     */
    async checkAndResetIfNeeded(userId: string): Promise<boolean> {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return false;

            const data = userSnap.data();
            const lastReset = data.lastUsageReset ? new Date(data.lastUsageReset) : null;
            const now = new Date();

            if (!lastReset) {
                // First time — set the reset date
                await updateDoc(userRef, { lastUsageReset: now.toISOString() });
                return false;
            }

            // Check if a month has passed since last reset
            const monthDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());
            if (monthDiff >= 1) {
                await this.resetMonthlyUsage(userId);
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ checkAndResetIfNeeded error:', error);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // Private: Generic usage tracker
    // ═══════════════════════════════════════════════════════════

    private async _trackUsage(
        userId: string,
        planId: string,
        featureKey: string,
        firestoreField: string,
        amount: number = 1
    ): Promise<TrackResult> {
        try {
            // 1. Get current usage from Firestore
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                return { success: false, allowed: false, error: 'User not found' };
            }

            const data = userSnap.data();
            const currentUsed = (data[firestoreField] || 0) as number;

            // 2. Check access
            const access = canAccessFeature(planId, featureKey, currentUsed);

            if (!access.allowed) {
                return {
                    success: true,
                    allowed: false,
                    remaining: 0,
                    alert: {
                        feature: featureKey,
                        level: 'critical',
                        messageEn: access.nudge || `Limit reached for ${featureKey}`,
                        messageAr: access.nudgeAr || `وصلت للحد الأقصى في ${featureKey}`,
                        upgradeTarget: access.upgradeTarget
                    }
                };
            }

            // 3. Increment usage in Firestore
            await updateDoc(userRef, {
                [firestoreField]: increment(amount),
                updatedAt: serverTimestamp()
            });

            const newUsed = currentUsed + amount;
            const newAccess = canAccessFeature(planId, featureKey, newUsed);

            let alert: UsageAlert | undefined;
            if (newAccess.nudge) {
                alert = {
                    feature: featureKey,
                    level: newAccess.allowed ? 'warning' : 'critical',
                    messageEn: newAccess.nudge,
                    messageAr: newAccess.nudgeAr || newAccess.nudge,
                    upgradeTarget: newAccess.upgradeTarget
                };
            }

            return {
                success: true,
                allowed: true,
                remaining: newAccess.remaining,
                alert
            };
        } catch (error) {
            console.error(`❌ _trackUsage(${featureKey}) error:`, error);
            // Fail open: allow the action but log the error
            return { success: false, allowed: true, error: 'Tracking failed — action allowed' };
        }
    }
}

// Singleton export
export const usageTrackingService = new UsageTrackingService();
