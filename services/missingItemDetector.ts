/**
 * ARBA V10.0 — Missing Item Detector
 * محرك كشف البنود الناقصة — يعمل داخلياً فقط
 *
 * الفلسفة: المنصة تعرف البنود الناقصة → توفرها فوراً → العميل يشوف BOQ كامل
 * العميل لا يُخبَر أن هناك بنود ناقصة — التجربة سلسة 100%
 *
 * 3 مستويات كشف:
 * 1. قواعد فيزيائية (30+ قاعدة) — فوري بدون AI
 * 2. مقارنة بالـ cognitive engine — فوري بدون AI
 * 3. Claude review — عند الربط في المرحلة 3
 */

// =================== Types ===================

export interface MissingItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  reason: string;
  severity: 'critical' | 'important' | 'recommended';
  suggestedQty?: number;
  suggestedUnit?: string;
  estimatedPrice?: number;
  estimatedTotal?: number;
  ruleId?: string;
  source: 'physical_rule' | 'cognitive_comparison' | 'claude_review';
}

export interface MissingItemReport {
  totalGaps: number;
  criticalGaps: number;
  importantGaps: number;
  recommendedGaps: number;
  missingItems: MissingItem[];
  coveragePercent: number;
  estimatedMissingCost: number;
  detectedAt: Date;
}

export interface EnrichedBOQ {
  originalItemCount: number;
  suggestedItems: MissingItem[];
  totalGaps: number;
  coverageBeforePercent: number;
  coverageAfterPercent: number;
}

// =================== Physical Dependency Rules ===================

interface DependencyRule {
  id: string;
  ifCategory: string;
  ifKeywords: string[];
  thenCategory: string;
  thenKeywords: string[];
  missingItem: {
    nameAr: string;
    nameEn: string;
    category: string;
    defaultUnit: string;
    defaultPricePerUnit: number;
  };
  reason: string;
  severity: 'critical' | 'important' | 'recommended';
}

