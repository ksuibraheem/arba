/**
 * ARBA V10.0 — Regulatory Intelligence Engine
 * محرك الذكاء التنظيمي — يربط regulatoryConstants.ts (497 سطر) بالمعالج
 *
 * يستخدم الثوابت التنظيمية لـ:
 * 1. حساب تكاليف إضافية تنظيمية (حريق، إعاقة، مواقف)
 * 2. التحقق من الامتثال (اشتراطات المساحة والارتداد)
 * 3. إثراء BOQ بالبنود الإلزامية حسب نوع النشاط
 */

import {
  RESIDENTIAL_REQUIREMENTS,
  EDUCATIONAL_REQUIREMENTS,
  HEALTHCARE_REQUIREMENTS,
  FIRE_SAFETY_CONSTANTS,
  ACCESSIBILITY_CONSTANTS,
  getRegulatoryConstants,
} from './regulatoryConstants';

// =================== Types ===================

export interface RegulatoryAddons {
  additionalItems: RegulatoryItem[];
  totalAddonCost: number;
  complianceNotes: string[];
  applicableCode: string;
}

export interface RegulatoryItem {
  nameAr: string;
  nameEn: string;
  category: string;
  qty: number;
  unit: string;
  rate: number;
  total: number;
  source: string;  // SBC code reference
  mandatory: boolean;
}

// =================== Service ===================

class RegulatoryIntelligenceEngine {

  /**
   * Calculate regulatory add-ons based on project type
   * يحسب البنود التنظيمية الإضافية حسب نوع المشروع
   */
  calculateAddons(params: {
    projectType: string;
    areaM2: number;
    floors: number;
    region?: string;
    streetWidth?: number;
  }): RegulatoryAddons {
    const { projectType, areaM2, floors, streetWidth = 15 } = params;
    const items: RegulatoryItem[] = [];
    const notes: string[] = [];

    // ── 1. Fire Safety (كل المشاريع) ──
    items.push(...this.calculateFireSafety(areaM2, floors));
    notes.push('تم تطبيق اشتراطات السلامة من الحريق — SBC 801');

    // ── 2. Accessibility (المباني العامة) ──
    if (['commercial', 'educational', 'healthcare', 'office'].includes(projectType)) {
      items.push(...this.calculateAccessibility(areaM2, floors));
      notes.push('تم تطبيق اشتراطات ذوي الإعاقة — SBC 1001');
    }

    // ── 3. Parking (حسب نوع المشروع) ──
    items.push(...this.calculateParking(projectType, areaM2, floors));

    // ── 4. Project-specific requirements ──
    if (projectType === 'residential_villa' || projectType === 'villa') {
      this.applyResidential(items, notes, areaM2, floors, streetWidth);
    } else if (projectType === 'school' || projectType === 'educational') {
      this.applyEducational(items, notes, areaM2, floors);
    } else if (projectType === 'hospital' || projectType === 'healthcare') {
      this.applyHealthcare(items, notes, areaM2, floors);
    }

    const totalAddonCost = items.reduce((s, i) => s + i.total, 0);

    return {
      additionalItems: items,
      totalAddonCost,
      complianceNotes: notes,
      applicableCode: `SBC 2018 + ${projectType} regulations`,
    };
  }

  // ═══════════════════════════════════════════════════
  // Fire Safety — SBC 801
  // ═══════════════════════════════════════════════════

