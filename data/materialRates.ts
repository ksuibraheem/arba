/**
 * ARBA Brain v1.0 — Material Consumption Rates Database
 * قاعدة بيانات معدلات استهلاك المواد
 *
 * المصادر:
 *  - كتاب "زاد في هندسة البناء" — أبواب 7، 9، 12
 *  - كود البناء السعودي SBC 304 (خرسانة مسلحة)
 *  - معايير ASTM / SASO
 *  - الممارسة الميدانية في السوق السعودي
 *
 * ⚠️ هذا الملف مرجعي — يُستخدم بواسطة calculations.ts و cognitiveCalculations.ts
 */

// =====================================================================
// 1. نسب خلط الخرسانة — Concrete Mix Design (SBC 304 / ACI 211)
// =====================================================================

export interface ConcreteMixRate {
  grade: string;
  fcRating_MPa: number;
  cement_kg_per_m3: number;       // أسمنت (كجم/م³)
  sand_m3_per_m3: number;         // رمل (م³/م³ خرسانة)
  gravel_m3_per_m3: number;       // حصى (م³/م³ خرسانة)
  water_L_per_m3: number;         // ماء (لتر/م³)
  wcRatio: number;                // نسبة ماء/أسمنت
  slump_mm: { min: number; max: number };  // هبوط القوام
  cementType: string;             // نوع الأسمنت
}

export const CONCRETE_MIX_RATES: Record<string, ConcreteMixRate> = {
  C15: {
    grade: 'C15', fcRating_MPa: 15,
    cement_kg_per_m3: 250, sand_m3_per_m3: 0.46, gravel_m3_per_m3: 0.86,
    water_L_per_m3: 185, wcRatio: 0.74, slump_mm: { min: 25, max: 50 },
    cementType: 'OPC Type I',
  },
  C20: {
    grade: 'C20', fcRating_MPa: 20,
    cement_kg_per_m3: 300, sand_m3_per_m3: 0.44, gravel_m3_per_m3: 0.84,
    water_L_per_m3: 180, wcRatio: 0.60, slump_mm: { min: 50, max: 100 },
    cementType: 'OPC Type I',
  },
  C25: {
    grade: 'C25', fcRating_MPa: 25,
    cement_kg_per_m3: 350, sand_m3_per_m3: 0.42, gravel_m3_per_m3: 0.82,
    water_L_per_m3: 175, wcRatio: 0.50, slump_mm: { min: 75, max: 100 },
    cementType: 'OPC Type I / SRC Type V',
  },
  C30: {
    grade: 'C30', fcRating_MPa: 30,
    cement_kg_per_m3: 400, sand_m3_per_m3: 0.40, gravel_m3_per_m3: 0.80,
    water_L_per_m3: 170, wcRatio: 0.45, slump_mm: { min: 75, max: 125 },
    cementType: 'OPC Type I / SRC Type V',
  },
  C35: {
    grade: 'C35', fcRating_MPa: 35,
    cement_kg_per_m3: 450, sand_m3_per_m3: 0.38, gravel_m3_per_m3: 0.78,
    water_L_per_m3: 165, wcRatio: 0.42, slump_mm: { min: 75, max: 150 },
    cementType: 'SRC Type V',
  },
  C40: {
    grade: 'C40', fcRating_MPa: 40,
    cement_kg_per_m3: 500, sand_m3_per_m3: 0.36, gravel_m3_per_m3: 0.76,
    water_L_per_m3: 160, wcRatio: 0.40, slump_mm: { min: 75, max: 150 },
    cementType: 'SRC Type V + Silica Fume',
  },
};

