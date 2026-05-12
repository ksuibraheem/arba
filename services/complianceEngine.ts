/**
 * ARBA-Ops v8.1 — Regulatory Compliance Engine
 * محرك الامتثال التنظيمي — يعمل بجانب المحرك المعرفي الحالي
 *
 * يستقبل: نوع النشاط + بيانات المشروع
 * يُنتج: تقرير امتثال + بنود BOQ إضافية تنظيمية
 */

import { ActivityCategory, mapProjectTypeToActivity } from './activityClassification';
import {
  RESIDENTIAL_REQUIREMENTS, BAKERY_REQUIREMENTS, EDUCATIONAL_REQUIREMENTS,
  HEALTHCARE_REQUIREMENTS, ALT_MEDICINE_REQUIREMENTS, TELECOM_TOWER_REQUIREMENTS,
  EV_CHARGING_REQUIREMENTS, LAB_REQUIREMENTS, FOOD_SAFETY_CONSTANTS,
  FIRE_SAFETY_CONSTANTS, ACCESSIBILITY_CONSTANTS,
  EducationLevel, SchoolClass,
} from './regulatoryConstants';
import { ProjectType, BlueprintConfig, Language } from '../types';

// =====================================================================
// 1. أنواع المخرجات
// =====================================================================

export type ComplianceStatus = 'PASS' | 'FAIL' | 'WARNING' | 'INFO';

export interface ComplianceCheckItem {
  id: string;
  category: string;
  nameAr: string;
  nameEn: string;
  status: ComplianceStatus;
  required: string;
  actual: string;
  regulation: string;
}

export interface RegulatoryBOQItem {
  id: string;
  nameAr: string;
  nameEn: string;
  unit: string;
  qty: number;
  regulation: string;
  mandatory: boolean;
}

export interface ComplianceReport {
  activity: ActivityCategory | null;
  activityNameAr: string;
  checks: ComplianceCheckItem[];
  additionalBOQ: RegulatoryBOQItem[];
  passRate: number;
  timestamp: string;
}

// =====================================================================
// 2. حساب المواقف — Parking Calculator
// =====================================================================

export function calculateParkingRequirements(
  activity: ActivityCategory,
  totalArea_m2: number,
  options?: { beds?: number; classrooms?: number; workers?: number; educationLevel?: EducationLevel; schoolClass?: SchoolClass },
): { required: number; regulation: string } {
  switch (activity) {
    case 'RESIDENTIAL': {
      const spots = Math.ceil(totalArea_m2 / 200) * 2;
      return { required: Math.max(2, spots), regulation: 'اشتراطات المباني السكنية' };
    }
    case 'HEALTHCARE': {
      if (options?.beds) return { required: Math.ceil(options.beds / 3), regulation: 'اشتراطات المباني الصحية — 1 موقف / 3 أسرّة' };
      return { required: Math.ceil(totalArea_m2 / 25), regulation: 'اشتراطات المباني الصحية — 1 موقف / 25م²' };
    }
    case 'EDUCATIONAL_PRIVATE': {
      const cls = options?.classrooms || Math.ceil(totalArea_m2 / 50);
      const level = options?.educationLevel || 'primary';
      const parkingData = EDUCATIONAL_REQUIREMENTS.parking.A;
      const rule = parkingData[level];
      const spots = Math.ceil(cls / rule.perClassrooms) * rule.spots;
      const buses = Math.ceil(cls / 3);
      return { required: spots + buses, regulation: `اشتراطات المباني التعليمية — جدول (2) فئة أ — ${level}` };
    }
    case 'BAKERY_SWEETS':
      return { required: Math.max(2, Math.ceil(totalArea_m2 / 30)), regulation: 'اشتراطات المخابز والحلويات' };
    case 'ALT_MEDICINE':
      return { required: Math.max(2, Math.ceil(totalArea_m2 / 25)), regulation: 'اشتراطات الطب البديل والتكميلي' };
    case 'LAB_COSMETIC': case 'LAB_MATERIALS': case 'LAB_EQUIPMENT': {
      const staff = options?.workers || Math.ceil(totalArea_m2 / 20);
      const visitors = Math.ceil(totalArea_m2 / 25);
      return { required: staff + visitors, regulation: 'اشتراطات المختبرات — 1/عامل + 1/25م²' };
    }
    default:
      return { required: Math.max(2, Math.ceil(totalArea_m2 / 30)), regulation: 'SBC عام' };
  }
}

