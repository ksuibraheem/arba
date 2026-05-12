/**
 * ARBA Budget Guardian v8.0 — صمام الميزانية الذكي
 * 
 * SOVEREIGN v8.0 — Phase 2.3: AI Cost Control
 * 
 * Prevents runaway AI costs by:
 * - Tracking daily Gemini API usage
 * - Enforcing budget thresholds (50%, 80%, 95%, 100%)
 * - Enabling "Save Mode" when budget is low
 * - Alerting Ibrahim when budget is critical
 * 
 * All AI calls MUST pass through this guardian before execution.
 */

import { temporalAuditService } from './temporalAuditService';

// ====================== TYPES ======================

export type BudgetStatus = 'normal' | 'warning' | 'save_mode' | 'critical' | 'blocked';

export interface BudgetState {
  status: BudgetStatus;
  usedToday: number;       // Tokens used today
  dailyLimit: number;      // Max tokens per day
  usagePercent: number;    // 0-100
  remainingTokens: number;
  message: string;
  canUseGemini: boolean;
  canUseVision: boolean;   // Vision is more expensive
}

export interface AICallRequest {
  functionName: string;
  estimatedTokens: number;
  requiresVision: boolean;
  requiresNLP: boolean;
  complexity: number; // 0-1
  userId: string;
}

// ====================== CONFIG ======================

const BUDGET_CONFIG_KEY = '_arba_budget_config';
const DAILY_USAGE_KEY = '_arba_daily_ai_usage';

// Default daily limits (configurable via arba_config in Firestore)
const DEFAULT_DAILY_TOKEN_LIMIT = 50000; // ~$10/day worth of tokens
const DEFAULT_DAILY_BUDGET_SAR = 30;     // 30 SAR/day

// Threshold percentages
const THRESHOLDS = {
  WARNING: 50,
  SAVE_MODE: 80,
  CRITICAL: 95,
  BLOCKED: 100,
};

// ====================== HELPERS ======================

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDailyUsage(): number {
  try {
    const data = JSON.parse(localStorage.getItem(DAILY_USAGE_KEY) || '{}');
    const todayKey = getTodayKey();
    return data[todayKey] || 0;
  } catch { return 0; }
}

function addDailyUsage(tokens: number): void {
  try {
    const data = JSON.parse(localStorage.getItem(DAILY_USAGE_KEY) || '{}');
    const todayKey = getTodayKey();
    data[todayKey] = (data[todayKey] || 0) + tokens;
    
    // Clean up old days (keep last 30)
    const keys = Object.keys(data).sort();
    while (keys.length > 30) {
      delete data[keys.shift()!];
    }
    
    localStorage.setItem(DAILY_USAGE_KEY, JSON.stringify(data));
  } catch { /* silent */ }
}

function getDailyLimit(): number {
  try {
    const config = JSON.parse(localStorage.getItem(BUDGET_CONFIG_KEY) || '{}');
    return config.dailyTokenLimit || DEFAULT_DAILY_TOKEN_LIMIT;
  } catch { return DEFAULT_DAILY_TOKEN_LIMIT; }
}

// ====================== SERVICE ======================

