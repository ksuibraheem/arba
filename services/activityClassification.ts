/**
 * ARBA-Ops v8.1 — Activity Classification & Regulatory Mapping
 * نظام تصنيف الأنشطة التجارية وربطها بالاشتراطات التنظيمية
 *
 * المصادر:
 *  - اشتراطات المباني السكنية
 *  - اشتراطات المباني الصحية
 *  - اشتراطات أبراج الاتصالات اللاسلكية
 *  - اشتراطات المخابز والحلويات
 *  - اشتراطات المباني التعليمية الخاصة
 *  - اشتراطات الطب البديل والتكميلي
 *  - الاشتراطات الفنية لشحن المركبات الكهربائية
 *  - اشتراطات المختبرات (تجميلية / مواد عامة / أجهزة)
 *  - اشتراطات مدارس ومعاهد الطيران
 */

// =====================================================================
// 1. تصنيف الأنشطة — Activity Categories
// =====================================================================

export type ActivityCategory =
  | 'RESIDENTIAL'          // مباني سكنية
  | 'HEALTHCARE'           // مباني صحية (مستشفيات، عيادات، مراكز)
  | 'TELECOM_TOWERS'       // أبراج وهوائيات الاتصالات اللاسلكية
  | 'BAKERY_SWEETS'        // مخابز وحلويات
  | 'EDUCATIONAL_PRIVATE'  // مباني تعليمية خاصة
  | 'ALT_MEDICINE'         // طب بديل وتكميلي
  | 'EV_CHARGING'          // شحن مركبات كهربائية
  | 'LAB_COSMETIC'         // مختبرات منتجات تجميلية وطبية
  | 'LAB_MATERIALS'        // مختبرات مواد عامة
  | 'LAB_EQUIPMENT'        // مختبرات فحص أجهزة ومعدات
  | 'AVIATION_SCHOOLS';    // مدارس ومعاهد طيران

// =====================================================================
// 2. بيانات النشاط — Activity Registry
// =====================================================================

export interface ActivityDefinition {
  id: ActivityCategory;
  nameAr: string;
  nameEn: string;
  icon: string;
  /** الجهة المُنظمة */
  regulator: string;
  /** تصنيف الإشغال SBC */
  sbcOccupancy: string;
  /** قطاعات BOQ المتأثرة */
  affectedSections: string[];
  /** الاشتراطات المكانية الرئيسية */
  spatialKeys: string[];
  /** هل يتطلب رخصة خاصة */
  requiresSpecialPermit: boolean;
  /** هل يتطلب موافقة الدفاع المدني */
  requiresCivilDefense: boolean;
  /** هل يتطلب تقييم بيئي */
  requiresEnvironmental: boolean;
}

