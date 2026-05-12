/**
 * ARBA-Ops v6.2 — Engineering Constants Database
 * قاعدة بيانات الثوابت الهندسية الشاملة
 *
 * المصادر:
 *  - كود البناء السعودي SBC 304 (خرسانة مسلحة) — مبني على ACI 318
 *  - كود البناء السعودي SBC 1101-1102 (سكني — دليل المقاولين الشامل)
 *  - كود البناء السعودي SBC 401 (كهرباء) — مبني على IEC 60364
 *  - معايير السوق السعودي (SASO)
 *  - شركة الكهرباء السعودية (SEC) — جداول الأحمال
 */

// =====================================================================
// 1. حديد التسليح — Reinforcement Steel (SBC 304 / ACI 318)
// =====================================================================

/** وزن متر طولي من الحديد حسب القطر — D²/162 */
export const REBAR_WEIGHT_KG_PER_M: Record<number, number> = {
  6:   0.222,
  8:   0.395,
  10:  0.617,
  12:  0.888,
  14:  1.210,
  16:  1.580,
  18:  2.000,
  20:  2.470,
  22:  2.980,
  25:  3.850,
  28:  4.830,
  32:  6.310,
};

/** مساحة مقطع القضيب (سم²) */
export const REBAR_AREA_CM2: Record<number, number> = {
  6:   0.283,
  8:   0.503,
  10:  0.785,
  12:  1.131,
  14:  1.539,
  16:  2.011,
  18:  2.545,
  20:  3.142,
  22:  3.801,
  25:  4.909,
  28:  6.158,
  32:  8.042,
};

/** أطوال القضبان القياسية في السوق السعودي (متر) */
export const STANDARD_BAR_LENGTHS = [6, 9, 12];

// =====================================================================
// 2. تفاصيل العناصر الإنشائية — Structural Element Defaults
// =====================================================================

/** مقاسات الأعمدة الافتراضية حسب عدد الأدوار — SBC 304 */
export interface ColumnSpec {
  width_cm: number;      // عرض العمود
  depth_cm: number;      // عمق العمود
  mainBars: number;      // عدد القضبان الرئيسية
  mainDia_mm: number;    // قطر الحديد الرئيسي
  stirrupDia_mm: number; // قطر الكانة
  stirrupSpacing_cm: number; // تباعد الكانات
  coverDepth_mm: number; // غطاء خرساني
  rebarRatio: number;    // نسبة التسليح (%)
}

/** مقاسات الأعمدة حسب عدد الأدوار — فيلا سكنية */
export const COLUMN_SPECS: Record<string, ColumnSpec> = {
  /** 1-2 أدوار */
  small: {
    width_cm: 25, depth_cm: 40,
    mainBars: 6, mainDia_mm: 14,
    stirrupDia_mm: 8, stirrupSpacing_cm: 20,
    coverDepth_mm: 40, rebarRatio: 1.39,
  },
  /** 2-3 أدوار (الأكثر شيوعاً في الفلل) */
  medium: {
    width_cm: 30, depth_cm: 50,
    mainBars: 8, mainDia_mm: 16,
    stirrupDia_mm: 8, stirrupSpacing_cm: 15,
    coverDepth_mm: 40, rebarRatio: 1.07,
  },
  /** 3-4 أدوار */
  large: {
    width_cm: 30, depth_cm: 60,
    mainBars: 10, mainDia_mm: 18,
    stirrupDia_mm: 10, stirrupSpacing_cm: 15,
    coverDepth_mm: 40, rebarRatio: 1.41,
  },
  /** أبراج / أحمال عالية */
  xlarge: {
    width_cm: 40, depth_cm: 70,
    mainBars: 12, mainDia_mm: 20,
    stirrupDia_mm: 10, stirrupSpacing_cm: 12,
    coverDepth_mm: 50, rebarRatio: 1.34,
  },
};

/** اختيار مقاس العمود حسب عدد الطوابق */
export function getColumnSpec(floorsCount: number): ColumnSpec {
  if (floorsCount <= 2) return COLUMN_SPECS.small;
  if (floorsCount <= 3) return COLUMN_SPECS.medium;
  if (floorsCount <= 4) return COLUMN_SPECS.large;
  return COLUMN_SPECS.xlarge;
}

/** تفاصيل الجسور / الكمرات (Beams) */
export interface BeamSpec {
  width_cm: number;
  depth_cm: number;
  topBars: number;
  topDia_mm: number;
  bottomBars: number;
  bottomDia_mm: number;
  stirrupDia_mm: number;
  stirrupSpacing_middle_cm: number;   // تباعد وسط البحر
  stirrupSpacing_support_cm: number;  // تباعد عند الركائز (أقل = أقوى)
  coverDepth_mm: number;
}

export const BEAM_SPECS: Record<string, BeamSpec> = {
  /** ميدة / جسر ربط (Tie Beam / Grade Beam) */
  tie_beam: {
    width_cm: 30, depth_cm: 60,
    topBars: 3, topDia_mm: 14,
    bottomBars: 3, bottomDia_mm: 16,
    stirrupDia_mm: 8, stirrupSpacing_middle_cm: 20, stirrupSpacing_support_cm: 10,
    coverDepth_mm: 40,
  },
  /** كمرة ساقطة (Drop Beam) */
  drop_beam: {
    width_cm: 25, depth_cm: 50,
    topBars: 2, topDia_mm: 14,
    bottomBars: 3, bottomDia_mm: 16,
    stirrupDia_mm: 8, stirrupSpacing_middle_cm: 20, stirrupSpacing_support_cm: 10,
    coverDepth_mm: 40,
  },
  /** كمرة مخفية (Hidden/Flat Beam) */
  hidden_beam: {
    width_cm: 60, depth_cm: 25,
    topBars: 3, topDia_mm: 12,
    bottomBars: 4, bottomDia_mm: 16,
    stirrupDia_mm: 8, stirrupSpacing_middle_cm: 15, stirrupSpacing_support_cm: 10,
    coverDepth_mm: 30,
  },
};