// =====================================================================
// 3. الحد الأدنى للمساحة
// =====================================================================

export function calculateMinArea(
  activity: ActivityCategory,
  subType?: string,
): { minArea_m2: number; regulation: string } {
  switch (activity) {
    case 'BAKERY_SWEETS': {
      const key = (subType || 'bakery_standard') as keyof typeof BAKERY_REQUIREMENTS.minArea;
      const area = BAKERY_REQUIREMENTS.minArea[key] || 16;
      return { minArea_m2: area, regulation: 'اشتراطات المخابز — الباب الثالث' };
    }
    case 'ALT_MEDICINE': {
      const key = (subType || 'clinic') as keyof typeof ALT_MEDICINE_REQUIREMENTS.minArea;
      const area = ALT_MEDICINE_REQUIREMENTS.minArea[key] || 60;
      return { minArea_m2: area, regulation: 'اشتراطات الطب البديل — جدول 3.4' };
    }
    case 'HEALTHCARE':
      return { minArea_m2: 200, regulation: 'اشتراطات المباني الصحية' };
    default:
      return { minArea_m2: 0, regulation: 'لا يوجد حد أدنى محدد' };
  }
}

// =====================================================================
// 4. أقصى عدد أدوار
// =====================================================================

export function calculateMaxFloors(
  activity: ActivityCategory,
  educationLevel?: EducationLevel,
): { maxFloors: number; regulation: string } {
  switch (activity) {
    case 'RESIDENTIAL':
      return { maxFloors: RESIDENTIAL_REQUIREMENTS.maxFloors.villa, regulation: 'اشتراطات المباني السكنية' };
    case 'EDUCATIONAL_PRIVATE': {
      const level = educationLevel || 'primary';
      return { maxFloors: EDUCATIONAL_REQUIREMENTS.maxFloors[level], regulation: `اشتراطات المباني التعليمية — جدول (4) — ${level}` };
    }
    case 'TELECOM_TOWERS':
      return { maxFloors: 1, regulation: 'اشتراطات أبراج الاتصالات' };
    default:
      return { maxFloors: 10, regulation: 'SBC عام' };
  }
}

// =====================================================================
// 5. التحقق من الارتدادات
// =====================================================================

export function validateSetbacks(
  activity: ActivityCategory,
  blueprint: BlueprintConfig,
  streetWidth_m?: number,
): ComplianceCheckItem[] {
  const checks: ComplianceCheckItem[] = [];

  if (activity === 'RESIDENTIAL') {
    const sw = streetWidth_m || 15;
    const rule = RESIDENTIAL_REQUIREMENTS.setbacks.front.find(r => sw <= r.streetWidth_max);
    const reqFront = rule?.setback_m || 3;

    checks.push({
      id: 'setback_front', category: 'الارتدادات', nameAr: 'الارتداد الأمامي',
      nameEn: 'Front Setback', status: blueprint.setbackFront >= reqFront ? 'PASS' : 'FAIL',
      required: `≥ ${reqFront}م`, actual: `${blueprint.setbackFront}م`,
      regulation: 'اشتراطات المباني السكنية',
    });
    checks.push({
      id: 'setback_side', category: 'الارتدادات', nameAr: 'الارتداد الجانبي',
      nameEn: 'Side Setback', status: blueprint.setbackSide >= RESIDENTIAL_REQUIREMENTS.setbacks.side_min_m ? 'PASS' : 'FAIL',
      required: `≥ ${RESIDENTIAL_REQUIREMENTS.setbacks.side_min_m}م`, actual: `${blueprint.setbackSide}م`,
      regulation: 'اشتراطات المباني السكنية',
    });

    // نسبة البناء
    const plotArea = blueprint.plotLength * blueprint.plotWidth;
    const buildArea = blueprint.floors[0]?.area || 0;
    const ratio = plotArea > 0 ? buildArea / plotArea : 0;
    checks.push({
      id: 'build_ratio', category: 'نسبة البناء', nameAr: 'نسبة البناء',
      nameEn: 'Building Coverage Ratio', status: ratio <= RESIDENTIAL_REQUIREMENTS.maxBuildRatio.villa ? 'PASS' : 'FAIL',
      required: `≤ ${(RESIDENTIAL_REQUIREMENTS.maxBuildRatio.villa * 100).toFixed(0)}%`, actual: `${(ratio * 100).toFixed(1)}%`,
      regulation: 'اشتراطات المباني السكنية',
    });
  }

  // عدد الأدوار
  const { maxFloors: mf, regulation: mfReg } = calculateMaxFloors(activity);
  checks.push({
    id: 'max_floors', category: 'الأدوار', nameAr: 'أقصى عدد أدوار',
    nameEn: 'Maximum Floors', status: blueprint.floors.length <= mf ? 'PASS' : 'FAIL',
    required: `≤ ${mf}`, actual: `${blueprint.floors.length}`, regulation: mfReg,
  });

  return checks;
}