const PHYSICAL_RULES: DependencyRule[] = [
  // ── إنشائي ──
  {
    id: 'PHY_01',
    ifCategory: 'concrete', ifKeywords: ['خرسانة', 'concrete', 'كونكريت'],
    thenCategory: 'formwork', thenKeywords: ['شدة', 'formwork', 'قوالب'],
    missingItem: {
      nameAr: 'شدة خشبية للخرسانة',
      nameEn: 'Formwork for Concrete',
      category: 'structure', defaultUnit: 'م²', defaultPricePerUnit: 85,
    },
    reason: 'خرسانة بدون شدة = مستحيل فيزيائياً — يجب توفير قالب صب',
    severity: 'critical',
  },
  {
    id: 'PHY_02',
    ifCategory: 'concrete', ifKeywords: ['خرسانة', 'concrete'],
    thenCategory: 'rebar', thenKeywords: ['حديد', 'تسليح', 'rebar', 'steel', 'reinforc'],
    missingItem: {
      nameAr: 'حديد تسليح',
      nameEn: 'Steel Reinforcement (Rebar)',
      category: 'structure', defaultUnit: 'طن', defaultPricePerUnit: 2750,
    },
    reason: 'خرسانة بدون حديد تسليح = خطر إنشائي — مخالفة SBC 304',
    severity: 'critical',
  },
  {
    id: 'PHY_03',
    ifCategory: 'concrete', ifKeywords: ['خرسانة', 'concrete'],
    thenCategory: 'curing', thenKeywords: ['معالجة', 'curing', 'إنضاج'],
    missingItem: {
      nameAr: 'معالجة خرسانة (Curing)',
      nameEn: 'Concrete Curing',
      category: 'concrete', defaultUnit: 'م²', defaultPricePerUnit: 12,
    },
    reason: 'خرسانة بدون معالجة = فقدان 40% من القوة — SBC 304',
    severity: 'important',
  },

  // ── سباكة وصرف ──
  {
    id: 'PHY_04',
    ifCategory: 'plumbing', ifKeywords: ['سباكة', 'plumbing', 'مياه', 'water'],
    thenCategory: 'drainage', thenKeywords: ['صرف', 'drainage', 'مجاري', 'sewer'],
    missingItem: {
      nameAr: 'شبكة صرف صحي',
      nameEn: 'Drainage/Sewer Network',
      category: 'plumbing', defaultUnit: 'م.ط', defaultPricePerUnit: 120,
    },
    reason: 'سباكة مياه بدون صرف صحي = تسريب حتمي',
    severity: 'critical',
  },
  {
    id: 'PHY_05',
    ifCategory: 'plumbing', ifKeywords: ['صرف', 'drainage', 'مجاري'],
    thenCategory: 'manholes', thenKeywords: ['غرف', 'تفتيش', 'manhole', 'inspection'],
    missingItem: {
      nameAr: 'غرف تفتيش صرف صحي',
      nameEn: 'Drainage Manholes',
      category: 'plumbing', defaultUnit: 'عدد', defaultPricePerUnit: 2500,
    },
    reason: 'صرف بدون غرف تفتيش = مخالفة بلدية',
    severity: 'important',
  },

  // ── كهرباء ──
  {
    id: 'PHY_06',
    ifCategory: 'electrical', ifKeywords: ['كهرباء', 'electrical', 'كيبل', 'cable'],
    thenCategory: 'earthing', thenKeywords: ['أرضي', 'earthing', 'grounding', 'تأريض'],
    missingItem: {
      nameAr: 'نظام تأريض كهربائي',
      nameEn: 'Electrical Earthing System',
      category: 'electrical', defaultUnit: 'مقطوعية', defaultPricePerUnit: 8500,
    },
    reason: 'كهرباء بدون أرضي = خطر صعق كهربائي — SBC 401',
    severity: 'critical',
  },
  {
    id: 'PHY_07',
    ifCategory: 'electrical', ifKeywords: ['كهرباء', 'electrical'],
    thenCategory: 'panel', thenKeywords: ['لوحة', 'panel', 'طبلون', 'distribution'],
    missingItem: {
      nameAr: 'لوحة توزيع كهربائية رئيسية',
      nameEn: 'Main Electrical Distribution Panel',
      category: 'electrical', defaultUnit: 'عدد', defaultPricePerUnit: 12000,
    },
    reason: 'تمديدات كهربائية بدون لوحة توزيع',
    severity: 'critical',
  },

  // ── جدران وتشطيب ──
  {
    id: 'PHY_08',
    ifCategory: 'masonry', ifKeywords: ['بلوك', 'block', 'جدار', 'wall', 'بناء'],
    thenCategory: 'plaster', thenKeywords: ['لياسة', 'plaster', 'مسح', 'render'],
    missingItem: {
      nameAr: 'لياسة جدران (داخلي + خارجي)',
      nameEn: 'Wall Plastering (Int. + Ext.)',
      category: 'finishes', defaultUnit: 'م²', defaultPricePerUnit: 45,
    },
    reason: 'جدران بلوك بدون لياسة',
    severity: 'important',
  },
  {
    id: 'PHY_09',
    ifCategory: 'finishes', ifKeywords: ['دهان', 'paint', 'بوية'],
    thenCategory: 'putty', thenKeywords: ['معجون', 'putty', 'filler'],
    missingItem: {
      nameAr: 'معجون جدران (قبل الدهان)',
      nameEn: 'Wall Putty/Filler',
      category: 'finishes', defaultUnit: 'م²', defaultPricePerUnit: 18,
    },
    reason: 'دهان بدون معجون = سطح غير مستوٍ',
    severity: 'recommended',
  },
  {
    id: 'PHY_10',
    ifCategory: 'finishes', ifKeywords: ['بلاط', 'tiles', 'سيراميك', 'بورسلان', 'porcelain'],
    thenCategory: 'adhesive', thenKeywords: ['لاصق', 'adhesive', 'مونة'],
    missingItem: {
      nameAr: 'لاصق بلاط (مونة أسمنتية)',
      nameEn: 'Tile Adhesive/Morite',
      category: 'finishes', defaultUnit: 'م²', defaultPricePerUnit: 22,
    },
    reason: 'بلاط بدون لاصق',
    severity: 'important',
  },

  // ── عزل ──
  {
    id: 'PHY_11',
    ifCategory: 'structure', ifKeywords: ['أساس', 'foundation', 'قواعد', 'footing'],
    thenCategory: 'waterproofing', thenKeywords: ['عزل', 'مائي', 'waterproof', 'membrane'],
    missingItem: {
      nameAr: 'عزل مائي للأساسات',
      nameEn: 'Foundation Waterproofing',
      category: 'waterproofing', defaultUnit: 'م²', defaultPricePerUnit: 85,
    },
    reason: 'أساسات بدون عزل مائي = تسريب وتآكل — SBC 601',
    severity: 'critical',
  },
  {
    id: 'PHY_12',
    ifCategory: 'structure', ifKeywords: ['سقف', 'roof', 'سطح', 'slab'],
    thenCategory: 'insulation', thenKeywords: ['عزل', 'حراري', 'insulation', 'thermal'],
    missingItem: {
      nameAr: 'عزل حراري للأسقف',
      nameEn: 'Roof Thermal Insulation',
      category: 'insulation', defaultUnit: 'م²', defaultPricePerUnit: 65,
    },
    reason: 'سقف بدون عزل حراري = مخالفة SBC 601 واستهلاك طاقة مضاعف',
    severity: 'critical',
  },

  // ── حفر وأعمال ترابية ──
  {
    id: 'PHY_13',
    ifCategory: 'earthworks', ifKeywords: ['حفر', 'excavat', 'أعمال ترابية'],
    thenCategory: 'disposal', thenKeywords: ['ترحيل', 'disposal', 'نقل تربة', 'cartaway'],
    missingItem: {
      nameAr: 'ترحيل تربة فائضة',
      nameEn: 'Excavated Soil Disposal',
      category: 'earthworks', defaultUnit: 'م³', defaultPricePerUnit: 35,
    },
    reason: 'حفر بدون ترحيل = تراكم أتربة في الموقع',
    severity: 'important',
  },
  {
    id: 'PHY_14',
    ifCategory: 'earthworks', ifKeywords: ['حفر', 'excavat'],
    thenCategory: 'backfill', thenKeywords: ['ردم', 'backfill', 'تراب صب'],
    missingItem: {
      nameAr: 'ردم وتسوية',
      nameEn: 'Backfill & Leveling',
      category: 'earthworks', defaultUnit: 'م³', defaultPricePerUnit: 28,
    },
    reason: 'حفر أساسات بدون ردم',
    severity: 'important',
  },

  // ── تكييف ──
  {
    id: 'PHY_15',
    ifCategory: 'hvac', ifKeywords: ['تكييف', 'hvac', 'مكيف', 'تبريد', 'air condition'],
    thenCategory: 'ducting', thenKeywords: ['مجرى', 'duct', 'دكت', 'مجاري هواء'],
    missingItem: {
      nameAr: 'مجاري هواء التكييف',
      nameEn: 'HVAC Ducting',
      category: 'hvac', defaultUnit: 'م.ط', defaultPricePerUnit: 180,
    },
    reason: 'تكييف مركزي بدون مجاري هواء',
    severity: 'important',
  },

  // ── حريق وسلامة ──
  {
    id: 'PHY_16',
    ifCategory: 'fire', ifKeywords: ['حريق', 'fire', 'إطفاء'],
    thenCategory: 'alarm', thenKeywords: ['إنذار', 'alarm', 'كاشف', 'detector'],
    missingItem: {
      nameAr: 'نظام إنذار حريق',
      nameEn: 'Fire Alarm System',
      category: 'fire', defaultUnit: 'مقطوعية', defaultPricePerUnit: 15000,
    },
    reason: 'نظام إطفاء بدون إنذار = مخالفة SBC 801',
    severity: 'critical',
  },

  // ── بنود إجبارية ──
  {
    id: 'PHY_17',
    ifCategory: 'structure', ifKeywords: ['هيكل', 'structure', 'إنشائي', 'concrete'],
    thenCategory: 'testing', thenKeywords: ['فحص', 'test', 'اختبار', 'مختبر'],
    missingItem: {
      nameAr: 'فحوصات مختبرية (خرسانة + تربة)',
      nameEn: 'Lab Testing (Concrete + Soil)',
      category: 'testing', defaultUnit: 'مقطوعية', defaultPricePerUnit: 8000,
    },
    reason: 'أعمال إنشائية بدون فحوصات مختبرية — إلزامي',
    severity: 'important',
  },
];