/** تفاصيل القواعد (Footings) */
export interface FootingSpec {
  mainDia_mm: number;         // قطر الحديد
  spacing_cm: number;         // التباعد
  coverDepth_mm: number;      // الغطاء الخرساني
  direction: 'both';          // الاتجاه (دائماً اتجاهين)
  minRebarRatio: number;      // نسبة التسليح الدنيا = 0.0018 (ACI 318)
}

export const FOOTING_SPECS: Record<string, FootingSpec> = {
  isolated: {
    mainDia_mm: 12, spacing_cm: 12,
    coverDepth_mm: 75, direction: 'both', minRebarRatio: 0.0018,
  },
  strip: {
    mainDia_mm: 14, spacing_cm: 15,
    coverDepth_mm: 75, direction: 'both', minRebarRatio: 0.0018,
  },
  raft: {
    mainDia_mm: 16, spacing_cm: 15,
    coverDepth_mm: 75, direction: 'both', minRebarRatio: 0.0018,
  },
};

/** تفاصيل السقف (Slab Rebar) */
export interface SlabRebarSpec {
  mainDia_mm: number;
  spacing_cm: number;         // التباعد
  secondaryDia_mm: number;    // حديد ثانوي (توزيع)
  secondarySpacing_cm: number;
  coverDepth_mm: number;
}

export const SLAB_REBAR_SPECS: Record<string, SlabRebarSpec> = {
  solid: {
    mainDia_mm: 12, spacing_cm: 15,
    secondaryDia_mm: 10, secondarySpacing_cm: 20,
    coverDepth_mm: 25,
  },
  hordi: {
    mainDia_mm: 12, spacing_cm: 20,
    secondaryDia_mm: 8, secondarySpacing_cm: 25,
    coverDepth_mm: 25,
  },
  flat: {
    mainDia_mm: 14, spacing_cm: 15,
    secondaryDia_mm: 12, secondarySpacing_cm: 20,
    coverDepth_mm: 25,
  },
  waffle: {
    mainDia_mm: 14, spacing_cm: 15,
    secondaryDia_mm: 10, secondarySpacing_cm: 20,
    coverDepth_mm: 25,
  },
};

/** رقاب الأعمدة (Neck Columns) */
export const NECK_COLUMN_SPEC = {
  width_cm: 30,
  depth_cm: 30,
  mainBars: 4,
  mainDia_mm: 14,
  stirrupDia_mm: 8,
  stirrupSpacing_cm: 15,
  coverDepth_mm: 40,
  defaultHeight_m: 0.50,
};

// =====================================================================
// 3. حساب طول الكانة — Stirrup Length Calculation
// =====================================================================

/** حساب طول كانة مستطيلة (هوك 135°) */
export function calculateStirrupLength(
  elementWidth_cm: number,
  elementDepth_cm: number,
  stirrupDia_mm: number,
  cover_mm: number,
): number {
  const hookLength_cm = 10 * (stirrupDia_mm / 10); // 10d hook
  const innerW = elementWidth_cm - (cover_mm / 10) * 2;
  const innerD = elementDepth_cm - (cover_mm / 10) * 2;
  const perimeter = (innerW + innerD) * 2;
  return (perimeter + hookLength_cm * 2) / 100; // Convert to meters
}

/** حساب عدد الكانات لعنصر */
export function calculateStirrupCount(
  elementLength_m: number,
  spacing_cm: number,
): number {
  return Math.ceil((elementLength_m * 100) / spacing_cm) + 1;
}

// =====================================================================
// 4. السباكة — Plumbing (SBC 1102 — دليل المقاولين)
// =====================================================================

export type PlumbingFixtureType =
  'toilet' | 'washbasin' | 'shower' | 'bathtub' |
  'bidet' | 'kitchen_sink' | 'laundry_sink' |
  'washing_machine' | 'dishwasher' | 'floor_drain';

/**
 * وحدات التصريف والتغذية لكل جهاز صحي
 * المصادر:
 *  - DFU: SBC 1102; Table 30-5 (Drainage Fixture Unit Values)
 *  - WSFU: SBC 1102; Table 29-6 (Water-Supply Fixture-Unit Values)
 *  - Flow rates: SBC 1102; Table 29-4 (Required Capacities at Point of Outlet)
 *  - Trap sizes: SBC 1102; Table 32-1 (Size of Traps for Plumbing Fixtures)
 *  - Tail-piece: SBC 1102; Section 2703
 */
