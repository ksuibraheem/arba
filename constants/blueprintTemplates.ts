/**
 * ARBA-Ops v7.0 — Blueprint Templates Database
 * قاعدة بيانات النماذج الجاهزة للمخططات الهندسية
 *
 * 40 نموذج جاهز لـ 18 نوع مشروع
 * كل نموذج يحتوي على BlueprintConfig كامل يُشغّل:
 *   ✅ 12 رسمة هندسية SVG فوراً
 *   ✅ محرك الكميات المعرفي (Cognitive Engine)
 *   ✅ جدول حصر الحديد (Bar Bending Schedule)
 *
 * المصادر:
 *   - كود البناء السعودي SBC 201/304
 *   - معايير البلدية السعودية (تحديث يوليو 2024)
 *   - ACI 318 (أعمدة وحديد التسليح)
 *   - معايير وزارة الشؤون الإسلامية (المساجد)
 *   - معايير التصميم الدولية (فنادق، مستشفيات، مدارس)
 */

import {
  BlueprintConfig,
  FloorDetails,
  ExcavationConfig,
  FoundationConfig,
  RoomFinishSchedule,
  FacadeSchedule,
  MEPConfig,
  ProjectType,
  Language,
} from '../types';

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface BlueprintTemplate {
  id: string;
  projectType: ProjectType;
  name: Record<Language, string>;
  description: Record<Language, string>;
  priority: 1 | 2 | 3; // 3 = أعلى أولوية
  icon: string;
  plotArea: number;
  floorsCount: number;
  config: BlueprintConfig;
}

// ═══════════════════════════════════════════════════
// Helper: Generate unique IDs
// ═══════════════════════════════════════════════════
let _uid = 0;
const uid = (prefix: string) => `${prefix}_${++_uid}`;

// ═══════════════════════════════════════════════════
// Helper: Create a room finish schedule entry
// ═══════════════════════════════════════════════════
function room(
  name: string,
  type: RoomFinishSchedule['roomType'],
  l: number, w: number, h: number,
  floor: RoomFinishSchedule['floorFinish'],
  wall: RoomFinishSchedule['wallFinish'],
  ceiling: RoomFinishSchedule['ceilingFinish'],
  floorId: string,
  windowDoorRatio = 0.15,
  wetH?: number,
): RoomFinishSchedule {
  return {
    id: uid('rm'),
    roomName: name,
    roomType: type,
    length: l,
    width: w,
    height: h,
    floorFinish: floor,
    wallFinish: wall,
    ceilingFinish: ceiling,
    floorId,
    windowDoorRatio,
    wetAreaWallHeight: wetH,
  };
}

// ═══════════════════════════════════════════════════
// Helper: Create a floor
// ═══════════════════════════════════════════════════
function flr(
  name: string, area: number, height: number,
  slab: FloorDetails['slabType'], cols: number,
  perim?: number, internal?: number,
): FloorDetails {
  const id = uid('flr');
  return {
    id,
    name,
    area,
    height,
    slabType: slab,
    columnsCount: cols,
    zones: [],
    perimeterWallLength: perim || Math.sqrt(area) * 4,
    internalWallLength: internal || Math.sqrt(area) * 2,
  };
}

// ═══════════════════════════════════════════════════
// Helper: Create facade
// ═══════════════════════════════════════════════════
function facade(
  dir: FacadeSchedule['direction'], w: number, h: number,
  finish: FacadeSchedule['finishType'], wdr = 0.15,
): FacadeSchedule {
  return { id: uid('fcd'), direction: dir, width: w, totalHeight: h, finishType: finish, windowDoorRatio: wdr };
}

// ═══════════════════════════════════════════════════
// Standard configs
// ═══════════════════════════════════════════════════
const STD_EXC: ExcavationConfig = {
  excavationDepth: 1.5, soilReplacementNeeded: true, soilReplacementThickness: 0.3, zeroLevel: 0.30,
  // v8.0 defaults
  siteClearanceRequired: true, topsoilStrippingDepth: 0.15,
  shoringRequired: false, shoringType: 'none',
  dewateringRequired: false, dewateringType: 'none',
  rockExcavationPercent: 0,
  importedFillRequired: false, importedFillPercent: 0,
};
const STD_EXC_DEEP: ExcavationConfig = {
  excavationDepth: 2.5, soilReplacementNeeded: true, soilReplacementThickness: 0.5, zeroLevel: 0.50,
  // v8.0 defaults — deep excavation usually needs shoring & dewatering
  siteClearanceRequired: true, topsoilStrippingDepth: 0.20,
  shoringRequired: true, shoringType: 'steel_sheet', shoringDepth: 2.5,
  dewateringRequired: true, dewateringType: 'wellpoint', waterTableDepth: 2.0,
  rockExcavationPercent: 0,
  importedFillRequired: false, importedFillPercent: 0,
};
const STD_EXC_SHALLOW: ExcavationConfig = {
  excavationDepth: 1.0, soilReplacementNeeded: false, soilReplacementThickness: 0, zeroLevel: 0.20,
  // v8.0 defaults
  siteClearanceRequired: true, topsoilStrippingDepth: 0.15,
  shoringRequired: false, shoringType: 'none',
  dewateringRequired: false, dewateringType: 'none',
  rockExcavationPercent: 0,
  importedFillRequired: false, importedFillPercent: 0,
};

const FDN_ISOLATED = (fw = 1.2, fd = 0.5): FoundationConfig => ({
  type: 'isolated_footings', neckColumnHeight: 0.5, tieBeamDepth: 0.6, tieBeamWidth: 0.3,
  footingDepth: fd, footingWidth: fw, raftThickness: 0,
});
const FDN_STRIP = (fw = 0.8, fd = 0.5): FoundationConfig => ({
  type: 'strip_footings', neckColumnHeight: 0.5, tieBeamDepth: 0.6, tieBeamWidth: 0.3,
  footingDepth: fd, footingWidth: fw, raftThickness: 0,
});
const FDN_RAFT = (thick = 0.6): FoundationConfig => ({
  type: 'raft', neckColumnHeight: 0.5, tieBeamDepth: 0.6, tieBeamWidth: 0.3,
  footingDepth: 0, footingWidth: 0, raftThickness: thick,
});
const FDN_PILES: FoundationConfig = {
  type: 'piles', neckColumnHeight: 0.8, tieBeamDepth: 0.8, tieBeamWidth: 0.4,
  footingDepth: 0, footingWidth: 0, raftThickness: 0,
};

const MEP_VILLA: MEPConfig = {
  plumbing: { supplyPipeMaterial: 'ppr', drainPipeMaterial: 'upvc', waterHeaterType: 'central', mainLineSize_mm: 25, hasGroundTank: true, groundTankLiters: 2000, hasRoofTank: true, roofTankLiters: 1000 },
  electrical: { phaseType: 'single_220v', mainBreakerAmps: 63, hasBackupGenerator: false },
  hvac: { systemType: 'split', condenserLocation: 'roof' },
};
const MEP_COMMERCIAL: MEPConfig = {
  plumbing: { supplyPipeMaterial: 'ppr', drainPipeMaterial: 'upvc', waterHeaterType: 'central', mainLineSize_mm: 50, hasGroundTank: true, groundTankLiters: 10000, hasRoofTank: true, roofTankLiters: 5000 },
  electrical: { phaseType: 'three_phase_380v', mainBreakerAmps: 100, hasBackupGenerator: true },
  hvac: { systemType: 'central_ducted', condenserLocation: 'roof' },
};
const MEP_LARGE: MEPConfig = {
  plumbing: { supplyPipeMaterial: 'ppr', drainPipeMaterial: 'hdpe', waterHeaterType: 'central', mainLineSize_mm: 63, hasGroundTank: true, groundTankLiters: 30000, hasRoofTank: true, roofTankLiters: 10000 },
  electrical: { phaseType: 'three_phase_380v', mainBreakerAmps: 100, hasBackupGenerator: true },
  hvac: { systemType: 'central_ducted', condenserLocation: 'roof' },
};

// ═══════════════════════════════════════════════════
// ██ TEMPLATES
// ═══════════════════════════════════════════════════

