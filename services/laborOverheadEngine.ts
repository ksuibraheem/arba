/**
 * ARBA V10.0 — Labor Overhead Engine
 * محرك التكاليف الناعمة — GOSI + نطاقات + تأمين + إسكان
 *
 * يحسب التكاليف غير المباشرة التي يتجاهلها كل المنافسين:
 * - GOSI 12%
 * - Nitaqat رسوم العمالة الوافدة
 * - تأمين طبي
 * - إسكان ونقل
 * - تجديد إقامات
 * - سلامة ومعدات وقاية
 */

// =================== Types ===================

export interface LaborOverheadResult {
  totalOverheadCost: number;
  overheadPercent: number;         // % من تكلفة المشروع
  breakdown: LaborCostBreakdown;
  laborEstimate: LaborEstimate;
  recommendations: string[];
  calculatedAt: Date;
}

export interface LaborEstimate {
  totalWorkers: number;
  durationMonths: number;
  workersByTrade: Record<string, number>;
  saudiWorkers: number;
  expatWorkers: number;
  saudizationPercent: number;
}

export interface LaborCostBreakdown {
  gosiCost: number;
  nitaqatFees: number;
  medicalInsurance: number;
  housingAllowance: number;
  transportAllowance: number;
  iqamaRenewal: number;
  ppeSafety: number;
  workPermits: number;
  endOfService: number;
  annualLeave: number;
  total: number;
}

// =================== Constants (2026 Saudi Arabia) ===================

/** GOSI contribution rates 2026 */
const GOSI = {
  employer_saudi: 0.12,      // 12% للسعودي
  employer_expat: 0.02,       // 2% للوافد (مخاطر مهنية فقط)
  employee_saudi: 0.10,       // 10% يتحمله الموظف (مرجع فقط)
};

/** Monthly costs per worker (SAR) */
const MONTHLY_COSTS = {
  medical_insurance_expat: 165,    // تأمين طبي وافد (متوسط CCHI)
  medical_insurance_saudi: 0,      // مجاني عبر التأمينات
  housing_allowance: 500,          // بدل سكن (عمال)
  transport_allowance: 300,        // بدل نقل
  ppe_safety: 200,                 // معدات وقاية شخصية
};

/** Annual costs per worker (SAR) */
const ANNUAL_COSTS = {
  iqama_renewal: 2400,             // تجديد إقامة
  work_permit: 100,                // رخصة عمل
  nitaqat_fee_expat: 400 * 12,     // 400 ر.س/شهر = 4,800 ر.س/سنة
  end_of_service_per_year: 0,      // يُحسب على الراتب
  annual_leave_days: 21,           // 21 يوم إجازة سنوية
};

/** Average monthly wages by trade (SAR) — Saudi labor market 2026 */
const AVERAGE_WAGES: Record<string, number> = {
  site_engineer: 12000,
  foreman: 6000,
  mason: 3500,
  carpenter: 3500,
  steelfixer: 3800,
  plumber: 4000,
  electrician: 4200,
  painter: 3200,
  tiler: 3500,
  hvac_tech: 4500,
  laborer: 2500,
  welder: 4000,
  driver: 3500,
  security: 3000,
};

/** Workers needed per 1000m² of built area by trade */
const LABOR_RATIOS: Record<string, Record<string, number>> = {
  residential_villa: {
    site_engineer: 0.5,    // 1 per 2000m²
    foreman: 1,
    mason: 3,
    carpenter: 2,
    steelfixer: 2,
    plumber: 1.5,
    electrician: 1.5,
    painter: 2,
    tiler: 1.5,
    laborer: 4,
    driver: 0.5,
  },
  residential_apartment: {
    site_engineer: 0.3,
    foreman: 0.8,
    mason: 2.5,
    carpenter: 1.5,
    steelfixer: 1.5,
    plumber: 1,
    electrician: 1,
    painter: 1.5,
    tiler: 1,
    laborer: 3,
    driver: 0.5,
  },
  commercial: {
    site_engineer: 0.4,
    foreman: 1,
    mason: 2,
    carpenter: 1,
    steelfixer: 2,
    plumber: 1,
    electrician: 2,
    hvac_tech: 1.5,
    painter: 1,
    laborer: 3,
    driver: 0.5,
  },
  school: {
    site_engineer: 0.4,
    foreman: 1,
    mason: 3,
    carpenter: 1.5,
    steelfixer: 2,
    plumber: 1.5,
    electrician: 2,
    hvac_tech: 1,
    painter: 2,
    tiler: 1.5,
    laborer: 3.5,
    driver: 0.5,
  },
};