export const PLUMBING_FIXTURE_DATA: Record<PlumbingFixtureType, {
  dfu: number;            // Drainage Fixture Units — SBC 1102 Table 30-5
  wsfu_cold: number;      // Water Supply Fixture Units (بارد) — Table 29-6
  wsfu_hot: number;       // Water Supply Fixture Units (ساخن) — Table 29-6
  wsfu_combined: number;  // WSFU مجمع — Table 29-6
  drain_mm: number;       // قطر الصرف الأدنى (مم) — Table 30-7
  supply_mm: number;      // قطر التغذية (مم) — Table 29-8
  trap_mm: number;        // مقاس المصيدة الأدنى (مم) — Table 32-1
  flowRate_lpm: number;   // معدل التدفق (لتر/دقيقة) — Table 29-4
  flowPressure_kpa: number; // ضغط التدفق (كيلو باسكال) — Table 29-4
  nameAr: string;
  nameEn: string;
  symbol: string;
}> = {
  toilet:           { dfu: 3, wsfu_cold: 8.3, wsfu_hot: 0,   wsfu_combined: 8.3,  drain_mm: 80,  supply_mm: 20, trap_mm: 80,  flowRate_lpm: 10.1, flowPressure_kpa: 138, nameAr: 'مرحاض غربي',   nameEn: 'WC (6L flush)',    symbol: '🚽' },
  washbasin:        { dfu: 1, wsfu_cold: 1.9, wsfu_hot: 1.9, wsfu_combined: 2.6,  drain_mm: 40,  supply_mm: 15, trap_mm: 30,  flowRate_lpm: 3.0,  flowPressure_kpa: 55,  nameAr: 'مغسلة حمام',   nameEn: 'Lavatory',         symbol: '🔵' },
  shower:           { dfu: 2, wsfu_cold: 3.8, wsfu_hot: 3.8, wsfu_combined: 5.3,  drain_mm: 50,  supply_mm: 20, trap_mm: 40,  flowRate_lpm: 9.4,  flowPressure_kpa: 138, nameAr: 'دش/شاور',      nameEn: 'Shower',           symbol: '🚿' },
  bathtub:          { dfu: 2, wsfu_cold: 3.8, wsfu_hot: 3.8, wsfu_combined: 5.3,  drain_mm: 50,  supply_mm: 20, trap_mm: 40,  flowRate_lpm: 15.1, flowPressure_kpa: 138, nameAr: 'بانيو',        nameEn: 'Bathtub',          symbol: '🛁' },
  bidet:            { dfu: 1, wsfu_cold: 1.9, wsfu_hot: 1.9, wsfu_combined: 2.6,  drain_mm: 40,  supply_mm: 15, trap_mm: 30,  flowRate_lpm: 7.5,  flowPressure_kpa: 138, nameAr: 'بيديه/شطاف',   nameEn: 'Bidet',            symbol: '💧' },
  kitchen_sink:     { dfu: 2, wsfu_cold: 3.8, wsfu_hot: 3.8, wsfu_combined: 5.3,  drain_mm: 50,  supply_mm: 20, trap_mm: 40,  flowRate_lpm: 6.6,  flowPressure_kpa: 55,  nameAr: 'حوض مطبخ',     nameEn: 'Kitchen Sink',     symbol: '🍳' },
  laundry_sink:     { dfu: 2, wsfu_cold: 3.8, wsfu_hot: 3.8, wsfu_combined: 5.3,  drain_mm: 50,  supply_mm: 20, trap_mm: 40,  flowRate_lpm: 15.1, flowPressure_kpa: 55,  nameAr: 'حوض غسيل',     nameEn: 'Laundry Tub',      symbol: '🧺' },
  washing_machine:  { dfu: 2, wsfu_cold: 3.8, wsfu_hot: 3.8, wsfu_combined: 5.3,  drain_mm: 50,  supply_mm: 20, trap_mm: 50,  flowRate_lpm: 15.1, flowPressure_kpa: 55,  nameAr: 'غسالة ملابس',  nameEn: 'Clothes Washer',   symbol: '🔄' },
  dishwasher:       { dfu: 2, wsfu_cold: 5.3, wsfu_hot: 0,   wsfu_combined: 5.3,  drain_mm: 50,  supply_mm: 15, trap_mm: 40,  flowRate_lpm: 10.4, flowPressure_kpa: 55,  nameAr: 'غسالة صحون',   nameEn: 'Dishwasher',       symbol: '🍽️' },
  floor_drain:      { dfu: 0, wsfu_cold: 0,   wsfu_hot: 0,   wsfu_combined: 0,    drain_mm: 50,  supply_mm: 0,  trap_mm: 50,  flowRate_lpm: 0,    flowPressure_kpa: 0,   nameAr: 'بلاعة أرضية',  nameEn: 'Floor Drain',      symbol: '⚫' },
};

/**
 * مجموعات الحمام — SBC 1102; Table 30-5
 * قيم DFU المخفضة للمجموعات (أقل من المجموع الفردي)
 */
export const FIXTURE_GROUP_DFU: Record<string, number> = {
  full_bath_6L:  5,   // حمام كامل (مرحاض 6 لتر + مغسلة + بانيو/دش) — Table 30-5
  full_bath_gt6L: 6,  // حمام كامل (مرحاض > 6 لتر)
  half_bath_6L:  4,   // نصف حمام (مرحاض 6 لتر + مغسلة)
  half_bath_gt6L: 5,  // نصف حمام (مرحاض > 6 لتر)
  kitchen_group: 2,   // مجموعة مطبخ (غسالة صحون + حوض)
  laundry_group: 3,   // مجموعة غسيل (غسالة + حوض)
};

/** الأجهزة الافتراضية حسب نوع الغرفة */
export const DEFAULT_FIXTURES_BY_ROOM: Record<string, PlumbingFixtureType[]> = {
  bathroom:  ['toilet', 'washbasin', 'shower', 'floor_drain'],
  kitchen:   ['kitchen_sink', 'dishwasher', 'floor_drain'],
  laundry:   ['laundry_sink', 'washing_machine', 'floor_drain'],
  service:   ['floor_drain'],
  majlis:    [],
  living:    [],
  bedroom:   [],
  office:    [],
  corridor:  [],
  storage:   [],
};

/**
 * أقطار مواسير الصرف حسب DFU — SBC 1102; Table 30-7
 * Maximum Fixture Units Allowed on Branches and Stacks
 */
export const DRAIN_PIPE_SIZING_BRANCH: { maxDfu: number; diameter_mm: number }[] = [
  { maxDfu: 3,   diameter_mm: 40 },   // بدون مرحاض
  { maxDfu: 6,   diameter_mm: 50 },   // بدون مرحاض
  { maxDfu: 12,  diameter_mm: 60 },   // بدون مرحاض
  { maxDfu: 20,  diameter_mm: 80 },   // أول مقاس يسمح بمرحاض
  { maxDfu: 160, diameter_mm: 100 },
];

/**
 * أقطار صرف المبنى — SBC 1102; Table 30-8
 * Maximum Fixture Units on Building Drain/Sewer (ميول 2%)
 */
