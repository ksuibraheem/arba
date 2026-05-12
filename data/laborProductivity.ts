/**
 * ARBA Brain v1.0 — Labor Productivity Database
 * قاعدة بيانات إنتاجية العمالة
 *
 * المصادر:
 *  - كتاب "زاد في هندسة البناء" — أبواب 6، 8، 9، 12
 *  - معايير الهيئة السعودية للمقاولين
 *  - الممارسة الميدانية في السوق السعودي
 *
 * ⚠️ الإنتاجية تتأثر بـ: الطقس (صيف = -20%)، مستوى العامل، تعقيد المبنى
 */

// =====================================================================
// 1. إنتاجية الأنشطة الإنشائية — Structural Activities
// =====================================================================

export interface LaborActivity {
  id: string;
  nameAr: string;
  nameEn: string;
  /** الإنتاجية اليومية — وحدة عمل / يوم */
  outputPerDay: number;
  /** وحدة القياس */
  unit: string;
  /** تكوين الطاقم */
  crew: string;
  crewSize: number;
  /** تكلفة الطاقم اليومية (ريال) */
  dailyCrewCost: number;
  /** تكلفة العمالة لكل وحدة عمل = dailyCrewCost / outputPerDay */
  laborCostPerUnit: number;
  /** القسم */
  category: 'site' | 'structure' | 'masonry' | 'finishes' | 'mep' | 'insulation' | 'external';
  /** ملاحظات */
  notes: string;
}

function makeActivity(
  id: string, nameAr: string, nameEn: string,
  output: number, unit: string,
  crew: string, crewSize: number, dailyCost: number,
  category: LaborActivity['category'], notes: string = ''
): LaborActivity {
  return {
    id, nameAr, nameEn, outputPerDay: output, unit, crew, crewSize,
    dailyCrewCost: dailyCost,
    laborCostPerUnit: Math.round((dailyCost / output) * 100) / 100,
    category, notes,
  };
}