  private calculateFireSafety(areaM2: number, floors: number): RegulatoryItem[] {
    const items: RegulatoryItem[] = [];

    // Fire extinguishers (1 per 200m²)
    const extinguisherCount = Math.ceil(areaM2 / 200);
    items.push({
      nameAr: 'طفايات حريق',
      nameEn: 'Fire Extinguishers',
      category: 'fire', qty: extinguisherCount, unit: 'عدد',
      rate: 350, total: extinguisherCount * 350,
      source: 'SBC 801', mandatory: true,
    });

    // Smoke detectors (1 per 60m²)
    const detectorCount = Math.ceil(areaM2 / 60);
    items.push({
      nameAr: 'كواشف دخان',
      nameEn: 'Smoke Detectors',
      category: 'fire', qty: detectorCount, unit: 'عدد',
      rate: 120, total: detectorCount * 120,
      source: 'SBC 801', mandatory: true,
    });

    // Fire alarm panel (if > 300m²)
    if (areaM2 > 300) {
      items.push({
        nameAr: 'لوحة إنذار حريق مركزية',
        nameEn: 'Central Fire Alarm Panel',
        category: 'fire', qty: 1, unit: 'عدد',
        rate: 15000, total: 15000,
        source: 'SBC 801 §903', mandatory: true,
      });
    }

    // Sprinkler system (if > 500m² or > 3 floors)
    if (areaM2 > 500 || floors > 3) {
      const sprinklerHeads = Math.ceil(areaM2 / 12); // 1 per 12m²
      items.push({
        nameAr: 'نظام رشاشات إطفاء تلقائي',
        nameEn: 'Automatic Sprinkler System',
        category: 'fire', qty: sprinklerHeads, unit: 'رأس',
        rate: 180, total: sprinklerHeads * 180,
        source: 'SBC 801 §903.2', mandatory: true,
      });
    }

    // Emergency lighting
    const emergencyLights = Math.ceil(areaM2 / 100);
    items.push({
      nameAr: 'إضاءة طوارئ',
      nameEn: 'Emergency Lighting',
      category: 'fire', qty: emergencyLights, unit: 'عدد',
      rate: 250, total: emergencyLights * 250,
      source: 'SBC 801 §1008', mandatory: true,
    });

    // Exit signs
    const exitSigns = Math.max(2, Math.ceil(areaM2 / 200));
    items.push({
      nameAr: 'لافتات مخارج طوارئ',
      nameEn: 'Exit Signs',
      category: 'fire', qty: exitSigns, unit: 'عدد',
      rate: 200, total: exitSigns * 200,
      source: 'SBC 801 §1013', mandatory: true,
    });

    return items;
  }

  // ═══════════════════════════════════════════════════
  // Accessibility — SBC 1001
  // ═══════════════════════════════════════════════════

  private calculateAccessibility(areaM2: number, floors: number): RegulatoryItem[] {
    const items: RegulatoryItem[] = [];

    // Accessible ramp
    items.push({
      nameAr: 'منحدر ذوي إعاقة',
      nameEn: 'Wheelchair Ramp',
      category: 'accessibility', qty: 1, unit: 'عدد',
      rate: 8000, total: 8000,
      source: 'SBC 1001 §4.1', mandatory: true,
    });

    // Accessible bathroom
    items.push({
      nameAr: 'دورة مياه ذوي إعاقة',
      nameEn: 'Accessible Bathroom',
      category: 'accessibility', qty: 1, unit: 'عدد',
      rate: 12000, total: 12000,
      source: 'SBC 1001 §4.5', mandatory: true,
    });

    // Accessible elevator (if > 2 floors)
    if (floors > 2) {
      items.push({
        nameAr: 'مصعد مهيأ لذوي الإعاقة',
        nameEn: 'Accessible Elevator',
        category: 'accessibility', qty: 1, unit: 'عدد',
        rate: 120000, total: 120000,
        source: 'SBC 1001 §4.3', mandatory: true,
      });
    }

    // Accessible parking
    const accessibleSpots = Math.max(1, Math.ceil(areaM2 / 5000));
    items.push({
      nameAr: 'مواقف ذوي إعاقة',
      nameEn: 'Accessible Parking Spots',
      category: 'accessibility', qty: accessibleSpots, unit: 'موقف',
      rate: 3000, total: accessibleSpots * 3000,
      source: 'SBC 1001 §4.6', mandatory: true,
    });

    return items;
  }

  // ═══════════════════════════════════════════════════
  // Parking
  // ═══════════════════════════════════════════════════

  private calculateParking(projectType: string, areaM2: number, floors: number): RegulatoryItem[] {
    const items: RegulatoryItem[] = [];

    let parkingRatio = 0; // spots per m²
    switch (projectType) {
      case 'villa': case 'residential_villa':
        parkingRatio = 1 / 200; break; // 2 per villa ≈ 1 per 200m²
      case 'apartment': case 'residential_apartment':
        parkingRatio = 1 / 100; break; // 1.5 per unit
      case 'commercial': case 'office':
        parkingRatio = 1 / 25; break;  // 1 per 25m²
      case 'school': case 'educational':
        parkingRatio = 1 / 50; break;  // per classroom
      default:
        parkingRatio = 1 / 50;
    }

    const totalFloorArea = areaM2 * floors;
    const parkingSpots = Math.ceil(totalFloorArea * parkingRatio);

    if (parkingSpots > 0) {
      items.push({
        nameAr: `مواقف سيارات (${parkingSpots} موقف)`,
        nameEn: `Car Parking (${parkingSpots} spots)`,
        category: 'external', qty: parkingSpots, unit: 'موقف',
        rate: 5000, total: parkingSpots * 5000,
        source: 'SBC + Municipal', mandatory: true,
      });
    }

    return items;
  }

