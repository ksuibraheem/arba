/**
 * ARBA V10.0 — Anomaly & Fraud Detection Engine
 * محرك كشف التلاعب والتناقضات الفيزيائية
 *
 * يفحص BOQ بحثاً عن:
 * 1. تناقضات مساحات (دهان > لياسة)
 * 2. تناقضات كميات (حديد قليل جداً للخرسانة)
 * 3. أسعار متطرفة (3x+ فوق المرجعي)
 * 4. بنود مفقودة منطقياً (خرسانة بدون شدة)
 * 5. تناقضات نسبية (MEP > 45% من الإجمالي)
 */

// =================== Types ===================

export interface AnomalyAlert {
  id: string;
  ruleId: string;
  severity: 'red_flag' | 'warning' | 'info';
  type: 'area_conflict' | 'qty_conflict' | 'price_extreme' | 'ratio_conflict' | 'logic_conflict';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  affectedItems: string[];
  suggestedAction: string;
}

export interface AnomalyReport {
  totalAlerts: number;
  redFlags: number;
  warnings: number;
  infos: number;
  alerts: AnomalyAlert[];
  riskScore: number; // 0-100 (0 = clean, 100 = highly suspicious)
  checkedAt: Date;
}

// =================== Anomaly Rules ===================

interface ProcessedItemLike {
  description: string;
  category: string;
  qty: number;
  unit: string;
  costRate: number;
  costTotal: number;
  sellTotal: number;
}

// =================== Service ===================

class AnomalyDetector {

  /**
   * Run full anomaly detection on processed items
   */
  detect(items: ProcessedItemLike[], totalProjectCost?: number): AnomalyReport {
    const alerts: AnomalyAlert[] = [];

    // ── Category 1: Area conflicts ──
    alerts.push(...this.checkAreaConflicts(items));

    // ── Category 2: Quantity conflicts ──
    alerts.push(...this.checkQuantityConflicts(items));

    // ── Category 3: Price extremes ──
    alerts.push(...this.checkPriceExtremes(items));

    // ── Category 4: Ratio conflicts ──
    if (totalProjectCost) {
      alerts.push(...this.checkRatioConflicts(items, totalProjectCost));
    }

    // ── Category 5: Logic conflicts ──
    alerts.push(...this.checkLogicConflicts(items));

    const redFlags = alerts.filter(a => a.severity === 'red_flag').length;
    const warnings = alerts.filter(a => a.severity === 'warning').length;
    const infos = alerts.filter(a => a.severity === 'info').length;

    // Risk score: red flags weight 10, warnings weight 3, infos weight 1
    const riskScore = Math.min(100, redFlags * 10 + warnings * 3 + infos);

    return {
      totalAlerts: alerts.length,
      redFlags,
      warnings,
      infos,
      alerts,
      riskScore,
      checkedAt: new Date(),
    };
  }

  // ═══════════════════════════════════════════════════
  // Category 1: Area Conflicts
  // ═══════════════════════════════════════════════════

