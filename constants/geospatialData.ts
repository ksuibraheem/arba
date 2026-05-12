/**
 * ARBA Cognitive Engine v4.1 — Geospatial Data
 * إحداثيات المدن السعودية ومراكز التوريد الصناعية
 * 
 * Used by: environmentalAwarenessService.ts, goldenOutputService.ts
 * Purpose: Calculate distance-based logistics costs and supply waste factors
 */

import { LocationType } from '../types';

// =================== City Coordinates ===================

export const CITY_COORDINATES: Record<LocationType, { lat: number; lng: number; nameAr: string }> = {
    riyadh:           { lat: 24.7136, lng: 46.6753, nameAr: 'الرياض' },
    jeddah:           { lat: 21.4858, lng: 39.1925, nameAr: 'جدة' },
    dammam:           { lat: 26.3927, lng: 49.9777, nameAr: 'الدمام' },
    makkah:           { lat: 21.3891, lng: 39.8579, nameAr: 'مكة المكرمة' },
    madinah:          { lat: 24.5247, lng: 39.5692, nameAr: 'المدينة المنورة' },
    abha:             { lat: 18.2164, lng: 42.5053, nameAr: 'أبها' },
    tabuk:            { lat: 28.3838, lng: 36.5550, nameAr: 'تبوك' },
    qassim:           { lat: 26.3260, lng: 43.9750, nameAr: 'القصيم' },
    hail:             { lat: 27.5219, lng: 41.6907, nameAr: 'حائل' },
    jazan:            { lat: 16.8892, lng: 42.5700, nameAr: 'جازان' },
    najran:           { lat: 17.4933, lng: 44.1277, nameAr: 'نجران' },
    baha:             { lat: 20.0000, lng: 41.4667, nameAr: 'الباحة' },
    jouf:             { lat: 29.7854, lng: 40.0000, nameAr: 'الجوف' },
    northern_borders: { lat: 30.9753, lng: 41.0187, nameAr: 'الحدود الشمالية' },
    khobar:           { lat: 26.2172, lng: 50.1971, nameAr: 'الخبر' },
    yanbu:            { lat: 24.0895, lng: 38.0618, nameAr: 'ينبع' },
    taif:             { lat: 21.2700, lng: 40.4158, nameAr: 'الطائف' },
    khamis_mushait:   { lat: 18.3066, lng: 42.7333, nameAr: 'خميس مشيط' },
    ahsa:             { lat: 25.3483, lng: 49.5856, nameAr: 'الأحساء' },
    hafr_albatin:     { lat: 28.4328, lng: 45.9707, nameAr: 'حفر الباطن' },
};

// =================== Industrial Supply Hubs ===================

export interface SupplyHub {
    id: string;
    name: string;
    nameAr: string;
    lat: number;
    lng: number;
    specializations: string[]; // Material categories available
}

export const SUPPLY_HUBS: SupplyHub[] = [
    {
        id: 'riyadh_2nd_industrial',
        name: 'Riyadh 2nd Industrial City',
        nameAr: 'المنطقة الصناعية الثانية - الرياض',
        lat: 24.5500, lng: 46.8500,
        specializations: ['concrete', 'steel', 'blocks', 'tiles', 'wood', 'paint'],
    },
    {
        id: 'jeddah_1st_industrial',
        name: 'Jeddah 1st Industrial City',
        nameAr: 'المنطقة الصناعية الأولى - جدة',
        lat: 21.4200, lng: 39.2400,
        specializations: ['concrete', 'steel', 'tiles', 'plumbing', 'electrical'],
    },
    {
        id: 'dammam_1st_industrial',
        name: 'Dammam 1st Industrial City',
        nameAr: 'المنطقة الصناعية الأولى - الدمام',
        lat: 26.3500, lng: 50.0500,
        specializations: ['concrete', 'steel', 'blocks', 'hvac', 'electrical'],
    },
];

// =================== Haversine Distance Calculation ===================