/** استخدام الفئة حسب العنصر الإنشائي — SBC 304 Table 4.2.1 */
export const CONCRETE_GRADE_BY_ELEMENT: Record<string, string> = {
  blinding:        'C15',   // خرسانة نظافة
  footings:        'C25',   // قواعد
  raft:            'C30',   // لبشة
  tie_beams:       'C25',   // ميدات
  neck_columns:    'C25',   // رقاب أعمدة
  columns:         'C30',   // أعمدة
  beams:           'C30',   // كمرات
  slabs_solid:     'C25',   // سقف صلب
  slabs_hordi:     'C25',   // سقف هوردي
  slabs_flat:      'C30',   // سقف مسطح
  retaining_walls: 'C30',   // جدران استنادية
  stairs:          'C25',   // سلالم
  swimming_pool:   'C35',   // مسبح (مقاوم كبريتات)
};

// =====================================================================
// 2. معدلات مونة البلك — Mortar Rates (باب 7، 12)
// =====================================================================

export interface MortarRate {
  cement_kg_per_m2: number;       // كجم أسمنت / م² جدار
  sand_m3_per_m2: number;         // م³ رمل / م² جدار
  water_L_per_m2: number;         // لتر ماء / م² جدار
}

export const MORTAR_RATES: Record<string, MortarRate> = {
  /** بناء بلوك 20سم */
  blockwork_20cm: { cement_kg_per_m2: 15, sand_m3_per_m2: 0.022, water_L_per_m2: 10 },
  /** بناء بلوك 15سم */
  blockwork_15cm: { cement_kg_per_m2: 12, sand_m3_per_m2: 0.018, water_L_per_m2: 8 },
  /** بناء بلوك 10سم */
  blockwork_10cm: { cement_kg_per_m2: 10, sand_m3_per_m2: 0.015, water_L_per_m2: 7 },
  /** مونة لياسة خارجية (سماكة 2سم) */
  plaster_external: { cement_kg_per_m2: 8, sand_m3_per_m2: 0.020, water_L_per_m2: 6 },
  /** مونة لياسة داخلية (سماكة 1.5سم) */
  plaster_internal: { cement_kg_per_m2: 6, sand_m3_per_m2: 0.015, water_L_per_m2: 5 },
  /** رشة أولى (طرطشة) */
  spatter_dash: { cement_kg_per_m2: 4, sand_m3_per_m2: 0.005, water_L_per_m2: 4 },
};

// =====================================================================
// 3. معدلات استهلاك البلاط — Tile Consumption Rates (باب 12)
// =====================================================================

export interface TileRate {
  adhesive_kg_per_m2: number;     // غراء / م²
  grout_kg_per_m2: number;        // فوجة / م²
  primer_L_per_m2: number;        // برايمر / م²
  spacers_per_m2: number;         // صلايب / م²
}

export const TILE_RATES: Record<string, TileRate> = {
  /** سيراميك أرضيات 60×60 */
  ceramic_floor: { adhesive_kg_per_m2: 5, grout_kg_per_m2: 0.3, primer_L_per_m2: 0.10, spacers_per_m2: 4 },
  /** سيراميك جدران 30×60 */
  ceramic_wall: { adhesive_kg_per_m2: 6, grout_kg_per_m2: 0.5, primer_L_per_m2: 0.12, spacers_per_m2: 6 },
  /** بورسلان أرضيات 120×60 */
  porcelain_floor: { adhesive_kg_per_m2: 6, grout_kg_per_m2: 0.25, primer_L_per_m2: 0.10, spacers_per_m2: 3 },
  /** رخام طبيعي */
  marble: { adhesive_kg_per_m2: 7, grout_kg_per_m2: 0.20, primer_L_per_m2: 0.15, spacers_per_m2: 3 },
  /** جرانيت */
  granite: { adhesive_kg_per_m2: 8, grout_kg_per_m2: 0.20, primer_L_per_m2: 0.15, spacers_per_m2: 3 },
  /** بلاط إنترلوك خارجي */
  interlock: { adhesive_kg_per_m2: 0, grout_kg_per_m2: 0, primer_L_per_m2: 0, spacers_per_m2: 0 },
};

// =====================================================================
// 4. معدلات استهلاك الدهان — Paint Consumption Rates (باب 12)
// =====================================================================

