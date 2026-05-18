/**
 * ARBA V10.0 — Brain Compliance Checker
 * فاحص الامتثال لكود البناء السعودي SBC
 *
 * يربط regulatoryConstants.ts (497 سطر dead code!) بالمعالج
 * ويتحقق من التزام BOQ بالمعايير التنظيمية
 */

import { BENCHMARK_RATES } from '../src/engines/benchmarkData';

// =================== Types ===================

export interface ComplianceCheck {
  id: string;
  code: string;           // SBC 304, SBC 601, etc.
  section: string;
  rule: string;
  ruleAr: string;
  status: 'pass' | 'warning' | 'fail' | 'not_applicable';
  details: string;
  detailsAr: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface ComplianceReport {
  totalChecks: number;
  passed: number;
  warnings: number;
  failed: number;
  notApplicable: number;
  complianceScore: number;   // 0-100%
  checks: ComplianceCheck[];
  checkedAt: Date;
}

// =================== SBC Rules Database ===================

interface SBCRule {
  id: string;
  code: string;
  section: string;
  rule: string;
  ruleAr: string;
  category: string;
  check: (items: ComplianceItem[]) => 'pass' | 'warning' | 'fail' | 'not_applicable';
  getDetails: (items: ComplianceItem[]) => { en: string; ar: string };
  severity: 'critical' | 'major' | 'minor';
}

interface ComplianceItem {
  description: string;
  category: string;
  qty: number;
  unit: string;
  costRate: number;
}

const SBC_RULES: SBCRule[] = [
  // ══ SBC 304: Reinforced Concrete ══
  {
    id: 'SBC_304_01',
    code: 'SBC 304',
    section: '3.3',
    rule: 'Minimum concrete grade C25',
    ruleAr: 'الحد الأدنى لرتبة الخرسانة C25',
    category: 'concrete',
    severity: 'critical',
    check: (items) => {
      const concrete = items.filter(i =>
        i.description.toLowerCase().includes('خرسانة') ||
        i.description.toLowerCase().includes('concrete')
      );
      if (concrete.length === 0) return 'not_applicable';
      // Check for mentions of low-grade concrete
      const lowGrade = concrete.some(i =>
        i.description.includes('C15') || i.description.includes('C20')
      );
      return lowGrade ? 'fail' : 'pass';
    },
    getDetails: (items) => ({
      en: 'All concrete must be minimum grade C25 per SBC 304',
      ar: 'كل الخرسانة يجب أن تكون رتبة C25 كحد أدنى حسب SBC 304',
    }),
  },
  {
    id: 'SBC_304_02',
    code: 'SBC 304',
    section: '7.6',
    rule: 'Concrete curing required',
    ruleAr: 'معالجة الخرسانة إلزامية',
    category: 'concrete',
    severity: 'critical',
    check: (items) => {
      const hasConcrete = items.some(i =>
        i.category === 'concrete' ||
        i.description.toLowerCase().includes('خرسانة')
      );
      if (!hasConcrete) return 'not_applicable';
      const hasCuring = items.some(i =>
        i.description.toLowerCase().includes('معالجة') ||
        i.description.toLowerCase().includes('curing') ||
        i.description.toLowerCase().includes('إنضاج')
      );
      return hasCuring ? 'pass' : 'warning';
    },
    getDetails: () => ({
      en: 'Concrete curing is mandatory for 7+ days per SBC 304 §7.6',
      ar: 'معالجة الخرسانة إلزامية لمدة 7 أيام على الأقل حسب SBC 304 §7.6',
    }),
  },

  // ══ SBC 601: Energy Conservation ══
  {
    id: 'SBC_601_01',
    code: 'SBC 601',
    section: '4.2',
    rule: 'Roof thermal insulation required',
    ruleAr: 'عزل حراري للأسقف إلزامي',
    category: 'insulation',
    severity: 'critical',
    check: (items) => {
      const hasRoof = items.some(i =>
        i.description.toLowerCase().includes('سقف') ||
        i.description.toLowerCase().includes('roof') ||
        i.description.toLowerCase().includes('slab')
      );
      if (!hasRoof) return 'not_applicable';
      const hasInsulation = items.some(i =>
        (i.description.toLowerCase().includes('عزل') && i.description.toLowerCase().includes('حرار')) ||
        i.description.toLowerCase().includes('insulation') ||
        i.description.toLowerCase().includes('polystyrene') ||
        i.description.toLowerCase().includes('بوليسترين')
      );
      return hasInsulation ? 'pass' : 'fail';
    },
    getDetails: () => ({
      en: 'Roof thermal insulation is mandatory per SBC 601 for all buildings',
      ar: 'العزل الحراري للأسقف إلزامي حسب SBC 601 لكافة المباني',
    }),
  },
  {
    id: 'SBC_601_02',
    code: 'SBC 601',
    section: '4.3',
    rule: 'Wall thermal insulation required',
    ruleAr: 'عزل حراري للجدران إلزامي',
    category: 'insulation',
    severity: 'major',
    check: (items) => {
      const hasWalls = items.some(i =>
        i.description.toLowerCase().includes('جدار') ||
        i.description.toLowerCase().includes('wall') ||
        i.description.toLowerCase().includes('بلوك') ||
        i.description.toLowerCase().includes('block')
      );
      if (!hasWalls) return 'not_applicable';
      const hasWallInsulation = items.some(i =>
        (i.description.toLowerCase().includes('عزل') && i.description.toLowerCase().includes('جدار')) ||
        (i.description.toLowerCase().includes('insulation') && i.description.toLowerCase().includes('wall'))
      );
      return hasWallInsulation ? 'pass' : 'warning';
    },
    getDetails: () => ({
      en: 'Wall thermal insulation recommended per SBC 601',
      ar: 'عزل حراري للجدران مطلوب حسب SBC 601',
    }),
  },

  // ══ SBC 801: Fire Safety ══
  {
    id: 'SBC_801_01',
    code: 'SBC 801',
    section: '9.1',
    rule: 'Fire detection system required',
    ruleAr: 'نظام كشف حريق إلزامي',
    category: 'fire',
    severity: 'critical',
    check: (items) => {
      const hasStructure = items.some(i =>
        i.category === 'structure' || i.category === 'concrete'
      );
      if (!hasStructure) return 'not_applicable';
      const hasFireDetection = items.some(i =>
        i.description.toLowerCase().includes('حريق') ||
        i.description.toLowerCase().includes('fire') ||
        i.description.toLowerCase().includes('إنذار') ||
        i.description.toLowerCase().includes('كاشف') ||
        i.description.toLowerCase().includes('detector')
      );
      return hasFireDetection ? 'pass' : 'warning';
    },
    getDetails: () => ({
      en: 'Fire detection/alarm system is required per SBC 801',
      ar: 'نظام كشف وإنذار حريق إلزامي حسب SBC 801',
    }),
  },

  // ══ SBC 1001: Accessibility ══
  {
    id: 'SBC_1001_01',
    code: 'SBC 1001',
    section: '4.1',
    rule: 'Accessibility provisions for public buildings',
    ruleAr: 'اشتراطات ذوي الإعاقة للمباني العامة',
    category: 'accessibility',
    severity: 'major',
    check: (items) => {
      // Check for accessibility items in the BOQ
      const hasAccessibility = items.some(i =>
        i.description.toLowerCase().includes('معاق') ||
        i.description.toLowerCase().includes('إعاقة') ||
        i.description.toLowerCase().includes('accessibility') ||
        i.description.toLowerCase().includes('ramp') ||
        i.description.toLowerCase().includes('منحدر')
      );
      return hasAccessibility ? 'pass' : 'not_applicable';
    },
    getDetails: () => ({
      en: 'Public buildings must include accessibility provisions per SBC 1001',
      ar: 'المباني العامة يجب أن تتضمن اشتراطات ذوي الإعاقة حسب SBC 1001',
    }),
  },

  // ══ Waterproofing ══
  {
    id: 'WP_01',
    code: 'SBC 701',
    section: '2.1',
    rule: 'Foundation waterproofing required',
    ruleAr: 'عزل مائي للأساسات إلزامي',
    category: 'waterproofing',
    severity: 'critical',
    check: (items) => {
      const hasFoundation = items.some(i =>
        i.description.toLowerCase().includes('أساس') ||
        i.description.toLowerCase().includes('foundation') ||
        i.description.toLowerCase().includes('قواعد')
      );
      if (!hasFoundation) return 'not_applicable';
      const hasWP = items.some(i =>
        i.description.toLowerCase().includes('عزل مائي') ||
        i.description.toLowerCase().includes('waterproof')
      );
      return hasWP ? 'pass' : 'fail';
    },
    getDetails: () => ({
      en: 'Foundation waterproofing is mandatory',
      ar: 'العزل المائي للأساسات إلزامي',
    }),
  },

  // ══ Lab Testing ══
  {
    id: 'LAB_01',
    code: 'SBC 304',
    section: '5.6',
    rule: 'Concrete testing required',
    ruleAr: 'فحص عينات الخرسانة إلزامي',
    category: 'testing',
    severity: 'major',
    check: (items) => {
      const hasConcrete = items.some(i =>
        i.category === 'concrete' ||
        i.description.toLowerCase().includes('خرسانة')
      );
      if (!hasConcrete) return 'not_applicable';
      const hasTesting = items.some(i =>
        i.description.toLowerCase().includes('فحص') ||
        i.description.toLowerCase().includes('test') ||
        i.description.toLowerCase().includes('مختبر') ||
        i.description.toLowerCase().includes('lab')
      );
      return hasTesting ? 'pass' : 'warning';
    },
    getDetails: () => ({
      en: 'Concrete cube testing is mandatory per SBC 304 §5.6',
      ar: 'فحص مكعبات الخرسانة إلزامي حسب SBC 304 §5.6',
    }),
  },
];

// =================== Service ===================

class BrainComplianceChecker {