export const LABOR_ACTIVITIES: LaborActivity[] = [
  // ═══════════════ أعمال الموقع (باب 6) ═══════════════
  makeActivity('site_clearance',    'تنظيف وتسوية موقع',     'Site Clearance',           100, 'م2', '2 عمال + لودر', 3, 600, 'site', 'يشمل إزالة أنقاض'),
  makeActivity('exc_normal',        'حفر ميكانيكي عادي',     'Mechanical Excavation',    80,  'م3', '1 عامل + بوبكات', 2, 550, 'site', 'تربة عادية/رملية'),
  makeActivity('exc_rock',          'حفر صخري (بريكر)',       'Rock Excavation',          25,  'م3', '1 عامل + بريكر', 2, 900, 'site', 'صخر لين/صلب'),
  makeActivity('backfill',          'ردم ودمك',              'Backfill & Compaction',     60,  'م3', '1 عامل + لودر + هراس', 3, 700, 'site', 'طبقات 30سم'),
  makeActivity('soil_replacement',  'إحلال تربة',            'Soil Replacement',          40,  'م3', '2 عمال + لودر', 3, 650, 'site', 'فرد + دمك'),

  // ═══════════════ أعمال الخرسانة (باب 9، 10) ═══════════════
  makeActivity('concrete_blinding', 'صب خرسانة نظافة',       'Lean Concrete Pouring',     30,  'م3', '4 عمال + مضخة', 5, 800, 'structure', 'C15'),
  makeActivity('concrete_found',    'صب خرسانة أساسات',      'Foundation Concrete Pour',   25,  'م3', '6 عمال + مضخة', 7, 1200, 'structure', 'C25-C30'),
  makeActivity('concrete_columns',  'صب خرسانة أعمدة',       'Column Concrete Pour',       15,  'م3', '6 عمال + مضخة', 7, 1200, 'structure', 'يشمل هز'),
  makeActivity('concrete_slabs',    'صب خرسانة أسقف',        'Slab Concrete Pour',         35,  'م3', '8 عمال + مضخة', 9, 1600, 'structure', 'صب مستمر'),
  makeActivity('rebar_tying',       'تركيب حديد تسليح',      'Rebar Tying & Installation', 0.30, 'طن', '1 حداد', 1, 250, 'structure', '300 كجم/يوم'),
  makeActivity('formwork_setup',    'تركيب شدة خشبية',       'Formwork Setup',             8,   'م2', '1 نجار + مساعد', 2, 400, 'structure', 'تشمل فك بعد 7 أيام'),
  makeActivity('formwork_columns',  'شدة أعمدة',             'Column Formwork',            6,   'م2', '1 نجار + مساعد', 2, 400, 'structure', 'أبطأ من الأسقف'),

  // ═══════════════ أعمال البلك والجدران (باب 9) ═══════════════
  makeActivity('blockwork_20',      'بناء بلوك 20سم',        'Block Wall 20cm',            15,  'م2', '1 بنّاء + مساعد', 2, 350, 'masonry', 'خارجي'),
  makeActivity('blockwork_15',      'بناء بلوك 15سم',        'Block Wall 15cm',            18,  'م2', '1 بنّاء + مساعد', 2, 350, 'masonry', 'داخلي'),
  makeActivity('blockwork_10',      'بناء بلوك 10سم',        'Block Wall 10cm',            20,  'م2', '1 بنّاء + مساعد', 2, 350, 'masonry', 'فواصل'),

  // ═══════════════ أعمال اللياسة والبياض (باب 12) ═══════════════
  makeActivity('spatter_dash',      'رشة أولى (طرطشة)',      'Spatter Dash / Scratch Coat', 40, 'م2', '1 مبيّض + مساعد', 2, 350, 'finishes', 'رش يدوي'),
  makeActivity('plaster_external',  'لياسة خارجية',          'External Plastering',         15, 'م2', '1 مبيّض + مساعد', 2, 380, 'finishes', 'سماكة 2سم'),
  makeActivity('plaster_internal',  'لياسة داخلية',          'Internal Plastering',         20, 'م2', '1 مبيّض + مساعد', 2, 350, 'finishes', 'سماكة 1.5سم'),

  // ═══════════════ أعمال البلاط (باب 12) ═══════════════
  makeActivity('tiling_floor',      'تركيب سيراميك أرضيات', 'Floor Tiling',                8,  'م2', '1 بلاّط + مساعد', 2, 350, 'finishes', '60×60'),
  makeActivity('tiling_wall',       'تركيب سيراميك جدران', 'Wall Tiling',                  6,  'م2', '1 بلاّط', 1, 250, 'finishes', '30×60'),
  makeActivity('tiling_marble',     'تركيب رخام',           'Marble Installation',          5,  'م2', '1 بلاّط + مساعد', 2, 400, 'finishes', 'قطع + تركيب'),
  makeActivity('tiling_interlock',  'تركيب إنترلوك',        'Interlock Paving',            20,  'م2', '2 عمال', 2, 300, 'external', 'فرد رمل + تركيب'),

  // ═══════════════ أعمال الدهان (باب 12) ═══════════════
  makeActivity('painting_interior', 'دهان داخلي (3 أوجه)',   'Interior Painting (3 Coats)', 35, 'م2', '1 دهّان', 1, 180, 'finishes', 'برايمر + وجهين'),
  makeActivity('painting_exterior', 'دهان خارجي',            'Exterior Painting',           25, 'م2', '1 دهّان + مساعد', 2, 300, 'finishes', 'سقالة مطلوبة'),
  makeActivity('gypsum_board',      'تركيب جبس بورد سقف',   'Gypsum Board Ceiling',        12, 'م2', '1 فني + مساعد', 2, 380, 'finishes', 'يشمل المعجون والصنفرة'),

  // ═══════════════ أعمال العزل (باب 13) ═══════════════
  makeActivity('waterproof_found',  'عزل مائي أساسات',      'Foundation Waterproofing',     25, 'م2', '1 عامل عزل', 1, 200, 'insulation', 'ميمبرين أو بيتومين'),
  makeActivity('waterproof_roof',   'عزل مائي سطح',         'Roof Waterproofing',           20, 'م2', '1 عامل عزل + مساعد', 2, 350, 'insulation', 'ميمبرين + حماية'),
  makeActivity('waterproof_bath',   'عزل حمامات',            'Bathroom Waterproofing',      15, 'م2', '1 عامل عزل', 1, 200, 'insulation', 'سيكا / ميمبرين'),
  makeActivity('insulation_walls',  'عزل حراري جدران',      'Wall Thermal Insulation',     30, 'م2', '1 عامل', 1, 150, 'insulation', 'EPS / XPS'),
  makeActivity('insulation_roof',   'عزل حراري سطح',        'Roof Thermal Insulation',     35, 'م2', '1 عامل', 1, 150, 'insulation', 'EPS / صوف صخري'),

  // ═══════════════ أعمال السباكة (باب 14) ═══════════════
  makeActivity('plumbing_rough',    'سباكة تأسيس (نقاط)',   'Plumbing Rough-in',           3,  'نقطة', '1 سباك', 1, 250, 'mep', 'تغذية + صرف'),
  makeActivity('plumbing_finish',   'سباكة تشطيب',          'Plumbing Finishing',           4,  'نقطة', '1 سباك', 1, 250, 'mep', 'تركيب أطقم'),
  makeActivity('plumbing_pipes',    'تمديد مواسير',          'Pipe Installation',           15, 'م.ط', '1 سباك + مساعد', 2, 400, 'mep', 'PPR/UPVC'),

  // ═══════════════ أعمال الكهرباء (باب 15) ═══════════════
  makeActivity('electrical_rough',  'كهرباء تأسيس (نقاط)',  'Electrical Rough-in',          5, 'نقطة', '1 كهربائي', 1, 250, 'mep', 'أنابيب + سحب'),
  makeActivity('electrical_finish', 'كهرباء تشطيب',         'Electrical Finishing',          8, 'نقطة', '1 كهربائي', 1, 250, 'mep', 'تركيب أفياش/مفاتيح'),
  makeActivity('electrical_cables', 'سحب كابلات',           'Cable Pulling',                40, 'م.ط', '1 كهربائي + مساعد', 2, 400, 'mep', 'مقاطع متنوعة'),

  // ═══════════════ أعمال التكييف ═══════════════
  makeActivity('hvac_split',        'تركيب سبلت',            'Split AC Installation',       2, 'وحدة', '1 فني + مساعد', 2, 400, 'mep', 'يشمل فريون وصرف'),
  makeActivity('hvac_ducting',      'تمديد دكت',             'Duct Installation',           8, 'م.ط', '2 فنيين', 2, 500, 'mep', 'مركزي فقط'),

  // ═══════════════ أعمال خارجية ═══════════════
  makeActivity('boundary_wall',     'بناء سور خارجي',       'Boundary Wall',                6, 'م.ط', '1 بنّاء + 2 مساعدين', 3, 500, 'external', 'بلوك + عمود + قواعد'),
  makeActivity('landscaping',       'تنسيق حدائق',          'Landscaping',                 20, 'م2', '2 عمال', 2, 300, 'external', 'عشب + أشجار'),
];

