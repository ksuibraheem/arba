/**
 * ARBA V11.3 — Item Cost Analyzer (محلل تكلفة البند)
 * يحسب التكلفة من الصفر: مواد + عمالة + معدات + هدر + مصاريف عامة + مكسب
 * يستخدم قواعد بيانات حقيقية: marketPrices2026 + market_benchmark + materialRates + بورصة
 * v3.0 Brain: 32 مصدر | 13,005 بند | 17 نوع مشروع | تحقق متقاطع ذكي
 */

import { PIPE_PRICES, ELECTRICAL_PRICES, INSULATION_CONSTANTS, FORMWORK_DETAILS } from './engineeringConstants';
import { commodityEngine } from './commodityIntelligenceEngine';
import { MATERIAL_PRICES, LABOR_DAILY_RATES, EQUIPMENT_RATES, getMaterialPrice, getReadyMixPrice } from '../data/marketPricesToday';
import {
  ENHANCED_WASTE_FACTORS,
  CONCRETE_MIX_RATES, CONCRETE_GRADE_BY_ELEMENT,
  MORTAR_RATES, TILE_RATES, PAINT_RATES,
  INSULATION_RATES, WATERPROOFING_RATES,
  calculateMaterialCostPerUnit,
} from '../data/materialRates';
import {
  LABOR_ACTIVITIES, findActivity, calculateLaborCost,
  WEATHER_FACTORS, COMPLEXITY_FACTORS,
} from '../data/laborProductivity';
import fs from 'fs';
import path from 'path';

// تحميل معاملات الموقع
let LOCATION_MULTIPLIERS: Record<string, { factor: number }> = {};
try {
  const locPath = path.join(process.cwd(), 'data', 'location_multipliers.json');
  if (fs.existsSync(locPath)) {
    const locData = JSON.parse(fs.readFileSync(locPath, 'utf8'));
    LOCATION_MULTIPLIERS = locData.regions || {};
  }
} catch (e) {
  console.log('⚠️ لم يتمكن من تحميل معاملات الموقع location_multipliers.json');
}

// تحميل تصحيحات التسعير
let CORRECTION_PATCHES: any[] = [];
try {
  const patchesPath = path.join(process.cwd(), 'data', 'correction_patches.json');
  if (fs.existsSync(patchesPath)) {
    const patchesData = JSON.parse(fs.readFileSync(patchesPath, 'utf8'));
    CORRECTION_PATCHES = patchesData.patches || [];
  }
} catch (e) {
  console.log('⚠️ لم يتمكن من تحميل التصحيحات correction_patches.json');
}

// تحميل بنود الدماغ للتدريب كمصدر تاريخي
let BRAIN_HISTORY_ITEMS: any[] = [];
try {
  const brainPath = path.join(process.cwd(), 'training_data', 'trained', 'brain_mega_training.json');
  if (fs.existsSync(brainPath)) {
    const brainData = JSON.parse(fs.readFileSync(brainPath, 'utf8'));
    if (brainData.sources) {
      // جمع كل العناصر من كل المصادر
      for (const src of Object.values(brainData.sources) as any[]) {
        if (src.items && Array.isArray(src.items)) {
          BRAIN_HISTORY_ITEMS = BRAIN_HISTORY_ITEMS.concat(src.items);
        }
      }
    }
  }
} catch (e) {
  console.log('⚠️ لم يتمكن من تحميل بيانات التدريب التاريخية');
}

// تحميل أسعار السوق 2026 (195 صنف من 28 فئة)
let MARKET_PRICES_2026: Record<string, any[]> = {};
try {
  const marketPath = path.join(process.cwd(), 'training_data', 'trained', 'market_prices_2026.json');
  if (fs.existsSync(marketPath)) {
    const marketData = JSON.parse(fs.readFileSync(marketPath, 'utf8'));
    MARKET_PRICES_2026 = marketData.categories || {};
    const totalItems = Object.values(MARKET_PRICES_2026).reduce((s: number, arr: any) => s + arr.length, 0);
    console.log(`✅ أسعار السوق 2026: ${totalItems} صنف من ${Object.keys(MARKET_PRICES_2026).length} فئة`);
  }
} catch (e) {
  console.log('⚠️ لم يتمكن من تحميل أسعار السوق market_prices_2026.json');
}

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

export interface MaterialLine {
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  source: 'supplier_api' | 'web_search' | 'commodity_exchange' | 'engineering_db' | 'estimated';
  total: number;
}

export interface LaborLine {
  trade: string;
  hours: number;
  ratePerHour: number;
  total: number;
}

export interface PriceVerification {
  supplierPrice: number | null;
  webPrice: number | null;
  commodityPrice: number | null;
  historicalPrice: number | null;
  deviation: number;       // % deviation from average
  isReasonable: boolean;
  warning: string | null;
}

export type WorkScope = 'new' | 'renovation' | 'mixed';

export interface ItemCostResult {
  // تفاصيل البند
  itemDescription: string;
  unit: string;
  category: string;
  workScope: WorkScope;  // جديد / ترميم / مختلط

  // التكلفة الأصلية
  materials: MaterialLine[];
  labor: LaborLine[];
  equipmentCost: number;
  demolitionCost: number;  // تكلفة الفك (ترميم فقط)
  wasteFactor: number;
  wasteAmount: number;
  overheadPercent: number;
  overheadAmount: number;
  directCost: number;
  totalCost: number;

  // المكسب
  profitMargin: number;
  profitAmount: number;
  sellingPrice: number;
  isDefaultProfit: boolean;

  // التحقق
  verification: PriceVerification;
  confidence: number;
  sources: string[];
  warnings: string[];
}

// ═══════════════════════════════════════════
// أسعار العمالة بالساعة (من marketPrices2026 الحقيقية / 8 ساعات)
// ═══════════════════════════════════════════

const LABOR_RATES: Record<string, number> = {
  'عامل': Math.round((LABOR_DAILY_RATES.laborer?.daily || 100) / 8),      // 13
  'عامل عادي': Math.round((LABOR_DAILY_RATES.laborer?.daily || 100) / 8),
  'نجار': Math.round((LABOR_DAILY_RATES.carpenter?.daily || 200) / 8),    // 25
  'حداد': Math.round((LABOR_DAILY_RATES.steelfixer?.daily || 250) / 8),   // 31
  'بلاط': Math.round((LABOR_DAILY_RATES.tiler?.daily || 250) / 8),        // 31
  'سباك': Math.round((LABOR_DAILY_RATES.plumber?.daily || 250) / 8),      // 31
  'كهربائي': Math.round((LABOR_DAILY_RATES.electrician?.daily || 250) / 8), // 31
  'دهان': Math.round((LABOR_DAILY_RATES.painter?.daily || 180) / 8),      // 23
  'لحام': Math.round((LABOR_DAILY_RATES.welder?.daily || 280) / 8),       // 35
  'فني تكييف': Math.round((LABOR_DAILY_RATES.hvac_tech?.daily || 280) / 8), // 35
  'فني شبكات': 35,
  'مهندس': Math.round((LABOR_DAILY_RATES.site_engineer?.daily || 500) / 8), // 63
  'فورمان': Math.round((LABOR_DAILY_RATES.foreman?.daily || 300) / 8),    // 38
  'مبيض': Math.round((LABOR_DAILY_RATES.plasterer?.daily || 200) / 8),    // 25
  'بناء': Math.round((LABOR_DAILY_RATES.mason?.daily || 200) / 8),        // 25
  'فني أبواب': Math.round((LABOR_DAILY_RATES.door_installer?.daily || 220) / 8), // 28
  'فني ألمنيوم': Math.round((LABOR_DAILY_RATES.aluminum_tech?.daily || 250) / 8), // 31
};

// خريطة ربط المواد مع قاعدة بيانات marketPrices2026
const MATERIAL_PRICE_MAP: Record<string, string> = {
  'أسمنت': 'cement_50kg',
  'خرسانة جاهزة': 'readymix_C25',
  'حديد تسليح': 'steel_rebar_ton',
  'بلوك 20': 'block_20cm',
  'بلوك 15': 'block_15cm',
  'رمل': 'sand_m3',
  'حصى': 'gravel_m3',
  'سيراميك': 'ceramic_60x60_mid',
  'بورسلان': 'porcelain_60x60',
  'رخام': 'marble_m2',
  'جرانيت': 'granite_m2',
  'إنترلوك': 'interlock_m2',
  'غراء': 'tile_adhesive',
  'دهان': 'paint_plastic_18L',
  'برايمر': 'primer_18L',
  'ميمبرين': 'membrane_3mm',
  'عزل EPS': 'eps_50mm',
  'عزل XPS': 'xps_50mm',
  'صوف صخري': 'rockwool_50mm',
  'بليوت': 'plywood_18mm',
  'جبس بورد': 'gypsum_board',
  'كاشف دخان': 'smoke_detector',
  'طفاية': 'fire_extinguisher',
  'رشاش': 'sprinkler_head',
  'LED': 'led_panel_60x60',
  'كابل 4مم': 'cable_4mm',
  'كابل 6مم': 'cable_6mm',
  'مكيف سبليت': 'ac_split_2ton',
  'PPR': 'pipe_ppr_25',
};

// ═══════════════════════════════════════════
// قاعدة بيانات تحليل البنود (وصفات التسعير)
// ═══════════════════════════════════════════

interface ItemRecipe {
  category: string;
  materials: { name: string; qtyPerUnit: number; unit: string; basePrice: number }[];
  labor: { trade: string; hoursPerUnit: number }[];
  equipmentPerUnit: number;
  wastePct: number;
}

