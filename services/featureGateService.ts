/**
 * Feature Gate Service — V2
 * طبقة التحكم في الوصول للميزات
 * 
 * Middleware-style gates: call before allowing an action
 * Returns { allowed, reason, upgradeTarget }
 * 
 * Usage:
 *   const gate = featureGateService.canCreateProject(planId, usedProjects);
 *   if (!gate.allowed) { showUpgradeModal(gate); return; }
 */

import {
    canAccessFeature,
    isPlanFeatureAvailable,
    getNextUpgradePlan,
    SUBSCRIPTION_PLANS,
    getLocalizedText,
    type SubscriptionPlan
} from '../companyData';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface GateResult {
    allowed: boolean;
    reason?: { ar: string; en: string };
    upgradeTarget?: string;
    upgradePlanName?: Record<string, string>;
    featureKey: string;
    currentUsed?: number;
    limit?: number;
}

// ═══════════════════════════════════════════════════════════════
// Gate Functions
// ═══════════════════════════════════════════════════════════════

class FeatureGateService {

    /** Can user create a new project? */
    canCreateProject(planId: string, usedProjects: number): GateResult {
        const result = canAccessFeature(planId, 'projects', usedProjects);
        if (!result.allowed) {
            const nextPlan = getNextUpgradePlan(planId);
            return {
                allowed: false,
                featureKey: 'projects',
                reason: {
                    ar: result.nudgeAr || `وصلت لحد المشاريع (${result.limit}). ترقّ للمزيد.`,
                    en: result.nudge || `Project limit reached (${result.limit}). Upgrade for more.`
                },
                upgradeTarget: result.upgradeTarget,
                upgradePlanName: nextPlan ? nextPlan.name : undefined,
                currentUsed: usedProjects,
                limit: result.limit
            };
        }
        return { allowed: true, featureKey: 'projects', currentUsed: usedProjects, limit: result.limit };
    }

    /** Can user use AI classification? */
    canUseAI(planId: string, usedItems: number): GateResult {
        const result = canAccessFeature(planId, 'ai', usedItems);
        if (!result.allowed) {
            const nextPlan = getNextUpgradePlan(planId);
            return {
                allowed: false,
                featureKey: 'ai',
                reason: {
                    ar: result.nudgeAr || 'التصنيف الذكي غير متاح في باقتك',
                    en: result.nudge || 'AI classification not available in your plan'
                },
                upgradeTarget: result.upgradeTarget,
                upgradePlanName: nextPlan ? nextPlan.name : undefined,
                currentUsed: usedItems,
                limit: result.limit
            };
        }
        return { allowed: true, featureKey: 'ai', currentUsed: usedItems, limit: result.limit };
    }

    /** Can user upload BOQ files? */
    canUploadBOQ(planId: string, usedUploads: number): GateResult {
        const result = canAccessFeature(planId, 'boq', usedUploads);
        if (!result.allowed) {
            const nextPlan = getNextUpgradePlan(planId);
            return {
                allowed: false,
                featureKey: 'boq',
                reason: {
                    ar: result.nudgeAr || 'رفع BOQ غير متاح في باقتك',
                    en: result.nudge || 'BOQ upload not available in your plan'
                },
                upgradeTarget: result.upgradeTarget,
                upgradePlanName: nextPlan ? nextPlan.name : undefined,
                currentUsed: usedUploads,
                limit: result.limit
            };
        }
        return { allowed: true, featureKey: 'boq', currentUsed: usedUploads, limit: result.limit };
    }

    /** Can user add employees? */
    canAddEmployee(planId: string, usedSlots: number): GateResult {
        const result = canAccessFeature(planId, 'employees', usedSlots);
        if (!result.allowed) {
            const nextPlan = getNextUpgradePlan(planId);
            return {
                allowed: false,
                featureKey: 'employees',
                reason: {
                    ar: result.nudgeAr || 'إضافة موظفين غير متاحة في باقتك',
                    en: result.nudge || 'Adding employees not available in your plan'
                },
                upgradeTarget: result.upgradeTarget,
                upgradePlanName: nextPlan ? nextPlan.name : undefined,
                currentUsed: usedSlots,
                limit: result.limit
            };
        }
        return { allowed: true, featureKey: 'employees', currentUsed: usedSlots, limit: result.limit };
    }

