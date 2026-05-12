/**
 * ARBA-Ops v8.1 — Regulatory Engineering Constants
 * الثوابت الهندسية التنظيمية لجميع الأنشطة التجارية
 *
 * يتم استخدامه بواسطة: cognitiveCalculations.ts, activityClassification.ts
 * المصادر: 12 ملف تنظيمي مستخرج + كود البناء السعودي SBC
 */

import { ActivityCategory } from './activityClassification';

// =====================================================================
// 1. المباني السكنية — Residential Requirements
// =====================================================================

export const RESIDENTIAL_REQUIREMENTS = {
  /** نسبة البناء القصوى */
  maxBuildRatio: {
    villa: 0.70,         // 70%
    duplex: 0.70,
    apartment: 0.65,     // 65%
  },
  /** الارتدادات (متر) حسب عرض الشارع */
  setbacks: {
    front: [
      { streetWidth_max: 15, setback_m: 3 },
      { streetWidth_max: 30, setback_m: 5 },
      { streetWidth_max: Infinity, setback_m: 6 },
    ],
    side_min_m: 3,
    rear_min_m: 3,
  },
  /** ارتفاع السور الأقصى (متر) */
  maxFenceHeight_m: 2.40,
  /** مواقف السيارات */
  parking: {
    villa: { perUnit: 2 },
    apartment: { perUnit: 1.5 },
  },
  /** أقصى عدد أدوار */
  maxFloors: {
    villa: 3,            // أرضي + 2
    apartment: 5,        // أرضي + 4
  },
};

// =====================================================================
// 2. المخابز والحلويات — Bakery & Sweets Requirements
// =====================================================================

export const BAKERY_REQUIREMENTS = {
  /** الحد الأدنى للمساحة (م²) */
  minArea: {
    bakery_standard: 16,
    bakery_semi_auto: 150,
    bakery_full_auto: 300,
    sweets_shop: 16,
    kiosk_mall: 4,
    kiosk_land: 10,
  },
  /** أقصى ارتفاع للكشك (متر) */
  maxKioskHeight_m: 4,
  /** أقصى مساحة مخزن */
  storage: {
    maxPercent: 0.25,        // 25% من المساحة الإجمالية
    maxAbsolute_m2: 150,     // أو 150م² أيهما أقل
  },
  /** تكسية الحوائط */
  wallCladding: {
    minHeight_m: 1.80,       // ارتفاع التكسية في مناطق التحضير
    material: 'سيراميك أو ما يعادله — سهل التنظيف',
  },
  /** الواجهات */
  facade: {
    minGlassThickness_mm: 12,  // زجاج سيكوريت
    type: 'سيكوريت مقسى',
  },
  /** التحكم بدرجة الحرارة */
  tempControl: {
    maxPreparationTemp_C: 25,
    chilledStorage: { min: 0, max: 4 },       // °C
    frozenStorage_max: -18,                    // °C
  },
  /** ضوابط التخزين */
  storageRules: {
    minHeightAboveFloor_cm: 15,
    minDistanceFromWall_cm: 5,
    minDistanceFromCeiling_cm: 30,
    humidityRange: { min: 60, max: 65 },      // %
  },
  /** مخرج طوارئ */
  emergency: {
    minExitWidth_cm: 90,
    maxTravelDistance_m: 30,
  },
};

// =====================================================================
// 3. المباني التعليمية الخاصة — Educational Requirements
// =====================================================================

export type EducationLevel = 'nursery' | 'primary' | 'intermediate' | 'secondary';
export type SchoolClass = 'A' | 'B' | 'C';