export interface PaintRate {
  primer_L_per_m2: number;        // برايمر (لتر/م²)
  undercoat_L_per_m2: number;     // أساس (لتر/م²)
  topcoat_L_per_m2: number;       // وجه نهائي (لتر/م²)
  coats: number;                  // عدد الأوجه
  total_L_per_m2: number;         // إجمالي اللتر/م²
}

export const PAINT_RATES: Record<string, PaintRate> = {
  /** دهان بلاستيك داخلي (الأكثر شيوعاً) */
  plastic_interior: {
    primer_L_per_m2: 0.12, undercoat_L_per_m2: 0.10, topcoat_L_per_m2: 0.10,
    coats: 3, total_L_per_m2: 0.42,
  },
  /** دهان بلاستيك خارجي (مقاوم للعوامل) */
  plastic_exterior: {
    primer_L_per_m2: 0.15, undercoat_L_per_m2: 0.12, topcoat_L_per_m2: 0.12,
    coats: 3, total_L_per_m2: 0.51,
  },
  /** دهان مخملي (Velvet) */
  velvet: {
    primer_L_per_m2: 0.12, undercoat_L_per_m2: 0.08, topcoat_L_per_m2: 0.15,
    coats: 3, total_L_per_m2: 0.50,
  },
  /** دهان إيبوكسي (مستشفيات/مصانع) */
  epoxy: {
    primer_L_per_m2: 0.15, undercoat_L_per_m2: 0.15, topcoat_L_per_m2: 0.20,
    coats: 3, total_L_per_m2: 0.65,
  },
  /** دهان زيتي */
  oil_paint: {
    primer_L_per_m2: 0.12, undercoat_L_per_m2: 0.10, topcoat_L_per_m2: 0.12,
    coats: 3, total_L_per_m2: 0.46,
  },
};

// =====================================================================
// 5. معدلات العزل — Insulation Rates (باب 13)
// =====================================================================

export interface InsulationRate {
  material_m2_per_m2: number;     // م² مادة / م² مسطح (عادةً 1.1 مع التراكب)
  adhesive_kg_per_m2: number;     // لاصق
  tape_m_per_m2: number;          // شريط لصق فواصل
  fixings_per_m2: number;         // مثبتات ميكانيكية
}

export const INSULATION_RATES: Record<string, InsulationRate> = {
  eps: { material_m2_per_m2: 1.05, adhesive_kg_per_m2: 0.8, tape_m_per_m2: 0.5, fixings_per_m2: 4 },
  xps: { material_m2_per_m2: 1.05, adhesive_kg_per_m2: 0.8, tape_m_per_m2: 0.5, fixings_per_m2: 4 },
  rockwool: { material_m2_per_m2: 1.08, adhesive_kg_per_m2: 0, tape_m_per_m2: 0.3, fixings_per_m2: 6 },
  polyurethane_spray: { material_m2_per_m2: 1.0, adhesive_kg_per_m2: 0, tape_m_per_m2: 0, fixings_per_m2: 0 },
};

// =====================================================================
// 6. معدلات العزل المائي — Waterproofing Rates (باب 13)
// =====================================================================

export interface WaterproofingRate {
  material_m2_per_m2: number;     // مادة عزل (مع تراكب 10-15سم)
  primer_L_per_m2: number;        // برايمر بيتوميني
  protection_layer: boolean;      // هل يحتاج طبقة حماية
}

export const WATERPROOFING_RATES: Record<string, WaterproofingRate> = {
  /** SBS ميمبرين 3مم */
  membrane_3mm: { material_m2_per_m2: 1.15, primer_L_per_m2: 0.30, protection_layer: true },
  /** SBS ميمبرين 4مم */
  membrane_4mm: { material_m2_per_m2: 1.15, primer_L_per_m2: 0.30, protection_layer: true },
  /** بيتومين مخفف (دهان) */
  bitumen_coating: { material_m2_per_m2: 1.0, primer_L_per_m2: 0.25, protection_layer: false },
  /** HDPE شيت */
  hdpe_sheet: { material_m2_per_m2: 1.20, primer_L_per_m2: 0, protection_layer: true },
  /** سيكا عزل حمامات */
  cementitious_coat: { material_m2_per_m2: 1.0, primer_L_per_m2: 0.15, protection_layer: false },
};