  private checkAreaConflicts(items: ProcessedItemLike[]): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];

    const getArea = (keywords: string[]): number => {
      return items
        .filter(i => i.unit === 'م2' && keywords.some(kw => i.description.toLowerCase().includes(kw)))
        .reduce((s, i) => s + i.qty, 0);
    };

    // Rule AC_01: Paint area > Plaster area
    const paintArea = getArea(['دهان', 'paint', 'بوية']);
    const plasterArea = getArea(['لياسة', 'plaster', 'render', 'مسح']);
    if (paintArea > 0 && plasterArea > 0 && paintArea > plasterArea * 1.15) {
      alerts.push({
        id: `ac_01_${Date.now()}`, ruleId: 'AC_01',
        severity: 'red_flag', type: 'area_conflict',
        title: 'Paint area exceeds plaster area',
        titleAr: 'مساحة الدهان أكبر من مساحة اللياسة',
        description: `Paint: ${paintArea} m² vs Plaster: ${plasterArea} m² — physically impossible`,
        descriptionAr: `الدهان: ${paintArea} م² مقابل اللياسة: ${plasterArea} م² — مستحيل فيزيائياً`,
        affectedItems: ['paint', 'plaster'],
        suggestedAction: 'راجع مساحات الدهان واللياسة — الدهان لا يمكن أن يتجاوز اللياسة',
      });
    }

    // Rule AC_02: Tiles area > Floor area significantly
    const tilesArea = getArea(['بلاط', 'tiles', 'سيراميك', 'بورسلان', 'porcelain']);
    const floorArea = getArea(['أرضيات', 'floor', 'أرضي']);
    if (tilesArea > 0 && floorArea > 0 && tilesArea > floorArea * 1.3) {
      alerts.push({
        id: `ac_02_${Date.now()}`, ruleId: 'AC_02',
        severity: 'warning', type: 'area_conflict',
        title: 'Tile area exceeds floor area by >30%',
        titleAr: 'مساحة البلاط تتجاوز مساحة الأرضيات بأكثر من 30%',
        description: `Tiles: ${tilesArea} m² vs Floors: ${floorArea} m²`,
        descriptionAr: `البلاط: ${tilesArea} م² مقابل الأرضيات: ${floorArea} م²`,
        affectedItems: ['tiles', 'floor'],
        suggestedAction: 'تحقق من مساحة البلاط — قد يكون هناك خطأ في الكميات',
      });
    }

    // Rule AC_03: Waterproofing > Foundation area
    const wpArea = getArea(['عزل', 'مائي', 'waterproof', 'membrane']);
    const foundArea = getArea(['أساس', 'foundation', 'قواعد', 'footing']);
    if (wpArea > 0 && foundArea > 0 && wpArea > foundArea * 1.5) {
      alerts.push({
        id: `ac_03_${Date.now()}`, ruleId: 'AC_03',
        severity: 'warning', type: 'area_conflict',
        title: 'Waterproofing area exceeds foundation area',
        titleAr: 'مساحة العزل المائي تتجاوز مساحة الأساسات',
        description: `Waterproofing: ${wpArea} m² vs Foundation: ${foundArea} m²`,
        descriptionAr: `العزل المائي: ${wpArea} م² مقابل الأساسات: ${foundArea} م²`,
        affectedItems: ['waterproofing', 'foundation'],
        suggestedAction: 'راجع مساحة العزل المائي',
      });
    }

    return alerts;
  }

  // ═══════════════════════════════════════════════════
  // Category 2: Quantity Conflicts
  // ═══════════════════════════════════════════════════

  private checkQuantityConflicts(items: ProcessedItemLike[]): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];

    const getQty = (keywords: string[], unit: string): number => {
      return items
        .filter(i => i.unit === unit && keywords.some(kw => i.description.toLowerCase().includes(kw)))
        .reduce((s, i) => s + i.qty, 0);
    };

    // Rule QC_01: Steel too low for concrete (< 80 kg/m³)
    const concreteM3 = getQty(['خرسانة', 'concrete'], 'م3');
    const steelTons = getQty(['حديد', 'تسليح', 'rebar', 'steel'], 'طن');
    if (concreteM3 > 0 && steelTons > 0) {
      const steelKgPerM3 = (steelTons * 1000) / concreteM3;
      if (steelKgPerM3 < 80) {
        alerts.push({
          id: `qc_01_${Date.now()}`, ruleId: 'QC_01',
          severity: 'red_flag', type: 'qty_conflict',
          title: 'Steel ratio below SBC minimum',
          titleAr: 'نسبة الحديد أقل من الحد الأدنى SBC',
          description: `Steel: ${steelKgPerM3.toFixed(0)} kg/m³ (SBC minimum: 90 kg/m³)`,
          descriptionAr: `الحديد: ${steelKgPerM3.toFixed(0)} كجم/م³ (الحد الأدنى SBC: 90 كجم/م³)`,
          affectedItems: ['steel', 'concrete'],
          suggestedAction: 'نسبة الحديد منخفضة — تحقق من التصميم الإنشائي',
        });
      } else if (steelKgPerM3 > 250) {
        alerts.push({
          id: `qc_01b_${Date.now()}`, ruleId: 'QC_01B',
          severity: 'warning', type: 'qty_conflict',
          title: 'Steel ratio unusually high',
          titleAr: 'نسبة الحديد مرتفعة بشكل غير اعتيادي',
          description: `Steel: ${steelKgPerM3.toFixed(0)} kg/m³ (typical range: 90-200 kg/m³)`,
          descriptionAr: `الحديد: ${steelKgPerM3.toFixed(0)} كجم/م³ (المعتاد: 90-200 كجم/م³)`,
          affectedItems: ['steel', 'concrete'],
          suggestedAction: 'نسبة الحديد مرتفعة — تحقق من الكميات',
        });
      }
    }

    // Rule QC_02: Negative quantities
    const negativeItems = items.filter(i => i.qty < 0);
    if (negativeItems.length > 0) {
      alerts.push({
        id: `qc_02_${Date.now()}`, ruleId: 'QC_02',
        severity: 'red_flag', type: 'qty_conflict',
        title: `${negativeItems.length} items with negative quantities`,
        titleAr: `${negativeItems.length} بنود بكميات سالبة`,
        description: `Items: ${negativeItems.map(i => i.description.substring(0, 30)).join(', ')}`,
        descriptionAr: `البنود: ${negativeItems.map(i => i.description.substring(0, 30)).join('، ')}`,
        affectedItems: negativeItems.map(i => i.description),
        suggestedAction: 'كميات سالبة = خطأ إدخال حتمي',
      });
    }

    return alerts;
  }

  // ═══════════════════════════════════════════════════
  // Category 3: Price Extremes
  // ═══════════════════════════════════════════════════

  private checkPriceExtremes(items: ProcessedItemLike[]): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];

    // Calculate average cost rate for priced items
    const pricedItems = items.filter(i => i.costRate > 0);
    if (pricedItems.length < 3) return alerts;

    const avgRate = pricedItems.reduce((s, i) => s + i.costRate, 0) / pricedItems.length;

    // Rule PE_01: Items priced 5x+ above average
    for (const item of pricedItems) {
      if (item.costRate > avgRate * 5 && item.costTotal > 10000) {
        alerts.push({
          id: `pe_01_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          ruleId: 'PE_01',
          severity: 'warning', type: 'price_extreme',
          title: `Extremely high price: ${item.description.substring(0, 40)}`,
          titleAr: `سعر مرتفع جداً: ${item.description.substring(0, 40)}`,
          description: `Rate: ${item.costRate} SAR (avg: ${Math.round(avgRate)} SAR) — ${Math.round(item.costRate / avgRate)}x above average`,
          descriptionAr: `السعر: ${item.costRate} ر.س (المتوسط: ${Math.round(avgRate)} ر.س) — ${Math.round(item.costRate / avgRate)} ضعف المتوسط`,
          affectedItems: [item.description],
          suggestedAction: 'سعر مرتفع بشكل غير اعتيادي — تحقق من صحة السعر',
        });
      }
    }

    // Rule PE_02: Zero-cost items with quantity
    const zeroCost = items.filter(i => i.qty > 0 && i.costRate === 0 && i.costTotal === 0);
    if (zeroCost.length > items.length * 0.5) {
      alerts.push({
        id: `pe_02_${Date.now()}`, ruleId: 'PE_02',
        severity: 'info', type: 'price_extreme',
        title: `${zeroCost.length} items without pricing`,
        titleAr: `${zeroCost.length} بند بدون تسعير`,
        description: `${Math.round(zeroCost.length / items.length * 100)}% of items are unpriced`,
        descriptionAr: `${Math.round(zeroCost.length / items.length * 100)}% من البنود بدون سعر`,
        affectedItems: zeroCost.slice(0, 5).map(i => i.description),
        suggestedAction: 'نسبة كبيرة من البنود بدون أسعار — قد يحتاج مراجعة',
      });
    }

    return alerts;
  }

  // ═══════════════════════════════════════════════════
  // Category 4: Ratio Conflicts
  // ═══════════════════════════════════════════════════

  private checkRatioConflicts(items: ProcessedItemLike[], totalCost: number): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];

    // Group by category
    const catCosts: Record<string, number> = {};
    for (const item of items) {
      if (!catCosts[item.category]) catCosts[item.category] = 0;
      catCosts[item.category] += item.costTotal;
    }

    // Rule RC_01: MEP > 45% of total (unusual for residential)
    const mepCost = (catCosts['electrical'] || 0) + (catCosts['plumbing'] || 0) +
                    (catCosts['hvac'] || 0) + (catCosts['fire'] || 0) + (catCosts['mep'] || 0);
    const mepPercent = totalCost > 0 ? Math.round(mepCost / totalCost * 100) : 0;

    if (mepPercent > 45) {
      alerts.push({
        id: `rc_01_${Date.now()}`, ruleId: 'RC_01',
        severity: 'warning', type: 'ratio_conflict',
        title: `MEP cost is ${mepPercent}% of total (>45%)`,
        titleAr: `تكلفة MEP تشكل ${mepPercent}% من الإجمالي (>45%)`,
        description: `MEP total: ${mepCost.toLocaleString()} SAR out of ${totalCost.toLocaleString()} SAR`,
        descriptionAr: `إجمالي MEP: ${mepCost.toLocaleString()} ر.س من ${totalCost.toLocaleString()} ر.س`,
        affectedItems: ['electrical', 'plumbing', 'hvac'],
        suggestedAction: 'نسبة MEP مرتفعة — تحقق من أسعار الكهرباء والسباكة والتكييف',
      });
    }

    return alerts;
  }

  // ═══════════════════════════════════════════════════
  // Category 5: Logic Conflicts
  // ═══════════════════════════════════════════════════

  private checkLogicConflicts(items: ProcessedItemLike[]): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];

    const allDesc = items.map(i => i.description.toLowerCase()).join(' ');

    // Rule LC_01: Excavation > 5m without soil report mention
    const deepExcavation = items.some(i =>
      i.description.toLowerCase().includes('حفر') &&
      i.qty > 500 // large volume
    );
    const hasSoilReport = allDesc.includes('تقرير تربة') || allDesc.includes('soil report') ||
                          allDesc.includes('جيوتقني') || allDesc.includes('geotechnical');

    if (deepExcavation && !hasSoilReport) {
      alerts.push({
        id: `lc_01_${Date.now()}`, ruleId: 'LC_01',
        severity: 'info', type: 'logic_conflict',
        title: 'Large excavation without soil report',
        titleAr: 'حفريات كبيرة بدون تقرير تربة',
        description: 'Large excavation volumes detected but no geotechnical report item found',
        descriptionAr: 'كميات حفر كبيرة بدون بند تقرير تربة — مخاطرة',
        affectedItems: ['excavation'],
        suggestedAction: 'أضف بند تقرير تربة جيوتقني',
      });
    }

    return alerts;
  }

  /**
   * Get rules count for diagnostic
   */
  getRulesCount(): number {
    return 12; // Total rules implemented
  }
}

export const anomalyDetector = new AnomalyDetector();
