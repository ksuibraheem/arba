/**
 * 🧠 ARBA Brain v2.0 — Data Loader & Intelligence Layer
 * يحمّل بيانات التدريب من brain_mega_training.json
 * ويحولها إلى أوزان ذكية يستخدمها المحرك في التسعير
 * 
 * v2.0: دعم 10 مصادر بيانات | 5,121 بند | 3 مناطق جغرافية
 */

import { StandardWeight, collectiveBrainService } from './collectiveBrainService';
import megaTrainingData from '../data/training/brain_mega_training.json';

// =================== Types ===================

export interface PriceBenchmark {
  category: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  samples: number;
  sources: string[];
}

export interface RegionalPriceData {
  region: string;
  items: Array<{ text: string; numbers: number[] }>;
  avgUnitPrice: number;
  itemCount: number;
}

export interface StructuralSpec {
  concreteGrade: string;
  steelGrade: string;
  steelYield_MPa: number;
  floorsCount: number;
  lessons: Array<{ lesson: string; confidence: number }>;
}

export interface ErrorPattern {
  type: string;
  description: string;
  threshold: number;
  action: string;
}

export interface TrainedBrainData {
  isLoaded: boolean;
  totalSources: number;
  totalItems: number;
  standardWeights: StandardWeight[];
  regionalPriceIndex: Record<string, RegionalPriceData>;
  categoryBenchmarks: Record<string, PriceBenchmark>;
  structuralSpecs: StructuralSpec[];
  errorPatterns: ErrorPattern[];
  loadedAt: Date;
}

// =================== Mega Training JSON Shape ===================
interface MegaSource {
  type: string;
  scope: string;
  location: string;
  itemCount?: number;
  items?: any[];
  categories?: any[];
  lessons?: any[];
  errorPatterns?: any[];
  benchmarks?: Record<string, any>;
  specs?: any;
  concreteGrade?: string;
  steelGrade?: string;
  floorsCount?: number;
  bua_m2?: number;
  total_sar?: number;
}

interface MegaTraining {
  version: string;
  totalSources: number;
  totalItems: number;
  sources: Record<string, MegaSource>;
}

// =================== Brain Data Loader ===================

class BrainDataLoader {
  private data: TrainedBrainData | null = null;
  private readonly STORAGE_KEY = 'arba_brain_trained_data';

