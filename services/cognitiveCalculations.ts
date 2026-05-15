/**
 * ARBA-Ops v6.0 — Cognitive Calculations Engine
 * محرك الحسابات المعرفي — المحرك الداخلي الذكي
 *
 * هذا المحرك يحول المدخلات الهندسية (أبعاد، تربة، أساسات، تشطيبات)
 * إلى كميات تفصيلية دقيقة (BOQ) مبنية على كود البناء السعودي SBC 301/304
 * ومعايير السوق المحلي.
 *
 * يعمل 100% محلياً (Client-side) لتقليل التكلفة والتأخير.
 *
 * ⚠️ MIDDLEWARE: يُغذّي calculateProjectCosts() ببيانات enriched ولا يستبدله.
 */

import {
  BlueprintConfig,
  ExcavationConfig,
  FoundationConfig,
  FloorDetails,
  RoomFinishSchedule,
  FacadeSchedule,
  SoilType,
  SlabType,
  FoundationType,
  FinishMaterial,
  FacadeFinishType,
  Language,
  ShoringType,
  DewateringType,
  // v7.0 Exhaustive Schema
  ConcreteSpec,
  RebarSpec,
  TestingConfig,
  SafetyConfig,
  InsulationSpec,
  InsulationMaterialType,
  DPCConfig,
  DPCMaterial,
  FireProtectionConfig,
  SummerConcretingConfig,
  CementType,
} from '../types';
import { learningFeedbackService } from './learningFeedbackService';

// =================== SBC 301/304 Constants — كود البناء السعودي ===================

/** معامل انتفاش التربة (Swelling/Bulking Factor) — SBC Soil Mechanics */
export const SWELLING_FACTORS: Record<SoilType, number> = {
  normal: 1.15,        // تربة عادية: 15% انتفاش
  sandy: 1.20,         // تربة رملية: 20% انتفاش
  clay: 1.30,          // تربة طينية: 30% انتفاش
  rocky_soft: 1.40,    // صخر لين: 40% انتفاش
  rocky_hard: 1.50,    // صخر صلب: 50% انتفاش
  marshy: 1.25,        // تربة مستنقعية: 25% انتفاش
};

/** معامل الانكماش للدفان (Compaction Shrinkage) */
export const BACKFILL_COMPACTION_FACTOR = 1.15; // يجب توريد 15% أكثر

/** سعة القلاب القياسية (Truck Capacity - m³) */
export const TRUCK_CAPACITY_M3 = 16;

// =================== v8.0 Constants — بنود الحفر الحرجة ===================

/** تكلفة سند جوانب الحفر (ر.س / م.ط عمق) — SBC 303 */
export const SHORING_COST_PER_LM: Record<ShoringType, number> = {
  none: 0,
  timber: 120,              // ألواح خشبية — مؤقت
  steel_sheet: 350,         // ستائر حديدية (Sheet Piles)
  concrete_piles: 800,      // خوازيق خرسانية
  soldier_piles: 550,       // خوازيق حديد + ألواح خشب
};

/** تكلفة نزح المياه الجوفية (ر.س / يوم) — SBC 303 */
export const DEWATERING_COST_PER_DAY: Record<DewateringType, number> = {
  none: 0,
  surface_pumps: 500,       // مضخات سطحية (حالات بسيطة)
  wellpoint: 1500,          // آبار نقطية (WellPoint)
  deep_well: 3500,          // آبار عميقة (Deep Well)
};

/** مدة تقديرية للنزح بالأيام حسب حجم المشروع */
export const DEWATERING_DURATION_FACTOR = 0.08; // أيام لكل م² مساحة بناء

/** تكلفة تنظيف الموقع (ر.س / م²) */
export const SITE_CLEARANCE_COST_PER_M2 = 8;

/** تكلفة قشط الطبقة السطحية (ر.س / م³) */
export const TOPSOIL_STRIPPING_COST_PER_M3 = 18;

/** معامل تكلفة الحفر الصخري مقارنة بالعادي */
export const ROCK_EXCAVATION_MULTIPLIER = 2.5;

/** تكلفة الردم المستورد (ر.س / م³) شاملة النقل والفرد */
export const IMPORTED_FILL_COST_PER_M3 = 45;

/** نسبة التسليح (كجم حديد / متر مكعب خرسانة) حسب SBC 304 */
export const STEEL_RATIOS: Record<string, { min: number; max: number; default: number }> = {
  isolated_footings:  { min: 90,  max: 110, default: 100 },
  strip_footings:     { min: 100, max: 120, default: 110 },
  raft:               { min: 120, max: 140, default: 130 },
  piles:              { min: 130, max: 160, default: 145 },
  mat:                { min: 120, max: 140, default: 130 },
  combined:           { min: 100, max: 130, default: 115 },
  tie_beams:          { min: 100, max: 120, default: 110 },
  neck_columns:       { min: 150, max: 180, default: 165 },
  columns:            { min: 150, max: 200, default: 170 },
  slab_solid:         { min: 100, max: 120, default: 110 },
  slab_hordi:         { min: 110, max: 130, default: 120 },
  slab_flat:          { min: 130, max: 160, default: 145 },
  slab_waffle:        { min: 120, max: 150, default: 135 },
};

/** سماكة السقف الافتراضية (متر) حسب النوع */
export const DEFAULT_SLAB_THICKNESS: Record<SlabType, number> = {
  solid: 0.20,
  hordi: 0.27,
  flat:  0.25,
  waffle: 0.30,
};

/** استهلاك المياه (لتر) — تصحيح v7.0 بناءً على SBC 304 + ممارسة ميدانية سعودية */
export const WATER_CONSUMPTION = {
  concrete_curing_per_m3: 225,      // معالجة الخرسانة: 225 لتر/م³ خرسانة (7 أيام رش في مناخ حار)
  concrete_curing_per_m2: 28,       // [legacy] لتر/متر مربع سطح مكشوف (deprecated, kept for compat)
  blockwork_per_m2: 10,             // بلوك: 10 لتر/متر مربع
  plastering_per_m2: 15,            // لياسة: 15 لتر/متر مربع
  water_tanker_liters: 18000,       // سعة الوايت (لتر)
  water_tanker_cost_sar: 150,       // تكلفة الوايت (ريال)
};

/** مستهلكات الحديد — تحديث v7.0 SBC 304 */
export const STEEL_CONSUMABLES = {
  tie_wire_kg_per_ton: 10,          // سلك رباط: 10 كجم/طن حديد
  spacers_per_m2: 6,                // بسكوت خرساني: 6 حبات/متر مربع شدة — SBC 304
};

/** البلوك — مقاسات السوق السعودي */
export const BLOCK_CONSTANTS = {
  blocks_per_m2: 12.5,              // عدد البلوك لكل متر مربع
  external_block_size_cm: 20,       // بلوك خارجي 20 سم
  internal_block_size_cm: 15,       // بلوك داخلي 15 سم
  pallet_count: 100,                // عدد الحبات بالبليتة
  mortar_bags_per_m2: 0.35,         // أكياس أسمنت لكل متر مربع بناء بلوك
};

/** نسب الهدر (Waste Factors) — SBC Baseline */
const WASTE_FACTORS_BASELINE = {
  concrete: 0.05,        // 5%
  steel: 0.05,           // 5%
  blockwork: 0.07,       // 7%
  ceramic_tiles: 0.10,   // 10%
  marble: 0.08,          // 8%
  paint: 0.05,           // 5%
  plywood_formwork: 0.10, // 10%
  gypsum_board: 0.08,    // 8%
  waterproofing: 0.05,   // 5%
};

/**
 * v8.5: Dynamic Waste Factors — يتعلم من المشاريع السابقة
 * إذا وجد أوزان تعلم في learningFeedbackService، يستخدمها
 * وإلا يعود لنسب SBC الثابتة
 */
export const WASTE_FACTORS = (() => {
  try {
    // Use statically imported learningFeedbackService
    // Try to get learned weights (null if no data)
    // This will be populated when projects are closed and invoices are compared
    const learnedWeight = learningFeedbackService?.getLearnedWeight?.('commercial', 'riyadh');
    if (learnedWeight && learnedWeight.sampleCount >= 3) {
      const adj = learnedWeight.learnedWasteAdjustments;
      return {
        concrete:         (adj['concrete'] || 1) * WASTE_FACTORS_BASELINE.concrete,
        steel:            (adj['steel'] || 1) * WASTE_FACTORS_BASELINE.steel,
        blockwork:        (adj['blockwork'] || 1) * WASTE_FACTORS_BASELINE.blockwork,
        ceramic_tiles:    (adj['ceramic_tiles'] || 1) * WASTE_FACTORS_BASELINE.ceramic_tiles,
        marble:           (adj['marble'] || 1) * WASTE_FACTORS_BASELINE.marble,
        paint:            (adj['paint'] || 1) * WASTE_FACTORS_BASELINE.paint,
        plywood_formwork: (adj['plywood_formwork'] || 1) * WASTE_FACTORS_BASELINE.plywood_formwork,
        gypsum_board:     (adj['gypsum_board'] || 1) * WASTE_FACTORS_BASELINE.gypsum_board,
        waterproofing:    (adj['waterproofing'] || 1) * WASTE_FACTORS_BASELINE.waterproofing,
      };
    }
  } catch { /* Fall through to baseline */ }
  return { ...WASTE_FACTORS_BASELINE };
})();

/** أخشاب الشدة (Formwork) */
export const FORMWORK = {
  plywood_area_m2: 2.977,            // مساحة لوح بليوت واحد (1.22 × 2.44)
  reuse_cycles: 4,                    // عدد مرات الاستخدام
  plywood_per_m2_contact: 1 / 2.977,  // ألواح لكل متر مربع تلامس
  shuttering_oil_liters_per_m2: 0.03, // v7.0: زيت شدة — 30م²/لتر (سطح أملس)
};

/** الدهانات */
export const PAINT_CONSTANTS = {
  drum_liters: 18,                  // سعة البرميل (لتر)
  coverage_per_liter_m2: 9,         // تغطية اللتر (متر مربع) — وجه واحد
  coats_required: 3,                // عدد الأوجه المطلوبة
  primer_per_drum_m2: 60,           // البرايمر: برميل يغطي 60 متر
};

/** السيراميك — حساب الكراتين */
export const TILE_PACKAGES: Record<string, { tile_area_m2: number; per_carton: number; carton_area_m2: number }> = {
  ceramic_60x60:      { tile_area_m2: 0.36, per_carton: 4,  carton_area_m2: 1.44 },
  ceramic_30x60:      { tile_area_m2: 0.18, per_carton: 6,  carton_area_m2: 1.08 },
  porcelain_120x60:   { tile_area_m2: 0.72, per_carton: 2,  carton_area_m2: 1.44 },
};

/** مستهلكات السيراميك */
export const TILE_CONSUMABLES = {
  glue_bag_coverage_m2: 5,       // كيس غراء يفرد 5 متر مربع
  grout_kg_per_m2: 0.25,         // فوجة: 0.25 كجم لكل متر مربع
  spacers_bag_coverage_m2: 50,   // كيس صلايب لكل 50 متر
};

/** عزل الأساسات */
export const WATERPROOFING = {
  bitumen_drum_coverage_m2: 40,   // برميل بيتومين مخفف = 40 متر (وجهين)
  membrane_roll_m2: 10,           // لفة ميمبرين = 10 متر مربع
};

// =================== v7.0 Constants — SBC 601/303/801 ===================

/** v7.0: سقف الهوردي (Ribbed Slab) — بلوك + أضلاع */
export const HORDI_CONSTANTS = {
  blocks_per_m2: 5,                     // بلوك هوردي لكل م² (تباعد 500mm × طول 400mm)
  solid_area_deduction: 0.15,           // خصم 15% مناطق صلبة (عند الكمرات)
  waste_factor: 0.08,                   // هدر 8%
  rib_bottom_bars: 2,                   // 2Ø12 لكل ضلع
  rib_bottom_dia_mm: 12,
  rib_stirrup_dia_mm: 8,
  rib_stirrup_spacing_cm: 20,
  block_price_SAR: 3.5,                 // سعر بلوكة هوردي واحدة
};

/** v7.0: أسعار العزل الحراري — SBC 601 */
export const INSULATION_PRICES: Record<InsulationMaterialType, number> = {
  eps: 25,                              // ر.س/م² — بولي ستايرين
  xps: 40,                              // ر.س/م² — بولي ستايرين مبثوق
  rockwool: 35,                         // ر.س/م² — صوف صخري
  polyurethane_spray: 55,               // ر.س/م² — بولي يوريثان رش
  none: 0,
};

/** v7.0: أسعار العزل المائي DPC — SBC 303 */
export const DPC_PRICES: Record<DPCMaterial, number> = {
  bitumen_sbs_3mm: 28,                  // ر.س/م²
  bitumen_sbs_4mm: 38,                  // ر.س/م²
  bitumen_sbs_5mm: 48,                  // ر.س/م²
  hdpe_sheet: 15,                       // ر.س/م²
};

/** v7.0: حماية حريق — SBC 801 / NFPA 72 */
export const FIRE_PROTECTION_PRICES = {
  smoke_detector_SAR: 120,              // كاشف دخان
  fire_extinguisher_SAR: 250,           // طفاية حريق
  fire_alarm_panel_SAR: 3500,           // لوحة إنذار
  sprinkler_head_SAR: 180,              // رأس رش
  sprinkler_pipe_per_m_SAR: 55,         // ماسورة رش/م.ط
};

/** v7.0: تكاليف اختبارات — SBC 304 + SBC 701 */
export const DEFAULT_TESTING_CONFIG: TestingConfig = {
  cubeTestFrequency_m3: 120,
  cubesPerSample: 3,
  cubeTestCost_SAR: 200,
  pressureTest_PSI: 50,
  pressureTestDuration_min: 15,
  pressureTestCost_SAR: 800,
  waterproofTestCost_SAR: 500,
  compactionTestCost_SAR: 300,
  geotechnicalReportCost_SAR: 5000,
  electricalTestCost_SAR: 700,
};

/** v7.0: تكاليف الصيف — SBC 304 hot weather */
export const DEFAULT_SUMMER_CONFIG: SummerConcretingConfig = {
  isEnabled: false,
  iceAdditiveCost_SAR_per_m3: 20,
  retarderCost_SAR_per_m3: 12,
  laborProductivityFactor: 0.80,
  noonWorkBanApplies: true,
};

/** v7.0: طول التراكب — ACI 318-19 Class B = 60Ø default */
export const DEFAULT_REBAR_SPEC: RebarSpec = {
  grade: 'G60',
  yieldStrength_MPa: 420,
  lapLengthMultiplier: 60,              // Class B safe default
  minCover_foundation_mm: 75,
  minCover_column_mm: 40,
  minCover_slab_mm: 25,
  minCover_beam_mm: 40,
  minCover_exposed_mm: 50,
};

// =================== v9.0 Price Intelligence Types ===================

/** موقع العمل — يحدد الحاجة للمعدات */
export type ElevationZone = 'underground' | 'ground' | 'elevated' | 'roof' | 'external';

/** نطاق البند — توريد أم تنفيذ */
export type ItemScope = 'supply_only' | 'supply_install' | 'labor_only' | 'turnkey';

/** مكوّن سعر واحد — لتفكيك الأسعار */
export interface PriceComponent {
  label: Record<Language, string>;
  unitCost: number;        // ريال/وحدة
  percentage: number;      // النسبة من الإجمالي
  type: 'material' | 'labor' | 'equipment' | 'consumable';
}

/** تعريف نطاق البند */
export interface ScopeTag {
  scope: ItemScope;
  includes: string[];      // ['خرسانة', 'حديد', 'شدة', 'صب']
  excludes: string[];      // ['معدات ثقيلة']
  label: Record<Language, string>;
}

/** معدة مطلوبة */
export interface EquipmentRequirement {
  name: Record<Language, string>;
  type: 'scaffolding' | 'crane' | 'manlift' | 'pump' | 'boom_truck' | 'forklift' | 'asphalt_paver';
  costPerUnit: number;     // ريال/م² أو ريال/م³
  reason: string;
}

// =================== Output Types — أنواع المخرجات ===================