export const EDUCATIONAL_REQUIREMENTS = {
  /** معدل مساحة الأرض لكل طالب (م²/طالب) — جدول (3) فئة أ */
  areaPerStudent: {
    A: {
      nursery: 5.00,
      primary: 4.40,
      intermediate: 4.70,
      secondary: 5.25,
    },
    B: {
      nursery: 4.50,
      primary: 3.96,
      intermediate: 4.23,
      secondary: 4.73,
    },
  } as Record<string, Record<EducationLevel, number>>,

  /** أقصى عدد أدوار — جدول (4) */
  maxFloors: {
    nursery: 2,         // أرضي + 1
    primary: 4,         // أرضي + 3
    intermediate: 4,    // أرضي + 3
    secondary: 4,       // أرضي + 3
  } as Record<EducationLevel, number>,

  /** مواقف السيارات — جدول (2) فئة أ */
  parking: {
    A: {
      nursery:      { perClassrooms: 3, spots: 1 },       // 1 لكل 3 فصول
      primary:      { perClassrooms: 1, spots: 2 },       // 2 لكل فصل
      intermediate: { perClassrooms: 1, spots: 2 },       // 2 لكل فصل
      secondary:    { perClassrooms: 1, spots: 4 },       // 4 لكل فصل
    },
    busParking: { perClassrooms: 3, spots: 1 },            // 1 لكل 3 فصول
  },

  /** ارتفاع الأسوار (متر) */
  minFenceHeight_m: 2.40,

  /** مسافة عن محطات الوقود — حضانة (متر قطري) */
  minFuelStationDistance_m: 50,

  /** تغطية الساحات */
  minCourtyardCoverage: 0.75,    // 75%

  /** أقصى مساحة مخزن مواد */
  maxStorageArea_m2: 100,

  /** الحد الأدنى لعرض الشارع المواجه */
  minStreetWidth_m: 12,
};

// =====================================================================
// 4. المباني الصحية — Healthcare Requirements
// =====================================================================

export const HEALTHCARE_REQUIREMENTS = {
  /** تهوية غرف العمليات (ASHRAE 170) */
  ventilation: {
    operatingRoom_ACH: 20,       // تغيير هواء/ساعة
    patientRoom_ACH: 6,
    icu_ACH: 12,
    lab_ACH: 6,
    pharmacy_ACH: 4,
  },
  /** مواقف السيارات */
  parking: {
    hospital: { per: 3, unit: 'beds', spots: 1 },      // 1 لكل 3 أسرة
    clinic: { per: 25, unit: 'm2', spots: 1 },          // 1 لكل 25م²
    medical_center: { per: 25, unit: 'm2', spots: 1 },
  },
  /** عرض الممرات */
  corridorWidth: {
    main_m: 2.40,
    secondary_m: 1.80,
    patient_m: 2.40,
  },
  /** المصاعد */
  elevator: {
    requiredAboveFloors: 2,
    minCapacity_kg: 1600,
    stretcherElevator: true,
  },
  /** الضغط السلبي لغرف العزل */
  isolationRoom: {
    negativePressure: true,
    minACH: 12,
    hepaFilter: true,
  },
};

// =====================================================================
// 5. الطب البديل والتكميلي — Alternative Medicine
// =====================================================================

export const ALT_MEDICINE_REQUIREMENTS = {
  /** الحد الأدنى للمساحة (م²) — جدول 3.4 */
  minArea: {
    clinic: 60,            // عيادة
    center: 80,            // مركز
    complex: 120,          // مجمع
  },
  /** السلامة من الحريق */
  fireSafety: {
    maxExtinguisherDistance_m: 23,
    minEscapeCorridorWidth_m: 1.1,
    minEmergencyDoorWidth_cm: 80,
    smokeDetectors: true,
    sprinklerAbove_m2: 500,
  },
  /** ذوي الإعاقة */
  accessibility: {
    rampRequired: true,
    maxRampSlope: 0.08,       // 8%
    accessibleBathroom: true,
    minDoorWidth_cm: 90,
  },
};

// =====================================================================
// 6. أبراج الاتصالات اللاسلكية — Telecom Towers
// =====================================================================

export const TELECOM_TOWER_REQUIREMENTS = {
  /** أقصى ارتفاع (متر) */
  maxHeight: {
    openLand: 90,              // أراضي فضاء
    rooftop: 15,               // فوق أسطح المباني
  },
  /** المسافات الآمنة */
  safetyDistance: {
    fromResidential_m: 2,      // عن الملاحق السكنية
    fromBuildingEdge_m: 3,     // عن حدود المبنى
  },
  /** سياج الحماية */
  fencing: {
    maxHeight_m: 2.4,
    material: 'حديد مجلفن أو شبك معدني',
  },
  /** الأساسات */
  foundation: {
    requiresGeotechnical: true,
    minDepth_m: 3.0,
    type: 'خرسانة مسلحة — حسب التصميم الإنشائي',
  },
  /** التأريض */
  grounding: {
    requiredResistance_ohm: 10,
    type: 'TN-S',
    lightningProtection: true,
  },
};

// =====================================================================
// 7. شحن المركبات الكهربائية — EV Charging
// =====================================================================