export const DRAIN_PIPE_SIZING_BUILDING: { maxDfu: number; diameter_mm: number; slope_pct: number }[] = [
  { maxDfu: 69,   diameter_mm: 50,  slope_pct: 2 },    // بدون مرحاض
  { maxDfu: 79,   diameter_mm: 60,  slope_pct: 2 },    // بدون مرحاض
  { maxDfu: 138,  diameter_mm: 75,  slope_pct: 2 },    // أول مقاس يسمح بمرحاض
  { maxDfu: 709,  diameter_mm: 100, slope_pct: 2 },
];

// Legacy alias for backward compatibility
export const DRAIN_PIPE_SIZING = DRAIN_PIPE_SIZING_BRANCH;

/**
 * ميول أنابيب الصرف الصحي — SBC 1102; Section 3005.3
 */
export const DRAIN_PIPE_SLOPES = {
  small_mm_per_m: 20.8,   // أنابيب ≤ 60 مم: ميول ≥ 2%
  large_mm_per_m: 10.4,   // أنابيب ≥ 80 مم: ميول ≥ 1%
};

/**
 * مسافة المصيدة من التنفيس — SBC 1102; Table 31-1
 */
export const TRAP_TO_VENT_DISTANCE: { trap_mm: number; slope_mm_per_m: number; maxDistance_m: number }[] = [
  { trap_mm: 30, slope_mm_per_m: 20.8, maxDistance_m: 1.5 },
  { trap_mm: 40, slope_mm_per_m: 20.8, maxDistance_m: 1.8 },
  { trap_mm: 50, slope_mm_per_m: 20.8, maxDistance_m: 2.4 },
  { trap_mm: 80, slope_mm_per_m: 10.4, maxDistance_m: 3.6 },
  { trap_mm: 100, slope_mm_per_m: 10.4, maxDistance_m: 4.9 },
];

/**
 * دعم المواسير — SBC 1102; Table 26-1
 * المسافة القصوى بين الدعامات (متر)
 */
export const PIPE_SUPPORT_SPACING: Record<string, { horizontal_m: number; vertical_m: number }> = {
  pvc:        { horizontal_m: 1.2, vertical_m: 3.0 },
  pex_small:  { horizontal_m: 0.8, vertical_m: 3.0 },    // ≤ 25mm
  pex_large:  { horizontal_m: 1.2, vertical_m: 10.0 },   // ≥ 30mm
  cpvc_small: { horizontal_m: 0.9, vertical_m: 0.9 },    // ≤ 25mm
  cpvc_large: { horizontal_m: 1.2, vertical_m: 3.0 },    // ≥ 30mm
  copper_pipe: { horizontal_m: 4.0, vertical_m: 3.0 },
  copper_tube_small: { horizontal_m: 1.8, vertical_m: 3.0 }, // ≤ 30mm
  copper_tube_large: { horizontal_m: 0.9, vertical_m: 3.0 }, // ≥ 40mm
  cast_iron:  { horizontal_m: 1.5, vertical_m: 4.5 },
  steel:      { horizontal_m: 4.0, vertical_m: 4.5 },
  abs:        { horizontal_m: 1.2, vertical_m: 3.0 },
};

/** أطوال المواسير التقديرية لكل م² */
export const PIPE_LENGTH_PER_M2 = {
  supply_cold: 1.2,    // م.ط تغذية باردة / م²
  supply_hot: 0.8,     // م.ط تغذية ساخنة / م²
  drain: 0.9,          // م.ط صرف / م²
  vent: 0.3,           // م.ط تهوية / م²
};

/** أسعار المواسير (ريال/متر طولي) — السوق السعودي 2026 */
export const PIPE_PRICES = {
  ppr_20mm: 8,    ppr_25mm: 12,   ppr_32mm: 18,
  ppr_40mm: 25,   ppr_50mm: 35,   ppr_63mm: 50,
  upvc_50mm: 15,  upvc_75mm: 20,  upvc_100mm: 25,
  upvc_150mm: 40, upvc_200mm: 60,
};

// =====================================================================
// 5. الكهرباء — Electrical (SBC 1102 Section 34 / SBC 401 / IEC 60364)
// =====================================================================

/**
 * نظام التأريض — SBC 1102; Section 34-2-1
 * المملكة العربية السعودية تفرض نظام TN-S على المباني السكنية
 */
export const ELECTRICAL_SYSTEM = {
  voltage: 230,                         // فولت — فاز واحد
  voltage_3phase: 400,                  // فولت — ثلاث فازات
  phases: 3,                            // عدد الأطوار
  frequency_hz: 60,                     // التردد — Hz
  earthing_system: 'TN-S' as const,     // نظام التأريض — SBC 1102; Section 34-2-1
  current_type: 'AC' as const,          // نوعية التيار
};

/** أحمال تقديرية (واط) — SBC 1102; Section 34 */
export const ELECTRICAL_LOADS = {
  socket_W: 200,                // حمل تقديري لكل فيشة عامة
  lighting_W: 100,              // حمل تقديري لكل نقطة إنارة
  ac_split_1ton_W: 3500,        // سبلت 1 طن = 3500 واط
  ac_split_1_5ton_W: 5250,     // سبلت 1.5 طن
  ac_split_2ton_W: 7000,        // سبلت 2 طن
  water_heater_W: 2000,         // سخان مياه كهربائي
  oven_W: 3000,                 // فرن كهربائي
  washer_W: 500,                // غسالة ملابس
  demand_factor: 0.60,          // معامل الطلب — SEC
  safety_margin: 1.25,          // هامش أمان 25%
};

/**
 * دوائر كهربائية — SBC 1102; Section 34-2-2
 * ملاحظة: RCD إلزامي في المناطق الرطبة (مطابخ/حمامات/غرف غسيل)
 * تيار تشغيل RCD ≤ 30 ملي أمبير — SBC 1102; Section 34-2-2
 */