/**
 * Calculate the great-circle distance between two points on Earth using the Haversine formula.
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(point2.lat - point1.lat);
    const dLng = toRadians(point2.lng - point1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// =================== Distance Factor Logic ===================

export interface DistanceFactor {
    nearestHub: SupplyHub;
    distanceKm: number;
    supplyWasteMultiplier: number;    // 1.0 = no adjustment
    shippingCostPerTon: number;       // SAR per ton
    isRemote: boolean;                // >30km from nearest hub
}

/**
 * Calculate the distance factor for a project location.
 * If the project is >30km from the nearest supply hub,
 * automatically adjusts supply waste and shipping costs.
 */
export function getDistanceFactor(location: LocationType): DistanceFactor {
    const projectCoords = CITY_COORDINATES[location];
    if (!projectCoords) {
        return {
            nearestHub: SUPPLY_HUBS[0],
            distanceKm: 0,
            supplyWasteMultiplier: 1.0,
            shippingCostPerTon: 50,
            isRemote: false,
        };
    }

    // Find nearest supply hub
    let nearestHub = SUPPLY_HUBS[0];
    let minDistance = Infinity;

    for (const hub of SUPPLY_HUBS) {
        const d = calculateHaversineDistance(projectCoords, hub);
        if (d < minDistance) {
            minDistance = d;
            nearestHub = hub;
        }
    }

    const distanceKm = Math.round(minDistance);

    // Supply waste multiplier: increases with distance
    let supplyWasteMultiplier = 1.0;
    if (distanceKm > 300) supplyWasteMultiplier = 1.10;       // +10% for very remote
    else if (distanceKm > 100) supplyWasteMultiplier = 1.06;  // +6% for moderately remote
    else if (distanceKm > 30) supplyWasteMultiplier = 1.03;   // +3% for slightly remote

    // Shipping cost per ton: linear with distance, minimum 50 SAR
    const shippingCostPerTon = Math.max(50, Math.round(distanceKm * 1.5));

    return {
        nearestHub,
        distanceKm,
        supplyWasteMultiplier,
        shippingCostPerTon,
        isRemote: distanceKm > 30,
    };
}

// =================== Neighborhood / Site Difficulty Factor ===================

/**
 * معامل صعوبة الموقع حسب الحي — Site Difficulty Factor by Neighborhood
 *
 * يؤثر على: تكلفة النقل، صعوبة التنفيذ، جودة التربة، علاوة السوق
 * المصدر: بيانات 20 مدينة + الملفات التنظيمية المستخرجة
 *
 * القيم:
 *   1.00 = عادي (أرض مستوية، تربة طبيعية، وصول سهل)
 *   1.05 = صعوبة طفيفة
 *   1.10 = صعوبة متوسطة (تضاريس، ضيق شوارع)
 *   1.15 = صعوبة عالية (صخرية، منحدرات، مناطق مزدحمة)
 *   1.20+ = صعوبة استثنائية (جبلية، تربة مشبعة، مناطق محمية)
 */
export interface NeighborhoodDifficulty {
  nameAr: string;
  factor: number;        // معامل الصعوبة
  terrain: 'flat' | 'hilly' | 'rocky' | 'sandy' | 'marshy' | 'mixed';
  soilNote?: string;     // ملاحظة عن التربة
  accessNote?: string;   // ملاحظة عن الوصول
}