export const budgetGuardian = {
  
  /**
   * Get current budget status
   */
  getStatus(): BudgetState {
    const usedToday = getDailyUsage();
    const dailyLimit = getDailyLimit();
    const usagePercent = dailyLimit > 0 ? (usedToday / dailyLimit) * 100 : 0;
    const remainingTokens = Math.max(0, dailyLimit - usedToday);
    
    let status: BudgetStatus;
    let message: string;
    let canUseGemini = true;
    let canUseVision = true;
    
    if (usagePercent >= THRESHOLDS.BLOCKED) {
      status = 'blocked';
      message = 'تم إيقاف Gemini مؤقتاً — الميزانية اليومية وصلت 100%. سيتم إعادة التفعيل غداً.';
      canUseGemini = false;
      canUseVision = false;
    } else if (usagePercent >= THRESHOLDS.CRITICAL) {
      status = 'critical';
      message = `⚠️ تنبيه حرج: تم استخدام ${Math.round(usagePercent)}% من الميزانية اليومية. تم إيقاف Vision API.`;
      canUseVision = false;
    } else if (usagePercent >= THRESHOLDS.SAVE_MODE) {
      status = 'save_mode';
      message = `وضع الحفظ مُفعّل: ${Math.round(usagePercent)}% من الميزانية. المعالجة المحلية فقط.`;
      canUseVision = false;
    } else if (usagePercent >= THRESHOLDS.WARNING) {
      status = 'warning';
      message = `تحذير: تم استخدام ${Math.round(usagePercent)}% من الميزانية اليومية.`;
    } else {
      status = 'normal';
      message = `الميزانية متاحة: ${Math.round(100 - usagePercent)}% متبقي.`;
    }
    
    return {
      status,
      usedToday,
      dailyLimit,
      usagePercent: Math.min(usagePercent, 100),
      remainingTokens,
      message,
      canUseGemini,
      canUseVision,
    };
  },
  
  /**
   * Smart Escalation Decision — should we use Gemini or local processing?
   */
  shouldUseGemini(request: AICallRequest): { 
    approved: boolean; 
    reason: string;
    fallback?: string;
  } {
    const budgetState = this.getStatus();
    
    // Budget blocked — no AI calls
    if (!budgetState.canUseGemini) {
      return {
        approved: false,
        reason: 'الميزانية اليومية وصلت الحد الأقصى',
        fallback: 'استخدام دماغ أربا المحلي (بدون تكلفة)'
      };
    }
    
    // Vision requested but not available
    if (request.requiresVision && !budgetState.canUseVision) {
      return {
        approved: false,
        reason: 'Vision API مُوقف مؤقتاً لتوفير الميزانية',
        fallback: 'رفع الملف لاحقاً أو استخدام الإدخال اليدوي'
      };
    }
    
    // Complexity check — only escalate complex tasks
    if (request.complexity < 0.3 && !request.requiresVision && !request.requiresNLP) {
      return {
        approved: false,
        reason: 'المهمة بسيطة — يتم معالجتها محلياً بدون تكلفة',
        fallback: 'معالجة محلية عبر دماغ أربا'
      };
    }
    
    // Check if estimated tokens exceed remaining budget
    if (request.estimatedTokens > budgetState.remainingTokens) {
      return {
        approved: false,
        reason: `التكلفة المتوقعة (${request.estimatedTokens} tokens) أعلى من المتبقي (${budgetState.remainingTokens})`,
        fallback: 'تقليل حجم الطلب أو الانتظار لليوم التالي'
      };
    }
    
    return { approved: true, reason: 'تمت الموافقة' };
  },
  
  /**
   * Record tokens used after a successful AI call
   */
  recordUsage(request: AICallRequest, actualTokens: number): void {
    addDailyUsage(actualTokens);
    
    // Record in temporal audit
    temporalAuditService.recordUsage({
      userId: request.userId,
      action: `gemini_${request.functionName}`,
      tokensUsed: actualTokens,
      functionName: request.functionName,
      details: `Vision: ${request.requiresVision}, NLP: ${request.requiresNLP}`,
    });
    
    // Check if we need to alert
    const newStatus = this.getStatus();
    if (newStatus.status === 'critical' || newStatus.status === 'blocked') {
      console.warn(`🚨 BUDGET GUARDIAN: Status is ${newStatus.status}! ${newStatus.message}`);
      // Phase 1.1 will add email/SMS alert to Ibrahim here
    }
  },
  
  /**
   * Update daily budget limit (from admin settings)
   */
  updateDailyLimit(newLimit: number): void {
    try {
      const config = JSON.parse(localStorage.getItem(BUDGET_CONFIG_KEY) || '{}');
      config.dailyTokenLimit = newLimit;
      config.updatedAt = new Date().toISOString();
      localStorage.setItem(BUDGET_CONFIG_KEY, JSON.stringify(config));
    } catch { /* silent */ }
  },
  
  /**
   * Get usage history for the last N days
   */
  getUsageHistory(days = 7): { date: string; tokens: number }[] {
    try {
      const data = JSON.parse(localStorage.getItem(DAILY_USAGE_KEY) || '{}');
      const result: { date: string; tokens: number }[] = [];
      
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        result.push({ date: key, tokens: data[key] || 0 });
      }
      
      return result.reverse();
    } catch { return []; }
  },
};

export default budgetGuardian;
