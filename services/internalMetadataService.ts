/**
 * ARBA Sovereign Intelligence — Internal Metadata Service
 * مصفوفة صحة البيانات الداخلية — طبقة مخفية للدماغ فقط
 * 
 * ⚠️ RULE 1: يُمنع منعاً باتاً تصدير حقول _internal_status إلى واجهة العميل.
 * هذه البيانات حصرية للدماغ الداخلي فقط.
 * 
 * PURPOSE:
 * - تقييم "صحة" كل بند/سعر في النظام
 * - تحديد أولويات التحديث الآلي
 * - تصنيف المواد حسب التذبذب (volatile vs stable)
 * - تغذية الدماغ بمعلومات الثقة لاختيار أفضل مورد
 */

import { firestoreDataService } from './firestoreDataService';

// ====================== TYPES ======================

/** حالة التحقق الداخلية — لا تظهر للعميل أبداً */
export type ValidationState = 'Valid' | 'Needs_Sweep' | 'Recalibrating' | 'Stale' | 'Unknown';

/** مؤشر تذبذب المادة */
export type VolatilityClass = 'HIGH' | 'MEDIUM' | 'LOW' | 'STABLE';

/** البيانات الوصفية الداخلية لكل بند */
export interface InternalMetadata {
  _item_id: string;
  _internal_status: {
    last_verified_at: string;          // ISO timestamp — آخر فحص
    volatility_index: VolatilityClass; // تصنيف التذبذب
    validation_state: ValidationState; // حالة التحقق
    confidence_index: number;          // 0-1 — مؤشر الثقة
    price_age_hours: number;           // عمر السعر بالساعات
    source_reliability: number;        // 0-1 — موثوقية المصدر
    next_sweep_at: string;             // متى يجب إعادة الفحص
    sweep_priority: number;            // 1-10 — أولوية الفحص
    last_price_change_percent: number; // آخر نسبة تغيير
  };
  _supplier_match: {
    best_supplier_id: string | null;
    best_price: number;
    alternatives_count: number;
    last_matched_at: string;
  };
  _updated_at: string;
}

// ====================== VOLATILITY CLASSIFICATION ======================

/** تصنيف المواد حسب حساسيتها للتقلبات السعرية */
const MATERIAL_VOLATILITY_MAP: Record<string, VolatilityClass> = {
  // HIGH — سلع معدنية مرتبطة بالبورصة العالمية (LME)
  'rebar': 'HIGH',
  'steel': 'HIGH',
  'copper': 'HIGH',
  'aluminum': 'HIGH',
  'wire': 'HIGH',
  'structural_steel': 'HIGH',
  'حديد': 'HIGH',
  'نحاس': 'HIGH',
  'ألومنيوم': 'HIGH',
  'صلب': 'HIGH',
  
  // MEDIUM — مواد تتأثر بالعرض والطلب المحلي
  'cement': 'MEDIUM',
  'concrete': 'MEDIUM',
  'ready_mix': 'MEDIUM',
  'blocks': 'MEDIUM',
  'أسمنت': 'MEDIUM',
  'خرسانة': 'MEDIUM',
  'بلوك': 'MEDIUM',
  
  // LOW — مواد بتقلبات محدودة
  'sand': 'LOW',
  'gravel': 'LOW',
  'tiles': 'LOW',
  'paint': 'LOW',
  'رمل': 'LOW',
  'حصى': 'LOW',
  'بلاط': 'LOW',
  'دهان': 'LOW',
  
  // STABLE — خدمات وعمالة
  'labor': 'STABLE',
  'formwork': 'STABLE',
  'عمالة': 'STABLE',
  'شدات': 'STABLE',
};

// ====================== STORAGE ======================

const METADATA_KEY = '_arba_internal_metadata';
const MAX_ENTRIES = 1000;

function loadMetadataStore(): Map<string, InternalMetadata> {
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    if (!raw) return new Map();
    const arr: InternalMetadata[] = JSON.parse(raw);
    const map = new Map<string, InternalMetadata>();
    arr.forEach(m => map.set(m._item_id, m));
    return map;
  } catch { return new Map(); }
}