/** بند كمية واحد ناتج من المحرك */
export interface CognitiveOutputItem {
  id: string;
  category: string;
  name: Record<Language, string>;
  unit: string;
  netQty: number;          // الكمية الهندسية الصافية
  wastePercent: number;    // نسبة الهدر
  grossQty: number;        // الكمية الإجمالية (صافي + هدر)
  procurementQty: number;  // كمية الشراء (ceil لأقرب وحدة تعبئة)
  notes?: string;          // ملاحظات (معامل الانتفاش، سبب الكمية)
  // === v9.0 Price Intelligence ===
  elevationZone?: ElevationZone;           // موقع العمل
  scopeTag?: ScopeTag;                      // نطاق البند (توريد/تنفيذ)
  priceBreakdown?: PriceComponent[];        // تفكيك السعر
  equipmentNeeded?: EquipmentRequirement[]; // المعدات المطلوبة
}

/** ملخص المخرجات الكاملة — v7.0 مع بنود SBC الإلزامية */
export interface CognitiveEngineOutput {
  // أعمال الموقع
  excavation: CognitiveOutputItem[];
  // أعمال الأساسات والهيكل
  substructure: CognitiveOutputItem[];
  // أعمال العظم (الأسقف والأعمدة)
  superstructure: CognitiveOutputItem[];
  // أعمال الجدران
  masonry: CognitiveOutputItem[];
  // المستهلكات المخفية
  consumables: CognitiveOutputItem[];
  // التشطيبات
  finishes: CognitiveOutputItem[];
  // الواجهات
  facades: CognitiveOutputItem[];
  // أبواب ونوافذ (نجارة معمارية وألمنيوم)
  doorsAndWindows: CognitiveOutputItem[];
  // === v7.0 بنود جديدة ===
  insulation: CognitiveOutputItem[];     // عزل حراري SBC 601
  waterproofing: CognitiveOutputItem[];  // عزل مائي DPC SBC 303
  fireProtection: CognitiveOutputItem[]; // حماية حريق SBC 801
  testing: CognitiveOutputItem[];        // اختبارات الجودة
  safety: CognitiveOutputItem[];         // سلامة الموقع
  summerAdditives: CognitiveOutputItem[];// إضافات الصيف SBC 304
  mep: CognitiveOutputItem[];            // MEP Atomic QS
  // === v8.0 بنود جديدة — سد الفجوات الإنشائية ===
  dropBeams: CognitiveOutputItem[];      // كمرات ساقطة G1
  stairs: CognitiveOutputItem[];         // درج مسلح G3
  externalWorks: CognitiveOutputItem[];  // أعمال خارجية G10
  // ملخص البيانات الرقمي
  summary: {
    totalConcreteM3: number;
    totalSteelTons: number;
    totalBlockCount: number;
    totalWaterLiters: number;
    totalTruckLoads: number;
    totalFormworkM2: number;
    totalPaintDrums: number;
    // v7.0 additions
    totalTestingCost: number;
    totalSafetyCost: number;
    totalInsulationM2: number;
    totalWaterproofingM2: number;
    totalFireProtectionCost: number;
    totalSummerExtraCost: number;
    lapLengthMultiplier: number;
    concreteGrade: string;
    // v8.0 additions
    totalDropBeamConcreteM3: number;
    totalStairsConcreteM3: number;
    totalFormworkPropsCount: number;
  };
}

// =================== The Cognitive Engine — المحرك المعرفي ===================

/**
 * المحرك الرئيسي: يأخذ BlueprintConfig + SoilType ويولد كميات تفصيلية كاملة
 */
export function runCognitiveEngine(
  blueprint: BlueprintConfig,
  soilType: SoilType,
): CognitiveEngineOutput {

  const excavationItems = calculateExcavation(blueprint, soilType);
  const substructureItems = calculateSubstructure(blueprint);
  const superstructureItems = calculateSuperstructure(blueprint);
  const masonryItems = calculateMasonry(blueprint);
  const consumableItems = calculateConsumables(blueprint, soilType);
  const finishItems = calculateFinishes(blueprint);
  const facadeItems = calculateFacades(blueprint);
  const doorsAndWindowsItems = calculateDoorsAndWindows(blueprint);

  // === v7.0 New Calculations ===
  const insulationItems = calculateInsulation(blueprint);
  const waterproofingItems = calculateWaterproofing(blueprint);
  const fireProtectionItems = calculateFireProtection(blueprint);
  const testingItems = calculateTesting(blueprint);
  const safetyItems = calculateSiteSafety(blueprint);
  const summerItems = calculateSummerAdditives(blueprint);
  const mepItems = calculateMEP(blueprint);

  // === v8.0 New Calculations — Round 1 ===
  const dropBeamItems = calculateDropBeams(blueprint);
  const stairsItems = calculateStairs(blueprint);
  const externalWorksItems = calculateExternalWorks(blueprint);

  // Summary aggregation
  const allItems = [
    ...excavationItems, ...substructureItems, ...superstructureItems,
    ...masonryItems, ...consumableItems, ...finishItems, ...facadeItems, ...doorsAndWindowsItems,
    ...insulationItems, ...waterproofingItems, ...fireProtectionItems,
    ...testingItems, ...safetyItems, ...summerItems, ...mepItems,
    ...dropBeamItems, ...stairsItems, ...externalWorksItems,
  ];

  const totalConcreteM3 = allItems
    .filter(i => i.unit === 'م3' && (i.category === 'substructure' || i.category === 'superstructure'))
    .reduce((s, i) => s + i.grossQty, 0);

  const totalSteelTons = allItems
    .filter(i => i.unit === 'طن')
    .reduce((s, i) => s + i.grossQty, 0);

  const totalBlockCount = allItems
    .filter(i => i.id.startsWith('masonry_block'))
    .reduce((s, i) => s + i.procurementQty, 0);

  const totalWaterLiters = allItems
    .filter(i => i.id.startsWith('water_') || i.id.startsWith('consumable_water'))
    .reduce((s, i) => s + i.grossQty, 0);

  const totalTruckLoads = allItems
    .filter(i => i.id === 'exc_cartaway')
    .reduce((s, i) => s + i.procurementQty, 0);

  const totalFormworkM2 = allItems
    .filter(i => i.id.startsWith('formwork_'))
    .reduce((s, i) => s + i.grossQty, 0);

  const totalPaintDrums = allItems
    .filter(i => i.id.startsWith('finish_paint'))
    .reduce((s, i) => s + i.procurementQty, 0);

  // v7.0 summary fields
  const totalTestingCost = testingItems.reduce((s, i) => s + i.grossQty, 0);
  const totalSafetyCost = safetyItems.reduce((s, i) => s + i.grossQty, 0);
  const totalInsulationM2 = insulationItems.reduce((s, i) => s + (i.unit === 'م2' ? i.grossQty : 0), 0);
  const totalWaterproofingM2 = waterproofingItems.reduce((s, i) => s + (i.unit === 'م2' ? i.grossQty : 0), 0);
  const totalFireProtectionCost = fireProtectionItems.reduce((s, i) => s + i.grossQty, 0);
  const totalSummerExtraCost = summerItems.reduce((s, i) => s + i.grossQty, 0);
  const lapMultiplier = blueprint.rebarSpec?.lapLengthMultiplier || DEFAULT_REBAR_SPEC.lapLengthMultiplier;
  const concreteGrade = `C${blueprint.concreteSpec?.fcRating || 30}`;

  // v8.0 summary fields
  const totalDropBeamConcreteM3 = dropBeamItems.filter(i => i.unit === 'م3').reduce((s, i) => s + i.grossQty, 0);
  const totalStairsConcreteM3 = stairsItems.filter(i => i.unit === 'م3').reduce((s, i) => s + i.grossQty, 0);
  const totalFormworkPropsCount = Math.ceil(totalFormworkM2 / 1.0); // 1 prop per m²

  return {
    excavation: enrichAllItems(excavationItems),
    substructure: enrichAllItems(substructureItems),
    superstructure: enrichAllItems(superstructureItems),
    masonry: enrichAllItems(masonryItems),
    consumables: enrichAllItems(consumableItems),
    finishes: enrichAllItems(finishItems),
    facades: enrichAllItems(facadeItems),
    doorsAndWindows: enrichAllItems(doorsAndWindowsItems),
    insulation: enrichAllItems(insulationItems),
    waterproofing: enrichAllItems(waterproofingItems),
    fireProtection: enrichAllItems(fireProtectionItems),
    testing: enrichAllItems(testingItems),
    safety: enrichAllItems(safetyItems),
    summerAdditives: enrichAllItems(summerItems),
    mep: enrichAllItems(mepItems),
    dropBeams: enrichAllItems(dropBeamItems),
    stairs: enrichAllItems(stairsItems),
    externalWorks: enrichAllItems(externalWorksItems),
    summary: {
      totalConcreteM3: round2(totalConcreteM3),
      totalSteelTons: round2(totalSteelTons),
      totalBlockCount: Math.ceil(totalBlockCount),
      totalWaterLiters: Math.ceil(totalWaterLiters),
      totalTruckLoads: Math.ceil(totalTruckLoads),
      totalFormworkM2: round2(totalFormworkM2),
      totalPaintDrums: Math.ceil(totalPaintDrums),
      totalTestingCost: round2(totalTestingCost),
      totalSafetyCost: round2(totalSafetyCost),
      totalInsulationM2: round2(totalInsulationM2),
      totalWaterproofingM2: round2(totalWaterproofingM2),
      totalFireProtectionCost: round2(totalFireProtectionCost),
      totalSummerExtraCost: round2(totalSummerExtraCost),
      lapLengthMultiplier: lapMultiplier,
      concreteGrade,
      totalDropBeamConcreteM3: round2(totalDropBeamConcreteM3),
      totalStairsConcreteM3: round2(totalStairsConcreteM3),
      totalFormworkPropsCount: Math.ceil(totalFormworkPropsCount),
    },
  };
}

// =================== Section Calculators ===================

function calculateExcavation(bp: BlueprintConfig, soilType: SoilType): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  const exc = bp.excavation;
  const groundFloor = bp.floors[0];
  if (!groundFloor || !exc) return items;

  // Buildable area (after setbacks)
  const buildableWidth = bp.plotWidth - (bp.setbackSide * 2);
  const buildableLength = bp.plotLength - bp.setbackFront - (bp.setbackRear || 2);
  const buildableArea = buildableWidth * buildableLength;
  const plotArea = bp.plotWidth * bp.plotLength;
  const perimeter = 2 * (buildableWidth + buildableLength);

  // ────────────────────────────────────────────────────────
  // بند 1: تنظيف الموقع وقشط الطبقة السطحية (Site Clearance)
  // ────────────────────────────────────────────────────────
  if (exc.siteClearanceRequired !== false) {
    items.push({
      id: 'exc_site_clearance',
      category: 'excavation',
      name: { ar: 'تنظيف الموقع وإزالة العوائق', en: 'Site Clearance & Grubbing', fr: 'Nettoyage du site', zh: '场地清理' },
      unit: 'م2',
      netQty: round2(plotArea),
      wastePercent: 0,
      grossQty: round2(plotArea),
      procurementQty: round2(plotArea),
      notes: `مساحة الأرض ${round2(plotArea)}م² — إزالة نباتات وأنقاض ومخلفات`,
    });

    const strippingDepth = exc.topsoilStrippingDepth || 0.15;
    const stripVolume = plotArea * strippingDepth;
    items.push({
      id: 'exc_topsoil_stripping',
      category: 'excavation',
      name: { ar: 'قشط الطبقة السطحية (تربة زراعية)', en: 'Topsoil Stripping', fr: 'Décapage terre végétale', zh: '表土剥离' },
      unit: 'م3',
      netQty: round2(stripVolume),
      wastePercent: 0,
      grossQty: round2(stripVolume),
      procurementQty: round2(stripVolume),
      notes: `${strippingDepth * 100}سم × ${round2(plotArea)}م² — SBC 303`,
    });
  }

  // ────────────────────────────────────────────────────────
  // بند 2: حفر ميكانيكي (تربة عادية) + حفر صخري
  // ────────────────────────────────────────────────────────
  const netExcVolume = buildableArea * exc.excavationDepth * 1.20;
  const rockPercent = (exc.rockExcavationPercent || 0) / 100;
  const normalExcVolume = netExcVolume * (1 - rockPercent);
  const rockExcVolume = netExcVolume * rockPercent;

  items.push({
    id: 'exc_digging',
    category: 'excavation',
    name: { ar: 'حفر ميكانيكي (تربة عادية)', en: 'Mechanical Excavation (Soil)', fr: 'Excavation Mécanique', zh: '机械挖掘' },
    unit: 'م3',
    netQty: round2(normalExcVolume),
    wastePercent: 0,
    grossQty: round2(normalExcVolume),
    procurementQty: round2(normalExcVolume),
    notes: `عمق ${exc.excavationDepth}م × ${round2(buildableArea)}م² × 1.20 أجنحة${
      rockPercent > 0 ? ` — ${Math.round((1 - rockPercent) * 100)}% تربة عادية` : ''}
    `.trim(),
  });

  // حفر صخري (بند مستقل بسعر مختلف)
  if (rockExcVolume > 0) {
    items.push({
      id: 'exc_rock_digging',
      category: 'excavation',
      name: { ar: 'حفر صخري (بريكر / دقاق)', en: 'Rock Excavation (Breaker)', fr: 'Excavation Roche', zh: '岩石挖掘' },
      unit: 'م3',
      netQty: round2(rockExcVolume),
      wastePercent: 0,
      grossQty: round2(rockExcVolume),
      procurementQty: round2(rockExcVolume),
      notes: `${exc.rockExcavationPercent}% حفر صخري — تكلفة ×${ROCK_EXCAVATION_MULTIPLIER} من الحفر العادي`,
    });
  }

  // ────────────────────────────────────────────────────────
  // بند 3: سند جوانب الحفر (Shoring)
  // ────────────────────────────────────────────────────────
  if (exc.shoringRequired && exc.shoringType && exc.shoringType !== 'none') {
    const shoringDepth = exc.shoringDepth || exc.excavationDepth;
    const shoringArea = perimeter * shoringDepth;
    const costPerLm = SHORING_COST_PER_LM[exc.shoringType];
    const shoringTypeNames: Record<ShoringType, string> = {
      none: '',
      timber: 'ألواح خشبية',
      steel_sheet: 'ستائر حديدية (Sheet Piles)',
      concrete_piles: 'خوازيق خرسانية',
      soldier_piles: 'خوازيق حديد + ألواح',
    };

    items.push({
      id: 'exc_shoring',
      category: 'excavation',
      name: { ar: `سند جوانب الحفر (${shoringTypeNames[exc.shoringType]})`, en: `Excavation Shoring (${exc.shoringType})`, fr: 'Blindage de fouille', zh: '基坑支护' },
      unit: 'م2',
      netQty: round2(shoringArea),
      wastePercent: 0,
      grossQty: round2(shoringArea),
      procurementQty: round2(shoringArea),
      notes: `محيط ${round2(perimeter)}م × عمق ${shoringDepth}م — SBC 303 — ${round2(costPerLm)} ر.س/م.ط`,
    });
  }

  // ────────────────────────────────────────────────────────
  // بند 4: نزح المياه الجوفية (Dewatering)
  // ────────────────────────────────────────────────────────
  if (exc.dewateringRequired && exc.dewateringType && exc.dewateringType !== 'none') {
    const dewateringDays = Math.max(14, Math.ceil(buildableArea * DEWATERING_DURATION_FACTOR));
    const costPerDay = DEWATERING_COST_PER_DAY[exc.dewateringType];
    const dewateringTypeNames: Record<DewateringType, string> = {
      none: '',
      surface_pumps: 'مضخات سطحية',
      wellpoint: 'آبار نقطية (WellPoint)',
      deep_well: 'آبار عميقة (Deep Well)',
    };

    items.push({
      id: 'exc_dewatering',
      category: 'excavation',
      name: { ar: `نزح مياه جوفية (${dewateringTypeNames[exc.dewateringType]})`, en: `Dewatering (${exc.dewateringType})`, fr: 'Rabattement de nappe', zh: '降水排水' },
      unit: 'يوم',
      netQty: dewateringDays,
      wastePercent: 0,
      grossQty: dewateringDays,
      procurementQty: dewateringDays,
      notes: `${dewateringDays} يوم تقديري × ${costPerDay} ر.س/يوم${
        exc.waterTableDepth ? ` — منسوب مياه: ${exc.waterTableDepth}م` : ''} — SBC 303`,
    });
  }

  // ────────────────────────────────────────────────────────
  // ترحيل مخلفات الحفر
  // ────────────────────────────────────────────────────────
  const swellingFactor = SWELLING_FACTORS[soilType];
  const cartawayVolume = netExcVolume * swellingFactor;
  const truckLoads = Math.ceil(cartawayVolume / TRUCK_CAPACITY_M3);

  items.push({
    id: 'exc_cartaway',
    category: 'excavation',
    name: { ar: 'ترحيل مخلفات حفر', en: 'Cart-away Spoil', fr: 'Évacuation déblais', zh: '废土运输' },
    unit: 'ردة قلاب',
    netQty: round2(cartawayVolume),
    wastePercent: (swellingFactor - 1) * 100,
    grossQty: round2(cartawayVolume),
    procurementQty: truckLoads,
    notes: `معامل انتفاش ${soilType}: ×${swellingFactor} → ${truckLoads} قلاب (${TRUCK_CAPACITY_M3}م³/قلاب)`,
  });

  // ────────────────────────────────────────────────────────
  // إحلال التربة (Soil Replacement)
  // ────────────────────────────────────────────────────────
  if (exc.soilReplacementNeeded && exc.soilReplacementThickness > 0) {
    const replacementVolume = buildableArea * exc.soilReplacementThickness;
    items.push({
      id: 'exc_soil_replacement',
      category: 'excavation',
      name: { ar: 'إحلال تربة (طبقة حصوية)', en: 'Soil Replacement (Gravel Base)', fr: 'Remplacement du sol', zh: '换填' },
      unit: 'م3',
      netQty: round2(replacementVolume),
      wastePercent: 5,
      grossQty: round2(replacementVolume * 1.05),
      procurementQty: round2(replacementVolume * 1.05),
      notes: `سماكة ${exc.soilReplacementThickness}م × مساحة ${round2(buildableArea)}م²`,
    });
  }

  // ────────────────────────────────────────────────────────
  // بند 5: ردم — بتربة الموقع + ردم مستورد
  // ────────────────────────────────────────────────────────
  const estFoundationVolume = buildableArea * 0.25; // rough estimate
  const backfillNet = Math.max(0, netExcVolume - estFoundationVolume);
  const importedPercent = (exc.importedFillRequired && exc.importedFillPercent) ? exc.importedFillPercent / 100 : 0;
  const siteBackfill = backfillNet * (1 - importedPercent);
  const importedBackfill = backfillNet * importedPercent;

  // ردم بتربة الموقع
  if (siteBackfill > 0) {
    const siteProcurement = siteBackfill * BACKFILL_COMPACTION_FACTOR;
    items.push({
      id: 'exc_backfill',
      category: 'excavation',
      name: { ar: 'ردم ودك بتربة الموقع', en: 'Backfill & Compaction (Site Soil)', fr: 'Remblai sol du site', zh: '场地土回填' },
      unit: 'م3',
      netQty: round2(siteBackfill),
      wastePercent: 15,
      grossQty: round2(siteProcurement),
      procurementQty: round2(siteProcurement),
      notes: `${importedPercent > 0 ? `${Math.round((1 - importedPercent) * 100)}% تربة موقع — ` : ''}معامل الانكماش ${BACKFILL_COMPACTION_FACTOR}`,
    });
  }

  // ردم مستورد من الخارج (بند مستقل بسعر أعلى)
  if (importedBackfill > 0) {
    const importedProcurement = importedBackfill * BACKFILL_COMPACTION_FACTOR;
    items.push({
      id: 'exc_imported_fill',
      category: 'excavation',
      name: { ar: 'ردم مستورد (توريد وفرد ودمك)', en: 'Imported Fill (Supply, Spread & Compact)', fr: 'Remblai importé', zh: '外购回填料' },
      unit: 'م3',
      netQty: round2(importedBackfill),
      wastePercent: 15,
      grossQty: round2(importedProcurement),
      procurementQty: round2(importedProcurement),
      notes: `${exc.importedFillPercent}% ردم مستورد — ${IMPORTED_FILL_COST_PER_M3} ر.س/م³ شاملة النقل والفرد`,
    });
  }

  return items;
}