export const ACTIVITY_REGISTRY: Record<ActivityCategory, ActivityDefinition> = {
  RESIDENTIAL: {
    id: 'RESIDENTIAL',
    nameAr: 'مباني سكنية',
    nameEn: 'Residential Buildings',
    icon: '🏠',
    regulator: 'وزارة الشؤون البلدية والقروية — أمانة المنطقة',
    sbcOccupancy: 'R-3',
    affectedSections: ['excavation', 'substructure', 'superstructure', 'finishes', 'mep', 'facades'],
    spatialKeys: ['setbacks', 'buildingRatio', 'maxFloors', 'fenceHeight', 'parking'],
    requiresSpecialPermit: false,
    requiresCivilDefense: false,
    requiresEnvironmental: false,
  },

  HEALTHCARE: {
    id: 'HEALTHCARE',
    nameAr: 'مباني صحية',
    nameEn: 'Healthcare Facilities',
    icon: '🏥',
    regulator: 'وزارة الصحة — هيئة التخصصات الصحية',
    sbcOccupancy: 'I-2',
    affectedSections: ['excavation', 'substructure', 'superstructure', 'finishes', 'mep', 'facades', 'medical_gas'],
    spatialKeys: ['minArea', 'parking', 'ventilation', 'corridorWidth', 'elevator'],
    requiresSpecialPermit: true,
    requiresCivilDefense: true,
    requiresEnvironmental: true,
  },

  TELECOM_TOWERS: {
    id: 'TELECOM_TOWERS',
    nameAr: 'أبراج اتصالات لاسلكية',
    nameEn: 'Telecom Towers & Antennas',
    icon: '📡',
    regulator: 'هيئة الاتصالات وتقنية المعلومات (CITC)',
    sbcOccupancy: 'U',
    affectedSections: ['foundation', 'steel_structure', 'electrical', 'fencing'],
    spatialKeys: ['maxHeight', 'safetyDistance', 'fenceHeight', 'foundation'],
    requiresSpecialPermit: true,
    requiresCivilDefense: false,
    requiresEnvironmental: true,
  },

  BAKERY_SWEETS: {
    id: 'BAKERY_SWEETS',
    nameAr: 'مخابز وحلويات',
    nameEn: 'Bakeries & Sweets Shops',
    icon: '🍞',
    regulator: 'وزارة الشؤون البلدية والقروية — الأمانة',
    sbcOccupancy: 'M',
    affectedSections: ['finishes', 'mep', 'hvac', 'food_safety', 'fire'],
    spatialKeys: ['minArea', 'wallCladding', 'tempControl', 'ventilation', 'storage', 'glassThickness'],
    requiresSpecialPermit: false,
    requiresCivilDefense: true,
    requiresEnvironmental: true,
  },

  EDUCATIONAL_PRIVATE: {
    id: 'EDUCATIONAL_PRIVATE',
    nameAr: 'مباني تعليمية خاصة',
    nameEn: 'Private Educational Buildings',
    icon: '🏫',
    regulator: 'وزارة التعليم',
    sbcOccupancy: 'E',
    affectedSections: ['excavation', 'substructure', 'superstructure', 'finishes', 'mep', 'fire', 'accessibility'],
    spatialKeys: ['areaPerStudent', 'maxFloors', 'parking', 'fenceHeight', 'courtyard', 'fuelStationDistance'],
    requiresSpecialPermit: true,
    requiresCivilDefense: true,
    requiresEnvironmental: false,
  },

  ALT_MEDICINE: {
    id: 'ALT_MEDICINE',
    nameAr: 'طب بديل وتكميلي',
    nameEn: 'Alternative & Complementary Medicine',
    icon: '🌿',
    regulator: 'وزارة الصحة — المجلس الصحي',
    sbcOccupancy: 'B',
    affectedSections: ['finishes', 'mep', 'fire', 'accessibility'],
    spatialKeys: ['minArea', 'fireSafety', 'corridorWidth', 'doorWidth'],
    requiresSpecialPermit: true,
    requiresCivilDefense: true,
    requiresEnvironmental: false,
  },

  EV_CHARGING: {
    id: 'EV_CHARGING',
    nameAr: 'شحن مركبات كهربائية',
    nameEn: 'Electric Vehicle Charging',
    icon: '⚡',
    regulator: 'هيئة تنظيم الكهرباء والإنتاج المزدوج',
    sbcOccupancy: 'S-2',
    affectedSections: ['electrical', 'fire', 'signage'],
    spatialKeys: ['parkingRatio', 'chargingLevel', 'electricalCapacity'],
    requiresSpecialPermit: true,
    requiresCivilDefense: true,
    requiresEnvironmental: true,
  },

  LAB_COSMETIC: {
    id: 'LAB_COSMETIC',
    nameAr: 'مختبرات منتجات تجميلية وطبية',
    nameEn: 'Cosmetic & Medical Product Labs',
    icon: '🧪',
    regulator: 'هيئة الغذاء والدواء (SFDA)',
    sbcOccupancy: 'B',
    affectedSections: ['finishes', 'mep', 'hvac', 'fire', 'hazmat'],
    spatialKeys: ['minArea', 'parking', 'floorSlope', 'windowRatio', 'hazmatDistance'],
    requiresSpecialPermit: true,
    requiresCivilDefense: true,
    requiresEnvironmental: true,
  },

  LAB_MATERIALS: {
    id: 'LAB_MATERIALS',
    nameAr: 'مختبرات مواد عامة',
    nameEn: 'General Materials Testing Labs',
    icon: '🔬',
    regulator: 'هيئة المواصفات والمقاييس (SASO)',
    sbcOccupancy: 'B',
    affectedSections: ['finishes', 'mep', 'hvac', 'fire', 'hazmat'],
    spatialKeys: ['minArea', 'parking', 'floorSlope', 'windowRatio', 'hazmatDistance'],
    requiresSpecialPermit: true,
    requiresCivilDefense: true,
    requiresEnvironmental: true,
  },

  LAB_EQUIPMENT: {
    id: 'LAB_EQUIPMENT',
    nameAr: 'مختبرات فحص أجهزة ومعدات',
    nameEn: 'Equipment Testing Labs',
    icon: '⚙️',
    regulator: 'هيئة المواصفات والمقاييس (SASO)',
    sbcOccupancy: 'B',
    affectedSections: ['finishes', 'mep', 'hvac', 'fire', 'hazmat'],
    spatialKeys: ['minArea', 'parking', 'floorSlope', 'windowRatio', 'hazmatDistance'],
    requiresSpecialPermit: true,
    requiresCivilDefense: true,
    requiresEnvironmental: true,
  },

  AVIATION_SCHOOLS: {
    id: 'AVIATION_SCHOOLS',
    nameAr: 'مدارس ومعاهد طيران',
    nameEn: 'Aviation Schools & Institutes',
    icon: '✈️',
    regulator: 'الهيئة العامة للطيران المدني (GACA)',
    sbcOccupancy: 'E',
    affectedSections: ['excavation', 'substructure', 'superstructure', 'finishes', 'mep', 'fire', 'accessibility'],
    spatialKeys: ['minArea', 'parking', 'maxFloors', 'fireSafety', 'simulator'],
    requiresSpecialPermit: true,
    requiresCivilDefense: true,
    requiresEnvironmental: true,
  },
};