export const EV_CHARGING_REQUIREMENTS = {
  /** نسبة مواقف الشحن من الإجمالي */
  parkingRatio: 0.05,          // 5%
  /** مستويات الشحن */
  chargingLevels: {
    level1: {
      nameAr: 'المستوى الأول — إقامة طويلة',
      power_kW: 3.7,
      duration: '8+ ساعات',
      locations: ['سكني', 'مكاتب'],
    },
    level2: {
      nameAr: 'المستوى الثاني — متوسط',
      power_kW: 22,
      duration: '2-4 ساعات',
      locations: ['مولات', 'فنادق', 'مطاعم'],
    },
    level3: {
      nameAr: 'المستوى الثالث — سريع',
      power_kW: 150,
      duration: '20-60 دقيقة',
      locations: ['محطات وقود', 'طرق سريعة'],
    },
  },
  /** متطلبات كهربائية */
  electrical: {
    dedicatedCircuit: true,
    earthingType: 'TN-S',
    rcdRequired: true,
    rcdRating_mA: 30,
  },
  /** لافتات */
  signage: {
    required: true,
    minSize_cm: 40,
    reflective: true,
  },
};

// =====================================================================
// 8. المختبرات (3 أنواع) — Laboratory Requirements
// =====================================================================

export const LAB_REQUIREMENTS = {
  /** مواقف السيارات */
  parking: {
    staff: { per: 1, unit: 'worker', spots: 1 },         // 1/عامل
    visitors_inBuilding: { per: 50, unit: 'm2', spots: 1 },  // 1/50م²
    visitors_standalone: { per: 25, unit: 'm2', spots: 1 },  // 1/25م²
  },
  /** ميول الأرضيات الخارجية */
  maxExteriorFloorSlope: 0.02,     // 2%
  /** نسبة النوافذ من مساحة الأرضية */
  minWindowRatio: 0.08,            // 8%
  /** مسافة فصل المواد الخطرة (متر) */
  hazmatSeparationDistance_m: 6,
  /** التهوية */
  ventilation: {
    fumeHood: true,
    minACH: 6,
    negativePressure_hazmat: true,
  },
  /** الأرضيات */
  flooring: {
    type: 'إيبوكسي مضاد للكيماويات أو بلاط مقاوم للأحماض',
    antistatic: true,
  },
  /** التخلص من النفايات */
  wasteDisposal: {
    chemicalWasteSeparation: true,
    biohazardContainers: true,
    sharpsContainers: true,
  },
};

// =====================================================================
// 9. سلامة الغذاء — Food Safety Constants
// =====================================================================

export const FOOD_SAFETY_CONSTANTS = {
  /** درجات الحرارة */
  temperature: {
    maxPreparation_C: 25,
    chilledStorage: { min: 0, max: 4 },
    frozenStorage_max_C: -18,
    hotHolding_min_C: 63,
    dangerZone: { min: 5, max: 63 },
  },
  /** الرطوبة */
  humidity: {
    dryStorage: { min: 60, max: 65 },
  },
  /** ارتفاعات التخزين */
  storage: {
    minAboveFloor_cm: 15,
    minFromWall_cm: 5,
    minFromCeiling_cm: 30,
  },
  /** الأسطح */
  surfaces: {
    wallCladding_minHeight_m: 1.80,
    material: 'سيراميك أبيض لامع أو ستانلس ستيل',
    floorSlope_max: 0.02,
    floorMaterial: 'بلاط مانع للانزلاق — مقاومة R11+',
  },
  /** الإنارة */
  lighting: {
    preparation_lux: 500,
    storage_lux: 250,
    display_lux: 300,
  },
};

// =====================================================================
// 10. السلامة من الحريق — Fire Safety Constants (SBC 801)
// =====================================================================