function calculateSubstructure(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  const fdn = bp.foundation;
  const groundFloor = bp.floors[0];
  if (!groundFloor || !fdn) return items;

  const buildableArea = getBuildableArea(bp);
  const columnsCount = groundFloor.columnsCount || Math.ceil(buildableArea / 16);

  // ——— خرسانة النظافة (Lean Concrete / Blinding) ———
  const blindingVolume = buildableArea * 0.10; // 10cm blinding
  items.push(makeConcreteItem('sub_blinding', 'خرسانة نظافة', 'Lean Concrete (Blinding)', blindingVolume, 3));

  // ——— خرسانة القواعد (Footings/Raft) ———
  let footingConcreteVolume = 0;
  let footingSteelRatioKey = '';

  if (fdn.type === 'raft' || fdn.type === 'mat') {
    footingConcreteVolume = buildableArea * (fdn.raftThickness || 0.60);
    footingSteelRatioKey = 'raft';
  } else if (fdn.type === 'isolated_footings') {
    footingConcreteVolume = columnsCount * fdn.footingWidth * fdn.footingWidth * fdn.footingDepth;
    footingSteelRatioKey = 'isolated_footings';
  } else if (fdn.type === 'strip_footings') {
    const perimeterLength = groundFloor.perimeterWallLength || Math.sqrt(buildableArea) * 4;
    const internalLength = groundFloor.internalWallLength || perimeterLength * 0.5;
    footingConcreteVolume = (perimeterLength + internalLength) * fdn.footingWidth * fdn.footingDepth;
    footingSteelRatioKey = 'strip_footings';
  } else {
    footingConcreteVolume = buildableArea * 0.30; // fallback
    footingSteelRatioKey = fdn.type || 'isolated_footings';
  }

  items.push(makeConcreteItem('sub_footings', 'خرسانة قواعد', 'Foundation Concrete', footingConcreteVolume, 5));

  // ——— خرسانة الميدات (Tie Beams / Grade Beams) ———
  const perimeterLength = groundFloor.perimeterWallLength || Math.sqrt(buildableArea) * 4;
  const internalLength = groundFloor.internalWallLength || perimeterLength * 0.5;
  const tieBeamLength = perimeterLength + internalLength;
  const tieBeamVolume = tieBeamLength * (fdn.tieBeamWidth || 0.30) * (fdn.tieBeamDepth || 0.60);
  items.push(makeConcreteItem('sub_tiebeams', 'خرسانة ميدات', 'Tie Beams Concrete', tieBeamVolume, 5));

  // ——— خرسانة رقاب الأعمدة (Neck Columns) ———
  const neckVolume = columnsCount * 0.30 * 0.50 * (fdn.neckColumnHeight || 0.50);
  items.push(makeConcreteItem('sub_necks', 'خرسانة رقاب أعمدة', 'Neck Columns Concrete', neckVolume, 5));

  // ——— حديد التسليح للأساسات ———
  const totalSubConcrete = footingConcreteVolume + tieBeamVolume + neckVolume;
  // Weighted average steel ratio
  const footingSteel = footingConcreteVolume * (STEEL_RATIOS[footingSteelRatioKey]?.default || 110);
  const tieBeamSteel = tieBeamVolume * STEEL_RATIOS.tie_beams.default;
  const neckSteel = neckVolume * STEEL_RATIOS.neck_columns.default;
  const totalSubSteelKg = footingSteel + tieBeamSteel + neckSteel;
  const totalSubSteelTons = totalSubSteelKg / 1000;

  items.push({
    id: 'sub_steel',
    category: 'substructure',
    name: { ar: 'حديد تسليح أساسات', en: 'Foundation Rebar', fr: 'Armatures fondations', zh: '基础钢筋' },
    unit: 'طن',
    netQty: round2(totalSubSteelTons),
    wastePercent: WASTE_FACTORS.steel * 100,
    grossQty: round2(totalSubSteelTons * (1 + WASTE_FACTORS.steel)),
    procurementQty: round2(totalSubSteelTons * (1 + WASTE_FACTORS.steel)),
    notes: `قواعد: ${round2(footingSteel)}كجم | ميد: ${round2(tieBeamSteel)}كجم | رقاب: ${round2(neckSteel)}كجم`,
  });

  // ——— شدة خشبية (Formwork) ———
  const formworkArea = (footingConcreteVolume * 4) + (tieBeamLength * (fdn.tieBeamDepth || 0.60) * 2) + (neckVolume * 4);
  items.push({
    id: 'formwork_sub',
    category: 'substructure',
    name: { ar: 'شدة خشبية أساسات', en: 'Foundation Formwork', fr: 'Coffrage fondations', zh: '基础模板' },
    unit: 'م2',
    netQty: round2(formworkArea),
    wastePercent: WASTE_FACTORS.plywood_formwork * 100,
    grossQty: round2(formworkArea * (1 + WASTE_FACTORS.plywood_formwork)),
    procurementQty: Math.ceil((formworkArea * (1 + WASTE_FACTORS.plywood_formwork)) / FORMWORK.plywood_area_m2 / FORMWORK.reuse_cycles),
    notes: `ألواح بليوت (${FORMWORK.reuse_cycles} مرات استخدام)`,
  });

  // ——— عزل أساسات ———
  const waterproofArea = buildableArea + (tieBeamLength * (fdn.tieBeamDepth || 0.60));
  const bitumenDrums = Math.ceil(waterproofArea / WATERPROOFING.bitumen_drum_coverage_m2);
  items.push({
    id: 'sub_waterproof',
    category: 'substructure',
    name: { ar: 'عزل أساسات (بيتومين)', en: 'Foundation Waterproofing', fr: 'Imperméabilisation', zh: '基础防水' },
    unit: 'برميل',
    netQty: round2(waterproofArea),
    wastePercent: WASTE_FACTORS.waterproofing * 100,
    grossQty: round2(waterproofArea * (1 + WASTE_FACTORS.waterproofing)),
    procurementQty: bitumenDrums,
    notes: `مساحة عزل ${round2(waterproofArea)}م2 ÷ ${WATERPROOFING.bitumen_drum_coverage_m2}م2/برميل`,
  });

  return items;
}

function calculateSuperstructure(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];

  let totalSlabConcrete = 0;
  let totalSlabSteel = 0;
  let totalColumnConcrete = 0;
  let totalColumnSteel = 0;
  let totalFormwork = 0;

  bp.floors.forEach((floor, idx) => {
    const slabThickness = floor.slabThickness || DEFAULT_SLAB_THICKNESS[floor.slabType] || 0.22;
    const slabVolume = floor.area * slabThickness;
    const steelRatioKey = `slab_${floor.slabType}` as string;
    const steelRatio = STEEL_RATIOS[steelRatioKey]?.default || 120;

    totalSlabConcrete += slabVolume;
    totalSlabSteel += (slabVolume * steelRatio);

    if (floor.slabType === 'hordi') {
      const hordiBlocksCount = floor.area * HORDI_CONSTANTS.blocks_per_m2 * (1 - HORDI_CONSTANTS.solid_area_deduction);
      items.push({
        id: `super_hordi_blocks_f${idx}`,
        category: 'superstructure',
        name: { ar: `بلوك هوردي (سقف ${floor.name})`, en: `Hollow Core Blocks (${floor.name})`, fr: `Blocs hourdis`, zh: `空心砖` },
        unit: 'حبة',
        netQty: Math.ceil(hordiBlocksCount),
        wastePercent: HORDI_CONSTANTS.waste_factor * 100,
        grossQty: Math.ceil(hordiBlocksCount * (1 + HORDI_CONSTANTS.waste_factor)),
        procurementQty: Math.ceil(hordiBlocksCount * (1 + HORDI_CONSTANTS.waste_factor)),
        notes: `مساحة السقف ${floor.area}م² × ${HORDI_CONSTANTS.blocks_per_m2} بلوكة/م² (خصم ${HORDI_CONSTANTS.solid_area_deduction * 100}% أجزاء صلبة)`,
      });

      // === G12: حديد هوردي تفصيلي (أعصاب + كانات) ===
      const ribSpacing = 0.50; // تباعد الأعصاب 50سم
      const ribCount = Math.ceil(Math.sqrt(floor.area) / ribSpacing);
      const ribLength = Math.sqrt(floor.area); // متوسط طول العصب
      // حديد رئيسي: 2Ø12 لكل عصب
      const ribMainBarWeight = ribCount * 2 * ribLength * (12 * 12 / 162); // D²/162 كجم/م
      // كانات: Ø8 كل 20سم
      const stirrupsPerRib = Math.ceil(ribLength / 0.20) + 1;
      const stirrupPerimeter = 2 * (0.10 + 0.25) + 0.20; // 2(عرض + عمق) + hooks
      const stirrupWeight = ribCount * stirrupsPerRib * stirrupPerimeter * (8 * 8 / 162);
      const hordiDetailedSteelKg = ribMainBarWeight + stirrupWeight;
      // G11: lap length ذكي — أعصاب = 40Ø (Class A)
      const lapFactor = 40; // أعصاب هوردي Class A = 40Ø
      const lapAdditionKg = hordiDetailedSteelKg * 0.08; // ~8% زيادة بسبب التراكب
      totalSlabSteel += (hordiDetailedSteelKg + lapAdditionKg);
    }

    // Columns for this floor — use actual column dimensions from blueprint
    const colCount = floor.columnsCount || Math.ceil(floor.area / 16);
    const colW = (bp.columnWidth_cm || 30) / 100; // meters
    const colD = (bp.columnDepth_cm || 50) / 100; // meters
    const colVolume = colCount * colW * colD * floor.height;
    totalColumnConcrete += colVolume;
    totalColumnSteel += (colVolume * STEEL_RATIOS.columns.default);

    // Formwork (slab bottom + column sides)
    totalFormwork += floor.area; // slab bottom
    totalFormwork += (colCount * (0.30 + 0.50) * 2 * floor.height); // column 4 sides
  });

  items.push(makeConcreteItem('super_slabs', 'خرسانة أسقف', 'Slab Concrete', totalSlabConcrete, 5));
  items.push(makeConcreteItem('super_columns', 'خرسانة أعمدة', 'Column Concrete', totalColumnConcrete, 5));

  const totalSuperSteelTons = (totalSlabSteel + totalColumnSteel) / 1000;
  items.push({
    id: 'super_steel',
    category: 'superstructure',
    name: { ar: 'حديد تسليح عظم', en: 'Superstructure Rebar', fr: 'Armatures structure', zh: '上部结构钢筋' },
    unit: 'طن',
    netQty: round2(totalSuperSteelTons),
    wastePercent: WASTE_FACTORS.steel * 100,
    grossQty: round2(totalSuperSteelTons * (1 + WASTE_FACTORS.steel)),
    procurementQty: round2(totalSuperSteelTons * (1 + WASTE_FACTORS.steel)),
    notes: `أسقف: ${round2(totalSlabSteel)}كجم | أعمدة: ${round2(totalColumnSteel)}كجم`,
  });

  // === G2: Enhanced Formwork — شدة شاملة (بليوت + جكات + عروق + تقوية) ===
  const plywoodSheets = Math.ceil((totalFormwork * (1 + WASTE_FACTORS.plywood_formwork)) / FORMWORK.plywood_area_m2 / FORMWORK.reuse_cycles);
  items.push({
    id: 'formwork_super',
    category: 'superstructure',
    name: { ar: 'شدة خشبية عظم (ألواح بليوت)', en: 'Superstructure Formwork (Plywood)', fr: 'Coffrage structure', zh: '上部结构模板' },
    unit: 'م2',
    netQty: round2(totalFormwork),
    wastePercent: WASTE_FACTORS.plywood_formwork * 100,
    grossQty: round2(totalFormwork * (1 + WASTE_FACTORS.plywood_formwork)),
    procurementQty: plywoodSheets,
    notes: `${plywoodSheets} لوح بليوت (${FORMWORK.plywood_area_m2}م²/لوح × ${FORMWORK.reuse_cycles} مرات استخدام)`,
  });

  // G2: جكات (Props / Shores) — 1 جك لكل 1.0م² سقف
  const propsCount = Math.ceil(totalFormwork / 1.0);
  items.push({
    id: 'formwork_props',
    category: 'superstructure',
    name: { ar: 'جكات شدة (Props/Shores)', en: 'Formwork Props / Shores', fr: 'Étais', zh: '模板支撑杆' },
    unit: 'حبة',
    netQty: propsCount,
    wastePercent: 0,
    grossQty: propsCount,
    procurementQty: propsCount,
    notes: `جك لكل 1.0م² سقف — إيجار أو شراء — ارتفاع متوسط ${round2(bp.floors.reduce((s, f) => s + f.height, 0) / bp.floors.length)}م`,
  });

  // G2: عروق خشبية (Runners / Bearers) — 1 عرق لكل 0.5م.ط محيط
  const runnersLength = totalFormwork * 2; // ~2 م.ط لكل م² سقف (عروق رئيسية + ثانوية)
  items.push({
    id: 'formwork_runners',
    category: 'superstructure',
    name: { ar: 'عروق خشبية (Runners)', en: 'Timber Runners / Bearers', fr: 'Bastaings', zh: '木方' },
    unit: 'م.ط',
    netQty: round2(runnersLength),
    wastePercent: 10,
    grossQty: round2(runnersLength * 1.10),
    procurementQty: round2(runnersLength * 1.10),
    notes: `عروق 10×10سم — 2 م.ط لكل م² سقف (رئيسية + ثانوية) — SBC 304 فك الشدة بعد 21 يوم`,
  });

  return items;
}