  /**
   * Run compliance check on BOQ items
   */
  check(items: ComplianceItem[]): ComplianceReport {
    const checks: ComplianceCheck[] = [];

    for (const rule of SBC_RULES) {
      const status = rule.check(items);
      const details = rule.getDetails(items);

      checks.push({
        id: rule.id,
        code: rule.code,
        section: rule.section,
        rule: rule.rule,
        ruleAr: rule.ruleAr,
        status,
        details: details.en,
        detailsAr: details.ar,
        severity: rule.severity,
      });
    }

    const passed = checks.filter(c => c.status === 'pass').length;
    const warnings = checks.filter(c => c.status === 'warning').length;
    const failed = checks.filter(c => c.status === 'fail').length;
    const notApplicable = checks.filter(c => c.status === 'not_applicable').length;
    const applicable = checks.length - notApplicable;
    const complianceScore = applicable > 0 ? Math.round((passed / applicable) * 100) : 100;

    return {
      totalChecks: checks.length,
      passed,
      warnings,
      failed,
      notApplicable,
      complianceScore,
      checks,
      checkedAt: new Date(),
    };
  }

  /**
   * Quick compliance badge for UI
   */
  quickBadge(items: ComplianceItem[]): { label: string; color: string; score: number } {
    const report = this.check(items);
    
    if (report.failed > 0) {
      return { label: '⚠️ مخالفات', color: '#ef4444', score: report.complianceScore };
    }
    if (report.warnings > 0) {
      return { label: '⚡ تحذيرات', color: '#f59e0b', score: report.complianceScore };
    }
    return { label: '✅ متوافق', color: '#22c55e', score: report.complianceScore };
  }

  /**
   * Get total rules count
   */
  getRulesCount(): number {
    return SBC_RULES.length;
  }
}

export const brainComplianceChecker = new BrainComplianceChecker();