// =====================================================================
// 3. تحويل نوع المشروع إلى نشاط تنظيمي
// =====================================================================

import { ProjectType } from '../types';

/**
 * يحول نوع المشروع (من واجهة المستخدم) إلى فئة النشاط التنظيمي
 */
export function mapProjectTypeToActivity(projectType: ProjectType): ActivityCategory | null {
  const mapping: Partial<Record<ProjectType, ActivityCategory>> = {
    villa:                'RESIDENTIAL',
    residential_building: 'RESIDENTIAL',
    rest_house:           'RESIDENTIAL',
    hospital:             'HEALTHCARE',
    clinic:               'HEALTHCARE',
    school:               'EDUCATIONAL_PRIVATE',
    restaurant:           'BAKERY_SWEETS',
    mosque:               undefined,
    hotel:                undefined,
    factory:              undefined,
    tower:                undefined,
    sports_complex:       undefined,
    farm:                 undefined,
    gas_station:          undefined,
    mall:                 undefined,
    car_wash:             undefined,
    warehouse:            undefined,
    government:           undefined,
  };
  return mapping[projectType] ?? null;
}

/**
 * يسترجع تعريف النشاط الكامل بناءً على نوع المشروع
 */
export function getActivityDefinition(projectType: ProjectType): ActivityDefinition | null {
  const category = mapProjectTypeToActivity(projectType);
  return category ? ACTIVITY_REGISTRY[category] : null;
}

/**
 * يسترجع قائمة جميع الأنشطة المسجلة
 */
export function getAllActivities(): ActivityDefinition[] {
  return Object.values(ACTIVITY_REGISTRY);
}

/**
 * يسترجع الأنشطة التي تتطلب موافقة الدفاع المدني
 */
export function getActivitiesRequiringCivilDefense(): ActivityDefinition[] {
  return Object.values(ACTIVITY_REGISTRY).filter(a => a.requiresCivilDefense);
}