export const NEIGHBORHOOD_DIFFICULTY: Record<string, Record<string, NeighborhoodDifficulty>> = {
  // =================== الرياض ===================
  riyadh: {
    'malqa':          { nameAr: 'حي الملقا',       factor: 1.12, terrain: 'rocky',  soilNote: 'صخور كلسية قريبة من السطح — يحتاج تكسير', accessNote: 'شوارع واسعة' },
    'narjis':         { nameAr: 'حي النرجس',       factor: 1.05, terrain: 'flat',   soilNote: 'تربة رملية طبيعية', accessNote: 'وصول سهل — طريق الملك سلمان' },
    'yasmin':         { nameAr: 'حي الياسمين',      factor: 1.08, terrain: 'mixed',  soilNote: 'تربة مختلطة — رمل + صخر خفيف' },
    'sahafa':         { nameAr: 'حي الصحافة',       factor: 1.03, terrain: 'flat',   soilNote: 'تربة رملية مستوية' },
    'aqiq':           { nameAr: 'حي العقيق',        factor: 1.10, terrain: 'hilly',  soilNote: 'تضاريس متموجة', accessNote: 'قرب طريق الملك فهد' },
    'nakheel':        { nameAr: 'حي النخيل',        factor: 1.06, terrain: 'flat',   soilNote: 'تربة رملية' },
    'hittin':         { nameAr: 'حي حطين',          factor: 1.15, terrain: 'rocky',  soilNote: 'صخور صلبة — تكلفة حفر مرتفعة', accessNote: 'منطقة راقية — علاوة سوق' },
    'rabwa':          { nameAr: 'حي الربوة',         factor: 1.04, terrain: 'flat',   soilNote: 'تربة طبيعية' },
    'suwaidi':        { nameAr: 'حي السويدي',       factor: 1.07, terrain: 'hilly',  soilNote: 'تضاريس خفيفة' },
    'diriyah':        { nameAr: 'حي الدرعية',       factor: 1.18, terrain: 'rocky',  soilNote: 'منطقة تراثية — قيود إضافية', accessNote: 'تصاريح خاصة مطلوبة' },
    'arid':           { nameAr: 'حي العارض',        factor: 1.02, terrain: 'flat',   soilNote: 'تربة رملية — أرض جديدة' },
    'tuwaiq':         { nameAr: 'حي طويق',          factor: 1.03, terrain: 'flat' },
    'qurtubah':       { nameAr: 'حي قرطبة',         factor: 1.04, terrain: 'flat' },
    'rawdah':         { nameAr: 'حي الروضة',        factor: 1.06, terrain: 'flat',   accessNote: 'شوارع ضيقة — صعوبة نقل' },
    'olaya':          { nameAr: 'حي العليا',         factor: 1.14, terrain: 'flat',   accessNote: 'مركز المدينة — ازدحام + تصاريح' },
  },

  // =================== جدة ===================
  jeddah: {
    'obhur':          { nameAr: 'حي أبحر',          factor: 1.10, terrain: 'sandy',  soilNote: 'تربة رملية ساحلية — مياه جوفية مرتفعة', accessNote: 'شمال جدة' },
    'rawdah_jed':     { nameAr: 'حي الروضة',         factor: 1.05, terrain: 'flat' },
    'zahra':          { nameAr: 'حي الزهراء',        factor: 1.08, terrain: 'flat',   accessNote: 'منطقة مكتظة' },
    'salama':         { nameAr: 'حي السلامة',        factor: 1.06, terrain: 'flat' },
    'shati':          { nameAr: 'حي الشاطئ',         factor: 1.15, terrain: 'sandy',  soilNote: 'تربة ساحلية — رطوبة عالية', accessNote: 'كورنيش — علاوة موقع' },
    'khalidiyah':     { nameAr: 'حي الخالدية',       factor: 1.07, terrain: 'flat' },
    'marwah':         { nameAr: 'حي المروة',         factor: 1.04, terrain: 'flat' },
    'muhammadiyah':   { nameAr: 'حي المحمدية',       factor: 1.09, terrain: 'flat',   accessNote: 'منطقة تجارية — تصاريح' },
  },

  // =================== الدمام / الخبر ===================
  dammam: {
    'shuhada':        { nameAr: 'حي الشهداء',        factor: 1.04, terrain: 'flat' },
    'faisaliyah_dam': { nameAr: 'حي الفيصلية',       factor: 1.06, terrain: 'flat' },
    'aziziyah_dam':   { nameAr: 'حي العزيزية',       factor: 1.03, terrain: 'flat' },
    'fursan':         { nameAr: 'حي الفرسان',        factor: 1.05, terrain: 'sandy',  soilNote: 'تربة رملية — مياه جوفية' },
    'corniche_dam':   { nameAr: 'كورنيش الدمام',     factor: 1.12, terrain: 'sandy',  soilNote: 'أرض ساحلية — تكلفة أساسات أعلى' },
  },
  khobar: {
    'aqrabiyah':      { nameAr: 'حي العقربية',       factor: 1.05, terrain: 'flat' },
    'rawabi':         { nameAr: 'حي الروابي',        factor: 1.04, terrain: 'flat' },
    'thuqbah':        { nameAr: 'حي الثقبة',         factor: 1.08, terrain: 'flat',   accessNote: 'شوارع ضيقة قديمة' },
    'yarmouk':        { nameAr: 'حي اليرموك',        factor: 1.03, terrain: 'flat' },
  },

  // =================== مكة المكرمة ===================
  makkah: {
    'aziziyah_mak':   { nameAr: 'حي العزيزية',       factor: 1.12, terrain: 'hilly',  soilNote: 'تضاريس جبلية' },
    'shoqiyah':       { nameAr: 'حي الشوقية',        factor: 1.15, terrain: 'rocky',  soilNote: 'صخور بازلتية — حفر صعب' },
    'awali':          { nameAr: 'حي العوالي',         factor: 1.10, terrain: 'hilly' },
    'shisha':         { nameAr: 'حي الششة',          factor: 1.20, terrain: 'rocky',  soilNote: 'تضاريس صعبة — منحدرات حادة', accessNote: 'وصول محدود للمعدات الثقيلة' },
  },

  // =================== أبها ===================
  abha: {
    'shamasan':       { nameAr: 'حي شمسان',          factor: 1.18, terrain: 'rocky',  soilNote: 'منطقة جبلية — ارتفاع 2200م', accessNote: 'طرق منحدرة' },
    'manhal':         { nameAr: 'حي المنهل',         factor: 1.12, terrain: 'hilly' },
    'dabab':          { nameAr: 'حي الضباب',         factor: 1.15, terrain: 'rocky',  soilNote: 'صخور جرانيتية' },
    'numays':         { nameAr: 'حي النميص',         factor: 1.08, terrain: 'mixed' },
  },

  // =================== تبوك ===================
  tabuk: {
    'rawdah_tab':     { nameAr: 'حي الروضة',         factor: 1.03, terrain: 'flat' },
    'faisaliyah_tab': { nameAr: 'حي الفيصلية',       factor: 1.05, terrain: 'sandy' },
    'muruj':          { nameAr: 'حي المروج',         factor: 1.04, terrain: 'flat' },
  },

  // =================== المدينة المنورة ===================
  madinah: {
    'azhari':         { nameAr: 'حي الأزهري',        factor: 1.06, terrain: 'flat' },
    'uyun':           { nameAr: 'حي العيون',         factor: 1.04, terrain: 'flat' },
    'qiblatayn':      { nameAr: 'حي القبلتين',       factor: 1.10, terrain: 'hilly',  soilNote: 'تضاريس بركانية (حرة)' },
    'salam':          { nameAr: 'حي السلام',         factor: 1.03, terrain: 'flat' },
  },
};

