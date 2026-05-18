/**
 * 🧠 ARBA Brain — Test Knowledge Base
 * يحوّل نتائج الاختبارات إلى أنماط خطأ مرجعية يتعلم منها الدماغ
 *
 * الفكرة: كل اختبار = نمط معروف.
 * إذا تكرر خطأ مشابه في الإنتاج، الدماغ يعرف السبب والحل.
 *
 * مصادر المعرفة:
 * - tests/brain-v85.test.ts → أنماط التصحيح الإملائي والربط الدلالي
 * - tests/subscription.test.ts → أنماط الاشتراكات والأسعار
 * - tests/train-brain.ts → أنماط التدريب والتعلم
 * - test-integration.ts → أنماط التكامل
 */

// =================== Types ===================

export interface KnownErrorPattern {
  id: string;
  category: 'spelling' | 'mapping' | 'pricing' | 'subscription' | 'permission' | 'calculation' | 'data_integrity';
  severity: 'critical' | 'high' | 'medium' | 'low';

  // وصف النمط
  pattern: string;           // regex أو نص يُطابق الخطأ
  patternAr: string;         // الوصف بالعربي

  // السلوك المتوقع
  expectedBehavior: string;
  expectedBehaviorAr: string;

  // الحل المعروف
  knownFix: string;
  knownFixAr: string;

  // مرجع الاختبار
  sourceTest: string;        // e.g., "brain-v85.test.ts:42"
  testAssertion: string;     // نص الاختبار الأصلي

  // تكرار الخطأ (يُحدّث في runtime)
  occurrenceCount: number;
  lastOccurrence: string | null;
}

export interface ErrorMatchResult {
  matched: boolean;
  pattern: KnownErrorPattern | null;
  confidence: number;        // 0-1
  suggestedAction: string;
}

// =================== Knowledge Base ===================