function calculateMasonry(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];

  let totalExtWallArea = 0;
  let totalIntWallArea = 0;

  bp.floors.forEach(floor => {
    const perimeterLength = floor.perimeterWallLength || Math.sqrt(floor.area) * 4;
    const internalLength = floor.internalWallLength || perimeterLength * 0.5;
    const extArea = perimeterLength * floor.height * 0.85; // 15% deduction for openings
    const intArea = internalLength * floor.height * 0.90; // 10% deduction
    totalExtWallArea += extArea;
    totalIntWallArea += intArea;
  });

  const extBlockCount = totalExtWallArea * BLOCK_CONSTANTS.blocks_per_m2;
  const intBlockCount = totalIntWallArea * BLOCK_CONSTANTS.blocks_per_m2;

  items.push({
    id: 'masonry_block_ext',
    category: 'masonry',
    name: { ar: 'بلوك خارجي (20سم)', en: 'External Block (20cm)', fr: 'Bloc externe (20cm)', zh: '外墙砌块 (20cm)' },
    unit: 'حبة',
    netQty: Math.ceil(extBlockCount),
    wastePercent: WASTE_FACTORS.blockwork * 100,
    grossQty: Math.ceil(extBlockCount * (1 + WASTE_FACTORS.blockwork)),
    procurementQty: Math.ceil(extBlockCount * (1 + WASTE_FACTORS.blockwork) / BLOCK_CONSTANTS.pallet_count) * BLOCK_CONSTANTS.pallet_count,
    notes: `${round2(totalExtWallArea)}م2 × ${BLOCK_CONSTANTS.blocks_per_m2} بلكة/م2 (بليات ${BLOCK_CONSTANTS.pallet_count})`,
  });

  items.push({
    id: 'masonry_block_int',
    category: 'masonry',
    name: { ar: 'بلوك داخلي (15سم)', en: 'Internal Block (15cm)', fr: 'Bloc interne (15cm)', zh: '内墙砌块 (15cm)' },
    unit: 'حبة',
    netQty: Math.ceil(intBlockCount),
    wastePercent: WASTE_FACTORS.blockwork * 100,
    grossQty: Math.ceil(intBlockCount * (1 + WASTE_FACTORS.blockwork)),
    procurementQty: Math.ceil(intBlockCount * (1 + WASTE_FACTORS.blockwork) / BLOCK_CONSTANTS.pallet_count) * BLOCK_CONSTANTS.pallet_count,
    notes: `${round2(totalIntWallArea)}م2 × ${BLOCK_CONSTANTS.blocks_per_m2} بلكة/م2`,
  });

  // Mortar (cement bags for blockwork)
  const totalWallArea = totalExtWallArea + totalIntWallArea;
  const mortarBags = Math.ceil(totalWallArea * BLOCK_CONSTANTS.mortar_bags_per_m2);
  items.push({
    id: 'masonry_mortar',
    category: 'masonry',
    name: { ar: 'أسمنت خلطة بلوك', en: 'Blockwork Mortar Cement', fr: 'Ciment mortier', zh: '砌筑水泥' },
    unit: 'كيس 50كجم',
    netQty: mortarBags,
    wastePercent: 5,
    grossQty: Math.ceil(mortarBags * 1.05),
    procurementQty: Math.ceil(mortarBags * 1.05),
  });

  // Plastering (both sides for internal, one side external)
  const plasterExtArea = totalExtWallArea;
  const plasterIntArea = totalIntWallArea * 2;
  const totalPlasterArea = plasterExtArea + plasterIntArea;

  items.push({
    id: 'masonry_spatter_dash',
    category: 'masonry',
    name: { ar: 'رشة مسمارية (طرطشة)', en: 'Spatter Dash', fr: 'Spatter Dash', zh: 'Spatter Dash' },
    unit: 'م2',
    netQty: round2(totalPlasterArea),
    wastePercent: 5,
    grossQty: round2(totalPlasterArea * 1.05),
    procurementQty: round2(totalPlasterArea * 1.05),
  });

  items.push({
    id: 'masonry_plaster_int',
    category: 'masonry',
    name: { ar: 'لياسة داخلية', en: 'Internal Plaster', fr: 'Enduit interne', zh: '内墙抹灰' },
    unit: 'م2',
    netQty: round2(plasterIntArea),
    wastePercent: 5,
    grossQty: round2(plasterIntArea * 1.05),
    procurementQty: round2(plasterIntArea * 1.05),
  });

  items.push({
    id: 'masonry_plaster_ext',
    category: 'masonry',
    name: { ar: 'لياسة خارجية', en: 'External Plaster', fr: 'Enduit externe', zh: '外墙抹灰' },
    unit: 'م2',
    netQty: round2(plasterExtArea),
    wastePercent: 5,
    grossQty: round2(plasterExtArea * 1.05),
    procurementQty: round2(plasterExtArea * 1.05),
  });

  return items;
}

function calculateConsumables(bp: BlueprintConfig, soilType: SoilType): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];

  // Steel consumables — calculated from total steel
  const allConcreteItems = [...calculateSubstructure(bp), ...calculateSuperstructure(bp)];
  const totalSteelTons = allConcreteItems.filter(i => i.unit === 'طن').reduce((s, i) => s + i.grossQty, 0);

  items.push({
    id: 'consumable_tie_wire',
    category: 'consumables',
    name: { ar: 'سلك رباط حديد', en: 'Steel Tie Wire', fr: 'Fil d\'attache', zh: '扎丝' },
    unit: 'كجم',
    netQty: round2(totalSteelTons * STEEL_CONSUMABLES.tie_wire_kg_per_ton),
    wastePercent: 5,
    grossQty: round2(totalSteelTons * STEEL_CONSUMABLES.tie_wire_kg_per_ton * 1.05),
    procurementQty: Math.ceil(totalSteelTons * STEEL_CONSUMABLES.tie_wire_kg_per_ton * 1.05),
    notes: `${STEEL_CONSUMABLES.tie_wire_kg_per_ton} كجم لكل طن حديد`,
  });

  // Water consumption
  const totalConcreteM3 = allConcreteItems.filter(i => i.unit === 'م3').reduce((s, i) => s + i.grossQty, 0);
  const concreteSurfaceArea = totalConcreteM3 * 3; // approx exposed surface
  const waterForCuring = concreteSurfaceArea * WATER_CONSUMPTION.concrete_curing_per_m2;

  // Masonry water
  let totalMasonryArea = 0;
  bp.floors.forEach(f => {
    const pw = f.perimeterWallLength || Math.sqrt(f.area) * 4;
    const iw = f.internalWallLength || pw * 0.5;
    totalMasonryArea += (pw + iw) * f.height;
  });
  const waterForBlockwork = totalMasonryArea * WATER_CONSUMPTION.blockwork_per_m2;
  const waterForPlastering = (totalMasonryArea * 2) * WATER_CONSUMPTION.plastering_per_m2;
  const totalWater = waterForCuring + waterForBlockwork + waterForPlastering;

  items.push({
    id: 'water_total',
    category: 'consumables',
    name: { ar: 'مياه إنشائية (وايتات)', en: 'Construction Water (Tankers)', fr: 'Eau de construction', zh: '施工用水' },
    unit: 'لتر',
    netQty: Math.ceil(totalWater),
    wastePercent: 0,
    grossQty: Math.ceil(totalWater),
    procurementQty: Math.ceil(totalWater / WATER_CONSUMPTION.water_tanker_liters),
    notes: `معالجة خرسانة: ${Math.ceil(waterForCuring)}L | بلوك: ${Math.ceil(waterForBlockwork)}L | لياسة: ${Math.ceil(waterForPlastering)}L — ${Math.ceil(totalWater / WATER_CONSUMPTION.water_tanker_liters)} وايت`,
  });

  // Spacers
  const totalFormwork = allConcreteItems.filter(i => i.id.startsWith('formwork_')).reduce((s, i) => s + i.grossQty, 0);
  items.push({
    id: 'consumable_spacers',
    category: 'consumables',
    name: { ar: 'بسكوت خرساني (مباعدات)', en: 'Concrete Spacers', fr: 'Distanciateurs', zh: '混凝土垫块' },
    unit: 'حبة',
    netQty: Math.ceil(totalFormwork * STEEL_CONSUMABLES.spacers_per_m2),
    wastePercent: 5,
    grossQty: Math.ceil(totalFormwork * STEEL_CONSUMABLES.spacers_per_m2 * 1.05),
    procurementQty: Math.ceil(totalFormwork * STEEL_CONSUMABLES.spacers_per_m2 * 1.05),
  });

  return items;
}

function calculateFinishes(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  if (!bp.roomFinishes || bp.roomFinishes.length === 0) return items;

  let totalTileAreaFloor = 0;
  let totalPaintAreaWalls = 0;
  let totalGypsumAreaCeiling = 0;
  let totalTileAreaWalls = 0;

  bp.roomFinishes.forEach(room => {
    const floorArea = room.length * room.width;
    const perimeter = (room.length + room.width) * 2;
    const netWallArea = perimeter * room.height * (1 - room.windowDoorRatio);
    const ceilingArea = floorArea;

    // Floor finishes
    if (isTileMaterial(room.floorFinish)) {
      totalTileAreaFloor += floorArea;
    }

    // Wall finishes
    if (isPaintMaterial(room.wallFinish)) {
      totalPaintAreaWalls += netWallArea;
    }
    if (isTileMaterial(room.wallFinish) && room.wetAreaWallHeight) {
      totalTileAreaWalls += perimeter * room.wetAreaWallHeight * (1 - room.windowDoorRatio);
    }

    // Ceiling finishes
    if (room.ceilingFinish === 'gypsum_board') {
      totalGypsumAreaCeiling += ceilingArea;
    } else if (isPaintMaterial(room.ceilingFinish)) {
      totalPaintAreaWalls += ceilingArea; // add ceiling paint to wall paint total
    }
  });

  // Floor tiles
  if (totalTileAreaFloor > 0) {
    const tileInfo = TILE_PACKAGES['ceramic_60x60'];
    const cartonsNeeded = Math.ceil((totalTileAreaFloor * (1 + WASTE_FACTORS.ceramic_tiles)) / tileInfo.carton_area_m2);
    const glueBags = Math.ceil(totalTileAreaFloor / TILE_CONSUMABLES.glue_bag_coverage_m2);
    const groutKg = Math.ceil(totalTileAreaFloor * TILE_CONSUMABLES.grout_kg_per_m2);

    items.push({
      id: 'finish_floor_tiles',
      category: 'finishes',
      name: { ar: 'سيراميك أرضيات', en: 'Floor Tiles', fr: 'Carrelage sol', zh: '地砖' },
      unit: 'كرتون',
      netQty: round2(totalTileAreaFloor),
      wastePercent: WASTE_FACTORS.ceramic_tiles * 100,
      grossQty: round2(totalTileAreaFloor * (1 + WASTE_FACTORS.ceramic_tiles)),
      procurementQty: cartonsNeeded,
      notes: `${round2(totalTileAreaFloor)}م2 → ${cartonsNeeded} كرتون (${tileInfo.carton_area_m2}م2/كرتون)`,
    });

    items.push({
      id: 'finish_tile_glue',
      category: 'finishes',
      name: { ar: 'غراء سيراميك', en: 'Tile Adhesive', fr: 'Colle carrelage', zh: '瓷砖胶' },
      unit: 'كيس 20كجم',
      netQty: glueBags,
      wastePercent: 0,
      grossQty: glueBags,
      procurementQty: glueBags,
      notes: `كيس لكل ${TILE_CONSUMABLES.glue_bag_coverage_m2}م2`,
    });

    items.push({
      id: 'finish_grout',
      category: 'finishes',
      name: { ar: 'ترويبة / فوجة', en: 'Tile Grout', fr: 'Coulis', zh: '填缝剂' },
      unit: 'كجم',
      netQty: groutKg,
      wastePercent: 0,
      grossQty: groutKg,
      procurementQty: groutKg,
    });
  }

  // Wall paint
  if (totalPaintAreaWalls > 0) {
    const litersNeeded = (totalPaintAreaWalls / PAINT_CONSTANTS.coverage_per_liter_m2) * PAINT_CONSTANTS.coats_required;
    const drumsNeeded = Math.ceil(litersNeeded / PAINT_CONSTANTS.drum_liters);

    items.push({
      id: 'finish_paint_walls',
      category: 'finishes',
      name: { ar: 'دهان بلاستيك (حوائط+أسقف)', en: 'Interior Paint', fr: 'Peinture intérieure', zh: '室内涂料' },
      unit: 'برميل 18L',
      netQty: round2(totalPaintAreaWalls),
      wastePercent: WASTE_FACTORS.paint * 100,
      grossQty: round2(totalPaintAreaWalls * (1 + WASTE_FACTORS.paint)),
      procurementQty: drumsNeeded,
      notes: `${round2(totalPaintAreaWalls)}م2 × ${PAINT_CONSTANTS.coats_required} أوجه → ${drumsNeeded} برميل`,
    });

    // Primer
    const primerDrums = Math.ceil(totalPaintAreaWalls / PAINT_CONSTANTS.primer_per_drum_m2);
    items.push({
      id: 'finish_primer',
      category: 'finishes',
      name: { ar: 'أساس / برايمر', en: 'Wall Primer', fr: 'Primaire', zh: '底漆' },
      unit: 'برميل',
      netQty: round2(totalPaintAreaWalls),
      wastePercent: 0,
      grossQty: round2(totalPaintAreaWalls),
      procurementQty: primerDrums,
    });
  }

  // Wet area wall tiles
  if (totalTileAreaWalls > 0) {
    const tileInfo = TILE_PACKAGES['ceramic_30x60'];
    const cartonsNeeded = Math.ceil((totalTileAreaWalls * (1 + WASTE_FACTORS.ceramic_tiles)) / tileInfo.carton_area_m2);
    items.push({
      id: 'finish_wall_tiles',
      category: 'finishes',
      name: { ar: 'سيراميك جدران (حمامات/مطابخ)', en: 'Wall Tiles (Wet Areas)', fr: 'Carrelage mural', zh: '墙砖' },
      unit: 'كرتون',
      netQty: round2(totalTileAreaWalls),
      wastePercent: WASTE_FACTORS.ceramic_tiles * 100,
      grossQty: round2(totalTileAreaWalls * (1 + WASTE_FACTORS.ceramic_tiles)),
      procurementQty: cartonsNeeded,
    });
  }

  // Gypsum board ceiling
  if (totalGypsumAreaCeiling > 0) {
    const boardArea = 1.22 * 2.44; // 2.977 m2
    const boardsNeeded = Math.ceil((totalGypsumAreaCeiling * (1 + WASTE_FACTORS.gypsum_board)) / boardArea);
    items.push({
      id: 'finish_gypsum_ceiling',
      category: 'finishes',
      name: { ar: 'ألواح جبس بورد سقف', en: 'Gypsum Board Ceiling', fr: 'Plafond placoplatre', zh: '石膏板天花' },
      unit: 'لوح',
      netQty: round2(totalGypsumAreaCeiling),
      wastePercent: WASTE_FACTORS.gypsum_board * 100,
      grossQty: round2(totalGypsumAreaCeiling * (1 + WASTE_FACTORS.gypsum_board)),
      procurementQty: boardsNeeded,
      notes: `${round2(totalGypsumAreaCeiling)}م2 ÷ ${round2(boardArea)}م2/لوح`,
    });
  }

  // === G4: كورنيش جبس سقف — محيط الغرف ===
  if (bp.roomFinishes && bp.roomFinishes.length > 0) {
    const cornicePerimeter = bp.roomFinishes.reduce((s, r) => s + (r.length + r.width) * 2, 0);
    if (cornicePerimeter > 0) {
      items.push({
        id: 'finish_gypsum_cornice',
        category: 'finishes',
        name: { ar: 'كورنيش جبس سقف (محيط الغرف)', en: 'Gypsum Ceiling Cornice', fr: 'Corniche plâtre', zh: '石膏角线' },
        unit: 'م.ط',
        netQty: round2(cornicePerimeter),
        wastePercent: 10,
        grossQty: round2(cornicePerimeter * 1.10),
        procurementQty: round2(cornicePerimeter * 1.10),
        notes: `كورنيش 10×10سم — ${bp.roomFinishes.length} غرفة`,
      });
    }
  }

  // === G15: ميول أسطح (Screed) ===
  const screedArea = getBuildableArea(bp);
  if (screedArea > 0) {
    const screedVol = screedArea * 0.05;
    items.push({
      id: 'finish_roof_screed',
      category: 'finishes',
      name: { ar: 'ميول أسطح (خرسانة رغوية)', en: 'Roof Screed / Slope', fr: 'Forme de pente', zh: '屋面找坡层' },
      unit: 'م3',
      netQty: round2(screedVol),
      wastePercent: 10,
      grossQty: round2(screedVol * 1.10),
      procurementQty: round2(screedVol * 1.10),
      notes: `SBC 601 — متوسط 5سم — ${round2(screedArea)}م² — قبل العزل المائي`,
    });
  }

  return items;
}

