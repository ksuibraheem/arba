/**
 * Subscription Service — خدمة إدارة الاشتراكات
 * 
 * Gatekeeper for feature access. Reads user subscription from Firestore
 * and enforces plan limits on projects, employees, and storage.
 */

import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import {
    SubscriptionPlan as PlanType, PLAN_EMPLOYEE_LIMITS,
    ArbaSubscription, isSubscriptionActive,
} from './projectTypes';
import { SUBSCRIPTION_PLANS } from '../companyData';

// =================== Types ===================

export interface SubscriptionState {
    plan: PlanType;
    status: 'active' | 'trial' | 'expired' | 'grace_period' | 'suspended';
    projectsUsed: number;
    storageUsedMB: number;
    employeeCount: number;
    subscription: ArbaSubscription | null;
}

export interface LimitCheckResult {
    allowed: boolean;
    reason?: { ar: string; en: string };
    upgradeRequired?: PlanType;
    currentLimit?: number;
    currentUsage?: number;
}

// =================== Default State ===================

const DEFAULT_STATE: SubscriptionState = {
    plan: 'free',
    status: 'active',
    projectsUsed: 0,
    storageUsedMB: 0,
    employeeCount: 0,
    subscription: null,
};

let currentState: SubscriptionState = { ...DEFAULT_STATE };
let stateListeners: ((state: SubscriptionState) => void)[] = [];
let activeUnsub: Unsubscribe | null = null;

// =================== Core Functions ===================

/**
 * Initialize subscription listener for a user
 */
export function initSubscriptionListener(userId: string): Unsubscribe {
    // Clean up previous listener
    if (activeUnsub) {
        activeUnsub();
    }

    const subsRef = collection(db, 'subscriptions');
    const q = query(subsRef, where('userId', '==', userId));

    activeUnsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const subData = snapshot.docs[0].data() as ArbaSubscription;
            const isActive = isSubscriptionActive(subData);

            currentState = {
                ...currentState,
                plan: subData.plan,
                status: isActive ? 'active' : 'expired',
                subscription: subData,
            };
        } else {
            currentState = { ...DEFAULT_STATE };
        }
        notifyListeners();
    }, (error) => {
        console.error('❌ Subscription listener error:', error);
    });

    return activeUnsub;
}

/**
 * Load subscription once (non-realtime)
 */
export async function loadSubscription(userId: string): Promise<SubscriptionState> {
    try {
        const subsRef = collection(db, 'subscriptions');
        const q = query(subsRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const subData = snapshot.docs[0].data() as ArbaSubscription;
            const isActive = isSubscriptionActive(subData);

            currentState = {
                ...currentState,
                plan: subData.plan,
                status: isActive ? 'active' : 'expired',
                subscription: subData,
            };
        }
    } catch (error) {
        console.warn('⚠️ Could not load subscription, using free plan:', error);
    }
    return currentState;
}

/**
 * Get current subscription plan
 */
export function getCurrentPlan(): PlanType {
    return currentState.plan;
}

/**
 * Get full subscription state
 */
export function getSubscriptionState(): SubscriptionState {
    return { ...currentState };
}

/**
 * Update usage metrics (called by other services)
 */
export function updateUsageMetrics(metrics: Partial<Pick<SubscriptionState, 'projectsUsed' | 'storageUsedMB' | 'employeeCount'>>) {
    currentState = { ...currentState, ...metrics };
    notifyListeners();
}

// =================== Feature Gatekeeping ===================

/**
 * Check if user can add a new project
 */
export function canAddProject(): LimitCheckResult {
    const planData = SUBSCRIPTION_PLANS.find(p => p.id === mapPlanId(currentState.plan));
    if (!planData) return { allowed: true };

    if (planData.projectsIncluded === -1) {
        return { allowed: true }; // Unlimited
    }

    if (currentState.projectsUsed >= planData.projectsIncluded) {
        return {
            allowed: false,
            reason: {
                ar: `وصلت للحد الأقصى (${planData.projectsIncluded} مشاريع). قم بالترقية لإضافة المزيد.`,
                en: `Reached limit (${planData.projectsIncluded} projects). Upgrade to add more.`,
            },
            upgradeRequired: 'pro',
            currentLimit: planData.projectsIncluded,
            currentUsage: currentState.projectsUsed,
        };
    }
    return { allowed: true };
}