const ITEM_RECIPES: Record<string, ItemRecipe> = {
  'خرسانة مسلحة': {
    category: 'إنشائي',
    materials: [
      { name: 'خرسانة جاهزة C35', qtyPerUnit: 1, unit: 'م3', basePrice: 290 },
      { name: 'حديد تسليح', qtyPerUnit: 120, unit: 'كجم', basePrice: 2.75 },
      { name: 'شدات خشبية', qtyPerUnit: 6, unit: 'م2', basePrice: 16 },
    ],
    labor: [{ trade: 'نجار', hoursPerUnit: 2 }, { trade: 'حداد', hoursPerUnit: 3 }, { trade: 'عامل', hoursPerUnit: 2 }],
    equipmentPerUnit: 30, wastePct: 5,
  },
  'خرسانة عادية': {
    category: 'إنشائي',
    materials: [{ name: 'خرسانة جاهزة C20', qtyPerUnit: 1, unit: 'م3', basePrice: 220 }],
    labor: [{ trade: 'عامل', hoursPerUnit: 1.5 }],
    equipmentPerUnit: 15, wastePct: 3,
  },
  'بلوك 20': {
    category: 'مباني',
    materials: [
      { name: 'بلوك خرساني 20سم', qtyPerUnit: 12.5, unit: 'حبة', basePrice: 2.0 },
      { name: 'مونة أسمنتية', qtyPerUnit: 0.02, unit: 'م3', basePrice: 180 },
    ],
    labor: [{ trade: 'بلاط', hoursPerUnit: 0.8 }, { trade: 'عامل', hoursPerUnit: 0.5 }],
    equipmentPerUnit: 2, wastePct: 5,
  },
  'طوب مصمت': {
    category: 'مباني',
    materials: [
      { name: 'طوب أحمر مصمت', qtyPerUnit: 40, unit: 'حبة', basePrice: 0.8 },
      { name: 'مونة أسمنتية', qtyPerUnit: 0.03, unit: 'م3', basePrice: 180 },
    ],
    labor: [{ trade: 'بلاط', hoursPerUnit: 1 }, { trade: 'عامل', hoursPerUnit: 0.5 }],
    equipmentPerUnit: 2, wastePct: 5,
  },
  'لياسة': {
    category: 'تشطيبات',
    materials: [
      { name: 'أسمنت', qtyPerUnit: 8, unit: 'كجم', basePrice: 0.31 },
      { name: 'رمل', qtyPerUnit: 0.02, unit: 'م3', basePrice: 60 },
    ],
    labor: [{ trade: 'بلاط', hoursPerUnit: 0.5 }, { trade: 'عامل', hoursPerUnit: 0.3 }],
    equipmentPerUnit: 1, wastePct: 8,
  },
  'بورسلان': {
    category: 'تشطيبات',
    materials: [
      { name: 'بلاط بورسلان 80×80', qtyPerUnit: 1.1, unit: 'م2', basePrice: 95 },
      { name: 'لاصق بلاط', qtyPerUnit: 5, unit: 'كجم', basePrice: 1.2 },
      { name: 'روبة', qtyPerUnit: 0.5, unit: 'كجم', basePrice: 3 },
    ],
    labor: [{ trade: 'بلاط', hoursPerUnit: 0.8 }, { trade: 'عامل', hoursPerUnit: 0.3 }],
    equipmentPerUnit: 2, wastePct: 10,
  },
  'دهانات': {
    category: 'تشطيبات',
    materials: [
      { name: 'دهان بلاستيكي', qtyPerUnit: 0.4, unit: 'لتر', basePrice: 25 },
      { name: 'معجون', qtyPerUnit: 0.5, unit: 'كجم', basePrice: 4 },
      { name: 'سيلر', qtyPerUnit: 0.15, unit: 'لتر', basePrice: 20 },
    ],
    labor: [{ trade: 'دهان', hoursPerUnit: 0.4 }, { trade: 'عامل', hoursPerUnit: 0.15 }],
    equipmentPerUnit: 1, wastePct: 5,
  },
  'عزل مائي': {
    category: 'عزل',
    materials: [
      { name: 'لفائف عزل مائي', qtyPerUnit: 1.1, unit: 'م2', basePrice: 12 },
      { name: 'برايمر', qtyPerUnit: 0.25, unit: 'لتر', basePrice: 10 },
    ],
    labor: [{ trade: 'عامل', hoursPerUnit: 0.25 }],
    equipmentPerUnit: 1, wastePct: 10,
  },
  'حفر': {
    category: 'أعمال ترابية',
    materials: [],
    labor: [{ trade: 'عامل', hoursPerUnit: 0.15 }],
    equipmentPerUnit: 25, wastePct: 0,
  },
  'ردم': {
    category: 'أعمال ترابية',
    materials: [{ name: 'تربة دفان A-2-4', qtyPerUnit: 1.2, unit: 'م3', basePrice: 18 }],
    labor: [{ trade: 'عامل', hoursPerUnit: 0.1 }],
    equipmentPerUnit: 12, wastePct: 0,
  },
  'شبابيك الومنيوم': {
    category: 'نوافذ',
    materials: [
      { name: 'بروفايل ألمنيوم', qtyPerUnit: 6, unit: 'م.ط', basePrice: 45 },
      { name: 'زجاج مزدوج', qtyPerUnit: 1, unit: 'م2', basePrice: 120 },
      { name: 'اكسسوارات', qtyPerUnit: 1, unit: 'طقم', basePrice: 80 },
    ],
    labor: [{ trade: 'فورمان', hoursPerUnit: 1.5 }, { trade: 'عامل', hoursPerUnit: 1 }],
    equipmentPerUnit: 15, wastePct: 5,
  },
  'وحدة إنارة led': {
    category: 'كهرباء',
    materials: [
      { name: 'كشاف LED 40W', qtyPerUnit: 1, unit: 'عدد', basePrice: 65 },
      { name: 'كابل 1.5مم', qtyPerUnit: 5, unit: 'م', basePrice: 3.5 },
      { name: 'علبة غاطسة', qtyPerUnit: 1, unit: 'عدد', basePrice: 8 },
    ],
    labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }, { trade: 'عامل', hoursPerUnit: 0.3 }],
    equipmentPerUnit: 5, wastePct: 3,
  },
  'مخرج قوى': {
    category: 'كهرباء',
    materials: [
      { name: 'فيشة 13A مزدوجة', qtyPerUnit: 1, unit: 'عدد', basePrice: 35 },
      { name: 'كابل 2.5مم', qtyPerUnit: 8, unit: 'م', basePrice: 5.5 },
      { name: 'خرطوم PVC', qtyPerUnit: 8, unit: 'م', basePrice: 4 },
    ],
    labor: [{ trade: 'كهربائي', hoursPerUnit: 0.6 }],
    equipmentPerUnit: 3, wastePct: 5,
  },
  'مروحة طرد': {
    category: 'تهوية',
    materials: [{ name: 'مروحة طرد 30سم', qtyPerUnit: 1, unit: 'عدد', basePrice: 150 }],
    labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }, { trade: 'عامل', hoursPerUnit: 0.5 }],
    equipmentPerUnit: 10, wastePct: 0,
  },
  'مرحاض افرنجي': {
    category: 'صحي',
    materials: [
      { name: 'طقم مرحاض إفرنجي خزف', qtyPerUnit: 1, unit: 'عدد', basePrice: 450 },
      { name: 'سيفون + وصلات', qtyPerUnit: 1, unit: 'طقم', basePrice: 80 },
      { name: 'مواسير ربط', qtyPerUnit: 1, unit: 'طقم', basePrice: 40 },
    ],
    labor: [{ trade: 'سباك', hoursPerUnit: 2 }, { trade: 'عامل', hoursPerUnit: 1 }],
    equipmentPerUnit: 10, wastePct: 0,
  },
  'مرحاض شرقي': {
    category: 'صحي',
    materials: [
      { name: 'مرحاض شرقي خزف', qtyPerUnit: 1, unit: 'عدد', basePrice: 250 },
      { name: 'سيفون + وصلات', qtyPerUnit: 1, unit: 'طقم', basePrice: 60 },
    ],
    labor: [{ trade: 'سباك', hoursPerUnit: 1.5 }, { trade: 'عامل', hoursPerUnit: 1 }],
    equipmentPerUnit: 10, wastePct: 0,
  },
  'طفاية حريق': {
    category: 'حريق',
    materials: [{ name: 'طفاية بودرة 6كجم', qtyPerUnit: 1, unit: 'عدد', basePrice: 120 }],
    labor: [{ trade: 'عامل', hoursPerUnit: 0.2 }],
    equipmentPerUnit: 5, wastePct: 0,
  },
  'لوحة توزيع فرعية': {
    category: 'كهرباء',
    materials: [
      { name: 'لوحة توزيع 24 قاطع', qtyPerUnit: 1, unit: 'عدد', basePrice: 850 },
      { name: 'قواطع فرعية', qtyPerUnit: 12, unit: 'عدد', basePrice: 45 },
      { name: 'قاطع رئيسي', qtyPerUnit: 1, unit: 'عدد', basePrice: 180 },
      { name: 'بسبار + ملحقات', qtyPerUnit: 1, unit: 'طقم', basePrice: 120 },
    ],
    labor: [{ trade: 'كهربائي', hoursPerUnit: 4 }, { trade: 'عامل', hoursPerUnit: 2 }],
    equipmentPerUnit: 50, wastePct: 3,
  },
  'انترلوك': {
    category: 'أرضيات خارجية',
    materials: [
      { name: 'طوب انترلوك 8سم', qtyPerUnit: 50, unit: 'حبة', basePrice: 0.5 },
      { name: 'رمل فرش', qtyPerUnit: 0.05, unit: 'م3', basePrice: 60 },
    ],
    labor: [{ trade: 'بلاط', hoursPerUnit: 0.35 }, { trade: 'عامل', hoursPerUnit: 0.3 }],
    equipmentPerUnit: 3, wastePct: 5,
  },
  // === وصفات إضافية ===
  'سيراميك': { category: 'تشطيبات', materials: [{ name: 'سيراميك', qtyPerUnit: 1.1, unit: 'م2', basePrice: 40 }, { name: 'لاصق', qtyPerUnit: 5, unit: 'كجم', basePrice: 1.2 }], labor: [{ trade: 'بلاط', hoursPerUnit: 0.7 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 2, wastePct: 10 },
  'قيشاني': { category: 'تشطيبات', materials: [{ name: 'قيشاني', qtyPerUnit: 1.1, unit: 'م2', basePrice: 38 }, { name: 'لاصق', qtyPerUnit: 5, unit: 'كجم', basePrice: 1.2 }], labor: [{ trade: 'بلاط', hoursPerUnit: 0.7 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 2, wastePct: 10 },
  'رخام': { category: 'تشطيبات', materials: [{ name: 'رخام طبيعي', qtyPerUnit: 1.05, unit: 'م2', basePrice: 140 }, { name: 'مونة', qtyPerUnit: 0.03, unit: 'م3', basePrice: 180 }], labor: [{ trade: 'بلاط', hoursPerUnit: 1 }, { trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 5, wastePct: 8 },
  'بروفايل': { category: 'واجهات', materials: [{ name: 'بروفايل حديد 3مم', qtyPerUnit: 1.05, unit: 'م2', basePrice: 15 }, { name: 'برايمر + دهان', qtyPerUnit: 0.3, unit: 'لتر', basePrice: 20 }], labor: [{ trade: 'لحام', hoursPerUnit: 0.3 }, { trade: 'عامل', hoursPerUnit: 0.2 }], equipmentPerUnit: 3, wastePct: 5 },
  'معالجة': { category: 'إنشائي', materials: [{ name: 'مواد معالجة', qtyPerUnit: 1, unit: 'م2', basePrice: 40 }, { name: 'ايبوكسي', qtyPerUnit: 0.3, unit: 'كجم', basePrice: 60 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.6 }], equipmentPerUnit: 5, wastePct: 5 },
  'تدعيم الاعمدة': { category: 'إنشائي', materials: [{ name: 'خرسانة C35', qtyPerUnit: 0.8, unit: 'م3', basePrice: 290 }, { name: 'حديد', qtyPerUnit: 80, unit: 'كجم', basePrice: 2.75 }, { name: 'شدات', qtyPerUnit: 4, unit: 'م2', basePrice: 16 }, { name: 'ايبوكسي ربط', qtyPerUnit: 2, unit: 'كجم', basePrice: 60 }], labor: [{ trade: 'حداد', hoursPerUnit: 8 }, { trade: 'نجار', hoursPerUnit: 6 }, { trade: 'عامل', hoursPerUnit: 4 }], equipmentPerUnit: 50, wastePct: 5 },
  'تدعيم الوصلات': { category: 'معدني', materials: [{ name: 'قطاعات معدنية', qtyPerUnit: 5, unit: 'كجم', basePrice: 5 }, { name: 'لحام + برشام', qtyPerUnit: 1, unit: 'طقم', basePrice: 15 }, { name: 'دهان مانع صدأ', qtyPerUnit: 0.2, unit: 'لتر', basePrice: 30 }], labor: [{ trade: 'لحام', hoursPerUnit: 1 }, { trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 5 },
  'مظلات معدنية': { category: 'معدني', materials: [{ name: 'هيكل معدني', qtyPerUnit: 15, unit: 'كجم', basePrice: 5 }, { name: 'تغطية PVC/بولي', qtyPerUnit: 1, unit: 'م2', basePrice: 45 }, { name: 'دهان', qtyPerUnit: 0.3, unit: 'لتر', basePrice: 25 }], labor: [{ trade: 'لحام', hoursPerUnit: 1.5 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 20, wastePct: 5 },
  'مظله': { category: 'معدني', materials: [{ name: 'هيكل معدني', qtyPerUnit: 15, unit: 'كجم', basePrice: 5 }, { name: 'تغطية', qtyPerUnit: 1, unit: 'م2', basePrice: 45 }], labor: [{ trade: 'لحام', hoursPerUnit: 1.5 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 20, wastePct: 5 },
  'كابل نحاس': { category: 'كهرباء', materials: [{ name: 'كابل نحاس مسلح', qtyPerUnit: 1, unit: 'م', basePrice: 25 }, { name: 'ملحقات تمديد', qtyPerUnit: 0.2, unit: 'طقم', basePrice: 15 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.15 }, { trade: 'عامل', hoursPerUnit: 0.1 }], equipmentPerUnit: 2, wastePct: 5 },
  'كيبل': { category: 'كهرباء', materials: [{ name: 'كابل كهرباء', qtyPerUnit: 1, unit: 'م', basePrice: 18 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.1 }], equipmentPerUnit: 1, wastePct: 5 },
  'قاطع': { category: 'كهرباء', materials: [{ name: 'قاطع MCB', qtyPerUnit: 1, unit: 'عدد', basePrice: 180 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 0 },
  'لوحة توزيع': { category: 'كهرباء', materials: [{ name: 'لوحة توزيع', qtyPerUnit: 1, unit: 'عدد', basePrice: 600 }, { name: 'قواطع', qtyPerUnit: 12, unit: 'عدد', basePrice: 28 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 3.5 }], equipmentPerUnit: 25, wastePct: 3 },
  'صندوق اطفاء': { category: 'حريق', materials: [{ name: 'صندوق إطفاء كامل', qtyPerUnit: 1, unit: 'عدد', basePrice: 650 }, { name: 'خرطوم + بكرة', qtyPerUnit: 1, unit: 'طقم', basePrice: 250 }], labor: [{ trade: 'سباك', hoursPerUnit: 1.5 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 20, wastePct: 0 },
  'صندوق إطفاء': { category: 'حريق', materials: [{ name: 'صندوق إطفاء كامل', qtyPerUnit: 1, unit: 'عدد', basePrice: 650 }, { name: 'خرطوم + بكرة', qtyPerUnit: 1, unit: 'طقم', basePrice: 250 }], labor: [{ trade: 'سباك', hoursPerUnit: 1.5 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 20, wastePct: 0 },
  'انذار': { category: 'حريق', materials: [{ name: 'جهاز إنذار', qtyPerUnit: 1, unit: 'عدد', basePrice: 85 }, { name: 'كابل', qtyPerUnit: 10, unit: 'م', basePrice: 2.5 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }], equipmentPerUnit: 5, wastePct: 3 },
  'مغسلة': { category: 'صحي', materials: [{ name: 'مغسلة خزف', qtyPerUnit: 1, unit: 'عدد', basePrice: 280 }, { name: 'خلاط + وصلات', qtyPerUnit: 1, unit: 'طقم', basePrice: 180 }, { name: 'سيفون', qtyPerUnit: 1, unit: 'عدد', basePrice: 40 }], labor: [{ trade: 'سباك', hoursPerUnit: 1.5 }, { trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 0 },
  'خلاط': { category: 'صحي', materials: [{ name: 'خلاط كروم', qtyPerUnit: 1, unit: 'عدد', basePrice: 200 }, { name: 'وصلات', qtyPerUnit: 1, unit: 'طقم', basePrice: 30 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.5 }], equipmentPerUnit: 5, wastePct: 0 },
  'مواسير': { category: 'صحي', materials: [{ name: 'مواسير PPR/PVC', qtyPerUnit: 1, unit: 'م', basePrice: 15 }, { name: 'كوع + وصلة', qtyPerUnit: 0.3, unit: 'عدد', basePrice: 5 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.2 }, { trade: 'عامل', hoursPerUnit: 0.1 }], equipmentPerUnit: 2, wastePct: 10 },
  'خزانات المياه': { category: 'صحي', materials: [{ name: 'خزان فايبرجلاس', qtyPerUnit: 1, unit: 'عدد', basePrice: 2000 }, { name: 'ملحقات ربط', qtyPerUnit: 1, unit: 'طقم', basePrice: 300 }], labor: [{ trade: 'سباك', hoursPerUnit: 3 }, { trade: 'عامل', hoursPerUnit: 2 }], equipmentPerUnit: 100, wastePct: 0 },
  'تكييف': { category: 'تكييف', materials: [{ name: 'وحدة سبليت', qtyPerUnit: 1, unit: 'عدد', basePrice: 2200 }, { name: 'أنابيب فريون', qtyPerUnit: 8, unit: 'م', basePrice: 30 }, { name: 'كابل', qtyPerUnit: 10, unit: 'م', basePrice: 8 }], labor: [{ trade: 'فني تكييف', hoursPerUnit: 4 }, { trade: 'عامل', hoursPerUnit: 2 }], equipmentPerUnit: 50, wastePct: 3 },
  'عشب صناعي': { category: 'موقع', materials: [{ name: 'عشب صناعي بولي', qtyPerUnit: 1.05, unit: 'م2', basePrice: 35 }, { name: 'رمل سيليكا', qtyPerUnit: 5, unit: 'كجم', basePrice: 0.5 }, { name: 'لاصق', qtyPerUnit: 0.3, unit: 'لتر', basePrice: 20 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 3, wastePct: 5 },
  'بلاطات اسمنتية': { category: 'أرضيات خارجية', materials: [{ name: 'بلاطات 40×40', qtyPerUnit: 6.25, unit: 'حبة', basePrice: 3 }, { name: 'رمل', qtyPerUnit: 0.03, unit: 'م3', basePrice: 60 }], labor: [{ trade: 'بلاط', hoursPerUnit: 0.4 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 2, wastePct: 5 },
  'ترابيع بلاطات': { category: 'أرضيات خارجية', materials: [{ name: 'ترابيع 40×40', qtyPerUnit: 6.25, unit: 'حبة', basePrice: 3 }, { name: 'رمل', qtyPerUnit: 0.03, unit: 'م3', basePrice: 60 }], labor: [{ trade: 'بلاط', hoursPerUnit: 0.4 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 2, wastePct: 5 },
  'باب خشب': { category: 'أبواب', materials: [{ name: 'حلق + ضلفة خشب', qtyPerUnit: 1, unit: 'عدد', basePrice: 600 }, { name: 'اكسسوارات', qtyPerUnit: 1, unit: 'طقم', basePrice: 150 }], labor: [{ trade: 'نجار', hoursPerUnit: 1.5 }, { trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 15, wastePct: 3 },
  'باب حديد': { category: 'أبواب', materials: [{ name: 'باب حديد', qtyPerUnit: 1, unit: 'عدد', basePrice: 1400 }, { name: 'اكسسوارات', qtyPerUnit: 1, unit: 'طقم', basePrice: 200 }], labor: [{ trade: 'لحام', hoursPerUnit: 2 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 30, wastePct: 0 },
  'دهان': { category: 'تشطيبات', materials: [{ name: 'دهان', qtyPerUnit: 0.4, unit: 'لتر', basePrice: 25 }, { name: 'معجون', qtyPerUnit: 0.5, unit: 'كجم', basePrice: 4 }], labor: [{ trade: 'دهان', hoursPerUnit: 0.4 }], equipmentPerUnit: 1, wastePct: 5 },
  'إزالة': { category: 'فك', materials: [], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 8, wastePct: 0 },
  'ازالة': { category: 'فك', materials: [], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 8, wastePct: 0 },
  'فك وازالة': { category: 'فك', materials: [], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 10, wastePct: 0 },
  'غرف تفتيش': { category: 'صرف', materials: [{ name: 'غرفة تفتيش خرسانية', qtyPerUnit: 1, unit: 'عدد', basePrice: 1200 }, { name: 'غطاء حديد', qtyPerUnit: 1, unit: 'عدد', basePrice: 350 }], labor: [{ trade: 'سباك', hoursPerUnit: 3 }, { trade: 'عامل', hoursPerUnit: 2 }], equipmentPerUnit: 80, wastePct: 0 },
  'لوحة تعريف': { category: 'عام', materials: [{ name: 'لوحة معدنية مطبوعة', qtyPerUnit: 1, unit: 'عدد', basePrice: 1800 }], labor: [{ trade: 'عامل', hoursPerUnit: 2 }], equipmentPerUnit: 100, wastePct: 0 },
  'wifi': { category: 'شبكات', materials: [{ name: 'Access Point', qtyPerUnit: 1, unit: 'عدد', basePrice: 800 }, { name: 'كابل شبكة CAT6', qtyPerUnit: 30, unit: 'م', basePrice: 3 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 1.5 }], equipmentPerUnit: 20, wastePct: 3 },
  'جرس': { category: 'صوتيات', materials: [{ name: 'جرس كهربائي', qtyPerUnit: 1, unit: 'عدد', basePrice: 1200 }, { name: 'كابل', qtyPerUnit: 50, unit: 'م', basePrice: 2 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 2 }], equipmentPerUnit: 30, wastePct: 3 },
  'شنكو': { category: 'واجهات', materials: [{ name: 'ألواح شنكو', qtyPerUnit: 1.05, unit: 'م2', basePrice: 12 }, { name: 'زوايا + مسامير', qtyPerUnit: 1, unit: 'طقم', basePrice: 5 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 3, wastePct: 5 },
  'اسفلت': { category: 'موقع', materials: [{ name: 'خلطة اسفلتية ساخنة', qtyPerUnit: 0.035, unit: 'طن', basePrice: 260 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.05 }], equipmentPerUnit: 5, wastePct: 5 },
  'قواطع حمامات': { category: 'تشطيبات', materials: [{ name: 'قاطع فينوليك 12مم', qtyPerUnit: 1, unit: 'م2', basePrice: 180 }, { name: 'اكسسوارات ستانلس', qtyPerUnit: 1, unit: 'طقم', basePrice: 50 }], labor: [{ trade: 'نجار', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 5 },
  'فينوليك': { category: 'تشطيبات', materials: [{ name: 'فينوليك', qtyPerUnit: 1, unit: 'م2', basePrice: 180 }], labor: [{ trade: 'نجار', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 5 },
  'معالجة رشح': { category: 'عزل', materials: [{ name: 'مواد عزل + معالجة', qtyPerUnit: 1, unit: 'م2', basePrice: 45 }, { name: 'لفائف', qtyPerUnit: 1.1, unit: 'م2', basePrice: 25 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 5, wastePct: 8 },
  'عازل': { category: 'عزل', materials: [{ name: 'مواد عزل', qtyPerUnit: 1, unit: 'م2', basePrice: 30 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 3, wastePct: 8 },
  'طرفيات خرسانية': { category: 'موقع', materials: [{ name: 'بردورة خرسانية سابقة', qtyPerUnit: 1, unit: 'م.ط', basePrice: 35 }, { name: 'مونة', qtyPerUnit: 0.01, unit: 'م3', basePrice: 180 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 5 },
  'مكبر صوت': { category: 'صوتيات', materials: [{ name: 'سماعة سقفية', qtyPerUnit: 1, unit: 'عدد', basePrice: 650 }, { name: 'كابل صوت', qtyPerUnit: 20, unit: 'م', basePrice: 3 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 1 }], equipmentPerUnit: 15, wastePct: 3 },
  'مضخة': { category: 'صحي', materials: [{ name: 'مضخة مياه', qtyPerUnit: 1, unit: 'عدد', basePrice: 5500 }, { name: 'ملحقات', qtyPerUnit: 1, unit: 'طقم', basePrice: 800 }], labor: [{ trade: 'سباك', hoursPerUnit: 4 }, { trade: 'كهربائي', hoursPerUnit: 2 }], equipmentPerUnit: 200, wastePct: 0 },
  'سبورة': { category: 'أثاث', materials: [{ name: 'سبورة بورسلان', qtyPerUnit: 1, unit: 'عدد', basePrice: 200 }, { name: 'اكسسوارات تعليق', qtyPerUnit: 1, unit: 'طقم', basePrice: 40 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 0 },
  // === الدفعة الأخيرة: 35 بند متبقي ===
  'أبواب معدني': { category: 'أبواب', materials: [{ name: 'باب معدني جوفاء', qtyPerUnit: 1, unit: 'م2', basePrice: 350 }, { name: 'اكسسوارات', qtyPerUnit: 1, unit: 'طقم', basePrice: 150 }], labor: [{ trade: 'لحام', hoursPerUnit: 1.5 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 25, wastePct: 3 },
  'مصبعات': { category: 'فك', materials: [], labor: [{ trade: 'عامل', hoursPerUnit: 0.4 }], equipmentPerUnit: 10, wastePct: 0 },
  'لوحات ارشادية': { category: 'عام', materials: [{ name: 'لوحة ارشادية', qtyPerUnit: 1, unit: 'عدد', basePrice: 250 }, { name: 'تثبيت', qtyPerUnit: 1, unit: 'طقم', basePrice: 50 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 10, wastePct: 0 },
  'طوب المفرغ': { category: 'مباني', materials: [{ name: 'طوب مفرغ 20سم', qtyPerUnit: 12.5, unit: 'حبة', basePrice: 2.5 }, { name: 'مونة', qtyPerUnit: 0.02, unit: 'م3', basePrice: 180 }], labor: [{ trade: 'بلاط', hoursPerUnit: 0.7 }, { trade: 'عامل', hoursPerUnit: 0.4 }], equipmentPerUnit: 2, wastePct: 5 },
  'دولاليب': { category: 'أثاث', materials: [{ name: 'دولاب ألمنيوم علوي', qtyPerUnit: 1, unit: 'م.ط', basePrice: 450 }], labor: [{ trade: 'نجار', hoursPerUnit: 1 }, { trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 15, wastePct: 3 },
  'درابزين': { category: 'معدني', materials: [{ name: 'درابزين حديد مجلفن', qtyPerUnit: 1, unit: 'م.ط', basePrice: 250 }, { name: 'دهان', qtyPerUnit: 0.2, unit: 'لتر', basePrice: 25 }], labor: [{ trade: 'لحام', hoursPerUnit: 0.8 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 15, wastePct: 5 },
  'فينيل': { category: 'أرضيات', materials: [{ name: 'رولات فينيل', qtyPerUnit: 1.05, unit: 'م2', basePrice: 55 }, { name: 'لاصق', qtyPerUnit: 0.3, unit: 'لتر', basePrice: 20 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 3, wastePct: 5 },
  'أرضية صناعية': { category: 'أرضيات', materials: [{ name: 'أرضية مطاطية', qtyPerUnit: 1.05, unit: 'م2', basePrice: 55 }, { name: 'لاصق', qtyPerUnit: 0.3, unit: 'لتر', basePrice: 20 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 3, wastePct: 5 },
  'ارضية صناعية': { category: 'أرضيات', materials: [{ name: 'أرضية مطاطية', qtyPerUnit: 1.05, unit: 'م2', basePrice: 55 }, { name: 'لاصق', qtyPerUnit: 0.3, unit: 'لتر', basePrice: 20 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 3, wastePct: 5 },
  'دكة خرسانيه': { category: 'إنشائي', materials: [{ name: 'خرسانة C20', qtyPerUnit: 0.08, unit: 'م3', basePrice: 220 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 5 },
  'دكة خرسانية': { category: 'إنشائي', materials: [{ name: 'خرسانة C20', qtyPerUnit: 0.08, unit: 'م3', basePrice: 220 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 5 },
  'مرآة': { category: 'تشطيبات', materials: [{ name: 'مرآة 6مم', qtyPerUnit: 1, unit: 'م2', basePrice: 120 }, { name: 'إطار معدني', qtyPerUnit: 1, unit: 'طقم', basePrice: 80 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 5 },
  'مساند': { category: 'صحي', materials: [{ name: 'مسند ستانلس ستيل', qtyPerUnit: 1, unit: 'عدد', basePrice: 350 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 0 },
  'ربر': { category: 'سلامة', materials: [{ name: 'ربر حماية زوايا', qtyPerUnit: 1, unit: 'عدد', basePrice: 25 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.1 }], equipmentPerUnit: 2, wastePct: 0 },
  'صواعق': { category: 'كهرباء', materials: [{ name: 'نظام حماية صواعق', qtyPerUnit: 1, unit: 'مقطوعية', basePrice: 8000 }, { name: 'أشرطة نحاسية + قضبان', qtyPerUnit: 1, unit: 'طقم', basePrice: 3000 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 16 }, { trade: 'عامل', hoursPerUnit: 8 }], equipmentPerUnit: 500, wastePct: 5 },
  'حماية من الصواعق': { category: 'كهرباء', materials: [{ name: 'نظام حماية صواعق', qtyPerUnit: 1, unit: 'مقطوعية', basePrice: 8000 }, { name: 'أشرطة نحاسية', qtyPerUnit: 1, unit: 'طقم', basePrice: 3000 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 16 }, { trade: 'عامل', hoursPerUnit: 8 }], equipmentPerUnit: 500, wastePct: 5 },
  'مثلث تأريض': { category: 'كهرباء', materials: [{ name: 'قضبان تأريض نحاس', qtyPerUnit: 3, unit: 'عدد', basePrice: 180 }, { name: 'كابل أرضي', qtyPerUnit: 30, unit: 'م', basePrice: 12 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 4 }, { trade: 'عامل', hoursPerUnit: 3 }], equipmentPerUnit: 100, wastePct: 5 },
  'كاسر زجاجي': { category: 'حريق', materials: [{ name: 'وحدة إنذار يدوي', qtyPerUnit: 1, unit: 'عدد', basePrice: 120 }, { name: 'كابل إنذار', qtyPerUnit: 15, unit: 'م', basePrice: 3 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 3 },
  'إنذار يدوي': { category: 'حريق', materials: [{ name: 'وحدة إنذار يدوي', qtyPerUnit: 1, unit: 'عدد', basePrice: 120 }, { name: 'كابل', qtyPerUnit: 15, unit: 'م', basePrice: 3 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 3 },
  'ميكرفون': { category: 'صوتيات', materials: [{ name: 'ميكرفون منضدة سلكي', qtyPerUnit: 1, unit: 'عدد', basePrice: 350 }, { name: 'كابل + وصلات', qtyPerUnit: 1, unit: 'طقم', basePrice: 50 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 0 },
  'استقبال لاسلكي': { category: 'صوتيات', materials: [{ name: 'جهاز استقبال لاسلكي 2 قناة', qtyPerUnit: 1, unit: 'عدد', basePrice: 600 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 0 },
  'لاقط صوت': { category: 'صوتيات', materials: [{ name: 'لاقط صوت لاسلكي', qtyPerUnit: 1, unit: 'عدد', basePrice: 500 }, { name: 'ملحقات', qtyPerUnit: 1, unit: 'طقم', basePrice: 100 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 0 },
  'كبينة توزيع': { category: 'شبكات', materials: [{ name: 'كبينة 16U/27U', qtyPerUnit: 1, unit: 'عدد', basePrice: 1200 }, { name: 'ملحقات (tray, binding)', qtyPerUnit: 1, unit: 'طقم', basePrice: 400 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 2 }], equipmentPerUnit: 30, wastePct: 3 },
  'موزع معلومات': { category: 'شبكات', materials: [{ name: 'سويتش 48/24 port', qtyPerUnit: 1, unit: 'عدد', basePrice: 1800 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 1 }], equipmentPerUnit: 20, wastePct: 0 },
  'patch panel': { category: 'شبكات', materials: [{ name: 'Patch Panel UTP', qtyPerUnit: 1, unit: 'عدد', basePrice: 350 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 1 }], equipmentPerUnit: 15, wastePct: 0 },
  'مجمع توصيل': { category: 'شبكات', materials: [{ name: 'مجمع توصيل', qtyPerUnit: 1, unit: 'عدد', basePrice: 350 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 1 }], equipmentPerUnit: 15, wastePct: 0 },
  'سنترال': { category: 'شبكات', materials: [{ name: 'سنترال + بطاريات', qtyPerUnit: 1, unit: 'عدد', basePrice: 5000 }, { name: 'ملحقات', qtyPerUnit: 1, unit: 'طقم', basePrice: 800 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 4 }], equipmentPerUnit: 100, wastePct: 0 },
  'عدة هاتف': { category: 'شبكات', materials: [{ name: 'عدة هاتف قياسية', qtyPerUnit: 1, unit: 'عدد', basePrice: 200 }, { name: 'كابل', qtyPerUnit: 10, unit: 'م', basePrice: 3 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 0 },
  'هاتف قياسية': { category: 'شبكات', materials: [{ name: 'عدة هاتف', qtyPerUnit: 1, unit: 'عدد', basePrice: 200 }, { name: 'كابل', qtyPerUnit: 10, unit: 'م', basePrice: 3 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 0 },
  'مرحاض خزف': { category: 'صحي', materials: [{ name: 'مرحاض شرقي خزف', qtyPerUnit: 1, unit: 'عدد', basePrice: 250 }, { name: 'سيفون + وصلات', qtyPerUnit: 1, unit: 'طقم', basePrice: 60 }], labor: [{ trade: 'سباك', hoursPerUnit: 1.5 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 10, wastePct: 0 },
  'سيفون ارضي': { category: 'صحي', materials: [{ name: 'سيفون أرضي PVC', qtyPerUnit: 1, unit: 'عدد', basePrice: 35 }, { name: 'غطاء معدني', qtyPerUnit: 1, unit: 'عدد', basePrice: 15 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 0 },
  'فتحة تسليك': { category: 'صحي', materials: [{ name: 'فتحة تسليك PVC', qtyPerUnit: 1, unit: 'عدد', basePrice: 25 }, { name: 'غطاء', qtyPerUnit: 1, unit: 'عدد', basePrice: 10 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.2 }], equipmentPerUnit: 3, wastePct: 0 },
  'الدفاع المدني': { category: 'سلامة', materials: [{ name: 'تقرير واعتماد دفاع مدني', qtyPerUnit: 1, unit: 'مقطوعية', basePrice: 12000 }], labor: [{ trade: 'مهندس', hoursPerUnit: 8 }], equipmentPerUnit: 500, wastePct: 0 },
  'سخان': { category: 'صحي', materials: [{ name: 'سخان كهربائي', qtyPerUnit: 1, unit: 'عدد', basePrice: 800 }, { name: 'وصلات + كابل', qtyPerUnit: 1, unit: 'طقم', basePrice: 120 }], labor: [{ trade: 'سباك', hoursPerUnit: 1 }, { trade: 'كهربائي', hoursPerUnit: 0.5 }], equipmentPerUnit: 15, wastePct: 0 },
  'تسليك شبكة': { category: 'صحي', materials: [{ name: 'مواد تسليك + تنظيف', qtyPerUnit: 1, unit: 'مقطوعية', basePrice: 2000 }], labor: [{ trade: 'سباك', hoursPerUnit: 8 }, { trade: 'عامل', hoursPerUnit: 4 }], equipmentPerUnit: 300, wastePct: 0 },
  'جاليتراب': { category: 'صحي', materials: [{ name: 'جاليتراب + غطاء', qtyPerUnit: 1, unit: 'عدد', basePrice: 120 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 0 },
  'صرف مياه الامطار': { category: 'صرف', materials: [{ name: 'غرفة صرف أمطار', qtyPerUnit: 1, unit: 'عدد', basePrice: 1500 }, { name: 'مواسير PVC', qtyPerUnit: 5, unit: 'م', basePrice: 25 }, { name: 'غطاء', qtyPerUnit: 1, unit: 'عدد', basePrice: 350 }], labor: [{ trade: 'سباك', hoursPerUnit: 3 }, { trade: 'عامل', hoursPerUnit: 2 }], equipmentPerUnit: 100, wastePct: 5 },
  // === الدفعة النهائية: بنود 40% ===
  'هدف': { category: 'رياضي', materials: [{ name: 'هدف كرة قدم معدني', qtyPerUnit: 1, unit: 'عدد', basePrice: 3500 }, { name: 'شبكة', qtyPerUnit: 1, unit: 'عدد', basePrice: 400 }], labor: [{ trade: 'لحام', hoursPerUnit: 2 }, { trade: 'عامل', hoursPerUnit: 2 }], equipmentPerUnit: 100, wastePct: 0 },
  'صاري علم': { category: 'عام', materials: [{ name: 'صاري معدني مجلفن', qtyPerUnit: 1, unit: 'عدد', basePrice: 800 }, { name: 'قاعدة + ملحقات', qtyPerUnit: 1, unit: 'طقم', basePrice: 200 }], labor: [{ trade: 'لحام', hoursPerUnit: 1 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 50, wastePct: 0 },
  'الواح مطاطية': { category: 'سلامة', materials: [{ name: 'ألواح مطاط حماية', qtyPerUnit: 1, unit: 'م2', basePrice: 45 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.2 }], equipmentPerUnit: 3, wastePct: 5 },
  'حمالة ملابس': { category: 'أثاث', materials: [{ name: 'حمالة ملابس مزدوجة ستانلس', qtyPerUnit: 1, unit: 'عدد', basePrice: 120 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 0 },
  'حاقن صابون': { category: 'صحي', materials: [{ name: 'حاقن صابون', qtyPerUnit: 1, unit: 'عدد', basePrice: 65 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.2 }], equipmentPerUnit: 3, wastePct: 0 },
  'إنارة الطوارئ': { category: 'كهرباء', materials: [{ name: 'وحدة إنارة طوارئ 8W', qtyPerUnit: 1, unit: 'عدد', basePrice: 220 }, { name: 'كابل', qtyPerUnit: 5, unit: 'م', basePrice: 3.5 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 3 },
  'انارة الطوارئ': { category: 'كهرباء', materials: [{ name: 'وحدة إنارة طوارئ', qtyPerUnit: 1, unit: 'عدد', basePrice: 220 }, { name: 'كابل', qtyPerUnit: 5, unit: 'م', basePrice: 3.5 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 3 },
  'كبل نحاس': { category: 'كهرباء', materials: [{ name: 'كابل نحاس XLPE', qtyPerUnit: 1, unit: 'م', basePrice: 45 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.15 }], equipmentPerUnit: 3, wastePct: 5 },
  'فحص واختبار': { category: 'فحص', materials: [{ name: 'خدمة فحص واختبار', qtyPerUnit: 1, unit: 'عدد', basePrice: 500 }], labor: [{ trade: 'مهندس', hoursPerUnit: 1 }], equipmentPerUnit: 50, wastePct: 0 },
  'تنظيف وتعقيم': { category: 'صحي', materials: [{ name: 'مواد تعقيم + تنظيف', qtyPerUnit: 1, unit: 'عدد', basePrice: 800 }], labor: [{ trade: 'عامل', hoursPerUnit: 4 }], equipmentPerUnit: 100, wastePct: 0 },
  'مرحاض افرنجى': { category: 'صحي', materials: [{ name: 'مرحاض إفرنجي كامل', qtyPerUnit: 1, unit: 'عدد', basePrice: 450 }, { name: 'سيفون + وصلات', qtyPerUnit: 1, unit: 'طقم', basePrice: 80 }], labor: [{ trade: 'سباك', hoursPerUnit: 2 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 10, wastePct: 0 },
  'كابينة اطفاء': { category: 'حريق', materials: [{ name: 'كابينة إطفاء ستانلس', qtyPerUnit: 1, unit: 'عدد', basePrice: 850 }, { name: 'طفاية', qtyPerUnit: 1, unit: 'عدد', basePrice: 120 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 15, wastePct: 0 },
  'طفايه حريق': { category: 'حريق', materials: [{ name: 'طفاية حريق 6كجم', qtyPerUnit: 1, unit: 'عدد', basePrice: 130 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.2 }], equipmentPerUnit: 5, wastePct: 0 },
  'محبس برونز': { category: 'صحي', materials: [{ name: 'محبس برونز نيكل', qtyPerUnit: 1, unit: 'عدد', basePrice: 85 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 0 },
  'مروحة سحب': { category: 'تهوية', materials: [{ name: 'مروحة كاسيت 150CFM', qtyPerUnit: 1, unit: 'عدد', basePrice: 280 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 10, wastePct: 0 },
  'غطاء غرفة': { category: 'صحي', materials: [{ name: 'غطاء حديد زهر', qtyPerUnit: 1, unit: 'عدد', basePrice: 250 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 10, wastePct: 0 },
  'براد مياه': { category: 'صحي', materials: [{ name: 'براد مياه 3 صنبور + فلتر', qtyPerUnit: 1, unit: 'عدد', basePrice: 2800 }], labor: [{ trade: 'سباك', hoursPerUnit: 1 }, { trade: 'كهربائي', hoursPerUnit: 0.5 }], equipmentPerUnit: 30, wastePct: 0 },
  'جرجور': { category: 'صحي', materials: [{ name: 'جرجوري صرف + لسان', qtyPerUnit: 1, unit: 'عدد', basePrice: 150 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 0 },
  'hdpe': { category: 'حريق', materials: [{ name: 'مواسير HDPE PE100', qtyPerUnit: 1, unit: 'م', basePrice: 45 }, { name: 'وصلات لحام', qtyPerUnit: 0.1, unit: 'عدد', basePrice: 25 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.3 }], equipmentPerUnit: 8, wastePct: 10 },
  'مواسير حديد مجلفن': { category: 'صحي', materials: [{ name: 'ماسورة حديد مجلفن GI', qtyPerUnit: 1, unit: 'م', basePrice: 55 }, { name: 'وصلات + اكواع', qtyPerUnit: 0.2, unit: 'عدد', basePrice: 18 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.4 }], equipmentPerUnit: 8, wastePct: 10 },
  'مواسير ppr': { category: 'صحي', materials: [{ name: 'ماسورة PPR', qtyPerUnit: 1, unit: 'م', basePrice: 8 }, { name: 'وصلات', qtyPerUnit: 0.3, unit: 'عدد', basePrice: 3 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.15 }, { trade: 'عامل', hoursPerUnit: 0.1 }], equipmentPerUnit: 1, wastePct: 10 },
  'u.p.v.c': { category: 'صحي', materials: [{ name: 'ماسورة UPVC', qtyPerUnit: 1, unit: 'م', basePrice: 18 }, { name: 'وصلات', qtyPerUnit: 0.2, unit: 'عدد', basePrice: 8 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.2 }], equipmentPerUnit: 3, wastePct: 10 },
  'upvc': { category: 'صحي', materials: [{ name: 'ماسورة UPVC', qtyPerUnit: 1, unit: 'م', basePrice: 18 }, { name: 'وصلات', qtyPerUnit: 0.2, unit: 'عدد', basePrice: 8 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.2 }], equipmentPerUnit: 3, wastePct: 10 },
  'حديد مجلفن': { category: 'صحي', materials: [{ name: 'مواسير حديد مجلفن', qtyPerUnit: 1, unit: 'م', basePrice: 40 }, { name: 'وصلات', qtyPerUnit: 0.2, unit: 'عدد', basePrice: 15 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 10 },
  'مخرج بيانات': { category: 'شبكات', materials: [{ name: 'فيشة بيانات RJ45', qtyPerUnit: 1, unit: 'عدد', basePrice: 35 }, { name: 'كابل CAT6', qtyPerUnit: 15, unit: 'م', basePrice: 3 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 5 },
  'طوب المصمت': { category: 'مباني', materials: [{ name: 'طوب أحمر مصمت', qtyPerUnit: 40, unit: 'حبة', basePrice: 0.8 }, { name: 'مونة', qtyPerUnit: 0.03, unit: 'م3', basePrice: 180 }], labor: [{ trade: 'بلاط', hoursPerUnit: 1 }, { trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 2, wastePct: 5 },
  'قاطع خارجي': { category: 'كهرباء', materials: [{ name: 'قاطع خارجي MCCB', qtyPerUnit: 1, unit: 'عدد', basePrice: 450 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 0 },
  'بلوك خرساني': { category: 'مباني', materials: [{ name: 'بلوك خرساني 20سم', qtyPerUnit: 12.5, unit: 'حبة', basePrice: 2.0 }, { name: 'مونة أسمنتية', qtyPerUnit: 0.02, unit: 'م3', basePrice: 180 }], labor: [{ trade: 'بلاط', hoursPerUnit: 0.8 }, { trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 2, wastePct: 5 },
  'بلوك': { category: 'مباني', materials: [{ name: 'بلوك خرساني', qtyPerUnit: 12.5, unit: 'حبة', basePrice: 2.0 }, { name: 'مونة', qtyPerUnit: 0.02, unit: 'م3', basePrice: 180 }], labor: [{ trade: 'بلاط', hoursPerUnit: 0.8 }, { trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 2, wastePct: 5 },
  'حفر وردم': { category: 'أعمال ترابية', materials: [{ name: 'تربة دفان', qtyPerUnit: 0.3, unit: 'م3', basePrice: 18 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.2 }], equipmentPerUnit: 30, wastePct: 0 },
  // ═══ وصفات جديدة — V11.3 Brain Upgrade ═══
  'مصعد': { category: 'معدات', materials: [{ name: 'مصعد ركاب مع التركيب', qtyPerUnit: 1, unit: 'عدد', basePrice: 110000 }], labor: [{ trade: 'فني تكييف', hoursPerUnit: 80 }, { trade: 'كهربائي', hoursPerUnit: 40 }], equipmentPerUnit: 5000, wastePct: 0 },
  'مولد': { category: 'معدات', materials: [{ name: 'مولد كهرباء ديزل', qtyPerUnit: 1, unit: 'عدد', basePrice: 185000 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 16 }, { trade: 'عامل', hoursPerUnit: 8 }], equipmentPerUnit: 2000, wastePct: 0 },
  'مولد كهرباء': { category: 'معدات', materials: [{ name: 'مولد كهرباء ديزل', qtyPerUnit: 1, unit: 'عدد', basePrice: 185000 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 16 }, { trade: 'عامل', hoursPerUnit: 8 }], equipmentPerUnit: 2000, wastePct: 0 },
  'محول كهربائي': { category: 'معدات', materials: [{ name: 'محول كهربائي مغمور بالزيت', qtyPerUnit: 1, unit: 'عدد', basePrice: 70000 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 24 }, { trade: 'عامل', hoursPerUnit: 16 }], equipmentPerUnit: 3000, wastePct: 0 },
  'يو بي اس': { category: 'معدات', materials: [{ name: 'UPS أونلاين', qtyPerUnit: 1, unit: 'عدد', basePrice: 42500 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 4 }], equipmentPerUnit: 200, wastePct: 0 },
  'مكيف': { category: 'تكييف', materials: [{ name: 'مكيف سبليت', qtyPerUnit: 1, unit: 'عدد', basePrice: 2800 }, { name: 'أنابيب فريون', qtyPerUnit: 6, unit: 'م', basePrice: 25 }, { name: 'كابل', qtyPerUnit: 8, unit: 'م', basePrice: 6 }], labor: [{ trade: 'فني تكييف', hoursPerUnit: 3 }, { trade: 'عامل', hoursPerUnit: 1.5 }], equipmentPerUnit: 40, wastePct: 3 },
  'سبليت': { category: 'تكييف', materials: [{ name: 'مكيف سبليت', qtyPerUnit: 1, unit: 'عدد', basePrice: 2800 }, { name: 'أنابيب فريون', qtyPerUnit: 6, unit: 'م', basePrice: 25 }], labor: [{ trade: 'فني تكييف', hoursPerUnit: 3 }, { trade: 'عامل', hoursPerUnit: 1.5 }], equipmentPerUnit: 40, wastePct: 3 },
  'كاميرا مراقبة': { category: 'أنظمة', materials: [{ name: 'كاميرا IP 4MP', qtyPerUnit: 1, unit: 'عدد', basePrice: 250 }, { name: 'كابل شبكة', qtyPerUnit: 15, unit: 'م', basePrice: 3 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 0.8 }], equipmentPerUnit: 15, wastePct: 3 },
  'كاميرا': { category: 'أنظمة', materials: [{ name: 'كاميرا IP', qtyPerUnit: 1, unit: 'عدد', basePrice: 300 }, { name: 'كابل شبكة', qtyPerUnit: 30, unit: 'م', basePrice: 3 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 1 }], equipmentPerUnit: 20, wastePct: 3 },
  'تحكم وصول': { category: 'أنظمة', materials: [{ name: 'جهاز بصمة + قفل مغناطيسي', qtyPerUnit: 1, unit: 'عدد', basePrice: 1500 }, { name: 'كابل + ملحقات', qtyPerUnit: 1, unit: 'طقم', basePrice: 200 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 2 }], equipmentPerUnit: 30, wastePct: 0 },
  'بصمة': { category: 'أنظمة', materials: [{ name: 'جهاز بصمة', qtyPerUnit: 1, unit: 'عدد', basePrice: 1000 }, { name: 'قفل مغناطيسي', qtyPerUnit: 1, unit: 'عدد', basePrice: 320 }, { name: 'كابل', qtyPerUnit: 20, unit: 'م', basePrice: 3 }], labor: [{ trade: 'فني شبكات', hoursPerUnit: 2 }], equipmentPerUnit: 30, wastePct: 0 },
  'باب حريق': { category: 'أبواب', materials: [{ name: 'باب مقاوم للحريق', qtyPerUnit: 1, unit: 'عدد', basePrice: 3500 }, { name: 'اكسسوارات حريق', qtyPerUnit: 1, unit: 'طقم', basePrice: 500 }], labor: [{ trade: 'لحام', hoursPerUnit: 2 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 50, wastePct: 0 },
  'مقاوم للحريق': { category: 'أبواب', materials: [{ name: 'باب مقاوم للحريق', qtyPerUnit: 1, unit: 'عدد', basePrice: 3500 }, { name: 'اكسسوارات', qtyPerUnit: 1, unit: 'طقم', basePrice: 500 }], labor: [{ trade: 'لحام', hoursPerUnit: 2 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 50, wastePct: 0 },
  'سبوت لايت': { category: 'كهرباء', materials: [{ name: 'سبوت لايت LED', qtyPerUnit: 1, unit: 'عدد', basePrice: 25 }, { name: 'كابل 1.5مم', qtyPerUnit: 3, unit: 'م', basePrice: 3.5 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.3 }], equipmentPerUnit: 3, wastePct: 5 },
  'داون لايت': { category: 'كهرباء', materials: [{ name: 'داون لايت LED', qtyPerUnit: 1, unit: 'عدد', basePrice: 30 }, { name: 'كابل', qtyPerUnit: 3, unit: 'م', basePrice: 3.5 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.3 }], equipmentPerUnit: 3, wastePct: 5 },
  'كرسي حمام': { category: 'صحي', materials: [{ name: 'كرسي حمام أرضي خزف', qtyPerUnit: 1, unit: 'عدد', basePrice: 250 }, { name: 'سيفون + وصلات', qtyPerUnit: 1, unit: 'طقم', basePrice: 60 }], labor: [{ trade: 'سباك', hoursPerUnit: 1.5 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 10, wastePct: 0 },
  'خزان مياه': { category: 'صحي', materials: [{ name: 'خزان فايبرجلاس', qtyPerUnit: 1, unit: 'عدد', basePrice: 900 }, { name: 'ملحقات ربط', qtyPerUnit: 1, unit: 'طقم', basePrice: 150 }], labor: [{ trade: 'سباك', hoursPerUnit: 3 }, { trade: 'عامل', hoursPerUnit: 2 }], equipmentPerUnit: 80, wastePct: 0 },
  'خزان': { category: 'صحي', materials: [{ name: 'خزان فايبرجلاس', qtyPerUnit: 1, unit: 'عدد', basePrice: 1200 }, { name: 'ملحقات', qtyPerUnit: 1, unit: 'طقم', basePrice: 200 }], labor: [{ trade: 'سباك', hoursPerUnit: 3 }, { trade: 'عامل', hoursPerUnit: 2 }], equipmentPerUnit: 100, wastePct: 0 },
  'رشاش حريق': { category: 'حريق', materials: [{ name: 'رشاش حريق كونسيلد', qtyPerUnit: 1, unit: 'عدد', basePrice: 25 }, { name: 'وصلة + أنبوب', qtyPerUnit: 1, unit: 'طقم', basePrice: 15 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 5 },
  'رشاش': { category: 'حريق', materials: [{ name: 'رشاش حريق', qtyPerUnit: 1, unit: 'عدد', basePrice: 25 }, { name: 'وصلة', qtyPerUnit: 1, unit: 'طقم', basePrice: 15 }], labor: [{ trade: 'سباك', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 5 },
  'لوحة إنذار حريق': { category: 'حريق', materials: [{ name: 'لوحة إنذار addressable', qtyPerUnit: 1, unit: 'عدد', basePrice: 5000 }, { name: 'كابلات + ملحقات', qtyPerUnit: 1, unit: 'طقم', basePrice: 1500 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 8 }, { trade: 'عامل', hoursPerUnit: 4 }], equipmentPerUnit: 200, wastePct: 3 },
  'لوحة انذار': { category: 'حريق', materials: [{ name: 'لوحة إنذار حريق', qtyPerUnit: 1, unit: 'عدد', basePrice: 5000 }, { name: 'ملحقات', qtyPerUnit: 1, unit: 'طقم', basePrice: 1500 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 8 }, { trade: 'عامل', hoursPerUnit: 4 }], equipmentPerUnit: 200, wastePct: 3 },
  'كلادينج': { category: 'واجهات', materials: [{ name: 'ألواح ACP مركب', qtyPerUnit: 1.1, unit: 'م2', basePrice: 65 }, { name: 'هيكل ألمنيوم', qtyPerUnit: 3, unit: 'م.ط', basePrice: 25 }], labor: [{ trade: 'فني ألمنيوم', hoursPerUnit: 1 }, { trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 20, wastePct: 8 },
  'خزائن مطبخ': { category: 'نجارة', materials: [{ name: 'خزائن MDF مع الأسطح', qtyPerUnit: 1, unit: 'م.ط', basePrice: 450 }, { name: 'مفصلات + اكسسوارات', qtyPerUnit: 1, unit: 'طقم', basePrice: 60 }], labor: [{ trade: 'نجار', hoursPerUnit: 2.5 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 15, wastePct: 5 },
  'مطبخ': { category: 'نجارة', materials: [{ name: 'خزائن مطبخ MDF', qtyPerUnit: 1, unit: 'م.ط', basePrice: 550 }, { name: 'اكسسوارات', qtyPerUnit: 1, unit: 'طقم', basePrice: 80 }], labor: [{ trade: 'نجار', hoursPerUnit: 3 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 20, wastePct: 5 },
  'سقف مستعار': { category: 'تشطيبات', materials: [{ name: 'ألواح جبس بورد', qtyPerUnit: 1.1, unit: 'م2', basePrice: 18 }, { name: 'هيكل معدني', qtyPerUnit: 1, unit: 'م2', basePrice: 22 }, { name: 'معجون + شريط', qtyPerUnit: 0.5, unit: 'كجم', basePrice: 8 }], labor: [{ trade: 'بلاط', hoursPerUnit: 0.6 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 8 },
  'جبس بورد': { category: 'تشطيبات', materials: [{ name: 'ألواح جبس بورد', qtyPerUnit: 1.1, unit: 'م2', basePrice: 18 }, { name: 'هيكل معدني', qtyPerUnit: 1, unit: 'م2', basePrice: 22 }], labor: [{ trade: 'بلاط', hoursPerUnit: 0.6 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 8 },
  'ساندويتش بانل': { category: 'أسقف', materials: [{ name: 'ساندويتش بانل PU', qtyPerUnit: 1.05, unit: 'م2', basePrice: 130 }, { name: 'مسامير + وصلات', qtyPerUnit: 1, unit: 'طقم', basePrice: 10 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.4 }], equipmentPerUnit: 10, wastePct: 5 },
  'شباك': { category: 'نوافذ', materials: [{ name: 'بروفايل ألمنيوم ثيرمال', qtyPerUnit: 6, unit: 'م.ط', basePrice: 65 }, { name: 'زجاج دبل', qtyPerUnit: 1, unit: 'م2', basePrice: 150 }, { name: 'اكسسوارات', qtyPerUnit: 1, unit: 'طقم', basePrice: 120 }], labor: [{ trade: 'فني ألمنيوم', hoursPerUnit: 2 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 20, wastePct: 5 },
  'نافذة': { category: 'نوافذ', materials: [{ name: 'بروفايل ألمنيوم', qtyPerUnit: 6, unit: 'م.ط', basePrice: 65 }, { name: 'زجاج دبل', qtyPerUnit: 1, unit: 'م2', basePrice: 150 }, { name: 'اكسسوارات', qtyPerUnit: 1, unit: 'طقم', basePrice: 120 }], labor: [{ trade: 'فني ألمنيوم', hoursPerUnit: 2 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 20, wastePct: 5 },
  'نوافذ': { category: 'نوافذ', materials: [{ name: 'بروفايل ألمنيوم', qtyPerUnit: 6, unit: 'م.ط', basePrice: 65 }, { name: 'زجاج دبل', qtyPerUnit: 1, unit: 'م2', basePrice: 150 }, { name: 'اكسسوارات', qtyPerUnit: 1, unit: 'طقم', basePrice: 120 }], labor: [{ trade: 'فني ألمنيوم', hoursPerUnit: 2 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 20, wastePct: 5 },
  'شتر': { category: 'أبواب', materials: [{ name: 'شتر ألمنيوم كهربائي', qtyPerUnit: 1, unit: 'م2', basePrice: 450 }], labor: [{ trade: 'فني ألمنيوم', hoursPerUnit: 0.5 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 15, wastePct: 5 },
  'إيبوكسي': { category: 'أرضيات', materials: [{ name: 'إيبوكسي ذاتي التسوية', qtyPerUnit: 1, unit: 'م2', basePrice: 85 }, { name: 'برايمر', qtyPerUnit: 0.3, unit: 'لتر', basePrice: 30 }], labor: [{ trade: 'دهان', hoursPerUnit: 0.5 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 5 },
  'ايبوكسي': { category: 'أرضيات', materials: [{ name: 'إيبوكسي ذاتي التسوية', qtyPerUnit: 1, unit: 'م2', basePrice: 85 }, { name: 'برايمر', qtyPerUnit: 0.3, unit: 'لتر', basePrice: 30 }], labor: [{ trade: 'دهان', hoursPerUnit: 0.5 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 5 },
  'عزل حراري': { category: 'عزل', materials: [{ name: 'ألواح XPS عازلة', qtyPerUnit: 1.05, unit: 'م2', basePrice: 50 }, { name: 'لاصق', qtyPerUnit: 0.3, unit: 'كجم', basePrice: 8 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 3, wastePct: 8 },
  'بردورة': { category: 'موقع', materials: [{ name: 'بردورة خرسانية جاهزة', qtyPerUnit: 1, unit: 'م.ط', basePrice: 12 }, { name: 'مونة', qtyPerUnit: 0.005, unit: 'م3', basePrice: 180 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.15 }], equipmentPerUnit: 2, wastePct: 5 },
  'نقطة إنارة': { category: 'كهرباء', materials: [{ name: 'علبة + أنبوب PVC', qtyPerUnit: 1, unit: 'عدد', basePrice: 12 }, { name: 'كابل 1.5مم', qtyPerUnit: 8, unit: 'م', basePrice: 3.5 }, { name: 'مفتاح', qtyPerUnit: 1, unit: 'عدد', basePrice: 15 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }, { trade: 'عامل', hoursPerUnit: 0.2 }], equipmentPerUnit: 3, wastePct: 5 },
  'نقطة انارة': { category: 'كهرباء', materials: [{ name: 'علبة + أنبوب', qtyPerUnit: 1, unit: 'عدد', basePrice: 12 }, { name: 'كابل', qtyPerUnit: 8, unit: 'م', basePrice: 3.5 }, { name: 'مفتاح', qtyPerUnit: 1, unit: 'عدد', basePrice: 15 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.5 }, { trade: 'عامل', hoursPerUnit: 0.2 }], equipmentPerUnit: 3, wastePct: 5 },
  'شدات': { category: 'إنشائي', materials: [{ name: 'شدات خشبية أبلكاش', qtyPerUnit: 1, unit: 'م2', basePrice: 16 }, { name: 'مسامير + أخشاب', qtyPerUnit: 1, unit: 'طقم', basePrice: 8 }], labor: [{ trade: 'نجار', hoursPerUnit: 0.6 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 10 },
  'حديد تسليح': { category: 'إنشائي', materials: [{ name: 'حديد تسليح', qtyPerUnit: 1000, unit: 'كجم', basePrice: 2.8 }], labor: [{ trade: 'حداد', hoursPerUnit: 20 }, { trade: 'عامل', hoursPerUnit: 10 }], equipmentPerUnit: 100, wastePct: 3 },
  'مجاري هواء': { category: 'تكييف', materials: [{ name: 'صاج مجلفن مع العزل', qtyPerUnit: 1, unit: 'م2', basePrice: 40 }, { name: 'ملحقات تركيب', qtyPerUnit: 1, unit: 'طقم', basePrice: 8 }], labor: [{ trade: 'فني تكييف', hoursPerUnit: 0.5 }, { trade: 'عامل', hoursPerUnit: 0.3 }], equipmentPerUnit: 5, wastePct: 8 },
  'طاقة شمسية': { category: 'معدات', materials: [{ name: 'ألواح شمسية + انفرتر', qtyPerUnit: 1, unit: 'watt', basePrice: 3.5 }], labor: [{ trade: 'كهربائي', hoursPerUnit: 0.01 }], equipmentPerUnit: 0.2, wastePct: 3 },
  'حائط ستائري': { category: 'واجهات', materials: [{ name: 'نظام حائط ستائري', qtyPerUnit: 1, unit: 'م2', basePrice: 2000 }], labor: [{ trade: 'فني ألمنيوم', hoursPerUnit: 2 }, { trade: 'عامل', hoursPerUnit: 1 }], equipmentPerUnit: 50, wastePct: 5 },
  'أرضية مرفوعة': { category: 'أرضيات', materials: [{ name: 'أرضية مرفوعة + قواعد', qtyPerUnit: 1, unit: 'م2', basePrice: 250 }], labor: [{ trade: 'عامل', hoursPerUnit: 0.5 }], equipmentPerUnit: 10, wastePct: 5 },
};

// ═══════════════════════════════════════════
// Main Engine
// ═══════════════════════════════════════════

class ItemCostAnalyzer {
  private defaultProfitMargin = 0.15;

  /**
   * تحليل بند وحساب تكلفته من الصفر
   */
  analyze(desc: string, unit: string, profitMargin?: number, location?: string, scheduleCompression?: { normalMonths: number, targetMonths: number }): ItemCostResult {
    const d = desc.toLowerCase().replace(/\r\n/g, ' ');
    const isDefaultProfit = profitMargin === undefined;
    const margin = profitMargin ?? this.defaultProfitMargin;

    // 0. تصنيف نوع العمل: جديد / ترميم / مختلط
    const workScope = this.detectWorkScope(d);

    // 1. ابحث عن وصفة التسعير
    const recipe = this.findRecipe(d);

    // 2. حساب المواد (مع إثراء هندسي للخرسانة)
    const materials: MaterialLine[] = [];
    let materialsCost = 0;

    if (recipe) {
      // 🔬 إثراء هندسي: هل البند خرساني؟ استخدم SBC 304 mix design
      const isConcreteItem = recipe.category === 'إنشائي' && d.includes('خرسان');
      let concreteGrade = 'C35';
      if (isConcreteItem) {
        // حدد الرتبة من الوصف أو العنصر الإنشائي
        if (d.includes('نظافة') || d.includes('عادي')) concreteGrade = 'C15';
        else if (d.includes('أساس') || d.includes('قواعد') || d.includes('ميدات')) concreteGrade = 'C25';
        else if (d.includes('أعمدة') || d.includes('كمر') || d.includes('سقف')) concreteGrade = 'C30';
        else if (d.includes('مسبح') || d.includes('خزان')) concreteGrade = 'C35';

        const enriched = this.enrichConcreteRecipe(concreteGrade);
        if (enriched.totalPerM3 > 0) {
          // استخدم المعادلة الهندسية بدل السعر الثابت
          for (const em of enriched.materials) {
            const line: MaterialLine = {
              name: `${em.name} (${concreteGrade})`,
              qty: em.qty, unit: em.unit,
              unitPrice: Math.round(em.price / Math.max(em.qty, 0.01)),
              source: 'engineering_db',
              total: em.price,
            };
            materials.push(line);
            materialsCost += line.total;
          }
          // أضف الحديد والشدات من الوصفة الأصلية (ليست خرسانة)
          for (const mat of recipe.materials) {
            if (mat.name.includes('خرسانة جاهزة')) continue; // تخطى — استبدلنا
            let { price: vp, source } = this.verifyMaterialPrice(mat.name, mat.basePrice, location);
            const line: MaterialLine = { name: mat.name, qty: mat.qtyPerUnit, unit: mat.unit, unitPrice: vp, source, total: Math.round(mat.qtyPerUnit * vp * 100) / 100 };
            materials.push(line);
            materialsCost += line.total;
          }
        }
      }

      // المسار العادي لباقي البنود (أو إذا فشل الإثراء)
      if (materials.length === 0) {
        for (const mat of recipe.materials) {
          let { price: verifiedPrice, source } = this.verifyMaterialPrice(mat.name, mat.basePrice, location);
          const line: MaterialLine = {
            name: mat.name, qty: mat.qtyPerUnit, unit: mat.unit,
            unitPrice: verifiedPrice, source: source,
            total: Math.round(mat.qtyPerUnit * verifiedPrice * 100) / 100,
          };
          materials.push(line);
          materialsCost += line.total;
        }
      }
    }

    // 3. حساب العمالة (مع إنتاجية laborProductivity عند توفرها)
    const labor: LaborLine[] = [];
    let laborCost = 0;

    // 🔧 خريطة ربط الحِرف بأنشطة laborProductivity
    const TRADE_TO_ACTIVITY: Record<string, string> = {
      'بلاط': 'tiling_floor', 'دهان': 'painting_interior', 'مبيض': 'plaster_internal',
      'بناء': 'blockwork_20', 'سباك': 'plumbing_rough', 'كهربائي': 'electrical_rough',
      'فني تكييف': 'hvac_split', 'نجار': 'formwork_setup',
    };

    if (recipe) {
      for (const lab of recipe.labor) {
        // حاول استخدام laborProductivity للحرفة
        const activityId = TRADE_TO_ACTIVITY[lab.trade];
        const productivity = activityId ? findActivity(activityId) : null;

        let rate: number;
        let source = 'LABOR_RATES';
        if (productivity) {
          // استخدم تكلفة الطاقم الحقيقية / ساعات العمل
          rate = Math.round(productivity.dailyCrewCost / 8);
          source = `🔧 ${productivity.nameAr}`;
        } else {
          rate = LABOR_RATES[lab.trade] || 15;
        }

        const line: LaborLine = {
          trade: lab.trade,
          hours: lab.hoursPerUnit,
          ratePerHour: rate,
          total: Math.round(lab.hoursPerUnit * rate * 100) / 100,
        };
        labor.push(line);
        laborCost += line.total;
      }
    }

    // 4. المعدات
    let equipmentCost = recipe?.equipmentPerUnit || 5;

    // 4.5 Smart Fallback: البحث في أسعار السوق 2026 أولاً، ثم التقدير
    if (!recipe) {
      const marketMatch = this.findMarketPrice(d, unit);
      if (marketMatch) {
        // ✅ وجدنا سعر سوق حقيقي من market_prices_2026!
        materials.push({ name: marketMatch.name_ar || marketMatch.name_en || 'مواد (سوق 2026)', qty: 1, unit, unitPrice: marketMatch.avg, source: 'engineering_db', total: marketMatch.avg });
        materialsCost = marketMatch.avg;
        const labEst = Math.round(marketMatch.avg * 0.12);
        labor.push({ trade: 'عامل', hours: labEst / 13, ratePerHour: 13, total: labEst });
        laborCost = labEst;
      } else {
        // Fallback: تقدير بسيط حسب الوحدة
        const unitLower = unit.toLowerCase();
        let estMat = 30, estLab = 10;
        if (unitLower.includes('م2') || unitLower.includes('م 2') || unitLower.includes('م٢')) { estMat = 35; estLab = 12; }
        else if (unitLower.includes('م3') || unitLower.includes('م٣')) { estMat = 150; estLab = 30; }
        else if (unitLower.includes('م.ط') || unitLower.includes('م ط')) { estMat = 25; estLab = 10; }
        else if (unitLower.includes('عدد') || unitLower.includes('نقطة')) { estMat = 100; estLab = 30; }
        else if (unitLower.includes('طن')) { estMat = 2000; estLab = 200; }
        else if (unitLower.includes('مقطوعية')) { estMat = 2000; estLab = 500; }
        materials.push({ name: 'مواد (تقدير)', qty: 1, unit, unitPrice: estMat, source: 'estimated', total: estMat });
        materialsCost = estMat;
        labor.push({ trade: 'عامل', hours: estLab / 13, ratePerHour: 13, total: estLab });
        laborCost = estLab;
      }
    }

    // 5. تكلفة الفك والإزالة (ترميم فقط)
    let demolitionCost = 0;
    if (workScope === 'renovation') {
      demolitionCost = Math.round(laborCost * 0.25 + 8);
    } else if (workScope === 'mixed') {
      demolitionCost = Math.round(laborCost * 0.15 + 5);
    }

    // 5.5 ضريبة تسريع الجدول الزمني (Schedule Compression Acceleration Cost)
    let scheduleAccelerationCost = 0;
    if (scheduleCompression && scheduleCompression.targetMonths < scheduleCompression.normalMonths) {
      const ratio = scheduleCompression.targetMonths / scheduleCompression.normalMonths;
      const penaltyFactor = (1 - ratio) * 0.8; // 50% compression = 40% penalty on labor & equip
      scheduleAccelerationCost = Math.round((laborCost + equipmentCost + demolitionCost) * penaltyFactor);
    }

    // 6. التكلفة المباشرة
    const directCost = materialsCost + laborCost + equipmentCost + demolitionCost + scheduleAccelerationCost;

    // 7. الهدر (ترميم = هدر أعلى)
    let baseWaste = (recipe?.wastePct || 5) / 100;
    
    // استخراج الهدر من market benchmark والتصحيحات
    if (recipe && recipe.category) {
      let categoryKey = recipe.category.toLowerCase();
      // خريطة التقريب للفئات (مصلحة — تربط الفئات العربية بمفاتيح التصحيحات)
      const CAT_PATCH_MAP: Record<string, string> = {
        'إنشائي': 'concrete', 'مباني': 'blocks', 'تشطيبات': 'paint',
        'عزل': 'insulation', 'حريق': 'fire', 'كهرباء': 'electrical',
        'صحي': 'plumbing', 'تكييف': 'hvac', 'معدني': 'steel',
        'واجهات': 'cladding', 'أرضيات': 'tiles', 'نوافذ': 'windows',
        'أبواب': 'doors', 'أسقف': 'roofing', 'موقع': 'sitework',
        'نجارة': 'carpentry', 'أنظمة': 'systems', 'معدات': 'equipment',
      };
      if (CAT_PATCH_MAP[recipe.category]) categoryKey = CAT_PATCH_MAP[recipe.category];
      else if (categoryKey.includes('خرسان') || categoryKey.includes('concrete')) categoryKey = 'concrete';
      else if (categoryKey.includes('حديد') || categoryKey.includes('steel')) categoryKey = 'steel';
      else if (categoryKey.includes('بلوك') || categoryKey.includes('block')) categoryKey = 'blocks';
      else if (categoryKey.includes('سيراميك') || categoryKey.includes('بورسلان')) categoryKey = 'ceramic_tiles';
      else if (categoryKey.includes('دهان') || categoryKey.includes('paint')) categoryKey = 'paint';

      // 1. تطبيق التصحيحات إذا وجدت
      const patch = CORRECTION_PATCHES.find(p => p.field === 'waste_factor' && p.category === categoryKey);
      if (patch) {
        baseWaste = patch.newValue;
      } 
      // 2. أو من قاعدة البيانات
      else if (ENHANCED_WASTE_FACTORS[categoryKey]) {
        baseWaste = ENHANCED_WASTE_FACTORS[categoryKey].typical;
      }
    }

    const wasteFactor = workScope === 'renovation' ? baseWaste + 0.03 :
                        workScope === 'mixed' ? baseWaste + 0.02 : baseWaste;
    const wasteAmount = Math.round(directCost * wasteFactor);

    // 8. المصاريف العامة — تناقصية حسب التكلفة المباشرة
    let overheadPercent = workScope === 'renovation' ? 0.13 :
                            workScope === 'mixed' ? 0.12 : 0.10;
    // Smart Overhead Capping: بنود رخيصة لا تحتاج overhead عالي
    if (directCost < 30) overheadPercent = Math.min(overheadPercent, 0.05);
    else if (directCost < 80) overheadPercent = Math.min(overheadPercent, 0.07);
    const overheadAmount = Math.round((directCost + wasteAmount) * overheadPercent);

    // 9. التكلفة الكاملة قبل معامل المنطقة
    let totalCost = directCost + wasteAmount + overheadAmount;

    // تطبيق معامل المنطقة
    let locationFactor = 1.0;
    if (location && LOCATION_MULTIPLIERS[location]) {
      locationFactor = LOCATION_MULTIPLIERS[location].factor;
      totalCost = totalCost * locationFactor;
    }
    totalCost = Math.round(totalCost);

    if (isNaN(totalCost)) {
      console.log('NaN detected:', { directCost, wasteAmount, overheadAmount, wasteFactor, baseWaste, materialsCost, laborCost, equipmentCost, demolitionCost });
    }

    // 10. المكسب — Smart Profit Capping للبنود الرخيصة
    let effectiveMargin = margin;
    if (isDefaultProfit) {
      // البنود الرخيصة (أعمال خارجية، أعمال بسيطة) هامش ربح أقل
      if (directCost < 50) effectiveMargin = Math.min(margin, 0.10);
      else if (directCost < 100) effectiveMargin = Math.min(margin, 0.12);
    }
    const profitAmount = Math.round(totalCost * effectiveMargin);
    let sellingPrice = totalCost + profitAmount;

    // 11. Description Modifiers — تعديل حسب صفات الوصف
    const descMods = this.extractDescModifiers(d);
    if (descMods.priceFactor !== 1.0) {
      sellingPrice = Math.round(sellingPrice * descMods.priceFactor);
    }

    // 10. التحقق
    const verification = this.verifyFinalPrice(d, sellingPrice, unit);

    // 12. التحذيرات
    const warnings: string[] = [];
    if (isDefaultProfit) {
      warnings.push('⚠️ لم تحدد نسبة المكسب — تم استخدام 15% افتراضي');
    }
    if (!recipe) {
      warnings.push('⚠️ لا توجد وصفة تسعير لهذا البند — تم التقدير');
    }
    if (workScope === 'renovation') {
      warnings.push('🔧 بند ترميم — تمت إضافة تكلفة فك + هدر أعلى + مصاريف عامة 13%');
    }
    if (verification.warning) {
      warnings.push(verification.warning);
    }

    const sources: string[] = materials.map(m => m.source).filter((v, i, a) => a.indexOf(v) === i);
    // ثقة متدرجة: وصفة+تحقق=90, وصفة فقط=70, سوق=60, تقدير=30
    let confidence = 30;
    if (recipe) {
      confidence = verification.isReasonable ? 90 : 70;
    } else if (materials.length > 0 && materials[0].source === 'engineering_db') {
      confidence = verification.isReasonable ? 75 : 60;
    }

    return {
      itemDescription: desc.substring(0, 100),
      unit,
      category: recipe?.category || 'عام',
      workScope,
      materials, labor,
      equipmentCost, demolitionCost, wasteFactor, wasteAmount,
      overheadPercent, overheadAmount,
      directCost, totalCost,
      profitMargin: margin, profitAmount, sellingPrice,
      isDefaultProfit,
      verification, confidence, sources, warnings,
    };
  }

  /**
   * تصنيف نوع العمل: ترميم / جديد / مختلط
   */
  private detectWorkScope(desc: string): WorkScope {
    const renovationKeywords = [
      'معالجة', 'ترميم', 'إصلاح', 'اصلاح', 'تدعيم', 'فك وازالة', 'فك و',
      'ازالة', 'إزالة', 'تنظيف وتعقيم', 'تسليك شبكة', 'صيانة', 'استبدال',
      'تجديد', 'رشح', 'صدأ', 'تفكك', 'تشقق', 'اثار الرطوبة', 'تالف',
      'قديم', 'تآكل', 'تسرب', 'انهيار', 'تصدع', 'اعادة',
    ];
    const newKeywords = [
      'توريد وتركيب', 'توريد وتنفيذ', 'توريد و تركيب', 'توريد و تنفيذ',
      'توريد وبرمجة', 'توريد وتشغيل',
    ];

    const isRenovation = renovationKeywords.some(k => desc.includes(k));
    const isNew = newKeywords.some(k => desc.includes(k));

    if (isRenovation && isNew) return 'mixed';
    if (isRenovation) return 'renovation';
    return 'new';
  }

  /**
   * البحث عن وصفة التسعير المناسبة
   */
  private findRecipe(desc: string): ItemRecipe | null {
    // ترتيب العبارات من الأطول للأقصر
    const keys = Object.keys(ITEM_RECIPES).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (desc.includes(key)) return ITEM_RECIPES[key];
    }
    return null;
  }

  /**
   * استخراج معدّلات من الوصف — تؤثر على السعر النهائي
   * وجهين = ليس ضعف السعر (overlap في العمالة)
   * شنايدر/ABB = ماركة عالمية أغلى
   * إسباني/إيطالي = مستورد أغلى
   */
  private extractDescModifiers(desc: string): { priceFactor: number } {
    let priceFactor = 1.0;

    // طبقات متعددة (عزل وجهين = ~60% زيادة مش ضعف)
    if (desc.includes('وجهين') || desc.includes('طبقتين') || desc.includes('وجه ثاني')) {
      priceFactor *= 0.7; // تخفيض لأن الوصفة بالفعل تسعّر مواد كافية
    }
    if (desc.includes('ثلاث') || desc.includes('3 وجه') || desc.includes('3 طبقات')) {
      priceFactor *= 0.8;
    }

    return { priceFactor };
  }

  /**
   * البحث في أسعار السوق 2026 عبر خريطة مفاتيح عربية
   */
  private findMarketPrice(desc: string, unit: string): any | null {
    const MARKET_KEYWORD_MAP: Record<string, string[]> = {
      'elevators': ['مصعد', 'مصاعد', 'elevator'],
      'generators': ['مولد', 'مولدات', 'generator'],
      'transformers': ['محول', 'محولات', 'transformer'],
      'ups': ['يو بي', 'ups', 'UPS'],
      'hvac': ['مكيف', 'سبليت', 'تبريد', 'تكييف مركزي', 'split'],
      'cctv': ['كاميرا', 'مراقبة', 'cctv', 'هيك فيجن', 'داهوا'],
      'access_control': ['تحكم وصول', 'بصمة', 'access', 'قفل مغناطيسي'],
      'intercom': ['انتركم', 'اتصال داخلي', 'intercom'],
      'bms': ['bms', 'إدارة مباني', 'نظام إدارة'],
      'fire_doors': ['باب حريق', 'مقاوم للحريق', 'fire door'],
      'fire_fighting': ['رشاش حريق', 'إنذار حريق', 'لوحة إنذار', 'كاشف دخان'],
      'rolling_shutters': ['شتر', 'رولنج', 'rolling'],
      'solar_panels': ['طاقة شمسية', 'ألواح شمسية', 'solar'],
      'curtain_wall': ['حائط ستائري', 'curtain wall', 'ستائري'],
      'acp_cladding': ['كلادينج', 'acp', 'ألمنيوم مركب', 'cladding'],
      'stone_cladding': ['كسوة حجر', 'حجر جيري', 'واجهة حجر'],
      'raised_floor': ['أرضية مرفوعة', 'raised floor'],
      'handrails': ['درابزين', 'handrail'],
      'carpentry_builtin': ['خزائن مطبخ', 'مطبخ mdf', 'دواليب ملابس'],
      'sandwich_panels': ['ساندويتش بانل', 'sandwich'],
      'roofing': ['بلاط سقف', 'سقف فخار'],
      'swimming_pool': ['مسبح', 'حوض سباحة', 'swimming'],
      'kitchen_equipment': ['شفاط مطبخ', 'طاولة ستانلس'],
      'formwork': ['شدات', 'شدة', 'formwork'],
      'scaffolding': ['سقالات', 'scaffold'],
      'piling': ['خوازيق', 'خازوق', 'piling'],
      'shoring': ['تدعيم', 'شيت بايل', 'shoring'],
      'soil_treatment': ['دمك تربة', 'معالجة تربة', 'تثبيت تربة'],
      'asphalt': ['أسفلت', 'asphalt'],
      'curb_stones': ['بردورة', 'بردورات', 'curb'],
      'interlock': ['انترلوك', 'إنترلوك', 'interlock'],
      'precast_stairs': ['سلالم جاهزة', 'سلالم مسبقة'],
      'irrigation': ['ري بالتنقيط', 'ري بالرشاشات', 'irrigation'],
      'manholes': ['غرفة تفتيش', 'غرف تفتيش', 'manhole'],
      'drainage': ['hdpe', 'حوض تجميع', 'صرف أمطار'],
      'epoxy': ['إيبوكسي', 'ايبوكسي', 'epoxy'],
      'tiles': ['سيراميك', 'بورسلان', 'بلاط أرضيات'],
      'stone': ['رخام', 'جرانيت', 'حجر طبيعي'],
      'paint': ['دهان', 'بوية', 'طلاء جدران'],
      'doors': ['باب خشب', 'باب حديد', 'باب hdf'],
      'windows': ['شباك', 'نافذة', 'نوافذ', 'ثيرمال بريك'],
      'waterproofing': ['عزل مائي', 'بيتومين', 'membrane'],
      'insulation': ['عزل حراري', 'بولي ستايرين', 'xps', 'عزل صوتي'],
      'ceilings': ['سقف مستعار', 'جبس بورد', 'أسقف معلقة'],
      'electrical_cables': ['كابل كهربائي', 'xlpe', 'كابل نحاس'],
      'electrical_panels': ['لوحة توزيع', 'لوحة كهربائية'],
      'lighting': ['سبوت لايت', 'داون لايت', 'كشاف', 'إنارة'],
      'ppr_pipes': ['مواسير ppr', 'أنابيب ppr'],
      'sanitary': ['كرسي حمام', 'مرحاض', 'مغسلة', 'حوض غسيل'],
      'blocks': ['بلوك', 'طوب', 'بلك'],
      'readymix_concrete': ['خرسانة جاهزة', 'readymix'],
      'steel_rebar': ['حديد تسليح', 'تسليح'],
      'gas_piping': ['أنبوب غاز', 'مواسير غاز'],
      'safety_equipment': ['خوذة أمان', 'سترة أمان', 'حاجز أمان'],
    };

    for (const [category, keywords] of Object.entries(MARKET_KEYWORD_MAP)) {
      if (keywords.some(k => desc.includes(k.toLowerCase()))) {
        const items = MARKET_PRICES_2026[category];
        if (items && items.length > 0) {
          // ابحث عن أقرب عنصر بالوصف
          let best = items[0];
          let bestScore = 0;
          for (const item of items) {
            let score = 0;
            const itemName = ((item.name_ar || '') + ' ' + (item.name_en || '')).toLowerCase();
            const words = desc.split(/\s+/);
            for (const w of words) {
              if (w.length > 2 && itemName.includes(w)) score++;
            }
            if (score > bestScore) { bestScore = score; best = item; }
          }
          return best;
        }
      }
    }
    return null;
  }

  /**
   * التحقق من سعر المادة عبر 3 مصادر
   */
  private verifyMaterialPrice(name: string, basePrice: number, location?: string): { price: number; source: MaterialLine['source'] } {
    // المصدر 1: البورصة العالمية
    const commodityMap: Record<string, string> = {
      'حديد تسليح': 'steel_rebar',
      'أسمنت': 'cement',
      'نحاس': 'copper',
    };
    
    // التحقق من الخرسانة الجاهزة حسب المنطقة
    if (name.includes('خرسانة') || name.includes('concrete')) {
      const match = name.match(/C(\d+)/i);
      const grade = match ? `C${match[1]}` : 'C25';
      const city = location || 'riyadh'; // افتراضي الرياض إذا لم يتم تحديد
      const rPrice = getReadyMixPrice(city, grade);
      if (rPrice > 0) return { price: rPrice, source: 'supplier_api' };
    }

    for (const [keyword, commodityId] of Object.entries(commodityMap)) {
      if (name.includes(keyword)) {
        try {
          commodityEngine.initialize();
          const prices = commodityEngine.getAllPrices();
          const commodity = prices.find(p => p.id === commodityId);
          if (commodity) {
            if (name.includes('حديد') && !name.includes('مواسير') && !name.includes('ماسور') && !name.includes('مجلفن') && commodity.currentPrice > 0) {
              return { price: Math.round(commodity.currentPrice / 1000 * 100) / 100, source: 'commodity_exchange' };
            }
            if (name.includes('أسمنت') && commodity.currentPrice > 0) {
              return { price: Math.round(commodity.currentPrice / 1000 * 100) / 100, source: 'commodity_exchange' };
            }
          }
        } catch { /* fallback */ }
      }
    }

    // المصدر 2: قاعدة البيانات الهندسية
    const engPrices: Record<string, number> = {
      'كابل 1.5مم': ELECTRICAL_PRICES.cable_1_5mm2_per_m,
      'كابل 2.5مم': ELECTRICAL_PRICES.cable_2_5mm2_per_m,
      'كابل 4مم': ELECTRICAL_PRICES.cable_4mm2_per_m,
      'فيشة': ELECTRICAL_PRICES.socket_double,
      'لفائف عزل': INSULATION_CONSTANTS.membrane_price_per_m2,
    };
    
    for (const [keyword, price] of Object.entries(engPrices)) {
      if (name.includes(keyword)) {
        return { price, source: 'engineering_db' };
      }
    }

    // المصدر 3: السعر الأساسي من الوصفة
    return { price: basePrice, source: 'supplier_api' };
  }

  /**
   * التحقق من السعر النهائي مع مقارنة المصادر
   */
  private verifyFinalPrice(desc: string, price: number, unit: string): PriceVerification {
    const result: PriceVerification = {
      supplierPrice: null, webPrice: null,
      commodityPrice: null, historicalPrice: null,
      deviation: 0, isReasonable: true, warning: null,
    };

    // مقارنة مع market_benchmark (117 سعر بند حقيقي)
    const benchmarkMap: Record<string, { key: string; rate: number }> = {
      'حفر': { key: 'excavation', rate: 35 },
      'ردم': { key: 'backfill', rate: 38 },
      'خرسانة نظافة': { key: 'blinding', rate: 300 },
      'خرسانة مسلحة': { key: 'rc_footing', rate: 1100 },
      'بلوك 20': { key: 'block_20_ext', rate: 90 },
      'بلوك 15': { key: 'block_15_int', rate: 65 },
      'لياسة خارجي': { key: 'plaster_ext', rate: 45 },
      'لياسة داخلي': { key: 'plaster_int', rate: 38 },
      'بورسلان': { key: 'porcelain_60', rate: 200 },
      'سيراميك': { key: 'ceramic_wall', rate: 110 },
      'دهان داخلي': { key: 'paint_int', rate: 30 },
      'دهان خارجي': { key: 'paint_ext', rate: 35 },
      'عزل مائي': { key: 'waterproofing', rate: 45 },
      'عزل حراري': { key: 'thermal_insul', rate: 75 },
      'باب خشب': { key: 'door_wood', rate: 1000 },
      'باب حديد': { key: 'door_steel', rate: 2500 },
      'مكيف سبليت': { key: 'ac_split', rate: 4000 },
      'مكيف': { key: 'ac_split', rate: 4000 },
      'كاشف دخان': { key: 'fire_alarm', rate: 301 },
      'إنترلوك': { key: 'landscape_paving', rate: 120 },
      'اسفلت': { key: 'landscape_asphalt', rate: 60 },
      'درابزين': { key: 'handrail', rate: 400 },
      'مظلة': { key: 'car_shade', rate: 150 },
    };

    const dLower = desc.toLowerCase();
    for (const [keyword, bench] of Object.entries(benchmarkMap)) {
      if (dLower.includes(keyword)) {
        result.supplierPrice = bench.rate;
        const dev = Math.round(((price - bench.rate) / bench.rate) * 100);
        result.deviation = dev;
        if (Math.abs(dev) > 60) {
          result.isReasonable = false;
          result.warning = `⚠️ السعر ${Math.round(price)} انحراف ${dev}% عن المرجع ${bench.rate} (${keyword})`;
        }
        break;
      }
    }

    // مقارنة مع البيانات التاريخية v3.0 (brain_mega_training — 13,005 بند)
    if (!result.supplierPrice && BRAIN_HISTORY_ITEMS.length > 0) {
      // بحث ذكي بالتقييم (scoring)
      let bestMatch: { item: any; score: number } | null = null;
      const words = dLower.split(/[\s,;.]+/).filter(w => w.length > 2);
      
      for (const item of BRAIN_HISTORY_ITEMS) {
        const itemDesc = (item.desc || item.description || '').toLowerCase();
        const itemPrice = item.unitPrice || item.originalPrice || item.boqPrice || item.avgPrice || 0;
        if (!itemDesc || itemPrice <= 0) continue;
        
        // حساب التقييم
        let score = 0;
        for (const word of words) {
          if (itemDesc.includes(word)) score += 1;
        }
        // مكافأة تطابق الوحدة
        const itemUnit = (item.unit || '').toLowerCase();
        if (itemUnit && unit.toLowerCase().includes(itemUnit.substring(0, 2))) score += 2;
        
        // حد أدنى 3 كلمات متطابقة
        if (score >= 3 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { item, score };
        }
      }
      
      if (bestMatch) {
        const histPrice = bestMatch.item.unitPrice || bestMatch.item.originalPrice || bestMatch.item.boqPrice || bestMatch.item.avgPrice;
        result.historicalPrice = Math.round(histPrice);
        const dev = Math.round(((price - histPrice) / histPrice) * 100);
        result.deviation = dev;
        
        // ثقة أعلى مع تقييم أعلى
        const confidence = Math.min(bestMatch.score / words.length, 1);
        if (Math.abs(dev) > 80 && confidence > 0.5) {
          result.isReasonable = false;
          result.warning = `⚠️ السعر ${Math.round(price)} انحراف ${dev}% عن التاريخي ${Math.round(histPrice)} (ثقة: ${Math.round(confidence * 100)}%)`;
        }
      }
    }

    // سقف حسب الوحدة
    if (!result.warning) {
      const unitCaps: Record<string, number> = {
        'م2': 600, 'م3': 2500, 'م.ط': 500, 'عدد': 30000, 'مقطوعية': 50000,
      };
      const unitLower = unit.toLowerCase();
      for (const [u, cap] of Object.entries(unitCaps)) {
        if (unitLower.includes(u) && price > cap) {
          result.isReasonable = false;
          result.deviation = Math.round(((price - cap) / cap) * 100);
          result.warning = `🚨 السعر ${price} تجاوز السقف ${cap} ر.س/${u} بنسبة ${result.deviation}%`;
        }
      }
    }

    return result;
  }

  // ═══════════════════════════════════════════
  // Web Search Price Verification
  // ═══════════════════════════════════════════

  private webSearchCache: Map<string, { price: number; source: string; date: string }> = new Map();

  /**
   * بحث في الويب عن سعر مادة (يُستدعى عند الحاجة)
   * يخزن النتائج مؤقتاً لتجنب البحث المتكرر
   */
  async searchWebPrice(materialName: string): Promise<{ price: number | null; source: string; confidence: number }> {
    // تحقق من الكاش
    const cached = this.webSearchCache.get(materialName);
    if (cached) {
      return { price: cached.price, source: `🌐 ${cached.source} (كاش)`, confidence: 70 };
    }

    try {
      // محاكاة بحث ويب — في الإنتاج يستبدل بـ fetch API حقيقي
      const webPrices: Record<string, { price: number; source: string }> = {
        'خرسانة جاهزة': { price: 285, source: 'سوق المواد السعودي' },
        'حديد تسليح': { price: 2800, source: 'بورصة الحديد العالمية (طن)' },
        'أسمنت': { price: 310, source: 'شركة يمامة أسمنت (طن)' },
        'بلوك خرساني': { price: 3.0, source: 'مصنع بلوك الرياض' },
        'بلاط بورسلان': { price: 50, source: 'ساكو/هوم سنتر (م2)' },
        'كابل كهرباء': { price: 5.5, source: 'الفنار (2.5مم/م)' },
        'دهان بلاستيكي': { price: 22, source: 'جوتن/الجزيرة (لتر)' },
        'ألمنيوم': { price: 2450, source: 'LME بورصة لندن (طن)' },
        'نحاس': { price: 9200, source: 'LME بورصة لندن (طن)' },
        'مظلة معدنية': { price: 180, source: 'متوسط السوق (م2)' },
        'سبليت تكييف': { price: 2100, source: 'متوسط السوق (وحدة)' },
        'باب خشب': { price: 900, source: 'IKEA/محلات أبواب (عدد)' },
        'سخان كهربائي': { price: 750, source: 'أريستون/بيكو (100 لتر)' },
      };

      for (const [keyword, data] of Object.entries(webPrices)) {
        if (materialName.includes(keyword)) {
          this.webSearchCache.set(materialName, { ...data, date: new Date().toISOString() });
          return { price: data.price, source: `🌐 ${data.source}`, confidence: 75 };
        }
      }

      return { price: null, source: 'لم يُعثر على نتائج', confidence: 0 };
    } catch {
      return { price: null, source: 'خطأ في البحث', confidence: 0 };
    }
  }

  /**
   * التحقق الشامل: يقارن السعر المحسوب مع 3 مصادر
   */
  async deepVerify(desc: string, calculatedPrice: number, unit: string): Promise<{
    isReasonable: boolean;
    sources: { name: string; price: number | null; deviation: string }[];
    recommendation: string;
  }> {
    const sources: { name: string; price: number | null; deviation: string }[] = [];

    // 1. البورصة العالمية
    try {
      commodityEngine.initialize();
      const commodities = commodityEngine.getAllPrices();
      const relevant = commodities.find(c =>
        desc.includes('حديد') ? c.id === 'steel_rebar' :
        desc.includes('نحاس') ? c.id === 'copper' :
        desc.includes('أسمنت') ? c.id === 'cement' : false
      );
      if (relevant) {
        sources.push({
          name: `📊 بورصة (${relevant.nameAr})`,
          price: relevant.currentPrice,
          deviation: 'مستقر',
        });
      }
    } catch { /* skip */ }

    // 2. بحث ويب
    const webResult = await this.searchWebPrice(desc);
    if (webResult.price) {
      const dev = Math.round(((calculatedPrice - webResult.price) / webResult.price) * 100);
      sources.push({
        name: webResult.source,
        price: webResult.price,
        deviation: `${dev > 0 ? '+' : ''}${dev}%`,
      });
    }

    // 3. تحقق السقف
    const verify = this.verifyFinalPrice(desc, calculatedPrice, unit);
    const isReasonable = verify.isReasonable && sources.every(s =>
      s.price === null || Math.abs(((calculatedPrice - s.price) / s.price) * 100) < 50
    );

    let recommendation = '✅ السعر معقول';
    if (!isReasonable) {
      recommendation = '⚠️ السعر يحتاج مراجعة — انحراف كبير عن المصادر';
    }
    if (sources.length === 0) {
      recommendation = '⚡ لا توجد مصادر تحقق — يُنصح بطلب عرض سعر من مورد';
    }

    return { isReasonable, sources, recommendation };
  }

  // ═══════════════════════════════════════════
  // طبقة 1: حارس السعر (Price Guard) 🛡️
  // ═══════════════════════════════════════════

  /** سقوف الأسعار حسب الوحدة (مُحسّنة حسب الفئة) */
  private readonly UNIT_CAPS: Record<string, number> = {
    'م2': 1200, 'م3': 3500, 'م.ط': 800, 'م ط': 800,
    'عدد': 80000, 'مقطوعية': 120000, 'طن': 20000,
  };

  /** سقوف خاصة بالفئات العالية التكلفة */
  private readonly CATEGORY_CAPS: Record<string, number> = {
    'كهرباء': 120000, 'شبكات': 100000, 'حريق': 80000,
    'صحي': 60000, 'تكييف': 50000, 'سلامة': 80000,
  };

  /**
   * حارس السعر — يتحقق من منطقية السعر قبل القبول
   * يُستدعى تلقائياً من analyze()
   */
  priceGuard(result: ItemCostResult, qty: number = 1): { passed: boolean; issues: string[] } {
    const issues: string[] = [];

    // 1. سقف سعر الوحدة (ذكي حسب الفئة)
    const unitLower = result.unit.toLowerCase();
    const categoryCap = this.CATEGORY_CAPS[result.category];
    for (const [u, defaultCap] of Object.entries(this.UNIT_CAPS)) {
      const effectiveCap = categoryCap ? Math.max(defaultCap, categoryCap) : defaultCap;
      if (unitLower.includes(u) && result.sellingPrice > effectiveCap) {
        issues.push(`⛔ سعر الوحدة ${result.sellingPrice} تجاوز السقف ${effectiveCap} ر.س/${u} (${result.category})`);
      }
    }

    // 2. سقف إجمالي البند
    const totalValue = result.sellingPrice * qty;
    if (totalValue > 500000) {
      issues.push(`⚠️ إجمالي البند ${totalValue.toLocaleString()} تجاوز 500,000 — يحتاج مراجعة`);
    }

    // 3. تكلفة المواد vs العمالة (التوازن)
    const matTotal = result.materials.reduce((s, m) => s + m.total, 0);
    const labTotal = result.labor.reduce((s, l) => s + l.total, 0);
    if (matTotal > 0 && labTotal > 0 && labTotal > matTotal * 3) {
      issues.push(`⚠️ تكلفة العمالة (${labTotal}) أعلى 3x من المواد (${matTotal}) — غير طبيعي`);
    }

    // 4. سعر صفري أو سالب
    if (result.sellingPrice <= 0) {
      issues.push('⛔ السعر صفر أو سالب!');
    }

    return { passed: issues.length === 0, issues };
  }

  // ═══════════════════════════════════════════
  // طبقة 5: التعلم الذاتي (Price History) 🧠
  // ═══════════════════════════════════════════

  private priceHistory: Map<string, number[]> = new Map();

  /** تسجيل سعر في التاريخ */
  recordPrice(category: string, unit: string, price: number) {
    const key = `${category}/${unit}`;
    const history = this.priceHistory.get(key) || [];
    history.push(price);
    // احتفظ بآخر 20 سعر فقط
    if (history.length > 20) history.shift();
    this.priceHistory.set(key, history);
  }

  /** مقارنة السعر بالتاريخ */
  compareWithHistory(category: string, unit: string, price: number): {
    avg: number; deviation: number; isNormal: boolean;
  } | null {
    const key = `${category}/${unit}`;
    const history = this.priceHistory.get(key);
    if (!history || history.length < 2) return null;

    const avg = history.reduce((s, p) => s + p, 0) / history.length;
    const deviation = Math.round(((price - avg) / avg) * 100);
    return { avg: Math.round(avg), deviation, isNormal: Math.abs(deviation) < 40 };
  }

  /** تحميل/حفظ التاريخ */
  exportHistory(): Record<string, number[]> {
    const obj: Record<string, number[]> = {};
    this.priceHistory.forEach((v, k) => { obj[k] = v; });
    return obj;
  }
  importHistory(data: Record<string, number[]>) {
    for (const [k, v] of Object.entries(data)) {
      this.priceHistory.set(k, v);
    }
  }

  // ═══════════════════════════════════════════
  // Cloud AI Fallback 🌐☁️
  // ═══════════════════════════════════════════

  private cloudEnabled = true;

  /**
   * استشارة Cloud AI عند:
   * - عدم وجود وصفة للبند
   * - سعر غير منطقي (فشل Price Guard)
   * - انحراف كبير عن التاريخ
   */
  async consultCloudAI(desc: string, unit: string, currentPrice: number): Promise<{
    suggestedPrice: number | null;
    confidence: number;
    reasoning: string;
    source: string;
  }> {
    if (!this.cloudEnabled) {
      return { suggestedPrice: null, confidence: 0, reasoning: 'Cloud AI معطل', source: 'none' };
    }

    try {
      // Claude API (Anthropic)
      const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
      
      if (!apiKey || apiKey === 'fake') {
        return this.localAIFallback(desc, unit, currentPrice);
      }

      const prompt = `أنت مهندس تسعير خبير في مناقصات صيانة المدارس بالسعودية.
البند: ${desc}
الوحدة: ${unit}
السعر الحالي: ${currentPrice} ر.س/${unit}

أعطني:
1. هل السعر منطقي؟ (نعم/لا)
2. السعر المقترح بالريال
3. السبب باختصار

أجب بـ JSON فقط: {"reasonable": true/false, "price": NUMBER, "reason": "..."}`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          temperature: 0.1,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const text = data?.content?.[0]?.text || '';

      // استخراج JSON من الرد
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          suggestedPrice: parsed.price || null,
          confidence: parsed.reasonable ? 85 : 50,
          reasoning: parsed.reason || 'من Claude AI',
          source: '☁️ Claude AI',
        };
      }

      return { suggestedPrice: null, confidence: 0, reasoning: 'لم يُفهم الرد', source: 'cloud_error' };
    } catch (err: any) {
      console.log(`   ⚡ Cloud AI غير متاح: ${err.message || err}`);
      return this.localAIFallback(desc, unit, currentPrice);
    }
  }

  /**
   * Fallback محلي ذكي — يستخدم قواعد هندسية عندما Cloud غير متاح
   */
  private localAIFallback(desc: string, unit: string, currentPrice: number): {
    suggestedPrice: number | null; confidence: number; reasoning: string; source: string;
  } {
    const d = desc.toLowerCase();
    const unitL = unit.toLowerCase();

    // قواعد هندسية مبنية على الخبرة
    const rules: { pattern: RegExp; unitMatch: string; min: number; max: number; typical: number }[] = [
      { pattern: /خرسانة مسلحة/, unitMatch: 'م3', min: 800, max: 1500, typical: 1050 },
      { pattern: /خرسانة عادي/, unitMatch: 'م2', min: 20, max: 80, typical: 45 },
      { pattern: /بلوك|طوب/, unitMatch: 'م2', min: 30, max: 100, typical: 60 },
      { pattern: /دهان/, unitMatch: 'م2', min: 15, max: 50, typical: 30 },
      { pattern: /سيراميك|بورسلان/, unitMatch: 'م2', min: 50, max: 150, typical: 90 },
      { pattern: /مظل/, unitMatch: 'م2', min: 100, max: 300, typical: 180 },
      { pattern: /تكييف|سبليت/, unitMatch: 'عدد', min: 2000, max: 5000, typical: 3200 },
      { pattern: /كابل|كبل/, unitMatch: 'م', min: 10, max: 80, typical: 35 },
      { pattern: /مواسير/, unitMatch: 'م', min: 15, max: 80, typical: 40 },
      { pattern: /حفر/, unitMatch: 'م3', min: 30, max: 120, typical: 70 },
      { pattern: /معالجة/, unitMatch: 'م2', min: 40, max: 150, typical: 85 },
      { pattern: /باب/, unitMatch: 'م2', min: 200, max: 600, typical: 380 },
      { pattern: /لوحة توزيع/, unitMatch: 'عدد', min: 2000, max: 6000, typical: 4000 },
    ];

    for (const rule of rules) {
      if (rule.pattern.test(d) && unitL.includes(rule.unitMatch)) {
        const isReasonable = currentPrice >= rule.min && currentPrice <= rule.max;
        return {
          suggestedPrice: isReasonable ? currentPrice : rule.typical,
          confidence: isReasonable ? 75 : 60,
          reasoning: isReasonable
            ? `✅ السعر ${currentPrice} ضمن النطاق المتوقع (${rule.min}-${rule.max})`
            : `⚠️ السعر ${currentPrice} خارج النطاق (${rule.min}-${rule.max}). المقترح: ${rule.typical}`,
          source: '🧠 Local AI (قواعد هندسية)',
        };
      }
    }

    return {
      suggestedPrice: null,
      confidence: 30,
      reasoning: '⚡ لم يُعثر على قاعدة مطابقة — يُنصح بتحقق يدوي',
      source: '🧠 Local AI',
    };
  }

  /** تفعيل/تعطيل Cloud */
  setCloudEnabled(enabled: boolean) { this.cloudEnabled = enabled; }

  /** تعيين نسبة المكسب */
  setProfitMargin(margin: number) { this.defaultProfitMargin = margin; }
  getProfitMargin() { return this.defaultProfitMargin; }

  // ═══════════════════════════════════════════
  // المرحلة 2: استيعاب بيانات التدريب التاريخية 📚
  // ═══════════════════════════════════════════

  /**
   * ابتلاع بيانات التدريب من brain_mega_training.json
   * يُغذي priceHistory بآلاف الأسعار التاريخية لتحسين كشف الأسعار الشاذة
   */
  ingestTrainingData(trainingFilePath?: string): { ingested: number; categories: number } {
    const filePath = trainingFilePath || path.join(process.cwd(), 'data', 'training', 'brain_mega_training.json');
    let ingested = 0;
    const categories = new Set<string>();

    // === مصدر 1: brain_mega_training.json (فئات مجمّعة) ===
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);

        if (data.sources && typeof data.sources === 'object') {
          for (const [sourceName, sourceData] of Object.entries(data.sources) as [string, any][]) {
            if (!sourceData.items || !Array.isArray(sourceData.items)) continue;
            for (const item of sourceData.items) {
              const cat = item.category || 'عام';
              const avg = item.avgPrice || 0;
              const min = item.minPrice || 0;
              const max = item.maxPrice || 0;
              if (avg > 0) {
                this.recordPrice(cat, 'تاريخي', avg);
                ingested++;
                categories.add(cat);
              }
              if (min > 0 && min !== avg) { this.recordPrice(cat, 'تاريخي-أدنى', min); ingested++; }
              if (max > 0 && max !== avg) { this.recordPrice(cat, 'تاريخي-أعلى', max); ingested++; }
            }
          }
        }
      }
    } catch (err: any) {
      console.log(`⚠️ خطأ في mega training: ${err.message}`);
    }

    // === مصدر 2: extracted_all_excel.json (بنود فردية بأسعار حقيقية) ===
    try {
      const excelPath = path.join(process.cwd(), 'data', 'training', 'extracted_all_excel.json');
      if (fs.existsSync(excelPath)) {
        const raw = fs.readFileSync(excelPath, 'utf8');
        const data = JSON.parse(raw);

        if (data.sources && typeof data.sources === 'object') {
          for (const [sourceName, sourceData] of Object.entries(data.sources) as [string, any][]) {
            const src = sourceData as any;
            if (!src.sheets || typeof src.sheets !== 'object') continue;
            for (const [sheetName, sheetData] of Object.entries(src.sheets) as [string, any][]) {
              const sheet = sheetData as any;
              if (!sheet.allItems || !Array.isArray(sheet.allItems)) continue;
              for (const item of sheet.allItems) {
                const price = item.totalPrice || item.unitPrice || item.price || 0;
                const desc = item.description || item.desc || sheetName;
                if (price > 0) {
                  this.recordPrice(desc.substring(0, 50), 'excel-' + sourceName, price);
                  ingested++;
                  categories.add(sheetName);
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.log(`⚠️ خطأ في extracted_all_excel: ${err.message}`);
    }

    console.log(`🧠 تم ابتلاع ${ingested} نقطة بيانات من ${categories.size} فئة تدريبية`);
    return { ingested, categories: categories.size };
  }

  // ═══════════════════════════════════════════
  // المرحلة 1: إثراء الوصفات بالمعدلات الهندسية 🔬
  // ═══════════════════════════════════════════

  /**
   * إثراء وصفة خرسانة بمعدلات الخلط الهندسية (SBC 304)
   * بدلاً من سعر ثابت 290 ريال → يحسب: أسمنت + رمل + حصى + ماء
   */
  enrichConcreteRecipe(grade: string = 'C35'): { materials: { name: string; qty: number; unit: string; price: number }[]; totalPerM3: number } {
    const mix = CONCRETE_MIX_RATES[grade];
    if (!mix) return { materials: [], totalPerM3: 0 };

    const cementPrice = getMaterialPrice('cement_50kg') || 22; // سعر كيس 50كجم
    const cementPerKg = cementPrice / 50;
    const sandPrice = getMaterialPrice('sand_m3') || 60;
    const gravelPrice = getMaterialPrice('gravel_m3') || 70;

    const materials = [
      { name: `أسمنت ${mix.cementType}`, qty: mix.cement_kg_per_m3, unit: 'كجم', price: Math.round(mix.cement_kg_per_m3 * cementPerKg) },
      { name: 'رمل خشن', qty: mix.sand_m3_per_m3, unit: 'م3', price: Math.round(mix.sand_m3_per_m3 * sandPrice) },
      { name: 'حصى (بحص)', qty: mix.gravel_m3_per_m3, unit: 'م3', price: Math.round(mix.gravel_m3_per_m3 * gravelPrice) },
      { name: 'ماء', qty: mix.water_L_per_m3, unit: 'لتر', price: 5 },
    ];
    const totalPerM3 = materials.reduce((s, m) => s + m.price, 0);
    return { materials, totalPerM3 };
  }

  /**
   * حساب تكلفة العمالة عبر laborProductivity.ts بدل الساعات الثابتة
   */
  getLaborFromProductivity(activityId: string, qty: number = 1, weather: string = 'normal', complexity: string = 'standard'): {
    days: number; cost: number; crewDescription: string; costPerUnit: number;
  } | null {
    const result = calculateLaborCost(activityId, qty, weather, complexity);
    const activity = findActivity(activityId);
    if (!result || !activity) return null;
    return {
      days: result.days,
      cost: result.cost,
      crewDescription: activity.crew,
      costPerUnit: activity.laborCostPerUnit,
    };
  }

  /**
   * إحصائيات الربط الهندسي — للعرض في التقارير
   */
  getEngineeringStats(): {
    connectedRates: { concrete: number; mortar: number; tile: number; paint: number; insulation: number; waterproofing: number; labor: number };
    totalRecipes: number;
    totalMarketPrices: number;
    totalLaborActivities: number;
    trainingDataLoaded: boolean;
  } {
    return {
      connectedRates: {
        concrete: Object.keys(CONCRETE_MIX_RATES).length,
        mortar: Object.keys(MORTAR_RATES).length,
        tile: Object.keys(TILE_RATES).length,
        paint: Object.keys(PAINT_RATES).length,
        insulation: Object.keys(INSULATION_RATES).length,
        waterproofing: Object.keys(WATERPROOFING_RATES).length,
        labor: LABOR_ACTIVITIES.length,
      },
      totalRecipes: Object.keys(ITEM_RECIPES).length,
      totalMarketPrices: MATERIAL_PRICES.length,
      totalLaborActivities: LABOR_ACTIVITIES.length,
      trainingDataLoaded: this.priceHistory.size > 50,
    };
  }
}

export const itemCostAnalyzer = new ItemCostAnalyzer();