  // ═══════════════════════════════════════════════════
  // Project-Specific
  // ═══════════════════════════════════════════════════

  private applyResidential(items: RegulatoryItem[], notes: string[], areaM2: number, floors: number, streetWidth: number): void {
    // Check build ratio
    if (floors > RESIDENTIAL_REQUIREMENTS.maxFloors.villa) {
      notes.push(`⚠️ عدد الأدوار ${floors} يتجاوز الحد الأقصى للفلل (${RESIDENTIAL_REQUIREMENTS.maxFloors.villa})`);
    }

    // Fence
    items.push({
      nameAr: 'سور خارجي (حد أقصى 2.4م)',
      nameEn: 'Boundary Wall (max 2.4m)',
      category: 'external',
      qty: Math.round(Math.sqrt(areaM2) * 4), // perimeter estimate
      unit: 'م.ط',
      rate: 450, total: Math.round(Math.sqrt(areaM2) * 4) * 450,
      source: 'البلدية — ارتفاع السور', mandatory: false,
    });

    notes.push(`ارتداد أمامي: ${this.getSetback(streetWidth)}م حسب عرض الشارع ${streetWidth}م`);
  }

  private applyEducational(items: RegulatoryItem[], notes: string[], areaM2: number, floors: number): void {
    // School fence
    items.push({
      nameAr: 'سور مدرسة (حد أدنى 2.4م)',
      nameEn: 'School Fence (min 2.4m)',
      category: 'external',
      qty: Math.round(Math.sqrt(areaM2) * 4),
      unit: 'م.ط',
      rate: 550, total: Math.round(Math.sqrt(areaM2) * 4) * 550,
      source: 'اشتراطات المدارس الخاصة', mandatory: true,
    });

    // Courtyard cover (75% min)
    const courtyardArea = Math.round(areaM2 * 0.15); // ~15% of site
    items.push({
      nameAr: 'مظلات ساحات (75% تغطية)',
      nameEn: 'Courtyard Shade Structures (75%)',
      category: 'external',
      qty: Math.round(courtyardArea * 0.75),
      unit: 'م²',
      rate: 350, total: Math.round(courtyardArea * 0.75) * 350,
      source: 'اشتراطات المدارس §7', mandatory: true,
    });

    notes.push(`الحد الأدنى لعرض الشارع المواجه: ${EDUCATIONAL_REQUIREMENTS.minStreetWidth_m}م`);
  }

  private applyHealthcare(items: RegulatoryItem[], notes: string[], areaM2: number, floors: number): void {
    // Medical gas system
    if (areaM2 > 500) {
      items.push({
        nameAr: 'نظام غازات طبية',
        nameEn: 'Medical Gas System',
        category: 'mep', qty: 1, unit: 'مقطوعية',
        rate: 85000, total: 85000,
        source: 'اشتراطات المنشآت الصحية', mandatory: true,
      });
    }

    // Stretcher elevator
    if (floors > 1) {
      items.push({
        nameAr: 'مصعد نقالات',
        nameEn: 'Stretcher Elevator',
        category: 'mep', qty: 1, unit: 'عدد',
        rate: 250000, total: 250000,
        source: 'SBC + اشتراطات صحية', mandatory: true,
      });
    }

    notes.push(`تهوية غرف العمليات: ${HEALTHCARE_REQUIREMENTS.ventilation.operatingRoom_ACH} ACH`);
    notes.push(`عرض الممرات الرئيسية: ${HEALTHCARE_REQUIREMENTS.corridorWidth.main_m}م`);
  }

  // ═══════════════════════════════════════════════════
  // Utilities
  // ═══════════════════════════════════════════════════

  private getSetback(streetWidth: number): number {
    for (const rule of RESIDENTIAL_REQUIREMENTS.setbacks.front) {
      if (streetWidth <= rule.streetWidth_max) return rule.setback_m;
    }
    return 6; // default
  }

  /**
   * Get total regulatory items count
   */
  getRulesCount(): number {
    return 15; // Total regulatory addon rules
  }
}

export const regulatoryIntelligenceEngine = new RegulatoryIntelligenceEngine();