function calculateFacades(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  if (!bp.facadeSchedules || bp.facadeSchedules.length === 0) return items;

  bp.facadeSchedules.forEach(facade => {
    const grossArea = facade.width * facade.totalHeight;
    const netArea = grossArea * (1 - facade.windowDoorRatio);
    const finishName = getFacadeFinishName(facade.finishType);

    items.push({
      id: `facade_${facade.direction}_${facade.finishType}`,
      category: 'facades',
      name: {
        ar: `واجهة ${getDirectionAr(facade.direction)} — ${finishName.ar}`,
        en: `${facade.direction} Facade — ${finishName.en}`,
        fr: `Façade ${facade.direction} — ${finishName.fr}`,
        zh: `${facade.direction}立面 — ${finishName.zh}`,
      },
      unit: 'م2',
      netQty: round2(netArea),
      wastePercent: 5,
      grossQty: round2(netArea * 1.05),
      procurementQty: round2(netArea * 1.05),
      notes: `إجمالي ${round2(grossArea)}م2 - ${facade.windowDoorRatio * 100}% فتحات = ${round2(netArea)}م2`,
    });
  });

  return items;
}

function calculateDoorsAndWindows(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];

  let totalExtWallArea = 0;
  let totalIntWallArea = 0;

  bp.floors.forEach(floor => {
    const perimeterLength = floor.perimeterWallLength || Math.sqrt(floor.area) * 4;
    const internalLength = floor.internalWallLength || perimeterLength * 0.5;
    totalExtWallArea += perimeterLength * floor.height;
    totalIntWallArea += internalLength * floor.height;
  });

  // 15% of external walls are windows/doors (aluminum mostly)
  const aluminumArea = totalExtWallArea * 0.15;
  
  // 10% of internal walls are doors (wood carpentry mostly)
  const woodArea = totalIntWallArea * 0.10;

  // === G5: حساب ذكي للأبواب والنوافذ من roomFinishes ===
  if (bp.roomFinishes && bp.roomFinishes.length > 0) {
    // كل غرفة = باب واحد على الأقل
    const doorCount = bp.roomFinishes.length;
    // النوافذ: كل غرفة غير حمام/ممر/مخزن = نافذة واحدة على الأقل
    const windowRooms = bp.roomFinishes.filter(r => !['bathroom', 'corridor', 'storage'].includes(r.roomType));
    const windowCount = windowRooms.length;
    const avgDoorArea = 2.10 * 0.90; // باب 210×90سم
    const avgWindowArea = 1.50 * 1.20; // نافذة 150×120سم

    items.push({
      id: 'doors_wood_smart',
      category: 'doorsAndWindows',
      name: { ar: `أبواب خشب داخلية (${doorCount} باب)`, en: `Interior Wooden Doors (${doorCount})`, fr: 'Portes intérieures', zh: '室内木门' },
      unit: 'باب',
      netQty: doorCount,
      wastePercent: 0,
      grossQty: doorCount,
      procurementQty: doorCount,
      notes: `${doorCount} غرفة × باب واحد — 210×90سم — شامل الحلق + الكوالين`,
    });

    if (windowCount > 0) {
      items.push({
        id: 'windows_alum_smart',
        category: 'doorsAndWindows',
        name: { ar: `نوافذ ألمنيوم (${windowCount} نافذة)`, en: `Aluminum Windows (${windowCount})`, fr: 'Fenêtres aluminium', zh: '铝合金窗' },
        unit: 'نافذة',
        netQty: windowCount,
        wastePercent: 0,
        grossQty: windowCount,
        procurementQty: windowCount,
        notes: `${windowCount} غرفة × نافذة — 150×120سم متوسط — زجاج مزدوج`,
      });
    }
  } else {
    // Fallback: الطريقة القديمة بالنسب
    if (aluminumArea > 0) {
      items.push({
        id: 'doors_windows_aluminum',
        category: 'doorsAndWindows',
        name: { ar: 'أعمال الألمنيوم (نوافذ خارجية)', en: 'Aluminum Windows', fr: 'Fenêtres en aluminium', zh: '铝合金窗' },
        unit: 'م2',
        netQty: round2(aluminumArea),
        wastePercent: 0,
        grossQty: round2(aluminumArea),
        procurementQty: round2(aluminumArea),
        notes: `بناءً على 15% نسبة فتحات من الجدران الخارجية`,
      });
    }
    if (woodArea > 0) {
      items.push({
        id: 'doors_windows_wood',
        category: 'doorsAndWindows',
        name: { ar: 'أعمال النجارة (أبواب خشبية داخلية)', en: 'Wooden Doors', fr: 'Portes en bois', zh: '木门' },
        unit: 'م2',
        netQty: round2(woodArea),
        wastePercent: 0,
        grossQty: round2(woodArea),
        procurementQty: round2(woodArea),
        notes: `بناءً على 10% نسبة فتحات من الجدران الداخلية`,
      });
    }
  }

  return items;
}

// =================== v7.0 SECTION 1: Insulation — SBC 601 ===================

function calculateInsulation(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  const ins = bp.insulationSpec;
  if (!ins) return items;

  const buildableArea = getBuildableArea(bp);
  let totalExtWallArea = 0;
  bp.floors.forEach(f => {
    const perimeter = f.perimeterWallLength || Math.sqrt(f.area) * 4;
    totalExtWallArea += perimeter * f.height;
  });

  // Wall insulation
  if (ins.wallInsulationType !== 'none') {
    const price = INSULATION_PRICES[ins.wallInsulationType];
    items.push({
      id: 'insulation_walls',
      category: 'insulation',
      name: { ar: `عزل حراري جدران (${ins.wallInsulationType.toUpperCase()})`, en: `Wall Thermal Insulation (${ins.wallInsulationType.toUpperCase()})`, fr: 'Isolation thermique murs', zh: '墙体保温' },
      unit: 'م2',
      netQty: round2(totalExtWallArea),
      wastePercent: 5,
      grossQty: round2(totalExtWallArea * 1.05),
      procurementQty: round2(totalExtWallArea * 1.05),
      notes: `SBC 601 إلزامي — ${ins.wallInsulationThickness_mm}mm سماكة — ${price} ر.س/م²`,
    });
  }

  // Roof insulation
  if (ins.roofInsulationType !== 'none') {
    const price = INSULATION_PRICES[ins.roofInsulationType];
    items.push({
      id: 'insulation_roof',
      category: 'insulation',
      name: { ar: `عزل حراري سقف (${ins.roofInsulationType.toUpperCase()})`, en: `Roof Thermal Insulation (${ins.roofInsulationType.toUpperCase()})`, fr: 'Isolation thermique toiture', zh: '屋顶保温' },
      unit: 'م2',
      netQty: round2(buildableArea),
      wastePercent: 5,
      grossQty: round2(buildableArea * 1.05),
      procurementQty: round2(buildableArea * 1.05),
      notes: `SBC 601 إلزامي — ${ins.roofInsulationThickness_mm}mm سماكة — ${price} ر.س/م²`,
    });
  }

  return items;
}

// =================== v7.0 SECTION 2: Waterproofing/DPC — SBC 303 ===================

function calculateWaterproofing(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  const dpc = bp.dpcConfig;
  if (!dpc) return items;

  const buildableArea = getBuildableArea(bp);
  const price = DPC_PRICES[dpc.foundationDPC];

  // Foundation DPC
  items.push({
    id: 'dpc_foundation',
    category: 'waterproofing',
    name: { ar: `عزل مائي أساسات (${dpc.foundationDPC})`, en: 'Foundation Waterproofing (DPC)', fr: 'Imperméabilisation fondations', zh: '基础防水' },
    unit: 'م2',
    netQty: round2(buildableArea),
    wastePercent: WASTE_FACTORS.waterproofing * 100,
    grossQty: round2(buildableArea * (1 + WASTE_FACTORS.waterproofing)),
    procurementQty: round2(buildableArea * (1 + WASTE_FACTORS.waterproofing)),
    notes: `SBC 303 إلزامي — تراكب ≥${dpc.overlapMin_mm}mm — ${price} ر.س/م²`,
  });

  // Roof waterproofing
  const roofPrice = DPC_PRICES[dpc.roofWaterproofing];
  items.push({
    id: 'dpc_roof',
    category: 'waterproofing',
    name: { ar: `عزل مائي سطح (${dpc.roofWaterproofing})`, en: 'Roof Waterproofing', fr: 'Imperméabilisation toiture', zh: '屋顶防水' },
    unit: 'م2',
    netQty: round2(buildableArea),
    wastePercent: WASTE_FACTORS.waterproofing * 100,
    grossQty: round2(buildableArea * (1 + WASTE_FACTORS.waterproofing)),
    procurementQty: round2(buildableArea * (1 + WASTE_FACTORS.waterproofing)),
    notes: `${roofPrice} ر.س/م²`,
  });

  // Bathroom waterproofing
  if (dpc.bathroomWaterproofing && bp.roomFinishes) {
    const wetRooms = bp.roomFinishes.filter(r => ['bathroom', 'kitchen'].includes(r.roomType));
    let totalWetArea = 0;
    wetRooms.forEach(r => {
      const floorArea = r.length * r.width;
      const wallArea = (r.length + r.width) * 2 * (r.wetAreaWallHeight || 1.8);
      totalWetArea += floorArea + wallArea;
    });
    if (totalWetArea > 0) {
      items.push({
        id: 'dpc_bathrooms',
        category: 'waterproofing',
        name: { ar: 'عزل مائي حمامات ومطابخ', en: 'Wet Area Waterproofing', fr: 'Imperméabilisation sanitaires', zh: '卫生间防水' },
        unit: 'م2',
        netQty: round2(totalWetArea),
        wastePercent: 5,
        grossQty: round2(totalWetArea * 1.05),
        procurementQty: round2(totalWetArea * 1.05),
        notes: `${wetRooms.length} غرف مبللة — أرضيات + جدران`,
      });
    }
  }

  return items;
}

// =================== v7.0 SECTION 3: Fire Protection — SBC 801 ===================

function calculateFireProtection(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  const fp = bp.fireProtection;
  if (!fp) return items;

  const floorsCount = bp.floors.length;
  const totalDetectors = fp.smokeDetectorsPerFloor * floorsCount;

  // Smoke detectors
  items.push({
    id: 'fire_smoke_detectors',
    category: 'fire_protection',
    name: { ar: 'كاشفات دخان', en: 'Smoke Detectors', fr: 'Détecteurs de fumée', zh: '烟雾探测器' },
    unit: 'حبة',
    netQty: totalDetectors,
    wastePercent: 0,
    grossQty: totalDetectors,
    procurementQty: totalDetectors,
    notes: `SBC 801 / NFPA 72 — ${fp.smokeDetectorsPerFloor}/طابق × ${floorsCount} أدوار — ${FIRE_PROTECTION_PRICES.smoke_detector_SAR} ر.س/حبة`,
  });

  // Fire extinguishers
  items.push({
    id: 'fire_extinguishers',
    category: 'fire_protection',
    name: { ar: 'طفايات حريق', en: 'Fire Extinguishers', fr: 'Extincteurs', zh: '灭火器' },
    unit: 'حبة',
    netQty: fp.fireExtinguisherCount,
    wastePercent: 0,
    grossQty: fp.fireExtinguisherCount,
    procurementQty: fp.fireExtinguisherCount,
    notes: `${FIRE_PROTECTION_PRICES.fire_extinguisher_SAR} ر.س/حبة`,
  });

  // Fire alarm system
  if (fp.hasFireAlarmSystem) {
    items.push({
      id: 'fire_alarm_system',
      category: 'fire_protection',
      name: { ar: 'نظام إنذار حريق', en: 'Fire Alarm System', fr: 'Système alarme incendie', zh: '火灾报警系统' },
      unit: 'نظام',
      netQty: 1,
      wastePercent: 0,
      grossQty: 1,
      procurementQty: 1,
      notes: `لوحة إنذار + توصيل — ${FIRE_PROTECTION_PRICES.fire_alarm_panel_SAR} ر.س`,
    });
  }

  // =================== v8.5: Commercial Fire Protection Systems ===================
  const totalFloorArea = bp.floors.reduce((s, f) => s + f.area, 0);
  const isCommercial = totalFloorArea > 500 || bp.floors.length > 3;

  if (isCommercial) {
    // Fire Pump Set (Jockey + Electric + Diesel) — mandatory for commercial > 500m²
    items.push({
      id: 'fire_pump_set',
      category: 'fire_protection',
      name: { ar: 'مجموعة مضخات حريق (Jockey + كهرباء + ديزل 500GPM)', en: 'Fire Pump Set (Jockey + Electric + Diesel 500GPM)', fr: 'Groupe de Pompes Incendie', zh: '消防泵组' },
      unit: 'مجموعة',
      netQty: 1,
      wastePercent: 0,
      grossQty: 1,
      procurementQty: 1,
      notes: `SBC 901 / NFPA 20 — 500GPM @ 7 BAR — إلزامي للمباني التجارية > 500م²`,
    });

    // Sprinkler System — based on total floor area
    items.push({
      id: 'fire_sprinkler_sys',
      category: 'fire_protection',
      name: { ar: 'شبكة رشاشات حريق (Sprinkler)', en: 'Fire Sprinkler System', fr: 'Système Sprinkler', zh: '消防喷淋系统' },
      unit: 'م2',
      netQty: round2(totalFloorArea),
      wastePercent: 5,
      grossQty: round2(totalFloorArea * 1.05),
      procurementQty: round2(totalFloorArea * 1.05),
      notes: `SBC 901 / NFPA 13 — تغطية ${round2(totalFloorArea)} م² — رشاش كل 12م²`,
    });

    // Wet Riser — for buildings > 3 floors
    if (bp.floors.length > 3) {
      const riserLength = bp.floors.length * 3.5; // 3.5m per floor avg
      items.push({
        id: 'fire_wet_riser',
        category: 'fire_protection',
        name: { ar: 'شبكة مواسير حريق (Wet Riser)', en: 'Wet Riser Fire Network', fr: 'Réseau Incendie Armé', zh: 'Wet Riser' },
        unit: 'م.ط',
        netQty: round2(riserLength),
        wastePercent: 5,
        grossQty: round2(riserLength * 1.05),
        procurementQty: round2(riserLength * 1.05),
        notes: `SBC 901 — ${bp.floors.length} أدوار × 3.5م = ${round2(riserLength)}م`,
      });
    }

    // Fire Water Tank — for buildings requiring pump sets
    items.push({
      id: 'fire_water_tank',
      category: 'fire_protection',
      name: { ar: 'خزان مياه حريق (200م³)', en: 'Fire Water Tank (200m³)', fr: 'Cuve Incendie', zh: '消防水箱' },
      unit: 'عدد',
      netQty: 1,
      wastePercent: 0,
      grossQty: 1,
      procurementQty: 1,
      notes: `SBC 901 — خزان أرضي أو علوي — سعة تغطي 60 دقيقة إطفاء`,
    });
  }

  // Civil Defense approval cost
  items.push({
    id: 'fire_civil_defense',
    category: 'fire_protection',
    name: { ar: 'رسوم موافقة الدفاع المدني (سلامة)', en: 'Civil Defense Approval Fee', fr: 'Frais défense civile', zh: '消防审批费' },
    unit: 'مقطوع',
    netQty: 1,
    wastePercent: 0,
    grossQty: 1,
    procurementQty: 1,
    notes: `منصة سلامة الإلكترونية — ${fp.civilDefenseApprovalCost_SAR} ر.س`,
  });

  return items;
}