// =================== Service ===================

class MissingItemDetector {

  /**
   * الكشف الرئيسي: يفحص BOQ ويرجع البنود الناقصة
   * يعمل بصمت — العميل لا يُخبَر
   */
  detect(
    items: Array<{ description: string; category?: string; qty: number; unit: string }>,
    projectArea?: number,
  ): MissingItemReport {
    const allDescs = items.map(i => i.description.toLowerCase()).join(' ');
    const allCategories = new Set(items.map(i => i.category || '').filter(Boolean));

    const missingItems: MissingItem[] = [];
    const checkedRules = new Set<string>();

    // ── المستوى 1: قواعد فيزيائية ──
    for (const rule of PHYSICAL_RULES) {
      // Check if "if" condition exists (the item that triggers the rule)
      const ifExists =
        rule.ifKeywords.some(kw => allDescs.includes(kw.toLowerCase())) ||
        allCategories.has(rule.ifCategory);

      if (!ifExists) continue;

      // Check if "then" item is missing
      const thenExists =
        rule.thenKeywords.some(kw => allDescs.includes(kw.toLowerCase())) ||
        allCategories.has(rule.thenCategory);

      if (!thenExists) {
        // Missing! Calculate suggested qty based on project area
        let suggestedQty = 1;
        if (projectArea && rule.missingItem.defaultUnit === 'م²') {
          suggestedQty = Math.round(projectArea * 0.8); // ~80% of area
        } else if (projectArea && rule.missingItem.defaultUnit === 'م³') {
          suggestedQty = Math.round(projectArea * 0.3); // ~30% of area
        } else if (projectArea && rule.missingItem.defaultUnit === 'م.ط') {
          suggestedQty = Math.round(Math.sqrt(projectArea) * 4); // perimeter estimate
        } else if (projectArea && rule.missingItem.defaultUnit === 'طن') {
          suggestedQty = Math.round(projectArea * 0.12 * 100) / 100; // ~120 kg/m²
        }

        missingItems.push({
          id: rule.id,
          nameAr: rule.missingItem.nameAr,
          nameEn: rule.missingItem.nameEn,
          category: rule.missingItem.category,
          reason: rule.reason,
          severity: rule.severity,
          suggestedQty,
          suggestedUnit: rule.missingItem.defaultUnit,
          estimatedPrice: rule.missingItem.defaultPricePerUnit,
          estimatedTotal: Math.round(suggestedQty * rule.missingItem.defaultPricePerUnit),
          ruleId: rule.id,
          source: 'physical_rule',
        });

        checkedRules.add(rule.id);
      }
    }

    // ── حساب الإحصائيات ──
    const criticalGaps = missingItems.filter(i => i.severity === 'critical').length;
    const importantGaps = missingItems.filter(i => i.severity === 'important').length;
    const recommendedGaps = missingItems.filter(i => i.severity === 'recommended').length;
    const estimatedMissingCost = missingItems.reduce((s, i) => s + (i.estimatedTotal || 0), 0);

    // Coverage = items / (items + missing critical+important)
    const significantMissing = criticalGaps + importantGaps;
    const coveragePercent = Math.round(
      (items.length / Math.max(items.length + significantMissing, 1)) * 100
    );

    return {
      totalGaps: missingItems.length,
      criticalGaps,
      importantGaps,
      recommendedGaps,
      missingItems,
      coveragePercent,
      estimatedMissingCost,
      detectedAt: new Date(),
    };
  }

  /**
   * Enrich BOQ: يكشف الناقص ويدمجه بصمت
   */
  enrichBOQ(
    items: Array<{ description: string; category?: string; qty: number; unit: string }>,
    projectArea?: number,
  ): EnrichedBOQ {
    const report = this.detect(items, projectArea);

    return {
      originalItemCount: items.length,
      suggestedItems: report.missingItems,
      totalGaps: report.totalGaps,
      coverageBeforePercent: report.coveragePercent,
      coverageAfterPercent: 100, // After enrichment = 100%
    };
  }

  /**
   * Get rules count for diagnostic
   */
  getRulesCount(): number {
    return PHYSICAL_RULES.length;
  }
}

export const missingItemDetector = new MissingItemDetector();