/** أنماط الأخطاء المستخلصة من الاختبارات */
const KNOWN_PATTERNS: KnownErrorPattern[] = [

  // ── من brain-v85.test.ts: تصحيح إملائي ──
  {
    id: 'spell_concrete',
    category: 'spelling',
    severity: 'high',
    pattern: 'خارسانه|خارسانة|خرسنة',
    patternAr: 'خطأ إملائي في كلمة خرسانة',
    expectedBehavior: 'خارسانه → خرسانة',
    expectedBehaviorAr: 'يجب تصحيح "خارسانه" إلى "خرسانة"',
    knownFix: 'Use correctSpelling() from semanticNormalizer',
    knownFixAr: 'استخدم correctSpelling() من المصفاة الذكية',
    sourceTest: 'brain-v85.test.ts:49',
    testAssertion: 'تصحيح: خارسانه → خرسانة',
    occurrenceCount: 0,
    lastOccurrence: null,
  },
  {
    id: 'spell_block',
    category: 'spelling',
    severity: 'medium',
    pattern: 'بلك',
    patternAr: 'خطأ إملائي: بلك بدل بلوك',
    expectedBehavior: 'بلك → بلوك',
    expectedBehaviorAr: 'يجب تصحيح "بلك" إلى "بلوك"',
    knownFix: 'correctSpelling() handles this case',
    knownFixAr: 'المصفاة تعالج هذه الحالة',
    sourceTest: 'brain-v85.test.ts:53',
    testAssertion: 'تصحيح: بلك → بلوك',
    occurrenceCount: 0,
    lastOccurrence: null,
  },
  {
    id: 'spell_electricity',
    category: 'spelling',
    severity: 'medium',
    pattern: 'كهربا$',
    patternAr: 'خطأ إملائي: كهربا بدل كهرباء',
    expectedBehavior: 'كهربا → كهرباء',
    expectedBehaviorAr: 'يجب تصحيح "كهربا" إلى "كهرباء"',
    knownFix: 'correctSpelling() handles this case',
    knownFixAr: 'المصفاة تعالج هذه الحالة',
    sourceTest: 'brain-v85.test.ts:57',
    testAssertion: 'تصحيح: كهربا → كهرباء',
    occurrenceCount: 0,
    lastOccurrence: null,
  },
  {
    id: 'spell_elevator',
    category: 'spelling',
    severity: 'low',
    pattern: 'اسانسير|اسنسير',
    patternAr: 'مصطلح عامي: اسانسير بدل مصعد',
    expectedBehavior: 'اسانسير → مصعد',
    expectedBehaviorAr: 'يجب تصحيح "اسانسير" إلى "مصعد"',
    knownFix: 'correctSpelling() handles this case',
    knownFixAr: 'المصفاة تعالج هذه الحالة',
    sourceTest: 'brain-v85.test.ts:61',
    testAssertion: 'تصحيح: اسانسير → مصعد',
    occurrenceCount: 0,
    lastOccurrence: null,
  },

  // ── من brain-v85.test.ts: ربط دلالي ──
  {
    id: 'map_fire_pump',
    category: 'mapping',
    severity: 'critical',
    pattern: 'مضخة حريق.*(?!15\\.06)',
    patternAr: 'مضخة حريق لم تُربط بـ 15.06',
    expectedBehavior: 'مضخة حريق → 15.06',
    expectedBehaviorAr: 'بند مضخة الحريق يجب أن يرتبط بالكود 15.06',
    knownFix: 'Check COGNITIVE_TO_DB_MAP in boqEngine.ts',
    knownFixAr: 'تحقق من خريطة الربط في boqEngine.ts',
    sourceTest: 'brain-v85.test.ts:81',
    testAssertion: 'ربط: مضخة حريق → 15.06',
    occurrenceCount: 0,
    lastOccurrence: null,
  },
  {
    id: 'map_chiller',
    category: 'mapping',
    severity: 'critical',
    pattern: 'تشيلر.*(?!10\\.04)',
    patternAr: 'تشيلر لم يُربط بـ 10.04',
    expectedBehavior: 'تشيلر → 10.04',
    expectedBehaviorAr: 'بند التشيلر يجب أن يرتبط بالكود 10.04',
    knownFix: 'Check COGNITIVE_TO_DB_MAP in boqEngine.ts',
    knownFixAr: 'تحقق من خريطة الربط في boqEngine.ts',
    sourceTest: 'brain-v85.test.ts:85',
    testAssertion: 'ربط: تشيلر → 10.04',
    occurrenceCount: 0,
    lastOccurrence: null,
  },

  // ── من brain-v85.test.ts: تنبيهات الربح ──
  {
    id: 'profit_loss',
    category: 'calculation',
    severity: 'critical',
    pattern: 'profitStatus.*loss|خسارة',
    patternAr: 'سعر أقل من التكلفة = خسارة',
    expectedBehavior: 'Price < 95% of cost → profitStatus = "loss"',
    expectedBehaviorAr: 'إذا كان السعر أقل من 95% من التكلفة → خسارة',
    knownFix: 'Check profit margin calculation: ((price - cost) / cost) * 100',
    knownFixAr: 'تحقق من حساب هامش الربح: ((السعر - التكلفة) / التكلفة) × 100',
    sourceTest: 'brain-v85.test.ts:122',
    testAssertion: 'خسارة: سعر 80 < تكلفة 100',
    occurrenceCount: 0,
    lastOccurrence: null,
  },
  {
    id: 'profit_exaggerated',
    category: 'calculation',
    severity: 'high',
    pattern: 'profitStatus.*exaggerated|مبالغة',
    patternAr: 'هامش ربح أعلى من 30% = مبالغة',
    expectedBehavior: 'Price > 130% of cost → profitStatus = "exaggerated"',
    expectedBehaviorAr: 'إذا كان السعر أعلى من 130% من التكلفة → مبالغة في السعر',
    knownFix: 'Profit margin threshold is 30% — configurable in cognitiveCalculations',
    knownFixAr: 'حد المبالغة 30% — يمكن تعديله في cognitiveCalculations',
    sourceTest: 'brain-v85.test.ts:126',
    testAssertion: 'مبالغة: سعر 200 > تكلفة 100 (+100%)',
    occurrenceCount: 0,
    lastOccurrence: null,
  },

  // ── من brain-v85.test.ts: الوحدات ──
  {
    id: 'unit_sqm',
    category: 'mapping',
    severity: 'high',
    pattern: 'متر مربع.*(?!م2)',
    patternAr: 'وحدة "متر مربع" لم تُحول إلى "م2"',
    expectedBehavior: 'متر مربع → م2',
    expectedBehaviorAr: 'يجب توحيد "متر مربع" إلى "م2"',
    knownFix: 'normalizeUnit() in semanticNormalizer',
    knownFixAr: 'استخدم normalizeUnit() من المصفاة',
    sourceTest: 'brain-v85.test.ts:65',
    testAssertion: 'وحدة: متر مربع → م2',
    occurrenceCount: 0,
    lastOccurrence: null,
  },
  {
    id: 'unit_cbm',
    category: 'mapping',
    severity: 'high',
    pattern: 'متر مكعب.*(?!م3)',
    patternAr: 'وحدة "متر مكعب" لم تُحول إلى "م3"',
    expectedBehavior: 'متر مكعب → م3',
    expectedBehaviorAr: 'يجب توحيد "متر مكعب" إلى "م3"',
    knownFix: 'normalizeUnit() in semanticNormalizer',
    knownFixAr: 'استخدم normalizeUnit() من المصفاة',
    sourceTest: 'brain-v85.test.ts:68',
    testAssertion: 'وحدة: متر مكعب → م3',
    occurrenceCount: 0,
    lastOccurrence: null,
  },

  // ── من brain-v85.test.ts: grossQty خطأ (كمية ≠ تكلفة) ──
  {
    id: 'qty_cost_confusion',
    category: 'data_integrity',
    severity: 'critical',
    pattern: 'grossQty.*Cost|grossQty.*cost_SAR',
    patternAr: 'خلط بين الكمية والتكلفة في grossQty',
    expectedBehavior: 'grossQty should be a quantity (number of items), never a cost (SAR amount)',
    expectedBehaviorAr: 'grossQty يجب أن تكون كمية (عدد)، وليست تكلفة (مبلغ بالريال)',
    knownFix: 'grossQty = count/quantity, NOT qty * unitPrice',
    knownFixAr: 'grossQty = العدد/الكمية، وليس الكمية × سعر الوحدة',
    sourceTest: 'brain-v85.test.ts:283',
    testAssertion: 'لا grossQty = cubeTestSets * cost',
    occurrenceCount: 0,
    lastOccurrence: null,
  },

  // ── من subscription.test.ts: أسعار الباقات ──
  {
    id: 'annual_discount',
    category: 'pricing',
    severity: 'critical',
    pattern: 'annual.*(?!0\\.8|20%)',
    patternAr: 'خصم سنوي يجب أن يكون 20%',
    expectedBehavior: 'Annual price = Monthly × 12 × 0.8 (20% discount)',
    expectedBehaviorAr: 'السعر السنوي = الشهري × 12 × 0.8 (خصم 20%)',
    knownFix: 'PLAN_ANNUAL_PRICES in paymentService.ts applies 0.8 multiplier',
    knownFixAr: 'PLAN_ANNUAL_PRICES في paymentService.ts يطبق معامل 0.8',
    sourceTest: 'subscription.test.ts:322',
    testAssertion: 'Annual pricing has 20% discount',
    occurrenceCount: 0,
    lastOccurrence: null,
  },
  {
    id: 'downgrade_archive',
    category: 'subscription',
    severity: 'high',
    pattern: 'downgrade.*archive|archivedProjects',
    patternAr: 'عند التخفيض: المشاريع الزائدة تُؤرشف ولا تُحذف',
    expectedBehavior: 'On downgrade, excess projects are archived (read-only), never deleted',
    expectedBehaviorAr: 'عند تخفيض الباقة: المشاريع الزائدة تصبح للقراءة فقط ولا تُحذف',
    knownFix: 'archivedProjects = Math.max(0, usedProjects - newPlanLimit)',
    knownFixAr: 'المشاريع المؤرشفة = الأكثر(0، المستخدمة - الحد الجديد)',
    sourceTest: 'subscription.test.ts:160',
    testAssertion: 'Professional → Starter: 10 projects → 5 editable, 5 archived',
    occurrenceCount: 0,
    lastOccurrence: null,
  },
  {
    id: 'rfq_commission',
    category: 'pricing',
    severity: 'high',
    pattern: 'commission|عمولة.*RFQ',
    patternAr: 'عمولة RFQ = بوابة دفع 2.5% + ثابت 10 + أربا 3.5%',
    expectedBehavior: 'Total commission = gateway(2.5%) + fixed(10 SAR) + arba(3.5%)',
    expectedBehaviorAr: 'إجمالي العمولة = بوابة(2.5%) + ثابت(10 ر.س) + أربا(3.5%)',
    knownFix: 'calculateRFQCommission in subscriptionService.ts',
    knownFixAr: 'دالة حساب العمولة في subscriptionService.ts',
    sourceTest: 'subscription.test.ts:237',
    testAssertion: 'Small order (1000 SAR): commission = 70 SAR',
    occurrenceCount: 0,
    lastOccurrence: null,
  },

  // ── من brain-v85.test.ts: صلاحيات ──
  {
    id: 'perm_viewer_no_brain',
    category: 'permission',
    severity: 'high',
    pattern: 'viewer.*none|مشاهد.*لا يرى',
    patternAr: 'المشاهد لا يرى بيانات الدماغ',
    expectedBehavior: 'Viewer role → brain access level = "none"',
    expectedBehaviorAr: 'صلاحية المشاهد = لا وصول لبيانات الدماغ',
    knownFix: 'getBrainAccessLevel() in brainFeatureGate.ts',
    knownFixAr: 'تحقق من getBrainAccessLevel() في brainFeatureGate.ts',
    sourceTest: 'brain-v85.test.ts:200',
    testAssertion: 'مشاهد → none',
    occurrenceCount: 0,
    lastOccurrence: null,
  },
  {
    id: 'perm_client_no_amounts',
    category: 'permission',
    severity: 'high',
    pattern: 'client.*ر\\.س|عميل.*مبلغ',
    patternAr: 'العميل يرى الألوان لكن بدون مبالغ بالريال',
    expectedBehavior: 'Client sees profitStatus colors but SAR amounts are hidden',
    expectedBehaviorAr: 'العميل يرى ألوان الحالة لكن المبالغ بالريال مخفية',
    knownFix: 'filterBrainDataForUser("basic_alerts") strips SAR values',
    knownFixAr: 'فلترة بيانات العميل تحذف قيم الريال',
    sourceTest: 'brain-v85.test.ts:225',
    testAssertion: 'فلترة عميل: أرقام الريال مخفية',
    occurrenceCount: 0,
    lastOccurrence: null,
  },
];