// =================== v7.0 SECTION 4: Testing — SBC 304 + SBC 701 ===================

function calculateTesting(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  const tc = bp.testingConfig || DEFAULT_TESTING_CONFIG;

  // Estimate total concrete volume for cube test count
  const totalConcreteVol = bp.floors.reduce((s, f) => {
    const slabVol = f.area * (f.slabThickness || 0.22);
    return s + slabVol;
  }, 0) + getBuildableArea(bp) * 0.35; // slab + substructure estimate

  const cubeTestSets = Math.max(1, Math.ceil(totalConcreteVol / tc.cubeTestFrequency_m3));

  items.push({
    id: 'test_cube_concrete',
    category: 'testing',
    name: { ar: 'فحص مكعبات خرسانة', en: 'Concrete Cube Tests', fr: 'Essais cubes béton', zh: '混凝土试块测试' },
    unit: 'مجموعة',
    netQty: cubeTestSets,
    wastePercent: 0,
    grossQty: cubeTestSets,
    procurementQty: cubeTestSets,
    notes: `SBC 304 — ${tc.cubesPerSample} مكعبات كل ${tc.cubeTestFrequency_m3}م³ — تكلفة مقدرة ${cubeTestSets * tc.cubeTestCost_SAR} ر.س`,
  });

  // Pressure test (1 per floor for plumbing)
  const pressureTests = bp.floors.length;
  items.push({
    id: 'test_pressure_plumbing',
    category: 'testing',
    name: { ar: 'اختبار ضغط سباكة', en: 'Plumbing Pressure Test', fr: 'Test pression plomberie', zh: '管道压力测试' },
    unit: 'اختبار',
    netQty: pressureTests,
    wastePercent: 0,
    grossQty: pressureTests,
    procurementQty: pressureTests,
    notes: `SBC 701 — ${tc.pressureTest_PSI} PSI × ${tc.pressureTestDuration_min} دقيقة`,
  });

  // Geotechnical report (once)
  items.push({
    id: 'test_geotechnical',
    category: 'testing',
    name: { ar: 'تقرير جيوتقني (فحص تربة)', en: 'Geotechnical Report', fr: 'Rapport géotechnique', zh: '岩土报告' },
    unit: 'تقرير',
    netQty: 1,
    wastePercent: 0,
    grossQty: 1,
    procurementQty: 1,
    notes: `SBC 303 — SPT + حفر استكشافي`,
  });

  // Waterproof test
  items.push({
    id: 'test_waterproof',
    category: 'testing',
    name: { ar: 'فحص عزل مائي (غمر)', en: 'Waterproofing Flood Test', fr: 'Test étanchéité', zh: '防水测试' },
    unit: 'اختبار',
    netQty: 1,
    wastePercent: 0,
    grossQty: 1,
    procurementQty: 1,
  });

  // Compaction test
  items.push({
    id: 'test_compaction',
    category: 'testing',
    name: { ar: 'فحص دمك تربة (بروكتور)', en: 'Soil Compaction Test', fr: 'Essai Proctor', zh: '压实度测试' },
    unit: 'نقطة',
    netQty: 3,
    wastePercent: 0,
    grossQty: 3,
    procurementQty: 3,
    notes: `3 نقاط فحص تقريباً`,
  });

  // Electrical insulation test (megger)
  items.push({
    id: 'test_electrical_megger',
    category: 'testing',
    name: { ar: 'فحص عزل كهربائي (ميقر)', en: 'Electrical Insulation Test (Megger)', fr: 'Test mégohmmètre', zh: '电气绝缘测试' },
    unit: 'فحص',
    netQty: 1,
    wastePercent: 0,
    grossQty: 1,
    procurementQty: 1,
    notes: `SBC 401 — مقاومة العزل`,
  });

  return items;
}

// =================== v7.0 SECTION 5: Site Safety — OSHA/SBC ===================

function calculateSiteSafety(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  const sc = bp.safetyConfig;
  if (!sc) return items;

  const plotPerimeter = (bp.plotWidth + bp.plotLength) * 2;

  // Hoarding
  items.push({
    id: 'safety_hoarding',
    category: 'safety',
    name: { ar: 'سياج حماية موقع', en: 'Site Perimeter Hoarding', fr: 'Palissade de chantier', zh: '施工围挡' },
    unit: 'م.ط',
    netQty: round2(plotPerimeter),
    wastePercent: 0,
    grossQty: round2(plotPerimeter),
    procurementQty: round2(plotPerimeter),
    notes: `ارتفاع ${sc.hoardingHeight_m}م — ${sc.hoardingCostPerLm_SAR} ر.س/م.ط`,
  });

  // Night lighting
  if (sc.nightLightingPoints > 0) {
    items.push({
      id: 'safety_night_lights',
      category: 'safety',
      name: { ar: 'إضاءة ليلية موقع', en: 'Site Night Lighting', fr: 'Éclairage nocturne', zh: '夜间照明' },
      unit: 'نقطة',
      netQty: sc.nightLightingPoints,
      wastePercent: 0,
      grossQty: sc.nightLightingPoints,
      procurementQty: sc.nightLightingPoints,
    });
  }

  return items;
}

// =================== v7.0 SECTION 6: Summer Additives — SBC 304 Hot Weather ===================

function calculateSummerAdditives(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  const sc = bp.summerConcreting || DEFAULT_SUMMER_CONFIG;
  if (!sc.isEnabled) return items;

  // Estimate total concrete volume
  const totalConcreteVol = bp.floors.reduce((s, f) => s + f.area * (f.slabThickness || 0.22), 0)
    + getBuildableArea(bp) * 0.40; // substructure estimate

  // Ice additive
  items.push({
    id: 'summer_ice_additive',
    category: 'summer',
    name: { ar: 'إضافة ثلج مجروش (صب صيفي)', en: 'Ice Additive (Hot Weather Concreting)', fr: 'Ajout de glace (béton chaud)', zh: '碎冰添加剂(高温浇筑)' },
    unit: 'م3',
    netQty: round2(totalConcreteVol),
    wastePercent: 0,
    grossQty: round2(totalConcreteVol * sc.iceAdditiveCost_SAR_per_m3),
    procurementQty: round2(totalConcreteVol),
    notes: `SBC 304 — حرارة الصب ≤ 35°C — ${sc.iceAdditiveCost_SAR_per_m3} ر.س/م³`,
  });

  // Retarder
  items.push({
    id: 'summer_retarder',
    category: 'summer',
    name: { ar: 'مؤخر شك (ASTM C494 Type B)', en: 'Set Retarder (ASTM C494 Type B)', fr: 'Retardateur de prise', zh: '缓凝剂' },
    unit: 'م3',
    netQty: round2(totalConcreteVol),
    wastePercent: 0,
    grossQty: round2(totalConcreteVol * sc.retarderCost_SAR_per_m3),
    procurementQty: round2(totalConcreteVol),
    notes: `مؤخر شك — ${sc.retarderCost_SAR_per_m3} ر.س/م³`,
  });

  return items;
}

// =================== v7.0 SECTION 7: MEP Atomic QS ===================

function calculateMEP(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  if (!bp.mepConfig) return items;

  const totalFloorArea = bp.floors.reduce((s, f) => s + f.area, 0);

  // --- Electrical ---
  if (bp.mepConfig.electrical) {
    const socketsPerM2 = 0.25; // 1 per 4m² — SBC 401
    const totalSockets = Math.ceil(totalFloorArea * socketsPerM2);
    const totalLights = bp.roomFinishes?.length
      ? bp.roomFinishes.reduce((s, r) => s + Math.max(2, Math.ceil(r.length * r.width / 6)), 0)
      : Math.ceil(totalFloorArea / 6);
    const totalACPoints = bp.roomFinishes?.filter(r => !['bathroom', 'corridor', 'storage'].includes(r.roomType)).length || Math.ceil(totalFloorArea / 20);

    // Cable lengths (estimated)
    const cableLighting = totalLights * 8; // 8m avg per light point
    const cableSockets = totalSockets * 6; // 6m avg per socket
    const cableAC = totalACPoints * 10; // 10m avg per AC point
    const conduitLength = cableLighting + cableSockets + cableAC;

    items.push({
      id: 'mep_elec_cables',
      category: 'mep',
      name: { ar: 'كابلات كهرباء (متنوعة المقاطع)', en: 'Electrical Cables (Mixed Sections)', fr: 'Câbles électriques', zh: '电缆' },
      unit: 'م.ط',
      netQty: round2(cableLighting + cableSockets + cableAC),
      wastePercent: 10,
      grossQty: round2((cableLighting + cableSockets + cableAC) * 1.10),
      procurementQty: round2((cableLighting + cableSockets + cableAC) * 1.10),
      notes: `إنارة ${cableLighting}م (1.5mm²) | أفياش ${cableSockets}م (2.5mm²) | تكييف ${cableAC}م (4mm²)`,
    });

    items.push({
      id: 'mep_elec_conduit',
      category: 'mep',
      name: { ar: 'أنابيب PVC كهرباء', en: 'PVC Electrical Conduit', fr: 'Tube PVC électrique', zh: 'PVC电气管' },
      unit: 'م.ط',
      netQty: round2(conduitLength),
      wastePercent: 10,
      grossQty: round2(conduitLength * 1.10),
      procurementQty: round2(conduitLength * 1.10),
    });

    // DB Panel
    const socketCircuits = Math.ceil(totalSockets / 6);
    const lightCircuits = Math.ceil(totalLights / 10);
    const dbWays = socketCircuits + lightCircuits + totalACPoints + 4;
    items.push({
      id: 'mep_elec_db',
      category: 'mep',
      name: { ar: `لوحة توزيع DB (${dbWays} خط)`, en: `Distribution Board (${dbWays} ways)`, fr: `Tableau de distribution (${dbWays})`, zh: `配电箱 (${dbWays}路)` },
      unit: 'لوحة',
      netQty: Math.ceil(bp.floors.length),
      wastePercent: 0,
      grossQty: Math.ceil(bp.floors.length),
      procurementQty: Math.ceil(bp.floors.length),
      notes: `${socketCircuits} دوائر أفياش + ${lightCircuits} إنارة + ${totalACPoints} تكييف + 4 خاصة`,
    });

    // === G6: MDB رئيسية + محول (للمشاريع التجارية) ===
    const totalLoadW = (totalSockets * 200) + (totalLights * 100) + (totalACPoints * 3500);
    const totalLoadKVA = round2(totalLoadW / 1000 * 0.8); // demand factor 0.8
    if (totalLoadKVA > 50) {
      // محول — مشاريع > 50 KVA
      const transformerSize = totalLoadKVA <= 100 ? 100 : totalLoadKVA <= 250 ? 250 : totalLoadKVA <= 500 ? 500 : 1000;
      items.push({
        id: 'mep_elec_transformer',
        category: 'mep',
        name: { ar: `محول كهرباء ${transformerSize} KVA`, en: `Electrical Transformer ${transformerSize} KVA`, fr: `Transformateur ${transformerSize} KVA`, zh: `变压器 ${transformerSize}KVA` },
        unit: 'عدد',
        netQty: 1,
        wastePercent: 0,
        grossQty: 1,
        procurementQty: 1,
        notes: `SEC — حمل إجمالي ${totalLoadKVA} KVA — محول ${transformerSize} KVA`,
      });
    }
    items.push({
      id: 'mep_elec_mdb',
      category: 'mep',
      name: { ar: `لوحة رئيسية MDB (${round2(totalLoadKVA)} KVA)`, en: `Main Distribution Board (${round2(totalLoadKVA)} KVA)`, fr: 'Tableau général', zh: '总配电柜' },
      unit: 'لوحة',
      netQty: 1,
      wastePercent: 0,
      grossQty: 1,
      procurementQty: 1,
      notes: `SBC 401 — حمل ${round2(totalLoadKVA)} KVA — قاطع رئيسي ${bp.mepConfig.electrical.mainBreakerAmps}A`,
    });

    // === G14: نظام تأريض كهربائي — SBC 401 إلزامي ===
    const earthElectrodes = Math.max(2, Math.ceil(totalFloorArea / 200)); // قضيب لكل 200م²
    items.push({
      id: 'mep_elec_earthing',
      category: 'mep',
      name: { ar: 'نظام تأريض كهربائي (أقطاب + كابل نحاس)', en: 'Earthing System (Electrodes + Copper Cable)', fr: 'Mise à la terre', zh: '接地系统' },
      unit: 'مجموعة',
      netQty: 1,
      wastePercent: 0,
      grossQty: 1,
      procurementQty: 1,
      notes: `SBC 401 إلزامي — ${earthElectrodes} قضيب نحاسي Ø16mm × 3م + كابل 35mm² — مقاومة ≤ 5Ω`,
    });
  }

  // --- Plumbing (SBC 1102 — دليل المقاولين) ---
  if (bp.mepConfig.plumbing) {
    const wetRooms = bp.roomFinishes?.filter(r => ['bathroom', 'kitchen'].includes(r.roomType)) || [];
    const totalWetArea = wetRooms.reduce((s, r) => s + r.length * r.width, 0);
    const bathroomCount = wetRooms.filter(r => r.roomType === 'bathroom').length;
    const kitchenCount = wetRooms.filter(r => r.roomType === 'kitchen').length;

    // Supply pipe lengths — SBC 1102; Section 2903
    const supplyLength = totalWetArea * 1.2; // 1.2 m/m² cold
    const hotLength = totalWetArea * 0.8; // 0.8 m/m² hot
    const drainLength = totalWetArea * 0.9; // 0.9 m/m² drain
    // Vent pipes — SBC 1102; Section 3113 (min Ø30mm, ≥ 50% of drain diameter)
    const ventLength = totalWetArea * 0.3; // 0.3 m/m² vent

    items.push({
      id: 'mep_plumb_supply',
      category: 'mep',
      name: { ar: `مواسير تغذية PPR Ø${bp.mepConfig.plumbing.mainLineSize_mm || 25}mm — SBC 1102`, en: `PPR Supply Pipes Ø${bp.mepConfig.plumbing.mainLineSize_mm || 25}mm`, fr: 'Tubes PPR alimentation', zh: 'PPR给水管' },
      unit: 'م.ط',
      netQty: round2(supplyLength + hotLength),
      wastePercent: 10,
      grossQty: round2((supplyLength + hotLength) * 1.10),
      procurementQty: round2((supplyLength + hotLength) * 1.10),
      notes: `باردة ${round2(supplyLength)}م + ساخنة ${round2(hotLength)}م — أقل ضغط 55 kPa (Table 29-4)`,
    });

    items.push({
      id: 'mep_plumb_drain',
      category: 'mep',
      name: { ar: 'مواسير صرف UPVC (DWV) — SBC 1102', en: 'UPVC Drain Pipes (DWV)', fr: 'Tubes UPVC évacuation', zh: 'UPVC排水管' },
      unit: 'م.ط',
      netQty: round2(drainLength),
      wastePercent: 10,
      grossQty: round2(drainLength * 1.10),
      procurementQty: round2(drainLength * 1.10),
      notes: `ميول ≥ 2% لأنابيب ≤60مم، ≥ 1% لأنابيب ≥80مم — SBC 1102; Section 3005.3`,
    });

    // Vent pipe — SBC 1102; Section 3113
    items.push({
      id: 'mep_plumb_vent',
      category: 'mep',
      name: { ar: 'أنابيب تنفيس صرف PVC Ø50mm — SBC 1102', en: 'PVC Vent Pipes Ø50mm', fr: 'Tubes ventilation', zh: 'PVC通气管' },
      unit: 'م.ط',
      netQty: round2(ventLength),
      wastePercent: 10,
      grossQty: round2(ventLength * 1.10),
      procurementQty: round2(ventLength * 1.10),
      notes: `أدنى Ø30mm أو نصف قطر أنبوب الصرف — SBC 1102; Section 3113`,
    });

    // Fixtures count — SBC 1102; Table 30-5 DFU groups
    const totalFixtures = bathroomCount * 4 + kitchenCount * 3; // toilet+basin+shower+drain per bath, sink+dishwasher+drain per kitchen
    items.push({
      id: 'mep_plumb_fixtures',
      category: 'mep',
      name: { ar: `تركيبات صحية (${totalFixtures} نقطة)`, en: `Plumbing Fixtures (${totalFixtures} points)`, fr: 'Appareils sanitaires', zh: '卫浴洁具' },
      unit: 'نقطة',
      netQty: totalFixtures,
      wastePercent: 0,
      grossQty: totalFixtures,
      procurementQty: totalFixtures,
      notes: `${bathroomCount} حمام (DFU=5/مجموعة) + ${kitchenCount} مطبخ (DFU=2/مجموعة) — SBC 1102; Table 30-5`,
    });

    // Water heater — SBC 1102; Sections 2801-2804
    items.push({
      id: 'mep_plumb_water_heater',
      category: 'mep',
      name: { ar: 'سخان مياه مركزي + صمام خلط ثرموستاتي — SBC 1102', en: 'Central Water Heater + Thermostatic Mixing Valve', fr: 'Chauffe-eau central', zh: '中央热水器' },
      unit: 'مجموعة',
      netQty: 1,
      wastePercent: 0,
      grossQty: 1,
      procurementQty: 1,
      notes: `حرارة ≤50°C (ASSE 1017) + محبس تخفيف (T&P) + RCD — SBC 1102; Section 2801-2804`,
    });

    // Tanks
    if (bp.mepConfig.plumbing.hasGroundTank) {
      items.push({
        id: 'mep_plumb_ground_tank',
        category: 'mep',
        name: { ar: `خزان أرضي ${bp.mepConfig.plumbing.groundTankLiters}L`, en: `Ground Tank ${bp.mepConfig.plumbing.groundTankLiters}L`, fr: 'Réservoir enterré', zh: '地下水箱' },
        unit: 'خزان',
        netQty: 1,
        wastePercent: 0,
        grossQty: 1,
        procurementQty: 1,
      });
    }
  }

  // --- HVAC ---
  if (bp.mepConfig.hvac) {
    const acRooms = bp.roomFinishes?.filter(r => !['bathroom', 'corridor', 'storage'].includes(r.roomType)) || [];
    let totalTons = 0;
    acRooms.forEach(r => {
      const area = r.length * r.width;
      const btu = area * 550; // avg BTU/m²
      totalTons += btu / 12000;
    });

    items.push({
      id: 'mep_hvac_units',
      category: 'mep',
      name: { ar: `وحدات تكييف سبلت (إجمالي ${round2(totalTons)} طن)`, en: `Split AC Units (Total ${round2(totalTons)} tons)`, fr: 'Climatisation split', zh: '分体空调' },
      unit: 'وحدة',
      netQty: acRooms.length,
      wastePercent: 0,
      grossQty: acRooms.length,
      procurementQty: acRooms.length,
      notes: `${acRooms.length} غرفة — إجمالي ${round2(totalTons)} طن تبريد`,
    });

    // Freon pipes (avg 8m per unit)
    const freonPipeLength = acRooms.length * 8;
    items.push({
      id: 'mep_hvac_freon_pipes',
      category: 'mep',
      name: { ar: 'أنابيب فريون نحاس معزولة', en: 'Insulated Copper Freon Pipes', fr: 'Tubes cuivre fréon', zh: '铜制冷剂管' },
      unit: 'م.ط',
      netQty: freonPipeLength,
      wastePercent: 5,
      grossQty: round2(freonPipeLength * 1.05),
      procurementQty: round2(freonPipeLength * 1.05),
    });

    // Condensate drain
    items.push({
      id: 'mep_hvac_condensate',
      category: 'mep',
      name: { ar: 'صرف مكثفات PVC Ø20mm', en: 'PVC Condensate Drain Ø20mm', fr: 'Évacuation condensats', zh: '冷凝水排水' },
      unit: 'م.ط',
      netQty: round2(freonPipeLength * 0.8),
      wastePercent: 5,
      grossQty: round2(freonPipeLength * 0.8 * 1.05),
      procurementQty: round2(freonPipeLength * 0.8 * 1.05),
    });
  }

  // === G13: صناديق تفتيش صرف — SBC 1102 ===
  if (bp.mepConfig.plumbing) {
    const wetRoomsForMH = bp.roomFinishes?.filter(r => ['bathroom', 'kitchen'].includes(r.roomType)) || [];
    const totalWetAreaMH = wetRoomsForMH.reduce((s, r) => s + r.length * r.width, 0);
    const drainLengthMH = totalWetAreaMH * 0.9;
    const manholeCount = Math.max(2, Math.ceil(drainLengthMH / 15));
    items.push({
      id: 'mep_plumb_manholes',
      category: 'mep',
      name: { ar: `صناديق تفتيش صرف (${manholeCount} صندوق)`, en: `Drainage Manholes (${manholeCount})`, fr: 'Regards de visite', zh: '检查井' },
      unit: 'صندوق',
      netQty: manholeCount,
      wastePercent: 0,
      grossQty: manholeCount,
      procurementQty: manholeCount,
      notes: `SBC 1102 — صندوق تفتيش كل 15م.ط صرف — 60×60سم خرساني أو PVC`,
    });
  }

  // === G7: Dynamic Cable Sizing — كابل رئيسي ديناميكي ===
  if (bp.mepConfig.electrical) {
    const roomLoadW = bp.roomFinishes
      ? bp.roomFinishes.reduce((s, r) => {
          const area = r.length * r.width;
          const roomLoad = ['bathroom', 'corridor', 'storage'].includes(r.roomType) ? area * 15 : area * 50;
          return s + roomLoad;
        }, 0)
      : totalFloorArea * 35;
    const totalAmps = round2(roomLoadW / 220);
    const mainCableSize = totalAmps <= 63 ? '10mm²' : totalAmps <= 100 ? '16mm²' : totalAmps <= 160 ? '35mm²' : totalAmps <= 250 ? '70mm²' : '95mm²';
    const mainCableLength = Math.ceil(Math.sqrt(totalFloorArea) * 2);

    items.push({
      id: 'mep_elec_main_cable',
      category: 'mep',
      name: { ar: `كابل رئيسي ${mainCableSize} (MDB → DB)`, en: `Main Feeder Cable ${mainCableSize}`, fr: 'Câble principal', zh: '主馈电缆' },
      unit: 'م.ط',
      netQty: mainCableLength,
      wastePercent: 10,
      grossQty: Math.ceil(mainCableLength * 1.10),
      procurementQty: Math.ceil(mainCableLength * 1.10),
      notes: `SBC 401 — حمل ${round2(roomLoadW/1000)}KW / ${totalAmps}A — مقاس ${mainCableSize} — voltage drop ≤ 3%`,
    });
  }

  return items;
}