export const CIRCUIT_SPECS = {
  max_sockets_per_circuit: 6,        // أقصى عدد أفياش في دائرة
  max_lights_per_circuit: 10,        // أقصى عدد نقاط إنارة في دائرة
  socket_breaker_A: 20,              // قاطع أفياش (أمبير)
  lighting_breaker_A: 10,            // قاطع إنارة
  ac_breaker_A: 32,                  // قاطع تكييف
  water_heater_breaker_A: 20,        // قاطع سخان
  oven_breaker_A: 32,                // قاطع فرن
  rcd_sensitivity_mA: 30,            // حساسية RCD — SBC 1102; Section 34-2-2
  rcd_required_wet_areas: true,      // إلزامي في المناطق الرطبة
  heater_dedicated_circuit: true,    // سخان يجب توصيله بدائرة مستقلة — SBC 1102; Section 41-8.2
};

/** مقاسات الكابلات (مم²) */
export const CABLE_SIZES = {
  lighting: 1.5,       // 1.5 مم² — إنارة
  sockets: 2.5,        // 2.5 مم² — أفياش عامة
  ac_split: 4,         // 4 مم² — سبلت تكييف
  water_heater: 4,     // 4 مم² — سخان
  oven: 6,             // 6 مم² — فرن
  main_feed: 16,       // 16 مم² — التغذية الرئيسية
};

/** أسعار المواد الكهربائية (ريال) */
export const ELECTRICAL_PRICES = {
  cable_1_5mm2_per_m: 3.5,
  cable_2_5mm2_per_m: 5.5,
  cable_4mm2_per_m: 8,
  cable_6mm2_per_m: 12,
  cable_10mm2_per_m: 18,
  cable_16mm2_per_m: 28,
  conduit_20mm_per_m: 4,
  conduit_25mm_per_m: 5,
  conduit_32mm_per_m: 7,
  socket_single: 35,
  socket_double: 55,
  switch_single: 30,
  switch_double: 45,
  light_point: 150,
  ac_point: 200,
  db_per_way: 45,
  main_breaker_63A: 180,
  main_breaker_100A: 350,
  rcd_30mA_2pole: 250,
  rcd_30mA_4pole: 450,
  earth_rod: 85,
};

/** عدد نقاط الإنارة التقديرية حسب نوع الغرفة */
export const DEFAULT_LIGHT_POINTS: Record<string, number> = {
  majlis: 4,     living: 3,      bedroom: 2,    kitchen: 3,
  bathroom: 2,   office: 3,      corridor: 1,   storage: 1,
  service: 1,    prayer: 2,      reception: 3,  parking: 2,
};

// =====================================================================
// 6. التكييف — HVAC
// =====================================================================

/** حمل التبريد (BTU/م²) حسب نوع الغرفة — مناخ السعودية */
export const COOLING_LOAD_BTU_PER_M2: Record<string, number> = {
  majlis: 600,     living: 550,     bedroom: 500,   kitchen: 650,
  bathroom: 400,   office: 550,     corridor: 350,  storage: 250,
  service: 300,    prayer: 550,     reception: 600, parking: 200,
  restaurant: 700, shop: 600,       gym: 500,       pool: 400,
};

export const HVAC_CONSTANTS = {
  btu_per_ton: 12000,                   // 1 طن تبريد = 12,000 BTU
  drain_pipe_mm: 20,                    // صرف مكثفات PVC
  refrigerant_pipe_per_unit_m: 8,       // طول متوقع لأنبوب الفريون
  split_unit_max_capacity_ton: 2.5,     // أقصى سعة سبلت
  cable_size_mm2: 4,                    // كبل تكييف
};

// =====================================================================
// 7. الشدة الخشبية — Formwork Details
// =====================================================================

export const FORMWORK_DETAILS = {
  plywood_length_m: 2.44,       // طول لوح بليوت
  plywood_width_m: 1.22,        // عرض لوح بليوت
  plywood_area_m2: 2.977,       // مساحة اللوح
  plywood_thickness_mm: 18,     // سماكة موصى بها
  prop_spacing_m: 1.0,          // مسافة بين الجكات (افتراضي)
  prop_height_min_m: 2.0,
  prop_height_max_m: 4.0,
  reuse_cycles: 4,              // عدد مرات الاستخدام
  prop_price_sar: 45,           // سعر الجك (ريال)
  plywood_price_sar: 95,        // سعر اللوح (ريال)
};

// =====================================================================
// 8. عزل — Waterproofing & Insulation
// =====================================================================

export const INSULATION_CONSTANTS = {
  // عزل حراري
  eps_thickness_mm: 50,          // بولي ستايرين
  xps_thickness_mm: 50,         // بولي ستايرين مبثوق
  rockwool_thickness_mm: 50,    // صوف صخري
  // عزل مائي
  bitumen_drum_coverage_m2: 40, // برميل بيتومين = 40م² (وجهين)
  membrane_roll_m2: 10,         // لفة ميمبرين = 10م²
  // أسعار
  eps_price_per_m2: 25,
  xps_price_per_m2: 40,
  membrane_price_per_m2: 55,
  bitumen_price_per_drum: 280,
};

// =====================================================================
// 9. حساب جدول حصر الحديد — Bar Bending Schedule Calculator
// =====================================================================

export interface BarBendingItem {
  member: string;        // اسم العنصر
  memberAr: string;      // اسم بالعربي
  barMark: string;       // رمز القضيب
  diameter_mm: number;   // القطر
  shape: string;         // الشكل (مستقيم، كانة، ...)
  length_m: number;      // طول القضيب
  count: number;         // العدد
  weightPerBar_kg: number;   // وزن القضيب الواحد
  totalWeight_kg: number;    // الوزن الكلي
}