export const FIRE_SAFETY_CONSTANTS = {
  /** طفايات حريق */
  extinguishers: {
    maxTravelDistance_m: 23,
    type: 'ABC متعدد الأغراض',
    minRating: '4A:20BC',
    heightAboveFloor_m: { min: 0.10, max: 1.50 },
  },
  /** مخارج الطوارئ */
  emergencyExits: {
    minWidth_cm: 90,
    maxTravelDistance_m: 30,
    illuminatedSigns: true,
    panicHardware: true,
  },
  /** كواشف الدخان */
  smokeDetectors: {
    maxCoverage_m2: 60,
    minPerRoom: 1,
    interconnected: true,
  },
  /** رشاشات (سبرنكلر) */
  sprinklers: {
    requiredAbove_m2: 500,
    type: 'رأس رشاش قياسي — مستجيب سريع',
    minPressure_bar: 0.5,
    maxSpacing_m: 4.6,
  },
  /** إنذار حريق */
  alarmSystem: {
    requiredAbove_m2: 300,
    manualCallPoints: true,
    maxDistance_m: 30,
    audible_dB: 85,
  },
  /** لوحة إرشادية */
  signage: {
    exitSigns: true,
    photoluminescent: true,
    floorPlanPosted: true,
  },
};

// =====================================================================
// 11. ذوي الإعاقة — Accessibility Constants (SBC 1001)
// =====================================================================

export const ACCESSIBILITY_CONSTANTS = {
  /** مداخل */
  entrance: {
    rampRequired: true,
    maxRampSlope: 0.08,          // 1:12
    minRampWidth_m: 1.20,
    handrails: true,
    handrailHeight_cm: { min: 86, max: 96 },
  },
  /** أبواب */
  doors: {
    minWidth_cm: 90,
    maxThresholdHeight_cm: 1.3,
    leverHandle: true,
  },
  /** دورات المياه */
  accessibleBathroom: {
    minArea_m2: 2.25,
    grabBars: true,
    rollInShower: false,
    sinkHeight_cm: 86,
  },
  /** مواقف */
  parking: {
    minPercent: 0.02,            // 2% من المواقف
    minSpots: 1,
    minWidth_m: 3.65,
    signage: true,
  },
  /** مصعد */
  elevator: {
    requiredAboveFloors: 2,
    minWidth_m: 1.10,
    minDepth_m: 1.40,
    brailleButtons: true,
    audioAnnouncement: true,
  },
};

// =====================================================================
// 12. دالة الاستعلام الموحدة
// =====================================================================

/**
 * يسترجع جميع الثوابت التنظيمية الخاصة بنشاط معين
 */
export function getRegulatoryConstants(activity: ActivityCategory) {
  switch (activity) {
    case 'RESIDENTIAL':
      return { spatial: RESIDENTIAL_REQUIREMENTS, fire: FIRE_SAFETY_CONSTANTS, accessibility: ACCESSIBILITY_CONSTANTS };
    case 'BAKERY_SWEETS':
      return { spatial: BAKERY_REQUIREMENTS, fire: FIRE_SAFETY_CONSTANTS, food: FOOD_SAFETY_CONSTANTS, accessibility: ACCESSIBILITY_CONSTANTS };
    case 'EDUCATIONAL_PRIVATE':
      return { spatial: EDUCATIONAL_REQUIREMENTS, fire: FIRE_SAFETY_CONSTANTS, accessibility: ACCESSIBILITY_CONSTANTS };
    case 'HEALTHCARE':
      return { spatial: HEALTHCARE_REQUIREMENTS, fire: FIRE_SAFETY_CONSTANTS, accessibility: ACCESSIBILITY_CONSTANTS };
    case 'ALT_MEDICINE':
      return { spatial: ALT_MEDICINE_REQUIREMENTS, fire: FIRE_SAFETY_CONSTANTS, accessibility: ACCESSIBILITY_CONSTANTS };
    case 'TELECOM_TOWERS':
      return { spatial: TELECOM_TOWER_REQUIREMENTS, fire: FIRE_SAFETY_CONSTANTS };
    case 'EV_CHARGING':
      return { spatial: EV_CHARGING_REQUIREMENTS, fire: FIRE_SAFETY_CONSTANTS };
    case 'LAB_COSMETIC':
    case 'LAB_MATERIALS':
    case 'LAB_EQUIPMENT':
      return { spatial: LAB_REQUIREMENTS, fire: FIRE_SAFETY_CONSTANTS, accessibility: ACCESSIBILITY_CONSTANTS };
    case 'AVIATION_SCHOOLS':
      return { spatial: EDUCATIONAL_REQUIREMENTS, fire: FIRE_SAFETY_CONSTANTS, accessibility: ACCESSIBILITY_CONSTANTS };
    default:
      return { fire: FIRE_SAFETY_CONSTANTS, accessibility: ACCESSIBILITY_CONSTANTS };
  }
}