// =================== Service ===================

class BrainTestKnowledgeBase {

  private patterns: KnownErrorPattern[] = [...KNOWN_PATTERNS];
  private STORAGE_KEY = 'arba_brain_error_patterns';

  constructor() {
    // تحميل سجل التكرار من localStorage
    this.loadOccurrences();
  }

  /**
   * مطابقة خطأ مع الأنماط المعروفة
   * يُستدعى من brainSelfDiagnostic عند اكتشاف مشكلة
   */
  matchError(errorText: string, context?: string): ErrorMatchResult {
    let bestMatch: KnownErrorPattern | null = null;
    let bestConfidence = 0;

    for (const pattern of this.patterns) {
      try {
        const regex = new RegExp(pattern.pattern, 'i');
        if (regex.test(errorText) || (context && regex.test(context))) {
          const confidence = this.calculateConfidence(errorText, pattern);
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestMatch = pattern;
          }
        }
      } catch {
        // Regex error — fallback to includes
        if (errorText.includes(pattern.pattern) || pattern.patternAr.split('|').some(p => errorText.includes(p))) {
          bestMatch = pattern;
          bestConfidence = 0.7;
        }
      }
    }

    if (bestMatch) {
      // تسجيل التكرار
      this.recordOccurrence(bestMatch.id);

      return {
        matched: true,
        pattern: bestMatch,
        confidence: bestConfidence,
        suggestedAction: bestMatch.knownFixAr,
      };
    }