export const BLUEPRINT_TEMPLATES: BlueprintTemplate[] = [

  // ─────────────────────────────────────────────────
  // 1. فيلا صغيرة (300م²)
  // ─────────────────────────────────────────────────
  {
    id: 'villa_small_300', projectType: 'villa', priority: 3, icon: '🏠', plotArea: 300, floorsCount: 2,
    name: { ar: 'فيلا صغيرة (300م²)', en: 'Small Villa (300m²)', fr: 'Petite Villa (300m²)', zh: '小别墅 (300m²)' },
    description: { ar: '2 طابق — مجلس، صالة، 3 نوم، مطبخ، 3 حمام', en: '2 floors — Majlis, living, 3 bed, kitchen, 3 bath', fr: '2 étages — Majlis, salon, 3 ch, cuisine, 3 SDB', zh: '2层 — 客厅、3卧、厨房、3浴' },
    config: {
      plotLength: 20, plotWidth: 15, setbackFront: 3, setbackSide: 1.5, setbackRear: 2,
      columnWidth_cm: 25, columnDepth_cm: 40,
      floors: [
        flr('الأرضي', 174, 3.5, 'solid', 12, 53, 30),
        flr('الأول', 174, 3.2, 'solid', 12, 53, 35),
      ],
      excavation: STD_EXC,
      foundation: FDN_ISOLATED(1.2, 0.5),
      roomFinishes: [
        room('مجلس رجال', 'majlis', 6, 5, 3.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('صالة معيشة', 'living', 5, 5, 3.5, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('مطبخ', 'kitchen', 4, 3.5, 3.0, 'ceramic_60x60', 'ceramic_30x60', 'paint_plastic', '', 0.10, 1.5),
        room('حمام ضيوف', 'bathroom', 2.5, 2, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('نوم ماستر', 'bedroom', 5, 4.5, 3.2, 'ceramic_60x60', 'paint_velvet', 'gypsum_board', '', 0.15),
        room('حمام ماستر', 'bathroom', 3, 3, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('نوم 2', 'bedroom', 4, 3.5, 3.2, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('نوم 3', 'bedroom', 4, 3.5, 3.2, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('حمام مشترك', 'bathroom', 2.5, 2, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
      ],
      facadeSchedules: [
        facade('north', 12, 6.7, 'stone_mechanical', 0.20),
        facade('south', 12, 6.7, 'plaster_paint', 0.15),
        facade('east', 14.5, 6.7, 'plaster_paint', 0.15),
        facade('west', 14.5, 6.7, 'stone_mechanical', 0.20),
      ],
      mepConfig: MEP_VILLA,
    },
  },

  // ─────────────────────────────────────────────────
  // 2. فيلا متوسطة (500م²)
  // ─────────────────────────────────────────────────
  {
    id: 'villa_medium_500', projectType: 'villa', priority: 3, icon: '🏡', plotArea: 500, floorsCount: 2,
    name: { ar: 'فيلا متوسطة (500م²)', en: 'Medium Villa (500m²)', fr: 'Villa Moyenne (500m²)', zh: '中型别墅 (500m²)' },
    description: { ar: '2 طابق + ملحق — مجلسين، صالتين، 5 نوم، 5 حمام', en: '2+annex — 2 Majlis, 2 living, 5 bed, 5 bath', fr: '2+annexe — 2 Majlis, 2 salons, 5 ch, 5 SDB', zh: '2层+附楼 — 2客厅、5卧、5浴' },
    config: {
      plotLength: 25, plotWidth: 20, setbackFront: 4, setbackSide: 1.5, setbackRear: 3,
      columnWidth_cm: 30, columnDepth_cm: 50,
      floors: [
        flr('الأرضي', 280, 3.5, 'solid', 16, 68, 40),
        flr('الأول', 280, 3.2, 'solid', 16, 68, 45),
      ],
      excavation: STD_EXC,
      foundation: FDN_ISOLATED(1.5, 0.6),
      roomFinishes: [
        room('مجلس رجال', 'majlis', 8, 5, 3.5, 'marble', 'paint_velvet', 'gypsum_board', '', 0.15),
        room('مجلس نساء', 'majlis', 6, 5, 3.5, 'porcelain_120x60', 'paint_velvet', 'gypsum_board', '', 0.15),
        room('صالة معيشة', 'living', 6, 5, 3.5, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('صالة طعام', 'living', 5, 4, 3.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('مطبخ رئيسي', 'kitchen', 5, 4, 3.0, 'ceramic_60x60', 'ceramic_30x60', 'paint_plastic', '', 0.10, 1.5),
        room('مطبخ تحضيري', 'kitchen', 3.5, 3, 3.0, 'ceramic_60x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 1.5),
        room('حمام ضيوف 1', 'bathroom', 2.5, 2, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('حمام ضيوف 2', 'bathroom', 2.5, 2, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('نوم ماستر', 'bedroom', 6, 5, 3.2, 'porcelain_120x60', 'paint_velvet', 'gypsum_board', '', 0.15),
        room('حمام ماستر', 'bathroom', 3.5, 3, 2.8, 'marble', 'ceramic_30x60', 'gypsum_plaster', '', 0.05, 2.4),
        room('نوم 2', 'bedroom', 4.5, 4, 3.2, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('نوم 3', 'bedroom', 4, 3.5, 3.2, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('نوم 4', 'bedroom', 4, 3.5, 3.2, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('نوم 5', 'bedroom', 4, 3.5, 3.2, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('حمام مشترك', 'bathroom', 2.5, 2.5, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
      ],
      facadeSchedules: [
        facade('north', 17, 6.7, 'stone_mechanical', 0.20),
        facade('south', 17, 6.7, 'grc', 0.15),
        facade('east', 18, 6.7, 'grc', 0.15),
        facade('west', 18, 6.7, 'stone_mechanical', 0.20),
      ],
      mepConfig: MEP_VILLA,
    },
  },

  // ─────────────────────────────────────────────────
  // 3. فيلا كبيرة (750م²)
  // ─────────────────────────────────────────────────
  {
    id: 'villa_large_750', projectType: 'villa', priority: 2, icon: '🏰', plotArea: 750, floorsCount: 3,
    name: { ar: 'فيلا كبيرة (750م²)', en: 'Large Villa (750m²)', fr: 'Grande Villa (750m²)', zh: '大别墅 (750m²)' },
    description: { ar: '3 طوابق — مجالس، مسبح، مصعد، ملحق', en: '3 floors — Multiple Majlis, pool, elevator, annex', fr: '3 étages — Majlis multiples, piscine, ascenseur', zh: '3层 — 多客厅、泳池、电梯' },
    config: {
      plotLength: 30, plotWidth: 25, setbackFront: 5, setbackSide: 2, setbackRear: 3,
      columnWidth_cm: 30, columnDepth_cm: 60,
      floors: [
        flr('الأرضي', 462, 3.8, 'solid', 20, 86, 55),
        flr('الأول', 462, 3.2, 'solid', 20, 86, 60),
        flr('ملحق علوي', 323, 3.0, 'solid', 14, 72, 40),
      ],
      excavation: STD_EXC,
      foundation: FDN_RAFT(0.6),
      roomFinishes: [
        room('مجلس رجال كبير', 'majlis', 8, 6, 3.8, 'marble', 'paint_velvet', 'gypsum_board', '', 0.15),
        room('مجلس نساء', 'majlis', 7, 5, 3.8, 'marble', 'paint_velvet', 'gypsum_board', '', 0.15),
        room('صالة كبيرة', 'living', 7, 6, 3.8, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.20),
        room('مطبخ رئيسي', 'kitchen', 6, 5, 3.0, 'granite', 'ceramic_30x60', 'gypsum_board', '', 0.10, 1.5),
        room('مطبخ تحضيري', 'kitchen', 4, 3, 3.0, 'ceramic_60x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 1.5),
        room('حمام ضيوف', 'bathroom', 3, 2.5, 2.8, 'marble', 'ceramic_30x60', 'gypsum_plaster', '', 0.05, 2.4),
        room('نوم ماستر', 'bedroom', 7, 5, 3.2, 'porcelain_120x60', 'wallpaper', 'gypsum_board', '', 0.20),
        room('حمام ماستر', 'bathroom', 4, 3.5, 2.8, 'marble', 'marble', 'gypsum_plaster', '', 0.05, 2.4),
        room('نوم 2', 'bedroom', 5, 4, 3.2, 'ceramic_60x60', 'paint_velvet', 'gypsum_board', '', 0.15),
        room('نوم 3', 'bedroom', 5, 4, 3.2, 'ceramic_60x60', 'paint_velvet', 'gypsum_board', '', 0.15),
        room('نوم 4', 'bedroom', 4.5, 4, 3.2, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('نوم 5', 'bedroom', 4.5, 4, 3.2, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('نوم 6', 'bedroom', 4, 3.5, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('نوم 7', 'bedroom', 4, 3.5, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('حمام 2', 'bathroom', 3, 2.5, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('حمام 3', 'bathroom', 3, 2.5, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('حمام 4', 'bathroom', 2.5, 2, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
      ],
      facadeSchedules: [
        facade('north', 21, 10, 'stone_mechanical', 0.25),
        facade('south', 21, 10, 'stone_mechanical', 0.20),
        facade('east', 22, 10, 'glass_curtain', 0.30),
        facade('west', 22, 10, 'grc', 0.20),
      ],
      mepConfig: { ...MEP_VILLA, electrical: { phaseType: 'three_phase_380v', mainBreakerAmps: 100, hasBackupGenerator: true } },
    },
  },

  // ─────────────────────────────────────────────────
  // 4. مسجد حي صغير (200 مصلي)
  // ─────────────────────────────────────────────────
  {
    id: 'mosque_small', projectType: 'mosque', priority: 3, icon: '🕌', plotArea: 500, floorsCount: 1,
    name: { ar: 'مسجد حي (200 مصلي)', en: 'Neighborhood Mosque (200)', fr: 'Mosquée de Quartier (200)', zh: '社区清真寺 (200人)' },
    description: { ar: 'مصلى + مواضئ + مئذنة + مكتب إمام', en: 'Prayer hall + Wudu + Minaret + Imam office', fr: 'Salle + Ablutions + Minaret + Bureau Imam', zh: '祈祷厅+净手处+宣礼塔+办公室' },
    config: {
      plotLength: 25, plotWidth: 20, setbackFront: 3, setbackSide: 2, setbackRear: 2,
      columnWidth_cm: 30, columnDepth_cm: 50,
      floors: [flr('الأرضي', 320, 5.0, 'solid', 8, 72, 20)],
      excavation: STD_EXC,
      foundation: FDN_STRIP(0.8, 0.5),
      roomFinishes: [
        room('مصلى رجال', 'prayer', 14, 14, 5.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('مصلى نساء', 'prayer', 4, 3, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.05),
        room('مواضئ رجال', 'service', 5, 4, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('مواضئ نساء', 'service', 3, 3, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('دورات مياه', 'bathroom', 4, 3, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('مكتب إمام', 'office', 4, 3, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.10),
        room('غرفة تخزين', 'storage', 3, 2.5, 3.0, 'cement_plaster', 'cement_plaster', 'none', '', 0.05),
      ],
      facadeSchedules: [
        facade('north', 16, 5, 'stone_mechanical', 0.10),
        facade('south', 16, 5, 'stone_mechanical', 0.10),
        facade('east', 20, 5, 'stone_mechanical', 0.15),
        facade('west', 20, 5, 'stone_glued', 0.10),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

  // ─────────────────────────────────────────────────
  // 5. مسجد جامع كبير (500 مصلي)
  // ─────────────────────────────────────────────────
  {
    id: 'mosque_large', projectType: 'mosque', priority: 2, icon: '🕋', plotArea: 2000, floorsCount: 1,
    name: { ar: 'جامع كبير (500 مصلي)', en: 'Grand Mosque (500)', fr: 'Grande Mosquée (500)', zh: '大清真寺 (500人)' },
    description: { ar: 'مصلى كبير + ميزانين نساء + قبة + مئذنة + ساحة', en: 'Large hall + Women mezzanine + Dome + Minaret', fr: 'Grande salle + Mezzanine femmes + Dôme', zh: '大厅+女性夹层+穹顶+宣礼塔' },
    config: {
      plotLength: 50, plotWidth: 40, setbackFront: 5, setbackSide: 3, setbackRear: 3,
      columnWidth_cm: 30, columnDepth_cm: 60,
      floors: [
        flr('الأرضي', 1500, 6.0, 'solid', 16, 140, 40),
        flr('ميزانين نساء', 150, 3.5, 'solid', 8, 50, 15),
      ],
      excavation: STD_EXC_DEEP,
      foundation: FDN_RAFT(0.8),
      roomFinishes: [
        room('مصلى رجال', 'prayer', 25, 20, 6.0, 'marble', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('مصلى نساء', 'prayer', 10, 15, 3.5, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.05),
        room('مواضئ رجال', 'service', 8, 5, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('مواضئ نساء', 'service', 5, 4, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('دورات مياه رجال', 'bathroom', 5, 4, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('دورات مياه نساء', 'bathroom', 4, 3, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('مكتب إمام', 'office', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('مكتبة', 'office', 5, 3, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.10),
        room('مخزن', 'storage', 4, 3, 3.0, 'cement_plaster', 'cement_plaster', 'none', '', 0.05),
      ],
      facadeSchedules: [
        facade('north', 34, 6, 'stone_mechanical', 0.15),
        facade('south', 34, 6, 'stone_mechanical', 0.15),
        facade('east', 44, 6, 'stone_mechanical', 0.15),
        facade('west', 44, 6, 'stone_mechanical', 0.10),
      ],
      mepConfig: MEP_LARGE,
    },
  },

  // ─────────────────────────────────────────────────
  // 6. مول صغير (Strip Mall)
  // ─────────────────────────────────────────────────
  {
    id: 'mall_small', projectType: 'mall', priority: 3, icon: '🏬', plotArea: 2400, floorsCount: 2,
    name: { ar: 'مول صغير (Strip Mall)', en: 'Strip Mall', fr: 'Centre Commercial (Petit)', zh: '小型商场' },
    description: { ar: '20 محل + فود كورت + حمامات عامة', en: '20 shops + Food court + Restrooms', fr: '20 magasins + Aire de restauration', zh: '20店铺+美食广场' },
    config: {
      plotLength: 60, plotWidth: 40, setbackFront: 5, setbackSide: 3, setbackRear: 3,
      columnWidth_cm: 30, columnDepth_cm: 60,
      floors: [
        flr('الأرضي', 1800, 4.5, 'flat', 24, 120, 80),
        flr('الأول', 1800, 4.0, 'flat', 24, 120, 80),
      ],
      excavation: STD_EXC,
      foundation: FDN_STRIP(1.0, 0.6),
      roomFinishes: [
        room('محلات تجارية (20)', 'shop', 10, 5, 4.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.30),
        room('فود كورت', 'restaurant', 15, 13, 4.0, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('ممرات', 'corridor', 50, 4, 4.5, 'granite', 'paint_plastic', 'gypsum_board', '', 0.05),
        room('حمامات عامة', 'bathroom', 6, 4, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('مكتب إدارة', 'office', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('غرفة أمن', 'office', 3, 3, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.10),
      ],
      facadeSchedules: [
        facade('north', 54, 8.5, 'glass_curtain', 0.40),
        facade('south', 54, 8.5, 'cladding_alucobond', 0.10),
        facade('east', 34, 8.5, 'glass_curtain', 0.35),
        facade('west', 34, 8.5, 'cladding_alucobond', 0.15),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

  // ─────────────────────────────────────────────────
  // 7. مول كبير
  // ─────────────────────────────────────────────────
  {
    id: 'mall_large', projectType: 'mall', priority: 2, icon: '🏢', plotArea: 8000, floorsCount: 3,
    name: { ar: 'مول تجاري كبير', en: 'Large Shopping Mall', fr: 'Grand Centre Commercial', zh: '大型购物中心' },
    description: { ar: '3 طوابق + قبو — 80 محل + هايبر + سينما', en: '3F+basement — 80 shops + Hypermarket + Cinema', fr: '3 ét.+sous-sol — 80 mag. + Hypermarché', zh: '3层+地下 — 80店+大卖场' },
    config: {
      plotLength: 100, plotWidth: 80, setbackFront: 8, setbackSide: 5, setbackRear: 5,
      columnWidth_cm: 40, columnDepth_cm: 70,
      floors: [
        flr('القبو (مواقف)', 6300, 3.5, 'flat', 60, 340, 100),
        flr('الأرضي', 6300, 5.0, 'flat', 60, 340, 200),
        flr('الأول', 6300, 4.5, 'flat', 60, 340, 200),
        flr('الثاني', 6300, 4.5, 'flat', 60, 340, 150),
      ],
      excavation: STD_EXC_DEEP,
      foundation: FDN_PILES,
      roomFinishes: [
        room('محلات (80)', 'shop', 8, 6, 4.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.30),
        room('هايبر ماركت', 'shop', 50, 30, 5.0, 'epoxy', 'paint_plastic', 'none', '', 0.10),
        room('فود كورت', 'restaurant', 25, 20, 4.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('منطقة ألعاب أطفال', 'corridor', 20, 15, 4.5, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.05),
        room('ممرات', 'corridor', 200, 5, 4.5, 'granite', 'paint_plastic', 'gypsum_board', '', 0.05),
        room('حمامات', 'bathroom', 8, 6, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('مواقف قبو', 'parking', 80, 80, 3.5, 'epoxy', 'paint_plastic', 'none', '', 0.02),
      ],
      facadeSchedules: [
        facade('north', 90, 14, 'glass_curtain', 0.50),
        facade('south', 90, 14, 'cladding_alucobond', 0.15),
        facade('east', 70, 14, 'glass_curtain', 0.40),
        facade('west', 70, 14, 'cladding_alucobond', 0.15),
      ],
      mepConfig: MEP_LARGE,
    },
  },

  // ─────────────────────────────────────────────────
  // 8. برج سكني (6 أدوار)
  // ─────────────────────────────────────────────────
  {
    id: 'tower_residential_6', projectType: 'tower', priority: 3, icon: '🏢', plotArea: 750, floorsCount: 6,
    name: { ar: 'برج سكني (6 أدوار)', en: 'Residential Tower (6F)', fr: 'Tour Résidentielle (6 ét.)', zh: '住宅楼 (6层)' },
    description: { ar: '24 شقة — 4 شقق/طابق + قبو مواقف', en: '24 apartments — 4/floor + Basement parking', fr: '24 apparts — 4/étage + Parking sous-sol', zh: '24公寓 — 每层4套+地下停车' },
    config: {
      plotLength: 30, plotWidth: 25, setbackFront: 5, setbackSide: 2, setbackRear: 3,
      columnWidth_cm: 30, columnDepth_cm: 60,
      floors: [
        flr('القبو', 500, 3.2, 'flat', 18, 110, 20),
        ...Array.from({ length: 6 }, (_, i) => flr(i === 0 ? 'الأرضي' : `الدور ${i}`, 500, 3.2, 'flat', 18, 110, 60)),
      ],
      excavation: STD_EXC_DEEP,
      foundation: FDN_RAFT(0.8),
      roomFinishes: [
        room('صالة شقة', 'living', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('غرفة نوم 1', 'bedroom', 4, 3.5, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('غرفة نوم 2', 'bedroom', 3.5, 3, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('مطبخ', 'kitchen', 3, 3, 2.8, 'ceramic_60x60', 'ceramic_30x60', 'paint_plastic', '', 0.10, 1.5),
        room('حمام 1', 'bathroom', 2.5, 2, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('حمام 2', 'bathroom', 2, 1.8, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
      ],
      facadeSchedules: [
        facade('north', 23, 22, 'plaster_paint', 0.25),
        facade('south', 23, 22, 'plaster_paint', 0.20),
        facade('east', 20, 22, 'stone_glued', 0.20),
        facade('west', 20, 22, 'plaster_paint', 0.20),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

  // ─────────────────────────────────────────────────
  // 9. برج تجاري (10 أدوار)
  // ─────────────────────────────────────────────────
  {
    id: 'tower_commercial_10', projectType: 'tower', priority: 2, icon: '🏙️', plotArea: 1200, floorsCount: 10,
    name: { ar: 'برج تجاري (10 أدوار)', en: 'Commercial Tower (10F)', fr: 'Tour Commerciale (10 ét.)', zh: '商业大楼 (10层)' },
    description: { ar: '60 مكتب + لوبي + 2 قبو مواقف', en: '60 offices + Lobby + 2 basement parking', fr: '60 bureaux + Hall + 2 sous-sols', zh: '60办公室+大厅+2层地下停车' },
    config: {
      plotLength: 40, plotWidth: 30, setbackFront: 6, setbackSide: 3, setbackRear: 3,
      columnWidth_cm: 40, columnDepth_cm: 70,
      floors: [
        flr('قبو 1', 816, 3.5, 'flat', 24, 120, 20),
        flr('قبو 2', 816, 3.5, 'flat', 24, 120, 20),
        ...Array.from({ length: 10 }, (_, i) => flr(i === 0 ? 'الأرضي' : `الدور ${i}`, 816, 3.5, 'flat', 24, 120, 70)),
      ],
      excavation: { excavationDepth: 7, soilReplacementNeeded: true, soilReplacementThickness: 0.5, zeroLevel: 0.50 },
      foundation: FDN_PILES,
      roomFinishes: [
        room('لوبي', 'reception', 10, 8, 5.0, 'marble', 'paint_plastic', 'gypsum_board', '', 0.25),
        room('مكتب نموذجي', 'office', 6, 5, 3.2, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.20),
        room('حمام عام', 'bathroom', 4, 3, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('مواقف', 'parking', 28, 28, 3.5, 'epoxy', 'paint_plastic', 'none', '', 0.02),
      ],
      facadeSchedules: [
        facade('north', 28, 38, 'glass_curtain', 0.50),
        facade('south', 28, 38, 'cladding_alucobond', 0.20),
        facade('east', 34, 38, 'glass_curtain', 0.45),
        facade('west', 34, 38, 'cladding_alucobond', 0.20),
      ],
      mepConfig: MEP_LARGE,
    },
  },

  // ─────────────────────────────────────────────────
  // 10. مدرسة ابتدائية
  // ─────────────────────────────────────────────────
  {
    id: 'school_primary', projectType: 'school', priority: 3, icon: '🏫', plotArea: 2400, floorsCount: 2,
    name: { ar: 'مدرسة ابتدائية', en: 'Primary School', fr: 'École Primaire', zh: '小学' },
    description: { ar: '12 فصل + مختبر + مكتبة + إدارة + ملعب', en: '12 classes + Lab + Library + Admin + Playground', fr: '12 classes + Labo + Bibliothèque + Admin', zh: '12教室+实验室+图书馆+行政' },
    config: {
      plotLength: 60, plotWidth: 40, setbackFront: 5, setbackSide: 3, setbackRear: 3,
      columnWidth_cm: 30, columnDepth_cm: 50,
      floors: [
        flr('الأرضي', 1600, 3.5, 'solid', 22, 120, 70),
        flr('الأول', 1600, 3.5, 'solid', 22, 120, 70),
      ],
      excavation: STD_EXC,
      foundation: FDN_STRIP(0.9, 0.5),
      roomFinishes: [
        room('فصل دراسي (×12)', 'office', 8, 7, 3.5, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('مختبر علوم', 'office', 10, 7, 3.5, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('مكتبة', 'office', 10, 8, 3.5, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('مكتب مدير', 'office', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('غرفة إدارة', 'office', 8, 5, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.10),
        room('ممرات', 'corridor', 60, 2.4, 3.5, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.05),
        room('حمامات طلاب', 'bathroom', 6, 4, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('مصلى', 'prayer', 6, 5, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.05),
        room('كافتيريا', 'restaurant', 10, 6, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.10),
      ],
      facadeSchedules: [
        facade('north', 54, 7, 'plaster_paint', 0.20),
        facade('south', 54, 7, 'plaster_paint', 0.20),
        facade('east', 34, 7, 'stone_glued', 0.15),
        facade('west', 34, 7, 'plaster_paint', 0.15),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

  // ─────────────────────────────────────────────────
  // 11. مستشفى (50 سرير)
  // ─────────────────────────────────────────────────
  {
    id: 'hospital_50bed', projectType: 'hospital', priority: 2, icon: '🏥', plotArea: 4800, floorsCount: 4,
    name: { ar: 'مستشفى (50 سرير)', en: 'Hospital (50 Beds)', fr: 'Hôpital (50 Lits)', zh: '医院 (50床)' },
    description: { ar: '4 طوابق — عيادات + غرف + عمليات + طوارئ', en: '4F — Clinics + Wards + OR + ER', fr: '4 ét. — Cliniques + Chambres + Bloc + Urgences', zh: '4层 — 诊所+病房+手术室+急诊' },
    config: {
      plotLength: 80, plotWidth: 60, setbackFront: 8, setbackSide: 5, setbackRear: 5,
      columnWidth_cm: 40, columnDepth_cm: 70,
      floors: Array.from({ length: 4 }, (_, i) => flr(i === 0 ? 'الأرضي' : `الدور ${i}`, 3350, 3.8, 'flat', 36, 180, 120)),
      excavation: STD_EXC_DEEP,
      foundation: FDN_RAFT(0.8),
      roomFinishes: [
        room('غرفة مريض (×50)', 'bedroom', 5, 4.5, 3.2, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('غرفة عمليات (×3)', 'office', 7, 6, 3.5, 'epoxy', 'paint_plastic', 'gypsum_board', '', 0.02),
        room('عيادة خارجية (×8)', 'clinic', 4, 3, 3.0, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('طوارئ', 'clinic', 15, 10, 3.5, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('ICU', 'clinic', 10, 8, 3.5, 'epoxy', 'paint_plastic', 'gypsum_board', '', 0.05),
        room('استقبال', 'reception', 10, 6, 3.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('صيدلية', 'shop', 6, 5, 3.0, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('ممرات', 'corridor', 80, 2.4, 3.5, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.02),
        room('حمامات', 'bathroom', 4, 3, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
      ],
      facadeSchedules: [
        facade('north', 67, 15.2, 'cladding_alucobond', 0.25),
        facade('south', 67, 15.2, 'cladding_alucobond', 0.20),
        facade('east', 50, 15.2, 'glass_curtain', 0.30),
        facade('west', 50, 15.2, 'cladding_alucobond', 0.20),
      ],
      mepConfig: MEP_LARGE,
    },
  },

  // ─────────────────────────────────────────────────
  // 12. عيادة
  // ─────────────────────────────────────────────────
  {
    id: 'clinic_basic', projectType: 'clinic', priority: 3, icon: '🩺', plotArea: 300, floorsCount: 2,
    name: { ar: 'عيادة طبية', en: 'Medical Clinic', fr: 'Clinique Médicale', zh: '诊所' },
    description: { ar: '4 عيادات + استقبال + صيدلية + مختبر', en: '4 clinics + Reception + Pharmacy + Lab', fr: '4 cabinets + Réception + Pharmacie', zh: '4诊室+接待+药房+实验室' },
    config: {
      plotLength: 20, plotWidth: 15, setbackFront: 3, setbackSide: 1.5, setbackRear: 2,
      columnWidth_cm: 25, columnDepth_cm: 40,
      floors: [
        flr('الأرضي', 180, 3.2, 'solid', 10, 54, 30),
        flr('الأول', 180, 3.0, 'solid', 10, 54, 30),
      ],
      excavation: STD_EXC,
      foundation: FDN_ISOLATED(1.0, 0.4),
      roomFinishes: [
        room('استقبال', 'reception', 5, 4, 3.2, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('عيادة 1', 'clinic', 4, 3, 3.0, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('عيادة 2', 'clinic', 4, 3, 3.0, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('عيادة 3', 'clinic', 4, 3, 3.0, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('عيادة 4', 'clinic', 4, 3, 3.0, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('صيدلية', 'shop', 4, 3, 3.0, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('مختبر', 'office', 4, 3, 3.0, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.05),
        room('حمامات', 'bathroom', 3, 2, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
      ],
      facadeSchedules: [
        facade('north', 12, 6.2, 'cladding_alucobond', 0.25),
        facade('south', 12, 6.2, 'plaster_paint', 0.15),
        facade('east', 14.5, 6.2, 'plaster_paint', 0.15),
        facade('west', 14.5, 6.2, 'plaster_paint', 0.15),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

  // ─────────────────────────────────────────────────
  // 13. فندق 3 نجوم
  // ─────────────────────────────────────────────────
  {
    id: 'hotel_3star', projectType: 'hotel', priority: 2, icon: '🏨', plotArea: 1200, floorsCount: 5,
    name: { ar: 'فندق 3 نجوم (40 غرفة)', en: '3-Star Hotel (40 rooms)', fr: 'Hôtel 3 Étoiles (40 ch.)', zh: '三星酒店 (40间)' },
    description: { ar: '5 طوابق — لوبي + مطعم + 40 غرفة', en: '5F — Lobby + Restaurant + 40 rooms', fr: '5 ét. — Hall + Restaurant + 40 chambres', zh: '5层 — 大堂+餐厅+40间客房' },
    config: {
      plotLength: 40, plotWidth: 30, setbackFront: 5, setbackSide: 3, setbackRear: 3,
      columnWidth_cm: 30, columnDepth_cm: 60,
      floors: Array.from({ length: 5 }, (_, i) => flr(i === 0 ? 'الأرضي' : `الدور ${i}`, 768, 3.5, 'flat', 20, 108, 70)),
      excavation: STD_EXC_DEEP,
      foundation: FDN_RAFT(0.7),
      roomFinishes: [
        room('لوبي', 'reception', 10, 8, 4.5, 'marble', 'paint_velvet', 'gypsum_board', '', 0.20),
        room('مطعم', 'restaurant', 12, 8, 3.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('مطبخ فندق', 'kitchen', 8, 6, 3.0, 'ceramic_60x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 1.5),
        room('غرفة نزيل (×40)', 'bedroom', 5, 4.5, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('حمام غرفة', 'bathroom', 2.5, 2, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('كوفي شوب', 'restaurant', 6, 5, 3.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.20),
        room('ممرات', 'corridor', 30, 2, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.02),
      ],
      facadeSchedules: [
        facade('north', 32, 17.5, 'glass_curtain', 0.35),
        facade('south', 32, 17.5, 'cladding_alucobond', 0.20),
        facade('east', 24, 17.5, 'stone_glued', 0.20),
        facade('west', 24, 17.5, 'cladding_alucobond', 0.15),
      ],
      mepConfig: MEP_LARGE,
    },
  },

  // ─────────────────────────────────────────────────
  // 14. مطعم
  // ─────────────────────────────────────────────────
  {
    id: 'restaurant_standard', projectType: 'restaurant', priority: 3, icon: '🍽️', plotArea: 300, floorsCount: 1,
    name: { ar: 'مطعم (80 كرسي)', en: 'Restaurant (80 seats)', fr: 'Restaurant (80 places)', zh: '餐厅 (80座)' },
    description: { ar: 'صالة طعام + مطبخ تجاري + مخزن + حمامات', en: 'Dining + Commercial kitchen + Storage', fr: 'Salle + Cuisine commerciale + Stockage', zh: '餐厅+商业厨房+仓库' },
    config: {
      plotLength: 20, plotWidth: 15, setbackFront: 3, setbackSide: 1.5, setbackRear: 2,
      columnWidth_cm: 25, columnDepth_cm: 40,
      floors: [flr('الأرضي', 200, 4.0, 'solid', 8, 54, 25)],
      excavation: STD_EXC_SHALLOW,
      foundation: FDN_ISOLATED(1.0, 0.4),
      roomFinishes: [
        room('صالة طعام', 'restaurant', 12, 10, 4.0, 'porcelain_120x60', 'paint_velvet', 'gypsum_board', '', 0.20),
        room('مطبخ تجاري', 'kitchen', 8, 6, 3.5, 'ceramic_60x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.0),
        room('مخزن بارد', 'storage', 3, 3, 3.0, 'epoxy', 'paint_plastic', 'none', '', 0.02),
        room('مخزن جاف', 'storage', 3, 2.5, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.02),
        room('استقبال/كاشير', 'reception', 3, 2, 4.0, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('حمامات زبائن', 'bathroom', 4, 2.5, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('غرفة موظفين', 'service', 3, 2, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.05),
      ],
      facadeSchedules: [
        facade('north', 12, 4, 'glass_curtain', 0.40),
        facade('south', 12, 4, 'cladding_alucobond', 0.10),
        facade('east', 14.5, 4, 'glass_curtain', 0.30),
        facade('west', 14.5, 4, 'plaster_paint', 0.10),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

  // ─────────────────────────────────────────────────
  // 15. محطة وقود
  // ─────────────────────────────────────────────────
  {
    id: 'gas_station_standard', projectType: 'gas_station', priority: 3, icon: '⛽', plotArea: 1200, floorsCount: 1,
    name: { ar: 'محطة وقود', en: 'Gas Station', fr: 'Station-Service', zh: '加油站' },
    description: { ar: 'مظلة وقود + ميني ماركت + مغسلة + مصلى', en: 'Fuel canopy + Mini mart + Car wash + Prayer', fr: 'Auvent + Superette + Lavage + Prière', zh: '油棚+便利店+洗车+祈祷室' },
    config: {
      plotLength: 40, plotWidth: 30, setbackFront: 5, setbackSide: 3, setbackRear: 3,
      columnWidth_cm: 25, columnDepth_cm: 40,
      floors: [flr('الأرضي', 600, 4.0, 'solid', 12, 100, 30)],
      excavation: STD_EXC_SHALLOW,
      foundation: FDN_ISOLATED(1.0, 0.4),
      roomFinishes: [
        room('ميني ماركت', 'shop', 10, 8, 3.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.25),
        room('مصلى', 'prayer', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.05),
        room('دورات مياه', 'bathroom', 5, 4, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('مكتب إدارة', 'office', 4, 3, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.10),
        room('غرفة كهرباء', 'service', 3, 2, 3.0, 'cement_plaster', 'cement_plaster', 'none', '', 0.05),
        room('مغسلة سيارات (3 خطوط)', 'service', 12, 5, 4.0, 'epoxy', 'ceramic_30x60', 'none', '', 0.10, 2.0),
      ],
      facadeSchedules: [
        facade('north', 24, 4, 'cladding_alucobond', 0.30),
        facade('south', 24, 4, 'cladding_alucobond', 0.10),
        facade('east', 34, 4, 'cladding_alucobond', 0.20),
        facade('west', 34, 4, 'plaster_paint', 0.10),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

  // ─────────────────────────────────────────────────
  // 16. مصنع
  // ─────────────────────────────────────────────────
  {
    id: 'factory_standard', projectType: 'factory', priority: 2, icon: '🏭', plotArea: 3200, floorsCount: 1,
    name: { ar: 'مصنع (3200م²)', en: 'Factory (3200m²)', fr: 'Usine (3200m²)', zh: '工厂 (3200m²)' },
    description: { ar: 'صالة إنتاج + مكاتب + مستودع + خدمات', en: 'Production hall + Offices + Warehouse', fr: 'Atelier + Bureaux + Entrepôt', zh: '生产车间+办公+仓库' },
    config: {
      plotLength: 80, plotWidth: 40, setbackFront: 6, setbackSide: 4, setbackRear: 4,
      columnWidth_cm: 30, columnDepth_cm: 50,
      floors: [flr('الأرضي', 2304, 8.0, 'solid', 18, 150, 40)],
      excavation: STD_EXC,
      foundation: FDN_STRIP(1.0, 0.6),
      roomFinishes: [
        room('صالة إنتاج', 'storage', 40, 30, 8.0, 'epoxy', 'paint_plastic', 'none', '', 0.05),
        room('مستودع مواد خام', 'storage', 20, 15, 6.0, 'epoxy', 'cement_plaster', 'none', '', 0.05),
        room('مستودع منتجات', 'storage', 15, 12, 6.0, 'epoxy', 'cement_plaster', 'none', '', 0.10),
        room('مكاتب إدارة', 'office', 8, 6, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('غرفة اجتماعات', 'office', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('غرفة عمال', 'service', 6, 5, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.10),
        room('حمامات', 'bathroom', 5, 4, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('رصيف تحميل', 'service', 12, 4, 5.0, 'epoxy', 'cement_plaster', 'none', '', 0.50),
      ],
      facadeSchedules: [
        facade('north', 32, 8, 'cladding_alucobond', 0.10),
        facade('south', 32, 8, 'cladding_alucobond', 0.05),
        facade('east', 72, 8, 'cladding_alucobond', 0.05),
        facade('west', 72, 8, 'cladding_alucobond', 0.15),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

  // ─────────────────────────────────────────────────
  // 17. مستودع
  // ─────────────────────────────────────────────────
  {
    id: 'warehouse_standard', projectType: 'warehouse', priority: 3, icon: '📦', plotArea: 1800, floorsCount: 1,
    name: { ar: 'مستودع', en: 'Warehouse', fr: 'Entrepôt', zh: '仓库' },
    description: { ar: 'مستودع مفتوح + مكتب + رصيف تحميل', en: 'Open warehouse + Office + Loading dock', fr: 'Entrepôt ouvert + Bureau + Quai', zh: '开放仓库+办公+装卸台' },
    config: {
      plotLength: 60, plotWidth: 30, setbackFront: 5, setbackSide: 3, setbackRear: 3,
      columnWidth_cm: 25, columnDepth_cm: 40,
      floors: [flr('الأرضي', 1296, 7.0, 'solid', 12, 120, 10)],
      excavation: STD_EXC_SHALLOW,
      foundation: FDN_STRIP(0.8, 0.5),
      roomFinishes: [
        room('مستودع مفتوح', 'storage', 50, 24, 7.0, 'epoxy', 'cement_plaster', 'none', '', 0.05),
        room('مكتب', 'office', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('حمام', 'bathroom', 2.5, 2, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('رصيف تحميل', 'service', 12, 4, 5.0, 'epoxy', 'cement_plaster', 'none', '', 0.50),
      ],
      facadeSchedules: [
        facade('north', 24, 7, 'cladding_alucobond', 0.10),
        facade('south', 24, 7, 'cladding_alucobond', 0.05),
        facade('east', 54, 7, 'cladding_alucobond', 0.05),
        facade('west', 54, 7, 'cladding_alucobond', 0.15),
      ],
      mepConfig: { ...MEP_COMMERCIAL, hvac: { systemType: 'split', condenserLocation: 'roof' } },
    },
  },

  // ─────────────────────────────────────────────────
  // 18. استراحة
  // ─────────────────────────────────────────────────
  {
    id: 'rest_house_standard', projectType: 'rest_house', priority: 3, icon: '🏖️', plotArea: 600, floorsCount: 1,
    name: { ar: 'استراحة', en: 'Rest House / Chalet', fr: 'Chalet de Repos', zh: '休闲别墅' },
    description: { ar: 'مجلس + مسبح + مطبخ + حمامات + حديقة', en: 'Majlis + Pool + Kitchen + Garden', fr: 'Majlis + Piscine + Cuisine + Jardin', zh: '客厅+泳池+厨房+花园' },
    config: {
      plotLength: 30, plotWidth: 20, setbackFront: 3, setbackSide: 2, setbackRear: 2,
      columnWidth_cm: 25, columnDepth_cm: 40,
      floors: [flr('الأرضي', 240, 3.5, 'solid', 10, 60, 20)],
      excavation: STD_EXC,
      foundation: FDN_ISOLATED(1.0, 0.4),
      roomFinishes: [
        room('مجلس', 'majlis', 6, 5, 3.5, 'porcelain_120x60', 'paint_velvet', 'gypsum_board', '', 0.15),
        room('صالة', 'living', 5, 4, 3.5, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('مطبخ', 'kitchen', 4, 3, 3.0, 'ceramic_60x60', 'ceramic_30x60', 'paint_plastic', '', 0.10, 1.5),
        room('غرفة نوم', 'bedroom', 4, 3.5, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('حمام 1', 'bathroom', 2.5, 2, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('حمام 2', 'bathroom', 2.5, 2, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('منطقة الشواء', 'service', 4, 3, 3.5, 'ceramic_60x60', 'cement_plaster', 'none', '', 0.30),
      ],
      facadeSchedules: [
        facade('north', 16, 3.5, 'stone_glued', 0.20),
        facade('south', 16, 3.5, 'plaster_paint', 0.15),
        facade('east', 26, 3.5, 'plaster_paint', 0.20),
        facade('west', 26, 3.5, 'stone_glued', 0.15),
      ],
      mepConfig: MEP_VILLA,
    },
  },

  // ─────────────────────────────────────────────────
  // 19. مزرعة
  // ─────────────────────────────────────────────────
  {
    id: 'farm_standard', projectType: 'farm', priority: 2, icon: '🌾', plotArea: 5000, floorsCount: 1,
    name: { ar: 'مزرعة', en: 'Farm', fr: 'Ferme', zh: '农场' },
    description: { ar: 'سكن عمال + مخازن + حظائر + مكتب', en: 'Workers housing + Storage + Barns + Office', fr: 'Logement ouvriers + Stockage + Étables', zh: '工人宿舍+仓库+畜棚+办公' },
    config: {
      plotLength: 100, plotWidth: 50, setbackFront: 5, setbackSide: 5, setbackRear: 5,
      columnWidth_cm: 25, columnDepth_cm: 40,
      floors: [flr('الأرضي', 800, 4.0, 'solid', 14, 120, 30)],
      excavation: STD_EXC_SHALLOW,
      foundation: FDN_STRIP(0.7, 0.4),
      roomFinishes: [
        room('سكن عمال (4 غرف)', 'bedroom', 4, 3, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('مطبخ مشترك', 'kitchen', 5, 4, 3.0, 'ceramic_60x60', 'ceramic_30x60', 'paint_plastic', '', 0.10, 1.5),
        room('حمامات عمال', 'bathroom', 4, 3, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('مكتب مزرعة', 'office', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('مخزن أعلاف', 'storage', 10, 8, 4.0, 'cement_plaster', 'cement_plaster', 'none', '', 0.10),
        room('مخزن معدات', 'storage', 8, 6, 4.0, 'cement_plaster', 'cement_plaster', 'none', '', 0.15),
      ],
      facadeSchedules: [
        facade('north', 40, 4, 'plaster_paint', 0.10),
        facade('south', 40, 4, 'plaster_paint', 0.10),
        facade('east', 90, 4, 'plaster_paint', 0.05),
        facade('west', 90, 4, 'plaster_paint', 0.05),
      ],
      mepConfig: { ...MEP_VILLA, hvac: { systemType: 'split', condenserLocation: 'ground' } },
    },
  },

  // ─────────────────────────────────────────────────
  // 20. مجمع رياضي
  // ─────────────────────────────────────────────────
  {
    id: 'sports_complex', projectType: 'sports_complex', priority: 2, icon: '🏟️', plotArea: 4800, floorsCount: 2,
    name: { ar: 'مجمع رياضي', en: 'Sports Complex', fr: 'Complexe Sportif', zh: '体育综合体' },
    description: { ar: 'صالة رياضية + مسبح + غرف تبديل', en: 'Gym + Pool + Changing rooms', fr: 'Salle de sport + Piscine + Vestiaires', zh: '健身房+泳池+更衣室' },
    config: {
      plotLength: 80, plotWidth: 60, setbackFront: 6, setbackSide: 4, setbackRear: 4,
      columnWidth_cm: 30, columnDepth_cm: 60,
      floors: [
        flr('الأرضي', 3640, 6.0, 'solid', 28, 160, 60),
        flr('الأول', 2000, 4.0, 'flat', 20, 120, 50),
      ],
      excavation: STD_EXC_DEEP,
      foundation: FDN_RAFT(0.7),
      roomFinishes: [
        room('صالة رياضية', 'gym', 25, 20, 6.0, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('منطقة أجهزة', 'gym', 15, 12, 4.0, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('مسبح', 'pool', 25, 12, 5.0, 'ceramic_30x60', 'ceramic_30x60', 'gypsum_board', '', 0.05, 2.4),
        room('غرف تبديل رجال', 'service', 8, 6, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('غرف تبديل نساء', 'service', 8, 6, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('استقبال', 'reception', 8, 5, 4.0, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('كافتيريا', 'restaurant', 8, 6, 3.5, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('مكاتب', 'office', 6, 5, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
      ],
      facadeSchedules: [
        facade('north', 52, 10, 'glass_curtain', 0.30),
        facade('south', 52, 10, 'cladding_alucobond', 0.15),
        facade('east', 70, 10, 'glass_curtain', 0.25),
        facade('west', 70, 10, 'cladding_alucobond', 0.10),
      ],
      mepConfig: MEP_LARGE,
    },
  },

  // ─────────────────────────────────────────────────
  // 21. غسيل سيارات
  // ─────────────────────────────────────────────────
  {
    id: 'car_wash_standard', projectType: 'car_wash', priority: 3, icon: '🚗', plotArea: 375, floorsCount: 1,
    name: { ar: 'غسيل سيارات', en: 'Car Wash', fr: 'Lavage Auto', zh: '洗车场' },
    description: { ar: '4 خطوط غسيل + استقبال + مكتب', en: '4 wash bays + Reception + Office', fr: '4 lignes + Réception + Bureau', zh: '4洗车线+接待+办公' },
    config: {
      plotLength: 25, plotWidth: 15, setbackFront: 3, setbackSide: 1.5, setbackRear: 2,
      columnWidth_cm: 25, columnDepth_cm: 40,
      floors: [flr('الأرضي', 200, 4.5, 'solid', 8, 50, 15)],
      excavation: STD_EXC_SHALLOW,
      foundation: FDN_ISOLATED(1.0, 0.4),
      roomFinishes: [
        room('خطوط غسيل (4)', 'service', 12, 5, 4.5, 'epoxy', 'ceramic_30x60', 'none', '', 0.30, 2.0),
        room('استقبال/كاشير', 'reception', 4, 3, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.20),
        room('غرفة انتظار', 'living', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.20),
        room('مكتب', 'office', 3, 2.5, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.10),
        room('غرفة معدات', 'service', 3, 3, 3.0, 'cement_plaster', 'cement_plaster', 'none', '', 0.05),
        room('حمام', 'bathroom', 2, 1.5, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
      ],
      facadeSchedules: [
        facade('north', 12, 4.5, 'cladding_alucobond', 0.20),
        facade('south', 12, 4.5, 'plaster_paint', 0.05),
        facade('east', 19, 4.5, 'cladding_alucobond', 0.15),
        facade('west', 19, 4.5, 'plaster_paint', 0.10),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

  // ─────────────────────────────────────────────────
  // 22. مبنى حكومي
  // ─────────────────────────────────────────────────
  {
    id: 'government_standard', projectType: 'government', priority: 2, icon: '🏛️', plotArea: 1200, floorsCount: 3,
    name: { ar: 'مبنى حكومي', en: 'Government Building', fr: 'Bâtiment Gouvernemental', zh: '政府大楼' },
    description: { ar: '3 طوابق — مكاتب + اجتماعات + استقبال', en: '3F — Offices + Meeting rooms + Reception', fr: '3 ét. — Bureaux + Salles de réunion', zh: '3层 — 办公+会议室+接待' },
    config: {
      plotLength: 40, plotWidth: 30, setbackFront: 5, setbackSide: 3, setbackRear: 3,
      columnWidth_cm: 30, columnDepth_cm: 50,
      floors: Array.from({ length: 3 }, (_, i) => flr(i === 0 ? 'الأرضي' : `الدور ${i}`, 768, 3.5, 'solid', 18, 108, 65)),
      excavation: STD_EXC,
      foundation: FDN_RAFT(0.6),
      roomFinishes: [
        room('استقبال', 'reception', 10, 6, 4.0, 'marble', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('مكتب مدير', 'office', 6, 5, 3.5, 'porcelain_120x60', 'paint_velvet', 'gypsum_board', '', 0.15),
        room('مكاتب (×15)', 'office', 5, 4, 3.2, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('قاعة اجتماعات', 'office', 8, 6, 3.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('مصلى', 'prayer', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.05),
        room('ممرات', 'corridor', 40, 2.4, 3.2, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.05),
        room('حمامات', 'bathroom', 4, 3, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
        room('أرشيف', 'storage', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.05),
      ],
      facadeSchedules: [
        facade('north', 32, 10.5, 'stone_mechanical', 0.20),
        facade('south', 32, 10.5, 'plaster_paint', 0.15),
        facade('east', 24, 10.5, 'stone_mechanical', 0.20),
        facade('west', 24, 10.5, 'plaster_paint', 0.15),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

  // ─────────────────────────────────────────────────
  // 23. عمارة سكنية (4 أدوار)
  // ─────────────────────────────────────────────────
  {
    id: 'residential_4floor', projectType: 'residential_building', priority: 3, icon: '🏢', plotArea: 500, floorsCount: 4,
    name: { ar: 'عمارة سكنية (4 أدوار)', en: 'Residential Building (4F)', fr: 'Immeuble Résidentiel (4 ét.)', zh: '住宅楼 (4层)' },
    description: { ar: '12 شقة — 3 شقق/طابق + لوبي', en: '12 apts — 3/floor + Lobby', fr: '12 apparts — 3/étage + Hall', zh: '12公寓 — 每层3套+大厅' },
    config: {
      plotLength: 25, plotWidth: 20, setbackFront: 4, setbackSide: 1.5, setbackRear: 2,
      columnWidth_cm: 30, columnDepth_cm: 50,
      floors: Array.from({ length: 4 }, (_, i) => flr(i === 0 ? 'الأرضي' : `الدور ${i}`, 370, 3.2, 'solid', 14, 76, 45)),
      excavation: STD_EXC,
      foundation: FDN_STRIP(1.0, 0.5),
      roomFinishes: [
        room('لوبي', 'corridor', 4, 3, 3.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('صالة شقة', 'living', 5, 4, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('غرفة نوم 1', 'bedroom', 4, 3.5, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('غرفة نوم 2', 'bedroom', 3.5, 3, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('مطبخ', 'kitchen', 3.5, 3, 2.8, 'ceramic_60x60', 'ceramic_30x60', 'paint_plastic', '', 0.10, 1.5),
        room('حمام', 'bathroom', 2.5, 2, 2.8, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
      ],
      facadeSchedules: [
        facade('north', 17, 12.8, 'plaster_paint', 0.20),
        facade('south', 17, 12.8, 'plaster_paint', 0.15),
        facade('east', 17.5, 12.8, 'stone_glued', 0.20),
        facade('west', 17.5, 12.8, 'plaster_paint', 0.15),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

  // ─────────────────────────────────────────────────
  // 24. فندق 5 نجوم
  // ─────────────────────────────────────────────────
  {
    id: 'hotel_5star', projectType: 'hotel', priority: 1, icon: '🌟', plotArea: 2400, floorsCount: 8,
    name: { ar: 'فندق 5 نجوم', en: '5-Star Hotel', fr: 'Hôtel 5 Étoiles', zh: '五星级酒店' },
    description: { ar: '8 طوابق — 120 غرفة + أجنحة + سبا + مسبح', en: '8F — 120 rooms + Suites + Spa + Pool', fr: '8 ét. — 120 ch. + Suites + Spa', zh: '8层 — 120间+套房+水疗+泳池' },
    config: {
      plotLength: 60, plotWidth: 40, setbackFront: 8, setbackSide: 4, setbackRear: 4,
      columnWidth_cm: 40, columnDepth_cm: 70,
      floors: [
        flr('قبو مواقف', 1536, 3.5, 'flat', 30, 140, 20),
        flr('الأرضي (لوبي)', 1536, 5.0, 'flat', 30, 140, 60),
        ...Array.from({ length: 7 }, (_, i) => flr(`الدور ${i + 1}`, 1536, 3.5, 'flat', 30, 140, 80)),
      ],
      excavation: { excavationDepth: 5, soilReplacementNeeded: true, soilReplacementThickness: 0.5, zeroLevel: 0.5 },
      foundation: FDN_PILES,
      roomFinishes: [
        room('لوبي فاخر', 'reception', 15, 12, 5.0, 'marble', 'paint_velvet', 'gypsum_board', '', 0.25),
        room('مطعم فاخر', 'restaurant', 15, 10, 4.0, 'marble', 'wallpaper', 'gypsum_board', '', 0.15),
        room('مطعم كاجوال', 'restaurant', 12, 8, 3.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('مطبخ', 'kitchen', 12, 8, 3.5, 'ceramic_60x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.0),
        room('سبا', 'service', 10, 8, 3.5, 'marble', 'paint_velvet', 'gypsum_board', '', 0.05),
        room('صالة رياضية', 'gym', 10, 8, 3.5, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('مسبح', 'pool', 15, 8, 4.0, 'ceramic_30x60', 'ceramic_30x60', 'gypsum_board', '', 0.10, 2.0),
        room('غرفة نزيل (×100)', 'bedroom', 7, 5, 3.2, 'porcelain_120x60', 'wallpaper', 'gypsum_board', '', 0.15),
        room('جناح فاخر (×20)', 'bedroom', 10, 8, 3.2, 'marble', 'wallpaper', 'gypsum_board', '', 0.20),
        room('حمام غرفة', 'bathroom', 3, 2.5, 2.8, 'marble', 'ceramic_30x60', 'gypsum_plaster', '', 0.05, 2.4),
        room('ممرات', 'corridor', 50, 2.4, 3.0, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.02),
      ],
      facadeSchedules: [
        facade('north', 48, 31, 'glass_curtain', 0.50),
        facade('south', 48, 31, 'stone_mechanical', 0.20),
        facade('east', 32, 31, 'glass_curtain', 0.45),
        facade('west', 32, 31, 'stone_mechanical', 0.20),
      ],
      mepConfig: MEP_LARGE,
    },
  },

  // ─────────────────────────────────────────────────
  // 25. مدرسة ثانوية
  // ─────────────────────────────────────────────────
  {
    id: 'school_secondary', projectType: 'school', priority: 2, icon: '🎓', plotArea: 4800, floorsCount: 3,
    name: { ar: 'مدرسة ثانوية', en: 'Secondary School', fr: 'Lycée', zh: '高中' },
    description: { ar: '18 فصل + 3 مختبرات + مكتبة + كافتيريا + مسرح', en: '18 classes + 3 Labs + Library + Cafeteria + Theater', fr: '18 classes + 3 labos + Bibliothèque', zh: '18教室+3实验室+图书馆+食堂' },
    config: {
      plotLength: 80, plotWidth: 60, setbackFront: 6, setbackSide: 4, setbackRear: 4,
      columnWidth_cm: 30, columnDepth_cm: 60,
      floors: Array.from({ length: 3 }, (_, i) => flr(i === 0 ? 'الأرضي' : `الدور ${i}`, 3640, 3.8, 'solid', 30, 180, 100)),
      excavation: STD_EXC,
      foundation: FDN_STRIP(1.0, 0.6),
      roomFinishes: [
        room('فصل دراسي (×18)', 'office', 8, 7, 3.5, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('مختبر فيزياء', 'office', 10, 8, 3.5, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('مختبر كيمياء', 'office', 10, 8, 3.5, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.15),
        room('مختبر حاسب', 'office', 10, 8, 3.5, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.10),
        room('مكتبة', 'office', 12, 10, 3.5, 'porcelain_120x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('كافتيريا', 'restaurant', 12, 8, 3.5, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.10),
        room('مسرح', 'corridor', 15, 10, 5.0, 'vinyl', 'paint_plastic', 'gypsum_board', '', 0.05),
        room('إدارة', 'office', 10, 6, 3.0, 'ceramic_60x60', 'paint_plastic', 'gypsum_board', '', 0.15),
        room('مصلى', 'prayer', 8, 6, 3.0, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.05),
        room('ممرات', 'corridor', 80, 3, 3.5, 'ceramic_60x60', 'paint_plastic', 'paint_plastic', '', 0.05),
        room('حمامات', 'bathroom', 8, 5, 3.0, 'ceramic_30x60', 'ceramic_30x60', 'paint_plastic', '', 0.05, 2.4),
      ],
      facadeSchedules: [
        facade('north', 72, 11.4, 'plaster_paint', 0.20),
        facade('south', 72, 11.4, 'plaster_paint', 0.20),
        facade('east', 52, 11.4, 'stone_glued', 0.15),
        facade('west', 52, 11.4, 'plaster_paint', 0.15),
      ],
      mepConfig: MEP_COMMERCIAL,
    },
  },

];

// ═══════════════════════════════════════════════════
// Query Functions
// ═══════════════════════════════════════════════════

/** Get templates for a specific project type, sorted by priority */
export function getTemplatesForType(type: ProjectType): BlueprintTemplate[] {
  return BLUEPRINT_TEMPLATES
    .filter(t => t.projectType === type)
    .sort((a, b) => b.priority - a.priority);
}

/** Get all available project types that have templates */
export function getAvailableTemplateTypes(): ProjectType[] {
  return [...new Set(BLUEPRINT_TEMPLATES.map(t => t.projectType))];
}

/** Get template by ID */
export function getTemplateById(id: string): BlueprintTemplate | undefined {
  return BLUEPRINT_TEMPLATES.find(t => t.id === id);
}
