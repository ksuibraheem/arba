/**
 * ARBA v8.5 — Brain Feature Gate (بوابة ميزات الدماغ)
 * 
 * تتحكم في ما يراه كل مستخدم من خصائص الدماغ:
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │  العميل (مجاني)    → تنبيهات ألوان فقط (🔴🟠🟢)           │
 * │  العميل (مدفوع)    → تنبيهات + تحليل ذكاء اصطناعي خارجي  │
 * │  مختص آربا         → كل شيء + مراجعة وتقديم الكميات       │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * القاعدة الذهبية: عمليات الدماغ الداخلي تعمل دائماً في الخلفية
 * لكن النتائج تُفلتر حسب صلاحية المستخدم قبل عرضها.
 */

import { PERMISSIONS } from './projectTypes';
import type { CalculatedItem } from '../types';

// =================== FEATURE ACCESS LEVELS ===================

export type BrainAccessLevel = 'none' | 'basic_alerts' | 'premium_ai' | 'arba_specialist';

/**
 * يحدد مستوى وصول المستخدم لميزات الدماغ
 * بناءً على صلاحياته (permissions)
 */
export function getBrainAccessLevel(userPermissions: string[]): BrainAccessLevel {
  if (userPermissions.includes(PERMISSIONS.QS_REVIEW_SUBMIT)) {
    return 'arba_specialist';   // مختص كميات آربا — كل شيء
  }
  if (userPermissions.includes(PERMISSIONS.BRAIN_DEEP_ANALYSIS)) {
    return 'premium_ai';        // عميل مدفوع — تنبيهات + AI خارجي
  }
  if (userPermissions.includes(PERMISSIONS.BRAIN_ALERTS_VIEW)) {
    return 'basic_alerts';      // عميل مجاني — تنبيهات ألوان فقط
  }
  return 'none';                // مشاهد — لا شيء
}

// =================== FILTER BRAIN DATA FOR CLIENT ===================

/**
 * يُنقي بيانات الدماغ حسب مستوى وصول المستخدم
 * العميل يرى التنبيهات فقط، آربا يرى كل شيء
 */
export function filterBrainDataForUser(
  items: CalculatedItem[],
  accessLevel: BrainAccessLevel
): CalculatedItem[] {
  if (accessLevel === 'none') {
    // إخفاء كل بيانات الدماغ
    return items.map(item => ({
      ...item,
      profitStatus: undefined,
      brainWarnings: undefined,
    }));
  }

  if (accessLevel === 'basic_alerts') {
    // العميل يرى الألوان والتنبيهات الأساسية فقط
    // لكن لا يرى الأرقام التفصيلية (baseCost, margins)
    return items.map(item => ({
      ...item,
      brainWarnings: item.brainWarnings?.map(w =>
        // إزالة الأرقام الداخلية من رسائل التنبيه للعميل
        w.replace(/\(\d[\d,.]*\s*ر\.س\)/g, '').replace(/\(\d[\d,.]*\s*SAR\)/g, '').trim()
      ),
    }));
  }

  // premium_ai أو arba_specialist → يرى كل شيء بدون فلترة
  return items;
}

// =================== ARBA QS SPECIALIST IDENTITY ===================

export interface ArbaSpecialistInfo {
  name: string;             // اسم المختص
  title: string;            // المسمى الوظيفي
  specialistId: string;     // رقم تعريفي داخلي
  stamp: string;            // ختم المراجعة
}

/**
 * معلومات مختص الكميات لدى آربا
 * تظهر في العرض الفني كـ "مُقدّم ومراجع الكميات"
 */
export function getArbaSpecialistStamp(specialistName: string, specialistId: string): ArbaSpecialistInfo {
  return {
    name: specialistName,
    title: 'مختص كميات — مُقدّم ومراجع',     // يظهر في العرض الفني
    specialistId: specialistId,
    stamp: `تمت المراجعة والتقديم بواسطة: ${specialistName} | رقم: ${specialistId} | التاريخ: ${new Date().toLocaleDateString('ar-SA')}`,
  };
}

// =================== SUBSCRIPTION GATE FOR PREMIUM AI ===================

export interface BrainPricingTier {
  name: string;
  nameAr: string;
  monthlyPrice: number;     // ريال سعودي / شهر
  features: string[];
  featuresAr: string[];
}

/** تسعير ميزات الذكاء الاصطناعي المتقدم */
export const BRAIN_PRICING_TIERS: BrainPricingTier[] = [
  {
    name: 'Brain Basic',
    nameAr: 'الدماغ الأساسي',
    monthlyPrice: 0,
    features: ['Color-coded alerts (red/orange/green)', 'Basic profit margin check'],
    featuresAr: ['تنبيهات ملونة (أحمر/برتقالي/أخضر)', 'فحص هامش الربح الأساسي'],
  },
  {
    name: 'Brain Pro',
    nameAr: 'الدماغ الاحترافي',
    monthlyPrice: 149,
    features: ['All Basic features', 'AI-powered tender analysis', 'Supplier optimization recommendations', 'Quantity deviation alerts'],
    featuresAr: ['كل ميزات الأساسي', 'تحليل مناقصات بالذكاء الاصطناعي', 'توصيات تحسين الموردين', 'تنبيهات انحراف الكميات'],
  },
  {
    name: 'Brain Enterprise',
    nameAr: 'الدماغ المؤسسي',
    monthlyPrice: 399,
    features: ['All Pro features', 'Full AI report with recommendations', 'Predictive pricing', 'Custom learning from past projects'],
    featuresAr: ['كل ميزات الاحترافي', 'تقرير كامل بالتوصيات', 'تسعير تنبؤي', 'تعلم مخصص من المشاريع السابقة'],
  },
];

/**
 * هل العميل يستحق الترقية لميزات AI؟
 * يُعرض كرسالة تسويقية عند محاولة الوصول لميزة محدودة
 */
export function getUpgradePrompt(currentLevel: BrainAccessLevel, requestedFeature: string): string | null {
  if (currentLevel === 'arba_specialist' || currentLevel === 'premium_ai') {
    return null; // لديه الصلاحية
  }

  if (currentLevel === 'basic_alerts') {
    const tier = BRAIN_PRICING_TIERS[1]; // Brain Pro
    return `🧠 للحصول على "${requestedFeature}" — قم بالترقية إلى ${tier.nameAr} بـ ${tier.monthlyPrice} ر.س/شهر`;
  }

  return 'يرجى تسجيل الدخول للوصول لميزات الدماغ الذكي';
}