// =====================================================================
// 7. معدلات هدر مُحدَّثة — Updated Waste Factors (باب 17)
// =====================================================================

export const ENHANCED_WASTE_FACTORS: Record<string, { min: number; typical: number; max: number; notes: string }> = {
  concrete:         { min: 0.03, typical: 0.05, max: 0.08, notes: 'أقل مع المضخة، أعلى مع القادوس' },
  steel:            { min: 0.03, typical: 0.05, max: 0.07, notes: 'يعتمد على دقة جدول القطع' },
  blocks:           { min: 0.05, typical: 0.07, max: 0.10, notes: 'أعلى مع الزوايا والفتحات' },
  ceramic_tiles:    { min: 0.08, typical: 0.10, max: 0.15, notes: 'أعلى مع القطع القطري' },
  porcelain:        { min: 0.06, typical: 0.08, max: 0.12, notes: 'أقل من السيراميك (أكثر صلابة)' },
  marble:           { min: 0.06, typical: 0.08, max: 0.12, notes: 'يعتمد على الحجم والتقطيع' },
  paint:            { min: 0.03, typical: 0.05, max: 0.08, notes: 'أعلى مع الرش' },
  gypsum_board:     { min: 0.05, typical: 0.08, max: 0.12, notes: 'أعلى مع الديكورات' },
  plywood_formwork: { min: 0.08, typical: 0.10, max: 0.15, notes: 'بعد 4 استخدامات' },
  waterproofing:    { min: 0.05, typical: 0.08, max: 0.12, notes: 'تراكب 10-15سم' },
  insulation:       { min: 0.03, typical: 0.05, max: 0.08, notes: 'أعلى مع الأشكال غير المنتظمة' },
  plaster:          { min: 0.05, typical: 0.08, max: 0.12, notes: 'يعتمد على استواء الجدار' },
  sand:             { min: 0.10, typical: 0.15, max: 0.20, notes: 'هدر طبيعي في النقل والتخزين' },
  cement:           { min: 0.03, typical: 0.05, max: 0.08, notes: 'تلف من الرطوبة + بقايا' },
};

// =====================================================================
// 8. Helper: حساب تكلفة المادة الديناميكية
// =====================================================================

/**
 * يحسب تكلفة المادة لكل وحدة عمل بناءً على المعدلات + أسعار السوق
 * @param activityType نوع النشاط (blockwork_20cm, plaster_external, etc.)
 * @param prices أسعار السوق الحالية
 * @returns تكلفة المادة بالريال / وحدة العمل
 */
export function calculateMaterialCostPerUnit(
  activityType: string,
  prices: Record<string, number>
): number | null {
  // بناء بلوك
  if (activityType.startsWith('blockwork_')) {
    const rate = MORTAR_RATES[activityType];
    if (!rate) return null;
    const blockSize = activityType.includes('20') ? 20 : activityType.includes('15') ? 15 : 10;
    const blockPrice = prices[`block_${blockSize}cm`] || 3.5;
    const blocksPerM2 = 12.5;
    return (blocksPerM2 * blockPrice) + (rate.cement_kg_per_m2 * (prices.cement_per_kg || 0.44));
  }

  // لياسة
  if (activityType.startsWith('plaster_') || activityType === 'spatter_dash') {
    const rate = MORTAR_RATES[activityType];
    if (!rate) return null;
    return (rate.cement_kg_per_m2 * (prices.cement_per_kg || 0.44)) +
           (rate.sand_m3_per_m2 * (prices.sand_m3 || 60));
  }

  // بلاط
  if (TILE_RATES[activityType]) {
    const rate = TILE_RATES[activityType];
    return (rate.adhesive_kg_per_m2 * (prices.tile_adhesive_per_kg || 1.5)) +
           (rate.grout_kg_per_m2 * (prices.grout_per_kg || 3));
  }

  return null;
}