// =====================================================================
// 6. بنود السلامة من الحريق — Fire Safety BOQ
// =====================================================================

export function generateFireSafetyBOQ(
  activity: ActivityCategory,
  totalArea_m2: number,
  floorsCount: number,
): RegulatoryBOQItem[] {
  const items: RegulatoryBOQItem[] = [];
  const fs = FIRE_SAFETY_CONSTANTS;

  // طفايات حريق
  const extCount = Math.max(2, Math.ceil(totalArea_m2 / (fs.extinguishers.maxTravelDistance_m * 2 * floorsCount / 2)));
  items.push({ id: 'fire_ext', nameAr: 'طفاية حريق ABC', nameEn: 'Fire Extinguisher ABC', unit: 'عدد', qty: extCount * floorsCount, regulation: 'SBC 801', mandatory: true });

  // كواشف دخان
  const detectors = Math.ceil(totalArea_m2 / fs.smokeDetectors.maxCoverage_m2);
  items.push({ id: 'smoke_det', nameAr: 'كاشف دخان', nameEn: 'Smoke Detector', unit: 'عدد', qty: detectors, regulation: 'SBC 801', mandatory: true });

  // لوحات إرشادية
  items.push({ id: 'exit_signs', nameAr: 'لوحة مخرج طوارئ مضيئة', nameEn: 'Illuminated Exit Sign', unit: 'عدد', qty: floorsCount * 2, regulation: 'SBC 801', mandatory: true });
  items.push({ id: 'floor_plan', nameAr: 'مخطط إخلاء معلق', nameEn: 'Posted Floor Plan', unit: 'عدد', qty: floorsCount, regulation: 'SBC 801', mandatory: true });

  // رشاشات (إذا المساحة > 500م²)
  if (totalArea_m2 > fs.sprinklers.requiredAbove_m2) {
    const heads = Math.ceil(totalArea_m2 / (fs.sprinklers.maxSpacing_m * fs.sprinklers.maxSpacing_m));
    items.push({ id: 'sprinkler', nameAr: 'رأس رشاش حريق', nameEn: 'Sprinkler Head', unit: 'عدد', qty: heads, regulation: 'SBC 801', mandatory: true });
    items.push({ id: 'sprinkler_pipe', nameAr: 'شبكة مواسير رشاشات', nameEn: 'Sprinkler Piping Network', unit: 'م.ط', qty: Math.ceil(totalArea_m2 * 0.8), regulation: 'SBC 801', mandatory: true });
  }

  // نظام إنذار (إذا المساحة > 300م²)
  if (totalArea_m2 > fs.alarmSystem.requiredAbove_m2) {
    items.push({ id: 'fire_alarm', nameAr: 'لوحة إنذار حريق', nameEn: 'Fire Alarm Panel', unit: 'عدد', qty: 1, regulation: 'SBC 801', mandatory: true });
    items.push({ id: 'manual_call', nameAr: 'نقطة استدعاء يدوية', nameEn: 'Manual Call Point', unit: 'عدد', qty: floorsCount * 2, regulation: 'SBC 801', mandatory: true });
  }

  return items;
}

// =====================================================================
// 7. بنود ذوي الإعاقة — Accessibility BOQ
// =====================================================================