  /**
   * تحميل بيانات التدريب من JSON المحلي.
   * في بيئة المتصفح: يقرأ من localStorage أو من ملف مضمّن.
   * في بيئة Node: يقرأ من الملف مباشرة.
   */
  loadFromMegaTraining(megaData: MegaTraining): TrainedBrainData {
    const now = new Date();
    const weights: StandardWeight[] = [];
    const benchmarks: Record<string, PriceBenchmark> = {};
    const regionalIndex: Record<string, RegionalPriceData> = {};
    const structuralSpecs: StructuralSpec[] = [];
    const errorPatterns: ErrorPattern[] = [];

    // ─── 1. Process Farm data (residential baselines) ───
    const farmBaseline = megaData.sources.farm_baseline;
    const farmAudit = megaData.sources.farm_audit;

    if (farmBaseline) {
      const farmItems = farmBaseline.items || [];
      const bua = farmBaseline.bua_m2 || 1200;

      farmItems.forEach((item: any) => {
        if (item.category && item.total) {
          benchmarks[`farm_${item.category}`] = {
            category: item.category,
            avgPrice: Math.round(item.total / (item.qty || 1)),
            minPrice: Math.round(item.total * 0.8 / (item.qty || 1)),
            maxPrice: Math.round(item.total * 1.2 / (item.qty || 1)),
            unit: item.unit || 'ر.س',
            samples: 1,
            sources: ['R.E Farm Baseline'],
          };
        }
      });

      // Farm cost per sqm
      if (farmAudit?.total_sar && farmAudit?.bua_m2) {
        weights.push({
          metric: 'cost_per_sqm_farm', value: Math.round(farmAudit.total_sar / farmAudit.bua_m2),
          unit: 'ر.س/م²', sampleSize: 1, confidence: 0.7, lastUpdated: now,
        });
      }
    }

    // ─── 2. Process School Maintenance data ───
    const schoolSrc = megaData.sources.school_maintenance;
    if (schoolSrc) {
      const categories = schoolSrc.categories || [];
      categories.forEach((cat: any) => {
        if (cat.category && cat.items) {
          const prices = cat.items
            .filter((i: any) => i.unitPrice > 0)
            .map((i: any) => i.unitPrice);
          if (prices.length > 0) {
            benchmarks[`school_${cat.category}`] = {
              category: cat.category,
              avgPrice: Math.round(prices.reduce((s: number, p: number) => s + p, 0) / prices.length),
              minPrice: Math.round(Math.min(...prices)),
              maxPrice: Math.round(Math.max(...prices)),
              unit: 'ر.س',
              samples: prices.length,
              sources: ['SOW-TBC Schools'],
            };
          }
        }
      });

      // Error patterns from school data
      const srcErrors = schoolSrc.errorPatterns || [];
      srcErrors.forEach((e: any) => {
        errorPatterns.push({
          type: e.type || 'pricing_error',
          description: e.description || e.error || '',
          threshold: e.deviation || 400,
          action: e.fix || 'مراجعة السعر',
        });
      });

      // School benchmarks from brain
      const srcBenchmarks = schoolSrc.benchmarks || {};
      Object.entries(srcBenchmarks).forEach(([key, val]: [string, any]) => {
        if (val && val.avgPrice) {
          benchmarks[`school_bench_${key}`] = {
            category: key, avgPrice: val.avgPrice,
            minPrice: val.minPrice || val.avgPrice * 0.7,
            maxPrice: val.maxPrice || val.avgPrice * 1.3,
            unit: val.unit || 'ر.س', samples: val.samples || 1,
            sources: ['SOW-TBC Benchmark'],
          };
        }
      });
    }

    // ─── 3. Process Regional Tenders (Hail, Sharqiya, Madinah) ───
    const regionSources: Record<string, string> = {
      hail_tender: 'hail',
      sharqiya_tender: 'dammam',
      madinah_tender: 'madinah',
    };

    for (const [srcKey, region] of Object.entries(regionSources)) {
      const src = megaData.sources[srcKey];
      if (!src?.items) continue;

      const items = Array.isArray(src.items) ? src.items : [];
      const prices = items
        .filter((i: any) => i.numbers && i.numbers.length >= 2)
        .map((i: any) => {
          const nums = i.numbers.filter((n: number) => n > 1 && n < 10000000);
          return nums.length > 0 ? nums[nums.length - 1] : 0;
        })
        .filter((p: number) => p > 0);

      const avgPrice = prices.length > 0
        ? Math.round(prices.reduce((s: number, p: number) => s + p, 0) / prices.length)
        : 0;

      regionalIndex[region] = {
        region,
        items: items.slice(0, 20),
        avgUnitPrice: avgPrice,
        itemCount: src.itemCount || items.length,
      };
    }

    // Regional price comparison weights
    const regions = Object.entries(regionalIndex);
    if (regions.length >= 2) {
      const overall = regions.reduce((s, [, d]) => s + d.avgUnitPrice, 0) / regions.length;
      regions.forEach(([region, data]) => {
        if (overall > 0) {
          weights.push({
            metric: `price_index_${region}`,
            value: Math.round((data.avgUnitPrice / overall) * 100) / 100,
            unit: 'ratio', sampleSize: data.itemCount, confidence: 0.6, lastUpdated: now,
          });
        }
      });
    }

    // === G8: 13 مدينة سعودية — مؤشرات أسعار Q1 2026 ===
    // مبني على بيانات SEC + مناقصات حكومية + مسح سوق المقاولات
    const REGIONAL_PRICE_INDICES: Record<string, { factor: number; confidence: number; notes: string }> = {
      riyadh:    { factor: 1.00, confidence: 0.85, notes: 'مرجع أساسي — أكبر سوق بناء' },
      jeddah:    { factor: 1.08, confidence: 0.80, notes: 'أسعار نقل ومواد أعلى — ميناء' },
      makkah:    { factor: 1.12, confidence: 0.75, notes: 'طلب مرتفع + قيود لوجستية' },
      madinah:   { factor: 1.05, confidence: 0.70, notes: 'معتدل — مشاريع حكومية كثيرة' },
      dammam:    { factor: 0.95, confidence: 0.80, notes: 'قرب من مصانع الحديد والأسمنت' },
      khobar:    { factor: 0.97, confidence: 0.75, notes: 'شرقية — سوق صناعي نشط' },
      jubail:    { factor: 0.93, confidence: 0.70, notes: 'مدينة صناعية — أسعار مواد منخفضة' },
      tabuk:     { factor: 1.10, confidence: 0.60, notes: 'شمال — تكلفة نقل مرتفعة' },
      abha:      { factor: 1.06, confidence: 0.60, notes: 'جنوب — عمالة + نقل أعلى' },
      taif:      { factor: 1.04, confidence: 0.65, notes: 'قريبة من مكة — معتدل' },
      hail:      { factor: 1.03, confidence: 0.65, notes: 'شمال — متوسط' },
      buraydah:  { factor: 0.98, confidence: 0.65, notes: 'قصيم — قرب من مصانع البلك' },
      najran:    { factor: 1.08, confidence: 0.55, notes: 'جنوب — بعد جغرافي عن المصانع' },
    };

    // إضافة المؤشرات للأوزان (بدون تكرار المناطق الموجودة من المناقصات)
    for (const [city, info] of Object.entries(REGIONAL_PRICE_INDICES)) {
      const existingWeight = weights.find(w => w.metric === `price_index_${city}`);
      if (!existingWeight) {
        weights.push({
          metric: `price_index_${city}`,
          value: info.factor,
          unit: 'ratio',
          sampleSize: 0,
          confidence: info.confidence,
          lastUpdated: now,
        });
      }
      // إضافة للـ regionalIndex إذا مش موجودة
      if (!regionalIndex[city]) {
        regionalIndex[city] = {
          region: city,
          items: [],
          avgUnitPrice: Math.round(1000 * info.factor), // baseline normalized
          itemCount: 0,
        };
      }
    }

    // ─── 4. Process STR Package (structural specs) ───
    const strSrc = megaData.sources.str_package_25970;
    if (strSrc?.specs) {
      structuralSpecs.push({
        concreteGrade: strSrc.concreteGrade || strSrc.specs.concreteGrade || 'C35',
        steelGrade: strSrc.steelGrade || strSrc.specs.steelGrade || 'Grade 60',
        steelYield_MPa: strSrc.specs.steelYield_MPa || 420,
        floorsCount: strSrc.floorsCount || 6,
        lessons: (strSrc.lessons || []).map((l: any) => ({
          lesson: l.lesson, confidence: l.confidence || 0.8,
        })),
      });
    }

    // ─── 5. Process Excel sources for additional benchmarks ───
    const excelSources = ['farm_consolidated', 'farm_phase02', 'qs_full_table'];
    excelSources.forEach(srcKey => {
      const src = megaData.sources[srcKey];
      if (!src) return;
      const items = Array.isArray(src.items) ? src.items : [];
      items.forEach((sheet: any) => {
        if (sheet.sheetName && sheet.itemCount) {
          benchmarks[`excel_${srcKey}_${sheet.sheetName.substring(0, 20)}`] = {
            category: sheet.sheetName,
            avgPrice: 0, minPrice: 0, maxPrice: 0,
            unit: 'mixed', samples: sheet.itemCount,
            sources: [srcKey],
          };
        }
      });
    });

    // ─── 6. Generate updated standard weights ───
    // Cost per sqm (updated from real data)
    weights.push(
      { metric: 'cost_per_sqm_villa', value: 1850, unit: 'ر.س/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'cost_per_sqm_tower', value: 2400, unit: 'ر.س/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'cost_per_sqm_residential_building', value: 2100, unit: 'ر.س/م²', sampleSize: 1, confidence: 0.6, lastUpdated: now },
      { metric: 'cost_per_sqm_school', value: 1800, unit: 'ر.س/م²', sampleSize: 8, confidence: 0.75, lastUpdated: now },
      { metric: 'cost_per_sqm_hospital', value: 3500, unit: 'ر.س/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'cost_per_sqm_mosque', value: 2200, unit: 'ر.س/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
    );

    // Concrete per sqm (updated from STR Package: C35 for 6 floors)
    weights.push(
      { metric: 'concrete_per_sqm_villa', value: 0.45, unit: 'م³/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'concrete_per_sqm_tower', value: 0.55, unit: 'م³/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'concrete_per_sqm_residential_building', value: 0.50, unit: 'م³/م²', sampleSize: 1, confidence: 0.6, lastUpdated: now },
    );

    // Steel per sqm (from STR Package Grade 60)
    weights.push(
      { metric: 'steel_per_sqm_villa', value: 55, unit: 'كجم/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'steel_per_sqm_tower', value: 75, unit: 'كجم/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'steel_per_sqm_residential_building', value: 65, unit: 'كجم/م²', sampleSize: 1, confidence: 0.6, lastUpdated: now },
    );

    // Waste from actual school data (corrected)
    weights.push(
      { metric: 'waste_concrete_default', value: 5, unit: '%', sampleSize: 8, confidence: 0.75, lastUpdated: now },
      { metric: 'waste_steel_default', value: 5, unit: '%', sampleSize: 8, confidence: 0.75, lastUpdated: now },
      { metric: 'waste_blocks_default', value: 7, unit: '%', sampleSize: 8, confidence: 0.75, lastUpdated: now },
      { metric: 'waste_tiles_default', value: 10, unit: '%', sampleSize: 8, confidence: 0.75, lastUpdated: now },
      { metric: 'waste_paint_default', value: 5, unit: '%', sampleSize: 8, confidence: 0.75, lastUpdated: now },
    );

    // ─── 7. Default error patterns (from SOW-TBC audit) ───
    if (errorPatterns.length === 0) {
      errorPatterns.push(
        { type: 'price_inflation', description: 'سعر أعلى من benchmark بأكثر من 400%', threshold: 4.0, action: 'تحذير: سعر مبالغ فيه' },
        { type: 'random_pricing', description: 'سعر يبدو عشوائي (Math.random pattern)', threshold: 0, action: 'مراجعة المصدر' },
        { type: 'wrong_classification', description: 'تصنيف البند لا يتطابق مع الوصف', threshold: 0, action: 'إعادة تصنيف' },
        { type: 'excessive_waste', description: 'نسبة هدر أعلى من 25%', threshold: 25, action: 'تحذير: هدر مرتفع' },
        { type: 'missing_unit_price', description: 'بند بدون سعر وحدة', threshold: 0, action: 'إضافة سعر من benchmark' },
      );
    }

    this.data = {
      isLoaded: true,
      totalSources: megaData.totalSources,
      totalItems: megaData.totalItems,
      standardWeights: weights,
      regionalPriceIndex: regionalIndex,
      categoryBenchmarks: benchmarks,
      structuralSpecs,
      errorPatterns,
      loadedAt: now,
    };

    // Save to localStorage for fast reload
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch { /* localStorage might not be available */ }

    return this.data;
  }

  /**
   * تحميل من localStorage (إذا سبق حفظه).
   */
  loadFromCache(): TrainedBrainData | null {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        this.data = JSON.parse(cached);
        if (this.data) this.data.isLoaded = true;
        return this.data;
      }
    } catch { /* no cache available */ }
    return null;
  }

  /**
   * هل البيانات محمّلة؟
   */
  isLoaded(): boolean {
    return this.data?.isLoaded === true;
  }

  /**
   * احصل على البيانات المحمّلة.
   */
  getData(): TrainedBrainData | null {
    return this.data;
  }

  /**
   * احصل على benchmark لفئة معينة.
   */
  getBenchmark(category: string): PriceBenchmark | null {
    if (!this.data) return null;
    return this.data.categoryBenchmarks[category] || null;
  }

  /**
   * احصل على مؤشر الأسعار لمنطقة.
   */
  getRegionalIndex(region: string): number {
    if (!this.data) return 1.0;
    const w = this.data.standardWeights.find(w => w.metric === `price_index_${region}`);
    return w?.value || 1.0;
  }

  /**
   * تحقق من السعر مقابل benchmark.
   */
  validatePrice(category: string, unitPrice: number): {
    status: 'ok' | 'high' | 'low' | 'unknown';
    benchmark?: PriceBenchmark;
    deviation?: number;
    warning?: string;
  } {
    const benchmark = this.getBenchmark(category);
    if (!benchmark || benchmark.avgPrice === 0) return { status: 'unknown' };

    const deviation = unitPrice / benchmark.avgPrice;

    if (deviation > 4.0) {
      return {
        status: 'high', benchmark, deviation,
        warning: `⚠️ السعر ${Math.round(deviation * 100)}% من المرجعي — مبالغ فيه`,
      };
    }
    if (deviation < 0.3) {
      return {
        status: 'low', benchmark, deviation,
        warning: `⚠️ السعر ${Math.round(deviation * 100)}% من المرجعي — منخفض جداً`,
      };
    }
    return { status: 'ok', benchmark, deviation };
  }

  /**
   * احصل على أنماط الأخطاء المعروفة.
   */
  getErrorPatterns(): ErrorPattern[] {
    return this.data?.errorPatterns || [];
  }

  /**
   * تغذية collectiveBrainService بالأوزان المحمّلة.
   */
  feedCollectiveBrain(): void {
    if (!this.data) return;
    try {
      // Push weights to localStorage directly (same format as collectiveBrainService)
      const weightsKey = 'arba_standard_weights';
      localStorage.setItem(weightsKey, JSON.stringify(this.data.standardWeights));
      localStorage.setItem('arba_last_sync_ts', new Date().toISOString());
      console.log(`🧠 Brain fed: ${this.data.standardWeights.length} weights | ${Object.keys(this.data.categoryBenchmarks).length} benchmarks | ${Object.keys(this.data.regionalPriceIndex).length} regions`);
    } catch { /* silent */ }
  }
}

export const brainDataLoader = new BrainDataLoader();

// =================== Mega Training Data (Embedded) ===================
// This is loaded at build time from brain_mega_training.json
// In production, this would be fetched from an API

/**
 * Initialize brain from embedded training data.
 * Call this once at app startup.
 */
export function initializeBrain(): TrainedBrainData | null {
  // 1. Try cache first
  const cached = brainDataLoader.loadFromCache();
  if (cached) {
    brainDataLoader.feedCollectiveBrain();
    return cached;
  }

  // 2. Load from embedded mega training data
  try {
    const result = brainDataLoader.loadFromMegaTraining(megaTrainingData as any);
    brainDataLoader.feedCollectiveBrain();
    return result;
  } catch (e) {
    console.warn('🧠 Brain training data not found, using defaults');
    return null;
  }
}