// =================== v8.0 SECTION G1: Drop Beams — كمرات ساقطة ===================

function calculateDropBeams(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  if (bp.floors.length === 0) return items;

  let totalBeamConcreteVol = 0;
  let totalBeamSteelKg = 0;
  let totalBeamFormworkM2 = 0;

  bp.floors.forEach((floor, idx) => {
    // عدد الكمرات = عدد الأعمدة × 1.5 (كمرة بين كل عمودين تقريباً + كمرات إضافية)
    const colCount = floor.columnsCount || Math.ceil(floor.area / 16);
    const beamCount = Math.ceil(colCount * 1.5);

    // أبعاد الكمرة الساقطة: عرض 30سم × عمق 60سم (اسفل السقف)
    // الامتداد المتوسط = sqrt(مساحة الدور / عدد الكمرات)
    const avgSpan = Math.max(3, Math.min(8, Math.sqrt(floor.area / Math.max(1, beamCount)) * 1.2));
    const beamW = 0.30; // عرض 30 سم
    const beamDropD = 0.40; // عمق ساقط تحت السقف 40 سم (إجمالي مع السقف = 60 سم)

    // حجم خرسانة الكمرات
    const beamVol = beamCount * beamW * beamDropD * avgSpan;
    totalBeamConcreteVol += beamVol;

    // حديد الكمرات: نسبة تسليح 180 كجم/م³ (أعلى من الأسقف لأنها تتحمل أحمال مركزة)
    const beamSteel = beamVol * 180;
    totalBeamSteelKg += beamSteel;

    // شدة الكمرات: جانبين + قاع
    const beamFormwork = beamCount * ((beamDropD * 2) + beamW) * avgSpan;
    totalBeamFormworkM2 += beamFormwork;
  });

  if (totalBeamConcreteVol > 0) {
    items.push(makeConcreteItem('super_drop_beams', 'خرسانة كمرات ساقطة', 'Drop Beams Concrete', totalBeamConcreteVol, 5));

    const beamSteelTons = totalBeamSteelKg / 1000;
    items.push({
      id: 'super_drop_beams_steel',
      category: 'superstructure',
      name: { ar: 'حديد تسليح كمرات ساقطة', en: 'Drop Beams Rebar', fr: 'Armatures poutres', zh: '梁钢筋' },
      unit: 'طن',
      netQty: round2(beamSteelTons),
      wastePercent: WASTE_FACTORS.steel * 100,
      grossQty: round2(beamSteelTons * (1 + WASTE_FACTORS.steel)),
      procurementQty: round2(beamSteelTons * (1 + WASTE_FACTORS.steel)),
      notes: `نسبة تسليح 180 كجم/م³ — حديد رئيسي 4Ø16 + كانات Ø8@15سم — ACI 318`,
    });

    items.push({
      id: 'formwork_drop_beams',
      category: 'superstructure',
      name: { ar: 'شدة كمرات ساقطة', en: 'Drop Beams Formwork', fr: 'Coffrage poutres', zh: '梁模板' },
      unit: 'م2',
      netQty: round2(totalBeamFormworkM2),
      wastePercent: WASTE_FACTORS.plywood_formwork * 100,
      grossQty: round2(totalBeamFormworkM2 * (1 + WASTE_FACTORS.plywood_formwork)),
      procurementQty: Math.ceil((totalBeamFormworkM2 * (1 + WASTE_FACTORS.plywood_formwork)) / FORMWORK.plywood_area_m2 / FORMWORK.reuse_cycles),
      notes: `شدة جانبين + قاع — ${bp.floors.length} أدوار`,
    });
  }

  return items;
}

// =================== v8.0 SECTION G3: Stairs — درج مسلح ===================

function calculateStairs(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];
  const floorsCount = bp.floors.length;
  if (floorsCount <= 1) return items; // دور واحد لا يحتاج درج

  // عدد أجنحة الدرج = (عدد الأدوار - 1) × 2 (جناحين لكل دور)
  const flightsCount = (floorsCount - 1) * 2;
  const stairsCount = Math.max(1, Math.ceil(bp.floors[0]?.area / 300)); // درج لكل 300م²

  // أبعاد جناح الدرج القياسي
  const flightWidth = 1.20;       // عرض 1.20م (SBC minimum)
  const flightRun = 2.80;         // طول الجناح الأفقي
  const flightSlope = Math.sqrt(flightRun * flightRun + (bp.floors[0]?.height || 3.2) / 2 * (bp.floors[0]?.height || 3.2) / 2);
  const waistThickness = 0.18;    // سماكة البطنة 18 سم
  const landingLength = 1.50;     // طول البسطة
  const landingWidth = flightWidth * 2 + 0.20; // عرض البسطة

  // حساب خرسانة الدرج
  // بطنة الجناح + درجات (steps)
  const stepHeight = 0.17;        // ارتفاع الدرجة 17 سم
  const stepNose = 0.30;          // عرض القائمة 30 سم
  const stepsPerFlight = Math.ceil((bp.floors[0]?.height || 3.2) / 2 / stepHeight);
  const stepVolPerFlight = stepsPerFlight * (0.5 * stepHeight * stepNose * flightWidth); // مثلث
  const waistVolPerFlight = flightSlope * flightWidth * waistThickness;
  const landingVol = landingLength * landingWidth * 0.20; // بسطة 20 سم

  const totalConcretePerStair = (waistVolPerFlight + stepVolPerFlight + landingVol) * flightsCount;
  const totalStairsConcrete = totalConcretePerStair * stairsCount;

  items.push({
    id: 'stairs_concrete',
    category: 'superstructure',
    name: { ar: `خرسانة درج مسلح (${stairsCount} درج × ${flightsCount} جناح)`, en: `Stair Concrete (${stairsCount} stairs × ${flightsCount} flights)`, fr: 'Béton escalier', zh: '楼梯混凝土' },
    unit: 'م3',
    netQty: round2(totalStairsConcrete),
    wastePercent: 5,
    grossQty: round2(totalStairsConcrete * 1.05),
    procurementQty: round2(totalStairsConcrete * 1.05),
    notes: `${stepsPerFlight} درجة/جناح (${stepHeight * 100}سم × ${stepNose * 100}سم) — بطنة ${waistThickness * 100}سم — SBC 304`,
  });

  // حديد الدرج: 200 كجم/م³ (أعلى من الأسقف — الدرج عنصر مقاوم للزلازل)
  const stairsSteelTons = (totalStairsConcrete * 200) / 1000;
  items.push({
    id: 'stairs_steel',
    category: 'superstructure',
    name: { ar: 'حديد تسليح درج', en: 'Stair Rebar', fr: 'Armatures escalier', zh: '楼梯钢筋' },
    unit: 'طن',
    netQty: round2(stairsSteelTons),
    wastePercent: WASTE_FACTORS.steel * 100,
    grossQty: round2(stairsSteelTons * (1 + WASTE_FACTORS.steel)),
    procurementQty: round2(stairsSteelTons * (1 + WASTE_FACTORS.steel)),
    notes: `200 كجم/م³ — رئيسي Ø14@15 + توزيع Ø10@20 — ACI 318`,
  });

  // شدة الدرج
  const stairsFormwork = (flightSlope * flightWidth + landingLength * landingWidth) * flightsCount * stairsCount;
  items.push({
    id: 'formwork_stairs',
    category: 'superstructure',
    name: { ar: 'شدة درج', en: 'Stair Formwork', fr: 'Coffrage escalier', zh: '楼梯模板' },
    unit: 'م2',
    netQty: round2(stairsFormwork),
    wastePercent: 10,
    grossQty: round2(stairsFormwork * 1.10),
    procurementQty: Math.ceil((stairsFormwork * 1.10) / FORMWORK.plywood_area_m2 / FORMWORK.reuse_cycles),
    notes: `بطنة + بسطات + جوانب — ${flightsCount} جناح × ${stairsCount} درج`,
  });

  // درابزين (handrail) — عنصر سلامة إلزامي SBC
  const handrailLength = (flightSlope + landingLength) * flightsCount * stairsCount;
  items.push({
    id: 'stairs_handrail',
    category: 'superstructure',
    name: { ar: 'درابزين درج (حديد)', en: 'Stair Handrail (Steel)', fr: 'Garde-corps escalier', zh: '楼梯扶手' },
    unit: 'م.ط',
    netQty: round2(handrailLength),
    wastePercent: 5,
    grossQty: round2(handrailLength * 1.05),
    procurementQty: round2(handrailLength * 1.05),
    notes: `SBC — ارتفاع 90سم أدنى — حديد ملحوم + دهان`,
  });

  return items;
}

// =================== v8.0 SECTION G10: External Works — أعمال خارجية ===================