/**
 * يحسب معامل صعوبة الموقع بناءً على المدينة والحي
 * يُستخدم كمضاعف لتكلفة العمالة والمعدات والنقل
 */
export function getSiteDifficultyFactor(
  city: LocationType,
  neighborhood?: string
): { factor: number; terrain: string; notes: string } {
  const defaultResult = { factor: 1.00, terrain: 'flat', notes: 'معامل افتراضي — لم يتم تحديد الحي' };

  if (!neighborhood) return defaultResult;

  const cityData = NEIGHBORHOOD_DIFFICULTY[city];
  if (!cityData) return defaultResult;

  // Try exact key match
  const key = neighborhood.toLowerCase().replace(/\s+/g, '_').replace(/حي_?/g, '');
  const match = cityData[key];
  if (match) {
    const notes = [
      match.soilNote || '',
      match.accessNote || '',
      `معامل: ×${match.factor.toFixed(2)}`,
    ].filter(Boolean).join(' | ');
    return { factor: match.factor, terrain: match.terrain, notes };
  }

  // Fuzzy match: search by nameAr
  for (const [, data] of Object.entries(cityData)) {
    if (data.nameAr.includes(neighborhood) || neighborhood.includes(data.nameAr.replace('حي ', ''))) {
      const notes = [
        data.soilNote || '',
        data.accessNote || '',
        `معامل: ×${data.factor.toFixed(2)}`,
      ].filter(Boolean).join(' | ');
      return { factor: data.factor, terrain: data.terrain, notes };
    }
  }

  return defaultResult;
}