    /** Can user access API? */
    canUseAPI(planId: string, usedCalls: number): GateResult {
        const result = canAccessFeature(planId, 'api', usedCalls);
        if (!result.allowed) {
            return {
                allowed: false,
                featureKey: 'api',
                reason: {
                    ar: result.nudgeAr || 'الوصول لـ API غير متاح في باقتك',
                    en: result.nudge || 'API access not available in your plan'
                },
                upgradeTarget: result.upgradeTarget,
                currentUsed: usedCalls,
                limit: result.limit
            };
        }
        return { allowed: true, featureKey: 'api', currentUsed: usedCalls, limit: result.limit };
    }

    /** Can user access commodity exchange? */
    canAccessCommodity(planId: string): GateResult {
        const result = canAccessFeature(planId, 'commodity');
        if (!result.allowed) {
            return {
                allowed: false,
                featureKey: 'commodity',
                reason: {
                    ar: result.nudgeAr || 'بورصة المواد غير متاحة في باقتك',
                    en: result.nudge || 'Commodity exchange not available in your plan'
                },
                upgradeTarget: result.upgradeTarget
            };
        }
        return { allowed: true, featureKey: 'commodity' };
    }

    /** Can user download reports? */
    canDownload(planId: string): GateResult {
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan || plan.restrictions.noDownload) {
            const nextPlan = getNextUpgradePlan(planId);
            return {
                allowed: false,
                featureKey: 'download',
                reason: {
                    ar: 'تحميل التقارير غير متاح في باقتك. ترقّ الآن!',
                    en: 'Report download not available in your plan. Upgrade now!'
                },
                upgradeTarget: nextPlan?.id,
                upgradePlanName: nextPlan ? nextPlan.name : undefined
            };
        }
        return { allowed: true, featureKey: 'download' };
    }

    /** Can user add company logo? */
    canAddLogo(planId: string): GateResult {
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan || plan.restrictions.noCompanyLogo) {
            const nextPlan = getNextUpgradePlan(planId);
            return {
                allowed: false,
                featureKey: 'logo',
                reason: {
                    ar: 'إضافة شعار الشركة غير متاحة في باقتك',
                    en: 'Adding company logo not available in your plan'
                },
                upgradeTarget: nextPlan?.id,
                upgradePlanName: nextPlan ? nextPlan.name : undefined
            };
        }
        return { allowed: true, featureKey: 'logo' };
    }

    /** Check if supplier names are encrypted */
    areSupplierNamesEncrypted(planId: string): boolean {
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        return plan?.restrictions.encryptedSuppliers ?? true;
    }

    /** Get brain access level */
    getBrainLevel(planId: string): string {
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        return plan?.brainLevel || 'disabled';
    }

    /** Check multiple features at once */
    checkFeatures(planId: string, features: string[], usageMap?: Record<string, number>): Record<string, GateResult> {
        const results: Record<string, GateResult> = {};
        for (const feature of features) {
            const used = usageMap?.[feature] || 0;
            switch (feature) {
                case 'projects': results[feature] = this.canCreateProject(planId, used); break;
                case 'ai': results[feature] = this.canUseAI(planId, used); break;
                case 'boq': results[feature] = this.canUploadBOQ(planId, used); break;
                case 'employees': results[feature] = this.canAddEmployee(planId, used); break;
                case 'api': results[feature] = this.canUseAPI(planId, used); break;
                case 'commodity': results[feature] = this.canAccessCommodity(planId); break;
                case 'download': results[feature] = this.canDownload(planId); break;
                case 'logo': results[feature] = this.canAddLogo(planId); break;
                default: results[feature] = { allowed: true, featureKey: feature }; break;
            }
        }
        return results;
    }
}

// Singleton export
export const featureGateService = new FeatureGateService();