function saveMetadataStore(map: Map<string, InternalMetadata>): void {
  try {
    const arr = Array.from(map.values());
    // Cap entries
    const capped = arr.slice(-MAX_ENTRIES);
    localStorage.setItem(METADATA_KEY, JSON.stringify(capped));
  } catch { /* silent */ }
}

// ====================== CORE SERVICE ======================

export const internalMetadataService = {

  // =================== CLASSIFY ===================

  /**
   * تصنيف تذبذب مادة بناءً على اسمها أو فئتها
   */
  classifyVolatility(materialName: string, category?: string): VolatilityClass {
    const lower = (materialName || '').toLowerCase();
    const catLower = (category || '').toLowerCase();
    
    // Check exact matches first
    for (const [keyword, vol] of Object.entries(MATERIAL_VOLATILITY_MAP)) {
      if (lower.includes(keyword) || catLower.includes(keyword)) {
        return vol;
      }
    }
    
    return 'MEDIUM'; // Default
  },

  // =================== STAMP ===================

  /**
   * إنشاء أو تحديث البيانات الوصفية الداخلية لبند
   * ⚠️ لا تُعرض أبداً في واجهة العميل
   */
  stampMetadata(params: {
    itemId: string;
    materialName: string;
    category?: string;
    currentPrice: number;
    previousPrice?: number;
    sourceReliability?: number;
    supplierId?: string;
    supplierPrice?: number;
    alternativesCount?: number;
  }): InternalMetadata {
    const store = loadMetadataStore();
    const existing = store.get(params.itemId);
    const now = new Date();
    
    const volatility = this.classifyVolatility(params.materialName, params.category);
    
    // Calculate price age from last verification
    const lastVerified = existing?._internal_status.last_verified_at 
      ? new Date(existing._internal_status.last_verified_at)
      : new Date(0);
    const priceAgeHours = (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60);
    
    // Calculate confidence based on age + volatility
    const maxFreshHours = volatility === 'HIGH' ? 48 : volatility === 'MEDIUM' ? 120 : 240;
    const ageFactor = Math.max(0, 1 - (priceAgeHours / maxFreshHours));
    const sourceRel = params.sourceReliability ?? (existing?._internal_status.source_reliability || 0.7);
    const confidence = Math.round((ageFactor * 0.6 + sourceRel * 0.4) * 100) / 100;
    
    // Determine validation state
    let validationState: ValidationState;
    if (priceAgeHours < maxFreshHours * 0.5) validationState = 'Valid';
    else if (priceAgeHours < maxFreshHours) validationState = 'Needs_Sweep';
    else if (priceAgeHours < maxFreshHours * 2) validationState = 'Recalibrating';
    else validationState = 'Stale';
    
    // Calculate sweep priority (1-10, higher = more urgent)
    let sweepPriority = 5;
    if (volatility === 'HIGH') sweepPriority += 3;
    else if (volatility === 'MEDIUM') sweepPriority += 1;
    if (validationState === 'Stale') sweepPriority += 2;
    else if (validationState === 'Recalibrating') sweepPriority += 1;
    sweepPriority = Math.min(10, sweepPriority);
    
    // Next sweep time based on volatility
    const sweepIntervalHours = volatility === 'HIGH' ? 24 : volatility === 'MEDIUM' ? 72 : 168;
    const nextSweep = new Date(now.getTime() + sweepIntervalHours * 60 * 60 * 1000);
    
    // Price change percent
    const changePercent = params.previousPrice && params.previousPrice > 0
      ? ((params.currentPrice - params.previousPrice) / params.previousPrice) * 100
      : 0;

    const metadata: InternalMetadata = {
      _item_id: params.itemId,
      _internal_status: {
        last_verified_at: now.toISOString(),
        volatility_index: volatility,
        validation_state: validationState,
        confidence_index: confidence,
        price_age_hours: Math.round(priceAgeHours * 10) / 10,
        source_reliability: sourceRel,
        next_sweep_at: nextSweep.toISOString(),
        sweep_priority: sweepPriority,
        last_price_change_percent: Math.round(changePercent * 100) / 100,
      },
      _supplier_match: {
        best_supplier_id: params.supplierId || existing?._supplier_match.best_supplier_id || null,
        best_price: params.supplierPrice || existing?._supplier_match.best_price || 0,
        alternatives_count: params.alternativesCount ?? (existing?._supplier_match.alternatives_count || 0),
        last_matched_at: now.toISOString(),
      },
      _updated_at: now.toISOString(),
    };

    store.set(params.itemId, metadata);
    saveMetadataStore(store);
    
    return metadata;
  },

  // =================== QUERY ===================

  /**
   * جلب البيانات الوصفية لبند محدد
   */
  getMetadata(itemId: string): InternalMetadata | null {
    const store = loadMetadataStore();
    return store.get(itemId) || null;
  },

  /**
   * جلب كل البنود التي تحتاج مسح (sweep)
   * مرتبة حسب الأولوية
   */
  getItemsNeedingSweep(): InternalMetadata[] {
    const store = loadMetadataStore();
    const now = new Date();
    
    return Array.from(store.values())
      .filter(m => {
        const nextSweep = new Date(m._internal_status.next_sweep_at);
        return now >= nextSweep || m._internal_status.validation_state !== 'Valid';
      })
      .sort((a, b) => b._internal_status.sweep_priority - a._internal_status.sweep_priority);
  },

  /**
   * جلب البنود الأكثر تذبذباً (HIGH volatility)
   */
  getVolatileItems(): InternalMetadata[] {
    const store = loadMetadataStore();
    return Array.from(store.values())
      .filter(m => m._internal_status.volatility_index === 'HIGH');
  },

  /**
   * جلب مؤشر الثقة الإجمالي للنظام
   */
  getSystemConfidence(): { overall: number; byVolatility: Record<VolatilityClass, number>; staleCount: number } {
    const store = loadMetadataStore();
    const items = Array.from(store.values());
    
    if (items.length === 0) return { overall: 0.85, byVolatility: { HIGH: 0.7, MEDIUM: 0.85, LOW: 0.9, STABLE: 0.95 }, staleCount: 0 };
    
    const byVol: Record<VolatilityClass, number[]> = { HIGH: [], MEDIUM: [], LOW: [], STABLE: [] };
    let staleCount = 0;
    
    items.forEach(m => {
      byVol[m._internal_status.volatility_index].push(m._internal_status.confidence_index);
      if (m._internal_status.validation_state === 'Stale') staleCount++;
    });
    
    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0.85;
    
    return {
      overall: Math.round(avg(items.map(i => i._internal_status.confidence_index)) * 100) / 100,
      byVolatility: {
        HIGH: Math.round(avg(byVol.HIGH) * 100) / 100,
        MEDIUM: Math.round(avg(byVol.MEDIUM) * 100) / 100,
        LOW: Math.round(avg(byVol.LOW) * 100) / 100,
        STABLE: Math.round(avg(byVol.STABLE) * 100) / 100,
      },
      staleCount,
    };
  },

  /**
   * ترشيح أفضل مورد بناءً على مؤشر الثقة + السعر
   * يستخدم الدماغ هذا لاقتراح "Best Match" للمستخدم
   */
  getBestSupplierMatch(itemId: string): { supplierId: string | null; confidence: number; price: number } | null {
    const meta = this.getMetadata(itemId);
    if (!meta) return null;
    
    return {
      supplierId: meta._supplier_match.best_supplier_id,
      confidence: meta._internal_status.confidence_index,
      price: meta._supplier_match.best_price,
    };
  },

  // =================== BULK OPERATIONS ===================

  /**
   * تحديث جماعي للبيانات الوصفية بعد عملية حساب
   */
  bulkStamp(items: Array<{
    itemId: string;
    materialName: string;
    category?: string;
    currentPrice: number;
    previousPrice?: number;
  }>): void {
    items.forEach(item => {
      this.stampMetadata({
        itemId: item.itemId,
        materialName: item.materialName,
        category: item.category,
        currentPrice: item.currentPrice,
        previousPrice: item.previousPrice,
      });
    });
  },

  /**
   * مسح جميع البيانات الوصفية (للتطوير فقط)
   */
  _clearAll(): void {
    localStorage.removeItem(METADATA_KEY);
  },
};

export default internalMetadataService;