/** حساب جدول حصر الحديد لكل العناصر */
export function calculateBarBendingSchedule(params: {
  columnsCount: number;
  columnSpec: ColumnSpec;
  columnHeight_m: number;
  beamSpec: BeamSpec;
  beamTotalLength_m: number;
  footingSpec: FootingSpec;
  footingWidth_m: number;
  footingDepth_m: number;
  footingsCount: number;
  neckHeight_m: number;
  slabSpec: SlabRebarSpec;
  slabArea_m2: number;
}): BarBendingItem[] {
  const items: BarBendingItem[] = [];
  const p = params;

  // — أعمدة: حديد رئيسي —
  const colBarLength = p.columnHeight_m + 0.60; // وصلة 40d
  items.push({
    member: 'Columns', memberAr: 'أعمدة', barMark: 'C-M',
    diameter_mm: p.columnSpec.mainDia_mm, shape: 'مستقيم',
    length_m: round2(colBarLength),
    count: p.columnsCount * p.columnSpec.mainBars,
    weightPerBar_kg: round2(colBarLength * REBAR_WEIGHT_KG_PER_M[p.columnSpec.mainDia_mm]),
    totalWeight_kg: round2(p.columnsCount * p.columnSpec.mainBars * colBarLength * REBAR_WEIGHT_KG_PER_M[p.columnSpec.mainDia_mm]),
  });

  // — أعمدة: كانات —
  const stirrupLen = calculateStirrupLength(
    p.columnSpec.width_cm, p.columnSpec.depth_cm,
    p.columnSpec.stirrupDia_mm, p.columnSpec.coverDepth_mm
  );
  const stirrupsPerCol = calculateStirrupCount(p.columnHeight_m, p.columnSpec.stirrupSpacing_cm);
  items.push({
    member: 'Columns', memberAr: 'كانات أعمدة', barMark: 'C-S',
    diameter_mm: p.columnSpec.stirrupDia_mm, shape: 'كانة مغلقة',
    length_m: round2(stirrupLen),
    count: p.columnsCount * stirrupsPerCol,
    weightPerBar_kg: round2(stirrupLen * REBAR_WEIGHT_KG_PER_M[p.columnSpec.stirrupDia_mm]),
    totalWeight_kg: round2(p.columnsCount * stirrupsPerCol * stirrupLen * REBAR_WEIGHT_KG_PER_M[p.columnSpec.stirrupDia_mm]),
  });

  // — ميدات: حديد رئيسي علوي + سفلي —
  const beamBarLength = 6; // standard 6m bar cut
  const totalBeamBars = Math.ceil(p.beamTotalLength_m / beamBarLength);
  items.push({
    member: 'Tie Beams', memberAr: 'ميدات (علوي)', barMark: 'TB-T',
    diameter_mm: p.beamSpec.topDia_mm, shape: 'مستقيم',
    length_m: beamBarLength,
    count: totalBeamBars * p.beamSpec.topBars,
    weightPerBar_kg: round2(beamBarLength * REBAR_WEIGHT_KG_PER_M[p.beamSpec.topDia_mm]),
    totalWeight_kg: round2(totalBeamBars * p.beamSpec.topBars * beamBarLength * REBAR_WEIGHT_KG_PER_M[p.beamSpec.topDia_mm]),
  });
  items.push({
    member: 'Tie Beams', memberAr: 'ميدات (سفلي)', barMark: 'TB-B',
    diameter_mm: p.beamSpec.bottomDia_mm, shape: 'مستقيم',
    length_m: beamBarLength,
    count: totalBeamBars * p.beamSpec.bottomBars,
    weightPerBar_kg: round2(beamBarLength * REBAR_WEIGHT_KG_PER_M[p.beamSpec.bottomDia_mm]),
    totalWeight_kg: round2(totalBeamBars * p.beamSpec.bottomBars * beamBarLength * REBAR_WEIGHT_KG_PER_M[p.beamSpec.bottomDia_mm]),
  });

  // — ميدات: كانات —
  const tbStirrupLen = calculateStirrupLength(
    p.beamSpec.width_cm, p.beamSpec.depth_cm,
    p.beamSpec.stirrupDia_mm, p.beamSpec.coverDepth_mm
  );
  const tbStirrupCount = calculateStirrupCount(p.beamTotalLength_m, p.beamSpec.stirrupSpacing_middle_cm);
  items.push({
    member: 'Tie Beams', memberAr: 'كانات ميدات', barMark: 'TB-S',
    diameter_mm: p.beamSpec.stirrupDia_mm, shape: 'كانة مغلقة',
    length_m: round2(tbStirrupLen),
    count: tbStirrupCount,
    weightPerBar_kg: round2(tbStirrupLen * REBAR_WEIGHT_KG_PER_M[p.beamSpec.stirrupDia_mm]),
    totalWeight_kg: round2(tbStirrupCount * tbStirrupLen * REBAR_WEIGHT_KG_PER_M[p.beamSpec.stirrupDia_mm]),
  });

  // — قواعد: حديد رئيسي (اتجاهين) —
  const barsPerFooting_x = Math.ceil(p.footingWidth_m * 100 / p.footingSpec.spacing_cm) + 1;
  const barsPerFooting_y = barsPerFooting_x; // مربعة
  const footingBarLength = p.footingWidth_m - 0.075 * 2 + 0.20; // net width + hooks
  items.push({
    member: 'Footings', memberAr: 'قواعد (اتجاهين)', barMark: 'F-M',
    diameter_mm: p.footingSpec.mainDia_mm, shape: 'مستقيم',
    length_m: round2(footingBarLength),
    count: p.footingsCount * (barsPerFooting_x + barsPerFooting_y),
    weightPerBar_kg: round2(footingBarLength * REBAR_WEIGHT_KG_PER_M[p.footingSpec.mainDia_mm]),
    totalWeight_kg: round2(p.footingsCount * (barsPerFooting_x + barsPerFooting_y) * footingBarLength * REBAR_WEIGHT_KG_PER_M[p.footingSpec.mainDia_mm]),
  });

  // — رقاب أعمدة —
  items.push({
    member: 'Neck Columns', memberAr: 'رقاب أعمدة', barMark: 'NC-M',
    diameter_mm: NECK_COLUMN_SPEC.mainDia_mm, shape: 'مستقيم',
    length_m: round2(p.neckHeight_m + 0.60),
    count: p.columnsCount * NECK_COLUMN_SPEC.mainBars,
    weightPerBar_kg: round2((p.neckHeight_m + 0.60) * REBAR_WEIGHT_KG_PER_M[NECK_COLUMN_SPEC.mainDia_mm]),
    totalWeight_kg: round2(p.columnsCount * NECK_COLUMN_SPEC.mainBars * (p.neckHeight_m + 0.60) * REBAR_WEIGHT_KG_PER_M[NECK_COLUMN_SPEC.mainDia_mm]),
  });

  // — سقف: حديد رئيسي —
  const slabSide = Math.sqrt(p.slabArea_m2);
  const slabMainCount = Math.ceil(slabSide * 100 / p.slabSpec.spacing_cm) + 1;
  const slabSecCount = Math.ceil(slabSide * 100 / p.slabSpec.secondarySpacing_cm) + 1;
  items.push({
    member: 'Slabs', memberAr: 'سقف (رئيسي)', barMark: 'S-M',
    diameter_mm: p.slabSpec.mainDia_mm, shape: 'مستقيم',
    length_m: round2(slabSide),
    count: slabMainCount,
    weightPerBar_kg: round2(slabSide * REBAR_WEIGHT_KG_PER_M[p.slabSpec.mainDia_mm]),
    totalWeight_kg: round2(slabMainCount * slabSide * REBAR_WEIGHT_KG_PER_M[p.slabSpec.mainDia_mm]),
  });
  items.push({
    member: 'Slabs', memberAr: 'سقف (توزيع)', barMark: 'S-D',
    diameter_mm: p.slabSpec.secondaryDia_mm, shape: 'مستقيم',
    length_m: round2(slabSide),
    count: slabSecCount,
    weightPerBar_kg: round2(slabSide * REBAR_WEIGHT_KG_PER_M[p.slabSpec.secondaryDia_mm]),
    totalWeight_kg: round2(slabSecCount * slabSide * REBAR_WEIGHT_KG_PER_M[p.slabSpec.secondaryDia_mm]),
  });

  return items;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// =====================================================================
// 10. سخانات المياه — Water Heaters (SBC 1102; Sections 2801-2804)
// =====================================================================

/**
 * متطلبات سخانات المياه — SBC 1102; Sections 2801-2804
 * دليل المقاولين — صفحة 299-301
 */
export const WATER_HEATER_REQUIREMENTS = {
  /** الحد الأقصى لدرجة حرارة المياه الساخنة — SBC 1102; Section 2801 */
  maxTemp_celsius: 50,
  /** درجة حرارة خلط ثرموستاتي — ASSE 1017 */
  thermostatic_maxTemp: 60,
  /** الحد الأقصى لحرارة شطاف المرحاض (بيديه) — SBC 1102; Section 2721.2 */
  bidet_maxTemp: 45,
  /** قطر أنبوب تفريغ الصيانة الأدنى (مم) — SBC 1102; Section 2801.2 */
  drainValve_min_mm: 20,
  /** مساحة عمل الصيانة الدنيا (مم) — SBC 1102; Section 2801.4 */
  maintenance_depth_mm: 750,
  maintenance_width_mm: 750,
  /** محبس تخفيف الحرارة في أعلى 150مم من الخزان — SBC 1102; Section 2804 */
  relief_valve_max_from_top_mm: 150,
  /** يجب توصيل السخان بدائرة كهربائية مستقلة — SBC 1102; Section 41-8.2 */
  dedicated_circuit: true,
  /** يجب حماية دائرة السخان بـ RCD — SBC 1102; Section 34-2-2 */
  rcd_protection: true,
  /** تقييد الزلازل: يجب تكتيف السخان — SBC 1102; Section 2801.8 */
  seismic_restraint_required: true,
};

// =====================================================================
// 11. اختبارات وتفتيش السباكة — Plumbing Inspection & Testing
//     (SBC 1102; Sections 2503 / 2417)
// =====================================================================

/**
 * اختبارات السباكة الإلزامية — SBC 1102; Section 2503
 * يمنع تغطية التمديدات الصحية قبل تفتيشها واجراء الاختبارات عليها
 */
export const PLUMBING_TESTS = {
  /** اختبار نظام الإمداد بمياه الشرب — SBC 1102; Section 2503.7 */
  water_supply: {
    medium: 'water_or_air' as const,     // مياه صالحة للشرب أو هواء
    min_pressure_water_kpa: 'operating',  // لا يقل عن ضغط التشغيل
    min_pressure_air_kpa: 345,            // 345 كيلو باسكال
    max_pressure_kpa: 550,                // أعلى ضغط مسموح
    duration_min: 15,                     // مدة لا تقل عن 15 دقيقة
    plastic_air_prohibited: true,         // يحظر الهواء مع أنابيب بلاستيكية
  },
  /** اختبار مجاري المبنى — SBC 1102; Section 2503.4 */
  building_sewer: {
    medium: 'water' as const,
    min_head_m: 3,                       // عمود مائي > 3 متر
    min_pressure_kpa: 35,                // أو ضغط > 35 كيلو باسكال
    duration_min: 15,
  },
  /** اختبار DWV (صرف + نفايات + تنفيس) — SBC 1102; Section 2503.5 */
  dwv: {
    medium: 'water_or_air' as const,
    min_head_m: 1.5,                     // عمود ماء 1.5م فوق أعلى تركيبة
    min_pressure_air_kpa: 35,            // ضغط هواء 35 كيلو باسكال
    duration_min: 15,
    plastic_air_prohibited: true,
  },
  /** اختبار عزل أرضية الدش — SBC 1102; Section 2503.6 */
  shower_floor: {
    min_water_level_mm: 50,              // ارتفاع 50مم فوق العتبة
    duration_min: 15,
  },
  /** فحص منع التدفق العكسي — SBC 1102; Section 2503.8 */
  backflow_preventer: {
    frequency: 'at_install_and_annually' as const,
    after_repair: true,
  },
};

/**
 * اختبارات الغاز — SBC 1102; Section 2417
 */
export const GAS_PIPE_TESTS = {
  min_pressure_kpa: 50,                  // لا يقل عن 50 كيلو باسكال — Section 2417.4.1
  min_factor_above_operating: 1.5,       // 1.5× ضغط التشغيل
  duration_min: 10,                      // لا تقل عن 10 دقائق — Section 2417.4.2
  test_medium_prohibited: ['oxygen', 'fuel_gas'],  // يحظر الأكسجين أو غاز الوقود
  test_medium_allowed: ['air', 'nitrogen', 'co2', 'inert_gas'],
};

/**
 * دعم أنابيب الغاز — SBC 1102; Table 24-27
 */
export const GAS_PIPE_SUPPORT: { nominal_mm: number; spacing_m: number }[] = [
  { nominal_mm: 12.5, spacing_m: 1.8 },
  { nominal_mm: 19,   spacing_m: 2.4 },
  { nominal_mm: 25,   spacing_m: 2.4 },
  { nominal_mm: 32,   spacing_m: 3.1 },   // أفقي
];

// =====================================================================
// 12. المصائد والتنفيس — Traps & Venting (SBC 1102; Section 3201)
// =====================================================================

/**
 * متطلبات المصائد — SBC 1102; Section 3201
 */
export const TRAP_REQUIREMENTS = {
  /** ارتفاع الحاجز المائي الأدنى (مم) — Section 3201 */
  min_seal_mm: 50,
  /** ارتفاع الحاجز المائي الأقصى (مم) */
  max_seal_mm: 100,
  /** المسافة القصوى بين المخرج والمصيدة (مم) — Section 3201.6 */
  max_vertical_distance_mm: 600,
  max_horizontal_distance_mm: 750,
  /** الحد الأقصى لفرق الضغط (باسكال) للحفاظ على العازل المائي — Section 3101.2 */
  max_pressure_diff_pa: 250,
  /** يحظر مصيدة المبنى — Section 3201.4 */
  building_trap_prohibited: true,
  /** يحظر مصيدتان لتركيبة واحدة — Section 3201.4 */
  double_trap_prohibited: true,
};

/**
 * فتحة التنفيس الجاف — SBC 1102; Sections 3103-3105
 */
export const VENT_REQUIREMENTS = {
  /** الحد الأدنى لقطر أنبوب التنفيس الجاف (مم) — Section 3113 */
  min_diameter_mm: 30,
  /** أنبوب التنفيس = نصف قطر أنبوب الصرف على الأقل — Section 3113 */
  min_ratio_to_drain: 0.5,
  /** ارتفاع فتحة التنفيس فوق السطح غير المستخدم (مم) — Section 3105 */
  extend_above_unused_roof_mm: 150,
  /** ارتفاع فتحة التنفيس فوق السطح المستخدم (متر) — Section 3105 */
  extend_above_used_roof_m: 2.1,
  /** مسافة فتحة التنفيس من حدود الملكية (متر) — Section 3103 */
  min_distance_from_boundary_m: 3,
  /** مسافة فتحة التنفيس من سطح الأرض (متر) — Section 3103 */
  min_distance_from_ground_m: 3,
  /** مسافة فتحة التنفيس من أي نافذة (مم) — Section 3103.5 */
  min_horizontal_from_window_mm: 900,
  min_vertical_above_window_mm: 1200,
};

// =====================================================================
// v8.2 — Unit Conversion Utilities (تحويل الوحدات)
// Solves the m² ↔ m³ gap for slab/column pricing
// =====================================================================

/**
 * سماكات الأسقف القياسية حسب النوع — بالمتر
 * Standard slab thicknesses by type — in meters
 */
export const SLAB_THICKNESS: Record<string, number> = {
  'flat': 0.20,       // سقف مسطح 20 سم
  'hordi': 0.27,      // سقف هوردي 27 سم (25 بلك + 2 صبة)
  'waffle': 0.35,     // سقف وافل 35 سم
  'hollow_core': 0.20, // سقف بلاطات مجوفة 20 سم
  'ribbed': 0.30,     // سقف أعصاب 30 سم
  'solid': 0.15,      // سقف صلب 15 سم
};

/**
 * تحويل مساحة سقف (م2) إلى حجم خرسانة (م3)
 * Convert slab area (m²) to concrete volume (m³)
 * @param area_m2 - مساحة السقف بالمتر المربع
 * @param slabType - نوع السقف (flat, hordi, waffle, etc.)
 * @returns حجم الخرسانة بالمتر المكعب
 */
export function slabAreaToVolume(area_m2: number, slabType: string = 'hordi'): number {
  const thickness = SLAB_THICKNESS[slabType] || 0.27;
  return Number((area_m2 * thickness).toFixed(2));
}

/**
 * حساب حجم الخرسانة لكل م2 حسب نوع السقف
 * Calculate concrete volume per m² based on slab type
 * Useful for converting m²-based pricing to m³-based pricing
 */
export function concreteVolumePerSqm(slabType: string = 'hordi'): number {
  return SLAB_THICKNESS[slabType] || 0.27;
}

/**
 * تحويل سعر المتر المكعب إلى سعر المتر المربع
 * Convert m³ price to m² price for slab items
 * @param pricePerM3 - سعر المتر المكعب
 * @param slabType - نوع السقف
 * @returns سعر المتر المربع
 */
export function m3PriceToM2(pricePerM3: number, slabType: string = 'hordi'): number {
  const thickness = SLAB_THICKNESS[slabType] || 0.27;
  return Number((pricePerM3 * thickness).toFixed(2));
}

/**
 * تحويل سعر المتر المربع إلى سعر المتر المكعب
 * Convert m² price to m³ price for slab items
 * @param pricePerM2 - سعر المتر المربع
 * @param slabType - نوع السقف
 * @returns سعر المتر المكعب
 */
export function m2PriceToM3(pricePerM2: number, slabType: string = 'hordi'): number {
  const thickness = SLAB_THICKNESS[slabType] || 0.27;
  return Number((pricePerM2 / thickness).toFixed(2));
}