    return { matched: false, pattern: null, confidence: 0, suggestedAction: '' };
  }

  /**
   * الحصول على كل الأنماط حسب الفئة
   */
  getPatternsByCategory(category: KnownErrorPattern['category']): KnownErrorPattern[] {
    return this.patterns.filter(p => p.category === category);
  }

  /**
   * الحصول على الأخطاء الأكثر تكراراً
   */
  getMostFrequentErrors(limit: number = 5): KnownErrorPattern[] {
    return [...this.patterns]
      .filter(p => p.occurrenceCount > 0)
      .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
      .slice(0, limit);
  }

  /**
   * إحصائيات قاعدة المعرفة
   */
  getStats(): {
    totalPatterns: number;
    byCategory: Record<string, number>;
    totalOccurrences: number;
    topErrors: Array<{ id: string; count: number; patternAr: string }>;
  } {
    const byCategory: Record<string, number> = {};
    let totalOccurrences = 0;

    for (const p of this.patterns) {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
      totalOccurrences += p.occurrenceCount;
    }

    const topErrors = this.getMostFrequentErrors(3).map(p => ({
      id: p.id,
      count: p.occurrenceCount,
      patternAr: p.patternAr,
    }));

    return {
      totalPatterns: this.patterns.length,
      byCategory,
      totalOccurrences,
      topErrors,
    };
  }

  /**
   * تصدير كل الأنماط (للتشخيص الذاتي)
   */
  getAllPatterns(): KnownErrorPattern[] {
    return [...this.patterns];
  }

  // =================== Internal ===================

  private calculateConfidence(text: string, pattern: KnownErrorPattern): number {
    let score = 0.5;

    // Exact pattern match
    try {
      if (new RegExp(pattern.pattern, 'i').test(text)) score += 0.3;
    } catch { /* */ }

    // Category relevance boost
    if (text.includes('خرسانة') && pattern.category === 'spelling') score += 0.1;
    if (text.includes('سعر') && pattern.category === 'pricing') score += 0.1;
    if (text.includes('باقة') && pattern.category === 'subscription') score += 0.1;

    return Math.min(1.0, score);
  }

  private recordOccurrence(patternId: string): void {
    const pattern = this.patterns.find(p => p.id === patternId);
    if (pattern) {
      pattern.occurrenceCount++;
      pattern.lastOccurrence = new Date().toISOString();
      this.saveOccurrences();
    }
  }

  private loadOccurrences(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data: Record<string, { count: number; last: string }> = JSON.parse(saved);
        for (const pattern of this.patterns) {
          const saved = data[pattern.id];
          if (saved) {
            pattern.occurrenceCount = saved.count;
            pattern.lastOccurrence = saved.last;
          }
        }
      }
    } catch { /* */ }
  }

  private saveOccurrences(): void {
    try {
      const data: Record<string, { count: number; last: string }> = {};
      for (const p of this.patterns) {
        if (p.occurrenceCount > 0) {
          data[p.id] = { count: p.occurrenceCount, last: p.lastOccurrence || '' };
        }
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch { /* */ }
  }
}

export const brainTestKnowledgeBase = new BrainTestKnowledgeBase();