// =====================================================================
// 2. معاملات تعديل الإنتاجية — Productivity Adjustment Factors
// =====================================================================

export interface ProductivityFactor {
  factor: number;
  nameAr: string;
  nameEn: string;
}

/** تأثير الطقس على الإنتاجية */
export const WEATHER_FACTORS: Record<string, ProductivityFactor> = {
  normal:     { factor: 1.00, nameAr: 'طقس معتدل', nameEn: 'Normal Weather' },
  summer_hot: { factor: 0.80, nameAr: 'صيف حار (>42°C)', nameEn: 'Hot Summer (>42°C)' },
  ramadan:    { factor: 0.70, nameAr: 'شهر رمضان', nameEn: 'Ramadan' },
  rain:       { factor: 0.60, nameAr: 'أمطار / عواصف', nameEn: 'Rain / Storms' },
  winter:     { factor: 1.05, nameAr: 'شتاء معتدل', nameEn: 'Mild Winter' },
};

/** تأثير تعقيد المبنى */
export const COMPLEXITY_FACTORS: Record<string, ProductivityFactor> = {
  simple:     { factor: 1.10, nameAr: 'بسيط (فيلا)', nameEn: 'Simple (Villa)' },
  standard:   { factor: 1.00, nameAr: 'عادي (سكني)', nameEn: 'Standard (Residential)' },
  complex:    { factor: 0.85, nameAr: 'معقد (تجاري/مستشفى)', nameEn: 'Complex (Commercial)' },
  high_rise:  { factor: 0.75, nameAr: 'أبراج (+10 أدوار)', nameEn: 'High-Rise (+10 Floors)' },
};

// =====================================================================
// 3. Helper: البحث عن نشاط وحساب التكلفة
// =====================================================================

/** البحث عن نشاط بالمعرّف */
export function findActivity(activityId: string): LaborActivity | undefined {
  return LABOR_ACTIVITIES.find(a => a.id === activityId);
}

/**
 * حساب تكلفة العمالة لكمية معيّنة مع عوامل التعديل
 */
export function calculateLaborCost(
  activityId: string,
  quantity: number,
  weatherFactor: string = 'normal',
  complexityFactor: string = 'standard'
): { days: number; cost: number; crews: number } | null {
  const activity = findActivity(activityId);
  if (!activity) return null;

  const weather = WEATHER_FACTORS[weatherFactor]?.factor || 1.0;
  const complexity = COMPLEXITY_FACTORS[complexityFactor]?.factor || 1.0;
  const adjustedOutput = activity.outputPerDay * weather * complexity;

  const days = Math.ceil(quantity / adjustedOutput);
  const cost = days * activity.dailyCrewCost;

  return { days, cost, crews: 1 };
}