/** Regional labor cost multipliers — V11.3 */
const REGIONAL_MULTIPLIERS: Record<string, { equipmentFactor: number; laborFactor: number; note: string }> = {
  riyadh:   { equipmentFactor: 1.15, laborFactor: 0.95, note: 'تربة صخرية — معدات حفر أغلى، عمالة أقل' },
  jeddah:   { equipmentFactor: 1.0,  laborFactor: 1.10, note: 'تربة سبخة — نزح مياه + عزل إضافي = عمالة أكثر' },
  dammam:   { equipmentFactor: 1.05, laborFactor: 1.05, note: 'تربة ملحية — حماية إضافية' },
  makkah:   { equipmentFactor: 1.10, laborFactor: 1.15, note: 'قيود لوجستية — تكلفة نقل أعلى' },
  madinah:  { equipmentFactor: 1.0,  laborFactor: 1.0,  note: 'تربة متوسطة — معيارية' },
  tabuk:    { equipmentFactor: 1.0,  laborFactor: 1.20, note: 'منطقة نائية — بدل سكن أعلى' },
  abha:     { equipmentFactor: 1.10, laborFactor: 1.10, note: 'جبلية — حفر صعب + نقل مكلف' },
  hail:     { equipmentFactor: 1.0,  laborFactor: 1.15, note: 'منطقة نائية' },
  jazan:    { equipmentFactor: 1.0,  laborFactor: 1.20, note: 'رطوبة عالية — حماية إضافية' },
  najran:   { equipmentFactor: 1.05, laborFactor: 1.15, note: 'حدودية — لوجستيات' },
  hafr_albatin: { equipmentFactor: 1.10, laborFactor: 1.20, note: 'منطقة حدودية نائية عسكرية — بدل سكن أعلى + تصاريح أمنية' },
};

const SOIL_MULTIPLIERS: Record<string, { equipmentFactor: number; laborFactor: number }> = {
  normal:     { equipmentFactor: 1.0,  laborFactor: 1.0 },
  sandy:      { equipmentFactor: 0.90, laborFactor: 1.05 },
  clay:       { equipmentFactor: 1.05, laborFactor: 1.10 },
  rocky_soft: { equipmentFactor: 1.15, laborFactor: 0.95 },
  rocky_hard: { equipmentFactor: 1.30, laborFactor: 0.90 },
  marshy:     { equipmentFactor: 1.10, laborFactor: 1.25 },
};

// =================== Service ===================

class LaborOverheadEngine {

  /**
   * Calculate full labor overhead for a project
   * V11.3: يدعم السياق الإقليمي ونوع التربة
   */
  calculate(params: {
    projectType: string;
    areaM2: number;
    durationMonths: number;
    saudizationPercent?: number;
    projectCost?: number;
    location?: string;
    soilType?: string;
  }): LaborOverheadResult {
    const {
      projectType = 'residential_villa',
      areaM2,
      durationMonths,
      saudizationPercent = 20,
      projectCost = 0,
      location,
      soilType,
    } = params;

    // ── 1. Estimate workers ──
    const laborEstimate = this.estimateWorkers(projectType, areaM2, durationMonths, saudizationPercent);

    // ── 2. Calculate costs (with regional context) ──
    const breakdown = this.calculateBreakdown(laborEstimate, durationMonths, location, soilType);

    // ── 3. Calculate overhead percent ──
    const overheadPercent = projectCost > 0
      ? Math.round((breakdown.total / projectCost) * 100)
      : 0;

    // ── 4. Recommendations ──
    const recommendations = this.generateRecommendations(laborEstimate, breakdown, overheadPercent);

    return {
      totalOverheadCost: breakdown.total,
      overheadPercent,
      breakdown,
      laborEstimate,
      recommendations,
      calculatedAt: new Date(),
    };
  }

  private estimateWorkers(
    projectType: string,
    areaM2: number,
    durationMonths: number,
    saudizationPercent: number,
  ): LaborEstimate {
    const ratios = LABOR_RATIOS[projectType] || LABOR_RATIOS.residential_villa;
    const factor = areaM2 / 1000;

    const workersByTrade: Record<string, number> = {};
    let totalWorkers = 0;

    for (const [trade, ratio] of Object.entries(ratios)) {
      const count = Math.max(1, Math.round(ratio * factor));
      workersByTrade[trade] = count;
      totalWorkers += count;
    }

    const saudiWorkers = Math.round(totalWorkers * saudizationPercent / 100);
    const expatWorkers = totalWorkers - saudiWorkers;

    return {
      totalWorkers,
      durationMonths,
      workersByTrade,
      saudiWorkers,
      expatWorkers,
      saudizationPercent,
    };
  }