export function generateAccessibilityBOQ(
  activity: ActivityCategory,
  totalArea_m2: number,
  floorsCount: number,
): RegulatoryBOQItem[] {
  const items: RegulatoryBOQItem[] = [];
  const ac = ACCESSIBILITY_CONSTANTS;

  if (['HEALTHCARE', 'EDUCATIONAL_PRIVATE', 'ALT_MEDICINE', 'LAB_COSMETIC', 'LAB_MATERIALS', 'LAB_EQUIPMENT'].includes(activity)) {
    items.push({ id: 'acc_ramp', nameAr: 'منحدر ذوي الإعاقة', nameEn: 'Accessibility Ramp', unit: 'عدد', qty: 1, regulation: 'SBC 1001', mandatory: true });
    items.push({ id: 'acc_handrail', nameAr: 'درابزين منحدر ستانلس', nameEn: 'Ramp Handrail SS', unit: 'م.ط', qty: 6, regulation: 'SBC 1001', mandatory: true });
    items.push({ id: 'acc_wc', nameAr: 'دورة مياه ذوي إعاقة', nameEn: 'Accessible WC', unit: 'عدد', qty: Math.max(1, Math.ceil(floorsCount / 2)), regulation: 'SBC 1001', mandatory: true });
    items.push({ id: 'acc_grab', nameAr: 'مقبض استناد ستانلس', nameEn: 'Grab Bar SS', unit: 'عدد', qty: Math.max(1, Math.ceil(floorsCount / 2)) * 3, regulation: 'SBC 1001', mandatory: true });

    // مواقف ذوي الإعاقة
    const totalParking = Math.ceil(totalArea_m2 / 25);
    const accParking = Math.max(ac.parking.minSpots, Math.ceil(totalParking * ac.parking.minPercent));
    items.push({ id: 'acc_parking', nameAr: 'موقف ذوي إعاقة (عرض 3.65م)', nameEn: 'Accessible Parking (3.65m)', unit: 'عدد', qty: accParking, regulation: 'SBC 1001', mandatory: true });

    // مصعد (إذا أكثر من طابقين)
    if (floorsCount > ac.elevator.requiredAboveFloors) {
      items.push({ id: 'acc_elevator', nameAr: 'مصعد ذوي إعاقة (برايل + صوتي)', nameEn: 'Accessible Elevator', unit: 'عدد', qty: 1, regulation: 'SBC 1001', mandatory: true });
    }
  }

  return items;
}

// =====================================================================
// 8. بنود سلامة الغذاء — Food Safety BOQ
// =====================================================================

export function generateFoodSafetyBOQ(totalArea_m2: number): RegulatoryBOQItem[] {
  const items: RegulatoryBOQItem[] = [];
  const fc = FOOD_SAFETY_CONSTANTS;

  items.push({ id: 'food_wall', nameAr: `تكسية حوائط تحضير (ارتفاع ${fc.surfaces.wallCladding_minHeight_m}م)`, nameEn: 'Food Prep Wall Cladding', unit: 'م²', qty: Math.ceil(totalArea_m2 * 0.6 * fc.surfaces.wallCladding_minHeight_m * 2), regulation: 'اشتراطات المخابز', mandatory: true });
  items.push({ id: 'food_floor', nameAr: 'أرضية مانعة للانزلاق R11+', nameEn: 'Anti-slip Floor R11+', unit: 'م²', qty: Math.ceil(totalArea_m2 * 0.7), regulation: 'اشتراطات المخابز', mandatory: true });
  items.push({ id: 'food_drain', nameAr: 'بلاعة أرضية ستانلس', nameEn: 'SS Floor Drain', unit: 'عدد', qty: Math.max(2, Math.ceil(totalArea_m2 / 15)), regulation: 'اشتراطات المخابز', mandatory: true });
  items.push({ id: 'food_sink', nameAr: 'حوض غسيل يدين ستانلس', nameEn: 'SS Hand Wash Sink', unit: 'عدد', qty: Math.max(2, Math.ceil(totalArea_m2 / 30)), regulation: 'اشتراطات المخابز', mandatory: true });
  items.push({ id: 'food_thermo', nameAr: 'ثرموميتر رقمي لمراقبة الحرارة', nameEn: 'Digital Thermometer', unit: 'عدد', qty: 3, regulation: 'اشتراطات المخابز', mandatory: true });
  items.push({ id: 'food_pest', nameAr: 'شبك حماية من الحشرات للنوافذ', nameEn: 'Insect Screen', unit: 'م²', qty: Math.ceil(totalArea_m2 * 0.05), regulation: 'اشتراطات المخابز', mandatory: true });

  // واجهة زجاج سيكوريت
  items.push({ id: 'food_glass', nameAr: `واجهة زجاج سيكوريت ≥${BAKERY_REQUIREMENTS.facade.minGlassThickness_mm}مم`, nameEn: 'Tempered Glass Facade', unit: 'م²', qty: Math.ceil(totalArea_m2 * 0.15), regulation: 'اشتراطات المخابز — 4.3', mandatory: true });

  return items;
}