function calculateExternalWorks(bp: BlueprintConfig): CognitiveOutputItem[] {
  const items: CognitiveOutputItem[] = [];

  const plotPerimeter = (bp.plotWidth + bp.plotLength) * 2;
  const plotArea = bp.plotWidth * bp.plotLength;
  const buildableArea = getBuildableArea(bp);
  const openArea = Math.max(0, plotArea - buildableArea);

  // === 1. سور خارجي (Boundary Wall) ===
  if (plotPerimeter > 0) {
    const wallHeight = 3.0; // ارتفاع سور 3م قياسي
    const wallLength = plotPerimeter;
    // خرسانة أعمدة وميدات السور
    const fencePostSpacing = 3.0; // عمود كل 3م
    const postCount = Math.ceil(wallLength / fencePostSpacing);
    const postVolume = postCount * 0.25 * 0.25 * wallHeight;
    const tieBeamVol = (wallLength * 0.20 * 0.30) * 2; // ميدة علوية + سفلية
    const fenceConcreteVol = postVolume + tieBeamVol;

    items.push({
      id: 'ext_boundary_wall_concrete',
      category: 'external_works',
      name: { ar: 'خرسانة سور خارجي (أعمدة + ميدات)', en: 'Boundary Wall Concrete', fr: 'Béton clôture', zh: '围墙混凝土' },
      unit: 'م3',
      netQty: round2(fenceConcreteVol),
      wastePercent: 5,
      grossQty: round2(fenceConcreteVol * 1.05),
      procurementQty: round2(fenceConcreteVol * 1.05),
      notes: `${postCount} عمود × 25×25سم + ميدات 20×30سم — محيط ${round2(wallLength)}م`,
    });

    // بلك السور: 20سم
    const fenceWallArea = wallLength * wallHeight;
    const fenceBlocks = Math.ceil(fenceWallArea * 12.5 * 1.07);
    items.push({
      id: 'ext_boundary_wall_blocks',
      category: 'external_works',
      name: { ar: `بلك سور خارجي 20سم (${round2(fenceWallArea)}م²)`, en: 'Boundary Wall Blocks 20cm', fr: 'Blocs clôture', zh: '围墙砌块' },
      unit: 'حبة',
      netQty: fenceBlocks,
      wastePercent: 7,
      grossQty: Math.ceil(fenceBlocks * 1.07),
      procurementQty: Math.ceil(fenceBlocks * 1.07),
      notes: `${round2(fenceWallArea)}م² × 12.5 بلوكة/م² — ارتفاع ${wallHeight}م`,
    });
  }

  // === 2. مظلات سيارات (Car Shades) ===
  if (openArea > 30) {
    const parkingSpaces = Math.max(1, Math.floor(openArea / 25)); // 25م² لكل موقف
    const shadeArea = parkingSpaces * 15; // 15م² مظلة لكل موقف
    items.push({
      id: 'ext_car_shades',
      category: 'external_works',
      name: { ar: `مظلات سيارات (${parkingSpaces} موقف)`, en: `Car Shades (${parkingSpaces} spaces)`, fr: 'Ombrières parking', zh: '车棚' },
      unit: 'م2',
      netQty: round2(shadeArea),
      wastePercent: 0,
      grossQty: round2(shadeArea),
      procurementQty: round2(shadeArea),
      notes: `${parkingSpaces} موقف × 15م²/موقف — PVC أو حديد`,
    });
  }

  // === 3. إنترلوك / بلاط خارجي ===
  if (openArea > 10) {
    const pavingArea = openArea * 0.60; // 60% من المساحة المفتوحة
    items.push({
      id: 'ext_interlocking',
      category: 'external_works',
      name: { ar: 'بلاط إنترلوك خارجي', en: 'Interlocking Pavers', fr: 'Pavés autobloquants', zh: '联锁铺路砖' },
      unit: 'م2',
      netQty: round2(pavingArea),
      wastePercent: 8,
      grossQty: round2(pavingArea * 1.08),
      procurementQty: round2(pavingArea * 1.08),
      notes: `60% من المساحة المفتوحة (${round2(openArea)}م²) — سماكة 6سم + رمل`,
    });
  }

  // === 4. تنسيق حدائق ===
  if (openArea > 20) {
    const landscapeArea = openArea * 0.25; // 25% من المساحة المفتوحة
    items.push({
      id: 'ext_landscaping',
      category: 'external_works',
      name: { ar: 'تنسيق حدائق (عشب + أشجار)', en: 'Landscaping (Grass + Trees)', fr: 'Aménagement paysager', zh: '园林绿化' },
      unit: 'م2',
      netQty: round2(landscapeArea),
      wastePercent: 0,
      grossQty: round2(landscapeArea),
      procurementQty: round2(landscapeArea),
      notes: `25% من المساحة المفتوحة — عشب صناعي أو طبيعي + أشجار`,
    });
  }

  // === 5. إنارة خارجية ===
  if (plotPerimeter > 0) {
    const lightPoles = Math.max(2, Math.ceil(plotPerimeter / 10)); // عمود كل 10م
    items.push({
      id: 'ext_lighting',
      category: 'external_works',
      name: { ar: `أعمدة إنارة خارجية (${lightPoles} عمود)`, en: `External Lighting Poles (${lightPoles})`, fr: 'Éclairage extérieur', zh: '室外照明' },
      unit: 'عمود',
      netQty: lightPoles,
      wastePercent: 0,
      grossQty: lightPoles,
      procurementQty: lightPoles,
      notes: `عمود LED كل 10م — ارتفاع 4م — مع كابل أرضي`,
    });
  }

  return items;
}

// =================== Utility Helpers ===================

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function getBuildableArea(bp: BlueprintConfig): number {
  const w = bp.plotWidth - (bp.setbackSide * 2);
  const l = bp.plotLength - bp.setbackFront - (bp.setbackRear || 2);
  return Math.max(0, w * l);
}

function makeConcreteItem(id: string, nameAr: string, nameEn: string, volume: number, wastePercent: number): CognitiveOutputItem {
  return {
    id,
    category: id.startsWith('sub_') ? 'substructure' : 'superstructure',
    name: { ar: nameAr, en: nameEn, fr: nameEn, zh: nameEn },
    unit: 'م3',
    netQty: round2(volume),
    wastePercent,
    grossQty: round2(volume * (1 + wastePercent / 100)),
    procurementQty: round2(volume * (1 + wastePercent / 100)),
  };
}

function isTileMaterial(m: FinishMaterial): boolean {
  return ['ceramic_60x60', 'ceramic_30x60', 'porcelain_120x60', 'marble', 'granite'].includes(m);
}

function isPaintMaterial(m: FinishMaterial): boolean {
  return ['paint_plastic', 'paint_velvet'].includes(m);
}

function getDirectionAr(d: string): string {
  const map: Record<string, string> = { north: 'شمالية', south: 'جنوبية', east: 'شرقية', west: 'غربية' };
  return map[d] || d;
}

function getFacadeFinishName(t: FacadeFinishType): Record<Language, string> {
  const map: Record<FacadeFinishType, Record<Language, string>> = {
    stone_mechanical: { ar: 'حجر ميكانيكي', en: 'Mechanical Stone', fr: 'Pierre mécanique', zh: '干挂石材' },
    stone_glued: { ar: 'حجر لصق', en: 'Glued Stone', fr: 'Pierre collée', zh: '湿贴石材' },
    profile_paint: { ar: 'دهان بروفايل', en: 'Profile Paint', fr: 'Peinture profil', zh: '外墙涂料' },
    grc: { ar: 'ألواح GRC', en: 'GRC Panels', fr: 'Panneaux GRC', zh: 'GRC板' },
    glass_curtain: { ar: 'حائط ستائري زجاج', en: 'Glass Curtain Wall', fr: 'Mur-rideau vitré', zh: '玻璃幕墙' },
    cladding_alucobond: { ar: 'كلادينج ألوكوبوند', en: 'Alucobond Cladding', fr: 'Bardage Alucobond', zh: '铝塑板' },
    plaster_paint: { ar: 'لياسة ودهان', en: 'Plaster & Paint', fr: 'Enduit et peinture', zh: '抹灰涂料' },
  };
  return map[t] || { ar: t, en: t, fr: t, zh: t };
}

// =================== v9.0 Price Intelligence Helpers ===================

/** جدول تفكيك أسعار الخرسانة لكل عنصر إنشائي */
const CONCRETE_BREAKDOWN: Record<string, { concrete: number; steelKg: number; formwork: number; pump: number; labor: number; consumables: number }> = {
  blinding:   { concrete: 250, steelKg: 0,   formwork: 0,   pump: 30, labor: 50,  consumables: 0 },
  footing:    { concrete: 265, steelKg: 100, formwork: 75,  pump: 40, labor: 120, consumables: 18 },
  raft:       { concrete: 265, steelKg: 112, formwork: 45,  pump: 40, labor: 100, consumables: 15 },
  column:     { concrete: 265, steelKg: 230, formwork: 125, pump: 45, labor: 180, consumables: 24 },
  neck:       { concrete: 265, steelKg: 230, formwork: 125, pump: 45, labor: 200, consumables: 24 },
  beam:       { concrete: 265, steelKg: 180, formwork: 125, pump: 45, labor: 150, consumables: 20 },
  slab:       { concrete: 265, steelKg: 120, formwork: 100, pump: 45, labor: 130, consumables: 18 },
  sog:        { concrete: 265, steelKg: 90,  formwork: 0,   pump: 40, labor: 100, consumables: 15 },
  wall:       { concrete: 265, steelKg: 140, formwork: 100, pump: 45, labor: 200, consumables: 22 },
  stair:      { concrete: 265, steelKg: 200, formwork: 75,  pump: 45, labor: 150, consumables: 20 },
  dropbeam:   { concrete: 265, steelKg: 160, formwork: 125, pump: 45, labor: 150, consumables: 20 },
};

/** سعر الكيلو حديد (ر.س) */
const STEEL_PRICE_PER_KG = 3.2;

/** بناء تفكيك سعر الخرسانة */
function buildConcreteBreakdown(elementType: string): PriceComponent[] {
  const bd = CONCRETE_BREAKDOWN[elementType];
  if (!bd) return [];
  const steelCost = round2(bd.steelKg * STEEL_PRICE_PER_KG);
  const total = bd.concrete + steelCost + bd.formwork + bd.pump + bd.labor + bd.consumables;
  return [
    { label: { ar: 'خرسانة جاهزة', en: 'Ready-mix Concrete', fr: 'Béton prêt', zh: '商品混凝土' }, unitCost: bd.concrete, percentage: round2((bd.concrete / total) * 100), type: 'material' },
    ...(steelCost > 0 ? [{ label: { ar: `حديد تسليح (${bd.steelKg} كجم/م³)`, en: `Rebar (${bd.steelKg} kg/m³)`, fr: `Armature (${bd.steelKg} kg/m³)`, zh: `钢筋 (${bd.steelKg} kg/m³)` }, unitCost: steelCost, percentage: round2((steelCost / total) * 100), type: 'material' as const }] : []),
    ...(bd.formwork > 0 ? [{ label: { ar: 'شدة خشبية', en: 'Formwork', fr: 'Coffrage', zh: '模板' }, unitCost: bd.formwork, percentage: round2((bd.formwork / total) * 100), type: 'material' as const }] : []),
    { label: { ar: 'صب ومضخة', en: 'Pouring & Pump', fr: 'Coulage et pompe', zh: '浇筑和泵' }, unitCost: bd.pump, percentage: round2((bd.pump / total) * 100), type: 'equipment' },
    { label: { ar: 'أجور عمالة', en: 'Labor', fr: 'Main-d\'oeuvre', zh: '人工' }, unitCost: bd.labor, percentage: round2((bd.labor / total) * 100), type: 'labor' },
    ...(bd.consumables > 0 ? [{ label: { ar: 'مستهلكات', en: 'Consumables', fr: 'Consommables', zh: '耗材' }, unitCost: bd.consumables, percentage: round2((bd.consumables / total) * 100), type: 'consumable' as const }] : []),
  ];
}

/** كشف المعدات المطلوبة */
function detectEquipment(zone: ElevationZone, category: string, itemId: string): EquipmentRequirement[] {
  const equip: EquipmentRequirement[] = [];
  if (zone === 'elevated' && (category === 'superstructure' || category === 'facades')) {
    equip.push({ name: { ar: 'رافعة برجية', en: 'Tower Crane', fr: 'Grue à tour', zh: '塔吊' }, type: 'crane', costPerUnit: 25, reason: 'نقل المواد للأدوار العليا' });
  }
  if (zone === 'roof' || (category === 'finishes' && (itemId.includes('ceiling') || itemId.includes('gypsum')))) {
    equip.push({ name: { ar: 'سقالة داخلية', en: 'Internal Scaffolding', fr: 'Échafaudage intérieur', zh: '内部脚手架' }, type: 'scaffolding', costPerUnit: 10, reason: 'العمل فوق الرأس (أسقف)' });
  }
  if (zone === 'external' && category === 'facades') {
    equip.push({ name: { ar: 'مانليفت / سقالة خارجية', en: 'Manlift / External Scaffolding', fr: 'Nacelle élévatrice', zh: '升降平台' }, type: 'manlift', costPerUnit: 20, reason: 'العمل على ارتفاع خارجي' });
  }
  return equip;
}

/** بناء نطاق البند */
function buildScopeTag(category: string, itemId: string): ScopeTag {
  // Concrete items are always turnkey (includes everything)
  if (category === 'substructure' || category === 'superstructure' || category === 'dropBeams' || category === 'stairs') {
    return {
      scope: 'turnkey',
      includes: ['خرسانة', 'حديد', 'شدة خشبية', 'صب ومضخة', 'عمالة'],
      excludes: [],
      label: { ar: 'توريد وتنفيذ (شامل)', en: 'Supply & Install (Turnkey)', fr: 'Fourniture & Installation', zh: '包工包料' },
    };
  }
  if (category === 'finishes' || category === 'facades' || category === 'masonry' || category === 'insulation' || category === 'waterproofing') {
    return {
      scope: 'supply_install',
      includes: ['مواد', 'مصنعية'],
      excludes: [],
      label: { ar: 'توريد وتنفيذ', en: 'Supply & Install', fr: 'Fourniture & Installation', zh: '包工包料' },
    };
  }
  if (category === 'consumables') {
    return {
      scope: 'supply_only',
      includes: ['مواد خام'],
      excludes: ['مصنعية'],
      label: { ar: 'توريد فقط', en: 'Supply Only', fr: 'Fourniture uniquement', zh: '仅供应' },
    };
  }
  return {
    scope: 'supply_install',
    includes: ['مواد', 'مصنعية'],
    excludes: [],
    label: { ar: 'توريد وتنفيذ', en: 'Supply & Install', fr: 'Fourniture & Installation', zh: '包工包料' },
  };
}

/** تحديد موقع العمل بناءً على القسم والطابق */
function getElevationZone(category: string, itemId: string): ElevationZone {
  if (category === 'excavation' || category === 'substructure') return 'underground';
  if (category === 'externalWorks' || category === 'external_works') return 'external';
  if (category === 'facades') return 'external';
  if (itemId.includes('ceiling') || itemId.includes('gypsum') || itemId.includes('roof')) return 'roof';
  if (category === 'superstructure' || category === 'dropBeams') return 'elevated';
  return 'ground';
}

/** إثراء جميع البنود بالبيانات الذكية (v9.0) */
export function enrichAllItems(items: CognitiveOutputItem[]): CognitiveOutputItem[] {
  return items.map(item => {
    const zone = getElevationZone(item.category, item.id);
    const scope = buildScopeTag(item.category, item.id);
    const equip = detectEquipment(zone, item.category, item.id);

    // Build price breakdown for concrete items
    let breakdown: PriceComponent[] | undefined;
    if (item.category === 'substructure' || item.category === 'superstructure' || item.category === 'dropBeams' || item.category === 'stairs') {
      // Determine concrete element type from item ID
      let elementType = 'slab'; // default
      if (item.id.includes('blinding') || item.id.includes('lean')) elementType = 'blinding';
      else if (item.id.includes('footing') || item.id.includes('foot')) elementType = 'footing';
      else if (item.id.includes('raft') || item.id.includes('mat')) elementType = 'raft';
      else if (item.id.includes('column') || item.id.includes('col')) elementType = 'column';
      else if (item.id.includes('neck')) elementType = 'neck';
      else if (item.id.includes('beam') || item.id.includes('girder')) elementType = 'beam';
      else if (item.id.includes('wall') || item.id.includes('shear')) elementType = 'wall';
      else if (item.id.includes('stair') || item.id.includes('ramp')) elementType = 'stair';
      else if (item.id.includes('sog') || item.id.includes('ground_slab')) elementType = 'sog';
      else if (item.id.includes('dropbeam')) elementType = 'dropbeam';

      if (item.unit === 'م3') {
        breakdown = buildConcreteBreakdown(elementType);
        // Update scope to include specific details
        if (breakdown.length > 0) {
          const steelComp = breakdown.find(b => b.label.ar.includes('حديد'));
          if (steelComp) {
            scope.includes = ['خرسانة C30', steelComp.label.ar, 'شدة خشبية', 'صب ومضخة', 'عمالة'];
          }
        }
      }
    }

    return {
      ...item,
      elevationZone: zone,
      scopeTag: scope,
      priceBreakdown: breakdown,
      equipmentNeeded: equip.length > 0 ? equip : undefined,
    };
  });
}