/**
 * Check if user can add an employee
 */
export function canAddEmployee(): LimitCheckResult {
    if (currentState.plan === 'free') {
        return {
            allowed: false,
            reason: {
                ar: 'الباقة المجانية لا تدعم إضافة موظفين. يرجى الترقية.',
                en: 'Free plan does not support employees. Please upgrade.',
            },
            upgradeRequired: 'basic',
        };
    }

    const limits = PLAN_EMPLOYEE_LIMITS[currentState.plan];
    if (currentState.employeeCount >= limits.maxEmployees) {
        return {
            allowed: true, // Allowed but with extra cost
            reason: {
                ar: `تجاوزت الحد (${limits.maxEmployees} مستخدمين). كل موظف إضافي بـ 59 ر.س/شهر`,
                en: `Exceeded limit (${limits.maxEmployees} users). Extra seat: 59 SAR/month`,
            },
            currentLimit: limits.maxEmployees,
            currentUsage: currentState.employeeCount,
        };
    }
    return { allowed: true };
}

/**
 * Check if user can upload files (storage limit)
 */
export function canUploadFile(fileSizeMB: number): LimitCheckResult {
    const planData = SUBSCRIPTION_PLANS.find(p => p.id === mapPlanId(currentState.plan));
    if (!planData) return { allowed: true };

    const maxMB = planData.storageMB;
    if (currentState.storageUsedMB + fileSizeMB > maxMB) {
        return {
            allowed: false,
            reason: {
                ar: `تجاوزت حد التخزين (${maxMB} ميجا). قم بالترقية لمساحة أكبر.`,
                en: `Storage limit exceeded (${maxMB} MB). Upgrade for more space.`,
            },
            upgradeRequired: currentState.plan === 'free' ? 'basic' : 'pro',
            currentLimit: maxMB,
            currentUsage: currentState.storageUsedMB,
        };
    }
    return { allowed: true };
}

/**
 * Check if a specific feature is available
 */
export function canAccessFeature(feature: 'ai_pricing' | 'download' | 'company_logo' | 'api' | 'supplier_names'): LimitCheckResult {
    const planData = SUBSCRIPTION_PLANS.find(p => p.id === mapPlanId(currentState.plan));
    if (!planData) return { allowed: true };

    const featureMap: Record<string, keyof typeof planData.restrictions> = {
        'ai_pricing': 'noAIPricing',
        'download': 'noDownload',
        'company_logo': 'noCompanyLogo',
        'supplier_names': 'encryptedSuppliers',
    };

    const restriction = featureMap[feature];
    if (restriction && planData.restrictions[restriction]) {
        return {
            allowed: false,
            reason: {
                ar: 'هذه الميزة غير متاحة في باقتك الحالية. قم بالترقية.',
                en: 'This feature is not available in your current plan. Please upgrade.',
            },
            upgradeRequired: 'pro',
        };
    }
    return { allowed: true };
}

// =================== Listener Pattern ===================

export function onSubscriptionChange(callback: (state: SubscriptionState) => void): () => void {
    stateListeners.push(callback);
    // Immediately call with current state
    callback(currentState);
    return () => {
        stateListeners = stateListeners.filter(l => l !== callback);
    };
}

function notifyListeners() {
    stateListeners.forEach(l => l(currentState));
}

// =================== Helpers ===================

/** Map internal plan types to companyData plan IDs */
function mapPlanId(plan: PlanType): string {
    switch (plan) {
        case 'free': return 'free';
        case 'basic': return 'professional'; // basic maps to professional in companyData
        case 'pro': return 'professional';
        case 'enterprise': return 'enterprise';
        default: return 'free';
    }
}

/** Cleanup on logout */
export function cleanupSubscription() {
    if (activeUnsub) {
        activeUnsub();
        activeUnsub = null;
    }
    currentState = { ...DEFAULT_STATE };
    stateListeners = [];
}