  private calculateBreakdown(labor: LaborEstimate, months: number, location?: string, soilType?: string): LaborCostBreakdown {
    // Total monthly wages
    let totalMonthlyWages = 0;
    for (const [trade, count] of Object.entries(labor.workersByTrade)) {
      totalMonthlyWages += (AVERAGE_WAGES[trade] || 3000) * count;
    }

    // GOSI
    const saudiWages = totalMonthlyWages * (labor.saudizationPercent / 100);
    const expatWages = totalMonthlyWages * (1 - labor.saudizationPercent / 100);
    const gosiCost = Math.round(
      (saudiWages * GOSI.employer_saudi + expatWages * GOSI.employer_expat) * months
    );

    // Nitaqat
    const nitaqatFees = Math.round(labor.expatWorkers * ANNUAL_COSTS.nitaqat_fee_expat * (months / 12));

    // Medical insurance
    const medicalInsurance = Math.round(
      labor.expatWorkers * MONTHLY_COSTS.medical_insurance_expat * months
    );

    // Housing & transport
    const housingAllowance = Math.round(labor.totalWorkers * MONTHLY_COSTS.housing_allowance * months);
    const transportAllowance = Math.round(labor.totalWorkers * MONTHLY_COSTS.transport_allowance * months);

    // Iqama
    const iqamaRenewal = Math.round(labor.expatWorkers * ANNUAL_COSTS.iqama_renewal * (months / 12));

    // PPE
    const ppeSafety = Math.round(labor.totalWorkers * MONTHLY_COSTS.ppe_safety * months);

    // Work permits
    const workPermits = Math.round(labor.expatWorkers * ANNUAL_COSTS.work_permit * (months / 12));

    // End of service
    const endOfService = Math.round(totalMonthlyWages * 0.5 * (months / 12)); // ~0.5 month per year

    // Annual leave provision
    const annualLeave = Math.round(
      (totalMonthlyWages / 30) * ANNUAL_COSTS.annual_leave_days * (months / 12)
    );

    let total = gosiCost + nitaqatFees + medicalInsurance + housingAllowance +
      transportAllowance + iqamaRenewal + ppeSafety + workPermits + endOfService + annualLeave;

    // V11.3: Apply regional & soil multipliers
    if (location) {
      const regionMult = REGIONAL_MULTIPLIERS[location.toLowerCase()];
      if (regionMult) {
        total = Math.round(total * ((regionMult.equipmentFactor + regionMult.laborFactor) / 2));
      }
    }
    if (soilType) {
      const soilMult = SOIL_MULTIPLIERS[soilType.toLowerCase()];
      if (soilMult) {
        total = Math.round(total * ((soilMult.equipmentFactor + soilMult.laborFactor) / 2));
      }
    }

    return {
      gosiCost,
      nitaqatFees,
      medicalInsurance,
      housingAllowance,
      transportAllowance,
      iqamaRenewal,
      ppeSafety,
      workPermits,
      endOfService,
      annualLeave,
      total,
    };
  }

  private generateRecommendations(
    labor: LaborEstimate,
    breakdown: LaborCostBreakdown,
    overheadPercent: number,
  ): string[] {
    const recs: string[] = [];

    if (overheadPercent > 25) {
      recs.push(`التكاليف الناعمة ${overheadPercent}% — مرتفعة. فكّر في تقليل مدة المشروع.`);
    }

    if (labor.saudizationPercent < 15) {
      recs.push(`نسبة السعودة ${labor.saudizationPercent}% — منخفضة. رسوم نطاقات ستكون مرتفعة.`);
    }

    if (breakdown.nitaqatFees > breakdown.gosiCost) {
      recs.push('رسوم نطاقات أعلى من GOSI — زيادة السعودة توفّر تكاليف.');
    }

    if (labor.totalWorkers > 50) {
      recs.push(`عدد العمالة ${labor.totalWorkers} — فكّر في المقاولة الباطنة لبعض الأعمال.`);
    }

    return recs;
  }

  /**
   * Quick estimate for UI (without detailed breakdown)
   */
  quickEstimate(areaM2: number, months: number): { overhead: number; percent: string } {
    // Rule of thumb: ~15-22% of direct costs
    const avgCostPerM2 = 2500; // SAR/m² average construction
    const directCost = areaM2 * avgCostPerM2;
    const result = this.calculate({
      projectType: 'residential_villa',
      areaM2,
      durationMonths: months,
      projectCost: directCost,
    });

    return {
      overhead: result.totalOverheadCost,
      percent: `${result.overheadPercent}%`,
    };
  }
}

export const laborOverheadEngine = new LaborOverheadEngine();