// =====================================================================
// 9. التقرير الشامل — Full Compliance Report
// =====================================================================

export function generateComplianceReport(
  projectType: ProjectType,
  blueprint: BlueprintConfig,
  options?: {
    streetWidth_m?: number;
    beds?: number;
    classrooms?: number;
    workers?: number;
    educationLevel?: EducationLevel;
    schoolClass?: SchoolClass;
    bakerySubType?: string;
    altMedicineSubType?: string;
  },
): ComplianceReport {
  const activity = mapProjectTypeToActivity(projectType);
  const totalArea = blueprint.floors.reduce((s, f) => s + f.area, 0);
  const floorsCount = blueprint.floors.length;

  if (!activity) {
    return {
      activity: null, activityNameAr: 'غير مصنف',
      checks: [], additionalBOQ: [], passRate: 100,
      timestamp: new Date().toISOString(),
    };
  }

  // === فحوصات الامتثال ===
  const checks: ComplianceCheckItem[] = [];

  // 1. الارتدادات ونسبة البناء
  checks.push(...validateSetbacks(activity, blueprint, options?.streetWidth_m));

  // 2. الحد الأدنى للمساحة
  const minArea = calculateMinArea(activity, options?.bakerySubType || options?.altMedicineSubType);
  if (minArea.minArea_m2 > 0) {
    checks.push({
      id: 'min_area', category: 'المساحة', nameAr: 'الحد الأدنى للمساحة',
      nameEn: 'Minimum Area', status: totalArea >= minArea.minArea_m2 ? 'PASS' : 'FAIL',
      required: `≥ ${minArea.minArea_m2}م²`, actual: `${totalArea}م²`, regulation: minArea.regulation,
    });
  }

  // 3. المواقف
  const parking = calculateParkingRequirements(activity, totalArea, options);
  checks.push({
    id: 'parking', category: 'المواقف', nameAr: 'المواقف المطلوبة',
    nameEn: 'Required Parking', status: 'INFO',
    required: `${parking.required} موقف`, actual: 'يحتاج إدخال يدوي', regulation: parking.regulation,
  });

  // === بنود BOQ التنظيمية ===
  const additionalBOQ: RegulatoryBOQItem[] = [];

  // بنود السلامة من الحريق
  additionalBOQ.push(...generateFireSafetyBOQ(activity, totalArea, floorsCount));

  // بنود ذوي الإعاقة
  additionalBOQ.push(...generateAccessibilityBOQ(activity, totalArea, floorsCount));

  // بنود سلامة الغذاء (مخابز فقط)
  if (activity === 'BAKERY_SWEETS') {
    additionalBOQ.push(...generateFoodSafetyBOQ(totalArea));
  }

  // حساب نسبة النجاح
  const totalChecks = checks.filter(c => c.status !== 'INFO').length;
  const passedChecks = checks.filter(c => c.status === 'PASS').length;
  const passRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;

  const activityNames: Record<ActivityCategory, string> = {
    RESIDENTIAL: 'مباني سكنية', HEALTHCARE: 'مباني صحية',
    TELECOM_TOWERS: 'أبراج اتصالات', BAKERY_SWEETS: 'مخابز وحلويات',
    EDUCATIONAL_PRIVATE: 'مباني تعليمية', ALT_MEDICINE: 'طب بديل',
    EV_CHARGING: 'شحن كهربائي', LAB_COSMETIC: 'مختبر تجميلي',
    LAB_MATERIALS: 'مختبر مواد', LAB_EQUIPMENT: 'مختبر أجهزة',
    AVIATION_SCHOOLS: 'مدارس طيران',
  };

  return {
    activity,
    activityNameAr: activityNames[activity] || activity,
    checks,
    additionalBOQ,
    passRate,
    timestamp: new Date().toISOString(),
  };
}
